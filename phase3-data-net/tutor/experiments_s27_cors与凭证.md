# S27 实验卡 · 同源策略与 CORS:浏览器这个"网关"的放行规则

> 代码落点:`exercises/03_cors_lab/playground.ts`(预检执法由你亲手扮演)。
> 本卡的最大的陷阱:**你后端的经验在这里一半失效一半生效**——失效的在于"curl 能通就能上",生效的在于"这本质是网关的放行规则"。

## E1 · 同源策略:一台只对浏览器生效的防火墙

Node 直连 mock 服务,拿到 200:

- 预测:Node 里跨端口请求被拦了吗?
- ❓映射失效点:**同源策略是浏览器单方面的执法**,服务器没有"源"的概念。curl/Postman 永远测不出 CORS 问题——它们不是浏览器,没有执法者。你后端直觉里"网关挡我 = 服务器挡我"在这里翻车:**拦截发生在客户端**。

## E2 · 预检:浏览器替你先问一次路

playground 里你以浏览器身份发 `OPTIONS`,并按规范检查响应头:

- 预测:CORS=off 时,四项检查(2xx/ACAO/Allow-Methods/Allow-Headers)缺几项?真正的 POST 会不会发出?
- ❓对照:这就是"网关没放行 OPTIONS"的完整报文级重现。以后你在 Nginx/Spring 配 CORS,脑中要能播放这段四项检查。

## E3 · 简单请求白名单:历史包袱的形状

四种请求(GET、POST+json、GET+自定义头、POST+text/plain),哪些触发预检:

- 预测:先排序,再对照 playground 输出。
- ❓"表单三兄弟"(GET/HEAD/POST + text/plain、multipart、urlencoded)免检——因为 HTML `<form>` 时代它们就能跨源提交,浏览器不能溯往。**安全策略的演进是增量的:白名单先冻结历史,再管新事物**(你做权限系统时同款困境)。

## E4 · 凭证的存放姿势:Cookie vs localStorage

带凭证(`credentials: 'include'`)的跨源请求,`ACAO: *` 是否放行:

- 预测:playground 的 E4 先看你的判断。
- ❓两条防线的分工:
  - **Cookie(HttpOnly)**:JS 读不到 → **XSS 偷不走**;但浏览器自动携带 → **CSRF 要防**(SameSite ≈ 白名单)。
  - **localStorage(JWT)**:不自动携带 → **CSRF 免疫**;但 JS 随手可读 → **XSS 一锅端**。
  - 你后端的老答案"凭证少暴露"在这里具象成:宁可防 CSRF(可控),不可赌 XSS(防不胜防)。Spring Security 的 CookieTheftContext 就是在防另一半。

## 收尾追问

1. 用一句话向老板解释:CORS 报错该修前端还是修后端?(答案:修**服务端响应头**——执法在浏览器,立法在服务器)
2. 预检请求的 HTTP 方法与两个关键请求头是什么?
3. JWT 放 localStorage 的团队,他们赌的是什么?你的 mock 场景选哪种,为什么?
