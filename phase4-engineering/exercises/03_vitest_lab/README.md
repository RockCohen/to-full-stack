# S33 练习 · Vitest ≈ JUnit:测试三件套的底座

配合 [`tutor/experiments_s33_vitest测试.md`](../../tutor/experiments_s33_vitest测试.md) 使用。
被测对象:`src/pricing.ts`(订单与支付业务线的计价模块,单位:分)。

## 怎么做

```bash
pnpm lab:vitest               # 全量跑一次(仓库根目录执行)
pnpm exec vitest run --root phase4-engineering/exercises/03_vitest_lab -t "满减"  # 只跑名字匹配的用例
```

1. 先**预测**每组 describe 的红绿,再运行对照;
2. 给 `applyBulkDiscount` 补测试(见 tests/pricing.test.ts 底部作业),至少 5 个用例,含"原数组不被修改"的纯函数断言;
3. 红了先问自己:**该修测试还是修实现?**——判据:测试锁的是"契约",实现错改实现;契约本身想错了改测试。

## RTL / MSW 在哪学?

本练习只测纯函数(金字塔底座)。组件测试(RTL ≈ MockMvc)与接口 mock(MSW ≈ WireMock)的思想对照写在 MAP.md §3,动手放在 **phase5 Capstone** 里做——那时你有真实组件和真实接口。

## 完成标志

7 个已给用例全绿;`applyBulkDiscount` 自写用例 ≥5 且全绿;能答"测试替身的本质是什么"。commit + 情式笔记。
