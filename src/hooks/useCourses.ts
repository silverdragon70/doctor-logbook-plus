import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as courseService from '@/services/courseService';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAll,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof courseService.update>[1] }) =>
      courseService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}
