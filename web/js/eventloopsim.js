// eventloopsim.js — 事件循环模拟器:调用栈 / 微任务队列 / 宏任务队列 / 输出
// 每个预设是一条预先算好的执行轨迹(每步 = 四个面板的完整快照),单步播放,保证时序教学零翻车。
// 步骤字段: { line: 高亮代码行, stack/micro/macro/out: string[], hl: 高亮面板, explain: 一句话 }
export const EventLoopSim = (function () {
  'use strict';

  const PRESETS = [
    {
      name: '① 基本时序:为什么是 1,4,3,2',
      code: [
        "console.log('1');",
        "setTimeout(() => console.log('2'), 0);",
        "Promise.resolve().then(() => console.log('3'));",
        "console.log('4');",
      ],
      steps: [
        { line: -1, stack: [], micro: [], macro: [], out: [], hl: '', explain: '初始:主线程空闲,两个队列都空。点"单步 ▶"开始。' },
        { line: 0, stack: ["log('1')"], micro: [], macro: [], out: ['1'], hl: 'stack', explain: '同步代码说到就到:log(1) 压栈 → 打印 → 立刻弹栈,从不排队。' },
        { line: 1, stack: ['setTimeout(cb2)'], micro: [], macro: ['cb2'], out: ['1'], hl: 'macro', explain: 'setTimeout 不执行回调,只登记:cb2 进宏任务队列,等下一个调度周期。参数 0 的意思是"尽快",不是"现在"。' },
        { line: 2, stack: ['then(cb3)'], micro: ['cb3'], macro: ['cb2'], out: ['1'], hl: 'micro', explain: 'Promise.then 把 cb3 登记进微任务队列——高优先级,本轮必须清空。' },
        { line: 3, stack: ["log('4')"], micro: ['cb3'], macro: ['cb2'], out: ['1', '4'], hl: 'stack', explain: '继续同步:log(4) 打印。注意 cb3 还在排队——同步代码永远先跑完。' },
        { line: -1, stack: [], micro: ['cb3'], macro: ['cb2'], out: ['1', '4'], hl: 'micro', explain: '主脚本跑完,调用栈空了。事件循环的第一件事:清空微任务队列!' },
        { line: 2, stack: ['cb3'], micro: [], macro: ['cb2'], out: ['1', '4', '3'], hl: 'micro', explain: 'cb3 出队压栈 → 打印 3 → 弹栈。微任务清空。' },
        { line: 1, stack: ['cb2'], micro: [], macro: [], out: ['1', '4', '3', '2'], hl: 'macro', explain: '微任务空了,才轮到宏任务:cb2 出队 → 打印 2。所以顺序是 1,4,3,2。' },
        { line: -1, stack: [], micro: [], macro: [], out: ['1', '4', '3', '2'], hl: '', explain: '栈空、双队列空:本轮事件循环结束,主线程休眠,等新事件(点击/网络/定时器)叫醒它。' },
      ],
    },
    {
      name: '② 微任务饿死:宏任务永远轮不到',
      code: [
        'function loop() {',
        '  Promise.resolve().then(loop); // 每跑一次,再塞一个自己',
        '}',
        'loop();',
        "setTimeout(() => console.log('🛟 宏任务:轮到我了吗?'), 100);",
        "console.log('main 返回');",
      ],
      steps: [
        { line: -1, stack: [], micro: [], macro: [], out: [], hl: '', explain: '初始。这个程序有一个 100ms 的"逃生舱"定时器——看看它能不能响。' },
        { line: 3, stack: ['loop()'], micro: [], macro: [], out: [], hl: 'stack', explain: 'loop() 压栈,同步执行。' },
        { line: 1, stack: ['loop'], micro: ['loop'], macro: [], out: [], hl: 'micro', explain: 'then 登记微任务 ← loop。注意:栈里的是"这一次调用",队列里的是"下一次调用"。' },
        { line: 4, stack: [], micro: ['loop'], macro: ['🛟 cb'], out: [], hl: 'macro', explain: 'setTimeout 登记 🛟:100ms 后它想上台表演。' },
        { line: 5, stack: ["log('main 返回')"], micro: ['loop'], macro: ['🛟 cb'], out: ['main 返回'], hl: 'stack', explain: '同步收尾。主脚本即将把控制权交还事件循环。' },
        { line: -1, stack: [], micro: ['loop'], macro: ['🛟 cb'], out: ['main 返回'], hl: 'micro', explain: '栈空,事件循环开始清微任务——噩梦的开始。' },
        { line: 1, stack: ['loop'], micro: [], macro: ['🛟 cb'], out: ['main 返回'], hl: 'stack', explain: 'loop 出队压栈:它唯一的任务,是再注册一个 loop。' },
        { line: 1, stack: [], micro: ['loop'], macro: ['🛟 cb'], out: ['main 返回'], hl: 'micro', explain: '清空了吗?没有。刚清掉一个,又冒出来一个。' },
        { line: 1, stack: ['loop'], micro: [], macro: ['🛟 cb'], out: ['main 返回'], hl: 'stack', explain: '再来一遍……(真实世界里这个循环每秒几千圈,永远到不了下一步)' },
        { line: 1, stack: [], micro: ['loop'], macro: ['🛟 cb'], out: ['main 返回'], hl: 'macro', explain: '事件循环被焊死在"清微任务"阶段——🛟 永远轮不到,这叫饿死。对照:同步 while(true) 是彻底卡死;微任务自旋是"还在干活,但只干坏事"。' },
      ],
      deadMacro: true,
    },
    {
      name: '③ await 的真面目:让出',
      code: [
        'async function a() {',
        "  console.log('a1');",
        '  await null;        // ← 让出',
        "  console.log('a3'); // ← 余下代码被打包成微任务",
        '}',
        "console.log('start');",
        'a();',
        "console.log('end');",
      ],
      steps: [
        { line: -1, stack: [], micro: [], macro: [], out: [], hl: '', explain: '初始。请全程盯住"调用栈":await 之后,栈里还有谁?' },
        { line: 5, stack: ["log('start')"], micro: [], macro: [], out: ['start'], hl: 'stack', explain: '同步代码:start 打印。' },
        { line: 1, stack: ["a() → log('a1')"], micro: [], macro: [], out: ['start', 'a1'], hl: 'stack', explain: 'a() 压栈,同步执行到 await 之前:a1 打印。此刻 a 的栈帧还在。' },
        { line: 2, stack: [], micro: ['a 的余下代码(a3)'], macro: [], out: ['start', 'a1'], hl: 'micro', explain: '遇到 await:a 把余下代码登记成微任务,自己的栈帧弹出——让出!没有线程在等待,只是"登记叫号"。' },
        { line: 7, stack: ["log('end')"], micro: ['a3'], macro: [], out: ['start', 'a1', 'end'], hl: 'stack', explain: '主脚本继续,它压根没等 a:end 打印。"end 抢在 a3 前面"的现场。' },
        { line: 3, stack: ['a3'], micro: [], macro: [], out: ['start', 'a1', 'end', 'a3'], hl: 'micro', explain: '栈空,清微任务:a3 终于上台。' },
        { line: -1, stack: [], micro: [], macro: [], out: ['start', 'a1', 'end', 'a3'], hl: '', explain: '终态 start,a1,end,a3。await 阻塞的只是这个 async 函数的控制流,不是任何线程——它阻塞的是"自己",让出的是"大家"。' },
      ],
    },
    {
      name: '④ 双链交替:不是 1,2,3,4',
      code: [
        "Promise.resolve().then(() => log(1)).then(() => log(2));",
        "Promise.resolve().then(() => log(3)).then(() => log(4));",
      ],
      steps: [
        { line: -1, stack: [], micro: [], macro: [], out: [], hl: '', explain: '初始。猜输出顺序?先猜,再单步打脸。' },
        { line: 0, stack: [], micro: ['cb1'], macro: [], out: [], hl: 'micro', explain: '链 1 第一环注册:微任务 ← cb1。' },
        { line: 1, stack: [], micro: ['cb1', 'cb3'], macro: [], out: [], hl: 'micro', explain: '链 2 第一环注册:cb3 排在 cb1 后面。' },
        { line: 0, stack: ['cb1'], micro: ['cb3'], macro: [], out: ['1'], hl: 'micro', explain: '清微任务:cb1 出队 → 打印 1 → 它的 .then 立刻注册 cb2,排到队尾。' },
        { line: 1, stack: ['cb3'], micro: ['cb2', 'cb4'], macro: [], out: ['1', '3'], hl: 'micro', explain: 'cb3 出队 → 打印 3 → 注册 cb4。两条链开始你一个我一个。' },
        { line: 0, stack: ['cb2'], micro: ['cb4'], macro: [], out: ['1', '3', '2'], hl: 'micro', explain: 'cb2 出队 → 打印 2。' },
        { line: 1, stack: ['cb4'], micro: [], macro: [], out: ['1', '3', '2', '4'], hl: 'micro', explain: 'cb4 出队 → 打印 4。终态 1,3,2,4——不是 1,2,3,4!每个 then 的回调按"注册时刻"排队。' },
        { line: -1, stack: [], micro: [], macro: [], out: ['1', '3', '2', '4'], hl: '', explain: '对照后端:两个高优先级 job 各自投递后续 job,调度自然是交错的——单队列公平轮转,没有"整链插队"。' },
      ],
    },
  ];

  function mount(host) {
    const wrap = document.createElement('div');
    wrap.className = 'sim-wrap';
    let pi = 0, si = 0, timer = null;

    wrap.innerHTML = `
      <div class="sim-toolbar">
        <select id="el-preset" aria-label="选择预设"></select>
        <button class="sim-btn" id="el-step">单步 ▶</button>
        <button class="sim-btn" id="el-auto">自动 ⏩</button>
        <button class="sim-btn" id="el-reset">↺ 重置</button>
        <span class="sim-progress" id="el-progress"></span>
      </div>
      <div class="sim-code" id="el-code"></div>
      <div class="sim-panels">
        <div class="sim-panel p-stack" id="p-stack"><h4>调用栈(唯一)</h4><div class="sim-items"></div></div>
        <div class="sim-panel p-micro" id="p-micro"><h4>微任务队列(本轮清空)</h4><div class="sim-items"></div></div>
        <div class="sim-panel p-macro" id="p-macro"><h4>宏任务队列(下一轮)</h4><div class="sim-items"></div></div>
        <div class="sim-panel p-out" id="p-out"><h4>输出</h4><div class="sim-items"></div></div>
      </div>
      <div class="sim-explain" id="el-explain"></div>`;

    const sel = wrap.querySelector('#el-preset');
    PRESETS.forEach((p, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = p.name;
      sel.appendChild(o);
    });

    const codeEl = wrap.querySelector('#el-code');
    const panels = {
      stack: wrap.querySelector('#p-stack .sim-items'),
      micro: wrap.querySelector('#p-micro .sim-items'),
      macro: wrap.querySelector('#p-macro .sim-items'),
      out: wrap.querySelector('#p-out .sim-items'),
    };
    const panelBoxes = {
      stack: wrap.querySelector('#p-stack'),
      micro: wrap.querySelector('#p-micro'),
      macro: wrap.querySelector('#p-macro'),
      out: wrap.querySelector('#p-out'),
    };

    function render() {
      const preset = PRESETS[pi];
      const step = preset.steps[si];
      codeEl.innerHTML = preset.code
        .map((l, i) => `<span class="ln${i === step.line ? ' hl' : ''}">${escape(l)}</span>`)
        .join('');
      for (const k of ['stack', 'micro', 'macro', 'out']) {
        const items = step[k];
        panels[k].innerHTML = items.length
          ? items.map((t) => `<div class="sim-item">${escape(t)}</div>`).join('')
          : '<div class="sim-empty">— 空 —</div>';
        panelBoxes[k].classList.toggle('flash', step.hl === k);
        if (k === 'macro' && preset.deadMacro && si >= preset.steps.length - 2) {
          panelBoxes[k].classList.add('dead');
        } else {
          panelBoxes[k].classList.remove('dead');
        }
      }
      wrap.querySelector('#el-explain').textContent = step.explain;
      wrap.querySelector('#el-progress').textContent = `步 ${si + 1}/${preset.steps.length}`;
      wrap.querySelector('#el-step').disabled = si >= preset.steps.length - 1;
      wrap.querySelector('#el-auto').disabled = si >= preset.steps.length - 1;
    }

    function escape(s) {
      return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    }

    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; wrap.querySelector('#el-auto').textContent = '自动 ⏩'; }
    }

    sel.onchange = () => { stopAuto(); pi = Number(sel.value); si = 0; render(); };
    wrap.querySelector('#el-step').onclick = () => { stopAuto(); if (si < PRESETS[pi].steps.length - 1) { si++; render(); } };
    wrap.querySelector('#el-reset').onclick = () => { stopAuto(); si = 0; render(); };
    wrap.querySelector('#el-auto').onclick = () => {
      if (timer) { stopAuto(); return; }
      wrap.querySelector('#el-auto').textContent = '暂停 ⏸';
      timer = setInterval(() => {
        if (si < PRESETS[pi].steps.length - 1) { si++; render(); } else stopAuto();
      }, 1100);
    };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
