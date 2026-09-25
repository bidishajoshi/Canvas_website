import imageCompression from 'browser-image-compression';

export interface OptimizationResult {
  file: File;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  reductionPercentage: number;
  width: number;
  height: number;
  previewUrl: string;
  isOptimized: boolean;
  format: string;
}

export interface OptimizationOptions {
  /** Target max file size in MB. Default 2.5MB */
  maxSizeMB?: number;
  /** Maximum width or height dimension in pixels. Default 3840px (4K resolution for print) */
  maxWidthOrHeight?: number;
  /** Initial quality factor (0 to 1). Default 0.88 */
  initialQuality?: number;
  /** Force web worker execution where available */
  useWebWorker?: boolean;
  /** Target specific usage e.g. 'canvas' | 'tshirt' | 'admin' | 'screenshot' */
  preset?: 'canvas' | 'tshirt' | 'admin' | 'screenshot';
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

/**
 * Validates an image file before attempting processing.
 */
export function validateImageFile(
  file: File,
  maxSizeBytes: number = 60 * 1024 * 1024
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const fileType = file.type?.toLowerCase();
  const fileExt = file.name?.split('.').pop()?.toLowerCase();

  const isAllowedMime = ALLOWED_TYPES.includes(fileType);
  const isAllowedExt = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(fileExt || '');

  if (!isAllowedMime && !isAllowedExt) {
    return {
      valid: false,
      error: 'Please upload a valid JPG, PNG, or WEBP image file.',
    };
  }

  if (file.size > maxSizeBytes) {
    const mbLimit = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File is larger than the maximum allowed limit of ${mbLimit}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Checks if a PNG file contains transparent pixels.
 */
async function checkPNGTransparency(file: File): Promise<boolean> {
  if (file.type !== 'image/png' && !file.name.toLowerCase().endsWith('.png')) {
    return false;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          return resolve(true); // Default preserve transparent
        }

        // Sample small scaled version for speed
        const sampleW = Math.min(img.naturalWidth, 300);
        const sampleH = Math.min(img.naturalHeight, 300);
        canvas.width = sampleW;
        canvas.height = sampleH;

        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;

        // Check alpha channel (4th byte of each pixel)
        let hasAlpha = false;
        for (let i = 3; i < imgData.length; i += 4) {
          if (imgData[i] < 250) {
            hasAlpha = true;
            break;
          }
        }
        URL.revokeObjectURL(url);
        resolve(hasAlpha);
      } catch (e) {
        URL.revokeObjectURL(url);
        resolve(true); // Safe default for PNG
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };

    img.src = url;
  });
}

/**
 * Reads intrinsic dimensions of an image File.
 */
export function getImageDimensions(file: File | string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const src = typeof file === 'string' ? file : URL.createObjectURL(file);

    img.onload = () => {
      if (typeof file !== 'string') URL.revokeObjectURL(src);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      if (typeof file !== 'string') URL.revokeObjectURL(src);
      resolve({ width: 0, height: 0 });
    };

    img.src = src;
  });
}

/**
 * Smart automatic client-side image optimization.
 */
export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const originalSizeBytes = file.size;

  // Determine preset defaults
  let targetMaxSizeMB = options.maxSizeMB ?? 2.5;
  let maxDim = options.maxWidthOrHeight ?? 3840;
  let initialQuality = options.initialQuality ?? 0.88;

  if (options.preset === 'canvas') {
    // High res for canvas print
    targetMaxSizeMB = 3.0;
    maxDim = 3840;
    initialQuality = 0.90;
  } else if (options.preset === 'tshirt') {
    // T-shirt graphic artwork
    targetMaxSizeMB = 2.0;
    maxDim = 3200;
    initialQuality = 0.88;
  } else if (options.preset === 'screenshot') {
    // Payment receipt screenshot
    targetMaxSizeMB = 1.0;
    maxDim = 1920;
    initialQuality = 0.82;
  } else if (options.preset === 'admin') {
    // Admin CMS images
    targetMaxSizeMB = 2.0;
    maxDim = 3200;
    initialQuality = 0.88;
  }

  // Detect PNG transparency
  const isTransparentPNG = await checkPNGTransparency(file);

  // Smart check: if already small (< 800 KB) and not exceeding max dimension, do not over-compress
  const dims = await getImageDimensions(file);
  const maxExistingDim = Math.max(dims.width, dims.height);

  if (file.size <= 800 * 1024 && (maxExistingDim <= maxDim || maxExistingDim === 0)) {
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      originalSizeBytes,
      optimizedSizeBytes: file.size,
      reductionPercentage: 0,
      width: dims.width,
      height: dims.height,
      previewUrl,
      isOptimized: false,
      format: file.type || 'image/jpeg',
    };
  }

  // Compression configuration
  const compressionOptions: any = {
    maxSizeMB: targetMaxSizeMB,
    maxWidthOrHeight: maxDim,
    initialQuality,
    useWebWorker: options.useWebWorker !== false,
    preserveExif: true,
  };

  // Preserve PNG format & transparency if transparent PNG is detected
  if (isTransparentPNG) {
    compressionOptions.fileType = 'image/png';
  } else if (file.type === 'image/webp') {
    compressionOptions.fileType = 'image/webp';
  } else {
    // For standard photos, WebP or JPEG produces optimal quality/size ratio
    compressionOptions.fileType = 'image/jpeg';
  }

  let compressedFile: File;
  try {
    const compressedBlob = await imageCompression(file, compressionOptions);
    compressedFile = new File([compressedBlob], file.name, {
      type: compressionOptions.fileType || file.type,
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn('browser-image-compression worker notice, trying fallback canvas compression:', err);
    compressedFile = file;
  }

  // If compression resulted in larger file size (rare), fallback to original file
  if (compressedFile.size >= originalSizeBytes) {
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      originalSizeBytes,
      optimizedSizeBytes: originalSizeBytes,
      reductionPercentage: 0,
      width: dims.width,
      height: dims.height,
      previewUrl,
      isOptimized: false,
      format: file.type || 'image/jpeg',
    };
  }

  const finalDims = await getImageDimensions(compressedFile);
  const reductionPercentage = Number(
    (((originalSizeBytes - compressedFile.size) / originalSizeBytes) * 100).toFixed(1)
  );

  const previewUrl = URL.createObjectURL(compressedFile);

  return {
    file: compressedFile,
    originalSizeBytes,
    optimizedSizeBytes: compressedFile.size,
    reductionPercentage,
    width: finalDims.width || dims.width,
    height: finalDims.height || dims.height,
    previewUrl,
    isOptimized: true,
    format: compressedFile.type,
  };
}

/**
 * Format bytes into human readable MB/KB string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
