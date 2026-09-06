# S8 · 脱稿验收 · runWithConcurrency(手写"线程池 + 信号量")

> 规则:**不查任何资料**,1 小时,从空文件完成。写完不等于结束——AI 考官还有 3 道现场附加题。

## 题面

```ts
// 在本目录创建 concurrency.ts,实现并导出:
//
// runWithConcurrency(tasks: Array<() => Promise<unknown>>, limit: number): Promise<unknown[]>
//
// 语义:
//   1. 任意时刻"在飞"的任务数 ≤ limit(同时最多 limit 个)
//   2. 结果数组顺序 = tasks 原始顺序(不是完成顺序)
//   3. 任一任务 reject → 整体 reject(想改成"跳过失败继续"?先过基础版再问考官)
//
// 自测(写完后必须演示):
//   20 个任务、limit = 3,用计数器记录"在飞峰值",证明峰值始终 ≤ 3;
//   任务耗时故意打乱,证明结果仍按原始顺序排列。
```

## 你正在写什么(对完暗号再动手)

| 后端老朋友 | 这次的化身 |
|---|---|
| 固定大小线程池 | 你的"取任务循环" |
| Semaphore.acquire/release | 在飞计数 + 空位唤醒 |
| CountDownLatch(等全部完成) | Promise.all 或手数完成数 |
| 提交顺序返回 Future 列表 | 结果按 index 塞 |

## 通过线

1. 峰值 ≤ limit 恒成立;结果顺序正确;`limit > tasks.length`、`tasks = []` 等边界不炸;
2. 能向考官讲清:你的"工作循环"是谁在驱动?某个任务 reject 时,在飞的其他任务会怎样?
3. 附加题 ≥2/3(考官现场出,历史题型:任务级 timeout;失败重试 + 指数退避;按完成顺序流式返回结果;说明与 `Promise.all` 直接一把梭的差异)。

## 毕业三件事

1. 回顾 [`tutor/misconceptions.md`](../../tutor/misconceptions.md),把全部复习题拼成一次自测;
2. 情式笔记收尾,commit;
3. `git tag phase0-graduate` 🎓
