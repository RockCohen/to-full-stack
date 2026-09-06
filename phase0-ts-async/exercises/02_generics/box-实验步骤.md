# S2 练习 · E5 专用:亲手抓一次"类型蒸发"

# 生成编译产物
pnpm exec tsc phase0-ts-async/exercises/02_generics/box.ts --target es2022 --module esnext --outDir /tmp/box-dist

# 打开产物,找找 number 和 <T> 在哪
cat /tmp/box-dist/box.js
