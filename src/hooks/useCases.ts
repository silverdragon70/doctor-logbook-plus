import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as caseService from '@/services/caseService';

interface CaseFilters {
  hospitalId?: string;
  status?: 'active' | 'discharged';
  search?: string;
}

export function useCases(filters?: CaseFilters) {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: () => caseService.getAll(filters),
  });
}

export function usePatientCases(patientId: string) {
  return useQuery({
    queryKey: ['patient-cases', patientId],
    queryFn: () => caseService.getByPatientId(patientId),
    enabled: !!patientId,
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => caseService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: caseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof caseService.update>[1] }) =>
      caseService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.id] });
    },
  });
}

export function useDischargeCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof caseService.discharge>[1] }) =>
      caseService.discharge(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: caseService.deleteCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
