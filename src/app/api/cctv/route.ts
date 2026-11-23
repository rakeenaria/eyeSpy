import { NextResponse } from 'next/server';
import { listPublicCctvCameras } from '@/lib/services/jogja-cctv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const catalog = await listPublicCctvCameras();
    return NextResponse.json(catalog);
  } catch (error) {
    console.error('[GET /api/cctv]', error);
    return NextResponse.json(
      { error: 'Gagal memuat katalog CCTV publik.' },
      { status: 500 }
    );
  }
}
