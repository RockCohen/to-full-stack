# 门诊答案(只许复核用!)

> 先自己诊断,再看这里。提前看 = 这例白做。

---

## 门诊 1 · bug1_lockfile_drift.ts

**症状复盘**:同一份 `package.json`,周一装 1.4.2、周五装 1.5.0——semver 给了漂移的**空间**,但真正决定"装哪个"的仲裁者缺席了。

**根因**:`lockfile` 变量声明了却没人用。锁文件的职责是**把 semver 的解析结果冻结成快照**:install 时先查锁,锁里有就直接用,锁里没有才解析并**写回锁**。没有这道仲裁,每次 install 都是一次全新的"按当时 registry 重新谈判"。

**最小修复**:`install()` 先问 lockfile:`const locked = lockfile?.['left-pad-pro']; if (locked) return locked;`——CI 场景再加一层 `--frozen-lockfile`(锁不存在或对不上就直接失败,而不是顺手更新)。

**后端对照**:Maven 的 `dependencyManagement`/BOM pins。你不会接受"每次构建按最新满足区间的版本解析"——JS 的默认行为恰恰就是这个,所以才需要锁文件补位。

**变体思考**:锁文件该不该提交进 git?库和应用在这个问题上的答案为什么相反?

---

## 门诊 2 · bug2_side_effect_bundle.ts

**症状复盘**:entry 只用 `trackEvent`,产物里躺了 10 个函数 + 一段 `window.__analytics = …` 的模块级副作用。

**根因**:bundler 的摇树是**从入口 import 图出发的死代码消除**,但它有一道默认禁区——**模块级副作用可能被(哪怕一次)import 触发,删除会改变运行时行为**。所以"被引用过的副作用模块"默认整体保留。bundler 不是"不能"摇,是**不敢**——它不知道摇掉 `identifyUser` 之外的东西安不安全。

**最小修复**:由**模块的作者**在 `package.json` 里写 `sideEffects: false`(或列出有副作用的文件数组),担保"import 我不产生可观察的副作用,纯导出可以随便摇"。产物立刻缩到只剩 trackEvent(副作用代码是否保留也在声明里:声明为 false 就敢删)。

**后端对照**:ProGuard keep 规则 / "能内联的前提是无副作用"。担保错误(`sideEffects: false` 但真有副作用)= 上线后某段初始化逻辑消失,且**没有任何报错**——静默的、最贵的那种 bug。

**变体思考**:为什么这个担保只能由作者写,不能由 bundler 自动分析出来?(提示:静态分析能证明"有副作用",很难证明"绝对没有"——判断的成本与责任该归谁?)

---

## 门诊 3 · bug3_test_pollution.ts

**症状复盘**:testFileA 先跑后,testFileB 的"世界应该只有 1 条"断言炸了(实际 3 条);单独跑 B 又是绿的。

**根因**:`auditLog` 是**模块级可变状态**(单例),B 隐式依赖"模块刚被加载"这个前提。两个测试同进程执行时,A 写过的账本还在——**测试之间的隔离性被全局状态击穿**。谁先跑谁绿、后跑的背锅,是它的经典指纹。

**最小修复**(三层,由浅入深):
1. B 自己清场(`beforeEach` 重置)——治标;
2. 运行器级隔离:**Vitest 默认每个测试文件一个独立 worker(新模块注册表)**,这是它和"全进程共享"运行器的本质差别;
3. 架构级:禁止模块级可变状态,状态要么进函数作用域,要么显式注入。

**后端对照**:JUnit 的 `@BeforeEach`/`@AfterEach` = 你早已内化的"测试要自备无菌室";Spring 测试的 `@DirtiesContext` = 对付"容器级单例被上一个测试弄脏"。同一套病理,同一个处方。

**变体思考**:为什么"测试并行化"会把这类问题从偶发变成必现?并行的前提是什么?

---

## 门诊 4 · bug4_spa_fallback_404.md

**症状复盘**:站内点击一切正常(客户端路由接管),**刷新/直达** `/orders` 就 404。

**根因**:SPA 的物理世界只有一个真实文件 `index.html`;`location /` 缺了 fallback 时,nginx 对 `/orders` 的默认行为是"找同名文件 → 没有 → 404"。**路由是客户端概念,服务器并不知情**。

**最小修复**:`try_files $uri $uri/ /index.html;`——先试真实文件(assets 能命中),没有就把入口递过去(200,内容是 index.html)。

**后端对照**:网关对非 API 路径 fallback 到静态入口。区别在于:传统多页应用每个 URL 都有真身,SPA 把"多页"藏进了一个入口——**fallback 不是优化,是这类应用的存在方式**。

**变体思考**:302 到 `/` 为什么是劣解?(多一跳、地址栏被篡改、刷新语义被破坏——分享出去的 URL 失效。)什么场景下服务端重定向反而是对的?(真 404 的 API 路径。)

---

## 门诊 5 · bug5_dockerfile_cache.md

**症状复盘**:改一行 README 也触发 90s 的 `npm ci`;镜像 1.2GB,装的是 73KB 的静态站。

**根因**(两处):
1. **COPY 顺序违反层缓存协议**:`COPY . .` 把"全部源码"放在依赖安装**之前**——任何文件变动都让 `npm ci` 层失效。正确分层:`COPY package.json package-lock.json` → `npm ci` → `COPY 源码` → `build`(易变的后拷,不变的先拷);
2. **多阶段缺失 + 无 .dockerignore**:`COPY . .` 连本机的 node_modules/.git/dist 一起进上下文,最终镜像以 `npx serve` 运行 = node、全部 devDependencies、源码统统留下。

**最小修复**:两阶段(build 阶段装依赖出产物;runtime 阶段 `FROM nginx:alpine`,`COPY --from=build /app/dist /usr/share/nginx/html`)+ `.dockerignore` 排除 `node_modules`、`dist`、`.git`。最终镜像 ≈ 20MB,node/node_modules/源码全零。

**后端对照**:你早就会的"JDK 构建、JRE-slim 运行"与 `.gitignore` 的镜像版。层缓存协议 = Docker 版的增量编译依赖分析。

**变体思考**:`.dockerignore` 与多阶段各治哪个病灶?只写 .dockerignore 不改 Dockerfile,病灶一好了吗?(没有——COPY 顺序问题依旧,`npm ci` 照样每构建重跑。)
