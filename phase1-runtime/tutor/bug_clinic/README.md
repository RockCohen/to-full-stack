# 坏代码门诊(阶段 1 · S14)

> 5 个可运行脚本,各藏 1 处 bug,症状互不相同。全部发生在订单业务里——它们全是"后端直觉翻车现场"。

## 流程(每例)

1. 运行观察症状:`pnpm lab phase1-runtime/tutor/bug_clinic/bugN_xxx.ts`
2. **写下诊断假设**(一两句,写到门诊笔记里)
3. 改最小的一处验证 → 修复
4. 对 [ANSWERS.md](./ANSWERS.md) 复核;卡住用 ⑥ 线索卡,不许直接翻答案

## 病历列表

| 门诊号 | 文件 | 一句话症状 |
|---|---|---|
| 1 | `bug1_loop_var_capture.ts` | 三个订单回调,打印的索引全是 2 |
| 2 | `bug2_listener_leak.ts` | 每进一次详情页,resize 就多触发一次 |
| 3 | `bug3_lost_this.ts` | 支付服务的方法一当回调传就丢 this |
| 4 | `bug4_inplace_sort.ts` | 排序了"展示列表",源数据也跟着乱了 |
| 5 | `bug5_accidental_global.ts` | 两次结算,优惠被重复扣——变量"串门"了 |

## 规则

- ANSWERS.md **只许复核用**;提前翻 = 这例白做;
- 卡住用 ⑥ 卡要线索;每例产三行笔记:**症状 / 根因 / 后端对照**。
