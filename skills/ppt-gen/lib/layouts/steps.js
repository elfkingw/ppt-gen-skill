module.exports = {
  name: 'steps',
  summary: '3～5 步流程卡（编号/标题/大图标/要点，箭头相连）+ 底部 2～4 个原则卡',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub });
    const steps = d.steps, n = steps.length, cols = k.grid(n, k.M, k.CONTENT_W, 0.32);
    const hasP = d.principles && d.principles.length;
    const y = 1.45, h = hasP ? 3.75 : 5.3;
    steps.forEach((st, i) => {
      const { x, w } = cols[i];
      k.card(s, [x, y, w, h], { r: 0.06 });
      k.badge(s, x + 0.2, y + 0.22, 0.62, String(i + 1).padStart(2, '0'));
      k.text(s, st.title, [x + 0.9, y + 0.22, w - 1.0, 0.62], { fontSize: n >= 5 ? 14 : 16, bold: true, color: th.ink, valign: 'middle' });
      k.iconTile(s, x + (w - 1.0) / 2, y + 1.05, 1.0, st.icon);
      k.dots(s, st.points, x + 0.3, y + 2.35, w - 0.45, 0.45, 12);
      if (i < n - 1) k.chev(s, x + w + 0.06, y + 1.4);
    });
    if (!hasP) return;
    k.panel(s, [k.M, 5.45, k.CONTENT_W, 1.45]);
    const pc = k.grid(d.principles.length, 0.7, 11.93, 0.2);
    d.principles.forEach((r, i) => {
      const { x, w } = pc[i];
      k.card(s, [x, 5.65, w, 1.05], { r: 0.15 });
      k.iconTile(s, x + 0.18, 5.85, 0.65, r.icon);
      k.text(s, r.title, [x + 0.98, 5.73, w - 1.08, 0.38], { fontSize: 14, bold: true, color: th.primary, valign: 'middle' });
      k.text(s, r.desc, [x + 0.98, 6.11, w - 1.08, 0.5], { fontSize: 10, color: th.body });
    });
  }
};
