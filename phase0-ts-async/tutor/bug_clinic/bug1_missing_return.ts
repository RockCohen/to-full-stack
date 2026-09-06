/**
 * 🚑 门诊 1 号 · 症状:支付流程报错,可扣款函数明明执行了
 *
 * 运行:pnpm lab phase0-ts-async/tutor/bug_clinic/bug1_missing_return.ts
 * 任务:跑 → 观察症状 → 写下诊断假设 → 改最小的一处验证。
 */

interface Account {
  balance: number;
}

// 模拟后端两个接口
function fetchAccount(): Promise<Account> {
  return Promise.resolve({ balance: 100 });
}

function charge(acc: Account, amount: number): Promise<Account> {
  return Promise.resolve({ balance: acc.balance - amount });
}

async function pay(): Promise<number> {
  return (
    fetchAccount()
      .then((acc) => {
        charge(acc, 30); // ← 病灶大概率在这附近
      })
      // @ts-expect-error 门诊文件故意带病:paid 的类型在此刻并不是你以为的 Account
      .then((paid) => paid.balance)
  );
}

pay()
  .then((balance) => console.log('支付完成,余额:', balance))
  .catch((e) => console.log('支付炸了:', (e as Error).message));
