# 阶段 5 · MAP 映射讲义:手机也是数据读写,以及一场收官考试

> **用法**:字典,不是课文。先做场次实验,被打脸了再回来查对应小节。
> 本阶段两件事:把 React 搬进手机(机制没变,宿主换了),把五个阶段的家底组装成一个产品(Capstone)。

---

## 0. 世界观开场:RN 是"读写物理学"的第四块大陆

你已经跨过三块大陆:Node 的事件循环(调度)、浏览器的 DOM(渲染树)、Vite 的构建流水线(交付)。RN 是第四块:**JS 引擎跑原生 App 内**,JS 写的 `UI=f(state)` 依然成立,但"渲染"不再操作 DOM,而是通过一条**原生通道**指挥 Android/iOS 的真实控件。你的老朋友全部在场:组件树、diff、hooks 槽位、TanStack Query 的缓存、Vite 的工程化——**变的只有最后一厘米**。

**读写世界观落点**:手机端的读写比 Web 多了一层"**系统仲裁**":摄像头/定位/相册的每次读写都要过一道运行时权限(沙箱授权);推送与 OTA 是"系统替你触发的读写"。Capstone 则是把全部读写链路串成一条:DB → Spring Boot(计算)→ HTTP(流动)→ Query(缓存)→ React/RN(渲染)。

### 四道老题,本阶段的答卷

| 老题 | 本阶段答卷 | 对应场次 |
|---|---|---|
| 数据放在哪 | JS 堆(组件状态、Query 缓存)+ 原生堆(控件、图片);两端靠桥同步 | S36 |
| 谁说了算 | 原生主线程管渲染与手势,JS 线程管逻辑;系统管权限仲裁 | S36、S39 |
| 怎么不打架 | 卸载即清理(导航离开≠页面藏起来);不可变状态照旧 | S38、门诊 |
| 数据怎么流动 | DB→API→Query→UI,一条链三个端;推送/OTA 是反向流 | S41、S42 |

---

## 1. RN 架构:JSI ≈ JNI

### 1.1 为什么需要一条"桥"

浏览器里 JS 直接调 DOM API(同一进程的宿主对象);RN 里 JS 和原生控件在**两个世界**:JS 引擎(Hermes)一个,Android/iOS 运行时一个。中间必须有一条**互操作通道**。老架构的 Bridge:异步、批量、JSON 序列化——每次传值都"过境安检"(序列化开销,不能传函数)。新架构的 **JSI**:JS 持有原生对象的**直接引用**,同步调用,不序列化——**这就是 JNI 的逻辑**:Java 调 C++ 不靠发消息,靠 native 方法表。TurboModules(按需加载的原生模块)与 Fabric(新渲染器)都立在 JSI 之上。

**类比失效的地方**:JNI 的调用是"低开销但写起来痛苦";JSI 的目标是"低开销且对 JS 透明"。但**跨界依然要过安检**:能过桥的值必须是可序列化/可直接持有的——函数、Symbol、循环引用过不去(门诊 3 号)。跨语言边界的值约束,JNI 里你见过同款(jstring 不是 String)。

### 1.2 Expo ≈ Spring Boot

RN 裸写 = 手配 Gradle/Xcode 签名/原生依赖地狱;**Expo = 约定优于配置的全家桶**:`npx create-expo-app` 一条命令起项目(≈ Spring Initializr),`npx expo start` 热重载(≈ devtools),EAS Build 云端打包(≈ 你的 CI 出包),OTA 更新(≈ 配置中心热下发,但有版本与灰度)。**你后端的直觉:框架的价值不是替你写业务,是把"工程化的脏活"标准化**——Expo 正是 RN 世界的 Spring Boot。

---

## 2. 组件与导航:换了宿主的 React

### 2.1 三件套翻译表

| Web | RN | 备注 |
|---|---|---|
| `<div>` | `<View>` | 布局容器,flexbox **默认纵向**(Web 默认横向!高频坑) |
| `<span>/<p>` | `<Text>` | **文字必须在 Text 里**,裸文本直接报错(Web 惯的病) |
| `<img>` | `<Image>` | 必须显式宽高 |
| `<input>` | `<TextInput>` | 受控组件,同款 value/onChange(此处叫 onChangeText) |
| `onclick` | `onPress` | 触摸不是点击:还有按下的视觉反馈要管 |
| CSS | StyleSheet | CSS 的**子集**:无级联、无继承(只到 Text)、全 flexbox |
| `<ul>` + map | `<FlatList>` | 见下,重点 |

### 2.2 FlatList ≈ 分页查询(不是普通 map)

Web 上 `orders.map(o => <Row/>)` 一把梭;RN 的长列表用 `FlatList`:`data` + `renderItem` + `keyExtractor`,**只渲染视口附近的行**(窗口化+回收)——≈ MyBatis 的分页 + 池化:不把全表捞进内存。`onEndReached` = 触底加载下一页 ≈ 滚动分页。key 纪律照旧:**keyExtractor 用业务 id,别用 index**——phase2 门诊 1 号在 RN 原样复发(门诊 1 号)。

### 2.3 导航 = 栈,不是页面

React Navigation:`navigation.navigate('OrderDetail', { id })` ≈ **Activity 栈入栈**;`goBack()` 出栈;Tab 嵌 Stack ≈ 主导航+任务栈。关键差异:Web 的"离开页面"是销毁(DOM 摘除);RN 的"离开屏幕"默认**保留在栈里**(返回要恢复状态)——所以卸载清理的纪律更严格:订阅、定时器、监听器,`useEffect` 清理函数一个都不能少(门诊 2 号,phase1 监听器泄漏的 RN 版)。

---

## 3. 设备能力与权限:系统当仲裁

Web 里摄像头是 `getUserMedia` 一个授权弹窗;原生端权限是**分层仲裁**:安装时声明(AndroidManifest/Info.plist ≈ 声明"我要这些权限的意向")+ 运行时请求(用户实际点授予)+ 永久拒绝后的引导(去设置页)。工程要点:**权限被拒不是异常路径,是正常路径**——每个设备能力调用都要有"拒绝态 UI"(门诊 4 号)。推送(远程触发读)、OTA(热更 bundle)都是"系统/平台替你发起的读写",要有版本与回滚意识(门诊 5 号)。

---

## 4. Capstone:全链路联调

架构一张图(详情见 [capstone/README.md](capstone/README.md)):

```
PostgreSQL/H2 ── Spring Boot(API,≈ 你的老本行)
                    │ REST:/api/orders、/api/orders/{id}/pay
        ┌───────────┴────────────┐
   React Web(阶段 2~4 家底)   RN App(本阶段新家底)
   Query 缓存 + 支付失效       Query 缓存 + FlatList + 导航
```

联调期的高频问题全是你学过的:两端数据不一致 → 检查各自的 invalidate;App 连不上 API → 手机没有你的 localhost;Web 跨源 → CORS 头;支付重复提交 → 幂等键/409(你的老本行)。

---

## 5. 对暗号(本阶段总表)

| Java/CS 世界 | RN 世界 | 一句话 |
|---|---|---|
| JNI native 方法表 | JSI 直接引用 | 跨界不序列化 |
| 序列化过网关 | Bridge JSON 过桥 | 函数过不了安检 |
| Spring Boot 全家桶 | Expo 全家桶 | 约定优于配置 |
| Activity 栈 | 导航 Stack | 离开≠销毁 |
| 分页 + 连接池 | FlatList 窗口化 | 别把全表捞进内存 |
| 沙箱授权 | 运行时权限 | 拒绝是正常路径 |
| 配置中心热下发 | OTA 更新 | 有版本,要灰度 |
| 多端共享 Service | 多端共享 API+Query 规范 | 真相一份,读者多处 |

## 6. 发散问题

1. Bridge(异步 JSON)与 JSI(同步直调)各把复杂度放在哪边?为什么说"新架构不是更快,是复杂度归位"?
2. FlatList 的窗口化与"预加载下一页"的权衡,和你做分页接口时"页大小 vs 请求数"的权衡是同一道题吗?
3. 三端(Web/RN/未来的小程序)共享同一 API 时,"真相一份"靠什么保证?哪些东西天生无法共享(UI 惯例、平台能力)?

## 7. 🤔 留给你想

三个月前你问"前端是什么",现在请换个问法:**不变量表里哪一行,如果删掉,四个阶段的哪块知识会塌?**——总答辩《全栈统一场 10 问》考的就是你对这个问题的答案。把这张表当作品集的第一页。

## 8. 🏛 权威佐证与延伸

- **React Native 官方 · The New Architecture**(reactnative.dev → architecture)。JSI/Fabric/TurboModules 的第一手说明。
- **Expo 官方文档**(docs.expo.dev)。从 create-expo-app 到 EAS Build 的全家桶手册;OTA 的一节读 Capstone 部署前。
- **React Navigation 官方**(reactnavigation.org)。Stack/Tab 的心智模型与"离开屏幕的生命周期"一节。
- **Android · Request runtime permissions**(developer.android.com)。权限分层仲裁的系统级原文,iOS 同理。
- **延伸 · 一词之差**:RN 的 "native" 指平台原生控件,不是编译成本机机器码——JS 依旧跑在 Hermes 引擎里。"跨平台"跨的是 UI 宿主,不是运行时。
