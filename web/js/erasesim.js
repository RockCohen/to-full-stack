// erasesim.js — 蒸发对照器:同一份代码的"TS 源码(编译期)"与"编译产物(运行时)"并排对照
// 每个预设是一条铁案:类型痕迹在产物里消失(或像 enum 那样意外留下脚印)。
export const EraseSim = (function () {
  'use strict';

  const PRESETS = [
    {
      name: '① 泛型函数:<T> 与 T[] 全蒸发',
      ts: [
        'function first<T>(list: T[]): T {',
        '  return list[0];',
        '}',
        '',
        '// 调用处:显式给了类型实参 <Order>',
        'const firstOrder = first<Order>(orders);',
      ],
      js: [
        'function first(list) {',
        '  return list[0];',
        '}',
        '',
        '// 调用处:',
        'const firstOrder = first(orders);',
        '',
        '// 👻 <T>、: T、T[]、<Order> —— 一个不剩',
      ],
      ghost: '👻 本案蒸发痕迹:<T>、T[]、返回类型、调用处类型实参 —— 4 处',
      bullets: [
        '运行时的 first 就是个普通函数:拿到数组,返回第 0 项。它不知道、也不需要知道 T 是谁。',
        '对照 Java:List<T> 擦除后好歹剩一个 List,元素读取靠编译器偷塞的 checkcast 强转——运行时有脚印。TS 连脚印都懒得留,因为它的产物就是纯 JS。',
        '读写世界观:泛型的全部担保(“读出来的确实是 T”)在编译期一次性兑现完毕;运行时的每一次读,都是无审计的裸读。',
      ],
    },
    {
      name: '② interface:编译后一行不剩',
      ts: [
        'interface Order {',
        '  id: string;',
        '  buyer: string;',
        '  total: number;',
        '}',
        '',
        'function orderId(o: Order): string {',
        '  return o.id;',
        '}',
      ],
      js: [
        '// 👻 interface Order { ... } —— 整块蒸发',
        '',
        '',
        '',
        '',
        '',
        'function orderId(o) {',
        '  return o.id;',
        '}',
      ],
      ghost: '👻 本案蒸发痕迹:interface 整体 —— 运行时查无此人',
      bullets: [
        'interface 编译后一行不剩:它从头到尾只存在于编译期,是“纯编译期幻象”。',
        '对照 Java:接口编译后是真实的 .class 文件,反射可见、可以 instanceof。TS 的 interface 连 instanceof 都没法参与(它不是一个值)。',
        '所以“前端收到 Order 了吗?”——收到的是 JSON 字符串,形状对不对编译器管不着。数据进门的第一读,必须 zod 验货(阶段 3)。',
      ],
    },
    {
      name: '③ enum:意外留下脚印的叛徒',
      ts: [
        'enum OrderStatus {',
        '  Created = 1,',
        '  Paid = 2,',
        '}',
        '',
        'const s: OrderStatus = OrderStatus.Paid;',
      ],
      js: [
        'var OrderStatus;',
        '(function (OrderStatus) {',
        '  OrderStatus[OrderStatus["Created"] = 1] = "Created";',
        '  OrderStatus[OrderStatus["Paid"] = 2] = "Paid";',
        '})(OrderStatus || (OrderStatus = {}));',
        '',
        'const s = OrderStatus.Paid;',
      ],
      ghost: '👻 本案反转:enum 是少数留下运行时脚印的类型特性',
      bullets: [
        'enum 编译后是一个真实的运行时对象,数字枚举还带反向映射(Status[2] === "Paid")。',
        '这就是很多 TS 团队禁用 enum 的原因:它破坏了“类型全蒸发”的纯度,产物里多出一坨神秘代码。',
        '替代方案:type OrderStatus = "created" | "paid" —— 字符串联合,蒸发干净,还白拿 c00 讲过的收窄能力。',
      ],
    },
  ];

  function mount(host) {
    const wrap = document.createElement('div');
    wrap.className = 'sim-wrap';
    let pi = 0;

    wrap.innerHTML = `
      <div class="sim-toolbar">
        <select id="es-preset" aria-label="选择铁案"></select>
        <span class="sim-progress" id="es-ghost"></span>
      </div>
      <div class="duo">
        <div class="pane ts"><span class="pane-tag">🖥 TS 源码 · 编译期(类型还活着)</span><pre class="sim-code" id="es-ts"></pre></div>
        <div class="pane jv"><span class="pane-tag">📦 编译产物 · 运行时(类型已蒸发)</span><pre class="sim-code" id="es-js"></pre></div>
      </div>
      <ul class="sim-notes" id="es-notes"></ul>`;

    const sel = wrap.querySelector('#es-preset');
    PRESETS.forEach((p, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = p.name;
      sel.appendChild(o);
    });
    const tsEl = wrap.querySelector('#es-ts');
    const jsEl = wrap.querySelector('#es-js');
    const notesEl = wrap.querySelector('#es-notes');

    function esc(s) {
      return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    }
    function render() {
      const p = PRESETS[pi];
      tsEl.innerHTML = p.ts.map((l) => `<span class="ln">${esc(l)}</span>`).join('');
      jsEl.innerHTML = p.js.map((l) => `<span class="ln">${esc(l)}</span>`).join('');
      notesEl.innerHTML = p.bullets.map((b) => `<li>${esc(b)}</li>`).join('');
      wrap.querySelector('#es-ghost').textContent = p.ghost;
    }
    sel.onchange = () => { pi = Number(sel.value); render(); };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
