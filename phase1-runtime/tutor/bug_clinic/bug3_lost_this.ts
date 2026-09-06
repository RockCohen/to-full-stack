/**
 * 🚑 门诊 3 号 · 症状:支付服务的方法一当回调传就丢 this
 *
 * 运行:pnpm lab phase1-runtime/tutor/bug_clinic/bug3_lost_this.ts
 * 任务:解释 this 为什么丢了,给出两种修复(至少一种用箭头函数)。
 */

class PaymentService {
  constructor(private gateway: string) {}

  charge(amount: number): string {
    return `[${this.gateway}] 扣款 ${amount} 元`;   // ← 依赖 this.gateway
  }
}

const svc = new PaymentService('生产网关');

// 场景:把"扣款"注册成支付完成后的回调
function onPaid(callback: (amount: number) => string) {
  console.log(callback(99));
}

console.log(svc.charge(99));      // ✅ 直接调用没问题
try {
  onPaid(svc.charge);             // ← 病灶大概率在这附近
} catch (e) {
  console.log('炸了:', (e as Error).message.slice(0, 40));
}
