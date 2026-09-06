# S32 练习 · Vite:构建即热插拔

一个迷你订单看板:`index.html` + `src/main.ts` + `src/board.ts` + `src/vendor-lite.ts`(摇树标本)。
**不需要浏览器**——产物看 dist/,开发形态看下面的命令输出。

## 怎么做(仓库根目录执行)

```bash
pnpm lab:vite:build                 # 生产构建 → 02_vite_lab/dist/
ls -la phase4-engineering/exercises/02_vite_lab/dist/assets/
cat phase4-engineering/exercises/02_vite_lab/dist/assets/index-*.js   # 读读你的"编译产物"
```

配合 [`tutor/experiments_s32_vite构建.md`](../../tutor/experiments_s32_vite构建.md) 使用:

- **E1 · 两种入口形态**:对比 `src/main.ts`(dev:原生 ESM,浏览器按 import 逐个请求)与 dist 产物(单文件 bundle)。先预测:产物里还能看见 `import` 语句吗?`board.ts` 这个文件名还在吗?
- **E2 · 哈希与缓存**:改一行 `board.ts` 再 build——文件名变了吗?这正是"内容寻址 + 长缓存"的协议(≈ 你给静态资源加的 version 参数,自动化版)。
- **E3 · 摇树与副作用**:`vendor-lite` 导出多个函数 + 一段模块级副作用代码。预测:只用了 `fmtMoney` 的包,build 后其余函数和副作用代码还在产物里吗?在产物里搜 `vendor-lite 装载于` 验证。然后把 `main.ts` 的 `import './vendor-lite'` 删掉再 build,对比产物大小。

## 完成标志

三条实验的预测全部写完并对照;能用"死代码消除 + 副作用禁区"解释 E3 的结果。commit + 情式笔记(把三次产物尺寸记下来)。
