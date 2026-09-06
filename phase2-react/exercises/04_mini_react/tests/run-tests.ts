/**
 * mini-React 对拍脚本 —— S18~S20 禁写区的完成标志(16 例)
 *
 * 运行:pnpm lab:react
 * 纪律:每修绿一例 commit 一次;毕业前禁看 Didact 等任何 mini-react 教程源码。
 */
import { createContainer, dumpChildren, dumpHTML } from './shim';
import { createElement, render, useState, useEffect } from '../src/mini-react';

type Case = { name: string; fn: () => void };
const cases: Case[] = [];
function test(name: string, fn: () => void): void { cases.push({ name, fn }); }
function eq(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}:期望 ${e},实际 ${a}`);
}
function ok(cond: boolean, label: string): void { if (!cond) throw new Error(label); }

// ---------- S18:createElement 与挂载 ----------

test('01 createElement:文本子节点归一化为 TEXT 节点', () => {
  const vnode = createElement('div', { id: 'box' }, '订单 ', createElement('b', null, 'A-001'));
  eq(vnode.type, 'div', 'type');
  eq(vnode.props.children[0].type, '__TEXT', '文本子节点应转为 TEXT');
  eq(vnode.props.children[1].type, 'b', '元素子节点保留');
});

test('02 render:首次挂载结构正确', () => {
  const c = createContainer();
  render(createElement('div', { id: 'root' }, createElement('b', null, 'A-001')), c);
  eq(dumpChildren(c), '<div id="root"><b>A-001</b></div>', '挂载结构');
});

test('03 文本更新:复用同一文本节点(不重建)', () => {
  const c = createContainer();
  render(createElement('div', null, 'hello'), c);
  const textNode = c.children[0].children[0];
  render(createElement('div', null, 'world'), c);
  ok(c.children[0].children[0] === textNode, '应复用原文本节点');
  eq(textNode.textContent, 'world', '文本已更新');
});

test('04 属性更新:setAttribute / removeAttribute', () => {
  const c = createContainer();
  render(createElement('div', { className: 'a', title: 't' }, 'x'), c);
  render(createElement('div', { className: 'b' }, 'x'), c);
  const el = c.children[0];
  eq(el.attrs.get('className'), 'b', 'className 应更新');
  ok(!el.attrs.has('title'), 'title 应被移除');
});

test('05 新增子节点:只 append 新的,旧节点身份不变', () => {
  const c = createContainer();
  render(createElement('ul', null, createElement('li', null, 'A')), c);
  const liA = c.children[0].children[0];
  render(createElement('ul', null, createElement('li', null, 'A'), createElement('li', null, 'B')), c);
  ok(c.children[0].children[0] === liA, '旧 li 应复用');
  eq(c.children[0].children.length, 2, '应有 2 个子节点');
});

test('06 删除子节点:多余的子节点被移除', () => {
  const c = createContainer();
  render(createElement('ul', null, createElement('li', null, 'A'), createElement('li', null, 'B')), c);
  render(createElement('ul', null, createElement('li', null, 'A')), c);
  eq(c.children[0].children.length, 1, '应剩 1 个子节点');
  eq(dumpChildren(c), '<ul><li>A</li></ul>', '内容正确');
});

// ---------- S19:diff 与函数组件 ----------

test('07 类型不同:拆旧建新(tag 从 div 变 span)', () => {
  const c = createContainer();
  render(createElement('div', null, 'A'), c);
  render(createElement('span', null, 'A'), c);
  eq(c.children[0].tagName, 'SPAN', '应重建为 span');
  eq(dumpChildren(c), '<span>A</span>', '内容正确');
});

test('08 函数组件:渲染输出正确', () => {
  const c = createContainer();
  function Hello(props: { name: string }) {
    return createElement('p', null, `hi ${props.name}`);
  }
  render(createElement(Hello, { name: '老王' }), c);
  ok(dumpHTML(c).includes('hi 老王'), '应渲染函数组件产物');
});

test('09 函数组件:props 变化触发重渲染', () => {
  const c = createContainer();
  function Hello(props: { name: string }) {
    return createElement('p', null, `hi ${props.name}`);
  }
  render(createElement(Hello, { name: 'A' }), c);
  render(createElement(Hello, { name: 'B' }), c);
  ok(dumpHTML(c).includes('hi B'), '应用新 props 重渲染');
});

// ---------- S20:Hooks 槽位 ----------

test('10 useState:初次渲染返回初始值', () => {
  const c = createContainer();
  let bump: () => void = () => {};
  function Counter() {
    const [n] = useState(7);
    bump = () => {};
    return createElement('b', null, String(n));
  }
  render(createElement(Counter, null), c);
  eq(dumpChildren(c), '<b>7</b>', '初始值');
  void bump;
});

test('11 useState:setState 触发重渲染(DOM 更新)', () => {
  const c = createContainer();
  let bump: () => void = () => {};
  function Counter() {
    const [n, setN] = useState(0);
    bump = () => setN(n + 1);
    return createElement('b', null, String(n));
  }
  render(createElement(Counter, null), c);
  eq(dumpChildren(c), '<b>0</b>', '初帧');
  bump();
  eq(dumpChildren(c), '<b>1</b>', 'setState 后应重渲染');
});

test('12 两个 useState 互不干扰(槽位按顺序)', () => {
  const c = createContainer();
  let bumpA: () => void = () => {};
  function Two() {
    const [a, setA] = useState('A0');
    const [b] = useState('B0');
    bumpA = () => setA('A1');
    return createElement('div', null, `${a}/${b}`);
  }
  render(createElement(Two, null), c);
  bumpA();
  eq(dumpChildren(c), '<div>A1/B0</div>', '改 a 不应影响 b');
});

test('13 条件调用 Hook:第二次渲染必须抛错(顺序守卫)', () => {
  const c = createContainer();
  let cond = false;
  function Bad() {
    if (cond) useState('多余的槽');
    useState('正常的槽');
    return createElement('i', null, 'x');
  }
  render(createElement(Bad, null), c);
  cond = true;
  let threw = false;
  try { render(createElement(Bad, null), c); } catch { threw = true; }
  ok(threw, 'Hook 数量/顺序与上次不一致,应抛错');
});

test('14 useEffect:挂载后执行一次(依赖 [])', () => {
  const c = createContainer();
  const log: string[] = [];
  function P() {
    useEffect(() => { log.push('挂载后拉取订单'); }, []);
    return createElement('div', null, 'p');
  }
  render(createElement(P, null), c);
  eq(log, ['挂载后拉取订单'], '提交后执行一次');
});

test('15 useEffect:deps 变化 → 先清理旧、再执行新', () => {
  const c = createContainer();
  const log: string[] = [];
  function T(props: { id: string }) {
    useEffect(() => {
      log.push(`启动 ${props.id}`);
      return () => log.push(`清理 ${props.id}`);
    }, [props.id]);
    return createElement('div', null, props.id);
  }
  render(createElement(T, { id: 'A' }), c);
  render(createElement(T, { id: 'B' }), c);
  eq(log, ['启动 A', '清理 A', '启动 B'], '清理在下一个 effect 之前');
});

test('16 useEffect:无依赖 → 每次渲染后都执行(带清理)', () => {
  const c = createContainer();
  const log: string[] = [];
  function P() {
    useEffect(() => {
      log.push('跑');
      return () => log.push('清理');
    });
    return createElement('div', null, 'p');
  }
  render(createElement(P, null), c);
  render(createElement(P, null), c);
  eq(log, ['跑', '清理', '跑'], '无依赖=每次渲染都重跑');
});

// ---------- 顺序执行,跑完才汇总 ----------

let passed = 0, failed = 0, todo = 0;
for (const { name, fn } of cases) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    const msg = (e as Error)?.message ?? String(e);
    if (msg.includes('禁写区')) todo++; else failed++;
    console.log(`  ❌ ${name}\n     ${msg}`);
  }
}
console.log(`\n结果:${passed}/16 通过,${failed} 例做错,${todo} 例还是骨架`);
if (passed === 16) {
  console.log('🎉 对拍全绿!你亲手造完了 React 的内核 —— 去 S21 答辩,再用官方 React 对照。');
} else if (passed === 0 && todo > 0) {
  console.log('⛔ 禁写区还没开工。回到本目录 README,从 DOM 白名单和开工第一问开始。');
} else {
  console.log('修一个跑一次,别攒批。红的是路标,不是审判。');
}
