const { mix } = require('../theme');

module.exports = {
  name: 'roadmap',
  summary: '路线图：2～4 个阶段箭头（颜色由浅到深）+ 每阶段一张卡（编号/标题/图标要点）',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub });
    const ph = d.phases, n = ph.length, cols = k.grid(n, k.M, k.CONTENT_W, 0.3);
    ph.forEach((p, i) => {
      const { x, w } = cols[i];
      const t = n === 1 ? 1 : i / (n - 1), fill = mix(th.tint2, th.primary, t), dark = t > 0.4;
      s.addShape(i ? 'chevron' : 'homePlate', { x, y: 1.5, w: w + 0.2, h: 0.75, fill: { color: fill }, line: { type: 'none' } });
      k.text(s, p.label, [x + (i ? 0.6 : 0.35), 1.5, w - 0.7, 0.75], { fontSize: 14, bold: true, color: dark ? th.white : th.primaryDark, valign: 'middle' });
      k.card(s, [x, 2.5, w, 4.4], { r: 0.05 });
      k.badge(s, x + 0.3, 2.75, 0.7, String(i + 1).padStart(2, '0'));
      k.text(s, p.title, [x + 1.15, 2.75, w - 1.4, 0.7], { fontSize: n >= 4 ? 17 : 20, bold: true, color: th.ink, valign: 'middle' });
      k.hline(s, x + 0.3, 3.7, w - 0.6, th.line, 1);
      const m = p.items.length, gap = Math.min(0.8, 2.8 / m);
      p.items.forEach((it, j) => {
        const y = 3.95 + j * gap;
        k.iconTile(s, x + 0.3, y, 0.5, p.icon || ['database', 'box', 'settings', 'rocket'][i % 4]);
        k.text(s, it, [x + 0.95, y - 0.05, w - 1.15, 0.6], { fontSize: n >= 4 ? 11 : 12, color: th.body, valign: 'middle' });
      });
    });
  }
};
