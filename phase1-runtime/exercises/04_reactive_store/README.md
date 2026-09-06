# ⛔ 禁写区 · 手写响应式 store(本仓库的 micrograd 时刻之二)

> AI 只提问不给代码;写完接受对拍与答辩。
> **这是 React 状态管理的雏形——S12/S13 两天,顶得上网上一周的"React 入门"**。

## 目标

从本目录的 `src/reactive-store.ts`(现为一副骨架)出发,实现 `createStore`:

```ts
interface OrderState { items: string[]; total: number }

const store = createStore<OrderState>({ items: [], total: 0 });

store.getState();                       // 当前状态(引用不可被原地改)
store.setState({ total: 99 });          // 整体替换(对象 = 全量覆盖)
store.setState(prev => ({ ...prev, total: prev.total + 1 }));  // 或基于旧状态计算
const off = store.subscribe(state => console.log(state));     // 全量订阅
off();                                  // 退订:之后不再通知
store.watch(s => s.total, n => console.log(n));               // 选择器订阅:结果变化才通知
```

**方法签名就是契约,不许改签名。**语义细节以对拍脚本 14 例为准(它们就是需求文档)。

## 三条纪律(llm-journey 同款)

1. 不看 Redux/Zustand 源码;卡概念 → ④ 卡要线索(L1→L2→L3);
2. 脚手架归 AI,核心归你:登记表放哪、状态怎么替换、通知怎么发,全是你的事;
3. 每修绿一例就 commit。

## 推荐路线(S12 走 1~3,S13 走 4~6)

1. **内部结构**:一张"回调登记表"＋一个"当前状态"的槽——两个变量,一个状态机。先回答:订阅函数存哪?状态存哪?
2. **getState/setState**:setState 接收"新状态"或"基于旧状态算新状态的函数";**关键约束:绝不原地修改旧状态**——整体替换(这一步就是 c00 讲的 Copy-on-Write)。
3. **subscribe**:登记进表,返回退订函数;setState 时逐个通知。做完跑对拍,01~07 应该绿。
4. **不可变检验**:对拍会锁定"旧引用的值不被改动"——如果你写了 `state.x = ...` 这种原地修改,立刻会红。
5. **watch 选择器**:对 select 的结果做 `Object.is` 比较,变了才通知——想想"为什么全量通知会让下游浪费"。
6. **打磨**:同一函数重复订阅、watch 多路独立、通知顺序与登记顺序一致。

## 完成标志

```bash
pnpm lab:store    # 14 例全绿 → S13 达成,用 ⑤ 卡答辩,去 S14
```
