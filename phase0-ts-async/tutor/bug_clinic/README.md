# 坏代码门诊(S7)

> 5 个可运行脚本,各藏 1 处 bug,症状互不相同。它们全是"后端直觉翻车现场"。

## 流程(每例)

1. 运行观察症状:`pnpm lab phase0-ts-async/tutor/bug_clinic/bugN_xxx.ts`
2. **写下诊断假设**(一两句,写到门诊笔记里)
3. 改最小的一处验证 → 修复
4. 对 [ANSWERS.md](./ANSWERS.md) 复核;卡住用 ⑥ 线索卡,不许直接翻答案

## 病历列表

| 门诊号 | 文件 | 一句话症状 |
|---|---|---|
| 1 | `bug1_missing_return.ts` | 支付流程报错,可扣款函数明明执行了 |
| 2 | `bug2_microtask_starvation.ts` | 程序不退出,"逃生舱"定时器永远不响(跑完 Ctrl+C) |
| 3 | `bug3_uncaught_async_error.ts` | 先打印"启动成功"再崩溃,try/catch 形同虚设 |
| 4 | `bug4_stale_response_race.ts` | 用户停在"个人中心",页面显示的却是"订单"的数据 |
| 5 | `bug5_type_assertion_lies.ts` | host 有值、port 是 undefined,连接悄悄失败 |

## 规则

- ANSWERS.md **只许复核用**,先自己诊断;提前翻答案 = 这例白做;
- 门诊文件编辑器里有红线是正常的——**它们故意带病**,别手痒"顺手修掉",先说清病灶;
- 每例产三行笔记:**症状 / 根因 / 后端对照**(它像你后端生涯里哪次事故?)。
