# S11 练习 · 浏览器即 OS:内存与 GC

配合 [`tutor/experiments_s11_浏览器内存与GC.md`](../../tutor/experiments_s11_浏览器内存与GC.md) 使用。

## 怎么做

- E1/E2 贴进本目录 `playground.ts`,`pnpm lab` 运行;
- **E3~E5 是 DevTools 操作走查**(Chrome F12 → Memory 面板),对着 `web/` 课程页做;
- 硬指标:完成一次**三快照对比**,把"每次操作都净增的构造函数名"记进笔记。

## 完成标志

能向 AI 讲清:可达性分析的判据;V8 为什么要分代;三快照对比法下一步做什么。commit ＋ 情式笔记。
