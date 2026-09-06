# S9 实验卡 · 闭包:变量的寿命控制

> 规则:每题**先写预测**(输出什么?内存上发生了什么?)再运行。
> 代码贴进 `phase1-runtime/exercises/01_closures/playground.ts`,`pnpm lab <文件>` 运行。

## E1 · 计数器:变量逃逸的第一现场

```ts
function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

const a = makeCounter();
const b = makeCounter();
console.log(a(), a(), a()); // ❓
console.log(b());           // ❓
```

❓两行各打印什么?三次 a() 共享的是谁,b 拿到的又是谁?——**捕获的是变量,不是值**。

## E2 · 同一次调用,多个内函数共享一份环境

```ts
function makeWallet(start: number) {
  let balance = start;
  return {
    deposit(n: number) { balance += n; return balance; },
    check() { return balance; },
  };
}

const w = makeWallet(100);
w.deposit(50);
console.log(w.check()); // ❓
```

❓deposit 和 check 抓住的是**同一份** balance 吗?如果 Java 只允许捕获 final,这个"活钱包"要怎么写?(对照:JS 把墙拆了,危险与自由一起来)

## E3 · 循环陷阱预演:var 与 let(门诊 1 号的病根)

```ts
function withVar() {
  const fns: Array<() => number> = [];
  var i: number;                     // 故意用 var
  for (i = 0; i < 3; i++) {
    fns.push(() => i);
  }
  return fns.map(f => f());
}

function withLet() {
  const fns: Array<() => number> = [];
  for (let j = 0; j < 3; j++) {      // let:每轮一个新盒子
    fns.push(() => j);
  }
  return fns.map(f => f());
}

console.log(withVar()); // ❓
console.log(withLet()); // ❓
```

❓两个数组各是什么?用"几个盒子"的语言解释差别。(这正是 Java 匿名内部类强制 final 想防的事——JS 用 let 补上了选择权)

## E4 · 闭包当防火墙:没有 private 字段的年代

```ts
function makeAccount(start: number) {
  let balance = start;               // 外界拿不到这个变量
  return {
    deposit(n: number) {
      if (n <= 0) throw new Error('金额必须为正');
      balance += n;
      return balance;
    },
    getBalance() { return balance; },
  };
}

const acc = makeAccount(100);
// acc.balance = 999999;             // ← 如果 balance 挂在对象上,这行就能为所欲为
console.log(acc.getBalance());
```

❓为什么外部改不了 balance?这就是"私有字段"在语法糖出现前的实现方式——Java 的 private 修饰符,JS 用作用域实现。

## E5 · 惰性初始化:memoize

```ts
function memoize<A, R>(fn: (a: A) => R): (a: A) => R {
  const cache = new Map<A, R>();     // 缓存活在闭包里
  return (a: A) => {
    if (!cache.has(a)) cache.set(a, fn(a));
    return cache.get(a)!;
  };
}

let calls = 0;
const slowSquare = memoize((n: number) => { calls++; return n * n; });
slowSquare(4); slowSquare(4);
console.log('fn 被计算了几次?', calls); // ❓
```

❓calls 是几?cache 抓在哪张"变量表"上?——你写过的 Spring `@Cacheable`,最朴素的内核就是这个。
