import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as patientService from '@/services/patientService';

interface PatientFilters {
  search?: string;
  dateAdded?: 'week' | 'month' | '3months' | 'year';
  ageGroup?: 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent';
  specialty?: string;
}

export function usePatients(filters?: PatientFilters) {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: () => patientService.getAll(filters),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof patientService.update>[1] }) =>
      patientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient'] });
    },
  });
}
