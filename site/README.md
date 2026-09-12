# site/ · 「格致」主页与 nginx 配置

rockcohen.cc 的站点门面。站名**格致**：取"格物致知"——本站所有内容的共性就是动手推究（交互导图、可单步的模拟器、逐行推进的证明）；晚清亦以"格致"译 Science。

## 布局（IA）

```
rockcohen.cc
├── /                      格致 · 首页（index.html，分组卡片墙）
├── /mcs/                  学 · 数学之旅（交互证明讲义，mcs-interactive/）
├── /fullstack/            学 · 全栈之旅（web/）
├── /deepseek-harness/     学 · DSH 深度讲解（外部项目）
├── /tractatus             读 · 逻辑哲学论导图（外部项目）
├── /paper/                读 · 论文精读（外部项目）
└── /api/progress/ 等      服务
```

首页分两组：**学 · 互动讲义**（可玩的）与 **读 · 精读与作品**（阅读的）。
`/maoxuan/` 路由存在但首页暂未挂卡片。

## 文件

- `index.html` — 主页源码（部署目标 `/var/www/static/hub/index.html`）
- `hub-assets/` — 卡片缩略图（部署目标 `/var/www/static/hub/assets/`）
- `nginx/headhunter.conf` — 生产 nginx 配置的版本化副本
  （真实路径 `/opt/headhunter/deploy/nginx/headhunter.conf`，是 `/etc/nginx/conf.d/` 的软链源；**改动必须 `nginx -t` 通过后再 reload**）

## 部署

```bash
./scripts/deploy-hub.sh    # 主页 + 缩略图；自动把线上旧主页备份为 index.html.bak-<时间戳>
./scripts/deploy-mcs.sh    # 数学之旅（同步 mcs-interactive/index.html）
./scripts/deploy-web.sh    # 全栈之旅（既有）
```

改 nginx：编辑 `site/nginx/headhunter.conf` → 推送到服务器 → `nginx -t` → reload。
本仓库 conf 与线上不一致时，以线上为准先 `scp` 回本地。

## 历史

- 2026-09-11：站名定为「格致」；首页从"四个入口"平铺改为"学/读"两组；新增 /mcs/ 路由与"数学之旅"卡片（改版前主页备份于服务器 `hub/index.html.bak-20260911-223909`）。
