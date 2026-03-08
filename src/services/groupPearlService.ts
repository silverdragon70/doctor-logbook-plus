/**
 * GroupPearl Service — generates comparative analysis across filtered cases.
 */

import { getDb } from '@/db/database';
import * as caseService from './caseService';
import * as settingsService from './settingsService';
import { deIdentifyMultipleCases } from './deIdentificationService';
import { sendRequest } from './aiProviderService';

export interface GroupPearlFilters {
  diagnosis: string;
  timePeriod: string;
  outcome: string;
  fromDate?: string;
  toDate?: string;
}

export interface GroupPearl {
  summary: string;
  patterns: string[];
  comparison: string;
  pearl: string;
  diseaseReview: string;
}

function getTimePeriodFilter(timePeriod: string, fromDate?: string, toDate?: string): string {
  switch (timePeriod) {
    case 'month': return "AND c.admission_date >= date('now', '-30 days')";
    case '3months': return "AND c.admission_date >= date('now', '-90 days')";
    case '6months': return "AND c.admission_date >= date('now', '-180 days')";
    case 'year': return "AND c.admission_date >= date('now', '-365 days')";
    case 'custom':
      if (fromDate && toDate) return `AND c.admission_date BETWEEN '${fromDate}' AND '${toDate}'`;
      return '';
    default: return ''; // 'all'
  }
}

function getOutcomeFilter(outcome: string): string {
  switch (outcome) {
    case 'active': return "AND c.status = 'active'";
    case 'discharged': return "AND c.status = 'discharged'";
    case 'died': return "AND (c.discharge_outcome LIKE '%died%' OR c.discharge_outcome LIKE '%death%' OR c.discharge_outcome LIKE '%expired%')";
    default: return ''; // 'all'
  }
}

export async function generateGroupPearl(filters: GroupPearlFilters): Promise<GroupPearl> {
  const db = getDb();

  // 1. Query matching case IDs
  const timeFilter = getTimePeriodFilter(filters.timePeriod, filters.fromDate, filters.toDate);
  const outcomeFilter = getOutcomeFilter(filters.outcome);

  const res = await db.query(
    `SELECT c.id FROM cases c
     JOIN patients p ON p.id = c.patient_id
     WHERE c.provisional_diagnosis LIKE ? AND c.is_deleted = 0
     ${timeFilter} ${outcomeFilter}`,
    [`%${filters.diagnosis}%`]
  );

  const caseIds = (res.values ?? []).map((r: any) => r.id);
  if (caseIds.length === 0) throw new Error('NO_MATCHING_CASES');

  // 2. Fetch full data for each case
  const fullCases = [];
  for (const id of caseIds) {
    fullCases.push(await caseService.getById(id));
  }

  // 3. De-identify
  const deIdentifiedCases = deIdentifyMultipleCases(fullCases);

  // 4. Language
  const aiLanguage = (await settingsService.get('aiLanguage')) ?? 'english';
  const language = aiLanguage === 'arabic' ? 'Arabic' : 'English';

  // 5. System prompt
  const systemPrompt = `You are a clinical education assistant.
Analyze this group of de-identified patient cases with the diagnosis: ${filters.diagnosis}.
Provide clinical patterns, comparisons, and a learning pearl.
Respond in ${language}.
Return ONLY a valid JSON object:
{
  "summary": "string",
  "patterns": ["string"],
  "comparison": "string",
  "pearl": "string",
  "diseaseReview": "string"
}
Do not include any text outside the JSON.`;

  // 6. User prompt
  const userPrompt = JSON.stringify({
    diagnosis: filters.diagnosis,
    caseCount: deIdentifiedCases.length,
    cases: deIdentifiedCases,
  });

  // 7. Send → parse → validate → return
  const responseText = await sendRequest(userPrompt, systemPrompt);

  const clean = responseText.replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(clean);
    if (!parsed.summary || !Array.isArray(parsed.patterns)) {
      throw new Error('AI_INVALID_RESPONSE');
    }
    return parsed as GroupPearl;
  } catch {
    throw new Error('AI_INVALID_RESPONSE');
  }
}
