# 阶段 2 · AI 助学手册(操作级)

> 旧模式:看 React 教程 → 跟敲 TodoList → 面试前再背一遍 hooks 规则。
> 新模式:AI 摸底 → 预测式实验 → 禁写区构建(手写 mini-React)→ 用官方 React 对照 → 答辩验收。
> 所有 AI 交互开场白在 [`tutor/prompts.md`](tutor/prompts.md);本机 ZCode、ChatGPT、Cursor 均适用。

## 0 · AI 助教契约

见 [`tutor/prompts.md`](tutor/prompts.md) ⓪ 号卡。铁律不变:映射教学法、禁写区(mini-React)、生成先于接收、代码是仲裁者、收尾三件套。

## 0.5 · 每场动线(固定五步)

| 步 | 动作 | 说明 |
|---|---|---|
| ① 预演 | 有对应 web 章就先玩 | c07↔S16、c08↔S17、c09↔S20~S23 |
| ② 摸底 | 贴 ⓪ 契约 → ① 摸底卡 | 零 HTML/CSS 基础:让 AI 先补 DOM/HTML/CSS 三件套(S16 必做) |
| ③ 预测 | 做 tutor/ 实验卡 | renderToString 先在 Node 里"看"界面 |
| ④ 实战 | 场次实战 / ⛔禁写区 / 门诊 | 产出物落 exercises/,commit |
| ⑤ 收尾 | ⑤ 答辩 → ⑦ 复习题 → 不变量打卡 | 表在 [notes/不变量表.md](../notes/不变量表.md) |

## 场次总表(9 场 ≈ 21h = 3 周 × 7h)

| 场次 | 主题 | 时长 | 完成标志 | 产出落点 |
|---|---|---|---|---|
| S16 | 组件与 JSX:UI=f(state) | 2.5h | 实验卡错题 ≤2;能默写 DOM/HTML/CSS 三件套关系 | `exercises/01_jsx_components/` |
| S17 | 渲染与虚拟 DOM:脏页最小回写 | 2.5h | 两棵 vdom 手工 diff 全对;讲清 key=主键 | `exercises/02_render_diff/` |
| S18 | ⛔禁写区·mini-React Ⅰ:createElement 与挂载 | 2.5h | 对拍 01~06 例绿(结构/挂载/文本/属性) | `exercises/04_mini_react/` |
| S19 | ⛔禁写区·mini-React Ⅱ:diff 与函数组件 | 2.5h | 对拍 07~11 例绿(更新/增删/函数组件) | 同上 |
| S20 | ⛔禁写区·mini-React Ⅲ:Hooks 槽位 | 2.5h | **对拍 16 例全绿**(useState/useEffect/守卫) | 同上 |
| S21 | mini-React 答辩 + 官方对照 | 2h | 《mini-React 10 问》≥8;官方 React 重写计数器 | `exercises/03_official_counter/` |
| S22 | 状态管理与通信:单向数据流 | 2h | 实验卡全对;讲清状态该放在谁的家里 | `exercises/05_state_comm/` |
| S23 | 副作用与 useEffect 深挖 | 2h | 《React 调度与 Hooks 10 问》≥8 | `exercises/06_useeffect_lab/` |
| S24 | 脱稿验收 · AI 考官 + 毕业 | 2h | OrderBoard 正确 + 附加题 ≥2/3 | `exercises/07_solo_exam/` |

> 注:S21 产出 official counter 落 `03_official_counter/`;S22 状态与通信落 `05_state_comm/`;S23 副作用实验落 `06_useeffect_lab/`;S24 脱稿落 `07_solo_exam/`。

---

## 每场操作单

### S16 · 组件与 JSX(2.5h)
- **零基础起点**:告诉 AI"我没有 HTML/CSS/DOM 基础,先用 10 分钟补三件套":DOM=树、HTML=建树标记、CSS=皮肤。这是本阶段唯一的强制前置。
- 做 [`tutor/experiments_s16_jsx与组件.md`](tutor/experiments_s16_jsx与组件.md):全部实验用 `renderToString` 在 Node 里渲染,**不需要浏览器**。
- 终极验收:合上材料,写出"渲染必须纯函数"的两条理由(提示:重放、并发)。
- 转场语:你已经会写"界面的函数"了——但每次 setState,整棵树重画一遍?React 的答案是先算差异。下一场,拆开看"算差异"这件事,然后亲手实现它。

### S17 · 渲染与虚拟 DOM(2.5h)
- ① 摸底(主题:vdom/diff/key)。做 [`tutor/experiments_s17_渲染与diff.md`](tutor/experiments_s17_渲染与diff.md)。
- 终极验收:给两棵 vdom 手工做 diff,答案与模拟器(c08)全对;用"主键"的语言讲清 key 的意义与 index-key 的炸弹。
- 转场语:原理清楚了——接下来三场,把 React 造出来。200 行,不多,但每一行都是你的。

### S18 · ⛔禁写区·mini-React Ⅰ(2.5h)
- ③ 禁写区开工卡 + 读 [`exercises/04_mini_react/README.md`](exercises/04_mini_react/README.md)(含 fake-DOM 说明与 DOM API 白名单)。
- 路线(前三步):**vdom 结构 → 首次挂载 → 文本与属性更新**。完成标志:对拍 01~06 例绿。
- 纪律:签名是契约;不看 Didact/任何 mini-react 教程源码;DOM 只准用白名单 API。

### S19 · ⛔禁写区·mini-React Ⅱ(2.5h)
- 路线(中三步):**同位置类型不同的替换 → 子节点增删 → 函数组件**。
- 完成标志:对拍 07~11 例绿。

### S20 · ⛔禁写区·mini-React Ⅲ(2.5h)
- 路线(后三步):**useState 槽位(按顺序寻址)→ 条件调用守卫(抛错)→ useEffect 与清理**。
- 完成标志:**对拍 16 例全绿**;用 ⑤ 卡做小答辩。
- 转场语:你刚写完了 React 的内核。现在,让真正的 React 来面试你——再用官方 React 重写同一个计数器,你会发现 API 设计惊人地一致。

### S21 · 答辩 + 官方对照(2h)
- 把 [`tutor/defense_mini-react_10问.md`](tutor/defense_mini-react_10问.md) 发给 AI 全量答辩(≥8)。
- 用官方 React＋renderToString 重写同一个计数器组件,落 `exercises/03_official_counter/`,与你自己的 mini 版对照 API 差异。
- 可选回马枪:此刻可读 Didact 教程(毕业前一直禁读)——对照它的取舍。

### S22 · 状态管理与通信(2h)
- ① 摸底(主题:props/state 提升)。做 [`tutor/experiments_s22_状态与通信.md`](tutor/experiments_s22_状态与通信.md):props 下行、事件上行、状态提升、Context 注入。
- 终极验收:给"全局主题/表单输入/深层组件要用的当前用户"三样状态选家并说理由。
- 转场语:状态齐了,副作用还缺一个家——useEffect。它是 React 里最容易用错的地方,也是你后端直觉最有用武之地的地方。

### S23 · 副作用与 useEffect 深挖(2h)
- 做 [`tutor/experiments_s23_useEffect.md`](tutor/experiments_s23_useEffect.md)(用你自己的 mini-React 跑 effect 实验)。
- 把 [`tutor/defense_react调度与hooks_10问.md`](tutor/defense_react调度与hooks_10问.md) 发给 AI 全量答辩(≥8)。
- 转场语:内核、状态、副作用全通了——门诊见,那里有五个真实的 React 事故现场。

### S24 · 门诊 + 脱稿验收 + 毕业(2h)
- 门诊 5 例(其中三例用你自己的 mini-React 复现):key 串位、无限 effect、原地改 state、stale closure、条件调用 Hook。
- 脱稿:1h 完成 [`exercises/07_solo_exam/README.md`](exercises/07_solo_exam/README.md) 的 OrderBoard;考官 3 道附加题 ≥2。
- 毕业三件事:误解本自测;情式笔记;`git tag phase2-graduate` 🎓

## 与任务清单的关系

[README](README.md) 任务清单不变;**代码落库才算完成**。本手册只是到达路径。

## 毕业 → 阶段 3

进入 **阶段 3 · 数据与网络**:fetch/CORS、TanStack Query、Node mock 服务。你的 mini-React 将第一次吃上真实数据流。材料已就绪:phase3-data-net/AI助学手册.md。
