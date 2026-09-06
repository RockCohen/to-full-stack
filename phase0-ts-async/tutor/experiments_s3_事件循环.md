# S3 实验卡 · 事件循环:单线程的调度艺术

> 规则:每题**先写输出顺序预测**(精确到每一行),再运行。
> 代码贴进 `exercises/03_event_loop/playground.ts`,`pnpm lab <文件>` 运行。
> ⚠️ E2 会挂住进程,观察完 `Ctrl+C` 逃逸;E6 会崩进程,这也是教材。

## E1 · 开胃菜:谁先谁后

```ts
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
```

❓输出顺序?用"本轮清空微任务,宏任务排下一轮"给自己讲一遍。

## E2 · 微任务的自旋:一场无声的饿死

```ts
function microtaskLoop(): void {
  Promise.resolve().then(microtaskLoop);
}
microtaskLoop();

setTimeout(() => console.log('🛟 宏任务:终于轮到我了吗?'), 100);
console.log('main 返回');
```

❓最后一行定时器回调会打印吗?进程会退出吗?——微任务队列"本轮清空"三个字,现在有毒了。对照后端:你往**最高优先级队列**里塞了一个自循环 job,低优先级队列的命运是?

## E3 · await 的真面目:让出

```ts
async function a(): Promise<void> {
  console.log('a1');
  await null;
  console.log('a3');
}

console.log('start');
a();
console.log('end');
```

❓输出顺序?`await` 之后的代码去了哪里?"a3 打印在 end 之后"证明了 await 的哪个本质?

## E4 · `setTimeout(fn, 0)` 的 0 是什么意思

```ts
const t0 = Date.now();
setTimeout(() => console.log('实际等了', Date.now() - t0, 'ms'), 0);
```

❓会打印 0 吗?跑三次,数值稳定吗?——"尽快"和"现在"的区别,在生产事故里值多少钱,你后端是懂的。

## E5 · 两队交替:then 链的插队规则

```ts
Promise.resolve().then(() => console.log(1)).then(() => console.log(2));
Promise.resolve().then(() => console.log(3)).then(() => console.log(4));
```

❓输出顺序?**不是 1,2,3,4**。画出微任务队列每一步的进出,你会看到两条链在"交替"。对照后端:两个高优先级 job 各自投递后续 job,调度顺序是?

## E6 · 没人接的雷:async 异常去哪了

```ts
async function boom(): Promise<never> {
  throw new Error('db down');
}

console.log('before');
boom();
console.log('after');
```

❓"after" 打印了吗?随后发生了什么?对照 Java:一个没人 `get()` 的 Future,异常烂在里面谁也不疼——前端更记仇,它的处理是________。

## E7 · 单线程的"同时":并发等待

```ts
function fakeIO(ms: number, tag: string): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(tag), ms));
}

async function main(): Promise<void> {
  console.log('主线程:发起 I/O,不原地等');
  const p = fakeIO(300, 'io 的结果');
  console.log('主线程:接着干别的');
  const result = await p;
  console.log('等到了:', result);
}
main();
```

❓"接着干别的"打印在 I/O 结束前还是后?此刻有几个"任务"在飞、几个线程在跑?用 Netty 的一句话总结:单线程 + 事件回调 = ________。
