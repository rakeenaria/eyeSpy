import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseMonthFilter, parseYearFilter } from '@/lib/format';
import {
  createCitizenReport,
  getAllIncidents,
  getLocationSummaries,
} from '@/lib/services/reports';

export const dynamic = 'force-dynamic';

const createReportSchema = z.object({
  idJenis: z.coerce.number().int().min(1).max(100),
  idTempat: z.coerce.number().int().min(1).optional(),
  keterangan: z
    .string()
    .trim()
    .min(10, 'Keterangan kejadian minimal 10 karakter.')
    .max(2000, 'Keterangan maksimal 2.000 karakter.'),
  cctvCameraId: z.string().trim().max(64).optional().nullable(),
  cctvCameraName: z.string().trim().max(255).optional().nullable(),
  cctvGroupName: z.string().trim().max(255).optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'locations';
    const year = parseYearFilter(searchParams.get('year'));
    const month = parseMonthFilter(searchParams.get('month'));
    const region = searchParams.get('region');
    const search = searchParams.get('q');

    if (view === 'incidents') {
      const incidents = await getAllIncidents({ year, month, region, search });
      return NextResponse.json({ incidents });
    }

    const locations = await getLocationSummaries({ year, month, region, search });
    return NextResponse.json({ locations });
  } catch (error) {
    console.error('[GET /api/reports]', error);
    return NextResponse.json(
      { error: 'Gagal memuat data laporan kejahatan.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || 'Data laporan tidak valid.';
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const created = await createCitizenReport(parsed.data);
    revalidateTag('eyespy-analytics');
    return NextResponse.json(
      {
        status: 'ok',
        id: created.id,
        idTempat: created.idTempat,
        message: 'Laporan kejadian berhasil dicatat ke database eyeSpy.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/reports]', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan laporan kejahatan.' },
      { status: 500 }
    );
  }
}
