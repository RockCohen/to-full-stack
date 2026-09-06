# 坏代码门诊(阶段 5 · RN 与联调事故现场)

> 5 个病例:3 号可运行(`pnpm lab`),其余为**读档/Expo 诊断**(病例代码贴进你的 Expo 项目跑)。
> 病根延续一条主线:**同一批病,换了个宿主复发**——key 串位、监听器泄漏、跨界序列化、拒绝态缺失、旧包缓存。

## 流程(每例)

1. 运行或读档观察症状(3 号:`pnpm lab phase5-rn-capstone/tutor/bug_clinic/bug3_bridge_serialization.ts`)
2. **写下诊断假设** → 改最小的一处验证 → 修复
3. 对 [ANSWERS.md](./ANSWERS.md) 复核;每例产三行笔记:**症状 / 根因 / 后端对照**

## 病历列表

| 门诊号 | 文件 | 一句话症状 | 形式 |
|---|---|---|---|
| 1 | `bug1_flatlist_key.tsx` | 删掉第一行订单,剩下行的"支付状态"串位了——phase2 门诊 1 号在 RN 复发 | 读档(Expo 可跑) |
| 2 | `bug2_navigation_leak.tsx` | 离开屏幕 10 分钟,后台日志还在刷轮询请求 | 读档(Expo 可跑) |
| 3 | `bug3_bridge_serialization.ts` | 往原生模块传的回调"丢了",配置对象里少了一半字段 | 可运行 |
| 4 | `bug4_permission_denied.md` | 用户拒绝定位授权后,App 直接崩在启动页 | 读档 |
| 5 | `bug5_ota_stale_bundle.md` | OTA 推了新版本,客服还是收到"旧界面"的截图 | 读档 |

## 规则

- ANSWERS.md 只许复核用;先诊断假设,再验证;
- 每例三行笔记:症状 / 根因 / 后端对照;
- 全部治完 = S43 总答辩的前置条件。
