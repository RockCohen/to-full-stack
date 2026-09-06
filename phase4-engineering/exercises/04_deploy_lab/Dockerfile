# 构建上下文 = 仓库根目录(见 README 的 docker build 命令)。
#
# ── 阶段 1:构建 ──────────────────────────────────────────────
# node:22-alpine 自带 npm;build 阶段把 web/ 编译成纯静态文件。
# 注意:这个阶段的 node_modules / vite / 源码,一个都不会进最终镜像。
FROM node:22-alpine AS build
WORKDIR /app

# 先拷依赖清单,再 install —— 让"依赖没变"的构建直接命中层缓存
# (≈ 你把 pom.xml 单独 COPY 先 mvn dependency:go-offline 的同款套路)
COPY web/package.json web/package-lock.json ./
RUN npm ci

# 再拷源码,编译产物
COPY web/ ./
RUN npm run build
# 产物在 /app/dist —— gzip 后约 73KB 的纯静态文件

# ── 阶段 2:运行 ──────────────────────────────────────────────
# 最终镜像里没有 node、没有 node_modules、没有源码:只有 nginx + 静态产物。
# nginx alpine 镜像约 20MB;对比 build 阶段 1GB+ —— 这就是多阶段的意义。
FROM nginx:1.27-alpine
COPY phase4-engineering/exercises/04_deploy_lab/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
