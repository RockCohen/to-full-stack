# S30 · 脱稿验收 · OrderPanel 数据层(订单面板)

> 规则:**不查任何材料**,1 小时,从空文件完成。写完不等于结束——AI 考官还有 3 道现场附加题。

## 题面

在本目录创建 `OrderPanel.ts`(纯数据层,不碰 React),目标:把阶段 3 的配置型知识组装成一条可用的数据管线。

```ts
// 允许的原料:@tanstack/react-query 的 QueryClient + 本进程内 startOrderServer()
// (禁用:任何网络库文档;fetch 的行为全凭你的记忆)

// 1. fetchOrderList(filter):封装 fetch —— 检查 res.ok、解析 json、超时 3s(AbortSignal)
// 2. 创建 QueryClient:订单列表查询 staleTime = 30s、失败重试 2 次;
// 3. fetchOrderList 并发调用 4 次(相同 filter):证明接口只被打 1 次;
// 4. payOrder(id):POST 支付;成功后 invalidate 订单缓存,再读列表验证 paid 已翻转;
// 5. 注释回答:payOrder 若不 invalidate,直接改缓存里的那一行,会出什么问题?
```

## 自测(写完后必须演示)

```bash
pnpm lab phase3-data-net/exercises/05_solo_exam/OrderPanel.ts
# 期望输出:4 次并发 → 1 次真实请求;支付后 paid: true;有超时与 !res.ok 的防线
```

## 考官附加题(≥2 道通过)

1. 把 staleTime 从 30s 改成 0,行为差在哪?用"TTL"的语言说。
2. 预检失败(ACAO 缺失)时,浏览器控制台报什么错?真请求发出去没有?
3. 支付接口 409(重复支付)时,你的 payOrder 会重试吗?**该不该**重试?说出机制理由。

## 毕业三件事

误解本自测一遍 → 情式笔记(本阶段 6 场各一行)→ `git tag phase3-graduate` 🎓
