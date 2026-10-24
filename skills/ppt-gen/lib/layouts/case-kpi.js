module.exports = {
  name: 'case-kpi',
  summary: '案例：左侧概况（2～4 张说明卡）+ 右侧 2×2 大数字；数字未确认时写 pending: true',
  render(s, d, k) {
    const th = k.th;
    k.chrome(s, { title: d.title, suffix: d.suffix, sub: d.sub, page: k.ctx.page, footerNote: d.footerNote });
    const c = d.case;
    k.panel(s, [k.M, 1.4, 5.6, 5.5]);
    k.sectionHead(s, 0.7, 1.6, c.zh, c.en, c.icon);
    const n = c.items.length, gap = 0.2, ih = Math.min(1.25, (4.35 - (n - 1) * gap) / n);
    c.items.forEach((r, i) => {
      const y = 2.4 + i * (ih + gap);
      k.card(s, [0.7, y, 5.1, ih], { r: 0.12 });
      k.text(s, r.title, [0.95, y + 0.12, 4.6, 0.36], { fontSize: 14, bold: true, color: th.primary, valign: 'middle' });
      k.text(s, r.desc, [0.95, y + 0.52, 4.6, ih - 0.58], { fontSize: 11.5, color: th.body, lineSpacingMultiple: 1.2 });
    });
    d.kpis.slice(0, 4).forEach((m, i) => {
      const x = 6.35 + (i % 2) * 3.32, y = 1.4 + Math.floor(i / 2) * 2.83;
      k.card(s, [x, y, 3.11, 2.62], { r: 0.08 });
      k.text(s, m.value, [x, y + 0.45, 3.11, 1.1], { fontSize: m.pending ? 40 : 48, bold: true, color: m.pending ? th.muted : th.primary, align: 'center', valign: 'middle' });
      k.hline(s, x + 1.1, y + 1.7, 0.9, th.primarySoft, 2);
      k.text(s, m.label, [x + 0.15, y + 1.85, 2.81, 0.45], { fontSize: 14, bold: true, color: th.ink, align: 'center', valign: 'middle' });
    });
  }
};
