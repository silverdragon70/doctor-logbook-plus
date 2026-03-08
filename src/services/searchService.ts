import { getDb } from '@/db/database';

export interface SearchResult {
  caseId: string;
  patientName: string;
  diagnosis: string;
  date: string;
  complaint: string;
  mediaCount: number;
}

export async function search(query: string): Promise<SearchResult[]> {
  const db = getDb();
  const res = await db.query(
    `SELECT c.id as caseId, p.name as patientName,
       c.provisional_diagnosis as diagnosis,
       c.admission_date as date,
       c.chief_complaint as complaint,
       (SELECT COUNT(*) FROM media WHERE case_id = c.id AND is_deleted = 0) as mediaCount
     FROM cases c
     JOIN patients p ON p.id = c.patient_id
     WHERE c.is_deleted = 0
     AND (
       c.provisional_diagnosis LIKE '%' || ? || '%'
       OR c.final_diagnosis LIKE '%' || ? || '%'
       OR c.chief_complaint LIKE '%' || ? || '%'
       OR p.name LIKE '%' || ? || '%'
     )
     ORDER BY c.last_modified DESC
     LIMIT 50`,
    [query, query, query, query]
  );
  return (res.values || []).map((r: any) => ({
    caseId: r.caseId,
    patientName: r.patientName,
    diagnosis: r.diagnosis || '',
    date: r.date,
    complaint: r.complaint || '',
    mediaCount: r.mediaCount || 0,
  }));
}

export async function saveRecentSearch(query: string): Promise<void> {
  const db = getDb();
  const res = await db.query("SELECT value FROM settings WHERE key = 'recent_searches'");
  let searches: string[] = [];
  if (res.values && res.values.length > 0 && res.values[0].value) {
    try { searches = JSON.parse(res.values[0].value); } catch {}
  }
  searches = [query, ...searches.filter(s => s !== query)].slice(0, 10);
  await db.run(
    "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('recent_searches', ?, datetime('now'))",
    [JSON.stringify(searches)]
  );
}

export async function getRecentSearches(): Promise<string[]> {
  const db = getDb();
  const res = await db.query("SELECT value FROM settings WHERE key = 'recent_searches'");
  if (res.values && res.values.length > 0 && res.values[0].value) {
    try { return JSON.parse(res.values[0].value); } catch {}
  }
  return [];
}
