// Theme = one primary color + derived palette + font + decor.
// All colors are 6-digit hex without '#', as pptxgenjs expects.

const PRESETS = {
  'finance-blue': { primary: '1E5BE6', decor: 'skyline', label: '金融蓝：银行、保险、证券、金融科技' },
  'gov-red': { primary: 'C42B2B', decor: 'wave', label: '政务红：政府、国企、党建、公共服务' },
  'tech-purple': { primary: '5B4BDB', decor: 'grid', label: '科技紫：AI、大模型、SaaS、研发工具' },
  'health-teal': { primary: '0B8F86', decor: 'wave', label: '医疗青：医疗、医药、健康、环保' },
  'energy-green': { primary: '1E8E4E', decor: 'skyline', label: '能源绿：能源、电力、制造、双碳' },
  'business-slate': { primary: '2F4A6D', decor: 'grid', label: '商务墨蓝：咨询、通用商务、对外汇报' },
  // Approved Noesis skeleton: teal accent on white, navy titles, gray body.
  // `lock` keeps those neutrals from being hue-shifted into dark teal.
  'noesis-teal': {
    primary: '00857C',
    decor: 'none',
    label: '新致新知青绿：白底、藏青标题、青绿强调（新致新知 Noesis AI / 银行智能运维骨架）',
    lock: {
      ink: '0A2240',
      sub: '4B5563',
      body: '4B5563',
      muted: '6B7280',
      line: 'C7CDD6',
      panelLine: 'C7CDD6',
      bg: 'FFFFFF',
      tint: 'EEF7F6',
      tint2: 'D6EBEA',
      danger: 'B42318'
    }
  }
};

const clean = (c) => String(c).replace('#', '').toUpperCase();
function hexToRgb(h) { h = clean(h); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function rgbToHex(r) { return r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase(); }
function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(A.map((v, i) => v + (B[i] - v) * t)); }

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslToHex(h, s, l) {
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

function luminance(h) {
  const c = hexToRgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

// Darken until white text on the color reaches the target ratio.
function ensureOnWhite(c, ratio) {
  let [h, s, l] = rgbToHsl(hexToRgb(c)), out = clean(c);
  while (contrast(out, 'FFFFFF') < ratio && l > 0.05) { l -= 0.02; out = hslToHex(h, s, l); }
  return out;
}

function deriveTheme(input) {
  const opt = typeof input === 'string' ? { primary: input } : Object.assign({}, input);
  let preset;
  if (opt.preset) {
    preset = PRESETS[opt.preset];
    if (!preset) throw new Error('Unknown theme preset "' + opt.preset + '". Available: ' + Object.keys(PRESETS).join(', '));
    opt.primary = opt.primary || preset.primary;
    opt.decor = opt.decor || preset.decor;
  }
  const warnings = [];
  const raw = clean(opt.primary || PRESETS['finance-blue'].primary);
  const primary = ensureOnWhite(raw, 4.5);
  if (primary !== raw) warnings.push('主色 #' + raw + ' 上的白字对比度不足 4.5，已加深为 #' + primary);
  const [h] = rgbToHsl(hexToRgb(primary));
  const neutral = (s, l) => hslToHex(h, s, l);

  const t = {
    primary,
    primaryDark: mix(primary, '000000', 0.22),
    primarySoft: mix(primary, 'FFFFFF', 0.45),
    ink: neutral(0.32, 0.15),
    sub: neutral(0.2, 0.28),
    body: neutral(0.14, 0.34),
    muted: neutral(0.12, 0.6),
    tint: mix(primary, 'FFFFFF', 0.9),
    tint2: mix(primary, 'FFFFFF', 0.84),
    line: mix(primary, 'FFFFFF', 0.86),
    panelLine: mix(primary, 'FFFFFF', 0.9),
    bg: mix(primary, 'FFFFFF', 0.955),
    white: 'FFFFFF',
    decor1: mix(primary, 'FFFFFF', 0.9),
    decor2: mix(primary, 'FFFFFF', 0.86),
    decorTitle: mix(primary, 'FFFFFF', 0.93),
    // Accents for categorical emphasis (e.g. four pain points). Order matters.
    accents: [
      { color: 'E5484D', tint: 'FDECEC' },
      { color: primary, tint: mix(primary, 'FFFFFF', 0.9) },
      { color: '13A07B', tint: 'E3F6EF' },
      { color: '7357E0', tint: 'EFEAFD' },
      { color: 'D98A00', tint: 'FDF3E0' }
    ],
    danger: 'E5484D',
    font: opt.font || '微软雅黑',
    decor: opt.decor || 'none',
    warnings
  };
  if (preset && preset.lock) {
    Object.entries(preset.lock).forEach(([key, value]) => { t[key] = clean(value); });
  }
  if (contrast(t.primary, t.bg) < 3) warnings.push('主色在背景上的对比度低于 3，大字标题可能不清楚');
  return t;
}

// Chinese display name → system family name, used when checking local availability.
const FONT_FAMILY = {
  '微软雅黑': 'Microsoft YaHei',
  '思源黑体': 'Source Han Sans SC',
  '思源黑体 CN': 'Source Han Sans CN',
  '等线': 'DengXian',
  '黑体': 'SimHei'
};

module.exports = { PRESETS, FONT_FAMILY, deriveTheme, mix, contrast };
