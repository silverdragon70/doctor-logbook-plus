/**
 * Backup Service — creates .medora backup files (ZIP archives).
 */

import JSZip from 'jszip';
import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import * as fileSystemService from './fileSystemService';
import type { BackupMetadata } from '@/types';

const TABLES_WITH_DELETED = [
  'patients', 'hospitals', 'cases', 'investigations',
  'management_entries', 'progress_notes', 'procedures',
  'lectures', 'courses', 'media',
];

const TABLES_WITHOUT_DELETED = [
  'investigation_images', 'vitals', 'settings', 'backup_history',
];

async function exportAllTables(timePeriod?: string, fromDate?: string, toDate?: string) {
  const db = getDb();
  const data: Record<string, any[]> = {};

  for (const table of TABLES_WITH_DELETED) {
    let query = `SELECT * FROM ${table} WHERE is_deleted = 0`;
    const params: any[] = [];

    if (timePeriod === 'custom' && fromDate && toDate && table === 'cases') {
      query += ` AND admission_date BETWEEN ? AND ?`;
      params.push(fromDate, toDate);
    }

    const res = await db.query(query, params);
    data[table] = res.values ?? [];
  }

  for (const table of TABLES_WITHOUT_DELETED) {
    const res = await db.query(`SELECT * FROM ${table}`);
    data[table] = res.values ?? [];
  }

  return data;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function createBackup(options: {
  type: 'full' | 'incremental' | 'data';
  destination: 'local' | 'gdrive';
  timePeriod?: 'all' | 'custom';
  fromDate?: string;
  toDate?: string;
  onProgress: (percent: number, message: string) => void;
}): Promise<BackupMetadata> {
  const { type, destination, timePeriod, fromDate, toDate, onProgress } = options;

  // 1
  onProgress(5, 'Preparing backup...');

  // 2
  onProgress(20, 'Exporting database...');
  const exportData = await exportAllTables(timePeriod, fromDate, toDate);

  // 3
  const zip = new JSZip();
  zip.file('data.json', JSON.stringify(exportData));

  // 4 — Images
  if (type === 'full' || type === 'incremental') {
    onProgress(40, 'Packaging images...');
    const imagesFolder = zip.folder('images')!;

    // Media images
    for (const row of exportData.media ?? []) {
      try {
        const base64 = await fileSystemService.readFile(row.file_path);
        imagesFolder.file(row.file_path, base64, { base64: true });
        if (row.thumbnail_path) {
          const thumbBase64 = await fileSystemService.readFile(row.thumbnail_path);
          imagesFolder.file(row.thumbnail_path, thumbBase64, { base64: true });
        }
      } catch {
        // Skip missing files
      }
    }

    // Investigation images
    for (const row of exportData.investigation_images ?? []) {
      try {
        const base64 = await fileSystemService.readFile(row.file_path);
        imagesFolder.file(row.file_path, base64, { base64: true });
      } catch {
        // Skip missing files
      }
    }
  }

  // 5 — Metadata
  onProgress(70, 'Creating backup file...');
  const metadata: BackupMetadata = {
    appVersion: '1.0.0',
    date: new Date().toISOString(),
    backupType: type,
    size: '',
    destination,
  };
  zip.file('metadata.json', JSON.stringify({ ...metadata, schemaVersion: '1' }));

  // 6 — Generate ZIP
  const zipBase64 = await zip.generateAsync({ type: 'base64' });
  const fileName = `medora_backup_${Date.now()}.medora`;
  const sizeBytes = Math.ceil(zipBase64.length * 0.75);
  metadata.size = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;

  // 7 — Save
  onProgress(80, 'Saving...');
  if (destination === 'local') {
    await fileSystemService.saveFile({ relativePath: `backups/${fileName}`, base64Data: zipBase64 });

    // Browser download fallback
    try {
      const bytes = base64ToUint8Array(zipBase64);
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Not on web — skip
    }
  } else if (destination === 'gdrive') {
    // Google Drive upload handled by googleDriveService (imported dynamically to avoid circular deps)
    const { uploadFile } = await import('./googleDriveService');
    await uploadFile({ fileName, base64Data: zipBase64, mimeType: 'application/octet-stream' });
  }

  // 8 — Record in DB
  onProgress(95, 'Finalizing...');
  const db = getDb();
  await db.run(
    `INSERT INTO backup_history (id, app_version, date, backup_type, size, destination, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [generateId(), metadata.appVersion, metadata.date, type, metadata.size, destination]
  );

  // Update settings
  await db.run("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('last_backup_date', ?, datetime('now'))", [metadata.date]);
  await db.run("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('last_backup_type', ?, datetime('now'))", [type]);
  await db.run("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('last_backup_destination', ?, datetime('now'))", [destination]);
  await db.run("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('last_backup_size', ?, datetime('now'))", [metadata.size]);

  // 9
  onProgress(100, 'Complete');
  return metadata;
}
