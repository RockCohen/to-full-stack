# S25 实验卡 · fetch 与响应语义:异步 I/O 的前端形态

> 代码落点:`exercises/01_fetch_lab/playground.ts`(mock 服务在进程内自动启动)。
> 每题**先写预测再运行**,错题用 ② 变体卡连对两题。
> 你已经有 S4~S5 的 Promise 和 phase1 的事件循环——本卡不教异步,教"HTTP 客户端的形态差"。

## E1 · 状态码与 Promise 的判决权

`fetch('/api/orders/NOPE')`(服务端 404):

- 预测:await 会 reject 吗?`res.ok` 是谁算出来的?
- ❓映射失效点:RestTemplate/Feign 对 4xx 抛异常;**fetch 只在"网络层失败"(断网/DNS/超时/CORS)才 reject**。4xx/5xx 是"业务层的正常响应"——判决权在你手里:`if (!res.ok) throw ...`。你后端的"连接成功 ≠ 业务成功",在这里写成了类型系统外的纪律。

## E2 · body 是流,不是值

`await res.json()` 之后,再 `await res.json()` 一次:

- 预测:第二次读会拿到缓存值,还是报错?
- ❓`Response.body` 是**一次性流**(≈ ResultSet 的游标:读过的行不回头)。`json()`/`text()` 都是"把流读完并物化"——物化两次,流早就空了。这也是为什么没有 `getBodyTwice()` 这种 API:流的设计动机就是**不把整个响应堆在内存里**。

## E3 · 超时:AbortSignal

`fetch('/api/slow', { signal: AbortSignal.timeout(100) })`(接口固定 800ms):

- 预测:抛什么?`e.name` 是什么?
- ❓`AbortController` ≈ 你给 IO 任务发 interrupt:取消是**协作式**的——fetch 内部在关注这个信号。后端对照:Resilience4j 的 TimeLimiter。注意:超时抛的是 `TimeoutError`,网络断是 `TypeError`——catch 里想区分,靠 `e.name`,不靠猜。

## E4 · Promise.all 的"假成功"

并发 `Promise.all([fetch 200, fetch 404])`:

- 预测:all 会 reject 吗?怎么让它按"任何一个是 HTTP 错误就整体失败"工作?
- ❓E1 的判决权 + E4 的组合 = 铁律:**fetch 的失败语义只有网络层,业务层失败要自己包装成异常**,否则 `Promise.all`/`allSettled` 的分流全部失真。写一个 `failFast(res)` 工具函数,放进你的个人工具箱。

## 收尾追问(S25 的"终极验收")

1. 一句话:fetch 的 Promise 什么时候 resolve、什么时候 reject?
2. 为什么 `res.json()` 不能调用两次?用"流"的语言说。
3. 把 E4 的铁律讲给"只会用 RestTemplate 的自己"听,类比失效点在哪?
