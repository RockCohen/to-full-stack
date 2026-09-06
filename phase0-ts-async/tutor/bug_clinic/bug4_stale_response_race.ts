/**
 * 🚑 门诊 4 号 · 症状:用户停在"个人中心",页面显示的却是"订单"的数据
 *
 * 运行:pnpm lab phase0-ts-async/tutor/bug_clinic/bug4_stale_response_race.ts
 * 任务:指出哪一步出了问题,给出最小修复(提示:和请求的发起顺序无关)。
 */

const currentTab = 'profile'; // 用户最终停留的 tab
let lastRendered = '';

function fetchAndRender(tab: string, latencyMs: number): void {
  // 模拟一次后端请求:latencyMs 后响应到达
  setTimeout(() => {
    lastRendered = `【${tab} 的数据】`;
    console.log(`第 ${String(latencyMs).padStart(3)}ms:渲染了 ${lastRendered}`);
  }, latencyMs);
}

fetchAndRender('orders', 300); // 用户先点了"订单"
fetchAndRender('profile', 100); // 200ms 内又点了"个人中心" ← 病灶大概率在附近

setTimeout(() => {
  console.log(`\n用户当前停留在 profile,页面显示的却是:${lastRendered}`);
}, 500);
