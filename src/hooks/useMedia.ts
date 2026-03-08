import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as mediaService from '@/services/mediaService';

export function useCaseMedia(caseId: string) {
  return useQuery({
    queryKey: ['case-media', caseId],
    queryFn: () => mediaService.getByCaseId(caseId),
    enabled: !!caseId,
  });
}

export function useAddMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, file }: { caseId: string; file: File }) =>
      mediaService.add(caseId, file),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['case-media', variables.caseId] });
      qc.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, caseId }: { mediaId: string; caseId: string }) =>
      mediaService.deleteMedia(mediaId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['case-media', variables.caseId] });
      qc.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}
