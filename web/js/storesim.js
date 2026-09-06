// storesim.js — 响应式 store 预演(S12/S13 禁写区的前哨)
// 只演示【外部行为】:状态整体替换、订阅通知、选择器过滤、原地改的教训。
// 内部实现一个字不漏——那是禁写区要亲手长的东西。
export const StoreSim = (function () {
  'use strict';

  // stateVer: [{ ver, items, total, stale }]; subs: [{ name, sel, notified, skipped }]
  const PRESETS = [
    {
      name: '① 订阅-通知:setState 的一声铃响',
      steps: [
        {
          stateVer: [{ ver: 'v1', items: '[]', total: 0, stale: false }],
          subs: [{ name: '订单列表组件', sel: '全量', notified: false, skipped: false }],
          log: [],
          ex: '初始:一张 v1 状态。订单列表组件已订阅(全量:每次 setState 都想听)。',
        },
        {
          stateVer: [{ ver: 'v1', items: '[]', total: 0, stale: false }],
          subs: [{ name: '订单列表组件', sel: '全量', notified: false, skipped: false }],
          log: [],
          ex: '此刻先做一件事:保存 v1 的引用(旧账)。想想 c00——旧的值集合,谁也不许改。',
        },
        {
          stateVer: [
            { ver: 'v1', items: '[]', total: 0, stale: true },
            { ver: 'v2', items: '[A-001]', total: 99, stale: false },
          ],
          subs: [{ name: '订单列表组件', sel: '全量', notified: true, skipped: false }],
          log: ['setState → 生成 v2(不碰 v1)→ 通知订阅者'],
          hl: 'subs',
          ex: 'setState({items:[A-001], total:99}):生成全新的 v2,v1 原样保留;订阅者被通知,拿到的是 v2。',
        },
        {
          stateVer: [
            { ver: 'v1', items: '[]', total: 0, stale: true },
            { ver: 'v2', items: '[A-001]', total: 99, stale: false },
          ],
          subs: [{ name: '订单列表组件', sel: '全量', notified: true, skipped: false }],
          log: ['setState → 生成 v2(不碰 v1)→ 通知订阅者'],
          ex: '为什么必须"生成新的"而不是"改 v1 的字段"?因为订阅者靠【引用变化】感知世界——偷改旧账,没人知道你变了(模拟器 ③ 演翻车)。',
        },
      ],
    },
    {
      name: '② 选择器:只有订阅了那片切片的人被叫醒',
      steps: [
        {
          stateVer: [{ ver: 'v1', items: '[A-001]', buyer: '老王', total: 99, stale: false }],
          subs: [
            { name: '合计组件(watch total)', sel: 'total', notified: false, skipped: false },
            { name: '买家组件(watch buyer)', sel: 'buyer', notified: false, skipped: false },
          ],
          log: [],
          ex: '两个订阅者各盯一片:合计组件盯 total,买家组件盯 buyer。v1:total=99,buyer=老王。',
        },
        {
          stateVer: [
            { ver: 'v1', items: '[A-001]', buyer: '老王', total: 99, stale: true },
            { ver: 'v2', items: '[A-001,A-002]', buyer: '老王', total: 199, stale: false },
          ],
          subs: [
            { name: '合计组件(watch total)', sel: 'total', notified: true, skipped: false },
            { name: '买家组件(watch buyer)', sel: 'buyer', notified: false, skipped: true },
          ],
          log: ['setState 加了一单 → v2:total 99→199(变了),buyer 老王→老王(没变)'],
          hl: 'subs',
          ex: '总价的 watch 被叫醒;买家组件的 select 结果没变,Object.is 一比——继续睡。<b>这就是 S13 要实现的选择器过滤。</b>',
        },
        {
          stateVer: [
            { ver: 'v1', items: '[A-001]', buyer: '老王', total: 99, stale: true },
            { ver: 'v2', items: '[A-001,A-002]', buyer: '老王', total: 199, stale: false },
          ],
          subs: [
            { name: '合计组件(watch total)', sel: 'total', notified: true, skipped: false },
            { name: '买家组件(watch buyer)', sel: 'buyer', notified: false, skipped: true },
          ],
          log: ['setState 加了一单 → v2:total 99→199(变了),buyer 老王→老王(没变)'],
          ex: '没有选择器的世界里,每次 setState 全员被叫醒重算——浪费。订阅要能回答"这次变化跟我有关吗"。',
        },
      ],
    },
    {
      name: '③ 翻车现场:原地修改,订阅者全然不知',
      steps: [
        {
          stateVer: [{ ver: 'v1', items: '[A-001]', total: 99, stale: false }],
          subs: [{ name: '订单列表组件', sel: '全量', notified: false, skipped: false }],
          log: [],
          ex: 'v1 已存在,组件已订阅。有人图省事,直接改了 v1 的字段(state.total = 0)……',
        },
        {
          stateVer: [{ ver: 'v1', items: '[A-001]', total: 0, stale: false }],
          subs: [{ name: '订单列表组件', sel: '全量', notified: false, skipped: true }],
          log: ['state.total = 0(原地改)→ 引用没变 → 没有通知'],
          hl: 'stateVer',
          ex: '字段确实变成 0 了——但 v1 的<b>引用</b>没变。订阅者靠引用变化感知世界:它以为世界还停在 99。',
        },
        {
          stateVer: [{ ver: 'v1', items: '[A-001]', total: 0, stale: false }],
          subs: [{ name: '订单列表组件', sel: '全量', notified: false, skipped: true }],
          log: ['界面渲染的是 99,真实状态是 0 —— 数据与视图分家'],
          ex: '这就是"界面显示旧数据"的经典根源。规矩:状态不可原地改,永远生成新版本走 setState——S13 对拍的 07 例会锁死这条。',
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
        <select id="ss-preset" aria-label="选择预设"></select>
        <button class="sim-btn" id="ss-step">单步 ▶</button>
        <button class="sim-btn" id="ss-reset">↺ 重置</button>
        <span class="sim-progress" id="ss-progress"></span>
      </div>
      <div id="ss-state"></div>
      <div id="ss-subs" style="margin-top:10px"></div>
      <div class="sim-explain" id="ss-log" style="margin-top:12px"></div>
      <div class="sim-explain" id="ss-explain" style="border-color:var(--teal)"></div>`;

    const sel = wrap.querySelector('#ss-preset');
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
      wrap.querySelector('#ss-state').innerHTML =
        `<div style="color:var(--dim);font-size:12px;font-family:var(--mono);margin-bottom:4px">状态版本:</div>` +
        step.stateVer
          .map(
            (v) =>
              `<div class="type-badge${v.stale ? '" style="opacity:.45;text-decoration:line-through' : ' narrow'}">` +
              `${esc(v.ver)}  items=${esc(v.items)}  total=${esc(String(v.total))}</div>`
          )
          .join('');
      wrap.querySelector('#ss-subs').innerHTML = step.subs
        .map(
          (s) =>
            `<div class="sim-item" style="background:${s.notified ? 'rgba(40,205,65,.12)' : s.skipped ? 'rgba(255,159,10,.10)' : 'rgba(255,255,255,.85)'};` +
            `color:${s.notified ? '#17853a' : s.skipped ? '#b57608' : 'var(--ink)'}">` +
            `${esc(s.name)} — ${esc(s.sel)} ${s.notified ? '✅ 被通知' : s.skipped ? '💤 跳过(与我无关)' : ''}</div>`
        )
        .join('');
      wrap.querySelector('#ss-log').innerHTML = step.log.length
        ? '📋 ' + esc(step.log[step.log.length - 1])
        : '📋 (尚无动作)';
      wrap.querySelector('#ss-explain').innerHTML = step.ex;
      wrap.querySelector('#ss-progress').textContent = `步 ${si + 1}/${p.steps.length}`;
      wrap.querySelector('#ss-step').disabled = si >= p.steps.length - 1;
    }
    sel.onchange = () => { pi = Number(sel.value); si = 0; render(); };
    wrap.querySelector('#ss-step').onclick = () => { si = Math.min(si + 1, PRESETS[pi].steps.length - 1); render(); };
    wrap.querySelector('#ss-reset').onclick = () => { si = 0; render(); };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
