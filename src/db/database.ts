import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { V1_MIGRATION, DEFAULT_SETTINGS } from './migrations/v1';
import generateId from './generateId';

const DB_NAME = 'medora.db';
const DB_PASSWORD_KEY = 'medora_db_password';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;

function generatePassword(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getOrCreatePassword(): Promise<string> {
  const { value } = await Preferences.get({ key: DB_PASSWORD_KEY });
  if (value) return value;

  const password = generatePassword();
  await Preferences.set({ key: DB_PASSWORD_KEY, value: password });
  return password;
}

export async function initDatabase(): Promise<void> {
  if (db) return;

  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    // On web, use jeep-sqlite for development/testing
    console.log('Running on web platform — SQLite limited to native');
    console.log('Database initialized successfully (web mock)');
    return;
  }

  const password = await getOrCreatePassword();

  const ret = await sqlite.checkConnectionsConsistency();
  const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

  if (ret.result && isConn) {
    db = await sqlite.retrieveConnection(DB_NAME, false);
  } else {
    db = await sqlite.createConnection(
      DB_NAME,
      true, // encrypted
      'secret', // mode
      1, // version
      false // readonly
    );
  }

  await db.open();

  // Set WAL mode
  await db.execute('PRAGMA journal_mode = WAL;');

  // Run migration
  const statements = V1_MIGRATION.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    await db.execute(stmt + ';');
  }

  // Check if schema_version exists, if not seed default settings
  const res = await db.query("SELECT value FROM settings WHERE key = 'schema_version'");
  if (!res.values || res.values.length === 0) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await db.execute(
        `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('${key}', '${value}', datetime('now'));`
      );
    }
  }

  console.log('Database initialized successfully');
}

export function getDb(): SQLiteDBConnection {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export { generateId };
