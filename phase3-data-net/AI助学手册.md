# 阶段 3 · AI 助学手册(操作级)

> 旧模式:照抄 axios 封装模板 → 复制一份拦截器配置 → CORS 报错了搜一下加个注解。
> 新模式:AI 摸底 → 预测式实验 → 变异实验(先预测后运行)→ 门诊 → 答辩验收。
> 所有 AI 交互开场白在 [`tutor/prompts.md`](tutor/prompts.md);本机 ZCode、ChatGPT、Cursor 均适用。

## 0 · AI 助教契约

见 [`tutor/prompts.md`](tutor/prompts.md) ⓪ 号卡。铁律不变:映射教学法、生成先于接收、代码是仲裁者、收尾三件套。**本阶段差异:没有禁写区,纪律换成变异实验——AI 不许替你预测,不许在你预测前解释结果。**

## 0.5 · 每场动线(固定五步)

| 步 | 动作 | 说明 |
|---|---|---|
| ① 预演 | 有对应 web 章就先玩 | c10↔S27、c11↔S28~S29 |
| ② 摸底 | 贴 ⓪ 契约 → ① 摸底卡 | 默认你懂 HTTP/缓存/线程池,别客气,直说答不出 |
| ③ 预测 | 做 tutor/ 实验卡 | 每题先写预测——本阶段的核心纪律 |
| ④ 实战 | 变异实验 / 场次实战 / 门诊 | 产出物落 exercises/,commit |
| ⑤ 收尾 | ⑤ 答辩 → ⑦ 复习题 → 不变量打卡 | 表在 [notes/不变量表.md](../notes/不变量表.md) |

## 场次总表(6 场 ≈ 14h = 1.5 周 × 9h)

| 场次 | 主题 | 时长 | 完成标志 | 产出落点 |
|---|---|---|---|---|
| S25 | fetch 与响应语义:判决权在你 | 2.5h | E1~E4 预测全对;能默写"何时 resolve/reject" | `exercises/01_fetch_lab/` |
| S26 | Node 十分钟:mock 服务(Express≈Spring MVC) | 2h | 读懂骨架;亲手加 `?paid=` 过滤,curl 验收 | `exercises/02_mock_server/` |
| S27 | 同源策略与 CORS:客户端执法的防火墙 | 2.5h | 预检四项检查能默写;凭证选型说得出理由 | `exercises/03_cors_lab/` |
| S28 | TanStack Query:缓存即服务 | 2.5h | G1/G2/G4 预测全对;对照表默写 ≥5 行 | `exercises/04_query_lab/` |
| S29 | 变异实验三组:staleTime/key/重试 | 2h | 三张变异预测表填满,错题出变体 | 同上 |
| S30 | 门诊 + 答辩 + 脱稿验收 + 毕业 | 2.5h | 《CORS 与缓存 10 问》≥8;OrderPanel 正确 | `exercises/05_solo_exam/` |

---

## 每场操作单

### S25 · fetch 与响应语义(2.5h)
- ① 摸底(主题:fetch 的失败语义/流的消费/超时)。做 [`tutor/experiments_s25_fetch与响应语义.md`](tutor/experiments_s25_fetch与响应语义.md)。
- 终极验收:一句话说清 fetch 何时 resolve 何时 reject;写出你的 `failFast(res)` 工具函数。
- 转场语:你会"调"接口了——但实验的后端是真后端吗?下一场,花十分钟亲手搓一个。

### S26 · Node 十分钟(2h)
- 读 [`exercises/02_mock_server/server.ts`](exercises/02_mock_server/server.ts) 骨架,做 [`tutor/experiments_s26_mock服务.md`](tutor/experiments_s26_mock服务.md) 的 E1~E4。
- 硬指标:亲手加 `?paid=true` 过滤,curl 验收,commit。
- 转场语:服务能通了。但一上浏览器就报 CORS?——下一场认识那位只在浏览器里执法的法官。

### S27 · 同源策略与 CORS(2.5h)
- ① 摸底(主题:同源/预检/凭证)。做 [`tutor/experiments_s27_cors与凭证.md`](tutor/experiments_s27_cors与凭证.md)。
- 终极验收:预检四项检查默写;Cookie vs localStorage 的威胁模型各一句话。
- 转场语:管道全通了,数据开始流动——流的每一滴水都要有缓存池。下一场,把你管了多年的那台缓存,在前端再装一遍。

### S28 · TanStack Query 基础(2.5h)
- 做 [`tutor/experiments_s28_query缓存.md`](tutor/experiments_s28_query缓存.md) 的 G1/G2/G4。
- 终极验收:对照表默写 ≥5 行;说清"为什么失效而不是双写"。
- 转场语:机制认识了,参数的手感还没有——下一场全靠变异实验。

### S29 · 变异实验三组(2h)
- 做 [`tutor/experiments_s29_变异实验.md`](tutor/experiments_s29_变异实验.md):三张预测表(1a~1c/2a~2c/3a~3c)先填后跑。
- 终极验收:错题全出变体连对;给团队写出 queryKey 规范一条。
- 转场语:实验全绿≠没有事故——门诊见,五个真实的接口翻车现场。

### S30 · 门诊 + 答辩 + 脱稿验收 + 毕业(2.5h)
- 门诊 5 例:错误洗白、预检缺头、缓存串数据、写后不失效、忘 await。
- 把 [`tutor/defense_CORS与缓存_10问.md`](tutor/defense_CORS与缓存_10问.md) 发给 AI 全量答辩(≥8)。
- 脱稿:1h 完成 [`exercises/05_solo_exam/README.md`](exercises/05_solo_exam/README.md) 的 OrderPanel;考官 3 道附加题 ≥2。
- 毕业三件事:误解本自测;情式笔记;`git tag phase3-graduate` 🎓

## 与任务清单的关系

[README](README.md) 任务清单不变;**代码落库才算完成**。本手册只是到达路径。

## 毕业 → 阶段 4

进入 **阶段 4 · 工程化与部署**:npm≈Maven、Vite≈javac、Vitest≈JUnit、Docker 多阶段构建——你的流水线老本行在前端的翻新版。
