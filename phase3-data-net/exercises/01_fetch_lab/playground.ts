/**
 * S25 练习 · fetch 与响应语义 —— 先写预测,再运行
 * 运行:pnpm lab phase3-data-net/exercises/01_fetch_lab/playground.ts
 */
import { startOrderServer } from '../02_mock_server/server';

const server = await startOrderServer();
const base = `http://127.0.0.1:${server.port}`;

// ============ E1 · 404 会让 fetch 的 Promise reject 吗? ============
// 预测(先写!):fetch 一个不存在的订单(服务端 404),await 会抛错吗?
//
await (async () => {
  const res = await fetch(`${base}/api/orders/NOPE`);
  console.log('E1 res.status =', res.status, ' res.ok =', res.ok);
  console.log('E1 body =', await res.text());
})();
// ❓对照:RestTemplate.getForObject 对 4xx 直接抛 HttpClientErrorException。
// fetch 的类比失效点在哪一行?(提示:看看 res.ok 是谁的责任)

// ============ E2 · Response 的 body 是"流",不是"值" ============
// 预测:不 await res.json(),直接把 res 当数据打印/使用,会发生什么?
//       json() 被调用两次呢?
//
await (async () => {
  const res = await fetch(`${base}/api/orders/A-001`);
  const data = await res.json();
  console.log('E2 data =', data);
  try {
    await res.json(); // 第二次读
  } catch (e) {
    console.log('E2 第二次读 body →', (e as Error).message.slice(0, 60));
  }
})();
// ❓后端对照:JDBC 的 ResultSet——不 next()/不取行,你拿到的是游标不是数据。

// ============ E3 · 超时 ============
// 预测:给 /api/slow(固定 800ms)设置 100ms 超时,会发生什么?
//       抛的是什么类型的错?
//
await (async () => {
  try {
    await fetch(`${base}/api/slow`, { signal: AbortSignal.timeout(100) });
    console.log('E3 竟然成功了?');
  } catch (e) {
    console.log('E3 捕获 →', (e as Error).name, (e as Error).message.slice(0, 50));
  }
})();
// ❓后端对照:ReadTimeout。熔断器(Hystrix/Resilience4j)的超时统计,统计的就是它。

// ============ E4 · Promise.all + fetch 的"假成功" ============
// 预测:并发请求一个 200 和一个 404,Promise.all 会不会 reject?
//
await (async () => {
  const [okRes, badRes] = await Promise.all([
    fetch(`${base}/api/orders/A-001`),
    fetch(`${base}/api/orders/NOPE`),
  ]);
  console.log('E4 Promise.all 没抛错;两个状态码:', okRes.status, badRes.status);
  // 想让 all 按预期失败,得自己把状态码变成异常:
  const failFast = (r: Response) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };
  try {
    await Promise.all([
      fetch(`${base}/api/orders/A-001`).then(failFast),
      fetch(`${base}/api/orders/NOPE`).then(failFast),
    ]);
  } catch (e) {
    console.log('E4 加了 ok 检查后 →', (e as Error).message);
  }
})();
// ❓综合:E1 的知识 + E4 的知识 = 一条铁律。用一句话写出来(写在笔记里)。

await server.close();
