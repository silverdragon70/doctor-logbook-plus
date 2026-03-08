import { useQuery } from '@tanstack/react-query';
import { getStats } from '@/services/statsService';

export function useStats(period?: 'month' | '3months' | '6months' | 'year') {
  return useQuery({
    queryKey: ['stats', period],
    queryFn: () => getStats(period),
  });
}
