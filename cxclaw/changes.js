'use strict';

// This page documents agreed scope. Links only locate a prototype and annotation.
const CX_CHANGE_GROUPS=[
  {id:'entry',title:'01 · 界面入口与AI能力整合',hint:'6项',rows:[
    {id:'C01',name:'助手入口迁移',state:'原型可交互',before:'从右下角浮球呼出艾登侧滑助手，会遮挡工单详情。',after:'移除旧浮球；右侧详情栏顶部增加“详情／cxclaw工单助手”Tab，同栏切换。',checks:['切换页签只替换右栏内容，不盖住工单会话。','两种布局使用同一入口；切换不清空草稿和问答。'],note:'tabs',step:'切换详情／助手Tab',ref:'原始需求第2点'},
    {id:'C02',name:'统一助手名称',state:'原型可交互',before:'旧入口名为“艾登 · AI助手”；原型中曾使用“智能伙伴”。',after:'工单原型统一命名“cxclaw工单助手”，同步顶栏、页签、标题、结果署名、提示和批注。',checks:['显示名称使用用户指定的小写cxclaw。','改名不改变主Agent与工单助手的上下级关系。'],note:'agent',step:'查看顶栏、页签和助手标题',ref:'后续命名确认'},
    {id:'C03',name:'工单总结入口与结果',state:'原型可交互',before:'标题栏已有AI总结；艾登助手中另有“总结工单”。已有黄色总结卡片位于中间会话。',after:'总结入口归入助手的工单工具；结果仍写中间工单会话，复用现有黄色“AI总结”卡片。助手仅反馈已添加。',checks:['保留AI图标、时间、Emotion／FinalSolution／Summary字段。','内部记录不填回复框、不发客户；不新增另一套总结样式。'],note:'summary',step:'点“总结工单”，查看中间黄卡',ref:'原始需求第3点＋总结位置确认'},
    {id:'C04',name:'推荐回复与草拟回复',state:'入口合并方案',before:'回复框下方“推荐回复”和艾登助手“草拟回复”分散。两者后端是否相同未验证。',after:'原型统一为助手工单工具中的“草拟回复”；建议先出现在右栏，再由人工应用。',checks:['生成不自动填草稿、不自动发送；应用后可修改。','合并的是入口方案；真实服务复用关系仍需开发核对。'],note:'draft',step:'草拟回复 → 应用到编辑框',ref:'原始需求第3点'},
    {id:'C05',name:'AI润色入口迁移',state:'原型可交互',before:'回复框底部紫色魔杖提供AI润色。',after:'入口集中到助手的工单工具；处理当前人工草稿，改写结果在右栏展示。',checks:['无草稿时提示先输入，不生成无依据回复。','人工应用后才替换草稿，仍需人工发送。'],note:'polish',step:'左侧写草稿，再点“AI润色”',ref:'原始需求第3点'},
    {id:'C06',name:'订单物流与自由问答',state:'原型可交互',before:'订单物流快捷按钮和自由问答在艾登浮动助手中。',after:'随助手迁移至工单页签，保留“订单物流”及底部提问框，使用当前工单上下文。',checks:['仅使用本工单关联信息；缺订单或轨迹时明确提示。','输入问题Enter提交、Shift+Enter换行，结果不自动发客户。'],note:'orders',step:'#1587看已有订单，#1590看缺订单',extra:{note:'question',label:'查看自由问答',ticket:1590},ref:'原始需求第2、3点'}
  ]},
  {id:'agents',title:'02 · Agent分工与处理规则',hint:'5项',rows:[
    {id:'C07',name:'主Agent固定分发',state:'架构约定 · 未接入',type:'arch',before:'新需求规定CXClaw为主Agent；原有系统是否已有该调度链路未验证。',after:'所有工单板块的AI任务，固定由主Agent交给cxclaw工单助手。工单助手作为工单领域子Agent处理。',checks:['卡片、表格、渠道、状态队列共用同一个工单助手。','工单内直接点工具也沿用该关系，不要求用户手选Agent。'],note:'agent',step:'阅读批注1的任务下发与回流关系',ref:'原始主Agent需求＋多Agent关系确认'},
    {id:'C08',name:'工单功能与skill边界',state:'架构约定 · 未接入',type:'arch',before:'本轮新增明确的工单领域能力限制，现有权限与skill机制未验证。',after:'工单助手只使用工单相关功能／skill；工具不必各自建成独立Agent。跨领域需求交回主Agent。',checks:['订单物流能力只服务当前工单，不等于获得全订单后台操作权限。','真实skill调用、范围校验及越界转交均需后续接入。'],note:'scope',step:'阅读批注13的固定分发与范围',ref:'多Agent关系确认'},
    {id:'C09',name:'处理信息回流主Agent',state:'架构约定 · 未接入',type:'arch',before:'本轮明确处理信息后续需要回主Agent；现有回流协议未验证。',after:'工单助手把结果、依据、实际状态及待确认事项回流主Agent，用于汇总和继续处理。',checks:['携带任务／工单标识，区分已生成、已应用、人工已发送。','具体回流字段是实施建议；当前没有真实回流或跨Agent记忆。'],note:'return',step:'阅读批注14的回流内容与状态',ref:'多Agent关系确认'},
    {id:'C10',name:'工单上下文隔离',state:'原型可交互',before:'原艾登助手已带工单编号；原有跨工单保存策略未完整验证。',after:'本版按工单分别保留草稿、未提交问题及AI问答；异步结果仍归原工单。回流也须带原工单标识。',checks:['换单后不混用客户、订单或AI结果；切回可继续。','布局／Tab切换保留；当前仅页面内存，刷新重置。'],note:'context',step:'写草稿，切换工单，再切回',ref:'工单上下文规则＋回流约定'},
    {id:'C11',name:'生成、应用、发送的衔接',state:'沿用并明确规则',type:'kept',before:'现有助手以建议为主，回复编辑器由人工发送。',after:'整合后继续保留人工控制；回复与润色的结果先展示，应用只替换整段草稿，发送仍由人工点击。',checks:['复制只复制；应用不等于发送。','总结独立写内部记录；真实回流应反映实际阶段。'],note:'apply',step:'生成回复，应用后检查仍未发送',ref:'原有人工控制规则＋回流状态细化'}
  ]},
  {id:'delivery',title:'03 · 布局适配与评审交付',hint:'3项',rows:[
    {id:'C12',name:'两种现有布局适配',state:'原型可交互',before:'已有卡片并列布局、表格＋工单抽屉两种排版。',after:'两种布局均应用相同页签、集中工单工具和黄色总结卡片，复用相同工单上下文。',checks:['保留原来的布局和切换方式，不另造一套工作台。','抽屉关闭后可重开；切换布局不丢草稿及AI记录。'],note:'layout',layout:'table',step:'查看表格抽屉，再切回卡片',extra:{note:'layout',label:'查看卡片布局',layout:'card'},ref:'原始需求第2、4点'},
    {id:'C13',name:'功能与架构批注',state:'评审辅助新增',before:'交互原型单看按钮，难以理解结果落点、操作规则和Agent关系。',after:'增加14项可关闭批注；包含用途、步骤、结果、边界以及主Agent下发、工单skill范围和回流。',checks:['点击编号只读说明，不执行AI或发送。','关闭后保持工单产品界面；两种布局均可阅读。'],note:'agent',step:'点编号、切目录、查看13／14条',ref:'功能批注与多Agent批注请求'},
    {id:'C14',name:'本次改动清单入口',state:'评审辅助新增',before:'需求分散在沟通、批注与交互页面，开发容易漏项。',after:'本页集中记录改动范围、原入口、具体变化、关键验收和状态。每行直达对应功能批注，原型批注可返回本页。',checks:['每个原型链接定位对应功能，不自动执行工具。','架构、沿用和待确认项分别标明；不能按“可点”判断已上线。'],note:'agent',step:'进入原型，点“本次改动清单”返回',ref:'本轮开发清单页请求'}
  ]},
  {id:'kept',title:'04 · 涉及但保留的功能与待确认项',hint:'4项，避免误开发',rows:[
    {id:'K01',name:'原有工单操作',state:'沿用 · 非新增',type:'kept',before:'事件、稍后处理、分配、转人工等由工单状态与权限控制。',after:'本轮不重做这些操作，不将其误改成新增AI工具；原型沿用截图已有入口。',checks:['分配不等于主Agent的任务分发，两者是不同业务概念。','原型分配、暂挂均是本地演示，线上执行和定时唤醒未接入。'],note:'existing',tab:'details',step:'查看事件、稍后处理、分配',ref:'原图复用与不擅自增改要求'},
    {id:'K02',name:'客户详情与关联订单',state:'沿用 · 非新增',type:'kept',before:'客户信息、备注、相关工单、电商信息在右侧详情栏。',after:'保留原字段和信息结构；只增加与工单助手的Tab切换，总结继续在中间会话。',checks:['详情未被浮动助手覆盖，相关字段和订单金额沿用截图。','没有提供的订单与物流内容不补造。'],note:'tabs',tab:'details',step:'打开详情核对客户及订单字段',ref:'原始需求第2、4点'},
    {id:'K03',name:'清空当前工单问答',state:'沿用原型规则',type:'kept',before:'工单助手有右上新建问答图标；本轮未核实旧系统全部清空语义。',after:'本版有问答记录时需确认后清空，范围只限当前工单的AI问答。',checks:['不删客户会话、黄色总结、人工草稿或其他工单。','没有记录时只定位提问框；不推定已清除主Agent记忆。'],note:'clear',step:'先生成一次内容，再点新建问答',ref:'原型已有规则；保持清空边界'},
    {id:'P01',name:'人工待处理缺失按钮',state:'待确认 · 未补',type:'pending',before:'原始需求提出AI处理中与人工待处理按钮存在差异。抽查未确认应补到人工侧的通用缺失按钮。',after:'继续保留核对结果，不把AI状态特有的转人工入口直接加到人工待处理。',checks:['事件、闹钟等已有入口不重复新增；状态／权限差异不直接当缺失。','新增或调整按钮需确认具体目标行为；本版未擅自补充。'],note:'existing',tab:'details',step:'查看现有工单操作，勿当已补齐',ref:'原始需求第1点＋现状核对清单'}
  ]}
];

const cxChangeEscape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function cxChangeUrl(item){
  const params=new URLSearchParams({layout:item.layout||'card',ticket:String(item.ticket||1587),tab:item.tab||'ai',notes:'1',note:item.note});
  return 'index.html?'+params.toString();
}
function cxChangeRow(item){
  const extra=item.extra?`<a class="change-open-secondary" href="${cxChangeEscape(cxChangeUrl(item.extra))}" target="_blank" rel="noopener">${cxChangeEscape(item.extra.label)} ↗</a>`:'';
  return `<tr id="${item.id}" data-change-id="${item.id}"><td><span class="change-code">${item.id}</span><span class="change-feature">${cxChangeEscape(item.name)}</span><span class="change-state ${item.type||''}">${cxChangeEscape(item.state)}</span><span class="change-ref">${cxChangeEscape(item.ref)}</span></td><td>${cxChangeEscape(item.before)}</td><td>${cxChangeEscape(item.after)}</td><td><ul>${item.checks.map(text=>`<li>${cxChangeEscape(text)}</li>`).join('')}</ul></td><td><a class="change-open" aria-label="${item.id} ${cxChangeEscape(item.name)}：查看交互原型" href="${cxChangeEscape(cxChangeUrl(item))}" target="_blank" rel="noopener">查看交互原型 ↗</a>${extra}<p class="change-step">${cxChangeEscape(item.step)}</p></td></tr>`;
}
document.getElementById('change-sections').innerHTML=CX_CHANGE_GROUPS.map(group=>`<a href="#${group.id}">${cxChangeEscape(group.title.slice(5))} · ${group.rows.length}</a>`).join('');
document.getElementById('change-tables').innerHTML=CX_CHANGE_GROUPS.map(group=>`<section class="change-section" id="${group.id}"><div class="change-section-heading"><h2>${cxChangeEscape(group.title)}</h2><span>${cxChangeEscape(group.hint)}</span></div><div class="change-table-wrap"><table class="change-table" aria-label="${cxChangeEscape(group.title)}"><colgroup><col><col><col><col><col></colgroup><thead><tr><th scope="col">涉及功能／状态</th><th scope="col">原入口／现状</th><th scope="col">本次改了什么</th><th scope="col">开发与验收要点</th><th scope="col">对应交互原型</th></tr></thead><tbody>${group.rows.map(cxChangeRow).join('')}</tbody></table></div></section>`).join('');
