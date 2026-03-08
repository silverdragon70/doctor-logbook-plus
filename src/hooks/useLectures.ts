import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as lectureService from '@/services/lectureService';

export function useLectures() {
  return useQuery({
    queryKey: ['lectures'],
    queryFn: lectureService.getAll,
  });
}

export function useCreateLecture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: lectureService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lectures'] }); },
  });
}

export function useUpdateLecture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof lectureService.update>[1] }) =>
      lectureService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lectures'] }); },
  });
}

export function useDeleteLecture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: lectureService.deleteLecture,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lectures'] }); },
  });
}
