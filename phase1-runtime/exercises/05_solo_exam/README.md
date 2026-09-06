# S15 · 脱稿验收 · debounce 与 throttle(给订单系统装"节流阀")

> 规则:**不查任何资料**,1 小时,从空文件完成。写完不等于结束——AI 考官还有 3 道现场附加题。

## 题面

在本目录创建 `throttle-gate.ts`,实现并导出:

```ts
// 1. debounce<A extends unknown[]>(fn: (...args: A) => void, waitMs: number): (...args: A) => void
//    语义:连续调用时,只在"停止调用 waitMs 毫秒后"执行最后一次的 fn(防抖)。
//
// 2. throttle<A extends unknown[]>(fn: (...args: A) => void, intervalMs: number): (...args: A) => void
//    语义:任意 intervalMs 窗口内,fn 至多执行一次(节流);窗口结束后的第一次调用要能再次触发。
//
// 业务场景:订单搜索框每敲一键都要查库 → 用 debounce;
//           滚动加载下一页的滚动事件每秒触发 60 次 → 用 throttle。
```

## 自测(写完后必须演示)

```ts
// 用 fake 时钟思路验证:记录 fn 执行时间戳数组,
// 模拟"每 100ms 调一次、连续调 10 次"的 debounce(wait=300):fn 应只执行 1 次,且发生在最后一次调用后 300ms;
// 同节奏的 throttle(interval=250):fn 应执行约 4~5 次,任意 250ms 窗口内 ≤1 次。
```

## 你正在写什么(对完暗号再动手)

| 后端老朋友 | 这次的化身 |
|---|---|
| 线程池的合并写(攒一批再刷) | debounce:只留最后一次 |
| 令牌桶/漏桶限流 | throttle:固定窗口至多一次 |
| 定时任务调度 | setTimeout/setInterval 管理可取消的时钟 |
| 闭包保存的任务队列 | S9 的直系应用:timer id 抓在闭包里 |

## 通过线

1. 两函数行为正确;能讲清**debounce 和 throttle 分别丢弃了什么、保留了什么**;
2. 能讲清:你的 timer id 存在哪、为什么必须存在闭包里(提示:S9);
3. AI 考官 3 道现场附加题 ≥2 道通过(历史题型:debounce 加"立即执行头";throttle 加尾补偿;取消功能 cancel();讲清两者在"搜索框/滚动加载"场景为什么不可互换)。

## 毕业三件事

1. 回顾 [`tutor/misconceptions.md`](../../tutor/misconceptions.md),把全部复习题拼成一次自测;
2. 情式笔记收尾,commit;
3. `git tag phase1-graduate` 🎓
