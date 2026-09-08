# 阶段 5 · AI 助学手册(操作级)

> 旧模式:跟 RN 官方 TodoList 走一遍 → App 能跑就毕业 → Capstone 变成"AI 帮我写完的项目"。
> 新模式:AI 摸底 → 预测式实验 → Capstone 四里程碑(每步自己动手,AI 只当陪练与考官)→ 总答辩。
> 所有 AI 交互开场白在 [`tutor/prompts.md`](tutor/prompts.md)。

## 0 · AI 助教契约

见 [`tutor/prompts.md`](tutor/prompts.md) ⓪ 号卡。**本阶段新增 Capstone 纪律:AI 可以出脚手架、解释报错、review 代码,但不许替你写 Capstone 的核心功能代码**(组件、数据层、导航逻辑)——那是你的毕业作品。

## 0.5 · 每场动线(固定五步)

| 步 | 动作 | 说明 |
|---|---|---|
| ① 预演 | 无 web 章 | RN 章以实验卡为主 |
| ② 摸底 | 贴 ⓪ 契约 → ① 摸底卡 | 默认你已通关前四阶段 |
| ③ 预测 | 做 tutor/ 实验卡 | 纪律不变 |
| ④ 实战 | 实验 / Capstone 里程碑 / 门诊 | 产出落库,commit |
| ⑤ 收尾 | ⑤ 答辩 → ⑦ 复习题 → 不变量打卡 | 表在 [notes/不变量表.md](../notes/不变量表.md) |

## 0.7 · Capstone 里程碑合同(PBL 式关门验收)

> 借鉴 OpenMAIC PBL 契约:里程碑不靠"感觉差不多了"推进。每个里程碑拆成微任务,
> 每个微任务收尾必过**关门检查(closing check)**,质量不够就回炉——把 S43 总答辩的压力
> 摊到 S40~S42 的每一步,避免最后一周赶工翻车。

| 里程碑 | 微任务(每项至少一个 commit) | 关门检查(口头答辩,AI 记录) |
|---|---|---|
| M1 API 跑通(S40) | ① 三条 API + 错误体模型 ② 409/404 语义自测 ③ 对照 api-contract.md | 讲清:幂等性放在哪一层?409 为什么不靠前端拦? |
| M2 Web 端通(S41) | ① 列表+过滤+支付 ② 支付后 invalidate 自动刷新 ③ Query 纪律自查 | 讲清:queryKey 少一个参数会发生什么?失效为什么不重拉全量? |
| M3 RN 端通(S41) | ① FlatList 列表(key=业务 id) ② 支付+双端一致 ③ BaseURL 环境区分 | 讲清:key 为什么不能用 index?两端口径不一致先查哪一环? |
| M4 一键起+演示(S42) | ① compose 编排 ② RN 出包步骤文档 ③ 演示脚本排练 | 现场演示:支付 → 两端一致 → 重复支付被 409 拦 |

**关门检查规则**:

- 每个微任务完成后,让 AI 助教做 closing check,评级 **weak / ok / strong**;
- **`ok` 及以上才许推进下一个微任务**;`weak` = 回炉,AI 把「问题 / 解决 / 表现」三行
  记进误解本(它就是过程性的总答辩预演记录);
- 提交物随意:代码、截图、链接、纸上推演都算;但检查必须**口头答辩**,不许只交东西;
- 里程碑完成 commit 格式:`M2(web): 支付后失效列表缓存,修复双端不一致`——
  这串 commit 就是你的毕业作品集时间线。

## 场次总表(8 场 ≈ 20h = 2~3 周)


| 场次 | 主题 | 时长 | 完成标志 | 产出落点 |
|---|---|---|---|---|
| S36 | RN 架构:JSI≈JNI | 2.5h | 实验卡全对;能画"两世界一通道"图 | `exercises/01_rn_lab/` |
| S37 | Expo 上手:第一个 App | 2.5h | App 在任一环境跑通,截图入库 | `exercises/02_expo_first/` |
| S38 | 组件与导航 | 2.5h | 实验卡全对;《RN 架构 10 问》≥8 | 同上 |
| S39 | 设备能力与权限 | 2h | 权限"拒绝态"路径设计完成 | 同上 |
| S40 | Capstone 开工:选题与架构 | 2.5h | 选题定稿;M1 验收(API 跑通) | `capstone/` |
| S41 | 全链路联调 | 2.5h | 实验卡全对;M2/M3 验收(三端通) | 同上 |
| S42 | 部署:compose 一键起 + 托管 | 2h | M4 验收(compose up 演示) | 同上 |
| S43 | 门诊 + 总答辩 + 毕业 | 3h | 《全栈统一场 10 问》≥8 | 毕业三件事 |

---

## 每场操作单

### S36 · RN 架构(2.5h)
- 做 [`tutor/experiments_s36_rn架构.md`](tutor/experiments_s36_rn架构.md),代码在 [`exercises/01_rn_lab/`](exercises/01_rn_lab/)(纯 TS 模拟 JSI 管线,不需要手机)。
- 终极验收:白纸画出"JS 世界 / 原生世界 / 通道"三块,标出哪个调用同步、哪个序列化。

### S37 · Expo 上手(2.5h)
- `npx create-expo-app my-first-app`(模板选 blank TypeScript);`npx expo start`,Expo Go 扫码 / 模拟器 / Web(`--web`)任选。
- 任务:把 phase2 的 OrderBoard 计数器改成 RN 版(View/Text/Pressable/StyleSheet)。
- 终极验收:截图落 `exercises/02_expo_first/`;能说出与 Web 版的 3 处写法差异。

### S38 · 组件与导航(2.5h)
- 做 [`tutor/experiments_s38_导航与列表.md`](tutor/experiments_s38_导航与列表.md)。
- 硬指标:FlatList 窗口化说得清;把 [`tutor/defense_RN架构_10问.md`](tutor/defense_RN架构_10问.md) 全量答辩 ≥8。

### S39 · 设备能力与权限(2h)
- 选一个能力(定位/相机/通知)设计完整权限路径:申请→授予/拒绝/永久拒绝三态 UI(纸上推演可,Expo 实现更佳)。
- 对照门诊 4 号:拒绝态缺失 = 上架审核都过不了。

### S40 · Capstone 开工(2.5h)
- 读 [`capstone/README.md`](capstone/README.md),选题定稿(A/B/C 或自拟,报 AI 考官备案)。
- M1 验收:`server/` 跑起来,curl 三条 API 全通。

### S41 · 全链路联调(2.5h)
- 做 [`tutor/experiments_s41_全链路联调.md`](tutor/experiments_s41_全链路联调.md)。
- M2:web-client 三端之一全通(列表+支付+失效);M3:RN App 通(App 连电脑要局域网 IP)。

### S42 · 部署(2h)
- M4:`docker compose up` 一键起 server+web;Web 托管到静态平台(阶段 4 的手艺)。
- RN 端出包说明(EAS/本地),至少写出步骤文档。

### S43 · 门诊 + 总答辩 + 毕业(3h)
- 门诊 5 例:FlatList key、导航泄漏、桥序列化、权限拒绝、OTA 旧包。
- **总答辩**:把 [`tutor/defense_全栈统一场_10问.md`](tutor/defense_全栈统一场_10问.md) 发给 AI,≥8;不变量"对暗号"必考,误解本抽 2 条旧病复发题。
- 毕业三件事:误解本全清;情式笔记齐;`git tag fullstack-graduate` 🎓🎓

## 与任务清单的关系

[README](README.md) 任务清单不变;**Capstone 四里程碑全验收才算完成**(微任务级推进规则见上文 0.7 里程碑合同——每个微任务过 closing check,`ok` 才放行)。本手册只是到达路径。
