/**
 * 🚑 门诊 2 号(读档,Expo 可跑)· 症状:离开订单详情屏 10 分钟,日志还在每秒刷轮询请求
 * ——phase1 门诊 2 号(监听器泄漏)的 RN 版,而且 RN 把它变成了"常态路径"。
 *
 * 贴进 Expo 项目,配 React Navigation:列表页 push 进 Detail 再返回。
 * 任务:① 解释为什么"返回了列表"之后轮询还在跑(提示:RN 的离开 ≠ 卸载,什么时候才卸?);
 *       ② 给出最小修复,并说明它与 useEffect 清理函数纪律的关系。
 */
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export function Bug2NavigationLeak({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState('查询中');

  useEffect(() => {
    const timer = setInterval(async () => {
      // 模拟轮询支付状态(真实世界:fetch 支付网关)
      console.log(`[轮询] 查询订单 ${orderId} 的支付状态…`);
    }, 1000);
    // ← 大概率病灶在附近:这个 interval 的"寿命"由谁终结?

    // 真实世界里这里往往还有一个隐藏第二病灶:
    // 轮询回调里 setStatus(...) —— 组件已离开屏幕,setState 发给谁?
  }, [orderId]);

  return (
    <View>
      <Text>订单 {orderId}:{status}</Text>
    </View>
  );
}
