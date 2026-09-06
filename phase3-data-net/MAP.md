# 阶段 3 · MAP 映射讲义:数据与网络,你的主场重新装修

> **用法**:字典,不是课文。先做场次实验,被打脸了再回来查对应小节。
> 本阶段是你的主场:HTTP、缓存、网关、幂等——你后端吃饭的家伙全在。不同的是,这一次**请求从浏览器发出,缓存放内存里,网关长在客户端**。老物理学,新介质。

---

## 0. 世界观开场:前端终于开始"算数据"

前两个阶段你练的是"把状态变成界面"(React 那套读写分离的渲染流水线),但数据一直来自硬编码的数组——**界面的粮仓是空的**。本阶段接上粮道:fetch 拉数据、Query 缓数据、服务端管真相。前端的读写从此分成两层:**服务端状态**(订单列表、支付状态——真相在数据库,前端只是读者)与**客户端状态**(输入框里的筛选词、抽屉开合——真相在组件里)。TanStack Query 管前者,useState/Zustand 管后者,**别再用 useState 存服务端数据**——那是把数据库副本手抄进组件,抄完不更新。

**读写世界观落点**:本阶段管的是**跨进程的数据读写**。浏览器和服务器是两个进程、两台机器,中间隔着网络——你后端处理"远程数据"的全部工程学(超时、重试、缓存、失效、幂等、竞态)在这里原样重演,只是每一条都有前端的方言版。

### 四道老题,本阶段的答卷

| 老题 | 本阶段答卷 | 对应场次 |
|---|---|---|
| 数据放在哪 | 服务端状态的真相在数据库;前端持有的是**带 TTL 的缓存副本**(Query 缓存,存内存堆) | S28、S29 |
| 谁说了算 | HTTP 语义说了算:状态码是服务端的判决,fetch 不替你解读;CORS 是浏览器单方面的执法 | S25、S27 |
| 怎么不打架 | 缓存一致性三件套:key 唯一、TTL 明示、**写后失效**(evict-on-write,不做双写) | S28、S29 |
| 数据怎么流动 | request → (预检) → response 流 → json 物化;queryKey → 缓存 → 界面 | 全阶段 |

---

## 1. fetch 与响应语义:一个不替你做决定的 HTTP 客户端

### 1.1 判决权的下放

你用惯的 RestTemplate/Feign:4xx/5xx 直接抛异常,连接失败抛另一种异常——**客户端替你解读了 HTTP**。fetch 把判决权还给你:**只有网络层失败**(断网、DNS、超时、CORS 拒收)才 reject;404 和 500 都是"通信成功,这是响应体"——`res.ok` 和 `res.status` 等着你自己看。

**类比失效的地方**:你后端的"调接口失败 = 抛异常"直觉,在前端会把 500 洗成合法数据(门诊 1 号)。铁律:**fetch 后第一行永远是 ok 检查**,包装成异常后,`Promise.all` 的分流、catch 的兜底才恢复语义。这不是 API 设计失误,是哲学差异——web fetch 想当"透明的信使",不当"带情绪的秘书"。

### 1.2 body 是流,不是值

`Response.body` 是**一次性流**:`res.json()` 把流读完并物化成一个 JS 对象,再读一次直接报错。对照你的 JDBC:`ResultSet` 是游标,读过的行不回头。流的设计动机也同源——**不把整个响应堆在内存里**,大文件下载可以边到边处理。副作用是"数据要 await 才存在":忘了 await,你拿到的对象自带 `orders: undefined`(门诊 5 号),而类型断言会把 TS 的警告变成橡皮图章。

### 1.3 超时与取消:AbortSignal

`AbortSignal.timeout(3000)` ≈ ReadTimeout;`AbortController` ≈ 给 IO 任务发 interrupt。取消是**协作式**的:fetch 内部监听信号,而 queryFn 里的你自己的逻辑不受影响——超时后连接断了,你后面的代码可能还在跑。Resilience4j 的 TimeLimiter 治理的是同一个问题:**没有超时的远程调用,等于把可用性押给对方的可用性**。

---

## 2. Node 十分钟:Express ≈ Spring MVC

mock 服务(`exercises/02_mock_server/server.ts`)就是一台 60 行的 Spring Boot:路由表 = `@RequestMapping`(`path.match` 的正则 ≈ `{id}` 路径变量),`reply()` 序列化 = `@RestController` 的返回值处理,`createServer` 顶部的公共逻辑 = Filter/中间件。区别在于:**没有容器、没有代理、没有注解**——框架帮你做的事,裸写一遍你才看得见骨架。

两个值得带走的认知:① `sleep(120)` 这种人工延迟,是前端实验的"慢接口发生器"(竞态、去重、超时都要它在场才能被看见);② 内存态的 `db.orders` 让服务**无法水平扩容**——你给单机 Session 上 Redis 之前的那一步纠结,原样在这 60 行里。

---

## 3. 同源策略与 CORS:一台只对浏览器生效的防火墙

### 3.1 执法方在客户端

同源策略是**浏览器单方面的执法**:你的页面(源 A)拿不到源 B 的响应,除非 B 在响应头里点名放行。服务器全程不知道"源"为何物——curl/Postman 永远测不出 CORS 问题。**映射失效点**:排查 CORS 时别盯服务端日志找"被拦的请求"——请求可能根本没发出去(预检失败)。立法在服务器(响应头),执法在浏览器,修法也修服务器。

### 3.2 预检 = 网关放行

带自定义头或 JSON body 的跨源请求,浏览器先发一个 `OPTIONS`(带 `Origin`、`Access-Control-Request-Method/Headers`)问路;服务端回 2xx + 三类 Allow-* 头才放行。你配 Nginx/Spring 的 CORS,本质就是维护这张放行清单。免检的"简单请求"(GET、表单三兄弟的 POST)是 HTML `<form>` 时代的历史遗产——**安全策略只能增量演进,白名单先冻结历史再管新事物**。

### 3.3 凭证的存放姿势

| 存放 | 自动携带 | XSS | CSRF | 一句话 |
|---|---|---|---|---|
| Cookie(HttpOnly) | 是(浏览器带) | 偷不走 | 要防(SameSite) | 票据锁在保险柜,但要防"借你的手" |
| localStorage(JWT) | 否(代码手动带) | 一锅端 | 免疫 | 现金放抽屉,防住了"借手",防不住撬锁 |

带凭证的跨源请求,`ACAO: *` 无效——凭证通道必须指名道姓 + `Allow-Credentials: true`。你后端的老答案"凭证少暴露"的具象版:**宁可防 CSRF(可控),不可赌 XSS(防不胜防)**。

---

## 4. TanStack Query:浏览器里的一台 Caffeine

### 4.1 缓存物理学的方言版

你在服务端管了多年缓存,本阶段的惊喜是:**概念一一对应,一条都不用重学**——

| 概念 | Caffeine / Redis | TanStack Query |
|---|---|---|
| key | `get(key)` | `queryKey` 数组(深度相等) |
| TTL | `expireAfterWrite` | `staleTime`(默认 0:宁可多查不可给旧) |
| 空间回收 | `maximumSize` / 驱逐 | `gcTime`(不活跃后保留 5 分钟) |
| evict | 失效广播 | `invalidateQueries` |
| 请求合并 | 网关 singleflight | 同 key 并发去重 |
| 回源 | cacheLoader | `queryFn` |
| 重试 | —(自己做) | `retry` + 指数退避 |

### 4.2 两条前端口味的设计选择

**默认 TTL = 0**。你配 Caffeine 的动机通常是省数据库,敢于给长 TTL;Query 默认 0 秒,立场是"界面上的旧数据用户看得见,宁可多查"。**写后失效,不做双写**:支付成功后 invalidate,让下一次读回源——写只能保证那一行新,列表的合计、排序、权限过滤都由服务端算。**一致性不靠客户端聪明,靠"读永远是权威副本"**。这两条和你服务端缓存的取舍方向相反,但取舍的语法完全相同。

### 4.3 queryKey 纪律

queryKey 是唯一的事故高发区:漏放一个变量(门诊 3 号)= Caffeine 的 key 漏拼一个字段 = **缓存串数据**。规范一句话:**key 里放"这条数据的完整坐标"(接口 + 全部参数),一个都不能少**;参数用对象时注意字段顺序,序列化要稳定。

---

## 5. 对暗号(本阶段总表)

| Java 后端世界 | 前端世界 | 一句话 |
|---|---|---|
| RestTemplate 4xx 抛异常 | fetch 不 reject,ok 自己查 | 判决权在你 |
| ResultSet 游标 | Response.body 流 | 读完即空 |
| ReadTimeout / TimeLimiter | AbortSignal.timeout | 没有超时=押上可用性 |
| @RequestMapping + {id} | 路由表 + path.match | 框架皮下是裸骨架 |
| Filter / Interceptor | 中间件 | 请求先过公共走廊 |
| Nginx 放行 OPTIONS | CORS 预检 | 执法在浏览器,立法在服务端 |
| Session 票据(HttpOnly) | Cookie | 防偷不防借手 |
| Caffeine TTL | staleTime(默认 0) | 默认立场:新鲜优先 |
| evict-on-write | invalidateQueries | 失效不做双写 |
| singleflight | queryKey 并发去重 | 并发窗口内合并回源 |

## 6. 发散问题

1. fetch 为什么不把 4xx/5xx 当异常?如果它抛了异常,"网络失败"和"业务失败"的 catch 会变成什么样?这个设计对/错在哪?
2. 预检是每个请求都发吗?浏览器怎么缓存预检结果(`Access-Control-Max-Age`)?这和你给网关做放行缓存是同一个机制吗?
3. 服务端状态和客户端状态混在一个 useState 里,会出什么事故?(提示:下拉列表 = 服务端数据 + 用户输入?谁的真相?)

## 7. 🤔 留给你想

你后端的缓存为"省"而生(省 DB、省算力),前端的缓存为"快与稳"而生(快响应、稳一致)——同一个机制,两种 KPI。什么时候这两种 KPI 会打架?(提示:staleTime 拉长,省了请求,用户看到什么?)你设计缓存时,先问的其实是"这个数据的**读者**能容忍多旧"——这句话对服务端和前端各怎么落地?

## 8. 🏛 权威佐证与延伸

- **MDN · Fetch API**(developer.mozilla.org → Web/API/fetch_api)。res.ok 的语义、流的消费、AbortSignal,官方字典。
- **MDN · CORS**(developer.mozilla.org → Web/HTTP/CORS)。预检清单的规范原文;读到"简单请求"一节,你会看见历史包袱的全部形状。
- **TanStack Query 官方文档**(tanstack.com/query)。重点《Queries》《Query Invalidation》《Mutations》——把"缓存物理学方言对照表"逐条对回去。
- **OWASP · XSS / CSRF Cheat Sheet**。凭证存放姿势的威胁模型原文;Cookie 的 SameSite 三档在那里。
- **延伸 · 一词之差**:Query 的 stale(陈旧)与你缓存术语里的"脏"不是一个词——脏是"写了没同步",陈旧是"过了 TTL 但仍是上次真相"。一个关于写,一个关于读。
