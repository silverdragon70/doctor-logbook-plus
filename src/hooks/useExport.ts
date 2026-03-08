import { useState, useCallback } from 'react';
import * as exportService from '@/services/exportService';

type OperationStatus = 'idle' | 'running' | 'done' | 'error';

export function useExportData() {
  const [status, setStatus] = useState<OperationStatus>('idle');
  const [progress, setProgress] = useState({ percent: 0, message: '' });
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (options: {
    categories: ('cases' | 'procedures' | 'lectures' | 'courses')[];
    caseIds?: string[];
    hospitalId?: string;
    timePeriod: string;
    fromDate?: string;
    toDate?: string;
    format: 'PDF' | 'DOCX' | 'Excel' | 'JSON';
  }) => {
    setStatus('running');
    setError(null);
    setProgress({ percent: 0, message: '' });
    try {
      await exportService.exportData({
        ...options,
        onProgress: (percent, message) => setProgress({ percent, message }),
      });
      setStatus('done');
    } catch (e: any) {
      setError(e.message || 'Export failed');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress({ percent: 0, message: '' });
    setError(null);
  }, []);

  return { start, progress, status, error, reset };
}
