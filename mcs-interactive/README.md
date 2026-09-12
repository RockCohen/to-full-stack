# mcs-interactive · 数学之旅 ·《计算机科学的数学》交互式伴侣

把仓库根目录的《计算机科学的数学》（*Mathematics for Computer Science*，MIT 6.042 讲义，Lehman / Leighton / Meyer）逐章做成**可玩的中文交互网页**，增强学习者与书的互动。线上：https://rockcohen.cc/mcs/ （部署 `../scripts/deploy-mcs.sh`，同步所有 `*.html`）。

## 章节一览

| 文件 | 章节 | 互动装置 |
|---|---|---|
| `index.html` | 系列目录 | 章节卡片 + 筹备中预告 |
| `ch01.html` | 第 1 章 · 什么是证明？（What is a Proof?） | 11 个 + 2 段 Manim 短片 + 终局自测 ×6 |
| `ch02.html` | 第 2 章 · 良序原理（The Well Ordering Principle） | 7 个（良序试金石 / 模板拼图 / 求和审判庭 / 素分解流水线 / 无限下降机 / 假证明双案）+ 终局自测 ×6 |
| `ch03.html` | 第 3 章 · 逻辑公式（Logical Formulas） | 8 个（真值表游乐场 / 代码化简侦探 / 身份分类器 / DNF 工坊 / DeMorgan 变形器 / SAT 猎手 / 量词交换机 / 谓词翻译官）+ 终局自测 ×6 |
| `ch04.html` | 第 4 章 · 数学数据类型（Mathematical Data Types） | 6 个（集合运算法官 / 幂集发电站 / 集合vs序列找茬 / 部分函数体检 / 关系五性质鉴定器 / 映射规则实验室）+ 终局自测 ×6 |
| `ch05.html` | 第 5 章 · 归纳法（Induction） | 7 个（糖果多米诺 / 归纳模板拼图 / 同色马诊所 / 强弱归纳选型 / 堆叠游戏 / Inductia 换零钱）+ 终局自测 ×6 |
| `ch06.html` | 第 6 章 · 状态机（State Machines） | 5 个（对角机器人网格 / Die Hard 水壶模拟器·双版本 / 快速幂单步机 / 稳定婚姻 Mating Ritual 单步模拟）+ 终局自测 ×6 |
| `ch07.html` | 第 7 章 · 递归数据类型（Recursive Data Types） | 5 个（RecMatch 构造器+检验器 / 病态定义展览馆·含 Collatz / Aexp 替换vs环境模型 / OBT 结构归纳实战）+ 终局自测 ×6 |
| `ch08.html` | 第 8 章 · 无限集（Infinite Sets）· Part I 收官 | 5 个（无限旅馆 / 对角论证剧场三幕 / 停机悖论五步引爆器 / Russell 悖论与 ZFC / 自测）+ 终局自测 ×6 |
| `ch09.html` | 第 9 章 · 数论（Number Theory）· Part II 开篇 | 5 个（水壶终审判决器 / Pulverizer 表 / 素数之谜叙事 / RSA Playground 完整加解密 / 自测）+ 终局自测 ×6 |
| `ch10.html` | 第 10 章 · 有向图与偏序（Directed Graphs & Partial Orders） | 12 个（walk 审判庭 / 邻接矩阵幂计数器 / 闭包引擎 G⁺ / 距离查找器 / 穿衣并行调度器 / 拓扑排序挑战 / 关系性质鉴定矩阵 / 关系类型终审 / 偏序↔集合包含同构机 / 等价类划分器 / 习题10.9 复合解题器 / 习题10.15 三连问）+ 终局自测 ×8 |
| `ch11.html` | 第 11 章 · 通信网络（Communication Networks） | 7 个（四强对比表·N 滑块 / 二叉树寻径器·root 拥塞 / 阵列拥塞=2 实验台 / 蝶形递归构造器 / 蝶形拥塞热区·习题 11.8 / Beneš 约束图 2-着色 / 拥塞快判）+ 终局自测 ×6 |
| `ch12.html` | 第 12 章 · 简单图（Simple Graphs） | 9 个（平均度悖论实验台 / 同构侦探·Figure 12.7 / Hall 快判 / Hall 15 子集扫描器+匹配揭晓 / 考试着色器 / 圈猎手三圈 / 割边鉴定·Figure 12.14 / 树性质六连判·Figure 12.17 / 习题12.2 度数和20 / 习题12.5 同构保持十连判）+ 终局自测 ×8 |
| `ch13.html` | 第 13 章 · 平面图（Planar Graphs）· Part II 收官 | 4 个（欧拉公式实验室 / 边数上界检验器 / 五色定理步进剧场 / 正多面体穷举表）+ 终局自测 ×6 |
| `ch14.html` | 第 14 章 · 求和与渐近（Sums & Asymptotics）· Part III 开篇 | 5 个（年金现值计算器 / 扰动法步进器 / 积分包围实验台 / 书堆悬挑 Hₙ/2 模拟器 / 渐近记号快判）+ 终局自测 ×6 |
| `ch15.html` | 第 15 章 · 计数规则（Cardinality Rules） | 6 个（牌照实验室 / Bookkeeper 计数器 / 扑克牌型计数器·含 2-to-1 陷阱 / 鸽笼鉴定器 / 五张牌魔术解码台 / 容斥文氏图）+ 终局自测 ×6 |
| `ch16.html` | 第 16 章 · 生成函数（Generating Functions）· Part III 收官 | 5 个（水果袋约束实验室 / 卷积对角线观测台 / 换零钱实验室 / Binet 验证器 / 递推求解步进器）+ 终局自测 ×6 |
| `ch17.html` | 第 17 章 · 事件与概率空间（Events & Probability Spaces）· Part IV 开篇 | 5 个（蒙提霍尔树表 / 换门蒙特卡洛法庭 / 怪骰子对决台·一次两次翻转 / 生日碰撞曲线 / 先手优势级数）+ 终局自测 ×6 |
| `ch18.html` | 第 18 章 · 条件概率（Conditional Probability） | 5 个（乳腺癌检测器实验台 / 贝叶斯因子更新器 / 辛普森悖论实验台 / 三硬币独立性验证器 / 自然频数条）+ 终局自测 ×6 |
| `ch19.html` | 第 19 章 · 随机变量与期望（Random Variables & Great Expectations） | 5 个（信封猜数对赌台 / 二项尾巴观测台 / 分池串通模拟器 / 帽子问题模拟 / 优惠券收集器）+ 终局自测 ×6 |

| `ch20.html` | 第 20 章 · 偏离均值（Deviation from the Mean，含 20.6 Chernoff / 20.7 无限期望） | 6 个（IQ 侦探三界对比 / 方差对比器 / 生日配对分布仪 / 民调样本量计算与实测 / Chernoff 三界计算器 / Murphy 与 ∞ 期望）+ 终局自测 ×6 |

| `ch21.html` | 第 21 章 · 随机游走（Random Walks）· Part IV 收官 | 4 个（赌徒破产模拟器 / 轮盘胜率阶梯 / 局长计算与对拍 / PageRank 实验台）+ 终局自测 ×6 |

| `ch22.html` | 第 22 章 · 递归式（Recurrences）· 全书终章 | 4 个（Plug-and-Chug 机器 / Merge Sort 演练台 / 特征方程求解器 / Akra-Bazzi 试算器）+ 终局自测 ×6 |

> 线上：https://rockcohen.cc/mcs/ch01.html ~ ch22.html —— **全书 22 章全部上线 🎉**

## 怎么用

**双击 `index.html` 即可**：三段 Manim 短片与封面帧已以 base64 内嵌进 HTML（约 2.2 MB），页面是真正的零依赖单文件——file:// 直接打开可播，不需要 `media/` 目录随行、不需要服务器、不需要网络。

> 历史注记：早期版本视频走 `media/` 相对路径，在部分浏览器的 file:// 场景下会因路径解析失败而无法播放；现已内嵌根除。`media/` 目录保留为渲染产物原件（也是改剧本重渲的输出目标），删掉不影响页面播放。

## Manim 影院（内嵌进页面）

页面负责互动，短片负责电影化叙事。**只嵌两段**——按适配性原则筛过（见下）：

| 短片 | 对应章节 | 为什么适合 Manim |
|---|---|---|
| `media/prime41.mp4` | 1.1 | 素数绿灯逐个亮起、n=40 一声闷响——线性叙事，终点即高潮，观众无需操作 |
| `media/sqrt2.mp4` | 1.8 | a² 与 2b² 无限逼近、差恒为 1——"永远差一点"的节奏感要靠时间轴呈现 |

**六人派对（party.mp4）有意不嵌**：拉姆齐定理的核心体验是"你亲手涂色、亲手逃、亲手发现逃不掉"，页面的 K6 染色游戏已经完全承载；线性视频反而把它降级成看别人玩。成片保留在 `media/party.mp4`、剧本保留在 `scenes.py`（课堂上投影讲用得着），只是不进页面。

### Manim 适配性判断标准（后续章节沿用）

嵌入前先过一道**试金石**："这段内容，观众只能看不能动手，损失了什么？"

- **损失很小** → 适合 Manim。特征：过程单向展开、有戏剧性终点（崩塌/收敛/封喉）、交互不改变结论。例：素数断言崩塌、Pell 逼近、RSA 的加解密流程演示。
- **损失很大** → 用 HTML 互动。特征：结局取决于用户输入、探索空间大、"亲手失败"本身就是教学内容。例：六人派对、图论拖拽、蒙提霍尔（第 17 章）。
- 判断不了就先做 HTML 互动，Manim 永远是调味料不是主菜。

改剧本 / 重渲后重新内嵌：

```bash
cd manim
./.venv/bin/manim -qm --disable_caching scenes.py Prime41 ApproachingSqrt2 PartyK6
cp media/videos/scenes/720p30/Prime41.mp4 media/prime41.mp4
cp media/videos/scenes/720p30/ApproachingSqrt2.mp4 media/sqrt2.mp4
cp media/videos/scenes/720p30/PartyK6.mp4 media/party.mp4
python3 embed_media.py   # 重新以 base64 内嵌进 index.html
```

- 场景源码：`manim/scenes.py`（三个 Scene 类，中文用 PingFang SC，纯 Unicode 数学、无需 LaTeX）
- 内嵌脚本：`manim/embed_media.py`（视频 + 自动抽帧封面 → data URI 写入 index.html）
- 虚拟环境：`manim/.venv`（Manim CE 0.21，已 gitignore，重建：`python3 -m venv manim/.venv && manim/.venv/bin/pip install manim`）
- 系统依赖：ffmpeg（本机 7.0 已具备）

## 第 1 章装置清单

1. **命题判官** —— 8 句话判断"是否命题"，核心洞见：真假未知不妨碍命题资格
2. **反例猎人** —— n²+n+41 素数断言，亲手连检到 n=40 看它崩塌
3. **谓词开关** —— P(n) 压成 ∀/∃ 命题，体会"一个反例/一个见证"的不对称
4. **推理法庭** —— modus ponens、传递、逆否四场听审，最后一场是 Non-Rule 陷阱
5. **符号合谋** —— 定理 1.5.1 的函数图像 + 因子符号滑块 + 逐行干净证明
6. **链式 Iff** —— 标准差定理的四环等价链，逐环扣上
7. **六人派对** —— R(3,3)=6 的 K6 染色游戏（随机 500 次 + 5 人局五边形逃生路线）
8. **√2 审判庭** —— 原书证明逐行推进，两道关卡必须作答
9. **格点猎手** —— 在 12×12 格里找 a²=2b²，体验"无限逼近、永不重合"
10. **九条心法** —— 好证明写作建议，先猜后翻的翻转卡
11. **假证明诊所** —— 1=−1 与 a=b⟹a=0 两桩悬案，点击抓虫（附 AM-GM 倒推陷阱彩蛋）

另有：四种"真相"开场、名人堂（四色/费马/哥德巴赫）、课后挑战（原书习题 1.9 / 1.17 / 1.25 / 1.26 等）。

## 约定

- **单文件零依赖**：全部 CSS/JS 内联，数学用 Unicode + 少量 CSS 排版（不引 KaTeX，离线可用）
- **中文为主，关键术语保留英文**（proposition / modus ponens / contrapositive …）
- **忠实原书**：定理编号、证明思路、习题引用均可与原书 PDF 对照（第 1 章 = 原书第 5–28 页）
- **版权**：内容译写改编自原书（CC BY-SA 3.0），本页面同样以 CC BY-SA 3.0 发布

## 路线图

- [x] Part I · Proofs：第 1–8 章（八章全上线）
- [x] Part II · Structures：第 9–13 章（数论 / 有向图 / 通信网络 / 简单图 / 平面图，收官）
- [x] Part III · Counting：第 14 章 ✓ / 第 15 章 基数规则 ✓ / 第 16 章 生成函数 ✓（三部曲收官）
- [x] Part IV · Probability：第 17–21 章全部上线（事件空间 / 条件概率 / 随机变量与期望 / 偏离均值·含 Chernoff / 随机游走·含 PageRank）
- [x] Part V · Recurrences：第 22 章 递归式 ✓ —— **全书 22 章 × 5 个 Part 全部完成**
- [ ] Part V · Recurrences：第 22 章（全书收官）
