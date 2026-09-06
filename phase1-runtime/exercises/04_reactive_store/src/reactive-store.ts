/**
 * ⛔ 禁写区 · 响应式 store —— 从这副骨架开始,长出你自己的状态引擎
 *
 * 契约:下面的签名就是对拍脚本的契约,**签名别改,身体全是你的**。
 * 纪律:不看 Redux/Zustand 源码;卡壳 30 分钟才准用 ④ 卡(只要线索不要答案)。
 * 完成标志:pnpm lab:store 14 例全绿。
 *
 * 开工第一问(AI 助教会先问你):回调登记表放哪?状态怎么替换才能"不改旧账"?
 */
export type Updater<T> = T | ((prev: T) => T);
export type Listener<T> = (state: T) => void;
export type Unsubscribe = () => void;

export interface Store<T> {
  getState(): T;
  setState(next: Updater<T>): void;
  /** 全量订阅:每次 setState 都通知;返回退订函数 */
  subscribe(fn: Listener<T>): Unsubscribe;
  /** 选择器订阅:select(state) 的结果用 Object.is 比较,变化才通知 fn */
  watch<R>(select: (state: T) => R, fn: (value: R) => void): Unsubscribe;
}

export function createStore<T>(initial: T): Store<T> {
  // TODO(第 1 步):两个内部结构——"当前状态"槽 + "回调登记表"。
  //   想清楚:谁必须整体替换(不可变)?谁按登记顺序遍历?
  void initial;
  return {
    getState(): T {
      throw new Error('⛔ 禁写区:getState 由你实现');
    },
    setState(_next: Updater<T>): void {
      throw new Error('⛔ 禁写区:setState 由你实现');
    },
    subscribe(_fn: Listener<T>): Unsubscribe {
      throw new Error('⛔ 禁写区:subscribe 由你实现');
    },
    watch<R>(_select: (s: T) => R, _fn: (v: R) => void): Unsubscribe {
      throw new Error('⛔ 禁写区:watch 由你实现');
    },
  };
}
