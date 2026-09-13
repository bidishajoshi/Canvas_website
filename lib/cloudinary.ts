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
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;

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
