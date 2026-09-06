/**
 * 🚑 门诊 2 号 · 症状:只 import 了一个小函数,产物里却有整个模块——连它的启动副作用都在
 *
 * 运行:pnpm lab phase4-engineering/tutor/bug_clinic/bug2_side_effect_bundle.ts
 * 任务:这是一个 20 行的"迷你 bundler"。解释它为什么不敢摇掉 analytics 模块的其余部分,
 *       然后回答:要让它敢摇,谁必须站出来担保?担保写在哪个文件/字段里?
 */

type Module = { name: string; imports: string[]; sideEffect?: boolean };

// 依赖图:entry 只用了 analytics 的 trackEvent 一个函数
const GRAPH: Module[] = [
  { name: 'entry', imports: ['analytics'] },
  { name: 'analytics', imports: [], sideEffect: true },
];

// analytics 的内容:10 个导出函数 + 1 段模块级副作用
const analyticsExports = [
  'trackEvent', 'trackPage', 'identifyUser', 'flushQueue', 'setEndpoint',
  'batchEvents', 'compressPayload', 'retryPolicy', 'debugTrace', 'dumpState',
];
const analyticsSideEffect = 'window.__analytics = { bootAt: Date.now() }; // 模块级副作用';

// ── 迷你 bundler:从 entry 出发收集可达模块 ──
function bundle(): string[] {
  const output: string[] = [];
  const visited = new Set<string>();
  function walk(mod: Module): void {
    if (visited.has(mod.name)) return;
    visited.add(mod.name);
    // 关键判断:有副作用的模块,整体保留(不敢摇)——为什么?默认立场是什么?
    output.push(`/* module: ${mod.name} (${mod.sideEffect ? 'side-effectful, 全保留' : 'pure, 可摇'}) */`);
    if (mod.name === 'analytics') {
      output.push(`  ${analyticsSideEffect}`);
      analyticsExports.forEach((fn) => output.push(`  function ${fn}() { … }`));
    }
    mod.imports.forEach((dep) => walk(GRAPH.find((m) => m.name === dep)!));
  }
  walk(GRAPH[0]);
  return output;
}

const product = bundle();
console.log(product.join('\n'));
console.log(`\n产物里躺了 ${analyticsExports.length} 个函数,entry 只用了 1 个(trackEvent)。`);
console.log('问题:bundler 是"不敢"还是"不能"摇?让它敢摇的那个担保,该由谁写、写在哪?');
