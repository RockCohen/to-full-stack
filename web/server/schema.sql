-- 全栈之旅 · 学习进度同步 · 建表语句（服务启动时由 progress_api.py 自动执行）
CREATE TABLE IF NOT EXISTS progress (
  code       TEXT PRIMARY KEY,  -- 同步码（唯一凭据）
  state      TEXT NOT NULL,     -- 进度 JSON：{ "to-full-stack*": <任意 JSON 值> }
  created_at INTEGER NOT NULL,  -- 首次上报时间(ms)
  updated_at INTEGER NOT NULL   -- 最近同步时间(ms)
);
