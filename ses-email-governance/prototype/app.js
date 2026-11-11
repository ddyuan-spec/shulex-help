'use strict';
(async()=>{
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const blacklist=window.SolveaBlacklist;
const clone=v=>JSON.parse(JSON.stringify(v)),KEY='solvea-ses-governance-prototype-20261109-v1';
const routes=await fetch('routes.json').then(r=>r.json()),byId=Object.fromEntries(routes.map(r=>[r.id,r]));
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch{}if(!S||S.version!==1||!Array.isArray(S.tenants))S=clone(window.SES_SEED);S.ticketStatus||={};S.qualityEscalations||={};S.tenants.forEach(t=>t.route||='OWN');
let ctx={role:'platform',tenant:'TEN-017',recipient:'R-SAM',message:'MSG-204',feedback:'FB-031',event:'EV-001',notification:'N-001',audit:'',page:'platformTenants',journey:'',journeyStep:-1,token:'valid',submission:'normal',validation:'pass',quality:'missing',purpose:'service'};
let current='platformTenants',toastTimer,filteredText='',filteredStatus='',publicDraft={},tempQuery={};
S.complaints??=clone(window.SES_SEED.complaints);
const defaultForm=()=>window.SES_SEED.complaintForms[0];
function restoreComplaintForms(state){
 if(state.complaintForms)return;
 state.complaintForms=clone(window.SES_SEED.complaintForms);
 for(const t of state.tenants)t.complaintForm=window.SES_SEED.tenants.find(x=>x.id===t.id)?.complaintForm;
}
restoreComplaintForms(S);
const complaintDrafts=new Map();
let complaintDeleteId='';
for(const sample of window.SES_SEED.messages.filter(x=>x.complaintDemo)){
 if(!S.messages.some(x=>x.id===sample.id))S.messages.push(clone(sample));
}
// Existing route hierarchy: product navigation stays within the current role.
const PARENTS={mailHealth:'mailList',mailList:'mailIntegration',complaintConfig:'tenantDetail',complaintFormList:'complaintConfig',complaintFormEdit:'complaintFormList',complaintInbox:'ticketReady',complaintBlacklist:'complaintDetail',complaintPlatform:'tenantDetail',complaintHandle:'complaintDetail',tenantDetail:'platformTenants',applicationReview:'tenantDetail',restrictionEdit:'tenantDetail',restorationReview:'tenantDetail',mailSettings:'mailHealth',mailVerify:'mailSettings',migrationValidation:'mailSettings',applicationEdit:'mailHealth',remediationEdit:'mailHealth',pendingDetail:'pendingList',queueReview:'pendingList',recipientDetail:'recipientList',providerEventDetail:'providerEvents',providerUnassigned:'platformTenants',feedbackDetail:'feedbackList',feedbackHandle:'feedbackDetail',feedbackEscalate:'feedbackDetail',riskOverview:'tenantDetail',providerEvents:'tenantDetail',migrationList:'platformTenants',migrationDetail:'tenantDetail',notifications:'tenantDetail',auditList:'tenantDetail',riskReplay:'tenantDetail',riskIncomplete:'tenantDetail',notificationDetail:'notifications',auditDetail:'auditList'};
const PAGE_NAMES={complaintConfig:'邮件内投诉设置',complaintFormList:'投诉表单',complaintFormEdit:'表单设置',complaintInbox:'邮件投诉',complaintPlatform:'客户提交',complaintDetail:'客户投诉详情',complaintBlacklist:'黑名单',complaintHandle:'处理邮件投诉',platformTenants:'租户列表',tenantDetail:'租户详情',applicationReview:'审核申请',restrictionEdit:'限制资格',restorationReview:'审核恢复',mailHealth:'邮箱详情',mailSettings:'邮箱配置',mailVerify:'连接验证',applicationEdit:'申请SES',remediationEdit:'整改提交',pendingList:'待处理邮件',pendingDetail:'发送详情',queueReview:'历史邮件核对',recipientList:'联系人',recipientDetail:'联系状态',providerEvents:'发送回执',providerEventDetail:'回执详情',providerUnassigned:'未归属回执',feedbackList:'服务反馈',feedbackDetail:'反馈详情',feedbackHandle:'处理反馈',feedbackEscalate:'升级处理',riskOverview:'发送指标',riskReplay:'影子回放',riskIncomplete:'统计缺口',migrationList:'存量接入状态',migrationDetail:'迁移详情',notifications:'资格变更通知',notificationDetail:'通知详情',auditList:'操作记录',auditDetail:'操作详情'};
function ancestors(id){const out=[];const parent=x=>x==='complaintFormEdit'&&ctx.complaintFormOrigin==='config'?'complaintConfig':ctx.role==='admin'&&['pendingList','notifications','auditList','recipientList'].includes(x)?'mailHealth':ctx.role==='agent'&&x==='pendingList'?'ticketReady':PARENTS[x];let next=parent(id);while(next&&!out.includes(next)){out.push(next);next=parent(next)}return out}
function crumbs(id,title,trail){const parents=ancestors(id).reverse().filter(x=>allowed(x));if(!parents.length)return trail?'<div class="ses-crumb">'+esc(trail)+'</div>':'';return '<nav class="ses-crumb ses-breadcrumbs" aria-label="页面层级">'+parents.map(x=>navLink(PAGE_NAMES[x]||byId[x].title,x)).join('<span>›</span>')+'<span>›</span><span aria-current="page">'+esc(id==='tenantDetail'?tenant().name:PAGE_NAMES[id]||title)+'</span></nav>'}
const JOURNEYS={
 onboarding:{label:'新租户接入',tenant:'TEN-018',steps:[['平台 · 租户列表','platformTenants','platform'],['平台 · 租户详情','tenantDetail','platform'],['商家 · 邮箱详情','mailHealth','admin'],['商家 · 提交申请','applicationEdit','admin'],['平台 · 审核申请','applicationReview','platform'],['商家 · 发送配置','mailSettings','admin'],['客服 · 发送验证','ticketReady','agent']]},
 restoration:{label:'限制、整改与恢复',tenant:'TEN-019',steps:[['平台 · 租户详情','tenantDetail','platform'],['商家 · 受限状态','mailHealth','admin'],['商家 · 自有邮箱','mailSettings','admin'],['商家 · 连接验证','mailVerify','admin'],['商家 · 提交整改','remediationEdit','admin'],['平台 · 恢复审核','restorationReview','platform'],['商家 · 核对历史邮件','queueReview','admin']]},
 delivery:{label:'发送失败处理',tenant:'TEN-017',steps:[['客服 · 待处理列表','pendingList','agent'],['客服 · 发送详情','pendingDetail','agent','MSG-206'],['客服 · 失败工单','ticketFailed','agent','MSG-206'],['管理员 · 修复设置','mailSettings','admin'],['管理员 · 验证连接','mailVerify','admin'],['客服 · 受控重发','ticketFailed','agent','MSG-206']]},
 feedback:{label:'服务反馈处理',tenant:'TEN-017',steps:[['收件人 · 原邮件','emailPreview','recipient','MSG-204'],['收件人 · 提交反馈','feedbackEdit','recipient','MSG-204'],['主管 · 反馈列表','feedbackList','supervisor'],['主管 · 反馈详情','feedbackDetail','supervisor'],['主管 · 处理关闭','feedbackHandle','supervisor'],['主管 · 升级处理','feedbackEscalate','supervisor']]},
 preference:{label:'联系偏好与禁发',tenant:'TEN-017',steps:[['收件人 · 原邮件','emailPreview','recipient','MSG-204'],['收件人 · 联系偏好','preferenceEdit','recipient','MSG-204'],['收件人 · 验证范围','preferenceVerify','recipient','MSG-204'],['收件人 · 停止确认','preferenceStopConfirm','recipient','MSG-204'],['收件人 · 保存结果','preferenceResult','recipient','MSG-204'],['管理员 · 联系状态','recipientDetail','admin','R-SAM'],['客服 · 后续发送检查','ticketBlocked','agent','MSG-204']]},
 quality:{label:'工单回复规则',tenant:'TEN-017',steps:[['客服 · 原工单','ticketReady','agent','MSG-204'],['客服 · 资料核对','qualityMissing','agent','MSG-204'],['客服 · 排障移交','qualityEscalation','agent','MSG-204'],['客服 · 感谢判断','qualityThanks','agent','MSG-204'],['客服 · 邀评检查','qualitySurvey','agent','MSG-204']]}
};
// 三条面向评审的主流程。旧 JOURNEYS 继续保留给异常场景和回归脚本，
// 但不再作为产品入口展示，避免把内部测试路径误认为业务菜单。
const PRIMARY_JOURNEYS={
 platform:{label:'平台管理员 · 租户治理',tenant:'TEN-017',steps:[
  ['租户治理','platformTenants','platform'],['租户详情','tenantDetail','platform'],['发送回执核对','providerEvents','platform'],['限制 / 恢复','restrictionEdit','platform'],['操作记录','auditList','platform']
 ]},
 admin:{label:'租户管理员 · 邮箱与整改',tenant:'TEN-019',steps:[
  ['集成 · 邮箱列表','mailList','admin'],['查看邮箱详情','mailHealth','admin'],['验证 IMAP/SMTP','mailVerify','admin'],['核对受影响邮件','pendingList','admin'],['恢复后历史核对','queueReview','admin']
 ]},
 agent:{label:'租户客服 · 工单发送',tenant:'TEN-017',steps:[
  ['工单回复','ticketReady','agent','MSG-204'],['回复质量','qualityMissing','agent','MSG-204'],['发送前检查','ticketBlocked','agent','MSG-208'],['发送结果','ticketFailed','agent','MSG-206'],['联系状态','recipientDetail','agent','R-LEE']
 ]}
};
function currentJourney(){if(JOURNEYS[ctx.journey]||PRIMARY_JOURNEYS[ctx.journey])return ctx.journey;if(/^quality/.test(current))return 'quality';if(/^preference/.test(current))return 'preference';if(/^feedback|^emailPreview/.test(current))return 'feedback';if(/^ticket|^pending/.test(current))return 'delivery';return ctx.tenant==='TEN-019'?'restoration':'onboarding'}
function journeyStatus(){const t=tenant(),j=currentJourney();if(PRIMARY_JOURNEYS[ctx.journey])return ctx.journey==='platform'?'先核对投诉依据，再决定限制或恢复；通知失败不撤销资格决定':ctx.journey==='admin'?'邮箱授权与 SES 资格分别处理；恢复后逐项核对旧邮件': '先确认资料与联系状态；阻断、明确失败、结果未知分别处置';if(j==='onboarding')return t.application==='pending'?'申请已提交，下一步由平台审核':t.ses==='active'?'SES资格已开放，商家仍需确认发送通道':t.application==='rejected'?'申请未通过，商家可修改后重新提交':'SES未开放：由租户管理员先提交申请';if(j==='restoration')return t.remediation==='pending'?'整改已提交，等待平台审核':t.ses==='active'?'资格已恢复，历史邮件仍需逐项核对':t.auth==='connected'?'自有通道已验证，SES限制仍独立保持':'先验证替代通道，再提交整改与恢复依据';if(j==='feedback')return '当前反馈：'+(caseItem()?.id||'尚未提交')+' · '+(titles[caseItem()?.status]||'待提交');if(j==='preference')return recip()?.stop?'已停止全部联系，后续发送应阻断':recip()?.optional?'仅退出可选邮件，必要服务保留':'当前联系偏好尚未变更';if(j==='delivery')return '发送结果：'+(titles[message()?.status]||'待核对')+'；修复后仍需受控重发';return '依次查看回复规则；各场景不会自动发送邮件'}
function renderJourney(){const id=Object.hasOwn(PRIMARY_JOURNEYS,ctx.journey)?ctx.journey:ctx.role==='platform'?'platform':ctx.role==='admin'?'admin':'agent';const j=PRIMARY_JOURNEYS[id];$('#journeySelect').value=id;$('#journeySteps').innerHTML=j.steps.map((s,i)=>'<button type="button" data-primary-step="'+i+'" class="'+(s[1]===current&&s[2]===ctx.role?'active':'')+'">'+(i+1)+' '+esc(s[0])+'</button>').join('<span>→</span>')+(id==='admin'&&remediationLabel()?'<span>｜SES 受限时</span><button type="button" data-go="remediationEdit" class="'+(current==='remediationEdit'?'active':'')+'">'+remediationLabel()+'</button>':'');$('#journeyState').textContent=journeyStatus()}
function openPrimaryStep(index){const id=Object.hasOwn(PRIMARY_JOURNEYS,ctx.journey)?ctx.journey:ctx.role==='platform'?'platform':ctx.role==='admin'?'admin':'agent';const s=PRIMARY_JOURNEYS[id].steps[index];if(!s)return;ctx.journey=id;ctx.journeyStep=index;ctx.role=s[2];const data={};if(s[3])data[s[3].startsWith('R-')?'recipient':s[3].startsWith('EV-')?'event':'message']=s[3];window.go(s[1],data)}
function openJourneyStep(index){const id=currentJourney(),j=JOURNEYS[id],s=j.steps[index];if(!s)return;ctx.journey=id;ctx.journeyStep=index;ctx.role=s[2];let target=s[1];const data={};if(s[3])data[s[3].startsWith('R-')?'recipient':'message']=s[3];if(id==='onboarding'&&/^ticket/.test(target)){const m=S.messages.find(x=>x.tenant===ctx.tenant);if(m)data.message=m.id;target=gate(tenant(),S.recipients.find(x=>x.id===m?.recipient)).ok?'ticketReady':'ticketBlocked'}if(['feedbackDetail','feedbackHandle','feedbackEscalate'].includes(target)&&caseItem())data.feedback=caseItem().id;window.go(target,data)}
const stamp=()=>new Date().toLocaleString('sv-SE',{hour12:false}).slice(0,16);
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const tenant=()=>S.tenants.find(x=>x.id===ctx.tenant)||S.tenants[0];
const recip=()=>S.recipients.find(x=>x.id===ctx.recipient&&x.tenant===ctx.tenant)||S.recipients.find(x=>x.tenant===ctx.tenant);
const message=()=>S.messages.find(x=>x.id===ctx.message&&x.tenant===ctx.tenant)||S.messages.find(x=>x.tenant===ctx.tenant);
const caseItem=()=>S.feedbacks.find(x=>x.id===ctx.feedback&&x.tenant===ctx.tenant)||S.feedbacks.find(x=>x.tenant===ctx.tenant);
const complaintRequired=t=>t.ses==='active';
const complaintEnabled=t=>complaintRequired(t)||t.complaintOptional===true;
const complaintFormById=id=>S.complaintForms.find(f=>f.id===id);
const selectedComplaintForm=t=>complaintFormById(t.complaintForm)||defaultForm();
const complaintFormUsers=id=>S.tenants.filter(t=>selectedComplaintForm(t).id===id);
const lockedComplaintForm=f=>f.system||complaintFormUsers(f.id).length>0;
const complaintMailForm=(t,withLink)=>withLink?clone(selectedComplaintForm(t)):null;
const complaintRows=()=>S.complaints.filter(x=>x.tenant===ctx.tenant);
const complaintItem=()=>complaintRows().find(x=>x.id===ctx.complaint);
const sentComplaintMail=()=>S.messages.find(x=>x.tenant===ctx.tenant&&x.id===ctx.message&&x.recipient===ctx.recipient&&x.status==='sent'&&x.complaintLink);
const publicComplaint=()=>{const m=sentComplaintMail();return m&&complaintRows().find(x=>x.message===m.id&&x.recipient===m.recipient)};
const complaintStatus=x=>x==='closed'?badge('已结案','green'):x==='processing'?badge('处理中','blue'):badge('待处理','amber');
const complaintOwner=x=>x.assignee==='SUP-B'?'主管 B':x.assignee==='ADMIN-C'?'租户管理员':'待分派';
const actor=()=>({platform:{id:'PLAT-P',name:'平台管理员'},admin:{id:'ADMIN-C',name:'租户管理员'},agent:{id:'AGENT-A',name:'客服 A'},supervisor:{id:'SUP-B',name:'主管 B'},recipient:{id:recip()?.id||'RECIPIENT',name:'收件人'}}[ctx.role]);
const titles={active:'已开放',off:'未开放',restricted:'已限制',review:'复核中',pending:'待处理',processing:'处理中',resolved:'已解决',none:'无需处理',escalated:'已升级',sent:'已提交',failed:'明确失败',unknown:'结果未知',queued:'待处理',cancelled:'已取消',connected:'已验证',expired:'授权失效',unverified:'待验证',approved:'已批准',rejected:'未通过'};
const badge=(text,tone='')=>`<span class="ses-tag ${tone}">${esc(text)}</span>`;
const stateBadge=v=>badge(titles[v]||v,['restricted','failed','expired','rejected'].includes(v)?'red':['active','sent','connected','resolved','approved'].includes(v)?'green':['review','pending','queued','unknown','unverified','escalated'].includes(v)?'amber':'');
const sesEnabled=v=>v==='active';
const sesStatus=v=>sesEnabled(v)?'启用':'停用';
const sesBadge=v=>badge(sesStatus(v),sesEnabled(v)?'green':'');
const sesStopReason=t=>sesEnabled(t.ses)?'—':t.reason||(t.ses==='off'?'尚未开通':'平台已停用 SES');
const applicationBadge=v=>v==='none'?badge('未申请'):v==='pending'?badge('待审核','amber'):stateBadge(v);
const remediationLabel=()=>ctx.role==='admin'&&['restricted','review'].includes(tenant().ses)?(tenant().remediation==='pending'?'查看整改进度':'提交整改'):'';
const remediationLink=(klass='')=>remediationLabel()?navLink(remediationLabel(),'remediationEdit',{},klass):'';
const remediationBadge=v=>v==='none'?badge('未提交整改'):v==='pending'?badge('待复核','amber'):stateBadge(v);
const authBadge=v=>v==='none'?badge('未连接'):stateBadge(v);
const attrs=o=>Object.entries(o||{}).map(([k,v])=>` data-${k}="${esc(v)}"`).join('');
const action=(text,key,data={},klass='')=>`<button type="button" class="${klass}" data-action="${key}"${attrs(data)}>${esc(text)}</button>`;
const navLink=(text,page,data={},klass='link')=>`<button type="button" class="${klass}" data-go="${page}"${attrs(data)}>${esc(text)}</button>`;
const head=(title,trail='',actions='')=>`<div class="ses-top"><div>${crumbs(current,title,trail)}<div class="ses-title"><h1>${esc(title)}</h1></div></div><div class="ses-actions">${actions}</div></div>`;
const panel=(title,body,right='')=>`<div class="ses-panel"><div class="ses-panel-head"><span>${title}</span>${right}</div><div class="ses-panel-body">${body}</div></div>`;
const kv=values=>`<dl class="ses-kv">${values.map(([a,b])=>`<dt>${esc(a)}</dt><dd>${b}</dd>`).join('')}</dl>`;
const empty=(title='暂无数据',body='')=>`<div class="ses-empty"><div class="empty-icon">▧</div><strong>${esc(title)}</strong>${body}</div>`;
const banner=(title,tone='',actions='')=>`<div class="ses-banner ${tone}"><strong>${esc(title)}</strong><div class="ses-actions">${actions}</div></div>`;
const table=(headers,rows)=>rows.length?`<div class="tablewrap" style="margin:0"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c??''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:empty();
const field=(label,name,value='',type='text',required=false)=>`<div class="ses-field"><label for="${name}">${esc(label)}${required?'<span class="required">*</span>':''}</label>${type==='textarea'?`<textarea id="${name}" name="${name}" ${required?'required':''}>${esc(value)}</textarea>`:`<input id="${name}" name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''}>`}</div>`;
const selectField=(label,name,options,value)=>`<div class="ses-field"><label for="${name}">${esc(label)}</label><select id="${name}" name="${name}">${options.map(([v,l])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`).join('')}</select></div>`;
const footer=(back,label='保存')=>`<div class="ses-footer">${navLink('取消',back,{},'')}<button type="submit" class="primary">${esc(label)}</button></div>`;
const form=(key,body,back,label='保存')=>`<form class="ses-form" data-form="${key}">${body}<p class="ses-form-error" role="alert" hidden></p>${footer(back,label)}</form>`;
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,3500)}
function audit(actionText,before,after,kind='治理',ticketBlock){S.audits.unshift({id:'AUD-'+Date.now()+'-'+S.audits.length,tenant:ctx.tenant,actor:actor().id,role:actor().name,action:actionText,before:String(before),after:String(after),kind,time:stamp(),...(ticketBlock?{ticketBlock}:{})});save()}
function ticketReplies(m){return S.messages.filter(x=>x.tenant===ctx.tenant&&x.ticket===m?.ticket&&S.outbound.includes(x.id))}
function rejectTicketSend(m,result){audit('发送前阻断 · '+(ctx.entry||'人工'),'未调用供应商',result.reason,'治理',{ticket:m.ticket,afterReply:ticketReplies(m)[0]?.id});return {...result,blocked:true}}
function notify(subject,kind){S.notifications.unshift({id:'N-'+Date.now(),tenant:ctx.tenant,subject,status:'sent',kind,time:stamp(),reason:''});save()}
function allowed(id,role=ctx.role){if(!byId[id])return false;if(id==='complaintDetail')return ['platform','admin','supervisor','agent'].includes(role);if(/^(ticket|quality)/.test(id))return ['admin','agent','supervisor'].includes(role);if(id==='recipientDetail'||id==='recipientList')return ['admin','agent','supervisor'].includes(role);if(id==='feedbackDetail')return ['admin','supervisor'].includes(role);const r=byId[id].role.replace(/商家/g,'租户');if(r==='收件人')return role==='recipient';if(r.includes('平台')&&r.includes('租户'))return ['platform','admin'].includes(role);if(r==='平台管理员')return role==='platform';if(r==='租户管理员')return role==='admin';if(r.includes('主管'))return ['admin','supervisor'].includes(role);if(r.includes('客服'))return ['admin','agent','supervisor'].includes(role);return false}
function defaultRole(id){if(/^(ticket|quality)/.test(id))return 'agent';if(byId[id].role==='收件人')return 'recipient';if(byId[id].role.includes('平台'))return 'platform';if(byId[id].role.includes('主管'))return 'supervisor';return 'admin'}
function gate(t,r,purpose='service',m=null){if(m?.status==='unknown')return {ok:false,reason:'发送结果未知，请先核查原发送尝试',code:'unknown'};if(!r)return {ok:false,reason:'未能识别收件人，需核实发送范围'};const block=blacklist.find(blacklist.load(t.id),r.email);if(block)return {ok:false,reason:'邮箱已加入黑名单：'+block.reason,code:'blacklist'};if(r.stop)return {ok:false,reason:'收件人已停止该商家的全部邮件联系',code:'stop'};if(r.complaint)return {ok:false,reason:'该收件人存在已知投诉抑制',code:'complaint'};if(r.bounce)return {ok:false,reason:'该地址永久退信，需先核实地址有效性',code:'bounce'};if(r.optional&&purpose!=='service')return {ok:false,reason:purpose==='unknown'?'业务用途未确认，不能按必要服务放行':'收件人已退出可选邮件',code:'optional'};if((t.route==='OWN'||t.ownOnly)&&t.auth==='connected')return {ok:true,provider:t.provider};if(t.route==='SES'&&t.ses==='active'&&!t.ownOnly)return {ok:true,provider:'SES'};return {ok:false,reason:t.ownOnly?'仅使用自有邮箱，但当前自有邮箱不可用':t.ses==='active'?'无可用发送通道':'平台 SES 未开放或受限，且无可用自有通道',code:'channel'}}
function recipientStatus(r){return r.stop?badge('停止全部联系','red'):r.complaint?badge('投诉抑制','red'):r.bounce?badge('永久退信','red'):r.optional?badge('已退出可选邮件','amber'):badge('可联系','green')}
function progress(h){return `<div class="ses-timeline">${(h||[]).map(x=>`<div>${esc(x.text)}<small>${esc(x.time)}</small></div>`).join('')}</div>`}
function stats(t){const tips={'SES 有效发送尝试':'近7日按实际SES发送批次统计；排除自有通道、发送前阻断及重复回执。','SES 投诉数':'按消息、收件人与事件类型去重的可信SES Complaint；不含服务反馈。','观测投诉比例':'同批次去重Complaint ÷ 有效SES发送尝试 × 100%；缺失时不计算。当前为合成汇总，回执列表仅展示部分样例。','硬退信':'实际SES发送尝试关联的永久退信；不含SMTP授权失败。'};return `<div class="ses-stats">${[['SES 有效发送尝试',t.complete?t.attempts.toLocaleString():'—','近7日 · 合成数据'],['SES 投诉数',t.complete?String(t.complaints):'—','不含服务反馈'],['观测投诉比例',t.complete&&t.attempts?(t.complaints/t.attempts*100).toFixed(2)+'%':'不可计算','内部同批次口径'],['硬退信',t.complete?String(t.bounces):'—','不含自有通道失败']].map(([a,b,c])=>`<div class="ses-stat"><span>${a}<span class="metric-help" tabindex="0" aria-label="计算口径">!<span role="tooltip">${tips[a]}</span></span></span><strong>${b}</strong><small>${c}</small></div>`).join('')}</div>`}
function routeData(id,data={}){mailbox.beforeRoute(id,data);if(id==='complaintFormEdit'){ctx.complaintFormId=data.form||'';ctx.complaintFormOrigin=data.origin==='config'?'config':'list';ctx.form=ctx.complaintFormId;ctx.origin=ctx.complaintFormOrigin;}if(data.message==='latest-complaint-ticket'){const x=S.complaints.find(x=>x.tenant===(data.tenant||ctx.tenant)&&x.ticket==='DEMO-420');data={...data,message:x?.message||'MSG-420'};}if(id==='complaintHandle')ctx.mode=data.mode==='progress'?'progress':'close';if(data.message==='latest-complaint-demo'){data={...data,message:S.messages.filter(x=>x.tenant===(data.tenant||ctx.tenant)&&x.ticket==='DEMO-420'&&x.status==='sent').at(0)?.id};const sent=S.messages.find(x=>x.id===data.message);if(sent?.id==='MSG-419')data.message='MSG-420';}if(data.notification){const n=S.notifications.find(x=>x.id===data.notification);if(n)ctx.tenant=n.tenant}if(data.audit){const a=S.audits.find(x=>x.id===data.audit);if(a)ctx.tenant=a.tenant}Object.entries(data).forEach(([k,v])=>{if(['tenant','recipient','message','feedback','event','notification','audit'].includes(k))ctx[k]=v});if(data.recipient&&!data.message){const linked=S.messages.find(x=>x.tenant===ctx.tenant&&x.recipient===data.recipient);if(linked)ctx.message=linked.id}if(data.message){const m=S.messages.find(x=>x.id===data.message);if(m&&(!id.startsWith('complaint')||m.tenant===ctx.tenant)){ctx.tenant=m.tenant;ctx.recipient=m.recipient}}if(data.feedback){const f=S.feedbacks.find(x=>x.id===data.feedback);if(f){ctx.tenant=f.tenant;ctx.recipient=f.recipient;ctx.message=f.message}}if(data.event){const e=S.events.find(x=>x.id===data.event);if(e?.tenant){ctx.tenant=e.tenant;if(e.recipient)ctx.recipient=e.recipient}}if(data.tenant&&!data.message&&!data.feedback&&!data.recipient&&!data.event&&!data.notification&&!data.audit){ctx.recipient=S.recipients.find(x=>x.tenant===ctx.tenant)?.id;ctx.message=S.messages.find(x=>x.tenant===ctx.tenant)?.id;ctx.feedback=S.feedbacks.find(x=>x.tenant===ctx.tenant)?.id}if(!data.message&&id==='ticketFailed')ctx.message=S.messages.find(x=>x.tenant===ctx.tenant&&x.status==='failed')?.id||ctx.message;if(!data.message&&id==='ticketUnknown')ctx.message=S.messages.find(x=>x.tenant===ctx.tenant&&x.status==='unknown')?.id||ctx.message;if(!data.message&&!data.recipient&&id==='ticketBlocked')ctx.message=S.messages.find(x=>x.tenant===ctx.tenant&&x.status==='queued'&&!gate(tenant(),S.recipients.find(r=>r.id===x.recipient),x.purpose,x).ok)?.id||ctx.message;if(/^ticket/.test(id)){const m=message();if(m)ctx.recipient=m.recipient}if(['complaintDetail','complaintHandle','complaintBlacklist'].includes(id))ctx.complaint=data.complaint==='latest'||!data.complaint?(complaintRows().find(x=>x.id===ctx.complaint)?.id&&data.complaint!=='latest'?ctx.complaint:complaintRows()[0]?.id||''):data.complaint;if(id.startsWith('complaint')&&publicRoutes.has(id)&&data.recipient)ctx.recipient=data.recipient;}
window.go=function(id,data={},replace=false){if(!byId[id])return toast('页面不存在');if(!allowed(id))return toast('当前角色无权访问该页面');routeData(id,data);current=id;ctx.page=id;const qs=new URLSearchParams({tenant:ctx.tenant,role:ctx.role,journey:currentJourney(),...Object.fromEntries(contextKeys(id).filter(k=>ctx[k]).map(k=>[k,ctx[k]]))});const hash='#'+id+'?'+qs;history[replace?'replaceState':'pushState'](null,'',hash);render();};
function contextKeys(id){if(id==='complaintFormEdit')return ['form','origin'];if(mailbox.routes.has(id))return ['mailbox','mailMode'];if(id==='complaintDetail')return ['complaint','message'];if(id==='complaintHandle')return ['complaint','mode'];if(id==='complaintBlacklist')return ['complaint'];if(id.startsWith('providerEvent'))return ['event'];if(id==='notificationDetail')return ['notification'];if(id==='auditDetail')return ['audit'];if(['feedbackDetail','feedbackHandle','feedbackEscalate'].includes(id))return ['feedback'];if(id==='recipientDetail')return ['recipient'];if(/^(ticket|quality)/.test(id)||id==='pendingDetail'||publicRoutes.has(id))return ['message','recipient'];return []}
function reviewGo(id){ctx.role=defaultRole(id);const data={};if(id==='ticketReady'||id.startsWith('quality')||publicRoutes.has(id)){const sent=S.messages.find(m=>m.tenant===ctx.tenant&&m.status==='sent');if(sent)data.message=sent.id}window.go(id,data)}
const ticketRoutes=new Set(['ticketReady','ticketBlocked','ticketFailed','ticketUnknown','qualityMissing','qualityEscalation','qualityThanks','qualitySurvey']);
const publicRoutes=new Set(['complaintConfirm','complaintResult','complaintUnknown','complaintExpired','emailPreview','feedbackEdit','feedbackSuccess','feedbackUnknown','feedbackExpired','preferenceEdit','preferenceVerify','preferenceStopConfirm','preferenceResult']);

function tenantPage(id){
 const t=tenant(),tab={tenantDetail:'overview',riskOverview:'overview',providerEvents:'receipts',notifications:'notifications',auditList:'history',migrationDetail:'overview'}[id];
 const tabs=[['tenantDetail','发送资格与指标','overview'],['providerEvents','投诉 / 退信回执','receipts'],['notifications','通知结果','notifications'],['auditList','操作记录','history']];
 const title=head(t.name,'平台管理 / 租户治理',navLink('返回租户列表','platformTenants',{},'')+(t.application==='pending'?navLink('审核申请','applicationReview',{},'primary'):t.ses==='off'?navLink('开通 SES','applicationReview',{},'primary'):'')+(t.ses==='active'?navLink('限制资格','restrictionEdit',{},''):'')+(t.remediation==='pending'?navLink('审核恢复','restorationReview',{},'primary'):t.ses==='restricted'?navLink('解除限制','restorationReview',{},'primary'):''));
 const nav='<nav class="ses-detail-tabs" aria-label="租户详情内容">'+tabs.map(([route,label,key])=>navLink(label,route,{},key===tab?'primary':'')).join('')+'</nav>';
 let content='';
 if(tab==='overview')content=stats(t)+(!t.complete?banner('投诉率暂不可计算：发送批次或回执归属缺失','info',navLink('查看统计缺口','riskIncomplete')):'')+'<div class="ses-grid">'+panel('发送资格',kv([['租户ID',esc(t.id)],['SES 状态',sesBadge(t.ses)],['申请状态',applicationBadge(t.application)],['停用原因',esc(sesStopReason(t))],['整改进度',remediationBadge(t.remediation)],['邮件内投诉',complaintRequired(t)?badge('已开启 · SES 必开','green'):complaintEnabled(t)?badge('已开启','green'):badge('未开启')]]),navLink('配置邮件内投诉','complaintConfig'))+panel('邮箱接入状态',kv([['发件邮箱',esc(t.from)],['自有通道',esc(t.provider)],['授权状态',authBadge(t.auth)],['存量接入分组',t.group==='ready'?'自有通道已就绪':t.group==='urgent'?'优先整改':'待接入验证'],['历史积压','恢复后逐项核对']]))+'</div>'+panel('投诉统计',kv([['数据来源','平台SES发送尝试 + SES投诉回执'],['窗口','近7日，按原发送批次关联'],['计数范围','仅当前租户；服务反馈不算SES投诉'],['自动处罚','未启用；规则等待评审']]),navLink('候选规则回放','riskReplay'));
 if(tab==='receipts'){const ev=S.events.filter(x=>x.tenant===t.id);content='<div class="ses-actions" style="margin-bottom:12px">'+navLink('客户提交','complaintPlatform',{},'')+'</div>'+table(['回执ID','类型','收件人','接收时间','计数处理','操作'],ev.map(e=>[esc(e.id),badge(e.type==='Complaint'?'垃圾邮件投诉':'永久退信',e.type==='Complaint'?'red':'amber'),esc(S.recipients.find(x=>x.id===e.recipient)?.email),esc(e.received),e.duplicate?'重复，不新增计数':e.late?'晚到，计入原发送批次':'关联发送尝试',navLink('查看回执','providerEventDetail',{event:e.id})]));}
 if(tab==='notifications')content=table(['变更通知','时间','提交状态','操作'],S.notifications.filter(x=>x.tenant===t.id).map(n=>[esc(n.subject),esc(n.time),stateBadge(n.status),navLink('查看结果','notificationDetail',{notification:n.id})]));
 if(tab==='history')content=auditRows(S.audits.filter(x=>x.tenant===t.id));
 return title+banner('SES 状态：'+sesStatus(t.ses),t.ses==='active'?'success':'')+nav+content;
}

function body(id){const t=tenant(),r=recip(),m=message(),f=caseItem();
 if(id.startsWith('complaint'))return complaintPage(id,t);
 if(ctx.role==='platform'&&['tenantDetail','riskOverview','providerEvents','notifications','auditList','migrationDetail'].includes(id))return tenantPage(id);
 if(id==='migrationList')return body('platformTenants');
 if(ticketRoutes.has(id))return `<div class="ticket-preview"><div class="ticket-preview-status" role="status"><span>正在加载工单…</span><button type="button" hidden>重试</button></div><iframe class="ticket-frame" title="工单与邮件回复" src="ticket-base.html?view=${id}"></iframe></div>`;
 switch(id){
 case'platformTenants':return head('租户治理','平台管理 / 租户',navLink('未归属回执核查','providerUnassigned',{},''))+`<div class="ses-toolbar"><div class="filters"><input data-filter-input placeholder="搜索租户名称或ID" value="${esc(filteredText)}"><select data-filter-status aria-label="SES 状态筛选"><option value="">全部 SES 状态</option>${['enabled','disabled'].map(v=>`<option ${filteredStatus===v?'selected':''} value="${v}">${v==='enabled'?'启用':'停用'}</option>`).join('')}</select></div></div>`+table(['租户','SES 状态','申请 / 整改','实际通道','自有邮箱','存量接入状态','近7日投诉','操作'],S.tenants.filter(x=>(!filteredText||(x.name+x.id).toLowerCase().includes(filteredText.toLowerCase()))&&(!filteredStatus||sesEnabled(x.ses)===(filteredStatus==='enabled'))).map(x=>[esc(x.name)+`<div class="ses-small">${x.id}</div>`,sesBadge(x.ses),applicationBadge(x.application)+(x.remediation==='pending'?'<div class="ses-small">整改待审核</div>':''),esc(x.route==='SES'?'SES':x.provider),authBadge(x.auth),x.group==='ready'?'自有通道已就绪':x.group==='urgent'?'优先整改':'待接入验证',x.complete?String(x.complaints):'—',navLink('查看','tenantDetail',{tenant:x.id})]));
 case'tenantDetail':case'riskOverview':case'migrationDetail':return tenantPage(id);
 case'applicationReview':if(t.ses==='off'&&t.application!=='pending')return head('开通平台 SES',t.name)+form('enableSes',kv([['租户',esc(t.name)],['SES 状态',sesBadge(t.ses)],['邮件内投诉','开通后自动开启']])+field('开通依据','reason','','textarea',true),'tenantDetail','确认开通');if(t.application!=='pending')return head('SES资格申请',t.name,navLink('返回租户详情','tenantDetail',{},''))+panel('申请状态',kv([['当前申请',applicationBadge(t.application)],['SES 状态',sesBadge(t.ses)],['申请说明',t.application==='none'?'商家尚未提交申请':t.application==='approved'?'申请已审核通过':'没有待审核申请']])+(t.applicationData?kv([['用途',esc(t.applicationData.purpose)],['收件人来源',esc(t.applicationData.source)]]):''));return head('审核 SES 资格申请',t.name)+form('applicationReview',kv([['当前申请',applicationBadge(t.application)],['用途',esc(t.applicationData?.purpose||'尚未提交')],['发件身份',esc(t.applicationData?.identity||t.from)],['预计发送量',esc(t.applicationData?.volume||'—')],['收件人来源',esc(t.applicationData?.source||'—')]])+selectField('审核结果','decision',[['approved','批准'],['rejected','拒绝']],'approved')+field('审核说明','reason','','textarea',true),'tenantDetail','提交审核');
 case'restrictionEdit':if(t.ses==='off')return head('平台SES资格',t.name,navLink('返回租户详情','tenantDetail',{},''))+panel('未开放资格',kv([['SES 状态',sesBadge(t.ses)],['可执行操作','当前没有可收回的SES发送资格']]));return head('限制平台 SES 资格',t.name)+form('restrict',kv([['SES 状态',sesBadge(t.ses)],['限制范围','平台 SES 全部发送入口；在途请求单列']])+field('限制原因与整改要求','reason',t.reason,'textarea',true),'tenantDetail','确认限制');
 case'restorationReview':if(t.ses==='restricted'&&t.remediation!=='pending')return head('解除 SES 限制',t.name)+form('liftSes',kv([['租户',esc(t.name)],['SES 状态',sesBadge(t.ses)],['限制原因',esc(t.reason||'—')]])+field('解除依据','reason','','textarea',true),'tenantDetail','确认解除限制');if(t.remediation!=='pending')return head('恢复资格审核',t.name,navLink('返回租户详情','tenantDetail',{},''))+panel('整改状态',kv([['SES 状态',sesBadge(t.ses)],['整改提交',remediationBadge(t.remediation)],['审核前置','商家先提交整改说明与通道证据，再由平台审核']]));return head('审核恢复资格',t.name)+form('restore',kv([['SES 状态',sesBadge(t.ses)],['商家整改',esc(t.remediationData?.reason||'尚未提交')],['自有通道证据',esc(t.remediationData?.evidence||'—')]])+selectField('审核结果','decision',[['active','批准恢复'],['restricted','保持限制']],'restricted')+field('审核依据','reason','','textarea',true),'tenantDetail','提交审核');
 case'mailIntegration':case'mailList':case'mailHealth':case'mailSettings':case'mailVerify':case'migrationValidation':{
 const governance='<section class="mb-governance"><h2>平台 SES</h2>'+banner('SES 状态：'+sesStatus(t.ses),t.ses==='active'?'info':'',navLink('查看受影响邮件','pendingList')+(t.ses==='off'?navLink(t.application==='pending'?'查看申请':'申请 SES','applicationEdit',{},''):'')+remediationLink())+(!sesEnabled(t.ses)?kv([['停用原因',esc(sesStopReason(t))],...(t.remediation!=='none'?[['整改进度',remediationBadge(t.remediation)]]:[])]):'')+'</section>';
 return mailbox.render(id,governance);
 }
 case'applicationEdit':if(t.application==='pending'||t.ses!=='off')return head('平台SES申请',t.name,navLink('返回邮箱详情','mailHealth',{},''))+panel('申请进度',kv([['申请状态',applicationBadge(t.application)],['SES 状态',sesBadge(t.ses)],['邮件用途',esc(t.applicationData?.purpose||'—')],['发件身份',esc(t.applicationData?.identity||t.from)],['预计发送量',esc(t.applicationData?.volume||'—')],['收件人来源',esc(t.applicationData?.source||'—')]])+banner(t.application==='pending'?'申请已提交，等待平台审核':'当前资格无需重复申请','info'));return head('申请平台 SES 资格','集成 / 邮箱')+form('apply',field('邮件用途','purpose',t.applicationData?.purpose||'必要售后服务','textarea',true)+field('发件身份','identity',t.from,'email',true)+field('预计发送量','volume',t.applicationData?.volume||'','text',true)+field('收件人来源','source',t.applicationData?.source||'','textarea',true),'mailHealth','提交申请');
 case'remediationEdit':if(t.remediation==='pending'||!['restricted','review'].includes(t.ses))return head('整改与复核',t.name,navLink('返回邮箱详情','mailHealth',{},''))+panel('整改进度',kv([['SES 状态',sesBadge(t.ses)],['整改状态',remediationBadge(t.remediation)],['整改说明',esc(t.remediationData?.reason||'—')],['通道证据',esc(t.remediationData?.evidence||'—')]])+banner(t.remediation==='pending'?'整改已提交，等待平台复核':'当前没有需要提交的限制整改','info'));return head('提交整改与复核','集成 / 邮箱')+form('remediation',field('整改说明','reason',t.remediationData?.reason||'','textarea',true)+field('通道验证及整改证据','evidence',t.remediationData?.evidence||'','textarea',true),'mailHealth','提交复核');
 case'pendingList':return head('受影响邮件','邮箱 / 待处理邮件',(ctx.role==='admin'?navLink('返回邮箱详情','mailHealth',{},''):'')+navLink('历史邮件核对','queueReview',{},'')+remediationLink('primary'))+messageRows(S.messages.filter(x=>x.tenant===t.id&&!['sent','cancelled'].includes(x.status)));
 case'pendingDetail':{
  const title=head('发送详情',m?.subject||'',navLink('返回列表','pendingList',{},''));
  if(!m)return title+empty();
  const next=messageNext(m),attempt=hasSendAttempt(m),ticket=m.status==='unknown'?'ticketUnknown':m.status==='failed'?'ticketFailed':m.status==='queued'?'ticketBlocked':'ticketReady';
  return title+panel('邮件发送记录',kv([['工单',esc(m.ticket)],['业务消息',esc(m.id)],['收件人',esc(S.recipients.find(x=>x.id===m.recipient)?.email)],['发送状态',messageSendBadge(m)],['原因',esc(messageReason(m))],['实际通道',esc(attempt?(m.provider||'—'):'—')],['业务用途',m.purpose==='service'?'必要售后':m.purpose==='optional'?'可选邮件':'待核实'],['发送时间',esc(attempt?(m.date||'—'):'—')],...(next?[['下一步',esc(next.hint)]]:[])])+`<div class="ses-footer">${next?.page&&next.page!==ticket?navLink('查看关联工单',ticket,{message:m.id},''):''}${next?.page?navLink(next.label,next.page,next.data,'primary'):navLink('查看关联工单',ticket,{message:m.id},'')}</div>`);
 }
 case'recipientList':return head('联系人','联系人 / 邮件联系状态')+table(['联系人 / 邮箱','联系状态','限制来源','操作'],S.recipients.filter(x=>x.tenant===t.id).map(x=>[`<b>${esc(x.name)}</b><div class="ses-small">${esc(x.email)}</div>`,recipientStatus(x),x.complaint?'SES Complaint':x.bounce?'永久退信':x.stop?'收件人联系偏好':x.optional?'可选邮件退订':'—',navLink('详情','recipientDetail',{recipient:x.id})]));
 case'recipientDetail':return head(r?.name||'联系人','联系人 / 详情',navLink('返回列表','recipientList',{},''))+panel('邮件联系状态',kv([['邮箱',esc(r?.email)],['所属商家',esc(t.name)],['全部邮件联系',r?.stop?badge('停止','red'):badge('未停止','green')],['可选邮件',r?.optional?badge('已退出','amber'):badge('未退出')],['供应商投诉',r?.complaint?badge('有效抑制','red'):'无'],['永久退信',r?.bounce?badge('有效抑制','red'):'无']])+`<div class="ses-footer">${navLink('查看关联工单',(r?.stop||r?.complaint||r?.bounce)?'ticketBlocked':'ticketReady',{recipient:r?.id},'')}${action('提交联系状态复核','requestContactReview',{},'primary')}</div>`);
  case'providerEvents':case'providerUnassigned':{const ev=S.events.filter(x=>id==='providerUnassigned'?!x.tenant:!ctx.onlyTenant||x.tenant===t.id);return head(id==='providerUnassigned'?'未归属发送回执':'发送回执记录','平台管理 / 租户治理',id==='providerEvents'?navLink('未归属核查','providerUnassigned',{},''):navLink('全部回执','providerEvents',{},''))+table(['回执','类型','租户 / 收件人','回执时间','归属 / 去重','操作'],ev.map(x=>[esc(x.id),badge(x.type,x.type==='Complaint'?'red':'amber'),x.tenant?esc(S.tenants.find(a=>a.id===x.tenant)?.name)+'<div class="ses-small">'+esc(S.recipients.find(a=>a.id===x.recipient)?.email)+'</div>':'未归属',esc(x.received),x.duplicate?badge('重复，不新增计数'):x.late?badge('晚到，归原批次','blue'):x.tenant?badge('已归属','green'):badge('待核查','amber'),navLink('查看','providerEventDetail',{event:x.id})]));}
  case'providerEventDetail':{const e=S.events.find(x=>x.id===ctx.event)||S.events[0];return head('发送回执详情',e.id,navLink('返回租户详情','tenantDetail',{tenant:e.tenant||ctx.tenant},''))+panel('回执归属',kv([['来源','SES webhook 回执入口'],['样本状态','原型合成回执'],['回执类型',esc(e.type)],['消息ID',esc(e.message)],['目标收件人',esc(S.recipients.find(x=>x.id===e.recipient)?.email||'无法定位')],['租户',esc(S.tenants.find(x=>x.id===e.tenant)?.name||'未归属')],['发送时间',esc(e.sent)],['回执时间',esc(e.received)],['去重',e.duplicate?'重复，不新增计数':'首个可信回执'],['晚到处理',e.late?'归属原发送批次，不移入当天分母':'按原发送尝试关联']]),e.tenant?navLink('租户详情','tenantDetail',{tenant:e.tenant}):'');}
 case'feedbackList':return head('服务反馈','工单 / 服务反馈')+table(['反馈','问题','联系人','负责人','状态','操作'],S.feedbacks.filter(x=>x.tenant===t.id).map(x=>[esc(x.id),esc(x.type),esc(S.recipients.find(a=>a.id===x.recipient)?.name),esc(x.assignee==='SUP-B'?'主管 B':x.assignee==='ADMIN-C'?'租户管理员':'待分派'),stateBadge(x.status),navLink('查看','feedbackDetail',{feedback:x.id})]));
 case'feedbackDetail':return head('反馈详情',f?.id||'',navLink('返回列表','feedbackList',{},''))+(!f?empty('暂无服务反馈'):banner('反馈状态：'+(titles[f.status]||f.status),'info',navLink('处理反馈','feedbackHandle',{},'primary')+navLink('升级处理','feedbackEscalate',{},''))+`<div class="ses-grid">`+panel(esc(f.type),`<div class="ses-quote">${esc(f.note||'未填写说明')}</div>`+kv([['反馈方面',esc(f.aspect)],['关联邮件',esc(f.message)],['负责人',esc(f.assignee==='SUP-B'?'主管 B':f.assignee==='ADMIN-C'?'租户管理员':'待分派')],['联系状态',recipientStatus(S.recipients.find(x=>x.id===f.recipient))]])+`<div class="ses-footer">${navLink('原工单',gate(t,S.recipients.find(x=>x.id===f.recipient)).ok?'ticketReady':'ticketBlocked',{message:f.message},'')}${navLink('联系状态','recipientDetail',{recipient:f.recipient},'')}</div>`)+panel('处理记录',progress(f.history))+`</div>`);
 case'feedbackHandle':return head('内部处理反馈',f?.id||'')+(!f?empty():form('handleFeedback',kv([['收件人联系状态',recipientStatus(S.recipients.find(x=>x.id===f.recipient))]])+selectField('处理结果','status',[['processing','处理中'],['resolved','已解决'],['none','无需处理']],'processing')+field('内部处理说明 / 结论','note','','textarea',true),'feedbackDetail','记录处理结果'));
 case'feedbackEscalate':return head('升级反馈',f?.id||'')+(!f?empty():form('escalateFeedback',selectField('处理负责人','assignee',[['SUP-B','主管 B'],['ADMIN-C','租户管理员'],['','待分派']],f.target==='SUP-B'?'ADMIN-C':'SUP-B')+field('升级说明','note','','textarea',true),'feedbackDetail','提交升级'));

 case'riskReplay':return head('候选阈值影子回放','邮件治理 / 风险规则')+form('replay',banner('影子回放结果不改变租户发送资格','info')+`<div class="form-row">${field('近7日有效发送尝试 D','volume',S.replay?.volume??10000,'number',true)}${field('去重投诉 C','complaints',S.replay?.complaints??5,'number',true)}</div><label class="ses-choice"><input type="checkbox" name="complete" ${S.replay?.complete===false?'':'checked'}>同批次分母与事件完整</label>`+kv([['候选条件','D ≥ 1000 且 C ≥ 5 且 C / D ≥ 0.05%'],['SES 状态',sesBadge(t.ses)]])+(S.replay?banner(S.replay.result,S.replay.complete?'info':''):`<div class="ses-small">尚未执行回放</div>`),'riskOverview','执行回放');
  case'riskIncomplete':return head('回执统计缺口','平台管理 / 租户详情',navLink('返回租户详情','tenantDetail',{},''))+panel('这是什么意思',kv([['可计算条件','发送尝试分母、回执归属、事件去重均齐全'],['当前状态',t.complete?badge('当前样本可计算','green'):badge('缺少数据，暂不计算','amber')],['有效分母',t.complete?String(t.attempts):'不可计算'],['未归属回执',String(S.events.filter(x=>!x.tenant).length)+' 起待核查'],['处理结果',t.complete?'仅供观察与影子回放':'不把缺口当成零投诉、不自动恢复']]))+table(['缺口','处理方向'],[['未归属回执',navLink('查看待核查回执','providerUnassigned')],['AWS账户健康','当前没有官方数据接入，不展示该指标']] );
  case'migrationList':return head('待迁移租户','平台管理 / 租户治理')+table(['租户','迁移状态','SES资格','自有通道','操作'],S.tenants.map(x=>[esc(x.name),esc(x.group==='ready'?'自有通道已就绪':x.group==='urgent'?'需紧急限制':'尚未就绪'),sesBadge(x.ses),authBadge(x.auth),navLink('查看租户详情','tenantDetail',{tenant:x.id})]));

 case'queueReview':return head('历史邮件核对','受影响邮件 / 逐项处理',navLink('返回列表','pendingList',{},''))+table(['邮件 / 工单','用途 / 时效','联系状态','结果','操作'],S.messages.filter(x=>x.tenant===t.id&&x.status==='queued').map(x=>[esc(x.subject)+'<div class="ses-small">'+x.ticket+'</div>',x.expired?badge('已过期','amber'):x.purpose==='optional'?'可选邮件':'必要售后',recipientStatus(S.recipients.find(a=>a.id===x.recipient)),esc(x.reason),x.expired?action('取消过期邮件','cancelMessage',{message:x.id},'link'):navLink('核对内容','pendingDetail',{message:x.id})]));
  case'notifications':return head('通知状态','平台管理 / 租户治理')+table(['通知','租户','时间','结果','操作'],S.notifications.filter(x=>x.tenant===t.id).map(x=>[esc(x.subject),esc(S.tenants.find(a=>a.id===x.tenant)?.name),esc(x.time),stateBadge(x.status),navLink('查看','notificationDetail',{notification:x.id})]));
 case'notificationDetail':{const n=S.notifications.find(x=>x.id===ctx.notification)||S.notifications[0];return head('资格变更通知结果',n.id,navLink('返回通知','notifications',{},''))+panel(esc(n.subject),kv([['所属商家',esc(S.tenants.find(x=>x.id===n.tenant)?.name)],['复用入口','现有系统公告展示入口'],['定向能力','本次拟补租户管理员接收范围；尚未接入'],['结果',stateBadge(n.status)],['原因',esc(n.reason||'—')],['时间',esc(n.time)]])+`<div class="ses-footer">${ctx.role==='platform'?navLink('资格详情','tenantDetail',{tenant:n.tenant},''):navLink('邮箱详情','mailHealth',{},'')}${n.status==='failed'?action('重试资格变更通知','retryNotification',{notification:n.id},'primary'):''}</div>`);}
 case'auditList':return head('操作记录','操作与通知 / 审计')+auditRows(S.audits.filter(x=>x.tenant===t.id));
 case'auditDetail':{const a=S.audits.find(x=>x.id===ctx.audit);return head('操作详情',a?.id||'',navLink('返回记录','auditList',{},''))+(a?panel('变更记录',kv([['操作',esc(a.action)],['分类',esc(a.kind)],['操作人ID',esc(a.actor)],['角色',esc(a.role)],['租户',esc(a.tenant)],['变更前',esc(a.before)],['变更后',esc(a.after)],['时间',esc(a.time)]])):empty('暂无操作记录'));}
 case'emailPreview':return publicBox(t.name,`<div class="mail-copy"><h1>${esc(m?.complaintDemo?m.subject:'关于您的订单问题')}</h1><p style="margin-top:25px">${esc(m?.complaintDemo?m.body:'您好，我们已收到您提供的信息，正在由售后负责人确认后续处理方式。')}</p><p>如有新的补充信息，可以继续回复本邮件。</p></div><div class="email-signature">${esc(t.name)} Support<br>${esc(t.from)}</div><div class="email-footer">${navLink('邮件偏好','preferenceEdit')}${sentComplaintMail()?navLink('投诉这封邮件','complaintConfirm'):''}</div>`,'public-email');
 case'feedbackEdit':return publicBox(t.name,navLink('返回邮件','emailPreview',{},'link public-back')+`<h1>反馈本次服务</h1><p class="ses-meta">您的反馈将交给这家商家的负责人处理。</p><form data-form="feedback">${['问题未解决','回复重复或没有帮助','服务态度','不是我发起的咨询','其他服务问题'].map((v,i)=>`<label class="ses-choice"><input type="radio" name="type" value="${v}" ${publicDraft.type===v||(!publicDraft.type&&i===1)?'checked':''}>${v}</label>`).join('')}${selectField('您想反馈的方面','aspect',[['本次服务','本次服务'],['邮件联系','邮件联系']],publicDraft.aspect||'本次服务')}${field('补充说明（可选）','note',publicDraft.note||'','textarea')}<label class="ses-choice"><input type="checkbox" name="continue" ${publicDraft.continue?'checked':''}>希望负责人继续跟进本次问题</label><label class="ses-choice"><input type="checkbox" name="report" ${publicDraft.report?'checked':''}>同时向 Shulex 报告不希望的联系或持续骚扰</label><p class="ses-form-error" role="alert" hidden></p><button class="primary public-submit" type="submit">提交反馈</button></form>`);
 case'feedbackSuccess':return publicBox(t.name,result('✓','反馈已受理','商家负责人可以查看并处理您的反馈。',navLink('邮件偏好','preferenceEdit',{},'primary')+navLink('返回邮件','emailPreview',{},'')));
 case'feedbackUnknown':return publicBox(t.name,result('…','正在确认提交结果','请先查询这次提交的结果，避免重复提交。',action('查询提交结果','queryFeedback',{},'primary')));
 case'feedbackExpired':return publicBox(t.name,result('⌁','链接已失效','请从有效的原邮件进入。',navLink('返回邮件','emailPreview',{},'')));
 case'preferenceEdit':{const value=r?.stop?'stop':r?.optional?'optional':'keep';return publicBox(t.name,navLink('返回邮件','emailPreview',{},'link public-back')+`<h1>邮件偏好</h1><p class="ses-meta">仅管理您与 ${esc(t.name)} 的邮件联系。</p><form data-form="preference">${[['keep','保持当前联系设置'],['optional','保留必要售后，不接收可选邮件'],['stop','停止这家商家的全部邮件联系']].map(([v,l])=>`<label class="ses-choice"><input type="radio" name="preference" value="${v}" ${value===v?'checked':''}>${l}</label>`).join('')}<p class="ses-form-error" role="alert" hidden></p><button class="primary public-submit" type="submit">继续</button></form>`);}
 case'preferenceVerify':return publicBox(t.name,result('◎','确认邮件操作范围','验证原收件人与这家商家的联系范围后继续。',action('验证并继续','verifyPreference',{},'primary')+navLink('返回选择','preferenceEdit',{},'')));
 case'preferenceStopConfirm':return publicBox(t.name,`<h1>停止全部邮件联系？</h1><p class="ses-meta">确认后，${esc(t.name)} 将不能再通过本平台向您发送邮件，包括必要售后回复。</p><div class="ses-footer">${navLink('返回修改','preferenceEdit',{},'')}${action('确认停止','savePreference',{preference:'stop'},'danger-fill')}</div>`);
 case'preferenceResult':return publicBox(t.name,result('✓','联系偏好已保存',r?.stop?'已停止这家商家的全部邮件联系。':r?.optional?'已退出可选邮件，必要售后联系保留。':'您的当前联系设置已保留。',navLink('返回邮件','emailPreview',{},'primary')+navLink('查看邮件偏好','preferenceEdit',{},'')));
 default:return empty();
 }
}
function publicBox(name,body,klass=''){return `<div class="public-wrap ${klass}"><div class="public-brand">${esc(name)}</div>${body}</div>`}
const complaintHeading=f=>'<h1>'+esc(f.title)+'</h1>'+(f.description?'<p class="ses-meta">'+esc(f.description)+'</p>':'');
const complaintReason=f=>field('投诉原因（'+(f.required?'必填':'选填')+'）','reason','','textarea',f.required);
const complaintPreviewPane=()=>'<section class="complaint-preview-pane" data-complaint-preview-pane aria-label="预览" hidden></section>';
function complaintEmailPreview(enabled){
 const t=tenant();
 const mail=`<div class="mail-copy"><h1>售后问题处理进度</h1><p>您好，您的售后问题已交由负责人跟进。如有新情况，可以直接回复这封邮件。</p></div><div class="email-signature">${esc(t.name)} Support<br>${esc(t.from)}</div><div class="email-footer"><span class="link">邮件偏好</span>${enabled?'<span class="link">投诉这封邮件</span>':''}</div>`;
 return '<div class="ses-actions complaint-preview-head"><strong>邮件页脚预览</strong>'+(!enabled?badge('投诉入口未开启'):'')+action('关闭预览','closeComplaintPreview',{},'link')+'</div>'+publicBox(t.name,mail,'public-email');
}
function complaintFormValue(d){
 return {name:String(d.name||'').trim(),title:String(d.title||'').trim(),description:String(d.description||'').trim(),required:d.requireReason==='required'};
}
function complaintConfigValue(el){
 const d=Object.fromEntries(new FormData(el));
 return {enabled:complaintRequired(tenant())||!!d.enabled,formId:d.complaintForm};
}
function openComplaintForms(id,el,data={},previous){
 const draft=complaintConfigValue(el);
 if(previous)draft.formId=previous;
 complaintDrafts.set(ctx.tenant,draft);
 window.go(id,data);
}
const complaintIcons={edit:'<path d="m13.5 4.5 2 2M4 12l-.8 4.8L8 16l8.3-8.3a1.4 1.4 0 0 0 0-2l-2-2a1.4 1.4 0 0 0-2 0L4 12Z"/>',delete:'<path d="M3.5 5.5h13M8 5.5V3h4v2.5M5.5 5.5l1 11h7l1-11M9 8.5v5m2-5v5"/>'};
function complaintRowAction(label,type,f,reason){
 const destination=type==='edit'?'data-go="complaintFormEdit" data-origin="list"':'data-action="deleteComplaintForm"';
 return `<button type="button" class="complaint-row-action ${type}" aria-label="${label}" title="${esc(reason||label)}" ${reason?'disabled':destination+attrs({form:f.id})}><svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${complaintIcons[type]}</svg></button>`;
}
const complaintBack=(label,route)=>`<button type="button" class="complaint-back" aria-label="${label}" title="${label}" data-go="${route}">←</button>`;
function complaintFormPage(id){
 if(id==='complaintFormList')return '<div class="complaint-management">'+head('投诉表单','平台管理 / 租户治理',navLink('＋ 新建表单','complaintFormEdit',{origin:'list'},'primary'))+
  table(['表单名称','关联租户','操作'],S.complaintForms.map(f=>{
   const users=complaintFormUsers(f.id),reason=f.system?'系统标准表单只读':users.length?'有租户使用，不能编辑或删除':'';
   return [esc(f.name)+(f.system?' '+badge('系统预置'):''),users.length?`<details><summary>${users.length} 个租户</summary><div>${users.map(x=>esc(x.name)).join('、')}</div></details>`:'0 个租户',
    '<div class="complaint-row-actions">'+complaintRowAction('编辑','edit',f,reason)+complaintRowAction('删除','delete',f,reason)+'</div>'];
  }))+'<dialog class="complaint-delete-dialog" id="complaintDeleteDialog" aria-labelledby="complaintDeleteTitle"><h2 id="complaintDeleteTitle">删除投诉表单</h2><p id="complaintDeleteMessage"></p><div class="ses-footer">'+action('取消','cancelComplaintFormDelete')+action('确认删除','confirmComplaintFormDelete',{},'danger-fill')+'</div></dialog></div>';
 const f=complaintFormById(ctx.complaintFormId),back=ctx.complaintFormOrigin==='config'?'complaintConfig':'complaintFormList';
 const editorHeader=title=>'<div class="complaint-editor-title">'+complaintBack('返回',back)+'<h1>'+title+'</h1></div>';
 if(ctx.complaintFormId&&(!f||lockedComplaintForm(f)))return editorHeader('编辑投诉表单')+empty('表单无法编辑',f?'系统表单或正在被租户使用':'表单已不存在');
 const initial=f||{...defaultForm(),name:''};
 return '<div class="complaint-editor">'+editorHeader(f?'编辑投诉表单':'新建投诉表单')+form('complaintFormEdit',
  field('表单名称','name',initial.name,'text',true)+field('顾客表单标题','title',initial.title,'text',true)+field('表单说明','description',initial.description,'textarea')+
  selectField('投诉原因','requireReason',[['optional','选填'],['required','必填']],initial.required?'required':'optional'),back)+'</div>';
}
function complaintPage(id,t){
 const c=complaintItem(),canHandle=['admin','supervisor'].includes(ctx.role),back=ctx.role==='platform'?'complaintPlatform':'complaintInbox';
 const recipient=c&&S.recipients.find(r=>r.tenant===ctx.tenant&&r.id===c.recipient);
 const isBlocked=recipient&&blacklist.find(blacklist.load(ctx.tenant),recipient.email);
 if(id==='complaintBlacklist'){
   if(!c||!recipient)return head('黑名单')+empty('暂无关联邮箱');
   const src='../blacklist/index.html?'+new URLSearchParams({tenant:ctx.tenant,email:recipient.email})+'#blacklist';
   return head('黑名单','联系人',navLink('返回投诉详情','complaintDetail',{complaint:c.id},''))+'<iframe class="complaint-blacklist-frame" title="联系人 · 黑名单" src="'+esc(src)+'"></iframe>';
 }
 if(id==='complaintFormList'||id==='complaintFormEdit')return complaintFormPage(id);
 if(id==='complaintConfig'){const draft=complaintDrafts.get(t.id);return head('邮件内投诉设置',t.name,t.ses==='off'?navLink(t.application==='pending'?'审核 SES 申请':'开通 SES','applicationReview',{},''):t.ses==='restricted'?navLink(t.remediation==='pending'?'审核恢复':'解除限制','restorationReview',{},''):'')+form('complaintConfig',
   kv([['租户',esc(t.name)+' · '+esc(t.id)],['SES 状态',sesBadge(t.ses)]])+
   (complaintRequired(t)
    ?'<label class="ses-choice"><input type="checkbox" checked disabled> 邮件内投诉（平台 SES 已开启，必开）</label>'
    :'<label class="ses-choice"><input type="checkbox" name="enabled" '+((draft?.enabled??complaintEnabled(t))?'checked':'')+'> 开启邮件内投诉</label>')+
   selectField('投诉表单','complaintForm',[...S.complaintForms.map(f=>[f.id,f.name]),['__new__','＋ 新建表单']],(complaintFormById(draft?.formId)||selectedComplaintForm(t)).id)+
   '<div class="ses-actions">'+action('预览邮件页脚','previewComplaintEmail',{},'')+action('管理投诉表单','manageComplaintForms',{},'link')+'</div>','tenantDetail')+complaintPreviewPane();}
 if(id==='complaintInbox'||id==='complaintPlatform'){
   const platform=id==='complaintPlatform';
   return head(platform?t.name:'客户投诉',platform?'平台管理 / 租户治理':'工单',navLink(platform?'返回租户详情':'返回工单',platform?'tenantDetail':'ticketReady',{},''))+
   (platform?'<nav class="ses-detail-tabs" aria-label="投诉来源">'+navLink('SES 投诉 / 退信回执','providerEvents',{},'')+navLink('客户提交','complaintPlatform',{},'primary')+'</nav>':'')+
   panel(platform?'客户提交的邮件投诉':'客户投诉',table(['投诉编号','原邮件 / 工单','提交时间',platform?'来源':'负责人','处理状态','操作'],complaintRows().map(x=>[
     esc(x.id),esc(x.message)+'<div class="ses-small">'+esc(x.ticket)+'</div>',esc(x.created),platform?'客户提交':esc(complaintOwner(x)),complaintStatus(x.status),navLink('查看','complaintDetail',{complaint:x.id})
   ])));
 }
 if(id==='complaintDetail'||id==='complaintHandle'){
   const isAgent=ctx.role==='agent';
   if(!c||(isAgent&&ctx.message!==c.message))return head('客户投诉详情')+empty('暂无可查看的投诉');
   if(id==='complaintHandle'){
     const close=ctx.mode!=='progress';
     if(c.status==='closed')return head('投诉已结案','',navLink('返回投诉详情','complaintDetail',{complaint:c.id},''))+panel('处理记录',progress(c.history));
     return head(close?'投诉结案':'记录处理进展',c.id)+form('complaintHandle',
       kv([['投诉编号',esc(c.id)],['当前状态',complaintStatus(c.status)]])+
       '<input type="hidden" name="status" value="'+(close?'closed':'processing')+'">'+field(close?'结案说明':'处理说明','note','','textarea',true),
       'complaintDetail',close?'确认结案':'保存进展');
   }
   const primary=canHandle&&c.status!=='closed'?navLink('记录进展','complaintHandle',{complaint:c.id,mode:'progress'},'')+navLink('结案','complaintHandle',{complaint:c.id,mode:'close'},'primary'):'';
   const backLink=isAgent?navLink('返回原工单','ticketReady',{message:c.message},''):navLink('返回列表',back,{},'');
   return head('客户投诉详情',c.id,backLink+primary)
     +panel('投诉信息',kv([['投诉编号',esc(c.id)],['来源','邮件内 · 客户提交'],['原邮件',esc(c.message)],['原工单',ctx.role==='platform'?esc(c.ticket):navLink(c.ticket,'ticketReady',{message:c.message})],['投诉原因',esc(c.reason||'未填写')],['提交时间',esc(c.created)],['负责人',esc(complaintOwner(c))],['处理状态',complaintStatus(c.status)],
       ...(!isAgent&&recipient?[['邮箱黑名单',(isBlocked?badge('已加入','red'):badge('未列入'))+(canHandle?navLink('查看黑名单','complaintBlacklist',{complaint:c.id},''):'')]]:[])]))
     +panel('处理记录',progress(c.history));
 }
 const m=sentComplaintMail(),fromMail=navLink('返回原邮件','emailPreview',{},'link public-back');
 if(id==='complaintExpired'||!m||ctx.token!=='valid')return publicBox(t.name,result('⌁','投诉链接已失效','请从有效的原邮件进入。',navLink('返回原邮件','emailPreview',{},'')));
 if(id==='complaintConfirm'){const f=m.complaintFormSnapshot||defaultForm();return publicBox(t.name,fromMail+complaintHeading(f)+'<form data-form="complaintSubmit">'+complaintReason(f)+'<p class="ses-form-error" role="alert" hidden></p><button class="primary public-submit" type="submit">确认提交</button></form>');}
 if(id==='complaintUnknown')return publicBox(t.name,result('…','正在确认提交结果','请先查询这次投诉是否已受理。',action('查询提交结果','queryComplaint',{},'primary')+navLink('返回原邮件','emailPreview',{},'')));
 const submitted=publicComplaint();
 return publicBox(t.name,submitted?result('✓','投诉已提交','投诉编号：'+submitted.id,navLink('返回原邮件','emailPreview',{},'')):result('…','尚未提交投诉','请从原邮件提交。',navLink('返回原邮件','emailPreview',{},'')));
}
function result(icon,title,text,buttons){return `<div class="ses-result"><div class="result-icon">${icon}</div><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="ses-actions">${buttons}</div></div>`}
const hasSendAttempt=m=>['failed','unknown','sent'].includes(m.status);
function messageSendBadge(m){
 const labels={queued:['未发出','amber'],failed:['发送失败','red'],unknown:['结果未知','amber'],sent:['已提交供应商','green'],cancelled:['已取消','']};
 return badge(...(labels[m.status]||['待核对','amber']));
}
const messageContact=m=>S.recipients.find(x=>x.id===m.recipient&&x.tenant===m.tenant);
function messageReason(m){
 if(m.status!=='queued'||m.expired)return m.reason||'—';
 const t=tenant(),check=gate(t,messageContact(m),m.purpose,m);
 if(check.ok)return '当前可发送，待确认';
 if(check.code==='channel'&&!sesEnabled(t.ses)&&t.auth!=='connected')return '平台 SES 已停用，自有邮箱'+(t.auth==='expired'?'授权失效':t.auth==='unverified'?'待验证':'未连接');
 return check.reason||m.reason||'—';
}
function messageNext(m){
 const r=messageContact(m),t=tenant(),data={message:m.id};
 if(m.status==='unknown')return {label:'核查发送结果',page:'ticketUnknown',data,hint:'先核查原发送尝试。结果明确前不要重发。'};
 if(!['queued','failed'].includes(m.status))return null;
 if(m.expired)return {label:'核对过期邮件',page:'queueReview',data:{},hint:'已超出时效，可取消这封邮件。'};
 const check=gate(t,r,m.purpose,m);
 if(check.ok)return m.status==='failed'?{label:'去工单重试',page:'ticketFailed',data,hint:'在原工单重新发送，发送前会再检查通道与联系限制。'}:{label:'查看工单',page:'ticketBlocked',data,hint:'在原工单核对正文后手动发送。'};
 if(check.code==='channel')return ctx.role==='admin'?{label:'修复邮箱授权',page:'mailSettings',data:{},hint:'在现有 IMAP/SMTP 设置验证自有邮箱，之后回原工单确认发送。'}:{label:'查看处理建议',hint:'请租户管理员修复邮箱授权或处理 SES 停用；当前不能发送。'};
 if(r&&['blacklist','stop','complaint','bounce','optional'].includes(check.code))return {label:'查看联系状态',page:'recipientDetail',data:{recipient:r.id},hint:'先查看收件人限制和原因；限制有效时不能重发。'};
 return {label:'核对工单',page:'ticketBlocked',data,hint:'核对收件人及邮件用途后再处理。'};
}
function messageRows(rows){
 return table(['邮件 / 工单','收件人','实际通道','发送状态','原因','下一步'],rows.map(x=>{
  const next=messageNext(x);
  const details=navLink('详情','pendingDetail',{message:x.id});
  const nextLink=next?(next.page?navLink(next.label,next.page,next.data):navLink(next.label,'pendingDetail',{message:x.id})):details;
  return [esc(x.subject)+`<div class="ses-small">${x.ticket}</div>`,esc(messageContact(x)?.email||'—'),esc(hasSendAttempt(x)?(x.provider||'—'):'—'),messageSendBadge(x),esc(messageReason(x)),next?.page?nextLink+details:nextLink];
 }));
}
function auditRows(rows){return table(['操作','分类','操作者','时间','操作'],rows.map(x=>[esc(x.action),esc(x.kind),esc(x.role)+'<div class="ses-small">'+esc(x.actor)+'</div>',esc(x.time),navLink('查看','auditDetail',{audit:x.id})]))}
function eventSummary(){return table(['指标','计入范围'],[['供应商 Complaint','可信事件目标、按 messageId＋收件人＋事件类型去重'],['服务反馈 / 退订 / SMTP失败','不计入 SES 投诉'],['供应商抑制拒绝','不新增 Complaint'],['重复与晚到','重复去重，晚到关联原批次']])}
function monitorTicket(view){
 const frame=view.querySelector('.ticket-frame');if(!frame)return;
 const status=view.querySelector('.ticket-preview-status'),message=status.querySelector('span'),retry=status.querySelector('button');
 let timer;
 function failure(){if(!frame.isConnected)return;message.textContent='工单未能加载，请重试。';retry.hidden=false}
 function inspect(){if(frame.dataset.ready==='true'){clearTimeout(timer);status.hidden=true}else if(frame.dataset.ready==='false'){clearTimeout(timer);failure()}}
 frame.addEventListener('load',inspect);
 retry.addEventListener('click',()=>{render()});
 timer=setTimeout(failure,8000);
 inspect();
}
const mailbox=window.createMailboxPreview({esc,navLink,action,tenant,state:()=>S,context:()=>ctx,stamp,audit,problem,toast,save,sesBadge});
function render(){complaintDeleteId='';const meta=byId[current],mailMode=mailbox.routes.has(current);document.body.classList.toggle('mailbox-mode',mailMode);document.body.classList.toggle('ticket-mode',ticketRoutes.has(current));document.body.classList.toggle('public-page',publicRoutes.has(current));$$('.page-view').forEach(el=>{el.hidden=el.id!=='view'+current[0].toUpperCase()+current.slice(1);if(el.hidden)el.replaceChildren()});const view=$('#view'+current[0].toUpperCase()+current.slice(1));view.innerHTML=mailMode||ticketRoutes.has(current)||publicRoutes.has(current)?body(current):'<div class="ses-content">'+body(current)+'</div>';if(ticketRoutes.has(current))monitorTicket(view);$('#main').scrollTop=0;$('#topTitle').textContent=mailMode?'集成':meta.title.split('独立页')[0];$('#roleSelect').value=ctx.role;$('#tenantSelect').innerHTML=S.tenants.map(t=>`<option value="${t.id}" ${t.id===ctx.tenant?'selected':''}>${t.name}</option>`).join('');$('.workspace').innerHTML=mailMode?'▣　智能客服 <span>≡</span>':ctx.role==='platform'?'▣　平台管理':'▣　智能工作台';$('#profileName').textContent=actor().name;$('#roleAvatar').textContent=actor().name[0];const avail=routes.filter(r=>allowed(r.id));$('#sceneSelect').innerHTML=avail.map(r=>`<option value="${r.id}" ${r.id===current?'selected':''}>${esc(r.title)}</option>`).join('');$('#moduleSelect').value=meta.modules.split('/')[0];const navs=mailMode?mailbox.nav:ctx.role==='platform'?[['platformTenants','租户治理']]:ctx.role==='recipient'?[['emailPreview','原邮件'],['preferenceEdit','联系偏好']]:[['ticketReady','工单'],['recipientList','联系人'],[null,'报表'],[null,'主动触达'],[null,'设置']];const activeNav=[current,...ancestors(current)].find(id=>navs.some(n=>n[0]===id));$('#productNav').innerHTML=navs.map(([id,title,icon='▦'])=>id?`<a href="#${id}" data-go="${id}" class="${id===activeNav?'active':''}">${icon}<span>${esc(title)}</span></a>`:`<span class="ses-nav-reference" aria-disabled="true">${icon}<span>${esc(title)}</span></span>`).join('');renderJourney();save()}
function problem(formEl,text){if(formEl){const e=formEl.querySelector('.ses-form-error');if(e){e.textContent=text;e.hidden=false;return}}toast(text)}
function setPreference(value){const r=recip();if(ctx.token!=='valid')return toast('邮件验证失败，联系偏好未更改');if(r.stop&&value!=='stop'&&value!=='keep')return toast('已有全部联系禁发，需要受控复核，不能直接解除');const before=JSON.stringify({optional:r.optional,stop:r.stop});if(value==='optional')r.optional=true;if(value==='stop')r.stop=true;audit('联系偏好变更',before,JSON.stringify({optional:r.optional,stop:r.stop}),'联系偏好');save();window.go('preferenceResult')}
function submit(key,formEl){const d=Object.fromEntries(new FormData(formEl));if(key.startsWith('mb'))return mailbox.submit(key,d,formEl);const t=tenant();
 switch(key){
 case'complaintConfig':{
  if(ctx.role!=='platform')return problem(formEl,'无权修改投诉设置');
  const next=d.complaintForm?complaintFormById(d.complaintForm):selectedComplaintForm(t);
  if(!next)return problem(formEl,'请选择有效的投诉表单');
  const previous=selectedComplaintForm(t);
  t.complaintForm=next.id;
  if(!complaintRequired(t)){const before=complaintEnabled(t);t.complaintOptional=!!d.enabled;if(before!==t.complaintOptional)audit('修改邮件内投诉设置',before?'开启':'关闭',t.complaintOptional?'开启':'关闭');}
  if(previous.id!==next.id)audit('更换投诉表单',previous.name,next.name);
  save();complaintDrafts.delete(t.id);
  window.go('tenantDetail');toast('设置已保存');break;
 }
 case'complaintFormEdit':{
  if(ctx.role!=='platform')return problem(formEl,'无权维护投诉表单');
  const existing=complaintFormById(ctx.complaintFormId);
  if(ctx.complaintFormId&&(!existing||lockedComplaintForm(existing)))return problem(formEl,'表单已被使用或已不存在，无法编辑');
  const values=complaintFormValue(d);
  if(!values.name||!values.title)return problem(formEl,'请填写表单名称和顾客表单标题');
  if(S.complaintForms.some(f=>f.id!==existing?.id&&f.name===values.name))return problem(formEl,'表单名称已存在');
  const updated={...values,id:existing?.id||'CF-'+Date.now()+'-'+S.complaintForms.length,revision:(existing?.revision||0)+1};
  if(existing)S.complaintForms.splice(S.complaintForms.indexOf(existing),1,updated);else S.complaintForms.push(updated);
  save();
  if(ctx.complaintFormOrigin==='config'){
   complaintDrafts.set(t.id,{enabled:complaintEnabled(t),...complaintDrafts.get(t.id),formId:updated.id});
   window.go('complaintConfig');
  }else window.go('complaintFormList');
  toast('投诉表单已保存');break;
 }
 case'complaintSubmit':{
  const m=sentComplaintMail();
  if(ctx.role!=='recipient')return problem(formEl,'请从原邮件提交');
  if(!m||ctx.token!=='valid')return window.go('complaintExpired');
  if(!publicComplaint()&&(m.complaintFormSnapshot||defaultForm()).required&&!(d.reason||'').trim())return problem(formEl,'请填写投诉原因');
  if(!publicComplaint()){const time=stamp(),id='CP-'+String(24+S.complaints.length-1).padStart(3,'0');
   const r=S.recipients.find(item=>item.tenant===m.tenant&&item.id===m.recipient);if(!r?.email)return window.go('complaintExpired');
   const list=blacklist.load(m.tenant)||blacklist.empty();
   const added=blacklist.add(list,{email:r.email,reason:'客户投诉',note:id+' · '+m.id,source:'邮件内投诉',person:'系统',time});
   if(added)blacklist.store(m.tenant,list);
   S.complaints.unshift({id,tenant:m.tenant,message:m.id,ticket:m.ticket,recipient:m.recipient,reason:(d.reason||'').trim(),status:'pending',assignee:'ADMIN-C',created:time,history:[{time,text:'收到客户投诉 · '+(added?'邮箱已加入黑名单':'邮箱已在黑名单')+' · 待处理'}]});save();
  }
  window.go(ctx.submission==='timeout'?'complaintUnknown':'complaintResult');break;
 }
 case'complaintHandle':{
  const c=complaintItem();if(!['admin','supervisor'].includes(ctx.role)||!c)return problem(formEl,'无权处理此投诉');
  if(c.status==='closed')return problem(formEl,'该投诉已结案');
  if(!['processing','closed'].includes(d.status)||!d.note?.trim())return problem(formEl,'请填写处理说明');
  const before=c.status;c.status=d.status;c.assignee=actor().id;c.history.push({time:stamp(),text:actor().name+' · '+(c.status==='closed'?'已结案':'处理中')+'：'+d.note.trim()});audit('处理邮件投诉',before,c.status,'邮件内投诉');
  window.go('complaintDetail',{complaint:c.id});break;
 }
 case'settings':{const before=t.from+' / '+t.provider;t.auth=t.from===d.from&&t.provider===d.provider?t.auth:'unverified';t.from=d.from;t.provider=d.provider;t.route=d.route;t.ownOnly=!!d.ownOnly;audit('更新邮箱发送设置',before,t.from+' / '+t.provider);window.go('mailSettings');toast('设置已保存');break;}
 case'apply':if(t.application==='pending'||t.ses!=='off')return problem(formEl,'当前状态无需重复申请');t.applicationData=d;t.application='pending';audit('提交SES资格申请','none','pending');window.go('mailHealth');toast('申请已提交');break;
 case'enableSes':if(ctx.role!=='platform'||t.ses!=='off'||t.application==='pending'||!d.reason?.trim())return problem(formEl,'请核对资格并填写开通依据');t.ses='active';t.reason='';audit('平台开通 SES','未开放',d.reason.trim());notify('平台 SES 发送资格已开放','eligibility');window.go('tenantDetail');break;
 case'liftSes':if(ctx.role!=='platform'||t.ses!=='restricted'||t.remediation==='pending'||!d.reason?.trim())return problem(formEl,'请核对资格并填写解除依据');t.ses='active';t.reason='';audit('平台解除 SES 限制','已限制',d.reason.trim());notify('平台 SES 发送资格已恢复','restoration');window.go('tenantDetail');break;
 case'applicationReview':if(t.application!=='pending')return problem(formEl,'当前没有待审核申请');t.application=d.decision;t.ses=d.decision==='approved'?'active':'off';t.reason=d.reason;audit('审核SES资格','申请待审核',t.ses+'：'+d.reason);notify('SES资格申请审核完成','eligibility');window.go('tenantDetail');break;
 case'restrict':{if(t.ses==='off')return problem(formEl,'当前SES未开放，无需收回资格');if(!d.reason.trim())return problem(formEl,'请填写限制原因');const before=t.ses;t.ses='restricted';t.reason=d.reason;audit('限制平台SES资格',before,'restricted：'+d.reason);notify('平台 SES 发送资格已限制','restriction');window.go('tenantDetail');break;}
 case'remediation':if(t.remediation==='pending'||!['restricted','review'].includes(t.ses))return problem(formEl,'当前没有可提交的限制整改');t.remediationData=d;t.remediation='pending';if(t.ses==='restricted')t.ses='review';audit('提交整改与复核','未提交','待审核');window.go('mailHealth');break;
 case'restore':{if(t.remediation!=='pending')return problem(formEl,'需先由商家提交整改与验证证据');const before=t.ses;t.ses=d.decision;t.remediation=d.decision==='active'?'approved':'rejected';t.reason=d.reason;audit('审核恢复SES资格',before,t.ses+'：'+d.reason);notify('SES资格复核结果已更新','restoration');window.go('tenantDetail');break;}
 case'feedback':{if(message()?.status!=='sent'||message()?.recipient!==ctx.recipient)return problem(formEl,'仅支持从已发送的原服务邮件提交反馈');publicDraft={...d};if(ctx.token!=='valid')return window.go('feedbackExpired');const request='feedback-'+ctx.tenant+'-'+ctx.message+'-'+ctx.recipient;let item=S.feedbacks.find(x=>x.id===S.requests[request]);if(!item){item={id:'FB-'+(100+S.feedbacks.length),tenant:ctx.tenant,recipient:ctx.recipient,message:ctx.message,type:d.type,aspect:d.aspect,note:d.note,status:'pending',assignee:ctx.noSupervisor?'ADMIN-C':'SUP-B',target:'AGENT-A',history:[{time:stamp(),text:'收到原邮件服务反馈'},{time:stamp(),text:ctx.noSupervisor?'已分配租户管理员':'已分配商家主管'}],report:!!d.report,continue:!!d.continue};S.feedbacks.unshift(item);S.requests[request]=item.id;audit('收到服务反馈','无',item.id,'服务反馈')}ctx.feedback=item.id;save();window.go(ctx.submission==='timeout'?'feedbackUnknown':'feedbackSuccess');break;}
 case'preference':tempQuery.preference=d.preference;if(ctx.token!=='valid')return problem(formEl,'无法验证当前邮件操作范围');window.go('preferenceVerify');break;
 case'handleFeedback':{const f=caseItem();if(!f)return;if(f.target===actor().id&&['resolved','none'].includes(d.status))return problem(formEl,'被反馈人不能终结针对自己的升级项');const before=f.status;f.status=d.status;f.assignee=actor().id;f.history.push({time:stamp(),text:actor().name+'：'+d.note+'（'+titles[d.status]+'）'});audit('记录反馈处理结果',before,f.status,'服务反馈');window.go('feedbackDetail');break;}
 case'escalateFeedback':{const f=caseItem();if(!f)return;if(d.assignee===f.target)return problem(formEl,'升级项不能交由被反馈人自行终结');f.assignee=d.assignee||'ADMIN-C';f.status='escalated';f.history.push({time:stamp(),text:'升级内部处理：'+d.note});audit('升级服务反馈','原处理队列',f.assignee,'服务反馈');window.go('feedbackDetail');break;}
 case'replay':{const D=Number(d.volume),C=Number(d.complaints);if(!Number.isFinite(D)||!Number.isFinite(C)||D<0||C<0||!Number.isInteger(D)||!Number.isInteger(C)||C>D)return problem(formEl,'请填写有效的完整发送量与投诉数量，投诉不能超过分母');const complete=!!d.complete;const result=!complete||!D?'不可计算：分母或事件不完整':D>=1000&&C>=5&&C/D>=0.0005?'拟命中候选限制条件；未改变租户资格':'未命中候选限制条件';S.replay={volume:D,complaints:C,complete,result};save();render();break;}
 }
}
function dispatch(key,data={},formEl){if(key.startsWith('mb'))return mailbox.dispatch(key,data);const t=tenant();switch(key){
 case'manageComplaintForms':if(ctx.role==='platform'&&formEl)openComplaintForms('complaintFormList',formEl);break;
 case'previewComplaintEmail':{
  if(ctx.role!=='platform'||current!=='complaintConfig'||!formEl)return;
  const pane=$('[data-complaint-preview-pane]');
  if(!pane)return;
  pane.innerHTML=complaintEmailPreview(complaintConfigValue(formEl).enabled);pane.hidden=false;
  pane.scrollIntoView?.({block:'nearest'});break;
 }
 case'closeComplaintPreview':{const pane=$('[data-complaint-preview-pane]');if(pane){pane.hidden=true;pane.replaceChildren()}break;}
 case'deleteComplaintForm':{
  if(ctx.role!=='platform'||current!=='complaintFormList')return;
  const f=complaintFormById(data.form);
  if(!f||lockedComplaintForm(f))return toast('该投诉表单不可删除');
  complaintDeleteId=f.id;$('#complaintDeleteMessage').textContent='确定删除「'+f.name+'」？删除后无法恢复，已发邮件不受影响。';
  const dialog=$('#complaintDeleteDialog');dialog.showModal?.();break;
 }
 case'cancelComplaintFormDelete':complaintDeleteId='';$('#complaintDeleteDialog')?.close?.();break;
 case'confirmComplaintFormDelete':{
  if(ctx.role!=='platform'||current!=='complaintFormList')return;
  const f=complaintFormById(complaintDeleteId);complaintDeleteId='';$('#complaintDeleteDialog')?.close?.();
  if(!f||lockedComplaintForm(f))return toast('该投诉表单不可删除');
  S.complaintForms=S.complaintForms.filter(x=>x.id!==f.id);save();render();toast('投诉表单已删除');break;
 }
 case'verify':{const before=t.auth;t.auth=ctx.validation==='fail'?'expired':'connected';if(t.auth==='connected')t.verifiedAt=stamp();audit('自有通道验证',before,t.auth);render();toast(t.auth==='connected'?'连接验证通过':'连接验证失败，请检查授权');break;}
 case'queryComplaint':if(ctx.role==='recipient'&&ctx.token==='valid'&&publicComplaint())window.go('complaintResult');else toast('暂未查到已受理的投诉');break;
 case'requestContactReview':audit('提交联系状态复核','有效限制','待复核','联系偏好');toast('复核请求已记录，原限制继续生效');break;
 case'queryFeedback':{const id=S.requests['feedback-'+ctx.tenant+'-'+ctx.message+'-'+ctx.recipient];if(id){ctx.feedback=id;window.go('feedbackSuccess')}else toast('尚未确认原提交结果，请稍后核查');break;}
 case'verifyPreference':if(ctx.token!=='valid')return toast('邮件验证失败，未修改联系偏好');if(tempQuery.preference==='stop')window.go('preferenceStopConfirm');else setPreference(tempQuery.preference||'keep');break;
 case'savePreference':setPreference(data.preference);break;
 case'retryNotification':{if(!['platform','admin'].includes(ctx.role))return toast('无权重试资格变更通知');const n=S.notifications.find(x=>x.id===data.notification);if(n){n.status='sent';n.reason='';audit('重试资格变更通知','failed','sent');render();toast('资格变更通知已重新提交')}break;}
 case'cancelMessage':{const m=S.messages.find(x=>x.id===data.message&&x.tenant===ctx.tenant);if(m?.expired){m.status='cancelled';audit('取消过期邮件','queued','cancelled');render()}break;}
 case'reviewVerify':ctx.role='admin';window.go('migrationValidation');break;
 }}
document.addEventListener('click',e=>{const step=e.target.closest('[data-journey-step]');if(step){e.preventDefault();openJourneyStep(Number(step.dataset.journeyStep));return}const n=e.target.closest('[data-go]');if(n){e.preventDefault();const data={...n.dataset};delete data.go;if(current==='complaintConfig'&&n.dataset.go==='tenantDetail')complaintDrafts.delete(ctx.tenant);window.go(n.dataset.go,data);return}const a=e.target.closest('[data-action]');if(a){e.preventDefault();dispatch(a.dataset.action,a.dataset,a.closest('form'))}});
document.addEventListener('cancel',e=>{if(e.target.id==='complaintDeleteDialog')complaintDeleteId='';},true);
document.addEventListener('submit',e=>{const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();if(f.reportValidity())submit(f.dataset.form,f)});
document.addEventListener('input',e=>{if(e.target.matches('[data-filter-input]')){filteredText=e.target.value;const pos=e.target.selectionStart;render();const el=$('[data-filter-input]');el.focus();el.setSelectionRange(pos,pos)}});
document.addEventListener('change',e=>{if(e.target.matches('[data-filter-status]')){filteredStatus=e.target.value;render()}
 const select=e.target;
 if(current==='complaintConfig'&&select.name==='complaintForm'){
  if(select.value==='__new__')openComplaintForms('complaintFormEdit',select.form,{origin:'config'},select.dataset.previous||complaintDrafts.get(ctx.tenant)?.formId||selectedComplaintForm(tenant()).id);
  else select.dataset.previous=select.value;
 }
 if(current==='complaintConfig'&&['complaintForm','enabled'].includes(select.name)){
  const pane=$('[data-complaint-preview-pane]');if(pane&&!pane.hidden){pane.hidden=true;pane.replaceChildren()}
 }
});
const moduleNames=['租户治理','集成 / 邮箱详情','发送门禁 / 路由','工单发送现场','收件人联系状态','发送回执','回复与邀评','原邮件反馈','联系偏好','服务反馈处理','租户发送指标','操作记录','待迁移租户'];
const moduleRoutes=['platformTenants','mailList','ticketReady','ticketFailed','recipientList','providerEvents','qualityMissing','emailPreview','preferenceEdit','feedbackList','riskOverview','notifications','migrationList'];
$('#journeySelect').innerHTML=Object.entries(PRIMARY_JOURNEYS).map(([id,j])=>'<option value="'+id+'">'+j.label+'</option>').join('');$('#journeySelect').addEventListener('change',e=>{ctx.journey=e.target.value;const j=PRIMARY_JOURNEYS[ctx.journey];routeData(j.steps[0][1],{tenant:j.tenant});openPrimaryStep(0)});$('#journeySteps').addEventListener('click',e=>{const button=e.target.closest('[data-primary-step]');if(button)openPrimaryStep(Number(button.dataset.primaryStep))});
$('#moduleSelect').innerHTML=moduleNames.map((x,i)=>`<option value="M${String(i+1).padStart(2,'0')}">M${String(i+1).padStart(2,'0')} ${x}</option>`).join('');
$('#moduleSelect').addEventListener('change',e=>reviewGo(moduleRoutes[Number(e.target.value.slice(1))-1]));
$('#sceneSelect').addEventListener('change',e=>reviewGo(e.target.value));
$('#tenantSelect').addEventListener('change',e=>{ctx.tenant=e.target.value;routeData(current,{tenant:ctx.tenant});window.go(current,{},true)});
$('#roleSelect').addEventListener('change',e=>{ctx.role=e.target.value;ctx.journey=PRIMARY_JOURNEYS[ctx.role]?ctx.role:'';window.go({platform:'platformTenants',admin:'mailList',agent:'ticketReady',supervisor:'feedbackList',recipient:'emailPreview'}[ctx.role])});
$('#reviewReset').addEventListener('click',()=>{if(confirm('重置本邮件治理原型的合成数据？')){S=clone(window.SES_SEED);ctx.tenant='TEN-017';ctx.recipient='R-SAM';ctx.message='MSG-204';ctx.feedback='FB-031';ctx.token='valid';publicDraft={};complaintDrafts.clear();save();reviewGo(publicRoutes.has(current)?'emailPreview':current);toast('本原型数据已重置')}});
function loadHash(){const [raw,query='']=location.hash.slice(1).split('?');const p=new URLSearchParams(query);if(byId[raw]){const role=p.get('role');ctx.role=['platform','admin','agent','supervisor','recipient'].includes(role)?role:defaultRole(raw);if(p.get('tenant'))ctx.tenant=p.get('tenant');if(JOURNEYS[p.get('journey')]||PRIMARY_JOURNEYS[p.get('journey')])ctx.journey=p.get('journey');routeData(raw,Object.fromEntries([...p].filter(([k])=>k==='tenant'||contextKeys(raw).includes(k))));if(p.get('condition'))window.sesPrototypeBridge.configureScenario(p.get('condition'));if(!allowed(raw))ctx.role=defaultRole(raw);current=raw;ctx.page=raw;render()}else window.go('platformTenants',{},true)}
addEventListener('popstate',loadHash);addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{const updated=JSON.parse(e.newValue);if(updated.version===1){restoreComplaintForms(updated);S=updated;render()}}catch(err){console.error(err)}}});
// 工单复制基座通过同源桥接读取同一份状态；仅在本原型内使用。
window.sesPrototypeBridge={snapshot(){return {tenant:clone(tenant()),recipient:clone(recip()),message:clone(message()),role:ctx.role,page:current,quality:ctx.quality,uncertain:ctx.uncertain,escalated:!!S.qualityEscalations[message()?.ticket],draft:S.drafts[(message()?.ticket||'DEMO-204')],recipients:clone(S.recipients.filter(x=>x.tenant===ctx.tenant)),messages:clone(S.messages.filter(x=>x.tenant===ctx.tenant)),cases:clone(S.feedbacks.filter(x=>x.tenant===ctx.tenant)),sentReplies:clone(ticketReplies(message())),latestBlock:clone(S.audits.find(x=>x.tenant===ctx.tenant&&x.ticketBlock?.ticket===message()?.ticket)||null),ticketStatus:S.ticketStatus[message()?.ticket],complaintInboxAllowed:['admin','supervisor'].includes(ctx.role),complaints:clone(complaintRows().filter(x=>x.ticket===message()?.ticket)),complaintRequired:complaintRequired(tenant()),complaintEnabled:complaintEnabled(tenant()),gate:gate(tenant(),recip(),ctx.purpose,message()?.status==='unknown'?message():null)}},draft(text){S.drafts[message()?.ticket||'DEMO-204']=text;save()},navigate(id,data){window.go(id,data)},toast,saveReply(text,purpose='service',resolve=false,addresses=[]){const m=message();if(!m)return {ok:false,reason:'找不到关联消息'};if(!text.trim())return {ok:false,reason:'请填写邮件正文'};const queued=m.status==='queued';if(queued&&m.expired)return rejectTicketSend(m,{ok:false,reason:'邮件已过期，请在历史邮件核对中取消'});if(queued)purpose=m.purpose;if(current==='qualityThanks'&&ctx.quality!=='newQuestion')return rejectTicketSend(m,{ok:false,reason:'客户仅表示感谢，不再追加结束语邮件'});let g=gate(tenant(),recip(),purpose,m.status==='unknown'?m:null);for(const email of addresses){const target=S.recipients.find(x=>x.tenant===ctx.tenant&&x.email.toLowerCase()===email.toLowerCase());const result=gate(tenant(),target,purpose,m.status==='unknown'?m:null);if(!result.ok){g=result;break}}if(!g.ok)return rejectTicketSend(m,g);const target=addresses[0]?S.recipients.find(x=>x.tenant===ctx.tenant&&x.email.toLowerCase()===addresses[0].toLowerCase()):recip();const sent={...m,id:queued?m.id:'MSG-'+Date.now()+'-'+S.messages.length,recipient:target?.id||m.recipient,body:text,status:'sent',reason:'',provider:g.provider,date:stamp(),purpose,complaintLink:complaintEnabled(tenant())&&purpose==='service'&&!!target&&addresses.length<2};sent.complaintFormSnapshot=complaintMailForm(tenant(),sent.complaintLink);if(queued)S.messages.splice(S.messages.indexOf(m),1);S.messages.unshift(sent);S.outbound.push(sent.id);if(resolve)S.ticketStatus[m.ticket]='resolved';S.drafts[m.ticket]='';audit('提交合格邮件 · '+(ctx.entry||'人工'),'草稿',g.provider+' / 已提交供应商');return {ok:true,provider:g.provider,resolve,complaintLink:sent.complaintLink,message:sent.id}},retry(){const m=message();if(!m)return {ok:false,reason:'找不到消息'};if(m.status==='unknown')return {ok:false,reason:'结果未知，请先核查，不能直接重发'};if(m.status!=='failed')return {ok:false,reason:'仅发送失败的邮件可重试'};const g=gate(tenant(),recip(),m.purpose);if(!g.ok)return rejectTicketSend(m,g);m.status='sent';m.provider=g.provider;m.reason='';m.handled=true;m.complaintLink=complaintEnabled(tenant())&&m.purpose==='service'&&!!recip();m.complaintFormSnapshot=complaintMailForm(tenant(),m.complaintLink);audit('受控重发',m.id,'已提交供应商');return {ok:true}},ignore(){const m=message();if(m){m.handled=true;audit('忽略失败待处理标记',m.id,'保留失败历史');return true}},query(outcome=ctx.queryOutcome||'pending'){const m=message();if(!m||m.status!=='unknown')return;if(outcome==='failed'){m.status='failed';m.reason='供应商确认提交失败';audit('核查发送结果','unknown','failed')}else if(outcome==='sent'){m.status='sent';m.reason='';audit('核查发送结果','unknown','sent')}save();return m.status},escalateQuality(){S.qualityEscalations[message()?.ticket]=true;audit('排障达到上限','重复排障','已提交售后负责人决策','回复规则');return true},survey(){const r=recip();const blocked=S.ticketStatus[message()?.ticket]!=='resolved'||ctx.recent===false||message()?.expired||r.stop||r.optional||r.complaint||r.bounce||S.feedbacks.some(f=>f.tenant===ctx.tenant&&f.recipient===r.id&&!['resolved','none'].includes(f.status))||S.surveyHistory.includes(message()?.ticket);if(blocked){audit('邀评跳过','候选邀请','不符合邀评资格','回复规则');return {ok:false,reason:'未解决反馈、联系偏好或重复邀请使本次邀评跳过'}}return {ok:true}},configureScenario(type){if(type==='uncertain')ctx.uncertain=true;if(type==='confirmed')ctx.uncertain=false;if(type==='recent')ctx.recent=true;if(type==='notRecent')ctx.recent=false;if(type==='newQuestion')ctx.quality='newQuestion';if(type==='thanks')ctx.quality='thanks';if(type==='tokenExpired')ctx.token='expired';if(type==='tokenValid')ctx.token='valid';if(type==='timeout')ctx.submission='timeout';if(type==='normal')ctx.submission='normal';if(type==='validationFail')ctx.validation='fail';if(type==='validationPass')ctx.validation='pass';if(type==='noSupervisor')ctx.noSupervisor=true;if(type==='hasSupervisor')ctx.noSupervisor=false;if(type==='queryPending')ctx.queryOutcome='pending';if(type==='querySent')ctx.queryOutcome='sent';if(type==='queryFailed')ctx.queryOutcome='failed';if(type==='selfFeedback'){const f=caseItem();if(f){f.target='SUP-B';f.status='escalated'}}if(type==='standardFeedback'){const f=caseItem();if(f)f.target='AGENT-A'}save()}};
// 异常切换属于评审外壳，不加入业务表单。
const testSelect=document.createElement('select');testSelect.id='reviewCondition';testSelect.setAttribute('aria-label','评审异常条件');testSelect.innerHTML='<option value="">异常条件</option><option value="validationPass">通道验证成功</option><option value="validationFail">通道验证失败</option><option value="tokenValid">原收件人链接</option><option value="tokenExpired">链接无效 / 转发范围不符</option><option value="normal">反馈正常提交</option><option value="timeout">反馈提交超时</option><option value="noSupervisor">主管缺失</option><option value="hasSupervisor">主管已配置</option><option value="selfFeedback">被反馈人是当前主管</option><option value="standardFeedback">反馈对象是原客服</option><option value="queryPending">供应商仍在核查</option><option value="querySent">核查确认成功</option><option value="queryFailed">核查确认失败</option><option value="uncertain">资料抽取不确定</option><option value="confirmed">资料已核实</option><option value="recent">有近期服务交互</option><option value="notRecent">无近期服务交互</option><option value="thanks">仅感谢</option><option value="newQuestion">感谢包含新问题</option>';
testSelect.addEventListener('change',e=>{window.sesPrototypeBridge.configureScenario(e.target.value);if(ticketRoutes.has(current))render();toast('评审条件已切换')});$('#reviewReset').before(testSelect);
const sourceSelect=document.createElement('select');sourceSelect.id='reviewEntry';sourceSelect.setAttribute('aria-label','评审发送入口');sourceSelect.innerHTML=['人工','AI','导入建单','定时任务','重试','旧服务'].map(x=>'<option>'+x+'</option>').join('');sourceSelect.addEventListener('change',e=>ctx.entry=e.target.value);$('#reviewReset').before(sourceSelect);mailbox.bind();loadHash();window.SES_APP={get state(){return S},get context(){return ctx},routes,gate,reviewGo,render,submit,dispatch,ancestors,openJourneyStep,openPrimaryStep,primaryJourneys:PRIMARY_JOURNEYS,currentJourney};
})().catch(e=>{console.error(e);const el=document.querySelector('#main');if(el)el.innerHTML='<div class="ses-result" role="alert"><h2>原型加载失败</h2><p>请刷新后重试。</p></div>'});
