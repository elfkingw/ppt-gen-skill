#!/usr/bin/env bash
# Install dependencies from the bundled tarball (no network needed).
#   scripts/setup.sh           install if missing
#   scripts/setup.sh --force   reinstall
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TAR="$HERE/vendor/node_modules.tar.gz"
cd "$HERE"

command -v node >/dev/null 2>&1 || { echo "未找到 Node.js，请先安装 Node.js 16 或更高版本" >&2; exit 1; }

if [[ "${1:-}" != "--force" ]] && node -e "require('pptxgenjs'); require('jszip'); require('lucide-static/icon-nodes.json')" >/dev/null 2>&1; then
  echo "依赖已就绪（pptxgenjs $(node -p "require('pptxgenjs/package.json').version")，Lucide 图标 $(node -p "require('lucide-static/package.json').version")）"
  exit 0
fi

[[ -f "$TAR" ]] || { echo "缺少依赖包 vendor/node_modules.tar.gz，请重新获取完整的 Skill 压缩包" >&2; exit 1; }
rm -rf node_modules
tar -xzf "$TAR"
node -e "require('pptxgenjs'); require('jszip'); require('lucide-static/icon-nodes.json')" || { echo "依赖解压后仍无法加载，请检查 Node.js 版本" >&2; exit 1; }
echo "依赖已安装（pptxgenjs $(node -p "require('pptxgenjs/package.json').version")，Lucide 图标 $(node -p "require('lucide-static/package.json').version")）"
