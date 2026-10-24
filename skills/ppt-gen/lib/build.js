#!/usr/bin/env node
// Usage:
//   node lib/build.js deck.json [-o out.pptx] [--only 3,5-7] [--strict]
//   node lib/build.js --layouts        list layouts
//   node lib/build.js --themes         list theme presets
//   node lib/build.js --icons kw ...   search Lucide icons by keyword
const fs = require('fs');
const path = require('path');
let PptxGenJS, JSZip;
try {
  PptxGenJS = require('pptxgenjs');
  JSZip = require('jszip');
  require.resolve('lucide-static/icon-nodes.json');
} catch (e) {
  console.error('缺少依赖，请先运行 scripts/setup.sh（从 vendor/node_modules.tar.gz 解压安装）');
  process.exit(1);
}
const { deriveTheme, PRESETS } = require('./theme');
const { makeKit, SLIDE_W, SLIDE_H } = require('./parts');
const { searchIcons, iconCount, lucideVersion, patchIconXml } = require('./icons');

const LAYOUTS = {};
for (const f of fs.readdirSync(path.join(__dirname, 'layouts'))) {
  if (!f.endsWith('.js')) continue;
  const m = require(path.join(__dirname, 'layouts', f));
  LAYOUTS[m.name] = m;
}

function parseOnly(spec, total) {
  if (!spec) return null;
  const set = new Set();
  for (const part of spec.split(',')) {
    const [a, b] = part.split('-').map(Number);
    for (let i = a; i <= (b || a); i++) if (i >= 1 && i <= total) set.add(i);
  }
  return set;
}

// Patch slide XML (icon strokes and subpaths) and check that every text run carries an East-Asian font,
// otherwise CJK falls back (renders as boxes on some machines).
async function finalize(buf, font) {
  const zip = await JSZip.loadAsync(buf);
  const issues = [];
  for (const name of Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    const xml = patchIconXml(await zip.file(name).async('string'));
    zip.file(name, xml);
    const runs = xml.match(/<a:r>[\s\S]*?<\/a:r>/g) || [];
    const bad = runs.filter((r) => !r.includes('<a:ea typeface="' + font + '"'));
    if (bad.length) issues.push(name.replace('ppt/slides/', '') + ' 有 ' + bad.length + ' 段文字未设置中文字体');
  }
  const out = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  return { out, issues };
}

async function build(deckPath, opts) {
  opts = opts || {};
  const deckDir = path.dirname(path.resolve(deckPath));
  const deck = JSON.parse(fs.readFileSync(deckPath, 'utf8'));
  const th = deriveTheme(deck.theme || {});
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'W16x9', width: SLIDE_W, height: SLIDE_H });
  pptx.layout = 'W16x9';
  pptx.theme = { headFontFace: th.font, bodyFontFace: th.font };
  const meta = deck.meta || {};
  if (meta.title) pptx.title = meta.title;
  if (meta.author) pptx.author = meta.author;

  const total = deck.slides.length;
  const only = parseOnly(opts.only, total);
  const ctx = { warnings: [], brand: deck.brand || {}, total, page: 0, layout: '' };
  const k = makeKit(pptx, th, ctx);

  deck.slides.forEach((d, i) => {
    ctx.page = i + 1;
    if (only && !only.has(ctx.page)) return;
    ctx.layout = d.layout;
    const s = pptx.addSlide();
    if (d.layout === 'custom') {
      const fn = require(path.resolve(deckDir, d.script));
      fn(s, d, k);
    } else {
      const L = LAYOUTS[d.layout];
      if (!L) throw new Error('第 ' + ctx.page + ' 页：未知版式 "' + d.layout + '"。可用：' + Object.keys(LAYOUTS).join(', ') + ', custom');
      L.render(s, d, k);
    }
    if (d.notes) s.addNotes(Array.isArray(d.notes) ? d.notes.join('\n') : d.notes);
  });

  const out = path.resolve(opts.out || path.join(deckDir, (meta.file || path.basename(deckPath, '.json')) + '.pptx'));
  const raw = await pptx.write({ outputType: 'nodebuffer' });
  const { out: buf, issues: fontIssues } = await finalize(raw, th.font);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  return { out, theme: th, warnings: th.warnings.concat(ctx.warnings, fontIssues) };
}

module.exports = { build, LAYOUTS };

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.includes('--layouts')) {
    Object.values(LAYOUTS).forEach((l) => console.log(l.name.padEnd(12) + l.summary));
    console.log('custom'.padEnd(12) + '自由页：script 指向一个导出 (slide, data, kit) => void 的 JS 文件');
    process.exit(0);
  }
  if (argv.includes('--themes')) {
    Object.entries(PRESETS).forEach(([n, p]) => console.log(n.padEnd(16) + '#' + p.primary + '  decor=' + p.decor.padEnd(8) + p.label));
    process.exit(0);
  }
  if (argv.includes('--icons')) {
    const words = argv.slice(argv.indexOf('--icons') + 1).filter((a) => !a.startsWith('-'));
    if (!words.length) {
      console.log('Lucide ' + lucideVersion() + '，共 ' + iconCount() + ' 个图标（离线）。用英文关键词搜索：node lib/build.js --icons alert bell');
      process.exit(0);
    }
    const hits = searchIcons(words, 30);
    if (!hits.length) console.log('没找到和「' + words.join(' ') + '」相关的图标，换个英文近义词试试');
    hits.forEach((h) => console.log(h.name.padEnd(28) + h.tags.slice(0, 8).join(', ')));
    process.exit(0);
  }
  const val = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : undefined; };
  const deckPath = argv.find((a, i) => !a.startsWith('-') && !['-o', '--only'].includes(argv[i - 1]));
  if (!deckPath) { console.error('用法：node lib/build.js deck.json [-o out.pptx] [--only 3,5-7] [--strict]'); process.exit(2); }
  build(deckPath, { out: val('-o'), only: val('--only') }).then((r) => {
    console.log('已生成 ' + r.out + '（主色 #' + r.theme.primary + '，字体 ' + r.theme.font + '，装饰 ' + r.theme.decor + '）');
    if (r.warnings.length) { console.log('\n需要检查的问题（' + r.warnings.length + '）：'); r.warnings.forEach((w) => console.log('  - ' + w)); }
    else console.log('未发现问题');
    if (argv.includes('--strict') && r.warnings.length) process.exit(1);
  }).catch((e) => { console.error(e.message); process.exit(1); });
}
