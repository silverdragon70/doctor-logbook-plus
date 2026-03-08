/**
 * Media Service — manages media files attached to cases.
 */

import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { enqueueSyncJob } from './syncQueue';
import { processImage, blobToBase64 } from './imageProcessor';
import * as fileSystemService from './fileSystemService';
import * as settingsService from './settingsService';

export interface MediaItem {
  id: string;
  filePath: string;
  thumbnailPath: string;
  fileUrl: string;
  thumbnailUrl: string;
  fileSize: number;
}

export async function getByCaseId(caseId: string): Promise<MediaItem[]> {
  const db = getDb();
  const res = await db.query(
    `SELECT * FROM media WHERE case_id = ? AND is_deleted = 0 ORDER BY created_at DESC`,
    [caseId]
  );

  return (res.values ?? []).map((row: any) => ({
    id: row.id,
    filePath: row.file_path,
    thumbnailPath: row.thumbnail_path,
    fileUrl: fileSystemService.getFileUrl(row.file_path),
    thumbnailUrl: fileSystemService.getFileUrl(row.thumbnail_path),
    fileSize: row.file_size ?? 0,
  }));
}

export async function add(
  caseId: string,
  file: File
): Promise<{ id: string; fileUrl: string; thumbnailUrl: string }> {
  // 1. Read settings
  const quality = (await settingsService.get('imageQuality')) as 'compress' | 'original' ?? 'original';
  const maxSizeStr = await settingsService.get('imageMaxSize');
  const maxSizeMB = maxSizeStr && maxSizeStr !== 'none' ? Number(maxSizeStr) : null;

  // 2. Process image
  const { mainBlob, thumbnailBlob, finalSizeBytes } = await processImage(file, {
    quality,
    maxSizeMB,
  });

  // 3. Generate paths
  const id = generateId();
  const timestamp = Date.now();
  const mainPath = `cases/${caseId}/images/${id}_${timestamp}.jpg`;
  const thumbPath = `cases/${caseId}/thumbnails/${id}_${timestamp}_thumb.jpg`;

  // 4. Convert to base64
  const mainBase64 = await blobToBase64(mainBlob);
  const thumbBase64 = await blobToBase64(thumbnailBlob);

  // 5. Save files
  await fileSystemService.saveFile({ relativePath: mainPath, base64Data: mainBase64 });
  await fileSystemService.saveFile({ relativePath: thumbPath, base64Data: thumbBase64 });

  // 6. Insert DB record
  const db = getDb();
  await db.run(
    `INSERT INTO media (id, case_id, file_path, thumbnail_path, file_size, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [id, caseId, mainPath, thumbPath, finalSizeBytes]
  );

  // 7. Enqueue sync
  await enqueueSyncJob('media', id, 'INSERT');

  // 8. Return
  return {
    id,
    fileUrl: fileSystemService.getFileUrl(mainPath),
    thumbnailUrl: fileSystemService.getFileUrl(thumbPath),
  };
}

export async function deleteMedia(mediaId: string): Promise<void> {
  const db = getDb();
  const res = await db.query(`SELECT file_path, thumbnail_path FROM media WHERE id = ?`, [mediaId]);
  const row = res.values?.[0];

  if (row) {
    await fileSystemService.deleteFile(row.file_path);
    await fileSystemService.deleteFile(row.thumbnail_path);
  }

  await db.run(`UPDATE media SET is_deleted = 1 WHERE id = ?`, [mediaId]);
  await enqueueSyncJob('media', mediaId, 'DELETE');
}

export async function deleteAllForCase(caseId: string): Promise<void> {
  const db = getDb();
  const res = await db.query(
    `SELECT file_path, thumbnail_path FROM media WHERE case_id = ? AND is_deleted = 0`,
    [caseId]
  );

  for (const row of res.values ?? []) {
    await fileSystemService.deleteFile(row.file_path);
    await fileSystemService.deleteFile(row.thumbnail_path);
  }

  await db.run(`UPDATE media SET is_deleted = 1 WHERE case_id = ?`, [caseId]);
}
