/**
 * 🚑 门诊 2 号 · 症状:filter 一次都没变,接口却被拉了一次又一次
 * 前置:S20 禁写区完成。加了"保险丝"(最多 5 次)防止真死循环——真实世界没有。
 *
 * 运行:pnpm lab phase2-react/tutor/bug_clinic/bug2_effect_storm.tsx
 */

import { createElement as h, render, useState, useEffect } from '../../exercises/04_mini_react/src/mini-react';
import { createContainer, dumpChildren } from '../../exercises/04_mini_react/tests/shim';

let apiCalls = 0;
const MAX = 5;   // 保险丝:真实世界没有它,这就是死循环卡死

function Report({ filter }: { filter: string }) {
  const [rows, setRows] = useState<string[]>([]);
  useEffect(() => {
    if (apiCalls >= MAX) return;                 // 保险丝
    apiCalls++;
    setRows([`${filter} 的结果 #${apiCalls}`]);   // ← 病灶:effect 里 setState,且 effect 没有依赖数组
  });                                            // 每次渲染后都执行 → setRows → 重渲染 → 再执行……
  return h('div', null, `${filter}: ${rows.length} 行结果`);
}

const c = createContainer();
render(h(Report, { filter: '今天' }), c);
console.log('页面:', dumpChildren(c));
console.log(`接口被调用 ${apiCalls} 次——filter 明明一次都没变。(真实世界:这就是"请求风暴/页面卡死"。)`);
