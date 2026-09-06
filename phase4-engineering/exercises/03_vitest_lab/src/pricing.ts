/**
 * S33 练习 · 计价模块(订单与支付业务线)—— Vitest 实验的被测对象
 *
 * 四条纯函数:同输入必同输出,无副作用 —— 测试的金字塔底座。
 * S33 的任务:先读懂,再预测测试结果,最后给 applyBulkDiscount 补测试。
 */

export type OrderLine = { sku: string; qty: number; unitPrice: number };

/** 行小计:数量 × 单价 */
export function lineTotal(line: OrderLine): number {
  return line.qty * line.unitPrice;
}

/** 订单总额:所有行小计之和(分为单位,整数运算——浮点是另一个门诊) */
export function orderTotal(lines: OrderLine[]): number {
  return lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

/**
 * 满减:满 threshold 减 discount,每单最多减一次。
 * 例:满 100 减 20,订单 250 → 230;订单 99 → 99。
 */
export function applyThresholdDiscount(total: number, threshold: number, discount: number): number {
  if (total >= threshold) return total - discount;
  return total;
}

/**
 * 批量折扣:同一 SKU 数量 ≥ bulkQty 的行,单价打 discountRate 折(向下取整到分)。
 * 待测函数:S33 实验卡 E3 要求你先写测试(含边界),它现在故意"看起来没问题"。
 */
export function applyBulkDiscount(lines: OrderLine[], bulkQty: number, discountRate: number): OrderLine[] {
  return lines.map((l) =>
    l.qty >= bulkQty
      ? { ...l, unitPrice: Math.floor(l.unitPrice * discountRate) }
      : l,
  );
}
