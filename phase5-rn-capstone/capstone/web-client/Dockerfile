# 多阶段:构建期把 API 地址烘焙进静态产物(Vite 约定:VITE_* 是 build-time 的,
# 容器运行时再注入环境变量无效——这正是 S32 讲的"产物不可变,入口可变")。
# compose 通过 build.args 传 VITE_API_BASE;单独构建时用 --build-arg,缺省 localhost:8080。
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
ARG VITE_API_BASE=http://localhost:8080
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
