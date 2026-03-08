import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as settingsService from '@/services/settingsService';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getAll,
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      settingsService.set(key, value),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Record<string, string | boolean>) =>
      settingsService.setMany(updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); },
  });
}
