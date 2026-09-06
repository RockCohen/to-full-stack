// S21 · 官方 React 对照实验:同样的 useState,工业级的实现
// 运行:pnpm lab phase2-react/exercises/03_official_counter/Counter.tsx
import { useState } from 'react';
import { renderToString } from 'react-dom/server';

function Counter({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  return <b>{count}</b>;
}

// Node 里用 props 驱动两次渲染,语义等价于一次真实交互(点击 → setCount → 重渲染)
console.log(renderToString(<Counter initial={0} />));
console.log(renderToString(<Counter initial={1} />));
