/**
 * Investigation Image Service — manages images attached to investigations.
 */

import { getDb } from '@/db/database';
import generateId from '@/db/generateId';
import { processImage, blobToBase64 } from './imageProcessor';
import * as fileSystemService from './fileSystemService';

export async function add(
  investigationId: string,
  caseId: string,
  file: File
): Promise<string> {
  // Always compress for investigations
  const { mainBlob } = await processImage(file, {
    quality: 'compress',
    maxSizeMB: null,
  });

  const id = generateId();
  const timestamp = Date.now();
  const filePath = `cases/${caseId}/investigations/${investigationId}/${id}_${timestamp}.jpg`;

  const base64 = await blobToBase64(mainBlob);
  await fileSystemService.saveFile({ relativePath: filePath, base64Data: base64 });

  const db = getDb();
  await db.run(
    `INSERT INTO investigation_images (id, investigation_id, file_path, created_at)
     VALUES (?, ?, ?, datetime('now'))`,
    [id, investigationId, filePath]
  );

  return fileSystemService.getFileUrl(filePath);
}

export async function deleteImage(imageId: string, filePath: string): Promise<void> {
  await fileSystemService.deleteFile(filePath);
  const db = getDb();
  await db.run(`DELETE FROM investigation_images WHERE id = ?`, [imageId]);
}

export async function getUrlsForInvestigation(investigationId: string): Promise<string[]> {
  const db = getDb();
  const res = await db.query(
    `SELECT file_path FROM investigation_images WHERE investigation_id = ?`,
    [investigationId]
  );
  return (res.values ?? []).map((r: any) => fileSystemService.getFileUrl(r.file_path));
}
