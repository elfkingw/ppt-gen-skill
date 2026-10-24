module.exports = {
  name: 'columns',
  summary: '2～5 列编号卡片：徽章 + 标题 + 分隔线 + 圆点要点 + 底注（目录、并列要点、部署清单）',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub });
    const items = d.items, n = items.length, y = 1.75, h = 4.9;
    const cols = k.grid(n, k.M, k.CONTENT_W, 0.3);
    const titleSize = n >= 5 ? 17 : 20;
    items.forEach((it, i) => {
      const { x, w } = cols[i];
      k.card(s, [x, y, w, h], { r: 0.05 });
      k.badge(s, x + 0.35, y + 0.4, 0.8, it.num || String(i + 1).padStart(2, '0'));
      k.text(s, it.title, [x + 0.35, y + 1.45, w - 0.6, 0.5], { fontSize: titleSize, bold: true, color: th.ink, valign: 'middle' });
      k.hline(s, x + 0.35, y + 2.1, w - 0.7, th.line, 1);
      const gap = Math.min(0.55, 2.0 / Math.max(1, it.points.length));
      k.dots(s, it.points, x + 0.35, y + 2.35, w - 0.6, gap, n >= 5 ? 12 : 13);
      if (it.foot) k.text(s, it.foot, [x + 0.55, y + h - 0.55, w - 0.8, 0.3], { fontSize: 11, color: th.muted, valign: 'middle' });
      if (d.arrows && i < n - 1) k.chev(s, x + w + 0.05, y + 0.65);
    });
  }
};
