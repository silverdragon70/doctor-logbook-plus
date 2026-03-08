/**
 * Insights Service — generates AI-powered clinical insights from active cases.
 */

import * as caseService from './caseService';
import * as settingsService from './settingsService';
import { deIdentifyMultipleCases } from './deIdentificationService';
import { sendRequest } from './aiProviderService';

export interface InsightCase {
  name: string;
  summary: string;
  recommendation: string;
}

export interface InsightGroup {
  status: 'red' | 'yellow' | 'green';
  label: string;
  cases: InsightCase[];
}

export async function generateInsights(): Promise<{ groups: InsightGroup[] }> {
  // 1. Get active cases
  const activeCases = await caseService.getActiveForInsights();
  if (activeCases.length === 0) throw new Error('NO_ACTIVE_CASES');

  // 2. De-identify
  const deIdentifiedCases = deIdentifyMultipleCases(activeCases);

  // 3. Language
  const aiLanguage = (await settingsService.get('aiLanguage')) ?? 'english';
  const language = aiLanguage === 'arabic' ? 'Arabic' : 'English';

  // 4. System prompt
  const systemPrompt = `You are a clinical decision support assistant.
Analyze the following de-identified patient cases and group them by clinical urgency.
Respond in ${language}.
Return ONLY a valid JSON object with this exact structure:
{
  "groups": [
    {
      "status": "red" | "yellow" | "green",
      "label": "string",
      "cases": [
        { "name": "string", "summary": "string", "recommendation": "string" }
      ]
    }
  ]
}
red = needs immediate attention
yellow = requires review or plan adjustment
green = stable, consider discharge
Do not include any text outside the JSON.`;

  // 5. User prompt
  const userPrompt = JSON.stringify(deIdentifiedCases);

  // 6. Send request
  const responseText = await sendRequest(userPrompt, systemPrompt);

  // 7. Parse
  const clean = responseText.replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(clean);
    if (!parsed.groups || !Array.isArray(parsed.groups)) {
      throw new Error('AI_INVALID_RESPONSE');
    }
    return { groups: parsed.groups };
  } catch {
    throw new Error('AI_INVALID_RESPONSE');
  }
}
