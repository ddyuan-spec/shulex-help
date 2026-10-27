'use strict';

// Review annotations are separate from product behavior. Opening a numbered
// annotation only explains a feature; it never runs the AI or sends a reply.
const CX_REVIEW_NOTES = [
  {id:'agent',title:'主Agent → 工单助手 → 工单skill → 回流',anchor:'.partner-heading',ai:true,pin:'left',flow:'主Agent下发工单任务 → cxclaw工单助手调用工单功能／skill → 结果与状态回流主Agent',points:[
    '主Agent负责全局任务分发；cxclaw工单助手是它负责工单领域的子Agent，不是另一个主Agent。',
    '所有工单板块的AI任务固定交给同一个工单助手。总结、草拟、润色、关联订单物流是它可调用的工单功能／skill，不要求每个按钮都独立建一个Agent。',
    '处理结果既在工单内展示，也需要回流主Agent，供主Agent汇总和继续处理。任务与结果始终带原工单标识。',
    '当前顶栏是工单助手快捷入口，未展示主Agent全局对话；此版仍是本地演示，真实分发和回流尚未接入。'
  ],try:'先看本条的整体关系，再选第13条看能力边界、第14条看哪些信息回流。'},
  {id:'tabs',title:'详情／cxclaw工单助手 Tab',anchor:'.context-tabs',pin:'tab',points:[
    '“详情”查看客户信息、备注、相关工单和已关联订单；“cxclaw工单助手”处理当前工单的 AI 任务。',
    '两个 Tab 使用同一个右侧栏，同一时间只显示一个，不再从右下角弹出助手挡住详情。',
    '切换 Tab 不会清空草稿或 AI 问答。想核对订单时切到“详情”，再切回来即可。'
  ],try:'点击“详情”，看看客户和订单，再切回“cxclaw工单助手”。'},
  {id:'summary',title:'总结工单：写入工单会话的黄色卡片',anchor:'.ticket-summary-card, [data-tool="summary"]',ai:true,flow:'主Agent → 工单助手调用总结skill → 会话显示AI总结＋结果回流主Agent',points:[
    '输入：当前这张工单的会话内容，以及页面中已有的关联订单信息。',
    '输出：中间工单会话新增浅黄色“AI总结”卡片，沿用现有 Emotion、FinalSolution、Summary 和右上时间；不再只放在助手问答里。',
    '这是内部工单记录，不会填入回复框或发送给客户。清空助手问答仍保留总结；切换工单分别保存，刷新重置。没有依据的情绪或处理方案显示“待确认”。'
  ],try:'点击“总结工单”，查看中间的黄色卡片。#1587 会提示订单号需要核对；也可以切到“详情”，总结仍在会话里。'},
  {id:'draft',title:'草拟回复：先出建议，再由人工应用',anchor:'[data-tool="draft"]',ai:true,flow:'点草拟回复 → 右栏看建议 → 应用到编辑框 → 人工修改 → 发送',points:[
    '输入：当前工单的客户消息和已有上下文；输出是一段建议回复。',
    '这里只生成建议，不会直接填入输入框，也不会自动发送。',
    '本版把原“推荐回复”和“草拟回复”集中为此入口；这属于原型整合方案，真实后台服务尚未合并。'
  ],try:'点“草拟回复”，结果出来后再点“应用到编辑框”。'},
  {id:'polish',title:'AI润色：改写你已经输入的草稿',anchor:'[data-tool="polish"]',ai:true,flow:'左侧先写草稿 → 点 AI润色 → 查看改写 → 手动应用',points:[
    '它处理的是左侧回复框里已经输入的文字，不是重新总结整段工单。',
    '回复框为空时，会提示你先输入内容。生成的改写放在右侧，不会自动覆盖草稿。',
    '点击“应用到编辑框”后才替换原文；你仍可继续修改。'
  ],try:'在左侧回复框输入“我马上查一下”，再点“AI润色”。'},
  {id:'orders',title:'订单物流：核对已有信息，不补造轨迹',anchor:'[data-tool="orders"]',ai:true,points:[
    '读取当前工单中已关联的订单，以及客户消息里提供的订单号或包裹号。',
    '#1587 的示例包含订单金额 $12.34，但客户消息里的订单号与关联订单号不同，因此需要人工核对。',
    '没有关联订单时提示暂无订单；没有物流轨迹时明确说明缺少轨迹。不会自动发货、退款或修改订单。'
  ],try:'在 #1587 点“订单物流”；切到 #1590 再点一次，可看到无关联订单的处理。'},
  {id:'apply',title:'AI结果、应用、复制和发送的区别',anchor:'#ai-conversation',ai:true,pin:'left',flow:'AI结果（建议） → 应用（替换草稿） → 发送（由人工点击）',points:[
    '回复、润色等右侧结果只是一份建议；“复制”只复制文字。工单总结单独写入中间的黄色内部记录，不需要应用。',
    '“应用到编辑框”会替换左侧回复框的全部内容。已有草稿时，先确认是否需要保留，再应用。',
    '应用后不会发送；需在左侧检查、修改并点“发送”。本地原型的发送只追加到演示会话，不会发给真实客户。'
  ],try:'生成草拟回复并应用，观察左侧输入框；此时消息还没有进入会话。'},
  {id:'question',title:'自由问答：直接说你想处理什么',anchor:'#ai-form',ai:true,pin:'left',points:[
    '这里只处理当前工单相关问题，例如“总结客户诉求”“查询本单关联物流”“拟一段回复”。目标设计中，这些任务统一由主Agent交给工单助手。',
    '按 Enter 提交，Shift+Enter 换行；空输入和执行中不能重复提交。',
    '工单助手只使用工单功能和skill；跨出工单范围时交回主Agent。当前原型仍按关键词展示示例，尚未实现真实范围校验、转交、skill调用或信息回流。'
  ],try:'输入“订单物流有什么信息？”，按 Enter。'},
  {id:'context',title:'切换工单后，数据会不会混在一起',anchor:'.partner-context',ai:true,pin:'left',points:[
    '右栏的 #编号代表 AI 当前处理的工单。选中另一张工单后，客户、会话、订单和 AI 上下文一起切换。',
    '回复草稿、未提交的问题、AI 问答记录按工单分别保存。切回原工单，可继续之前的内容。',
    '生成中切换工单，结果仍归原工单。后续回流也要携带任务和工单标识，不能混入新工单。当前只有页面内保存，未接入主Agent；刷新恢复初始示例。'
  ],try:'在 #1587 写草稿，再打开 #1590，最后回到 #1587 检查草稿。'},
  {id:'layout',title:'卡片布局与表格抽屉是同一套功能',anchor:'.layout-switch',pin:'outside',points:[
    '左下第一个按钮是卡片布局：工单列表、会话和右栏并排显示。',
    '第二个按钮是表格布局：点击列表行打开工单抽屉；详情和cxclaw工单助手仍在抽屉右栏切换。',
    '布局变化不改变工单数据或 AI 能力。表格抽屉可用右上角收起按钮或 Esc 关闭，再从表格打开另一单。'
  ],try:'点击左下两个布局按钮，检查当前工单和草稿是否保留。'},
  {id:'existing',title:'事件、稍后处理、分配：原有工单操作',anchor:'.conversation-actions',pin:'left',points:[
    '这些是截图里已有的工单操作，本次保留；并不是新增加的 AI 工具。',
    '事件展示固定演示记录；“稍后处理”只在本地记录选定时间，不会真正定时唤醒。',
    '“分配”只修改原型显示的处理人；选择 AI 也不会启动真实接管。AI处理中示例保留“转人工”，点击后在原型中进入待处理。'
  ],try:'打开“稍后处理”可查看时间选项，不需要时点取消。'},
  {id:'clear',title:'右上角新建图标：清空当前工单问答',anchor:'#new-ai-chat',ai:true,points:[
    '有 AI 问答记录时，点击该图标会弹出清空确认；取消后记录保留，确认后才清空。',
    '只清空当前工单的 AI 问答，不删除客户消息、不清空左侧回复草稿，也不影响其他工单。',
    '如果还没有问答记录，点击后只是定位到底部提问框。'
  ],try:'先生成一次总结，再点此图标，检查确认框中的工单编号。'},
  {id:'scope',title:'固定分发与工单skill的能力边界',anchor:'.tool-section-title',ai:true,pin:'left',flow:'任一工单板块 → 主Agent固定分发 → cxclaw工单助手 → 仅工单功能／skill',points:[
    '卡片、表格、不同渠道和AI处理中／人工待处理等队列，共用同一个工单助手。切换板块不等于切换Agent。',
    '主Agent下发任务时带上任务意图、工单号及该工单相关上下文。工单内直接点工具或提问，也沿用这条分发关系，用户不用手选子Agent。',
    '可用能力限定在工单场景：会话总结、回复建议、草稿润色、当前工单关联订单／物流等。不会因此获得整个订单后台或其他业务模块的通用操作能力。',
    '遇到工单以外的需求，工单助手把需求与已有上下文交回主Agent，由主Agent决定下一步；不自行调用其他领域skill。此条说明目标架构，当前未实现服务端分发与范围限制。'
  ],try:'切换卡片／表格或不同工单，观察助手身份不变，只有工单上下文变化。'},
  {id:'return',title:'处理信息如何回流主Agent',anchor:'#ai-conversation',ai:true,pin:'right',flow:'工单助手 → 结果＋依据＋实际状态＋待办 → 主Agent汇总并继续处理',points:[
    '已确认的方向：信息不能只停在工单侧栏；工单助手处理后的结果和相关上下文需要回流主Agent。',
    '建议回流内容：任务标识、工单号、用户意图、上下文摘要、调用的工单功能／skill、结果及依据、当前处理状态、未解决或待人工确认事项。具体字段和接口尚未接入。',
    '状态要如实回传：已生成建议、已应用到草稿、人工已发送是三个不同阶段。缺少订单、无法完成、等待人工确认也要交代原因，不能把“生成”当“完成发送”。',
    '主Agent收到后更新这次任务上下文、汇总结果并决定后续动作。回流不等于自动向客户发送，也不代表当前原型已实现跨Agent记忆。'
  ],try:'草拟回复后，再应用到编辑框，对比两个阶段。后续真实回流应区分这两个状态，当前仅演示工单本地操作。'}
];

const cxReviewUi=document.createElement('div');
cxReviewUi.id='prototype-review';
cxReviewUi.dataset.reviewOnly='true';
cxReviewUi.innerHTML=`<div id="review-pins" aria-label="功能批注编号"></div>
  <aside id="review-reader" class="review-reader" aria-label="功能逻辑批注">
    <header class="review-header"><div><span class="review-eyebrow">原型评审批注</span><h2>功能逻辑批注</h2></div><button id="review-close" aria-label="隐藏逻辑批注">×</button></header>
    <div class="review-intro"><a class="review-changes-link" href="changes.html">← 本次改动清单</a><br>点界面上的编号看说明。编号只打开批注，不会执行对应功能。</div>
    <label class="review-topic-label" for="review-topic">选择要看的功能</label>
    <select id="review-topic">${CX_REVIEW_NOTES.map((note,i)=>`<option value="${note.id}">${i+1}. ${note.title}</option>`).join('')}</select>
    <article id="review-note-body" aria-live="polite"></article>
    <div class="review-navigation"><button id="review-prev">上一条</button><span id="review-progress"></span><button id="review-next">下一条</button></div>
    <details class="review-boundary"><summary>这版原型能做到哪里？</summary><p>AI、发送、分配和稍后处理均为本地演示，没有连接线上服务。只内置少量截图示例工单，队列总数沿用截图。联系人、报表等其他模块只保留原图外观。</p><a href="功能逻辑说明.md" target="_blank" rel="noopener">查看完整逻辑说明 ↗</a></details>
    <div id="review-current-context" class="review-current-context"></div>
  </aside>`;
document.getElementById('mainArea').append(cxReviewUi);
const cxReviewToggle=document.createElement('button');
cxReviewToggle.id='review-toggle';
cxReviewToggle.className='review-toggle';
cxReviewToggle.setAttribute('aria-controls','review-reader');
cxReviewUi.append(cxReviewToggle);
const cxReviewState={enabled:false,index:0,frame:0};
const cxReviewById=id=>document.getElementById(id);

function cxReviewIsVisible(el){
  if(!el)return false;
  const r=el.getBoundingClientRect();
  if(!r.width||!r.height||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)return false;
  for(let parent=el;parent;parent=parent.parentElement){if(parent.hidden||getComputedStyle(parent).display==='none')return false;}
  // Do not pin controls covered by the table drawer or clipped by a scroller.
  // Ignore the review layer itself when checking the underlying product UI.
  const x=Math.max(1,Math.min(innerWidth-1,(Math.max(0,r.left)+Math.min(innerWidth,r.right))/2));
  const y=Math.max(1,Math.min(innerHeight-1,(Math.max(0,r.top)+Math.min(innerHeight,r.bottom))/2));
  const top=document.elementsFromPoint(x,y).find(node=>!node.closest('#prototype-review'));
  return !!top&&(top===el||el.contains(top));
}
function cxReviewRender(){
  const note=CX_REVIEW_NOTES[cxReviewState.index];
  cxReviewById('review-topic').value=note.id;
  cxReviewById('review-note-body').innerHTML=`<h3><span>${cxReviewState.index+1}</span>${note.title}</h3>${note.flow?`<div class="review-flow">${note.flow}</div>`:''}<ol>${note.points.map(point=>`<li>${point}</li>`).join('')}</ol><div class="review-try"><b>你可以这样试</b><p>${note.try}</p></div>`;
  cxReviewById('review-progress').textContent=`${cxReviewState.index+1} / ${CX_REVIEW_NOTES.length}`;
  cxReviewById('review-prev').disabled=cxReviewState.index===0;
  cxReviewById('review-next').disabled=cxReviewState.index===CX_REVIEW_NOTES.length-1;
  cxReviewSchedule();
}
function cxReviewSelect(index){
  cxReviewState.index=Math.max(0,Math.min(index,CX_REVIEW_NOTES.length-1));
  if(CX_REVIEW_NOTES[cxReviewState.index].ai)document.getElementById('global-partner').click();
  cxReviewRender();
}
function cxReviewSetEnabled(enabled){
  cxReviewState.enabled=enabled;
  cxReviewById('review-reader').hidden=!enabled;
  cxReviewById('review-pins').hidden=!enabled;
  cxReviewToggle.textContent=enabled?'逻辑批注 · 已开':'逻辑批注';
  cxReviewToggle.setAttribute('aria-expanded',String(enabled));
  try{localStorage.setItem('cxclaw-review-enabled',String(enabled));}catch{}
  if(enabled)cxReviewRender();
  else document.querySelectorAll('.review-highlight').forEach(el=>el.classList.remove('review-highlight'));
}
function cxReviewSchedule(){
  if(cxReviewState.frame)return;
  cxReviewState.frame=requestAnimationFrame(()=>{cxReviewState.frame=0;cxReviewPosition();});
}
function cxReviewPosition(){
  if(!cxReviewState.enabled)return;
  const pins=cxReviewById('review-pins');
  pins.replaceChildren();
  document.querySelectorAll('.review-highlight').forEach(el=>el.classList.remove('review-highlight'));
  CX_REVIEW_NOTES.forEach((note,index)=>{
    const target=document.querySelector(note.anchor);
    if(!cxReviewIsVisible(target))return;
    const r=target.getBoundingClientRect();
    let x=r.right-8,y=r.top-8;
    if(note.pin==='left'){x=r.left-8;y=r.top+7;}
    if(note.pin==='tab'){x=r.right-58;y=r.top+9;}
    if(note.pin==='outside'){x=r.left+3;y=r.top-8;}
    x=Math.max(3,Math.min(innerWidth-26,x));y=Math.max(3,Math.min(innerHeight-26,y));
    const pin=document.createElement('button');
    pin.className='review-pin'+(index===cxReviewState.index?' selected':'');
    pin.textContent=index+1;
    pin.setAttribute('aria-label',`批注${index+1}：${note.title}`);
    pin.title=`${index+1}. ${note.title}`;
    pin.style.left=x+'px';pin.style.top=y+'px';
    pin.addEventListener('click',event=>{event.stopPropagation();cxReviewSelect(index);});
    pins.append(pin);
    if(index===cxReviewState.index)target.classList.add('review-highlight');
  });
  const context=document.getElementById('ai-context-caption').textContent;
  cxReviewById('review-current-context').textContent='当前示例：'+context+' · 批注不属于产品界面';
}
cxReviewToggle.addEventListener('click',()=>cxReviewSetEnabled(!cxReviewState.enabled));
cxReviewById('review-close').addEventListener('click',()=>cxReviewSetEnabled(false));
cxReviewById('review-topic').addEventListener('change',event=>cxReviewSelect(CX_REVIEW_NOTES.findIndex(note=>note.id===event.target.value)));
cxReviewById('review-prev').addEventListener('click',()=>cxReviewSelect(cxReviewState.index-1));
cxReviewById('review-next').addEventListener('click',()=>cxReviewSelect(cxReviewState.index+1));
document.addEventListener('click',cxReviewSchedule);
document.addEventListener('scroll',cxReviewSchedule,true);
window.addEventListener('resize',cxReviewSchedule);
const cxReviewObserver=new MutationObserver(cxReviewSchedule);
for(const id of ['ticket-workbench','viewTickets'])cxReviewObserver.observe(document.getElementById(id),{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','aria-selected']});
cxReviewObserver.observe(document.getElementById('mainArea'),{attributes:true,attributeFilter:['data-layout','data-ticket','data-tab']});
let cxReviewInitiallyEnabled=true;
try{cxReviewInitiallyEnabled=localStorage.getItem('cxclaw-review-enabled')!=='false';}catch{}
const cxReviewParams=new URLSearchParams(location.search);
if(cxReviewParams.has('notes'))cxReviewInitiallyEnabled=cxReviewParams.get('notes')!=='0';
cxReviewSetEnabled(cxReviewInitiallyEnabled);
const cxReviewRequestedNote=CX_REVIEW_NOTES.findIndex(note=>note.id===cxReviewParams.get('note'));
if(cxReviewRequestedNote>=0&&cxReviewState.enabled)cxReviewSelect(cxReviewRequestedNote);
