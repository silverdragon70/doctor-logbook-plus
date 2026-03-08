import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as progressNoteService from '@/services/progressNoteService';

export function useCreateProgressNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: Parameters<typeof progressNoteService.create>[1] }) =>
      progressNoteService.create(caseId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}

export function useUpdateProgressNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, caseId, data }: { id: string; caseId: string; data: Parameters<typeof progressNoteService.update>[1] }) =>
      progressNoteService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}

export function useDeleteProgressNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, caseId }: { id: string; caseId: string }) =>
      progressNoteService.deleteProgressNote(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}
