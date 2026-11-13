/* Menu data from the phase-one proposal. Hashes are prototype routes, not product URLs. */
window.settingsDemo = {
  categories: [
    { id: 'common', name: '通用设置', purpose: '管理跨模块使用的资源与连接', groups: [
      ['数据与字段', [['fields', '工单字段'], ['labels', '标签管理']]],
      ['回复内容与模板', [['replies', '回复模板'], ['whatsapp', 'WhatsApp 模板']]],
      ['团队与权限', [['members', '成员'], ['teams', '团队'], ['roles', '角色与权限']]]
    ]},
    { id: 'ai', name: '智能客服设置', purpose: '管理工作区级的 AI 策略', groups: [
      ['理解与处理', [['intent', '意图理解'], ['extraction', 'AI 字段'], ['tagging', 'AI 打标']]],
      ['安全与防护', [['security', 'AI 安全']]]
    ]},
    { id: 'ticket', name: '工单设置', purpose: '管理人工接待与工单规则', groups: [
      ['分配与接待', [['routing', '队列与路由'], ['assignment', '分单规则'], ['calendar', '服务时间与节假日'], ['capacity', '接待容量']]],
      ['工单自动化', [['triggers', '触发器'], ['merge-close', '工单处理'], ['mail', '留言邮箱规则']]],
      ['工单界面', [['form', '工单表单'], ['toolbar', '工具栏扩展']]],
      ['服务标准', [['sla', '服务时效（SLA）'], ['csat', '满意度调查']]]
    ]},
    { id:'channel', name:'工单渠道接入', groups:[
      ['渠道连接', [['connections','渠道连接'],['email','邮箱接入'],['livechat','LiveChat'],['phones','电话号码'],['custom-ticket','自研工单系统']]]
    ]},
    { id:'platform', name:'开放平台', groups:[
      ['开放平台', [['qualification','申请开放平台资格'],['webhook','Webhook'],['docs','API 文档']]]
    ]},
    { id:'tools', name:'工具软件', groups:[
      ['工具软件', [['plugins','工具管理'],['third-party-auth','快速三方授权']]]
    ]}
  ],
};

window.settingsDemo.resolve = function (route) {
  if (route === 'home') return { route: 'home', path: '设置中心 → 全部' };
  if (route.startsWith('app/')) {
    const apps={chatbot:'智能客服',desk:'智能工作台',workbench:'工作台',report:'数据分析'};
    const name=apps[route.slice(4)];
    return name ? {route,path:name,app:route.slice(4)} : null;
  }
  const [categoryId, itemId, extra] = route.split('/');
  if (extra !== undefined) return null;
  const category = this.categories.find(({ id }) => id === categoryId);
  if (!category) return null;
  if (!itemId) return { route: category.id, category, path: category.name };
  for (const [group, items] of category.groups) {
    const item = items.find(([id]) => id === itemId);
    if (item) return { route, category, group, item, path: [category.name, ...(category.id==='channel'||group===category.name?[]:[group]), item[1]].join(' → ') };
  }
  return null;
};

window.settingsDemo.inventory = [
  [
    "common/fields",
    "工单字段",
    "智能工作台 → 设置 → 工单 → 字段与表单 → 字段管理",
    "字段名称、类型、归属表单、更新人/时间；工单引用 AI 字段"
  ],
  [
    "common/labels",
    "标签管理",
    "智能客服 → 标签 / AI 标签组",
    "标签组、描述和树形明细；不合并客户、工单或 AI 标签"
  ],
  [
    "common/replies",
    "回复模板",
    "智能客服 → 知识中心 → 模板库",
    "模板、目录、状态、内容和适用场景"
  ],
  [
    "common/whatsapp",
    "WhatsApp 模板",
    "智能工作台 → 设置 → 工单 → WhatsApp 模板",
    "账号、模板名称、类别、语言、审核状态；独立编辑器"
  ],
  [
    "common/members",
    "成员",
    "智能工作台 → 设置 → 坐席配置 → 成员；帐号管理 → 成员",
    "邮箱、名称、角色、团队、激活、在线状态及时间"
  ],
  [
    "common/teams",
    "团队",
    "智能工作台 → 设置 → 坐席配置 → 团队",
    "团队、成员、排班"
  ],
  [
    "common/roles",
    "角色与权限",
    "智能工作台 → 设置 → 坐席配置 → 成员 → 角色；帐号管理 → 角色",
    "角色名称、成员数量、权限清单"
  ],
  [
    "ai/intent",
    "意图理解",
    "智能客服 → 预处理 → 意图",
    "意图名称、说明、类型和层级"
  ],
  [
    "ai/extraction",
    "AI 字段",
    "智能客服 → 预处理 → AI 字段",
    "AI 字段定义和提取规则；工单字段只引用"
  ],
  [
    "ai/tagging",
    "AI 打标",
    "智能工作台 → 设置 → AI → AI 打标",
    "打标结果选择、更新方式；原灰度条件"
  ],
  [
    "ai/security",
    "AI 安全",
    "智能客服 → AI 安全",
    "Quality Inspection / Data Masking 与现有规则编辑"
  ],
  [
    "ticket/routing",
    "队列与路由",
    "智能工作台 → 设置 → 工单 → 队列",
    "队列名称、匹配条件、团队、最长等待、状态"
  ],
  [
    "ticket/assignment",
    "分单规则",
    "智能工作台 → 设置 → 效率 → 自动规则 → 分单；旧独立分单 /automation",
    "规则条件、分配动作、顺序；旧页的分配偏好沿用工单处理"
  ],
  [
    "ticket/calendar",
    "服务时间与节假日",
    "智能工作台 → 设置 → 坐席配置 → 排班",
    "名称、时区、服务时间、节假日；列表与独立编辑"
  ],
  [
    "ticket/capacity",
    "接待容量",
    "智能工作台 → 设置 → 坐席配置 → 容量",
    "邮件、消息、语音容量、坐席、邮件日上限"
  ],
  [
    "ticket/triggers",
    "触发器",
    "智能工作台 → 设置 → 效率 → 触发器",
    "条件、动作、顺序、启停；发送 Webhook 选择开放平台订阅"
  ],
  [
    "ticket/merge-close",
    "工单处理",
    "智能工作台 → 设置 → 效率 → 自动规则 → 工单处理",
    "关单、合单、在线分配、回复后清空处理人、渠道计时"
  ],
  [
    "ticket/mail",
    "留言邮箱规则",
    "智能工作台 → 设置 → 效率 → 自动规则 → 留言邮箱规则",
    "提取真实客户地址的发件人、仅按引用合单发件人"
  ],
  [
    "ticket/form",
    "工单表单",
    "智能工作台 → 设置 → 工单 → 字段与表单 → 表单管理",
    "表单、字段绑定、展示和排序；字段定义去通用设置"
  ],
  [
    "ticket/toolbar",
    "工具栏扩展",
    "智能工作台 → 设置 → 工单 → 工具栏扩展",
    "客户、订单、自定义面板；接口、Tab 名称、页面地址、高度"
  ],
  [
    "ticket/sla",
    "服务时效（SLA）",
    "智能工作台 → 设置 → 工单 → SLA 策略",
    "策略名、状态、条件、时效、营业日历"
  ],
  [
    "ticket/csat",
    "满意度调查",
    "智能工作台 → 设置 → 工单 → 满意度调查",
    "问卷、邮件内容、问卷启用；发送时机仍由触发器或业务入口管理"
  ],
  ['channel/connections','渠道连接','智能客服 → 集成 → 电商渠道 → 渠道详情','查看电商渠道连接和授权状态；沿用各渠道的接入配置'],
  ['channel/email','邮箱接入','智能客服 → 集成 → Email','邮箱账号授权、同步目录和签名'],
  ['channel/livechat','LiveChat','智能客服 → 集成 → Solvea LiveChat','查看聊天窗渠道、安装与预览、服务时间、外观及自动化配置'],
  ['channel/phones','电话号码','智能客服 → 集成 → Solvea 电话号码','管理号码和接听策略；沿用号码连接与授权'],
  ['channel/custom-ticket','自研工单系统','智能客服 → 集成 → 自研工单系统','配置查询和 AI 回复接口，接入自研工单'],
  ['platform/qualification','申请开放平台资格','智能客服 → 集成 → 开放平台 → 创建应用 / 配置工作域权限','创建或查看已有开放平台应用，配置可访问工作域'],
  ['platform/webhook','Webhook','智能客服 → 集成 → 开放平台 → Webhook 配置','管理 Endpoint、事件订阅与回调记录；工单触发器只选择订阅'],
  ['platform/docs','API 文档','智能客服 → 集成 → 开放平台 → 开放平台调用示例 / 接口文档','查看开放接口说明；授权在资格页管理'],
  ['tools/plugins','工具管理','智能客服 → 搭建 → 工具','管理工具插件；Agent 保留原使用入口'],
  ['tools/third-party-auth','快速三方授权','智能客服 → 集成 → 快速三方授权','查看第三方工具的授权记录、类型和状态']
];
window.settingsDemo.legacyPaths = Object.fromEntries(window.settingsDemo.inventory.map(([route,,old])=>[route,old]));

window.settingsDemo.defaults = {common:'common/fields',ai:'ai/intent',ticket:'ticket/triggers',channel:'channel/connections',platform:'platform/qualification',tools:'tools/plugins'};
window.settingsDemo.aliases = {'common/channels':'channel/email','common/phones':'channel/phones','common/integrations':'channel/connections','common/tools':'tools/plugins','common/api':'platform/docs'};
