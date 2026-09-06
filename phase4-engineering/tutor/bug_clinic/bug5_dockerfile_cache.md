# 🚑 门诊 5 号(读档诊断)· 症状:改一行代码,Docker 重装全部依赖;镜像里还藏着 node_modules

> 形式:读档诊断。病灶有两处:**一处拖慢构建,一处让"多阶段"白搭**。
> 先写诊断假设,再给最小修复。

## 现场档案

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .                      # ← 看这里
RUN npm ci
RUN npm run build
EXPOSE 80
CMD ["npx", "serve", "dist"]  # ← 再看这里
```

```text
.dockerignore 不存在。
```

## 构建/运行日志摘要

```text
=> COPY . .
=> RUN npm ci            # 每次构建都跑了 90s
=> RUN npm run build
（改一行 README 也一样 90s;改一行 src/total.ts 也是 90s）

$ docker image ls
tour-web   latest   1.2GB    # 说好的"纯静态"呢?静态产物只有 73KB
```

## 诊断提示

- 层缓存的原则是"易变的后拷、不变的先拷"。这份 Dockerfile 的 COPY 顺序违反了什么?
- `COPY . .` 把什么也拷了进去?(`ls -a` 一下你的仓库根——node_modules、.git、dist 都在吗?)
- 生产容器里 `npx serve` 意味着什么被留在了镜像里?node 本身呢?多阶段构建在这里该怎么用?

## 任务

1. 病灶一(构建慢):指出 COPY 顺序的问题,写出正确的分层(哪几行先、哪几行后),并说明为什么"改 README"从此不再触发 npm ci。
2. 病灶二(镜像胖):写出修复后的完整多阶段 Dockerfile,说出每个阶段各留下什么、丢掉什么,最终镜像里有没有 node 和 node_modules。
3. 追问:`.dockerignore` 与多阶段构建各自解决什么?只写 .dockerignore 不改 Dockerfile,两个病灶各好了几分?
