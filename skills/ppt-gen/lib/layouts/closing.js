module.exports = {
  name: 'closing',
  summary: '结束页：两行主张 + 一句邀请 + 署名，右侧信息卡（联系人或试点信息）',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { big: true, footer: false, page: k.ctx.page });
    const [l1, l2] = d.claim;
    k.text(s, l1, [0.8, 2.3, 8, 0.85], { fontSize: 38, bold: true, color: th.ink, valign: 'middle' });
    if (l2) k.text(s, l2, [0.8, 3.15, 8, 0.85], { fontSize: 38, bold: true, color: th.primary, valign: 'middle' });
    if (d.desc) k.text(s, d.desc, [0.8, 4.25, 7.6, 0.5], { fontSize: 16, color: th.body, valign: 'middle' });
    if (d.vendor) k.text(s, d.vendor, [0.8, 4.95, 7, 0.4], { fontSize: 13, bold: true, color: th.primary, valign: 'middle' });
    const info = d.info || [];
    if (!info.length) return;
    const h = 0.5 + info.length * 0.65;
    k.card(s, [8.9, 2.3, 3.9, h], { r: 0.08 });
    info.forEach((r, i) => {
      k.text(s, r.k, [9.2, 2.55 + i * 0.65, 1.0, 0.4], { fontSize: 12, bold: true, color: th.primary, valign: 'middle' });
      k.text(s, r.v, [10.25, 2.55 + i * 0.65, 2.4, 0.4], { fontSize: 12, color: th.ink, valign: 'middle' });
    });
  }
};
