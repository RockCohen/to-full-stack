// closuresim.js — 闭包模拟器:调用栈帧 / 堆上被捕获的环境 / 输出
// 预设是预先算好的确定性轨迹;每步 = 三个面板的完整快照。
export const ClosureSim = (function () {
  'use strict';

  const PRESETS = [
    {
      name: '① makeCounter:变量逃逸到堆',
      steps: [
        {
          stack: ['makeCounter() 帧  { count: 0 }'], heap: [], out: [], hl: 'stack',
          ex: '调用 makeCounter:新帧入栈,局部变量 count 就住在这个帧里——按 Java 直觉,函数返回时它会随帧灰飞烟灭。',
        },
        {
          stack: ['makeCounter 帧(返回内函数…)'], heap: ['环境 E1 { count: 0 } ←被返回的函数抓住'], out: [], hl: 'heap',
          ex: 'return 内函数:帧本该销毁,但内函数抓住了它的变量表——整个环境被【搬到堆上】。这就是逃逸:主动的,不是事故。',
        },
        {
          stack: [], heap: ['环境 E1 { count: 0 } ← next 抓着'], out: [], hl: 'heap',
          ex: '栈已经空了,count 还活着。它现在住堆上,寿命由"还有没人抓着 E1"决定——GC 说了算。',
        },
        {
          stack: ['next() 帧'], heap: ['环境 E1 { count: 1 } ← next 抓着'], out: ['1'], hl: 'heap',
          ex: '第一次调用 next:它不自己建 count,而是找到 E1,count +1。S9 实验卡 E1 的第一行,此刻有了画面。',
        },
        {
          stack: ['next() 帧'], heap: ['环境 E1 { count: 2 } ← next 抓着'], out: ['1', '2'], hl: 'heap',
          ex: '再调一次,同一个 E1,count 变 2。捕获的是【变量】,不是拷贝的值。',
        },
        {
          stack: [], heap: ['环境 E1 { count: 2 }', '环境 E2 { count: 0 }'], out: ['1', '2'], hl: '',
          ex: '再调一次 makeCounter 得到 b:堆上多了一个全新的 E2。a 与 b 各抓各的环境,互不干扰——实验卡 E1 的答案。',
        },
      ],
    },
    {
      name: '② 循环里的 var 与 let:几个盒子?',
      steps: [
        {
          stack: [], heap: ['盒子 A(var i,函数级): i = 3'], out: ['3', '3', '3'], hl: 'heap',
          ex: 'var 版结局:var 的作用域是整个函数——三个回调共享【同一个盒子】,循环跑完 i=3,三次输出全是 3。',
        },
        {
          stack: [], heap: ['盒子 var-i: i = 3(三个回调共享)'], out: ['3', '3', '3'], hl: '',
          ex: '回看过程:每次循环回调登记时,抓的都是这同一个盒子;等回调真正执行,i 早就被循环跑到了 3。',
        },
        {
          stack: [], heap: ['盒子 let-0: j = 0(回调①抓着)', '盒子 let-1: j = 1(回调②抓着)', '盒子 let-2: j = 2(回调③抓着)'], out: ['0', '1', '2'], hl: 'heap',
          ex: 'let 版:每轮迭代一个新盒子,三个回调各抓各的 → 输出 0,1,2。',
        },
        {
          stack: [], heap: ['(var:1 个共享盒子) vs (let:每轮 1 个新盒子)'], out: ['3,3,3 vs 0,1,2'], hl: '',
          ex: 'Java 匿名内部类强制 final,等于只许"每轮一个新盒子";JS 的 var 敞着门,let 把选择权还给你——门诊 1 号的全案。',
        },
      ],
    },
  ];

  function mount(host) {
    const wrap = document.createElement('div');
    wrap.className = 'sim-wrap';
    let pi = 0, si = 0, timer = null;

    wrap.innerHTML = `
      <div class="sim-toolbar">
        <select id="cs-preset" aria-label="选择预设"></select>
        <button class="sim-btn" id="cs-step">单步 ▶</button>
        <button class="sim-btn" id="cs-auto">自动 ⏩</button>
        <button class="sim-btn" id="cs-reset">↺ 重置</button>
        <span class="sim-progress" id="cs-progress"></span>
      </div>
      <div class="sim-panels" style="grid-template-columns: 1fr 1.4fr 0.9fr;">
        <div class="sim-panel p-stack" id="cs-stack"><h4>调用栈(帧)</h4><div class="sim-items"></div></div>
        <div class="sim-panel p-micro" id="cs-heap"><h4>堆(被捕获的环境)</h4><div class="sim-items"></div></div>
        <div class="sim-panel p-out" id="cs-out"><h4>输出</h4><div class="sim-items"></div></div>
      </div>
      <div class="sim-explain" id="cs-explain"></div>`;

    const sel = wrap.querySelector('#cs-preset');
    PRESETS.forEach((p, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = p.name;
      sel.appendChild(o);
    });

    const panels = {
      stack: wrap.querySelector('#cs-stack .sim-items'),
      heap: wrap.querySelector('#cs-heap .sim-items'),
      out: wrap.querySelector('#cs-out .sim-items'),
    };
    const boxes = { stack: wrap.querySelector('#cs-stack'), heap: wrap.querySelector('#cs-heap'), out: wrap.querySelector('#cs-out') };

    function esc(s) {
      return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    }
    function render() {
      const step = PRESETS[pi].steps[si];
      for (const k of ['stack', 'heap', 'out']) {
        const items = step[k];
        panels[k].innerHTML = items.length
          ? items.map((t) => `<div class="sim-item">${esc(t)}</div>`).join('')
          : '<div class="sim-empty">— 空 —</div>';
        boxes[k].classList.toggle('flash', step.hl === k);
      }
      wrap.querySelector('#cs-explain').textContent = step.ex;
      wrap.querySelector('#cs-progress').textContent = `步 ${si + 1}/${PRESETS[pi].steps.length}`;
      wrap.querySelector('#cs-step').disabled = si >= PRESETS[pi].steps.length - 1;
      wrap.querySelector('#cs-auto').disabled = si >= PRESETS[pi].steps.length - 1;
    }
    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; wrap.querySelector('#cs-auto').textContent = '自动 ⏩'; }
    }
    sel.onchange = () => { stopAuto(); pi = Number(sel.value); si = 0; render(); };
    wrap.querySelector('#cs-step').onclick = () => { stopAuto(); if (si < PRESETS[pi].steps.length - 1) { si++; render(); } };
    wrap.querySelector('#cs-reset').onclick = () => { stopAuto(); si = 0; render(); };
    wrap.querySelector('#cs-auto').onclick = () => {
      if (timer) { stopAuto(); return; }
      wrap.querySelector('#cs-auto').textContent = '暂停 ⏸';
      timer = setInterval(() => {
        if (si < PRESETS[pi].steps.length - 1) { si++; render(); } else stopAuto();
      }, 1400);
    };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
