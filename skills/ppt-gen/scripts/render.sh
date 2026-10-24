#!/usr/bin/env bash
# Render a deck to one PNG per slide for visual self-check.
#   scripts/render.sh deck.json [outdir] [--only 3,5-7]
# Engine order: LibreOffice (pptx → pdf → png)  >  macOS Quick Look (one slide at a time, approximate).
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DECK="${1:?用法：scripts/render.sh deck.json [outdir] [--only 3,5-7]}"
OUT="${2:-$(dirname "$DECK")/renders}"
ONLY=""
if [[ "${3:-}" == "--only" ]]; then ONLY="${4:-}"; fi
mkdir -p "$OUT"
"$HERE/scripts/setup.sh" >/dev/null
NAME="$(basename "$DECK" .json)"
TOTAL=$(node -e "console.log(require(require('path').resolve('$DECK')).slides.length)")
FONT=$(node -e "console.log(require('$HERE/lib/theme').deriveTheme(require(require('path').resolve('$DECK')).theme||{}).font)")
FONT_EN=$(node -e "console.log(require('$HERE/lib/theme').FONT_FAMILY['${FONT}'] || '${FONT}')")

# Warn when the deck font is missing locally: the preview would then not match the client.
if command -v fc-list >/dev/null 2>&1; then
  fc-list | grep -qiE "${FONT}|${FONT_EN}" || echo "⚠ 本机未安装字体「${FONT}」，预览会用替代字体，排版可能与客户端不同"
elif [[ "$(uname)" == "Darwin" ]]; then
  osascript -l JavaScript -e "ObjC.import('AppKit'); const f=\$.NSFontManager.sharedFontManager.availableFontFamilies.js.map(x=>x.js); f.includes('${FONT}')||f.includes('${FONT_EN}') ? 'ok' : 'missing'" 2>/dev/null | grep -q ok \
    || echo "⚠ 本机未安装字体「${FONT}」，预览会用替代字体，排版可能与客户端不同"
fi

pdf_to_png() {   # $1 pdf, $2 out prefix
  if command -v pdftoppm >/dev/null 2>&1; then pdftoppm -png -r 110 "$1" "$2"
  elif [[ "$(uname)" == "Darwin" ]]; then swift "$HERE/scripts/pdf2png.swift" "$1" "$2"
  else echo "缺少 pdftoppm（poppler-utils），无法把 PDF 转成图片" >&2; exit 1; fi
}

SOFFICE="$(command -v soffice || command -v libreoffice || true)"
[[ -z "$SOFFICE" && -x /Applications/LibreOffice.app/Contents/MacOS/soffice ]] && SOFFICE=/Applications/LibreOffice.app/Contents/MacOS/soffice

if [[ -n "$SOFFICE" ]]; then
  node "$HERE/lib/build.js" "$DECK" -o "$OUT/$NAME.pptx" ${ONLY:+--only "$ONLY"}
  "$SOFFICE" --headless --convert-to pdf --outdir "$OUT" "$OUT/$NAME.pptx" >/dev/null
  pdf_to_png "$OUT/$NAME.pdf" "$OUT/slide"
  echo "已渲染到 ${OUT}（LibreOffice）"
elif command -v qlmanage >/dev/null 2>&1; then
  echo "未找到 LibreOffice，改用 macOS 快速预览逐页渲染（近似效果，个别形状可能与 PowerPoint 不同）"
  TMP="$(mktemp -d)"
  for i in $(seq 1 "$TOTAL"); do
    if [[ -n "$ONLY" ]] && ! node -e "const s='$ONLY';process.exit(s.split(',').some(p=>{const[a,b]=p.split('-').map(Number);return $i>=a&&$i<=(b||a)})?0:1)"; then continue; fi
    node "$HERE/lib/build.js" "$DECK" -o "$TMP/p$i.pptx" --only "$i" >/dev/null
    qlmanage -t -s 1600 -o "$TMP" "$TMP/p$i.pptx" >/dev/null 2>&1
    mv "$TMP/p$i.pptx.png" "$OUT/slide-$(printf %02d "$i").png"
  done
  rm -rf "$TMP"
  node "$HERE/lib/build.js" "$DECK" -o "$OUT/$NAME.pptx" | tail -n +2
  echo "已渲染到 ${OUT}（快速预览）"
else
  echo "无法渲染：请安装 LibreOffice（如 brew install --cask libreoffice 或 apt install libreoffice-impress）" >&2
  exit 1
fi
