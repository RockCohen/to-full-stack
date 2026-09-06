# Capstone · 订单与支付全栈毕业设计

> 三端一份真相:Spring Boot API + React Web + RN App,Docker Compose 一键起。
> 这是你的毕业作品——**核心代码必须你自己写**(AI 只当陪练:脚手架、报错解释、review,见 ⓪ 号契约卡第 7 条)。

## 选题(三选一,或自拟报考官备案)

| 选题 | 内容 | 适合谁 |
|---|---|---|
| **A. 个人监控面板** | 服务健康/告警/指标流,推送提醒 | 贴日常工作,后端素材现成 |
| **B. 全栈看板/备忘** | 订单与支付变体:看板卡片+协作状态 | 想把 CRUD/实时性做扎实 |
| **C. RSS 聚合 App** | 订阅源+拉取+已读状态同步 | 最贴"数据读写"主旋律,天然覆盖缓存失效 |

以下骨架以"订单与支付"(选题 B 的底座)为例,换题时**保留目录结构与里程碑,替换领域模型**。

## 目录结构

```
capstone/
├── docs/api-contract.md     # REST 契约(三端共用的"宪法",先定契约再动手)
├── docker-compose.yml       # M4:一键起 server + web
├── server/                  # Spring Boot API(你的老本行)
├── web-client/              # React Web(Vite + TanStack Query,阶段 2~4 家底)
└── mobile/                  # RN App(Expo,阶段 5 新家底)
```

## 四个里程碑(硬验收)

### M1 · API 跑通(S40)
- [ ] `server/` 编译启动(Spring Boot 3 + Java 17),内存库即可
- [ ] `GET /api/orders`、`GET /api/orders/{id}`、`POST /api/orders/{id}/pay` 三条全通(curl)
- [ ] 重复支付返回 409;不存在的订单返回 404;错误体格式符合 [api-contract](docs/api-contract.md)

### M2 · Web 端通(S41)
- [ ] `web-client/` 列表 + 过滤 + 支付按钮;支付成功后**列表自动刷新(invalidate)**
- [ ] Query 纪律:queryKey 含全部参数;staleTime 明示;`res.ok` 检查 + 超时
- [ ] CORS 按契约配置,跨源请求通过

### M3 · RN 端通(S41)
- [ ] `mobile/` 列表(FlatList,key 用业务 id)+ 详情 + 支付
- [ ] 支付后两端口数据一致(同一份 API 真相)
- [ ] App 连接电脑 API 用局域网 IP(BaseURL 环境区分)

### M4 · 一键起 + 毕业演示(S42~S43)
- [ ] `docker compose up --build` 起 server+web,浏览器可用
- [ ] RN 端演示方案(EAS/本地出包或 Expo Go),文档写清步骤
- [ ] 演示脚本:支付 → 两端列表一致 → 重复支付被 409 拦截
- [ ] 总答辩《全栈统一场 10 问》≥8

## 工程要求(从阶段 4 平移,一条不许少)

- `server/` 与 `web-client/` 各自有 README:一条命令可复现
- Web 端构建走 Vite;测试(Vitest)至少覆盖一个纯函数模块(如金额合计)
- Dockerfile 多阶段;`.dockerignore` 排除 node_modules/dist/.git
- **先加后删**:改字段名要三端兼容(旧字段并存一个里程碑周期)

## 提交习惯

每个里程碑至少一次 commit,信息格式:`M2(web): 支付后失效列表缓存,修复双端不一致`。里程碑完成的 commit 就是你的毕业作品集时间线。
