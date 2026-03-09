import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { V1_MIGRATION, DEFAULT_SETTINGS } from './migrations/v1';
import generateId from './generateId';

const DB_NAME = 'medora_db';
const DB_STORE = 'medora_store';

let db: SqlJsDatabase | null = null;

// Persistence helpers using IndexedDB
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_STORE, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('db');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction('db', 'readonly');
    const store = tx.objectStore('db');
    const req = store.get(DB_NAME);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIndexedDB(): Promise<void> {
  if (!db) return;
  const data = db.export();
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction('db', 'readwrite');
    const store = tx.objectStore('db');
    store.put(data, DB_NAME);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Debounced auto-save
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToIndexedDB().catch(console.error);
  }, 500);
}

// Wrapper that mimics @capacitor-community/sqlite's API
interface CompatibleDb {
  query(sql: string, params?: any[]): Promise<{ values: any[] }>;
  run(sql: string, params?: any[]): Promise<{ changes: { changes: number; lastId: number } }>;
  execute(sql: string): Promise<void>;
}

function createWrapper(sqlDb: SqlJsDatabase): CompatibleDb {
  return {
    async query(sql: string, params?: any[]) {
      try {
        const stmt = sqlDb.prepare(sql);
        if (params) stmt.bind(params);
        const values: any[] = [];
        while (stmt.step()) {
          values.push(stmt.getAsObject());
        }
        stmt.free();
        return { values };
      } catch (e) {
        console.error('SQL query error:', sql, e);
        return { values: [] };
      }
    },
    async run(sql: string, params?: any[]) {
      try {
        sqlDb.run(sql, params);
        scheduleSave();
        const changes = sqlDb.getRowsModified();
        // Get last insert rowid
        const lastIdResult = sqlDb.exec('SELECT last_insert_rowid() as id');
        const lastId = lastIdResult.length > 0 ? lastIdResult[0].values[0][0] as number : 0;
        return { changes: { changes, lastId } };
      } catch (e) {
        console.error('SQL run error:', sql, e);
        return { changes: { changes: 0, lastId: 0 } };
      }
    },
    async execute(sql: string) {
      try {
        sqlDb.run(sql);
        scheduleSave();
      } catch (e) {
        console.error('SQL execute error:', sql, e);
      }
    },
  };
}

let dbWrapper: CompatibleDb | null = null;

export async function initDatabase(): Promise<void> {
  if (db) return;

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  // Try to load existing DB from IndexedDB
  const savedData = await loadFromIndexedDB();
  if (savedData) {
    db = new SQL.Database(savedData);
  } else {
    db = new SQL.Database();
  }

  dbWrapper = createWrapper(db);

  // Set WAL mode (no-op in sql.js but harmless)
  await dbWrapper.execute('PRAGMA journal_mode = WAL;');

  // Run migration
  const statements = V1_MIGRATION.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    await dbWrapper.execute(stmt + ';');
  }

  // Check if schema_version exists, if not seed default settings
  const res = await dbWrapper.query("SELECT value FROM settings WHERE key = 'schema_version'");
  if (!res.values || res.values.length === 0) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await dbWrapper.execute(
        `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('${key}', '${value}', datetime('now'));`
      );
    }
  }

  // Force save after init
  await saveToIndexedDB();

  console.log('Database initialized successfully (sql.js)');
}

export function getDb(): CompatibleDb {
  if (!dbWrapper) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbWrapper;
}

export { generateId };
