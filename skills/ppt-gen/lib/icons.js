// Lucide icons (lucide-static/icon-nodes.json, bundled offline in vendor/node_modules.tar.gz),
// converted to one native custom-geometry shape per icon: stroke-only, recolorable, editable, no images.
// Coordinates follow Lucide's 24x24 viewBox with stroke width 2, round caps and joins.
let NODES = null, TAGS = null;
function data() {
  if (!NODES) {
    NODES = require('lucide-static/icon-nodes.json');
    TAGS = require('lucide-static/tags.json');
  }
  return { NODES, TAGS };
}

const KAPPA = 0.5522847498;

// Path data -> absolute commands: ['M',x,y] ['L',x,y] ['C',x1,y1,x2,y2,x,y] ['Q',x1,y1,x,y] ['Z'].
function parsePath(d) {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
  const out = [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, lc = null, lq = null;
  const num = () => parseFloat(tokens[i++]);
  // Arc flags may be packed without separators ("a1 1 0 001 1"), so read them one char at a time.
  const flag = () => {
    const t = tokens[i];
    if (t.length > 1 && /^[01]/.test(t)) { tokens[i] = t.slice(1); return +t[0]; }
    i++; return +t;
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === 'Z') { out.push(['Z']); x = sx; y = sy; lc = lq = null; continue; }
    if (C === 'M') {
      x = ox + num(); y = oy + num(); sx = x; sy = y; out.push(['M', x, y]);
      cmd = rel ? 'l' : 'L'; lc = lq = null; continue;
    }
    if (C === 'L') { x = ox + num(); y = oy + num(); out.push(['L', x, y]); lc = lq = null; continue; }
    if (C === 'H') { x = ox + num(); out.push(['L', x, y]); lc = lq = null; continue; }
    if (C === 'V') { y = (rel ? y : 0) + num(); out.push(['L', x, y]); lc = lq = null; continue; }
    if (C === 'C' || C === 'S') {
      let x1, y1;
      if (C === 'C') { x1 = ox + num(); y1 = oy + num(); }
      else { x1 = lc ? 2 * x - lc[0] : x; y1 = lc ? 2 * y - lc[1] : y; }
      const x2 = ox + num(), y2 = oy + num(), ex = ox + num(), ey = oy + num();
      out.push(['C', x1, y1, x2, y2, ex, ey]); lc = [x2, y2]; lq = null; x = ex; y = ey; continue;
    }
    if (C === 'Q' || C === 'T') {
      let x1, y1;
      if (C === 'Q') { x1 = ox + num(); y1 = oy + num(); }
      else { x1 = lq ? 2 * x - lq[0] : x; y1 = lq ? 2 * y - lq[1] : y; }
      const ex = ox + num(), ey = oy + num();
      out.push(['Q', x1, y1, ex, ey]); lq = [x1, y1]; lc = null; x = ex; y = ey; continue;
    }
    if (C === 'A') {
      const rx = num(), ry = num(), rot = num(), large = flag(), sweep = flag(), ex = ox + num(), ey = oy + num();
      arcToCubics(x, y, rx, ry, rot, large, sweep, ex, ey).forEach((c) => out.push(c));
      x = ex; y = ey; lc = lq = null; continue;
    }
    throw new Error('不支持的路径指令 ' + cmd);
  }
  return out;
}

// SVG elliptical arc -> cubic Béziers (W3C SVG implementation notes, F.6.5).
function arcToCubics(x1, y1, rx, ry, rotDeg, large, sweep, x2, y2) {
  if (rx === 0 || ry === 0 || (x1 === x2 && y1 === y2)) return [['L', x2, y2]];
  rx = Math.abs(rx); ry = Math.abs(ry);
  const phi = rotDeg * Math.PI / 180, cos = Math.cos(phi), sin = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const xp = cos * dx + sin * dy, yp = -sin * dx + cos * dy;
  const lam = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
  const num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
  const den = rx * rx * yp * yp + ry * ry * xp * xp;
  const co = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = co * rx * yp / ry, cyp = -co * ry * xp / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2, cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
  let dt = ang((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const segs = Math.ceil(Math.abs(dt) / (Math.PI / 2) - 1e-9);
  const out = [];
  const pt = (t) => [cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin, cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos];
  const der = (t) => [-rx * Math.sin(t) * cos - ry * Math.cos(t) * sin, -rx * Math.sin(t) * sin + ry * Math.cos(t) * cos];
  for (let k = 0; k < segs; k++) {
    const a = t1 + (dt * k) / segs, b = t1 + (dt * (k + 1)) / segs;
    const al = (4 / 3) * Math.tan((b - a) / 4);
    const p0 = pt(a), p1 = pt(b), d0 = der(a), d1 = der(b);
    out.push(['C', p0[0] + al * d0[0], p0[1] + al * d0[1], p1[0] - al * d1[0], p1[1] - al * d1[1], p1[0], p1[1]]);
  }
  return out;
}

function ellipse(cx, cy, rx, ry) {
  const kx = rx * KAPPA, ky = ry * KAPPA;
  return [
    ['M', cx + rx, cy],
    ['C', cx + rx, cy + ky, cx + kx, cy + ry, cx, cy + ry],
    ['C', cx - kx, cy + ry, cx - rx, cy + ky, cx - rx, cy],
    ['C', cx - rx, cy - ky, cx - kx, cy - ry, cx, cy - ry],
    ['C', cx + kx, cy - ry, cx + rx, cy - ky, cx + rx, cy],
    ['Z']
  ];
}

function roundRect(x, y, w, h, rx, ry) {
  rx = Math.min(rx || ry || 0, w / 2); ry = Math.min(ry || rx || 0, h / 2);
  if (!rx || !ry) return [['M', x, y], ['L', x + w, y], ['L', x + w, y + h], ['L', x, y + h], ['Z']];
  const kx = rx * (1 - KAPPA), ky = ry * (1 - KAPPA);
  return [
    ['M', x + rx, y], ['L', x + w - rx, y], ['C', x + w - kx, y, x + w, y + ky, x + w, y + ry],
    ['L', x + w, y + h - ry], ['C', x + w, y + h - ky, x + w - kx, y + h, x + w - rx, y + h],
    ['L', x + rx, y + h], ['C', x + kx, y + h, x, y + h - ky, x, y + h - ry],
    ['L', x, y + ry], ['C', x, y + ky, x + kx, y, x + rx, y], ['Z']
  ];
}

const pts = (s) => s.trim().split(/[\s,]+/).map(Number);
function poly(points, closed) {
  const p = pts(points), out = [['M', p[0], p[1]]];
  for (let i = 2; i < p.length; i += 2) out.push(['L', p[i], p[i + 1]]);
  if (closed) out.push(['Z']);
  return out;
}

const n = (v) => +v || 0;
function nodeToCommands([tag, a]) {
  switch (tag) {
    case 'path': return parsePath(a.d);
    case 'circle': return ellipse(n(a.cx), n(a.cy), n(a.r), n(a.r));
    case 'ellipse': return ellipse(n(a.cx), n(a.cy), n(a.rx), n(a.ry));
    case 'rect': return roundRect(n(a.x), n(a.y), n(a.width), n(a.height), n(a.rx), n(a.ry));
    case 'line': return [['M', n(a.x1), n(a.y1)], ['L', n(a.x2), n(a.y2)]];
    case 'polyline': return poly(a.points, false);
    case 'polygon': return poly(a.points, true);
    default: return [];
  }
}

const CACHE = new Map();
function commands(name) {
  if (!CACHE.has(name)) CACHE.set(name, data().NODES[name].flatMap(nodeToCommands));
  return CACHE.get(name);
}

// pptxgenjs custGeom points, scaled from the 24-unit viewBox to a box of size z inches.
function toPoints(cmds, z) {
  const s = (v) => +(v * z / 24).toFixed(4);
  return cmds.map((c) => {
    switch (c[0]) {
      case 'M': return { x: s(c[1]), y: s(c[2]), moveTo: true };
      case 'L': return { x: s(c[1]), y: s(c[2]) };
      case 'C': return { x: s(c[5]), y: s(c[6]), curve: { type: 'cubic', x1: s(c[1]), y1: s(c[2]), x2: s(c[3]), y2: s(c[4]) } };
      case 'Q': return { x: s(c[3]), y: s(c[4]), curve: { type: 'quadratic', x1: s(c[1]), y1: s(c[2]) } };
      default: return { close: true };
    }
  });
}

const PREFIX = 'lucide:';

function hasIcon(name) { return !!name && Object.prototype.hasOwnProperty.call(data().NODES, name); }

// Draw icon `name` centred at (cx, cy) in a z-inch box. Stroke follows Lucide (2/24 of the box), optionally scaled.
function drawIcon(s, name, cx, cy, z, color, strokeScale) {
  const width = +((z * 72 * 2) / 24 * (strokeScale || 1)).toFixed(2);
  s.addShape('custGeom', {
    x: cx - z / 2, y: cy - z / 2, w: z, h: z,
    points: toPoints(commands(name), z),
    fill: { type: 'none' },
    line: { color, width },
    objectName: PREFIX + name
  });
}

// Keyword search over names and tags; exact name and name hits rank first.
function searchIcons(words, limit) {
  const { NODES, TAGS } = data();
  const ws = words.map((w) => w.toLowerCase()).filter(Boolean);
  const scored = [];
  for (const name of Object.keys(NODES)) {
    const tags = TAGS[name] || [];
    let score = 0;
    for (const w of ws) {
      if (name === w) score += 100;
      else if (name.split('-').includes(w)) score += 20;
      else if (name.includes(w)) score += 10;
      else if (tags.some((t) => t.toLowerCase() === w)) score += 8;
      else if (tags.some((t) => t.toLowerCase().includes(w))) score += 3;
      else { score = 0; break; }
    }
    if (score) scored.push({ name, tags, score });
  }
  scored.sort((a, b) => b.score - a.score || a.name.length - b.name.length || a.name.localeCompare(b.name));
  return scored.slice(0, limit || 30);
}

function suggest(name) {
  const words = String(name).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const hits = new Map();
  for (const r of searchIcons(words, 3)) hits.set(r.name, 1000 + r.score);
  for (const w of words) for (const r of searchIcons([w], 6)) hits.set(r.name, (hits.get(r.name) || 0) + r.score);
  return [...hits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map((e) => e[0]);
}

function iconCount() { return Object.keys(data().NODES).length; }
function lucideVersion() { return require('lucide-static/package.json').version; }

// Post-process icon shapes in slide XML (pptxgenjs can't express either):
// - round caps/joins, as Lucide strokes use;
// - one <a:path> per subpath: some renderers (macOS Quick Look) stop drawing after the first <a:close/>.
function patchIconXml(xml) {
  return xml.replace(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*?name="lucide:[\s\S]*?<\/p:sp>/g, (sp) => sp
    .replace(/<a:ln( w="\d+")?>([\s\S]*?)<\/a:ln>/, (m, w, inner) =>
      '<a:ln' + (w || '') + ' cap="rnd">' + inner.replace(/<a:(round|bevel|miter)[^>]*\/>/g, '').replace(/(<a:prstDash[^>]*\/>)|$/, (d) => (d || '') + '<a:round/>') + '</a:ln>')
    .replace(/(<a:path [^>]*>)([\s\S]*?)<\/a:path>/, (m, open, body) =>
      body.split(/(?=<a:moveTo>)/).filter((p) => p.trim()).map((p) => open + p + '</a:path>').join('')));
}

module.exports = { PREFIX, hasIcon, drawIcon, searchIcons, suggest, iconCount, lucideVersion, patchIconXml, parsePath, commands };
