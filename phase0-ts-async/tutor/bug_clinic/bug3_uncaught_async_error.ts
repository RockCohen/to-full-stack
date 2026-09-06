/**
 * 🚑 门诊 3 号 · 症状:先打印"启动成功",随后进程崩溃;try/catch 形同虚设
 *
 * 运行:pnpm lab phase0-ts-async/tutor/bug_clinic/bug3_uncaught_async_error.ts
 * 任务:解释为什么 catch 什么都没接到,再给出最小修复。
 */

async function loadConfig(): Promise<never> {
  throw new Error('配置中心连不上');
}

function bootstrap(): void {
  try {
    loadConfig(); // ← 病灶大概率在这附近
    console.log('启动成功');
  } catch (e) {
    console.log('启动失败,已降级:', (e as Error).message);
  }
}

bootstrap();
