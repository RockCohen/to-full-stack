# 🚑 门诊 4 号(读档诊断)· 症状:首页好好的,用户刷新 /orders 直接 404

> 形式:读档诊断。病灶在下面的 nginx 配置里,**先写诊断假设,再给最小修复**。

## 现场档案

```nginx
server {
    listen 80;
    server_name tour.example.com;
    root /usr/share/nginx/html;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        # ← 大概率病灶在附近:这个 location 只剩一行注释
        # (原作者说"静态托管嘛,没啥可配的")
    }
}
```

## 用户上报的复现路径

1. 打开 `https://tour.example.com/` → 课程首页正常 ✅
2. 点进"订单看板",地址栏变成 `/orders` → 页面正常 ✅(客户端路由接管)
3. **刷新页面** → 404 Not Found ❌(冷启动直接访问 `/orders` 同样 404)

## 诊断提示

- nginx 的默认行为:`location /` 里没有 `try_files` 时,对 `/orders` 会做什么?
- 这台服务器上有几个"真实存在"的文件?(提示:SPA 的物理世界只有一个入口)
- 你配网关时给"非 API 路径"设过 fallback 吗?这里缺的是不是同一个东西?

## 任务

1. 写出病灶:为什么"点进去正常、刷新就 404"?
2. 给出最小修复(一行);修复后,`/orders` 的返回内容是什么?状态码呢?
3. 追问:如果把 fallback 改成 302 重定向到 `/` 行不行?和"直接回 index.html"比,用户多付出什么?
