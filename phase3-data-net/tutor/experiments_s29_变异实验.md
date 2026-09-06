# S29 实验卡 · 变异实验三组:staleTime / 并发去重 / 重试策略

> 代码落点:仍是 `exercises/04_query_lab/playground.ts`——**变异 = 改参数,预测 = 改完先写结果再跑**。
> 本卡是阶段 3 对禁写区的替代:禁写区练"造机制",变异实验练"参数的物理直觉"——运维你自己的缓存系统时,手感来自后者。

## 变异组 ① staleTime 的档位(G1 改)

| # | 变异 | 预测(先写!) | 运行 |
|---|---|---|---|
| 1a | `staleTime: 60_000` → `0` | queryFn 次数变为? | |
| 1b | staleTime 只写在首次 fetchQuery,第二次省略 | 第二次走缓存吗? | |
| 1c | 两次调用间隔里 `await new Promise(r=>setTimeout(r,50))`,staleTime=30 | 次数变吗?(staleTime 是"多久"还是"几次"?) | |

- ❓1b 的教训:fetchQuery 的参数**按次生效**——生产上把 TTL 配在 `new QueryClient({ defaultOptions })` 里,别散落在调用点(≈ 线程池参数别在业务代码里各配各的)。

## 变异组 ② queryKey 的形状(G2 改)

| # | 变异 | 预测 | 运行 |
|---|---|---|---|
| 2a | key 从 `['orders','dedup']` 改成 `['orders','dedup',filter]`,两次调用 filter 不同 | 接口几次?缓存几份? | |
| 2b | 5 个并发,key 各不相同 | 接口几次? | |
| 2c | 5 个并发,同一个 key,但第 1 个完成后立刻再发 3 个(staleTime=60s) | 后 3 次几次? | |

- ❓2c 是关键:去重只合**并发窗口内**的请求;窗口外的命中走缓存。窗口内没完成就崩溃/取消呢?——这就是"击穿保护"的边界,和你给 Redis 回源加锁时争论过的边界一模一样。

## 变异组 ③ 重试策略(G3 改)

| # | 变异 | 预测 | 运行 |
|---|---|---|---|
| 3a | `retry: 3` → `retry: false` | queryFn 次数?最终结果? | |
| 3b | `retry: 3, retryDelay: 10` → `retryDelay: 200` | 总耗时大约?次数量变吗? | |
| 3c | 把 queryFn 里的 `if (!res.ok) throw` 删掉,`retry: 3` | 还会重试吗?拿到的是什么? | |

- ❓3c 是阶段 3 门诊 1 号的预演:**没有 ok 检查,503 响应体被当成功数据返回,重试一次都不会发生**——"错误被吞"比"接口挂"更隐蔽。指数退避(`retryDelay: (n) => 2 ** n * 100`)照抄你 Resilience4j 的 backoff;401/409 这类"重试也不会好"的错误,用 `retry: (count, error) => !String(error).includes('409')` 排除。

## 收尾追问

1. 三个组各对应你后端缓存的哪个参数?(TTL / key 设计 / 回源重试)
2. 给团队写一条 queryKey 规范,让"缓存串数据"的事故类型绝迹。
3. 变异实验和禁写区各训练什么?为什么配置型知识用前者?
