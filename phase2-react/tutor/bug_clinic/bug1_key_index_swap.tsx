/**
 * 🚑 门诊 1 号 · 症状:删掉第一行订单,剩下两行的支付状态"串位"了
 * 前置:S20 禁写区完成(本例用你自己的 mini-React 复现,双重验收)
 *
 * 运行:pnpm lab phase2-react/tutor/bug_clinic/bug1_key_index_swap.tsx
 */

import { createElement as h, render, useState } from '../../exercises/04_mini_react/src/mini-react';
import { createContainer, dumpChildren } from '../../exercises/04_mini_react/tests/shim';

const orders = [
  { id: 'A-001', paid: true },
  { id: 'B-002', paid: false },
  { id: 'C-003', paid: true },
];

function OrderRow({ order }: { order: (typeof orders)[0] }) {
  const [confirmed] = useState(order.paid);   // 每行的"我确认过",只在首帧初始化
  return h('li', null, `${order.id} - ${confirmed ? '已确认' : '待确认'}`);
}

function OrderList({ list }: { list: typeof orders }) {
  return h('ul', null, list.map(o => h(OrderRow, { order: o })));   // ← 病灶:没有 key,按位置配对
}

const c = createContainer();
render(h(OrderList, { list: orders }), c);
console.log('第一屏    :', dumpChildren(c));

render(h(OrderList, { list: orders.slice(1) }), c);   // A-001 撤单,只剩 B/C
console.log('删首行后:', dumpChildren(c), '(B 真的被确认过吗?)');
