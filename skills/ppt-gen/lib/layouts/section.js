module.exports = {
  name: 'section',
  summary: '左侧超大数字/词 + 标题 + 说明（+ 来源），右侧 2～4 条编号条目；设 current 即为章节分隔页',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { page: k.ctx.page });
    const big = String(d.number);
    const bigSize = d.numberSize || (big.length <= 2 ? 96 : 88);
    k.text(s, big, [0.9, 1.55, 6.0, 1.55], { fontSize: bigSize, bold: true, color: th.primary, valign: 'middle' });
    k.text(s, d.heading, [0.9, 3.2, 5.9, 0.8], { fontSize: 36, bold: true, color: th.ink, valign: 'middle' });
    if (d.desc) k.text(s, d.desc, [0.9, 4.15, 5.6, 1.25], { fontSize: 15, color: th.body, lineSpacingMultiple: 1.3 });
    if (d.source) k.text(s, d.source, [0.9, 5.45, 5.6, 0.5], { fontSize: 9, color: th.muted, lineSpacingMultiple: 1.2 });

    const items = d.items || [], n = items.length;
    if (!n) return;
    const px = 7.0, py = 1.6, pw = 5.88, ph = 4.9;
    k.panel(s, [px, py, pw, ph], { tr: 20 });
    const gap = 0.22, rh = Math.min(1.2, (ph - 0.5 - (n - 1) * gap) / n);
    const y0 = py + (ph - (n * rh + (n - 1) * gap)) / 2;
    const chapter = d.current !== undefined;
    items.forEach((r, i) => {
      const y = y0 + i * (rh + gap), on = !chapter || i === d.current;
      k.card(s, [px + 0.3, y, pw - 0.6, rh], { r: 0.12, line: { color: chapter && on ? th.primary : th.line, width: chapter && on ? 1.75 : 0.75 }, shadow: on });
      k.badge(s, px + 0.55, y + (rh - 0.6) / 2, 0.6, r.num || String(i + 1).padStart(2, '0'), { muted: !on });
      k.text(s, r.title, [px + 1.4, y + 0.14, pw - 2.9, 0.4], { fontSize: 16, bold: true, color: on ? (chapter ? th.primary : th.ink) : th.muted, valign: 'middle' });
      if (r.desc) k.text(s, r.desc, [px + 1.4, y + 0.56, pw - 1.75, rh - 0.62], { fontSize: chapter ? 12 : 11, color: on ? th.body : th.muted, lineSpacingMultiple: 1.15 });
      if (chapter && on) k.chip(s, [px + pw - 1.3, y + 0.16, 0.9, 0.32], d.currentLabel || '本章', { fill: th.primary, color: th.white, fontSize: 11 });
    });
  }
};
