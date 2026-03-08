import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { enqueueSyncJob } from './syncQueue';

export interface Course {
  id: string;
  name: string;
  date: string;
  provider?: string;
  duration?: string;
  hasCertificate: boolean;
  certificatePath?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAll(): Promise<Course[]> {
  const db = getDb();
  const res = await db.query('SELECT * FROM courses WHERE is_deleted = 0 ORDER BY date DESC');
  return (res.values || []).map(mapCourse);
}

export async function create(data: {
  name: string;
  date: string;
  provider?: string;
  duration?: string;
  hasCertificate?: boolean;
  certificatePath?: string;
  notes?: string;
}): Promise<Course> {
  const db = getDb();
  const id = generateId();
  await db.run(
    `INSERT INTO courses (id, name, date, provider, duration, has_certificate, certificate_path, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [id, data.name, data.date, data.provider || null, data.duration || null, data.hasCertificate ? 1 : 0, data.certificatePath || null, data.notes || null]
  );
  await enqueueSyncJob('courses', id, 'INSERT');
  const res = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
  return mapCourse(res.values![0]);
}

export async function update(id: string, data: Partial<{
  name: string;
  date: string;
  provider: string;
  duration: string;
  hasCertificate: boolean;
  certificatePath: string;
  notes: string;
}>): Promise<Course> {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
  if (data.provider !== undefined) { fields.push('provider = ?'); values.push(data.provider); }
  if (data.duration !== undefined) { fields.push('duration = ?'); values.push(data.duration); }
  if (data.hasCertificate !== undefined) { fields.push('has_certificate = ?'); values.push(data.hasCertificate ? 1 : 0); }
  if (data.certificatePath !== undefined) { fields.push('certificate_path = ?'); values.push(data.certificatePath); }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(id);
    await db.run(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  await enqueueSyncJob('courses', id, 'UPDATE');
  const res = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
  return mapCourse(res.values![0]);
}

export async function deleteCourse(id: string): Promise<void> {
  const db = getDb();
  await db.run("UPDATE courses SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?", [id]);
  await enqueueSyncJob('courses', id, 'DELETE');
}

function mapCourse(row: any): Course {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    provider: row.provider || undefined,
    duration: row.duration || undefined,
    hasCertificate: !!row.has_certificate,
    certificatePath: row.certificate_path || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
