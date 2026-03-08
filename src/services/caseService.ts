import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { enqueueSyncJob } from './syncQueue';
import * as patientService from './patientService';
import type { Case, Investigation, ManagementEntry, ProgressNote, VitalSigns } from '@/types';

interface CaseFilters {
  hospitalId?: string;
  status?: 'active' | 'discharged';
  search?: string;
}

interface CreateCaseData {
  patientId?: string;
  patientData?: {
    name: string;
    dobDay: string;
    dobMonth: string;
    dobYear: string;
    gender: 'male' | 'female';
    fileNumber?: string;
  };
  hospitalId?: string;
  admissionDate: string;
  specialty: string;
  provisionalDiagnosis?: string;
  chiefComplaint?: string;
  historyComplaint?: string;
  presentHistory?: string;
  pastMedicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
}

function calculateAge(day: string, month: string, year: string): number {
  const now = new Date();
  const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function mapRowToCase(row: any): Case {
  return {
    caseId: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name ?? '',
    patientAge: row.dob_year ? calculateAge(row.dob_day, row.dob_month, row.dob_year) : 0,
    patientGender: row.patient_gender ?? 'male',
    date: row.admission_date,
    fileNumber: row.file_number ?? '',
    hospital: row.hospital_name ?? '',
    hospitalId: row.hospital_id,
    dob: { day: row.dob_day ?? '', month: row.dob_month ?? '', year: row.dob_year ?? '' },
    admissionDate: row.admission_date,
    specialty: row.specialty,
    provisionalDiagnosis: row.provisional_diagnosis ?? '',
    finalDiagnosis: row.final_diagnosis,
    chiefComplaint: row.chief_complaint ?? '',
    historyComplaint: row.history_complaint ?? '',
    presentHistory: row.present_history ?? '',
    pastMedicalHistory: row.past_medical_history ?? '',
    allergies: row.allergies ?? '',
    currentMedications: row.current_medications ?? '',
    mediaCount: row.media_count ?? 0,
    lastModified: row.last_modified,
    status: row.status,
    dischargeDate: row.discharge_date,
    dischargeOutcome: row.discharge_outcome,
    dischargeNotes: row.discharge_notes,
  };
}

const BASE_CASE_QUERY = `
  SELECT c.*,
    p.name as patient_name,
    p.gender as patient_gender,
    p.dob_day, p.dob_month, p.dob_year,
    p.file_number,
    h.name as hospital_name,
    (SELECT COUNT(*) FROM media m WHERE m.case_id = c.id AND m.is_deleted = 0) as media_count
  FROM cases c
  JOIN patients p ON p.id = c.patient_id
  LEFT JOIN hospitals h ON h.id = c.hospital_id
`;

export async function getAll(filters?: CaseFilters): Promise<Case[]> {
  const db = getDb();
  let where = 'WHERE c.is_deleted = 0';
  const params: any[] = [];

  if (filters?.hospitalId) {
    where += ' AND c.hospital_id = ?';
    params.push(filters.hospitalId);
  }
  if (filters?.status) {
    where += ' AND c.status = ?';
    params.push(filters.status);
  }
  if (filters?.search) {
    where += ' AND (p.name LIKE ? OR c.provisional_diagnosis LIKE ? OR c.specialty LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  const res = await db.query(
    `${BASE_CASE_QUERY} ${where} ORDER BY c.last_modified DESC`,
    params
  );
  return (res.values ?? []).map(mapRowToCase);
}

export async function getByPatientId(patientId: string): Promise<Case[]> {
  const db = getDb();
  const res = await db.query(
    `${BASE_CASE_QUERY} WHERE c.patient_id = ? AND c.is_deleted = 0 ORDER BY c.admission_date DESC`,
    [patientId]
  );
  return (res.values ?? []).map(mapRowToCase);
}

export async function getById(id: string): Promise<{
  case: Case;
  investigations: Investigation[];
  management: ManagementEntry[];
  progressNotes: ProgressNote[];
}> {
  const db = getDb();

  // Case
  const cRes = await db.query(
    `${BASE_CASE_QUERY} WHERE c.id = ? AND c.is_deleted = 0`,
    [id]
  );
  if (!cRes.values || cRes.values.length === 0) throw new Error('Case not found');
  const caseData = mapRowToCase(cRes.values[0]);

  // Investigations
  const invRes = await db.query(
    `SELECT * FROM investigations WHERE case_id = ? AND is_deleted = 0 ORDER BY date DESC`,
    [id]
  );
  const investigations: Investigation[] = [];
  for (const inv of invRes.values ?? []) {
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

  // Management
  const mgmtRes = await db.query(
    `SELECT * FROM management_entries WHERE case_id = ? AND is_deleted = 0 ORDER BY date ASC`,
    [id]
  );
  const management: ManagementEntry[] = (mgmtRes.values ?? []).map((row: any) => {
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

  // Progress Notes
  const pnRes = await db.query(
    `SELECT * FROM progress_notes WHERE case_id = ? AND is_deleted = 0 ORDER BY date DESC`,
    [id]
  );
  const progressNotes: ProgressNote[] = [];
  for (const pn of pnRes.values ?? []) {
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
    progressNotes.push({
      id: pn.id, caseId: pn.case_id, date: pn.date,
      assessment: pn.assessment ?? '', vitals,
    });
  }

  return { case: caseData, investigations, management, progressNotes };
}

export async function create(data: CreateCaseData): Promise<Case> {
  const db = getDb();

  let patientId = data.patientId;
  if (!patientId && data.patientData) {
    const patient = await patientService.create(data.patientData);
    patientId = patient.patientId;
  }
  if (!patientId) throw new Error('Patient ID required');

  const id = generateId();
  await db.run(
    `INSERT INTO cases (id, patient_id, hospital_id, admission_date, specialty,
      provisional_diagnosis, chief_complaint, history_complaint, present_history,
      past_medical_history, allergies, current_medications,
      last_modified, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
       (strftime('%s','now') * 1000), datetime('now'), datetime('now'))`,
    [
      id, patientId, data.hospitalId ?? null, data.admissionDate, data.specialty,
      data.provisionalDiagnosis ?? null, data.chiefComplaint ?? null,
      data.historyComplaint ?? null, data.presentHistory ?? null,
      data.pastMedicalHistory ?? null, data.allergies ?? null,
      data.currentMedications ?? null,
    ]
  );

  await enqueueSyncJob('cases', id, 'INSERT');
  const result = await getById(id);
  return result.case;
}

export async function update(id: string, data: Partial<CreateCaseData>): Promise<Case> {
  const db = getDb();
  const sets: string[] = [];
  const params: any[] = [];

  const fieldMap: Record<string, string> = {
    hospitalId: 'hospital_id',
    admissionDate: 'admission_date',
    specialty: 'specialty',
    provisionalDiagnosis: 'provisional_diagnosis',
    chiefComplaint: 'chief_complaint',
    historyComplaint: 'history_complaint',
    presentHistory: 'present_history',
    pastMedicalHistory: 'past_medical_history',
    allergies: 'allergies',
    currentMedications: 'current_medications',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if ((data as any)[key] !== undefined) {
      sets.push(`${col} = ?`);
      params.push((data as any)[key]);
    }
  }

  sets.push("last_modified = (strftime('%s','now') * 1000)");
  sets.push("updated_at = datetime('now')");
  params.push(id);

  await db.run(`UPDATE cases SET ${sets.join(', ')} WHERE id = ?`, params);
  await enqueueSyncJob('cases', id, 'UPDATE');

  const result = await getById(id);
  return result.case;
}

export async function discharge(
  id: string,
  data: { date: string; outcome: string; notes?: string }
): Promise<void> {
  const db = getDb();
  await db.run(
    `UPDATE cases SET status = 'discharged', discharge_date = ?, discharge_outcome = ?,
     discharge_notes = ?, last_modified = (strftime('%s','now') * 1000),
     updated_at = datetime('now') WHERE id = ?`,
    [data.date, data.outcome, data.notes ?? null, id]
  );
  await enqueueSyncJob('cases', id, 'UPDATE');
}

export async function deleteCase(id: string): Promise<void> {
  const db = getDb();
  await db.run(`UPDATE cases SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?`, [id]);
  await db.run(`UPDATE investigations SET is_deleted = 1, updated_at = datetime('now') WHERE case_id = ?`, [id]);
  await db.run(`UPDATE management_entries SET is_deleted = 1, updated_at = datetime('now') WHERE case_id = ?`, [id]);
  await db.run(`UPDATE progress_notes SET is_deleted = 1, updated_at = datetime('now') WHERE case_id = ?`, [id]);
  await enqueueSyncJob('cases', id, 'DELETE');
}

export async function getActiveForInsights(): Promise<{
  case: Case;
  investigations: Investigation[];
  management: ManagementEntry[];
  progressNotes: ProgressNote[];
}[]> {
  const db = getDb();
  const res = await db.query(
    `SELECT id FROM cases WHERE status = 'active' AND is_deleted = 0`
  );
  const results = [];
  for (const row of res.values ?? []) {
    results.push(await getById(row.id));
  }
  return results;
}
