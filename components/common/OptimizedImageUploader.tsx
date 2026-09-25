'use client';

import { useRef, useState } from 'react';
import { optimizeImage, validateImageFile, formatBytes, type OptimizationResult } from '@/lib/imageOptimizer';

export interface OptimizedUploadSuccess {
  file: File;
  url: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  reductionPercentage: number;
  width: number;
  height: number;
}

interface OptimizedImageUploaderProps {
  onOptimized?: (result: OptimizedUploadSuccess) => void;
  mode?: 'admin' | 'customer';
  preset?: 'canvas' | 'tshirt' | 'admin' | 'screenshot';
  label?: string;
  sublabel?: string;
  buttonText?: string;
  currentImageUrl?: string | null;
  className?: string;
  name?: string;
  uploadToCloudinaryFolder?: string;
  required?: boolean;
}

export function OptimizedImageUploader({
  onOptimized,
  mode = 'customer',
  preset = 'canvas',
  label,
  sublabel,
  buttonText = 'Upload Image',
  currentImageUrl,
  className = '',
  name,
  uploadToCloudinaryFolder,
  required = false,
}: OptimizedImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [optimizing, setOptimizing] = useState(false);
  const [stats, setStats] = useState<{
    originalSize: string;
    optimizedSize: string;
    reduction: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataUrlValue, setDataUrlValue] = useState<string>(currentImageUrl || '');
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(rawFile: File) {
    setError(null);
    setStats(null);

    const validation = validateImageFile(rawFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file.');
      return;
    }

    setOptimizing(true);

    try {
      // Perform smart client-side optimization
      const result: OptimizationResult = await optimizeImage(rawFile, { preset });

      const originalSize = formatBytes(result.originalSizeBytes);
      const optimizedSize = formatBytes(result.optimizedSizeBytes);
      setStats({
        originalSize,
        optimizedSize,
        reduction: result.reductionPercentage,
      });

      setPreview(result.previewUrl);

      let finalUrl = result.previewUrl;

      // Optional Cloudinary upload
      if (uploadToCloudinaryFolder) {
        try {
          const signRes = await fetch('/api/canvas/upload', { method: 'POST' });
          if (signRes.ok) {
            const signed = await signRes.json();
            finalUrl = await uploadFileToCloudinary(result.file, signed);
          }
        } catch (e) {
          console.warn('Cloudinary upload fallback to data URL:', e);
        }
      }

      // Read as Data URL for form submission input fallback
      if (!uploadToCloudinaryFolder || finalUrl === result.previewUrl) {
        finalUrl = await readFileAsDataURL(result.file);
      }

      setDataUrlValue(finalUrl);

      if (onOptimized) {
        onOptimized({
          file: result.file,
          url: finalUrl,
          originalSizeBytes: result.originalSizeBytes,
          optimizedSizeBytes: result.optimizedSizeBytes,
          reductionPercentage: result.reductionPercentage,
          width: result.width,
          height: result.height,
        });
      }
    } catch (err: any) {
      console.error('Image optimization error:', err);
      setError(err?.message || 'Unable to optimize this image. Please try another image.');
    } finally {
      setOptimizing(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-text">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Hidden input to pass optimized image data to traditional HTML forms */}
      {name && <input type="hidden" name={name} value={dataUrlValue} />}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {optimizing ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center space-y-2 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <span className="animate-spin text-base">⏳</span>
            <span>{mode === 'admin' ? 'Optimizing image...' : 'Optimizing your photo...'}</span>
          </div>
          {mode === 'admin' && stats && (
            <p className="text-[11px] text-muted">Original: {stats.originalSize}</p>
          )}
        </div>
      ) : preview ? (
        <div className="space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Optimized preview" className="h-full w-full object-contain" />
            <div className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
              ✓ Ready
            </div>
          </div>

          {/* Admin Stats vs Customer Ready Badge */}
          {mode === 'admin' && stats ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-mono">
              <div>
                <span className="font-bold">Original:</span> {stats.originalSize}
              </div>
              <div>↓</div>
              <div>
                <span className="font-bold">Optimized:</span> {stats.optimizedSize}
              </div>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                −{stats.reduction}%
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>✓</span> Photo ready
              </span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-amber-600 underline text-[11px] font-semibold hover:text-amber-700"
              >
                Change Photo
              </button>
            </div>
          )}

          {mode === 'admin' && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-medium text-amber-600 hover:underline block"
            >
              Replace Photo
            </button>
          )}
        </div>
      ) : (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-bg hover:bg-surface-hover p-6 text-center cursor-pointer transition-colors"
        >
          <span className="text-2xl">📷</span>
          <span className="text-xs font-bold text-amber-600">{buttonText}</span>
          <span className="text-[10px] text-muted">
            {sublabel || 'JPG, PNG or WEBP — Automatic smart compression applied'}
          </span>
        </label>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[10px] font-bold underline ml-2"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
}

function uploadFileToCloudinary(
  file: File,
  signed: {
    uploadUrl: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signed.apiKey);
    formData.append('timestamp', String(signed.timestamp));
    formData.append('signature', signed.signature);
    formData.append('folder', signed.folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', signed.uploadUrl);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url as string);
      } else {
        reject(new Error('Cloudinary upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Cloudinary upload network error'));
    xhr.send(formData);
  });
}
