# S38 实验卡 · 组件与导航:换了宿主的 React

> 优先在 Expo 里做(S37 的项目继续用);没带手机时,预测题全部可以在纸上完成,
> 用"翻译表"逐条对照你 phase2 的 mini-React 知识。

## E1 · 三件套翻译(View/Text/StyleSheet)

把这段 Web JSX 心理翻译成 RN(先写再查官方文档对照):

```tsx
<div className="card" onClick={open}>
  <span className="title">{order.id}</span>
  <input value={q} onChange={e => setQ(e.target.value)} />
</div>
```

- 预测:哪一处**不翻译就会直接报错**?(提示:裸文本)哪一处默认方向和 Web 相反?(flexbox)
- ❓RN 的样式 = CSS 子集:无级联、无继承、全 flexbox、`StyleSheet.create`(≈ 编译期校验的类型化样式)。**Web 惯出来的"裸文本随手写",在 RN 是运行时错误**——宿主换了,纪律就换了。

## E2 · FlatList:分页查询的心智

同一个 1000 行订单列表:`orders.map(o => <Row key={o.id}/>)` vs `<FlatList/>`:

- 预测:首屏渲染成本差多少量级?滚到底部时 FlatList 靠什么控制内存?
- ❓FlatList = **窗口化 + 行回收**:只渲染视口附近的行,≈ MyBatis 分页 + 连接池化。`keyExtractor` 就是主键——用 index 的后果与 phase2 门诊 1 号同源:**身份按位置漂移,行内状态串位**。`onEndReached` = 触底分页,`getItemLayout` ≈ 固定行高的"免测量索引"。

## E3 · 导航栈:离开 ≠ 销毁

React Navigation:列表页 → 详情页 → 返回。

- 预测:从列表页 A push 到 B 再返回,A 的组件卸载了吗?A 里的 `setInterval` 呢?
- ❓导航是**栈**(≈ Activity 栈):出栈才卸载,入栈压栈的只是"盖在上面"。所以 RN 的清理纪律比 Web 严格一档:**`useEffect` 清理函数是唯一可靠的"离开钩子"**(门诊 2 号:导航泄漏)。
- 动手(Expo):给 A 挂一个每秒 `console.log` 的 interval,进 B、返回,看日志——不清理的它一直在喊。

## 收尾追问

1. RN 样式与 CSS 的三大缺失(级联/继承/非 flex 布局)各带来什么工程后果?
2. 什么时候该用 map 而不是 FlatList?(提示:短列表的窗口化是纯开销)
3. "离开屏幕的生命周期"在 Web 里有对应物吗?(提示:bfcache/页面隐藏——但 RN 把它变成了常态)
