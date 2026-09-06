# S32 实验卡 · Vite:构建即热插拔(≈ javac + JRebel 的合体)

> 代码落点:`exercises/02_vite_lab/`。命令在仓库根执行:`pnpm lab:vite:build`。
> 不需要浏览器:开发形态看请求,生产形态看 dist 产物。

## E1 · 两种入口形态

- 预测:`src/main.ts`(dev 形态)和 dist 产物里,`import` 语句与文件名分别长什么样?
- ❓dev 的 Vite **不打包**:浏览器发原生 ESM 请求,按 import 图逐个要文件(Vite 只做按需编译)——所以 dev 启动是毫秒级(≈ JRebel 热插拔,不重跑整个 javac)。生产才打包成 bundle(≈ 一次彻底的 javac + shade)。**两种形态,两种性能模型**:dev 的快是"按需",prod 的快是"合并与压缩"。

## E2 · 内容哈希:缓存的自动化版

- 预测:改一行 `board.ts` 重新 build,产物文件名会变吗?`index.html` 里引用的名字呢?
- ❓`index-CClMxDjw.js` = 内容寻址。浏览器长缓存的正确姿势你早就会(文件名带 version 参数)——Vite 把"改文件名"自动化了,并把入口 `index.html` 设为 no-cache:**敢一年缓存的(带哈希)与永远不敢缓存的(入口)分层**,这是静态资源缓存的总协议。对照你给静态资源配的 `Cache-Control`,协议相同,执行者从人变成了构建器。

## E3 · 摇树(tree-shaking)= 死代码消除

`src/vendor-lite.ts` 导出若干纯函数 + 一段**模块级副作用**:

- 预测:build 后,没用到的函数还在产物里吗?模块级副作用的代码(`console.log('[vendor-lite] …')`)还在吗?产物里搜一下验证。
- ❓摇树 ≈ ProGuard/死代码消除:**从入口的 import 图出发,只保留可达代码**。但有一道禁区——模块级副作用可能被依赖,删除会改变行为,所以"有副作用的模块"默认整体保留(这正是 ESB 插件 `sideEffects: false` 声明要解决的:替 bundler 担保"我没副作用,敢摇")。你优化 JVM 应用时的"能内联的前提是无副作用",同一句话。

## 收尾追问

1. dev 快和 prod 快,分别快在哪?为什么不能只用 dev 形态上线?
2. `sideEffects: false` 是谁向谁做的担保?担保错了会出什么事故?
3. 你的 Java 直觉里,"编译期消除"与"运行期按需"各对应什么场景?
