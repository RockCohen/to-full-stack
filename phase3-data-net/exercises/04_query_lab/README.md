# S28/S29 练习 · TanStack Query:缓存即服务 + 变异实验三组

配合 [`tutor/experiments_s28_query缓存.md`](../../tutor/experiments_s28_query缓存.md)(S28 机制)与
[`tutor/experiments_s29_变异实验.md`](../../tutor/experiments_s29_变异实验.md)(S29 变异)使用。
mock 服务在本进程内启动,无需另开终端。

## 怎么做

1. `playground.ts` 里是四个分组实验:G1 staleTime(TTL)、G2 并发去重(合并请求)、G3 重试、G4 mutation + 失效(evict-on-write)。
2. **每组先写预测再运行**:`pnpm lab phase3-data-net/exercises/04_query_lab/playground.ts`
3. S29 的变异实验 = 回到本文件改参数再预测:staleTime 数值、retry 次数、queryKey 的组成。

## 完成标志

G1~G4 预测全对(错题补变体);能填完 tutor 实验卡里的"Query ≈ Caffeine 对照表"。commit + 情式笔记。
