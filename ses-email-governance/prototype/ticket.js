'use strict';
(()=>{
try{
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
const c=(root,prefix)=>root?.querySelector('[class*="'+prefix+'"]');
const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const bridge=window.parent.sesPrototypeBridge;if(!bridge)throw new Error('Missing same-origin prototype bridge');
const snap=bridge.snapshot(),t=snap.tenant,r=snap.recipient,m=snap.message,route=snap.page;
const tc=c(document,'ticketContainer___'),list=c(document,'ticketList___'),scroll=$('#scrollDiv');
if(!tc||!list||!scroll||!m||!r)throw new Error('Missing copied ticket layout');
const rowTemplate=scroll.querySelector('.slx-list-item')?.outerHTML;
const received=$('[id="message-150048123"]')?.outerHTML,response=$('[id="message-150048125"]')?.outerHTML;
const receivedWrap=c(tc,'contentScroll___');
if(!received||!response||!receivedWrap)throw new Error('Copied message selectors changed');
const sourceNav=$$('[class*="menuItem___RWPzN"]');
sourceNav.forEach(el=>{const name=c(el,'text___E7psm')?.textContent.trim(),count=c(el,'count___');if(count)count.textContent=name==='发送失败'?String(snap.messages.filter(x=>x.status==='failed'&&!x.handled).length):name==='全部'?String(snap.messages.length):'0';if(['全部','发送失败','处理中'].includes(name)){el.dataset.sesView=name;el.setAttribute('tabindex','0')}else el.setAttribute('aria-disabled','true');el.classList.toggle('active___ExFwc',route==='ticketFailed'?name==='发送失败':name==='全部')});
if(snap.complaintInboxAllowed){
 const base=sourceNav.find(el=>c(el,'text___E7psm')?.textContent.trim()==='发送失败');
 if(base){
  const item=base.cloneNode(true);delete item.dataset.sesView;item.dataset.ses='complaintInbox';item.classList.remove('active___ExFwc');
  c(item,'text___E7psm').textContent='客户投诉';c(item,'count___')?.remove();
  base.after(item);
 }
}
if(rowTemplate){scroll.innerHTML='<div class="slx-list slx-list-split css-var-r3"><ul class="slx-list-items"></ul></div>';const ul=scroll.querySelector('ul');const messages=route==='ticketFailed'?snap.messages.filter(x=>x.status==='failed'&&!x.handled):snap.messages;for(const item of messages){const recipient=snap.recipients.find(x=>x.id===item.recipient);const doc=new DOMParser().parseFromString(rowTemplate,'text/html');const row=doc.body.firstElementChild;row.dataset.sesMessage=item.id;row.dataset.sesRoute=item.status==='unknown'?'ticketUnknown':item.status==='failed'?'ticketFailed':item.status==='queued'?'ticketBlocked':'ticketReady';row.setAttribute('role','button');row.setAttribute('tabindex','0');c(row,'customer___').textContent=recipient.name;c(row,'ticketNumber___').textContent='#'+item.ticket;c(row,'title___').textContent=item.subject;const footer=c(row,'footer___');footer.firstElementChild.innerHTML='<div class="channelIcon___pdshy">邮件</div><span style="font-size:12px;color:#5a6470">'+esc(({unknown:'结果未知',failed:'发送失败',queued:'待处理',sent:'处理中',cancelled:'已取消'})[item.status]||item.status)+'</span>';footer.lastElementChild.textContent='11/09';c(row,'ticketItem___').classList.toggle('active___b_DXM',item.id===m.id);ul.append(row)}}
const subject=c(c(tc,'ticketSubject___'),'preview___');if(subject)subject.textContent=/^quality/.test(route)?'收到的灯具有破损':m.subject;
$$('[class*="ticketNumber___"]').filter(x=>!scroll.contains(x)).forEach(x=>x.textContent='#'+m.ticket);
const quality=/^quality/.test(route);
let incoming='上次提交的订单问题处理得怎么样了？';
if(route==='qualityMissing')incoming='订单号 A1028，灯罩破裂了。破损照片已上传，请问怎么处理？';
if(route==='qualityEscalation')incoming='已经按之前要求反复测试过了，还是没有解决，请负责人处理。';
if(route==='qualityThanks')incoming=snap.quality==='newQuestion'?'谢谢。另外请帮我确认新的配送地址能否使用？':'谢谢，收到。';
if(route==='qualitySurvey')incoming='订单问题仍未解决，请负责人继续跟进。';
receivedWrap.innerHTML=received+((route==='ticketBlocked'||m.status==='queued'||quality)?'':response);
const incomingNode=receivedWrap.firstElementChild,outgoing=receivedWrap.children[1];
incomingNode.id='message-ses-incoming';c(incomingNode,'userName___').textContent=r.name;c(incomingNode,'emailSubject___').textContent=quality?'订单 A1028 的售后问题':m.subject;c(incomingNode,'messageContent___').textContent=incoming;c(incomingNode,'messageContent___').style.whiteSpace='pre-wrap';c(incomingNode,'time___').textContent='11/09 10:00';incomingNode.querySelector('.shulex-avatar-text').textContent=r.name[0];
if(route==='qualityMissing'){const att=document.createElement('div');att.className='ses-ticket-attachments';att.textContent='▧　damage-photo.jpg';c(incomingNode,'messageContent___').append(att)}
function fillOutgoing(node,item){
 c(node,'userName___').textContent='客服 A';
 c(node,'emailSubject___').textContent='Re: '+item.subject;
 const content=c(node,'messageContent___');content.textContent=item.body;content.style.whiteSpace='pre-wrap';
 c(node,'time___').textContent=item.date;
 node.querySelector('.shulex-avatar-text').textContent='A';
}
function appendReply(item){
 const template=document.createElement('template');template.innerHTML=response;
 const node=template.content.firstElementChild;node.id='message-ses-'+item.id;
 fillOutgoing(node,item);receivedWrap.append(node);
}
function showSolved(){
 const tag=c(tc,'ticketStatusTag___');
 const indicator=c(tag,'indicator___');
 if(indicator){indicator.style.background='#9AA0A9';tag.replaceChildren(indicator,'已解决')}
}
if(outgoing){outgoing.id='message-ses-outgoing';fillOutgoing(outgoing,m);if(route==='ticketFailed'&&m.status==='failed'){const spin=c(outgoing,'bubble___').querySelector('.slx-spin-container'),content=spin.firstElementChild,wrapper=document.createElement('div');wrapper.className='messageAppendWrapper___ZXrud';wrapper.style.background='#FFE8E5';spin.append(wrapper);wrapper.append(content);const tip=document.createElement('div');tip.className='ticket-local-failure';tip.innerHTML='<span><span class="failure-icon">⊗</span><b>发送失败：</b>'+esc(m.reason)+'</span><div class="ticket-local-actions"><button class="ticket-local-link" data-ses="retry">重新发送</button>'+(m.handled?'':'<button class="ticket-local-link" data-ses="ignore">忽略</button>')+'</div>';wrapper.append(tip)}else if(route==='ticketUnknown'&&m.status==='unknown'){const status=document.createElement('div');status.className='ses-message-result ses-unknown';status.innerHTML='<span>结果未知 · 供应商提交超时，正在核查</span><button class="ses-ticket-details-link" data-ses="query">核查发送结果</button>';c(outgoing,'bubble___').append(status)}}
const sentReplies=snap.sentReplies||[];
if(sentReplies.some(item=>item.id===m.id))outgoing?.remove();
for(const item of [...sentReplies].reverse())appendReply(item);
function showSendBlock(reason,record,scrollToResult=false){
 $('#sesSendBlock')?.remove();
 const row=document.createElement('div');row.id='sesSendBlock';row.className='ses-ticket-alert';row.setAttribute('role','status');
 const text=document.createElement('span');text.textContent='本次未发送：'+reason;row.append(text);
 if(record?.time){const time=document.createElement('time');time.textContent=record.time;row.append(time)}
 if(record&&!scrollToResult){
  const nextReply=record.afterReply?document.getElementById('message-ses-'+record.afterReply)?.nextElementSibling:receivedWrap.querySelector('[id^="message-ses-MSG-"]');
  receivedWrap.insertBefore(row,nextReply||null);
 }else receivedWrap.append(row);
 if(scrollToResult)row.scrollIntoView({block:'nearest'});
 return row;
}
if(snap.latestBlock)showSendBlock(snap.latestBlock.after,{...snap.latestBlock.ticketBlock,time:snap.latestBlock.time});
else if(route==='ticketBlocked'&&m.status==='queued'){
 const reason=m.expired?'邮件已过期，请在历史邮件核对中取消。':snap.gate.ok?'原邮件尚未发出，请核对后发送。':(snap.gate.reason||m.reason);
 showSendBlock(reason).dataset.example='true';
}
if(snap.ticketStatus==='resolved')showSolved();
for(const complaint of snap.complaints||[]){
 const row=document.createElement('div');row.className='ses-message-result';
 row.innerHTML='<span>客户投诉</span><button type="button" class="ses-ticket-details-link" data-ses="viewComplaint">查看</button>';
 const link=row.querySelector('button');link.dataset.complaint=complaint.id;link.dataset.message=complaint.message;
 link.setAttribute('aria-label','查看客户投诉 '+complaint.id);
 const related=document.getElementById('message-ses-'+complaint.message)||(m.id===complaint.message?outgoing:null);
 if(related?.isConnected)related.insertAdjacentElement('afterend',row);else receivedWrap.append(row);
}
const panel=c(tc,'rightPanel___');c(panel,'nameText___').textContent=r.name;c(panel,'content___EkQOW').textContent=r.email;panel.querySelector('.shulex-avatar-text').textContent=r.name[0];c(panel,'notePreview___').textContent='暂无备注';const related=c(panel,'relatedTicketList___');if(related){c(related,'listHeader___').lastElementChild.textContent='0';c(related,'listWrapper___').replaceChildren();c(related,'listFooter___')?.remove()}panel.querySelectorAll('[class*="remarkContent___"],[class*="noteContent___"]').forEach(n=>n.textContent='');
// Existing captured right-side integrations are retained structurally, without external sessions.
panel.querySelectorAll('iframe').forEach(n=>n.remove());panel.querySelectorAll('input').forEach(n=>n.value='');
const meta=c(panel,'contactMetaFields___');const info=document.createElement('div');info.className='ses-ticket-context';
const contact=snap.gate.code==='blacklist'?'黑名单':r.stop?'已停止全部联系':r.complaint?'投诉抑制':r.bounce?'永久退信':r.optional?'仅退出可选邮件':'可联系';
info.innerHTML='<h4>邮件联系</h4><div class="ses-context-row"><span>联系状态</span><span class="ses-right-value">'+esc(contact)+'</span></div><div class="ses-context-row"><span>发送通道</span><span>'+esc(snap.gate.ok?snap.gate.provider:'当前不可发送')+'</span></div><div class="ses-context-actions"><button class="ticket-local-link" data-ses="recipient">查看联系状态</button><button class="ticket-local-link" data-ses="details">发送详情</button></div>';
if(quality){info.innerHTML+='<h4 style="margin-top:23px">处理上下文</h4><div class="ses-context-row"><span>订单号 A1028</span><span>已收到</span></div><div class="ses-context-row"><span>破损照片</span><span>已收到</span></div><div class="ses-context-row missing"><span>购买渠道</span><span>待补充</span></div>';if(route==='qualityMissing'&&snap.uncertain)info.innerHTML+='<div class="ses-ticket-status">资料抽取不确定，需人工核实后回复。</div>';if(route==='qualityMissing')info.innerHTML+='<div class="ses-context-actions"><button class="ses-native-action primary" data-ses="draft">生成回复草稿</button></div>';if(route==='qualityEscalation')info.innerHTML+='<div class="ses-ticket-status">已达租户排障规则上限</div><div class="ses-context-actions"><button class="ses-native-action primary" data-ses="escalate">交售后负责人</button></div>';if(route==='qualityThanks')info.innerHTML+='<div class="ses-ticket-status">'+(snap.quality==='newQuestion'?'感谢中包含新问题，继续处理':'客户仅表示感谢，不再追加结束语')+'</div>';if(route==='qualitySurvey')info.innerHTML+='<div class="ses-ticket-status">检查工单状态、近期交互、联系偏好及防重</div><div class="ses-context-actions"><button class="ses-native-action" data-ses="survey">查看邀评结果</button></div>'}
meta.prepend(info);
const editor=tc.querySelector('[contenteditable="true"]');
const startsBlank=['qualityMissing','qualityThanks'].includes(route)||(route==='ticketReady'&&m.complaintDemo);
const initial=snap.draft??(startsBlank?'':m.body);
editor.dataset.sesMailBody='';
editor.setAttribute('aria-label','邮件正文');
editor.setAttribute('aria-placeholder','请输入邮件正文');
editor.setAttribute('aria-multiline','true');
function updateEditorState(){editor.dataset.empty=String(!editor.textContent.trim())}
function setEditorBody(text){editor.innerHTML='<p>'+esc(text).replace(/\n/g,'<br>')+'</p>';updateEditorState()}
setEditorBody(initial);
let draftTimer;
function saveEditedDraft(){clearTimeout(draftTimer);draftTimer=undefined;bridge.draft(editor.innerText)}
editor.addEventListener('input',()=>{updateEditorState();clearTimeout(draftTimer);draftTimer=setTimeout(saveEditedDraft,120)});
addEventListener('pagehide',()=>{if(draftTimer!==undefined)saveEditedDraft()});
const address=$('#replyBoxFrom');if(address){const items=[...address.querySelectorAll('[class*="formItem___"]')];c(items[0],'itemContent___').innerHTML='<input class="ticket-local-address" aria-label="收件人" value="'+esc(r.email)+'" id="ses-to">';c(items[1],'itemContent___').textContent=t.from;address.querySelector('input[placeholder]').value='Re: '+m.subject;address.querySelector('input[placeholder]').setAttribute('aria-label','主题');const controls=c(address,'controls___');[...controls.children].forEach((el,i)=>{el.dataset.ses=i?'bcc':'cc';el.setAttribute('role','button');el.setAttribute('tabindex','0')})}
const replyHeader=$('#replyBoxHeader'),noteBtn=c(replyHeader,'noteModeBtn___');if(noteBtn)noteBtn.setAttribute('aria-disabled','true');
const send=c(tc,'sendActions___')?.querySelector('button');if(send){send.disabled=false;send.dataset.ses='send';send.setAttribute('aria-label','发送');const more=send.nextElementSibling;if(more){more.disabled=false;more.dataset.ses='sendMenu';more.setAttribute('aria-label','更多发送操作')}}
let menu=null;
function localError(text){$('#sesReplyError')?.remove();const el=document.createElement('p');el.id='sesReplyError';el.className='ses-reply-error';el.setAttribute('role','alert');el.textContent=text;(editor.closest('[class*="replyBox___"]')||editor.parentElement).append(el);bridge.toast(text)}
function showSendRejection(result){if(!result.blocked)return localError(result.reason);$('#sesReplyError')?.remove();const {latestBlock}=bridge.snapshot();showSendBlock(result.reason,latestBlock,true)}
function executeSend(resolve=false){const addresses=[$('#ses-to')?.value||r.email,$('#ses-cc')?.value||'',$('#ses-bcc')?.value||''].join(',').split(/[,;，；\n]/).map(x=>x.trim()).filter(Boolean);if(addresses.some(x=>!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)))return localError('请填写有效的收件邮箱');const result=bridge.saveReply(editor.innerText,'service',resolve,addresses);if(!result.ok){if(result.blocked)saveEditedDraft();return showSendRejection(result)}clearTimeout(draftTimer);draftTimer=undefined;setEditorBody('');$('#sesReplyError')?.remove();$('#sesSendBlock[data-example]')?.remove();const sent=bridge.snapshot().sentReplies.find(item=>item.id===result.message);if(sent){appendReply(sent);receivedWrap.scrollTop=receivedWrap.scrollHeight}if(result.resolve)showSolved();}
function addAddress(kind){const key='ses-'+kind;if($('#'+key))return $('#'+key).focus();const row=document.createElement('div');row.className='formItem___Jm4LY slx-flex css-var-r3';row.innerHTML='<div>'+(kind==='cc'?'抄送:':'密送:')+'</div><div class="itemContent___K5Q_v"><input class="ticket-local-address" id="'+key+'" aria-label="'+(kind==='cc'?'抄送':'密送')+'"></div>';c($('#replyBoxFrom'),'body___jQmz9').append(row)}
$$('[role="menuitem"]').forEach(el=>{const label=el.getAttribute('aria-label');if(label==='联系人'){el.dataset.ses='contacts'}else if(label==='设置'){el.dataset.ses='settings'}else if(label!=='工单')el.setAttribute('aria-disabled','true')});
$$('button:not([data-ses])').forEach(b=>{if(!b.closest('[class*="sendActions___"]'))b.disabled=true});
$$('a').forEach(a=>{a.removeAttribute('target');a.addEventListener('click',e=>e.preventDefault())});
$$('[class*="channelAuthErrorContent___"]').forEach(el=>el.remove());
document.addEventListener('click',e=>{const view=e.target.closest('[data-ses-view]');if(view){bridge.draft(editor.innerText);bridge.navigate(view.dataset.sesView==='发送失败'?'ticketFailed':'ticketReady');return}const listItem=e.target.closest('[data-ses-message]');if(listItem){bridge.draft(editor.innerText);bridge.navigate(listItem.dataset.sesRoute,{message:listItem.dataset.sesMessage});return}const el=e.target.closest('[data-ses]');if(!el)return;switch(el.dataset.ses){case'complaintInbox':bridge.navigate('complaintInbox');break;case'viewComplaint':bridge.navigate('complaintDetail',{complaint:el.dataset.complaint,message:el.dataset.message});break;case'send':executeSend();break;case'sendResolve':menu?.remove();executeSend(true);break;case'sendMenu':menu?.remove();menu=document.createElement('div');menu.className='ticket-local-menu';menu.innerHTML='<button data-ses="sendResolve">发送并解决</button>';const b=el.getBoundingClientRect();menu.style.left=Math.min(innerWidth-150,b.left)+'px';menu.style.top=Math.max(50,b.top-45)+'px';document.body.append(menu);break;case'cc':case'bcc':addAddress(el.dataset.ses);break;case'recipient':bridge.navigate('recipientDetail',{recipient:r.id});break;case'details':bridge.navigate('pendingDetail',{message:m.id});break;case'contacts':bridge.navigate('recipientList');break;case'settings':bridge.navigate('mailSettings');break;case'retry':{const result=bridge.retry();if(result.ok){bridge.toast('重新发送已提交供应商');bridge.navigate('ticketReady',{message:m.id})}else showSendRejection(result);break}case'ignore':bridge.ignore();el.remove();bridge.toast('已忽略待处理标记，失败历史保留');break;case'query':{const state=bridge.query();bridge.toast(state==='unknown'?'结果仍在核查中':state==='sent'?'供应商确认已提交成功':'供应商确认发送失败');if(state!=='unknown')bridge.navigate(state==='sent'?'ticketReady':'ticketFailed',{message:m.id});break}case'draft':if(snap.uncertain){bridge.toast('请先人工核实已有资料');break}editor.innerHTML='<p>您好，我们已收到订单号 A1028 和破损照片。</p><p>请补充购买渠道，便于核对保修信息。</p><p>后续处理方式将由售后负责人确认。</p>';updateEditorState();saveEditedDraft();break;case'escalate':bridge.escalateQuality();el.disabled=true;el.textContent='已交售后负责人';break;case'survey':{const result=bridge.survey();const node=document.createElement('div');node.className='ses-ticket-status';node.textContent=result.ok?'本次邀评符合资格':result.reason;info.append(node);el.disabled=true;break}}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')menu?.remove();if(e.key==='Enter'&&e.target.matches('[data-ses-view],[data-ses-message],[data-ses=complaintInbox]'))e.target.click()});
if(snap.escalated){const b=document.querySelector('[data-ses=escalate]');if(b){b.disabled=true;b.textContent='已交售后负责人'}}$('#entry').style.visibility='visible';if(window.frameElement)window.frameElement.dataset.ready='true';
}catch(error){console.error(error);try{if(window.frameElement)window.frameElement.dataset.ready='false'}catch{}const entry=document.querySelector('#entry');if(entry){entry.replaceChildren();entry.style.visibility='visible';entry.textContent='工单原型加载失败，请刷新后重试。'}}
})()
