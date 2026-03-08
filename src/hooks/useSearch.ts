import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as searchService from '@/services/searchService';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchService.search(query),
    enabled: query.length >= 2,
    staleTime: 0,
  });
}

export function useRecentSearches() {
  return useQuery({
    queryKey: ['recent-searches'],
    queryFn: searchService.getRecentSearches,
  });
}

export function useSaveRecentSearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: searchService.saveRecentSearch,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recent-searches'] }); },
  });
}
