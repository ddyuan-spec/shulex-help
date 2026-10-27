# cxclaw工单助手工单工作台原型

开发评审建议从 `changes.html`（本次改动清单）开始：18项范围按行展示现状、本次变化、关键验收点和状态；每行链接直达对应交互原型与批注。工单批注内可返回清单。链接只定位，不自动执行工具。架构尚未接入、沿用项和待确认未补按钮均单独标明。

打开 `index.html` 即可离线体验。浏览器完整预览：运行 `node serve.cjs`，访问 http://127.0.0.1:4390。

- 卡片视图：`/?layout=card&ticket=1587`
- 表格抽屉：`/?layout=table&ticket=1590`
- cxclaw工单助手：`/?layout=card&ticket=1587&tab=ai`

点击列表左下角图标切换布局；右栏顶部在详情和cxclaw工单助手之间切换。AI总结、草拟回复、AI润色、订单物流和问答都在cxclaw工单助手。生成的草稿可手动应用到编辑框，切换布局或工单后分别保留。

这是本地交互原型，AI返回预置示例，不连接模型、线上工单、订单或消息接口。发送、分配、稍后处理、备注只改变当前浏览器内存。刷新恢复初始状态。

工单总结沿用线上黄色“AI总结”卡片，显示在中间工单会话记录（Emotion / FinalSolution / Summary ＋ 时间）；入口仍在cxclaw工单助手。总结属于内部记录，不发送客户，清空助手问答后仍保留。

样式依据和字段来源见 `spec/`。非工单业务导航仅保留截图外观，不演示其他模块。截图不可辨认或未提供的订单/消息内容不补造。

新增评审辅助“逻辑批注”：顶部开关可显示／隐藏，点击编号可逐项阅读。`?notes=1` 强制显示，`?notes=0` 隐藏。完整文字见 `功能逻辑说明.md`。批注不会执行 AI 或发送消息。

架构批注已明确：主Agent统一把工单任务交给cxclaw工单助手；助手只调用工单相关功能／skill，结果、依据、实际状态及待确认事项回流主Agent。第1条看整体关系，第13条看工单能力边界，第14条看信息回流。当前仅有14项说明与本地演示，尚未接入真实分发和回流服务。

应用 skill：
- https://github.com/ddyuan-spec/workbuddy-skills/blob/main/proto-admin/SKILL.md
- https://github.com/ddyuan-spec/workbuddy-skills/blob/main/proto-spec/SKILL.md
- https://github.com/ddyuan-spec/workbuddy-skills/blob/main/html-proto-screenshot/SKILL.md
