PRAGMA foreign_keys = ON;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member','moderator')),
  disabled INTEGER NOT NULL DEFAULT 0 CHECK(disabled IN (0,1)),
  created_at INTEGER NOT NULL
);
CREATE TABLE oauth_requests (
  state_hash TEXT PRIMARY KEY,
  verifier TEXT NOT NULL,
  nonce TEXT NOT NULL,
  return_path TEXT NOT NULL,
  display_name TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  accepted_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX oauth_expiry ON oauth_requests(expires_at);
CREATE INDEX oauth_recent ON oauth_requests(accepted_at);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  csrf_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX session_user ON sessions(user_id);
CREATE INDEX session_expiry ON sessions(expires_at);
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  component_id TEXT NOT NULL,
  caption TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('processing','pending','approved','rejected','removed','failed','expired','blocked')),
  pending_key TEXT,
  public_key TEXT,
  evidence_key TEXT,
  width INTEGER,
  height INTEGER,
  bytes INTEGER,
  policy_version TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  published_at INTEGER,
  reviewed_at INTEGER,
  reviewed_by TEXT REFERENCES users(id),
  review_reason TEXT,
  legal_hold INTEGER NOT NULL DEFAULT 0 CHECK(legal_hold IN (0,1))
);
CREATE INDEX public_photos ON photos(component_id,status,created_at DESC,id DESC);
CREATE INDEX owner_photos ON photos(user_id,created_at DESC,id DESC);
CREATE INDEX moderation_queue ON photos(status,created_at,id);
CREATE INDEX preserved_photos ON photos(legal_hold,status);
CREATE TABLE upload_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL
);
CREATE INDEX attempts_user_day ON upload_attempts(user_id,created_at);
CREATE INDEX attempts_day ON upload_attempts(created_at);
CREATE TABLE consents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL CHECK(action IN ('account','upload')),
  policy_version TEXT NOT NULL,
  accepted_at INTEGER NOT NULL,
  photo_id TEXT REFERENCES photos(id)
);
CREATE INDEX consent_user ON consents(user_id,accepted_at);
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  photo_id TEXT NOT NULL REFERENCES photos(id),
  reason TEXT NOT NULL CHECK(reason IN ('copyright','privacy','inappropriate','illegal','other')),
  details TEXT NOT NULL,
  contact_email TEXT,
  created_at INTEGER NOT NULL,
  resolved_at INTEGER,
  resolved_by TEXT REFERENCES users(id),
  resolution TEXT,
  legal_hold INTEGER NOT NULL DEFAULT 0 CHECK(legal_hold IN (0,1))
);
CREATE INDEX reports_queue ON reports(resolved_at,created_at);
CREATE INDEX reports_photo ON reports(photo_id,created_at);
CREATE INDEX reports_day ON reports(created_at);
CREATE TABLE moderation_events (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES users(id),
  photo_id TEXT REFERENCES photos(id),
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE photo_cleanup (
  object_key TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);
CREATE INDEX cleanup_age ON photo_cleanup(created_at);
