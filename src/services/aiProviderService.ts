/**
 * AI Provider Service — sends requests to configured AI provider (Anthropic/OpenAI).
 * Reads provider, API key, and model from settings at runtime.
 */

import * as settingsService from './settingsService';

const MODEL_MAP: Record<string, Record<string, string>> = {
  anthropic: {
    sonnet: 'claude-sonnet-4-5',
    opus: 'claude-opus-4-5',
    haiku: 'claude-haiku-4-5-20251001',
  },
  openai: {
    default: 'gpt-4o',
  },
};

const TIMEOUT_MS = 30_000;

export async function sendRequest(prompt: string, systemPrompt: string): Promise<string> {
  const aiProvider = (await settingsService.get('aiProvider')) ?? 'anthropic';
  const apiKey = (await settingsService.get('apiKey')) ?? '';
  const aiModel = (await settingsService.get('aiModel')) ?? 'sonnet';

  if (!apiKey || !apiKey.trim()) {
    throw new Error('NO_API_KEY');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response: Response;

    if (aiProvider === 'anthropic') {
      const model = MODEL_MAP.anthropic[aiModel] ?? MODEL_MAP.anthropic.sonnet;
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });
    } else if (aiProvider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
        }),
        signal: controller.signal,
      });
    } else {
      // Custom provider — attempt OpenAI-compatible API
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
        }),
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    if (response.status === 401) throw new Error('INVALID_API_KEY');
    if (response.status === 429) throw new Error('QUOTA_EXCEEDED');
    if (!response.ok) throw new Error('AI_NETWORK_ERROR');

    const data = await response.json();

    if (aiProvider === 'anthropic') {
      return data.content?.[0]?.text ?? '';
    }
    return data.choices?.[0]?.message?.content ?? '';
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('AI_TIMEOUT');
    if (err.message && ['NO_API_KEY', 'INVALID_API_KEY', 'QUOTA_EXCEEDED', 'AI_TIMEOUT', 'AI_NETWORK_ERROR'].includes(err.message)) {
      throw err;
    }
    throw new Error('AI_NETWORK_ERROR');
  }
}
