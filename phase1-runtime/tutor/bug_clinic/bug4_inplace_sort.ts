/**
 * 🚑 门诊 4 号 · 症状:排序了"展示列表",源数据(录入视图)也跟着乱了
 *
 * 运行:pnpm lab phase1-runtime/tutor/bug_clinic/bug4_inplace_sort.ts
 * 任务:指出哪一步改了不该改的数据,给出最小修复。
 */

interface Order { id: string; total: number }

const orders: Order[] = [
  { id: 'A-001', total: 300 },
  { id: 'A-002', total: 100 },
  { id: 'A-003', total: 200 },
];

// 报表一:按金额排序的展示列表
const sortedView = orders.sort((a, b) => b.total - a.total);   // ← 病灶大概率在这附近
console.log('排序后的展示列表:', sortedView.map(o => o.id).join(','));

// 报表二:录入视图(另一个模块,共享同一份源数据)
console.log('首笔录入订单:', orders[0].id, '(应为 A-001,还是吗?)');
