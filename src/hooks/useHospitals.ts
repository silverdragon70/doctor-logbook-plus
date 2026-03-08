import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as hospitalService from '@/services/hospitalService';

export function useHospitals() {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: hospitalService.getAll,
  });
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: () => hospitalService.getById(id),
    enabled: !!id,
  });
}

export function useCreateHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hospitalService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hospitals'] }); },
  });
}

export function useUpdateHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof hospitalService.update>[1] }) =>
      hospitalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['hospital'] });
    },
  });
}

export function useDeleteHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hospitalService.deleteHospital,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hospitals'] }); },
  });
}
