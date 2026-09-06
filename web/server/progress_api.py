#!/usr/bin/env python3
# rockcohen.cc 全栈之旅 · 学习进度同步 API · 纯 Python 标准库，零外部依赖
# 部署形态与 /opt/comments/comments_api.py 完全一致：systemd 托管，
# 只监听 127.0.0.1，nginx 把 /api/progress/ 前缀剥掉后转到这里。
# 路由：
#   GET /progress/<code>   读进度 → {state, updated_at}；码不存在 → 404
#   PUT /progress/<code>   存进度 {state} → 服务端增量合并后落库，
#                          返回 {ok, updated_at, state(合并后)}
# 安全模型：同步码即唯一凭据（12 位无易混淆字符 ≈ 60bit 熵，不猜不出），
# 没有列出/枚举接口；所有 SQL 值一律 ? 参数绑定；每 IP 限流；请求体有上限。
# 合并语义（与客户端 sync.js 同一套）：顶层键取并集；两侧同键且都是对象时
# 按子键合并（新值覆盖冲突子键）——纯增量，双向都只加不删，谁也不会清掉谁。
import json
import os
import re
import sqlite3
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DB_PATH = os.environ.get("PROGRESS_DB", "/var/lib/progress/progress.db")
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"
BIND_HOST, PORT = "127.0.0.1", 8788

CODE_RE = re.compile(r"^/progress/([23456789A-HJKMNPQRSTVWXYZ]{12})$")
KEY_RE = re.compile(r"^to-full-stack[a-z0-9-]{0,64}$")

MAX_KEYS, MAX_VALUE, MAX_TOTAL = 64, 8192, 131072
# 本地开发(vite dev 5180)直连线上 API 用；线上页面同源访问，用不到 CORS
DEV_ORIGINS = {"http://localhost:5180", "http://127.0.0.1:5180"}
LIMITS = {"GET": (60, 60), "PUT": (20, 60)}  # 方法 → (次数, 窗口秒)

_rate_lock = threading.Lock()
_rate_hits = {}


def db_init():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    conn.commit()
    conn.close()


def rate_ok(ip, method):
    n, sec = LIMITS[method]
    now = time.time()
    with _rate_lock:
        wins = [t for t in _rate_hits.get((ip, method), []) if now - t < sec]
        if len(wins) >= n:
            _rate_hits[(ip, method)] = wins
            return False
        wins.append(now)
        _rate_hits[(ip, method)] = wins
        return True


def merge_state(old, new):
    if not isinstance(old, dict):
        return new
    out = dict(old)
    for k, v in new.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            m = dict(out[k])
            m.update(v)
            out[k] = m
        else:
            out[k] = v
    return out


def validate_state(state):
    """返回 state 原对象（结构合法时），不合法返回 None。"""
    if not isinstance(state, dict) or len(state) > MAX_KEYS:
        return None
    total = 0
    for k, v in state.items():
        if not isinstance(k, str) or not KEY_RE.match(k):
            return None
        try:
            blob = json.dumps(v, ensure_ascii=False)
        except (TypeError, ValueError):
            return None
        if len(blob) > MAX_VALUE:
            return None
        total += len(blob)
        if total > MAX_TOTAL:
            return None
    return state


class Handler(BaseHTTPRequestHandler):
    server_version = "ProgressAPI/1.0"

    def _cors(self):
        origin = self.headers.get("Origin")
        if origin in DEV_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")

    def _json(self, code, obj):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self._cors()
        self.end_headers()
        self.wfile.write(data)

    def _ip(self):
        return self.headers.get("X-Real-IP") or self.client_address[0]

    def _body_json(self):
        try:
            n = int(self.headers.get("Content-Length") or 0)
            if n > MAX_TOTAL + 1024:
                return None
            return json.loads(self.rfile.read(n).decode("utf-8"))
        except Exception:
            return None

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, PUT")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")
        self._cors()
        self.end_headers()

    def do_GET(self):
        m = CODE_RE.match(self.path)
        if not m:
            return self._json(404, {"error": "not found"})
        if not rate_ok(self._ip(), "GET"):
            return self._json(429, {"error": "too fast"})
        try:
            conn = sqlite3.connect(DB_PATH, timeout=10)
            row = conn.execute(
                "SELECT state, updated_at FROM progress WHERE code=?",
                (m.group(1),),
            ).fetchone()
            conn.close()
        except sqlite3.Error:
            return self._json(500, {"error": "存储不可用"})
        if not row:
            return self._json(404, {"error": "not found"})
        return self._json(200, {"state": json.loads(row[0]), "updated_at": row[1]})

    def do_PUT(self):
        m = CODE_RE.match(self.path)
        if not m:
            return self._json(404, {"error": "not found"})
        if not rate_ok(self._ip(), "PUT"):
            return self._json(429, {"error": "同步太频繁，稍后再试"})
        data = self._body_json()
        state = validate_state(data.get("state") if isinstance(data, dict) else None)
        if state is None:
            return self._json(400, {"error": "bad state"})
        try:
            conn = sqlite3.connect(DB_PATH, timeout=10)
            now = int(time.time() * 1000)
            row = conn.execute(
                "SELECT state FROM progress WHERE code=?",
                (m.group(1),),
            ).fetchone()
            merged = merge_state(json.loads(row[0]) if row else {}, state)
            blob = json.dumps(merged, ensure_ascii=False)
            if row:
                conn.execute(
                    "UPDATE progress SET state=?, updated_at=? WHERE code=?",
                    (blob, now, m.group(1)),
                )
            else:
                conn.execute(
                    "INSERT INTO progress(code,state,created_at,updated_at) VALUES(?,?,?,?)",
                    (m.group(1), blob, now, now),
                )
            conn.commit()
            conn.close()
        except (sqlite3.Error, ValueError):
            return self._json(500, {"error": "存储不可用"})
        return self._json(200, {"ok": True, "updated_at": now, "state": merged})

    def log_message(self, fmt, *args):
        pass  # 访问日志静默，避免写爆 journal


if __name__ == "__main__":
    db_init()
    print("progress API on %s:%d" % (BIND_HOST, PORT), flush=True)
    ThreadingHTTPServer((BIND_HOST, PORT), Handler).serve_forever()
