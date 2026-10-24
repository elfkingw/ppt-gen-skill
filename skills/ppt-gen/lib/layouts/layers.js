module.exports = {
  name: 'layers',
  summary: '分层架构：3～5 层，每层 3～6 个模块，可高亮一层，右侧可选竖向保障栏',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub, page: k.ctx.page });
    const layers = d.layers, n = layers.length, side = d.side;
    const W = side ? 10.6 : k.CONTENT_W, gap = 0.16, lh = (5.45 - (n - 1) * gap) / n;
    layers.forEach((l, i) => {
      const y = 1.45 + i * (lh + gap), on = l.highlight;
      if (on) k.dashedBox(s, [k.M, y, W, lh]); else k.panel(s, [k.M, y, W, lh]);
      k.rr(s, [0.6, y + 0.13, 1.5, lh - 0.26], on ? th.primary : th.tint2, { r: 0.15 });
      k.text(s, l.name, [0.6, y + 0.13, 1.5, lh - 0.26], { fontSize: 15, bold: true, color: on ? th.white : th.primaryDark, align: 'center', valign: 'middle' });
      const cols = k.grid(l.chips.length, 2.3, W - 2.0, 0.14);
      l.chips.forEach((c, j) => {
        const { x, w } = cols[j];
        k.card(s, [x, y + 0.2, w, lh - 0.4], { r: 0.18 });
        k.text(s, c, [x, y + 0.2, w, lh - 0.4], { fontSize: 12.5, bold: true, color: th.ink, align: 'center', valign: 'middle' });
      });
    });
    if (!side) return;
    k.rr(s, [11.25, 1.45, 1.63, 5.45], th.primary, { r: 0.08, shadow: true });
    k.text(s, side.title, [11.25, 1.65, 1.63, 0.8], { fontSize: 14, bold: true, color: th.white, align: 'center', valign: 'middle', lineSpacingMultiple: 1.15 });
    const m = side.items.length, ig = Math.min(0.95, 4.1 / m);
    side.items.forEach((t, i) => {
      k.rr(s, [11.42, 2.7 + i * ig, 1.29, ig - 0.22], th.white, { r: 0.2, tr: 82 });
      k.text(s, t, [11.42, 2.7 + i * ig, 1.29, ig - 0.22], { fontSize: 12, bold: true, color: th.white, align: 'center', valign: 'middle' });
    });
  }
};
