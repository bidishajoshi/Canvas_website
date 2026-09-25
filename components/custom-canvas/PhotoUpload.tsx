'use client';

import { useRef, useState } from 'react';

export interface UploadedPhoto {
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
}

interface PhotoUploadProps {
  onUploaded: (result: UploadedPhoto) => void;
  maxUploadSizeMb: number;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function PhotoUpload({ onUploaded, maxUploadSizeMb }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

import { optimizeImage, validateImageFile, getImageDimensions, type OptimizationResult } from '@/lib/imageOptimizer';

export function PhotoUpload({ onUploaded, maxUploadSizeMb }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setStatusText('');

    const validation = validateImageFile(file, maxUploadSizeMb * 1024 * 1024);
    if (!validation.valid) {
      setError(validation.error || `Please upload a JPG, PNG, or WEBP image up to ${maxUploadSizeMb}MB.`);
      return;
    }

    setUploading(true);
    setProgress(15);
    setStatusText('Optimizing your photo...');

    let optimizedFile: File = file;
    let finalWidth = 0;
    let finalHeight = 0;

    try {
      // Automatic client-side smart compression
      const optResult: OptimizationResult = await optimizeImage(file, { preset: 'canvas' });
      optimizedFile = optResult.file;
      finalWidth = optResult.width;
      finalHeight = optResult.height;
      setPreview(optResult.previewUrl);
    } catch (optErr) {
      console.warn('Optimization notice, proceeding with original photo:', optErr);
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      const dims = await getImageDimensions(file);
      finalWidth = dims.width;
      finalHeight = dims.height;
    }

    setProgress(50);
    setStatusText('Preparing live canvas editor...');

    try {
      const signRes = await fetch('/api/canvas/upload', { method: 'POST' });
      if (signRes.ok) {
        const signed = await signRes.json();
        const uploadedUrl = await uploadToCloudinary(optimizedFile, signed, (pct) => {
          setProgress(50 + Math.round(pct * 0.5));
        });

        onUploaded({
          url: uploadedUrl,
          width: finalWidth,
          height: finalHeight,
          sizeBytes: optimizedFile.size,
        });
        setStatusText('Photo ready ✓');
        setUploading(false);
        return;
      }
    } catch (e) {
      console.warn('Cloudinary upload unavailable, falling back to local image data URL:', e);
    }

    // Fallback: convert file to Data URL so photo upload ALWAYS succeeds
    const reader = new FileReader();
    reader.onload = () => {
      onUploaded({
        url: reader.result as string,
        width: finalWidth,
        height: finalHeight,
        sizeBytes: optimizedFile.size,
      });
      setStatusText('Photo ready ✓');
      setUploading(false);
    };
    reader.onerror = () => {
      setError('Upload failed. Please try a different image.');
      setUploading(false);
    };
    reader.readAsDataURL(optimizedFile);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-border py-12 text-sm text-muted transition-colors hover:border-accent-yellow"
        >
          <span aria-hidden="true" className="text-2xl">
            📷
          </span>
          Upload Your Photo
          <span className="text-xs">JPG, PNG or WEBP — up to {maxUploadSizeMb}MB</span>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-card bg-surface">
            {/* Local object URL preview — a plain <img> avoids next/image's
                remote-domain restrictions for a blob: URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Uploaded preview" className="h-full w-full object-cover" />
          </div>
          {uploading && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full bg-accent-yellow transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium text-accent-yellow underline"
          >
            Choose a different photo
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = url;
  });
}

function uploadToCloudinary(
  file: File,
  signed: {
    uploadUrl: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
  },
  onProgress: (pct: number) => void
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
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url as string);
      } else {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}
