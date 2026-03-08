import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { enqueueSyncJob } from './syncQueue';

export interface Lecture {
  id: string;
  topic: string;
  date: string;
  speaker?: string;
  duration?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAll(): Promise<Lecture[]> {
  const db = getDb();
  const res = await db.query('SELECT * FROM lectures WHERE is_deleted = 0 ORDER BY date DESC');
  return (res.values || []).map(mapLecture);
}

export async function create(data: {
  topic: string;
  date: string;
  speaker?: string;
  duration?: string;
  location?: string;
  notes?: string;
}): Promise<Lecture> {
  const db = getDb();
  const id = generateId();
  await db.run(
    `INSERT INTO lectures (id, topic, date, speaker, duration, location, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [id, data.topic, data.date, data.speaker || null, data.duration || null, data.location || null, data.notes || null]
  );
  await enqueueSyncJob('lectures', id, 'INSERT');
  const res = await db.query('SELECT * FROM lectures WHERE id = ?', [id]);
  return mapLecture(res.values![0]);
}

export async function update(id: string, data: Partial<{
  topic: string;
  date: string;
  speaker: string;
  duration: string;
  location: string;
  notes: string;
}>): Promise<Lecture> {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.topic !== undefined) { fields.push('topic = ?'); values.push(data.topic); }
  if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
  if (data.speaker !== undefined) { fields.push('speaker = ?'); values.push(data.speaker); }
  if (data.duration !== undefined) { fields.push('duration = ?'); values.push(data.duration); }
  if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(id);
    await db.run(`UPDATE lectures SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  await enqueueSyncJob('lectures', id, 'UPDATE');
  const res = await db.query('SELECT * FROM lectures WHERE id = ?', [id]);
  return mapLecture(res.values![0]);
}

export async function deleteLecture(id: string): Promise<void> {
  const db = getDb();
  await db.run("UPDATE lectures SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?", [id]);
  await enqueueSyncJob('lectures', id, 'DELETE');
}

function mapLecture(row: any): Lecture {
  return {
    id: row.id,
    topic: row.topic,
    date: row.date,
    speaker: row.speaker || undefined,
    duration: row.duration || undefined,
    location: row.location || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
