/* Review-only annotations, kept outside customer and agent product flows. */
(function(){
 'use strict';
 const learningPage=location.pathname.endsWith('/self-learning.html'),business=learningPage||location.pathname.endsWith('/workspace.html');
 const notes=[
 [
  "search",
  "Help Center 问答检索",
  "new",
  "现有知识中心提供知识管理能力；本轮未核验到此 Help Center 三段式问答入口的完整实现。",
  "新增面向客户的提问入口，返回 AI 摘要、命中的已有 FAQ、可预览来源；可修改问题重新搜索。",
  "仅检索当前站点绑定且获授权的知识范围。原型为本地样例匹配；真实召回、加载失败与重试需接入。",
  1
 ],
 [
  "summary",
  "有依据摘要与空召回",
  "new",
  "本轮没有取得真实检索服务的置信度、拒答和摘要生成实现，不把样例匹配当成现有算法。",
  "有足够依据才生成带来源引用的摘要；没有依据则显示未召回兜底，可列同范围相关来源。",
  "不强行生成答案，不生成追问建议；相关文件须标为相关资料，不能伪装成已命中答案。阈值由实际检索接口对齐。",
  2
 ],
 [
  "faq",
  "只返回已有 FAQ",
  "new",
  "现有自学习可将话题加入知识中心；这不等于本次搜索必然命中 FAQ。",
  "搜索只展示当前授权知识范围中实际命中的 FAQ；没有 FAQ 时区域为空并隐藏。",
  "不得根据用户问题临时造 FAQ。FAQ 可用性、可见范围及来源以正式查询结果为准。",
  3
 ],
 [
  "sources",
  "多格式引用定位与预览",
  "new",
  "工单附件已有图片预览和文件打开能力；它不能证明知识来源已支持 PDF 页码、视频时间点或表格范围定位。",
  "为 Help Center 来源增加统一预览：PDF 页码、视频时间、表格范围、文档章节；引用编号打开相应来源。",
  "原型配套示例可预览；真实格式覆盖、定位元数据、原文件权限和失效提示仍需接入。每次预览/下载均校验归属与授权，不跨租户兜底。",
  4
 ],
 [
  "feedback",
  "新增召回评价",
  "new",
  "现有工单已有独立满意度问卷模块；问卷状态和发送机制不能代表搜索回答评价。",
  "新增对本次检索的有帮助/没帮助评价，可补原因；记录问题、回答快照及所属租户与知识范围。",
  "评价不自动创建工单，不写入工单问卷得分。反馈更新和去重口径待接口确认；本地演示不提交真实反馈。",
  5
 ],
 [
  "support",
  "Help Center 建单入口",
  "new",
  "现有坐席创建工单接口从登录上下文获取账号与操作者；不能直接把该后台接口暴露为匿名客户建单接口。",
  "新增客户支持表单，携带本次问题、描述、邮箱、可选分类/订单号、附件和问答快照；提交到所属租户的待处理队列。",
  "复用现有建单及邮件跟进能力，补客户入口鉴权/防重复提交与字段映射。5 字描述、3000 字上限等只是原型暂定限制，不视为现有接口约束。",
  6
 ],
 [
  "ticket-files",
  "客户附件接入现有附件能力",
  "change",
  "现有工单附件使用名称、URL、大小，支持图片预览、其他文件打开及符合条件时下载。",
  "Help Center 上传后的真实文件引用应进入现有工单消息/附件结构，沿用坐席预览与下载能力。",
  "原型最多 5 个、单个 10 MB，仅保存元信息；这两个限额未经现有上传服务核验，不作为新增后端限制。上传/访问归属、允许格式和错误重试复用现有服务后对齐。",
  9
 ],
 [
  "ticket-submit",
  "客户回执与后台权限",
  "new",
  "后台工单通过登录上下文及工单权限操作；客户提问页不因此获得坐席处理权限。",
  "成功后客户只看到编号、待处理状态及跟进说明；完成后留在 Help Center。后台坐席按原有权限查看和处理。",
  "不显示前往工单待处理等后台跳转。评审导航不属于客户功能；回执中的编号及状态须来自建单成功结果，失败不能显示成功。",
  10
 ],
 [
  "livechat",
  "LiveChat 的本次接入范围",
  "pending",
  "现有工单前端区分 LiveChat 会话、客户关闭状态及渠道回复；关闭会话可用邮件跟进还受邮箱等条件约束。",
  "本轮暂保留现有 LiveChat 入口的评审演示；拟传递当前问答上下文。离线转工单与表单提交应复用同一建单能力。",
  "入口是否合并、真实在线判断和上下文传递协议尚未确认。原型聊天不连接坐席，也不能证明离线会自动建单；不可因重复点击生成重复工单。",
  11
 ],
 [
  "queue",
  "新渠道路由与现有状态映射",
  "change",
  "现有 open=待处理，pending=处理中，solved=已解决，ai_handing=AI处理中；状态值不能按中文字面重新定义。",
  "Help Center 客户提交进入待处理，对接应使用 open。Help Center 渠道筛选为本次新增，渠道标识和绑定配置需对齐现有系统。",
  "原型本地 pending/processing/resolved 分别映射现有 open/pending/solved，不可直接传给接口。是否复用现有渠道/自定义工单，以及是否还进入 AI 流程，尚未核验到该新入口的配置。",
  13
 ],
 [
  "ticket-status",
  "处理规则的原型差异",
  "difference",
  "现有前端可单独标记已解决、重新打开；普通待处理工单发送回复后更新为处理中。重新打开使用 open。",
  "本需求沿用现有状态流转，不新增必须先回复才能解决的门槛；原型已移除该演示限制。",
  "原型接手时改为处理中、发送时自动归属当前坐席仍为演示简化，不作为本次新规则；正式处理权、分配、SLA 与通知副作用全部复用现有接口。",
  15
 ],
 [
  "question-context",
  "工单新增问答上下文",
  "new",
  "现有工单有客户消息、会话总结和附件；本次未核验到完整的 Help Center 搜索快照字段。",
  "在工单中新增 Help Center 上下文，展示原始问题、摘要或兜底、来源与召回评价，和客户补充描述分开。",
  "需要对齐存储字段与来源权限；保留提交时快照，不用后来更新的知识覆盖历史答案。没有记录的字段为空，不能补造数据。",
  18
 ],
 [
  "attachments",
  "附件区复用与原型差异",
  "difference",
  "现有附件组件在没有附件时不显示；有附件时可预览图片、打开文件，并按条件提供下载。",
  "本次复用现有附件组件，不要求生产新增固定空栏。原型为方便评审定位 #22，保留工单附件空栏或文件名列表。",
  "原型只保存文件元信息，暂不能下载或预览上传附件；这是演示限制，不是要删除现有能力。有附件的正式效果按现有系统执行。",
  22
 ],
 [
  "satisfaction",
  "召回评价与工单问卷分离",
  "change",
  "现有工单满意度已有问卷生成、发送、提交等状态与详情，不是只靠 SatisfactionUrl 显示一个链接。",
  "右侧可补充展示本次 Help Center 召回评价；原有工单问卷继续复用，不把点赞点踩转换成问卷得分。",
  "原型未接入问卷仅表示此演示未连接服务，不代表现有系统缺能力；本次不重做问卷触发、有效期或发送流程。",
  24
 ],
 [
  "assistant",
  "AI 助手到自学习的新增衔接",
  "new",
  "现有自学习已有话题、总结、关联工单及入库能力；本次核验未在工单前端发现相同的直达筛选入口。",
  "拟在坐席工单 AI 助手增加查看本工单学习状态/前往自学习入口。没有话题时展示尚无结果，不能把点击跳转当成触发学习。",
  "按工单反查话题及带筛选跳转的接口/路由需补齐或确认；复用原自学习，不建立第二套知识审核角色。客户不可访问该入口。",
  26
 ],
 [
  "ticket-category",
  "问题类型映射待对齐",
  "pending",
  "现有工单已有分类与业务字段；Help Center 示例选项尚未核验到对应字段 ID 或队列配置。",
  "表单可选择问题类型，随新渠道工单保留；正式对接应映射现有分类。",
  "本地分类不自动决定负责人、AI 路由或知识库。字段 ID、必填性及是否参与路由需按租户配置确认，不能直接把演示文本当接口枚举。",
  27
 ],
 [
  "ticket-context",
  "提交时固定问答快照",
  "new",
  "本轮未核验到客户支持表单携带本次检索全过程的既有实现。",
  "打开表单时固定当前问答快照；修改问题描述不覆盖原始搜索问题。提交时将快照和客户补充信息一起关联工单。",
  "直接联系支持而未搜索时不附无关历史；快照包含检索时间/关联标识及授权范围，真实字段需接口对齐。本地演示不包含真实后台数据。",
  29
 ],
 [
  "learning-daily",
  "复用每日学习，补新渠道采集",
  "change",
  "现有自学习页面说明缺知识对话每天自动学习，代码已有学习配置、进度与关联工单能力。Tars 和知识前端快照不能证明后台定时任务的具体筛选算法。",
  "Help Center 无可靠答案转人工后的回复应纳入现有采集链路；本次只补该渠道的关联/缺知识标识及租户归属，不新建第二个学习任务。",
  "是否已覆盖 Help Center、何时采集、是否须结单及去重阈值仍待学习服务确认。原型模拟每日学习仅推进本地样例，不承诺每单必出话题或即时生成。",
  30
 ],
 [
  "learning-auto",
  "复用租户自动入库开关",
  "difference",
  "现有前端读取/更新 learner/tenant/config 的 autoSaveLearnerToKb；未初始化时禁用开关。说明仅缺知识转人工话题自动加入，历史学习仍需人工校验。",
  "沿用现有租户学习配置及目标映射。本需求不新增每个知识库独立开关，也不把已有租户配置改为全局设置。",
  "删除此前每租户+每知识库各设开关的断言。目标项目/知识库归属仍须校验；原型按租户+知识库本地保存仅为演示隔离，不代表现有配置粒度。",
  31
 ],
 [
  "learning-topic",
  "已有话题详情与编辑能力",
  "difference",
  "现有自学习通过话题详情抽屉查看总结与关联工单；未添加可创建知识，已有知识可进入编辑并更新。",
  "复用现有详情和编辑能力，Help Center 来源工单接入原关联关系，不新建独立的审批页面。",
  "原型用简化弹窗，已添加暂只读，并用内部链接展示来源工单；这些是演示差异，不是要求限制现有编辑。详情、目录、标签和关联工单预览以现有组件为准。",
  33
 ],
 [
  "learning-add",
  "入库后在授权范围重新召回",
  "change",
  "现有话题加入知识走既有知识创建能力并关联 learnerId；已有知识走更新，具有发布/可见性等参数。",
  "Help Center 只召回已成功加入、满足发布/可见范围且索引可用的知识；新渠道产出的知识复用相同能力。",
  "加入成功不等于立即可检索；原型保存后立刻精确匹配仅为演示。既有目录/标签与权限应沿用；内部工单、邮箱、订单及备注不得作为面向客户来源公开。",
  34
 ],
 [
  "tenant-scope",
  "沿用租户体系，补站点知识绑定",
  "change",
  "现有工单用登录 UserContext 的 accountId；部分 V2 流程以 tenantId 校验渠道和工单。知识前端用 projectId，学习项也有 tenantId；这些标识不能直接互换。",
  "Help Center 站点需可信绑定所属租户及可用项目/知识库。检索、来源、反馈、问答快照、工单关联及学习回写均保持归属，只调用授权范围。",
  "tenantId / knowledgeBaseId 是原型上下文名，不是要求所有现有表和接口新增同名字段。accountId、tenantId、projectId 与站点知识范围的映射要按正式模型核实；不得用客户 URL 参数授权。",
  37
 ],
 [
  "tenant-acceptance",
  "新增链路的租户隔离验收",
  "pending",
  "已看到工单上下文取账号、V2 渠道/工单归属检查、知识前端项目参数及租户学习配置；这不等于检索/存储/学习任务全链路已验收。",
  "只验收本次新增链路：站点绑定→检索与来源→反馈/建单快照→学习采集→目标知识回写。无绑定或无权限应拒绝，不用其他租户资料补答案。",
  "接入时补查实际知识/学习后端：召回过滤、缓存、文件链接、异步任务和索引回调。验证 A/B 同问题不同答案、篡改资源、跨租户复用链接、同租户未授权知识及切换后的旧响应；不据此重建现有租户体系。",
  38
 ]
];
 const retired={"account":"当前身份复用现有权限，不新增角色。","ticket-list":"列表搜索排序复用现有工单。","assignment":"负责人分配复用现有工单。","ai-summary":"会话总结复用现有消息组件，不属于新自学习能力。","reply":"回复发送复用现有渠道能力，演示校验不是接口规则。","customer-note":"内部备注复用现有客户信息能力。","order":"订单查询与关联沿用现有系统。","erp":"ERP 入口按现有集成配置，本次未接入。","audit":"操作记录复用现有工单。","ticket-email":"联系邮箱并入建单入口说明。","ticket-description":"问题描述并入建单入口说明。","ticket-order":"订单号并入建单字段说明，不新增订单核验逻辑。","learning-list":"话题列表与状态复用现有自学习。","learning-history":"历史记录学习及上传复用现有能力，本轮不演示上传。","learning-report":"报告复用现有自学习，本轮不新增统计口径。"};
 const learningIds=['learning-daily','learning-auto','learning-list','learning-topic','learning-add','learning-history','learning-report'];
 const byId=new Map(notes.map((n,i)=>[n[0],{id:n[0],number:n[6]||i+1,title:n[1],status:n[2],trigger:n[3],effect:n[4],boundary:n[5]}]));
 const customerIds=['search','summary','faq','sources','feedback','support','ticket-email','ticket-description','ticket-files','ticket-submit','livechat','ticket-category','ticket-order','ticket-context'];
 const currentPage=learningPage?'self-learning.html':business?'workspace.html':'index.html';
 const pages=[['index.html','Help Center · 用户提问'],['workspace.html','工单工作台'],['self-learning.html','自学习 · 知识中心']];
 const pageFor=id=>id.startsWith('tenant-')?currentPage:learningIds.includes(id)?'self-learning.html':customerIds.includes(id)?'index.html':'workspace.html';
 const pageLabel=page=>pages.find(p=>p[0]===page)[1];
 const selectors={
  search:'#search-form',summary:'#answer-card .summary-section',faq:'#faq-section',sources:'#sources-section',feedback:'.feedback-section',support:'.support-strip',
  'ticket-email':'#ticket-email','ticket-category':'#ticket-category','ticket-order':'#ticket-order','ticket-context':'.ticket-context','ticket-description':'#ticket-description','ticket-files':'.upload-area','ticket-submit':'#ticket-form .modal-actions',livechat:'#chat-launcher',
  account:'[data-note="account"]',queue:'#queues','ticket-list':'#ticket-list','ticket-status':'[data-note="ticket-status"]',assignment:'#assign-ticket','ai-summary':'[data-note="ai-summary"]','question-context':'[data-note="question-context"]',reply:'#reply-text','customer-note':'#customer-note',order:'[data-note="order"]',attachments:'[data-note="attachments"]',erp:'[data-note="erp"]',satisfaction:'[data-note="satisfaction"]',audit:'[data-note="audit"]',assistant:'#assistant-toggle',
  'learning-daily':'[data-note="learning-daily"]','learning-auto':'[data-note="learning-auto"]','learning-list':'#topics-panel','learning-topic':'#topic-question','learning-add':'#add-topic','learning-history':'[data-note="learning-history"]','learning-report':'#learning-funnel',
  'tenant-scope':'.prototype-tenant','tenant-acceptance':'.prototype-tenant'
 };
 if(!business){const bindings={'#search-form':'search','#answer-card .summary-section':'summary','#faq-section':'faq','#sources-section':'sources','.feedback-section':'feedback','.support-strip':'support','#ticket-email':'ticket-email','#ticket-category':'ticket-category','#ticket-order':'ticket-order','.ticket-context':'ticket-context','#ticket-description':'ticket-description','.upload-area':'ticket-files','#ticket-form .modal-actions':'ticket-submit','#chat-launcher':'livechat'};for(const [selector,id]of Object.entries(bindings)){document.querySelector(selector)?.setAttribute('data-note',id);}document.querySelector('.header-contact')?.setAttribute('data-note','support');}
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const layer=document.createElement('div');layer.className='annotation-layer';layer.setAttribute('popover','manual');document.body.append(layer);
 const dialog=document.createElement('dialog');dialog.className='annotation-dialog';dialog.setAttribute('aria-label','功能批注');dialog.innerHTML='<header><h2>功能批注</h2><button aria-label="关闭功能批注">×</button></header><div class="annotation-body"></div>';document.body.append(dialog);
 const body=dialog.querySelector('.annotation-body');let enabled=false,selected=null,scheduled=false,located=null,locating=false;
 function statusClass(n){return n.status==='pending'?'pending':n.status==='difference'?'demo':'';}
 const statusLabel=n=>({pending:'接入待确认',new:'本次新增',change:'本次衔接',difference:'原型差异'})[n.status];
 function list(){selected=null;body.innerHTML='<p class="annotation-intro">精简后 '+notes.length+' 条批注 · 保留原编号，已移除 15 条重复说明。按页面分组。点击「定位字段」可跨页跳转、展开对应场景并高亮；点击标题查看逻辑与边界。</p>'+pages.map(([page,label])=>'<section class="annotation-group"><h3>'+label+(page===currentPage?' <span>当前页</span>':'')+'</h3>'+notes.map(n=>byId.get(n[0])).filter(n=>pageFor(n.id)===page).map(n=>'<div class="annotation-card"><button class="annotation-card-title" data-note-detail="'+n.id+'"><span class="annotation-number">'+n.number+'</span>'+escape(n.title)+'<small>'+statusLabel(n)+'</small></button><button class="annotation-card-locate" data-note-locate="'+n.id+'" aria-label="定位批注 '+n.number+'：'+escape(n.title)+'">定位字段 ↗</button></div>').join('')+'</section>').join('')+'<div class="annotation-callout">核查日期：2026-10-28。依据工单前后端与知识中心默认分支代码，未核验部署版本。所有新增读写及跳转继承可信租户归属与授权知识范围；标识映射见 #37，隔离验收见 #38。</div>';body.scrollTop=0;}
 function showList(){list();if(!dialog.open)dialog.showModal();body.scrollTop=0;}
 function open(id){const n=byId.get(id);if(!n){if(retired[id]){showList();body.insertAdjacentHTML('afterbegin','<p class="annotation-callout" role="status">原批注已移除：'+escape(retired[id])+' 请查看保留的新增、衔接或差异说明。</p>');}return;}selected=id;body.innerHTML='<button class="annotation-back">← 全部批注</button><div class="annotation-detail"><span class="annotation-status '+statusClass(n)+'">'+statusLabel(n)+'</span><h3><span class="annotation-number">'+n.number+'</span>'+escape(n.title)+'</h3><p class="annotation-page-name">所在页面：'+pageLabel(pageFor(id))+'</p><button class="annotation-locate" data-note-locate="'+id+'">前往页面并定位字段 ↗</button><h4>现有实现 / 核查范围</h4><p>'+escape(n.trigger)+'</p><h4>本次新增 / 调整</h4><p>'+escape(n.effect)+'</p><h4>差异 / 接入边界</h4><p>'+escape(n.boundary)+'</p><p class="annotation-error" role="status" hidden></p></div>';if(!dialog.open)dialog.showModal();body.scrollTop=0;}
 function clearLocation(){located=null;document.querySelectorAll('.annotation-focus').forEach(el=>el.classList.remove('annotation-focus'));schedule();}
 async function locate(id){
  if(locating)return;if(!byId.has(id)){open(id);return;}
  const page=pageFor(id);
  if(page!==currentPage){const url=new URL(window.Tenant.link(page),location.href);url.searchParams.set('annotation',id);location.assign(url.href);return;}
  locating=true;
  try{
   if(dialog.open)dialog.close();clearLocation();
   const expected=id.startsWith('ticket-')?'ticket-dialog':['learning-topic','learning-add'].includes(id)?'topic-dialog':id==='learning-report'?'report-dialog':null;
   document.querySelectorAll('dialog[open]').forEach(d=>{if(d.id!==expected)d.close();});
   const result=await window.prepareAnnotation?.(id)||{};
   const el=document.querySelector(result.selector||selectors[id]);
   if(!el)throw Error('当前场景没有对应字段，请查看批注边界说明。');
   if(el.tagName==='DETAILS')el.open=true;
   for(let parent=el.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   if(!el.getClientRects().length)throw Error('当前场景字段不可见，请查看批注边界说明。');
   setEnabled(true);el.classList.add('annotation-focus');
   el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
   located={id,element:el,message:result.message||''};position();
   if(!el.matches(':disabled')){if(!el.matches('input,textarea,select,button,a,[tabindex]'))el.setAttribute('tabindex','-1');el.focus({preventScroll:true});}
   const url=new URL(location.href);url.searchParams.set('annotation',id);history.replaceState(history.state,'',url.pathname+url.search+url.hash);
  }catch(error){open(id);let notice=body.querySelector('.annotation-error');notice.hidden=false;notice.textContent=error.message;}
  finally{locating=false;}
 }
 function setEnabled(value){enabled=value;document.querySelector('#annotation-toggle').setAttribute('aria-pressed',String(value));document.querySelector('#annotation-toggle').textContent=value?'隐藏批注':'显示批注';if(value){layer.showPopover();position();}else{clearLocation();layer.hidePopover();layer.replaceChildren();}}
 function positionMarkers(){if(!enabled)return;const viewportH=window.innerHeight,viewportW=window.innerWidth;const modal=document.querySelector('dialog[open]:not(.annotation-dialog)');const host=modal||document.body;if(layer.parentElement!==host){layer.hidePopover();host.append(layer);layer.showPopover();}const elements=[...document.querySelectorAll('[data-note]')].filter(el=>!modal||modal.contains(el));layer.replaceChildren();elements.forEach(el=>{const n=byId.get(el.dataset.note);if(!n||!el.getClientRects().length)return;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>viewportH||r.right<0||r.left>viewportW)return;let top=Math.max(12,r.top+3),right=Math.min(viewportW-12,r.right-4);let ancestor=el.parentElement;while(ancestor&&ancestor!==document.body){const style=getComputedStyle(ancestor);if(/auto|scroll|hidden/.test(style.overflowY+style.overflowX)){const a=ancestor.getBoundingClientRect();if(r.bottom<=a.top||r.top>=a.bottom||r.right<=a.left||r.left>=a.right)return;top=Math.max(top,a.top+10);}ancestor=ancestor.parentElement;}if(top>Math.min(r.bottom,viewportH-12))return;const marker=document.createElement('button');marker.className='annotation-marker '+(n.status==='pending'?'pending':'');marker.textContent=n.number;marker.style.left=right+'px';marker.style.top=top+'px';marker.title=n.title;marker.setAttribute('aria-label','批注 '+n.number+'：'+n.title);marker.onclick=()=>open(n.id);layer.append(marker);});}
 function showLocation(){if(!located||!enabled)return;const n=byId.get(located.id);const label=document.createElement('aside');label.className='annotation-location';label.setAttribute('aria-label','批注字段定位');label.innerHTML='<div role="status"><strong>已定位 #'+n.number+' · '+escape(n.title)+'</strong><span>'+pageLabel(currentPage)+(located.message?' · '+escape(located.message):' · 蓝色高亮区域为对应字段')+'</span></div><div class="annotation-location-actions"><button data-location-list>批注清单</button><button data-location-detail>查看说明</button><button data-location-close aria-label="取消字段高亮">×</button></div>';label.querySelector('[data-location-list]').onclick=()=>showList();label.querySelector('[data-location-detail]').onclick=()=>open(n.id);label.querySelector('[data-location-close]').onclick=()=>{clearLocation();const url=new URL(location.href);url.searchParams.delete('annotation');history.replaceState(history.state,'',url.pathname+url.search+url.hash);};layer.append(label);}
 function position(){if(located&&(!located.element.isConnected||!located.element.getClientRects().length)){located.element.classList.remove('annotation-focus');located=null;}positionMarkers();showLocation();}
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;position();});}
 document.querySelector('#annotation-toggle').addEventListener('click',()=>setEnabled(!enabled));
 document.querySelector('#annotation-list').addEventListener('click',()=>showList());
 dialog.querySelector('header button').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target.closest('.annotation-back'))list();const item=e.target.closest('[data-note-detail]');if(item)open(item.dataset.noteDetail);const target=e.target.closest('[data-note-locate]');if(target)locate(target.dataset.noteLocate);});
 document.addEventListener('click',e=>{const target=e.target.closest('[data-open-note]');if(target)open(target.dataset.openNote);});
 window.addEventListener('prototype-render',schedule);window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);
 const observer=new MutationObserver(records=>{if(records.some(r=>r.target!==layer&&!layer.contains(r.target)))schedule();});for(const el of document.querySelectorAll('main,#ticket-detail,#ticket-inspector,#ticket-dialog,#chat-panel,#topic-dialog,#learning-demo-dialog,#report-dialog'))observer.observe(el,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open','class']});
 document.addEventListener('click',()=>{if(enabled)requestAnimationFrame(()=>{if(document.querySelector('dialog[open]:not(.annotation-dialog)')){layer.hidePopover();layer.showPopover();}schedule();});});
 window.PrototypeAnnotations={open,locate};list();
 const incomingNote=new URL(location.href).searchParams.get('annotation');
 if(byId.has(incomingNote)||retired[incomingNote])locate(incomingNote);
})();
