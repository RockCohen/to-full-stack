// querysim.js — 缓存与失效:TanStack Query(S28/S29 的前哨)
// 只演示【外部行为】:queryKey 命中、staleTime 过期、并发去重、写后失效。
// 禁写区纪律:内部实现一个字不漏——S28/S29 的实验里你用真 TanStack Query 验证它。
export const QuerySim = (function () {
  'use strict';

  // 每步:cache:[{key, data, stale, note}]/ requests:[{name, result}]/ log / ex
  const PRESETS = [
    {
      name: '① staleTime = TTL:命中与过期',
      steps: [
        {
          cache: [{ key: "['orders','老王']", data: '2 单', stale: false, note: 'TTL 60s' }],
          requests: [{ name: 'fetchQuery(orders,老王)', result: '🔄 回源:接口 200(第 1 次)' }],
          log: ['首次调用:缓存没有这个 key → queryFn 回源 → 存入缓存'],
          ex: "queryKey 是缓存的<b>坐标</b>——`['orders','老王']` 这份『2 单』现在躺在缓存里,staleTime 60 秒内它是『新鲜』的。",
        },
        {
          cache: [{ key: "['orders','老王']", data: '2 单', stale: false, note: 'TTL 60s 内' }],
          requests: [
            { name: 'fetchQuery(orders,老王)', result: '🔄 回源(第 1 次)' },
            { name: 'fetchQuery(orders,老王)', result: '⚡ 缓存命中:0 次接口调用' },
          ],
          log: ['第二次调用:同 key + 未过期 → 直接命中,接口一秒没被碰'],
          ex: 'staleTime ≈ Caffeine 的 <b>expireAfterWrite</b>。默认 0 的哲学:缓存的默认立场是"宁可多查,不可给旧"——界面上的旧数据用户看得见,和你在服务端"为省 DB 敢给长 TTL"正相反。',
        },
        {
          cache: [{ key: "['orders','老王']", data: '2 单', stale: true, note: 'TTL 已过' }],
          requests: [{ name: '60 秒后再 fetchQuery', result: '🔄 过期 → 回源(第 2 次)' }],
          log: ['超过 staleTime → 数据变 stale → 下次调用回源并替换'],
          ex: '过期 ≠ 删除:stale 数据先给、后台换新(策略可配)。你后端"先回旧值再异步刷新"的同款折中,这里叫 stale-while-revalidate。',
        },
      ],
    },
    {
      name: '② queryKey 串数据:缓存 key 不完整的代价',
      steps: [
        {
          cache: [{ key: "['orders']", data: '老王的 2 单', stale: false, note: 'key 里没有 filter!' }],
          requests: [{ name: 'fetchQuery(orders) 筛选=老王', result: '🔄 回源:老王的 2 单' }],
          log: ['筛选"老王" → 结果进了 [\'orders\'] 这一个抽屉'],
          ex: '病灶埋下了:key 只有 ["orders"],没有 filter——三次筛选共用<b>一个抽屉</b>。你给 Caffeine 设计时绝不会犯的错,它换了件"数组"的衣服。',
        },
        {
          cache: [{ key: "['orders']", data: '老王的 2 单', stale: false, note: '永远命中同一格' }],
          requests: [
            { name: 'fetchQuery(orders) 筛选=老张', result: '⚡ 命中:老王的 2 单(错!)' },
            { name: 'fetchQuery(orders) 筛选=老李', result: '⚡ 命中:老王的 2 单(错!)' },
          ],
          log: ['换筛选 → 缓存照样命中 → 三次展示同一份数据'],
          ex: '<b>缓存串数据</b>:最危险的静默错误。修复:`[\'orders\', filter]`。规范一句话:key 里放"这条数据的完整坐标",一个都不能少。',
        },
      ],
    },
    {
      name: '③ 写后失效:invalidate 而不是双写',
      steps: [
        {
          cache: [{ key: "['orders']", data: 'A-001 待支付', stale: false, note: '热缓存' }],
          requests: [{ name: 'POST /pay(A-001) 成功', result: '✅ 支付接口 200' }],
          log: ['写通道:支付成功;读通道:缓存还躺着旧世界'],
          ex: '写和读是两条通道。此刻缓存里的 A-001 还是"待支付"——<b>不失效,界面就和真相分家</b>(门诊 4 号)。',
        },
        {
          cache: [{ key: "['orders']", data: '(已作废 → 标记 stale)', stale: true, note: 'invalidateQueries' }],
          requests: [{ name: 'invalidateQueries(["orders"])', result: '🧹 前缀匹配,全部作废' }],
          log: ['失效:把缓存标 stale(不是塞新值!)'],
          ex: '为什么<b>失效而不是把支付结果塞进缓存</b>(双写)?写只保证那一行新;列表的合计/排序/权限过滤都由服务端算。让读自己回源——<b>一致性不靠客户端聪明,靠"读永远是权威副本"</b>。evict-on-write,你的老答案。',
        },
        {
          cache: [{ key: "['orders']", data: 'A-001 已支付 ✓', stale: false, note: '回源后的新世界' }],
          requests: [{ name: '下一次读(组件挂载/聚焦)', result: '🔄 回源:拿到已支付的新真相' }],
          log: ['组件要数据 → 缓存是 stale → 自动回源 → 界面更新'],
          ex: '闭环完成:写接口 → 失效 → 读回源 → UI 一致。三个端(Web/RN/未来的谁都行)共享同一套纪律——<b>真相一份,读者多处</b>。',
        },
      ],
    },
    {
      name: '④ 并发去重:5 个调用,1 次回源(singleflight)',
      steps: [
        {
          cache: [{ key: "['orders','panel']", data: '(空)', stale: false, note: '接口延迟 120ms' }],
          requests: [
            { name: '调用 ×5(同 key,并发)', result: '🤝 合并回源:接口只收到 1 个请求' },
          ],
          log: ['5 个 fetchQuery 同 key 并发 → 第 1 个回源,其余 4 个等同一份 Promise'],
          ex: '<b>singleflight</b>:同一 key 的并发请求合并回源——Go 的 singleflight、你网关的合并回源。去重条件:key 深度相等(序列化要稳定)。',
        },
        {
          cache: [{ key: "['orders','panel']", data: '3 单', stale: false, note: '回源完成' }],
          requests: [{ name: '5 个调用者各自拿到结果', result: '📦 5 份引用,1 次接口' }],
          log: ['回源完成 → 5 个等待者同时被满足'],
          ex: '窗口外的调用走缓存(① 的规则),窗口内的合并回源——<b>击穿保护的两道闸</b>,和你给 Redis 回源加锁时设计的是同一道闸门。',
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
        <select id="qs-preset" aria-label="选择预设"></select>
        <button class="sim-btn" id="qs-step">单步 ▶</button>
        <button class="sim-btn" id="qs-reset">↺ 重置</button>
        <span class="sim-progress" id="qs-progress"></span>
      </div>
      <div id="qs-cache"></div>
      <div id="qs-reqs" style="margin-top:10px"></div>
      <div class="sim-explain" id="qs-log" style="margin-top:12px"></div>
      <div class="sim-explain" id="qs-explain" style="border-color:var(--teal)"></div>`;

    const sel = wrap.querySelector('#qs-preset');
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
      wrap.querySelector('#qs-cache').innerHTML =
        `<div style="color:var(--dim);font-size:12px;font-family:var(--mono);margin-bottom:4px">缓存(Query Cache):</div>` +
        step.cache
          .map(
            (c) =>
              `<div class="type-badge${c.stale ? '" style="opacity:.5;text-decoration:line-through' : ' narrow'}">` +
              `${esc(c.key)} → ${esc(c.data)} <small>(${esc(c.note)})</small></div>`
          )
          .join('');
      wrap.querySelector('#qs-reqs').innerHTML = step.requests
        .map(
          (r) =>
            `<div class="sim-item" style="background:${r.result.startsWith('⚡') ? 'rgba(10,132,255,.10)' : 'rgba(255,255,255,.85)'}">` +
            `${esc(r.name)} — ${esc(r.result)}</div>`
        )
        .join('');
      wrap.querySelector('#qs-log').innerHTML = '📋 ' + esc(step.log[step.log.length - 1]);
      wrap.querySelector('#qs-explain').innerHTML = step.ex;
      wrap.querySelector('#qs-progress').textContent = `步 ${si + 1}/${p.steps.length}`;
      wrap.querySelector('#qs-step').disabled = si >= p.steps.length - 1;
    }
    sel.onchange = () => { pi = Number(sel.value); si = 0; render(); };
    wrap.querySelector('#qs-step').onclick = () => { si = Math.min(si + 1, PRESETS[pi].steps.length - 1); render(); };
    wrap.querySelector('#qs-reset').onclick = () => { si = 0; render(); };

    host.appendChild(wrap);
    render();
  }

  return { mount };
})();
