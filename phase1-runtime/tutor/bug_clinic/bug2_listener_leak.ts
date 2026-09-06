/**
 * 🚑 门诊 2 号 · 症状:每进一次详情页,resize 就多触发一次
 *
 * 运行:pnpm lab phase1-runtime/tutor/bug_clinic/bug2_listener_leak.ts
 * 任务:指出泄漏的引用链,给出带"清理"的修复。
 */

type Handler = () => void;

// 模拟浏览器的全局事件总线(≈ window 的 resize 事件)
const listeners: Handler[] = [];
function addEventListener(h: Handler) { listeners.push(h); }

function enterDetailPage(orderId: string): void {
  const bigPayload = new Array(1e5).fill(`订单 ${orderId} 的明细`);
  addEventListener(() => {
    console.log(`[resize] 刷新 ${orderId} 的 ${bigPayload.length} 行明细`);
  });   // ← 病灶大概率在这附近
}

// 用户进了三次详情页
enterDetailPage('A-001');
enterDetailPage('A-002');
enterDetailPage('A-003');

console.log(`当前监听器数量:${listeners.length}(应该是 1 还是 3?)`);
listeners.forEach(h => h());   // 模拟一次 resize:观察触发几次
