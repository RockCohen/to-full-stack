// app.js — 课程平台骨架:侧栏路由、双视图(阅读/模拟器)、进度记录
import { CHAPTERS } from './chapters.js';
import { Quiz } from './quiz.js';
import { EventLoopSim } from './eventloopsim.js';
import { NarrowSim } from './narrowsim.js';
import { EraseSim } from './erasesim.js';
import { PromiseSim } from './promisesim.js';
import { ClosureSim } from './closuresim.js';
import { ReachSim } from './reachsim.js';
import { StoreSim } from './storesim.js';
import { JsxSim } from './jsxsim.js';
import { DiffSim } from './diffsim.js';
import { HooksSim } from './hooksim.js';
import { CorsSim } from './corsim.js';
import { QuerySim } from './querysim.js';

(function () {
  'use strict';

  const S_MAP = { c00: '场次 S1', c01: '场次 S2', c02: '场次 S3', c03: '场次 S4·S5', c04: '场次 S9', c05: '场次 S11', c06: '场次 S12·S13', c07: '场次 S16', c08: '场次 S17', c09: '场次 S20~S23', c10: '场次 S27', c11: '场次 S28·S29' };
  const store = {
    get done() { return JSON.parse(localStorage.getItem('to-full-stack-progress') || '{}'); },
    set(k, v) { const d = this.done; if (v) d[k] = 1; else delete d[k]; localStorage.setItem('to-full-stack-progress', JSON.stringify(d)); },
  };
  // 侧栏/路由按 id 排序:c00 → c01 → c02 → c03,编号即学习顺序(与场次顺序一致)
  const ORDERED = [...CHAPTERS].sort((a, b) => a.id.localeCompare(b.id));
  const groups = [...new Set(ORDERED.map((c) => c.group))];

  // ---------- 侧栏 ----------
  function renderSidebar() {
    const nav = document.getElementById('nav');
    nav.innerHTML = '';
    const home = document.createElement('a');
    home.className = 'nav-home';
    home.href = '#/';
    home.innerHTML = '<b>全栈之旅</b><span>阶段 0 · 互动课程</span>';
    nav.appendChild(home);
    groups.forEach((g) => {
      const h = document.createElement('div');
      h.className = 'nav-group';
      h.textContent = g;
      nav.appendChild(h);
      ORDERED.filter((c) => c.group === g).forEach((c) => {
        const a = document.createElement('a');
        a.className = 'nav-item';
        a.href = '#/' + c.id;
        a.dataset.id = c.id;
        a.innerHTML = `<span class="nav-check">${store.done[c.id] ? '✓' : ''}</span>${c.id} · ${c.title}`;
        nav.appendChild(a);
      });
    });
    highlight();
    const pct = Math.round((Object.keys(store.done).length / ORDERED.length) * 100);
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').textContent = pct + '%';
  }

  function highlight() {
    document.querySelectorAll('.nav-item').forEach((a) => {
      a.classList.toggle('active', a.dataset.id === route());
    });
  }

  function route() { return location.hash.replace(/^#\/?/, ''); }

  function render() {
    const main = document.getElementById('main');
    const id = route();
    renderSidebar();
    if (!id) { renderHome(main); return; }
    const ch = ORDERED.find((c) => c.id === id);
    if (!ch) { renderHome(main); return; }
    renderChapter(main, ch);
  }

  // ---------- 主页 ----------
  function renderHome(main) {
    main.innerHTML = `
      <div class="column"><div class="hero">
        <h1>全栈之旅 · 互动课程</h1>
        <p class="sub">写给 Java 后端工程师 —— TypeScript → React → React Native,每章只加一个机制</p>
        <p>左侧章节按顺序学;每章有<b>阅读视图</b>(讲透一个机制 + 对暗号 + 内嵌预测题)
        和<b>模拟器视图</b>(在浏览器里玩这个机制)。全部离线运行,进度存本机浏览器。</p>
        <div class="steps"><b>🚀 从这里开始(Day 1)</b><br />
        ① 仓库根目录 <code>pnpm install &amp;&amp; pnpm verify</code>,六项全 ✅;
        ② 把 <code>phase0-ts-async/tutor/prompts.md</code> 的 ⓪ 号契约卡贴给 AI,说"开始 S1";
        ③ 之后每场固定五步:<b>预演 → 摸底 → 预测 → 实战 → 收尾</b>(动线表见 AI助学手册 0.5 节)。</div>
        <div class="worldview"><span class="wv-title">🌊 读写世界观 · 全课主旋律</span>
        前后端都是<b>数据读写</b>:后端的读写为了计算,前端的读写为了交互与渲染。而背后的
        <b>内存管理、调度、通信同步(共享/通道/锁)</b>,核心逻辑不变——这门课不是"再学一门语言",
        是把同一套数据读写物理学,在另一种介质上再跑一遍。每章的"对暗号",唱的都是同一句主旋律;
        主旋律的账本记在 <code>notes/不变量表.md</code>,每章学完打卡一格。</div>
        <div class="warn-box">模拟器是<b>预演</b>:真正的手感来自
        <code>phase0-ts-async/exercises/</code> 与 <code>tutor/</code> 的动手实战,
        场次安排见 <code>AI助学手册.md</code>。学完一章 → 去对应场次动手 → 落库才算完成。</div>
        <p class="sub" style="margin-top:30px">🗺️ 旅程地图(六阶段 · 你在第一站)</p>
        <div class="journey">
          <div class="now">🧱 phase0 · TypeScript 与异步 —— 材料就绪,你在这里</div>
          <div>⚙️ phase1 · JS 运行时与内存 —— 材料就绪(c04~c06 + 禁写区响应式 store)</div>
          <div>🏰 phase2 · React:框架即调度器 —— 材料就绪(c07~c09 + 禁写区 mini-React)</div>
          <div>🌉 phase3 · 数据与网络 —— 材料就绪(c10 CORS / c11 缓存与失效)</div>
          <div>🚚 phase4 · 工程化与部署 —— 材料就绪(npm/Vite/Vitest/Docker)</div>
          <div>📱 phase5 · RN + Capstone —— 材料就绪 → 🎓 fullstack-graduate</div>
        </div>
        <button class="primary" id="start-btn">从 c00 类型与收窄 开始 →</button>
      </div></div>`;
    document.getElementById('start-btn').onclick = () => { location.hash = '#/c00'; };
  }

  // ---------- 章节页 ----------
  function renderChapter(main, ch) {
    main.innerHTML = `
      <div class="column">
      <div class="ch-title-row">
        <h1>${ch.id} · ${ch.title}</h1>
        <span class="badge">${ch.mech}</span>
        <span class="badge s-badge">${S_MAP[ch.id] || ''}</span>
      </div>
      <div class="tabs">
        <button class="tab active" data-tab="read">📖 阅读</button>
        ${ch.sim ? '<button class="tab" data-tab="sim">🧪 模拟器</button>' : ''}
      </div>
      <div id="tab-read" class="tabpane">
        <div class="read">${ch.read}</div>
        <h3 class="quiz-title">预测题(先预测,再揭示)</h3>
        <div id="quiz"></div>
        <div class="ch-footer">
          <button id="done-btn"></button>
          <span class="ch-nav">${prevNext(ch)}</span>
        </div>
      </div>
      ${ch.sim ? '<div id="tab-sim" class="tabpane" style="display:none"></div>' : ''}
      </div>`;

    Quiz.mount(document.getElementById('quiz'), ch.id, ch.quiz);

    const doneBtn = document.getElementById('done-btn');
    function refreshDone() {
      const d = !!store.done[ch.id];
      doneBtn.textContent = d ? '✓ 已完成(点击取消)' : '标记本章完成';
      doneBtn.classList.toggle('is-done', d);
    }
    doneBtn.onclick = () => { store.set(ch.id, !store.done[ch.id]); refreshDone(); renderSidebar(); };
    refreshDone();

    if (ch.sim) {
      const pane = document.getElementById('tab-sim');
      const simHost = document.createElement('div');
      simHost.style.paddingTop = '10px';
      pane.appendChild(simHost);
      if (ch.sim.type === 'eventloop') EventLoopSim.mount(simHost);
      else if (ch.sim.type === 'narrow') NarrowSim.mount(simHost);
      else if (ch.sim.type === 'erase') EraseSim.mount(simHost);
      else if (ch.sim.type === 'promise') PromiseSim.mount(simHost);
      else if (ch.sim.type === 'closure') ClosureSim.mount(simHost);
      else if (ch.sim.type === 'reach') ReachSim.mount(simHost);
      else if (ch.sim.type === 'store') StoreSim.mount(simHost);
      else if (ch.sim.type === 'jsx') JsxSim.mount(simHost);
      else if (ch.sim.type === 'diff') DiffSim.mount(simHost);
      else if (ch.sim.type === 'hooks') HooksSim.mount(simHost);
      else if (ch.sim.type === 'cors') CorsSim.mount(simHost);
      else if (ch.sim.type === 'query') QuerySim.mount(simHost);
    }

    main.querySelectorAll('.tab').forEach((t) => {
      t.onclick = () => {
        main.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
        t.classList.add('active');
        ['read', 'sim'].forEach((name) => {
          const el = document.getElementById('tab-' + name);
          if (el) el.style.display = t.dataset.tab === name ? '' : 'none';
        });
      };
    });
  }

  function prevNext(ch) {
    const i = ORDERED.indexOf(ch);
    const parts = [];
    if (i > 0) parts.push(`<a href="#/${ORDERED[i - 1].id}">← ${ORDERED[i - 1].id}</a>`);
    if (i < ORDERED.length - 1) parts.push(`<a href="#/${ORDERED[i + 1].id}">${ORDERED[i + 1].id} →</a>`);
    return parts.join('　');
  }

  window.addEventListener('hashchange', render);
  render();
})();
