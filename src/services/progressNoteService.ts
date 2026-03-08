import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { enqueueSyncJob } from './syncQueue';
import type { ProgressNote, VitalSigns } from '@/types';

export async function getByCaseId(caseId: string): Promise<ProgressNote[]> {
  const db = getDb();
  const res = await db.query(
    `SELECT * FROM progress_notes WHERE case_id = ? AND is_deleted = 0 ORDER BY date DESC`,
    [caseId]
  );
  const notes: ProgressNote[] = [];
  for (const pn of res.values ?? []) {
    const vRes = await db.query(
      `SELECT * FROM vitals WHERE progress_note_id = ? LIMIT 1`,
      [pn.id]
    );
    const v = vRes.values?.[0];
    const vitals: VitalSigns = {
      hr: v?.hr ?? '', spo2: v?.spo2 ?? '', temp: v?.temp ?? '',
      rr: v?.rr ?? '', bp: v?.bp ?? '', weight: v?.weight ?? '',
      dateTime: v?.date_time ?? '',
    };
    notes.push({
      id: pn.id, caseId: pn.case_id, date: pn.date,
      assessment: pn.assessment ?? '', vitals,
    });
  }
  return notes;
}

export async function create(
  caseId: string,
  data: { date: string; assessment: string; vitals: VitalSigns }
): Promise<ProgressNote> {
  const db = getDb();
  const id = generateId();

  await db.run(
    `INSERT INTO progress_notes (id, case_id, date, assessment, created_at, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [id, caseId, data.date, data.assessment]
  );

  const vitalsId = generateId();
  await db.run(
    `INSERT INTO vitals (id, progress_note_id, hr, spo2, temp, rr, bp, weight, date_time, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [vitalsId, id, data.vitals.hr, data.vitals.spo2, data.vitals.temp,
     data.vitals.rr, data.vitals.bp, data.vitals.weight, data.vitals.dateTime]
  );

  await enqueueSyncJob('progress_notes', id, 'INSERT');

  return { id, caseId, date: data.date, assessment: data.assessment, vitals: data.vitals };
}

export async function update(
  id: string,
  data: Partial<{ date: string; assessment: string; vitals: VitalSigns }>
): Promise<void> {
  const db = getDb();

  const sets: string[] = [];
  const params: any[] = [];

  if (data.date !== undefined) { sets.push('date = ?'); params.push(data.date); }
  if (data.assessment !== undefined) { sets.push('assessment = ?'); params.push(data.assessment); }

  if (sets.length > 0) {
    sets.push("updated_at = datetime('now')");
    params.push(id);
    await db.run(`UPDATE progress_notes SET ${sets.join(', ')} WHERE id = ?`, params);
  }

  if (data.vitals) {
    const v = data.vitals;
    await db.run(
      `UPDATE vitals SET hr = ?, spo2 = ?, temp = ?, rr = ?, bp = ?, weight = ?, date_time = ?
       WHERE progress_note_id = ?`,
      [v.hr, v.spo2, v.temp, v.rr, v.bp, v.weight, v.dateTime, id]
    );
  }

  await enqueueSyncJob('progress_notes', id, 'UPDATE');
}

export async function deleteProgressNote(id: string): Promise<void> {
  const db = getDb();
  await db.run(`UPDATE progress_notes SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?`, [id]);
  await db.run(`DELETE FROM vitals WHERE progress_note_id = ?`, [id]);
  await enqueueSyncJob('progress_notes', id, 'DELETE');
}
