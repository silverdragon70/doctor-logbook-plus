import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { enqueueSyncJob } from './syncQueue';
import type { Investigation } from '@/types';

export async function getByCaseId(caseId: string): Promise<Investigation[]> {
  const db = getDb();
  const res = await db.query(
    `SELECT * FROM investigations WHERE case_id = ? AND is_deleted = 0 ORDER BY date DESC`,
    [caseId]
  );
  const investigations: Investigation[] = [];
  for (const inv of res.values ?? []) {
    const imgRes = await db.query(
      `SELECT file_path FROM investigation_images WHERE investigation_id = ?`,
      [inv.id]
    );
    investigations.push({
      id: inv.id,
      caseId: inv.case_id,
      name: inv.name,
      type: inv.type,
      date: inv.date,
      result: inv.result ?? '',
      images: (imgRes.values ?? []).map((r: any) => r.file_path),
    });
  }
  return investigations;
}

export async function create(
  caseId: string,
  data: { name: string; type: 'Lab Result' | 'Imaging' | 'Other'; date: string; result: string; images?: string[] }
): Promise<Investigation> {
  const db = getDb();
  const id = generateId();

  await db.run(
    `INSERT INTO investigations (id, case_id, name, type, date, result, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [id, caseId, data.name, data.type, data.date, data.result]
  );

  if (data.images && data.images.length > 0) {
    for (const imgPath of data.images) {
      await db.run(
        `INSERT INTO investigation_images (id, investigation_id, file_path, created_at)
         VALUES (?, ?, ?, datetime('now'))`,
        [generateId(), id, imgPath]
      );
    }
  }

  await enqueueSyncJob('investigations', id, 'INSERT');

  return {
    id, caseId, name: data.name, type: data.type,
    date: data.date, result: data.result, images: data.images ?? [],
  };
}

export async function update(
  id: string,
  data: Partial<{ name: string; type: string; date: string; result: string }>
): Promise<void> {
  const db = getDb();
  const sets: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) { sets.push('name = ?'); params.push(data.name); }
  if (data.type !== undefined) { sets.push('type = ?'); params.push(data.type); }
  if (data.date !== undefined) { sets.push('date = ?'); params.push(data.date); }
  if (data.result !== undefined) { sets.push('result = ?'); params.push(data.result); }

  sets.push("updated_at = datetime('now')");
  params.push(id);

  await db.run(`UPDATE investigations SET ${sets.join(', ')} WHERE id = ?`, params);
  await enqueueSyncJob('investigations', id, 'UPDATE');
}

export async function deleteInvestigation(id: string): Promise<void> {
  const db = getDb();
  await db.run(`UPDATE investigations SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?`, [id]);
  await db.run(`DELETE FROM investigation_images WHERE investigation_id = ?`, [id]);
  await enqueueSyncJob('investigations', id, 'DELETE');
}
