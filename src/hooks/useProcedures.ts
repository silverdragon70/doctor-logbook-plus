import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as procedureService from '@/services/procedureService';

export function useProcedures(filters?: { participation?: 'Performed' | 'Assisted' | 'Observed' }) {
  return useQuery({
    queryKey: ['procedures', filters],
    queryFn: () => procedureService.getAll(filters),
  });
}

export function useProcedureStats() {
  return useQuery({
    queryKey: ['procedure-stats'],
    queryFn: procedureService.getStats,
  });
}

export function useCreateProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: procedureService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procedures'] });
      qc.invalidateQueries({ queryKey: ['procedure-stats'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof procedureService.update>[1] }) =>
      procedureService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procedures'] });
      qc.invalidateQueries({ queryKey: ['procedure-stats'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: procedureService.deleteProcedure,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procedures'] });
      qc.invalidateQueries({ queryKey: ['procedure-stats'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
