import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as managementService from '@/services/managementService';

export function useCreateManagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: Parameters<typeof managementService.create>[1] }) =>
      managementService.create(caseId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}

export function useUpdateManagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, caseId, data }: { id: string; caseId: string; data: Parameters<typeof managementService.update>[1] }) =>
      managementService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}

export function useDeleteManagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, caseId }: { id: string; caseId: string }) =>
      managementService.deleteManagement(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}
