# S23 实验卡 · 副作用与 useEffect 深挖

> 本卡实验使用**你自己的 mini-React**(S20 产物):effect 在提交后同步执行,行为与官方一致但时序更直观。
> 代码落点:`phase2-react/exercises/06_useeffect_lab/playground.tsx`(或本目录 lab),运行:`pnpm lab <文件>`。

## E1 · 挂载后执行:组件的 @PostConstruct

```tsx
const log: string[] = [];
function OrderPage() {
  useEffect(() => { log.push('已挂载:可以发请求了'); }, []);
  return <div>订单页</div>;
}
render(OrderPage);  // 你的 mini-react:渲染 + 提交 + effect
console.log(log);
```

❓log 里有几条?——依赖数组为 `[]`:只在挂载后跑一次。渲染仍是纯的;副作用在**提交后**才发生(读写分离)。

## E2 · 清理函数:组件的 @PreDestroy

```tsx
const log: string[] = [];
function Timer({ id }: { id: string }) {
  useEffect(() => {
    log.push(`启动定时器 ${id}`);
    return () => log.push(`清理定时器 ${id}`);   // 返回的函数 = @PreDestroy
  }, [id]);
  return <div>{id}</div>;
}
render(Timer with id='A');   // 挂载:启动 A
render(Timer with id='B');   // id 变了:先清理 A,再启动 B
console.log(log);
```

❓顺序是?——"启动 A → 清理 A → 启动 B"。**清理函数在下一次 effect 之前、以及卸载时执行**≈ finally 挂在生命周期上。

## E3 · 依赖数组就是缓存 key

```tsx
const log: string[] = [];
function Report({ filter }: { filter: string }) {
  useEffect(() => { log.push(`按 ${filter} 重新拉取报表`); }, [filter]);
  return <div>{filter}</div>;
}
render(Report filter='今天');
render(Report filter='今天');   // filter 没变
render(Report filter='本周');   // filter 变了
console.log(log);
```

❓拉取了几次?——依赖数组 ＝ 缓存 key:数组里每个元素参与比较,**漏写一个就是读了旧缓存**(stale closure,门诊 4 号);不写数组＝每次渲染都拉(门诊 2 号的风暴)。

## E4 · 综合题:轮询的完整生命周期

```tsx
function OrderPolling({ orderId }: { orderId: string }) {
  useEffect(() => {
    const timer = setInterval(() => log.push(`轮询 ${orderId}`), 1000);
    return () => { clearInterval(timer); log.push(`停止轮询 ${orderId}`); };
  }, [orderId]);
  return <div>{orderId}</div>;
}
// 场景:A 轮询 3 秒 → 切到 B → 又 3 秒 → 卸载
console.log(log);
```

❓写出完整 log 序列,确认没有一条"A 的轮询"在切换后还活着。——**这就是门诊 2 号(监听器泄漏)的 React 标准解法:清理函数把"资源的 close"做成生命周期的一部分。**
