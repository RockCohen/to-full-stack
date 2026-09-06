// corsim.js — 同源策略与 CORS(S27 的前哨)
// 只演示【执法过程】:预检四项检查、简单请求免检、凭证与通配符的冲突。
// 模拟器扮演浏览器执法者——你要在 S27 的实验里亲手扮演它。
export const CorsSim = (function () {
  'use strict';

  // 每步:browser(页面动作)/ server(服务端响应)/ checks(执法清单)/ verdict / log / ex
  const PRESETS = [
    {
      name: '① 简单请求:GET 不问路,但响应仍要过安检',
      steps: [
        {
          browser: '页面(localhost:5180)发起 GET /api/orders',
          server: '200 OK + Access-Control-Allow-Origin: *',
          checks: [
            { name: '是简单请求(GET,无自定义头)→ 免预检,直接发', ok: true },
            { name: '响应带 Access-Control-Allow-Origin → 放行读', ok: true },
          ],
          verdict: '🟢 数据到达页面',
          log: ['GET 直发 → 服务端带 ACAO 头 → 浏览器放行读'],
          ex: '简单请求不预检,但<b>执法照旧</b>:响应没带 ACAO 头,数据照样到不了 JS 手里——拦截发生在"读响应"这一步。',
        },
        {
          browser: '同样的 GET,但服务端忘了配 CORS',
          server: '200 OK(没有任何 Access-Control-* 头)',
          checks: [
            { name: '是简单请求 → 免预检,直接发', ok: true },
            { name: '响应带 Access-Control-Allow-Origin → 放行读', ok: false },
          ],
          verdict: '🔴 TypeError: Failed to fetch(请求其实成功了,数据被扣下)',
          log: ['GET 直发 → 响应缺 ACAO → 浏览器扣下数据,JS 拿到的是 TypeError'],
          ex: '最迷惑的一档:<b>网络面板里 200 全绿,JS 却报错</b>。执法方是浏览器,服务器日志永远一片祥和。用 curl 测?它不是浏览器,没有执法者——永远"没问题"。',
        },
      ],
    },
    {
      name: '② 预检:POST JSON 先问路(四项检查)',
      steps: [
        {
          browser: '发起 POST(带 Content-Type: application/json)→ 非简单请求,先发预检 OPTIONS',
          server: '(收到 OPTIONS,带 Origin / Access-Control-Request-Method: POST)',
          checks: [{ name: '预检请求已发出:OPTIONS + Origin + 两个 Access-Control-Request-* 头', ok: true }],
          verdict: '⏳ 等服务端放行',
          log: ['浏览器替你先问一次路:这条跨源 POST,你们服务端接吗?'],
          ex: '预检 = <b>网关放行</b>的报文级重现。注意问路的人是<b>浏览器</b>,不是你的代码——你在 fetch 之前什么都没做,OPTIONS 已经飞出去了。',
        },
        {
          browser: '预检响应到达,执法开始',
          server: '204 No Content + ACAO: * + Allow-Methods: GET,POST + Allow-Headers: Content-Type',
          checks: [
            { name: '① 预检状态码是 2xx(204)', ok: true },
            { name: '② Access-Control-Allow-Origin 存在', ok: true },
            { name: '③ 方法 POST 在 Allow-Methods 里', ok: true },
            { name: '④ content-type 在 Allow-Headers 里', ok: true },
          ],
          verdict: '🟢 四项全过 → 发出真正的 POST',
          log: ['预检 204 + 三类头齐全 → 放行 → 真 POST 出发'],
          ex: '这四项就是你配 Nginx/Spring CORS 时在维护的清单。S27 的实验里,你会在 Node 里亲手扮演这个执法者,逐项打钩。',
        },
        {
          browser: '预检响应到达(服务端忘配 CORS 的那个周末)',
          server: '200 OK(没有 ACAO / 没有 Allow-Methods / 没有 Allow-Headers)',
          checks: [
            { name: '① 预检状态码是 2xx(200)', ok: true },
            { name: '② Access-Control-Allow-Origin 存在', ok: false },
            { name: '③ 方法 POST 在 Allow-Methods 里', ok: false },
            { name: '④ content-type 在 Allow-Headers 里', ok: false },
          ],
          verdict: '🔴 拒收:TypeError: Failed to fetch(真 POST 根本不会发出)',
          log: ['预检缺头 → 拒收 → 服务端日志里永远看不到那次 POST'],
          ex: '修法在<b>服务端</b>:补三类头。但报错在前端控制台——"立法在服务器,执法在浏览器,修法也修服务器"。',
        },
      ],
    },
    {
      name: '③ 带凭证:ACAO 的 * 失效了',
      steps: [
        {
          browser: 'fetch(url, { credentials: "include" })(带 Cookie 的跨源请求)',
          server: 'Access-Control-Allow-Origin: *(其他三类头齐全)',
          checks: [
            { name: 'ACAO 是通配符 * ——但请求带凭证', ok: false },
            { name: 'Access-Control-Allow-Credentials: true 存在', ok: false },
          ],
          verdict: '🔴 拒收:带凭证的通道不许用通配符',
          log: ['credentials: include + ACAO: * → 浏览器拒收'],
          ex: '≈ guest Wi-Fi 可以"对所有人开放",公司 VPN 不行——<b>凭证通道必须指名道姓</b>。你在后端做安全策略时的同一句话:越敏感的通道,白名单越精确。',
        },
        {
          browser: '同一个带 Cookie 的请求,服务端改了配置',
          server: 'ACAO: http://localhost:5180 + Access-Control-Allow-Credentials: true',
          checks: [
            { name: 'ACAO 指名匹配当前页面源', ok: true },
            { name: 'Access-Control-Allow-Credentials: true 存在', ok: true },
          ],
          verdict: '🟢 放行,Cookie 随请求携带',
          log: ['指名 ACAO + ACAC: true → 凭证通道放行'],
          ex: '凭证存放姿势的总账:Cookie(HttpOnly) XSS 偷不走但 CSRF 要防;localStorage(JWT)CSRF 免疫但 XSS 一锅端。答辩必考,写进笔记。',
        },
      ],
    },
  ];

  function mount(host) {
    const wrap = document.createElement('div');
    wrap.className = 'sim-wrap';
    let pi = 0, si = 0;

    wrap.innerHTML = `
      <div class="sim-toolbar">
        <select id="cs-preset" aria-label="选择预设"></select>
        <button class="sim-btn" id="cs-step">单步 ▶</button>
        <button class="sim-btn" id="cs-reset">↺ 重置</button>
        <span class="sim-progress" id="cs-progress"></span>
      </div>
      <div id="cs-lanes" style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px" id="cs-browser"></div>
        <div style="flex:1;min-width:220px" id="cs-server"></div>
      </div>
      <div id="cs-checks" style="margin-top:10px"></div>
      <div class="sim-explain" id="cs-verdict" style="margin-top:10px"></div>
      <div class="sim-explain" id="cs-log"></div>
      <div class="sim-explain" id="cs-explain" style="border-color:var(--teal)"></div>`;

    const sel = wrap.querySelector('#cs-preset');
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
      wrap.querySelector('#cs-browser').innerHTML =
        `<div style="color:var(--dim);font-size:12px;font-family:var(--mono);margin-bottom:4px">🖥 浏览器(执法者)</div>` +
        `<div class="sim-item">${esc(step.browser)}</div>`;
      wrap.querySelector('#cs-server').innerHTML =
        `<div style="color:var(--dim);font-size:12px;font-family:var(--mono);margin-bottom:4px">📦 服务端</div>` +
        `<div class="sim-item">${esc(step.server)}</div>`;
      wrap.querySelector('#cs-checks').innerHTML = step.checks
        .map(
          (c) =>
            `<div class="sim-item" style="background:${c.ok ? 'rgba(40,205,65,.12)' : 'rgba(255,69,58,.10)'};` +
            `color:${c.ok ? '#17853a' : '#c53030'}">${c.ok ? '✅' : '❌'} ${esc(c.name)}</div>`
        )
        .join('');
      wrap.querySelector('#cs-verdict').innerHTML = '⚖ ' + step.verdict;
      wrap.querySelector('#cs-log').innerHTML = '📋 ' + esc(step.log[step.log.length - 1]);
      wrap.querySelector('#cs-explain').innerHTML = step.ex;
      wrap.querySelector('#cs-progress').textContent = `步 ${si + 1}/${p.steps.length}`;
      wrap.querySelector('#cs-step').disabled = si >= p.steps.length - 1;
    }
    sel.onchange = () => { pi = Number(sel.value); si = 0; render(); };
    wrap.querySelector('#cs-step').onclick = () => { si = Math.min(si + 1, PRESETS[pi].steps.length - 1); render(); };
    wrap.querySelector('#cs-reset').onclick = () => { si = 0; render(); };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
