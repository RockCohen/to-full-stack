# ⛔ 禁写区 · 手写 MyPromise(本仓库的 micrograd 时刻 1/3)

> AI 只提问不给代码;写完接受对拍与答辩。
> **AI 能替你写代码,但替不了你长出理解。**

## 目标

从本目录的 `src/my-promise.ts`(现为一副骨架)出发,实现一个约 100 行的 MyPromise:

- `new MyPromise<T>((resolve, reject) => ...)`:executor **立即同步执行**;executor 抛异常等价于 reject;`resolve` 的参数可以是普通值 / MyPromise / 带 `then` 方法的对象(thenable)
- `p.then(onFulfilled?, onRejected?)`:链式;**回调必须异步执行(用 `queueMicrotask`)**;回调返回值 → 传给下一个 then;返回 Promise/thenable → 平化后再传;onRejected 返回值 → 链条"修复"回 fulfilled
- `p.catch(onRejected)`
- 静态:`MyPromise.resolve / reject / all / race`(all 保序、一败俱败;race 先到者赢)

**方法签名就是契约,不许改签名。**

## 纪律(llm-journey 同款)

1. 不看原生 Promise 源码/MDN 实现,卡概念 → ④ 卡要线索(L1→L2→L3);
2. 脚手架(AI/本仓库提供)归脚手架,核心归你:状态怎么存、何时变、队列怎么排,全是你的事;
3. 每修绿一例就 commit——你要的是"一步一步长出来"的记录,不是一次到位的抄写。

## 🧰 开工前 5 分钟 · class 语法垫场(没写过 JS 的必读,老手扫一眼即可)

- `class MyPromise<T> { ... }` ≈ Java 的 class:字段、构造器、方法,长一个意思;`static` 方法 ≈ Java 静态方法。
- 字段直接写在类体里:`state = 'pending'` ≈ `private State state = ...`——骨架里没给你的字段(状态、值、回调队列),自己加。
- `constructor(executor) { ... }` ≈ 构造函数;方法写法是 `then(...) { ... }`,**不带 function 关键字**。
- **避开 this 的窍门**:类里的回调一律用箭头函数(`() => {}`)——它不绑定自己的 this,≈ lambda 直接捕获外部变量。普通 function 的 this 由"谁调用它"决定,是 JS 著名的坑;**禁写区里你完全不用碰它**,骨架和路线都设计成了箭头函数路线。
- 其余最难的部分——状态机怎么设计、队列怎么排——正是要你自己长的东西,垫场到此为止。

## 推荐路线(S4 走 1~3,S5 走 4~6)

1. **状态机**:三个状态、值/理由两个字段、单向变更。开工前先回答 AI 的问题:存什么?什么时候变?变完之后欠谁一个通知?
2. **构造函数**:跑 executor;包 try/catch;resolve(MyPromise) 别急着展开——先记下来,第 4 步处理。
3. **then 的异步保证**:回调一律 `queueMicrotask`(为什么?想想"调用 then 时可能还没 resolve"和"必须同一套时序"两个理由)。做完跑对拍,01~05、13、20 应该绿。
4. **链式与平化**:then 返回新 MyPromise;回调返回值分三种(普通值/MyPromise/thenable),统一走"递归解析"。
5. **错误传播与修复**:抛错/reject 怎么向后走;onRejected 返回值为什么能把链拉回 fulfilled(想想 Java 里 `exceptionally` 的返回值)。
6. **all/race**:all 保序的诀窍——按 index 塞结果,数还剩几个(你没写过的 CountDownLatch,这次手写);race 谁先 settle 谁说了算,剩下的全当空气。

## 完成标志

```bash
pnpm lab:promise    # 21 例全绿 → S5 达成,去 S6 答辩
```

跑分脚本会显示每例进度;全红别慌,那是骨架在打招呼。
