// promisesim.js — Promise 凭证状态机动画(S4/S5 禁写区的"预演")
// 纪律:只演示【外部行为】——状态流转、then 登记、链式传递、错误传播;
// 内部怎么实现,一个字不漏(那是读者要在禁写区亲手长的东西)。
// 每个预设是预先算好的确定性轨迹:每步 = 凭证卡片 + 微任务队列 + 输出 的完整快照。
export const PromiseSim = (function () {
  'use strict';

  // card: { n: 凭证名, st: 'pending'|'fulfilled'|'rejected', v: 值/原因, cbs: 已登记回调[] }
  // step: { cards: card[], q: 微任务队列[], out: 输出[], hl: 高亮面板, ex: 一句话 }
  const PRESETS = [
    {
      name: '① 一张凭证的一生(pending → fulfilled)',
      steps: [
        {
          cards: [{ n: 'p', st: 'pending', v: '', cbs: [] }],
          q: [], out: [], hl: '',
          ex: '凭证刚开出:状态 pending,无值无回调。此刻它只是一张空白取件单。',
        },
        {
          cards: [{ n: 'p', st: 'pending', v: '', cbs: ['cb1'] }],
          q: [], out: [], hl: '',
          ex: 'p.then(cb1):注意,不是执行,是登记——cb1 挂到凭证上,等定档。',
        },
        {
          cards: [{ n: 'p', st: 'fulfilled', v: '42', cbs: ['cb1'] }],
          q: ['cb1(p)'], out: [], hl: 'q',
          ex: 'resolve(42):状态单向流转 pending → fulfilled,42 被锁进凭证;登记过的回调全部推入微任务队列。',
        },
        {
          cards: [{ n: 'p', st: 'fulfilled', v: '42', cbs: [] }],
          q: [], out: ['cb1 拿到 42'], hl: 'out',
          ex: '栈空清微任务:cb1 执行,拿到 42。这张凭证的承诺兑现完毕。',
        },
        {
          cards: [{ n: 'p', st: 'fulfilled', v: '42', cbs: [] }],
          q: [], out: ['cb1 拿到 42'], hl: '',
          ex: '宪法三条:状态只能从 pending 起步;单向一次、不可逆(≈ 事务提交不可回滚);已定档的凭证再挂回调,照样异步执行——规范强制,谁也不许抄近道。',
        },
      ],
    },
    {
      name: '② 链式:每个 then 都返回一张【新】凭证',
      steps: [
        {
          cards: [{ n: 'p1', st: 'fulfilled', v: '1', cbs: [] }],
          q: [], out: [], hl: '',
          ex: 'p1 = Promise.resolve(1):开出即已兑现——它承诺的值是 1。',
        },
        {
          cards: [
            { n: 'p1', st: 'fulfilled', v: '1', cbs: ['+1'] },
            { n: 'p2', st: 'pending', v: '', cbs: [] },
          ],
          q: [], out: [], hl: '',
          ex: 'p2 = p1.then(v => v + 1):关键一幕——then 的产物是一张【新】凭证 p2;回调 +1 登记在 p1 上。',
        },
        {
          cards: [
            { n: 'p1', st: 'fulfilled', v: '1', cbs: ['+1'] },
            { n: 'p2', st: 'pending', v: '', cbs: ['×10'] },
            { n: 'p3', st: 'pending', v: '', cbs: [] },
          ],
          q: [], out: [], hl: '',
          ex: 'p3 = p2.then(v => v * 10):链又长了一节。此刻三张凭证,两张在等,登记各就各位。',
        },
        {
          cards: [
            { n: 'p1', st: 'fulfilled', v: '1', cbs: [] },
            { n: 'p2', st: 'fulfilled', v: '2', cbs: ['×10'] },
            { n: 'p3', st: 'pending', v: '', cbs: [] },
          ],
          q: ['×10 → p3'], out: ['p2 交付 2'], hl: 'q',
          ex: '微任务:+1 执行得 2,p2 定档 fulfilled;它欠的 ×10 立刻入队。值就是这样沿链传递的。',
        },
        {
          cards: [
            { n: 'p1', st: 'fulfilled', v: '1', cbs: [] },
            { n: 'p2', st: 'fulfilled', v: '2', cbs: [] },
            { n: 'p3', st: 'fulfilled', v: '20', cbs: [] },
          ],
          q: [], out: ['p2 交付 2', 'p3 交付 20'], hl: '',
          ex: '×10 执行,p3 兑现 20。三要点:then 返回新凭证;回调的返回值成为新凭证的值;微任务一拍一拍向前。',
        },
      ],
    },
    {
      name: '③ 错误:穿透,直到有人接住',
      steps: [
        {
          cards: [{ n: 'p1', st: 'pending', v: '', cbs: [] }],
          q: [], out: [], hl: '',
          ex: '一张订单查询凭证:即将失败(查无此单)。',
        },
        {
          cards: [{ n: 'p1', st: 'rejected', v: 'Error: 订单不存在', cbs: [] }],
          q: [], out: [], hl: '',
          ex: 'reject:凭证定档为已拒绝,原因被锁进去。单向、不可逆。',
        },
        {
          cards: [
            { n: 'p1', st: 'rejected', v: 'Error: 订单不存在', cbs: ['f1(仅成功版)'] },
            { n: 'p2', st: 'pending', v: '', cbs: [] },
          ],
          q: [], out: [], hl: '',
          ex: 'p2 = p1.then(f1):只给了成功回调——注意这个危险姿势。',
        },
        {
          cards: [
            { n: 'p1', st: 'rejected', v: 'Error: 订单不存在', cbs: [] },
            { n: 'p2', st: 'rejected', v: 'Error: 订单不存在', cbs: [] },
          ],
          q: ['f1(p2)'], out: [], hl: 'q',
          ex: '微任务:f1 被跳过(p1 是 rejected,轮不到成功回调);p2 没给 onRejected → 错误原样【穿透】,≈ 异常一路上抛。',
        },
        {
          cards: [
            { n: 'p1', st: 'rejected', v: 'Error: 订单不存在', cbs: [] },
            { n: 'p2', st: 'rejected', v: 'Error: 订单不存在', cbs: [] },
            { n: 'p3', st: 'pending', v: '', cbs: ['兜底'] },
          ],
          q: [], out: [], hl: '',
          ex: 'p3 = p2.catch(() => 兜底凭证):catch ≈ then(undefined, onRejected),在链尾设卡。',
        },
        {
          cards: [
            { n: 'p1', st: 'rejected', v: 'Error: 订单不存在', cbs: [] },
            { n: 'p2', st: 'rejected', v: 'Error: 订单不存在', cbs: [] },
            { n: 'p3', st: 'fulfilled', v: '兜底凭证', cbs: [] },
          ],
          q: [], out: ['p3 交付:兜底凭证'], hl: 'out',
          ex: '修复回调返回了正常值 → p3 定档为 fulfilled——错误链到此终结。一整条链的规矩:错误穿透,直到有人接住;接住且返回正常值,链就"修复"回 fulfilled。',
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
        <select id="ps-preset" aria-label="选择预设"></select>
        <button class="sim-btn" id="ps-step">单步 ▶</button>
        <button class="sim-btn" id="ps-auto">自动 ⏩</button>
        <button class="sim-btn" id="ps-reset">↺ 重置</button>
        <span class="sim-progress" id="ps-progress"></span>
      </div>
      <div class="pc-grid" id="ps-cards"></div>
      <div class="sim-panels">
        <div class="sim-panel p-micro" id="ps-q"><h4>微任务队列</h4><div class="sim-items"></div></div>
        <div class="sim-panel p-out" id="ps-out"><h4>交付 / 输出</h4><div class="sim-items"></div></div>
      </div>
      <div class="sim-explain" id="ps-explain"></div>`;

    const sel = wrap.querySelector('#ps-preset');
    PRESETS.forEach((p, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = p.name;
      sel.appendChild(o);
    });

    function esc(s) {
      return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    }
    const stateText = { pending: '⏳ pending', fulfilled: '✅ fulfilled', rejected: '❌ rejected' };

    function render() {
      const step = PRESETS[pi].steps[si];
      wrap.querySelector('#ps-cards').innerHTML = step.cards
        .map(
          (c) => `
        <div class="pcard pc-${c.st}">
          <div class="pc-name">凭证 ${esc(c.n)}</div>
          <span class="pc-state">${stateText[c.st]}</span>
          <div class="pc-v">${c.st === 'pending' ? '值:— 待定' : esc(c.v)}</div>
          <div class="pc-cbs">${c.cbs.length ? '已登记: ' + esc(c.cbs.join(', ')) : '(无登记回调)'}</div>
        </div>`
        )
        .join('');
      wrap.querySelector('#ps-q .sim-items').innerHTML = step.q.length
        ? step.q.map((t) => `<div class="sim-item">${esc(t)}</div>`).join('')
        : '<div class="sim-empty">— 空 —</div>';
      wrap.querySelector('#ps-out .sim-items').innerHTML = step.out.length
        ? step.out.map((t) => `<div class="sim-item">${esc(t)}</div>`).join('')
        : '<div class="sim-empty">— 空 —</div>';
      wrap.querySelector('#ps-q').classList.toggle('flash', step.hl === 'q');
      wrap.querySelector('#ps-out').classList.toggle('flash', step.hl === 'out');
      wrap.querySelector('#ps-explain').textContent = step.ex;
      wrap.querySelector('#ps-progress').textContent = `步 ${si + 1}/${PRESETS[pi].steps.length}`;
      wrap.querySelector('#ps-step').disabled = si >= PRESETS[pi].steps.length - 1;
      wrap.querySelector('#ps-auto').disabled = si >= PRESETS[pi].steps.length - 1;
    }

    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; wrap.querySelector('#ps-auto').textContent = '自动 ⏩'; }
    }

    sel.onchange = () => { stopAuto(); pi = Number(sel.value); si = 0; render(); };
    wrap.querySelector('#ps-step').onclick = () => { stopAuto(); if (si < PRESETS[pi].steps.length - 1) { si++; render(); } };
    wrap.querySelector('#ps-reset').onclick = () => { stopAuto(); si = 0; render(); };
    wrap.querySelector('#ps-auto').onclick = () => {
      if (timer) { stopAuto(); return; }
      wrap.querySelector('#ps-auto').textContent = '暂停 ⏸';
      timer = setInterval(() => {
        if (si < PRESETS[pi].steps.length - 1) { si++; render(); } else stopAuto();
      }, 1300);
    };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
