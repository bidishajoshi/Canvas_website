import 'server-only';
import crypto from 'crypto';

/**
 * Generates a signed set of upload parameters for Cloudinary. The
 * browser uploads the file directly to Cloudinary using this signature,
 * so the file never passes through our server (avoids large-file
 * bandwidth costs) while CLOUDINARY_API_SECRET stays server-side only.
 *
 * See app/api/canvas/upload/route.ts for how this is consumed.
 */
export function getSignedUploadParams(folder: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo';

  // Cloudinary requires the signature to be computed over all
  // parameters (except file, cloud_name, resource_type and api_key)
  // sorted alphabetically as key=value pairs joined with '&'.
  const paramsToSign = { folder, timestamp };
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key as keyof typeof paramsToSign]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
  };
}

/**
 * Extracts Cloudinary public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567/custom-canvas/sample.jpg
 * -> "custom-canvas/sample"
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let path = parts[1];
    // Remove version component (e.g. v1234567/)
    path = path.replace(/^v\d+\//, '');
    // Remove file extension
    const lastDot = path.lastIndexOf('.');
    if (lastDot !== -1) {
      path = path.substring(0, lastDot);
    }
    return path;
  } catch {
    return null;
  }
}

/**
 * Deletes an asset from Cloudinary securely on the server using API Secret.
 * Used for cleaning up temporary customer uploads after order processing completes.
 */
export async function deleteCloudinaryAsset(publicId: string) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    return { success: false, reason: 'missing_credentials' };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const bodyParams = new URLSearchParams();
  bodyParams.append('public_id', publicId);
  bodyParams.append('signature', signature);
  bodyParams.append('api_key', apiKey);
  bodyParams.append('timestamp', timestamp.toString());

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    });
    const data = await res.json();
    return { success: data.result === 'ok' || data.result === 'not found', data };
  } catch (err) {
    console.error('deleteCloudinaryAsset caught error:', err);
    return { success: false, error: err };
  }
}
