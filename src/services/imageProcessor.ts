/**
 * Image Processor — uses browser Canvas API for compression and thumbnails.
 * No native libraries required.
 */

const VALID_TYPES = ['image/jpeg', 'image/png'];

export async function processImage(
  file: File,
  options: { quality: 'compress' | 'original'; maxSizeMB: number | null }
): Promise<{ mainBlob: Blob; thumbnailBlob: Blob; finalSizeBytes: number }> {
  // 1. Validate format
  if (!VALID_TYPES.includes(file.type)) {
    throw new Error('INVALID_FORMAT');
  }

  // 2. Check file size
  if (options.maxSizeMB != null && file.size > options.maxSizeMB * 1024 * 1024) {
    throw new Error('IMAGE_TOO_LARGE');
  }

  // 3. Load image
  const img = new Image();
  const objectUrl = URL.createObjectURL(file);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = objectUrl;
  });
  URL.revokeObjectURL(objectUrl);

  // 4. Main image (max width 1200px)
  const mainCanvas = document.createElement('canvas');
  const mainScale = Math.min(1, 1200 / img.width);
  mainCanvas.width = img.width * mainScale;
  mainCanvas.height = img.height * mainScale;
  const mainCtx = mainCanvas.getContext('2d')!;
  mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);

  const jpegQuality = options.quality === 'compress' ? 0.7 : 1.0;
  const mainBlob = await new Promise<Blob>((resolve, reject) => {
    mainCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create main blob'))),
      'image/jpeg',
      jpegQuality
    );
  });

  // 5. Thumbnail (max width 300px)
  const thumbCanvas = document.createElement('canvas');
  const thumbScale = Math.min(1, 300 / img.width);
  thumbCanvas.width = img.width * thumbScale;
  thumbCanvas.height = img.height * thumbScale;
  const thumbCtx = thumbCanvas.getContext('2d')!;
  thumbCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);

  const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
    thumbCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create thumbnail blob'))),
      'image/jpeg',
      0.6
    );
  });

  // 6. Return
  return { mainBlob, thumbnailBlob, finalSizeBytes: mainBlob.size };
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the data:...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
