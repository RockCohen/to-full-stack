/**
 * 🚑 门诊 5 号 · 症状:合计永远是 0 元,订单数永远是 0——接口日志里请求却发了
 *
 * 运行:pnpm lab phase3-data-net/tutor/bug_clinic/bug5_json_not_awaited.ts
 * 任务:两个病灶叠加:一个在 fetch 那行,一个在类型断言那行。分别指出,
 *       并回答:TS 为什么没拦住?(它检查的是谁,骗过它的又是谁?)
 */
import { startOrderServer } from '../../exercises/02_mock_server/server';

type Order = { id: string; buyer: string; total: number; paid: boolean };

async function renderTotal(base: string): Promise<void> {
  const res = fetch(`${base}/api/orders`); // ← 病灶一大概率在附近:少了一个字
  const data = (await Promise.resolve(res)) as unknown as { orders: Order[] }; // ← 病灶二:断言闯关
  const list: Order[] = data.orders ?? [];
  console.log(`合计:${list.reduce((s, o) => s + o.total, 0)} 元,共 ${list.length} 单`);
}

const server = await startOrderServer();
await renderTotal(`http://127.0.0.1:${server.port}`);
await server.close();
console.log('\n对照:把病灶一修掉(补那个字)再跑——面板立刻就对了,病灶二为什么此时"无害"?');
console.log('延伸:retrofit 返回 Response 而你直接 getBody() 会发生什么?同构的坑。');
