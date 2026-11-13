# 统一设置中心 v7｜完整设置清单

默认展示全部 32 项。[在方案内查看并操作](solution.html#mapping)。

| 设置项 | 系统现状 | 调整后 | 原型 |
|---|---|---|---|
| 工单字段 | 智能工作台 → 设置 → 工单 → 字段与表单 → 字段管理 | 通用设置 → 数据与字段 → 工单字段；字段名称、类型、归属表单、更新人/时间；工单引用 AI 字段 | [查看配置](prototype/index.html#common/fields) |
| 标签管理 | 智能客服 → 标签 / AI 标签组 | 通用设置 → 数据与字段 → 标签管理；标签组、描述和树形明细；不合并客户、工单或 AI 标签 | [查看配置](prototype/index.html#common/labels) |
| 回复模板 | 智能客服 → 知识中心 → 模板库 | 通用设置 → 回复内容与模板 → 回复模板；模板、目录、状态、内容和适用场景 | [查看配置](prototype/index.html#common/replies) |
| WhatsApp 模板 | 智能工作台 → 设置 → 工单 → WhatsApp 模板 | 通用设置 → 回复内容与模板 → WhatsApp 模板；账号、模板名称、类别、语言、审核状态；独立编辑器 | [查看配置](prototype/index.html#common/whatsapp) |
| 成员 | 智能工作台 → 设置 → 坐席配置 → 成员；帐号管理 → 成员 | 通用设置 → 团队与权限 → 成员；邮箱、名称、角色、团队、激活、在线状态及时间 | [查看配置](prototype/index.html#common/members) |
| 团队 | 智能工作台 → 设置 → 坐席配置 → 团队 | 通用设置 → 团队与权限 → 团队；团队、成员、排班 | [查看配置](prototype/index.html#common/teams) |
| 角色与权限 | 智能工作台 → 设置 → 坐席配置 → 成员 → 角色；帐号管理 → 角色 | 通用设置 → 团队与权限 → 角色与权限；角色名称、成员数量、权限清单 | [查看配置](prototype/index.html#common/roles) |
| 意图理解 | 智能客服 → 预处理 → 意图 | 智能客服设置 → 理解与处理 → 意图理解；意图名称、说明、类型和层级 | [查看配置](prototype/index.html#ai/intent) |
| AI 字段 | 智能客服 → 预处理 → AI 字段 | 智能客服设置 → 理解与处理 → AI 字段；AI 字段定义和提取规则；工单字段只引用 | [查看配置](prototype/index.html#ai/extraction) |
| AI 打标 | 智能工作台 → 设置 → AI → AI 打标 | 智能客服设置 → 理解与处理 → AI 打标；打标结果选择、更新方式；原灰度条件 | [查看配置](prototype/index.html#ai/tagging) |
| AI 安全 | 智能客服 → AI 安全 | 智能客服设置 → 安全与防护 → AI 安全；Quality Inspection / Data Masking 与现有规则编辑 | [查看配置](prototype/index.html#ai/security) |
| 队列与路由 | 智能工作台 → 设置 → 工单 → 队列 | 工单设置 → 分配与接待 → 队列与路由；队列名称、匹配条件、团队、最长等待、状态 | [查看配置](prototype/index.html#ticket/routing) |
| 分单规则 | 智能工作台 → 设置 → 效率 → 自动规则 → 分单；旧独立分单 /automation | 工单设置 → 分配与接待 → 分单规则；规则条件、分配动作、顺序；旧页的分配偏好沿用工单处理 | [查看配置](prototype/index.html#ticket/assignment) |
| 服务时间与节假日 | 智能工作台 → 设置 → 坐席配置 → 排班 | 工单设置 → 分配与接待 → 服务时间与节假日；名称、时区、服务时间、节假日；列表与独立编辑 | [查看配置](prototype/index.html#ticket/calendar) |
| 接待容量 | 智能工作台 → 设置 → 坐席配置 → 容量 | 工单设置 → 分配与接待 → 接待容量；邮件、消息、语音容量、坐席、邮件日上限 | [查看配置](prototype/index.html#ticket/capacity) |
| 触发器 | 智能工作台 → 设置 → 效率 → 触发器 | 工单设置 → 工单自动化 → 触发器；条件、动作、顺序、启停；发送 Webhook 选择开放平台订阅 | [查看配置](prototype/index.html#ticket/triggers) |
| 工单处理 | 智能工作台 → 设置 → 效率 → 自动规则 → 工单处理 | 工单设置 → 工单自动化 → 工单处理；关单、合单、在线分配、回复后清空处理人、渠道计时 | [查看配置](prototype/index.html#ticket/merge-close) |
| 留言邮箱规则 | 智能工作台 → 设置 → 效率 → 自动规则 → 留言邮箱规则 | 工单设置 → 工单自动化 → 留言邮箱规则；提取真实客户地址的发件人、仅按引用合单发件人 | [查看配置](prototype/index.html#ticket/mail) |
| 工单表单 | 智能工作台 → 设置 → 工单 → 字段与表单 → 表单管理 | 工单设置 → 工单界面 → 工单表单；表单、字段绑定、展示和排序；字段定义去通用设置 | [查看配置](prototype/index.html#ticket/form) |
| 工具栏扩展 | 智能工作台 → 设置 → 工单 → 工具栏扩展 | 工单设置 → 工单界面 → 工具栏扩展；客户、订单、自定义面板；接口、Tab 名称、页面地址、高度 | [查看配置](prototype/index.html#ticket/toolbar) |
| 服务时效（SLA） | 智能工作台 → 设置 → 工单 → SLA 策略 | 工单设置 → 服务标准 → 服务时效（SLA）；策略名、状态、条件、时效、营业日历 | [查看配置](prototype/index.html#ticket/sla) |
| 满意度调查 | 智能工作台 → 设置 → 工单 → 满意度调查 | 工单设置 → 服务标准 → 满意度调查；问卷、邮件内容、问卷启用；发送时机仍由触发器或业务入口管理 | [查看配置](prototype/index.html#ticket/csat) |
| 渠道连接 | 智能客服 → 集成 → 电商渠道 → 渠道详情 | 工单渠道接入 → 渠道连接；查看电商渠道连接和授权状态；沿用各渠道的接入配置 | [查看配置](prototype/index.html#channel/connections) |
| 邮箱接入 | 智能客服 → 集成 → Email | 工单渠道接入 → 邮箱接入；邮箱账号授权、同步目录和签名 | [查看配置](prototype/index.html#channel/email) |
| LiveChat | 智能客服 → 集成 → Solvea LiveChat | 工单渠道接入 → LiveChat；查看聊天窗渠道、安装与预览、服务时间、外观及自动化配置 | [查看配置](prototype/index.html#channel/livechat) |
| 电话号码 | 智能客服 → 集成 → Solvea 电话号码 | 工单渠道接入 → 电话号码；管理号码和接听策略；沿用号码连接与授权 | [查看配置](prototype/index.html#channel/phones) |
| 自研工单系统 | 智能客服 → 集成 → 自研工单系统 | 工单渠道接入 → 自研工单系统；配置查询和 AI 回复接口，接入自研工单 | [查看配置](prototype/index.html#channel/custom-ticket) |
| 申请开放平台资格 | 智能客服 → 集成 → 开放平台 → 创建应用 / 配置工作域权限 | 开放平台 → 申请开放平台资格；创建或查看已有开放平台应用，配置可访问工作域 | [查看配置](prototype/index.html#platform/qualification) |
| Webhook | 智能客服 → 集成 → 开放平台 → Webhook 配置 | 开放平台 → Webhook；管理 Endpoint、事件订阅与回调记录；工单触发器只选择订阅 | [查看配置](prototype/index.html#platform/webhook) |
| API 文档 | 智能客服 → 集成 → 开放平台 → 开放平台调用示例 / 接口文档 | 开放平台 → API 文档；查看开放接口说明；授权在资格页管理 | [查看配置](prototype/index.html#platform/docs) |
| 工具管理 | 智能客服 → 搭建 → 工具 | 工具软件 → 工具管理；管理工具插件；Agent 保留原使用入口 | [查看配置](prototype/index.html#tools/plugins) |
| 快速三方授权 | 智能客服 → 集成 → 快速三方授权 | 工具软件 → 快速三方授权；查看第三方工具的授权记录、类型和状态 | [查看配置](prototype/index.html#tools/third-party-auth) |
