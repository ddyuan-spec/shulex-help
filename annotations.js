/* Review-only annotations, kept outside customer and agent product flows. */
(function(){
 'use strict';
 const learningPage=location.pathname.endsWith('/self-learning.html'),business=learningPage||location.pathname.endsWith('/workspace.html');
 const notes=[
 ['search','用户提问与检索','confirmed','用户输入问题，按 Enter 或点击「AI 搜索」。','展示当前问题、加载状态，再显示 AI 摘要、已有 FAQ 和来源。可修改问题重新搜索。','原型用本地样例匹配，未知问题走未召回兜底。正式检索、超时和重试策略待接入确认。'],
 ['summary','AI 摘要与未召回兜底','confirmed','知识库召回足够依据后整理摘要。','摘要中的引用编号可打开对应来源预览。没有足够依据时只显示兜底，不推断答案。','相近资料要标为「相关来源文件」，不作为答案依据。不生成追问建议。'],
 ['faq','相关 FAQ','confirmed','检索命中知识库中已有的 FAQ。','展示命中的标准问题与答案；展开 FAQ 可预览引用原文。','没有 FAQ 时区域为空并隐藏，不由 AI 另造问题。当前数据为示例。'],
 ['sources','多类型来源预览','confirmed','点击来源卡片或答案引用编号。','在当前页打开预览：PDF 定位页码、视频定位时间、表格高亮范围、文档定位章节；可打开原文件。','原型使用配套示例文件。生产需校验访问权限、预览兼容性；文件失效、无权限和不支持格式的具体页面待确认。'],
 ['feedback','召回满意度','confirmed','点击「有帮助」或「没帮助」。','记录本次问题与回答的反馈；点踩可补充原因和说明。','反馈独立于工单，不自动建单。当前只保存本地；正式统计口径、去重和反馈修改规则待确认。'],
 ['support','提交工单入口','confirmed','点击「提交工单」或顶部「联系支持」。','打开表单，带入当前问题、回答、来源及反馈。成功后客户只看到回执，完成后留在 Help Center；后台处理入口仅供坐席。','未搜索直接联系支持时，不携带其他问题的问答。LiveChat 暂保留评审；最终是否合并入口待确认。'],
 ['ticket-email','联系邮箱','demo','用户填写可接收处理结果的邮箱。','必填，使用浏览器邮箱格式校验；本地演示不发送邮件。','原型会记住最近填写的邮箱。正式系统的登录身份、邮箱核验、回复投递失败处理待确认。'],
 ['ticket-description','问题描述','demo','填写本次希望支持团队处理的问题。','必填，去除首尾空格后至少 5 个字符，最多 3000 字符。搜索后默认带入当前问题，可修改。','表单描述与提交前的原始搜索问题分别保留。长度限制是原型暂定值，可按现有系统调整。'],
 ['ticket-files','提交附件','demo','选择图片或其他文件辅助说明。','最多 5 个附件、单个不超过 10 MB；超限会提示，提交前可移除。','当前只保留附件名称/类型/大小，不上传文件正文。允许格式、安全检查、上传失败重试由正式系统确认。'],
 ['ticket-submit','客户提交成功与权限边界','confirmed','表单校验通过后点击「提交工单」。','创建待处理工单后，客户只看到工单编号、状态、邮件跟进说明和「完成」；点击完成关闭弹窗，留在 Help Center。','客户没有处理工单的权限，不提供后台跳转。顶部跨端导航仅供原型评审，不属于客户产品。生产后台需坐席登录并由服务端校验访问和处理权限；当前仅本地演示，未接 staging。'],
 ['livechat','在线客服 / 离线留言','demo','点击右下角在线客服。','展开会话，附带当前问答上下文；离线时可打开同一个工单表单。','这是本地模拟会话，不连接坐席。真实排队、在线状态及与工单的关系待确认。'],
 ['account','当前坐席与权限','confirmed','打开工单工作台。','固定展示当前坐席「林悦」作为演示身份，不提供客服/业务知识管理员切换。','此前两个角色仅用于我自设的审核流程，已移除。正式权限直接复用现有系统，本轮不定义新角色。'],
 ['queue','工单队列与路由','pending','客户从 Help Center 提交工单。','按已确认需求进入「待处理」，公共视图 Help Center 可查看本渠道工单。选择队列只改变当前筛选。','是否另经「AI处理中」及其前后顺序待确认。当前 AI、通知邮件、广告邮件等队列只复刻样式，无对应样例。'],
 ['ticket-list','列表、搜索与排序','demo','选择队列、点击工单；顶部放大镜展开搜索。','按问题、邮箱或编号筛选；时间排序可切换；选中后显示会话和客户详情，地址带工单编号。','数据来自当前浏览器，未接服务器分页。空队列显示空状态；多坐席并发、未读和 SLA 规则待接入。'],
 ['ticket-status','处理状态','demo','坐席点击接手、发送、标记已解决或重新打开。','接手：待处理 → 处理中；发送：保存回复并进入处理中；标记已解决：进入已解决；重新打开：回到待处理。','先有人工回复才可标记解决是本地演示规则，需对齐现有系统。分配负责人本身不改变状态；不再绑定知识审核状态。'],
 ['assignment','分配负责人','demo','在工单头部「分配」下拉选择林悦或取消分配。','更新负责人并记录操作日志，工单原状态保持不变。','演示只有一个坐席。正式复用组织成员、权限与分配规则，不增加知识管理员角色。'],
 ['ai-summary','会话中的 AI 总结','demo','打开工单会话。','黄色卡片复刻现有 AI 总结样式，保留 Emotion / FinalSolution / Summary。当前仅用客户描述和回复次数生成演示文字。','未接真实总结能力；Emotion 标为未分析、FinalSolution 标为未判定。它不是知识自学习的生成结果，也不会写入知识库。'],
 ['question-context','提交前问答与反馈记录','confirmed','在工单内展开 Help Center 上下文。','查看客户原始问题、AI 回答或兜底、来源资料名称与反馈；与客户补充描述分开展示。','直接联系支持应标明未搜索。只显示有记录的字段；不凭空补齐。生产需保留检索快照与来源权限。'],
 ['reply','客服回复','demo','输入至少 5 个有效字符后点击「发送」。','回复追加到当前工单，进入处理中并归属当前坐席；切换工单会保留未发送草稿。','仅保存当前浏览器，不发送真实邮件。正式发送错误、重试、防重与草稿持久化需复用现有工单系统。'],
 ['customer-note','客户内部备注','demo','右侧客户信息中编辑备注并点击保存。','备注只保存在本地工单，不显示到 Help Center；操作日志记录变更。','与发送给客户的回复分开。生产备注权限、保存粒度和多人覆盖策略复用现有系统。'],
 ['order','订单信息','demo','客户在表单填写了订单号。','右侧显示用户提供的订单号，并标注尚未核验；没有订单号显示未提供。','不伪造订单明细、金额与支付状态。本轮未接电商数据；真实订单查询及绑定规则待接入。'],
 ['attachments','工单附件信息','demo','客户提交工单时添加附件。','显示附件文件名，供坐席了解提交内容。','演示未上传正文，因此不能下载或预览附件；不把文件名伪装成可用文件。'],
 ['erp','ERP 工单入口','pending','点击右侧「打开 ERP 工单」。','当前打开本条批注，明确说明未接入，不跳到虚构订单或 ERP 地址。','入口仅按截图复刻。真实跳转 URL、工单标识映射和登录权限待确认。'],
 ['satisfaction','工单满意度与问答评价','pending','查看右侧满意度区域。','工单问卷显示未接入；单独展示 Help Center 的有帮助/没帮助反馈。','两种反馈不等价。问卷触发时机、有效期和现有 SatisfactionUrl 字段映射待对齐，原型不生成问卷地址。'],
 ['audit','操作记录','demo','接手、分配、发送、解决、重开或保存备注。','右侧按时间显示本地操作事件。头部历史按钮可打开详情并定位这里。','不展示已删除的知识审核演示事件。生产日志归属、时区和记录完整性复用现有能力。'],
 ['assistant','工单 AI 助手与自学习入口','demo','坐席打开工单 AI 助手。','展示本工单在本地的学习素材/话题状态，链接至自学习并按来源工单筛选。每日任务生成话题后再根据开关或人工确认入库。','系统已验证每天自动学习缺知识的人工回复。工单到自学习的直达链接是本次衔接设计；Help Center 新渠道的后台采集映射仍需接入确认。客户端不提供这个入口。']
 ];
 notes.push(['ticket-category','问题类型','demo','提交工单时选择问题类型。','搜索后默认带入对应示例分类，可手动修改；直接联系支持默认其他问题。','当前分类只保存到本地工单，不自动推定生产路由。正式分类字段与队列映射待确认。'],['ticket-order','表单订单号','demo','客户选填订单号。','最多 100 字符，随工单保存，右侧电商信息显示未核验的客户填写值。','不查询或校验真实订单，不将订单号当成身份验证。正式格式、订单查询和归属核验复用现有系统。'],['ticket-context','表单问答快照','confirmed','打开工单表单。','快照记录打开表单时的当前问题、AI摘要或兜底、来源及评价；展开可查看。','表单问题描述可单独修改，快照仍保留原始搜索上下文。直接联系支持时不展示无关问答记录。']);
 notes.push(
 ['learning-daily','每日自动学习','confirmed','系统「缺知识的对话」任务每天运行，学习人工回复。','高频知识被提炼成自学习话题。设置中的「查看结果」返回话题列表。原型通过评审工具「模拟每日学习」推进任务。','已实测设置文案：每天自动学习。具体运行时点、工单结束条件、质量阈值和聚类方式未显示；原型按缺知识场景+人工回复筛选并用标准问题去重，不代表生产算法。'],
 ['learning-auto','自动加入知识库','confirmed','开启或关闭自学习页的「自动加入知识库」开关。','已验证说明：缺知识转人工学习的话题可自动加入知识库；历史学习内容仍需人工校验。真实环境当前开关关闭；原型默认也关闭，开启后在下次模拟任务生效。','自动学习和自动入库是两个环节。原型开关只影响本地；不会修改 staging。历史/文件学习不因开启该开关直接跳过人工校验。'],
 ['learning-list','话题列表与状态','confirmed','每日学习有合格产出，或按来源/意图/状态/时间搜索。','使用现有字段：ID、学习时间、总结问题、来源、工单数、意图、总结回复、状态、操作。状态仅用已验证的「未添加 / 已添加」。','真实环境所选日期列表为空，不保证每张工单都有话题。原型样例来源为缺知识转人工；未实现历史文件解析。'],
 ['learning-topic','总结内容与来源工单','demo','在本地话题列表点击问题、工单数或查看/编辑。','查看总结问题、总结回复、内部来源工单；未添加时允许修改，已添加只读。','当前真实列表没有数据，话题详情布局和行操作是衔接演示，不是对生产详情的复刻。原型提取人工回复文本，不调用大模型生成；需人工核实通用性。'],
 ['learning-add','加入知识库与重新召回','demo','未添加话题核实后加入，或缺知识转人工话题在自动加入开启时由每日任务添加。','状态变为已添加，生成知识库 FAQ；之后 Help Center 用相同问题可召回摘要、已有 FAQ 及公开来源。未添加话题不参与检索。','人工加入前须核对隐私和可复用性。原型只做基本格式/隐私检查，非生产质量审核；检索是标准问题精确匹配。公开内容不包含来源工单、邮箱或内部备注。'],
 ['learning-history','历史客服记录学习','confirmed','设置页「历史客服记录 / 上传对话」。','已验证该入口为单次更新；自动入库说明明确历史学习内容仍需人工校验。','本轮只演示每日缺知识学习链路，上传入口打开这条说明，不解析或上传真实文件。文件格式、导入失败和话题处理细节待核验。'],
 ['learning-report','自学习效果闭环','confirmed','点击自学习「报告」。','真实报告展示「数据源 → 话题 → FAQ → 使用」漏斗；原型报告显示当前浏览器对应计数。','真实统计口径、时间延迟和去重规则未核实。原型使用次数按相同问题命中 FAQ 记录，不应解读成生产工单解决率。']
 );
 notes.push(
 ['tenant-scope','租户与知识库隔离','confirmed','客户从所属 Help Center 站点进入；坐席从已授权的租户工作区进入。','所有检索、AI 摘要、FAQ、来源、反馈、工单、话题、自动入库配置和统计必须绑定 tenant_id 与 knowledge_base_id；仅调用当前站点配置并经授权的知识库。','这是用户确认的需求。本地原型使用固定演示租户与独立存储，非生产鉴权证明。租户上下文缺失、无知识库绑定、资源归属不符或无权限时拒绝请求；不默认全库、不跨租户补答案。'],
 ['tenant-acceptance','服务端隔离验收','pending','接入生产检索、工单、来源文件与每日学习任务前。','服务端从可信站点绑定/登录会话解析租户，并校验操作权限及知识库绑定；客户端参数仅作上下文，不能作为授权。跨租户资源返回不可访问且不暴露标题、摘要和存在性。','需后端确认并验收：数据库/向量检索在召回前限制租户及授权知识库；缓存键、索引、对象存储、预览/下载签名、异步任务/重试/回调、日志及报表均按租户隔离。A/B 租户同问题不同答案、篡改 ID/租户参数、缺失上下文、复用链接、同租户未授权知识库、并发任务及切换后旧响应均不得串数据。']
 );
 const tenantRules={
 search:'搜索请求、召回过滤和缓存键必须包含租户与授权知识库；先限制范围再召回。相关/最近来源推荐也只允许同范围，空召回不得跨库兜底。',
 summary:'只允许当前租户授权知识库召回的片段进入摘要上下文；不混入其他租户缓存、历史会话或工具结果。',
 faq:'已有 FAQ 及其引用只展示当前租户授权知识库内容。',
 sources:'PDF、视频、表格和文档在预览及下载时再次校验租户、知识库与可见范围；不可仅靠隐藏入口或可猜测文件 ID。签名链接须限制资源、权限与有效期。',
 feedback:'评价记录关联当前租户、知识库和本次检索，不混入其他租户的满意度统计。',
 support:'工单服务端按 Help Center 绑定的租户路由待处理队列，附问答快照保留原租户与知识库；不允许客户自填租户。',
 'ticket-submit':'客户提交、附件、回执与后台待处理队列保持同一租户归属；后台坐席只能访问获授权租户的工单。',
 'learning-daily':'每日任务按租户分别读取人工回复并在租户和目标知识库内聚类/去重，任务载荷与重试必须保留归属；禁止跨租户汇总提炼。',
 'learning-auto':'自动入库开关按租户及目标知识库分别保存，只影响该范围；不能使用一个全局开关覆盖多个租户。',
 'learning-add':'话题来源租户、工单租户与目标知识库所属租户必须一致，并校验目标知识库写权限；异步索引回调仍需校验。未配置合法目标时阻止入库。',
 'learning-topic':'来源工单及话题均需校验归属；不得通过修改工单 ID 查看其他租户内容。',
 'learning-history':'导入文件、导入任务、生成话题与目标知识库均需同租户绑定；不跨租户复用历史客服记录。',
 'learning-report':'数据源、话题、FAQ 与使用统计只汇总当前租户授权范围。'
 };
 for(const note of notes){if(note[0].startsWith('tenant-'))continue;note[4]+=' 租户约束：'+(tenantRules[note[0]]||'该字段及其读写/跳转继承当前租户与知识库上下文，按资源归属和操作权限校验，不跨租户读取或修改。');note[5]+=' 租户来源由服务端可信会话/站点绑定确认，缺失或不匹配时拒绝；本地演示不代表生产已完成隔离验收。';}
 const learningIds=['learning-daily','learning-auto','learning-list','learning-topic','learning-add','learning-history','learning-report'];
 const byId=new Map(notes.map((n,i)=>[n[0],{id:n[0],number:i+1,title:n[1],status:n[2],trigger:n[3],effect:n[4],boundary:n[5]}]));
 const customerIds=['search','summary','faq','sources','feedback','support','ticket-email','ticket-description','ticket-files','ticket-submit','livechat','ticket-category','ticket-order','ticket-context'];
 const visibleNotes=notes.map(n=>byId.get(n[0])).filter(n=>n.id.startsWith('tenant-')|| (learningPage?learningIds.includes(n.id):business?!customerIds.includes(n.id)&&!learningIds.includes(n.id):customerIds.includes(n.id)));
 if(!business){const bindings={'#search-form':'search','#answer-card .summary-section':'summary','#faq-section':'faq','#sources-section':'sources','.feedback-section':'feedback','.support-strip':'support','#ticket-email':'ticket-email','#ticket-category':'ticket-category','#ticket-order':'ticket-order','.ticket-context':'ticket-context','#ticket-description':'ticket-description','.upload-area':'ticket-files','#ticket-form .modal-actions':'ticket-submit','#chat-launcher':'livechat'};for(const [selector,id]of Object.entries(bindings)){document.querySelector(selector)?.setAttribute('data-note',id);}document.querySelector('.header-contact')?.setAttribute('data-note','support');}
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const layer=document.createElement('div');layer.className='annotation-layer';layer.setAttribute('popover','manual');document.body.append(layer);
 const dialog=document.createElement('dialog');dialog.className='annotation-dialog';dialog.setAttribute('aria-label','功能批注');dialog.innerHTML='<header><h2>功能批注</h2><button aria-label="关闭功能批注">×</button></header><div class="annotation-body"></div>';document.body.append(dialog);
 const body=dialog.querySelector('.annotation-body');let enabled=false,selected=null,scheduled=false;
 function statusClass(n){return n.status==='pending'?'pending':n.status==='demo'?'demo':'';}
 const statusLabel=n=>({pending:'待确认规则',demo:'本地演示',confirmed:'已确认需求'})[n.status];
 function list(){selected=null;body.innerHTML='<p class="annotation-intro">批注区分用户已确认的需求、本地演示效果与待确认规则。点击条目查看触发、结果、跳转和边界。</p>'+visibleNotes.map(n=>'<button class="annotation-card" data-note-detail="'+n.id+'"><span class="annotation-number">'+n.number+'</span>'+escape(n.title)+'<small>'+statusLabel(n)+'</small></button>').join('')+'<div class="annotation-callout">批注是评审说明，不是已接通真实系统的声明。生产数据、权限和处理机制以现有系统为准。</div>';}
 function open(id){const n=byId.get(id);if(!n)return;selected=id;body.innerHTML='<button class="annotation-back">← 全部批注</button><div class="annotation-detail"><span class="annotation-status '+statusClass(n)+'">'+statusLabel(n)+'</span><h3><span class="annotation-number">'+n.number+'</span>'+escape(n.title)+'</h3><h4>触发条件</h4><p>'+escape(n.trigger)+'</p><h4>操作效果 / 跳转</h4><p>'+escape(n.effect)+'</p><h4>边界 / 待确认</h4><p>'+escape(n.boundary)+'</p><button class="annotation-locate">定位到字段</button></div>';if(!dialog.open)dialog.showModal();body.scrollTop=0;}
 function setEnabled(value){enabled=value;document.querySelector('#annotation-toggle').setAttribute('aria-pressed',String(value));document.querySelector('#annotation-toggle').textContent=value?'隐藏批注':'显示批注';if(value){layer.showPopover();position();}else{layer.hidePopover();layer.replaceChildren();document.querySelectorAll('.annotation-focus').forEach(e=>e.classList.remove('annotation-focus'));}}
 function position(){if(!enabled)return;const viewportH=window.innerHeight,viewportW=window.innerWidth;const modal=document.querySelector('dialog[open]:not(.annotation-dialog)');const host=modal||document.body;if(layer.parentElement!==host){layer.hidePopover();host.append(layer);layer.showPopover();}const elements=[...document.querySelectorAll('[data-note]')].filter(el=>!modal||modal.contains(el));layer.replaceChildren();elements.forEach(el=>{const n=byId.get(el.dataset.note);if(!n||!el.getClientRects().length)return;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>viewportH||r.right<0||r.left>viewportW)return;let top=Math.max(12,r.top+3),right=Math.min(viewportW-12,r.right-4);let ancestor=el.parentElement;while(ancestor&&ancestor!==document.body){const style=getComputedStyle(ancestor);if(/auto|scroll|hidden/.test(style.overflowY+style.overflowX)){const a=ancestor.getBoundingClientRect();if(r.bottom<=a.top||r.top>=a.bottom||r.right<=a.left||r.left>=a.right)return;top=Math.max(top,a.top+10);}ancestor=ancestor.parentElement;}if(top>Math.min(r.bottom,viewportH-12))return;const marker=document.createElement('button');marker.className='annotation-marker '+(n.status==='pending'?'pending':'');marker.textContent=n.number;marker.style.left=right+'px';marker.style.top=top+'px';marker.title=n.title;marker.setAttribute('aria-label','批注 '+n.number+'：'+n.title);marker.onclick=()=>open(n.id);layer.append(marker);});}
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;position();});}
 document.querySelector('#annotation-toggle').addEventListener('click',()=>setEnabled(!enabled));
 document.querySelector('#annotation-list').addEventListener('click',()=>{list();dialog.showModal();});
 dialog.querySelector('header button').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target.closest('.annotation-back'))list();const item=e.target.closest('[data-note-detail]');if(item)open(item.dataset.noteDetail);if(e.target.closest('.annotation-locate')){const el=[...document.querySelectorAll('[data-note]')].find(e=>e.dataset.note===selected&&e.getClientRects().length);if(el){dialog.close();setEnabled(true);document.querySelectorAll('.annotation-focus').forEach(e=>e.classList.remove('annotation-focus'));el.scrollIntoView({block:'center',inline:'nearest'});el.classList.add('annotation-focus');schedule();}else{e.target.textContent='字段当前不可见，请先打开对应场景或表单';}}});
 document.addEventListener('click',e=>{const target=e.target.closest('[data-open-note]');if(target)open(target.dataset.openNote);});
 window.addEventListener('prototype-render',schedule);window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);
 const observer=new MutationObserver(records=>{if(records.some(r=>r.target!==layer&&!layer.contains(r.target)))schedule();});for(const el of document.querySelectorAll('main,#ticket-detail,#ticket-inspector,#ticket-dialog,#chat-panel,#topic-dialog,#learning-demo-dialog,#report-dialog'))observer.observe(el,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open','class']});
 document.addEventListener('click',()=>{if(enabled)requestAnimationFrame(()=>{if(document.querySelector('dialog[open]:not(.annotation-dialog)')){layer.hidePopover();layer.showPopover();}schedule();});});
 window.PrototypeAnnotations={open};list();
})();