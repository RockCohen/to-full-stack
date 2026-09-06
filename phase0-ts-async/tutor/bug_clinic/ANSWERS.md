# 门诊答案(只许复核用!)

> 先自己诊断,再看这里。提前看 = 这例白做。

---

## 门诊 1 · bug1_missing_return.ts

**症状复盘**:`then(acc => { charge(acc, 30); })` 用了花括号箭头函数却没写 `return`,回调返回 `undefined`;下一个 `then` 拿到的 `paid` 就是 `undefined`,`paid.balance` 抛 TypeError,走进 catch。

**根因**:then 链的语义是"回调的**返回值**传给下一个 then"——`return` 被吞,链就断了。你不是在"顺序执行三步",而是在"接力传递一个值"。

**最小修复**:`.then((acc) => charge(acc, 30))`(去掉花括号,或补 `return`)。

**后端对照**:调了一个返回 `CompletableFuture` 的方法却不 `thenCompose`,结果直接扔掉——下一环节拿到的是空。

**变体思考**:如果修复成 `.then(async (acc) => { charge(acc, 30); })`,行为一样吗?(提示:async 函数永远返回 Promise,但返回的是谁的 Promise?)

---

## 门诊 2 · bug2_microtask_starvation.ts

**症状复盘**:微任务规则是"本轮必须清空"。`microtaskLoop` 每执行一次又往队列塞一个自己,队列永远清不完,事件循环永远走不到"取宏任务"那一步——100ms 的定时器(以及任何 I/O)被无限饿死。

**根因**:不是死循环(主线程其实一直在"干活"),是**微任务饿死宏任务**。

**最小修复**:把自循环改成 `setTimeout(microtaskLoop, 0)`(降级为宏任务,每轮之间留出呼吸口),或给它退出条件。

**后端对照**:你往最高优先级队列塞了个自旋 job,低优先级队列全部排队等天荒地老。优先级队列的"清空语义"用不好就是 DoS,自己 DoS 自己。

**变体思考**:如果循环体改成 `while(true){}`,现象有何不同?(一个还在让事件循环干活,一个彻底焊死主线程——两种卡死,病历不同。)

---

## 门诊 3 · bug3_uncaught_async_error.ts

**症状复盘**:`loadConfig()` 是 async 函数,调用它**立刻返回一个 rejected Promise**,异常不在当前调用栈里。`try/catch` 只能接住同步抛出和已 `await` 的异常,所以打印了"启动成功";随后 rejected Promise 无人处理,Node 以 unhandledRejection 崩掉进程。

**根因**:async 调用没 `await`。你 Java 生涯的老朋友:启动了一个异步任务却不 join/get,失败没人知道——只是前端更记仇,直接崩给你看。

**最小修复**:bootstrap 改 async,`await loadConfig()`;或 `.catch(e => ...)` 显式兜底。

**变体思考**:如果 3 个这样的调用并发发出、只想"有一个失败就降级",怎么写?(提示:`Promise.all` / `allSettled` 的语义差别。)

---

## 门诊 4 · bug4_stale_response_race.ts

**症状复盘**:两次请求并发,300ms 的旧请求后到,把 `lastRendered` 覆盖成"订单"——**响应乱序**,后发起的请求先返回,旧数据反而最后落盘。

**根因**:渲染前没校验"这份数据还是不是用户想要的"——缺一个**过期请求守卫**。这不是前端独有的 bug,是"读-改-写竞态"的前端变体:没有版本号,就有人拿旧值覆盖新值。

**最小修复**:

```ts
function fetchAndRender(tab: string, latencyMs: number): void {
  const myTab = tab; // 发起时拍快照
  setTimeout(() => {
    if (myTab !== currentTab) return; // 过期响应,丢弃
    lastRendered = `【${tab} 的数据】`;
    console.log(`渲染了 ${lastRendered}`);
  }, latencyMs);
}
```

**后端对照**:乐观锁版本号 / CAS 的 ABA 防御,思想一模一样——只是前端把它叫 "stale response"。

**变体思考**:阶段 3 的 TanStack Query 会告诉你:这类问题它默认就帮你处理了。猜猜它的 queryKey 机制为什么天然防这个?

---

## 门诊 5 · bug5_type_assertion_lies.ts

**症状复盘**:`loadConfig()` 返回 `unknown`(运行时就是个没有 port 的 JSON),`as DbConfig` 只是**编译期的口头保证**——编译器闭嘴,运行时零校验。`raw.port` 是 `undefined`,拼进连接串悄悄失败。

**根因**:把"类型断言"当成了"数据校验"。TS 类型运行时蒸发,接口数据的字段有没有,只有运行时检查说了算——这正是"TS 类型管编译期法律,zod 管运行时警察"。

**最小修复**(zod 之前,先手写守卫体会原理):

```ts
function isDbConfig(x: unknown): x is DbConfig {
  return typeof x === 'object' && x !== null
    && typeof (x as DbConfig).host === 'string'
    && typeof (x as DbConfig).port === 'number';
}

const raw = loadConfig();
if (!isDbConfig(raw)) throw new Error('配置结构非法:缺 host/port');
```

**后端对照**:`(DbConfig) 强转绕过 Bean Validation`——启动时就该 fail-fast,而不是线上连接悄悄用错端口。

**变体思考**:阶段 3 会引入 zod,`dbConfigSchema.parse(raw)` 一行顶上面手写守卫。到时回看这题,你会发现自己已经理解了它在解决什么。
