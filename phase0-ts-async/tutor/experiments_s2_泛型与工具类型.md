# S2 实验卡 · 泛型与工具类型:真擦除与假擦除

> 规则同 S1:先预测,后验证。代码贴进 `exercises/02_generics/playground.ts`,`pnpm lab` 运行、`pnpm tscf` 查编译。

## E1 · 推断:大多数时候你不用写 `<T>`

```ts
function identity<T>(x: T): T { return x; }

const a = identity(42);
const b = identity<number>(42);
const c = identity('hello');
console.log(a.toFixed(1), b.toFixed(1), c.toUpperCase());
```

❓三行的 T 分别被推断成了什么?把 `c.toUpperCase()` 改成 `c.toFixed(1)`,编译器说什么?对照 Java:数组 `map` 之后元素类型还跟得住吗?

## E2 · 约束:`<T extends { length: number }>`

```ts
function len<T extends { length: number }>(x: T): number {
  return x.length;
}

console.log(len('abc'), len([1, 2, 3]));
console.log(len(42));
```

❓第三行编译过吗?这个 `extends` 约束对应 Java 泛型的哪个语法?`{ length: number }` 这种"要求"的写法,和我们 S1 说的"体检报告"是什么关系?

## E3 · Omit + 解构:DTO 投影

```ts
interface User { id: number; name: string; password: string }

type PublicUser = Omit<User, 'password'>;

function toPublic(u: User): PublicUser {
  const { password, ...rest } = u;
  return rest;
}

console.log(toPublic({ id: 1, name: '老王', password: '123456' }));
```

❓`PublicUser` 里还有 password 吗?这段代码让你想起 Spring 里的哪个环节?如果哪天有人在 `toPublic` 里手滑 `return u`,编译器拦得住吗——为什么?

## E4 · Partial:PATCH 语义

```ts
interface User { id: number; name: string; password: string }

function patch(u: User, p: Partial<User>): User {
  return { ...u, ...p };
}

console.log(patch({ id: 1, name: '老王', password: 'x' }, { name: '老王2.0' }));
console.log(patch({ id: 1, name: '老王', password: 'x' }, { id: 1, name: '' }));
```

❓第二行输出的 `name` 是什么?这暴露了 `Partial` 的什么局限——"可空"和"可缺"是一回事吗?在 Java 里你用哪个注解/类表达过同样的纠结?

## E5 · 亲手抓一次"类型蒸发"

```ts
// 存为 exercises/02_generics/box.ts 单独文件
class Box<T> {
  constructor(public value: T) {}
  get(): T { return this.value; }
}

const b = new Box<number>(42);
console.log(b.get() + 1);
```

操作:运行 `pnpm exec tsc phase0-ts-async/exercises/02_generics/box.ts --target es2022 --module esnext --outDir /tmp/box-dist`,然后打开 `/tmp/box-dist/box.js`。

❓编译产物里还能找到 `number` 或 `<T>` 吗?对比:Java `javap -v` 反编译泛型类,你能看到什么 TS 看不到的东西?(一句话:Java 假擦除留了________,TS 真蒸发连________都没了。)

## E6 · keyof + Pick:编译期的反射

```ts
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}

const u = { id: 1, name: '老王', password: 'x' };
console.log(pick(u, ['id', 'name']));
console.log(pick(u, ['id', 'hacker']));
```

❓第二行 pick 的错误在编译期还是运行期?同一个需求在 Java 里你得等________才报错,TS 提前到了________。
