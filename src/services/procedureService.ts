import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { enqueueSyncJob } from './syncQueue';

export interface Procedure {
  id: string;
  name: string;
  date: string;
  participation: 'Performed' | 'Assisted' | 'Observed';
  patientName?: string;
  hospital?: string;
  supervisor?: string;
  location?: string;
  indication?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAll(filters?: { participation?: 'Performed' | 'Assisted' | 'Observed' }): Promise<Procedure[]> {
  const db = getDb();
  let sql = 'SELECT * FROM procedures WHERE is_deleted = 0';
  const params: any[] = [];
  if (filters?.participation) {
    sql += ' AND participation = ?';
    params.push(filters.participation);
  }
  sql += ' ORDER BY date DESC';
  const res = await db.query(sql, params);
  return (res.values || []).map(mapProcedure);
}

export async function getStats(): Promise<{ total: number; performed: number; assisted: number; observed: number }> {
  const db = getDb();
  const res = await db.query(
    "SELECT participation, COUNT(*) as count FROM procedures WHERE is_deleted = 0 GROUP BY participation"
  );
  const stats = { total: 0, performed: 0, assisted: 0, observed: 0 };
  for (const row of res.values || []) {
    const c = row.count || 0;
    stats.total += c;
    if (row.participation === 'Performed') stats.performed = c;
    else if (row.participation === 'Assisted') stats.assisted = c;
    else if (row.participation === 'Observed') stats.observed = c;
  }
  return stats;
}

export async function create(data: {
  name: string;
  date: string;
  participation: 'Performed' | 'Assisted' | 'Observed';
  patientName?: string;
  hospital?: string;
  supervisor?: string;
  location?: string;
  indication?: string;
  notes?: string;
}): Promise<Procedure> {
  const db = getDb();
  const id = generateId();
  await db.run(
    `INSERT INTO procedures (id, name, date, participation, patient_name, hospital, supervisor, location, indication, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [id, data.name, data.date, data.participation, data.patientName || null, data.hospital || null, data.supervisor || null, data.location || null, data.indication || null, data.notes || null]
  );
  await enqueueSyncJob('procedures', id, 'INSERT');
  const res = await db.query('SELECT * FROM procedures WHERE id = ?', [id]);
  return mapProcedure(res.values![0]);
}

export async function update(id: string, data: Partial<{
  name: string;
  date: string;
  participation: 'Performed' | 'Assisted' | 'Observed';
  patientName: string;
  hospital: string;
  supervisor: string;
  location: string;
  indication: string;
  notes: string;
}>): Promise<Procedure> {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
  if (data.participation !== undefined) { fields.push('participation = ?'); values.push(data.participation); }
  if (data.patientName !== undefined) { fields.push('patient_name = ?'); values.push(data.patientName); }
  if (data.hospital !== undefined) { fields.push('hospital = ?'); values.push(data.hospital); }
  if (data.supervisor !== undefined) { fields.push('supervisor = ?'); values.push(data.supervisor); }
  if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }
  if (data.indication !== undefined) { fields.push('indication = ?'); values.push(data.indication); }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(id);
    await db.run(`UPDATE procedures SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  await enqueueSyncJob('procedures', id, 'UPDATE');
  const res = await db.query('SELECT * FROM procedures WHERE id = ?', [id]);
  return mapProcedure(res.values![0]);
}

export async function deleteProcedure(id: string): Promise<void> {
  const db = getDb();
  await db.run("UPDATE procedures SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?", [id]);
  await enqueueSyncJob('procedures', id, 'DELETE');
}

function mapProcedure(row: any): Procedure {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    participation: row.participation,
    patientName: row.patient_name || undefined,
    hospital: row.hospital || undefined,
    supervisor: row.supervisor || undefined,
    location: row.location || undefined,
    indication: row.indication || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
