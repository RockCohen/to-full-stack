/**
 * 🚑 门诊 2 号 · 症状:程序不退出,"逃生舱"定时器永远不响
 *
 * 运行:pnpm lab phase0-ts-async/tutor/bug_clinic/bug2_microtask_starvation.ts
 * 观察完现象后 Ctrl+C 逃逸(它会一直挂着,这不是事故,是教材)。
 * 任务:解释"逃生舱"为什么永远轮不到,再给出最小修复。
 */

function microtaskLoop(): void {
  Promise.resolve().then(microtaskLoop); // 每一轮都往高优先级队列塞新活
}

microtaskLoop();

setTimeout(() => {
  console.log('🛟 逃生舱:主线程终于轮到我了吗?');
  process.exit(0);
}, 100);

console.log('main 返回,微任务开始表演……(等 100ms,看逃生舱响不响)');
