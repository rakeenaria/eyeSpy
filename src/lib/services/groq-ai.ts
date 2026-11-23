import Groq from 'groq-sdk';
import type { RowDataPacket } from 'mysql2/promise';
import { getDbPool } from '@/lib/db/pool';
import { MONTH_OPTIONS } from '@/lib/format';
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
  maxTokens: number
): Promise<{ content: string; model: string } | null> {
  const groq = getGroqClient();
  if (!groq) return null;

  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.4,
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

export async function getCachedMitigationSummary(
  year: YearFilter = 'all',
  month: number | null = null
): Promise<{ content: string; model: string } | null> {
  const pool = getDbPool();
  const monthKey = month ? String(month).padStart(2, '0') : '00';
  const cacheKey = `mitigasi_v2_${year}_${monthKey}`;

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
  month: number | null = null
): Promise<{ content: string; model: string; cached: boolean }> {
  const pool = getDbPool();
  const monthKey = month ? String(month).padStart(2, '0') : '00';
  const cacheKey = `mitigasi_v2_${year}_${monthKey}`;

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
    };
  }

  const conds: string[] = [];
  const params: number[] = [];
  if (year !== 'all') {
    conds.push('YEAR(lk.waktu) = ?');
    params.push(Number(year));
  }
  if (month) {
    conds.push('MONTH(lk.waktu) = ?');
    params.push(month);
  }

  const [sampleRows] = await pool.query<RowDataPacket[]>(
    `SELECT t.nama_tempat, t.kabupaten, jk.nama_jenis, lk.waktu, lk.keterangan
     FROM laporan_kejahatan lk
     JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
     JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
     ${conds.length ? `WHERE ${conds.join(' AND ')}` : ''}
     ORDER BY lk.waktu DESC
     LIMIT 12`,
    params
  );

  const monthLabel =
    month ? MONTH_OPTIONS.find((m) => Number(m.value) === month)?.label ?? `Bulan ${month}` : 'Sepanjang Tahun';
  const periodLabel = year === 'all' ? `2024–2026 (${monthLabel})` : `${year} (${monthLabel})`;

  if (sampleRows.length === 0) {
    return {
      content: `### Ringkasan Periode ${periodLabel}\nBelum terdapat kasus terdokumentasi pada kombinasi filter tahun dan bulan ini. Ubah filter periode untuk menampilkan analisis mitigasi berbasis data riil DIY.`,
      model: 'database-summary',
      cached: false,
    };
  }

  const compactSamples = sampleRows.map((r) => ({
    lokasi: `${r.nama_tempat} (${r.kabupaten})`,
    waktu: r.waktu,
    jenis: r.nama_jenis,
    ringkas: String(r.keterangan).slice(0, 120),
  }));

  const prompt = [
    `Berikut ${compactSamples.length} kasus kriminalitas riil terverifikasi di DIY periode ${periodLabel}:`,
    JSON.stringify(compactSamples),
    '',
    'Susun analisis ringkas dalam bahasa Indonesia formal tanpa emoji dengan struktur persis:',
    '### Ringkasan Dinamika Kejahatan',
    '(1–2 paragraf singkat merangkum pola wilayah dan jenis kejahatan dominan)',
    '### Rekomendasi Mitigasi Keamanan',
    '(3 poin bernomor yang konkret bagi warga dan aparat keamanan DIY)',
  ].join('\n');

  const groqResult = await runGroqChat(
    [
      {
        role: 'system',
        content:
          'Anda adalah analis keamanan publik DIY. Tulis ringkas, faktual, tanpa emoji, memakai markdown heading ### dan daftar bernomor.',
      },
      { role: 'user', content: prompt },
    ],
    650
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

    return { content: groqResult.content, model: groqResult.model, cached: false };
  }

  const topTypes = new Map<string, number>();
  const topRegions = new Map<string, number>();
  for (const r of sampleRows) {
    topTypes.set(String(r.nama_jenis), (topTypes.get(String(r.nama_jenis)) ?? 0) + 1);
    topRegions.set(String(r.kabupaten), (topRegions.get(String(r.kabupaten)) ?? 0) + 1);
  }
  const sortedTypes = Array.from(topTypes.entries()).sort((a, b) => b[1] - a[1]);
  const sortedRegions = Array.from(topRegions.entries()).sort((a, b) => b[1] - a[1]);

  const fallbackContent = [
    `### Ringkasan Dinamika Kejahatan (${periodLabel})`,
    `Berdasarkan ${sampleRows.length} kasus riil terdokumentasi pada periode ini, kategori paling menonjol adalah **${sortedTypes[0]?.[0] ?? 'Kejahatan Jalanan'}** (${sortedTypes[0]?.[1] ?? 0} kasus) dengan sebaran tertinggi di **${sortedRegions[0]?.[0] ?? 'Sleman'}** (${sortedRegions[0]?.[1] ?? 0} kasus). Data Pusiknas Polri menunjukkan **Jalan Umum (419 kasus)** menjadi TKP paling sering terjadi tindak pidana di wilayah hukum Polda DIY.`,
    '',
    '### Rekomendasi Mitigasi Keamanan',
    '1. **Patroli Terfokus di Jalan Umum & Jam Rawan:** Optimalkan Satgas PAGAR dan patroli KRYD pada koridor utama serta rentang jam rawan sore hingga dini hari.',
    '2. **Pemanfaatan Pemantauan CCTV Publik:** Cek kondisi ruas jalan melalui katalog CCTV Jogja Istimewa dan pastikan kendaraan dikunci ganda tanpa meninggalkan kunci menancap.',
    '3. **Verifikasi Transaksi & Lapor Cepat 110:** Waspadai modus penipuan daring maupun ganjal ATM, serta laporkan potensi gangguan kamtibmas melalui Call Center 110 atau fitur pelaporan eyeSpy.',
  ].join('\n');

  return { content: fallbackContent, model: 'database-summary', cached: false };
}
