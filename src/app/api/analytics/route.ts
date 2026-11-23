import { NextResponse } from 'next/server';
import { parseYearFilter } from '@/lib/format';
import { getDashboardAnalytics } from '@/lib/services/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseYearFilter(searchParams.get('year'));
    const data = await getDashboardAnalytics(year);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/analytics]', error);
    return NextResponse.json(
      { error: 'Gagal memuat data analitik kriminalitas dari database.' },
      { status: 500 }
    );
  }
}
