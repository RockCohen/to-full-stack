# S37 练习 · Expo 第一个 App(产出落点)

RN 工程本身是 `npx create-expo-app` 生成的独立项目(有自己的 node_modules 和原生配置),
**不必整体搬进本仓库**。本目录落三样东西:

```
02_expo_first/
├── App.tsx          # 你改造的订单计数器 RN 版(View/Text/Pressable/StyleSheet)
├── expo-first.png   # 运行截图 1~2 张(真机 Expo Go / 模拟器 / --web 任一环境)
└── notes.md         # 情式笔记:跑通过程 / 卡在哪 / 与 Web 版写法的 3 处差异
```

## 完成标志

- App 在任一环境跑通,截图入库;
- 能不看材料说出 RN 与 Web 的 3 处写法差异(提示:裸文本、flex 方向、样式无级联);
- commit(本目录内的三个文件)。

> 版本提示:`create-expo-app` 生成的 expo/react-native 版本以生成当时为准;
> 若与本仓库 capstone/mobile 骨架的版本号有漂移,以你本地生成的为准。
