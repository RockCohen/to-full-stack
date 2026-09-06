# 阶段 3 · 数据与网络:你的主场,重新装修(1.5 周 · 6 场 ≈ 14h)

> 目标:把"界面会说话"升级成"界面会取数"。两条肌肉记忆——**fetch 的判决权在你手里**(网络失败才 reject,状态码自己查)与**前端缓存 = 你管了多年的那台缓存**(queryKey≈key、staleTime≈TTL、invalidate≈evict)。
> 本阶段没有禁写区:配置型知识改用**变异实验**训练——参数改一档,先预测再运行,手感到位为止。
>
> **⚡ 学习模式:AI 助学互动式**。操作手册 → **[AI助学手册.md](AI助学手册.md)**

## 一、材料清单

### 代码主线(负责"写出来")

| 材料 | 用法 |
|---|---|
| `exercises/01~05`(本目录) | 产出物落这里;`02_mock_server` 是全阶段实验的供餐后端(零依赖) |
| `tutor/bug_clinic/`(5 例) | 数据层经典翻车:错误洗白、预检缺头、缓存串数据、写后不失效、忘 await |

### 理论主线(负责"看懂",当字典用)

| 材料 | 用法 |
|---|---|
| [`MAP.md`](MAP.md) 映射讲义 | 主线讲义:fetch 判决权、CORS 执法方、Query≈Caffeine 对照表 |
| 官方文档 [MDN Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API) / [TanStack Query](https://tanstack.com/query/latest) | 字典:实验暴露缺口后按需读 |
| AI 助教 | 主讲+陪练+考官,⓪ 号契约卡先行 |
| 🌐 Web 互动课程 | **c10 同源策略与 CORS(S27)、c11 缓存与失效(S28~S29)**:`cd web && npm run dev` |

## 二、环境

阶段 0~2 的环境之上,本阶段已加装 `@tanstack/react-query`。`pnpm verify` 全绿即可开工。
所有实验都在 Node 里跑(fetch 是全局函数,mock 服务在进程内起在随机端口)——**不需要浏览器**,但 S27 要你在脑中始终带着"浏览器执法者"这个角色。

## 三、任务清单(硬指标,产出物落库才算完成)

- [ ] S25/S26/S27/S28/S29 五张预测实验卡:错题 ≤2 且追到根因
- [ ] mock 服务亲手改一次(加 `?paid=` 过滤),并用 curl 验收
- [ ] 变异实验三组(staleTime/queryKey/重试)预测表填满,错题出变体
- [ ] S30 答辩:《CORS 与缓存 10 问》≥8
- [ ] 门诊 5 例全部独立定位根因
- [ ] S30 脱稿:1h 写出 OrderPanel 数据层(封装+缓存+失效),附加题 ≥2/3,`git tag phase3-graduate`

## 四、验收标准(AI 考官制)

不查任何材料,一小时内从空文件写出 `OrderPanel.ts`:fetch 封装(ok 检查+超时)、QueryClient(staleTime+retry)、并发去重证明、支付 mutation + invalidate;随后考官 3 道附加题(如"预检失败报什么错""409 该不该重试""为什么失效而不是双写"),≥2 道通过;并能经受 [`defense_CORS与缓存_10问.md`](tutor/defense_CORS与缓存_10问.md) 抽查 3 道口试。

## 五、常见卡点速查

| 现象 | 处理 |
|---|---|
| `fetch` 返回的数据"是 undefined" | 先查是否 `await` 了 `res.json()`(门诊 5 号);Response 不是数据,是流 |
| 接口 500 但界面显示"正常" | `res.ok` 没查(门诊 1 号);fetch 只在网络层失败才 reject |
| 切换筛选,列表不变 | queryKey 少放了变量(门诊 3 号);key = 数据的完整坐标 |
| 支付后界面不更新 | 忘了 `invalidateQueries`(门诊 4 号);写后失效,不做双写 |
| Node 跑实验想看"CORS 报错" | 拦截发生在浏览器;Node 里用 `03_cors_lab` 扮演执法者看预检清单 |
| `CORS=off` 起服务后 curl 还是通 | 对,永远通——同源策略只有浏览器执法 |

## 六、毕业去向 → 阶段 4

`git tag phase3-graduate` 后进入 **阶段 4 · 工程化与部署**——npm≈Maven、Vite≈javac、Vitest≈JUnit、Docker 多阶段构建。你的数据层第一次拥有"构建→测试→镜像→上线"的完整流水线。(材料已就绪:phase4-engineering/AI助学手册.md。)
