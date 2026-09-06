/**
 * 🚑 门诊 3 号 · 症状:加了一单,合计没变——数据明明"改"了
 * 前置:S20 禁写区完成。
 *
 * 运行:pnpm lab phase2-react/tutor/bug_clinic/bug3_mutate_state.tsx
 */

import { createElement as h, render, useState } from '../../exercises/04_mini_react/src/mini-react';
import { createContainer, dumpChildren } from '../../exercises/04_mini_react/tests/shim';

const c = createContainer();
let add: () => void = () => {};

function Cart() {
  const [items, setItems] = useState<string[]>(['A-001']);
  add = () => {
    items.push('A-002');       // ← 原地修改
    setItems(items);           // ← 又把【同一个引用】传回去
  };
  return h('ul', null, items.map(i => h('li', null, i)));
}

render(h(Cart, null), c);
console.log('加单前:', dumpChildren(c));
add();
console.log('加单后:', dumpChildren(c), '(A-002 去哪了?)');
