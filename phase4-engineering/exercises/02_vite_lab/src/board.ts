// 订单看板:三行 DOM 操作,让"构建产物"有东西可看(不引入 React,保持实验轻)
export function mountBoard(host: HTMLElement): void {
  const orders = [
    { id: 'A-001', buyer: '老王', total: 9900, paid: false },
    { id: 'A-002', buyer: '老张', total: 19900, paid: true },
    { id: 'A-003', buyer: '老李', total: 5900, paid: false },
  ];
  host.innerHTML = `
    <h1>订单看板(Vite 实验室)</h1>
    <ul>${orders
      .map(
        (o) =>
          `<li>${o.id} · ${o.buyer} · ¥${(o.total / 100).toFixed(2)} · ${o.paid ? '已支付' : '待支付'}</li>`,
      )
      .join('')}</ul>`;
}
