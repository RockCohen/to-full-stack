/**
 * 🚑 门诊 1 号 · 症状:三个订单回调,打印的全是"第 3 个订单:undefined"
 *
 * 运行:pnpm lab phase1-runtime/tutor/bug_clinic/bug1_loop_var_capture.ts
 * 任务:解释为什么三个回调"共享"了 i,给出最小修复。
 */

interface Order { id: string }

const orders: Order[] = [{ id: 'A-001' }, { id: 'A-002' }, { id: 'A-003' }];
const handlers: Array<() => void> = [];

// 模拟:为每个订单注册一个异步处理回调
for (var i = 0; i < orders.length; i++) {   // ← 病灶大概率在这附近
  handlers.push(() => console.log(`处理第 ${i} 个订单:${orders[i].id}`));
}

// 稍后统一触发(模拟事件到达)
handlers.forEach(h => h());
