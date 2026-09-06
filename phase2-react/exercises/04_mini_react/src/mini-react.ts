/**
 * ⛔ 旗舰禁写区 · mini-React —— 从这副骨架开始,长出你自己的 React
 *
 * 契约:下面的签名就是对拍脚本的契约,**签名别改,身体全是你的**。
 * DOM 白名单(只能用这些,测试的 fake-DOM 只实现它们):
 *   document.createElement(tag) / document.createTextNode(text)
 *   el.appendChild(c) / el.insertBefore(c, ref) / el.removeChild(c) / el.replaceChild(c, old)
 *   el.setAttribute(k, v) / el.removeAttribute(k) / 文本节点.textContent 赋值
 * 纪律:毕业前禁看 Didact 等任何 mini-react 教程;卡壳 30 分钟才准用 ④ 卡。
 * 完成标志:pnpm lab:react 16 例全绿。
 *
 * 开工第一问(AI 助教会先问你):vdom 节点上要存哪些信息,才够 diff 用?
 */
export const TEXT = '__TEXT';   // 文本节点的约定类型(文本不是标签,给它一个特殊标记)

export interface VNode {
  type: any;                     // 标签名(string) | 组件函数 | TEXT
  props: Record<string, any>;    // 属性 + children(VNode[])
}

export function createElement(
  type: any,
  props?: Record<string, any> | null,
  ...children: any[]
): VNode {
  // TODO(S16):归一化 children —— 文本变 TEXT 节点、数组要摊平、null/布尔丢弃
  void type;
  void props;
  void children;
  throw new Error('⛔ 禁写区:createElement 由你实现');
}

export function render(vnode: VNode, container: any): void {
  // TODO(S18):首次挂载;再次调用同一 container 则走 diff。
  //   提示:把"根实例"挂在 container 上(__rootInst),换容器互不干扰。
  void vnode;
  void container;
  throw new Error('⛔ 禁写区:render 由你实现');
}

export function useState<T>(initial: T): [T, (next: T | ((p: T) => T)) => void] {
  // TODO(S20):按调用顺序在当前组件的槽位链表上取/建槽;setState 安排整体重渲染。
  //   同引用跳过重渲染(React 的 eager bailout)。
  void initial;
  throw new Error('⛔ 禁写区:useState 由你实现');
}

export function useEffect(fn: () => void | (() => void), deps?: unknown[]): void {
  // TODO(S20):deps 变化 → 先执行旧清理、再执行新 effect;提交后执行(渲染仍纯)。
  void fn;
  void deps;
  throw new Error('⛔ 禁写区:useEffect 由你实现');
}
