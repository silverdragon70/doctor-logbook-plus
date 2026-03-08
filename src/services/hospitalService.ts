import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { enqueueSyncJob } from './syncQueue';

export interface Hospital {
  id: string;
  name: string;
  department?: string;
  unit?: string;
  location?: string;
  position?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalPatient {
  id: string;
  name: string;
  gender: string;
  caseCount: number;
}

export async function getAll(): Promise<Hospital[]> {
  const db = getDb();
  const res = await db.query('SELECT * FROM hospitals WHERE is_deleted = 0 ORDER BY name ASC');
  return (res.values || []).map(mapHospital);
}

export async function getById(id: string): Promise<{
  hospital: Hospital;
  patients: HospitalPatient[];
  stats: { totalCases: number; activeCases: number; dischargedCases: number };
}> {
  const db = getDb();

  const hRes = await db.query('SELECT * FROM hospitals WHERE id = ?', [id]);
  if (!hRes.values || hRes.values.length === 0) throw new Error('Hospital not found');
  const hospital = mapHospital(hRes.values[0]);

  const pRes = await db.query(
    `SELECT p.id, p.name, p.gender, COUNT(c.id) as caseCount
     FROM patients p
     JOIN cases c ON c.patient_id = p.id
     WHERE c.hospital_id = ? AND c.is_deleted = 0 AND p.is_deleted = 0
     GROUP BY p.id
     ORDER BY p.name ASC`,
    [id]
  );
  const patients: HospitalPatient[] = (pRes.values || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    gender: r.gender,
    caseCount: r.caseCount,
  }));

  const sRes = await db.query(
    `SELECT
       COUNT(*) as totalCases,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCases,
       SUM(CASE WHEN status = 'discharged' THEN 1 ELSE 0 END) as dischargedCases
     FROM cases WHERE hospital_id = ? AND is_deleted = 0`,
    [id]
  );
  const s = sRes.values?.[0] || {};
  const stats = {
    totalCases: s.totalCases || 0,
    activeCases: s.activeCases || 0,
    dischargedCases: s.dischargedCases || 0,
  };

  return { hospital, patients, stats };
}

export async function create(data: {
  name: string;
  department?: string;
  unit?: string;
  location?: string;
  position?: string;
  startDate?: string;
}): Promise<Hospital> {
  const db = getDb();
  const id = generateId();
  await db.run(
    `INSERT INTO hospitals (id, name, department, unit, location, position, start_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [id, data.name, data.department || null, data.unit || null, data.location || null, data.position || null, data.startDate || null]
  );
  await enqueueSyncJob('hospitals', id, 'INSERT');
  const res = await db.query('SELECT * FROM hospitals WHERE id = ?', [id]);
  return mapHospital(res.values![0]);
}

export async function update(id: string, data: Partial<{
  name: string;
  department: string;
  unit: string;
  location: string;
  position: string;
  startDate: string;
}>): Promise<Hospital> {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.department !== undefined) { fields.push('department = ?'); values.push(data.department); }
  if (data.unit !== undefined) { fields.push('unit = ?'); values.push(data.unit); }
  if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }
  if (data.position !== undefined) { fields.push('position = ?'); values.push(data.position); }
  if (data.startDate !== undefined) { fields.push('start_date = ?'); values.push(data.startDate); }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(id);
    await db.run(`UPDATE hospitals SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  await enqueueSyncJob('hospitals', id, 'UPDATE');
  const res = await db.query('SELECT * FROM hospitals WHERE id = ?', [id]);
  return mapHospital(res.values![0]);
}

export async function deleteHospital(id: string): Promise<void> {
  const db = getDb();
  await db.run("UPDATE hospitals SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?", [id]);
  await enqueueSyncJob('hospitals', id, 'DELETE');
}

function mapHospital(row: any): Hospital {
  return {
    id: row.id,
    name: row.name,
    department: row.department || undefined,
    unit: row.unit || undefined,
    location: row.location || undefined,
    position: row.position || undefined,
    startDate: row.start_date || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
