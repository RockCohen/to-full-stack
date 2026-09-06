# S10 实验卡 · this 与原型:调用方注入与对象模型

> 规则:先预测,后运行。代码贴进 `phase1-runtime/exercises/02_this_proto/playground.ts`。
> ⚠️ this 的实验请在**严格模式语义**下理解(tsx 按 ESM 跑,即严格模式:游离调用 this 为 undefined)。

## E1 · 四则绑定:谁调用,this 是谁

```ts
class Order {
  constructor(public id: string, public total: number) {}
  describe() { return `订单 ${this.id}:${this.total} 元`; }
}

const order = new Order('A-001', 99);
console.log(order.describe());          // ① 隐式绑定:谁点号调,this 是谁

const detached = order.describe;
try { console.log(detached()); } catch (e) { console.log('② 炸了:', (e as Error).message.slice(0, 30)); }

console.log(order.describe.call(order)); // ③ call:手动注入

const bound = order.describe.bind(order);
console.log(bound());                    // ④ bind:焊死
```

❓②为什么炸?对照 Java:方法引用天生绑定实例(`order::describe`),JS 的方法只是一等公民函数,**脱离对象调用就丢 this**——门诊 3 号的病根。

## E2 · 箭头函数:不绑定 this,直接捕获外层

```ts
class Cart {
  items: string[] = ['订单A', '订单B'];
  printDelayed() {
    setTimeout(() => console.log('箭头:', this.items.length), 50);
  }
  printDelayedFn() {
    setTimeout(function () { console.log('普通:', this?.items?.length ?? 'this 丢了'); }, 80);
  }
}

new Cart().printDelayed();
new Cart().printDelayedFn();
```

❓两行输出?箭头函数的 this 和 lambda 捕获外部变量是什么关系?**这是禁写区和门诊 3 号的官方避坑姿势。**

## E3 · 原型链:方法不是存在对象里的

```ts
class Order {
  constructor(public id: string) {}
  pay() { return `${this.id} 支付成功`; }
}

const o1 = new Order('A-001');
const o2 = new Order('A-002');

console.log(o1.pay === o2.pay);            // ❓ 两 个 对象共享同一个方法吗?
console.log(Object.getPrototypeOf(o1) === Order.prototype); // ❓
console.log(Object.keys(o1));              // ❓ 对象身上到底有什么?
```

❓三个打印各是什么?——"方法存在原型上,对象只存数据;读不到就沿链向上找"≈ Java 的方法表,但**查找发生在每次访问且链可运行时修改**。

## E4 · class 是语法糖:扒开看

```ts
class Point {
  constructor(public x: number, public y: number) {}
  sum() { return this.x + this.y; }
}

// 不用 class,纯手写等价物(节选自 class 的编译产物):
const PointProto = {
  sum() { return (this as any).x + (this as any).y; },
};
function makePoint(x: number, y: number) {
  return Object.assign(Object.create(PointProto), { x, y });
}

const p = makePoint(1, 2);
console.log(p.sum(), Object.getPrototypeOf(p) === PointProto);
```

❓两种写法的行为等价吗?"糖"融化了之后剩下什么?——**先有对象,方法是查来的**,这个次序和 Java 相反。

## E5 · 综合题:once(下一阶段高频工具)

```ts
function once<A, R>(fn: (a: A) => R): (a: A) => R {
  let done = false;
  let result!: R;
  return (a: A) => {
    if (!done) { done = true; result = fn(a); }
    return result;
  };
}

const init = once((name: string) => `系统 ${name} 初始化完成`);
console.log(init('支付'), init('支付'), init('支付')); // ❓
```

❓打印几次"初始化完成"?done 和 result 活在哪?——闭包(S9)与函数式工具第一次合体:防重提交、单例初始化,内核都是它。
