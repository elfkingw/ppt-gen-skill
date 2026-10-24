# 自由页与照图还原

版式覆盖不了的页面（复杂架构、特殊图示、按参考图还原）写成自由页。自由页仍然用组件库，所以配色、阴影、圆角和其他页一致，换主题也会自动跟着变。

## 文件结构

```js
// pages/my-page.js —— 在 deck.json 里写 { "layout": "custom", "script": "pages/my-page.js", ...任意字段 }
module.exports = function (s, d, k) {
  const th = k.th;
  k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub, page: k.ctx.page });
  // ...用 k.* 画内容，d 就是 deck.json 里这一页的对象
};
```

完整示例：`examples/pages/architecture.js`（左侧数据源 + 右侧四层架构 + 图例 + 虚线高亮层）。

## 画布与网格

- 画布 13.333 × 7.5 英寸，单位一律是英寸，`box = [x, y, w, h]`。
- 左右边距 `k.M = 0.45`，内容宽 `k.CONTENT_W = 12.43`。
- 标题区占到 y = 1.25；内容区 y ∈ [1.4, 6.9]；页脚在 y = 7.1。
- 等分列：`k.grid(n, x, totalW, gap)` 返回 `[{x, w}, …]`，所有并排元素都用它算，不要手算。

## 组件（`k.*`）

| 组件 | 用法 |
|---|---|
| `text(s, content, box, opts)` | 文字；`content` 可以是字符串或 runs 数组。会自动估算是否溢出并在构建时报警告 |
| `card(s, box, {r})` | 白色圆角卡片 + 浅边框 + 柔和阴影（主要信息容器） |
| `panel(s, box, {tr})` | 半透明底板，放在卡片下面形成层次 |
| `band(s, box, text, {solid})` | 结论条：默认浅色底，`solid` 为主色实底白字 |
| `dashedBox(s, box)` | 虚线框，标「新建 / 差异化」 |
| `chip(s, box, text, {fill, color})` | 胶囊标签 |
| `badge(s, x, y, d, '01', {muted})` | 编号徽章（双层圆） |
| `iconTile(s, x, y, d, icon, {color, tint, square})` | 浅色底 + 图标 |
| `icon(s, name, cx, cy, size, color)` | 只画图标（中心点定位） |
| `sectionHead(s, x, y, '中文', 'English', icon)` | 主色方块 + 标题 + 英文小字 |
| `dots(s, items, x, y, w, gap, size)` | 圆点列表 |
| `rings(s, cx, cy, r, label, {noOuter})` | 同心圆核心 |
| `chev(s, x, y)` | 卡片之间的小箭头 |
| `rr / rect / hline / vline` | 基础形状 |

颜色只用 `th.*`：`primary`、`primaryDark`、`primarySoft`、`ink`（标题）、`sub`（副标题）、`body`（正文）、`muted`（注释）、`tint` / `tint2`（浅底）、`line`（边框）、`white`、`danger`、`accents[i].color / .tint`。**不要写死色值**，否则换主题会失效。

## 图标

图标用 [Lucide](https://lucide.dev)（约 1900 个，随依赖包离线提供），`icon` 字段直接写 Lucide 名称（小写连字符，如 `bell-ring`、`scan-search`）。每个图标转成一个原生自定义形状：线条风格、跟主题变色、可编辑，不嵌图片。

选图标：

```bash
node lib/build.js --icons alert          # 用英文关键词搜名称和标签
node lib/build.js --icons file search    # 多个词同时匹配
```

- 按「这一项在说什么」选，不按字面：「根因分析」用 `scan-search`，「影响范围推演」用 `radar`，「可回退」用 `undo-2`。
- 同一页里不要重复用同一个图标；同类事物（如一组数据源）风格保持一致。
- 写错名称时构建会警告并给出相近的名称，按提示改。
- `icon(s, name, cx, cy, size, color, {stroke})`：`size` 是图标外框边长，`stroke` 是线宽倍数（默认 1，即 Lucide 标准 2/24）。深色底上用 `th.white`。

`examples/aiops.deck.json` 里有约 70 处图标选择可作参考。

## 照图还原（参考图 → 可编辑页）

用户给出参考截图、要求「照这个做」时：

1. 先看图，把页面拆成「区域 → 组件」：哪些是卡片、徽章、图标块、结论条。能套版式就套版式，不能才写自由页。
2. 量坐标：参考图宽 W 像素时，英寸 = 像素 × 13.333 / W。在脚本顶部定义 `const P = (px) => px * 13.333 / W;`，用参考图的像素值写坐标，最后再统一对齐到 `k.grid`。
3. 字号：参考图上的字高（像素）× 13.333 / W × 72 ≈ 磅值，再取整到 9 / 10 / 11 / 12 / 13 / 14 / 16 / 20 / 28 / 40。
4. 渲染后与参考图并排对比，修正位置偏差超过 0.05 英寸的元素。
