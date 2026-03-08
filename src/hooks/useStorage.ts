import { useQuery } from '@tanstack/react-query';
import { getMedoraDataSize } from '@/services/storageService';

export function useStorageSize() {
  return useQuery({
    queryKey: ['storage-size'],
    queryFn: getMedoraDataSize,
    refetchInterval: 30_000,
  });
}
