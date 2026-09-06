/**
 * 🚑 门诊 1 号 · 症状:监控里接口 500 报警,订单面板却安静地显示"共 0 单"——一条报错都没有
 *
 * 运行:pnpm lab phase3-data-net/tutor/bug_clinic/bug1_fetch_ok_lies.ts
 * 任务:为什么 catch 一次都没进?"没有报错"和"没有发生错误"是同一件事吗?
 */
import { startOrderServer } from '../../exercises/02_mock_server/server';

type Order = { id: string; buyer: string; total: number; paid: boolean };

async function loadPanel(base: string): Promise<void> {
  try {
    const res = await fetch(`${base}/api/broken`); // 服务端这单一定炸(500)
    const data = (await res.json()) as { orders: Order[] }; // ← 大概率病灶在附近
    const list: Order[] = data.orders ?? [];
    console.log(`面板:共 ${list.length} 单,合计 ${list.reduce((s, o) => s + o.total, 0)} 元`);
  } catch (e) {
    console.log('面板:加载失败 →', (e as Error).message); // 为什么它永远不响?
  }
}

const server = await startOrderServer();
await loadPanel(`http://127.0.0.1:${server.port}`);
await server.close();
console.log('\n监控视角:接口在 500;用户视角:页面"正常"。谁对谁撒了谎?');
