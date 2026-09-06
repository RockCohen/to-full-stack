/**
 * 订单看板(骨架)—— UI 结构给出,数据接线与支付失效 TODO 归你(M2)。
 * 纪律:UI = f(state);渲染纯函数;写走 mutation;写后失效(阶段 3 G4)。
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchOrders, payOrder } from './api';

export default function App() {
  const [filter, setFilter] = useState('');
  const queryClient = useQueryClient();

  // 读:queryKey = 数据的完整坐标(接口 + 全部参数,一个不能少)
  const ordersQuery = useQuery({
    queryKey: ['orders', { filter }],
    queryFn: () => fetchOrders(filter),
  });

  // 写:mutation 成功后 invalidate —— TODO(你写):补 onSuccess 失效逻辑
  const payMutation = useMutation({
    mutationFn: (id: string) => payOrder(id),
    // TODO: onSuccess 时 invalidateQueries(['orders']) ——想清楚为什么是前缀失效
  });

  if (ordersQuery.isPending) return <p>加载中…</p>;
  if (ordersQuery.isError) return <p>加载失败:{(ordersQuery.error as Error).message}</p>;

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>订单看板(Capstone)</h1>
      <input
        value={filter}
        placeholder="按买家名筛选"
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {ordersQuery.data.orders.map((o) => (
          <li key={o.id}>
            {o.id} · {o.buyer} · ¥{(o.total / 100).toFixed(2)} · {o.paid ? '已支付' : '待支付'}
            {!o.paid && (
              <button disabled={payMutation.isPending} onClick={() => payMutation.mutate(o.id)}>
                {payMutation.isPending ? '支付中…' : '支付'}
              </button>
            )}
          </li>
        ))}
      </ul>
      <p>共 {ordersQuery.data.count} 单</p>
    </main>
  );
}
