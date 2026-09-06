# 阶段 0:TypeScript 与异步模型(2 周 · 8 场 ≈ 20h)

> 目标:内化两块肌肉记忆——**类型即证明**(让非法状态不可表示)、**异步即让出**(await 不是阻塞,是 yield)。
> 这两块练扎实了,后面的 React/RN 全是在它们上面盖楼。
>
> **⚡ 学习模式:AI 助学互动式**(AI 摸底 → 预测式实验 → 禁写区构建 → 答辩验收)
> 操作手册 → **[AI助学手册.md](AI助学手册.md)**(8 个场次、每场操作单、prompt 卡直达)

## 一、材料清单

### 代码主线(负责"写出来")

| 材料 | 用法 |
|---|---|
| `exercises/01~05`(本目录) | 全部产出物落这里;**禁写区 04 是本阶段的心脏** |
| `tutor/bug_clinic/`(5 例) | S7 门诊:每个 bug 都对应一次"后端直觉翻车" |

### 理论主线(负责"看懂",当字典用)

| 材料 | 用法 |
|---|---|
| [`MAP.md`](MAP.md) 映射讲义 | **本阶段主线讲义,也是字典**:实验被打脸后回来查对应小节 |
| TypeScript 官方手册 [zh TS Handbook](https://tschinese.org/docs/handbook/intro) | 字典:实验卡暴露缺口后按需查 |
| MDN(Promise / 事件循环) | 字典:[使用 Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)、[并发模型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop) |
| AI 助教 | **主讲 + 陪练 + 考官**。每次新会话先贴 [tutor/prompts.md](tutor/prompts.md) ⓪ 号契约卡 |
| 🌐 Web 互动课程 | **c00 类型(S1)、c01 泛型(S2)、c02 事件循环(S3)、c03 Promise 预演(S4·S5)**:`cd web && npm run dev`,先玩模拟器再进场次 |

## 二、环境(5 分钟)

见[根 README](../README.md#环境使用)。开工前自检:

```bash
pnpm install && pnpm verify    # 六项全 ✅ 再开工
```

## 三、任务清单(硬指标,产出物落库才算完成)

- [ ] 环境自检六项全绿(`pnpm verify`)
- [ ] S1~S3 三张预测实验卡:错题 ≤2,且每道错题追到根因、连对变体题
- [ ] ⛔禁写区:手写 MyPromise,**对拍 21 例全绿**(`pnpm lab:promise`)
- [ ] S6 双答辩:《TS 类型系统 10 问》《事件循环 10 问》各 ≥8 题
- [ ] S7 门诊:5 例全部独立定位根因,ANSWERS 仅用于复核
- [ ] S8 脱稿:1h 写出 `runWithConcurrency`,附加题 ≥2/3,`git tag phase0-graduate`

## 四、验收标准(AI 考官制)

不查任何材料,一小时内从空文件写出**并发上限任务池** `runWithConcurrency(tasks, limit)`(同时最多 limit 个任务在飞,结果按原始顺序返回),随后 AI 考官现场出 3 道附加题(如"给任务加超时""讲清 reject 时在飞任务的下场"),≥2 道通过;并能经受 [`defense_事件循环_10问.md`](tutor/defense_事件循环_10问.md) 抽查 3 道口试。

## 五、常见卡点速查

| 现象 | 处理 |
|---|---|
| 进程突然崩了,报 `UnhandledPromiseRejection` | 不是环境坏了,是**特性**:没人接的 rejected Promise 会崩 Node。八成是你调 async 函数忘了 `await`——恭喜,提前体验了门诊 3 号 |
| `pnpm lab` 跑了,但"编译过吗"类预测对不上 | `pnpm lab` 用 tsx 只运行、**不查类型**;类型验证要用 `pnpm tscf <文件>` |
| 门诊文件的编辑器全是红线 | 正常,它们**故意带病**。别手痒修,先诊断 |
| 时序题答案和实验卡预期不一致 | 先确认没在 setTimeout 里塞了别的活;定时器延迟受机器负载影响,顺序题以微/宏任务规则为准 |
| `queueMicrotask is not defined` | Node ≥ 11 就有;检查 `pnpm verify` 的 Node 版本项 |

## 六、毕业去向 → 阶段 1

通过验收后:`git tag phase0-graduate`,进入 **阶段 1 · JS 运行时与内存(浏览器即 OS)**——闭包与 GC、内存泄漏门诊、禁写区手写响应式 store。你在本阶段亲手造的微任务队列,会在那里接上真正的"内存"。材料已就绪:phase1-runtime/AI助学手册.md。
