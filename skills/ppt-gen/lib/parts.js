// Design parts shared by every layout. Units: inches on a 13.333 x 7.5 canvas.
const { hasIcon, drawIcon, suggest } = require('./icons');

const SLIDE_W = 13.333333, SLIDE_H = 7.5, M = 0.45, CONTENT_W = SLIDE_W - 2 * M;

// Rough text width in inches: CJK/full-width = 1em, latin ≈ 0.55em.
function measure(str, size) {
  let em = 0;
  for (const ch of String(str)) em += /[\u2E80-\uFFEF]/.test(ch) ? 1 : (ch === ' ' ? 0.3 : 0.55);
  return (em * size) / 72;
}
function plain(content) {
  if (Array.isArray(content)) return content.map((r) => (typeof r === 'string' ? r : r.text + (r.options && r.options.breakLine ? '\n' : ''))).join('');
  return String(content);
}

function makeKit(pptx, th, ctx) {
  const k = { th, M, SLIDE_W, SLIDE_H, CONTENT_W, ctx };
  const warn = (msg) => ctx.warnings.push('第 ' + ctx.page + ' 页（' + ctx.layout + '）：' + msg);
  k.warn = warn;

  k.shadow = () => ({ type: 'outer', color: th.primary, blur: 9, offset: 2, angle: 90, opacity: 0.1 });

  k.text = (s, content, box, opts) => {
    const o = Object.assign({ margin: 0, valign: 'top', isTextBox: true, fontFace: th.font, lang: 'zh-CN', color: th.body, fontSize: 12 }, opts);
    s.addText(content, Object.assign({ x: box[0], y: box[1], w: box[2], h: box[3] }, o));
    if (o.fit !== false && box[2] > 0) {
      const lines = plain(content).split('\n').reduce((n, para) => n + Math.max(1, Math.ceil(measure(para, o.fontSize) / box[2] - 0.02)), 0);
      const need = (lines * o.fontSize * 1.2 * (o.lineSpacingMultiple || 1)) / 72;
      if (need > box[3] + 0.06) warn('文字可能溢出「' + plain(content).slice(0, 18) + '」（约 ' + lines + ' 行，需高 ' + need.toFixed(2) + 'in，框高 ' + box[3].toFixed(2) + 'in）');
    }
  };
  k.rr = (s, box, fill, o) => {
    o = o || {};
    const r = o.r === undefined ? 0.16 : o.r;
    s.addShape('roundRect', Object.assign({
      x: box[0], y: box[1], w: box[2], h: box[3], rectRadius: r * Math.min(box[2], box[3]),
      fill: fill ? Object.assign({ color: fill }, o.tr ? { transparency: o.tr } : {}) : { type: 'none' },
      line: o.line || { type: 'none' }
    }, o.shadow ? { shadow: k.shadow() } : {}));
  };
  k.rect = (s, box, fill, tr) => s.addShape('rect', { x: box[0], y: box[1], w: box[2], h: box[3], fill: Object.assign({ color: fill }, tr ? { transparency: tr } : {}), line: { type: 'none' } });
  k.hline = (s, x, y, w, color, width, dash) => s.addShape('line', { x, y, w, h: 0, line: Object.assign({ color: color || th.line, width: width || 1 }, dash ? { dashType: dash } : {}) });
  k.vline = (s, x, y, h, color, width) => s.addShape('line', { x, y, w: 0, h, line: { color: color || th.line, width: width || 1 } });

  // Surfaces
  k.card = (s, box, o) => k.rr(s, box, th.white, Object.assign({ r: 0.08, line: { color: th.line, width: 0.75 }, shadow: true }, o || {}));
  k.panel = (s, box, o) => k.rr(s, box, th.white, Object.assign({ r: 0.05, tr: 35, line: { color: th.panelLine, width: 0.75 } }, o || {}));
  k.band = (s, box, txt, o) => {
    o = o || {};
    const solid = o.solid;
    k.rr(s, box, solid ? th.primary : th.tint2, { r: o.r || 0.22, shadow: solid });
    if (txt) k.text(s, txt, box, { fontSize: o.fontSize || 12, bold: true, color: solid ? th.white : th.primaryDark, align: o.align || 'center', valign: 'middle', lineSpacingMultiple: 1.15 });
  };
  k.dashedBox = (s, box) => k.rr(s, box, th.tint, { r: 0.05, line: { color: th.primary, width: 1.25, dashType: 'dash' } });
  k.chip = (s, box, txt, o) => {
    o = o || {};
    k.rr(s, box, o.fill || th.tint2, { r: 0.5, line: o.line });
    k.text(s, txt, box, { fontSize: o.fontSize || 11, bold: true, color: o.color || th.primary, align: 'center', valign: 'middle' });
  };

  // Icons
  // Lucide icon name (kebab-case, e.g. "bell-ring"); z = icon box size in inches.
  k.icon = (s, name, cx, cy, z, color, o) => {
    if (!hasIcon(name)) {
      const near = name ? suggest(name) : [];
      warn('未知图标「' + name + '」，已用圆点代替' + (near.length ? '。相近的有：' + near.join(', ') : ''));
      s.addShape('ellipse', { x: cx - z * 0.2, y: cy - z * 0.2, w: z * 0.4, h: z * 0.4, fill: { color: color || th.primary }, line: { type: 'none' } });
      return;
    }
    drawIcon(s, name, cx, cy, z, color || th.primary, o && o.stroke);
  };
  // Tinted circle (or rounded square) with a glyph centred inside.
  k.iconTile = (s, x, y, d, name, o) => {
    o = o || {};
    if (o.square) k.rr(s, [x, y, d, d], o.tint || th.tint, { r: 0.28 });
    else s.addShape('ellipse', { x, y, w: d, h: d, fill: { color: o.tint || th.tint }, line: { type: 'none' } });
    k.icon(s, name, x + d / 2, y + d / 2, d * 0.5, o.color);
  };
  k.badge = (s, x, y, d, num, o) => {
    o = o || {};
    const fill = o.muted ? 'C3C9D4' : th.primary;
    s.addShape('ellipse', { x, y, w: d, h: d, fill: { color: o.muted ? 'EEF0F4' : th.tint2 }, line: { type: 'none' } });
    const i = d * 0.78, off = (d - i) / 2;
    s.addShape('ellipse', Object.assign({ x: x + off, y: y + off, w: i, h: i, fill: { color: fill }, line: { type: 'none' } }, o.muted ? {} : { shadow: k.shadow() }));
    k.text(s, String(num), [x, y, d, d], { fontSize: Math.round(d * 26), bold: true, color: th.white, align: 'center', valign: 'middle', fit: false });
  };
  // Solid primary tile + zh heading + small spaced EN caption.
  k.sectionHead = (s, x, y, zh, en, icon) => {
    k.rr(s, [x, y, 0.52, 0.52], th.primary, { r: 0.25, shadow: true });
    k.icon(s, icon || 'file-text', x + 0.26, y + 0.26, 0.28, th.white);
    k.text(s, zh, [x + 0.68, y - 0.03, 2.6, 0.36], { fontSize: 17, bold: true, color: th.primary, valign: 'middle' });
    if (en) k.text(s, en.toUpperCase(), [x + 0.68, y + 0.33, 2.6, 0.2], { fontSize: 7, color: th.muted, charSpacing: 2, valign: 'middle' });
  };
  k.dots = (s, items, x, y, w, gap, size, color) => {
    items.forEach((t, j) => {
      s.addShape('ellipse', { x, y: y + j * gap + 0.13, w: 0.08, h: 0.08, fill: { color: th.primary }, line: { type: 'none' } });
      k.text(s, t, [x + 0.2, y + j * gap, w - 0.2, 0.34], { fontSize: size || 12, color: color || th.body, valign: 'middle' });
    });
  };
  k.chev = (s, x, y) => s.addShape('chevron', { x, y, w: 0.2, h: 0.3, fill: { color: th.primarySoft }, line: { type: 'none' } });
  // Concentric hub: dashed outer ring, two tints, solid core with label.
  k.rings = (s, cx, cy, r, label, o) => {
    o = o || {};
    if (!o.noOuter) s.addShape('ellipse', { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: o.outerFill ? { color: th.tint } : { type: 'none' }, line: { color: th.primarySoft, width: 1, dashType: 'dash' } });
    const r2 = r * (o.noOuter ? 1 : 0.66), r3 = r2 * 0.68, r4 = r3 * 0.74;
    s.addShape('ellipse', { x: cx - r2, y: cy - r2, w: 2 * r2, h: 2 * r2, fill: { color: th.tint }, line: { type: 'none' } });
    s.addShape('ellipse', { x: cx - r3, y: cy - r3, w: 2 * r3, h: 2 * r3, fill: { color: th.tint2 }, line: { type: 'none' } });
    s.addShape('ellipse', { x: cx - r4, y: cy - r4, w: 2 * r4, h: 2 * r4, fill: { color: th.primary }, line: { color: th.white, width: 3 }, shadow: k.shadow() });
    if (label) k.text(s, label, [cx - r4, cy - r4, 2 * r4, 2 * r4], { fontSize: o.fontSize || 14, bold: true, color: th.white, align: 'center', valign: 'middle', lineSpacingMultiple: 1.15, fit: false });
  };

  // Equal columns: grid(n, x, totalW, gap) -> [{x, w}]
  k.grid = (n, x, w, gap) => { const cw = (w - (n - 1) * gap) / n; return Array.from({ length: n }, (_, i) => ({ x: x + i * (cw + gap), w: cw })); };

  // Background decor, drawn first.
  k.canvas = (s, big) => {
    s.background = { color: th.bg };
    const q = big ? 1.35 : 1;
    if (th.decor === 'skyline') {
      [[0, 0.35, 1.5], [0.38, 0.28, 2.1], [0.7, 0.42, 1.3], [1.15, 0.3, 1.8], [1.5, 0.45, 1.0], [2.0, 0.25, 1.4]].forEach((b) => k.rect(s, [b[0] * q, SLIDE_H - b[2] * q, b[1] * q, b[2] * q], th.decor1));
      [[0.15, 0.3, 0.9], [0.5, 0.38, 1.25], [0.95, 0.26, 0.75], [1.28, 0.34, 1.05], [1.7, 0.3, 0.6]].forEach((b) => k.rect(s, [b[0] * q, SLIDE_H - b[2] * q, b[1] * q, b[2] * q], th.decor2));
      [[6.6, 0.3, 0.7], [6.95, 0.22, 1.0], [7.25, 0.35, 0.55], [7.7, 0.25, 0.85], [8.0, 0.4, 0.5]].forEach((b) => k.rect(s, [b[0], 1.2 - b[2], b[1], b[2]], th.decorTitle));
      s.addShape('rightArrow', { x: 11.55, y: 6.35, w: 1.5, h: 0.42, rotate: -28, fill: { color: th.decor2, transparency: 20 }, line: { type: 'none' } });
    } else if (th.decor === 'grid') {
      for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) s.addShape('ellipse', { x: 11.2 + i * 0.26, y: 0.2 + j * 0.26, w: 0.06, h: 0.06, fill: { color: th.decor2 }, line: { type: 'none' } });
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) s.addShape('ellipse', { x: 0.25 + i * 0.26, y: 6.45 + j * 0.26, w: 0.06, h: 0.06, fill: { color: th.decor2 }, line: { type: 'none' } });
      s.addShape('ellipse', { x: 10.6, y: 5.4, w: 3.6, h: 3.6, fill: { color: th.decor1, transparency: 40 }, line: { type: 'none' } });
    } else if (th.decor === 'wave') {
      s.addShape('wave', { x: -0.5, y: 6.75, w: 14.4, h: 1.2, fill: { color: th.decor1 }, line: { type: 'none' } });
      s.addShape('wave', { x: -0.5, y: 7.0, w: 14.4, h: 1.0, fill: { color: th.decor2 }, line: { type: 'none' }, flipH: true });
      s.addShape('ellipse', { x: 10.9, y: -1.6, w: 3.2, h: 3.2, fill: { color: th.decorTitle }, line: { type: 'none' } });
    }
  };

  // Page chrome: two-part title, subtitle, tagline rule, footers. No page number.
  k.chrome = (s, o) => {
    o = o || {};
    k.canvas(s, o.big);
    const brand = ctx.brand || {};
    if (o.title) {
      const runs = [{ text: o.title, options: { color: th.ink } }];
      if (o.suffix) runs.push({ text: '——' + o.suffix, options: { color: th.primary } });
      k.text(s, runs, [M, 0.26, 9.0, 0.6], { fontSize: 28, bold: true, valign: 'middle' });
    }
    if (o.sub) k.text(s, o.sub, [M, 0.88, 9.8, 0.34], { fontSize: 14, bold: true, color: th.sub, valign: 'middle' });
    if (brand.tagline) {
      k.hline(s, 9.05, 0.555, 0.35, th.primarySoft, 1.25);
      k.hline(s, 9.4, 0.555, 0.6, th.primary, 1.25);
      k.text(s, brand.tagline, [10.1, 0.43, 2.15, 0.25], { fontSize: 9, color: th.muted, charSpacing: 1.5, valign: 'middle' });
    }
    if (o.footer !== false) {
      const f = brand.footer || [];
      if (f[0]) k.text(s, f[0], [M, 7.1, 4.5, 0.24], { fontSize: 8, color: th.muted, charSpacing: 1, valign: 'middle' });
      const right = o.footerNote ? o.footerNote : f[1];
      if (right) k.text(s, right, [7.9, 7.1, 5.0, 0.24], { fontSize: o.footerNote ? 9 : 8, bold: !!o.footerNote, color: o.footerNote ? th.danger : th.muted, align: 'right', charSpacing: 1, valign: 'middle' });
    }
  };
  return k;
}

module.exports = { makeKit, measure, SLIDE_W, SLIDE_H, M, CONTENT_W };
