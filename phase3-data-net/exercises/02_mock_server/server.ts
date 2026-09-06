/**
 * S26 练习 · 订单与支付 mock 服务 —— 本阶段所有实验的后端(零依赖,node:http)
 *
 * 运行(独立起服务):  pnpm lab phase3-data-net/exercises/02_mock_server/server.ts
 *   然后另开终端:      curl http://localhost:8787/api/orders
 *
 * 环境变量:
 *   CORS=off        关闭所有 Access-Control-* 响应头(S27 的对照实验用)
 *   PORT=8787       换端口
 *
 * 端点一览(业务线:订单与支付):
 *   OPTIONS *                     预检:204 + CORS 头(CORS=off 时一个都不给)
 *   GET  /api/orders?filter=老     订单列表(按买家名过滤,人工延迟 ~120ms)
 *   GET  /api/orders/:id          订单详情(不存在 → 404)
 *   POST /api/orders/:id/pay      支付:成功 200 / 已支付 409 / 不存在 404
 *   GET  /api/flaky               前 2 次 503,第 3 次起 200(S29 重试实验)
 *   GET  /api/slow                 固定慢响应 800ms(S25 超时实验)
 *   GET  /api/broken               永远 500(门诊 1 号)
 */
import http from 'node:http';

export type Order = { id: string; buyer: string; total: number; paid: boolean };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// —— 内存库:整个进程生命周期内可变(重启即重置,方便反复实验)——
export const db = {
  orders: [
    { id: 'A-001', buyer: '老王', total: 99, paid: false },
    { id: 'A-002', buyer: '老张', total: 199, paid: true },
    { id: 'A-003', buyer: '老李', total: 59, paid: false },
  ] as Order[],
  flakyCalls: 0,
};

function corsHeaders(on: boolean): Record<string, string | number> {
  // S27 的病灶现场:CORS=off 时这里返回空对象 —— 浏览器将拒收一切跨源响应
  if (!on) return {};
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id',
    'Access-Control-Max-Age': '86400',
  };
}

export function createOrderServer(corsOn = process.env.CORS !== 'off') {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const path = url.pathname;

    const reply = (status: number, body: unknown, extra: Record<string, string | number> = {}) => {
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders(corsOn),
        ...extra,
      });
      res.end(JSON.stringify(body));
    };

    // 预检:浏览器对非简单请求会先发 OPTIONS 问路
    if (req.method === 'OPTIONS') {
      reply(corsOn ? 204 : 200, undefined);
      return;
    }

    if (req.method === 'GET' && path === '/api/orders') {
      const filter = url.searchParams.get('filter') ?? '';
      await sleep(120); // 人工延迟:让并发/竞态在实验里"肉眼可见"
      const list = db.orders.filter((o) => !filter || o.buyer.includes(filter));
      reply(200, { orders: list, count: list.length });
      return;
    }

    const orderMatch = path.match(/^\/api\/orders\/([\w-]+)$/);
    if (req.method === 'GET' && orderMatch) {
      const order = db.orders.find((o) => o.id === orderMatch[1]);
      await sleep(80);
      order ? reply(200, order) : reply(404, { error: `订单 ${orderMatch[1]} 不存在` });
      return;
    }

    const payMatch = path.match(/^\/api\/orders\/([\w-]+)\/pay$/);
    if (req.method === 'POST' && payMatch) {
      const order = db.orders.find((o) => o.id === payMatch[1]);
      await sleep(200); // 支付网关总是慢一点
      if (!order) return reply(404, { error: `订单 ${payMatch[1]} 不存在` });
      if (order.paid) return reply(409, { error: '订单已支付,勿重复提交' });
      order.paid = true;
      return reply(200, { ok: true, order });
    }

    if (req.method === 'GET' && path === '/api/flaky') {
      db.flakyCalls++;
      if (db.flakyCalls <= 2) return reply(503, { error: `服务过载(第 ${db.flakyCalls} 次)` });
      reply(200, { ok: true, attempts: db.flakyCalls });
      return;
    }

    if (req.method === 'GET' && path === '/api/slow') {
      await sleep(800);
      reply(200, { ok: true, tookMs: 800 });
      return;
    }

    if (req.method === 'GET' && path === '/api/broken') {
      // 门诊 1 号专用:服务端炸了(500),但响应体仍是合法 JSON
      reply(500, { error: 'internal server error', traceId: 'b3f1' });
      return;
    }

    reply(404, { error: `没有路由:${req.method} ${path}` });
  });
  return server;
}

/** 起在一个随机空闲端口上,供各实验文件在本进程内直接复用 */
export async function startOrderServer(): Promise<{ port: number; close: () => Promise<void> }> {
  const server = createOrderServer();
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  return {
    port,
    close: () => new Promise<void>((r) => server.close(() => r())),
  };
}

// 直接运行本文件 = 起一个常驻服务(curl/浏览器当客户端)
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const port = Number(process.env.PORT ?? 8787);
  createOrderServer().listen(port, '127.0.0.1', () => {
    console.log(`📦 订单 mock 服务:http://localhost:${port}/api/orders (CORS ${process.env.CORS === 'off' ? 'OFF' : 'ON'})`);
    console.log('   Ctrl+C 停止。curl http://localhost:8787/api/orders 试试。');
  });
}
