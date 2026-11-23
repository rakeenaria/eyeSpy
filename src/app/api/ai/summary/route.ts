import { NextResponse } from 'next/server';
import { parseMonthFilter, parseYearFilter } from '@/lib/format';
import { getMitigationSummary } from '@/lib/services/groq-ai';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseYearFilter(searchParams.get('year'));
    const month = parseMonthFilter(searchParams.get('month'));
    const summary = await getMitigationSummary(year, month);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[GET /api/ai/summary]', error);
    return NextResponse.json(
      { error: 'Gagal menyusun analisis mitigasi AI.' },
      { status: 500 }
    );
  }
}
