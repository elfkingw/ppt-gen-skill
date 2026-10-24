module.exports = {
  name: 'table',
  summary: '对比表：主色表头、高亮「本方案」列、底部结论条和注释（竞品对比、方案对比）',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub, page: k.ctx.page });
    const cols = d.columns.length, hi = d.highlight === undefined ? cols - 1 : d.highlight;
    const size = d.fontSize || (cols >= 6 ? 10.5 : 12);
    const base = { fontFace: th.font, lang: 'zh-CN', fontSize: size, valign: 'middle' };
    const head = d.columns.map((c) => ({ text: c, options: Object.assign({}, base, { bold: true, color: th.white, fill: { color: th.primary }, align: 'center' }) }));
    const body = d.rows.map((r) => r.map((c, j) => ({
      text: c,
      options: Object.assign({}, base, {
        bold: j === 0 || j === hi,
        color: j === hi ? th.primary : (j === 0 ? th.ink : th.body),
        fill: { color: j === hi ? th.tint : th.white },
        align: j === 0 ? 'left' : 'center'
      })
    })));
    const rows = body.length + 1;
    const bottom = d.takeaway ? 6.25 : 6.85, top = 1.5, noteH = d.note ? 0.4 : 0;
    const rowH = Math.min(0.78, (bottom - top - noteH) / rows);
    const firstW = d.firstColW || (cols >= 6 ? 1.75 : 2.4);
    // Highlight column gets 25% more room: it usually carries the longest claims.
    const unit = (k.CONTENT_W - firstW) / (cols - 1 + (hi > 0 ? 0.25 : 0));
    const colW = d.colW || [firstW].concat(Array.from({ length: cols - 1 }, (_, j) => (j + 1 === hi ? unit * 1.25 : unit)));
    s.addTable([head].concat(body), {
      x: k.M, y: top, w: k.CONTENT_W, colW, rowH, fontFace: th.font, fontSize: size, valign: 'middle',
      border: { type: 'solid', pt: 0.75, color: th.line }, margin: [0.02, 0.1, 0.02, 0.1]
    });
    const tb = top + rowH * rows;
    if (d.note) k.text(s, d.note, [k.M, tb + 0.06, k.CONTENT_W, 0.32], { fontSize: 9.5, color: th.muted, valign: 'middle' });
    if (d.takeaway) k.band(s, [k.M, 6.35, k.CONTENT_W, 0.55], d.takeaway, { fontSize: 12, r: 0.3 });
  }
};
