-- KOST E-EXAM V2 — schéma natif (SQLite)
-- Voir docs/KOST_EEXAM_V2_ARCHITECTURE.md §5 pour l'ERD et la justification
-- de chaque table. DDL uniquement ici — les données de référence (rôles,
-- fonctions 7.1-7.10) sont insérées de façon idempotente par scripts/migrate.ts.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE CHECK (code IN ('candidate','pedagogical_manager','administrator','auditor')),
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  mfa_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Registre serveur des sessions — distinct du cookie iron-session. Permet
-- une révocation server-side réelle (§20 de la mission) : le cookie seul
-- (payload chiffré stateless) ne peut jamais être invalidé de force avant
-- son expiration naturelle.
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  revoked_by INTEGER REFERENCES users(id),
  ip_address TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'production' CHECK (scope IN ('production','demo','test')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  session_label TEXT,
  date_start TEXT,
  date_end TEXT,
  pedagogical_manager_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  scope TEXT NOT NULL DEFAULT 'production' CHECK (scope IN ('production','demo','test')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_by INTEGER REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_groups_company ON groups(company_id);

CREATE TABLE IF NOT EXISTS group_members (
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  candidate_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  added_by INTEGER REFERENCES users(id),
  PRIMARY KEY (group_id, candidate_user_id)
);

CREATE TABLE IF NOT EXISTS functions (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kost_question_id TEXT NOT NULL UNIQUE,
  function_code TEXT NOT NULL REFERENCES functions(code),
  subtask TEXT,
  qtype TEXT NOT NULL DEFAULT 'mcq_single' CHECK (qtype IN ('mcq_single','mcq_multi','true_false')),
  language TEXT NOT NULL DEFAULT 'fr',
  source_status TEXT NOT NULL DEFAULT 'NOT_ATTEMPTED' CHECK (source_status IN
    ('FROZEN_SOURCE_VERIFIED','DRAFT','PARTIAL','STALE','SOURCE_GAP','SOURCE_CONFLICT','NOT_ATTEMPTED')),
  regulatory_reference TEXT,
  reviewer_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (reviewer_status IN ('PENDING','APPROVED','REJECTED')),
  review_date TEXT,
  verification_date TEXT,
  current_version_id INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_by INTEGER REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_questions_function ON questions(function_code);

-- Append-only : jamais d'UPDATE sur une version existante (§4 de la
-- mission — un examen publié doit toujours pouvoir montrer la version EXACTE
-- reçue par le candidat, même si la question a changé depuis).
CREATE TABLE IF NOT EXISTS question_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL,
  stem TEXT NOT NULL,
  choices_json TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_by INTEGER REFERENCES users(id),
  UNIQUE(question_id, version_no)
);

CREATE TABLE IF NOT EXISTS question_tags (
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (question_id, tag)
);

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('exercice','test','examen')),
  name TEXT NOT NULL,
  function_code TEXT NOT NULL REFERENCES functions(code),
  group_id INTEGER NOT NULL REFERENCES groups(id),
  question_source TEXT NOT NULL DEFAULT 'random' CHECK (question_source IN ('random','manual')),
  question_count INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  pass_threshold_pct INTEGER NOT NULL DEFAULT 80,
  attempts_allowed INTEGER NOT NULL DEFAULT 1,
  open_at TEXT,
  close_at TEXT,
  shuffle_questions INTEGER NOT NULL DEFAULT 1,
  shuffle_answers INTEGER NOT NULL DEFAULT 1,
  feedback_mode TEXT NOT NULL DEFAULT 'deferred' CHECK (feedback_mode IN ('immediate','deferred','none')),
  show_result INTEGER NOT NULL DEFAULT 1,
  show_correct_answers INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','open','closed','suspended','archived')),
  scope TEXT NOT NULL DEFAULT 'production' CHECK (scope IN ('production','demo','test')),
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  published_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_assessments_group ON assessments(group_id);

CREATE TABLE IF NOT EXISTS assessment_question_pool (
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  PRIMARY KEY (assessment_id, question_id)
);

-- Copie figée exacte, prise UNE fois à la publication. Ne référence plus
-- `questions`/`question_versions` en lecture pour l'examen candidat — c'est
-- la preuve d'audit ("voici exactement la question reçue par ce candidat").
CREATE TABLE IF NOT EXISTS assessment_question_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  version_id INTEGER NOT NULL REFERENCES question_versions(id),
  stem_snapshot TEXT NOT NULL,
  choices_snapshot_json TEXT NOT NULL,
  correct_answer_snapshot TEXT NOT NULL,
  points REAL NOT NULL DEFAULT 1,
  UNIQUE(assessment_id, position)
);

CREATE TABLE IF NOT EXISTS assessment_assignments (
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  candidate_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  assigned_by INTEGER REFERENCES users(id),
  PRIMARY KEY (assessment_id, candidate_user_id)
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id),
  candidate_user_id INTEGER NOT NULL REFERENCES users(id),
  attempt_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','auto_submitted','abandoned')),
  started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at TEXT NOT NULL,
  submitted_at TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(assessment_id, candidate_user_id, attempt_number)
);
-- LA garantie anti-double-tentative (§9) : au plus une ligne 'in_progress'
-- par couple (assessment, candidat), appliquée par SQLite lui-même (index
-- unique partiel), pas seulement par du code applicatif qui pourrait avoir
-- une fenêtre de course. Un double clic / deux onglets fait échouer le
-- second INSERT proprement (contrainte violée), jamais une deuxième ligne.
CREATE UNIQUE INDEX IF NOT EXISTS uq_attempts_one_active
  ON attempts(assessment_id, candidate_user_id)
  WHERE status = 'in_progress';
CREATE INDEX IF NOT EXISTS idx_attempts_candidate ON attempts(candidate_user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment ON attempts(assessment_id);

CREATE TABLE IF NOT EXISTS attempt_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  snapshot_id INTEGER NOT NULL REFERENCES assessment_question_snapshots(id),
  choices_order_json TEXT,
  marked_for_review INTEGER NOT NULL DEFAULT 0,
  UNIQUE(attempt_id, position)
);

CREATE TABLE IF NOT EXISTS attempt_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  attempt_question_id INTEGER NOT NULL REFERENCES attempt_questions(id) ON DELETE CASCADE,
  answer_json TEXT,
  answered_at TEXT,
  is_correct INTEGER,
  points_awarded REAL,
  UNIQUE(attempt_question_id)
);

-- Source unique de vérité (§10) : écrite une seule fois par le moteur de
-- notation (lib/grading.ts, gradeAttempt()). Aucune autre page ne recalcule
-- un score — toutes lisent cette table.
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL UNIQUE REFERENCES attempts(id) ON DELETE CASCADE,
  raw_score REAL NOT NULL,
  max_raw_score REAL NOT NULL,
  score_100 REAL NOT NULL,
  percentage REAL NOT NULL,
  pass_threshold_pct INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  graded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  locked INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  occurred_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  description TEXT NOT NULL,
  system_concerned TEXT,
  people_concerned TEXT,
  responsible_user_id INTEGER REFERENCES users(id),
  -- NULL = incident plateforme (ex. panne serveur, cyberattaque globale) —
  -- visible de tous les rôles habilités aux incidents. Non-NULL = incident
  -- propre à un client/groupe — voir lib/tenant-scope.ts hasIncidentAccess().
  -- Pas d'index CREATE ici (contrairement aux autres tables de ce fichier) :
  -- sur une base DÉJÀ existante (staging/production), ce fichier s'exécute
  -- AVANT que scripts/migrate.ts n'ajoute réellement la colonne group_id
  -- (ALTER TABLE, une table CREATE TABLE IF NOT EXISTS existante n'est
  -- jamais modifiée) — indexer une colonne pas encore créée échouerait.
  -- L'index est créé par migrate.ts, après coup, une fois la colonne garantie.
  group_id INTEGER REFERENCES groups(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','closed')),
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS incident_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN
    ('suspend_account','reactivate_account','force_logout','revoke_sessions',
     'suspend_assessment','reopen_assessment','attach_evidence','note','corrective_measure','close')),
  target_type TEXT,
  target_id INTEGER,
  actor_user_id INTEGER REFERENCES users(id),
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Insert-only. Le rôle DB applicatif de production ne doit pas avoir les
-- droits UPDATE/DELETE sur cette table (voir docs §12) ; en SQLite (pas de
-- GRANT par table), l'invariant est appliqué par convention de code stricte
-- : aucune fonction d'écriture autre que audit() dans lib/audit.ts.
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  actor_user_id INTEGER REFERENCES users(id),
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  result TEXT NOT NULL DEFAULT 'success' CHECK (result IN ('success','failure')),
  ip_address TEXT,
  session_id INTEGER,
  metadata_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

CREATE TABLE IF NOT EXISTS exports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  requested_by INTEGER REFERENCES users(id),
  filters_json TEXT,
  row_count INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  file_checksum TEXT
);

CREATE TABLE IF NOT EXISTS imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  preview_json TEXT,
  status TEXT NOT NULL DEFAULT 'preview' CHECK (status IN ('preview','validated','committed','rejected')),
  mapping_json TEXT,
  errors_json TEXT,
  source_import TEXT,
  imported_by INTEGER REFERENCES users(id),
  imported_at TEXT
);

CREATE TABLE IF NOT EXISTS backup_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('full_db','restore_test')),
  status TEXT NOT NULL CHECK (status IN ('success','failure')),
  size_bytes INTEGER,
  sha256 TEXT,
  duration_seconds REAL,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
