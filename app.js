'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const cite = (id, n) => `<button class="citation" data-source="${id}" aria-label="查看引用 ${n} 的原文">${n}</button>`;
const sourceButton = (id, label) => `<button class="faq-source" data-source="${id}">${icon('file')}${label}${icon('external')}</button>`;

const sourceData = {
  policy: {id:'policy',type:'PDF',className:'pdf',icon:'file',title:'退换货与退款政策.pdf',subtitle:'售后政策 · 版本 2.3 · 示例文件',location:'第 3 页 · §3.2 到货破损',snippet:'签收后 7 天内发现运输破损，可申请免费更换受损配件或退货退款。',file:'assets/return-policy.pdf#page=3',page:3,totalPages:4},
  video: {id:'video',type:'VIDEO',className:'video',icon:'play',title:'如何记录破损并申请售后.webm',subtitle:'售后操作视频 · 00:12 · 示例文件',location:'00:04–00:08 · 拍摄破损照片',snippet:'记录商品整体、破损部位和外包装，提交订单号和照片，便于支持团队审核。',file:'assets/damage-guide.webm#t=4',time:4},
  timing: {id:'timing',type:'CSV',className:'table',icon:'table',title:'售后服务处理时效.csv',subtitle:'售后服务标准 · 2026 年 10 月 · 示例文件',location:'服务时效 · A4:D5',snippet:'退货验收通过后安排退款；原支付渠道通常需要 3–5 个工作日到账。',file:'assets/service-times.csv'},
  warranty: {id:'warranty',type:'DOC',className:'doc',icon:'book',title:'产品保修与维修说明',subtitle:'帮助中心文档 · 版本 1.2 · 示例文件',location:'§2 保修范围与申请方式',snippet:'正常使用情况下的制造缺陷享受 12 个月有限保修；申请时需要购买凭证。',file:'assets/warranty.html'},
  shipping: {id:'shipping',type:'DOC',className:'doc',icon:'book',title:'订单配送与物流说明',subtitle:'帮助中心文档 · 版本 1.1 · 示例文件',location:'§2 订单追踪',snippet:'发货后通过邮件中的物流链接查询；物流长时间未更新时可提交工单核实。',file:'assets/shipping.html'},
  filter: {id:'filter',type:'DOC',className:'doc',icon:'book',title:'空气净化器使用说明',subtitle:'产品使用手册 · 版本 1.0 · 示例文件',location:'§4 滤芯维护',snippet:'在设备面板查看滤芯寿命；更换滤芯后，长按滤芯键 5 秒完成寿命重置。',file:'assets/filter-manual.html'}
};

const scenarios = {
  damage: {
    label:'完整召回 · 摘要 / FAQ / 来源', question:'收到的商品有破损，应该怎么办？',category:'退换货与退款',sources:['policy','video','timing'],
    answer: `<p class="lead">如果收到的商品有破损，请先保留商品与外包装，并在<strong>签收后 7 天内</strong>联系我们。根据破损情况，你可以申请以下两种处理方式：${cite('policy',1)}</p><div class="answer-options"><div class="answer-option"><span class="option-number">1</span><div><h4>免费更换受损配件</h4><p>适用于局部配件破损。审核通过后安排补发，无需寄回整件商品。</p></div></div><div class="answer-option"><span class="option-number">2</span><div><h4>申请退货退款</h4><p>适用于影响正常使用的破损。退货验收通过后，按原支付渠道退款。</p></div></div></div><p>申请时请提供<strong>订单号、破损部位和外包装照片</strong>，便于支持团队核实。${cite('video',2)} 退款通常在退货验收通过后 <strong>3–5 个工作日</strong>到账，具体以支付机构为准。${cite('timing',3)}</p><p class="answer-tip">${icon('clock')}<span>准备好以上信息后，可通过下方「提交工单」发起申请。</span></p>`,
    faqs:[
      {q:'申请破损售后，需要提供哪些材料？',a:'请提供订单号、商品整体照片、破损部位近照和外包装照片。提交工单时可以添加附件，支持团队会根据实际情况审核。',source:'policy'},
      {q:'更换配件需要寄回整件商品吗？',a:'对于可单独更换的局部配件，经支持团队确认后，通常无需寄回整件商品；如果影响整机正常使用，则需要进一步确认处理方式。',source:'policy'},
      {q:'退货后多久能收到退款？',a:'退货验收通过后，退款将原路退回。支付渠道通常需要 3–5 个工作日到账，具体时间以支付机构为准。',source:'timing'}
    ]
  },
  shipping:{
    label:'订单物流',question:'我在哪里可以查看订单物流？',category:'订单与物流',sources:['shipping'],
    answer:`<p class="lead">订单发货后，你会收到一封包含<strong>物流单号和追踪链接</strong>的发货通知邮件。点击邮件中的链接，即可查看配送进度。${cite('shipping',1)}</p><ol class="plain-steps"><li>查找下单时使用的邮箱，搜索「Shulex Home 发货通知」。</li><li>打开邮件中的物流追踪链接，或复制物流单号到承运商网站查询。</li><li>若订单显示已发货，但物流超过 3 个工作日未更新，请提交工单核实。</li></ol><p>还没有收到发货通知？请检查垃圾邮件文件夹，并确认下单邮箱填写正确。${cite('shipping',1)}</p>`,
    faqs:[{q:'发货后为什么暂时查不到物流信息？',a:'包裹交给承运商后，首次扫描通常需要 1–2 个工作日。若超过 3 个工作日仍未更新，请携带订单号提交工单。',source:'shipping'},{q:'收货地址填写错误，还可以修改吗？',a:'未发货订单可以提交工单申请修改，是否能修改以实际处理结果为准；已发货订单需要由支持团队联系承运商确认。',source:'shipping'}]
  },
  warranty:{
    label:'保修政策',question:'商品保修范围包括哪些？',category:'保修与维修',sources:['warranty'],
    answer:`<p class="lead">Shulex Home 商品自购买之日起享受 <strong>12 个月有限保修</strong>，覆盖正常使用条件下的材料或制造缺陷。${cite('warranty',1)}</p><ol class="plain-steps"><li><strong>保修范围：</strong>正常使用中的制造缺陷及相关功能故障。</li><li><strong>不包含：</strong>正常损耗、意外损坏、不当使用或未经授权的改装。</li><li><strong>申请方式：</strong>提供购买凭证、产品型号、故障描述和相关照片，提交工单审核。</li></ol><p>是否符合保修条件，需要支持团队根据资料进一步确认。${cite('warranty',1)}</p>`,
    faqs:[{q:'保修期从什么时候开始计算？',a:'从有效购买凭证所示的购买日期开始计算，示例政策为 12 个月有限保修。',source:'warranty'},{q:'没有订单号可以申请保修吗？',a:'可以先提供其他有效购买凭证，支持团队会进一步核实购买信息和保修适用条件。',source:'warranty'}]
  },
  noFaq:{
    label:'有答案 · 无 FAQ',question:'如何查看空气净化器的滤芯寿命？',category:'产品使用与故障',sources:['filter'],
    answer:`<p class="lead">你可以在空气净化器的设备面板上查看<strong>滤芯寿命百分比</strong>。滤芯更换指示灯亮起时，请根据实际使用情况检查并更换滤芯。${cite('filter',1)}</p><p>更换完成后，在设备接通电源的状态下，<strong>长按滤芯键 5 秒</strong>，指示灯熄灭后即完成寿命重置。${cite('filter',1)}</p><p class="answer-tip">${icon('book')}<span>操作说明适用于本示例手册对应型号；请先核对设备型号。</span></p>`,faqs:[]
  },
  noRecall:{
    label:'未召回 · 无可推荐来源',question:'支持企业批量采购和专属报价吗？',category:'其他问题',sources:[],faqs:[],fallback:true,
    answer:`<div class="fallback"><span class="fallback-icon">${icon('search')}</span><h4>暂时没有找到能准确回答这个问题的资料</h4><p>当前知识库没有足够依据，我们暂时无法给出可靠答案。你可以换一种描述重新搜索，或提交工单，让支持团队进一步确认。</p></div>`
  },
  related:{
    label:'未找到答案 · 有相近来源',question:'更换滤芯后，指示灯闪烁三次是什么意思？',category:'产品使用与故障',sources:['filter'],faqs:[],fallback:true,related:true,
    answer:`<div class="fallback"><span class="fallback-icon">${icon('search')}</span><h4>暂时没有找到这个现象的准确说明</h4><p>知识库中有滤芯维护的相关资料，但没有说明「指示灯闪烁三次」的具体含义，暂时无法据此判断原因。</p><p>下方资料可能有帮助，你也可以提交工单，请支持团队进一步确认。</p></div>`
  }
};

Object.values(sourceData).forEach(source=>Object.assign(source,window.Tenant.bind(source)));
Object.values(scenarios).forEach(scenario=>Object.assign(scenario,window.Tenant.bind({...scenario,faqs:scenario.faqs.map(window.Tenant.bind)})));
const state={scenario:'damage',question:'',hasAsked:false,vote:null,reasons:new Set(),online:true,chatSession:null,previewPage:3,previewId:null,attachments:[],ticketSnapshot:null,searchSequence:0};
const storage={read(key,fallback){try{const raw=localStorage.getItem(window.Tenant.key(key));if(!raw)return fallback;const value=JSON.parse(raw);return value&&typeof value==='object'&&!window.Tenant.owns(value)?fallback:value;}catch{return fallback;}},write(key,data){try{localStorage.setItem(window.Tenant.key(key),JSON.stringify(data));}catch{}}};
const feedbackKey=()=>`shulex-feedback:${state.scenario}:${state.question}`;
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,2700);}
function currentScenario(){return window.Tenant.assert(scenarios[state.scenario]);}

function renderSource(id,index,related=false){const s=window.Tenant.assert(sourceData[id]);return `<button class="source-row" data-source="${id}" aria-label="预览${esc(s.title)}，${esc(s.location)}"><span class="file-icon ${s.className}">${icon(s.icon)}<small>${s.type}</small></span><span class="source-copy"><span class="source-title"><span class="source-index">${related?'相关资料':`[${index+1}]`}</span>${esc(s.title)}<span class="source-locator">${esc(s.location)}</span></span><span class="source-snippet">${esc(s.snippet)}</span></span>${icon('external')}</button>`;}

function render(){
  const data=currentScenario();
  $('#current-question').textContent=state.question;
  $('#answer-body').innerHTML=data.answer;
  $('#result-meta').textContent=data.fallback?'未找到有效答案':`${data.sources.length} 个引用来源`;
  $('#answer-note').textContent=data.fallback?'未找到足够依据，本次未生成推断性答案。':'AI 根据来源资料整理，请以原文及实际审核结果为准。';
  $('#faq-count').textContent=data.faqs.length;
  $('#faq-section').hidden=data.faqs.length===0;
  $('#faq-list').innerHTML=data.faqs.map(f=>`<details class="faq-item"><summary>${esc(f.q)}${icon('chevron')}</summary><div class="faq-answer">${esc(f.a)}<br>${sourceButton(f.source,'查看知识库原文')}</div></details>`).join('');
  $('#sources-title').textContent=data.related?'相关来源文件':'来源文件';
  $('#sources-count').textContent=data.sources.length;
  $('#sources-section').hidden=data.sources.length===0;
  $('#sources-list').innerHTML=data.sources.map((id,i)=>renderSource(id,i,data.related)).join('');
  $('#copy-answer').hidden=!!data.fallback;
  state.vote=null;state.reasons=new Set();$('#feedback-detail').value='';$('#feedback-form').hidden=true;$('#feedback-message').textContent='';
  const saved=storage.read(feedbackKey(),null);
  if(saved){state.vote=saved.vote;state.reasons=new Set(saved.reasons||[]);$('#feedback-detail').value=saved.detail||'';$('#feedback-message').textContent=saved.detailSubmitted?'感谢反馈，我们会继续完善答案。':saved.vote==='up'?'谢谢你的反馈！':'已记录反馈，也可以补充原因。';}
  renderFeedback();
  $$('#scenario-buttons button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===state.scenario)));
  $('#loading').hidden=true;$('#answer-card').hidden=false;$('#answer-card').setAttribute('aria-busy','false');$('#search-form button').disabled=false;
}

const feedbackReasons=['没有回答我的问题','内容不准确','信息不完整或过时','来源不相关'];
function renderFeedback(){
  $('#vote-up').setAttribute('aria-pressed',String(state.vote==='up'));$('#vote-down').setAttribute('aria-pressed',String(state.vote==='down'));
  $('#feedback-reasons').innerHTML=feedbackReasons.map(r=>`<button type="button" aria-pressed="${state.reasons.has(r)}" data-reason="${r}">${r}</button>`).join('');
}
function saveFeedback(detailSubmitted=false){storage.write(feedbackKey(),window.Tenant.bind({vote:state.vote,reasons:[...state.reasons],detail:$('#feedback-detail').value.trim(),detailSubmitted,question:state.question,scenario:state.scenario,sourceIds:currentScenario().sources,time:new Date().toISOString()}));}
function vote(value){state.vote=value;$('#feedback-form').hidden=value!=='down';$('#feedback-message').textContent=value==='up'?'谢谢你的反馈！':'已记录反馈，也可以补充原因。';renderFeedback();saveFeedback();}
$('#vote-up').addEventListener('click',()=>vote('up'));$('#vote-down').addEventListener('click',()=>vote('down'));
$('#feedback-reasons').addEventListener('click',event=>{const button=event.target.closest('[data-reason]');if(!button)return;const reason=button.dataset.reason;state.reasons.has(reason)?state.reasons.delete(reason):state.reasons.add(reason);renderFeedback();saveFeedback();});
$('#feedback-form').addEventListener('submit',event=>{event.preventDefault();saveFeedback(true);$('#feedback-form').hidden=true;$('#feedback-message').textContent='感谢反馈，我们会继续完善答案。';toast('反馈已记录在当前浏览器');});

function chooseScenario(query){
  const learned=window.Learning?.findPublished(query);
  if(learned){const id='learned-'+learned.id,key='selflearned-'+learned.id;sourceData[id]={id,faqId:learned.id,type:'FAQ',className:'doc',icon:'book',title:learned.question,subtitle:'知识库 / 自学习 FAQ · 本地演示',location:'知识库 FAQ · 完整答案',snippet:learned.answer,...window.Tenant.scope,file:window.Tenant.link('faq.html?id='+encodeURIComponent(learned.id))};scenarios[key]={...window.Tenant.scope,label:'知识库 FAQ',question:learned.question,category:'其他问题',sources:[id],answer:'<p class="lead">'+esc(learned.answer).replaceAll('\n','<br>')+cite(id,1)+'</p>',faqs:[{q:learned.question,a:learned.answer,source:id}]};try{window.Learning.recordUse(learned.id);}catch{}return key;}

  if(/闪烁|三次|重置.*失败|reset.*fail/i.test(query))return 'related';
  if(/滤芯|净化|filter/i.test(query))return 'noFaq';
  if(/破损|损坏|坏了|退货|退款|换货|damage|return|refund/i.test(query))return 'damage';
  if(/物流|快递|配送|运输|发货|订单.*(哪|查|进度)|where.*order|shipping|track/i.test(query))return 'shipping';
  if(/保修|维修|warranty|repair/i.test(query))return 'warranty';
  return 'noRecall';
}
async function search(question,scenario){
  const query=question.trim();if(!query){$('#question').focus();return;}
  const sequence=++state.searchSequence;
  state.question=query;state.scenario=scenario||chooseScenario(query);
  state.hasAsked=true;$('#welcome-state').hidden=true;$('.results-wrap').hidden=false;
  storage.write('shulex-last-search',window.Tenant.bind({question:query}));
  $('#current-question').textContent=query;$('#question').value=query;
  $('#loading').hidden=false;$('#answer-card').hidden=true;$('#answer-card').setAttribute('aria-busy','true');$('#search-form button').disabled=true;
  await new Promise(resolve=>setTimeout(resolve,580));
  if(sequence!==state.searchSequence)return;
  window.Tenant.assert(currentScenario());currentScenario().sources.forEach(id=>window.Tenant.assert(sourceData[id]));
  render();
}
$('#search-form').addEventListener('submit',event=>{event.preventDefault();search($('#question').value);});
$('#question').addEventListener('input',()=>$('#question').setCustomValidity(''));
$('#copy-answer').addEventListener('click',async()=>{const content=$('#answer-body').innerText;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(content);}else{const field=document.createElement('textarea');field.value=content;field.style.position='fixed';field.style.opacity=0;document.body.append(field);field.select();if(!document.execCommand('copy'))throw new Error('copy failed');field.remove();}toast('回答已复制');}catch{toast('复制受浏览器限制，请直接选中回答文字复制');}});

// A shared set of real sample source files backs every source row and citation.
const policyPages={
  1:{title:'退换货与退款政策',sub:'适用范围与服务约定',body:'<h4>1. 适用范围</h4><p>本政策用于演示 Shulex Home 帮助中心的知识库问答与来源预览，所有服务期限和条件均为示例，不构成真实服务承诺。</p><h4>1.1 使用说明</h4><p>本文件包含服务申请材料、到货破损处理方式以及退款流程。实际处理应以正式发布的政策和支持团队审核结果为准。</p>'},
  2:{title:'申请售后前的准备',sub:'§2 申请材料',body:'<h4>2.1 准备购买信息</h4><p>请准备订单号、购买渠道、商品型号和收货日期。</p><h4>2.2 记录商品情况</h4><p>建议拍摄商品整体、破损位置近照和外包装。如有必要，可补充简短的视频。</p><h4>2.3 提交申请</h4><p>在帮助中心提交工单，填写联系邮箱与问题描述，并添加相关附件。</p>'},
  3:{title:'到货破损处理',sub:'§3.2 Damaged on arrival',body:'<p>对于运输中发生的破损，我们会根据实际情况协助处理。请在申请前保留商品和外包装，便于核实。</p><div class="document-highlight"><span class="highlight-label">本次回答引用的内容</span><p><strong>签收后 7 天内</strong>发现商品破损，可提交订单号、破损部位及外包装照片，申请以下服务：</p><ol><li><strong>免费更换受损配件：</strong>适用于可单独更换的局部配件，审核通过后安排补发，无需寄回整件商品。</li><li><strong>退货退款：</strong>适用于影响正常使用的破损。根据支持团队指引退回商品，验收通过后按原支付渠道退款。</li></ol></div><h4>3.3 注意事项</h4><p>请勿在收到支持团队指引前自行寄回商品。是否符合处理条件，以实际审核结果为准。</p>'},
  4:{title:'退款与后续跟进',sub:'§4 退款安排',body:'<h4>4.1 退款渠道</h4><p>退货验收通过后，退款按原支付渠道退回。</p><h4>4.2 到账时间</h4><p>支付渠道通常需要 3–5 个工作日到账，具体时间以支付机构为准。节假日及银行处理可能影响到账时间。</p><h4>4.3 需要进一步协助</h4><p>如有疑问，请通过帮助中心提交工单，提供原工单编号和订单信息。</p>'}
};
const documentData={
  warranty:{title:'产品保修与维修说明',sub:'§2 保修范围与申请方式',body:'<p>本说明适用于本示例所涵盖的 Shulex Home 商品。</p><div class="document-highlight"><span class="highlight-label">本次召回的相关内容</span><p>自购买之日起提供 <strong>12 个月有限保修</strong>，覆盖正常使用情况下的材料和制造缺陷。</p><p>正常损耗、意外损坏、不当使用及未经授权的改装不属于保修范围。</p></div><h4>2.1 如何申请</h4><p>请准备有效购买凭证、产品型号、故障描述和相关照片，通过帮助中心提交工单。</p><h4>2.2 审核与后续安排</h4><p>支持团队核实材料后，根据实际情况确认是否符合保修条件，并告知维修或更换安排。</p>'},
  shipping:{title:'订单配送与物流说明',sub:'§2 订单追踪',body:'<h4>2.1 发货通知</h4><div class="document-highlight"><span class="highlight-label">本次回答引用的内容</span><p>订单发货后，发货通知邮件中会提供<strong>物流单号与追踪链接</strong>。请检查下单邮箱及垃圾邮件文件夹。</p></div><h4>2.2 物流更新</h4><p>承运商首次扫描通常需要 1–2 个工作日。若超过 3 个工作日仍未更新，请提供订单号提交工单核实。</p><h4>2.3 地址修改</h4><p>未发货订单可以申请修改地址；已发货订单由支持团队联系承运商确认。是否可以修改，以实际处理结果为准。</p>'},
  filter:{title:'空气净化器使用说明',sub:'§4 滤芯维护',body:'<h4>4.1 查看滤芯寿命</h4><div class="document-highlight"><span class="highlight-label">本次召回的相关内容</span><p>在设备面板查看<strong>滤芯寿命百分比</strong>。滤芯更换指示灯亮起时，请根据实际使用情况检查并更换滤芯。</p><p>完成滤芯更换后，保持设备接通电源，<strong>长按滤芯键 5 秒</strong>。指示灯熄灭，表示滤芯寿命重置完成。</p></div><h4>4.2 使用注意事项</h4><p>更换前请先断开电源。本示例操作适用于演示型号，实际操作请先核对对应型号的正式手册。</p><h4>4.3 异常情况</h4><p>无法完成重置或出现手册未记载的指示灯状态时，请联系支持团队确认，不应据此推断故障原因。</p>'}
};

function documentHTML(data,page,total,highlight=true){return `<article class="document-page"><div class="document-brand"><strong>Shulex Home</strong><span>HELP CENTER / ${page?'POLICY':'PRODUCT GUIDE'}</span></div><h3>${data.title}</h3><p class="doc-sub">${data.sub} · 知识库示例资料</p>${highlight?data.body:data.body.replaceAll('document-highlight','document-excerpt')}<footer class="doc-footer"><span>Shulex Home · 仅供原型演示</span><span>${page?`${String(page).padStart(2,'0')} / ${String(total).padStart(2,'0')}`:'帮助中心文档'}</span></footer></article>`;}
function renderPDFPage(){const p=state.previewPage;$('#preview-content').innerHTML=`<div class="pdf-pagination"><button data-pdf-step="-1" aria-label="上一页" ${p===1?'disabled':''}>${icon('chevron')}</button><span>第 ${p} 页 / 共 4 页</span><button data-pdf-step="1" aria-label="下一页" ${p===4?'disabled':''}>${icon('chevron')}</button></div>${documentHTML(policyPages[p],p,4,p===3)}`;$('#preview-content').scrollTop=0;}
function openPreview(id){
  const source=sourceData[id];if(!source)return;try{window.Tenant.assert(source);}catch{toast('来源不属于当前租户知识库，已阻止预览');return;}
  state.previewId=id;$('#preview-title').textContent=source.title;$('#preview-type').textContent=source.type==='VIDEO'?'VIDEO SOURCE':source.type==='CSV'?'SPREADSHEET SOURCE':source.type==='PDF'?'PDF DOCUMENT':'KNOWLEDGE DOCUMENT';$('#preview-subtitle').textContent=source.subtitle;$('#preview-location').textContent=`命中位置：${source.location}`;$('#original-link').href=source.file;
  if(source.faqId){const faq=window.Learning.read().faqs.find(f=>f.id===source.faqId&&f.published);if(!faq)return;$('#preview-content').innerHTML=documentHTML({title:esc(faq.question),sub:'知识库 FAQ · 本地演示',body:'<div class="document-highlight"><span class="highlight-label">知识库已有 FAQ</span><p>'+esc(faq.answer).replaceAll('\n','<br>')+'</p></div>'});}
  else if(id==='policy'){state.previewPage=source.page;renderPDFPage();}
  else if(id==='video'){
    $('#preview-content').innerHTML=`<div class="video-frame"><video id="source-video" controls playsinline preload="metadata" aria-label="如何记录破损并申请售后，示例视频"><source src="assets/damage-guide.webm" type="video/webm">当前浏览器不支持视频播放，请打开原文件。</video></div><h3 class="media-title">如何记录破损并申请售后</h3><p class="video-description">示例教学视频 · 已定位到引用片段 00:04 · 可点击字幕跳转</p><div class="transcript"><h4>视频字幕</h4><button data-video-time="0"><span>00:00</span><span>收到商品后，请先检查商品和外包装。</span></button><button data-video-time="4" class="active"><span>00:04</span><span>拍摄商品整体、破损部位和外包装，保留清晰照片。</span></button><button data-video-time="8"><span>00:08</span><span>准备订单号，通过帮助中心提交售后申请。</span></button></div>`;
    const video=$('#source-video');video.addEventListener('loadedmetadata',()=>{video.currentTime=4;});video.addEventListener('timeupdate',()=>{$$('[data-video-time]').forEach(b=>b.classList.toggle('active',Math.floor(video.currentTime/4)===Number(b.dataset.videoTime)/4));});video.addEventListener('error',()=>toast('视频无法加载，可尝试打开原文件'));
  }else if(id==='timing'){
    const rows=[['服务类型','申请材料','处理节点','参考时效'],['破损配件补发','订单号、破损照片','审核通过后安排','1–2 个工作日'],['退货审核','订单号、退货原因','收到申请后审核','1–2 个工作日'],['退货退款','退货验收记录','验收通过后原路退回','3–5 个工作日'],['退款到账查询','订单号、工单编号','支付机构处理','以支付机构为准']];
    $('#preview-content').innerHTML=`<div class="sheet-wrap"><div class="sheet-info">${icon('table')}售后服务处理时效.csv<span>· 命中 A4:D5</span></div><table class="source-table"><thead><tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th></tr></thead><tbody>${rows.map((row,i)=>`<tr class="${i>=3?'hit':''}"><td>${i+1}</td>${row.map(c=>`<${i===0?'th':'td'}>${c}</${i===0?'th':'td'}>`).join('')}</tr>`).join('')}</tbody></table><div class="sheet-tabs"><span>服务时效</span></div></div><p class="sheet-note">紫色区域为本次回答引用的数据范围。工作日与处理时效均为演示数据。</p>`;
  }else{$('#preview-content').innerHTML=documentHTML(documentData[id]);}
  $('#preview-content').scrollTop=0;
  $('#preview-dialog').showModal();
}
$('#preview-dialog').addEventListener('close',()=>{$('#source-video')?.pause();});
$('#preview-content').addEventListener('click',event=>{const pager=event.target.closest('[data-pdf-step]');if(pager){state.previewPage=Math.max(1,Math.min(4,state.previewPage+Number(pager.dataset.pdfStep)));renderPDFPage();}const transcript=event.target.closest('[data-video-time]');if(transcript){$('#source-video').currentTime=Number(transcript.dataset.videoTime);$('#source-video').play().catch(()=>{});}});

function makeContextSnapshot(){
  if(!state.hasAsked)return {...window.Tenant.scope,question:'直接联系支持（未进行搜索）',answer:'用户未进行知识库搜索，直接提交工单。',sourceIds:[],scenario:'direct',vote:null,reasons:[],feedback:''};
  const content=document.createElement('div');content.innerHTML=currentScenario().answer;
  content.querySelectorAll('p,h4,li,.answer-option').forEach(element=>element.append('\n'));
  const saved=storage.read(feedbackKey(),null);
  const waiting=!$('#loading').hidden;
  return {...window.Tenant.scope,question:state.question,answer:content.textContent.trim(),sourceIds:[...currentScenario().sources],scenario:state.scenario,vote:waiting?(saved?.vote||null):state.vote,reasons:waiting?(saved?.reasons||[]):[...state.reasons],feedback:waiting?(saved?.detail||''):$('#feedback-detail').value.trim()};
}
function contextText(snapshot){return `用户问题：${snapshot.question}\n\nAI 回答：\n${snapshot.answer}\n\n引用来源：\n${snapshot.sourceIds.map(id=>`${sourceData[id].title} · ${sourceData[id].location}`).join('\n')||'未召回来源文件'}\n\n回答反馈：${snapshot.vote==='up'?'有帮助':snapshot.vote==='down'?'没帮助':'未评价'}${snapshot.reasons.length?'\n反馈原因：'+snapshot.reasons.join('、'):''}${snapshot.feedback?'\n补充反馈：'+snapshot.feedback:''}`;}
function openTicket(){
  state.ticketSnapshot=makeContextSnapshot();state.attachments=[];
  $('#ticket-form').reset();$('#ticket-form').hidden=false;$('#ticket-success').hidden=true;$('#ticket-title').textContent='让我们继续帮你解决';
  $('#ticket-description').value=state.question;$('#ticket-category').value=state.hasAsked?currentScenario().category:'其他问题';$('#ticket-context').textContent=contextText(state.ticketSnapshot);$('.ticket-context').open=false;$('.ticket-context').hidden=!state.hasAsked;
  $('#ticket-email').value=storage.read('shulex-last-email','');renderAttachments();$('#ticket-dialog').showModal();$('#ticket-dialog').scrollTop=0;
}
function renderAttachments(){
  $('#attachment-list').innerHTML=state.attachments.map((file,i)=>`<div class="attachment-chip"><span>${esc(file.name)} · ${Math.max(1,Math.round(file.size/1024))} KB</span><button class="icon-button" type="button" data-remove-attachment="${i}" aria-label="移除${esc(file.name)}">${icon('close')}</button></div>`).join('');
}
$('#ticket-files').addEventListener('change',event=>{const selected=[...event.target.files];$('#attachment-error').hidden=true;const tooLarge=selected.some(file=>file.size>10*1024*1024);if(tooLarge||state.attachments.length+selected.length>5){$('#attachment-error').textContent=tooLarge?'有附件超过 10 MB，请选择更小的文件。':'最多添加 5 个附件，请移除部分附件后再试。';$('#attachment-error').hidden=false;}else{state.attachments.push(...selected);renderAttachments();}event.target.value='';});
$('#attachment-list').addEventListener('click',event=>{const button=event.target.closest('[data-remove-attachment]');if(button){state.attachments.splice(Number(button.dataset.removeAttachment),1);$('#attachment-error').hidden=true;renderAttachments();}});
$('#ticket-form').addEventListener('submit',event=>{
  event.preventDefault();const email=$('#ticket-email').value.trim();const description=$('#ticket-description').value.trim();
  if(description.length<5){$('#ticket-description').setCustomValidity('请至少填写 5 个有效字符。');$('#ticket-description').reportValidity();return;}
  const ticketId=`SH-DEMO-${Date.now().toString(36).toUpperCase()}`;
  const ticket={...window.Tenant.scope,id:ticketId,email,category:$('#ticket-category').value,order:$('#ticket-order').value.trim(),description,attachments:state.attachments.map(({name,size,type})=>({name,size,type})),context:state.ticketSnapshot.scenario==='direct'?{...state.ticketSnapshot,question:description}:state.ticketSnapshot,time:new Date().toISOString(),demo:true};
  try{window.Workflow.createTicket(ticket);}catch{toast('当前浏览器无法保存工单，请检查本地存储后重试');return;}storage.write('shulex-last-email',email);
  $('#success-email').textContent=email;$('#success-id').textContent=ticketId;$('#ticket-form').hidden=true;$('#ticket-success').hidden=false;$('#ticket-title').textContent='已收到你的演示申请';$('#ticket-dialog').scrollTop=0;$('#ticket-success button').focus();
});
$('#ticket-description').addEventListener('input',()=>$('#ticket-description').setCustomValidity(''));

function addChatMessage(text,type='agent'){
  const el=document.createElement('div');el.className=`message ${type}`;el.textContent=text;$('#chat-messages').append(el);$('#chat-messages').scrollTop=$('#chat-messages').scrollHeight;
  if(state.chatSession){state.chatSession.messages.push(window.Tenant.bind({text,type}));storage.write('shulex-demo-chat',state.chatSession);}
}
function updateChatStatus(){
  $('#chat-status').textContent=state.online?'在线 · 演示会话':'离线 · 可留言创建工单';$('#chat-launcher-label').textContent=state.online?'在线客服':'留言支持';$('.chat-launcher-icon .status-dot').style.background=state.online?'#43b996':'#bac0ce';$('#chat-form').hidden=!state.online;$('#chat-offline').hidden=state.online;
}
function toggleChat(force){
  const open=typeof force==='boolean'?force:$('#chat-panel').hidden;$('#chat-panel').hidden=!open;$('#chat-launcher').setAttribute('aria-expanded',String(open));
  if(open){
    if(!state.chatSession){
      const saved=storage.read('shulex-demo-chat',null);state.chatSession=window.Tenant.owns(saved)&&Array.isArray(saved.messages)?{...saved,messages:saved.messages.filter(window.Tenant.owns)}:window.Tenant.bind({question:state.question,messages:[]});
      $('#chat-messages').replaceChildren();
      if(state.chatSession.messages.length){for(const msg of state.chatSession.messages){const el=document.createElement('div');el.className=`message ${['user','agent','context'].includes(msg.type)?msg.type:'agent'}`;el.textContent=msg.text;$('#chat-messages').append(el);}}
      else{addChatMessage('你好，这里是 Shulex Home 支持。你可以在这里补充问题。\n本窗口为演示，不会连接真实坐席。');}
    }
    if(state.chatSession.question!==state.question||!state.chatSession.context){state.chatSession.question=state.question;state.chatSession.context=makeContextSnapshot();addChatMessage(state.hasAsked?`当前问题：${state.question}\n已附上本次问答与 ${currentScenario().sources.length} 个来源文件。`:'你正在直接联系支持，可以在下方描述需要帮助的问题。','context');}
    updateChatStatus();$('#chat-messages').scrollTop=$('#chat-messages').scrollHeight;if(state.online)$('#chat-input').focus();
  }
}
$('#chat-launcher').addEventListener('click',()=>toggleChat());$('#close-chat').addEventListener('click',()=>toggleChat(false));
$('#chat-form').addEventListener('submit',event=>{event.preventDefault();const text=$('#chat-input').value.trim();if(!text){$('#chat-input').focus();return;}addChatMessage(text,'user');$('#chat-input').value='';setTimeout(()=>addChatMessage('演示回复：已记录你的补充说明。正式接入 LiveChat 后，这里将由在线坐席继续处理；需要邮件跟进时，也可以提交工单。'),450);});
$('#chat-input').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();if($('#chat-input').value.trim())$('#chat-form').requestSubmit();}});

$('#demo-toggle').addEventListener('click',()=>{const open=$('#demo-menu').hidden;$('#demo-menu').hidden=!open;$('#demo-toggle').setAttribute('aria-expanded',String(open));});
$('#scenario-buttons').innerHTML=Object.entries(scenarios).map(([id,s])=>`<button data-scenario="${id}" aria-pressed="false">${s.label}${icon('arrow')}</button>`).join('');
$('#scenario-buttons').addEventListener('click',event=>{const button=event.target.closest('[data-scenario]');if(button){const id=button.dataset.scenario;search(scenarios[id].question,id);$('#demo-menu').hidden=true;$('#demo-toggle').setAttribute('aria-expanded','false');}});
$('#online-toggle').addEventListener('change',event=>{state.online=event.target.checked;updateChatStatus();});
document.addEventListener('click',event=>{
  const source=event.target.closest('[data-source]');if(source)openPreview(source.dataset.source);
  const ticket=event.target.closest('[data-action="ticket"]');if(ticket){toggleChat(false);openTicket();}
  const close=event.target.closest('[data-close]');if(close)$(`#${close.dataset.close}`).close();
  if(!event.target.closest('.demo-controls')){$('#demo-menu').hidden=true;$('#demo-toggle').setAttribute('aria-expanded','false');}
});
for(const dialog of $$('dialog')){
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
}
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('dialog[open]')){toggleChat(false);$('#demo-menu').hidden=true;$('#demo-toggle').setAttribute('aria-expanded','false');}});

updateChatStatus();
const entryParams=new URL(location.href).searchParams;
const incomingQuery=entryParams.get('q')||(entryParams.has('resume')?storage.read('shulex-last-search',null)?.question:'');
if(incomingQuery)search(incomingQuery);
