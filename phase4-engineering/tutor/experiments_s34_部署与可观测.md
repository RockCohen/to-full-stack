# S34 实验卡 · 部署与可观测:nginx、Docker 与"上线之后"

> 代码落点:`exercises/04_deploy_lab/`(Dockerfile + nginx.conf + README 三道实验)。
> 有 Docker 就跑,没有就把 README 的三道实验当读档诊断做——**每道都必须先写预测**。
> 可观测性部分(Sentry ≈ APM)是纸上推演,答案写进笔记,答辩会抽。

## E1 · 多阶段构建:少装就是赚

`Dockerfile` 两个阶段:build(node + 依赖 + 源码)与 runtime(nginx + 静态产物)。

- 预测:最终镜像里有没有 node_modules?vite?体积差多少?哪一层最常命中缓存,为什么依赖清单先拷?
- ❓多阶段 ≈ 你"JDK 构建、JRE-slim 运行"的分层习惯。构建工具是**脚手架,不是承重墙**——进生产镜像的每 MB 都要给出存在理由(攻击面、拉取时间、冷启动)。层缓存协议也和你背的 Docker 心法一致:**易变的后拷,不变的先拷**。

## E2 · SPA fallback:一行 try_files 的生死

`nginx.conf` 的 `location /` 有一条 `try_files $uri $uri/ /index.html`。

- 预测:访问 `/orders`(不存在的路径),用户看到 404 还是首页?注释掉那行再 build 跑一次(或读档推演),观察差别。
- ❓SPA 只有一个真实入口 `index.html`,路由是客户端的事——服务器对一切未知路径都应该"把入口递过去"。**忘了 fallback = 用户刷新任何非首页就 404**(门诊 4 号)。你配网关 fallback 到静态页做过同款。

## E3 · 缓存分层:敢一年缓存的与永远不敢的

`index.html` 是 no-cache,`assets/*` 是 `max-age=31536000, immutable`。

- 预测:两个策略对调会怎样?(入口变了浏览器不拉新,产物变了没人缓存——双输)
- ❓协议闭环:**入口不敢错(必须新鲜,否则引用不到新产物),产物不敢旧(带哈希,一年缓存)**。发布系统的失效链条你熟:这次"发版=换 index.html",就是你的"改配置中心触发刷新"的静态版。

## E4 · 可观测性:前端的 APM 长什么样(纸上推演)

Sentry ≈ 你的 SkyWalking/Pinpoint:未捕获异常自动上报、sourcemap 还原堆栈、release/tag 关联版本。三问(写进笔记):

1. 用户白屏,你的第一现场在哪?(错误聚合?CDN 日志?真实用户监控 RUM?)
2. sourcemap 公开发布 = 源码泄露;不给 Sentry = 堆栈不可读。业界折中是什么?(提示:map 只传监控端,产物桶不开公开读)
3. 前端没有线程 dump,等价的"健康探针"是什么?(白屏检测 / 长任务 / Core Web Vitals——每个都是"用指标替代 dump"的思路)

## 收尾追问

1. "构建产物不可变 + 入口可变"这个发布模型,和你 K8s 里"镜像不可变 + ConfigMap 可变"像在哪?
2. 静态托管 + CDN 之后,你的 nginx 还剩几行是必要的?(答案可能是零行——但你要能说清是哪几行被谁接管了)
