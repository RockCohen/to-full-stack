/**
 * 🚑 门诊 5 号 · 症状:0 元优惠码(积分抵扣)没生效,直接原价结算了
 *
 * 运行:pnpm lab phase1-runtime/tutor/bug_clinic/bug5_falsy_discount.ts
 * 任务:找出哪一行"错杀"了合法的 0,给出精确的判断修复。
 */

function applyCoupon(total: number, discount: number): number {
  if (!discount) {                     // ← 病灶大概率在这附近
    console.log('无优惠,原价结算');
    return total;
  }
  console.log(`优惠 ${discount} 元,应付 ${total - discount}`);
  return total - discount;
}

console.log(applyCoupon(300, 50));   // 满 300 减 50:正常
console.log(applyCoupon(300, 0));    // 积分抵扣 0 元?不,业务上"0 元优惠码"是合法的——❓
