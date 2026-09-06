/**
 * 响应式 store 对拍脚本 —— S12/S13 禁写区的完成标志
 *
 * 运行:pnpm lab:store
 * 纪律:每修绿一例 commit 一次;不许为过测试偷看 Redux/Zustand 照抄。
 */
import { createStore } from '../src/reactive-store';

// 业务宇宙:订单状态
interface OrderState {
  items: string[];
  total: number;
}
type Case = { name: string; fn: () => void };
const cases: Case[] = [];
function test(name: string, fn: () => void): void {
  cases.push({ name, fn });
}
function eq(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}:期望 ${e},实际 ${a}`);
}
function ok(cond: boolean, label: string): void {
  if (!cond) throw new Error(label);
}
const fresh = (): OrderState => ({ items: [], total: 0 });

// ---------- 基础:S12 前三步(状态槽 / setState / subscribe) ----------

test('01 初始状态:getState 返回初始值', () => {
  const s = createStore(fresh());
  eq(s.getState(), { items: [], total: 0 }, '初始值');
});

test('02 setState(对象):全量替换', () => {
  const s = createStore(fresh());
  s.setState({ items: ['A-001'], total: 99 });
  eq(s.getState(), { items: ['A-001'], total: 99 }, '新状态');
});

test('03 setState(函数):基于旧状态计算新状态', () => {
  const s = createStore({ items: ['A-001'], total: 99 });
  s.setState(prev => ({ items: [...prev.items, 'A-002'], total: prev.total + 1 }));
  eq(s.getState(), { items: ['A-001', 'A-002'], total: 100 }, 'updater 结果');
});

test('04 subscribe:setState 后收到新状态', () => {
  const s = createStore(fresh());
  const seen: OrderState[] = [];
  s.subscribe(st => seen.push(st));
  s.setState({ items: ['X'], total: 1 });
  eq(seen, [{ items: ['X'], total: 1 }], '收到的状态');
});

test('05 退订函数:调用后不再通知', () => {
  const s = createStore(fresh());
  let n = 0;
  const off = s.subscribe(() => n++);
  off();
  s.setState({ items: ['X'], total: 1 });
  eq(n, 0, '退订后触发次数');
});

test('06 多个监听器按登记顺序收到通知', () => {
  const s = createStore(fresh());
  const order: string[] = [];
  s.subscribe(() => order.push('a'));
  s.subscribe(() => order.push('b'));
  s.setState({ items: [], total: 5 });
  eq(order, ['a', 'b'], '通知顺序');
});

// ---------- 核心:S13 后三步(不可变 / 引用 / watch) ----------

test('07 旧状态不被原地修改(Copy-on-Write)', () => {
  const s = createStore({ items: ['A-001'], total: 99 });
  const prev = s.getState();
  s.setState({ items: ['A-002'], total: 1 });
  eq(prev, { items: ['A-001'], total: 99 }, '旧状态保持原样');
  ok(prev !== s.getState(), '替换后应产生新引用');
});

test('08 getState 前后引用变化(整体替换,非原地改)', () => {
  const s = createStore(fresh());
  const before = s.getState();
  s.setState({ items: ['X'], total: 1 });
  ok(before !== s.getState(), '应产生新引用');
});

test('09 watch:选择结果变化才通知,收到新值', () => {
  const s = createStore<OrderState>({ items: [], total: 100 });
  const seen: number[] = [];
  s.watch(st => st.total, v => seen.push(v));
  s.setState({ items: ['A'], total: 120 });
  eq(seen, [120], '变化通知');
});

test('10 watch:选择结果没变就不通知', () => {
  const s = createStore<OrderState>({ items: [], total: 100 });
  const seen: number[] = [];
  s.watch(st => st.total, v => seen.push(v));
  s.setState({ items: ['A-999'], total: 100 });   // total 没变
  eq(seen, [], '无关切片变化不应通知');
});

test('11 watch 多路独立:各看各的切片', () => {
  const s = createStore<OrderState>({ items: [], total: 0 });
  const totals: number[] = [];
  const counts: number[] = [];
  s.watch(st => st.total, v => totals.push(v));
  s.watch(st => st.items.length, v => counts.push(v));
  s.setState({ items: ['A'], total: 10 });
  eq(totals, [10], 'total 路');
  eq(counts, [1], 'items 路');
});

test('12 watch 退订:之后不再通知', () => {
  const s = createStore<OrderState>({ items: [], total: 0 });
  const seen: number[] = [];
  const off = s.watch(st => st.total, v => seen.push(v));
  off();
  s.setState({ items: [], total: 7 });
  eq(seen, [], '退订后');
});

test('13 setState 传入同一引用:全量订阅仍通知(通知无条件)', () => {
  const s = createStore({ items: ['A'], total: 1 });
  const snap = s.getState();
  let n = 0;
  s.subscribe(() => n++);
  s.setState(snap);
  eq(n, 1, '全量订阅无条件通知');
});

test('14 watch 退订后,select 不再被调用', () => {
  const s = createStore<OrderState>({ items: [], total: 0 });
  let selectCalls = 0;
  const off = s.watch(st => { selectCalls++; return st.total; }, () => {});
  const before = selectCalls;
  off();
  s.setState({ items: ['A'], total: 3 });
  ok(selectCalls === before, `退订后 select 不应再被调用(调用次数 ${before} → ${selectCalls})`);
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
console.log(`\n结果:${passed}/14 通过,${failed} 例做错,${todo} 例还是骨架`);
if (passed === 14) {
  console.log('🎉 对拍全绿!S12/S13 完成标志达成 —— 用 ⑤ 卡做一次小答辩,然后去 S14。');
} else if (passed === 0 && todo > 0) {
  console.log('⛔ 禁写区还没开工。回到本目录 README,从"开工第一问"开始。');
} else {
  console.log('修一个跑一次,别攒批。红的是路标,不是审判。');
}
