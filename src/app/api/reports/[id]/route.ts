import { NextResponse } from 'next/server';
import { getIncidentById } from '@/lib/services/reports';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: 'ID laporan tidak valid.' }, { status: 400 });
    }

    const report = await getIncidentById(numId);
    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('[GET /api/reports/[id]]', error);
    return NextResponse.json(
      { error: 'Gagal memuat detail laporan.' },
      { status: 500 }
    );
  }
}
