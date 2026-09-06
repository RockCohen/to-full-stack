# S11 实验卡 · 浏览器即 OS:内存与 GC

> 本卡前两题跑代码(`phase1-runtime/exercises/03_browser_memory/playground.ts`,`pnpm lab`),后三题是 **Chrome DevTools 操作走查**——S11 的硬指标。

## E1 · 堆上有什么:对象、数组、函数、闭包环境

```ts
const primitive = 42;                    // 栈/寄存器:随帧生灭
const list = [1, 2, 3];                  // 堆:数组是对象
const fn = function () { return 1; };    // 堆:函数是一等公民,也是对象

function makeClosure() {
  const captured = new Array(1000).fill('订单');
  return () => captured.length;
}
const closure = makeClosure();           // 堆:captured 被"逃逸"的环境抓着

console.log(primitive, list.length, fn(), closure());
```

❓四个变量各住在哪?哪几个"活到函数返回之后"?——**闭包是主动制造的逃逸**(JVM 逃逸分析的反方向)。

## E2 · 可达性预演:断链即垃圾

```ts
let bigOrder = { id: 'A-001', lines: new Array(1e6).fill(0) };

let alias = bigOrder;      // 第二条引用
bigOrder = null as any;    // 断掉第一条
console.log(alias.id);     // ❓ 还活着吗?

alias = null as any;       // 最后一条也断了
// 此刻:这个百万级数组【不可达】——GC 的下一趟它就没了(何时回收由 V8 决定)
console.log('已断链');
```

❓断掉第一条引用后,对象死了吗?(答:没死——**可达性是"还存在引用",不是"还存在一个引用"**)两处都断了呢?GC 怎么知道它"用不用"?——**GC 不读心,只做可达性分析**。

## E3 · DevTools 走查 Ⅰ:堆快照(≈ jmap)

1. Chrome 打开任意页(或 `web/` 的课程页)→ F12 → **Memory** 面板;
2. 选 **Heap snapshot** → 点左侧 📷 拍第一张;
3. 在 Console 里执行 `window.__leak = new Array(1e6).fill('泄漏')`;
4. 再拍第二张 → 在第二张快照里搜索 `__leak`,看它挂在 **Window** 下;
5. Console 执行 `window.__leak = null`,拍第三张 → 再搜,对象还在快照里吗?

❓第三张快照里它还在,说明什么?(快照是**当时**的定格——新快照里它才消失。这个"快照是历史"的直觉,排线上泄漏时值钱。)

## E4 · DevTools 走查 Ⅱ:Allocation instrumentation(≈ 分配剖相)

1. Memory 面板选 **Allocation instrumentation on timeline** → 开始记录;
2. 在页面里反复触发一个操作(切换 c00↔c01 章节,或点按钮);
3. 停止记录 → 蓝色柱 = 分配后**仍存活**的对象;灰色柱 = 已被回收;
4. 找一个蓝色柱,展开看 **Retainers(谁抓着它)**——这条引用链就是泄漏的地图。

❓"Retainers"这个词用你的话说是什么?——**引用链的倒查清单**:从垃圾候选一路指回 GC Roots。

## E5 · DevTools 走查 Ⅲ:三快照对比法(排泄漏的标准手法)

1. 打开 `web/` 课程页,拍快照①(基准);
2. 操作 10 次:切换章节再切回(模拟用户往复进出页面);
3. 拍快照②;再操作 10 次,拍快照③;
4. 快照③视图选 **Comparison(对比快照②)**,按 Delta 排序:看哪些构造函数**每次操作都在净增**(如 detached DOM、closure、数组)。

❓如果某构造函数 10 次操作净增 10 个、从不回落——按门诊的标准,下一步做什么?(定位它的 Retainers,找到"忘了解绑的那条引用"。)把这个对象名记进笔记,这是 S11 的落库产出。
