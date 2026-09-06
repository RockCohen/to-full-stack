# S35 · 脱稿验收 · 一小时流水线(Pipeline-in-60-Minutes)

> 规则:**不查任何材料**,1 小时,从空目录开始。写完不等于结束——AI 考官还有 3 道现场附加题。
> 这是你的老本行(搭 CI/CD)的前端翻新版:零件全认识,考的是肌肉记忆换介质。

## 题面

在本目录新建 `my-pipeline/` 空目录,1 小时内交付:

```text
my-pipeline/
├── src/
│   └── total.ts          # orderTotal(lines):合计,分为单位(3~5 行,写对就行)
├── tests/
│   └── total.test.ts     # ≥3 个用例:常规、空数组、边界
├── index.html            # 一个 <h1>,引 src/total.ts 的产物即可
├── vite.config.ts        # (可选加分:build.lib 模式)
├── Dockerfile            # 多阶段:build → nginx(或 node 运行)
├── .dockerignore         # 至少排除 node_modules、dist、.git
└── README.md             # 一条命令能跑通的说明
```

## 硬性验收(考官逐条现场验证)

```bash
pnpm install && pnpm exec vitest run --root my-pipeline   # 测试绿
pnpm exec vite build my-pipeline                          # 产物存在且 < 5KB
docker build -f my-pipeline/Dockerfile -t pipe60 .        # (有 Docker 时)镜像分层合理
cat my-pipeline/.dockerignore                             # 真的排除了 node_modules
```

## 考官附加题(≥2 道通过)

1. `npm ci` 和 `npm install` 在 CI 里的差别?谁动锁文件、谁只认锁文件?
2. 你的 Dockerfile 第二阶段为什么不用 node 镜像?用 node 会胖多少?胖在哪?
3. 如果 total.test.ts 里两个用例共享一个模块级计数器,单独跑都绿、一起跑红——这类问题的通用解法叫什么?(提示:test isolation,≈ 你的 @BeforeEach)
4. 流水线在哪一步该跑 `--frozen-lockfile`?跳过会怎样?

## 毕业三件事

误解本自测一遍 → 情式笔记(本阶段 5 场各一行)→ `git tag phase4-graduate` 🎓
