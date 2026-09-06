// vendor-lite —— 故意写成一个"入口有副作用"的依赖,给摇树实验当标本:
// 它导出了 10 个纯函数,但 import 它的瞬间就会执行一段模块级代码。
// E3 的问题:只 import 其中一个函数时, bundler 敢不敢把其余 9 个 + 副作用一起扔掉?

export function fmtMoney(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}

export function fmtQty(qty: number): string {
  return `×${qty}`;
}

export function padOrderId(id: string): string {
  return id.padStart(8, '0');
}

// …… pretend there are seven more pure helpers here ……

// ↓↓↓ 模块级副作用:import 本模块就会执行(这就是摇树的"危险区")
const BOOT_LOG: string[] = [];
BOOT_LOG.push(`vendor-lite 装载于 ${new Date().toISOString()}`);
if (typeof console !== 'undefined') {
  console.log(`[vendor-lite] 模块级代码执行了,BOOT_LOG=${BOOT_LOG.length} 条`);
}
