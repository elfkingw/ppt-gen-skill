module.exports = {
  name: 'flow3',
  summary: '输入 → 引擎 → 输出 三栏：左列表、中间 4 卡围绕核心 + 主结论条 + 备注、右侧结论卡',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub });
    const [inp, eng, out] = d.columns;
    const Y = 1.4, H = 5.5, LX = k.M, LW = 3.3, CX = 4.05, CW = 5.2, RX = 9.58, RW = 3.3;
    [[LX, LW], [CX, CW], [RX, RW]].forEach(([x, w]) => k.panel(s, [x, Y, w, H]));
    [[LX, inp], [CX, eng], [RX, out]].forEach(([x, c], i) => {
      k.badge(s, x + 0.2, Y + 0.15, 0.6, String(i + 1).padStart(2, '0'));
      k.text(s, c.title, [x + 0.9, Y + 0.15, (i === 1 ? CW : LW) - 1.0, 0.6], { fontSize: 16, bold: true, color: th.primary, valign: 'middle' });
    });
    k.chev(s, 3.8, Y + 0.3); k.chev(s, 9.33, Y + 0.3);

    const li = inp.items, ln = li.length, lg = Math.min(0.75, 4.55 / ln);
    li.forEach((t, i) => {
      const y = Y + 0.95 + i * lg, h = lg - 0.13;
      k.card(s, [LX + 0.2, y, LW - 0.4, h], { r: 0.2 });
      k.iconTile(s, LX + 0.33, y + (h - 0.44) / 2, 0.44, t.icon, { square: true });
      k.text(s, t.text, [LX + 0.9, y, LW - 1.15, h], { fontSize: 12.5, bold: true, color: t.highlight ? th.primary : th.ink, valign: 'middle' });
    });

    const pos = [[CX + 0.2, Y + 0.95], [CX + 2.95, Y + 0.95], [CX + 0.2, Y + 2.25], [CX + 2.95, Y + 2.25]];
    eng.cards.slice(0, 4).forEach((c, i) => {
      const [x, y] = pos[i], left = i % 2 === 0;
      k.card(s, [x, y, 2.05, 1.1], { r: 0.12 });
      const tx = left ? x + 0.15 : x + 0.45, tw = left ? 1.45 : 1.5;
      k.text(s, c.title, [tx, y + 0.12, tw, 0.34], { fontSize: 13, bold: true, color: th.ink, valign: 'middle' });
      k.text(s, c.desc, [tx, y + 0.5, tw, 0.55], { fontSize: 10, color: th.body, lineSpacingMultiple: 1.1 });
    });
    k.rings(s, CX + 2.6, Y + 2.15, 0.72, eng.core, { noOuter: true, fontSize: 12 });
    if (eng.bar) k.band(s, [CX + 0.2, Y + 3.55, CW - 0.4, 0.75], eng.bar, { solid: true, fontSize: 13 });
    if (eng.note) k.band(s, [CX + 0.2, Y + 4.5, CW - 0.4, 0.75], eng.note, { fontSize: 11 });

    const oi = out.items, on = oi.length, og = Math.min(0.9, 4.55 / on);
    oi.forEach((r, i) => {
      const y = Y + 0.95 + i * og, h = og - 0.12;
      k.card(s, [RX + 0.2, y, RW - 0.4, h], { r: 0.15 });
      k.text(s, r.title, [RX + 0.38, y + 0.06, RW - 0.7, 0.34], { fontSize: 13, bold: true, color: r.highlight ? th.primary : th.ink, valign: 'middle' });
      if (r.desc) k.text(s, r.desc, [RX + 0.38, y + 0.4, RW - 0.7, h - 0.44], { fontSize: 10, color: th.body, valign: 'middle' });
    });
  }
};
