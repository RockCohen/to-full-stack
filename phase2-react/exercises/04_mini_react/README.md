# ⛔ 旗舰禁写区 · mini-React(全仓库的皇冠)

> AI 只提问不给代码;毕业前禁看 Didact 等一切 mini-react 教程。
> **这是你选题(Hooks＝内存管理)的终极落地:200 行,写完你就"见过神"了。**

## 目标

从本目录的 `src/mini-react.ts`(一副骨架)出发,实现 mini-React:

```tsx
const vnode = createElement('div', { id: 'root' }, createElement('b', null, 'A-001'));
render(vnode, container);          // 挂载
render(newVnode, container);       // 同容器再次调用 → diff 最小更新
// 函数组件 + useState(槽位) + useEffect(提交后执行 + 清理)
```

**方法签名就是契约,不许改签名。**语义细节以对拍脚本 16 例为准。

## DOM 白名单(测试的 fake-DOM 只实现这些)

`document.createElement(tag)`、`document.createTextNode(text)`、
`el.appendChild(c)`、`el.insertBefore(c, ref)`、`el.removeChild(c)`、`el.replaceChild(c, old)`、
`el.setAttribute(k, v)`、`el.removeAttribute(k)`、文本节点 `textContent` 赋值。
事件(onClick 等)不在本禁写区范围内;属性一律 setAttribute 处理(除 children/on*)。

## 三条纪律

1. 不看 Didact / build-your-own-react 等任何实现源码(毕业后再看);
2. 脚手架归 AI,核心归你:vdom 归一化、diff 的分支、Hook 槽位的寻址、effect 的时序;
3. 每修绿一例 commit 一次。

## 推荐路线(S18 走 1~3,S19 走 4~6,S20 走 7~9)

1. **vdom 结构**:createElement 归一化——文本→TEXT 节点、数组摊平、null/布尔丢弃。先答 AI 的问题:节点上要存哪些信息才够 diff?
2. **首次挂载**:instantiate(vnode) 递归建 DOM 树;根实例挂在 container 上(`__rootInst`),换容器互不干扰。
3. **diff 基础**:同位置同类型 → 复用节点更新文本/属性;TEXT 节点直接改 textContent。
4. **类型不同 → replaceChild 拆旧建新**(DOM 标签名不可变,这是物理限制);子节点增删 → appendChild/removeChild。
5. **函数组件**:调组件函数拿子 vnode,递归实例化/协调——组件的 dom 就是它孩子的 dom。
6. **props 更新**:新缺旧有 → removeAttribute;有变 → setAttribute。
7. **useState 槽位**:组件实例上有 hooks 数组＋hookIndex(每次渲染归零);按调用顺序取/建槽——**这就是"按序寻址"**;setState 生成新值后安排整体重渲染;同引用跳过(React 的 eager bailout)。
8. **顺序守卫**:重渲染时 Hook 数量与上次不一致 → 抛"⛔ Hooks 顺序错乱"——Rules of Hooks 的执法现场(对拍 13 例会考)。
9. **useEffect**:deps 变化才入队;执行顺序＝先全部旧清理、再全部新 effect;无 deps＝每次渲染都重跑。effect 在 DOM 提交后执行,渲染保持纯函数。

## 完成标志

```bash
pnpm lab:react    # 16 例全绿 → 用 ⑤ 卡答辩,然后 S21 用官方 React 对照
```

## 🌟 加餐(不测,但值得)

diff 目前按位置配对——给 children 加 **key 对齐**(按 key 复用/移动实例),然后用门诊 1 号(key 串位)验证:加 key 前"删首行串位",加 key 后精准复用。做完这一步,你对 diff 的理解超过多数面试者。
