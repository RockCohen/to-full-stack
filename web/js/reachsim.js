// reachsim.js — 可达性与 GC 模拟器:GC Roots / 对象图 / 堆存活
// 预设是预先算好的确定性轨迹:每步标出每个对象"可达 / 不可达 / 已回收"。
export const ReachSim = (function () {
  'use strict';

  const n = (id, label, refs, st) => ({ id, label, refs, st: st || 'live' });

  const PRESETS = [
    {
      name: '① 断链即垃圾:引用没了,GC 就收',
      steps: [
        {
          nodes: [
            n('root', 'GC Roots(Window / 当前栈)', ['page']),
            n('page', '页面状态 page', ['detail']),
            n('detail', '详情视图 detailView', ['lines']),
            n('lines', '订单明细数组(100 万行)', []),
          ],
          ex: '初始:从 GC Roots 出发,page → detail → lines 全部【可达】,一个都不能回收。堆存活:3 个对象。',
        },
        {
          nodes: [
            n('root', 'GC Roots(Window / 当前栈)', ['page']),
            n('page', '页面状态 page', []),
            n('detail', '详情视图 detailView', ['lines'], 'unreach'),
            n('lines', '订单明细数组(100 万行)', [], 'unreach'),
          ],
          note: '用户离开详情页:page 对 detailView 的引用被置空。',
          ex: '引用一断,detail 和 lines 从 Roots 出发已经【走不到了】——它们立刻变为"不可达",进入待回收名单。',
        },
        {
          nodes: [
            n('root', 'GC Roots(Window / 当前栈)', ['page']),
            n('page', '页面状态 page', []),
            n('detail', 'detailView(已被回收)', [], 'freed'),
            n('lines', 'lines(已被回收)', [], 'freed'),
          ],
          note: 'GC 跑了一趟(新生代/老生代各按各的算法)。',
          ex: 'GC 只认可达性,不读心:它不知道"你以后还用不用",只知道"现在够不够得着"。堆存活:1 个对象。',
        },
      ],
    },
    {
      name: '② 泄漏:定时器闭包把对象"焊"在可达区',
      steps: [
        {
          nodes: [
            n('root', 'GC Roots(Window / 当前栈 / 定时器调度)', ['timer']),
            n('timer', 'setInterval 的回调闭包', ['lines']),
            n('lines', '已离开页面的订单明细(100 万行)', []),
          ],
          ex: '用户已离开页面,但离开时忘了 clearInterval。定时器是 Roots 的一部分——它的回调闭包【仍被调度器引用】。',
        },
        {
          nodes: [
            n('root', 'GC Roots(Window / 当前栈 / 定时器调度)', ['timer']),
            n('timer', 'setInterval 的回调闭包', ['lines']),
            n('lines', '已离开页面的订单明细(100 万行)', []),
          ],
          ex: '从 Roots 出发:Roots → timer → 闭包 → lines。链条完整,lines 【永远可达】——尽管全世界都知道它再也不会被用。',
        },
        {
          nodes: [
            n('root', 'GC Roots(Window / 当前栈 / 定时器调度)', []),
            n('timer', 'clearInterval 之后', []),
            n('lines', '已离开页面的订单明细(100 万行)', [], 'freed'),
          ],
          note: '修复:离开页面时 clearInterval(timer)。',
          ex: '断掉 Roots → timer 这一条,timer 和 lines 整条链下沉为不可达,GC 一趟带走。泄漏 = 忘记断链,没有第二种成因。',
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
        <select id="rs-preset" aria-label="选择预设"></select>
        <button class="sim-btn" id="rs-step">单步 ▶</button>
        <button class="sim-btn" id="rs-auto">自动 ⏩</button>
        <button class="sim-btn" id="rs-reset">↺ 重置</button>
        <span class="sim-progress" id="rs-progress"></span>
      </div>
      <div class="pc-grid" id="rs-nodes"></div>
      <div id="rs-note"></div>
      <div class="sim-explain" id="rs-explain"></div>`;

    const sel = wrap.querySelector('#rs-preset');
    PRESETS.forEach((p, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = p.name;
      sel.appendChild(o);
    });

    function esc(s) {
      return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    }
    function render() {
      const step = PRESETS[pi].steps[si];
      const alive = step.nodes.filter((x) => x.st === 'live').length - 1; // 不含 Roots
      wrap.querySelector('#rs-nodes').innerHTML = step.nodes
        .map((nd) => {
          const cls = nd.st === 'freed' ? 'rcard freed' : nd.st === 'unreach' ? 'rcard unreach' : nd.id === 'root' ? 'rcard root' : 'rcard';
          const tag =
            nd.st === 'unreach'
              ? '<span class="pc-state" style="background:rgba(255,159,10,.14);color:#b57608">不可达</span>'
              : nd.st === 'freed'
                ? '<span class="pc-state" style="background:rgba(255,55,95,.10);color:#d81b4c">已回收</span>'
                : '<span class="pc-state" style="background:rgba(40,205,65,.12);color:#17853a">可达</span>';
          const refs = nd.refs.length ? `<div class="pc-cbs">→ 引用: ${esc(nd.refs.join(', '))}</div>` : '';
          return `<div class="${cls}"><div class="pc-name">${esc(nd.label)}</div>${tag}${refs}</div>`;
        })
        .join('');
      wrap.querySelector('#rs-note').innerHTML = step.note
        ? `<div class="sim-explain" style="border-color:var(--orange);background:rgba(255,159,10,.08);color:#7a5a12;margin-bottom:10px">${esc(step.note)}</div>`
        : '';
      wrap.querySelector('#rs-explain').innerHTML =
        `${esc(step.ex)}<div style="margin-top:6px;color:var(--dim);font-size:12px">堆存活(不含 Roots):${alive} 个对象</div>`;
      wrap.querySelector('#rs-progress').textContent = `步 ${si + 1}/${PRESETS[pi].steps.length}`;
      wrap.querySelector('#rs-step').disabled = si >= PRESETS[pi].steps.length - 1;
      wrap.querySelector('#rs-auto').disabled = si >= PRESETS[pi].steps.length - 1;
    }
    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; wrap.querySelector('#rs-auto').textContent = '自动 ⏩'; }
    }
    sel.onchange = () => { stopAuto(); pi = Number(sel.value); si = 0; render(); };
    wrap.querySelector('#rs-step').onclick = () => { stopAuto(); if (si < PRESETS[pi].steps.length - 1) { si++; render(); } };
    wrap.querySelector('#rs-reset').onclick = () => { stopAuto(); si = 0; render(); };
    wrap.querySelector('#rs-auto').onclick = () => {
      if (timer) { stopAuto(); return; }
      wrap.querySelector('#rs-auto').textContent = '暂停 ⏸';
      timer = setInterval(() => {
        if (si < PRESETS[pi].steps.length - 1) { si++; render(); } else stopAuto();
      }, 1500);
    };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
