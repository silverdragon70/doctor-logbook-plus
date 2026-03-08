import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as backupService from '@/services/backupService';
import * as restoreService from '@/services/restoreService';
import * as settingsService from '@/services/settingsService';
import type { BackupMetadata } from '@/types';

// ─── useLastBackupInfo ──────────────────────────────────────

export function useLastBackupInfo() {
  return useQuery({
    queryKey: ['last-backup'],
    queryFn: async () => {
      const date = await settingsService.get('last_backup_date');
      const type = await settingsService.get('last_backup_type');
      const destination = await settingsService.get('last_backup_destination');
      const size = await settingsService.get('last_backup_size');
      if (!date) return null;
      return { date, type, destination, size };
    },
  });
}

// ─── useCreateBackup ────────────────────────────────────────

type OperationStatus = 'idle' | 'running' | 'done' | 'error';

export function useCreateBackup() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<OperationStatus>('idle');
  const [progress, setProgress] = useState({ percent: 0, message: '' });
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (options: {
    type: 'full' | 'incremental' | 'data';
    destination: 'local' | 'gdrive';
    timePeriod?: 'all' | 'custom';
    fromDate?: string;
    toDate?: string;
  }) => {
    setStatus('running');
    setError(null);
    setProgress({ percent: 0, message: '' });
    try {
      await backupService.createBackup({
        ...options,
        onProgress: (percent, message) => setProgress({ percent, message }),
      });
      setStatus('done');
      qc.invalidateQueries({ queryKey: ['last-backup'] });
    } catch (e: any) {
      setError(e.message || 'Backup failed');
      setStatus('error');
    }
  }, [qc]);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress({ percent: 0, message: '' });
    setError(null);
  }, []);

  return { start, progress, status, error, reset };
}

// ─── useRestoreBackup ───────────────────────────────────────

export function useRestoreBackup() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<OperationStatus>('idle');
  const [progress, setProgress] = useState({ percent: 0, message: '' });
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (options: {
    file: File;
    restoreType: 'full' | 'data';
  }) => {
    setStatus('running');
    setError(null);
    setProgress({ percent: 0, message: '' });
    try {
      await restoreService.restore({
        ...options,
        onProgress: (percent, message) => setProgress({ percent, message }),
      });
      qc.clear();
      setStatus('done');
    } catch (e: any) {
      setError(e.message || 'Restore failed');
      setStatus('error');
    }
  }, [qc]);

  return { start, progress, status, error };
}
