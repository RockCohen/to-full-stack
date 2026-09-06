/**
 * S31 练习 · npm 与依赖治理 —— 语义化版本的物理学(零依赖,直接跑)
 * 运行:pnpm lab phase4-engineering/exercises/01_npm_lab/playground.ts
 *
 * 纪律:每题先写预测(注释里),再运行对照。
 */

// ============ E1 · 语义化版本:^ 与 ~ 的漂移半径 ============
// 预测:caret(^)与 tilde(~)各自的"允许升级"范围?
//       下面四个已发布版本,哪些会出现在 ^1.4.2 / ~1.4.2 的下次 install 里?
//
const released = ['1.4.2', '1.4.9', '1.5.0', '2.0.0'];
const caret = (v: string) => v.startsWith('1.') && v >= '1.4.2' && v.startsWith('1.');
const tilde = (v: string) => v.startsWith('1.4.') && v >= '1.4.2';
console.log('E1 已发布:', released.join(', '));
console.log('E1 ^1.4.2 可装到:', released.filter(caret).join(', '), '(演示用字符串比较;真实 semver 按三段数值比较)');
console.log('E1 ~1.4.2 可装到:', released.filter(tilde).join(', '));
// ❓对照:你后端"从不锁小版本"的自信来自哪里?(提示:Java 生态一个 breaking change
//    要升 major——谁告诉你 JS 生态也守这个约定?Vue 2 → Vue 3 之前,小版本里拆过 API 吗?)

// ============ E2 · 锁文件:快照 vs 誓言 ============
// 预测:package.json 写 ^1.4.2,两台机器分别在周一/周五 install——
//       有 pnpm-lock.yaml 和没有,装的版本会一样吗?
//
console.log(`
E2  package.json(^1.4.2)     周一 install          周五 install
    ─────────────────────────────────────────────────────────────
    没有锁文件                 1.4.2(当日最新 1.x)  1.5.0(漂移!)
    有 pnpm-lock.yaml          1.4.2(锁的快照)      1.4.2(同一份快照)`);
// ❓对照:锁文件 ≈ 你给构建上 BOM/dependencyManagement 的 pins。
//    CI 里 `pnpm install --frozen-lockfile` 防的是什么?(本地 install 顺手更新了锁,CI 却没同步)

// ============ E3 · 幽灵依赖:pnpm 的严格 Node 链接 ============
// 预测:代码 import 了一个没写进 package.json 的包(比如邻居的传递依赖),
//       npm(扁平 hoisting)和 pnpm(严格链接)谁会当场翻车?
//
console.log(`
E3  import 一个"没声明"的包:
    npm(扁平化):        多半能跑 —— 传递依赖被摊平在顶层 node_modules(幽灵依赖)
    pnpm(符号链接):     当场解析失败 —— 每个包只能看见自己声明过的依赖
    ≈ 类加载器的可见性:  你不会希望"别人 classpath 里的 jar"被你 import 到`);
// ❓试毒:在本文件顶部加一行 `import { flatMapDeep } from 'lodash-es'`(未安装、未声明),
//    先 pnpm tscf 本文件(类型报错?),再 pnpm lab(运行报错?)——把两种报错截图进笔记。

// ============ E4 · workspace: monorepo 的依赖协议 ============
// 预测:pnpm-workspace.yaml 声明后,根目录与子包各自 node_modules 的"物理形态"?
//
console.log(`
E4  pnpm-workspace.yaml 让多个包共享一个 store(硬链接,零拷贝):
    根 node_modules/.pnpm  ← 所有版本的真身(全局唯一)
    子包 node_modules      ← 符号链接,指向 store(严格可见性)
    ≈ Maven 本地仓库 ~/.m2 + 各 pom 声明 —— 只是 pnpm 用文件系统链接代替了坐标解析`);
// ❓验证:ls node_modules/.pnpm | head -5 看真身;readlink node_modules/react 看链接。

// ============ 收尾:写进笔记的三条军规 ============
console.log(`
军规(答给自己听):
  1. 应用锁死(--frozen-lockfile),库不锁死(留给使用者漂移空间)——为什么不对称?
  2. 新依赖四问:真需要吗?维护活跃吗?体积多大?有更官方的吗?
  3. pnpm 报"找不到模块"时,第一反应不是装它,而是:谁在 import 一个没声明的东西?`);
