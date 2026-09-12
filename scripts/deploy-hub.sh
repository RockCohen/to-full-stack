#!/usr/bin/env bash
# 部署「格致」主页到 https://rockcohen.cc/（nginx: location = / → /hub/index.html）
#
# 服务器约定（阿里云 47.242.122.43，需本机 root 免密 SSH）：
#   - 主页：/var/www/static/hub/index.html（源码在本仓库 site/index.html）
#   - 缩略图：/var/www/static/hub/assets/*.png
#   - 每次部署自动把服务器现有主页备份为 index.html.bak-<时间戳>
set -euo pipefail

SERVER=root@47.242.122.43
STAMP=$(date +%Y%m%d-%H%M%S)

ssh "$SERVER" "cp /var/www/static/hub/index.html /var/www/static/hub/index.html.bak-$STAMP"
scp -q "$(dirname "$0")/../site/index.html" "$SERVER:/var/www/static/hub/index.html"
rsync -az "$(dirname "$0")/../site/hub-assets/" "$SERVER:/var/www/static/hub/assets/"

echo "部署完成 → https://rockcohen.cc/  （原主页已备份为 index.html.bak-${STAMP}）"
