import { useState, useCallback } from 'react';
import * as insightsService from '@/services/insightsService';
import * as casePearlService from '@/services/casePearlService';
import * as groupPearlService from '@/services/groupPearlService';
import type { InsightGroup } from '@/services/insightsService';
import type { CasePearl } from '@/services/casePearlService';
import type { GroupPearl, GroupPearlFilters } from '@/services/groupPearlService';

// ─── Error Mapper ───────────────────────────────────────────

function mapAIError(code: string): string {
  switch (code) {
    case 'NO_API_KEY': return 'No API key set. Go to Settings → AI Integration.';
    case 'INVALID_API_KEY': return 'Invalid API key. Go to Settings to update it.';
    case 'QUOTA_EXCEEDED': return 'AI quota exceeded. Check your API plan.';
    case 'AI_TIMEOUT': return 'Request timed out. Please try again.';
    case 'AI_NETWORK_ERROR': return 'Connection failed. Check your internet.';
    case 'AI_INVALID_RESPONSE': return 'Unexpected AI response. Please try again.';
    case 'NO_ACTIVE_CASES': return 'No active cases to analyze.';
    default: return 'An error occurred. Please try again.';
  }
}

// ─── useInsights ────────────────────────────────────────────

type InsightsState = 'ready' | 'loading' | 'done' | 'error';

export function useInsights() {
  const [state, setState] = useState<InsightsState>('ready');
  const [data, setData] = useState<{ groups: InsightGroup[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const result = await insightsService.generateInsights();
      setData(result);
      setState('done');
    } catch (e: any) {
      setError(mapAIError(e.message));
      setState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setState('ready');
    setData(null);
    setError(null);
  }, []);

  return { state, data, error, generate, reset };
}

// ─── useCasePearl ───────────────────────────────────────────

export function useCasePearl(caseId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CasePearl | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await casePearlService.generateCasePearl(caseId);
      setData(result);
    } catch (e: any) {
      setError(mapAIError(e.message));
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  return { isLoading, data, error, generate };
}

// ─── useGroupPearl ──────────────────────────────────────────

type GroupPearlState = 'empty' | 'loading' | 'results' | 'error' | 'no_cases';

export function useGroupPearl() {
  const [state, setState] = useState<GroupPearlState>('empty');
  const [data, setData] = useState<GroupPearl | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (filters: GroupPearlFilters) => {
    setState('loading');
    setError(null);
    try {
      const result = await groupPearlService.generateGroupPearl(filters);
      setData(result);
      setState('results');
    } catch (e: any) {
      if (e.message === 'NO_MATCHING_CASES') {
        setState('no_cases');
      } else {
        setError(mapAIError(e.message));
        setState('error');
      }
    }
  }, []);

  const reset = useCallback(() => {
    setState('empty');
    setData(null);
    setError(null);
  }, []);

  return { state, data, error, generate, reset };
}
