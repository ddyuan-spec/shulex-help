# 导航地图 NAV-MAP

2026-11-09。用户已确认基座及页面范围，原话：“四项均确认，沿用这两版制作”。类型：全局增量。原型已按本地图制作，实际验证见上一级verification.md。

## 页面清单

以下prototype路径均已创建，相对于本交付目录；独立预览与方案内嵌入口见上一级solution.html。

| 页面ID | 页面/计划路由 | 基座与范围 |
| --- | --- | --- |
| solution | ../solution.html | 已有完整可视化方案，主入口 |
| survey-list | prototype/survey.html?page=surveys | 复用已有满意度调查列表 |
| survey-basic | prototype/survey.html?page=create&step=1 | 复用基本信息 |
| survey-questions | prototype/survey.html?page=create&step=2 | 复用问卷内容；B01开关 |
| survey-invitation | prototype/survey.html?page=create&step=3 | 复用邀请内容及保存校验 |
| survey-preview | prototype/survey.html?page=preview | 复用客户预览，开关不显示给客户 |
| trigger-list | prototype/survey.html?page=trigger | 复用原触发器列表，仅回归 |
| report | prototype/report.html | 复用V131满意度页；B02/B03联动与指标 |
| responses | prototype/report.html?page=responses | B04答卷明细独立页 |
| response-detail | prototype/report.html?page=response&id=… | B04答卷详情独立页 |

原触发器抽屉、条件预览弹窗及客户问卷预览沿用既有行为；不重做触发器，不增加新的发送入口。触发器内部已有跳转继承旧NAV-MAP，复制时核对实际渲染目标，不开放旧稿隐藏模块。

## 跳转登记

| 源页ID | 触发 | 目标ID | 上下文/返回 |
| --- | --- | --- | --- |
| solution | 配置原型独立打开/嵌入 | survey-questions | 定位GOFO示例，不绕过保存规则 |
| solution | 分析原型独立打开/嵌入 | report | 初始为WhatsApp＋GOFO问卷，无题目条件 |
| survey-list | 新建/编辑 | survey-basic | 新建空配置；编辑按对象ID回填 |
| survey-basic | 下一步 | survey-questions | 校验基本信息，保留草稿 |
| survey-questions | 上一步/下一步 | survey-basic / survey-invitation | 草稿中保留开关、原题目与考核值 |
| survey-invitation | 上一步 | survey-questions | 不丢邀请配置 |
| survey-invitation | 保存成功/取消 | survey-list | 保存持久化；取消不提交草稿 |
| survey-basic / survey-questions | 取消/返回 | survey-list | 沿用现有取消逻辑 |
| survey-questions / survey-invitation | 预览问卷 | survey-preview | 客户视角无分析开关 |
| survey-preview | 关闭/返回 | 原编辑页 | 保留步骤与草稿 |
| survey-list | 设置侧栏触发器 | trigger-list | 沿用已有流程 |
| trigger-list | 设置侧栏满意度调查 | survey-list | 保留已有数据 |
| survey-list | 工作区报表入口 | report | 已保存问卷为分析配置来源 |
| report | 去配置筛选项 | survey-questions | 仅有编辑权限时提供；携带问卷ID |
| survey-list | 从分析进入配置并保存后，点击“返回满意度分析” | report | 读取新配置，失效条件须显式处理 |
| report | 查看答卷明细 | responses | 携带已应用条件、集合版本和滚动位置 |
| responses | 查看某份答卷 | response-detail | 携带答卷ID与原列表页码 |
| response-detail | 返回明细 | responses | 保持条件及页码 |
| responses | 返回满意度分析 | report | 保持已应用条件 |
| 任一原型页 | 评审外壳“返回方案” | solution | 配置回#prototype-config，分析回#prototype-analysis |

渠道/问卷切换、题目答案多选、重置、分页、导出属于页内操作，不伪装为新模块。答卷详情不增加未经核验的工单业务页；工单ID可展示，真实环境定位依赖保留在产品正文。

## 状态与路由

加载、失败、空结果及条件失效使用当前页面的真实状态，不添加伪业务Tab。状态用例的评审入口放方案外壳，不进入产品导航。所有后续新增导航目标必须先补本表；不添加无法到达内容页的占位导航。

首次进入分析原型可按场景预置GOFO条件；刷新重入保留最近成功应用的条件，不把初始演示预置冒充真实系统默认（真实默认仍为全部渠道/全部问卷）。
