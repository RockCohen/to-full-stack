// jsxsim.js — JSX 与渲染结果对照器(你写的 vs 浏览器拿到的)
export const JsxSim = (function () {
  'use strict';

  const PRESETS = [
    {
      name: '① 标签与表达式:{} 里是任意 JS',
      jsx: [
        'function OrderRow({ id, total }: { id: string; total: number }) {',
        "  return <tr><td>{id}</td><td>{total} 元</td></tr>;",
        '}',
        '',
        'renderToString(<table><tbody>',
        '  <OrderRow id="A-001" total={99} />',
        '</tbody></table>);',
      ],
      html: [
        '<table>',
        '  <tbody>',
        '    <tr>',
        '      <td>A-001</td>',
        '      <td>99 元</td>',
        '    </tr>',
        '  </tbody>',
        '</table>',
      ],
      bullets: [
        '花括号 {} 里是任意 JS 表达式:id/total 直接插入,99 里的 number 自动转字符串。',
        'JSX 不是 HTML——编译后是一串函数调用(createElement),产物是纯 JS(c00 蒸发规则同样生效)。',
        '对照 Java:JSP/Thymeleaf 模板的类型安全函数版——但你写的是代码,不是字符串。',
      ],
    },
    {
      name: '② 列表与 key:map 出来的子节点',
      jsx: [
        'const orders = [',
        '  { id: "A-001", total: 300 },',
        '  { id: "A-002", total: 100 },',
        '];',
        '',
        '<ul>',
        '  {orders.map(o => (',
        '    <li key={o.id}>{o.id}:{o.total}</li>',
        '  ))}',
        '</ul>',
      ],
      html: [
        '<ul>',
        '  <li>A-001:300</li>',
        '  <li>A-002:100</li>',
        '</ul>',
      ],
      bullets: [
        'map 的产物是一个【数组】的子节点——React 会摊平它(数组≈"一组孩子")。',
        'key={o.id}:每个孩子的身份证。它不出现在 HTML 里,只在 diff 时用来对齐身份(S17 揭盅)。',
        '忘写 key?React 会警告:"Each child in a list should have a unique key"。',
      ],
    },
    {
      name: '③ 条件渲染:没有 if 标签,只有表达式',
      jsx: [
        'function Badge({ paid }: { paid: boolean }) {',
        '  return (',
        '    <span>',
        '      {paid ? "✅ 已支付" : "⏳ 待支付"}',
        '    </span>',
        '  );',
        '}',
        '',
        '<><Badge paid={true} /><Badge paid={false} /></>',
      ],
      html: [
        '<span>✅ 已支付</span>',
        '<span>⏳ 待支付</span>',
      ],
      bullets: [
        '条件渲染 = JS 表达式短路:三目、&&、?? 都行——唯独没有 {if} 这种语法。',
        '表达式求值为 false/null/undefined 时,React 直接不渲染该位置。',
        '对照 Java:JSP 的 <c:if> / Thymeleaf 的 th:if——React 把它归还给了语言本身。',
      ],
    },
  ];

  function mount(host) {
    const wrap = document.createElement('div');
    wrap.className = 'sim-wrap';
    let pi = 0;

    wrap.innerHTML = `
      <div class="sim-toolbar">
        <select id="js-preset" aria-label="选择预设"></select>
      </div>
      <div class="duo">
        <div class="pane ts"><span class="pane-tag">🧩 JSX · 你写的</span><pre class="sim-code" id="js-jsx"></pre></div>
        <div class="pane jv"><span class="pane-tag">🖨 渲染结果 · 浏览器拿到的</span><pre class="sim-code" id="js-html"></pre></div>
      </div>
      <ul class="sim-notes" id="js-notes"></ul>`;

    const sel = wrap.querySelector('#js-preset');
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
      wrap.querySelector('#js-jsx').innerHTML = p.jsx.map((l) => `<span class="ln">${esc(l)}</span>`).join('');
      wrap.querySelector('#js-html').innerHTML = p.html.map((l) => `<span class="ln">${esc(l)}</span>`).join('');
      wrap.querySelector('#js-notes').innerHTML = p.bullets.map((b) => `<li>${esc(b)}</li>`).join('');
    }
    sel.onchange = () => { pi = Number(sel.value); render(); };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
