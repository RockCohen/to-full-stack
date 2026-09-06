# capstone-mobile

M3 验收(骨架 TODO 补完后):

```bash
cd capstone/mobile
npm install
npx expo start          # Expo Go 扫码 / 模拟器 / --web
```

- **连不上 API?** 真机的 `localhost` 是手机自己——用电脑局域网 IP(如 `http://192.168.x.x:8080`), Expo Web 可用 `http://localhost:8080`。
- FlatList 纪律:keyExtractor 用业务 id;长列表别用 map。
- 离开屏幕 ≠ 卸载:订阅/定时器/轮询必须走 useEffect 清理(门诊 2 号)。
- 出包说明(M4):Expo Go 演示即可毕业;进阶用 `eas build` 出正式包。
