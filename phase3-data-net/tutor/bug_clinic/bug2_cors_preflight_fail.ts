/**
 * 🚑 门诊 2 号 · 症状:接口用 curl 验收全绿;前端一联调,浏览器报 TypeError: Failed to fetch
 *
 * 运行:pnpm lab phase3-data-net/tutor/bug_clinic/bug2_cors_preflight_fail.ts
 * 任务:两个服务端、同一个 GET——为什么"非浏览器客户端"永远测不出这个问题?
 *       用预检执法清单定位:缺的是哪个头?该在谁的配置里修?
 */
import { createOrderServer } from '../../exercises/02_mock_server/server';
import type { IncomingMessage } from 'node:http';
import http from 'node:http';

const WEB_ORIGIN = 'http://localhost:5180';

// 客户端甲:curl/Postman 的化身(直发 GET,不问路)
async function curlLike(port: number): Promise<string> {
  const res = await fetch(`http://127.0.0.1:${port}/api/orders`);
  return `curl 视角:${res.status},拿到 ${JSON.stringify(await res.json()).length} 字节 —— 全绿 ✅`;
}

// 客户端乙:浏览器的化身(先预检,再执法)
function preflight(port: number): Promise<IncomingMessage> {
  return new Promise((resolve) => {
    const req = http.request(
      { host: '127.0.0.1', port, method: 'OPTIONS', path: '/api/orders',
        headers: { Origin: WEB_ORIGIN, 'Access-Control-Request-Method': 'POST' } },
      resolve,
    );
    req.end();
  });
}
function browserJudge(res: IncomingMessage): string {
  const h = res.headers;
  const okAcao = !!h['access-control-allow-origin'];
  const okMethods = (h['access-control-allow-methods'] ?? '').includes('POST');
  if ((res.statusCode ?? 0) < 300 && okAcao && okMethods) return '浏览器视角:预检通过 🟢';
  return `浏览器视角:预检被拒 🔴(2xx=${(res.statusCode ?? 0) < 300} ACAO=${okAcao} Allow-Methods=${okMethods})→ 真请求根本不会发出`;
}

// 同一份"服务端代码",两种部署:环境变量 CORS 的一念之差
for (const corsOn of [true, false]) {
  const server = createOrderServer(corsOn);
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as { port: number }).port;
  console.log(`\n—— 部署 ${corsOn ? 'A:配了 CORS 头' : 'B:忘配 CORS 头(联调前夜)'} ——`);
  console.log(' ', await curlLike(port));
  console.log(' ', browserJudge(await preflight(port)));
  server.close();
}
console.log('\n推论:验收工具里少一个"浏览器视角",这种 bug 就只能等联调当晚现身。');
