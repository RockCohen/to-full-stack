# 阶段 4 · 工程化与部署:老本行搬家(1.5 周 · 5 场 ≈ 12h)

> 目标:把你的 CI/CD 老本行在前端重装一遍,并说清**每件工具的脾气差异**:npm≈Maven(但默认漂移)、Vite≈javac+JRebel(两种形态)、Vitest≈JUnit、MSW≈WireMock、多阶段 Docker 照旧、Sentry≈APM。
> 本阶段没有禁写区;变异实验纪律延续。**脱稿验收:1 小时从空目录搭出"构建+测试+Docker 镜像"流水线。**
>
> **⚡ 学习模式:AI 助学互动式**。操作手册 → **[AI助学手册.md](AI助学手册.md)**

## 一、材料清单

### 代码主线(负责"写出来")

| 材料 | 用法 |
|---|---|
| `exercises/01_npm_lab` | semver 漂移/锁文件/幽灵依赖/workspace(零依赖可跑) |
| `exercises/02_vite_lab` | 两种形态、内容哈希、摇树与副作用(`pnpm lab:vite:build`) |
| `exercises/03_vitest_lab` | 计价模块测试 + 自写用例作业(`pnpm lab:vitest`) |
| `exercises/04_deploy_lab` | Dockerfile + nginx.conf:多阶段、SPA fallback、缓存分层(有 Docker 就跑) |
| `exercises/05_solo_exam` | 脱稿验收:1h 流水线 |
| `tutor/bug_clinic/`(5 例) | 锁文件漂移、副作用挡摇树、测试污染、SPA 404、Docker 缓存失效 |

### 理论主线(负责"看懂",当字典用)

| 材料 | 用法 |
|---|---|
| [`MAP.md`](MAP.md) 映射讲义 | 主线讲义:每件前端工具在你工具箱里的正牌亲戚 + 脾气差异 |
| 官方文档 pnpm / vite / vitest / web.dev | 字典:实验暴露缺口后按需读 |
| AI 助教 | 主讲+陪练+考官,⓪ 号契约卡先行 |

## 二、环境

阶段 0~3 的环境之上,本阶段已加装 `vite` 与 `vitest`。`pnpm verify` 全绿即可开工。
S34 的 Docker 实验需要本机 Docker(没有就按实验卡的读档诊断做,不影响毕业)。

## 三、任务清单(硬指标,产出物落库才算完成)

- [ ] S31~S34 四张预测实验卡:错题 ≤2 且追到根因
- [ ] E3 作业:`applyBulkDiscount` 自写测试 ≥5 例全绿
- [ ] `02_vite_lab` 三次产物尺寸记录进笔记,摇树实验验证完成
- [ ] S34 三道部署实验 + 可观测三问写进笔记
- [ ] 门诊 5 例全部独立定位根因(4/5 号读档诊断)
- [ ] S35 答辩:《工程化流水线 10 问》≥8
- [ ] S35 脱稿:1h 流水线验收,附加题 ≥2/4,`git tag phase4-graduate`

## 四、验收标准(AI 考官制)

不查任何材料,一小时内从空目录交付:`total.ts` + Vitest 用例 + vite 构建 + 多阶段 Dockerfile + .dockerignore + README(一条命令可复现)。考官逐条现场验证(测试绿/产物 <5KB/镜像分层合理),随后 4 道附加题(npm ci 差别、node 镜像为何不上线、测试隔离、frozen-lockfile 位置),≥2 道通过;并能经受 [`defense_工程化流水线_10问.md`](tutor/defense_工程化流水线_10问.md) 抽查 3 道口试。

## 五、常见卡点速查

| 现象 | 处理 |
|---|---|
| `pnpm exec` 在子目录报 No package found | 回仓库根执行;实验命令都设计成根目录脚本(`pnpm lab:vitest` 等) |
| vite build 找不到入口 | 确认在仓库根跑 `pnpm lab:vite:build`(root 已在脚本里指到 02_vite_lab) |
| 想看 dev 形态 | 仓库根执行 `pnpm exec vite phase4-engineering/exercises/02_vite_lab`,开 http://localhost:5173 看网络面板的 ESM 请求(子目录里裸跑 `pnpm exec` 会被 workspace 拦) |
| vitest 报"expect received undefined" | 先查被测函数是否纯(门诊 3 号的远亲:状态没隔离) |
| docker build 提示 COPY 找不到 web/ | 构建上下文必须是**仓库根**(README 的命令带了 `-f`) |

## 六、毕业去向 → 阶段 5

`git tag phase4-graduate` 后进入 **阶段 5 · React Native 与 Capstone 毕业设计**——JSI≈JNI、Expo≈Spring Boot,把前四个阶段的全部家底(React/Query/工程化)装进一部手机,交付全栈小产品与总答辩《全栈统一场 10 问》。(材料已就绪:phase5-rn-capstone/AI助学手册.md。)
