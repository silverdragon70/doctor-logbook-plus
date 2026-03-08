/**
 * CasePearl Service — generates a clinical pearl for a single case.
 */

import * as caseService from './caseService';
import * as settingsService from './settingsService';
import { deIdentifyCase } from './deIdentificationService';
import { sendRequest } from './aiProviderService';

export interface CasePearl {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  diseaseReview?: string;
}

export async function generateCasePearl(caseId: string): Promise<CasePearl> {
  // 1. Get full case
  const fullCase = await caseService.getById(caseId);

  // 2. De-identify (fresh tokenMap)
  const deIdentified = deIdentifyCase(fullCase, new Map());

  // 3. Language
  const aiLanguage = (await settingsService.get('aiLanguage')) ?? 'english';
  const language = aiLanguage === 'arabic' ? 'Arabic' : 'English';

  // 4. System prompt
  const systemPrompt = `You are a clinical education assistant.
Analyze this single patient case and provide a clinical pearl for physician education.
Respond in ${language}.
Return ONLY a valid JSON object:
{
  "summary": "string",
  "keyFindings": ["string"],
  "recommendations": ["string"],
  "diseaseReview": "string"
}
Do not include any text outside the JSON.`;

  // 5. User prompt
  const userPrompt = JSON.stringify(deIdentified);

  // 6. Send → parse → validate → return
  const responseText = await sendRequest(userPrompt, systemPrompt);

  const clean = responseText.replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(clean);
    if (!parsed.summary || !Array.isArray(parsed.keyFindings)) {
      throw new Error('AI_INVALID_RESPONSE');
    }
    return parsed as CasePearl;
  } catch {
    throw new Error('AI_INVALID_RESPONSE');
  }
}
