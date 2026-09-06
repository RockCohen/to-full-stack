# 阶段 1 · AI 助学手册(操作级)

> 旧模式:看博客学闭包 → 背 this 规则 → 面试前再背一遍。
> 新模式:AI 摸底 → 预测式实验 → 禁写区构建 → 答辩验收。
> **MAP.md 与 MDN 降级为字典(卡壳才查),核心产出物必须你亲手写。**
> 所有 AI 交互开场白在 [`tutor/prompts.md`](tutor/prompts.md);本机 ZCode、ChatGPT、Cursor 均适用。

## 0 · AI 助教契约(第 ⓪ 号卡,每次新会话先贴)

见 [`tutor/prompts.md`](tutor/prompts.md) ⓪ 号卡。铁律:**映射教学法、禁写区(响应式 store)、生成先于接收、代码是仲裁者、收尾三件套(含不变量打卡)**。

## 0.5 · 每场动线(固定五步,别自由发挥)

| 步 | 动作 | 说明 |
|---|---|---|
| ① 预演 | 有对应 web 章就先玩 | c04↔S9、c05↔S11、c06↔S12·S13 |
| ② 摸底 | 贴 ⓪ 契约 → ① 摸底卡 | AI 只讲你答错的部分 |
| ③ 预测 | 做 tutor/ 实验卡 | 先写预测再运行;错题出变体,连对才翻篇 |
| ④ 实战 | 场次的实战 / ⛔禁写区 / 门诊 | 产出物落 exercises/,commit |
| ⑤ 收尾 | ⑤ 答辩(有代码时)→ ⑦ 复习题 → 不变量打卡 | 表在 [notes/不变量表.md](../notes/不变量表.md) |

## 场次总表(7 场 ≈ 17h = 2 周 × 8.5h)

| 场次 | 主题 | 时长 | 完成标志 | 产出落点 |
|---|---|---|---|---|
| S9 | 闭包:变量的寿命控制 | 2.5h | 实验卡错题 ≤2;能讲清"闭包=逃逸到堆" | `exercises/01_closures/` |
| S10 | this 与原型:调用方注入与对象模型 | 2h | 四则绑定题连对 3;能讲清 class=语法糖 | `exercises/02_this_proto/` |
| S11 | 浏览器即 OS:内存与 GC | 2.5h | DevTools 完成三快照对比;讲清可达性 | `exercises/03_browser_memory/` |
| S12 | ⛔禁写区·响应式 store Ⅰ:订阅与通知 | 2.5h | 对拍 01~07 例绿(创建/订阅/通知/退订) | `exercises/04_reactive_store/` |
| S13 | ⛔禁写区·响应式 store Ⅱ:不可变与选择器 | 2.5h | **对拍 14 例全绿** + ⑤ 卡小答辩 | 同上 |
| S14 | 内存泄漏门诊(5 例) | 2h | 5 例全部独立定位根因 | 门诊三行笔记 |
| S15 | 脱稿验收 · AI 考官 + 毕业 | 2h | debounce/throttle 正确 + 附加题 ≥2/3 | `exercises/05_solo_exam/` |

---

## 每场操作单

### S9 · 闭包:变量的寿命控制(2.5h)
- 开场:贴 ⓪ 契约 → ① 摸底卡(主题:闭包)。**先猜后读**:先用一句话猜"闭包捕获的是值还是变量",记进笔记。
- 做 [`tutor/experiments_s9_闭包.md`](tutor/experiments_s9_闭包.md) 全部 5 题:代码贴进 `exercises/01_closures/playground.ts` 跑。
- 终极验收:合上材料,用"逃逸到堆"向 AI 讲清 makeCounter 为什么能记住 count,以及**三次调用 makeCounter 与三次调用同一个 next 的区别**。
- 转场语:你已经能让变量活过函数的生命——但"函数里的 this 凭什么指向你?"是另一套机制,下一场见。

### S10 · this 与原型(2h)
- ① 摸底(主题:this 绑定)。做 [`tutor/experiments_s10_this与原型.md`](tutor/experiments_s10_this与原型.md):四则绑定逐个体感,**重点体感"方法脱离对象调用就丢 this"**——这是门诊 3 号的病根。
- 终极验收:用一句话向 AI 讲清"箭头函数的 this 和普通函数的 this 差在哪",再用一句话讲清"class 是语法糖"糖在哪。
- 转场语:变量寿命、对象模型都齐了——现在打开浏览器的引擎盖,看看这台单核机器的**内存与回收**。

### S11 · 浏览器即 OS:内存与 GC(2.5h)
- ① 摸底(主题:GC 可达性)。做 [`tutor/experiments_s11_浏览器内存与GC.md`](tutor/experiments_s11_浏览器内存与GC.md):前两题跑代码,后三题是 **Chrome DevTools Memory 面板的操作走查**——本阶段的硬指标。
- 必做产出:完成一次"三快照对比"(基准 → 触发分配 → 再拍),把增量对象的名字记进笔记。
- 转场语:你已经知道变量怎么活、怎么死。接下来两场,亲手造一个**管理状态生死**的引擎——响应式 store。

### S12 · ⛔禁写区·响应式 store Ⅰ(2.5h)
- 开工仪式:③ 禁写区开工卡 + 读 [`exercises/04_reactive_store/README.md`](exercises/04_reactive_store/README.md)。
- 路线(前三步):**内部状态的存法 → subscribe 登记表 → setState 触发通知**。
- 纪律:签名是契约,不许改;不看 Redux/Zustand 源码;卡壳 30 分钟才准 ④ 卡。
- 完成标志:`pnpm lab:store` 中 01~07 例绿。

### S13 · ⛔禁写区·响应式 store Ⅱ(2.5h)
- 路线(后三步):**不可变替换(禁止原地改)→ 退订函数 → watch 选择器(Object.is 过滤)**。
- 完成标志:**对拍 14 例全绿**;用 ⑤ 答辩考官卡 review 你的实现。
- 转场语:恭喜,你刚造完了 React 状态管理的雏形——setState、订阅、选择器,React 只是把它们包装得更漂亮。下一步,先让 AI 拿门诊病例考考你的"内存直觉"。

### S14 · 内存泄漏门诊(5 例)(2h)
- 材料:[`tutor/bug_clinic/`](tutor/bug_clinic/),5 个可运行脚本各藏 1 处 bug,全部发生在订单业务里。
- 流程(每例):运行观察症状 → 写诊断假设 → 改最小一处验证 → 对 [ANSWERS.md](tutor/bug_clinic/ANSWERS.md) 复核;每例产三行笔记(症状/根因/后端对照)。

### S15 · 脱稿验收 + 毕业(2h)
- 不查任何资料,1 小时完成 [`exercises/05_solo_exam/README.md`](exercises/05_solo_exam/README.md) 的 **debounce＋throttle**(订单搜索框场景),并现场演示区别。
- AI 考官 3 道现场附加题 ≥2 道通过;闭包与内存 10 问抽 3 道口试。
- 毕业三件事:误解记录本拼自测;情式笔记收尾;`git tag phase1-graduate` 🎓

## 与任务清单的关系

[README](README.md) 任务清单不变,勾选规则照旧:**代码落库才算完成**。本手册只是到达路径。

## 毕业 → 阶段 2

`git tag phase1-graduate` 后进入 **阶段 2 · React:框架即调度器**。你在 S9 讲清的"逃逸"、S12 造出的"订阅-通知",会在 Hooks 内存模型里合体——Fiber 就是一张登记着"哪些状态、哪些副作用、该通知谁"的户口本。材料已就绪:phase2-react/AI助学手册.md。
