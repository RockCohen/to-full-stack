# 门诊答案(只许复核用!)

> 先自己诊断,再看这里。提前看 = 这例白做。

---

## 门诊 1 · bug1_fetch_ok_lies.ts

**症状复盘**:接口 500,`catch` 一次没进,面板安静显示"共 0 单"。

**根因**:`fetch` 对 4xx/5xx **不 reject**(它只在网络层失败时 reject);500 的响应体还是合法 JSON,`res.json()` 照样成功。于是"检查失败"的三道闸——异常、catch、非空判断——全部没触发,`data.orders ?? []` 把错误数据洗成了"合法的空列表"。

**最小修复**:解析前加 `if (!res.ok) throw new Error(\`HTTP \${res.status}\`)`。

**后端对照**:HTTP 客户端只看连接不读状态码——把 `{"error":...}` 当业务 DTO 反序列化。**"没有报错"≠"没有发生错误"**。

**变体思考**:如果接口返回 200 但 body 是空串,`res.json()` 会发生什么?你的 failFast 还需要补什么?

---

## 门诊 2 · bug2_cors_preflight_fail.ts

**症状复盘**:curl 全绿、浏览器全红;两个部署唯一的差别是 `CORS` 环境变量。

**根因**:同源策略只在浏览器执法。部署 B 的响应缺 `Access-Control-Allow-Origin` 等头,预检清单四项缺三——浏览器直接拒发真请求,报 `TypeError: Failed to fetch`。curl 没有执法逻辑,所以"测不出"。

**最小修复**:服务端(或网关)补 CORS 头:ACAO 指名(带凭证时不能 `*`)、Allow-Methods 含 POST、Allow-Headers 含业务自定义头;OPTIONS 秒回 204。

**后端对照**:网关忘了放行 OPTIONS。你配 Spring Security / Nginx 的 CORS 时,脑中要有这份四项检查清单。

**变体思考**:带 Cookie 的请求,`ACAO: *` 为什么不行?`Allow-Credentials` 的角色是什么?

---

## 门诊 3 · bug3_querykey_missing_var.ts

**症状复盘**:三个筛选,接口只调了 1 次,三次展示的是第一份结果。

**根因**:queryKey 是 `['orders']`,不包含 filter——三个不同的请求共享同一个缓存抽屉,后两次"命中"的是第一次的数据。**缓存 key 不完整 = 缓存串数据**,这是缓存系统里最危险的静默错误。

**最小修复**:`queryKey: ['orders', filter]`。

**后端对照**:Caffeine 的 key 只放 `userId` 不放 `deptId`,于是 A 部门看到 B 部门的报表。Caffeine 里你不会犯,因为 key 是显式参数;Query 里它"长得像数组",降低了你的警觉。

**变体思考**:filter 放 `['orders', { filter }]` 与 `['orders', filter]` 有区别吗?(都能用;对象做 key 时注意字段顺序与序列化稳定性。)

---

## 门诊 4 · bug4_forget_invalidate.ts

**症状复盘**:支付接口返回 ok,列表里 A-003 仍显示待支付;列表接口全程只调 1 次。

**根因**:写通道(POST pay)与读通道(Query 缓存)互不通信。staleTime=60s 内,读永远命中旧缓存——**写后没有失效(evict)**,数据与视图分家。

**最小修复**:支付成功后 `await qc.invalidateQueries({ queryKey: ['orders'] })`,让下一次读强制回源。

**后端对照**:写库成功但缓存没失效——经典脏读。为什么用失效而不是"把新值塞进缓存"(双写)?写只保证那一行新,列表的合计/排序/权限过滤都由服务端算;让读回源,一致性不靠客户端聪明。

**变体思考**:invalidate 后紧接着 readOrders,列表接口被调几次?(2 次:缓存里进页面 1 次 + 失效后回源 1 次。预测对了吗?)

---

## 门诊 5 · bug5_json_not_awaited.ts

**症状复盘**:合计 0 元、共 0 单,像接口没回来;但网络日志里请求发了。

**根因**(双病灶叠加):
1. `fetch(...)` 少了 `await`——拿到的是 `Promise<Response>`,不是数据;
2. `as unknown as { orders: Order[] }` 类型断言对 TS 撒了谎——**TS 只检查你声明的形状,不验证运行时真实值**,断言把类型系统变成了橡皮图章。`data.orders ?? []` 兜底,把"根本没数据"洗成"合法的空"。

**最小修复**:补 `await`,删掉断言;让 `json()` 的返回类型走**类型收窄**而不是强制转。

**后端对照**:Future 没调 `get()` 就拿返回值用;而 `as` ≈ 强转 `(Order) obj`——`@SuppressWarnings` 压掉的警告,迟早在生产补课。

**变体思考**:补了 await 之后断言为什么"无害"但仍然该删?(它不再错,但下一次接手的人会以为断言有用——类型谎言的保质期只到下一次重构。)
