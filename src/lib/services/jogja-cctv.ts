import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { getDbPool } from '@/lib/db/pool';
import type { CctvCamera, CctvCatalogResponse } from '@/types/eyespy';

const SOURCE_JOGJA_KOTA = 'jogja-kota';
const SOURCE_JOGJA_DIY = 'jogja-istimewa';

const JOGJA_KOTA_API_URL = 'https://cctv.jogjakota.go.id/home/getdata';
const JOGJA_DIY_API_URL =
  'https://cctv.jogjaprov.go.id/api/v1/location-pins?fields%5Blocation-pins%5D=name,alias_name,stream_url,lat,lng,group_name,visible,connected';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes SWR window

const globalForSync = globalThis as unknown as {
  cctvBgSyncPromise?: Promise<void> | null;
};

interface RawNormalizedCamera {
  source: string;
  externalCameraId: string;
  name: string;
  aliasName: string | null;
  streamUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  groupName: string | null;
  visible: number;
  connected: number;
}

function limitText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value).trim().slice(0, maxLen);
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes'].includes(String(value ?? '').toLowerCase());
}

function normalizeHlsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  if (!url || url.length > 2048 || /[\x00-\x1F\x7F]/.test(url)) return null;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password ||
      !/\.m3u8(?:$|[?#])/i.test(url)
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function normalizeCoordinate(value: unknown, min: number, max: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < min || num > max) return null;
  return num.toFixed(8);
}

async function isStorageReady(): Promise<boolean> {
  const pool = getDbPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS table_count
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME IN ('cctv_camera', 'cctv_sync_state')`
  );
  return Number(rows[0]?.table_count ?? 0) === 2;
}

async function getSyncState(source: string): Promise<{
  lastSuccess: string | null;
  lastError: string | null;
  lastErrorMessage: string | null;
}> {
  const pool = getDbPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT last_successful_sync_at, last_error_at, last_error_message
     FROM cctv_sync_state WHERE source = ? LIMIT 1`,
    [source]
  );
  return {
    lastSuccess: rows[0]?.last_successful_sync_at ? String(rows[0].last_successful_sync_at) : null,
    lastError: rows[0]?.last_error_at ? String(rows[0].last_error_at) : null,
    lastErrorMessage: rows[0]?.last_error_message ? String(rows[0].last_error_message) : null,
  };
}

function isTimestampFresh(ts: string | null): boolean {
  if (!ts) return false;
  const normalized = ts.includes('T') ? ts : ts.replace(' ', 'T');
  const t = new Date(normalized).getTime();
  return !Number.isNaN(t) && Date.now() - t < CACHE_TTL_MS;
}

async function fetchJogjaKotaCameras(): Promise<RawNormalizedCamera[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(JOGJA_KOTA_API_URL, {
      headers: {
        'User-Agent': 'EyeSpy CCTV Sync/2.0',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: 'https://cctv.jogjakota.go.id/',
      },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`JogjaKota HTTP ${res.status}`);
    const payload = (await res.json()) as unknown[];
    if (!Array.isArray(payload)) throw new Error('Invalid JogjaKota payload');

    const cameras: RawNormalizedCamera[] = [];
    for (const raw of payload) {
      if (!raw || typeof raw !== 'object') continue;
      const item = raw as Record<string, unknown>;
      const externalCameraId = limitText(item.cctv_id, 64);
      const title = limitText(item.cctv_title, 255);
      const streamUrl = normalizeHlsUrl(item.cctv_link);
      if (!externalCameraId || !title || !streamUrl) continue;

      const kec = limitText(item.kecamatan_nama, 100);
      const groupName = kec
        ? `Pemkot Yogyakarta • ${toTitleCase(kec)}`
        : 'Pemkot Yogyakarta (JSS)';

      // cctv_status "0" on cctv.jogjakota.go.id indicates active public feed
      const isMaintenance = String(item.cctv_status ?? '0') === '2';

      cameras.push({
        source: SOURCE_JOGJA_KOTA,
        externalCameraId,
        name: title,
        aliasName: title,
        streamUrl,
        latitude: normalizeCoordinate(item.cctv_latitude, -8.3, -7.4),
        longitude: normalizeCoordinate(item.cctv_longitude, 109.9, 110.9),
        groupName,
        visible: 1,
        connected: isMaintenance ? 0 : 1,
      });
    }

    if (cameras.length === 0) throw new Error('Empty JogjaKota camera list');
    return cameras;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJogjaDiyCameras(): Promise<RawNormalizedCamera[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(JOGJA_DIY_API_URL, {
      headers: {
        Accept: 'application/vnd.api+json, application/json',
        'User-Agent': 'EyeSpy CCTV Sync/2.0',
      },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`JogjaProv HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (!ct.toLowerCase().includes('json')) {
      throw new Error('JogjaProv returned non-JSON (maintenance)');
    }
    const payload = (await res.json()) as { data?: unknown[] };
    if (!payload || !Array.isArray(payload.data)) {
      throw new Error('Invalid JogjaProv JSON:API payload');
    }

    const cameras: RawNormalizedCamera[] = [];
    for (const item of payload.data) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as { id?: unknown; attributes?: Record<string, unknown> };
      const attrs = rec.attributes;
      if (!attrs || typeof attrs !== 'object') continue;

      const externalCameraId = limitText(rec.id, 64);
      const name = limitText(attrs.name, 255);
      const aliasName = limitText(attrs.alias_name, 255);
      if (!externalCameraId || (!name && !aliasName)) continue;

      cameras.push({
        source: SOURCE_JOGJA_DIY,
        externalCameraId,
        name: name || aliasName,
        aliasName: aliasName || null,
        streamUrl: normalizeHlsUrl(attrs.stream_url),
        latitude: normalizeCoordinate(attrs.lat, -90, 90),
        longitude: normalizeCoordinate(attrs.lng, -180, 180),
        groupName: limitText(attrs.group_name, 255) || 'CCTV Jogja Istimewa',
        visible: toBoolean(attrs.visible) ? 1 : 0,
        connected: toBoolean(attrs.connected) ? 1 : 0,
      });
    }

    if (cameras.length === 0) throw new Error('Empty JogjaProv list');
    return cameras;
  } finally {
    clearTimeout(timeout);
  }
}

async function upsertSourceCameras(
  conn: PoolConnection,
  source: string,
  cameras: RawNormalizedCamera[]
): Promise<void> {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await conn.beginTransaction();
  try {
    await conn.query('UPDATE cctv_camera SET source_active = 0 WHERE source = ?', [source]);

    const chunkSize = 200;
    for (let i = 0; i < cameras.length; i += chunkSize) {
      const chunk = cameras.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)').join(', ');
      const values: (string | number | null)[] = [];
      for (const cam of chunk) {
        values.push(
          source,
          cam.externalCameraId,
          cam.name,
          cam.aliasName,
          cam.streamUrl,
          cam.latitude,
          cam.longitude,
          cam.groupName,
          cam.visible,
          cam.connected,
          now
        );
      }
      await conn.query(
        `INSERT INTO cctv_camera
          (source, external_camera_id, name, alias_name, stream_url, latitude, longitude,
           group_name, visible, connected, source_active, last_metadata_sync_at)
         VALUES ${placeholders}
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           alias_name = VALUES(alias_name),
           stream_url = VALUES(stream_url),
           latitude = VALUES(latitude),
           longitude = VALUES(longitude),
           group_name = VALUES(group_name),
           visible = VALUES(visible),
           connected = VALUES(connected),
           source_active = 1,
           last_metadata_sync_at = VALUES(last_metadata_sync_at)`,
        values
      );
    }

    await conn.query(
      `INSERT INTO cctv_sync_state
         (source, last_successful_sync_at, last_attempt_at, last_error_at, last_error_message)
       VALUES (?, ?, ?, NULL, NULL)
       ON DUPLICATE KEY UPDATE
         last_successful_sync_at = VALUES(last_successful_sync_at),
         last_attempt_at = VALUES(last_attempt_at),
         last_error_at = NULL,
         last_error_message = NULL`,
      [source, now, now]
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  }
}

async function markSourceMaintenance(source: string, message: string): Promise<void> {
  const pool = getDbPool();
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  // Mark cached DIY proxy cameras as offline/maintenance while preserving their coordinates on the map
  await pool
    .query('UPDATE cctv_camera SET connected = 0 WHERE source = ?', [source])
    .catch(() => {});
  await pool
    .query(
      `INSERT INTO cctv_sync_state
         (source, last_successful_sync_at, last_attempt_at, last_error_at, last_error_message)
       VALUES (?, NULL, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         last_attempt_at = VALUES(last_attempt_at),
         last_error_at = VALUES(last_error_at),
         last_error_message = VALUES(last_error_message)`,
      [source, now, now, message.slice(0, 250)]
    )
    .catch(() => {});
}

export async function syncAllCctvSourcesNow(): Promise<void> {
  const pool = getDbPool();

  // 1. Sync Pemkot Yogyakarta (145 active 1080p HLS streams)
  try {
    const kotaCameras = await fetchJogjaKotaCameras();
    const conn = await pool.getConnection();
    try {
      await upsertSourceCameras(conn, SOURCE_JOGJA_KOTA, kotaCameras);
    } finally {
      conn.release();
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sync JogjaKota gagal';
    await markSourceMaintenance(SOURCE_JOGJA_KOTA, msg);
  }

  // 2. Sync Pemda DIY (543 regional cameras — gracefully mark offline when portal is 503 maintenance)
  try {
    const diyCameras = await fetchJogjaDiyCameras();
    const conn = await pool.getConnection();
    try {
      await upsertSourceCameras(conn, SOURCE_JOGJA_DIY, diyCameras);
    } finally {
      conn.release();
    }
  } catch {
    await markSourceMaintenance(
      SOURCE_JOGJA_DIY,
      'Portal cctv.jogjaprov.go.id sedang dalam pemeliharaan.'
    );
  }
}

function triggerBackgroundSync(): void {
  if (globalForSync.cctvBgSyncPromise) return;
  globalForSync.cctvBgSyncPromise = syncAllCctvSourcesNow().finally(() => {
    globalForSync.cctvBgSyncPromise = null;
  });
}

function mapCameraRow(row: RowDataPacket): CctvCamera {
  const source = String(row.source);
  const externalCameraId = String(row.external_camera_id);
  const name = String(row.name ?? '');
  const aliasName = row.alias_name ? String(row.alias_name) : null;
  return {
    slug: `${source}--${externalCameraId}`,
    source,
    sourceLabel:
      source === SOURCE_JOGJA_KOTA ? 'Pemkot Yogyakarta (JSS)' : 'Portal CCTV Pemda DIY',
    externalCameraId,
    name,
    aliasName,
    displayName: aliasName || name,
    streamUrl: row.stream_url ? String(row.stream_url) : null,
    latitude: row.latitude !== null ? Number(row.latitude) : null,
    longitude: row.longitude !== null ? Number(row.longitude) : null,
    groupName: row.group_name ? String(row.group_name) : 'CCTV DIY',
    visible: Boolean(row.visible),
    connected: Boolean(row.connected),
    lastMetadataSyncAt: row.last_metadata_sync_at ? String(row.last_metadata_sync_at) : null,
  };
}

export async function listPublicCctvCameras(): Promise<CctvCatalogResponse> {
  if (!(await isStorageReady())) {
    return {
      cameras: [],
      totalCount: 0,
      onlineCount: 0,
      offlineCount: 0,
      groups: [],
      storageReady: false,
      syncError: false,
      diyPortalMaintenance: false,
      lastSyncedAt: null,
    };
  }

  const pool = getDbPool();

  // Check if Jogja Kota live cameras have been seeded at least once
  const [[kotaCountRow], kotaState, diyState] = await Promise.all([
    pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS cnt FROM cctv_camera WHERE source = ? AND source_active = 1',
      [SOURCE_JOGJA_KOTA]
    ),
    getSyncState(SOURCE_JOGJA_KOTA),
    getSyncState(SOURCE_JOGJA_DIY),
  ]);

  const hasKotaCached = Number(kotaCountRow[0]?.cnt ?? 0) > 0;

  if (!hasKotaCached) {
    // One-time initial sync (~600ms) so 145 live feeds populate immediately
    await syncAllCctvSourcesNow();
  } else if (!isTimestampFresh(kotaState.lastSuccess)) {
    // Non-blocking SWR refresh in background -> 0ms SSR blocking!
    triggerBackgroundSync();
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT source, external_camera_id, name, alias_name, stream_url, latitude, longitude,
            group_name, visible, connected, last_metadata_sync_at
     FROM cctv_camera
     WHERE source IN (?, ?)
       AND source_active = 1
       AND visible = 1
       AND stream_url IS NOT NULL
       AND stream_url <> ''
     ORDER BY connected DESC,
              CASE WHEN source = ? THEN 0 ELSE 1 END ASC,
              COALESCE(NULLIF(alias_name, ''), name) ASC`,
    [SOURCE_JOGJA_KOTA, SOURCE_JOGJA_DIY, SOURCE_JOGJA_KOTA]
  );

  const cameras = rows.map(mapCameraRow);
  const onlineCount = cameras.filter((c) => c.connected).length;
  const groups = Array.from(new Set(cameras.map((c) => c.groupName))).sort((a, b) =>
    a.localeCompare(b, 'id')
  );

  const freshKotaState = hasKotaCached ? kotaState : await getSyncState(SOURCE_JOGJA_KOTA);
  const freshDiyState = hasKotaCached ? diyState : await getSyncState(SOURCE_JOGJA_DIY);
  const diyPortalMaintenance =
    Boolean(freshDiyState.lastError) &&
    cameras.some((c) => c.source === SOURCE_JOGJA_DIY && !c.connected);

  return {
    cameras,
    totalCount: cameras.length,
    onlineCount,
    offlineCount: cameras.length - onlineCount,
    groups,
    storageReady: true,
    syncError: Boolean(freshKotaState.lastError && onlineCount === 0),
    diyPortalMaintenance,
    lastSyncedAt: freshKotaState.lastSuccess || freshDiyState.lastSuccess,
  };
}

export async function findPublicCctvCamera(idOrSlug: string): Promise<{
  camera: CctvCamera | null;
  nearbyLive: CctvCamera[];
  storageReady: boolean;
}> {
  if (!(await isStorageReady())) {
    return { camera: null, nearbyLive: [], storageReady: false };
  }

  let source: string | null = null;
  let externalCameraId = idOrSlug;

  if (idOrSlug.includes('--')) {
    const [srcPart, idPart] = idOrSlug.split('--', 2);
    if ((srcPart === SOURCE_JOGJA_KOTA || srcPart === SOURCE_JOGJA_DIY) && idPart) {
      source = srcPart;
      externalCameraId = idPart;
    }
  }

  if (!/^[A-Za-z0-9_-]{1,64}$/.test(externalCameraId)) {
    return { camera: null, nearbyLive: [], storageReady: true };
  }

  const pool = getDbPool();
  const [rows, liveRows] = await Promise.all([
    source
      ? pool.query<RowDataPacket[]>(
          `SELECT source, external_camera_id, name, alias_name, stream_url, latitude, longitude,
                  group_name, visible, connected, last_metadata_sync_at
           FROM cctv_camera
           WHERE source = ? AND external_camera_id = ? AND source_active = 1 AND visible = 1
           LIMIT 1`,
          [source, externalCameraId]
        )
      : pool.query<RowDataPacket[]>(
          `SELECT source, external_camera_id, name, alias_name, stream_url, latitude, longitude,
                  group_name, visible, connected, last_metadata_sync_at
           FROM cctv_camera
           WHERE external_camera_id = ? AND source_active = 1 AND visible = 1
           ORDER BY connected DESC, CASE WHEN source = ? THEN 0 ELSE 1 END ASC
           LIMIT 1`,
          [externalCameraId, SOURCE_JOGJA_KOTA]
        ),
    pool.query<RowDataPacket[]>(
      `SELECT source, external_camera_id, name, alias_name, stream_url, latitude, longitude,
              group_name, visible, connected, last_metadata_sync_at
       FROM cctv_camera
       WHERE source = ? AND source_active = 1 AND visible = 1 AND connected = 1
       ORDER BY name ASC
       LIMIT 6`,
      [SOURCE_JOGJA_KOTA]
    ),
  ]);

  const camera = rows[0].length ? mapCameraRow(rows[0][0]) : null;
  const nearbyLive = liveRows[0].map(mapCameraRow);

  return { camera, nearbyLive, storageReady: true };
}
