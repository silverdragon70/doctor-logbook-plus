/**
 * Storage Service — provides storage size info for Medora data.
 */

import * as fileSystemService from './fileSystemService';

export async function getMedoraDataSize(): Promise<number> {
  return fileSystemService.getFolderSize('');
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
