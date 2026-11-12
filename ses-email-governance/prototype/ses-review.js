'use strict';
(() => {
  const seed = window.SES_SEED, ctx = {role:'admin'}, main = document.querySelector('#main');
  const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const data = structuredClone(seed);
  const tenant = () => data.tenants.find(t=>t.id===ctx.tenant)||data.tenants[0];
  const standard = seed.complaintForms.find(f=>f.system);
  // The table retains both sources; the counters deduplicate by the linked original mail.
  const samples = [
    {tenant:'TEN-017',mailbox:'primary',message:'MSG-420',id:'CP-023',sender:'support@aurora.example',recipient:'jo@customer.example',time:'2026-11-12 09:35',reason:'这封邮件与我的售后问题无关。'},
    {tenant:'TEN-017',mailbox:'primary',message:'MSG-421',id:'CP-024',sender:'support@aurora.example',recipient:'sam@customer.example',time:'2026-11-12 10:02',reason:''},
    {tenant:'TEN-017',mailbox:'secondary',message:'MSG-422',id:'CP-025',sender:'returns@aurora.example',recipient:'kim@customer.example',time:'2026-11-12 10:24',reason:'同一内容重复发送。'},
    {tenant:'TEN-017',mailbox:'primary',message:'MSG-420',id:'demo-ses-abuse',feedbackId:'9f6e98a2-00d4-4c10-9e87-9b0ac3e0fa17',sesMessageId:'010001-demo-ses-message-420-000000',feedbackType:'abuse',sender:'support@aurora.example',recipient:'jo@customer.example',time:'2026-11-12 10:41'}
  ];
  const records = (mailboxId='') => samples.filter(x=>x.tenant===ctx.tenant&&(!mailboxId||mailboxId===x.mailbox)).sort((a,b)=>b.time.localeCompare(a.time));
  const count = id => new Set(records(id).map(x=>x.message)).size;
  const source = c => c.feedbackId ? 'SES 垃圾邮件投诉' : '邮件内投诉';
  const displayId = c => c.feedbackId || c.id;
  const href = (route, params={}) => '#'+route+'?'+new URLSearchParams({tenant:ctx.tenant,...params});
  const navLink = (label,route,params={},klass='') => '<a class="'+klass+'" href="'+esc(href(route,params))+'">'+esc(label)+'</a>';
  const action = (label,key,params={},klass='') => '<button type="button" class="'+klass+'" data-action="'+key+'" '+Object.entries(params).map(([k,v])=>'data-'+k+'="'+esc(v)+'"').join(' ')+'>'+esc(label)+'</button>';
  const button = (label,id,params={}) => navLink(label,id,params,'mb-button');
  const formError = (form,msg) => {const el=form.querySelector('.ses-form-error');el.hidden=false;el.textContent=msg;};
  let toastTimer;
  function toast(msg) {const el=document.querySelector('#toast');el.textContent=msg;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3000);}
  const alertIcon = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6.8 2.7a1.4 1.4 0 0 1 2.4 0l5.2 9.2a1.4 1.4 0 0 1-1.2 2H2.8a1.4 1.4 0 0 1-1.2-2z" fill="currentColor"/><path d="M8 6v3m0 2.1v.4" stroke="white" stroke-width="1.25" stroke-linecap="round"/></svg>';
  const envelope = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" fill="white"/><path d="m3 8 9 4 9-4" fill="none" stroke="#2975db" stroke-width="1.5"/></svg>';
  const compact = {
    countCell(m) {const n=count(m.id);return n?'<a class="scr-number" aria-label="'+esc(m.email+'，'+n+' 封 SES 投诉邮件，查看邮箱配置')+'" href="'+esc(href('mailHealth',{mailbox:m.id}))+'">'+n+'</a>':'0';},
    listAction() {return count()?button('查看 SES 投诉邮件','sesComplaintList'):'';},
    channelCard(n) {const complaints=count();return '<section class="scr-channels"><h2>渠道</h2><a class="scr-channel" href="'+esc(href('mailList'))+'"><span class="scr-icon">'+envelope+'</span><div><strong>邮箱</strong><p>连接在用邮箱，全天在线服务客户。</p><div class="scr-metrics"><span aria-label="已连接 '+n+' 个邮箱">⇄ '+n+'</span>'+(complaints?'<span class="scr-warn">'+alertIcon+'有 SES 投诉邮件（'+complaints+'）</span>':'')+'</div></div><small>渠道应用</small></a></section>';},
    apiPane() {return '<div class="mb-protocol-note">Gmail（含 Google Workspace）和 Outlook（含 Microsoft 365）支持 API，建议优先选择 API 授权。其他邮箱建议配置 IMAP 收信、SMTP 发信；SES 转发用于发信兜底。</div>';},
    forwardPane(mail,back,params,isDraft) {
      const address='forward-'+(mail.id||'new')+'@relay.solvea.example';
      return '<div class="mb-protocol-note">ⓘ　新邮件分钟级同步，极速对接无等待。</div>'+
        '<aside class="scr-notice"><strong>SES 转发说明</strong><ol><li>优先使用已配置的 API 或 SMTP 发信，SES 转发用于发信兜底。</li><li>通过 SES 发送的邮件投诉率过高，可能导致此渠道失效。</li><li>SES 渠道失效后，仍可通过其他可用的已配置渠道发信。</li><li>实际经 SES 发送的邮件将固定携带邮件角标及邮件投诉按钮。</li></ol>'+
        '<button type="button" class="link" data-preview="email">预览转发邮件</button></aside>'+
        '<ol class="scr-forward"><li><span>1</span><div>打开邮箱客户端，找到转发设置，将此邮箱粘贴到「转发到」的邮箱地址中。<div class="scr-copy"><input aria-label="转发地址" readonly value="'+esc(address)+'"><button type="button" class="mb-button" data-copy-forward>复制</button></div><details><summary>如何设置转发？</summary><p>在您的邮箱服务商设置中开启转发，填写上方地址并保存。</p></details></div></li>'+
        '<li><span>2</span><div>点击右下角的「验证」完成验证。</div></li></ol><footer class="mb-drawer-footer">'+button('取消',back,params)+
        (isDraft?button('上一步','mailSettings',{'mail-mode':'new'}):'<button type="button" class="mb-button" data-forward-back>上一步</button>')+
        '<button type="button" class="mb-button mb-primary" data-forward-verify>验证</button></footer>';
    }
  };
  const mailbox = window.createMailboxPreview({esc,navLink,action,tenant,state:()=>data,context:()=>ctx,stamp:()=>new Date().toISOString().slice(0,16).replace('T',' '),audit:()=>{},problem:formError,toast,save:()=>{},sesReview:compact});
  const work=window.createSesWorkflows({esc,tenant,records,href,navLink,go:(...args)=>window.go(...args),toast});
  const reviewRoutes = new Set(['mailIntegration','mailList','mailHealth','mailSettings','sesComplaintList','sesComplaintDetail','ticketComplaint','complaintBlacklist','complaintReport']);
  let current, preview, previewFrom, previousFocus;
  window.go = (route,params={}) => {
    const {mailMode,keepDraft,...rest}=params;
    history.pushState(null,'',href(route,{...rest,...(mailMode?{'mail-mode':mailMode}:{})}));
    render({keepDraft});
  };
  const head = (title,back,params={}) => '<header class="mb-title"><h1><a class="mb-back" href="'+esc(href(back,params))+'" aria-label="返回">←</a>'+title+'</h1></header>';
  function visibleComplaints() {
    const reportIds=ctx.origin==='report'?work.reportRecords():null;
    return records(ctx.scope).filter(c=>(!ctx.message||c.message===ctx.message)&&(!reportIds||reportIds.has(c.message)));
  }
  const complaintParams=()=>({...ctx.scope&&{scope:ctx.scope},...ctx.message&&{message:ctx.message},...ctx.origin&&{origin:ctx.origin},...ctx.origin==='ticket'&&{scene:ctx.scene}});
  function complaintList() {
    const filtered=visibleComplaints(), mail=ctx.scope?mailbox.selected():null;
    const cols=['投诉编号','类型','发件邮箱','收件人','投诉时间','操作'];
    return '<section class="mb-list">'+head('SES 投诉邮件',ctx.origin==='ticket'?'ticketComplaint':ctx.origin==='report'?'complaintReport':mail?'mailHealth':'mailList',ctx.origin==='ticket'?{scene:ctx.scene}:mail?{mailbox:mail.id}:{})+
      '<p class="scr-list-info">'+(ctx.message?'当前邮件':mail?'发件邮箱：'+esc(mail.email):'全部邮箱')+'<span>共 '+new Set(filtered.map(c=>c.message)).size+' 封邮件，'+filtered.length+' 条投诉</span></p><div class="scr-table"><table><thead><tr>'+cols.map(c=>'<th scope="col">'+c+'</th>').join('')+
      '</tr></thead><tbody>'+(filtered.length?filtered.map(c=>'<tr><td class="scr-complaint-id">'+esc(displayId(c))+'</td><td><span class="badge '+(c.feedbackId?'red':'blue')+'">'+source(c)+'</span><span class="scr-risk">'+(c.feedbackId?'计入 SES 风险':'不计入 SES 风险')+'</span></td><td>'+esc(c.sender)+'</td><td>'+esc(c.recipient)+'</td><td>'+esc(c.time)+'</td><td>'+
      navLink('投诉详情','sesComplaintDetail',{complaint:c.id,...complaintParams()})+'</td></tr>').join(''):'<tr><td colspan="6" class="empty">暂无 SES 投诉邮件</td></tr>')+'</tbody></table></div></section>';
  }
  function complaintDetail() {
    const c=visibleComplaints().find(x=>x.id===ctx.complaint);
    const props=c?[[c.feedbackId?'SES 投诉编号（feedbackId）':'系统投诉编号',displayId(c)],['类型',source(c)],['发件邮箱',c.sender],['收件人',c.recipient],['投诉时间',c.time]]:[];
    if(c?.feedbackId) props.push(['SES 邮件 ID（messageId）',c.sesMessageId],['SES 回执类型','abuse · 垃圾邮件或其他滥发'],['风险口径','计入 SES 风险']);
    const directTicket=ctx.origin==='ticket'&&!ctx.message;
    return '<section class="mb-list">'+head('投诉详情',directTicket?'ticketComplaint':'sesComplaintList',directTicket?{scene:ctx.scene}:complaintParams())+
      (c?'<article class="scr-detail"><h2>'+esc(c.feedbackId?source(c):standard.title)+'</h2><p>'+esc(c.feedbackId?'来源：Amazon SES 反馈回执。':'来源：顾客在邮件内提交的投诉。不计入 SES 风险。')+'</p><dl class="kv">'+props.map(([k,v])=>'<dt>'+k+'</dt><dd>'+esc(v)+'</dd>').join('')+'</dl><div class="scr-answer"><strong>'+ (c.feedbackId?'顾客填写的原因':'投诉原因（选填）')+'</strong><p>'+esc(c.feedbackId?'此回执未提供顾客填写的原因。':c.reason||'未填写')+'</p></div></article>':'<p class="empty">未找到该投诉</p>')+'</section>';
  }
  function detailNotice() {
    const m=mailbox.selected(), n=count(m.id);
    return n?'<div class="scr-detail-notice">'+alertIcon+'<span>该邮箱有 <strong>'+n+'</strong> 封 SES 投诉邮件</span>'+navLink('查看 SES 投诉邮件','sesComplaintList',{scope:m.id})+'</div>':'';
  }
  function setPreview(next,replace=false) {
    const query=new URLSearchParams(location.hash.split('?')[1]||'');
    query.set('tab','forward');
    if(next) query.set('preview',next);else query.delete('preview');
    history[replace?'replaceState':'pushState'](null,'','#mailSettings?'+query);
    if(next) openPreview(next);else dismissPreview();
  }
  function dismissPreview() {
    preview?.remove();
    preview=undefined;
    (previousFocus?.isConnected?previousFocus:main.querySelector('[data-preview="email"]:not([hidden])'))?.focus();
  }
  function openPreview(kind) {
    if(!preview?.isConnected) {
      previousFocus=document.activeElement;
      preview=document.createElement('dialog');
      preview.className='scr-preview';
      preview.addEventListener('cancel',e=>{e.preventDefault();exitPreview();});
      document.body.append(preview);
    }
    const sender=main.querySelector('.mb-drawer-content h3 .mb-muted')?.textContent||mailbox.selected().email;
    preview.setAttribute('aria-label',kind==='form'?'投诉问卷预览':'转发邮件预览');
    preview.innerHTML='<div class="modal-head"><strong>'+(kind==='form'?'投诉问卷预览':'转发邮件预览')+'</strong><button type="button" class="close" aria-label="关闭预览" data-exit-preview>×</button></div><div class="modal-body">'+
      (kind==='form'?'<div class="scr-mail"><span class="scr-brand">'+esc(tenant().name)+'</span><h1>'+esc(standard.title)+'</h1><p>'+esc(standard.description)+'</p><label class="field">投诉原因（选填）<textarea placeholder="请填写投诉原因"></textarea></label><button type="button" class="primary" disabled>提交投诉</button><p class="scr-preview-note">预览模式，不会提交投诉。</p></div><button type="button" class="link" data-preview="email">← 返回邮件预览</button>':
        '<article class="scr-mail"><span class="scr-brand">'+esc(tenant().name)+'</span><h1>售后问题处理进度</h1><p class="scr-mail-from">'+esc(sender)+' → customer@shop.example</p><div class="scr-mail-copy"><p>您好，您的售后问题已交由负责人跟进。如有新情况，可以直接回复这封邮件。</p><p>'+esc(tenant().name)+' Support<br>'+esc(sender)+'</p></div><div class="scr-mail-footer"><span class="scr-mail-mark"><img src="assets/logo.svg" alt="Solvea"></span><button type="button" class="link" data-preview="form">投诉这封邮件</button></div></article>')+'</div>';
    if(!preview.open) preview.showModal();
    preview.querySelector('[data-exit-preview]').focus();
  }
  function exitPreview() {
    if(previewFrom) {history.go(-previewFrom);previewFrom=0;} else setPreview('',true);
  }
  function render(opts={}) {
    const [route,search='']=location.hash.slice(1).split('?'), q=new URLSearchParams(search);
    const id=reviewRoutes.has(route)?route:'mailIntegration', oldTenant=ctx.tenant;
    const nextTenant=q.get('tenant')==='TEN-018'?'TEN-018':'TEN-017';
    ctx.mailTab=q.get('tab')||'';
    ctx.scope=['primary','secondary'].includes(q.get('scope'))?q.get('scope'):'';
    ctx.complaint=q.get('complaint')||'';
    ctx.origin=['report','ticket'].includes(q.get('origin'))?q.get('origin'):'';
    ctx.message=q.get('message')||'';
    ctx.scene=q.get('scene')||'human';
    if(oldTenant!==nextTenant) mailbox.beforeRoute('mailIntegration',{tenant:nextTenant});
    ctx.tenant=nextTenant;
    if(id.startsWith('sesComplaint')) ctx.mailbox=ctx.scope||'primary';
    const pane=id==='mailSettings'&&ctx.mailTab==='forward'&&['email','form'].includes(q.get('preview'))?q.get('preview'):'';
    if(!opts.keepDraft&&!opts.refresh&&id===current&&id==='mailSettings'&&ctx.mailTab==='forward'&&main.querySelector('.mb-drawer [data-mb-tab="forward"]:not([hidden])')&&oldTenant===nextTenant&&
       main.dataset.settingsKey===[ctx.tenant,q.get('mailbox')||'',q.get('mail-mode')||''].join('|')) {
      if(pane) openPreview(pane);else dismissPreview();
      return;
    }
    if(preview) dismissPreview();
    mailbox.beforeRoute(id,{mailbox:q.get('mailbox')||'primary',mailMode:q.get('mail-mode')||'',keepDraft:opts.keepDraft});
    current=id;
    main.dataset.settingsKey=id==='mailSettings'?[ctx.tenant,q.get('mailbox')||'',q.get('mail-mode')||''].join('|'):'';
    const embedded=['ticketComplaint','complaintBlacklist'].includes(id), workbench=embedded||id==='complaintReport'||!!ctx.origin;
    document.body.classList.toggle('scr-embedded',embedded);
    document.querySelector('.workspace').innerHTML=workbench?'▣　智能工作台 <span>≡</span>':'▣　智能客服 <span>≡</span>';
    document.querySelector('.appbar .collapse-icon+span').textContent=workbench?'报表': '集成';
    document.querySelector('#productNav').innerHTML=workbench?[[ 'ticketComplaint','工单','▣'],['complaintBlacklist','联系人','♧'],['complaintReport','报表','▥'],[null,'主动触达','◇'],[null,'设置','⚙']].map(([dest,label,icon])=>dest?navLink(icon+'　'+label,dest,{},(ctx.origin==='ticket'&&dest==='ticketComplaint')||(ctx.origin!=='ticket'&&dest==='complaintReport')?'active':''):'<span>'+icon+'　'+label+'</span>').join(''):integrationNav;
    main.innerHTML=id==='sesComplaintList'?complaintList():id==='sesComplaintDetail'?complaintDetail():id==='ticketComplaint'?work.ticket(ctx.scene):id==='complaintBlacklist'?work.blacklistPage(ctx.scene,q.get('view')):id==='complaintReport'?work.report():mailbox.render(id,'');
    if(id==='mailHealth'||id==='mailSettings') main.querySelector('.mb-intro')?.insertAdjacentHTML('afterend',detailNotice());
    document.querySelector('#sample').value=ctx.tenant;
    main.scrollTop=0;
    if(pane) openPreview(pane);
  }
  const integrationNav=mailbox.nav.map(([id,label,icon])=>id?'<a class="active" href="#mailIntegration" data-integration>'+icon+'<span>'+label+'</span></a>':'<span class="ses-nav-reference">'+icon+'<span>'+label+'</span></span>').join('');
  document.querySelector('#sample').addEventListener('change',e=>{location.hash='#'+(['mailIntegration','ticketComplaint','complaintReport'].includes(current)?current:'mailList')+'?tenant='+e.target.value;});
  document.addEventListener('click',async e=>{
    const el=e.target.closest('button,a');
    if(!el)return;
    if(el.matches('[data-integration]')) {e.preventDefault();window.go('mailIntegration');return;}
    if(el.dataset.preview) {
      if(!preview?.open) {setPreview('',true);previewFrom=1;setPreview('email');}
      else if(el.dataset.preview==='form') {if(previewFrom) previewFrom++;setPreview('form');}
      else if(previewFrom>1) {previewFrom--;history.back();}
      else setPreview('email',true);
      return;
    }
    if(el.matches('[data-exit-preview]')) return exitPreview();
    if(el.matches('[data-forward-back]')) {
      const query=new URLSearchParams(location.hash.split('?')[1]||'');
      query.delete('tab');
      history.replaceState(null,'','#mailSettings?'+query);
      main.querySelector('.mb-methods [data-mb-method="api"]').click();
    }
    if(el.matches('[data-copy-forward]')) {
      const input=el.previousElementSibling;
      try {await navigator.clipboard.writeText(input.value);toast('已复制转发地址');}
      catch {input.select();toast('已选中地址，可手动复制');}
    }
    if(el.matches('[data-forward-verify]')) toast('演示环境不验证真实邮箱');
    if(el.dataset.action?.startsWith('mb')) mailbox.dispatch(el.dataset.action,el.dataset);
  });
  document.addEventListener('input',e=>{if(e.target.form?.id==='scr-report-filters')e.target.form.elements.to.setCustomValidity('');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&e.target.matches('.scr-stat-help'))e.target.blur();});
  document.addEventListener('submit',e=>{const form=e.target;if(form.id==='scr-report-filters'){e.preventDefault();if(work.filter(form))render({refresh:true});return;}if(!form.dataset.form?.startsWith('mb'))return;e.preventDefault();mailbox.submit(form.dataset.form,Object.fromEntries(new FormData(form)),form);});
  mailbox.bind();
  window.addEventListener('hashchange',()=>{
    const pane=new URLSearchParams(location.hash.split('?')[1]||'').get('preview');
    if(!pane) previewFrom=0;
    else if(previewFrom) previewFrom=pane==='form'?2:1;
    render();
  });
  render();
})();
