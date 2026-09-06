#!/usr/bin/env bash
# 部署学习进度同步 API 到 rockcohen.cc 服务器
#
# 服务器布局（阿里云 47.242.122.43，需本机 root 免密 SSH）：
#   - 代码：/opt/progress/{progress_api.py,schema.sql}（本目录的同名文件）
#   - 数据：/var/lib/progress/progress.db（服务启动时自动建表）
#   - systemd：progress.service，监听 127.0.0.1:8788
#   - nginx：/api/progress/ 前缀剥掉后转发（2026-09-06 已配置，改动路由才需重配）
set -euo pipefail

SERVER=root@47.242.122.43
REMOTE_DIR=/opt/progress

cd "$(dirname "$0")/../web/server"
scp -q progress_api.py schema.sql "$SERVER:$REMOTE_DIR/"
ssh "$SERVER" 'systemctl restart progress && systemctl is-active progress'

echo "部署完成 → 服务已重启(127.0.0.1:8788,经 https://rockcohen.cc/api/progress/ 访问)"
