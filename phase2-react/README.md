# 阶段 2 · React:框架即调度器(3 周 · 9 场 ≈ 21h)⭐全书重镇

> 目标:内化两块肌肉记忆——**UI = f(state)**(界面是状态的纯函数投影)与 **Hooks＝Fiber 上的固定槽位**(状态逃逸到组件的"户口本",按调用顺序寻址)。
> 最终你将亲手造出它:⛔禁写区从空文件实现 mini-React(createElement / render / diff / useState / useEffect),并用它复现门诊病例。
>
> **⚡ 学习模式:AI 助学互动式**。操作手册 → **[AI助学手册.md](AI助学手册.md)**

## 一、材料清单

### 代码主线(负责"写出来")

| 材料 | 用法 |
|---|---|
| `exercises/01~07`(本目录) | 产出物落这里;**禁写区 04 mini-React 是全仓库的旗舰心脏** |
| `tutor/bug_clinic/`(5 例) | React 经典翻车:key 串位、无限 effect、原地改 state、stale closure、条件调用 Hook |

### 理论主线(负责"看懂",当字典用)

| 材料 | 用法 |
|---|---|
| [`MAP.md`](MAP.md) 映射讲义 | 主线讲义:React＝用户态调度器;vdom diff＝脏页回写;Hooks＝逃逸到堆的状态槽 |
| 官方文档 [zh.react.dev](https://zh.react.dev/learn) | 字典:写得极好,实验卡暴露缺口后按需读 |
| AI 助教 | 主讲＋陪练＋考官,⓪ 号契约卡先行 |
| 🌐 Web 互动课程 | **c07 组件与 JSX(S16)、c08 虚拟 DOM 与 diff(S17)、c09 Hooks 与副作用(S20~S23)**:`cd web && npm run dev` |

## 二、环境

阶段 0/1 的环境之上,本阶段已加装 react / react-dom(18.x)。`pnpm verify` 全绿即可开工。实验用 `renderToString` 在 Node 里直接渲染组件——不需要浏览器也能"看到"界面。

## 三、任务清单(硬指标,产出物落库才算完成)

- [ ] S16/S17/S22/S23 四张预测实验卡:错题 ≤2 且追到根因
- [ ] ⛔禁写区:手写 mini-React,**对拍 16 例全绿**(`pnpm lab:react`)
- [ ] S21 答辩:《mini-React 10 问》≥8;并用官方 React 重写同一个计数器组件对照
- [ ] S23 双答辩:《React 调度与 Hooks 10 问》≥8
- [ ] 门诊 5 例全部独立定位根因(其中三例要用你自己的 mini-React 复现——双重验收)
- [ ] S24 脱稿:1h 写出订单看板组件(过滤＋列表＋合计),附加题 ≥2/3,`git tag phase2-graduate`

## 四、验收标准(AI 考官制)

不查任何材料,一小时内用官方 React 写出 `OrderBoard` 组件:输入过滤框按买家名筛选订单、展示列表(id/买家/金额)、底部合计;随后考官 3 道附加题(如"加一个排序切换""解释你每次渲染发生了什么""为什么列表要 key"),≥2 道通过;并能经受 [`defense_mini-react_10问.md`](tutor/defense_mini-react_10问.md) 抽查 3 道口试。

## 五、常见卡点速查

| 现象 | 处理 |
|---|---|
| `.tsx` 文件里 JSX 报红/跑不起来 | 确认文件后缀是 **.tsx**;`pnpm tscf 文件` 做类型体检;`pnpm lab 文件` 直接跑 |
| 组件渲染了但页面是空的 | 用 `renderToString` 先在 Node 里看输出(实验卡的标准姿势);别急着开浏览器 |
| 对拍脚本报 "hooks 顺序错乱" | 恭喜,你触发了 mini-React 的守卫——这正是"Rules of Hooks"的机制层原因 |
| `useState` 的 set 之后立刻读 state 还是旧值 | set 是"安排一次重渲染",不是赋值——渲染时才会是新值(类似事务提交) |
| 组件无限重渲染 | 八成是渲染函数里直接调用了 setState——渲染必须是纯函数 |

## 六、毕业去向 → 阶段 3

`git tag phase2-graduate` 后进入 **阶段 3 · 数据与网络**——fetch/CORS、TanStack Query(≈ Caffeine)、Node mock 服务。你的 mini-React 将迎来第一次"实战检验":给真实数据流装上界面。材料已就绪:phase3-data-net/AI助学手册.md。
