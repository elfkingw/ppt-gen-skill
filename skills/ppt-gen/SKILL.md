---
name: ppt-gen
description: 生成精排版的方案类 PPT（解决方案、产品方案、汇报、投标、客户提案）：根据用户材料规划页面，用参数化 pptxgenjs 组件库生成 16:9 可编辑 pptx，全部原生形状、主题色按内容决定，并渲染成图片自检。Use when the user asks to make a 方案 PPT / 演示稿 / 汇报稿 / pptx deck from documents or an outline, or to rebuild a slide from a reference image.
---

# 方案类 PPT 生成

整套 PPT 用一份 `deck.json` 描述（主题 + 每页版式和内容），由 `lib/build.js` 生成 pptx。精致感来自组件库（卡片、徽章、图标块、同心圆、结论条），不要绕过组件库直接画形状。

## 准备

```bash
cd <本 Skill 目录> && scripts/setup.sh   # 从 vendor/node_modules.tar.gz 解压依赖，不联网、不装全局
node lib/build.js --layouts            # 版式清单
node lib/build.js --themes             # 预设主题
node lib/build.js --icons alert        # 搜 Lucide 图标（英文关键词，离线）
```

渲染自检需要 LibreOffice（`soffice`）；没有时在 macOS 上会退回快速预览（近似效果）。都没有就跳过渲染，并在交付时说明「未做视觉自检」。

## 流程

```
- [ ] 1. 读材料，定主题和排版计划 → 交给用户确认（唯一确认点）
- [ ] 2. 写 deck.json（+ 自由页脚本）
- [ ] 3. 构建，清零警告
- [ ] 4. 每 3～5 页一组渲染自检，修完再下一组
- [ ] 5. 收尾：演讲者备注、NOTES.md，交付
```

### 1. 主题与排版计划（等用户确认）

**主题**：按行业和客户选预设（`finance-blue`、`gov-red`、`tech-purple`、`health-teal`、`energy-green`、`business-slate`）；用户给了品牌色就用 `{"primary": "#xxxxxx"}`，配套色自动推导并检查对比度。字体按客户打开 PPT 的环境选，见 [reference/fonts.md](reference/fonts.md)。

**排版计划**：一张表，每页一行：

| # | 这一页要讲清的一件事 | 版式 | 关键内容 / 数据来源 |
|---|---|---|---|

规则：

- 一页只讲一件事；标题用「主题——结论」写法，`suffix` 就是结论。
- 10 页以上的稿子：封面、目录、按章节插入 `section` 分隔页（设 `current`）、结束页。
- 同一版式不连用，单个版式最多 3 次（章节页除外）。选版式见 [reference/layouts.md](reference/layouts.md) 末尾的速查表，效果图在 `reference/previews/`。
- 版式放不下的页标为「自由页」，写明要画什么。

把主题（预设名、主色、字体、装饰）和这张表发给用户，确认后再往下做；确认后不再中途打断。

### 2. 写 deck.json

```json
{
  "meta": { "title": "整套标题", "author": "公司", "file": "输出文件名" },
  "theme": { "preset": "finance-blue", "font": "微软雅黑", "decor": "skyline" },
  "brand": { "tagline": "右上角标语（可选）", "footer": ["左页脚（可选）", "右页脚（可选）"] },
  "slides": [ { "layout": "cover", "...": "..." } ]
}
```

- 字段和字数上限见 [reference/layouts.md](reference/layouts.md)；完整示例：`examples/aiops.deck.json`（20 页银行智能运维方案）。
- `decor`：`skyline`（城市剪影）、`grid`（点阵）、`wave`（波浪）、`none`；不写就用预设的默认值。
- `tagline`、`footer` 按内容现写，与主题无关的不要照抄示例。
- 自由页：`{"layout": "custom", "script": "pages/xxx.js", ...}`，写法见 [reference/custom-pages.md](reference/custom-pages.md)。
- 每页写 `notes`（演讲者备注）：讲解思路 + 数据出处。
- `icon` 字段写 Lucide 图标名，先用 `--icons 关键词` 搜到再填，选法见 [reference/custom-pages.md](reference/custom-pages.md#图标)。

**数字纪律**：每个数字、监管条款、竞品结论都要能在用户材料或公开来源里找到出处，写进 `notes`。找不到出处的写「待确认」（`case-kpi` 用 `pending: true` + `footerNote`），不要编造。

### 3. 构建

```bash
node lib/build.js deck.json -o out/deck.pptx
```

构建会输出「需要检查的问题」：文字可能溢出、未知图标、对比度不足、文字缺中文字体。**全部处理掉再渲染**。溢出优先删字，其次换版式，最后才缩小字号（正文不小于 10pt）。

### 4. 渲染自检（每 3～5 页一组）

```bash
scripts/render.sh deck.json out/renders --only 1-4
```

逐张看图，检查：

- 文字没有溢出卡片、没有被遮挡、没有意外换行（如两字孤行）
- 并排元素顶端和宽度对齐，间距一致
- 图标与文字意思相符，没有空白图标
- 每页只有一个视觉重点；主色只用于强调
- 标题两段式、页脚完整；右上角只保留 tagline，不画页码

有问题就改 deck.json 或自由页脚本，重新渲染这一组，直到没有问题。

### 5. 收尾与交付

- 全量构建一次，确认零警告。
- 在 pptx 旁边写 `NOTES.md`：主题选择理由、每页数据来源、所有「待确认」项、已知遗留问题。
- 交付：pptx、渲染图（或说明未渲染）、NOTES.md。回复里列出「待确认」项，让用户知道哪些要补。

## 参考

- 版式字段与选择：[reference/layouts.md](reference/layouts.md)
- 自由页、组件 API、照图还原：[reference/custom-pages.md](reference/custom-pages.md)
- 字体：[reference/fonts.md](reference/fonts.md)
