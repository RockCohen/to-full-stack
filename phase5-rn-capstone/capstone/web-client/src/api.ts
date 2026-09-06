/**
 * 数据层骨架(阶段 3 的手艺):契约见 ../docs/api-contract.md。
 * TODO(M2,你写):① 补全 failFast 与超时;② 补 payOrder 与 mutation 纪律。
 */
const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

export type Order = {
  id: string;
  buyer: string;
  total: number; // 分
  paid: boolean;
  createdAt: string;
};

/** 铁律:fetch 不替你判失败(阶段 3 E1),ok 检查 + 超时是标配 */
async function failFast(res: Response): Promise<Response> {
  // TODO(你写):非 2xx 时 throw Error(`HTTP ${res.status}`),把错误体里的 error 带上
  return res;
}

function withTimeout(ms: number): RequestInit {
  return { signal: AbortSignal.timeout(ms) };
}

export async function fetchOrders(filter = ''): Promise<{ orders: Order[]; count: number }> {
  const qs = filter ? `?filter=${encodeURIComponent(filter)}` : '';
  const res = await fetch(`${BASE}/api/orders${qs}`, withTimeout(3000));
  const checked = await failFast(res);
  return checked.json();
}

export async function payOrder(id: string): Promise<void> {
  // TODO(你写):POST /api/orders/{id}/pay,处理 409(重复支付)的用户提示
  await fetch(`${BASE}/api/orders/${id}/pay`, { method: 'POST', ...withTimeout(5000) });
}
