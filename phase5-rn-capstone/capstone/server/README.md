# capstone-server · 订单与支付 API

M1 验收(骨架代码里的 TODO 补完后):

```bash
cd capstone/server
mvn spring-boot:run                 # 起服务(需 JDK 17 + Maven)
curl http://localhost:8080/api/orders
curl http://localhost:8080/api/orders/A-001
curl -X POST http://localhost:8080/api/orders/A-001/pay    # 200
curl -X POST http://localhost:8080/api/orders/A-001/pay    # 409(重复支付)
curl http://localhost:8080/api/orders/NOPE                 # 404 + 错误体
```

- 契约:`../docs/api-contract.md`(改动先改契约再动代码)
- 内存库即可;重启即重置
- Docker:`docker build -t capstone-server .`(M4 由 compose 统一起)
