/**
 * ⛔ 禁写区 · MyPromise —— 从这副骨架开始,长出你自己的 Promise
 *
 * 契约:下面的方法签名就是对拍脚本的契约,**签名别改,身体全是你的**。
 * 纪律:不看原生 Promise 源码;卡壳 30 分钟才准用 ④ 卡(只要线索不要答案)。
 * 完成标志:pnpm lab:promise 21 例全绿。
 *
 * 开工第一问(AI 助教会先问你,你也可以先自问):
 *   你的内部状态存什么?什么时候变?变完之后,欠谁一个通知?
 */
export type ResolveFn<T> = (value: T | MyPromise<T> | PromiseLike<T>) => void;
export type RejectFn = (reason?: unknown) => void;
export type Executor<T> = (resolve: ResolveFn<T>, reject: RejectFn) => void;

type OnFulfilled<T, R> = ((value: T) => R | PromiseLike<R>) | undefined | null;
type OnRejected<R> = ((reason: unknown) => R | PromiseLike<R>) | undefined | null;

export class MyPromise<T> {
  // TODO(第 1 步):你的状态机字段 —— 存什么、何时变?

  constructor(executor: Executor<T>) {
    // TODO(第 2 步):立即同步执行;executor 抛错 = reject
    void executor;
    throw new Error('⛔ 禁写区:构造函数由你实现');
  }

  then<R1 = T, R2 = never>(
    onFulfilled?: OnFulfilled<T, R1>,
    onRejected?: OnRejected<R2>,
  ): MyPromise<R1 | R2> {
    // TODO(第 3~5 步):异步保证 → 链式 → 平化 → 错误传播与修复
    void onFulfilled;
    void onRejected;
    throw new Error('⛔ 禁写区:then 由你实现');
  }

  catch<R = never>(onRejected: (reason: unknown) => R | PromiseLike<R>): MyPromise<T | R> {
    // TODO:一颗语法糖 —— 想想它等价于怎样的 then?
    void onRejected;
    throw new Error('⛔ 禁写区:catch 由你实现');
  }

  static resolve<V>(value: V | MyPromise<V> | PromiseLike<V>): MyPromise<V> {
    // TODO
    void value;
    throw new Error('⛔ 禁写区:resolve 由你实现');
  }

  static reject(reason?: unknown): MyPromise<never> {
    // TODO
    void reason;
    throw new Error('⛔ 禁写区:reject 由你实现');
  }

  static all<V>(values: Array<MyPromise<V> | V>): MyPromise<V[]> {
    // TODO(第 6 步):保序 + 一败俱败。想想 CountDownLatch 怎么写的
    void values;
    throw new Error('⛔ 禁写区:all 由你实现');
  }

  static race<V>(values: Array<MyPromise<V> | V>): MyPromise<V> {
    // TODO(第 6 步):先 settle 者赢
    void values;
    throw new Error('⛔ 禁写区:race 由你实现');
  }
}
