# R47｜原型导航地图

判定：全量新建 R47 原型，包含工作台既有视图与新增独立操作视图；不修改参考原型。方案 `solution.html` 为主入口，链接到 `prototype.html`。原型只使用合成工单和模拟发送。

| 源视图 | 触发 | 目标视图 |
| --- | --- | --- |
| 方案 | 进入合单原型 | `desk-list` 工单列表 |
| 方案 · 可点击原型 | 详情、批量、确认和结果场景 | 章节内 iframe 直接加载 `detail`、`batch`、`confirm`、`result` |
| 方案 · 消息回复 | 合后工单与原线程回复 | 章节内 iframe 直接加载 `merged`，预置 #101、#102 已并入 #100 |
| `desk-list` | 点击工单 | `desk-detail` 工单详情 |
| 卡片布局 | 左下切换表格布局 | `desk-list` 工单表格 |
| `desk-list` 表格 | 勾选源单 → 底部批量工具栏「合并工单」 | `merge-select` 选择唯一目标 |
| `desk-detail` | 目标单顶部「…」→ 合并工单 | `merge-select` 按工单号选择多张源单 |
| `desk-detail` | 点击「已并入 #目标单号」 | `desk-detail` 同一详情视图切换到目标单 |
| `merge-select` | 预览；返回或取消 | `merge-review`；或回来源视图 |
| `merge-review` | 返回修改；确认合并 | `merge-select`；或 `merge-result` |
| `merge-result` | 查看目标单；只重试失败项 | `desk-detail`；或 `merge-review` |
| `desk-detail` | 返回列表 | `desk-list` |
| 原型评审外壳 | 返回方案 | 方案「原型」章节（原型交付时同时建立对应锚点） |

回复与操作记录留在 `desk-detail`，不产生新页。无新导航、报表页或设置页。
