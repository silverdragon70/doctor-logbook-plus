export const V1_MIGRATION = `
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dob_day TEXT NOT NULL,
  dob_month TEXT NOT NULL,
  dob_year TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male','female')),
  file_number TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  unit TEXT,
  location TEXT,
  position TEXT,
  start_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  hospital_id TEXT REFERENCES hospitals(id),
  admission_date TEXT NOT NULL,
  specialty TEXT NOT NULL,
  provisional_diagnosis TEXT,
  final_diagnosis TEXT,
  chief_complaint TEXT,
  history_complaint TEXT,
  present_history TEXT,
  past_medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','discharged')),
  discharge_date TEXT,
  discharge_outcome TEXT,
  discharge_notes TEXT,
  last_modified INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS investigations (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Lab Result','Imaging','Other')),
  date TEXT NOT NULL,
  result TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS investigation_images (
  id TEXT PRIMARY KEY,
  investigation_id TEXT NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS management_entries (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Medications','Respiratory Support','Feeding')),
  date TEXT NOT NULL,
  medications TEXT,
  chart_image TEXT,
  mode TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS progress_notes (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  assessment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS vitals (
  id TEXT PRIMARY KEY,
  progress_note_id TEXT NOT NULL REFERENCES progress_notes(id) ON DELETE CASCADE,
  hr TEXT,
  spo2 TEXT,
  temp TEXT,
  rr TEXT,
  bp TEXT,
  weight TEXT,
  date_time TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS procedures (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  participation TEXT NOT NULL CHECK (participation IN ('Performed','Assisted','Observed')),
  patient_name TEXT,
  hospital TEXT,
  supervisor TEXT,
  location TEXT,
  indication TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS lectures (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  date TEXT NOT NULL,
  speaker TEXT,
  duration TEXT,
  location TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  provider TEXT,
  duration TEXT,
  has_certificate INTEGER NOT NULL DEFAULT 0,
  certificate_path TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  payload TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS backup_history (
  id TEXT PRIMARY KEY,
  app_version TEXT NOT NULL,
  date TEXT NOT NULL,
  backup_type TEXT NOT NULL,
  size TEXT,
  destination TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  changes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cases_patient_id ON cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_last_modified ON cases(last_modified);
CREATE INDEX IF NOT EXISTS idx_cases_admission_date ON cases(admission_date DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_case_id ON investigations(case_id);
CREATE INDEX IF NOT EXISTS idx_management_case_id ON management_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_progress_notes_case_id ON progress_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_media_case_id ON media(case_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
`;

export const DEFAULT_SETTINGS: Record<string, string> = {
  schema_version: '1',
  themeColor: 'blue',
  darkMode: 'false',
  fontSize: 'medium',
  dateFormat: 'DD MMM YYYY',
  defaultHospitalId: '',
  aiProvider: 'anthropic',
  apiKey: '',
  aiModel: 'sonnet',
  aiLanguage: 'english',
  aiFeatures: 'true',
  syncEnabled: 'false',
  syncFrequency: 'daily',
  encryptedBackup: 'true',
  pinLock: 'false',
  biometric: 'false',
  confirmDialogs: 'true',
  autoSave: 'true',
  imageQuality: 'original',
  imageMaxSize: '5',
};
