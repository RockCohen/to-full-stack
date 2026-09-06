/**
 * S28/S29 练习 · TanStack Query:缓存即服务 + 变异实验三组
 * 运行:pnpm lab phase3-data-net/exercises/04_query_lab/playground.ts
 *
 * 纪律:每个 G 先把【预测】写成注释,再运行对照。S29 的变异实验改本文件的参数。
 */
import { QueryClient } from '@tanstack/react-query';
import { startOrderServer, db } from '../02_mock_server/server';

const server = await startOrderServer();
const base = `http://127.0.0.1:${server.port}`;

// 顶层的 staleTime 也可以在 new QueryClient({ defaultOptions }) 里配——S29 的 G1b 会验证这件事
const qc = new QueryClient();

// ============ G1 · staleTime:数据的新鲜度 TTL ============
// 预测:staleTime=60s 时,同一个 queryKey 连续 fetchQuery 两次,queryFn 跑几次?
//       把 staleTime 删掉(默认 0)呢?
//
{
  let calls = 0;
  const opts = {
    queryKey: ['orders', 'list'] as const,
    staleTime: 60_000,
    queryFn: async () => {
      calls++;
      const res = await fetch(`${base}/api/orders`);
      return res.json();
    },
  };
  await qc.fetchQuery(opts);
  await qc.fetchQuery(opts);
  console.log(`G1 staleTime=60s:queryFn 跑了 ${calls} 次(缓存命中 = 命中的是你自己的 queryKey)`);
}
{
  let calls = 0;
  await qc.fetchQuery({ queryKey: ['orders', 'fresh'], queryFn: async () => { calls++; return 1; } });
  await qc.fetchQuery({ queryKey: ['orders', 'fresh'], queryFn: async () => { calls++; return 1; } });
  console.log(`G1b 默认 staleTime=0:queryFn 跑了 ${calls} 次 —— 0 秒 TTL,每次都过期`);
}
// ❓对照:staleTime ≈ Caffeine 的 expireAfterWrite。默认 0 的设计动机?
//    (提示:缓存的默认立场应该是"宁可多查,不可给旧"——和你的本地缓存正相反)

// ============ G2 · 并发去重:同一 key 的 5 个请求合并成 1 次 ============
// 预测:并发发起 5 个相同 queryKey 的 fetchQuery,接口被调用几次?
//
{
  let calls = 0;
  const one = () =>
    qc.fetchQuery({
      queryKey: ['orders', 'dedup'],
      staleTime: 60_000,
      queryFn: async () => {
        calls++;
        await new Promise((r) => setTimeout(r, 120)); // 接口延迟,让并发窗口打开
        const res = await fetch(`${base}/api/orders`);
        return res.json();
      },
    });
  const all = await Promise.all([one(), one(), one(), one(), one()]);
  console.log(`G2 5 个并发请求,queryFn 实际跑了 ${calls} 次,5 个调用者拿到 ${all.length} 份结果`);
}
// ❓对照:这就是"请求合并/singleflight"——Go 的 singleflight、你网关里的合并回源。
//    注意去重的条件:queryKey 深度相等。序列化不稳定(对象字面量顺序)会怎样?

// ============ G3 · 重试: TanStack 自带的重试策略 ============
// 预测:/api/flaky 前 2 次 503。retry: 3 时 fetchQuery 最终成功还是失败?
//       queryFn 总共被执行几次?(网络失败才算"重试",503 算吗?)
//
{
  db.flakyCalls = 0; // 重置 mock 的抖动计数器
  let calls = 0;
  try {
    const data = await qc.fetchQuery({
      queryKey: ['flaky', 'v1'],
      retry: 3,
      retryDelay: 10,
      queryFn: async () => {
        calls++;
        const res = await fetch(`${base}/api/flaky`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`); // 忘了这行会怎样?——门诊 1 号
        return res.json();
      },
    });
    console.log(`G3 retry:3 → 成功:${JSON.stringify(data)},queryFn 跑了 ${calls} 次`);
  } catch (e) {
    console.log(`G3 失败:${(e as Error).message},queryFn 跑了 ${calls} 次`);
  }
}
{
  db.flakyCalls = 0;
  let calls = 0;
  try {
    await qc.fetchQuery({
      queryKey: ['flaky', 'v2'],
      retry: false,
      queryFn: async () => {
        calls++;
        const res = await fetch(`${base}/api/flaky`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      },
    });
  } catch (e) {
    console.log(`G3b retry:false → 首战即终战:${(e as Error).message},跑了 ${calls} 次`);
  }
}
// ❓对照:retry ≈ Resilience4j 的 Retry + backoff。哪些错误不该重试?
//    (401 鉴权失败?409 重复支付?)给 retry 配一个 (count, error) => boolean 会怎么写?

// ============ G4 · mutation + invalidate:写后失效,而不是双写 ============
// 预测:支付成功后 invalidateQueries(['orders']),再读列表,
//       拿到的 A-001 是 paid:false 还是 paid:true?
//
{
  const readOrders = () =>
    qc.fetchQuery({
      queryKey: ['orders', 'board'],
      staleTime: 60_000,
      queryFn: async () => (await fetch(`${base}/api/orders`)).json(),
    });

  const before = await readOrders();
  await readOrders(); // 热缓存
  console.log('G4 支付前:A-001 paid =', before.orders.find((o: any) => o.id === 'A-001').paid);

  // 支付(mutation):写走写通道
  await fetch(`${base}/api/orders/A-001/pay`, { method: 'POST' });

  // 关键一步:写成功后,把读缓存"作废"——而不是自己去改缓存里的字段
  await qc.invalidateQueries({ queryKey: ['orders'] });
  const after = await readOrders();
  console.log('G4 支付+失效后:A-001 paid =', after.orders.find((o: any) => o.id === 'A-001').paid);
}
// ❓对照:invalidate ≈ 缓存的 evict-on-write。为什么不"直接把新订单塞进缓存"(双写)?
//    写给你一个正确值,但列表还有排序/合计/权限过滤——让下一次读自己回源,永远一致。

await server.close();
