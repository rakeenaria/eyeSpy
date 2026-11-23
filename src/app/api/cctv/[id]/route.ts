import { NextResponse } from 'next/server';
import { findPublicCctvCamera } from '@/lib/services/jogja-cctv';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const detail = await findPublicCctvCamera(decodeURIComponent(id));
    if (!detail.camera) {
      return NextResponse.json(
        { error: 'Kamera CCTV tidak ditemukan.' },
        { status: 404 }
      );
    }
    return NextResponse.json(detail);
  } catch (error) {
    console.error('[GET /api/cctv/[id]]', error);
    return NextResponse.json(
      { error: 'Gagal memuat detail kamera CCTV.' },
      { status: 500 }
    );
  }
}
