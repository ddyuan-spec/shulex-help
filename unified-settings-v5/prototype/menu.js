/* Menu data from the phase-one proposal. Hashes are prototype routes, not product URLs. */
window.settingsDemo = {
  categories: [
    { id: 'common', name: '通用设置', purpose: '管理跨模块使用的资源与连接', groups: [
      ['渠道与账号', [['channels', '渠道账号'], ['phones', '电话号码']]],
      ['数据与字段', [['fields', '字段管理'], ['labels', '标签管理']]],
      ['回复内容与模板', [['replies', '回复模板'], ['whatsapp', 'WhatsApp 模板']]],
      ['团队与权限', [['members', '成员'], ['teams', '团队'], ['roles', '角色与权限']]],
      ['集成与扩展', [['integrations', '业务系统集成'], ['tools', '工具管理'], ['api', 'API'], ['webhook', 'Webhook']]]
    ]},
    { id: 'ai', name: '智能客服设置', purpose: '管理工作区级的 AI 策略', groups: [
      ['理解与处理', [['intent', '意图理解'], ['extraction', 'AI 字段提取'], ['tagging', 'AI 打标策略']]],
      ['安全与防护', [['security', 'AI 安全']]]
    ]},
    { id: 'ticket', name: '工单设置', purpose: '管理人工接待与工单规则', groups: [
      ['分配与接待', [['routing', '队列与路由'], ['assignment', '分单规则'], ['calendar', '服务时间与节假日'], ['capacity', '接待容量']]],
      ['工单自动化', [['triggers', '触发器'], ['merge-close', '工单处理'], ['mail', '留言邮箱规则']]],
      ['工单界面', [['form', '表单与展示'], ['toolbar', '工具栏扩展']]],
      ['服务标准', [['sla', '服务时效（SLA）'], ['csat', '满意度调查']]]
    ]}
  ],
  // [旧入口, 原型落点, 一期动作, 保留点, 无演示落点时的目标]
  legacyPaths: {
    'ticket/triggers': '智能工作台 → 设置 → 效率 → 触发器',
    'ticket/csat': '智能工作台 → 设置 → 工单 → 满意度调查',
    'common/teams': '智能工作台 → 设置 → 坐席配置 → 团队',
    'ai/security': 'Agent → Safeguards → AI Security',
    'common/channels': 'Agent → Integrations → Email',
    'ticket/assignment': '智能工作台 → 设置 → 效率 → 自动规则 → 分单',
    'ticket/merge-close': '智能工作台 → 设置 → 效率 → 自动规则 → 工单处理',
    'ticket/mail': '智能工作台 → 设置 → 效率 → 自动规则 → 留言邮箱规则',
    'common/webhook': '智能工作台 → 设置 → 效率 → Webhook'
  },
  migration: [
    ['智能客服 → 集成', 'common/channels', '迁入口', '渠道授权、同步和专属参数保留。'],
    ['工单 → 字段与表单（字段定义）', 'common/fields', '拆分入口', '字段定义和工单表单布局分开。'],
    ['智能客服 → 变量 / AI 字段（定义）', 'common/fields', '先定边界', '是否共用字段定义待确认；不合并对象。'],
    ['智能客服 → 标签 / AI 标签组', 'common/labels', '先定边界', '目录可定位；客户、工单、AI 标签不合并，R44 单独处理。'],
    ['智能客服 → 模板库', 'common/replies', '先定边界', '模板来源、用途和范围保留；R58 另定。'],
    ['工单 → WhatsApp 模板', 'common/whatsapp', '迁入口', '独立渠道审核和使用约束保留。'],
    ['坐席配置 → 成员', 'common/members', '迁入口', '权限和邮箱隔离范围不扩大。'],
    ['坐席配置 → 团队', 'common/teams', '迁入口', '权限和邮箱隔离范围不扩大。'],
    ['成员页 → 角色', 'common/roles', '迁入口', '权限继承待确认，R19 独立。'],
    ['智能客服 → 工具', 'common/tools', '迁入口', 'Agent 仍在业务页选择工具。'],
    ['效率 → Webhook', 'common/webhook', '迁入口', '保留端点 ID、签名及状态；触发器只引用端点，不在触发器里编辑。'],
    ['智能客服 → 预处理 / 意图理解', 'ai/intent', '迁入口', 'Agent 和流程编辑保留。'],
    ['智能客服 → AI 字段（提取策略）', 'ai/extraction', '先定边界', 'AI 提取策略留在智能客服；字段定义是否共用另定。'],
    ['设置 → AI → AI 打标', 'ai/tagging', '迁入口', '打标策略与标签目录分开。'],
    ['智能客服 → AI 安全', 'ai/security', '迁入口', '在线防护、质检和脱敏的执行不变。'],
    ['工单 → 队列', 'ticket/routing', '迁入口', '与路由中心的最终入口关系待确认。'],
    ['效率 → 自动规则 → 分单；旧独立 /automation', 'ticket/assignment', '收口同一列表', '两个旧路由共用 AutomationList 和分单接口；保留旧地址与原权限。'],
    ['坐席配置 → 排班', 'ticket/calendar', '迁入口并改名', '不改时区、排班和日历模型。'],
    ['坐席配置 → 容量', 'ticket/capacity', '迁入口并改名', '保留容量规则；R62 独立。'],
    ['效率 → 触发器', 'ticket/triggers', '迁入口', '不改触发逻辑；R68 独立。'],
    ['效率 → 自动规则 → 工单处理', 'ticket/merge-close', '迁入口', '保留自动关单、自动合单、仅分给在线客服、回复后清空处理人；R47 不承接。'],
    ['效率 → 自动规则 → 留言邮箱规则', 'ticket/mail', '迁入口', '保留留言邮箱识别和仅按引用关系合单；这是来信处理。'],
    ['工单 → 字段与表单（布局）', 'ticket/form', '拆分入口', '布局与展示规则留在工单设置。'],
    ['工单 → 工具栏扩展', 'ticket/toolbar', '迁入口', 'R60 的外部接口与定制能力保持。'],
    ['工单 → SLA 策略', 'ticket/sla', '迁入口', 'SLA 执行和统计口径不变。'],
    ['工单 → 满意度调查', 'ticket/csat', '迁入口', 'V131-02 独立；不合并问卷、触发器和主动触达。'],
    ['业务模块 → 设置', 'home', '兼容待确认', '旧 URL、兼容期及返回上下文见 I01。', '设置中心'],
    ['智能客服 → 知识库 / 自学习 / 内部提问', '', '不迁入', '内容发布留原模块；帮助中心实际归属待核。', '知识中心'],
    ['智能客服 / 工单 → 报表', '', '不迁入', '保持数据分析入口。', '数据分析'],
    ['Agent 编辑 / 工单处理 / 资源选择', '', '不迁入', '保留业务上下文，不建重复编辑入口。', '原业务模块']
  ]
};

// [配置项, 旧路径与职责, 一期处理, 原型路由]
window.settingsDemo.settingAudit = [
  ['分单规则', '效率 → 自动规则 → 分单；旧独立页 /automation。两处使用同一分单列表，维护条件、分配动作和执行顺序。旧独立页还展示分配偏好。', '工单设置 → 分配与接待 → 分单规则。只保留一个列表编辑入口；分配偏好仍由工单处理管理。', 'ticket/assignment'],
  ['工单自动处理', '效率 → 自动规则 → 工单处理。配置关单等待时间、合单时间窗、仅分给在线客服、回复后清空处理人；旧独立分单页可见在线分配偏好。', '工单设置 → 工单自动化 → 工单处理。保留租户配置和灰度下的渠道计时，分别验收，不迁进触发器。', 'ticket/merge-close'],
  ['来信识别与合单例外', '效率 → 自动规则 → 留言邮箱规则。分别维护提取真实客户地址的发件人、仅按邮件引用关系合单的发件人。', '工单设置 → 工单自动化 → 留言邮箱规则。两张名单继续独立；不涉及发信。', 'ticket/mail'],
  ['工单条件和动作', '效率 → 触发器。配置条件、动作、顺序和启停；可配置指派、发送满意度问卷、发送 Webhook 等动作。', '工单设置 → 工单自动化 → 触发器。保留动作；Webhook 动作引用端点，分单动作不等于分单规则列表。', 'ticket/triggers'],
  ['工单 Webhook 端点', '效率 → Webhook。维护名称、地址、签名和状态；触发器的 Webhook 动作选择端点或已有开放平台订阅。', '拟归通用设置 → 集成与扩展 → Webhook。端点单独编辑，保留引用 ID 和灰度，不扩大端点适用范围。', 'common/webhook'],
  ['关单等事件何时发邀评', '效率 → 触发器 → 发送满意度问卷。按工单条件触发；邮件场景选择问卷。旧默认关单自动发信另有历史配置。', '自定义发送条件在触发器；旧默认发送据历史记录已停用，需验证租户实际状态，不能新造同义开关或双发。', 'ticket/triggers'],
  ['邀评邮件内容与问卷启用', '工单 → 满意度调查 → 邮件内容／问卷内容。配置标题、正文、问题、有效期及问卷启用。', '工单设置 → 服务标准 → 满意度调查。继续编辑问卷内容和可用性；启用问卷不会新建发送任务。', 'ticket/csat'],
  ['主动触达计划发信', '主动触达 → 定向触达 → 新建或编辑计划。配置目标、发送时间、渠道、内容和频控，可引用问卷变量。', '保留主动触达业务入口。继续管理计划、执行及投递记录；不迁到触发器。'],
  ['邮件通道、同步与签名', 'Agent → Integrations → Email → Configure。配置连接、同步目录和邮箱签名，不决定何时发信。', '通用设置 → 渠道与账号 → 渠道账号。授权和邮箱范围沿用原实现；仅展示已核对的配置。', 'common/channels'],
  ['工单回复中插入问卷', '工单详情 → 回复编辑器 → 插入满意度问卷链接，随后由客服发送。', '保留工单回复入口；问卷链接是业务引用，不是问卷管理或自动发信设置。']
];

window.settingsDemo.defaults = { common: 'common/channels', ai: 'ai/security', ticket: 'ticket/triggers' };

window.settingsDemo.resolve = function (route) {
  if (route === 'home') return { route: 'home', path: '设置中心' };
  const [categoryId, itemId, extra] = route.split('/');
  if (extra !== undefined) return null;
  const category = this.categories.find(({ id }) => id === categoryId);
  if (!category) return null;
  if (!itemId) return { route: category.id, category, path: category.name };
  for (const [group, items] of category.groups) {
    const item = items.find(([id]) => id === itemId);
    if (item) return { route, category, group, item, path: [category.name, group, item[1]].join(' → ') };
  }
  return null;
};
