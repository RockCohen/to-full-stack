/**
 * 🚑 门诊 1 号 · 症状:package.json 一字未改,CI 装出的依赖和同事电脑不一样,
 *              两边都能跑——直到某天一起跑就炸了
 *
 * 运行:pnpm lab phase4-engineering/tutor/bug_clinic/bug1_lockfile_drift.ts
 * 任务:指出这个"安装器"缺了什么,使得同一份 package.json 在周一和周五解析出不同版本。
 *       给出最小修复(提示:和 semver 无关,semver 只是提供了漂移的空间)。
 */

// 模拟 registry:某依赖在两周内发了三个"兼容"版本(1.5.0 悄悄改了行为)
const REGISTRY: Record<string, string[]> = {
  'left-pad-pro': ['1.4.2', '1.4.9', '1.5.0'],
};
const PUBLISHED_AT: Record<string, number> = { '1.4.2': 1, '1.4.9': 3, '1.5.0': 10 }; // 第 N 天发布

const packageJson = { dependencies: { 'left-pad-pro': '^1.4.2' } };
let lockfile: Record<string, string> | null = null; // ← 大概率病灶在附近:它一直没被用起来

function install(day: number): string {
  const spec = packageJson.dependencies['left-pad-pro'];
  const candidates = REGISTRY['left-pad-pro'].filter((v) => satisfiesCaret(v, spec, day));
  const resolved = candidates[candidates.length - 1]; // 取满足条件的最新版
  console.log(`第 ${day} 天 install → left-pad-pro@${resolved}`);
  return resolved;
}

function satisfiesCaret(v: string, spec: string, day: number): boolean {
  const base = spec.slice(1); // '^1.4.2' → '1.4.2'
  const sameMajor = v.split('.')[0] === base.split('.')[0];
  const notOlder = v >= base;
  const notFuture = PUBLISHED_AT[v] <= day; // 安装日还没发布的版本不存在
  return sameMajor && notOlder && notFuture;
}

install(1); // 同事周一装的
install(10); // CI 周五装的(1.5.0 已发布)

console.log('\n两次 install 结果一致吗?如果 CI 的 1.5.0 把 padLeft 的参数顺序改了,谁的锅?');
console.log('(修复它只需要让 install() 多问一个东西——工程里它已经存在于你的仓库,只是没被遵守。)');
