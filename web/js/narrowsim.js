// narrowsim.js — 类型收窄模拟器
// ① 收窄演示:一个联合类型的值逐行走代码,徽章随控制流收窄/报错(预先算好的轨迹);
// ② never 穷尽证明器 / ③ 字面量安检门:开关切换,看编译器判决。
export const NarrowSim = (function () {
  'use strict';

  const UNION = 'Result = { ok: true; data: string[] } | { ok: false; err: string }';
  const T_FALSE = '{ ok: false; err: string }';
  const T_TRUE = '{ ok: true; data: string[] }';

  // 收窄轨迹:value 为 false / true 两套。badge 数组 = 当前可见类型;verdict = {kind:'ok'|'err', text}
  function unionTrace(valueIsTrue) {
    const full = [T_TRUE, T_FALSE];
    const narrowed = valueIsTrue ? [T_TRUE] : [T_FALSE];
    const accessField = valueIsTrue ? 'data' : 'err';
    const badField = valueIsTrue ? 'err' : 'data';
    return [
      { line: -1, badges: full, verdict: null, explain: '进入 handle(r)。此刻 r 的类型是整个联合——在联合上只能访问"共有属性",访问 data 或 err 都编译不过。' },
      { line: 4, badges: full, verdict: null, explain: `if (r.ok) 判定为 ${valueIsTrue}。类型守卫顺带干活:TS 在控制流里跟踪你的判断,徽章开始收窄。` },
      { line: valueIsTrue ? 5 : 7, badges: narrowed, verdict: { kind: 'ok', text: `return r.${accessField}.length  ✅ 编译通过 —— ${badField === 'data' ? 'err' : 'data'} 已被排除` }, explain: `类型已收窄为 ${narrowed[0]}。此刻访问 ${accessField} 合法——不是"你运气好",是编译器证明的。` },
      { line: valueIsTrue ? 7 : 5, badges: narrowed, verdict: { kind: 'err', text: `r.${badField}  ❌ TS2339: Property '${badField}' does not exist on type '${narrowed[0]}'` }, explain: `手痒测试:在错误的分支访问 r.${badField} —— 非法状态过不了编译。这就是"让非法状态不可表示"。` },
      { line: -1, badges: narrowed, verdict: null, explain: '切一个相反值的 r 再跑一遍,看镜像世界。联合 + 收窄 = sealed interface + 模式匹配的 TS 日用品版。' },
    ];
  }

  const PRESETS = [
    { type: 'union', name: '① 联合类型收窄:if (r.ok) 之后发生了什么' },
    { type: 'never', name: '② never:编译器当证明器' },
    { type: 'excess', name: '③ 字面量安检门:两副面孔' },
  ];

  const UNION_CODE = [
    'type Result =',
    '  | { ok: true;  data: string[] }',
    '  | { ok: false; err: string };',
    'function handle(r: Result) {',
    '  if (r.ok) {',
    '    return r.data.length;',
    '  }',
    '  return r.err.length;',
    '}',
  ];

  function mount(host) {
    const wrap = document.createElement('div');
    wrap.className = 'sim-wrap';
    let pi = 0;

    wrap.innerHTML = `
      <div class="sim-toolbar">
        <select id="ns-preset" aria-label="选择预设"></select>
        <span class="sim-progress" id="ns-progress"></span>
      </div>
      <div id="ns-body"></div>`;

    const sel = wrap.querySelector('#ns-preset');
    PRESETS.forEach((p, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = p.name;
      sel.appendChild(o);
    });
    const body = wrap.querySelector('#ns-body');
    const progress = wrap.querySelector('#ns-progress');

    // ---- ① 收窄 stepper ----
    function renderUnion() {
      let valueTrue = false;
      let si = 0;
      body.innerHTML = `
        <div class="toggle-row">
          <button class="sim-btn" id="ns-value"></button>
          <button class="sim-btn" id="ns-step">单步 ▶</button>
          <button class="sim-btn" id="ns-reset">↺ 重置</button>
        </div>
        <div class="sim-code" id="ns-code"></div>
        <div id="ns-badges"></div>
        <div id="ns-verdict"></div>
        <div class="sim-explain" id="ns-explain"></div>`;
      const valBtn = body.querySelector('#ns-value');
      const codeEl = body.querySelector('#ns-code');
      const badgesEl = body.querySelector('#ns-badges');
      const verdictEl = body.querySelector('#ns-verdict');
      const explainEl = body.querySelector('#ns-explain');

      function draw() {
        const trace = unionTrace(valueTrue);
        const step = trace[si];
        valBtn.textContent = `r = { ok: ${valueTrue}, … }  ⇄ 切换值`;
        codeEl.innerHTML = UNION_CODE
          .map((l, i) => `<span class="ln${i === step.line ? ' hl' : ''}">${escape(l)}</span>`)
          .join('');
        badgesEl.innerHTML =
          '<span style="color:var(--dim);font-size:12px;font-family:var(--mono)">r 的当前类型:</span> ' +
          step.badges.map((b, i) => `<span class="type-badge${i === 0 && step.badges.length === 1 ? ' narrow' : ''}">${escape(b)}</span>`).join('');
        verdictEl.innerHTML = step.verdict
          ? `<div class="verdict ${step.verdict.kind}">${escape(step.verdict.text)}</div>`
          : '';
        explainEl.textContent = step.explain;
        progress.textContent = `步 ${si + 1}/${trace.length}`;
        body.querySelector('#ns-step').disabled = si >= trace.length - 1;
      }
      valBtn.onclick = () => { valueTrue = !valueTrue; si = 0; draw(); };
      body.querySelector('#ns-step').onclick = () => { si = Math.min(si + 1, unionTrace(valueTrue).length - 1); draw(); };
      body.querySelector('#ns-reset').onclick = () => { si = 0; draw(); };
      draw();
    }

    // ---- ② never 证明器(开关判决) ----
    function renderNever() {
      let hasTriangle = false;
      body.innerHTML = `
        <div class="toggle-row">
          <button class="sim-btn" id="ns-tri"></button>
        </div>
        <div class="sim-code"></div>
        <div id="ns-verdict2"></div>
        <div class="sim-explain"></div>`;
      const triBtn = body.querySelector('#ns-tri');
      const code = [
        "type Shape =",
        '  | { kind: "circle"; r: number }',
        '  | { kind: "square"; a: number }',
        hasTriangle ? '  | { kind: "triangle"; b: number; h: number }' : null,
        'function area(s: Shape): number {',
        '  switch (s.kind) {',
        '    case "circle": return 3.14 * s.r * s.r;',
        '    case "square": return s.a * s.a;',
        '    default:',
        '      const _exhaustive: never = s; // 穷尽检查',
        '      return _exhaustive;',
        '  }',
        '}',
      ].filter((l) => l !== null);
      body.querySelector('.sim-code').innerHTML = code.map((l) => `<span class="ln">${escape(l)}</span>`).join('');
      const verdictEl = body.querySelector('#ns-verdict2');
      const explainEl = body.querySelector('.sim-explain');
      function draw() {
        triBtn.textContent = hasTriangle ? 'Shape 含 Triangle ✅(点我移除)' : 'Shape 只有 Circle/Square(点我加 Triangle)';
        verdictEl.innerHTML = hasTriangle
          ? '<div class="verdict err">const _exhaustive: never = s\n❌ TS2322: Type \'{ kind: "triangle"; b: number; h: number }\' is not assignable to type \'never\'</div>'
          : '<div class="verdict ok">✅ 编译通过 —— 所有分支已穷尽,default 里 s 的类型已被收窄为 never</div>';
        explainEl.textContent = hasTriangle
          ? '加了新分支,处理没跟上——编译器立刻指认 default 行。你后端写的 sealed interface 穷尽性检查,这就是 TS 的同款,而且是免费的。'
          : '所有 kind 都有 case,default 里 s 被穷尽收窄成 never,赋值合法。将来任何人加分支,这行立刻爆红——编译器当证明器用。';
        progress.textContent = '开关演示';
      }
      triBtn.onclick = () => { hasTriangle = !hasTriangle; renderNever(); };
      draw();
    }

    // ---- ③ 安检门(开关判决) ----
    function renderExcess() {
      let viaVariable = false;
      body.innerHTML = `
        <div class="toggle-row">
          <button class="sim-btn" id="ns-via"></button>
        </div>
        <div class="sim-code"></div>
        <div id="ns-verdict3"></div>
        <div class="sim-explain"></div>`;
      const viaBtn = body.querySelector('#ns-via');
      body.querySelector('.sim-code').innerHTML = [
        'interface Point { x: number }',
        '',
        viaVariable
          ? 'const tmp = { x: 1, y: 2 };'
          : 'const a: Point = { x: 1, y: 2 };   // 直接字面量',
        viaVariable ? 'const b: Point = tmp;              // 绕道变量' : null,
      ]
        .filter((l) => l !== null)
        .map((l) => `<span class="ln">${escape(l)}</span>`)
        .join('');
      body.querySelector('#ns-verdict3').innerHTML = viaVariable
        ? '<div class="verdict ok">✅ 编译通过 —— 结构满足 Point 即可,y 被无视</div>'
        : '<div class="verdict err">❌ TS2353: Object literal may only specify known properties, and \'y\' does not exist in type \'Point\'</div>';
      body.querySelector('.sim-explain').textContent = viaVariable
        ? '同一个形状,绕道变量就放行:变量可能是"更大类型的子集",拦了反而误伤。'
        : '对象字面量是"当场新造的人",多出来的字段九成是拼写手滑——字面量要过更严的安检门。这不是 TS 精神分裂,是两种场景两种策略。';
      viaBtn.onclick = () => { viaVariable = !viaVariable; renderExcess(); };
      progress.textContent = '开关演示';
      viaBtn.textContent = viaVariable ? '当前:绕道变量(点我切回直接字面量)' : '当前:直接字面量(点我切到绕道变量)';
    }

    function render() {
      if (PRESETS[pi].type === 'union') renderUnion();
      else if (PRESETS[pi].type === 'never') renderNever();
      else renderExcess();
    }
    sel.onchange = () => { pi = Number(sel.value); render(); };

    host.appendChild(wrap);
    render();
  }

  function escape(s) {
    return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }

  return { mount };
})();
