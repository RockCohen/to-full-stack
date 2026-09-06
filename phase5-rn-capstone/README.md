# 阶段 5 · React Native 与 Capstone 毕业设计(2~3 周 · 8 场 ≈ 20h)

> 目标:把 React 搬进手机(UI=f(state) 不变,渲染宿主换了),再把前四个阶段的全部家底——React、TanStack Query、工程化流水线——组装成**一个全栈产品**:Spring Boot API + React Web + RN App,Docker Compose 一键起。
> 终点:总答辩《全栈统一场 10 问》——考的就是那张你打了四个阶段卡的 [不变量表](../notes/不变量表.md)。`git tag fullstack-graduate` 🎓
>
> **⚡ 学习模式:AI 助学互动式**。操作手册 → **[AI助学手册.md](AI助学手册.md)**

## 一、材料清单

### 代码主线

| 材料 | 用法 |
|---|---|
| `exercises/01_rn_lab` | RN 心智实验:JSI 消息管线模拟(纯 TS 可跑,不用手机) |
| [`capstone/`](capstone/) | 毕业设计仓库骨架:Spring Boot server + web-client + mobile + compose |
| `tutor/bug_clinic/`(5 例) | RN 现场翻车:FlatList key、导航泄漏、桥序列化、权限拒绝、OTA 旧包 |

### 理论主线

| 材料 | 用法 |
|---|---|
| [`MAP.md`](MAP.md) 映射讲义 | 主线讲义:JSI≈JNI、Expo≈Spring Boot、FlatList≈分页、权限≈沙箱授权 |
| 官方文档 [reactnative.dev](https://reactnative.dev/docs/getting-started) / [expo.dev](https://docs.expo.dev/) | 字典 |
| AI 助教 | 主讲+陪练+考官,⓪ 号契约卡先行 |

## 二、环境

阶段 0~4 环境之上:
- **S37 需要 Expo 环境**:`npx create-expo-app`(首次运行自动装),手机装 **Expo Go**(或本机模拟器)。没有手机/模拟器也能毕业——RN 相关产出可以用 Expo Web 验收,但建议至少真机跑一次。
- **Capstone 的 Spring Boot 需要本机 JDK 17+ 与 Maven**(或 Docker);Web 端复用阶段 4 流水线。
- `pnpm verify` 全绿 + `java -version` 有输出即可开工。

## 三、任务清单(硬指标)

- [ ] S36/S38/S41 三张预测实验卡:错题 ≤2 且追到根因
- [ ] S37 Expo App 真机/模拟器/Expo Web 任一环境跑通,截图落 `exercises/` 
- [ ] S39 权限实验:拒绝→引导→重试的完整路径(纸上推演可,代码更佳)
- [ ] **Capstone 四个里程碑全验收**(见 [capstone/README.md](capstone/README.md))
- [ ] 门诊 5 例全部独立定位根因
- [ ] S38 答辩:《RN 架构 10 问》≥8
- [ ] **S43 总答辩:《全栈统一场 10 问》≥8**(不变量表的终极检验)
- [ ] 毕业三件事:误解本全清、情式笔记齐、`git tag fullstack-graduate` 🎓

## 四、验收标准(AI 考官制)

Capstone 演示:一台机器 `docker compose up` 起 server+web,手机/模拟器跑 RN App,三个端共用同一份"订单与支付"数据;现场演示 支付→列表刷新→Web/RN 两端一致。总答辩 10 问 ≥8,其中不变量表"对暗号"题必考;考官再从你四个阶段的误解本里抽 2 条"旧病复发"题。

## 五、常见卡点速查

| 现象 | 处理 |
|---|---|
| Expo 起不来/端口冲突 | `npx expo start --clear`;真机与电脑需同一 Wi-Fi |
| App 里 fetch 本机 API 不通 | 手机上的 `localhost` 是手机自己——用电脑局域网 IP,或 Expo Web 验收 |
| FlatList 卡顿/警告缺 key | key 用业务 id,别用 index(RN 版门诊 1 号,和 phase2 同源) |
| RN 组件卸载后还 setState 报警告 | 导航离开前清订阅/定时器——清理函数纪律(门诊 2 号) |
| compose 起了但 Web 跨源被拦 | server 的 CORS 配置加 Web 的端口;别忘了手机端是"无源"客户端 |

## 六、毕业 → 🎓 fullstack-graduate

三个月,六阶段,从"没有 TS/JS/HTML/CSS 基础"到手写过 Promise、store、mini-React,到交付全栈产品。这个仓库从此是你的复习材料与作品集。不变量表填满之日,即融会贯通之时。
