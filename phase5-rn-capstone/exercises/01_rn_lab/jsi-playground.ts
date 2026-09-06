/**
 * S36 练习 · JSI 消息管线模拟 —— 两世界一通道(纯 TS,不需要手机)
 * 运行:pnpm lab phase5-rn-capstone/exercises/01_rn_lab/jsi-playground.ts
 *
 * 纪律:每题先写预测(注释里),再运行对照。
 */

// ════════════ E1 · 过桥安检:哪些值能跨语言边界 ════════════
// 预测:函数 / Symbol / 数组里的 undefined / 循环引用,各自的下场?

function bridgeSerialize(v: unknown): unknown {
  // 模拟旧 Bridge:JSON.stringify 序列化后过桥,对端 parse 回来
  const seen = new Set<object>();
  return JSON.parse(JSON.stringify(v, (_k, val) => {
    if (typeof val === 'object' && val !== null) {
      if (seen.has(val)) return '[Circular]'; // 循环引用:原生 stringify 直接抛 TypeError,这里降级成占位符
      seen.add(val);
    }
    return val;
  }));
}

{
  const payload = {
    ok: 42,
    name: '订单 A-001',
    callback: () => console.log('我过不去'),
    tag: Symbol('job'),
    list: [1, undefined, 'x'],
  };
  const arrived = bridgeSerialize(payload) as Record<string, unknown>;
  console.log('E1 到岸:', JSON.stringify(arrived));
  console.log('E1 callback =', arrived.callback, ' tag =', String(arrived.tag), ' list =', JSON.stringify(arrived.list));
}
// ❓静默丢失 vs 报错:哪种更危险?这就是门诊 3 号的根源。

// ════════════ E2 · 旧 Bridge vs JSI:一次调用的两种命运 ════════════
// 预测:① 旧 Bridge 是同步还是异步?1000 条订单过桥要付什么代价?
//       ② JSI 直接引用调用,还需要序列化吗?

type Order = { id: string; total: number; paid: boolean };
const NATIVE_HEAP: Order[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `A-${String(i + 1).padStart(4, '0')}`,
  total: 9900 + i,
  paid: i % 2 === 0,
}));

// 旧 Bridge:原生侧把数据序列化成 JSON 文本,异步投递,JS 侧 parse 回来
const oldBridge = {
  calls: 0,
  async getOrders(): Promise<Order[]> {
    this.calls++;
    const wire = JSON.stringify(NATIVE_HEAP); // 序列化税:时间 + 内存双份副本
    await new Promise((r) => setTimeout(r, 5)); // 异步投递
    return JSON.parse(wire);
  },
};

// JSI:JS 持有原生对象的直接引用,同步调用,零序列化
const jsiDirect = {
  calls: 0,
  getOrders(): Order[] {
    this.calls++;
    return NATIVE_HEAP.slice(); // 直接读原生堆,按引用返回
  },
};

{
  const t0 = performance.now();
  const a = await oldBridge.getOrders();
  const t1 = performance.now();
  const b = jsiDirect.getOrders();
  const t2 = performance.now();
  console.log(`\nE2 旧 Bridge:${a.length} 条,${(t1 - t0).toFixed(1)}ms(含序列化+异步投递)`);
  console.log(`E2 JSI 直调:${b.length} 条,${(t2 - t1).toFixed(1)}ms(零序列化)`);
}
// ❓JSI 是"免费午餐"吗?直接引用意味着两边的生命周期管理要怎么办
//   (原生对象被 JS 引用着,谁来释放?)——和 JNI 的 LocalRef/GlobalRef 对照。

// ════════════ E3 · 线程模型:谁阻塞谁 ════════════
// 预测:JS 线程跑 200ms 死循环,原生 UI 动画会停吗?按钮回调会怎样?

{
  let uiFrames = 0;
  const uiThread = setInterval(() => uiFrames++, 16); // 模拟原生 UI 主线程(独立线程)

  const t0 = performance.now();
  while (performance.now() - t0 < 200) {
    /* JS 线程重计算:死循环 */
  }
  const blocked = performance.now() - t0;

  setTimeout(() => {
    console.log(`\nE3 JS 线程阻塞了 ${blocked.toFixed(0)}ms;同期原生 UI 线程跑了 ${uiFrames} 帧`);
    console.log('E3 结论:UI 没死(动画照跑),但 JS 的按钮回调会排队——阻塞的是"响应",不是"画面"。');
    clearInterval(uiThread);
  }, 250);
}
// ❓对照:往 Netty 的 EventLoop 塞阻塞任务——管道没死,响应停摆。解法同源:拆片让出或下沉。

setTimeout(() => process.exit(0), 300);

export {}; // 让 tsc 把本文件当模块(顶层 await 需要)
