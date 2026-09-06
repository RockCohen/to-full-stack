# 阶段 4 · MAP 映射讲义:工程化与部署,老本行搬家

> **用法**:字典,不是课文。先做场次实验,被打脸了再回来查对应小节。
> 本阶段对你是个好消息:依赖管理、构建、测试、镜像、流水线——**你后端吃饭的工程学全在前端有正牌亲戚**。坏消息也有一个:亲戚间脾气差异不小,按老习惯使唤会翻车(门诊 5 例全是)。

---

## 0. 世界观开场:把"交付"也当成读写

前三个阶段你练的都是"数据读写"——本阶段的对象换成了**代码本身的读写**:npm 读写依赖图(读 registry、写 node_modules),Vite 读写模块(读 import 图、写产物),测试读写行为契约,镜像读写文件层。你多年练出的工程直觉——**可复现构建、死代码消除、测试隔离、少装就是赚、层缓存协议**——一条都不用扔;要换的只是介质词汇表。

**读写世界观落点**:本阶段的主线索是"**交付流水线 = 一条强制的数据质量管道**":代码(脏数据)进来,经过 install(依赖解析)、build(编译与消除)、test(契约校验)、image(不可变打包),每一站都在**收窄"不确定性"**。你在后端建的 CI/CD,法律精神完全相同。

### 四道老题,本阶段的答卷

| 老题 | 本阶段答卷 | 对应场次 |
|---|---|---|
| 数据放在哪 | 依赖真身进 store(hard-link),子包用 symlink 引用;产物进 dist,带内容哈希 | S31、S32 |
| 谁说了算 | 锁文件仲裁版本;`sideEffects` 声明仲裁摇树;入口 index.html 仲裁缓存 | S31、S32、S34 |
| 怎么不打架 | 测试隔离(worker 进程/新模块注册表);层缓存的先拷后拷协议 | S33、S34 |
| 数据怎么流动 | registry → lock → node_modules;源码 → bundle → CDN → 浏览器 | 全阶段 |

---

## 1. npm 与依赖治理:Maven 的表亲,脾气不同

### 1.1 semver:默认范围的艺术

Maven 的 `1.4.2` 是精确坐标;npm 的 `^1.4.2` 是**默认漂移区间**(次版本+补丁)。`~` 收窄到补丁。**映射失效点**:Java 生态对 major 升级的纪律感,不能假设 JS 生态也有——小版本里塞 breaking change 的库真实存在。所以分工是:**package.json 表态(区间),lockfile 落槌(快照)**。应用锁死(CI 用 `--frozen-lockfile`)、库不锁死(把选择权留给使用者的依赖树)——这不对称你早见过:`dependencyManagement` 在 BOM 里,不在每个库的 pom 里。

### 1.2 幽灵依赖与严格链接

npm 的扁平 hoisting 把传递依赖摊平到顶层——**别人的 classpath 成了你的 classpath**,能跑,但换包管理器/升级后集体蒸发。pnpm 用文件系统符号链接实现严格可见性:每个包只看得见自己声明的依赖。你在 Java 里讨厌隐式依赖,这里有了强制版。`pnpm-workspace.yaml` ≈ `~/.m2` + 各 pom:真身全局唯一(hard-link 零拷贝),引用按声明解析。

---

## 2. Vite:构建即热插拔

### 2.1 两种形态,两种性能模型

dev 的 Vite **不打包**:浏览器发原生 ESM 请求,按 import 图按需编译(≈ JRebel 的"别重跑整个 javac");prod 才 bundle、压缩、摇树(≈ 彻底的 javac + shade + ProGuard)。**dev 快在"按需",prod 快在"合并"**——两种快不可互相替代,这也是"dev 形态不能上线"的机制层原因。

### 2.2 摇树 = 死代码消除,以及它的担保制度

tree-shaking 从入口 import 图出发删不可达代码。但它不敢删**模块级副作用**——副作用可能被依赖,删了行为就变。于是有一套担保制度:作者在 `package.json` 写 `sideEffects: false`,以名誉担保"纯导出,随便摇"。**担保错误 = 上线后某段初始化逻辑静默消失**——没有报错的那种 bug,最贵。你写"能内联的前提是无副作用"时,脑子里那句就是它。

### 2.3 内容哈希:缓存协议的自动化

产物文件名带内容哈希(`index-CClMxDjw.js`)≈ 你给静态资源手动加的 version 参数,自动化了。缓存分层协议:**入口 no-cache(不敢错),哈希产物一年 immutable(不敢旧)**。发布 = 换 index.html,像"改配置中心触发刷新"的静态版。

---

## 3. 测试:JUnit 的三件套亲戚

| 你后端的 | 前端的 | 关系 |
|---|---|---|
| JUnit 5 | Vitest | describe/it ≈ @Nested/@Test;beforeEach 同名同义 |
| Mockito | vi.fn() / vi.mock() | 编排返回值 + verify 调用 |
| MockMvc(思想) | Testing Library | 从用户视角断言,不测实现细节 |
| WireMock | MSW | 替身搭在**网络层**,被测代码不自知 |

底座永远是纯函数测试:同输入必同输出,可并发、可秒回、无替身。两条纪律从 Java 原样平移:**金额用整数(分)**(JS 连 BigDecimal 都没有,浮点计价是经典事故);**测试隔离**——模块级可变状态是并行化的定时炸弹,Vitest 默认每文件独立 worker(新模块注册表),JUnit 靠 @BeforeEach 无菌室,病理与处方同一套。

---

## 4. 部署与可观测:nginx、Docker、Sentry

### 4.1 多阶段构建:少装就是赚

build 阶段(JDK/Node + 依赖 + 源码)与 runtime 阶段(JRE-slim/nginx + 产物)分离——**构建工具是脚手架,不是承重墙**。层缓存协议你也背过:**易变的后拷,不变的先拷**(依赖清单先 COPY,源码后 COPY)。`.dockerignore` ≈ `.gitignore` 的镜像版;两者一起,才治得好"改一行注释重装全部依赖"的慢性病(门诊 5 号)。

### 4.2 静态托管的运行时:nginx 的三件事 + SPA fallback

gzip 压缩、缓存头、fallback。SPA 只有一个真实入口,所以 `try_files $uri $uri/ /index.html` 不是优化是**存在方式**——忘了它,用户刷新任何非首页路径就是 404(门诊 4 号)。上 CDN 之后,这三件事逐项被接管,nginx 可能整个退役——但你要能说清"哪几行被谁接管"。

### 4.3 Sentry ≈ APM

前端 APM 的三件套:错误聚合(未捕获异常自动上报)、sourcemap 还原堆栈、release 关联版本。**sourcemap 的两难**:公开 = 源码泄露,不给监控端 = 堆栈不可读;业界折中是 map 只推监控端、产物桶不开公开读。前端没有线程 dump,健康探针换成了**白屏检测、长任务、Core Web Vitals**——同一思想:用指标替代转储。

---

## 5. 对暗号(本阶段总表)

| Java 后端世界 | 前端世界 | 一句话 |
|---|---|---|
| pom.xml / ~/.m2 | package.json / store+symlink | 声明与仓库分离 |
| BOM / dependencyManagement | pnpm-lock.yaml | 快照落槌,semver 表态 |
| 类加载器可见性 | pnpm 严格链接 | 幽灵依赖无处遁形 |
| javac + shade | vite build + bundle | 彻底编译,合并交付 |
| ProGuard 死代码消除 | tree-shaking | 无副作用才敢删 |
| version 参数 / ETag | 内容哈希文件名 | 缓存协议自动化 |
| JUnit / Mockito / WireMock | Vitest / vi.mock / MSW | 金字塔搬家 |
| JDK 构建 JRE 运行 | 多阶段 Docker | 少装就是赚 |
| 网关 fallback | try_files → index.html | SPA 的存在方式 |
| APM + 线程 dump | Sentry + CWV 指标 | 转储换指标 |

## 6. 发散问题

1. "应用锁死、库不锁死"——如果所有库也提交 lockfile,依赖树会发生什么?(提示:版本孤岛与传递依赖爆炸)
2. dev 不打包、prod 打包:有没有"打包的 dev"?它牺牲什么换什么?(Vite 的 SSR/中间件模式可查)
3. sourcemap 两难的其他解法?如果把 map 和产物绑定哈希、按需拉取,泄露面和还原率各怎么变?

## 7. 🤔 留给你想

你的 CI 流水线从来不只是"自动跑一遍"——它是一台**把信任前置**的机器:信任在合并前被测试固化,发布只是"移动不可变产物"。前端把它推到极致:产物不可变 + 入口可变,连"发布"这个动作都退化成"换一个文件"。想想你的领域里,还有哪些"发布动作"可以被降级成"数据替换"?降级的前提是什么?(提示:不可变 + 可回滚 + 灰度可观测)

## 8. 🏛 权威佐证与延伸

- **pnpm 官方文档 · symlinked node_modules 结构**(pnpm.io/symlinked-node-modules-structure)。严格链接的机制原文,读图的十分钟胜过十篇博客。
- **Vite 官方文档 · Why Vite / Dep Pre-Bundling**(vite.dev/guide/why)。dev 不打包的原理与边界(它其实也会"预打包"依赖,读完你就知道为什么)。
- **web.dev · HTTP caching**(web.dev → HTTP caching)。入口与哈希产物的缓存分层协议,Google 出品的规范表述。
- **Testing Library 官方 · Guiding Principles**(testing-library.com)。MockMvc 思想的前端表述:"测你的用户怎么用,不测你的实现细节"。
- **延伸 · 一词之差**:打包(bundle)与打包(package)在你后端是两件事(maven package vs shade),在前端几乎总是同一件事——bundle 特指"合并成一个 JS 文件",package 指发 npm 包。别在词上摔跤。
