// app.js — 课程平台骨架:侧栏路由、双视图(阅读/模拟器)、进度记录
import { CHAPTERS } from './chapters.js';
import { Quiz } from './quiz.js';
import { Sync } from './sync.js';
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
    set(k, v) { const d = this.done; if (v) d[k] = 1; else delete d[k]; localStorage.setItem('to-full-stack-progress', JSON.stringify(d)); Sync.noteLocalChange(); },
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

  // ---------- 侧栏底部 · 云同步面板 ----------
  function fmtAgo(ts) {
    if (!ts) return '已开启';
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return '刚刚同步';
    if (s < 3600) return Math.floor(s / 60) + ' 分钟前同步';
    if (s < 86400) return Math.floor(s / 3600) + ' 小时前同步';
    return Math.floor(s / 86400) + ' 天前同步';
  }

  function statusText() {
    if (Sync.status === 'syncing') return '同步中…';
    if (Sync.status === 'pending') return '待同步…';
    if (Sync.status === 'error') return Sync.errMsg;
    return fmtAgo(Sync.lastAt());
  }

  function tryImport(imp) {
    const err = Sync.enable(imp.value);
    imp.value = '';
    imp.placeholder = err || '输入已有同步码';
  }

  function renderSyncBox() {
    const box = document.getElementById('sync-box');
    if (!box) return;
    box.innerHTML = '';
    const code = Sync.getCode();

    const title = document.createElement('div');
    title.className = 'sync-title';
    box.appendChild(title);

    if (!code) {
      title.textContent = '☁️ 云同步未开启';
      const hint = document.createElement('p');
      hint.className = 'sync-hint';
      hint.textContent = '进度现只存本机浏览器。开启后生成 12 位同步码,在任何设备凭码即可找回进度。';
      const row = document.createElement('div');
      row.className = 'sync-row';
      const on = document.createElement('button');
      on.className = 'sync-btn';
      on.textContent = '开启云同步';
      on.onclick = () => Sync.enable();
      const imp = document.createElement('input');
      imp.className = 'sync-import';
      imp.placeholder = '输入已有同步码';
      imp.maxLength = 12;
      imp.spellcheck = false;
      imp.onkeydown = (e) => { if (e.key === 'Enter') tryImport(imp); };
      const impBtn = document.createElement('button');
      impBtn.className = 'sync-btn';
      impBtn.textContent = '导入';
      impBtn.onclick = () => tryImport(imp);
      row.append(on, imp, impBtn);
      box.append(hint, row);
      return;
    }

    title.textContent = '☁️ 云同步 · ';
    const st = document.createElement('span');
    st.className = 'sync-status' + (Sync.status === 'error' ? ' is-err' : '');
    st.textContent = statusText();
    title.appendChild(st);

    const row = document.createElement('div');
    row.className = 'sync-row';
    const codeEl = document.createElement('code');
    codeEl.className = 'sync-code';
    codeEl.textContent = code.replace(/^(.{4})(.{4})/, '$1 $2 ');
    codeEl.title = '在新设备输入此码即可找回进度';
    const copy = document.createElement('button');
    copy.className = 'sync-btn';
    copy.textContent = '复制';
    copy.onclick = () => {
      navigator.clipboard.writeText(code).then(() => {
        copy.textContent = '已复制';
        setTimeout(() => { copy.textContent = '复制'; }, 1500);
      });
    };
    row.append(codeEl, copy);

    const off = document.createElement('button');
    off.className = 'sync-btn subtle';
    off.textContent = '解除本机绑定';
    off.onclick = () => {
      if (confirm('解除后本机不再自动同步(服务器进度保留,凭同步码可找回)。确定解除?')) Sync.disable();
    };

    box.append(row, off);
  }

  function render() {
    const main = document.getElementById('main');
    const id = route();
    renderSidebar();
    renderSyncBox();
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

  // 同步状态变化:刷新面板;远端数据合入后连侧栏 ✓ 一起刷新(导入/启动拉取后立即可见)
  function onSyncChange() {
    renderSyncBox();
    if (Sync.status === 'ok') renderSidebar();
  }
  Sync.init(onSyncChange);
  window.addEventListener('hashchange', render);
  render();
})();
