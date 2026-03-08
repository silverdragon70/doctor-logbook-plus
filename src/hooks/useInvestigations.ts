import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as investigationService from '@/services/investigationService';

export function useCreateInvestigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: Parameters<typeof investigationService.create>[1] }) =>
      investigationService.create(caseId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}

export function useUpdateInvestigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, caseId, data }: { id: string; caseId: string; data: Parameters<typeof investigationService.update>[1] }) =>
      investigationService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}

export function useDeleteInvestigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, caseId }: { id: string; caseId: string }) =>
      investigationService.deleteInvestigation(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}
