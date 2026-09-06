# S26 实验卡 · Node 十分钟:手搓 mock 服务(Express ≈ Spring MVC)

> 代码落点:`exercises/02_mock_server/server.ts`(已提供完整骨架,你的任务是**读懂 + 变异**)。
> 本卡是"配置型知识"场:不写禁写区,但每个变异点都要先预测。
> 这是全阶段唯一"你要当一次服务端"的场次——之后所有前端实验都吃这个服务。

## E1 · 路由表 = @RequestMapping

打开 `server.ts`,找到 `createOrderServer` 里的路由分发:

- 观察三条路由:`GET /api/orders`、`GET /api/orders/:id`(正则)、`POST /api/orders/:id/pay`。
- ❓对暗号:`@GetMapping("/orders/{id}")` ↔ 这里哪两行?路径变量 `{id}` ↔ 正则里的什么?
  `@RestController` 的"序列化返回值" ↔ `reply()` 里的哪一行?

## E2 · 中间件 = Filter/Interceptor(纸上推演)

Express 的 `app.use(logger)` 会对每个请求先跑一遍 logger。用 node:http 的写法,它就是 `createServer(async (req,res) => { /* 中间件区 */ ... })` 顶部的公共代码。

- ❓变异:如果把 `await sleep(120)` 从 orders 路由挪到 `reply()` 里,哪些接口会变慢?预测后改代码验证,改回来。

## E3 · 状态放内存:服务是无状态的吗

`db.orders` 是模块级数组,进程重启就重置;支付直接 `order.paid = true`。

- 预测:两个 Node 进程各起一个这个服务,在 A 进程支付,B 进程能查到 paid:true 吗?
- ❓这就是"会话粘性"的根源:内存态 ≈ 你给单机 Session 用的本地 Map。上 Redis 之前,先体会"为什么不能水平扩容"。

## E4 · 跑起来,当一次客户端

```bash
pnpm lab phase3-data-net/exercises/02_mock_server/server.ts     # 终端 1:起服务(8787)
curl http://localhost:8787/api/orders                            # 终端 2:列表
curl -X POST http://localhost:8787/api/orders/A-003/pay          # 支付,再查列表看变化
curl -i http://localhost:8787/api/orders/NOPE                    # 404 长什么样
```

- ❓变异:给 `GET /api/orders` 加一个 `?paid=true` 过滤(先预测要改哪几行)。这是你给阶段 5 的 Capstone 写的第一个服务端功能。

## 收尾追问

1. Express ≈ Spring MVC:互为镜像的三个概念(路由/路径变量/中间件)。
2. mock 服务的 `sleep()` 是在哪个线程"睡"的?Node 是单线程,为什么服务还能同时接多个请求?(S3 的老答案,在服务端语境复述一遍)
