#!/usr/bin/env node
// 环境自检:node / pnpm / git / 依赖 / TS 工具链 / 事件循环健全性
// 用法: pnpm verify
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let failed = 0;

function check(name, ok, hint = '') {
  console.log(`${ok ? '✅' : '❌'} ${name}${ok || !hint ? '' : ' —— ' + hint}`);
  if (!ok) failed++;
}

// 1. Node 版本
const major = Number(process.versions.node.split('.')[0]);
check(`Node ≥ 20(当前 ${process.versions.node})`, major >= 20, '用 nvm 装 LTS:nvm install --lts');

// 2. pnpm
const pnpm = spawnSync('pnpm', ['--version'], { encoding: 'utf8' });
check(
  `pnpm 可用${pnpm.status === 0 ? `(v${pnpm.stdout.trim()})` : ''}`,
  pnpm.status === 0,
  'npm i -g pnpm,或 corepack enable',
);

// 3. git
const git = spawnSync('git', ['--version'], { encoding: 'utf8' });
check('git 可用', git.status === 0, 'xcode-select --install 或 brew install git');

// 4~6. 依赖与运行链路(装完依赖才有意义)
const hasDeps = existsSync(path.join(root, 'node_modules'));
check('依赖已安装(node_modules)', hasDeps, '先在仓库根目录跑 pnpm install');

if (hasDeps) {
  const smoke = spawnSync('pnpm', ['exec', 'tsx', 'scripts/smoke.ts'], { cwd: root, encoding: 'utf8' });
  check(
    'TS 运行链路(tsx)正常',
    smoke.status === 0 && smoke.stdout.includes('smoke-ok'),
    (smoke.stderr || smoke.stdout).trim().split('\n').slice(-3).join(' / '),
  );

  const el = spawnSync(
    process.execPath,
    [
      '-e',
      `const out=[];out.push('1');setTimeout(()=>out.push('2'),0);` +
        `Promise.resolve().then(()=>out.push('3'));out.push('4');` +
        `setTimeout(()=>console.log(out.join(',')),10);`,
    ],
    { encoding: 'utf8' },
  );
  check('事件循环时序健全(期望 1,4,3,2)', el.stdout.trim() === '1,4,3,2', `实际 ${el.stdout.trim()}`);
}

console.log(
  failed === 0
    ? '\n🎒 装备齐全。打开 phase0-ts-async/AI助学手册.md,S1 开工!'
    : `\n⚠️ 有 ${failed} 项未过,修复后重跑 pnpm verify`,
);
process.exit(failed === 0 ? 0 : 1);
