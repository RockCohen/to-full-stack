// S23 练习场:用你自己的 mini-React 跑 effect 实验
// 运行:pnpm lab phase2-react/exercises/06_useeffect_lab/playground.tsx
import { createElement as h, render, useState, useEffect } from '../../04_mini_react/src/mini-react';
import { createContainer } from '../../04_mini_react/tests/shim';

const log: string[] = [];
const c = createContainer();

function OrderPage() {
  useEffect(() => { log.push('已挂载:可以发请求了'); }, []);
  return h('div', null, '订单页');
}

render(h(OrderPage, null), c);   // 挂载 → 提交 → effect
console.log(log);
