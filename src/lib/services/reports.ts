import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getDbPool } from '@/lib/db/pool';
import type {
  CrimeTypeOption,
  IncidentDetail,
  IncidentListItem,
  LocationOption,
  LocationSummaryRow,
  YearFilter,
} from '@/types/eyespy';

export interface ReportFilterOptions {
  year?: YearFilter;
  month?: number | null;
  region?: string | null;
  search?: string | null;
}

export async function getLocationSummaries(
  filters: ReportFilterOptions = {}
): Promise<LocationSummaryRow[]> {
  const pool = getDbPool();
  const yearInt = filters.year && filters.year !== 'all' ? Number(filters.year) : null;
  const monthInt = filters.month ?? null;
  const region =
    filters.region && filters.region !== 'Semua Wilayah' ? filters.region : null;

  const joinConds: string[] = ['t.id_tempat = lk.tempat_kejadian'];
  const subConds: string[] = ['lk2.tempat_kejadian = t.id_tempat'];
  const params: (string | number)[] = [];
  const joinParams: (string | number)[] = [];
  const whereConds: string[] = [];
  const whereParams: (string | number)[] = [];

  if (yearInt) {
    subConds.push('YEAR(lk2.waktu) = ?');
    params.push(yearInt);
    joinConds.push('YEAR(lk.waktu) = ?');
    joinParams.push(yearInt);
  }

  if (monthInt) {
    subConds.push('MONTH(lk2.waktu) = ?');
    params.push(monthInt);
    joinConds.push('MONTH(lk.waktu) = ?');
    joinParams.push(monthInt);
  }

  if (region) {
    whereConds.push('t.kabupaten = ?');
    whereParams.push(region);
  }

  const sql = `
    SELECT
      t.id_tempat,
      t.nama_tempat,
      t.kabupaten,
      COUNT(lk.id) AS jumlah_laporan,
      COUNT(DISTINCT lk.jenis_kejahatan) AS variasi_kejahatan,
      MAX(lk.waktu) AS laporan_terakhir,
      (
        SELECT jk.nama_jenis
        FROM laporan_kejahatan lk2
        JOIN jenis_kejahatan jk ON lk2.jenis_kejahatan = jk.id_jenis
        WHERE ${subConds.join(' AND ')}
        GROUP BY lk2.jenis_kejahatan, jk.nama_jenis
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) AS jenis_terbanyak
    FROM tempat t
    LEFT JOIN laporan_kejahatan lk ON ${joinConds.join(' AND ')}
    ${whereConds.length ? `WHERE ${whereConds.join(' AND ')}` : ''}
    GROUP BY t.id_tempat, t.nama_tempat, t.kabupaten
    HAVING jumlah_laporan > 0
    ORDER BY jumlah_laporan DESC, laporan_terakhir DESC, t.nama_tempat ASC
  `;

  const [rows] = await pool.query<RowDataPacket[]>(sql, [
    ...params,
    ...joinParams,
    ...whereParams,
  ]);

  let result: LocationSummaryRow[] = rows.map((r) => ({
    idTempat: Number(r.id_tempat),
    namaTempat: String(r.nama_tempat),
    kabupaten: String(r.kabupaten),
    jumlahLaporan: Number(r.jumlah_laporan),
    variasiKejahatan: Number(r.variasi_kejahatan),
    jenisTerbanyak: r.jenis_terbanyak ? String(r.jenis_terbanyak) : '—',
    laporanTerakhir: r.laporan_terakhir ? String(r.laporan_terakhir) : null,
  }));

  if (filters.search && filters.search.trim() !== '') {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (r) =>
        r.namaTempat.toLowerCase().includes(q) ||
        r.kabupaten.toLowerCase().includes(q) ||
        r.jenisTerbanyak.toLowerCase().includes(q)
    );
  }

  return result;
}

export async function getAllIncidents(
  filters: ReportFilterOptions = {}
): Promise<IncidentListItem[]> {
  const pool = getDbPool();
  const conds: string[] = [];
  const params: (string | number)[] = [];

  if (filters.year && filters.year !== 'all') {
    conds.push('YEAR(lk.waktu) = ?');
    params.push(Number(filters.year));
  }
  if (filters.month) {
    conds.push('MONTH(lk.waktu) = ?');
    params.push(filters.month);
  }
  if (filters.region && filters.region !== 'Semua Wilayah') {
    conds.push('t.kabupaten = ?');
    params.push(filters.region);
  }
  if (filters.search && filters.search.trim() !== '') {
    const pattern = `%${filters.search.trim()}%`;
    conds.push(
      '(t.nama_tempat LIKE ? OR t.kabupaten LIKE ? OR jk.nama_jenis LIKE ? OR lk.keterangan LIKE ?)'
    );
    params.push(pattern, pattern, pattern, pattern);
  }

  const whereSql = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT lk.id, t.id_tempat, t.nama_tempat, t.kabupaten,
            jk.nama_jenis, lk.waktu, lk.keterangan, lk.pelapor,
            lk.sumber_referensi, lk.cctv_camera_id
     FROM laporan_kejahatan lk
     JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
     JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
     ${whereSql}
     ORDER BY lk.waktu DESC`,
    params
  );

  return rows.map((r) => ({
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
}

export async function getLocationWithIncidents(
  idTempat: number,
  filters: { year?: YearFilter; month?: number | null } = {}
): Promise<{
  location: LocationOption | null;
  incidents: IncidentListItem[];
}> {
  const pool = getDbPool();
  const [locRows] = await pool.query<RowDataPacket[]>(
    'SELECT id_tempat, nama_tempat, kabupaten FROM tempat WHERE id_tempat = ? LIMIT 1',
    [idTempat]
  );

  if (!locRows.length) {
    return { location: null, incidents: [] };
  }

  const location: LocationOption = {
    idTempat: Number(locRows[0].id_tempat),
    namaTempat: String(locRows[0].nama_tempat),
    kabupaten: String(locRows[0].kabupaten),
  };

  const conds: string[] = ['lk.tempat_kejadian = ?'];
  const params: (string | number)[] = [idTempat];

  if (filters.year && filters.year !== 'all') {
    conds.push('YEAR(lk.waktu) = ?');
    params.push(Number(filters.year));
  }
  if (filters.month) {
    conds.push('MONTH(lk.waktu) = ?');
    params.push(filters.month);
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT lk.id, t.id_tempat, t.nama_tempat, t.kabupaten,
            jk.nama_jenis, lk.waktu, lk.keterangan, lk.pelapor,
            lk.sumber_referensi, lk.cctv_camera_id
     FROM laporan_kejahatan lk
     JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
     JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
     WHERE ${conds.join(' AND ')}
     ORDER BY lk.waktu DESC`,
    params
  );

  const incidents: IncidentListItem[] = rows.map((r) => ({
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

  return { location, incidents };
}

export async function getIncidentById(id: number): Promise<IncidentDetail | null> {
  const pool = getDbPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT lk.id, t.id_tempat, t.nama_tempat, t.kabupaten, t.gambar,
            jk.nama_jenis, lk.waktu, lk.keterangan, lk.pelapor,
            lk.sumber_referensi, lk.cctv_camera_id
     FROM laporan_kejahatan lk
     JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
     JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
     WHERE lk.id = ?
     LIMIT 1`,
    [id]
  );

  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: Number(r.id),
    idTempat: Number(r.id_tempat),
    namaTempat: String(r.nama_tempat),
    kabupaten: String(r.kabupaten),
    gambarTempat: r.gambar ? String(r.gambar) : '/images/footage.webp',
    jenisKejahatan: String(r.nama_jenis),
    waktu: String(r.waktu),
    keterangan: String(r.keterangan ?? ''),
    pelapor: r.pelapor === 'pengguna' ? 'pengguna' : 'sistem',
    sumberReferensi: r.sumber_referensi ? String(r.sumber_referensi) : null,
    cctvCameraId: r.cctv_camera_id ? String(r.cctv_camera_id) : null,
  };
}

export async function getCrimeTypeOptions(): Promise<CrimeTypeOption[]> {
  const pool = getDbPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id_jenis, nama_jenis FROM jenis_kejahatan ORDER BY nama_jenis ASC'
  );
  return rows.map((r) => ({
    idJenis: Number(r.id_jenis),
    namaJenis: String(r.nama_jenis),
  }));
}

export async function getLocationOptions(): Promise<LocationOption[]> {
  const pool = getDbPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id_tempat, nama_tempat, kabupaten FROM tempat ORDER BY kabupaten ASC, nama_tempat ASC'
  );
  return rows.map((r) => ({
    idTempat: Number(r.id_tempat),
    namaTempat: String(r.nama_tempat),
    kabupaten: String(r.kabupaten),
  }));
}

export interface CreateCitizenReportInput {
  idJenis: number;
  idTempat?: number;
  keterangan: string;
  cctvCameraId?: string | null;
  cctvCameraName?: string | null;
  cctvGroupName?: string | null;
}

export async function createCitizenReport(
  input: CreateCitizenReportInput
): Promise<{ id: number; idTempat: number }> {
  const pool = getDbPool();
  let resolvedTempatId = input.idTempat;

  // If reported from a CCTV page without explicit tempat ID, infer closest kabupaten/location
  if (!resolvedTempatId) {
    const groupText = `${input.cctvGroupName ?? ''} ${input.cctvCameraName ?? ''}`.toLowerCase();
    let kab = 'Yogyakarta';
    if (groupText.includes('sleman')) kab = 'Sleman';
    else if (groupText.includes('bantul')) kab = 'Bantul';
    else if (groupText.includes('kulon')) kab = 'Kulon Progo';
    else if (groupText.includes('gunung')) kab = 'Gunung Kidul';

    const [fallbackRows] = await pool.query<RowDataPacket[]>(
      'SELECT id_tempat FROM tempat WHERE kabupaten = ? ORDER BY id_tempat ASC LIMIT 1',
      [kab]
    );
    resolvedTempatId = Number(fallbackRows[0]?.id_tempat ?? 1);
  }

  const cameraContext = input.cctvCameraName
    ? `[CCTV: ${input.cctvCameraName}] ${input.keterangan.trim()}`
    : input.keterangan.trim();

  const [res] = await pool.query<ResultSetHeader>(
    `INSERT INTO laporan_kejahatan
      (jenis_kejahatan, tempat_kejadian, waktu, keterangan, pelapor, sumber_referensi, cctv_camera_id)
     VALUES (?, ?, NOW(), ?, 'pengguna', ?, ?)`,
    [
      input.idJenis,
      resolvedTempatId,
      cameraContext,
      input.cctvCameraId
        ? `Laporan Masyarakat via CCTV #${input.cctvCameraId}`
        : 'Laporan Masyarakat (Portal eyeSpy)',
      input.cctvCameraId ?? null,
    ]
  );

  // Invalidate cached AI summaries so new citizen reports are reflected immediately
  await pool.query('DELETE FROM ai_summary_cache').catch(() => {});

  return { id: Number(res.insertId), idTempat: resolvedTempatId };
}
