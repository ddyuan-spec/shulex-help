'use strict';
(async()=>{
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const c=(root,prefix)=>root.querySelector('[class*="'+prefix+'"]');
 const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const templates=await fetch('ticket-templates.json').then(r=>r.json());
 const parser=new DOMParser();
 const restriction=email=>window.parent.blacklistReplicaBridge?.restriction(email)||{};
 const bridge=()=>window.parent.ticketReplicaBridge;
 const seed=[{id:'1024',name:'Daniel Chen',email:'daniel.chen@example.com',subject:'包裹配送进度咨询',incoming:'您好，请帮我查询一下包裹的最新配送进度，谢谢。',body:'您好，我们已收到您的咨询，正在为您核实包裹的最新进度。\n\n感谢您的耐心等待。',failed:true,handled:false,reason:'daniel.chen@example.com 已加入黑名单（客户投诉），邮件未发送。'},{id:'1023',name:'Emma Wilson',email:'emma.wilson@example.com',subject:'售后咨询',incoming:'您好，请帮我确认一下售后处理进度。',body:'您好，我们正在为您跟进售后进度。',failed:false,handled:false,reason:''}];
 const historyKey='solvea-blacklist-ticket-replica-v2'+(new URLSearchParams(location.search).has('test')?'-test':'');
 let history;try{history=JSON.parse(localStorage.getItem(historyKey));}catch{}
 if(!history||!Array.isArray(history))history=seed;
 let currentView='all',currentId=bridge()?.selectedId||'1024',menu=null;
 const save=()=>localStorage.setItem(historyKey,JSON.stringify(history));
 const tc=c(document,'ticketContainer___'),list=c(document,'ticketList___'),scroll=$('#scrollDiv');
 const detailTemplate=tc.innerHTML;
 const rowTemplate=scroll.querySelector('.slx-list-item').outerHTML;
 const emptyDoc=parser.parseFromString(templates['live-ticket-failure-empty'],'text/html');
 const emptyBody=c(emptyDoc,'bodyContainer___');
 emptyBody.querySelector('img').src='ticket-assets/empty-mail.svg';
 const emptyDetail=emptyBody.outerHTML;
 const emptyList=[...emptyDoc.querySelectorAll('#scrollDiv div')].find(el=>el.textContent.trim()==='暂无数据').outerHTML;
 const received=parser.parseFromString(detailTemplate,'text/html').querySelector('[id="message-150048123"]').outerHTML;
 const response=parser.parseFromString(detailTemplate,'text/html').querySelector('[id="message-150048125"]').outerHTML;
 function message(text){$('.ticket-local-toast')?.remove();const el=document.createElement('div');el.className='ticket-local-toast';el.setAttribute('role','status');el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),3000);}
 function closePortal(){$('#ticket-portals').replaceChildren();menu=null;}
 function showDialog(title,content){closePortal();const src=parser.parseFromString(templatesModal,'text/html').body.firstElementChild;src.style.width='560px';src.removeAttribute('aria-labelledby');src.setAttribute('aria-label',title);src.querySelector('.slx-modal-title').textContent=title;src.querySelector('.slx-modal-body').innerHTML=content;src.querySelector('.slx-modal-footer')?.remove();src.querySelector('.slx-modal-close').dataset.ta='close';$('#ticket-portals').innerHTML='<div class="slx-modal-root css-var-r3 slx-modal-css-var ticket-local-modal"><div class="slx-modal-mask"></div><div class="slx-modal-wrap"></div></div>';$('#ticket-portals .slx-modal-wrap').append(src);}
 const outreachTemplates=await fetch('outreach-templates.json').then(r=>r.json());
 const templatesModal=outreachTemplates['live-runs'];
 function failDialog(title,hits,resolve=false){showDialog(title,`<p>收件地址包含黑名单邮箱，本封邮件无法发送。</p>${hits.map(email=>`<p style="margin-top:12px"><b>${esc(email)}</b><br>禁发原因：${esc(restriction(email).blacklist.reason)}</p>`).join('')}${resolve?'<p style="margin-top:12px">邮件未发送，工单仍为处理中。</p>':''}<div style="display:flex;justify-content:flex-end;margin-top:24px"><button class="slx-btn css-var-r3 slx-btn-primary slx-btn-color-primary slx-btn-variant-solid" data-ta="close">知道了</button></div>`);}
 function updateCounts(){const failed=history.filter(t=>t.failed&&!t.handled).length;$$('[data-tv]').forEach(el=>{let n=c(el,'count___');if(n)n.textContent=el.dataset.tv==='failed'?failed:el.dataset.tv==='all'?history.length:el.dataset.tv==='progress'?history.length:0;el.classList.toggle('active___ExFwc',el.dataset.tv===currentView);el.setAttribute('aria-pressed',String(el.dataset.tv===currentView));});}
 function drawList(){updateCounts();let rows=currentView==='failed'?history.filter(t=>t.failed&&!t.handled):history;if(!rows.some(t=>t.id===currentId))currentId=rows[0]?.id||null;scroll.innerHTML='<div class="slx-list slx-list-split css-var-r3"><ul class="slx-list-items"></ul></div>';const ul=scroll.querySelector('ul');for(const t of rows){const row=parser.parseFromString(rowTemplate,'text/html').body.firstElementChild;row.dataset.ticketId=t.id;row.setAttribute('role','button');row.setAttribute('tabindex','0');row.setAttribute('aria-label',t.name+' #'+t.id+' '+t.subject);c(row,'customer___').textContent=t.name;c(row,'ticketNumber___').textContent='#'+t.id;c(row,'title___').textContent=t.subject;const footer=c(row,'footer___');footer.firstElementChild.innerHTML='<div class="channelIcon___pdshy">邮件</div><span style="font-size:12px;color:#5a6470">'+(t.failed&&!t.handled?'发送失败':'处理中')+'</span>';footer.lastElementChild.textContent='09:31';c(row,'ticketItem___').classList.toggle('active___b_DXM',t.id===currentId);ul.append(row);}if(!rows.length)scroll.innerHTML=emptyList;if(!rows.some(t=>t.id===currentId)){currentId=rows[0]?.id||null;}drawDetail();}
 function drawDetail(){if(!currentId){tc.innerHTML=emptyDetail;return;}const t=history.find(t=>t.id===currentId);tc.innerHTML=detailTemplate;
 c(c(tc,'ticketSubject___'),'preview___').textContent=t.subject;c(tc,'ticketNumber___').textContent='#'+t.id;
 c(tc,'notificationBar___')?.remove();
 const messages=c(tc,'contentScroll___');messages.innerHTML=received+response;
 const incoming=messages.firstElementChild,outgoing=messages.lastElementChild;
 incoming.id='message-demo-incoming-'+t.id;outgoing.id='message-demo-response-'+t.id;
 c(incoming,'userName___').textContent=t.name;c(outgoing,'userName___').textContent='Lena';
 c(incoming,'time___').textContent='11/05 09:20';c(outgoing,'time___').textContent='11/05 09:31';
 c(incoming,'emailSubject___').textContent=t.subject;c(outgoing,'emailSubject___').textContent='Re: '+t.subject;
 c(incoming,'messageContent___').textContent=t.incoming;c(outgoing,'messageContent___').textContent=t.body;
 c(incoming,'messageContent___').style.whiteSpace='pre-wrap';c(outgoing,'messageContent___').style.whiteSpace='pre-wrap';
 outgoing.querySelector('.shulex-avatar-text').textContent='L';incoming.querySelector('.shulex-avatar-text').textContent=t.name[0];
 if(t.failed){const spin=c(outgoing,'bubble___').querySelector('.slx-spin-container'),content=spin.firstElementChild,wrapper=document.createElement('div');wrapper.className='messageAppendWrapper___ZXrud';wrapper.style.background='#FFE8E5';spin.append(wrapper);wrapper.append(content);const tip=document.createElement('div');tip.className='ticket-local-failure';tip.innerHTML=`<span><span class="failure-icon">⊗</span><b>发送失败：</b>${esc(t.reason)}</span><div class="ticket-local-actions"><button class="ticket-local-link" data-ta="resend">重新发送</button>${!t.handled?'<button class="ticket-local-link" data-ta="ignore">忽略</button>':''}</div>`;wrapper.append(tip);}
 const panel=c(tc,'rightPanel___');c(panel,'nameText___').textContent=t.name;c(panel,'content___EkQOW').textContent=t.email;panel.querySelector('.shulex-avatar-text').textContent=t.name[0];c(panel,'notePreview___').textContent='暂无备注';const related=c(panel,'relatedTicketList___');c(related,'listHeader___').lastElementChild.textContent='0';c(related,'listWrapper___').replaceChildren();c(related,'listFooter___').remove();
 const customer=c(panel,'contactMetaFields___'),r=restriction(t.email),status=document.createElement('div');status.className='ticket-local-restriction';status.innerHTML='<div style="color:#667085">邮箱状态</div>'+(r.blacklist?'<div class="blocked">已禁发 · 黑名单</div>':'<div>可发送</div>')+'<button class="ticket-local-link" data-ta="restriction">'+(r.blacklist?'查看禁发原因':'加入黑名单')+'</button>';customer.prepend(status);
 panel.querySelectorAll('[class*="remarkContent___"],[class*="noteContent___"]').forEach(x=>x.textContent='');
 const editor=tc.querySelector('[contenteditable="true"]');editor.innerHTML='<p>'+esc(t.body).replace(/\n/g,'<br>')+'</p>';editor.setAttribute('aria-label','邮件正文');
 const address=$('#replyBoxFrom');if(address){const items=[...address.querySelectorAll('[class*="formItem___"]')];c(items[0],'itemContent___').innerHTML=`<input class="ticket-local-address" aria-label="收件人" value="${esc(t.email)}" id="ticket-to">`;c(items[1],'itemContent___').textContent='support@example.com';address.querySelector('input[placeholder]').value='Re: '+t.subject;address.querySelector('input[placeholder]').setAttribute('aria-label','主题');const controls=c(address,'controls___');[...controls.children].forEach((el,i)=>{el.dataset.ta=i?'bcc':'cc';el.setAttribute('role','button');el.setAttribute('tabindex','0');});}
 const replyHeader=$('#replyBoxHeader'),noteBtn=c(replyHeader,'noteModeBtn___');noteBtn.setAttribute('aria-disabled','true');
 const send=c(tc,'sendActions___').querySelector('button');send.disabled=false;send.dataset.ta='send';send.setAttribute('aria-label','发送');const dropdown=send.nextElementSibling;dropdown.disabled=false;dropdown.dataset.ta='send-menu';dropdown.setAttribute('aria-label','更多发送操作');
 $$('[class*="rightPanel___"] button:not([data-ta])').forEach(b=>{b.disabled=true;});
 }
 function addAddress(kind){const id='ticket-'+kind;if($('#'+id)){return $('#'+id).focus();}const row=document.createElement('div');row.className='formItem___Jm4LY slx-flex css-var-r3';row.innerHTML='<div>'+(kind==='cc'?'抄送:':'密送:')+'</div><div class="itemContent___K5Q_v"><input class="ticket-local-address" aria-label="'+(kind==='cc'?'抄送':'密送')+'" id="'+id+'"></div>';c($('#replyBoxFrom'),'body___jQmz9').append(row);}
 function send(resolve=false,resend=false){const t=history.find(x=>x.id===currentId);const addresses=resend?[t.email]:[$('#ticket-to')?.value??t.email,$('#ticket-cc')?.value||'',$('#ticket-bcc')?.value||''];const parsed=addresses.join(',').split(/[,;，；\n]/).map(s=>s.trim()).filter(Boolean);if(!parsed.length)return message('请填写收件人');if(parsed.some(s=>! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)))return message('请填写有效的邮箱地址');const hits=[...new Set(addresses.join(',').split(/[,;，；\n]/).map(s=>s.trim().toLowerCase()).filter(s=>s&&restriction(s).blacklist))];if(hits.length)return failDialog(resend?'无法重新发送':'无法发送',hits,resolve);if(!resend&&!tc.querySelector('[contenteditable="true"]').textContent.trim())return message('请填写邮件正文');if(resend){t.failed=false;t.handled=true;save();drawList();message('本地模拟重新发送成功，未调用真实邮件服务');}else message('本地演示校验通过，未调用真实邮件服务');}
 function openMenu(el,options){closePortal();menu=document.createElement('div');menu.className='ticket-local-menu';menu.innerHTML=options.map(([text,action])=>`<button data-ta="${action}">${text}</button>`).join('');const r=el.getBoundingClientRect();menu.style.left=Math.min(r.left,innerWidth-180)+'px';menu.style.top=Math.max(48,r.top-options.length*36-8)+'px';$('#ticket-portals').append(menu);}
 $$('[class*="menuItem___RWPzN"]').forEach(el=>{const name=c(el,'text___E7psm')?.textContent.trim();if(['全部','发送失败','处理中'].includes(name)){el.dataset.tv=name==='全部'?'all':name==='发送失败'?'failed':'progress';el.setAttribute('aria-label',name);}else el.setAttribute('aria-disabled','true');});
 $$('[role="menuitem"]').forEach(el=>{const name=el.getAttribute('aria-label');if(['联系人','主动触达'].includes(name)){el.dataset.ta=name==='联系人'?'contacts':'automation';}else if(name!=='工单')el.setAttribute('aria-disabled','true');});
 $$('[class*="menuItem___RWPzN"]:not([data-tv]) [class*="count___"]').forEach(n=>n.textContent='0');
 $$('[class*="channelAuthErrorContent___"] button').forEach(b=>b.disabled=true);
 $$('a').forEach(a=>{a.removeAttribute('target');a.addEventListener('click',e=>e.preventDefault());});
 document.addEventListener('click',e=>{const view=e.target.closest('[data-tv]');if(view){currentView=view.dataset.tv;drawList();return;}const row=e.target.closest('[data-ticket-id]');if(row){currentId=row.dataset.ticketId;drawList();return;}const el=e.target.closest('[data-ta]');if(!el)return;const action=el.dataset.ta;switch(action){case'close':closePortal();break;case'cc':case'bcc':addAddress(action);break;case'send':closePortal();send();break;case'resend':send(false,true);break;case'ignore':{const t=history.find(x=>x.id===currentId);t.handled=true;save();drawList();message('已忽略本次发送失败，邮件记录保留');break;}case'send-resolve':closePortal();send(true);break;case'send-menu':openMenu(el,[['发送并解决','send-resolve']]);break;case'restriction':bridge()?.showRestriction(history.find(x=>x.id===currentId).email);break;case'contacts':window.parent.location.hash='#blacklist';break;case'automation':window.parent.location.hash='#automation';break;}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closePortal();if(e.key==='Enter'&&e.target.matches('[data-tv],[data-ticket-id]'))e.target.click();});
 currentView='all';drawList();$('#entry').style.visibility='visible';
})().catch(error=>{console.error(error);document.body.innerHTML='<p role="alert">工单原型加载失败，请刷新重试。</p>';});
