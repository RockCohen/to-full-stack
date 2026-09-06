# 坏代码门诊(阶段 3 · 数据与网络事故现场)

> 5 个可运行病例,全部独立可跑(不需要先完成别的场次)。
> 病根全是"后端直觉翻车":fetch 的失败语义、CORS 的执法方、缓存 key、写后失效、流的消费。
> 先读规则,再进病历。

## 流程(每例)

1. 运行观察症状:`pnpm lab phase3-data-net/tutor/bug_clinic/bugN_xxx.ts`
2. **写下诊断假设** → 改最小的一处验证 → 修复
3. 对 [ANSWERS.md](./ANSWERS.md) 复核;每例产三行笔记:**症状 / 根因 / 后端对照**

## 病历列表

| 门诊号 | 文件 | 一句话症状 |
|---|---|---|
| 1 | `bug1_fetch_ok_lies.ts` | 接口明明挂了,面板却显示"正常",一行错误日志都没有 |
| 2 | `bug2_cors_preflight_fail.ts` | 同一份代码:curl 全绿,一上浏览器就 TypeError: Failed to fetch |
| 3 | `bug3_querykey_missing_var.ts` | 切换筛选条件,列表纹丝不动——数据像被冻住了 |
| 4 | `bug4_forget_invalidate.ts` | 支付成功打勾了,回到列表还是"待支付" |
| 5 | `bug5_json_not_awaited.ts` | 合计永远是 0 元,接口日志里请求却发了 |

## 规则

- ANSWERS.md 只许复核用;先诊断假设,再验证;
- 每例三行笔记:症状 / 根因 / 后端对照;
- 全部治完 = 本阶段毕业的前置条件。
