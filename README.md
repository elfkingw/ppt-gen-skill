# ppt-gen-skill

这是 **ppt-gen** Skill 的维护仓库。要改的内容都在 `skills/ppt-gen/`：给助手看的工作流（`SKILL.md`）、版式和组件库、参考文档、示例稿，以及离线依赖包。仓库根目录只放这份说明，方便维护者从这里进入。

分发时交出整个 `skills/ppt-gen` 目录，放到 Agent 的 skills 路径即可。助手按 `SKILL.md` 把方案材料写成 `deck.json`，再生成 16:9、可编辑的 pptx。页面由参数化版式排版（卡片、徽章、图标、结论条），全部是原生形状，换主题时配色一起变。

适合解决方案、产品方案、汇报、投标和客户提案。维护时也可以不经过 Agent，直接用命令行构建和渲染，用来验收版式和脚本改动。

## 环境

- Node.js 16 或更高版本
- 视觉自检需要 [LibreOffice](https://www.libreoffice.org/)（命令行里能找到 `soffice`）。macOS 上没有 LibreOffice 时，渲染脚本会改用快速预览，效果近似。两者都没有时只能生成 pptx，跳过看图检查。

依赖打在 `skills/ppt-gen/vendor/node_modules.tar.gz` 里，安装时不联网。

## 快速开始

在 Skill 目录里解压依赖，并构建附带的 20 页示例（银行智能运维方案）：

```bash
cd skills/ppt-gen
scripts/setup.sh
npm run example          # 生成 out/aiops.pptx（finance-blue）
npm run example:noesis   # 生成 out/noesis-aiops.pptx（新致新知骨架 noesis-teal）
npm run example:aicoding # 生成 out/noesis-aicoding.pptx（AICoding 企业方案）
```

渲染前几页做视觉检查：

```bash
scripts/render.sh examples/aiops.deck.json out/renders --only 1-4
```

图片写到 `out/renders/slide-01.png` 起。`--only` 的位置是第三个参数：`deck.json`、输出目录、`--only`、页码（如 `3` 或 `3,5-7`）。

## 自己写一份

最小的 `deck.json`：

```json
{
  "meta": { "title": "方案标题", "author": "公司", "file": "deck" },
  "theme": { "preset": "finance-blue", "font": "微软雅黑", "decor": "skyline" },
  "brand": { "tagline": "右上角标语", "footer": ["左页脚", "右页脚"] },
  "slides": [
    {
      "layout": "cover",
      "kicker": "解决方案",
      "title": ["第一行标题", "第二行标题"],
      "subtitle": "一句副标题",
      "vendor": "公司 · 产品"
    }
  ]
}
```

构建：

```bash
cd skills/ppt-gen
node lib/build.js /path/to/deck.json -o out/deck.pptx
```

构建结束会列出需要处理的问题（文字可能溢出、未知图标、对比度不足、文字缺少中文字体）。`--strict` 在仍有问题时以非零状态退出。

常用查询（离线）：

```bash
node lib/build.js --layouts          # 版式清单
node lib/build.js --themes           # 预设主题
node lib/build.js --templates        # 命名骨架（主题 + 页序）
node lib/build.js --icons alert      # 按英文关键词搜 Lucide 图标
```

字段、字数上限和效果图见 [skills/ppt-gen/reference/layouts.md](skills/ppt-gen/reference/layouts.md)，预览图在 `skills/ppt-gen/reference/previews/`。版式盖不住的页写成自由页，见 [skills/ppt-gen/reference/custom-pages.md](skills/ppt-gen/reference/custom-pages.md)。

## 交给 Agent

入口是 [skills/ppt-gen/SKILL.md](skills/ppt-gen/SKILL.md)。维护工作流、确认步骤或交付要求时改这一份；改完用上面的示例稿走一遍构建和渲染，确认助手会调用的脚本仍然可用。

助手会先给出主题和逐页排版计划，等确认后再写 `deck.json`、构建、按 3～5 页一组渲染自检，并在旁边留下 `NOTES.md`（主题理由、数据出处、待确认项）。数字和监管条款需要能在材料或公开来源里找到出处，找不到的标成「待确认」，不编造。

## 版式

| 版式 | 适合 |
|---|---|
| `cover` | 封面 |
| `columns` | 目录、并列 3～5 点、部署或合规清单 |
| `section` | 章节分隔，或一个关键数字加几条说明 |
| `cards-strip` | 痛点、风险、能力，底部带结论 |
| `hub` | 定位、生态、数据来源汇聚 |
| `steps` | 业务流程、处置闭环 |
| `flow3` | 机制：输入 → 引擎 → 输出 |
| `layers` | 分层架构；更复杂的架构用自由页 `custom` |
| `table` | 竞品或方案对比 |
| `case-kpi` | 客户案例加大数字 |
| `roadmap` | 实施计划 |
| `closing` | 结束页 |

10 页以上的稿子包含封面、目录、章节分隔页和结束页。同一版式不要连用，单个版式整套最多 3 次（章节页除外）。

## 主题

`theme.preset` 七种预设，主色和装饰可以覆盖。用户给了品牌色时写 `{"primary": "#1E5BE6"}`，配套色会自动推导并检查对比度。`noesis-teal` 额外锁定藏青标题、灰色正文和白底，避免主色把中性色染成深青。

| 预设 | 主色 | 默认装饰 | 场景 |
|---|---|---|---|
| `finance-blue` | `#1E5BE6` | `skyline` | 银行、保险、证券、金融科技 |
| `gov-red` | `#C42B2B` | `wave` | 政府、国企、党建、公共服务 |
| `tech-purple` | `#5B4BDB` | `grid` | AI、大模型、SaaS、研发工具 |
| `health-teal` | `#0B8F86` | `wave` | 医疗、医药、健康、环保 |
| `energy-green` | `#1E8E4E` | `skyline` | 能源、电力、制造、双碳 |
| `business-slate` | `#2F4A6D` | `grid` | 咨询、通用商务、对外汇报 |
| `noesis-teal` | `#00857C` | `none` | 新致新知 Noesis AI：白底、藏青标题、青绿强调 |

`decor` 可选 `skyline`（城市剪影）、`grid`（点阵）、`wave`（波浪）、`none`。

### 新致新知骨架

用户指定「这份骨架 / 新致新知 Noesis AI / 银行智能运维」时，用命名模板 `noesis-aiops`，不要从 `finance-blue` 另起一稿：

```json
"theme": { "preset": "noesis-teal", "font": "微软雅黑", "decor": "none" }
```

```bash
node lib/build.js examples/noesis-aiops.deck.json -o out/noesis-aiops.pptx
```

`examples/noesis-aiops.deck.json` 的页序与版式对齐参考稿：封面、目录、四个章节分隔、痛点卡片、趋势数字、对比表、定位、架构自由页、本体三列、故障闭环、受控执行、自我进化、竞品表、案例、路线图、部署清单、收尾。右上角不画页码。品牌写「新致新知 Noesis AI」。痛点卡和防线卡使用 `monochrome: true`，结论色统一为主色青绿。

同一主题的内容稿 `examples/noesis-aicoding.deck.json`（`--templates` 中的 `noesis-aicoding`）按这套页序改写《AICoding 企业级智能研发方案》的大纲：四道坎、趋势、同业、研究证据、定位、架构、需求到投产、规格与嵌入、岗位、交付参照、路线图、监管对照、合作方式、收尾。稿中已有出处的数字保留并在备注写来源；本方案自己的效果指标写「待确认」。右上角不画页码。

pptx 不嵌入字体，按客户打开文稿的环境选 `theme.font`，说明见 [skills/ppt-gen/reference/fonts.md](skills/ppt-gen/reference/fonts.md)。默认面向 Windows 上的 PowerPoint / WPS 时用「微软雅黑」。

## 目录

```
skills/ppt-gen/
  SKILL.md                 Agent 工作流
  lib/build.js             deck.json → pptx
  lib/layouts/             版式
  lib/theme.js             预设主题与配色
  lib/parts.js             卡片、徽章、图标等组件
  examples/aiops.deck.json 完整示例（finance-blue）
  examples/noesis-aiops.deck.json  新致新知 Noesis AI 骨架（noesis-teal）
  examples/noesis-aicoding.deck.json  AICoding 企业方案（同一主题）
  examples/pages/          自由页示例
  reference/               版式、自由页、字体说明与预览图
  scripts/setup.sh         从 vendor 解压依赖
  scripts/render.sh        pptx → 每页一张 PNG
  vendor/                  离线依赖包
```
