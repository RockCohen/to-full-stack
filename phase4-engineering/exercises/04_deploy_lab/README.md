# S34 练习 · 部署与可观测:把 web 互动课程部署上线

本练习的部署对象就是本仓库的 `web/dist/`(互动课程平台的生产构建,gzip 约 73KB)——
**学工程化最好的教材,是你自己要上线的那个东西**。本目录给两份配置,先读后跑(有 Docker 就跑,没有就当读档诊断)。

## 文件

| 文件 | 是什么 | 后端对照 |
|---|---|---|
| [`Dockerfile`](./Dockerfile) | 多阶段构建:build 阶段出产物,runtime 阶段只装 nginx | 你把 JDK 换成 JRE-slim 的那种"少装就是赚" |
| [`nginx.conf`](./nginx.conf) | SPA 静态托管 + gzip + try_files fallback + 静态资源长缓存 | 虚拟主机 + rewrite + expires |

## 动手(有 Docker 的话)

```bash
# 注意:构建上下文是仓库根目录(context 里要有 web/ 和本目录)
docker build -f phase4-engineering/exercises/04_deploy_lab/Dockerfile -t tour-web .
docker run -p 8080:80 tour-web
curl -I http://localhost:8080/                          # 200,text/html,gzip?
curl -I http://localhost:8080/assets/不存在的.js          # 看缓存头
curl -s http://localhost:8080/orders | head -3           # 404?还是 index.html?→ E2
```

## 三道实验(先预测)

- **E1 · 多阶段的意义**:runtime 镜像里有没有 node_modules?有没有 vite?没有它们,镜像小了多少?为什么"构建工具不进生产镜像"和你"JDK 不进 JRE-slim 运行镜像"是同一条原则?
- **E2 · SPA fallback**:直接访问 `/orders`(不存在路径),返回 404 还是 index.html?由 nginx.conf 里哪一行决定?把那一行注释掉再 build 跑一次,亲眼看到 404——这就是门诊 4 号的病灶。
- **E3 · 长缓存协议**:`assets/*` 的 `Cache-Control` 和 `index.html` 的为什么必须不同?(提示:文件名带哈希的敢一年缓存,入口文件永远 no-cache——一个不敢旧,一个不敢错)

## 可观测性(纸上推演,写进笔记)

Sentry ≈ 你的 APM:前端把**未捕获异常 + sourcemap 还原后的堆栈**回传聚合。三个问题:
1. 上线后用户白屏,你的第一现场在哪个系统?(错误监控?日志?CDN 日志?)
2. sourcemap 该不该跟着产物一起公开发布?(公开 = 源码泄露;不公开 = Sentry 无法还原——业界的折中是什么?)
3. 前端没有"线程 dump",它等价的健康探针是什么?(提示:白屏检测、长任务、Core Web Vitals)

## 完成标志

三道实验预测+验证完成;Dockerfile 每一行能说出"为什么需要这层"。commit + 情式笔记。
