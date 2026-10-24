// Custom page: data column on the left, four stacked layers on the right
// (entry → capabilities → highlighted new layer → base), with a legend.
module.exports = function architecture(s, d, k) {
  const th = k.th;
  k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub });
  const TOP = 1.38, BOT = 6.94;

  // Legend: existing vs new
  k.rr(s, [7.55, 0.98, 0.32, 0.2], th.white, { r: 0.2, line: { color: th.line, width: 0.75 } });
  k.text(s, d.legend[0], [7.95, 0.93, 1.6, 0.3], { fontSize: 10.5, color: th.body, valign: 'middle' });
  k.rr(s, [9.65, 0.98, 0.32, 0.2], th.tint, { r: 0.2, line: { color: th.primary, width: 1, dashType: 'dash' } });
  k.text(s, d.legend[1], [10.05, 0.93, 1.5, 0.3], { fontSize: 10.5, color: th.body, valign: 'middle' });

  // Left: data sources
  const LX = 0.45, LW = 2.35, src = d.sources;
  k.panel(s, [LX, TOP, LW, BOT - TOP], { tr: 20 });
  k.rr(s, [LX, TOP, LW, 0.5], th.primary, { r: 0.24 });
  k.rect(s, [LX, TOP + 0.25, LW, 0.25], th.primary);
  k.icon(s, 'database', LX + 0.31, TOP + 0.25, 0.26, th.white);
  k.text(s, src.title, [LX + 0.55, TOP, LW - 0.6, 0.5], { fontSize: 14, bold: true, color: th.white, valign: 'middle' });
  let y = TOP + 0.62;
  src.items.forEach((it) => {
    k.rr(s, [LX + 0.12, y, LW - 0.24, 0.48], th.tint, { r: 0.14 });
    k.iconTile(s, LX + 0.2, y + 0.1, 0.28, it.icon, { square: true, tint: th.white });
    k.text(s, it.text, [LX + 0.56, y, LW - 0.64, 0.48], { fontSize: it.text.length > 9 ? 10 : 10.5, bold: true, color: th.ink, valign: 'middle' });
    y += 0.555;
  });
  k.text(s, src.foot, [LX, y + 0.02, LW, BOT - y - 0.04], { fontSize: 10, color: th.muted, align: 'center', valign: 'middle' });

  // Right: layers
  const RX = 3.3, RW = 12.88 - 3.3, cols = k.grid(4, RX + 0.14, RW - 0.28, 0.12);
  const up = (y0) => [0.3, 0.7].forEach((fx) => s.addShape('upArrow', { x: RX + RW * fx - 0.13, y: y0, w: 0.26, h: 0.16, fill: { color: th.primarySoft }, line: { type: 'none' } }));
  const head = (x, y0, icon, title, w) => {
    k.icon(s, icon, x + 0.26, y0 + 0.22, 0.24);
    k.text(s, title, [x + 0.48, y0 + 0.04, w || 4, 0.36], { fontSize: 13, bold: true, color: th.primaryDark, valign: 'middle' });
  };

  // Entry row
  const EY = TOP, ent = d.entry;
  k.panel(s, [RX, EY, RW, 0.48], { tr: 15 });
  k.text(s, ent.title, [RX + 0.14, EY, 0.7, 0.48], { fontSize: 12, bold: true, color: th.primaryDark, valign: 'middle' });
  const ec = k.grid(ent.items.length, RX + 0.9, RW - 1.04, 0.1);
  ent.items.forEach((e, i) => {
    k.rr(s, [ec[i].x, EY + 0.07, ec[i].w, 0.34], th.white, { r: 0.14, line: { color: th.line, width: 0.75 } });
    k.text(s, e, [ec[i].x, EY + 0.07, ec[i].w, 0.34], { fontSize: 10.5, bold: true, color: th.ink, align: 'center', valign: 'middle' });
  });
  up(1.92);

  // Capabilities (2 x 4)
  const CY = 2.12, cap = d.capabilities;
  k.panel(s, [RX, CY, RW, 1.38], { tr: 15 });
  head(RX, CY, 'sparkles', cap.title);
  if (cap.note) k.text(s, cap.note, [RX + RW - 3.2, CY + 0.04, 3.06, 0.36], { fontSize: 10, color: th.muted, align: 'right', valign: 'middle' });
  cap.items.forEach((c, i) => {
    const x = cols[i % 4].x, w = cols[i % 4].w, yy = CY + 0.46 + Math.floor(i / 4) * 0.46;
    k.rr(s, [x, yy, w, 0.38], th.white, { r: 0.14, line: { color: th.line, width: 0.75 } });
    k.iconTile(s, x + 0.08, yy + 0.05, 0.28, c.icon, { square: true });
    k.text(s, c.text, [x + 0.44, yy, w - 0.5, 0.38], { fontSize: 11, bold: true, color: th.ink, valign: 'middle' });
  });
  up(3.56);

  // Highlighted (new) layer
  const OY = 3.76, core = d.core;
  k.dashedBox(s, [RX, OY, RW, 1.54]);
  head(RX, OY, 'network', core.title, 1.9);
  k.rr(s, [RX + 2.3, OY + 0.1, 0.5, 0.26], th.tint, { r: 0.5, line: { color: th.primary, width: 1, dashType: 'dash' } });
  k.text(s, core.tag, [RX + 2.3, OY + 0.1, 0.5, 0.26], { fontSize: 10, bold: true, color: th.primaryDark, align: 'center', valign: 'middle' });
  core.items.forEach((c, i) => {
    k.rr(s, [cols[i].x, OY + 0.46, cols[i].w, 0.62], th.white, { r: 0.14, line: { color: th.line, width: 0.75 } });
    k.text(s, [{ text: c.title, options: { fontSize: 11, bold: true, color: th.primaryDark, breakLine: true } }, { text: c.desc, options: { fontSize: 10, color: th.sub } }],
      [cols[i].x, OY + 0.46, cols[i].w, 0.62], { align: 'center', valign: 'middle', fontSize: 11 });
  });
  if (core.chain) k.text(s, [
    { text: core.chain[0] + '    ', options: { fontSize: 10, color: th.muted } },
    { text: core.chain[1], options: { fontSize: 10.5, color: th.sub } },
    { text: core.chain[2], options: { fontSize: 10.5, bold: true, color: th.primaryDark } }
  ], [RX + 0.14, OY + 1.14, RW - 0.28, 0.34], { valign: 'middle', fontSize: 10.5 });
  up(5.36);

  // Base layer (2 x 4)
  const BY = 5.56, base = d.base;
  k.panel(s, [RX, BY, RW, BOT - BY], { tr: 15 });
  head(RX, BY, 'layers', base.title);
  base.items.forEach((n, i) => {
    const x = cols[i % 4].x, w = cols[i % 4].w, yy = BY + 0.46 + Math.floor(i / 4) * 0.44;
    k.rr(s, [x, yy, w, 0.36], th.white, { r: 0.14, line: { color: th.line, width: 0.75 } });
    k.text(s, n, [x, yy, w, 0.36], { fontSize: 10.5, bold: true, color: th.ink, align: 'center', valign: 'middle' });
  });

  // Ingestion arrow
  s.addShape('rightArrow', { x: LX + LW + 0.08, y: OY + 0.6, w: RX - (LX + LW) - 0.16, h: 0.34, fill: { color: th.primarySoft }, line: { type: 'none' } });
};
