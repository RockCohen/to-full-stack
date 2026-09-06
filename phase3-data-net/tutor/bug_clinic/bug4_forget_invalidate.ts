/**
 * 🚑 门诊 4 号 · 症状:支付明明成功了,回到订单列表,按钮还是"待支付"
 *
 * 运行:pnpm lab phase3-data-net/tutor/bug_clinic/bug4_forget_invalidate.ts
 * 任务:写通道和读通道各干各的,中间断了一根线。找到那根线,补上最小修复。
 * 提示:改完先别急着跑,预测"补上修复后,列表接口会被调几次"。
 */
import { QueryClient } from '@tanstack/react-query';
import { startOrderServer } from '../../exercises/02_mock_server/server';

const server = await startOrderServer();
const base = `http://127.0.0.1:${server.port}`;
const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });

let listCalls = 0;
const readOrders = () =>
  qc.fetchQuery({
    queryKey: ['orders', 'list'],
    queryFn: async () => {
      listCalls++;
      const res = await fetch(`${base}/api/orders`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<{ orders: { id: string; paid: boolean }[] }>;
    },
  });

async function payOrder(id: string): Promise<void> {
  const res = await fetch(`${base}/api/orders/${id}/pay`, { method: 'POST' });
  if (!res.ok) throw new Error(`支付失败 HTTP ${res.status}`);
  console.log(`支付接口返回:ok`);
  // ← 病灶大概率在附近:写通道完事了,读通道毫不知情
}

await readOrders(); // 进页面:列表入缓存
await readOrders(); // 切走再切回:命中缓存,不再请求
await payOrder('A-003');
const after = await readOrders();
const a3 = after.orders.find((o) => o.id === 'A-003');
console.log(`\n支付后列表显示 A-003 paid = ${a3?.paid}(接口的真相是 true)`);
console.log(`列表接口共被调 ${listCalls} 次 —— 写操作前后,读通道的表现差异在哪?`);
await server.close();
