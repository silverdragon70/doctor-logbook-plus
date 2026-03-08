/**
 * Restore Service — reads .medora backup files and restores data.
 */

import JSZip from 'jszip';
import { getDb } from '@/db/database';
import * as fileSystemService from './fileSystemService';

const RESTORE_TABLE_ORDER = [
  'hospitals', 'patients', 'cases', 'investigations',
  'investigation_images', 'management_entries', 'progress_notes',
  'vitals', 'procedures', 'lectures', 'courses', 'media',
  'settings', 'backup_history',
];

export async function restore(options: {
  file: File;
  restoreType: 'full' | 'data';
  onProgress: (percent: number, message: string) => void;
}): Promise<void> {
  const { file, restoreType, onProgress } = options;

  // 1. Validate
  onProgress(5, 'Reading backup file...');
  if (!file.name.endsWith('.medora')) {
    throw new Error('INVALID_BACKUP_FILE');
  }

  // 2. Read ZIP
  onProgress(15, 'Validating backup...');
  const zip = await JSZip.loadAsync(file);

  const metadataFile = zip.file('metadata.json');
  const dataFile = zip.file('data.json');
  if (!metadataFile || !dataFile) {
    throw new Error('INVALID_BACKUP_FILE');
  }

  const metadata = JSON.parse(await metadataFile.async('text'));
  if (metadata.schemaVersion !== '1') {
    throw new Error('INCOMPATIBLE_VERSION');
  }

  // 3. Restore data
  onProgress(30, 'Restoring data...');
  const data = JSON.parse(await dataFile.async('text'));
  const db = getDb();

  for (const table of RESTORE_TABLE_ORDER) {
    const rows = data[table];
    if (!rows || !Array.isArray(rows) || rows.length === 0) continue;

    // Delete existing
    await db.run(`DELETE FROM ${table}`);

    // Insert restored rows
    for (const row of rows) {
      const columns = Object.keys(row);
      const placeholders = columns.map(() => '?').join(', ');
      const values = columns.map((col) => row[col]);
      await db.run(
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );
    }
  }

  // 4. Restore images
  if (restoreType === 'full') {
    const imagesFolder = zip.folder('images');
    if (imagesFolder) {
      onProgress(65, 'Restoring images...');
      const imageFiles: string[] = [];
      imagesFolder.forEach((relativePath) => {
        imageFiles.push(relativePath);
      });

      for (const relativePath of imageFiles) {
        const imgFile = zip.file(`images/${relativePath}`);
        if (imgFile) {
          const base64 = await imgFile.async('base64');
          await fileSystemService.saveFile({ relativePath, base64Data: base64 });
        }
      }
    }
  }

  // 5. Finalize
  onProgress(95, 'Finalizing...');
  onProgress(100, 'Complete');
}
