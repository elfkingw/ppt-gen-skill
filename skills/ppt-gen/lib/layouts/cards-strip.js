module.exports = {
  name: 'cards-strip',
  summary: '分区标题 + 3～4 张图标卡（标题/说明/彩色结论）+ 底部条带（3 个要点或一句结论）',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub, page: k.ctx.page });
    const head = d.head || {};
    k.panel(s, [k.M, 1.4, k.CONTENT_W, 4.05]);
    k.sectionHead(s, 0.7, 1.6, head.zh, head.en, head.icon);
    if (head.note) k.text(s, head.note, [8.6, 1.62, 4.05, 0.4], { fontSize: 11, color: th.muted, align: 'right', valign: 'middle' });
    const cards = d.cards, n = cards.length, cols = k.grid(n, 0.7, 11.93, 0.22);
    cards.forEach((c, i) => {
      const { x, w } = cols[i], y = 2.35;
      const acc = th.accents[c.accent !== undefined ? c.accent : (d.monochrome ? 1 : i % th.accents.length)];
      k.card(s, [x, y, w, 2.9], { r: 0.07 });
      k.iconTile(s, x + 0.25, y + 0.25, 0.72, c.icon, { color: acc.color, tint: acc.tint });
      k.text(s, c.title, [x + 0.25, y + 1.1, w - 0.5, 0.4], { fontSize: 15, bold: true, color: th.ink, valign: 'middle' });
      k.text(s, c.desc, [x + 0.25, y + 1.55, w - 0.45, 0.85], { fontSize: 11, color: th.body, lineSpacingMultiple: 1.25 });
      if (c.impact) {
        k.hline(s, x + 0.25, y + 2.42, w - 0.5, th.line, 0.75);
        k.text(s, c.impact, [x + 0.25, y + 2.48, w - 0.5, 0.32], { fontSize: 11, bold: true, color: acc.color, valign: 'middle' });
      }
    });
    const st = d.strip;
    if (!st) return;
    k.panel(s, [k.M, 5.6, k.CONTENT_W, 1.3]);
    k.sectionHead(s, 0.7, 5.98, st.zh, st.en, st.icon);
    k.card(s, [3.05, 5.75, 9.63, 1.0], { r: 0.2 });
    if (st.items) {
      const m = st.items.length, cw = 9.63 / m;
      st.items.forEach((r, i) => {
        const x = 3.05 + i * cw;
        k.iconTile(s, x + 0.25, 6.0, 0.5, r.icon);
        k.text(s, r.title, [x + 0.9, 5.88, cw - 1.0, 0.36], { fontSize: 13, bold: true, color: th.primary, valign: 'middle' });
        k.text(s, r.desc, [x + 0.9, 6.24, cw - 1.0, 0.3], { fontSize: 10, color: th.body, valign: 'middle' });
        if (i) k.vline(s, x, 5.95, 0.6, th.line, 1);
      });
    } else {
      k.iconTile(s, 3.3, 6.0, 0.5, st.lineIcon || st.icon);
      k.text(s, st.lead, [4.0, 5.84, 8.5, 0.38], { fontSize: 13, bold: true, color: th.primary, valign: 'middle' });
      k.text(s, st.body, [4.0, 6.22, 8.5, 0.38], { fontSize: 12, bold: true, color: th.ink, valign: 'middle' });
    }
  }
};
