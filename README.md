# to-full-stack · 全栈之旅

> 写给 Java 后端工程师的前端通关手册:TypeScript → React → React Native。
> 三个月后,这个仓库既是复习材料,也是作品集。
> 形式对齐 ai4me/llm-journey:**AI 助学 · 场次制 · 预测式实验 · 禁写区 · 答辩验收**。
> 总纲方案见 [全栈之旅-教程方案-v2.md](./全栈之旅-教程方案-v2.md)。

## 核心信念

前后端都是**数据读写**:前端的数据读写用于交互与渲染,后端的用于计算;而背后的内存管理、进程调度、通信同步(共享/通道/锁)核心逻辑不变。这条"不变量"就是全书的翻译词典,边学边填 → [notes/不变量表.md](./notes/不变量表.md)。

## 旅程地图

```
⛺ 出发
 │
 ▼
🧱 phase0 · TypeScript 与异步(类型即证明 / 异步即让出)          ← 你在这里
 │
 ▼
⚙️ phase1 · JS 运行时与内存(浏览器即 OS,闭包与 GC)
 │
 ▼
🏰 phase2 · React:框架即调度器(⛔禁写区手写 mini-React)
 │
 ▼
🌉 phase3 · 数据与网络(fetch/CORS/TanStack Query≈Caffeine)
 │
 ▼
🚚 phase4 · 工程化与部署(npm≈Maven,Vitest≈JUnit)
 │
 ▼
📱 phase5 · React Native + 全栈毕业设计 → 🎓 fullstack-graduate
```

## 目录结构

```
to-full-stack/
├── package.json             # 工具链:pnpm + tsx + tsc (+ vite/vitest/react-query)
├── scripts/verify_env.mjs   # 环境自检
├── notes/
│   ├── 不变量量表.md         # ⭐ 四条不变量,每场打卡一格(打卡须写"这次多了什么")
│   ├── 螺旋地图.md           # 概念脊柱/遭遇史/六阶段螺旋契约/假螺旋自检(教师侧规划)
│   └── 杂记.md
├── .zcode/skills/fullstack-tutor/  # 🤖 AI 助教契约技能包(⓪契约+①~⑧卡,ZCode 自动加载)
├── web/                     # 🌐 互动课程平台(阅读视图+模拟器视图,阶段 0~3 共 12 章)
│   └── README.md
├── phase0-ts-async/         # 阶段 0:TS 与异步(材料就绪)
│   ├── AI助学手册.md         # ⚡ 场次表 S1~S8 + 每场操作单
│   ├── README.md            # 材料清单 / 任务清单 / 验收标准 / 常见卡点
│   ├── MAP.md               # 映射讲义(本书唯一"以读为主"的部分,当字典用)
│   ├── tutor/               # prompt 卡 / 预测实验卡 / 答辩题库 / 坏代码门诊
│   └── exercises/           # 你的练习代码写在这里
├── phase1-runtime/          # 阶段 1:运行时与内存(S9~S15,材料就绪)
├── phase2-react/            # 阶段 2:React(S16~S24,材料就绪,⭐禁写区 mini-React)
├── phase3-data-net/         # 阶段 3:数据与网络(S25~S30,材料就绪)
├── phase4-engineering/      # 阶段 4:工程化与部署(S31~S35,材料就绪)
└── phase5-rn-capstone/      # 阶段 5:RN + 毕业设计(S36~S43,材料就绪,含 capstone/ 骨架)
```

## 从这里开始（三步）

1. `pnpm install && pnpm verify` —— 六项全 ✅；
2. （可选预热）`cd web && npm install && npm run dev`，把 c00 的收窄模拟器玩一遍；
3. 打开 [phase0-ts-async/AI助学手册.md](phase0-ts-async/AI助学手册.md)，把 [tutor/prompts.md](phase0-ts-async/tutor/prompts.md) 的 ⓪ 号契约卡贴给 AI，说"开始 S1"。
   （ZCode 用户更省事：本仓库装了 [.zcode/skills/fullstack-tutor](./.zcode/skills/fullstack-tutor/SKILL.md)，AI 自动带契约，说"开始 S1"即可。）

## 工具链暗号表（10 秒除魅，别让魔法留到明天）

| 你看到的 | 它是什么 | ≈ Java 世界 |
|---|---|---|
| node | JS 运行时 | JRE（还自带 REPL，`node` 回车即进） |
| pnpm | 包管理器＋脚本入口 | mvn / gradle |
| package.json | 项目清单与脚本定义 | pom.xml |
| node_modules/ | 依赖安装目录 | ~/.m2 本地仓库 |
| tsx | 直接运行 .ts 的工具 | groovy 跑脚本（跳过编译环节） |
| tsc / tsconfig.json | 类型检查器及其配置 | javac 及其参数 |
| `pnpm lab <文件>` | 用 tsx 跑单个实验文件 | `java -cp ... Main` |

## 环境使用

```bash
cd to-full-stack
pnpm install          # 一次性装依赖

pnpm verify           # 每次开工前自检(node/pnpm/git/TS 工具链)

pnpm lab <文件.ts>     # 跑任意实验,如:pnpm lab phase0-ts-async/exercises/03_event_loop/playground.ts
pnpm tscf <文件.ts>    # 类型体检("编译过吗?"类预测题用它验证)
pnpm lab:promise      # 跑 MyPromise 对拍脚本(禁写区完成标志)
pnpm lab:store        # 响应式 store 对拍(phase1 禁写区)
pnpm lab:react        # mini-React 对拍 16 例(phase2 禁写区)
pnpm lab:vitest       # Vitest 计价测试(phase4)
pnpm lab:vite:build   # Vite 生产构建实验(phase4)
```

```bash
cd web && npm install && npm run dev   # 🌐 互动课程(端口 5180,另需一次 npm install)
```

## 阶段进度

| 阶段 | 状态 | 产出物 |
|---|---|---|
| 0 · TS 与异步 | 🔄 材料就绪,待开学 | 手写 MyPromise(21 例对拍全绿) |
| 1 · 运行时与内存 | 🔄 材料就绪 | 手写响应式 store(对拍全绿) |
| 2 · React:框架即调度器 | 🔄 材料就绪 | 手写 mini-React(16 例对拍) |
| 3 · 数据与网络 | 🔄 材料就绪 | OrderPanel 数据层(缓存+失效) |
| 4 · 工程化 | 🔄 材料就绪 | 1h 脱稿:构建+测试+Docker 流水线 |
| 5 · RN + Capstone | 🔄 材料就绪 | 全栈小产品 + 总答辩 |

## 三条纪律

1. **禁写区里 AI 不写核心代码。** AI 能替你写代码,但替不了你长出理解。
2. **预测先于运行。** 实验题先写预测再跑;答错不丢人,答错还能连对变体题才算学会。
3. **代码是仲裁者。** 和 AI 有概念分歧,写 5~10 行跑一跑,谁输听谁的。

## 提交习惯

- 每完成一个小实验就 commit,配三五行情式笔记(做了什么 / 发现了什么 / 卡在哪);
- 节奏可以慢,但不要断——连续性比单周时长更重要。
