/**
 * 🚑 门诊 5 号 · 症状:切换"仅看已支付",页面直接崩了
 * 前置:S20 禁写区完成(崩的就是你亲手写的顺序守卫——它是对的!)
 *
 * 运行:pnpm lab phase2-react/tutor/bug_clinic/bug5_conditional_hook.tsx
 * 任务:解释守卫为什么抛错,给出把 Hook 挪出 if 的修复。
 */

import { createElement as h, render, useState } from '../../exercises/04_mini_react/src/mini-react';
import { createContainer, dumpChildren } from '../../exercises/04_mini_react/tests/shim';

const c = createContainer();
let onlyPaid = false;

function OrderFilter() {
  if (onlyPaid) {
    const [paidCount] = useState(0);        // ← 病灶:Hook 被条件包住
  }
  const [rows] = useState<string[]>(['A-001']);
  return h('div', null, `${onlyPaid ? '已支付' : '全部'}:${rows.length} 行`);
}

render(h(OrderFilter, null), c);   // 第一帧:onlyPaid=false,只调了 1 个 Hook
console.log('第一帧:', dumpChildren(c));

onlyPaid = true;
try {
  render(h(OrderFilter, null), c);   // 第二帧:多调了一个 Hook
  console.log('第二帧没崩?', dumpChildren(c));
} catch (e) {
  console.log('第二帧崩了:', (e as Error).message);
}
