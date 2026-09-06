#!/usr/bin/env bash
# 构建并部署 web 到 https://rockcohen.cc/fullstack/
#
# 服务器约定（阿里云 47.242.122.43，需本机 root 免密 SSH）：
#   - 站点目录：/var/www/static/fullstack/
#   - nginx：/opt/headhunter/deploy/nginx/headhunter.conf 中的
#     location /fullstack/ 块（首次配置已于 2026-09-06 完成，
#     日常更新只需本脚本，无需再动 nginx）
set -euo pipefail

SERVER=root@47.242.122.43
REMOTE_DIR=/var/www/static/fullstack

cd "$(dirname "$0")/../web"
npx vite build --base=/fullstack/
rsync -az --delete dist/ "$SERVER:$REMOTE_DIR/"

echo "部署完成 → https://rockcohen.cc/fullstack/"
