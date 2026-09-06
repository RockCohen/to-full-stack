// S32 练习 · 入口模块 —— 观察开发/生产两种形态的入口差异
import { mountBoard } from './board';
import './vendor-lite'; // 一个"有副作用"的模块,S32 实验卡 E3 的摇树标本

mountBoard(document.getElementById('app')!);
console.log('订单看板已挂载。dev 模式看网络面板(ESM 逐个请求);build 后看 dist/。');
