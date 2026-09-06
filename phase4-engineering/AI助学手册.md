# 阶段 4 · AI 助学手册(操作级)

> 旧模式:抄一份 vite.config → 测试能跑就行 → Dockerfile 让 AI 生成一个。
> 新模式:AI 摸底 → 预测式实验 → 变异实验 → 门诊 → 1 小时脱稿流水线。
> 所有 AI 交互开场白在 [`tutor/prompts.md`](tutor/prompts.md);本机 ZCode、ChatGPT、Cursor 均适用。

## 0 · AI 助教契约

见 [`tutor/prompts.md`](tutor/prompts.md) ⓪ 号卡。铁律不变。**本阶段基调:你的后端工程直觉是资产,AI 的任务是帮你找到"直觉错位"的那几个点,而不是从头教。**

## 0.5 · 每场动线(固定五步)

| 步 | 动作 | 说明 |
|---|---|---|
| ① 预演 | 无 web 章,直接开工 | 本阶段动手比重更大 |
| ② 摸底 | 贴 ⓪ 契约 → ① 摸底卡 | 默认你懂 Maven/Docker/CI,答不出才讲 |
| ③ 预测 | 做 tutor/ 实验卡 | 先写预测——纪律与阶段 3 相同 |
| ④ 实战 | 变异实验 / 场次实战 / 门诊 | 产出物落 exercises/,commit |
| ⑤ 收尾 | ⑤ 答辩 → ⑦ 复习题 → 不变量打卡 | 表在 [notes/不变量表.md](../notes/不变量表.md) |

## 场次总表(5 场 ≈ 12h = 1.5 周 × 8h)

| 场次 | 主题 | 时长 | 完成标志 | 产出落点 |
|---|---|---|---|---|
| S31 | npm 与依赖治理(≈Maven 的表亲) | 2h | 四条实验预测全对;E3 试毒做完 | `exercises/01_npm_lab/` |
| S32 | Vite:构建即热插拔 | 2.5h | E1~E3 验证完;产物尺寸记录进笔记 | `exercises/02_vite_lab/` |
| S33 | 测试三件套:Vitest≈JUnit | 2.5h | 7 例全绿;applyBulkDiscount 自写 ≥5 例 | `exercises/03_vitest_lab/` |
| S34 | 部署与可观测 | 2.5h | 三道部署实验 + 可观测三问 | `exercises/04_deploy_lab/` |
| S35 | 门诊 + 答辩 + 脱稿验收 + 毕业 | 2.5h | 《工程化流水线 10 问》≥8;1h 流水线 | `exercises/05_solo_exam/` |

---

## 每场操作单

### S31 · npm 与依赖治理(2h)
- 做 [`tutor/experiments_s31_npm与依赖.md`](tutor/experiments_s31_npm与依赖.md),代码在 [`exercises/01_npm_lab/`](exercises/01_npm_lab/)。
- 重点:E3 幽灵依赖"试毒"(import 未声明包,看 tscf 与 lab 各报什么)。
- 转场语:依赖治好了,该看"代码怎么变成产物"——Vite 的两种形态会刷新你对"构建"的理解。

### S32 · Vite(2.5h)
- 做 [`tutor/experiments_s32_vite构建.md`](tutor/experiments_s32_vite构建.md),代码在 [`exercises/02_vite_lab/`](exercises/02_vite_lab/)。
- 重点:读一遍 dist 产物(它就是你的"编译产物",像读 javap 一样读它);三次 build 记录尺寸。
- 转场语:产物有了,谁担保它行为正确?——测试三件套。

### S33 · Vitest(2.5h)
- 做 [`tutor/experiments_s33_vitest测试.md`](tutor/experiments_s33_vitest测试.md),代码在 [`exercises/03_vitest_lab/`](exercises/03_vitest_lab/)。
- 主作业:`applyBulkDiscount` 自写 ≥5 用例(含纯函数断言);红了先判"修测试还是修实现"。
- 转场语:绿了就敢发?还差"发"这一环——nginx、Docker 和上线之后的事。

### S34 · 部署与可观测(2.5h)
- 做 [`exercises/04_deploy_lab/README.md`](exercises/04_deploy_lab/README.md) 的三道实验 + [`tutor/experiments_s34_部署与可观测.md`](tutor/experiments_s34_部署与可观测.md)。
- 有 Docker 就跑(命令在 README);没有就读档推演,答辩照样考。
- 转场语:零件全齐了——门诊见,五个工程化事故现场。

### S35 · 门诊 + 答辩 + 脱稿验收 + 毕业(2.5h)
- 门诊 5 例(1~3 号 `pnpm lab`,4~5 号读档诊断):锁文件漂移、副作用挡摇树、测试污染、SPA 404、Docker 缓存失效。
- 把 [`tutor/defense_工程化流水线_10问.md`](tutor/defense_工程化流水线_10问.md) 发给 AI 全量答辩(≥8)。
- 脱稿:1h 完成 [`exercises/05_solo_exam/README.md`](exercises/05_solo_exam/README.md) 的流水线,考官逐条验证 + 附加题 ≥2/4。
- 毕业三件事:误解本自测;情式笔记;`git tag phase4-graduate` 🎓

## 与任务清单的关系

[README](README.md) 任务清单不变;**代码落库才算完成**。本手册只是到达路径。

## 毕业 → 阶段 5

进入 **阶段 5 · React Native 与 Capstone**:JSI≈JNI、Expo≈Spring Boot;Capstone 全栈项目 + 总答辩《全栈统一场 10 问》。
