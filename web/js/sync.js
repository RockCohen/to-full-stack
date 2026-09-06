// sync.js — 学习进度云同步:同步码即唯一凭据,启动拉取增量合并,本地变更防抖推送
// 合并语义(与服务端 progress_api.py 同一套,纯增量只加不删):
//   顶层键取并集;同键两侧都是对象时,远端只补本地缺失的子键,从不覆盖本地已有值。
//   代价:在 A 设备"取消完成"不会同步到已打过勾的 B 设备——进度数据宁可多记不可丢。
const PREFIX = 'to-full-stack';
const CODE_KEY = 'to-full-stack-sync-code';
const AT_KEY = 'to-full-stack-sync-at';
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE_RE = /^[23456789A-HJKMNPQRSTVWXYZ]{12}$/;
const PUSH_DELAY = 2500;
const TIMEOUT = 8000;

// 线上同源直达;本地 dev(5180)直连线上 API(服务端有窄 CORS 白名单)
function apiBase() {
  const h = location.hostname;
  return (h === 'localhost' || h === '127.0.0.1')
    ? 'https://rockcohen.cc/api/progress/'
    : '/api/progress/';
}

function jsonParse(s) { try { return JSON.parse(s); } catch { return null; } }

function lsKeys() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX) && !k.startsWith(PREFIX + '-sync-')) out.push(k);
  }
  return out;
}

function collect() {
  const state = {};
  lsKeys().forEach((k) => { state[k] = jsonParse(localStorage.getItem(k)); });
  return state;
}

// 远端只填补空缺:顶层键缺失 → 整体收编;对象子键缺失 → 补齐
function applyRemote(state) {
  let changed = false;
  Object.keys(state || {}).forEach((k) => {
    if (!k.startsWith(PREFIX) || k.startsWith(PREFIX + '-sync-')) return;
    const local = jsonParse(localStorage.getItem(k));
    const remote = state[k];
    if (local === null || local === undefined) {
      if (remote !== null && remote !== undefined) { localStorage.setItem(k, JSON.stringify(remote)); changed = true; }
    } else if (typeof local === 'object' && typeof remote === 'object' && local !== null && remote !== null) {
      let sub = false;
      Object.keys(remote).forEach((sk) => {
        if (!(sk in local)) { local[sk] = remote[sk]; sub = true; }
      });
      if (sub) { localStorage.setItem(k, JSON.stringify(local)); changed = true; }
    }
  });
  return changed;
}

async function req(method, code, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(apiBase() + code, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    return { status: res.status, data: await res.json().catch(() => null) };
  } finally {
    clearTimeout(timer);
  }
}

export const Sync = (function () {
  'use strict';

  let status = 'idle';   // idle | syncing | ok | pending | error
  let errMsg = '';
  let pushTimer = null;
  let onChange = null;

  function getCode() { return localStorage.getItem(CODE_KEY); }
  function lastAt() { return Number(localStorage.getItem(AT_KEY)) || 0; }
  function enabled() { return !!getCode(); }

  function setStatus(s, msg) {
    status = s;
    errMsg = msg || '';
    if (onChange) onChange();
  }

  function generateCode() {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  }

  async function push() {
    const code = getCode();
    if (!code) return;
    setStatus('syncing');
    try {
      const r = await req('PUT', code, { state: collect() });
      if (r.status === 200 && r.data && r.data.state) {
        applyRemote(r.data.state);            // 收编其他设备合入的部分
        localStorage.setItem(AT_KEY, String(r.data.updated_at));
        setStatus('ok');
      } else {
        setStatus('error', (r.data && r.data.error) || ('HTTP ' + r.status));
      }
    } catch {
      setStatus('error', '网络不可达,下次操作时再试');
    }
  }

  function schedulePush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, PUSH_DELAY);
  }

  // 启动/开启/导入时:拉远端补本地 → 推本地全量
  async function syncOnce() {
    const code = getCode();
    if (!code) return;
    setStatus('syncing');
    try {
      const r = await req('GET', code);
      if (r.status === 200 && r.data) {
        applyRemote(r.data.state);
        localStorage.setItem(AT_KEY, String(r.data.updated_at));
      } else if (r.status !== 404) {
        setStatus('error', (r.data && r.data.error) || ('HTTP ' + r.status));
        return;
      }
    } catch {
      setStatus('error', '网络不可达,本地进度不受影响');
      return;
    }
    await push();
  }

  function enable(code) {
    // 无参调用 = 生成新码;传入码 = 导入已有进度
    const c = code == null ? generateCode() : String(code).toUpperCase().replace(/[\s-]/g, '');
    if (!CODE_RE.test(c)) return '同步码格式不对(12 位,数字和大写字母)';
    const fresh = !getCode();
    localStorage.setItem(CODE_KEY, c);
    syncOnce().then(() => { if (fresh && status !== 'ok') push(); });
    return null;
  }

  function disable() {
    clearTimeout(pushTimer);
    localStorage.removeItem(CODE_KEY);
    localStorage.removeItem(AT_KEY);
    setStatus('idle');
  }

  function noteLocalChange() {
    if (!enabled()) return;
    setStatus('pending');
    schedulePush();
  }

  function init(cb) {
    onChange = cb;
    if (enabled()) syncOnce();
  }

  return { init, enable, disable, noteLocalChange, generateCode, getCode, lastAt, enabled, get status() { return status; }, get errMsg() { return errMsg; } };
})();
