/**
 * 🚑 门诊 1 号(读档,Expo 可跑)· 症状:删掉第一行订单,剩下行的支付状态"串位"了
 * ——phase2 门诊 1 号在 RN 复发:同一个病,换了宿主。
 *
 * 贴进你的 Expo 项目(App.tsx)运行:先点"标记已支付",再删第一行,观察幸存行的状态。
 * 任务:指出 key 的问题,并用"主键漂移"的语言写出根因(不给答案,ANSWERS.md 只做复核)。
 */
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Order = { id: string; buyer: string; paid: boolean };

export function Bug1FlatListKey() {
  const [orders, setOrders] = useState<Order[]>([
    { id: 'A-001', buyer: '老王', paid: false },
    { id: 'A-002', buyer: '老张', paid: false },
    { id: 'A-003', buyer: '老李', paid: true },
  ]);

  return (
    <View style={styles.wrap}>
      {orders.map((o, index) => (
        <Row
          key={index /* ← 大概率病灶在附近:它的身份是从哪来的? */}
          order={o}
          onPay={() =>
            setOrders(orders.map((x) => (x.id === o.id ? { ...x, paid: true } : x)))
          }
        />
      ))}
      <Pressable style={styles.btn} onPress={() => setOrders(orders.slice(1))}>
        <Text>删掉第一行</Text>
      </Pressable>
    </View>
  );
}

function Row({ order, onPay }: { order: Order; onPay: () => void }) {
  const [confirming, setConfirming] = useState(false); // 行内状态:身份漂移时它跟着倒霉
  return (
    <View style={styles.row}>
      <Text>{order.id} · {order.buyer}</Text>
      <Pressable onPress={onPay}>
        <Text>{order.paid ? '已支付' : confirming ? '确认中…' : '待支付(点我支付)'}</Text>
      </Pressable>
      <Pressable onPress={() => setConfirming(!confirming)}>
        <Text>{confirming ? '[双击确认已开]' : '[开启双击确认]'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  btn: { marginTop: 12, padding: 8, backgroundColor: '#eee' },
});
