import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { enqueueSyncJob } from './syncQueue';
import type { ManagementEntry } from '@/types';

export async function getByCaseId(caseId: string): Promise<ManagementEntry[]> {
  const db = getDb();
  const res = await db.query(
    `SELECT * FROM management_entries WHERE case_id = ? AND is_deleted = 0 ORDER BY date ASC`,
    [caseId]
  );
  return (res.values ?? []).map((row: any) => {
    const base = { id: row.id, caseId: row.case_id, type: row.type, date: row.date };
    if (row.type === 'Medications') {
      return {
        ...base,
        medications: row.medications ? JSON.parse(row.medications) : [],
        chartImage: row.chart_image,
      } as ManagementEntry;
    }
    return { ...base, mode: row.mode ?? '', details: row.details ?? '' } as ManagementEntry;
  });
}

export async function create(
  caseId: string,
  data: {
    type: 'Medications' | 'Respiratory Support' | 'Feeding';
    date: string;
    medications?: string[];
    chartImage?: string;
    mode?: string;
    details?: string;
  }
): Promise<ManagementEntry> {
  const db = getDb();
  const id = generateId();
  const medications = data.type === 'Medications' && data.medications
    ? JSON.stringify(data.medications) : null;

  await db.run(
    `INSERT INTO management_entries (id, case_id, type, date, medications, chart_image, mode, details, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [id, caseId, data.type, data.date, medications, data.chartImage ?? null, data.mode ?? null, data.details ?? null]
  );

  await enqueueSyncJob('management_entries', id, 'INSERT');

  const base = { id, caseId, type: data.type, date: data.date };
  if (data.type === 'Medications') {
    return { ...base, type: 'Medications', medications: data.medications ?? [], chartImage: data.chartImage } as ManagementEntry;
  }
  return { ...base, mode: data.mode ?? '', details: data.details ?? '' } as ManagementEntry;
}

export async function update(
  id: string,
  data: Partial<{ date: string; medications: string[]; chartImage: string; mode: string; details: string }>
): Promise<void> {
  const db = getDb();
  const sets: string[] = [];
  const params: any[] = [];

  if (data.date !== undefined) { sets.push('date = ?'); params.push(data.date); }
  if (data.medications !== undefined) { sets.push('medications = ?'); params.push(JSON.stringify(data.medications)); }
  if (data.chartImage !== undefined) { sets.push('chart_image = ?'); params.push(data.chartImage); }
  if (data.mode !== undefined) { sets.push('mode = ?'); params.push(data.mode); }
  if (data.details !== undefined) { sets.push('details = ?'); params.push(data.details); }

  sets.push("updated_at = datetime('now')");
  params.push(id);

  await db.run(`UPDATE management_entries SET ${sets.join(', ')} WHERE id = ?`, params);
  await enqueueSyncJob('management_entries', id, 'UPDATE');
}

export async function deleteManagement(id: string): Promise<void> {
  const db = getDb();
  await db.run(`UPDATE management_entries SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?`, [id]);
  await enqueueSyncJob('management_entries', id, 'DELETE');
}
