# 统一设置中心：自动化与发信收口核查

核查日期 2026-11-13。依据 11 月 6 日小工单前端和 Tars 归档、留档截图与手册；未取得最新部署版本。下述 URL 是归档代码中的路由路径，不是拟上线 URL。没有修改业务代码。

| 配置对象 | 归档路径 / 源码定位 | 本期处理与必须核对的影响 |
|---|---|---|
| 分单规则列表 | `/automation` 与 `/settings/automation/assign`；前端 `config/config.ts:89–92,111–148`、`src/pages/Automation/index.tsx:10–41`、`src/pages/Settings/Automation/index.tsx:144–160` 均落到 `AutomationList`；`src/services/automation.ts:6–56` | 同一列表收口至分单规则；旧独立页还展示分配偏好，不能把旧页全部功能视作重复。两个旧路径进入同一记录与顺序；验证返回上下文及分单权限。 |
| 工单处理 | `/settings/automation/merge-close`；`AutoSolvedSetting/AutoSolvedSetting.tsx:149–155,228–232,255–510`，写租户设置，另有渠道计时策略保存 | 复用关单、合单、仅分给在线客服、回复后清空处理人；渠道计时按原灰度展示。验证历史值、时间窗、单位、优先级、部分保存失败和角色差异。 |
| 留言邮箱规则 | `/settings/automation/form-email-identification`；`Settings/FormEmailIdentification/index.tsx:38–45,84–108,222–366`，通过 desk settings 读写两个键 | 两类名单继续分别保存；验证新来信提取真实客户地址、可引用旧信合单／无法引用建新单；不触发发信。 |
| 触发器规则 | `/settings/trigger`；`src/services/trigger.ts:94–186`；Tars `TriggerController.java:38`、`TriggerRuleBizService.java:102,494–505` | 保留规则、排序、启停、条件和动作。对照旧规则 ID、执行记录；同一工单可能经过分单规则和触发器指派，需查当前覆盖顺序，不推断执行优先级。 |
| Webhook 端点 | `/settings/trigger-webhooks`；`src/pages/TriggerWebhook/index.tsx:72–170`、`src/services/trigger.ts:194–219`。触发器 `src/pages/Trigger/index.tsx:1503–1544,1580–1613` 区分工单端点和开放平台订阅 | 端点页面独立，拟归通用设置。Tars `TriggerRuleBizService.java:502–505` 按租户校验端点，`TriggerActionAdapter.java:268–278` 按参数分流至直连或开放平台。复用原 ID、签名、状态和灰度，验证删除或停用后既有规则的行为；未证明是跨业务通用端点。 |
| 满意度发送条件／内容 | `/settings/trigger` 的发送满意度问卷动作；`/settings/customer-satisfaction` 管问卷与邮件内容；`CustomerSatisfaction/index.tsx:155,202,363–369,544` 归档含旧自动发送配置字段 | 自定义发送时机与问卷内容是两个对象。历史记录称旧默认关单发信已停用，须抽验租户；测试同一个关单事件不双发、问卷停用时沿用原处理。LiveChat 弹窗单验。 |
| 主动触达、人工回复 | `/service-outreach`、`/service-outreach/editor`；`Settings/ServiceOutreach/DirectedOutreach.tsx:192–193,398–399,727–728`；历史核查记录另证实工单回复可插入问卷链接 | 主动触达的计划、发送、频控和投递记录留业务模块；人工回复继续在工单里发送。不复制一套编辑入口；校验问卷变量或链接引用仍能解析。 |

## 源文件入口

- 11 月 6 日前端路由（本地归档）
- 权限与灰度菜单（本地归档）：旧自动规则按分单／工单配置权限显示；Webhook 有灰度，触发器独立权限在这版代码尚有 TODO。应分别核对路由、页面和接口守卫，不能套用新的通用菜单权限。
- 自动化手册与实拍索引（本地归档）
- 满意度发送入口历史核查（本地归档）

## 开发前结论

本轮源码支持复用分单列表并分别迁入口，不支持把自动规则、触发器和 Webhook 合成同一配置对象。切换菜单权限、旧深链兼容、同一工单的指派先后、Webhook 存量引用、旧默认发信和渠道计时均须按上表验收。[关联影响 I01–I12](../impacts.md)逐条保留；R44 另议。当前未实施业务改动，也未运行生产或集成测试。
