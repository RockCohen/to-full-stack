# S31 实验卡 · npm 与依赖治理(≈ Maven 的表亲,脾气不同)

> 代码落点:`exercises/01_npm_lab/playground.ts`。零依赖,直接跑。
> 你的 Maven 直觉大半能用,本卡专治"大半"之外的那小半。

## E1 · 语义化版本:^ 与 ~ 的漂移半径

四个已发布版本(1.4.2 / 1.4.9 / 1.5.0 / 2.0.0):

- 预测:`^1.4.2` 与 `~1.4.2` 的下次 install 各会装到哪个?
- ❓对照:Maven 的 `1.4.2` 是精确坐标,`[1.4,2.0)` 才是范围;JS 生态**默认范围**(`^`),精确反而要靠锁文件。漂移半径 = 次版本(`^`)+ 补丁(`~`)。危险不在约定,在**不是所有人都守约定**——小版本里塞 breaking change 的库,你迟早遇到。

## E2 · 锁文件:快照不是誓言

- 预测:同一份 `package.json(^1.4.2)`,周一和周五的 install 结果;有锁文件与没有的区别?
- ❓`pnpm-lock.yaml` ≈ 你给构建上 pins/BOM。**应用锁死,库不锁死**:应用要可复现(CI 上 `--frozen-lockfile`);库把选择权留给使用者的依赖树(锁死反而制造版本孤岛)。

## E3 · 幽灵依赖:类加载器可见性的前端版

在 playground 顶部试 import 一个没声明的包(实验卡里给了具体试毒步骤):

- 预测:npm(扁平 hoisting)与 pnpm(严格链接)谁当场翻车?
- ❓npm 把传递依赖摊平到顶层 node_modules——**别人的 classpath 变成了你的 classpath**,代码能跑,换了包管理器/升级后集体蒸发。pnpm 的符号链接 = 严格的类加载器可见性:每个包只看得见自己声明过的依赖。你在 Java 里讨厌的"隐式依赖",在这里有了文件系统级的强制。

## E4 · workspace:monorepo 的共享仓库

- 预测:pnpm workspace 下,依赖的真身在哪,子包 node_modules 里是什么?
- ❓验证:`ls node_modules/.pnpm | head`、`readlink node_modules/react`(在你的仓库根跑)。≈ `~/.m2` 全局仓库 + 各 pom 声明,只是 pnpm 用**硬链接**做到零拷贝,用**符号链接**做到严格可见。磁盘省了,坑位清了。

## 收尾追问

1. "应用锁死、库不锁死"为什么不对称?各自怕的是什么?
2. CI 里 `pnpm install` 和 `pnpm install --frozen-lockfile` 的差别?哪个该进流水线?
3. 同事说"跑不起来?你先 `rm -rf node_modules && pnpm install`"——这剂万能药的病理是什么?它治不好哪类病?(提示:锁文件不同步、幽灵依赖、平台二进制)
