# S28 实验卡 · TanStack Query:缓存即服务

> 代码落点:`exercises/04_query_lab/playground.ts` 的 G1、G2、G4(S29 再做 G3 与全部变异)。
> 本卡的立意:你维护过 Caffeine/Redis,现在浏览器里也有一台——**queryKey/staleTime/invalidate 就是 key/TTL/evict**。工具换了,缓存物理学的三个定律没换。

## G1 · staleTime = TTL(缓存的新鲜度窗口)

同一个 queryKey 连续 `fetchQuery` 两次(staleTime=60s vs 默认 0):

- 预测:各跑几次 queryFn?
- ❓`staleTime` ≈ `expireAfterWrite`。默认 0 的哲学:**缓存的默认立场是"宁可多查,不可给旧"**——你给 Caffeine 配 TTL 时做过相反的权衡(为了省 DB)。前端默认站在"数据新鲜"一侧,因为界面上的旧数据用户看得见。
- 变体陷阱(运行前想清楚):把 `staleTime` 只写在第一次 `fetchQuery` 的参数里,第二次不带——TTL 生效吗?(options 按次合并——TTL 看**调用时**传入的配置,不跟随 key 存进缓存;`scripts/query-smoke.ts` 十行可复现)

## G2 · queryKey = 缓存 key + 请求合并

5 个并发 `fetchQuery`,相同 queryKey:

- 预测:接口被调几次?5 个调用者各拿到什么?
- ❓**singleflight**:同一 key 的并发请求合并回源(≈ Go singleflight、网关合并回源)。queryKey 是**深度相等**的数组——`['orders', {page:1}]` 与 `['orders', {page:1}]` 同一缓存;字段顺序变了呢?(稳定序列化问题,考官爱问)

## G4 · invalidate = evict-on-write(写后失效,而非双写)

支付(mutation)成功后 `invalidateQueries(['orders'])` 再读:

- 预测:再读到的 A-001,paid 是 true 还是 false?如果不 invalidate 呢?
- ❓为什么失效而不是"把支付结果塞回缓存"(双写):写只能保证**那一行**新,但列表的排序/合计/权限过滤都由服务端算——让读自己回源,**一致性不靠客户端聪明,靠"读永远是权威副本"**。你后端"缓存不做双写,做失效"是同一条定律。

## 三条缓存物理学的对照表(收尾默写)

| 缓存概念 | 你后端的家 | TanStack Query |
|---|---|---|
| key | `Caffeine.get(key)` / Redis key | `queryKey` 数组(深度相等) |
| TTL | `expireAfterWrite` | `staleTime` |
| evict | `invalidate(key)` / 失效广播 | `invalidateQueries` |
| 请求合并 | 网关 singleflight | 同 key 并发去重 |
| 回源 | cacheLoader / AOP 拦截器 | `queryFn` |
| 击穿保护 | 加锁回源 | 去重 + retry + `gcTime`(缓存保留窗) |
