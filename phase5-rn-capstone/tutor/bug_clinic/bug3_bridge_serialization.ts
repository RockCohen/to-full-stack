/**
 * 🚑 门诊 3 号 · 症状:传给原生模块的回调"凭空消失",配置对象过了一趟桥就缺斤少两
 *
 * 运行:pnpm lab phase5-rn-capstone/tutor/bug_clinic/bug3_bridge_serialization.ts
 * 任务:这是旧 Bridge 的序列化安检实现。指出哪两行是病灶根源,
 *       然后回答:同样的调用走 JSI,为什么会得到不同结果?安检是白设计了吗?
 */

// 原生模块期待收到的配置(按原生侧的类型契约)
type NativeConfig = {
  endpoint: string;
  retries: number;
  onProgress?: (pct: number) => void;
  tag: symbol;
};

// JS 侧实际要传的对象:什么都塞了
const config: NativeConfig = {
  endpoint: 'https://api.tour.example.com',
  retries: 3,
  onProgress: (pct) => console.log(`进度 ${pct}%`),
  tag: Symbol('upload-job'),
};

// ── 旧 Bridge 的"过桥安检":JSON 序列化 ──
function acrossTheBridge(value: unknown): unknown {
  // 大概率病灶在附近:这一行的规则是什么?它怎么处理函数/undefined/Symbol?
  return JSON.parse(JSON.stringify(value, (key, v) => {
    if (typeof v === 'symbol') return undefined; // Symbol:JSON 不认识
    return v;
  }));
}

const received = acrossTheBridge(config) as Partial<NativeConfig>;
console.log('原生模块收到:endpoint =', received.endpoint);
console.log('原生模块收到:retries =', received.retries);
console.log('原生模块收到:onProgress =', received.onProgress, '(我们明明传了回调!)');
console.log('原生模块收到:tag =', String(received.tag));
console.log('\n问:回调为什么"静默丢失"而不是报错?这种丢失模式在生产里多难查?');
console.log('追问:JSI 的直接引用为什么没有这个问题?那它把哪部分代价转移到了哪边?');
