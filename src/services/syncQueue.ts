import { getDb } from '@/db/database';
import generateId from '@/db/generateId';

export async function enqueueSyncJob(
  tableName: string,
  recordId: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  payload?: object
): Promise<void> {
  const db = getDb();
  const id = generateId();
  const payloadStr = payload ? JSON.stringify(payload) : null;

  await db.run(
    `INSERT INTO sync_queue (id, table_name, record_id, operation, payload, created_at, status, retry_count)
     VALUES (?, ?, ?, ?, ?, datetime('now'), 'pending', 0)`,
    [id, tableName, recordId, operation, payloadStr]
  );
}
