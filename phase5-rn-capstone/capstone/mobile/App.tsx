/**
 * RN App(骨架)—— 列表结构给出,数据接线 TODO 归你(M3)。
 * 纪律:FlatList 的 keyExtractor 用业务 id;文字必须在 <Text> 里;flex 默认纵向。
 * BaseURL:真机连电脑 API 用局域网 IP(手机的 localhost 是它自己!)
 */
import { Text, View, FlatList, StyleSheet } from 'react-native';

// TODO(M3,你写):① 换成 TanStack Query 拉数据(useQuery);
//  ② BaseURL 抽成环境区分(DEV: 局域网IP:8080 / PROD: 配置);
//  ③ 加支付按钮(useMutation + invalidate,纪律与 Web 端同构);
//  ④ 导航:列表页 → 详情页(React Navigation,离开屏幕记得清理)。
const ORDERS = [
  { id: 'A-001', buyer: '老王', total: 9900, paid: false },
  { id: 'A-002', buyer: '老张', total: 19900, paid: true },
  { id: 'A-003', buyer: '老李', total: 5900, paid: false },
];

export default function App() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>订单(Capstone Mobile)</Text>
      <FlatList
        data={ORDERS}
        keyExtractor={(o) => o.id} // 主键来自业务,不来自位置——phase2/5 门诊 1 号的疫苗
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.id} · {item.buyer}</Text>
            <Text>{item.paid ? '已支付' : `待支付 ¥${(item.total / 100).toFixed(2)}`}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 60, paddingHorizontal: 20, gap: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
});
