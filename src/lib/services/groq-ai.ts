import Groq from 'groq-sdk';
import type { RowDataPacket } from 'mysql2/promise';
import { getDbPool } from '@/lib/db/pool';
import { MONTH_OPTIONS, formatNumber } from '@/lib/format';
import type { ChatMessage, YearFilter } from '@/types/eyespy';

const PRIMARY_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
const FALLBACK_MODEL =
  PRIMARY_MODEL === 'qwen/qwen3.8-27b' ? 'openai/gpt-oss-20b' : 'qwen/qwen3.8-27b';

function getGroqClient(): Groq | null {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey || apiKey === 'your_groq_api_key_here') return null;
  return new Groq({ apiKey });
}

interface DynamicContext {
  summaryText: string;
  stats: {
    official2024: number;
    official2025: number;
    official2026: number;
    clearance2025: number;
    documentedTotal: number;
    topRegions: { kabupaten: string; polres: string; total: number }[];
    tkpList: { lokasi: string; jumlah: number }[];
  };
}

async function fetchDatabaseContext(query: string): Promise<DynamicContext> {
  const pool = getDbPool();

  const [officialRows] = await pool.query<RowDataPacket[]>(
    `SELECT tahun, crime_total, crime_clearance, clearance_rate, crime_index, periode_label, sumber_resmi, catatan
     FROM statistik_polda_diy ORDER BY tahun ASC`
  );

  const [wilayahRows] = await pool.query<RowDataPacket[]>(
    `SELECT tahun, kabupaten, polres, total_kasus, kasus_selesai
     FROM statistik_wilayah ORDER BY tahun DESC, total_kasus DESC`
  );

  const [tkpRows] = await pool.query<RowDataPacket[]>(
    `SELECT lokasi_tkp, jumlah, sumber_resmi FROM statistik_tkp ORDER BY jumlah DESC`
  );

  const [docCountRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM laporan_kejahatan`
  );

  // Targeted retrieval matching user question terms
  const words = query
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .slice(0, 5);

  const specificCases: string[] = [];
  if (words.length > 0) {
    const clauses: string[] = [];
    const params: string[] = [];
    for (const w of words) {
      const like = `%${w}%`;
      clauses.push(
        't.nama_tempat LIKE ?',
        't.kabupaten LIKE ?',
        'jk.nama_jenis LIKE ?',
        'lk.keterangan LIKE ?'
      );
      params.push(like, like, like, like);
    }
    const [matchedRows] = await pool.query<RowDataPacket[]>(
      `SELECT t.nama_tempat, t.kabupaten, jk.nama_jenis, lk.waktu, lk.keterangan, lk.sumber_referensi
       FROM laporan_kejahatan lk
       JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
       JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
       WHERE ${clauses.join(' OR ')}
       ORDER BY lk.waktu DESC
       LIMIT 6`,
      params
    );
    for (const r of matchedRows) {
      specificCases.push(
        `- [${r.waktu}] ${r.nama_tempat} (${r.kabupaten}) | ${r.nama_jenis}: ${String(r.keterangan).slice(0, 140)} (Sumber: ${r.sumber_referensi ?? 'eyeSpy'})`
      );
    }
  }

  const officialLines = officialRows.map(
    (r) =>
      `- Tahun ${r.tahun} (${r.periode_label}): Total ${r.crime_total ?? '-'} kasus, selesai ${r.crime_clearance ?? '-'} (${r.clearance_rate ?? '-'}%) — ${r.sumber_resmi}. ${r.catatan ?? ''}`
  );

  const wilayah2025 = wilayahRows
    .filter((r) => Number(r.tahun) === 2025)
    .map(
      (r) =>
        `- ${r.polres} (${r.kabupaten}): ${r.total_kasus} kasus${r.kasus_selesai ? ` (selesai ${r.kasus_selesai})` : ''}`
    );

  const tkpLines = tkpRows.map((r) => `- ${r.lokasi_tkp}: ${r.jumlah} kasus (${r.sumber_resmi})`);

  let summaryText =
    `1. STATISTIK RESMI POLDA DIY & PUSIKNAS BARESKRIM POLRI (2023–2026 YTD):\n${officialLines.join('\n')}\n\n` +
    `2. SEBARAN WILAYAH RESMI 2025 PER POLRES/POLRESTA DIY:\n${wilayah2025.join('\n')}\n\n` +
    `3. LOKASI TKP TERBANYAK POLDA DIY (PUSIKNAS POLRI 2026):\n${tkpLines.join('\n')}\n\n` +
    `4. TOTAL LOG INSIDEN SPESIFIK TERDOKUMENTASI (2024–2026 YTD): ${docCountRows[0]?.total ?? 0} kasus terverifikasi.`;

  if (specificCases.length > 0) {
    summaryText += `\n\n5. KASUS RIIL TERDOKUMENTASI YANG RELEVAN:\n${specificCases.join('\n')}`;
  }

  const stat2024 = officialRows.find((r) => Number(r.tahun) === 2024);
  const stat2025 = officialRows.find((r) => Number(r.tahun) === 2025);
  const stat2026 = officialRows.find((r) => Number(r.tahun) === 2026);

  return {
    summaryText,
    stats: {
      official2024: Number(stat2024?.crime_total ?? 10764),
      official2025: Number(stat2025?.crime_total ?? 10768),
      official2026: Number(stat2026?.crime_total ?? 4212),
      clearance2025: Number(stat2025?.clearance_rate ?? 83.02),
      documentedTotal: Number(docCountRows[0]?.total ?? 0),
      topRegions: wilayahRows
        .filter((r) => Number(r.tahun) === 2025)
        .map((r) => ({
          kabupaten: String(r.kabupaten),
          polres: String(r.polres),
          total: Number(r.total_kasus),
        })),
      tkpList: tkpRows.map((r) => ({
        lokasi: String(r.lokasi_tkp),
        jumlah: Number(r.jumlah),
      })),
    },
  };
}

function buildLocalChatFallback(query: string, ctx: DynamicContext): string {
  const q = query.toLowerCase();
  const { stats } = ctx;

  if (q.includes('tkp') || q.includes('lokasi') || q.includes('jalan') || q.includes('rawan')) {
    const list = stats.tkpList
      .map((t, i) => `${i + 1}. **${t.lokasi}**: ${t.jumlah} kasus (Pusiknas Polri 2026)`)
      .join('\n');
    return `### Lokasi TKP Dominan Polda DIY (Pusiknas 2026)\n${list}\n\nBerdasarkan analisis Pusiknas Polri, jam paling rawan secara umum berada pada rentang **18:00–21:59 WIB** dan dini hari untuk kejahatan jalanan.`;
  }

  if (
    q.includes('sleman') ||
    q.includes('bantul') ||
    q.includes('kulon') ||
    q.includes('gunung') ||
    q.includes('wilayah')
  ) {
    const list = stats.topRegions
      .map((r, i) => `${i + 1}. **${r.polres} (${r.kabupaten})**: ${r.total.toLocaleString('id-ID')} perkara`)
      .join('\n');
    return `### Sebaran Kriminalitas per Polres DIY (Rilis Resmi 2025)\n${list}\n\nSecara regional, Polda DIY mencatat **${stats.official2025.toLocaleString('id-ID')} kasus** sepanjang 2025 dengan tingkat penyelesaian **${stats.clearance2025}%**.`;
  }

  return (
    `### Ringkasan Data Resmi Kriminalitas DIY (2024–2026)\n` +
    `- **2024 (Polda DIY):** ${stats.official2024.toLocaleString('id-ID')} kasus (puncak Agustus: 1.045, terendah November: 860).\n` +
    `- **2025 (Polda DIY):** ${stats.official2025.toLocaleString('id-ID')} kasus dengan tingkat penyelesaian **${stats.clearance2025}%**.\n` +
    `- **2026 YTD (Pusiknas Bareskrim Polri, Jan–7 Nov 2026):** **${stats.official2026.toLocaleString('id-ID')} tindak pidana** (naik 6,88% dari Sep 436 ke Okt 466 kasus).\n\n` +
    `Tanyakan perbandingan antar-Polres, lokasi TKP terbanyak, atau kasus spesifik 2024–2026.`
  );
}

async function runGroqChat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  maxTokens: number,
  temperature = 0.3
): Promise<{ content: string; model: string } | null> {
  const groq = getGroqClient();
  if (!groq) return null;

  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });
      const content = completion.choices[0]?.message?.content?.trim();
      if (content) {
        return { content, model };
      }
    } catch {
      // Fallback to secondary model
    }
  }
  return null;
}

export async function askEyeSpyAssistant(
  userMessage: string,
  history: ChatMessage[]
): Promise<{ reply: string; model: string }> {
  const ctx = await fetchDatabaseContext(userMessage);

  const systemPrompt = [
    'Anda adalah "eyeSpy AI", asisten analitik keamanan publik untuk platform eyeSpy di Daerah Istimewa Yogyakarta (DIY).',
    'Seluruh jawaban WAJIB berdasar pada data resmi & kasus terverifikasi yang diambil langsung dari database MySQL eyeSpy berikut:',
    '',
    '=== KONTEKS DATABASE EYESPY (DATA RESMI 2023–2026) ===',
    ctx.summaryText,
    '======================================================',
    '',
    'Aturan penulisan:',
    '- Gunakan bahasa Indonesia formal yang ringkas, lugas, dan objektif tanpa emoji.',
    '- Jangan mengarang angka di luar data di atas; sebutkan sumber resminya (Polda DIY / Pusiknas Bareskrim Polri / Polres terkait).',
    '- Gunakan format markdown terstruktur (heading ###, poin bernomor atau bullet, dan **tebal** untuk angka kunci).',
  ].join('\n');

  const sanitizedHistory = history
    .slice(-6)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content.trim() !== '')
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, 800),
    }));

  const groqResult = await runGroqChat(
    [{ role: 'system', content: systemPrompt }, ...sanitizedHistory, { role: 'user', content: userMessage }],
    700
  );

  if (groqResult) {
    return { reply: groqResult.content, model: groqResult.model };
  }

  return {
    reply: buildLocalChatFallback(userMessage, ctx),
    model: 'database-live-query',
  };
}

function buildMitigationCacheKey(
  year: YearFilter,
  month: number | null,
  region: string | null
): string {
  const monthKey = month ? String(month).padStart(2, '0') : '00';
  const regionKey = region
    ? region.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    : 'all';
  return `mitigasi_v4_${year}_${monthKey}_${regionKey}`;
}

export async function getCachedMitigationSummary(
  year: YearFilter = 'all',
  month: number | null = null,
  region: string | null = null
): Promise<{ content: string; model: string } | null> {
  const pool = getDbPool();
  const cacheKey = buildMitigationCacheKey(year, month, region);

  const [cacheRows] = await pool.query<RowDataPacket[]>(
    `SELECT content, model
     FROM ai_summary_cache
     WHERE cache_key = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
     LIMIT 1`,
    [cacheKey]
  );

  if (cacheRows.length > 0 && cacheRows[0].content) {
    return {
      content: String(cacheRows[0].content),
      model: String(cacheRows[0].model ?? 'cached'),
    };
  }
  return null;
}

export async function getMitigationSummary(
  year: YearFilter = 'all',
  month: number | null = null,
  region: string | null = null
): Promise<{ content: string; model: string; cached: boolean; basisLabel: string }> {
  const pool = getDbPool();
  const cleanRegion = region && region !== 'Semua Wilayah' ? region : null;
  const cacheKey = buildMitigationCacheKey(year, month, cleanRegion);

  const yearInt = year === 'all' ? null : Number(year);
  const monthLabel = month
    ? MONTH_OPTIONS.find((m) => Number(m.value) === month)?.label ?? `Bulan ${month}`
    : 'Sepanjang Tahun';
  const periodLabel = year === 'all' ? `2024–2026 YTD (${monthLabel})` : `${year} (${monthLabel})`;
  const regionScopeLabel = cleanRegion ?? 'Seluruh DIY (5 Kab/Kota)';

  const conds: string[] = [];
  const params: (string | number)[] = [];
  if (yearInt) {
    conds.push('YEAR(lk.waktu) = ?');
    params.push(yearInt);
  }
  if (month) {
    conds.push('MONTH(lk.waktu) = ?');
    params.push(month);
  }
  if (cleanRegion) {
    conds.push('t.kabupaten = ?');
    params.push(cleanRegion);
  }
  const whereSql = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(lk.id) AS total
     FROM laporan_kejahatan lk
     JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
     ${whereSql}`,
    params
  );
  const totalDocCount = Number(countRows[0]?.total ?? 0);

  const polresDisplayName =
    cleanRegion === 'Sleman'
      ? 'Polresta Sleman'
      : cleanRegion === 'Yogyakarta'
        ? 'Polresta Yogyakarta'
        : cleanRegion === 'Gunung Kidul'
          ? 'Polres Gunungkidul'
          : cleanRegion
            ? `Polres ${cleanRegion}`
            : null;
  const periodChip = `${year === 'all' ? '2024–2026 YTD' : year} · ${monthLabel}`;

  const basisLabel = polresDisplayName
    ? `Basis data: Rilis resmi ${polresDisplayName}, Polda DIY & ${totalDocCount} insiden terverifikasi (${periodChip}).`
    : `Basis data: Statistik resmi Polda DIY, 5 Polres, Pusiknas Polri & ${totalDocCount} insiden terverifikasi (${periodChip}).`;

  const [cacheRows] = await pool.query<RowDataPacket[]>(
    `SELECT content, model, created_at
     FROM ai_summary_cache
     WHERE cache_key = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
     LIMIT 1`,
    [cacheKey]
  );

  if (cacheRows.length > 0 && cacheRows[0].content) {
    return {
      content: String(cacheRows[0].content),
      model: String(cacheRows[0].model ?? 'cached'),
      cached: true,
      basisLabel,
    };
  }

  if (totalDocCount === 0 && month !== null) {
    return {
      content: `### Ringkasan Periode ${periodLabel}\nBelum terdapat arsip insiden terdokumentasi secara spesifik untuk wilayah **${regionScopeLabel}** pada bulan **${monthLabel}**. Pilih filter **Semua Bulan** untuk melihat analisis menyeluruh berbasis data resmi Polda DIY, 5 Polres, dan Pusiknas Bareskrim Polri.`,
      model: 'database-summary',
      cached: false,
      basisLabel,
    };
  }

  // Fetch FULL official Polda DIY / 5 Polres / Pusiknas stats + complete incident aggregation in parallel
  const [
    [officialRows],
    [wilayahRows],
    [kategoriRows],
    [tkpRows],
    [docByRegionRows],
    [docByTypeRows],
    [caseRows],
  ] = await Promise.all([
    pool.query<RowDataPacket[]>(
      yearInt
        ? `SELECT tahun, crime_total, crime_clearance, clearance_rate, crime_index, laka_lantas, periode_label, sumber_resmi, catatan
           FROM statistik_polda_diy WHERE tahun = ?`
        : `SELECT tahun, crime_total, crime_clearance, clearance_rate, crime_index, laka_lantas, periode_label, sumber_resmi, catatan
           FROM statistik_polda_diy WHERE tahun IN (2024, 2025, 2026) ORDER BY tahun ASC`,
      yearInt ? [yearInt] : []
    ),
    cleanRegion
      ? pool.query<RowDataPacket[]>(
          yearInt === 2024 || yearInt === 2025
            ? `SELECT tahun, kabupaten, polres, total_kasus, kasus_selesai, catatan, sumber_resmi
               FROM statistik_wilayah WHERE kabupaten = ? AND tahun = ? ORDER BY tahun ASC`
            : `SELECT tahun, kabupaten, polres, total_kasus, kasus_selesai, catatan, sumber_resmi
               FROM statistik_wilayah WHERE kabupaten = ? ORDER BY tahun ASC`,
          yearInt === 2024 || yearInt === 2025 ? [cleanRegion, yearInt] : [cleanRegion]
        )
      : pool.query<RowDataPacket[]>(
          yearInt === 2024 || yearInt === 2025
            ? `SELECT tahun, kabupaten, polres, total_kasus, kasus_selesai, catatan, sumber_resmi
               FROM statistik_wilayah WHERE tahun = ? ORDER BY total_kasus DESC`
            : `SELECT tahun, kabupaten, polres, total_kasus, kasus_selesai, catatan, sumber_resmi
               FROM statistik_wilayah WHERE tahun = 2025 ORDER BY total_kasus DESC`,
          yearInt === 2024 || yearInt === 2025 ? [yearInt] : []
        ),
    pool.query<RowDataPacket[]>(
      yearInt === 2024 || yearInt === 2025
        ? `SELECT tahun, nama_jenis, jumlah, cakupan FROM statistik_kategori WHERE tahun = ? ORDER BY jumlah DESC`
        : `SELECT tahun, nama_jenis, jumlah, cakupan FROM statistik_kategori ORDER BY tahun ASC, jumlah DESC`,
      yearInt === 2024 || yearInt === 2025 ? [yearInt] : []
    ),
    year === 'all' || year === '2026'
      ? pool.query<RowDataPacket[]>(
          `SELECT lokasi_tkp, jumlah, sumber_resmi FROM statistik_tkp ORDER BY jumlah DESC`
        )
      : Promise.resolve([[] as RowDataPacket[]]),
    pool.query<RowDataPacket[]>(
      `SELECT t.kabupaten, COUNT(lk.id) AS jml
       FROM laporan_kejahatan lk
       JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
       ${whereSql}
       GROUP BY t.kabupaten
       ORDER BY jml DESC`,
      params
    ),
    pool.query<RowDataPacket[]>(
      `SELECT jk.nama_jenis, COUNT(lk.id) AS jml
       FROM laporan_kejahatan lk
       JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
       JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
       ${whereSql}
       GROUP BY jk.id_jenis, jk.nama_jenis
       ORDER BY jml DESC`,
      params
    ),
    pool.query<RowDataPacket[]>(
      `SELECT t.nama_tempat, t.kabupaten, jk.nama_jenis, DATE_FORMAT(lk.waktu, '%Y-%m-%d') AS tgl, lk.keterangan
       FROM laporan_kejahatan lk
       JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
       JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
       ${whereSql}
       ORDER BY lk.waktu DESC
       LIMIT 25`,
      params
    ),
  ]);

  const officialText = officialRows
    .map(
      (r) =>
        `- Tahun ${r.tahun} (${r.periode_label}): Crime Total ${formatNumber(Number(r.crime_total))} kasus${r.crime_clearance ? `, selesai ${formatNumber(Number(r.crime_clearance))} (${r.clearance_rate}%)` : ''} — ${r.sumber_resmi}. ${r.catatan ?? ''}`
    )
    .join('\n');

  const wilayahSectionTitle =
    year === '2026'
      ? '=== 2. BASELINE RESMI POLRES / POLRESTA DIY (DATA FINAL 2025 — BELUM ADA RILIS AKHIR TAHUN 2026) ==='
      : cleanRegion
        ? `=== 2. STATISTIK RESMI POLRES WILAYAH ${cleanRegion.toUpperCase()} ===`
        : '=== 2. SEBARAN RESMI PER POLRES / POLRESTA DIY ===';

  const wilayahText = wilayahRows
    .map(
      (r) =>
        `- ${r.polres} (${r.kabupaten}, Tahun ${r.tahun}): ${formatNumber(Number(r.total_kasus))} perkara${r.kasus_selesai ? `, selesai ${formatNumber(Number(r.kasus_selesai))}` : ''} — ${r.catatan ?? ''}`
    )
    .join('\n');

  // Format official category numbers transparently with explicit year labels
  let kategoriText = '';
  if (yearInt === 2024 || yearInt === 2025) {
    kategoriText = kategoriRows
      .map(
        (r) =>
          `- ${r.nama_jenis} (${r.tahun}, ${r.cakupan}): ${formatNumber(Number(r.jumlah))} kasus`
      )
      .join('\n');
  } else {
    const byName = new Map<string, { y2024?: number; y2025?: number; cakupan: string }>();
    for (const r of kategoriRows) {
      const name = String(r.nama_jenis);
      const entry = byName.get(name) ?? { cakupan: String(r.cakupan) };
      if (Number(r.tahun) === 2024) entry.y2024 = Number(r.jumlah);
      if (Number(r.tahun) === 2025) entry.y2025 = Number(r.jumlah);
      byName.set(name, entry);
    }
    kategoriText = Array.from(byName.entries())
      .map(([name, info]) => {
        if (info.y2024 !== undefined && info.y2025 !== undefined) {
          const sum = info.y2024 + info.y2025;
          return `- ${name} (${info.cakupan}): ${formatNumber(info.y2024)} kasus pada 2024 dan ${formatNumber(info.y2025)} kasus pada 2025 (akumulasi 2024–2025: ${formatNumber(sum)} kasus)`;
        }
        if (info.y2025 !== undefined) {
          return `- ${name} (2025, ${info.cakupan}): ${formatNumber(info.y2025)} kasus`;
        }
        return `- ${name} (2024, ${info.cakupan}): ${formatNumber(info.y2024 ?? 0)} kasus`;
      })
      .join('\n');
  }

  const tkpBlock =
    tkpRows.length > 0
      ? [
          '',
          '=== 4. LOKASI TKP DOMINAN POLDA DIY (PUSIKNAS BARESKRIM POLRI, NOV 2026) ===',
          ...tkpRows.map(
            (r) => `- ${r.lokasi_tkp}: ${formatNumber(Number(r.jumlah))} kasus (${r.sumber_resmi})`
          ),
        ].join('\n')
      : '';

  const docRegionText = docByRegionRows
    .map((r) => `${r.kabupaten}: ${r.jml}`)
    .join(', ');

  const docTypeText = docByTypeRows
    .slice(0, 6)
    .map((r) => `${r.nama_jenis}: ${r.jml}`)
    .join(', ');

  // Build balanced incident sample (max 15) and strict whitelist of real location names
  const selectedCases = caseRows.slice(0, 15);
  const allowedLocations = Array.from(
    new Set(selectedCases.map((r) => `${r.nama_tempat} (${r.kabupaten})`))
  );

  const sampleHighlights = selectedCases
    .map(
      (r) =>
        `- [${r.tgl}] ${r.nama_tempat} (${r.kabupaten}) | ${r.nama_jenis}: ${String(r.keterangan).slice(0, 120)}`
    )
    .join('\n');

  const prompt = [
    `Susun analisis kriminalitas dan rekomendasi mitigasi keamanan untuk wilayah **${regionScopeLabel}** pada periode **${periodLabel}**.`,
    '',
    '=== 1. STATISTIK RESMI POLDA DIY & PUSIKNAS BARESKRIM POLRI ===',
    officialText || '- Data resmi skala DIY terlampir.',
    '',
    wilayahSectionTitle,
    wilayahText || '- Mengacu pada data resmi regional Polda DIY.',
    '',
    year === '2026'
      ? '=== 3. BASELINE KATEGORI TINDAK PIDANA MENONJOL RESMI (2024–2025) ==='
      : '=== 3. KATEGORI TINDAK PIDANA MENONJOL RESMI ===',
    kategoriText,
    tkpBlock,
    '',
    `=== 5. ARSIP INSIDEN SPESIFIK TERDOKUMENTASI (${totalDocCount} kasus pada filter aktif) ===`,
    `Sebaran arsip: ${docRegionText || '-'} | Kategori dominan di arsip: ${docTypeText || '-'}`,
    sampleHighlights || '- Tidak ada rincian insiden tambahan pada filter ini.',
    '',
    `=== DAFTAR LOKASI SPESIFIK YANG BOLEH DISEBUT (WHITELIST KETAT) ===`,
    allowedLocations.length > 0
      ? allowedLocations.map((loc) => `- ${loc}`).join('\n')
      : `- Hanya sebut nama kabupaten/kota: ${regionScopeLabel}`,
    '',
    'ATURAN WAJIB (WAJIB DIPATUHI 100%):',
    '1. Gunakan angka RESMI dari bagian 1–4 sebagai dasar utama perbandingan wilayah dan skala kasus. JANGAN pernah menyimpulkan peringkat wilayah tertinggi dari sampel arsip bagian 5.',
    '2. Jika menyebut angka akumulasi kategori 2024–2025 (misal Penipuan 1.616 / Narkotika 1.353), WAJIB tuliskan keterangan tahunnya secara eksplisit (misal "756 kasus pada 2024 dan 860 kasus pada 2025").',
    '3. DILARANG KERAS menyebut nama jalan, alun-alun, kecamatan, atau tempat spesifik apa pun yang TIDAK tertulis persis dalam WHITELIST di atas (contoh pelanggaran yang dilarang: mengarang nama alun-alun atau landmark di luar daftar).',
    '4. Fokuskan analisis secara tepat pada periode dan wilayah yang diminta tanpa mencampur data tahun lain yang tidak relevan.',
    '5. Tulis dalam bahasa Indonesia formal, padat, objektif, TANPA emoji, dan selesaikan setiap kalimat secara tuntas dengan format persis:',
    '### Ringkasan Dinamika Kejahatan',
    '(2 paragraf ringkas, masing-masing 2–3 kalimat faktual dengan angka kunci dicetak **tebal**)',
    '### Rekomendasi Mitigasi Keamanan',
    '(3 poin bernomor, masing-masing 1–2 kalimat konkret dan operasional untuk aparat dan warga)',
  ].join('\n');

  const groqResult = await runGroqChat(
    [
      {
        role: 'system',
        content:
          'Anda adalah analis keamanan publik resmi Daerah Istimewa Yogyakarta (DIY). Setiap angka, tahun, peringkat Polres, dan nama lokasi WAJIB 100% akurat sesuai data resmi Polda DIY, 5 Polres, Pusiknas Bareskrim Polri, dan whitelist lokasi dalam prompt. Dilarang mengarang lokasi atau angka apa pun.',
      },
      { role: 'user', content: prompt },
    ],
    1500,
    0.2
  );

  if (groqResult) {
    await pool
      .query(
        `INSERT INTO ai_summary_cache (cache_key, content, model, created_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE content = VALUES(content), model = VALUES(model), created_at = NOW()`,
        [cacheKey, groqResult.content, groqResult.model]
      )
      .catch(() => {});

    return { content: groqResult.content, model: groqResult.model, cached: false, basisLabel };
  }

  const stat2024 = officialRows.find((r) => Number(r.tahun) === 2024);
  const stat2025 = officialRows.find((r) => Number(r.tahun) === 2025);
  const stat2026 = officialRows.find((r) => Number(r.tahun) === 2026);
  const primaryWilayah = wilayahRows[wilayahRows.length - 1] ?? wilayahRows[0];
  const topPolres = cleanRegion ? primaryWilayah : wilayahRows[0];
  const topDocType = docByTypeRows[0];

  let summaryParagraph1 = '';
  if (year === '2024' && stat2024) {
    summaryParagraph1 = `Berdasarkan Rilis Akhir Tahun Polda DIY 2024, total kriminalitas di DIY tercatat **${formatNumber(Number(stat2024.crime_total))} kasus** (turun 3,22% dari 2023) dengan tingkat penyelesaian **${stat2024.clearance_rate}%** (${formatNumber(Number(stat2024.crime_clearance))} perkara selesai).`;
  } else if (year === '2025' && stat2025) {
    summaryParagraph1 = `Berdasarkan Rilis Akhir Tahun Polda DIY (30 Des 2025), total kriminalitas di DIY mencapai **${formatNumber(Number(stat2025.crime_total))} kasus** dengan peningkatan penyelesaian perkara menjadi **${stat2025.clearance_rate}%** (${formatNumber(Number(stat2025.crime_clearance))} perkara selesai).`;
  } else if (year === '2026' && stat2026) {
    summaryParagraph1 = `Berdasarkan data Pusiknas Bareskrim Polri (Jan–7 Nov 2026), wilayah hukum Polda DIY mencatat **${formatNumber(Number(stat2026.crime_total))} tindak pidana** dengan tren bulanan naik 6,88% dari September (**436 kasus**) ke Oktober (**466 kasus**).`;
  } else {
    summaryParagraph1 = `Berdasarkan data resmi Polda DIY dan Pusiknas Bareskrim Polri, kriminalitas DIY mencatat **${formatNumber(Number(stat2024?.crime_total ?? 10764))} kasus** pada 2024, **${formatNumber(Number(stat2025?.crime_total ?? 10768))} kasus** pada 2025 (penyelesaian naik menjadi **${stat2025?.clearance_rate ?? '83,02'}%**), serta **${formatNumber(Number(stat2026?.crime_total ?? 4212))} tindak pidana** sepanjang Jan–7 Nov 2026.`;
  }

  const summaryParagraph2 = cleanRegion && topPolres
    ? `Pada cakupan **${topPolres.polres} (${cleanRegion})**, data resmi ${topPolres.tahun} mencatat **${formatNumber(Number(topPolres.total_kasus))} perkara**${topPolres.kasus_selesai ? ` (${formatNumber(Number(topPolres.kasus_selesai))} selesai)` : ''}. Arsip eyeSpy merekam **${totalDocCount} insiden terverifikasi** pada filter aktif dengan kategori terbanyak **${topDocType?.nama_jenis ?? 'Kejahatan Jalanan'}**.`
    : `Secara kewilayahan, beban perkara tertinggi berada di **${topPolres?.polres ?? 'Polresta Sleman'}** (${formatNumber(Number(topPolres?.total_kasus ?? 1399))} perkara), diikuti Polresta Yogyakarta dan Polres Bantul, dengan kategori resmi tertinggi **Penipuan** (756 kasus pada 2024; 860 kasus pada 2025) dan **Narkotika** (663 kasus pada 2024; 690 kasus pada 2025).`;

  const fallbackContent = [
    `### Ringkasan Dinamika Kejahatan`,
    summaryParagraph1,
    summaryParagraph2,
    '',
    '### Rekomendasi Mitigasi Keamanan',
    `1. **Patroli Terfokus di Titik Rawan ${cleanRegion ?? 'Aglomerasi DIY'}:** Perkuat patroli malam Satgas PAGAR dan Operasi KRYD di koridor jalan utama untuk mencegah kejahatan jalanan dan pencurian kendaraan bermotor.`,
    '2. **Pemanfaatan CCTV Publik & Pengamanan Kendaraan:** Gunakan pemantauan CCTV publik sebelum melintas malam hari serta pastikan kendaraan dikunci ganda agar terhindar dari modus kunci kontak tertinggal.',
    '3. **Kewaspadaan Penipuan Daring & Pelaporan Cepat 110:** Lakukan verifikasi transaksi daring dan fasilitas ATM secara cermat, serta laporkan segera potensi gangguan kamtibmas melalui Call Center 110 atau portal pelaporan eyeSpy.',
  ].join('\n');

  return { content: fallbackContent, model: 'database-summary', cached: false, basisLabel };
}
