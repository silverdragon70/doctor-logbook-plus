/**
 * De-identification Service — strips PII from case data before AI processing.
 * PRIVACY: tokenMap is RAM-only, never persisted to DB or localStorage.
 */

import type { Case, Investigation, ManagementEntry, ProgressNote, DeIdentifiedCase } from '@/types';

interface FullCaseData {
  case: Case;
  investigations: Investigation[];
  management: ManagementEntry[];
  progressNotes: ProgressNote[];
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function getRelativeDate(referenceDate: string, targetDate: string): string {
  const ref = new Date(referenceDate);
  const target = new Date(targetDate);
  const diffMs = target.getTime() - ref.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return `Day ${diffDays}`;
}

export function deIdentifyCase(
  caseData: FullCaseData,
  tokenMap: Map<string, string>
): DeIdentifiedCase {
  const { case: c, investigations, management, progressNotes } = caseData;

  // Assign token
  if (!tokenMap.has(c.patientId)) {
    const index = tokenMap.size;
    const letter = index < LETTERS.length
      ? LETTERS[index]
      : `${LETTERS[Math.floor(index / 26)]}${LETTERS[index % 26]}`;
    tokenMap.set(c.patientId, `Patient ${letter}`);
  }
  const token = tokenMap.get(c.patientId)!;

  const admissionDate = c.admissionDate;

  return {
    token,
    age: c.patientAge,
    gender: c.patientGender,
    specialty: c.specialty,
    provisionalDiagnosis: c.provisionalDiagnosis,
    chiefComplaint: c.chiefComplaint,
    presentHistory: c.presentHistory,
    pastMedicalHistory: c.pastMedicalHistory,
    allergies: c.allergies,
    currentMedications: c.currentMedications,
    investigations: investigations.map((inv) => ({
      name: inv.name,
      type: inv.type,
      result: inv.result,
      relativeDate: getRelativeDate(admissionDate, inv.date),
    })),
    management: management.map((m) => ({
      type: m.type,
      medications: m.type === 'Medications' ? (m as any).medications : undefined,
      mode: m.type !== 'Medications' ? (m as any).mode : undefined,
      details: m.type !== 'Medications' ? (m as any).details : undefined,
      relativeDate: getRelativeDate(admissionDate, m.date),
    })),
    progressNotes: progressNotes.map((pn) => ({
      assessment: pn.assessment,
      vitals: pn.vitals,
      relativeDate: getRelativeDate(admissionDate, pn.date),
    })),
    status: c.status,
    dischargeOutcome: c.dischargeOutcome,
  };
}

export function deIdentifyMultipleCases(cases: FullCaseData[]): DeIdentifiedCase[] {
  const tokenMap = new Map<string, string>(); // fresh — garbage collected after return
  return cases.map((c) => deIdentifyCase(c, tokenMap));
}
