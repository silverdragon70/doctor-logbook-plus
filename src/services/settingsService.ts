import { getDb } from '@/db/database';

export interface AppSettings {
  [key: string]: string | boolean;
  themeColor: string;
  darkMode: boolean;
  fontSize: string;
  dateFormat: string;
  defaultHospitalId: string;
  aiProvider: string;
  apiKey: string;
  aiModel: string;
  aiLanguage: string;
  aiFeatures: boolean;
  syncEnabled: boolean;
  syncFrequency: string;
  encryptedBackup: boolean;
  pinLock: boolean;
  biometric: boolean;
  confirmDialogs: boolean;
  autoSave: boolean;
  imageQuality: string;
  imageMaxSize: string;
}

const BOOLEAN_KEYS = new Set([
  'darkMode', 'aiFeatures', 'syncEnabled', 'encryptedBackup',
  'pinLock', 'biometric', 'confirmDialogs', 'autoSave',
]);

export async function getAll(): Promise<AppSettings> {
  const db = getDb();
  const res = await db.query('SELECT * FROM settings');
  const settings: any = {};
  for (const row of res.values || []) {
    const key = row.key as string;
    const value = row.value as string;
    settings[key] = BOOLEAN_KEYS.has(key) ? value === 'true' : value;
  }
  return settings as AppSettings;
}

export async function get(key: string): Promise<string | null> {
  const db = getDb();
  const res = await db.query('SELECT value FROM settings WHERE key = ?', [key]);
  if (res.values && res.values.length > 0) return res.values[0].value;
  return null;
}

export async function set(key: string, value: string): Promise<void> {
  const db = getDb();
  await db.run(
    "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))",
    [key, value]
  );
}

export async function setMany(updates: Record<string, string | boolean>): Promise<void> {
  for (const [key, value] of Object.entries(updates)) {
    await set(key, String(value));
  }
}
