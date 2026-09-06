# S27 练习 · 同源策略与 CORS

配合 [`tutor/experiments_s27_cors与凭证.md`](../../tutor/experiments_s27_cors与凭证.md) 使用。
mock 服务在本进程内启动,`CORS=off` 的对照实验也封装好了(E2),不需要另开终端。

## 怎么做

1. 先写预测再运行:`pnpm lab phase3-data-net/exercises/03_cors_lab/playground.ts`
2. E2 是"扮演浏览器执法":脚本按 CORS 规则检查响应头,缺头就宣判拒收——运行两次感受差别。

## 完成标志

能不看材料答出:什么是简单请求、什么请求触发预检、预检的报文长相、`ACAO: *` 与 credentials 的冲突。commit + 情式笔记。
