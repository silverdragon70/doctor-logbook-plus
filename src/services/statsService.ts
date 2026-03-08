import { getDb } from '@/db/database';
import { getStats as getProcedureStats } from './procedureService';

export interface Stats {
  totalCases: number;
  activeCases: number;
  dischargedCases: number;
  admissionsPerMonth: { month: string; count: number }[];
  topDiagnoses: { diagnosis: string; count: number }[];
  procedures: { total: number; performed: number; assisted: number; observed: number };
}

function periodFilter(period?: 'month' | '3months' | '6months' | 'year'): string {
  if (!period) return '';
  const days = { month: 30, '3months': 90, '6months': 180, year: 365 };
  return ` AND admission_date >= date('now', '-${days[period]} days')`;
}

export async function getStats(period?: 'month' | '3months' | '6months' | 'year'): Promise<Stats> {
  const db = getDb();
  const pf = periodFilter(period);

  const countRes = await db.query(
    `SELECT
       COUNT(*) as totalCases,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCases,
       SUM(CASE WHEN status = 'discharged' THEN 1 ELSE 0 END) as dischargedCases
     FROM cases WHERE is_deleted = 0${pf}`
  );
  const c = countRes.values?.[0] || {};

  const monthRes = await db.query(
    `SELECT strftime('%Y-%m', admission_date) as month, COUNT(*) as count
     FROM cases WHERE is_deleted = 0${pf}
     GROUP BY month ORDER BY month ASC`
  );

  const diagRes = await db.query(
    `SELECT provisional_diagnosis as diagnosis, COUNT(*) as count
     FROM cases WHERE is_deleted = 0
     AND provisional_diagnosis IS NOT NULL AND provisional_diagnosis != ''${pf}
     GROUP BY provisional_diagnosis
     ORDER BY count DESC LIMIT 5`
  );

  const procedures = await getProcedureStats();

  return {
    totalCases: c.totalCases || 0,
    activeCases: c.activeCases || 0,
    dischargedCases: c.dischargedCases || 0,
    admissionsPerMonth: (monthRes.values || []).map((r: any) => ({ month: r.month, count: r.count })),
    topDiagnoses: (diagRes.values || []).map((r: any) => ({ diagnosis: r.diagnosis, count: r.count })),
    procedures,
  };
}
