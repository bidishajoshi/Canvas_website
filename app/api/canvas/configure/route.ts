import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculatePrice } from '@/lib/pricing';

interface ConfigureRequestBody {
  uploadedImageUrl: string;
  uploadedImageMeta: {
    width: number;
    height: number;
    size_bytes: number;
    quality_rating: 'excellent' | 'good' | 'low_resolution' | null;
  };
  panelTypeId: string;
  canvasSizeId: string;
  frameId: string | null;
  finishId: string | null;
  panelGapMm: number;
  cropData: unknown;
  quantity: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ConfigureRequestBody;

  if (!body.uploadedImageUrl || !body.canvasSizeId || !body.panelTypeId) {
    return NextResponse.json(
      { error: 'uploadedImageUrl, panelTypeId and canvasSizeId are required' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // Re-fetch size/frame/finish from the database — the price is always
  // computed here, server-side, from live admin-set values. The price
  // the browser displayed is only ever a preview.
  const [{ data: size, error: sizeError }, frameRes, finishRes] = await Promise.all([
    supabase.from('canvas_sizes').select('*').eq('id', body.canvasSizeId).single(),
    body.frameId
      ? supabase.from('frames').select('*').eq('id', body.frameId).single()
      : Promise.resolve({ data: null }),
    body.finishId
      ? supabase.from('finishes').select('*').eq('id', body.finishId).single()
      : Promise.resolve({ data: null }),
  ]);

  if (sizeError || !size) {
    return NextResponse.json({ error: 'Selected size was not found.' }, { status: 400 });
  }

  const quantity = Math.max(1, Math.round(body.quantity ?? 1));

  const calculatedPricePaisa = calculatePrice({
    basePricePaisa: 0,
    canvasSize: size,
    frame: frameRes.data,
    finish: finishRes.data,
    quantity,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: configuration, error: insertError } = await supabase
    .from('canvas_configurations')
    .insert({
      customer_id: user?.id ?? null,
      uploaded_image_url: body.uploadedImageUrl,
      uploaded_image_meta: body.uploadedImageMeta,
      panel_type_id: body.panelTypeId,
      canvas_size_id: body.canvasSizeId,
      frame_id: body.frameId,
      finish_id: body.finishId,
      panel_gap_mm: body.panelGapMm,
      crop_data: body.cropData,
      calculated_price_paisa: calculatedPricePaisa,
      quantity,
    })
    .select('id')
    .single();

  if (insertError || !configuration) {
    console.error('canvas_configurations insert error', insertError);
    return NextResponse.json(
      { error: 'Could not save your canvas configuration.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: configuration.id,
    calculatedPricePaisa,
  });
}
