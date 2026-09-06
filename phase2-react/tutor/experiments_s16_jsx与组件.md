# S16 实验卡 · 组件与 JSX:UI=f(state)

> 本卡所有实验用 `renderToString` 在 **Node 里直接渲染**——不需要浏览器。
> 代码贴进 `phase2-react/exercises/01_jsx_components/playground.tsx`(**注意后缀 .tsx**),
> 运行:`pnpm lab phase2-react/exercises/01_jsx_components/playground.tsx`。
> 开工前先让 AI 用 10 分钟补 DOM/HTML/CSS 三件套(你没有 Web 基础,这是强制前置)。

## E0 · 先看树:JSX 编译成什么

```tsx
import { renderToString } from 'react-dom/server';

const html = renderToString(<div id="box">订单 <b>A-001</b></div>);
console.log(html);
```

❓输出的 HTML 里,`A-001` 被包在什么标签里?——**JSX 是"建树描述稿"**:编译后是一串函数调用,产物是纯 JS(c00 的蒸发规则同样生效)。

## E1 · 组件=函数:props 只读

```tsx
interface OrderProps { id: string; total: number }

function OrderRow(props: OrderProps) {
  return <tr><td>{props.id}</td><td>{props.total} 元</td></tr>;
}

const html = renderToString(
  <table><tbody><OrderRow id="A-001" total={99} /></tbody></table>
);
console.log(html);
```

❓OrderRow 是类还是函数?props 在函数里被修改了吗?——组件＝接收 props 的函数;**props 只读**,要改数据找状态的拥有者。

## E2 · 花括号是任意表达式

```tsx
const orders = [
  { id: 'A-001', total: 300, paid: true },
  { id: 'A-002', total: 100, paid: false },
];

function OrderList() {
  return (
    <ul>
      {orders.map(o => (
        <li key={o.id}>
          {o.id} —— {o.paid ? '已支付' : `未支付(${o.total} 元)`}
        </li>
      ))}
    </ul>
  );
}
console.log(renderToString(<OrderList />));
```

❓花括号里的 map 和三目,和你后端模板引擎里的循环/条件是什么关系?**为什么每个 li 都要 key?**(先记下,S17 揭盅)

## E3 · 条件渲染:没有 if 标签,只有表达式

```tsx
function Badge({ paid }: { paid: boolean }) {
  return <span>{paid ? '✅' : '⏳'}</span>;
}
console.log(renderToString(<><Badge paid={true} /><Badge paid={false} /></>));
```

❓false 分支渲染出了什么?(React 对 false/null 的子节点直接不渲染——条件渲染就是表达式短路。)

## E4 · 渲染必须纯函数:同一输入同一样子

```tsx
let callCount = 0;
function Impure({ id }: { id: string }) {
  callCount++;                 // ← 副作用:数自己被渲染几次
  return <span>{id}</span>;
}
renderToString(<Impure id="A" />);
renderToString(<Impure id="A" />);
console.log('渲染次数:', callCount); // ❓
```

❓同一输入渲染两次,callCount 是 2——这说明渲染函数的什么纪律被破坏了?(StrictMode 会故意跑两遍抓这种代码。)**副作用去哪?**S23 的 useEffect。
