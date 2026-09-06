# S33 实验卡 · 测试三件套:Vitest ≈ JUnit(先摸底座)

> 代码落点:`exercises/03_vitest_lab/`。命令:`pnpm lab:vitest`。
> 三件套的分工,你的旧世界就有对应物:**Vitest≈JUnit、RTL≈MockMvc 的思想、MSW≈WireMock**。本卡先磨底座(纯函数测试),组件与接口替身放在 phase5 的 Capstone 里真刀真枪。

## E1 · 测试金字塔的底座:纯函数

`src/pricing.ts` 是订单计价(单位:分)。先读 `tests/pricing.test.ts` 的 7 个用例,**逐个预测红绿**再运行。

- ❓为什么底座全是纯函数测试:同输入必同输出、无副作用 → 可并发、可秒回、无替身。你写 Service 单测时的"能 new 出来就能测",在这里是"能 import 进来就能测"。

## E2 · 边界:计价的经典雷区

看三个满减用例:正好踩线(10000)、差一分(9999)、超门槛(25000)。

- 预测:三个的期望值分别是什么?为什么单位必须是"分"(整数)而不是"元"(浮点)?
- ❓浮点计价 ≈ 你用 double 存金额的经典事故:`0.1 + 0.2 !== 0.3`。JS 连 BigDecimal 都没有——**整数分 + 边界用例**是纪律不是技巧。

## E3 · 给 applyBulkDiscount 补测试(本卡主作业)

README 作业区列了 5 个必覆盖点(含"原数组不被修改"的纯函数断言)。**先写测试、写预测,再运行**。

- ❓红了怎么办的判据:测试锁的是**契约**——实现违背契约改实现;契约本身想错(比如 bulkQty=0 应该全员打折还是没人打折?)改测试并留下注释。这个判断,和你 review 下属的单测时做的是同一个判断。

## E4 · 测试隔离:mock 的真面目(纸上推演)

- 预测:两个用例共享一个模块级计数器,单独跑都绿、一起跑红—— pathology 是什么?Vitest 里 `beforeEach` 对应 JUnit 的什么?
- ❓`vi.mock('./api')` ≈ Mockito:`vi.fn()` = mock 的返回值编排,`expect(fn).toHaveBeenCalledWith(...)` = verify。**替身的本质:用"受控的不可变性"替换"昂贵的真实性"**。MSW 的特殊之处:替身搭在**网络层**而非模块层——组件不知道自己被 mock 了(≈ WireMock 起了个真端口)。

## 收尾追问

1. 为什么"组件测试放 Capstone"而纯函数测试现在就练?(提示:RTL 需要 DOM 容器,那正是你 mini-React 的 fake-DOM 亲戚)
2. 一条断言该多"狠"?`expect(total).toBe(23000)` 与 `expect(total).toBeGreaterThan(0)`,哪种是好测试?
3. 测试的 arrange-act-assert 与你后端的 given-when-then,除了名字还有区别吗?
