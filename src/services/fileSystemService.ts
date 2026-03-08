/**
 * File System Service — wraps @capacitor/filesystem for Medora file operations.
 * All paths are relative to Directory.Data + 'medora/'
 */

import { Filesystem, Directory } from '@capacitor/filesystem';

const BASE_DIR = 'medora/';

export async function saveFile(options: {
  relativePath: string;
  base64Data: string;
  mimeType?: string;
}): Promise<void> {
  await Filesystem.writeFile({
    path: BASE_DIR + options.relativePath,
    data: options.base64Data,
    directory: Directory.Data,
    recursive: true,
  });
}

export async function readFile(relativePath: string): Promise<string> {
  const result = await Filesystem.readFile({
    path: BASE_DIR + relativePath,
    directory: Directory.Data,
  });
  return result.data as string;
}

export async function deleteFile(relativePath: string): Promise<void> {
  try {
    await Filesystem.deleteFile({
      path: BASE_DIR + relativePath,
      directory: Directory.Data,
    });
  } catch {
    // File may already be deleted — ignore
  }
}

export async function fileExists(relativePath: string): Promise<boolean> {
  try {
    await Filesystem.stat({
      path: BASE_DIR + relativePath,
      directory: Directory.Data,
    });
    return true;
  } catch {
    return false;
  }
}

export function getFileUrl(relativePath: string): string {
  return `capacitor://localhost/_capacitor_file_/medora/${relativePath}`;
}

export async function getFolderSize(folderPath: string): Promise<number> {
  let totalBytes = 0;

  try {
    const listing = await Filesystem.readdir({
      path: BASE_DIR + folderPath,
      directory: Directory.Data,
    });

    for (const entry of listing.files) {
      if (entry.type === 'directory') {
        const subPath = folderPath ? `${folderPath}/${entry.name}` : entry.name;
        totalBytes += await getFolderSize(subPath);
      } else {
        totalBytes += entry.size ?? 0;
      }
    }
  } catch {
    // Folder doesn't exist yet
  }

  return totalBytes;
}
