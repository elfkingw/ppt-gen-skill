module.exports = {
  name: 'hub',
  summary: '中心辐射：左右各 2～5 张卡片围绕中心圆环，顶部提示、底部结论（定位、生态、数据来源）',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub, page: k.ctx.page });
    k.panel(s, [k.M, 1.4, k.CONTENT_W, 5.5]);
    const col = (list, x) => {
      const n = list.length, gap = 0.25, h = Math.min(1.0, (5.0 - (n - 1) * gap) / n);
      const y0 = 1.4 + (5.5 - (n * h + (n - 1) * gap)) / 2;
      list.forEach((r, i) => {
        const y = y0 + i * (h + gap);
        k.card(s, [x, y, 3.3, h], { r: 0.12 });
        k.iconTile(s, x + 0.2, y + (h - 0.6) / 2, 0.6, r.icon);
        k.text(s, r.title, [x + 0.95, y + h / 2 - 0.37, 2.25, 0.38], { fontSize: 14, bold: true, color: th.ink, valign: 'middle' });
        if (r.desc) k.text(s, r.desc, [x + 0.95, y + h / 2 + 0.03, 2.25, 0.3], { fontSize: 10.5, color: th.body, valign: 'middle' });
      });
    };
    col(d.left, 0.7); col(d.right, 9.33);
    const cx = 6.67, cy = 3.95;
    s.addShape('ellipse', { x: cx - 1.6, y: cy - 1.6, w: 3.2, h: 3.2, fill: { color: th.tint, transparency: 30 }, line: { color: th.primarySoft, width: 1, dashType: 'dash' } });
    k.rings(s, cx, cy, 1.25, d.center, { noOuter: true, fontSize: 14 });
    if (d.leftLabel) k.text(s, d.leftLabel, [4.15, 2.9, 1.3, 0.6], { fontSize: 10.5, bold: true, color: th.primary, align: 'center', lineSpacingMultiple: 1.15 });
    if (d.rightLabel) k.text(s, d.rightLabel, [7.9, 2.9, 1.3, 0.6], { fontSize: 10.5, bold: true, color: th.primary, align: 'center', lineSpacingMultiple: 1.15 });
    if (d.top) {
      k.card(s, [4.85, 1.62, 3.65, 0.62], { r: 0.25 });
      k.iconTile(s, 5.0, 1.7, 0.46, d.top.icon || 'plus');
      k.text(s, d.top.text, [5.55, 1.62, 2.85, 0.62], { fontSize: 11.5, bold: true, color: th.ink, valign: 'middle' });
    }
    if (d.bottom) k.band(s, [4.75, 5.95, 3.85, 0.7], d.bottom, { fontSize: 11 });
  }
};
