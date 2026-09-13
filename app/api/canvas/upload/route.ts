import { NextResponse } from 'next/server';
import { getSignedUploadParams } from '@/lib/cloudinary';

export async function POST() {
  try {
    const signed = getSignedUploadParams('custom-canvas');
    return NextResponse.json(signed);
  } catch (error) {
    console.error('Cloudinary signing error', error);
    return NextResponse.json(
      { error: 'Could not prepare upload. Please try again shortly.' },
      { status: 500 }
    );
  }
}
