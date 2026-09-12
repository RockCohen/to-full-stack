#!/usr/bin/env bash
# 部署 MCS 数学之旅 · 交互证明讲义到 https://rockcohen.cc/mcs/
#
# 服务器约定（阿里云 47.242.122.43，需本机 root 免密 SSH）：
#   - 站点目录：/var/www/static/mcs/
#   - nginx：headhunter.conf 中的 location /mcs/ 块
#     （2026-09-11 首次配置；nginx 改动见 scripts/ 内说明）
#
# 内容为自包含单文件（视频 base64 内嵌），只同步 *.html 即可；
# media/ 与 manim/ 是渲染原件，不需要上服务器。
set -euo pipefail

SERVER=root@47.242.122.43
REMOTE_DIR=/var/www/static/mcs

ssh "$SERVER" "mkdir -p $REMOTE_DIR"
rsync -az "$(dirname "$0")/../mcs-interactive/"*.html "$SERVER:$REMOTE_DIR/"

echo "部署完成 → https://rockcohen.cc/mcs/"
