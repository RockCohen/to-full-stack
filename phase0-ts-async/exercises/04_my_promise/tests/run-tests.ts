/**
 * MyPromise 对拍脚本 —— S4/S5 禁写区的完成标志
 *
 * 运行:pnpm lab:promise
 * 纪律:每修绿一例 commit 一次;不许为了过测试偷看原生 Promise 照抄。
 */
import { MyPromise } from '../src/my-promise';

let passed = 0;
let failed = 0;
let todo = 0;

function eq(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}:期望 ${e},实际 ${a}`);
}

const tick = (): Promise<void> => new Promise<void>((r) => queueMicrotask(() => r()));

type Case = { name: string; fn: () => Promise<void> };
const cases: Case[] = [];

function test(name: string, fn: () => Promise<void>): void {
  cases.push({ name, fn });
}

// ---------- 基础:S4 前三步(状态机 / 构造函数 / 异步保证) ----------

test('01 同步 resolve,then 拿到值', async () => {
  const v = await new MyPromise<number>((resolve) => resolve(42));
  eq(v, 42, '值');
});

test('02 then 回调不在同步阶段执行(异步保证)', async () => {
  const order: string[] = [];
  const p = new MyPromise<number>((resolve) => resolve(1));
  p.then(() => order.push('回调'));
  order.push('同步');
  eq(order, ['同步'], 'then 注册后立刻看:回调不该已执行');
  await p;
  await tick();
  eq(order, ['同步', '回调'], '微任务清空后');
});

test('03 executor 立即同步执行', async () => {
  let ran = false;
  new MyPromise<number>(() => {
    ran = true;
  });
  eq(ran, true, '构造即执行');
});

test('04 executor 抛错 → rejected', async () => {
  const p = new MyPromise<number>(() => {
    throw new Error('boom');
  });
  const msg = await p.then(
    () => '不该到这',
    (e) => (e as Error).message,
  );
  eq(msg, 'boom', '错误信息');
});

test('05 pending 时注册,resolve 后才执行', async () => {
  const order: string[] = [];
  let release!: (v: number) => void;
  const p = new MyPromise<number>((resolve) => {
    release = resolve;
  });
  p.then((v) => order.push(`拿到 ${v}`));
  setTimeout(() => {
    order.push('先跑了别的');
    release(7);
  }, 10);
  await p;
  eq(order, ['先跑了别的', '拿到 7'], '顺序');
});

// ---------- 链式:S5 第四步(平化与传递) ----------

test('06 链式:回调返回值传给下一个 then', async () => {
  const v = await new MyPromise<number>((r) => r(1))
    .then((x) => x + 1)
    .then((x) => x * 10);
  eq(v, 20, '1+1 后 ×10');
});

test('07 回调返回 MyPromise → 平化', async () => {
  const v = await new MyPromise<number>((r) => r(1)).then(
    () => new MyPromise<number>((r) => r(7)),
  );
  eq(v, 7, '平化后取内部值');
});

test('08 回调返回 thenable 对象 → 平化', async () => {
  // 运行时是个最朴素的鸭子类型 thenable(只有必选回调);它的泛型签名手写很难,
  // 故编译期断言收型 —— 断言不影响运行时,你的实现仍必须鸭子类型地解析它
  const duckThenable = { then: (res: (v: number) => void) => res(9) };
  const v = await new MyPromise<number>((r) => r(1)).then(
    () => duckThenable as unknown as PromiseLike<number>,
  );
  eq(v, 9, 'thenable 平化');
});

test('09 resolve 一个 MyPromise → 递归解析', async () => {
  const v = await new MyPromise<number>((r) => r(new MyPromise<number>((q) => q(5))));
  eq(v, 5, '递归解析');
});

test('10 同一 promise 多次 then,回调都被调用', async () => {
  const p = new MyPromise<number>((r) => r(1));
  const seen: number[] = [];
  p.then((v) => seen.push(v + 1));
  p.then((v) => seen.push(v + 2));
  await tick();
  await tick();
  eq(seen, [2, 3], '回调是列表,不是单槽位');
});

test('11 then 回调用微任务级延迟(queueMicrotask)', async () => {
  const order: string[] = [];
  MyPromise.resolve(1).then(() => order.push('a'));
  order.push('sync');
  await tick();
  eq(order, ['sync', 'a'], '回调应排微任务,不是宏任务');
});

// ---------- 错误:S5 第五步(传播与修复) ----------

test('12 then 回调抛错 → 下一个 onRejected 接住', async () => {
  const msg = await new MyPromise<number>((r) => r(1))
    .then(() => {
      throw new Error('x');
    })
    .then(
      () => '不该到这',
      (e) => (e as Error).message,
    );
  eq(msg, 'x', '错误信息');
});

test('13 onRejected 返回值 → 链条"修复"回 fulfilled', async () => {
  const v = await new MyPromise<number>((_, rej) => rej(new Error('e'))).then(
    () => '不该到这',
    () => '修复值',
  );
  eq(v, '修复值', '修复后走 onFulfilled');
});

test('14 值穿透:then 的参数不是函数', async () => {
  const v = await new MyPromise<number>((r) => r(3))
    .then(undefined)
    .then((x) => x);
  eq(v, 3, '非函数回调应透传');
});

test('15 reject 穿透没有 onRejected 的环节', async () => {
  const msg = await new MyPromise<number>((_, rej) => rej(new Error('穿透')))
    .then(() => 'a')
    .then(() => 'b')
    .then(
      () => '不该到这',
      (e) => (e as Error).message,
    );
  eq(msg, '穿透', '一路向后找 onRejected');
});

// ---------- 组合:S5 第六步(all / race / 静态) ----------

const io = (ms: number, tag: string): MyPromise<string> =>
  new MyPromise<string>((r) => setTimeout(() => r(tag), ms));

test('16 all:全部成功,结果保序', async () => {
  const out = await MyPromise.all([io(30, 'a'), io(20, 'b'), io(10, 'c')]);
  eq(out, ['a', 'b', 'c'], '按输入顺序,不按完成顺序');
});

test('17 all:一个失败,整体失败', async () => {
  const msg = await MyPromise.all<string>([io(10, 'a'), MyPromise.reject(new Error('第2个炸了'))]).then(
    () => '不该到这',
    (e) => (e as Error).message,
  );
  eq(msg, '第2个炸了', '第一个失败即失败');
});

test('18 all:空数组 → 立即成功为 []', async () => {
  const out = await MyPromise.all([] as Array<MyPromise<number>>);
  eq(out, [], '空集');
});

test('19 race:先 settle 者赢', async () => {
  const v = await MyPromise.race<string>([io(30, 'slow'), io(10, 'fast')]);
  eq(v, 'fast', '先到先得');
});

test('20 race:reject 先到也是赢', async () => {
  const msg = await MyPromise.race<string>([MyPromise.reject(new Error('快的失败')), io(50, 'slow')]).then(
    () => '不该到这',
    (e) => (e as Error).message,
  );
  eq(msg, '快的失败', '失败先到也算先到');
});

test('21 静态 resolve/reject', async () => {
  eq(await MyPromise.resolve(9), 9, 'resolve');
  const msg = await MyPromise.reject(new Error('no')).then(
    () => '不该到这',
    (e) => (e as Error).message,
  );
  eq(msg, 'no', 'reject');
});

// ---------- 顺序执行,跑完才汇总(对拍脚本自己也不能犯时序错误) ----------

for (const { name, fn } of cases) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    const msg = (e as Error)?.message ?? String(e);
    if (msg.includes('禁写区')) todo++;
    else failed++;
    console.log(`  ❌ ${name}\n     ${msg}`);
  }
}

console.log(`\n结果:${passed}/21 通过,${failed} 例做错,${todo} 例还是骨架`);
if (passed === 21) {
  console.log('🎉 对拍全绿!S4/S5 完成标志达成 —— 用 ⑤ 卡做一次小答辩,然后去 S6。');
} else if (passed === 0 && todo > 0) {
  console.log('⛔ 禁写区还没开工。回到本目录 README,从"开工第一问"开始。');
} else {
  console.log('修一个跑一次,别攒批。红的是路标,不是审判。');
}
