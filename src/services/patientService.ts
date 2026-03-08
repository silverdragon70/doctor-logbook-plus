import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { enqueueSyncJob } from './syncQueue';
import type { Patient } from '@/types';

interface PatientFilters {
  search?: string;
  dateAdded?: 'week' | 'month' | '3months' | 'year';
  ageGroup?: 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent';
  specialty?: string;
}

interface CreatePatientData {
  name: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  gender: 'male' | 'female';
  fileNumber?: string;
}

function calculateAge(dobDay: string, dobMonth: string, dobYear: string): number {
  const now = new Date();
  const dob = new Date(parseInt(dobYear), parseInt(dobMonth) - 1, parseInt(dobDay));
  const diffMs = now.getTime() - dob.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

function calculateAgeDays(dobDay: string, dobMonth: string, dobYear: string): number {
  const now = new Date();
  const dob = new Date(parseInt(dobYear), parseInt(dobMonth) - 1, parseInt(dobDay));
  return Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateAgeMonths(dobDay: string, dobMonth: string, dobYear: string): number {
  const now = new Date();
  const dob = new Date(parseInt(dobYear), parseInt(dobMonth) - 1, parseInt(dobDay));
  return (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
}

function matchesAgeGroup(
  group: string,
  dobDay: string,
  dobMonth: string,
  dobYear: string
): boolean {
  const ageYears = calculateAge(dobDay, dobMonth, dobYear);
  const ageDays = calculateAgeDays(dobDay, dobMonth, dobYear);
  const ageMonths = calculateAgeMonths(dobDay, dobMonth, dobYear);

  switch (group) {
    case 'neonate': return ageDays >= 0 && ageDays <= 28;
    case 'infant': return ageMonths >= 1 && ageMonths <= 12;
    case 'toddler': return ageYears >= 1 && ageYears < 3;
    case 'child': return ageYears >= 3 && ageYears < 12;
    case 'adolescent': return ageYears >= 12 && ageYears < 18;
    default: return true;
  }
}

function mapRowToPatient(row: any): Patient {
  return {
    patientId: row.id,
    name: row.name,
    age: calculateAge(row.dob_day, row.dob_month, row.dob_year),
    gender: row.gender,
    caseCount: row.case_count ?? 0,
    lastVisit: row.last_visit ?? '',
    specialty: row.specialty ?? '',
    dateAdded: row.created_at?.split('T')[0] ?? row.created_at ?? '',
    status: row.status ?? 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fileNumber: row.file_number,
    dobDay: row.dob_day,
    dobMonth: row.dob_month,
    dobYear: row.dob_year,
  };
}

export async function getAll(filters?: PatientFilters): Promise<Patient[]> {
  const db = getDb();

  let where = 'WHERE p.is_deleted = 0';
  const params: any[] = [];

  if (filters?.search) {
    where += ` AND p.name LIKE ?`;
    params.push(`%${filters.search}%`);
  }

  if (filters?.dateAdded) {
    const map: Record<string, string> = {
      week: '-7 days',
      month: '-30 days',
      '3months': '-90 days',
      year: '-365 days',
    };
    const offset = map[filters.dateAdded];
    if (offset) {
      where += ` AND p.created_at >= datetime('now', '${offset}')`;
    }
  }

  if (filters?.specialty) {
    where += ` AND (SELECT specialty FROM cases WHERE patient_id = p.id ORDER BY created_at DESC LIMIT 1) = ?`;
    params.push(filters.specialty);
  }

  const query = `
    SELECT p.*,
      COUNT(DISTINCT c.id) as case_count,
      MAX(c.admission_date) as last_visit,
      (SELECT specialty FROM cases WHERE patient_id = p.id
       AND is_deleted = 0 ORDER BY created_at DESC LIMIT 1) as specialty,
      CASE WHEN EXISTS (
        SELECT 1 FROM cases WHERE patient_id = p.id
        AND status = 'active' AND is_deleted = 0
      ) THEN 'active' ELSE 'discharged' END as status
    FROM patients p
    LEFT JOIN cases c ON c.patient_id = p.id AND c.is_deleted = 0
    ${where}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  const res = await db.query(query, params);
  let patients = (res.values ?? []).map(mapRowToPatient);

  // Filter by age group in JS
  if (filters?.ageGroup) {
    patients = patients.filter((p) =>
      matchesAgeGroup(filters.ageGroup!, p.dobDay, p.dobMonth, p.dobYear)
    );
  }

  return patients;
}

export async function getById(id: string): Promise<{
  patient: Patient;
  stats: { cases: number; images: number; lastVisit: string };
}> {
  const db = getDb();

  const pRes = await db.query(
    `SELECT p.*,
      COUNT(DISTINCT c.id) as case_count,
      MAX(c.admission_date) as last_visit,
      (SELECT specialty FROM cases WHERE patient_id = p.id AND is_deleted = 0 ORDER BY created_at DESC LIMIT 1) as specialty,
      CASE WHEN EXISTS (
        SELECT 1 FROM cases WHERE patient_id = p.id AND status = 'active' AND is_deleted = 0
      ) THEN 'active' ELSE 'discharged' END as status
    FROM patients p
    LEFT JOIN cases c ON c.patient_id = p.id AND c.is_deleted = 0
    WHERE p.id = ? AND p.is_deleted = 0
    GROUP BY p.id`,
    [id]
  );

  if (!pRes.values || pRes.values.length === 0) {
    throw new Error('Patient not found');
  }

  const row = pRes.values[0];
  const patient = mapRowToPatient(row);

  // Count images
  const imgRes = await db.query(
    `SELECT COUNT(DISTINCT m.id) as img_count
     FROM media m
     JOIN cases c ON c.id = m.case_id
     WHERE c.patient_id = ? AND c.is_deleted = 0 AND m.is_deleted = 0`,
    [id]
  );

  return {
    patient,
    stats: {
      cases: patient.caseCount,
      images: imgRes.values?.[0]?.img_count ?? 0,
      lastVisit: patient.lastVisit,
    },
  };
}

export async function create(data: CreatePatientData): Promise<Patient> {
  const db = getDb();
  const id = generateId();

  await db.run(
    `INSERT INTO patients (id, name, dob_day, dob_month, dob_year, gender, file_number, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [id, data.name, data.dobDay, data.dobMonth, data.dobYear, data.gender, data.fileNumber ?? null]
  );

  await enqueueSyncJob('patients', id, 'INSERT');

  const result = await getById(id);
  return result.patient;
}

export async function update(
  id: string,
  data: Partial<CreatePatientData>
): Promise<Patient> {
  const db = getDb();

  const sets: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) { sets.push('name = ?'); params.push(data.name); }
  if (data.dobDay !== undefined) { sets.push('dob_day = ?'); params.push(data.dobDay); }
  if (data.dobMonth !== undefined) { sets.push('dob_month = ?'); params.push(data.dobMonth); }
  if (data.dobYear !== undefined) { sets.push('dob_year = ?'); params.push(data.dobYear); }
  if (data.gender !== undefined) { sets.push('gender = ?'); params.push(data.gender); }
  if (data.fileNumber !== undefined) { sets.push('file_number = ?'); params.push(data.fileNumber); }

  sets.push("updated_at = datetime('now')");
  params.push(id);

  await db.run(
    `UPDATE patients SET ${sets.join(', ')} WHERE id = ?`,
    params
  );

  await enqueueSyncJob('patients', id, 'UPDATE');

  const result = await getById(id);
  return result.patient;
}
