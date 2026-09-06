# S22 实验卡 · 状态管理与通信:单向数据流

> 代码贴进 `phase2-react/exercises/05_state_comm/playground.tsx`,`pnpm lab` 运行(renderToString)。
> 有状态交互的实验用"两次渲染"模拟:渲染 v1 → 触发变化 → 渲染 v2,对比输出。

## E1 · props 下行:数据从父到子

```tsx
function OrderSummary({ orders }: { orders: Array<{ id: string; total: number }> }) {
  return <div>共 {orders.length} 单,合计 {orders.reduce((s, o) => s + o.total, 0)} 元</div>;
}
console.log(renderToString(<OrderSummary orders={[{ id: 'A', total: 100 }, { id: 'B', total: 200 }]} />));
```

❓OrderSummary 自己存订单吗?(不——**数据由父传入**,组件是无状态的投影。)

## E2 · 事件上行:子要改数据,父给"改的函数"

```tsx
import { useState } from 'react';

function OrderAdder() {
  const [ids, setIds] = useState<string[]>([]);
  const add = (id: string) => setIds(prev => [...prev, id]);   // 父级定义"写"
  return (
    <div>
      <button onClick={() => add('A-001')}>+ A-001</button>
      <ul>{ids.map(i => <li key={i}>{i}</li>)}</ul>
    </div>
  );
}
console.log(renderToString(<OrderAdder />));
```

❓onClick 里的箭头函数是什么?——**子组件声明"我打算怎么改",但改的权限(setIds)是父级的 state**。单向数据流:数据下行,意图上行。

## E3 · 状态提升:两个组件共享一份状态

```tsx
function Cart() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <ButtonPad onAdd={() => setCount(c => c + 1)} />
      <Badge count={count} />
    </div>
  );
}
function ButtonPad({ onAdd }: { onAdd: () => void }) { return <button onClick={onAdd}>加一单</button>; }
function Badge({ count }: { count: number }) { return <span>当前 {count} 单</span>; }
console.log(renderToString(<Cart />));
```

❓count 放在 ButtonPad 里行吗?Badge 怎么知道?——**状态放在"需要它的组件的最近公共祖先"**(状态提升)。

## E4 · Context:跨层注入,免"prop 钻孔"

```tsx
import { createContext, useContext } from 'react';

const UserContext = createContext<{ name: string }>({ name: '?' });

function DeepChild() {
  const user = useContext(UserContext);
  return <span>当前用户:{user.name}</span>;
}
function Middle() { return <DeepChild />; }   // 中间层不需要知道 user 的存在

console.log(renderToString(
  <UserContext.Provider value={{ name: '老王' }}><Middle /></UserContext.Provider>
));
```

❓Middle 没传任何 props,DeepChild 怎么拿到的?——**Context ≈ IoC 注入**:上层 provide,下层 use,跳过中间层。滥用它会让数据流难追踪——"能 props 就不 Context"。

## E5 · 综合题:给三样状态选家

全局主题色 / 某输入框的草稿文本 / 深层子组件要用的当前登录用户——各放哪?(主题→Context;草稿→输入组件本地 useState;当前用户→Context 或顶层状态提升。)**状态放在"需要它的组件的最近公共祖先",范围越小越好。**
