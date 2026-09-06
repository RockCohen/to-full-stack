// 临时调试脚本(红队用,验证后删除)
import { createContainer, dumpChildren } from '../phase2-react/exercises/04_mini_react/tests/shim';
import { createElement, render, useState } from '../phase2-react/exercises/04_mini_react/src/mini-react';

const c = createContainer();
let cond = false;
function Bad() {
  if (cond) useState('多余的槽');
  useState('正常的槽');
  return createElement('i', null, 'x');
}
render(createElement(Bad, null), c);
console.log('render1 ok, dump =', dumpChildren(c));
cond = true;
try {
  render(createElement(Bad, null), c);
  console.log('render2 没抛!dump =', dumpChildren(c));
} catch (e) {
  console.log('render2 抛了:', (e as Error).message);
}
