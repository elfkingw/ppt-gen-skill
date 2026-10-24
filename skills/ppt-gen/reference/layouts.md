# 版式目录与字段

所有页面共用的字段：

| 字段 | 说明 |
|---|---|
| `layout` | 版式名，见下文；或 `custom`（自由页） |
| `title` / `suffix` | 两段式标题：`title` 深色 +「——」+ `suffix` 主色。标题合计 ≤ 18 字 |
| `sub` | 副标题，一句话 ≤ 40 字 |
| `notes` | 演讲者备注（字符串或字符串数组，每项一段） |

页面不显示页码。右上角只放可选的 `brand.tagline`，页脚照常保留。效果图在 `previews/` 下，文件名与版式同名。效果图右上角若仍有页码，是更新前的截图；生成时按当前组件，不画页码。

所有 `icon` / `lineIcon` 字段写 Lucide 图标名，用 `node lib/build.js --icons 关键词` 搜索。

---

## cover — 封面　`previews/cover.jpg`

```json
{ "layout": "cover", "kicker": "银行智能运维解决方案",
  "title": ["本体驱动的银行智能运维", "决策与执行中枢"],
  "subtitle": "让运维看得懂、算得准、管得住",
  "desc": "（可选）一句补充说明",
  "tags": [{ "text": "本体驱动", "icon": "network" }],
  "vendor": "公司 · 产品",
  "orbit": { "center": "运维决策\n执行中枢", "nodes": [{ "text": "监控告警", "icon": "bell-ring" }] } }
```

- `title` 两行：第一行深色，第二行主色；每行 ≤ 11 字（40pt）。
- `tags` 最多 3 个，每个 ≤ 4 字。`orbit.nodes` 4～8 个，每个 ≤ 5 字。

## columns — 并列编号卡　`previews/columns.jpg`

```json
{ "layout": "columns", "title": "目录", "suffix": "四个章节", "sub": "…", "arrows": true,
  "items": [{ "title": "为什么做", "points": ["痛点", "趋势"], "foot": "第 3–6 页" }] }
```

- 2～5 列；每列 `points` ≤ 5 条，每条 ≤ 12 字（4 列时）。`arrows` 表示有先后顺序。
- 适合：目录、并列能力、部署清单、四个承诺。

## section — 大字 + 编号条目　`previews/section-chapter.jpg`、`previews/section-number.jpg`

```json
{ "layout": "section", "number": "4小时", "heading": "重要业务恢复时限",
  "desc": "…", "source": "来源：…",
  "items": [{ "title": "监管与信创推进", "desc": "…" }], "current": 0 }
```

- `number` 可以是章节号（`01`）或关键数字（`4小时`、`90%`），≤ 4 个字符效果最好。
- 设置 `current`（从 0 开始）就是章节分隔页：当前章节高亮并带「本章」标记，其他章节置灰。
- `items` 2～4 条，`desc` ≤ 40 字。

## cards-strip — 图标卡 + 底部条带　`previews/cards-strip.jpg`

```json
{ "layout": "cards-strip", "title": "…", "suffix": "…", "sub": "…",
  "head": { "zh": "核心痛点", "en": "Pain points", "icon": "zap", "note": "告警 · 定位 · 处置" },
  "cards": [{ "title": "告警噪声大", "desc": "…", "impact": "影响：重要告警易漏判", "icon": "siren", "accent": 0 }],
  "strip": { "zh": "数据都在", "en": "Data in place", "icon": "chart-pie", "lead": "…", "body": "…" } }
```

- `cards` 3～4 张；`desc` ≤ 32 字；`impact` ≤ 12 字。默认按红、主色、绿、紫依次着色，`"monochrome": true` 改为全部主色，`accent` 可单独指定（0 红、1 主色、2 绿、3 紫、4 橙）。
- `strip` 两种写法：`items`（3 个 `{title, desc, icon}`）或 `lead` + `body` 两行结论。

## hub — 中心辐射　`previews/hub.jpg`

```json
{ "layout": "hub", "title": "定位", "suffix": "…", "sub": "…",
  "left": [{ "title": "监控系统", "desc": "指标 · 告警事件", "icon": "monitor-dot" }],
  "right": [ … ], "center": "本体化决策\n与执行中枢",
  "leftLabel": "连接器接入\nMCP·CLI·API", "rightLabel": "对象对齐\n统一理解",
  "top": { "text": "不重复建设监控采集，接入即用", "icon": "plug" },
  "bottom": "结论推送至企业微信…\n非侵入式嵌入现有工作流" }
```

- 左右各 2～5 张卡，标题 ≤ 8 字，说明 ≤ 12 字。`center` ≤ 2 行 × 5 字。

## steps — 流程 + 原则　`previews/steps.jpg`

```json
{ "layout": "steps", "title": "…", "suffix": "…", "sub": "…",
  "steps": [{ "title": "告警收敛", "icon": "funnel", "points": ["同源告警收敛", "…"] }],
  "principles": [{ "title": "本体驱动", "desc": "…", "icon": "network" }] }
```

- `steps` 3～5 步，标题 ≤ 5 字，`points` 3 条、每条 ≤ 8 字。`principles` 可省略，省略后流程卡会拉高。

## flow3 — 输入 → 引擎 → 输出　`previews/flow3.jpg`

```json
{ "layout": "flow3", "title": "…", "suffix": "…", "sub": "…",
  "columns": [
    { "title": "对象（有什么）", "items": [{ "text": "业务服务、交易链路", "icon": "zap", "highlight": false }] },
    { "title": "关系（怎么连）", "cards": [{ "title": "依赖 · 调用", "desc": "…" }], "core": "运维\n本体",
      "bar": "主结论（主色实底）", "note": "补充说明或佐证（浅色底）" },
    { "title": "动作（分级示例）", "items": [{ "title": "派单 · 通知升级", "desc": "…", "highlight": false }] } ] }
```

- 左列 4～6 项，每项 ≤ 12 字；中间正好 4 张卡，`desc` ≤ 14 字；右列 3～5 项。
- `highlight` 用于标出「新增 / 差异化」的那一项。

## layers — 分层架构　`previews/layers.jpg`

```json
{ "layout": "layers", "title": "方案", "suffix": "总体架构", "sub": "…",
  "layers": [{ "name": "本体层", "chips": ["资源对象", "…"], "highlight": true }],
  "side": { "title": "受控执行\n与安全合规", "items": ["权限分级", "…"] } }
```

- 3～5 层，每层 3～6 个模块（≤ 6 字）。`highlight` 层用虚线框和实色标签。`side` 可省略。
- 架构更复杂时（左侧数据源、图例、跨层箭头），改用自由页，参考 `examples/pages/architecture.js`。

## table — 对比表　`previews/table.jpg`

```json
{ "layout": "table", "title": "竞品对比", "suffix": "…", "sub": "…",
  "columns": ["能力维度", "A 厂商", "B 厂商", "本方案"],
  "rows": [["本体动作层", "…", "…", "…"]],
  "highlight": 3, "note": "注：…", "takeaway": "一句话结论", "fontSize": 12 }
```

- `highlight` 默认最后一列，该列加宽 25% 并高亮。≤ 6 列、≤ 7 行；6 列时单元格 ≤ 14 字。
- 单元格只写定性判断时，在 `note` 里说明判断依据和截止时间。

## case-kpi — 案例 + 大数字　`previews/case-kpi.jpg`

```json
{ "layout": "case-kpi", "title": "客户实践", "suffix": "…", "sub": "…",
  "footerNote": "数据待客户确认后填写",
  "case": { "zh": "案例概况", "en": "Case overview", "icon": "landmark", "items": [{ "title": "客户背景", "desc": "…" }] },
  "kpis": [{ "value": "90%", "label": "告警降噪率" }, { "value": "待确认", "label": "…", "pending": true }] }
```

- `kpis` 正好 4 个，`value` ≤ 5 字符。没有可靠出处的数字一律写 `"待确认"` 并加 `pending: true`，同时用 `footerNote` 在页脚标红说明。

## roadmap — 路线图　`previews/roadmap.jpg`

```json
{ "layout": "roadmap", "title": "…", "suffix": "…", "sub": "…",
  "phases": [{ "label": "P0 · 0~6 个月", "title": "核心闭环", "icon": "database", "items": ["…"] }] }
```

- 2～4 个阶段，颜色由浅到深。每阶段 `items` 3～4 条，每条 ≤ 16 字。

## closing — 结束页　`previews/closing.jpg`

```json
{ "layout": "closing", "claim": ["从看得见，到看得懂、", "做得稳、越用越聪明"],
  "desc": "邀请您共建试点：…", "vendor": "公司 · 产品",
  "info": [{ "k": "试点周期", "v": "4~8 周" }] }
```

- `claim` 两行，每行 ≤ 11 字。`info` 2～4 行，可放联系人或试点信息。

## custom — 自由页　`previews/custom-architecture.jpg`

```json
{ "layout": "custom", "script": "pages/architecture.js", "title": "…", "suffix": "…", "…": "任意字段" }
```

`script` 路径相对 deck.json，写法见 [custom-pages.md](custom-pages.md)。

---

## 版式选择速查

| 内容 | 版式 |
|---|---|
| 目录、并列 3～5 点、部署/合规清单 | `columns` |
| 章节分隔、一个关键数字 + 3 条趋势 | `section` |
| 痛点、风险、能力（带结论） | `cards-strip` |
| 定位、生态、数据来源汇聚 | `hub` |
| 业务流程、处置闭环 | `steps` |
| 机制、原理、数据→分析→结论 | `flow3` |
| 架构 | `layers`，复杂架构用 `custom` |
| 竞品 / 方案对比 | `table` |
| 客户案例 | `case-kpi` |
| 实施计划 | `roadmap` |

同一版式不要连续使用；整套中单个版式最多出现 3 次（章节页除外）。
