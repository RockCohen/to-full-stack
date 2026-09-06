package com.tour.capstone;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 订单与支付 API —— M1 的骨架。TODO 标注处由你补全(契约见 docs/api-contract.md)。
 * 内存库即可毕业;上 H2/JPA 是进阶任务。
 */
@RestController
@RequestMapping("/api")
public class OrderController {

    public record Order(String id, String buyer, long total, boolean paid, Instant createdAt) {}

    // 内存库:ConcurrentHashMap —— "怎么不打架"在后端自己的语言
    private final Map<String, Order> store = new ConcurrentHashMap<>();

    public OrderController() {
        List.of(
            new Order("A-001", "老王", 9900, false, Instant.now()),
            new Order("A-002", "老张", 19900, true, Instant.now()),
            new Order("A-003", "老李", 5900, false, Instant.now())
        ).forEach(o -> store.put(o.id(), o));
    }

    @GetMapping("/orders")
    public Map<String, Object> orders(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) Boolean paid) {

        // TODO(你写):① filter 按买家名模糊匹配;② paid 精确匹配;
        //  ③ 按 createdAt 倒序;④ 返回 { orders, count }(对照契约)
        List<Order> list = store.values().stream()
            .sorted(Comparator.comparing(Order::createdAt).reversed())
            .toList();
        return Map.of("orders", list, "count", list.size());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> order(@PathVariable String id) {
        Order o = store.get(id);
        // TODO(你写):不存在时按契约返回 404 错误体 { error, traceId }(用下面的 error())
        return ResponseEntity.ok(o);
    }

    @PostMapping("/orders/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable String id) {
        // TODO(你写):三态——不存在 404 / 已支付 409 / 成功 200 并落库新状态。
        // 提示:store.computeIfPresent 是"单元素 CAS"的好朋友;
        // 进阶:支持 Idempotency-Key 请求头,同 key 重放返回首次结果。
        Order o = store.get(id);
        if (o == null) {
            return ResponseEntity.status(404).body(error("订单 " + id + " 不存在"));
        }
        return ResponseEntity.ok(Map.of("ok", true, "order", o));
    }

    /** 统一错误体(契约 §错误体规范;升级成 @ControllerAdvice 更好) */
    static Map<String, String> error(String message) {
        return Map.of("error", message, "traceId", "capstone-" + System.nanoTime());
    }
}
