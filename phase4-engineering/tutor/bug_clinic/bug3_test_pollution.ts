/**
 * 🚑 门诊 3 号 · 症状:两个测试,单独跑各自全绿,一起跑必红——而且谁先跑谁绿
 *
 * 运行:pnpm lab phase4-engineering/tutor/bug_clinic/bug3_test_pollution.ts
 * 任务:这是"测试运行器"的最小复现:依次执行两个"测试文件"。指出病灶,
 *       给出测试写法的最小修复,并说出这套机制在 Vitest/JUnit 里的学名。
 */

// ── 被测模块:一个模块级的"单例"计数器(全局状态) ──
const auditLog: string[] = [];
export function audit(event: string): number {
  auditLog.push(event);
  return auditLog.length;
}

// ── 两个"测试文件",各自都可以单独运行(单独跑时全绿) ──
function expectEq(actual: unknown, expected: unknown, msg: string): void {
  if (actual !== expected) throw new Error(`${msg}(实际 ${actual} ≠ 期望 ${expected})`);
}

function testFileA(): void {
  auditLog.length = 0; // 有人记得清场……
  audit('order-created');
  expectEq(audit('order-paid'), 2, 'A: 第二条事件应该是第 2 条');
  console.log('testFileA ✅');
}

function testFileB(): void {
  // 病灶大概率在附近:它假定"世界是新的"——同一进程里跑,A 刚写过账本
  audit('refund-created');
  expectEq(auditLog.length, 1, 'B: 应该只有 1 条');
  console.log('testFileB ✅');
}

// ── 测试运行器:同一进程内依次执行(现在就是这样) ──
console.log('— 一起跑(真实 CI 的顺序)—');
try {
  testFileA();
  testFileB();
} catch (e) {
  console.log(`❌ 一起跑翻车:${(e as Error).message}`);
}

console.log('\n问:修复它有三个层次——① B 补清场;② 运行器给每个文件新进程/新模块注册表;');
console.log('③ 干脆禁止模块级可变状态。Vitest 与 JUnit 各默认做了哪一层?(JUnit 的 @BeforeEach 呢?)');
