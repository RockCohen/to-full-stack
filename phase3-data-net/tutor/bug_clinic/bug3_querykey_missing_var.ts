/**
 * 🚑 门诊 3 号 · 症状:筛选条件换了三个,列表永远停在第一次的结果——数据像被冻住了
 *
 * 运行:pnpm lab phase3-data-net/tutor/bug_clinic/bug3_querykey_missing_var.ts
 * 任务:缓存"命中"得太热情了。找出 queryKey 的问题,并用最小改动让三个筛选各拿各的数据。
 * 提示:这是你给 Caffeine 设计时绝对不会犯的错——但 queryKey 是个数组,它换了件衣服。
 */
import { QueryClient } from '@tanstack/react-query';
import { startOrderServer } from '../../exercises/02_mock_server/server';

const server = await startOrderServer();
const base = `http://127.0.0.1:${server.port}`;
const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });

let apiCalls = 0;
async function readOrders(filter: string): Promise<{ count: number; buyers: string }> {
  return qc.fetchQuery({
    queryKey: ['orders'], // ← 病灶大概率在这附近:三次读取,共用一个"抽屉"
    queryFn: async () => {
      apiCalls++;
      const res = await fetch(`${base}/api/orders?filter=${encodeURIComponent(filter)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<{ orders: { id: string; buyer: string }[] }>;
    },
  }).then((d) => ({ count: d.orders.length, buyers: d.orders.map((o) => o.buyer).join(',') }));
}

for (const f of ['老王', '老张', '老李']) {
  const r = await readOrders(f);
  console.log(`筛选"${f}" → ${r.count} 单 [${r.buyers}]`);
}
console.log(`\n接口总共被调了 ${apiCalls} 次。用户换了三次筛选,拿到的是同一份什么?`);
await server.close();
