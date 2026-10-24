const { measure } = require('../parts');

module.exports = {
  name: 'cover',
  summary: '封面：标签胶囊 + 两行大标题 + 副标题 + 3 个特性标签 + 署名，右侧中心环绕图',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { big: true, footer: false });
    let y = 1.55;
    if (d.kicker) {
      const w = Math.max(2.0, measure(d.kicker, 12) + 0.6);
      k.chip(s, [0.8, y, w, 0.4], d.kicker, { fontSize: 12 });
    }
    const [l1, l2] = d.title;
    const tSize = d.titleSize || 40;
    k.text(s, l1, [0.8, 2.15, 6.6, 0.8], { fontSize: tSize, bold: true, color: th.ink, valign: 'middle' });
    if (l2) k.text(s, l2, [0.8, 2.95, 6.6, 0.8], { fontSize: tSize, bold: true, color: th.primary, valign: 'middle' });
    y = 3.95;
    if (d.subtitle) { k.text(s, d.subtitle, [0.8, y, 6.4, 0.6], { fontSize: 22, bold: true, color: th.sub, valign: 'middle' }); y += 0.75; }
    if (d.desc) { k.text(s, d.desc, [0.8, y, 6.2, 0.75], { fontSize: 15, color: th.body, lineSpacingMultiple: 1.3 }); y += 0.9; }
    const tagY = Math.max(5.0, y + 0.15);
    (d.tags || []).slice(0, 3).forEach((t, i) => {
      const x = 0.8 + i * 2.05;
      k.card(s, [x, tagY, 1.85, 0.6], { r: 0.3 });
      k.iconTile(s, x + 0.12, tagY + 0.08, 0.44, t.icon);
      k.text(s, t.text, [x + 0.64, tagY, 1.15, 0.6], { fontSize: 13, bold: true, color: th.ink, valign: 'middle' });
    });
    if (d.vendor) k.text(s, d.vendor, [0.8, 6.35, 6, 0.35], { fontSize: 13, bold: true, color: th.primary, valign: 'middle' });

    const o = d.orbit;
    if (o) {
      const cx = 9.95, cy = 3.85, R = 2.55;
      s.addShape('ellipse', { x: cx - R, y: cy - R, w: 2 * R, h: 2 * R, fill: { type: 'none' }, line: { color: th.primarySoft, width: 1, dashType: 'dash' } });
      k.rings(s, cx, cy, 1.75, o.center, { noOuter: true, fontSize: 15 });
      const n = o.nodes.length;
      o.nodes.forEach((c, i) => {
        const a = (-90 + (i * 360) / n) * Math.PI / 180, px = cx + R * Math.cos(a), py = cy + R * Math.sin(a);
        k.card(s, [px - 0.78, py - 0.27, 1.56, 0.54], { r: 0.3 });
        k.iconTile(s, px - 0.7, py - 0.2, 0.4, c.icon);
        k.text(s, c.text, [px - 0.24, py - 0.27, 1.0, 0.54], { fontSize: 11, bold: true, color: th.ink, valign: 'middle' });
      });
    }
  }
};
