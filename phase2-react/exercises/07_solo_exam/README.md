# S24 · 脱稿验收 · OrderBoard(订单看板)

> 规则:**不查任何材料**,1 小时,从空文件完成。写完不等于结束——AI 考官还有 3 道现场附加题。

## 题面

在本目录创建 `OrderBoard.tsx`,用官方 React 实现(export 组件,renderToString 可渲染):

```tsx
// OrderBoard({ orders }: { orders: Order[] }) —— Order = { id, buyer, total, paid }
// 1. 顶部:过滤输入框(按买家名筛选)——输入框是受控组件(value + onChange)
// 2. 中部:订单列表(id / 买家 / 金额),列表项必须有稳定的 key
// 3. 底部:合计(当前筛选结果的订单数与总金额)
// 数据从 props 进入;组件内部唯一的 state 是过滤文本。
```

## 自测(写完后必须演示)

```tsx
// renderToString 三连:
// ① 无过滤:全量列表 + 全部合计
// ② 有过滤:只剩匹配行,合计随之变化
// ③ 过滤无结果:空列表 + "0 单 / 0 元"(不许 NaN)
```

## 通过线

1. 三种渲染输出全部正确;列表 key 稳定(不是 index);
2. 能向考官讲清:每次敲键盘发生了什么(state 变 → 重渲染 → vdom diff → 最小 DOM 更新);
3. 附加题 ≥2/3(历史题型:加排序切换;金额格式化抽成纯函数;解释为什么输入框必须受控;说清你的 key 为什么稳定)。

## 毕业三件事

1. 回顾 [`tutor/misconceptions.md`](../../tutor/misconceptions.md),把全部复习题拼成一次自测;
2. 情式笔记收尾,commit;
3. `git tag phase2-graduate` 🎓
