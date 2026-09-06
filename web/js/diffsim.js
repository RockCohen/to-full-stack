// diffsim.js — 虚拟 DOM diff 模拟器:旧树/新树/diff 操作序列(逐步亮起)
export const DiffSim = (function () {
  'use strict';

  const PRESETS = [
    {
      name: '① 同类型:只更新变化的文本',
      old: ['div', '  ├─ td "A-001"', '  └─ td "300 元"'],
      neo: ['div', '  ├─ td "A-001"', '  └─ td "350 元"'],
      steps: [
        { ops: ['新旧两棵树就位,准备 diff'], ex: 'diff 从两棵树的根开始,同层同位置逐对比较。' },
        { ops: ['位置0:div vs div → 同类型,复用节点,继续比孩子', '位置0 的文本:A-001 → A-001,没变,跳过'], ex: '同类型 → 复用真实 DOM 节点,只往下比。' },
        { ops: ['……', '位置1 的文本:300 元 → 350 元,变了 → 更新该文本节点'], ex: '唯一的变化被精确定位:更新 1 个文本节点。真实 DOM 只动了这一处。' },
      ],
    },
    {
      name: '② 列表无 key:删一行,代价两行改写',
      old: ['ul', '  ├─ li[0] "A-001"', '  ├─ li[1] "B-002"', '  └─ li[2] "C-003"'],
      neo: ['ul', '  ├─ li[0] "B-002"', '  └─ li[1] "C-003"'],
      steps: [
        { ops: ['无 key → 按位置配对:位置0 vs 位置0,位置1 vs 位置1,多余的位置2 删除'], ex: '没有 key,React 只能按【位置】配对新旧孩子。' },
        { ops: ['位置0:A-001 → B-002 → 文本更新①', '位置1:B-002 → C-003 → 文本更新②', '位置2:C-003 → 多余 → 删除'], ex: '明明只是"删了第一行",却付出 2 次文本更新 + 1 次删除的代价。' },
        { ops: ['(共 3 次 DOM 操作)'], ex: '行内有状态时更糟:实例按位置复用,状态全部串位——门诊 1 号的全案。' },
      ],
    },
    {
      name: '③ 列表有 key:身份对齐,精准增删',
      old: ['ul', '  ├─ li[key=A] "A-001"', '  ├─ li[key=B] "B-002"', '  └─ li[key=C] "C-003"'],
      neo: ['ul', '  ├─ li[key=B] "B-002"', '  └─ li[key=C] "C-003"'],
      steps: [
        { ops: ['有 key → 按【key】对齐身份:A/B/C 三张身份证比对'], ex: 'key 就是主键:身份不随位置漂移。' },
        { ops: ['key=A:新列表里没有 → 删除', 'key=B:两边都有 → 保留不动', 'key=C:两边都有 → 保留不动'], ex: '按身份证比对:B、C 原封不动,A 被点名删除。' },
        { ops: ['(共 1 次 DOM 操作)'], ex: '同样的"删首行",有 key 只要 1 次删除——无 key 要 3 次,且行内状态串位。key 是主键,不是序号。' },
      ],
    },
  ];

  function mount(host) {
    const wrap = document.createElement('div');
    wrap.className = 'sim-wrap';
    let pi = 0, si = 0;

    wrap.innerHTML = `
      <div class="sim-toolbar">
        <select id="ds-preset" aria-label="选择预设"></select>
        <button class="sim-btn" id="ds-step">单步 ▶</button>
        <button class="sim-btn" id="ds-reset">↺ 重置</button>
        <span class="sim-progress" id="ds-progress"></span>
      </div>
      <div class="duo">
        <div class="pane ts"><span class="pane-tag">旧树 · 上一帧的 vdom</span><pre class="sim-code" id="ds-old"></pre></div>
        <div class="pane jv"><span class="pane-tag">新树 · 这一帧的 vdom</span><pre class="sim-code" id="ds-new"></pre></div>
      </div>
      <div class="sim-panel" style="margin-top:12px"><h4>diff 操作序列</h4><div class="sim-items" id="ds-ops"></div></div>
      <div class="sim-explain" id="ds-explain"></div>`;

    const sel = wrap.querySelector('#ds-preset');
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
      const p = PRESETS[pi];
      wrap.querySelector('#ds-old').innerHTML = p.old.map((l) => `<span class="ln">${esc(l)}</span>`).join('');
      wrap.querySelector('#ds-new').innerHTML = p.neo.map((l) => `<span class="ln">${esc(l)}</span>`).join('');
      const ops = p.steps[si].ops;
      wrap.querySelector('#ds-ops').innerHTML = ops.length
        ? ops.map((t, i) => `<div class="sim-item">${i + 1}. ${esc(t)}</div>`).join('')
        : '<div class="sim-empty">— 尚无操作 —</div>';
      wrap.querySelector('#ds-explain').textContent = p.steps[si].ex;
      wrap.querySelector('#ds-progress').textContent = `步 ${si + 1}/${p.steps.length}`;
      wrap.querySelector('#ds-step').disabled = si >= p.steps.length - 1;
    }
    sel.onchange = () => { pi = Number(sel.value); si = 0; render(); };
    wrap.querySelector('#ds-step').onclick = () => { if (si < PRESETS[pi].steps.length - 1) { si++; render(); } };
    wrap.querySelector('#ds-reset').onclick = () => { si = 0; render(); };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
