# S1 实验卡 · 类型:血统 vs 体检报告

> 规则:每题**先写预测**(编译过?输出什么?)再验证。
> "编译过吗?"类用 `pnpm tscf <文件>`;打印类把代码贴进 `exercises/01_type_narrowing/playground.ts` 后 `pnpm lab <同一文件>`。
> 答错:用 ② 变体卡让 AI 出 2 道同款,连对才算翻篇。

## E1 · 血统 vs 体检

```ts
interface JavaDev  { name: string; spring(): void }
interface ReactDev { name: string; spring(): void }

const me: JavaDev = { name: '老王', spring() {} };
const alias: ReactDev = me;
console.log(alias.name);
```

❓Java 直觉说"类型不匹配,编译报错"。TS 的判决是?

## E2 · 安检门的两副面孔

```ts
interface Point { x: number }

const a: Point = { x: 1, y: 2 };
const tmp = { x: 1, y: 2 };
const b: Point = tmp;
console.log('ok');
```

❓`a` 和 `b` 两行,哪行编译报错?为什么"多一个字段"一会儿拦一会儿放?

## E3 · 联合类型与收窄

```ts
type Result =
  | { ok: true; data: string[] }
  | { ok: false; err: string };

function handle(r: Result): number {
  if (r.ok) {
    return r.err.length;   // ← 注意看这一行
  }
  return r.data.length;
}
```

❓这函数哪行会编译报错?把 `r.err` 和 `r.data` 互换到正确分支后还剩错误吗?

## E4 · never:编译器当证明器

```ts
type Shape =
  | { kind: 'circle'; r: number }
  | { kind: 'square'; a: number };

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return 3.14 * s.r * s.r;
    case 'square': return s.a * s.a;
    default:
      const _exhaustive: never = s;
      return _exhaustive;
  }
}
```

❓现在编译过吗?在 Shape 里加一个 `{ kind: 'triangle'; b: number; h: number }` 分支后,错误出在**哪一行**?这个机制帮你防住了 Java 里哪类事故?

## E5 · unknown vs any:安检门与后门

```ts
const a: unknown = JSON.parse('{"name":"server-1"}');
const b: any = JSON.parse('{"name":"server-2"}');

console.log(b.nameXyz.length);   // ← 运行时会发生什么?
console.log(a.name.length);      // ← 编译器说什么?
```

❓两行分别的下场(编译期/运行时)?为什么官方说 `any` 是"关掉安检门"而 `unknown` 是"先登记后放行"?(对照 Java:`Object` 取出来不强转就能调方法吗?)

## E6 · readonly:引用不动,对象能掏

```ts
interface Config { readonly host: string }

const c: Config = { host: 'prod.db.internal' };
// c.host = 'dev.db.internal';    // ← A 行

const bag: { host: string } = c;  // ← B 行(想一想:这步合法吗?)
bag.host = 'dev.db.internal';
console.log(c.host);
```

❓A 行编译过吗?B 行呢?最后打印什么?——这和你 Java 里 `final` 引用的行为像不像?**类比失效在哪?**(提示:真想让对象不可变,TS 里该用什么?先猜,再问 AI。)

## E7 · enum 的意外人生

```ts
enum Status { Active = 1, Frozen = 2 }

console.log(Status.Active);
console.log(Status[1]);
console.log(JSON.stringify(Status));
```

❓第三个打印输出什么?这说明了 enum 在运行时是什么?用字面量联合 `type S = 'active' | 'frozen'` 替代它,你免费获得了 E3 的什么能力?

## E8 · 收官:让非法状态不可表示

把下面这个 Java 味十足的"字符串状态机"重写成 TS(联合类型 + 收窄),要求:**传入非法状态组合时编译不过**。

```java
// 原 Java:调用方可以传任意组合,运行时才炸
void transfer(String fromStatus, String toStatus) { ... }
```

❓你的 `type` 怎么定义?哪一种非法组合被编译器拦下了?
