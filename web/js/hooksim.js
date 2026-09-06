// hooksim.js — Hooks 槽位模拟器:两帧渲染,槽位按序寻址;条件调用 → 错位报错
export const HooksSim = (function () {
  'use strict';

  const PRESETS = [
    {
      name: '① 正常:两帧渲染,槽位按序对齐',
      frames: [
        { label: '第 1 帧(挂载)', hooks: [{ kind: 'useState(count)', note: '新建槽位,值=0' }, { kind: 'useEffect(拉取订单)', note: '登记 effect,deps=[]' }] },
        { label: '第 2 帧(setCount 后)', hooks: [{ kind: 'useState(count)', note: '认领槽位①,值=1' }, { kind: 'useEffect(拉取订单)', note: 'deps 没变,跳过' }] },
      ],
      steps: [
        { frameIdx: 0, hl: [0, 1], ex: '第 1 帧:组件函数从头执行,useState/useEffect 依次调用——每调用一次,就在槽位链表上【新建一格】。' },
        { frameIdx: 1, hl: [0], ex: '第 2 帧:setCount 触发重渲染,组件再次从头执行。useState 按调用顺序认领槽位①——值 1 就存在那里。' },
        { frameIdx: 1, hl: [1], ex: 'useEffect 同样认领槽位②,比较 deps:没变,跳过。槽位表:两帧完全一致,世界和平。' },
        { frameIdx: 1, hl: [], ex: '这就是"状态逃逸到堆"的终局:组件的栈帧每次都死,但槽位链表活在 Fiber(组件的户口本)上。Rules of Hooks 保护的就是这张表的完整性。' },
      ],
    },
    {
      name: '② 错位:把 Hook 放进 if 里',
      frames: [
        { label: '第 1 帧(onlyPaid=false)', hooks: [{ kind: 'useState(rows)', note: '槽位①:新建' }] },
        { label: '第 2 帧(onlyPaid=true)', hooks: [{ kind: 'useState(paidCount)', note: '占用了槽位①!!' }, { kind: 'useState(rows)', note: '槽位②:新建' }] },
      ],
      steps: [
        { frameIdx: 0, hl: [0], ex: '第 1 帧:if 为 false,只调了 1 个 Hook → 槽位表 1 格(rows)。' },
        { frameIdx: 1, hl: [0], ex: '第 2 帧:if 为 true,多了一个 useState——它按顺序认领槽位①,把 rows 的槽占了!' },
        { frameIdx: 1, hl: [1], ex: 'rows 只好去认领新建的槽位②——每格的【主人】全乱套:paidCount 读到的是 rows 的值。' },
        { frameIdx: 1, hl: [], crash: '⛔ 抛错:Hooks 顺序错乱——本次渲染的 Hook 数量与上次不一致', ex: '你的 mini-React 顺序守卫在这里执法(门诊 5 号)。官方 React 同样会抛错:Rules of Hooks 是调用约定,不是风格建议。' },
      ],
    },
  ];

  function mount(host) {
    const wrap = document.createElement('div');
    wrap.className = 'sim-wrap';
    let pi = 0, si = 0;

    wrap.innerHTML = `
      <div class="sim-toolbar">
        <select id="hs-preset" aria-label="选择预设"></select>
        <button class="sim-btn" id="hs-step">单步 ▶</button>
        <button class="sim-btn" id="hs-reset">↺ 重置</button>
        <span class="sim-progress" id="hs-progress"></span>
      </div>
      <div id="hs-frame"></div>
      <div id="hs-slots" style="margin-top:10px"></div>
      <div id="hs-crash"></div>
      <div class="sim-explain" id="hs-explain"></div>`;

    const sel = wrap.querySelector('#hs-preset');
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
      const step = p.steps[si];
      const frame = p.frames[step.frameIdx];
      wrap.querySelector('#hs-frame').innerHTML =
        `<div class="sim-item" style="background:rgba(191,90,242,.10);border-color:rgba(191,90,242,.3);color:#8a2fd1">🎞 ${esc(frame.label)}</div>`;
      wrap.querySelector('#hs-slots').innerHTML =
        `<div style="color:var(--dim);font-size:12px;font-family:var(--mono);margin:6px 0">Hook 槽位链表(按调用顺序):</div>` +
        frame.hooks
          .map((hk, i) => {
            const lit = step.hl.includes(i);
            return `<div class="sim-item" style="background:${lit ? 'rgba(0,199,190,.12)' : 'rgba(255,255,255,.85)'};${lit ? 'outline:1px solid rgba(0,199,190,.45);color:#0b7d70' : ''}">` +
              `槽位${i + 1}: ${esc(hk.kind)} — ${esc(hk.note)}</div>`;
          })
          .join('');
      wrap.querySelector('#hs-crash').innerHTML = step.crash
        ? `<div class="verdict err">${esc(step.crash)}</div>`
        : '';
      wrap.querySelector('#hs-explain').innerHTML = step.ex;
      wrap.querySelector('#hs-progress').textContent = `步 ${si + 1}/${p.steps.length}`;
      wrap.querySelector('#hs-step').disabled = si >= p.steps.length - 1;
    }
    sel.onchange = () => { pi = Number(sel.value); si = 0; render(); };
    wrap.querySelector('#hs-step').onclick = () => { si = Math.min(si + 1, PRESETS[pi].steps.length - 1); render(); };
    wrap.querySelector('#hs-reset').onclick = () => { si = 0; render(); };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
