# 门诊答案(只许复核用!)

> 先自己诊断,再看这里。提前看 = 这例白做。

---

## 门诊 1 · bug1_key_index_swap.tsx

**症状复盘**:删掉 A-001 后,B-002 显示"已确认"(它明明是待确认),C-003 显示"待确认"(它明明已支付)。**行的 props 更新了,行内的 useState 状态却留在了前任身上。**

**根因**:没有 key,React(mini 版同理)按**位置**配对实例——位置 0 的实例(原本是 A,confirmed=true)收到了 B 的 props,但它的 Hook 槽位里还是 A 时代的 confirmed。**身份按位置漂移 = 状态串位。**

**最小修复**:`h(OrderRow, { key: o.id, order: o })`——官方 React 里加稳定 key 后按 key 对齐实例;mini 版的 key 对齐是 README 的加餐题。

**后端对照**:主键漂移——用"行号"当主键,删一行全表外键错乱。

**变体思考**:什么情况下用 index 当 key 是安全的?(列表永不变、纯展示、无行内状态——够苛刻吧?)

---

## 门诊 2 · bug2_effect_storm.tsx

**症状复盘**:effect 没有 deps 数组 → 每次渲染后都执行 → effect 里 setRows(新数组,引用必变)→ 触发重渲染 → 再执行 effect……死循环。保险丝 MAX=5 模拟"前 5 次请求"。

**根因**:effect 里 setState 且无依赖数组——"渲染→副作用→改状态→再渲染"闭环。真实世界 = 请求风暴,直到页面卡死或接口限流。

**最小修复**:`useEffect(() => { apiCalls++; setRows(...) }, [filter])`——只在 filter 变化时拉取。

**后端对照**:定时任务里再投递自己且无终止条件——自己打自己的 DoS。

**变体思考**:如果需求真是"filter 变化拉取,且只拉一次"?条件放进 effect 内部可以吗?(可以,但条件要基于 props/state 判断,并写清理由——预防性 deps 治理。)

---

## 门诊 3 · bug3_mutate_state.tsx

**症状复盘**:`items.push('A-002')` 确实改了数组,但 `setItems(items)` 传回**同一个引用**——useState 的 eager bailout(Object.is 相同)直接跳过重渲染,界面停在旧数据。

**根因**:React 靠**引用变化**感知状态变化;原地修改 = 偷偷改了内容却没换引用。这与阶段 1 c06 手写 store 的第三幕、c00 的 COW 是同一条铁律。

**最小修复**:`setItems([...items, 'A-002'])`——生成新数组。永远不要原地改 state,要"造新版本"。

**后端对照**:把内部可变 List 直接改了还告诉调用方"没变"——防御性拷贝的缺失。

**变体思考**:`setItems(prev => [...prev, 'A-002'])` 函数式更新比直接引用 items 好在哪?(不依赖渲染帧的闭包快照——门诊 4 号的预防针。)

---

## 门诊 4 · bug4_stale_closure.tsx

**症状复盘**:effect(依赖 [])只在挂载帧注册,回调捕获的是**那一帧的 state 值 0**;后续 state 到 2,回调里的 captured 依旧是 0——stale closure。

**根因**:effect 的闭包捕获了"当次渲染的快照";依赖 [] 意味着"永不更新快照"。与阶段 1 c04 的"收窄/闭包不跨时间边界"同源:跨时间边界读快照,系统不担保。

**最小修复**(真实 React):函数式更新 `setState(c => c + 1)`——不依赖捕获的旧值;或把 state 加进依赖数组重新注册。

**后端对照**:线程池任务捕获了过期配置快照——要么传参(函数式),要么重注册(依赖刷新)。

**变体思考**:为什么 `setCount(count + 1)` 连点三次只加 1,而 `setCount(c => c + 1)` 连点三次加 3?(三次点击共用同一帧的 count 快照;函数式永远基于最新值。)

---

## 门诊 5 · bug5_conditional_hook.tsx

**症状复盘**:第一帧只调了 1 个 Hook;第二帧调了 2 个——Hook 数量与上次不一致,你的顺序守卫当场抛"⛔ Hooks 顺序错乱"。**守卫是对的,写法是错的。**

**根因**:Hook 槽位按调用顺序寻址;条件调用让"槽位表"在两帧之间对不上——机制层的必然,不是实现缺陷。这正是官方"Rules of Hooks"的由来。

**最小修复**:把 Hook 提到条件外,条件只影响派生值:

```tsx
function OrderFilter({ onlyPaid }: { onlyPaid: boolean }) {
  const [rows] = useState<string[]>(['A-001', 'B-002']);
  const paidRows = onlyPaid ? rows.filter(r => isPaid(r)) : rows;
  return h('div', null, `${onlyPaid ? '已支付' : '全部'}:${paidRows.length} 行`);
}
```

**后端对照**:事务里"条件性地改变 SQL 语句的参数个数"必然出绑定错位——参数表必须形状稳定,Hook 表同理。

**变体思考**:早期返回(early return)写在 Hook 调用之后,为什么合法?而写在之前就崩?(Hook 全部调用完才 return,槽位表完整;提前 return 截断了槽位表。)
