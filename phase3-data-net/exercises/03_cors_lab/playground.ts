/**
 * S27 练习 · 同源策略与 CORS —— 先写预测,再运行
 * 运行:pnpm lab phase3-data-net/exercises/03_cors_lab/playground.ts
 */
import { createOrderServer } from '../02_mock_server/server';
import type { IncomingMessage } from 'node:http';
import http from 'node:http';

const WEB_ORIGIN = 'http://localhost:5180'; // 扮演跑在 5180 端口的互动课程页面

// ============ E1 · "同源策略只存在于浏览器" ============
// 预测:Node 里 fetch 另一个端口的服务,会被拦吗?
//
{
  const server = createOrderServer(); // CORS 头:开着
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as { port: number }).port;
  const res = await fetch(`http://127.0.0.1:${port}/api/orders`);
  console.log('E1 Node 直连 →', res.status, 'CORS 生效了吗?', '——Node 没有"源"的概念,没有执法者');
  server.close();
}
// ❓推论:用 curl/Postman 永远复现不了 CORS 报错。为什么?它缺的是什么角色?

// ============ E2 · 扮演浏览器:预检与执法 ============
// 预测:① OPTIONS 预检的响应该带哪些头,浏览器才放行?
//       ② 服务端 CORS=off 时,浏览器对"跨源 POST 订单"的裁决是?
//
function preflight(port: number): Promise<IncomingMessage> {
  return new Promise((resolve) => {
    const req = http.request(
      { host: '127.0.0.1', port, method: 'OPTIONS', path: '/api/orders',
        headers: { Origin: WEB_ORIGIN, 'Access-Control-Request-Method': 'POST',
                   'Access-Control-Request-Headers': 'content-type' } },
      resolve,
    );
    req.end();
  });
}
function judgeLikeABrowser(res: IncomingMessage): string {
  // 摘录自 fetch 规范的执法清单(简化):预检 2xx + 三类头齐全才放行
  const h = res.headers;
  const checks: Array<[string, boolean]> = [
    [`状态码 ${res.statusCode} 是 2xx`, (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300],
    ['Access-Control-Allow-Origin 存在', !!h['access-control-allow-origin']],
    ['方法 POST 在 Allow-Methods 里', (h['access-control-allow-methods'] ?? '').includes('POST')],
    ['content-type 在 Allow-Headers 里', (h['access-control-allow-headers'] ?? '').toLowerCase().includes('content-type')],
  ];
  checks.forEach(([name, ok]) => console.log(`    ${ok ? '✅' : '❌'} ${name}`));
  return checks.every(([, ok]) => ok) ? '🟢 放行,发出真正的 POST' : '🔴 拒收:TypeError: Failed to fetch(真请求根本不会发出)';
}
{
  console.log(`\n  —— 预检 Round 1:服务端 CORS ON(${WEB_ORIGIN} 要 POST 订单)——`);
  const server = createOrderServer();
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as { port: number }).port;
  console.log('  裁决:', judgeLikeABrowser(await preflight(port)));
  server.close();
}
{
  console.log(`\n  —— 预检 Round 2:同一份前端代码,服务端 CORS=off(忘配网关的周末)——`);
  const server = createOrderServer(false);
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as { port: number }).port;
  console.log('  裁决:', judgeLikeABrowser(await preflight(port)));
  server.close();
}
// ❓对照:预检 ≈ 网关的 OPTIONS 放行。Nginx/Spring 里你配过
//    "OPTIONS 直接 204"的白名单吗?没配过的那个项目,CORS 报错是不是也见过?

// ============ E3 · 谁触发预检,谁不触发 ============
// 预测:下面 4 个跨源请求,哪些免预检直接发、哪些先发 OPTIONS?
//       先把排序写在下面注释里,再运行(答案在本次输出的最后)!
// 我的预测:① ____  ② ____  ③ ____  ④ ____
//
console.log(`
  E3 判断:哪些请求会先发预检(OPTIONS)?(先落笔,答案在输出最后)
     ① GET /api/orders(不带自定义头)
     ② POST /api/pay  Content-Type: application/json
     ③ GET /api/orders  带头 X-Request-Id: abc
     ④ POST /api/pay  Content-Type: text/plain`);

// ============ E4 · credentials 与 ACAO: * 的冲突 ============
// 预测:带 Cookie 的跨源请求,下面两种响应头谁能放行?先写判断再往下运行!
//
console.log(`
  E4 判断:fetch(url, { credentials: 'include' })(带 Cookie 的跨源请求)
     A. 响应头 ACAO: *                      → 放行吗?
     B. 响应头 ACAO: ${WEB_ORIGIN}(指名)  → 只这一条够吗?
  (答案在输出最后)`);

// ═══════════════ 答案区(E3/E4)—— 预测没落笔,别往下看 ═══════════════
console.log(`
  ═══════════ 答案区(先写预测,再看这里)═════════
  E3 ① 简单请求:直接发      ② 预检(非简单内容类型)
     ③ 预检(自定义头)        ④ 简单请求(表单三兄弟之一)
     为什么 text/plain 算"简单"?——历史包袱:HTML 表单时代就存在的跨源能力,
     浏览器不能溯往。<form> 能发的,JS 沿用同一条白名单。
  E4 A. 🔴 无效!带凭证不许用通配符(浏览器拒收)
     B. 🟢 但还必须同时配 Access-Control-Credentials: true
     存放姿势总账(答辩要考):
       Cookie(HttpOnly) ≈ 服务端 Session 的票据,JS 摸不到 → XSS 偷不走,但 CSRF 得防;
       localStorage(JWT) ≈ JS 随手可得的现金 → CSRF 免疫,但 XSS 一锅端;
       你后端的老答案"少放前端能碰的地方"在这里的版本是什么?`);

process.exit(0);
