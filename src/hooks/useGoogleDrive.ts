import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as googleDriveService from '@/services/googleDriveService';

// ─── useGoogleAccounts ──────────────────────────────────────

export function useGoogleAccounts() {
  return useQuery({
    queryKey: ['google-accounts'],
    queryFn: () => googleDriveService.getAccounts(),
  });
}

// ─── useConnectGoogle ───────────────────────────────────────

export function useConnectGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => googleDriveService.connect(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['google-accounts'] }),
  });
}

// ─── useDisconnectGoogle ────────────────────────────────────

export function useDisconnectGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => googleDriveService.disconnect(email),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['google-accounts'] }),
  });
}

// ─── useSetActiveAccount ────────────────────────────────────

export function useSetActiveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => googleDriveService.setActiveAccount(email),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['google-accounts'] }),
  });
}

// ─── useSyncNow ─────────────────────────────────────────────

type SyncStatus = 'idle' | 'running' | 'done' | 'error';

export function useSyncNow() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [progress, setProgress] = useState({ percent: 0, message: '' });
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setStatus('running');
    setError(null);
    setProgress({ percent: 0, message: '' });
    try {
      await googleDriveService.sync((percent, message) => setProgress({ percent, message }));
      setStatus('done');
    } catch (e: any) {
      setError(e.message || 'Sync failed');
      setStatus('error');
    }
  }, []);

  return { start, progress, status, error };
}
