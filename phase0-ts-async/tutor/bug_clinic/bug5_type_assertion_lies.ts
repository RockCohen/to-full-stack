/**
 * 🚑 门诊 5 号 · 症状:host 明明有值,port 却是 undefined,连接悄悄失败
 *
 * 运行:pnpm lab phase0-ts-async/tutor/bug_clinic/bug5_type_assertion_lies.ts
 * 任务:类型全对、编译全绿,为什么 port 是 undefined?给出"运行时也靠得住"的修法。
 */

interface DbConfig {
  host: string;
  port: number;
}

function loadConfig(): unknown {
  // 模拟:配置中心存的是旧版结构,根本没有 port 字段
  return JSON.parse('{"host":"db.prod.internal"}');
}

function connect(cfg: DbConfig): string {
  return `connect(${cfg.host}:${cfg.port})`;
}

const raw = loadConfig() as DbConfig; // ← 病灶大概率在这附近
console.log('加载配置成功:', raw.host);
console.log(connect(raw));
