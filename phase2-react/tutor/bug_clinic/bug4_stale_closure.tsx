/**
 * 🚑 门诊 4 号 · 症状:轮询计数器永远 +1,像被冻在第一秒(独立可跑)
 *
 * 运行:pnpm lab phase2-react/tutor/bug_clinic/bug4_stale_closure.tsx
 * 任务:解释 effect 回调里读到的 state 为什么永远是 0。
 */

let state = 0;                 // React state 的化身
let tick: () => void = () => {};

function mount(): void {
  // 模拟:effect 依赖数组为 [] → 只在挂载帧注册一次
  const captured = state;      // ← 病灶:捕获的是【那一帧】的 state 值(0)
  tick = () => console.log('轮询上报:', captured);
}

function rerender(newState: number): void {
  state = newState;            // 状态在变(React 里 = setCount)
  // 但 effect 依赖是 [] → 不会重新注册,tick 依旧是最早那支闭包
}

mount();
tick();                 // 上报 0 ✓(此刻 state 确实是 0)
rerender(1);
rerender(2);
tick(); tick();         // ❓ 状态都到 2 了,上报的是多少?
console.log(`真实 state = ${state},但上报的全是旧值 —— stale closure`);
