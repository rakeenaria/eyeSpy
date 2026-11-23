import { unstable_cache } from 'next/cache';
import type { RowDataPacket } from 'mysql2/promise';
import { getDbPool } from '@/lib/db/pool';
import type {
  CategoryStat,
  DashboardAnalytics,
  IncidentListItem,
  OfficialAnnualStat,
  OfficialTkpStat,
  RegionStat,
  YearFilter,
} from '@/types/eyespy';

interface OfficialRow extends RowDataPacket {
  tahun: number;
  crime_total: number | null;
  crime_clearance: number | null;
  clearance_rate: number | string | null;
  crime_index: number | null;
  crime_rate: number | null;
  crime_clock: string | null;
  laka_lantas: number | null;
  periode_label: string;
  sumber_resmi: string;
  catatan: string | null;
}

async function queryDashboardAnalytics(selectedYear: YearFilter): Promise<DashboardAnalytics> {
  const pool = getDbPool();
  const yearInt = selectedYear === 'all' ? null : Number(selectedYear);
  const yearCondition = yearInt ? 'WHERE YEAR(lk.waktu) = ?' : '';
  const yearParams = yearInt ? [yearInt] : [];

  // Run ALL independent SQL queries concurrently via Promise.all
  const [
    [officialRows],
    [docCountRows],
    [docRegionRows],
    [regRows],
    [catRows],
    [tkpRows],
    [recentRows],
  ] = await Promise.all([
    pool.query<OfficialRow[]>(
      `SELECT tahun, crime_total, crime_clearance, clearance_rate, crime_index,
              crime_rate, crime_clock, laka_lantas, periode_label, sumber_resmi, catatan
       FROM statistik_polda_diy
       ORDER BY tahun ASC`
    ),
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(lk.id) AS total_doc, COUNT(DISTINCT lk.tempat_kejadian) AS total_loc
       FROM laporan_kejahatan lk
       ${yearCondition}`,
      yearParams
    ),
    pool.query<RowDataPacket[]>(
      `SELECT t.kabupaten, COUNT(lk.id) AS doc_count
       FROM tempat t
       LEFT JOIN laporan_kejahatan lk ON t.id_tempat = lk.tempat_kejadian
         ${yearInt ? 'AND YEAR(lk.waktu) = ?' : ''}
       GROUP BY t.kabupaten`,
      yearParams
    ),
    selectedYear === '2024' || selectedYear === '2025'
      ? pool.query<RowDataPacket[]>(
          `SELECT kabupaten, polres, total_kasus, kasus_selesai, catatan, sumber_resmi
           FROM statistik_wilayah
           WHERE tahun = ?
           ORDER BY total_kasus DESC`,
          [Number(selectedYear)]
        )
      : selectedYear === 'all'
        ? pool.query<RowDataPacket[]>(
            `SELECT kabupaten, MAX(polres) AS polres, SUM(total_kasus) AS total_kasus,
                    SUM(COALESCE(kasus_selesai, 0)) AS kasus_selesai
             FROM statistik_wilayah
             WHERE tahun IN (2024, 2025)
             GROUP BY kabupaten
             ORDER BY total_kasus DESC`
          )
        : Promise.resolve([[] as RowDataPacket[], []]),
    selectedYear === '2024' || selectedYear === '2025'
      ? pool.query<RowDataPacket[]>(
          `SELECT nama_jenis, jumlah, cakupan
           FROM statistik_kategori
           WHERE tahun = ?
           ORDER BY jumlah DESC`,
          [Number(selectedYear)]
        )
      : selectedYear === 'all'
        ? pool.query<RowDataPacket[]>(
            `SELECT nama_jenis, SUM(jumlah) AS jumlah, MAX(cakupan) AS cakupan
             FROM statistik_kategori
             GROUP BY nama_jenis
             ORDER BY jumlah DESC`
          )
        : pool.query<RowDataPacket[]>(
            `SELECT jk.nama_jenis, COUNT(lk.id) AS jumlah
             FROM jenis_kejahatan jk
             JOIN laporan_kejahatan lk ON jk.id_jenis = lk.jenis_kejahatan
             WHERE YEAR(lk.waktu) = 2026
             GROUP BY jk.id_jenis, jk.nama_jenis
             ORDER BY jumlah DESC
             LIMIT 6`
          ),
    pool.query<RowDataPacket[]>(
      `SELECT lokasi_tkp, jumlah, sumber_resmi
       FROM statistik_tkp
       ORDER BY jumlah DESC`
    ),
    pool.query<RowDataPacket[]>(
      `SELECT lk.id, t.id_tempat, t.nama_tempat, t.kabupaten,
              jk.nama_jenis, lk.waktu, lk.keterangan, lk.pelapor,
              lk.sumber_referensi, lk.cctv_camera_id
       FROM laporan_kejahatan lk
       JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
       JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
       ${yearCondition}
       ORDER BY lk.waktu DESC
       LIMIT 8`,
      yearParams
    ),
  ]);

  const officialStats: OfficialAnnualStat[] = officialRows.map((r) => ({
    tahun: Number(r.tahun),
    crimeTotal: r.crime_total !== null ? Number(r.crime_total) : null,
    crimeClearance: r.crime_clearance !== null ? Number(r.crime_clearance) : null,
    clearanceRate: r.clearance_rate !== null ? Number(r.clearance_rate) : null,
    crimeIndex: r.crime_index !== null ? Number(r.crime_index) : null,
    crimeRate: r.crime_rate !== null ? Number(r.crime_rate) : null,
    crimeClock: r.crime_clock ?? null,
    lakaLantas: r.laka_lantas !== null ? Number(r.laka_lantas) : null,
    periodeLabel: r.periode_label,
    sumberResmi: r.sumber_resmi,
    catatan: r.catatan ?? null,
  }));

  const activeOfficial = yearInt
    ? officialStats.find((s) => s.tahun === yearInt) ?? null
    : officialStats.find((s) => s.tahun === 2025) ?? officialStats[0] ?? null;

  const documentedTotal = Number(docCountRows[0]?.total_doc ?? 0);
  const documentedLocations = Number(docCountRows[0]?.total_loc ?? 0);

  const docRegionMap = new Map<string, number>();
  for (const r of docRegionRows) {
    docRegionMap.set(String(r.kabupaten), Number(r.doc_count ?? 0));
  }

  const polresMap: Record<string, string> = {
    Sleman: 'Polresta Sleman',
    Yogyakarta: 'Polresta Yogyakarta',
    Bantul: 'Polres Bantul',
    'Gunung Kidul': 'Polres Gunungkidul',
    'Kulon Progo': 'Polres Kulon Progo',
  };

  let regionDistribution: RegionStat[] = [];
  if (selectedYear === '2024' || selectedYear === '2025') {
    regionDistribution = regRows.map((r) => ({
      kabupaten: String(r.kabupaten),
      polres: String(r.polres),
      totalKasus: Number(r.total_kasus),
      kasusSelesai: r.kasus_selesai !== null ? Number(r.kasus_selesai) : null,
      catatan: r.catatan ? String(r.catatan) : null,
      sumberResmi: String(r.sumber_resmi),
      documentedCount: docRegionMap.get(String(r.kabupaten)) ?? 0,
    }));
  } else if (selectedYear === 'all') {
    regionDistribution = regRows.map((r) => ({
      kabupaten: String(r.kabupaten),
      polres: String(r.polres),
      totalKasus: Number(r.total_kasus),
      kasusSelesai: Number(r.kasus_selesai) > 0 ? Number(r.kasus_selesai) : null,
      catatan: 'Akumulasi data rilis resmi tahun 2024 & 2025',
      sumberResmi: 'Rilis Akhir Tahun 5 Polres/Polresta DIY (2024–2025)',
      documentedCount: docRegionMap.get(String(r.kabupaten)) ?? 0,
    }));
  } else {
    const allRegions = ['Sleman', 'Yogyakarta', 'Bantul', 'Kulon Progo', 'Gunung Kidul'];
    regionDistribution = allRegions
      .map((kab) => ({
        kabupaten: kab,
        polres: polresMap[kab] ?? kab,
        totalKasus: docRegionMap.get(kab) ?? 0,
        kasusSelesai: null,
        catatan: 'Insiden spesifik terdokumentasi YTD 2026 (rilis akhir tahun Polres terbit Des 2026)',
        sumberResmi: 'Arsip Kasus Terverifikasi 2026',
        documentedCount: docRegionMap.get(kab) ?? 0,
      }))
      .sort((a, b) => b.totalKasus - a.totalKasus);
  }

  const categoryDistribution: CategoryStat[] =
    selectedYear === '2026'
      ? catRows.map((r) => ({
          namaJenis: String(r.nama_jenis),
          jumlah: Number(r.jumlah),
          sumber: 'terdokumentasi',
          catatan: 'Kasus terdokumentasi YTD 2026',
        }))
      : catRows.map((r) => ({
          namaJenis: String(r.nama_jenis),
          jumlah: Number(r.jumlah),
          sumber: 'resmi',
          catatan:
            selectedYear === 'all'
              ? `Akumulasi rilis 2024–2025 (${String(r.cakupan)})`
              : String(r.cakupan),
        }));

  const tkpDistribution: OfficialTkpStat[] = tkpRows.map((r) => ({
    lokasiTkp: String(r.lokasi_tkp),
    jumlah: Number(r.jumlah),
    sumberResmi: String(r.sumber_resmi),
  }));

  const recentIncidents: IncidentListItem[] = recentRows.map((r) => ({
    id: Number(r.id),
    idTempat: Number(r.id_tempat),
    namaTempat: String(r.nama_tempat),
    kabupaten: String(r.kabupaten),
    jenisKejahatan: String(r.nama_jenis),
    waktu: String(r.waktu),
    keterangan: String(r.keterangan ?? ''),
    pelapor: r.pelapor === 'pengguna' ? 'pengguna' : 'sistem',
    sumberReferensi: r.sumber_referensi ? String(r.sumber_referensi) : null,
    cctvCameraId: r.cctv_camera_id ? String(r.cctv_camera_id) : null,
  }));

  const topRegion = regionDistribution[0];
  const topCategory = categoryDistribution[0];
  const topTkp = tkpDistribution[0];

  const stats2425 = officialStats.filter((s) => s.tahun === 2024 || s.tahun === 2025);
  const officialCrimeTotal =
    selectedYear === 'all'
      ? stats2425.reduce((sum, s) => sum + (s.crimeTotal ?? 0), 0)
      : activeOfficial?.crimeTotal ?? null;

  const officialClearanceCount =
    selectedYear === 'all'
      ? stats2425.reduce((sum, s) => sum + (s.crimeClearance ?? 0), 0)
      : activeOfficial?.crimeClearance ?? null;

  const officialClearanceRate =
    selectedYear === 'all' && officialCrimeTotal && officialClearanceCount
      ? Number(((officialClearanceCount / officialCrimeTotal) * 100).toFixed(2))
      : activeOfficial?.clearanceRate ?? null;

  return {
    selectedYear,
    officialStats,
    activeOfficial,
    kpi: {
      officialCrimeTotal,
      officialClearanceRate,
      officialClearanceCount,
      documentedTotal,
      documentedLocations,
      topRegionName: topRegion?.kabupaten ?? 'Sleman',
      topRegionPolres: topRegion?.polres ?? 'Polresta Sleman',
      topRegionCount: topRegion?.totalKasus ?? 0,
      topCategoryName: topCategory?.namaJenis ?? 'Penipuan',
      topCategoryCount: topCategory?.jumlah ?? 0,
      topCategoryScope: topCategory?.catatan ?? 'Polda DIY',
      topTkpName: topTkp?.lokasiTkp ?? 'Jalan Umum',
      topTkpCount: topTkp?.jumlah ?? 419,
    },
    regionDistribution,
    categoryDistribution,
    tkpDistribution,
    recentIncidents,
  };
}

export const getDashboardAnalytics = unstable_cache(
  async (selectedYear: YearFilter = 'all') => queryDashboardAnalytics(selectedYear),
  ['eyespy-dashboard-analytics'],
  { revalidate: 120, tags: ['eyespy-analytics'] }
);
