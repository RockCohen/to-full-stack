# S17 实验卡 · 渲染与虚拟 DOM:脏页最小回写

> 代码贴进 `phase2-react/exercises/02_render_diff/playground.tsx`,`pnpm lab` 运行。
> 本卡只做"新旧两棵树"的**人工 diff 预演**——真正的 diff 你要在 S18~S20 亲手实现。

## E1 · vdom 长什么样:把 JSX 打印出来

```tsx
const vnode = (
  <table>
    <tbody>
      <tr><td>A-001</td></tr>
    </tbody>
  </table>
);
console.log(JSON.stringify(vnode, null, 2));
```

❓vnode 就是普通 JS 对象(类型/属性/孩子)。"虚拟"二字的意思:它还不是 DOM,是**界面 SHOULD 快照**。≈ WAL 里的待写页。

## E2 · 人工 diff 第一题:类型相同 → 更新

旧:`<td>A-001</td>` 新:`<td>A-001(改价)</td>`

❓最优操作是?(答案:同一位置同类型 → **更新文本**,不拆不建。)

## E3 · 人工 diff 第二题:类型不同 → 拆了重建

旧:`<td>A-001</td>` 新:`<span>A-001</span>`

❓为什么不能"把 td 改名成 span"?(DOM 的标签名不可变;类型不同意味着子树结构假设全变——重建成本反而低。)**这条规则是你 mini-React diff 的第一个分支。**

## E4 · 人工 diff 第三题:列表增删 → key 的意义

```tsx
// 旧列表(v1)          // 新列表(v2)
[                       [
  <li key="A">甲</li>,    <li key="C">丙</li>,
  <li key="B">乙</li>,    <li key="A">甲</li>,
]                       ]
```

❓用 key 对齐:A 移到了第 2 位,C 是新增,B 被删除。**如果没有 key,按位置配对会发生什么?**(位置 0:甲→丙 更新文本;位置 1:乙→甲 更新文本;再 append 丙——明明只是"插入一行",却更新了两行。 key 就是主键:身份稳定的行才能"移动"而不是"改写"。)

## E5 · 综合题:diff 最小化的价值

真实 DOM 更新一次 ≈ 触发样式计算/布局。假设 1000 行的表格只改了 1 行:

❓"全量重建 DOM" vs "diff 后最小更新",各动多少节点?——这就是"vdom＝脏页最小回写"的量化含义;也是 c00"COW"在界面层的落地。
