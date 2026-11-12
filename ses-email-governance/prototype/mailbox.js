'use strict';
window.createMailboxPreview = function (api) {
  const { esc, navLink, action, tenant, state, context, stamp, audit, problem, toast, save, sesBadge } = api;
  const compact = api.sesReview;
  const modes = new Set(['auth','new','domain','folders','signature']);
  const routes = new Set(['mailIntegration','mailList','mailHealth','mailSettings','mailVerify','migrationValidation']);
  const btn = (label, route, data={}, primary=false) => navLink(label,route,data,primary?'mb-button mb-primary':'mb-button');
  const act = (label, key, data={}, primary=false) => action(label,key,data,primary?'mb-button mb-primary':'mb-button');
  const emailIcon = '<span class="mb-email-icon" aria-hidden="true">✉</span>';
  const empty = '暂无数据';
  let draft, method = 'imap', batchTab = 'import', sampleFile = '';
  function all() {
    const t = tenant();
    return [{id:'primary', email:t.from, brand:t.name, auth:t.auth, date:t.verifiedAt, config:t.imapSmtp},
      {id:'secondary', email:'returns@'+t.name.toLowerCase()+'.example', brand:'--', auth:'expired', ...(t.mailboxPreview?.secondary||{})},
      ...Object.values(t.mailboxPreview||{}).filter(m=>m.id?.startsWith('demo-'))];
  }
  function selected() { return all().find(m=>m.id===context().mailbox)||all()[0]; }
  function title(name, back, right='') {
    return '<header class="mb-title"><h1>'+ (back?navLink('←',back,{},'mb-back'):'')+esc(name)+'</h1><div class="mb-actions">'+right+'</div></header>';
  }
  function rows(records) {
    const ses = compact ? compact.countCell : () => sesBadge(tenant().ses);
    return records.map(m=>'<tr data-mailbox-row="'+esc(m.email.toLowerCase())+'"><td><span class="mb-address">'+(m.auth!=='connected'?'<span class="mb-warn-icon" aria-label="待核查授权">⚠ </span>':'')+esc(m.email)+'</span>'+(m.auth==='expired'?'<br><span class="mb-auth-error">⚠ 授权异常</span>':'')+'</td><td>'+esc(m.brand)+'</td><td>启用</td><td>'+ses(m)+'</td><td>'+esc(m.date||'--')+'</td><td><div class="mb-actions">'+btn('配置 →','mailHealth',{mailbox:m.id})+'<button type="button" class="mb-more" aria-label="更多操作" disabled title="原型未演示其他操作">⋮</button></div></td></tr>').join('');
  }
  function list() {
    return '<div class="mb-list">'+title('邮箱','mailIntegration',(compact?.listAction()||'')+act('批量 IMAP 授权','mbBatch',{tab:'import'})+btn('＋ Email','mailSettings',{'mail-mode':'new'},true))+'<input type="search" class="mb-search" placeholder="搜索" aria-label="搜索邮箱"><table class="mb-table"><thead><tr><th>邮箱</th><th>品牌</th><th>状态</th><th>'+(compact?'SES 投诉邮件数':'SES 状态')+'</th><th>授权时间</th><th></th></tr></thead><tbody>'+rows(all())+'</tbody></table><p class="mb-list-empty" hidden>暂无匹配邮箱</p></div>';
  }
  function integration() {
    if (compact) return '<div class="mb-list">'+title('集成')+compact.channelCard(all().filter(m=>m.auth==='connected').length)+'</div>';
    return '<div class="mb-list">'+title('集成')+'<div class="mb-market"><span>渠道</span><button type="button" data-go="mailList">'+emailIcon+'<strong>Email</strong><small>已连接 '+all().filter(m=>m.auth==='connected').length+'</small></button></div></div>';
  }
  function item(name, description, control, extra='') {
    return '<div class="mb-item"><span class="mb-circle" aria-hidden="true"></span><div><b>'+name+'</b>'+extra+'<p>'+description+'</p></div>'+control+'</div>';
  }
  function detail(governance) {
    const m = selected(), key = {mailbox:m.id};
    return '<div class="mb-detail"><article>'+title('Email','mailList')+
      '<div class="mb-intro"><div class="mb-app-icon">'+emailIcon+'</div><div><b>Email</b><p>授权售后邮箱后，邮件实时同步，Solvea可持续跟踪同一客户问题，智能即时回复，还可自动分类工单，让响应更高效、服务更连贯。</p></div></div>'+
      '<h2>授权步骤 <span class="mb-muted">• '+(m.auth==='none'?'0':'1')+' / 1步</span> <small>必做</small></h2><section class="mb-card">'+item('邮箱授权','授权后将实时同步邮件，Solvea可以帮助您智能回复邮件。',btn('授权','mailSettings',{...key,'mail-mode':'auth'},true),'<span class="mb-address">'+esc(m.email)+'</span>')+'</section>'+
      (m.auth==='connected'?'<div class="mb-connection mb-connected"><b>IMAP/SMTP 已验证</b><span>'+esc(m.date||'')+'</span>'+navLink('设置 IMAP/SMTP','mailSettings',key)+'</div>':'<div class="mb-connection"><span class="mb-warn-icon" aria-hidden="true">⚠</span><div><b>提高服务稳定性-IMAP/SMTP</b><p>为了降低您的发信被标记为垃圾邮件的风险，建议您进一步完成IMAP/SMTP服务授权。（注意：如果未通过IMAP/SMTP服务授权，则不支持选择同步和处理文件夹）</p>'+navLink('设置 IMAP/SMTP','mailSettings',key)+'</div></div>')+
      '<h2>功能配置</h2><section class="mb-card">'+item('同步邮箱文件夹','勾选需同步邮件的文件夹，跳过无需处理的文件夹，减少无效工单生成。',btn('配置','mailSettings',{...key,'mail-mode':'folders'},true))+item('配置邮箱签名','设置邮箱签名后，用该邮箱发送或回复邮件时，签名会自动输入。',btn('配置','mailSettings',{...key,'mail-mode':'signature'},true))+'</section>'+
      governance+'</article><aside class="mb-highlights"><div>'+emailIcon+' Email　∞　Solvea</div><h2>亮点推荐</h2><dl><dt>♧　智能回复</dt><dd>Solvea 基于知识库与规范流程自主学习，收到新邮件即时智能响应。</dd><dt>☻　问题跟踪</dt><dd>同一客户问题自动归集为单个单据跟进，完整保留沟通上下文。</dd><dt>▤　自动分类</dt><dd>智能识别消息，删除垃圾信息，自动标记紧急、危险、差评等高优先级邮件，聚焦核心事务处理。</dd></dl></aside></div>';
  }
  function input(label,name,value='',type='text',extra='') {
    return '<label class="mb-field">'+label+'<span class="mb-required"> *</span><input required name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+extra+'></label>';
  }
  function defaults(email) {
    const domain = email.split('@').at(-1).toLowerCase();
    const host = domain.endsWith('.example')||domain==='gmail.com'?domain:'';
    return {smtpHost:host?'smtp.'+host:'',smtpPort:'465',imapHost:host?'imap.'+host:'',imapPort:'993'};
  }
  function methods(active) {
    return '<div class="mb-methods" role="group" aria-label="邮箱授权方式">'+[['api','API'],['forward','设置转发'],['imap','设置 IMAP/SMTP']].map(([id,name])=>'<button type="button" data-mb-method="'+id+'" aria-pressed="'+(active===id)+'">'+name+'</button>').join('')+'</div>';
  }
  function protocol(prefix, conf) {
    const host=prefix+'Host', port=prefix+'Port';
    return '<div class="mb-protocol">'+input(prefix.toUpperCase()+' 服务器',host,conf[host],'text','spellcheck="false"')+
      '<label class="mb-field">加密方式 <span class="mb-required">*</span><select name="'+prefix+'Mode" aria-label="'+prefix.toUpperCase()+' 加密方式"><option value="SSL/TLS">SSL/TLS</option>'+(prefix==='smtp'?'<option value="STARTTLS" '+(Number(conf[port])===587?'selected':'')+'>STARTTLS</option>':'')+'</select></label>'+
      input('端口',port,conf[port],'number','min="1" max="65535" aria-label="'+prefix.toUpperCase()+' 端口"')+'</div>';
  }
  function fields(mail, open) {
    const conf = {...defaults(mail.email), ...mail.config};
    return '<div class="mb-protocol-note">ⓘ　SMTP 只验证连接及认证，不发送测试邮件。</div><form data-form="mbVerify" autocomplete="off">'+
      input('密码 / 授权码','secret','','password','placeholder="请输入演示授权码" autocomplete="new-password"')+
      '<details class="mb-secret-help"><summary>如何获取授权码？</summary><p>在邮箱服务商的安全设置生成应用专用密码或授权码。原型仅填写演示值。</p></details>'+
      '<details class="mb-advanced" '+(open?'open':'')+'><summary>高级设置</summary>'+protocol('smtp',conf)+protocol('imap',conf)+'</details>'+
      '<p class="ses-form-error" role="alert" hidden></p><footer class="mb-drawer-footer">'+btn('取消',draft?'mailList':'mailHealth',{mailbox:mail.id})+(draft?btn('上一步','mailSettings',{'mail-mode':'new'}):'')+'<button type="submit" class="mb-button mb-primary">验证</button></footer></form>';
  }
  function drawer(id) {
    const ctx=context(), mode=ctx.mailMode, existing=selected(), mail=draft||existing, create=mode==='new', domain=mode==='domain'&&!!draft;
    const step=create?1:domain?3:2, tab=compact&&['api','forward','imap'].includes(ctx.mailTab)?ctx.mailTab:mode==='auth'?'api':method;
    const goBack=draft||create?'mailList':'mailHealth', back={mailbox:existing.id};
    const forward=compact?compact.forwardPane(mail,goBack,back,!!draft):'<div class="mb-protocol-note">在邮箱服务商配置邮件转发。原型不生成转发地址。</div>';
    const apiPane=compact?compact.apiPane():'<div class="mb-protocol-note">通过邮箱服务商授权。原型未连接 OAuth 服务。</div>';
    const reference=mode==='folders'||mode==='signature';
    const label=reference?(mode==='folders'?'同步邮箱文件夹':'配置邮箱签名'):'邮箱授权';
    const tools=reference?(mode==='folders'&&mail.auth!=='connected'?'<p>请先通过 IMAP/SMTP 服务授权。</p>'+btn('设置 IMAP/SMTP','mailSettings',back,true):'<p>此为现有配置入口，原型未连接邮箱服务。</p>'):
      create?'<h3>输入邮箱地址</h3><form data-form="mbAddress">'+input('邮箱','email',draft?.email||'','email','placeholder="support@shop.example"')+input('品牌','brand',draft?.brand||'')+'<p class="ses-form-error" role="alert" hidden></p><footer class="mb-drawer-footer">'+btn('取消','mailList')+'<button class="mb-button mb-primary" type="submit">继续</button></footer></form>':
      domain?'<h3>域名认证</h3><p>在现有系统按页面提供的 DNS 记录完成认证。本地原型未执行 DNS 验证。</p><footer class="mb-drawer-footer">'+btn('返回邮箱列表','mailList')+act('保存演示邮箱','mbSaveDemo',{},true)+'</footer>':
      '<h3>授权邮箱 <span class="mb-muted">'+esc(mail.email)+'</span></h3>'+methods(tab)+'<div data-mb-tab="imap" '+(tab!=='imap'?'hidden':'')+'>'+fields(mail,id!=='mailSettings')+'</div><div data-mb-tab="api" '+(tab!=='api'?'hidden':'')+'>'+apiPane+'</div><div data-mb-tab="forward" '+(tab!=='forward'?'hidden':'')+'>'+forward+'</div>';
    return '<div class="mb-drawer" role="dialog" aria-modal="true" aria-label="'+label+'"><header><strong>'+label+'</strong>'+navLink('关闭',goBack,back,'mb-close')+'</header><div class="mb-drawer-body">'+
      (reference?'':'<ol class="mb-steps">'+['输入邮箱地址','邮箱授权','域名认证'].map((s,i)=>'<li '+(step===i+1?'aria-current="step"':'')+'><span>'+(i+1)+'</span>'+s+'</li>').join('')+'</ol>')+
      '<section class="mb-drawer-content">'+tools+'</section></div></div>';
  }
  function batch() {
    const records=state().mailboxBatches?.[tenant().id]||[];
    return '<dialog class="mb-batch" aria-label="批量 IMAP 授权"><header><strong>批量 IMAP 授权</strong>'+action('关闭','mbClose',{},'mb-close')+'</header>'+
      '<div class="mb-batch-tabs" aria-label="批量授权页签">'+[['import','Excel 导入'],['history','批次记录']].map(([tab,label])=>'<button type="button" data-action="mbBatch" data-tab="'+tab+'" aria-pressed="'+(tab===batchTab)+'">'+label+'</button>').join('')+'</div>'+
      (batchTab==='history'?'<div class="mb-batch-content">'+(records.length?'<table class="mb-table"><thead><tr><th>文件</th><th>提交时间</th><th>结果</th></tr></thead><tbody>'+records.map(r=>'<tr><td>'+esc(r.file)+'</td><td>'+esc(r.date)+'</td><td>演示完成</td></tr>').join('')+'</tbody></table>':'<div class="mb-batch-empty">'+empty+'</div>')+'</div>':
      '<div class="mb-batch-content"><div class="mb-batch-info"><span>i</span><div><p>每批最多 200 个邮箱。同租户已有邮箱跳过，其他租户已授权邮箱失败；不会覆盖已有授权。提交后可关闭页面，后台会继续执行。</p><p>沿用手动授权设置：IMAP 使用 SSL；SMTP 端口 587 使用 STARTTLS，其他端口使用 SSL。SMTP 只验证连接及认证，不发送测试邮件。</p></div></div>'+
      '<p class="mb-muted">模板每行填写邮箱（emailAddress）、密码或授权码（secretKey），以及 IMAP、SMTP 的服务器（Host）、端口（Port）和加密方式（Mode）。品牌（brand）可不填。请填写第一个工作表，保留表头。</p><div class="mb-actions">'+
      '<a class="mb-button" href="assets/imap-demo-template.xlsx" download>下载空白模板</a><label class="mb-button mb-file">选择 Excel 文件<input type="file" accept=".xlsx,.xls" aria-label="选择 Excel 文件"></label>'+act('载入示例','mbSample')+'</div><p class="mb-muted mb-file-name">'+(sampleFile?esc(sampleFile)+' · 仅模拟批次，未读取文件内容':'原型仅模拟批次，请勿上传真实凭证。')+'</p></div>'+
      '<footer class="mb-batch-footer"><button type="button" class="mb-button mb-primary" data-action="mbSubmitBatch" '+(sampleFile?'':'disabled')+'>提交 / 重试提交</button></footer>')+'</dialog>';
  }
  function showBatch() {
    const old = document.querySelector('.mb-batch');
    if (old) old.remove();
    const view=document.querySelector('#viewMailList');
    view.insertAdjacentHTML('beforeend',batch());
    view.querySelector('.mb-batch').showModal();
  }
  return {
    routes,
    selected,
    nav: [[null,'首页','⌂'],[null,'数据分析','▥'],[null,'收件箱','▣'],[null,'预处理','♧'],[null,'知识中心','◫'],[null,'搭建','♙'],[null,'批量测试','⚒'],[null,'AI 安全','⛨'],['mailIntegration','集成','⬡'],[null,'智能伙伴','◈']],
    beforeRoute(id,data) {
      const ctx=context();
      if (data.tenant&&data.tenant!==ctx.tenant) { ctx.mailbox='primary'; draft=undefined; }
      if (!routes.has(id)) return;
      if (id==='mailList'||id==='mailIntegration') { draft=undefined; sampleFile=''; }
      if (id==='mailHealth'||['mailSettings','mailVerify','migrationValidation'].includes(id)) {
        ctx.mailbox=all().some(m=>m.id===data.mailbox)?data.mailbox:'primary';
        ctx.mailMode=modes.has(data.mailMode)?data.mailMode:'';
        if (ctx.mailMode!=='new'&&ctx.mailMode!=='domain'&&!data.keepDraft) draft=undefined;
        method='imap';
      }
    },
    render(id, governance) {
      if(id==='mailIntegration') return integration();
      if(id==='mailList') return list();
      if(id==='mailHealth') return detail(governance);
      return (draft||context().mailMode==='new'?list():detail(governance))+drawer(id);
    },
    submit(key, data, form) {
      if (context().role!=='admin') return;
      const t=tenant();
      if (key==='mbAddress') {
        const email=data.email.trim().toLowerCase();
        if(all().some(m=>m.email.toLowerCase()===email)) return problem(form,'该邮箱已存在，请在列表选择「配置」。');
        draft={email,brand:data.brand.trim()};
        window.go('mailSettings',{keepDraft:true});
      } else if (key==='mbVerify') {
        if(!data.secret?.trim()) return problem(form,'请输入授权码。');
        if(!data.smtpHost?.trim()||!data.imapHost?.trim()) return problem(form,'请在高级设置填写 SMTP 和 IMAP 服务器。');
        if ((Number(data.smtpPort)===587?'STARTTLS':'SSL/TLS')!==data.smtpMode) return problem(form,'SMTP 端口 587 使用 STARTTLS，其他端口使用 SSL/TLS。');
        if(context().validation==='fail') return problem(form,'连接验证失败。请检查授权码、服务器、端口和加密方式。');
        const config=Object.fromEntries(['smtpHost','smtpPort','smtpMode','imapHost','imapPort','imapMode'].map(k=>[k,data[k]]));
        const date=stamp(), mail=selected();
        if(draft) { Object.assign(draft,{auth:'connected',date,config}); return window.go('mailSettings',{mailMode:'domain'}); }
        if(mail.id==='primary') { t.auth='connected';t.verifiedAt=date;t.imapSmtp=config; }
        else { t.mailboxPreview||={};t.mailboxPreview[mail.id]={...mail,auth:'connected',date,config}; }
        audit('IMAP/SMTP 连接验证',mail.auth,'connected');
        window.go('mailHealth',{mailbox:mail.id});toast('IMAP/SMTP 连接验证通过');
      }
    },
    dispatch(key, data) {
      if(context().role!=='admin') return;
      if(key==='mbBatch') { batchTab=data.tab==='history'?'history':'import';showBatch(); }
      if(key==='mbClose') document.querySelector('.mb-batch')?.close();
      if(key==='mbSample') { sampleFile='imap-demo.xlsx';showBatch(); }
      if(key==='mbSubmitBatch'&&sampleFile) {
        const s=state();s.mailboxBatches||={};(s.mailboxBatches[tenant().id]||=[]).unshift({file:sampleFile,date:stamp()});
        sampleFile='';save();batchTab='history';showBatch();
      }
      if(key==='mbSaveDemo'&&draft?.auth==='connected'){
        const t=tenant(), id='demo-'+Date.now();t.mailboxPreview||={};t.mailboxPreview[id]={...draft,id};draft=undefined;save();
        window.go('mailHealth',{mailbox:id});
      }
    },
    bind() {
      document.addEventListener('invalid',e=>{
        const advanced=e.target.closest('.mb-advanced');
        if(advanced) advanced.open=true;
      },true);
      document.addEventListener('input',e=>{
        if(e.target.matches('.mb-search')){
          const query=e.target.value.trim().toLowerCase();
          let found=false;
          e.target.closest('.mb-list').querySelectorAll('[data-mailbox-row]').forEach(r=>{r.hidden=!r.dataset.mailboxRow.includes(query);found||=!r.hidden;});
          e.target.closest('.mb-list').querySelector('.mb-list-empty').hidden=found;
        }
        if(e.target.matches('[name="smtpPort"]')) e.target.form.elements.smtpMode.value=Number(e.target.value)===587?'STARTTLS':'SSL/TLS';
      });
      document.addEventListener('click',e=>{
        const btn=e.target.closest('[data-mb-method]');if(!btn)return;
        const dialog=btn.closest('.mb-drawer');method=btn.dataset.mbMethod;
        dialog.querySelectorAll('[data-mb-method]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
        dialog.querySelectorAll('[data-mb-tab]').forEach(tab=>tab.hidden=tab.dataset.mbTab!==method);
      });
      document.addEventListener('change',e=>{
        if(!e.target.matches('.mb-file input'))return;
        sampleFile=e.target.files?.length?'已选择 Excel 文件':'';
        showBatch();
      });
    }
  };
};
