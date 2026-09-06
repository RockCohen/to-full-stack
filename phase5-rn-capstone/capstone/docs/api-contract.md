# REST 契约 · 订单与支付(三端共用的宪法)

> 定契约的顺序:**先写本文档,再写代码**。三端(Web/RN/未来的谁都行)只认这份文档——
> 这就是你后端"API 优先"的老规矩。改契约 = 走"先加后删"流程。

## 通用约定

- Base URL:`http://localhost:8080`(server 本机)/ `http://<局域网IP>:8080`(RN 真机)
- 所有请求/响应体:`application/json; charset=utf-8`
- 时间戳:ISO-8601 字符串;**金额:整数,单位"分"**(浮点是事故,阶段 4 讲过)

## 数据模型

```jsonc
// Order
{
  "id": "A-001",            // 业务主键,稳定不变(列表 key 用它)
  "buyer": "老王",
  "total": 9900,            // 分。9900 = ¥99.00
  "paid": false,            // 支付状态(改名的字段要走先加后删)
  "createdAt": "2026-09-06T10:00:00Z"
}
```

## 端点

### GET /api/orders?filter={buyerKeyword}&paid={true|false}

- 200 → `{ "orders": Order[], "count": number }`
- `filter` 按买家名模糊匹配;`paid` 精确匹配;都可选
- 列表按 `createdAt` 倒序

### GET /api/orders/{id}

- 200 → `Order`
- 404 → `{ "error": "订单 {id} 不存在", "traceId": "…" }`

### POST /api/orders/{id}/pay

支付(状态机:未支付 → 已支付)。

- 200 → `{ "ok": true, "order": Order(paid=true) }`
- 404 → 错误体同上(订单不存在)
- 409 → `{ "error": "订单已支付,勿重复提交" }`(**重复支付的幂等兜底**)
- 请求头(进阶任务):`Idempotency-Key: <uuid>` —— 同 key 重放返回第一次的结果

## 错误体规范(全端点统一)

```jsonc
{ "error": "人类可读的一句话", "traceId": "b3f1…" }   // traceId 用于服务端日志定位
```

前端纪律(阶段 3):`res.ok` 检查 → 非 2xx 抛错 → 错误体里的 `error` 字段给 UI 展示。

## CORS(服务端义务,阶段 3)

- `Access-Control-Allow-Origin: http://localhost:5173`(Web dev;生产加托管域名)
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Idempotency-Key`
- `OPTIONS` 预检秒回 204
- 注意:RN 端无源,不受 CORS 管——CORS 管浏览器,**鉴权管所有人**

## 演进规则

1. 新增字段 = 向后兼容,随时可加;
2. 改名/删除 = 先加后删:新旧并存 → 三端迁移 → 下个里程碑删旧;
3. 任何破坏性变更,先改本文档并 commit,再动代码。
