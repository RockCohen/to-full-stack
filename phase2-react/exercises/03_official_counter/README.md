# S21 练习 · 用官方 React 重写计数器(禁写区的对照实验)

> 你已经用自己的 mini-React 造过 useState——现在用官方 React 写同一个组件,对照 API 设计。

## 任务

把下述组件落为本目录 `Counter.tsx`,用 renderToString 渲染两帧(count=0 与 count=1,Node 里用 props 驱动两次渲染,语义等价于一次真实交互):

```tsx
import { useState } from 'react';
import { renderToString } from 'react-dom/server';

function Counter({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  return <b>{count}</b>;
}

console.log(renderToString(<Counter initial={0} />));
console.log(renderToString(<Counter initial={1} />));
```

## 对照清单(写进笔记)

| 问题 | 你的 mini 版 | 官方 React |
|---|---|---|
| useState 的值存在哪? | Fiber 槽位链表(你手写的 hooks 数组) | Fiber(工程化加强版) |
| setState 之后发生什么? | 整树重渲染 | 调度 + 可中断渲染 |
| 同引用 setState | eager bailout 跳过 | 同款 + 更多优化 |
| Rules of Hooks 报错 | 你的顺序守卫 | 官方报错文案 |

运行:`pnpm lab phase2-react/exercises/03_official_counter/Counter.tsx`

## 完成标志

两帧输出正确;对照清单写满;向 AI 讲清"为什么 API 几乎一样"——因为官方版就是你手写原理的工业化。
