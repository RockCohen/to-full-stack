/**
 * S33 练习 · Vitest ≈ JUnit —— 先预测每组测试的红绿,再运行对照
 * 运行:cd phase4-engineering/exercises/03_vitest_lab && pnpm exec vitest run
 */
import { describe, expect, it } from 'vitest';
import { applyThresholdDiscount, lineTotal, orderTotal } from '../src/pricing';

describe('lineTotal · 行小计', () => {
  it('数量 × 单价', () => {
    expect(lineTotal({ sku: 'A-001', qty: 3, unitPrice: 199 })).toBe(597);
  });

  it('零数量得零', () => {
    expect(lineTotal({ sku: 'A-001', qty: 0, unitPrice: 199 })).toBe(0);
  });
});

describe('orderTotal · 订单总额', () => {
  it('多行累加', () => {
    expect(
      orderTotal([
        { sku: 'A-001', qty: 1, unitPrice: 9900 },
        { sku: 'A-002', qty: 2, unitPrice: 2500 },
      ]),
    ).toBe(14900);
  });

  it('空订单 = 0(reduce 的初始值是它)', () => {
    expect(orderTotal([])).toBe(0);
  });
});

describe('applyThresholdDiscount · 满减(单位:分)', () => {
  it('满 10000 减 2000:正好踩线也减', () => {
    expect(applyThresholdDiscount(10000, 10000, 2000)).toBe(8000);
  });

  it('差一分(9999)就不减:边界从哪边算?', () => {
    expect(applyThresholdDiscount(9999, 10000, 2000)).toBe(9999);
  });

  it('超过门槛只减一次', () => {
    expect(applyThresholdDiscount(25000, 10000, 2000)).toBe(23000);
  });
});

// ============ E3 的作业:给 applyBulkDiscount 写测试(先写预测!) ============
// 至少覆盖:① 够 bulkQty 的行被打折;② 不够的不动;③ 原 lines 不被修改(纯函数!);
// ④ 折后单价向下取整;⑤ bulkQty = 0 时会发生什么?(先预测再写)
// 写完运行:pnpm lab:vitest —— 红了就修测试还是修实现?判据是什么?
