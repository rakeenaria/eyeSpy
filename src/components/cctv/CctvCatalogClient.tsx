'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Search,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatNumber } from '@/lib/format';
import type { CctvCamera, CctvCatalogResponse } from '@/types/eyespy';
import { CctvPlayer } from './CctvPlayer';
import styles from './CctvCatalogClient.module.css';

const DiyCctvMap = dynamic(
  () => import('./DiyCctvMap').then((mod) => mod.DiyCctvMap),
  {
    ssr: false,
    loading: () => (
      <div className={styles.mapPlaceholder}>
        <Skeleton width="100%" height="100%" radius={10} />
      </div>
    ),
  }
);

const PAGE_SIZE = 24;

// Client-side cache so returning to /cctv is 0ms instant
let catalogCache: CctvCatalogResponse | null = null;

export function CctvCatalogClient() {
  const [catalog, setCatalog] = useState<CctvCatalogResponse | null>(() => catalogCache);
  const [loading, setLoading] = useState<boolean>(() => !catalogCache);

  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedCamera, setSelectedCamera] = useState<CctvCamera | null>(
    () => catalogCache?.cameras.find((c) => c.connected) ?? catalogCache?.cameras[0] ?? null
  );

  useEffect(() => {
    if (catalogCache) {
      setCatalog(catalogCache);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch('/api/cctv')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: CctvCatalogResponse | null) => {
        if (!cancelled && json) {
          catalogCache = json;
          setCatalog(json);
          setSelectedCamera((prev) => prev ?? json.cameras.find((c) => c.connected) ?? json.cameras[0] ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const cameras = catalog?.cameras ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cameras.filter((cam) => {
      if (statusFilter === 'online' && !cam.connected) return false;
      if (statusFilter === 'offline' && cam.connected) return false;
      if (groupFilter !== 'all' && cam.groupName !== groupFilter) return false;
      if (!q) return true;
      return (
        cam.displayName.toLowerCase().includes(q) ||
        cam.name.toLowerCase().includes(q) ||
        cam.groupName.toLowerCase().includes(q)
      );
    });
  }, [cameras, query, statusFilter, groupFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Peta & Daftar CCTV Publik DIY"
        subtitle="Pemantauan langsung jaringan CCTV Pemkot Yogyakarta (JSS) dan titik sebaran CCTV Provinsi DIY."
        actions={
          <div className={styles.viewTabs} role="tablist" aria-label="Mode tampilan CCTV">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'map'}
              className={
                viewMode === 'map' ? `${styles.viewTab} ${styles.viewTabActive}` : styles.viewTab
              }
              onClick={() => setViewMode('map')}
            >
              <MapIcon size={14} />
              <span>Peta DIY</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'grid'}
              className={
                viewMode === 'grid' ? `${styles.viewTab} ${styles.viewTabActive}` : styles.viewTab
              }
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={14} />
              <span>Daftar Grid</span>
            </button>
          </div>
        }
      />

      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Titik Kamera di DIY</span>
          {loading ? (
            <Skeleton width={56} height={24} />
          ) : (
            <span className={styles.statValue}>{formatNumber(catalog?.totalCount ?? 0)}</span>
          )}
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Siaran Live Aktif (HLS)</span>
          {loading ? (
            <Skeleton width={56} height={24} />
          ) : (
            <span className={`${styles.statValue} ${styles.statOnline}`}>
              {formatNumber(catalog?.onlineCount ?? 0)}
            </span>
          )}
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pemeliharaan / Offline</span>
          {loading ? (
            <Skeleton width={56} height={24} />
          ) : (
            <span className={styles.statValue}>{formatNumber(catalog?.offlineCount ?? 0)}</span>
          )}
        </div>
      </div>

      {catalog?.diyPortalMaintenance ? (
        <div className={styles.notice} role="status">
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>
            <strong>{formatNumber(catalog.onlineCount)} kamera Pemkot Yogyakarta (JSS)</strong>{' '}
            aktif streaming langsung. Portal provinsi <code>cctv.jogjaprov.go.id</code> saat ini
            berstatus pemeliharaan, sehingga titik kabupaten lain tetap tampil di peta dan akan
            aktif otomatis saat portal DIY pulih.
          </span>
        </div>
      ) : null}

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Cari Tugu, Malioboro, simpang, atau kecamatan..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            aria-label="Cari kamera CCTV"
          />
        </div>

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'online' | 'offline');
            setPage(1);
          }}
          aria-label="Filter status kamera"
        >
          <option value="all">
            Semua Status {catalog ? `(${formatNumber(catalog.totalCount)})` : ''}
          </option>
          <option value="online">
            Live Aktif {catalog ? `(${formatNumber(catalog.onlineCount)})` : ''}
          </option>
          <option value="offline">
            Pemeliharaan {catalog ? `(${formatNumber(catalog.offlineCount)})` : ''}
          </option>
        </select>

        <select
          className={styles.select}
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter pengelola atau wilayah"
        >
          <option value="all">Semua Pengelola / Kecamatan</option>
          {(catalog?.groups ?? []).map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <a
          href="https://cctv.jogjakota.go.id/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.extLink}
        >
          <span>Portal Jogja</span>
          <ExternalLink size={12} />
        </a>

        <span className={styles.resultMeta}>
          {loading ? 'Memuat titik...' : `${formatNumber(filtered.length)} titik`}
        </span>
      </div>

      {viewMode === 'map' ? (
        <div className={styles.mapLayout}>
          <DiyCctvMap
            cameras={filtered}
            selectedSlug={selectedCamera?.slug ?? null}
            onSelect={(cam) => setSelectedCamera(cam)}
          />

          <Card>
            <CardHeader
              title="Pratinjau Siaran Kamera"
              description="Klik titik kamera di peta DIY untuk menonton siaran langsung."
              action={
                selectedCamera ? (
                  <Badge tone={selectedCamera.connected ? 'success' : 'danger'} withDot>
                    {selectedCamera.connected ? 'Live Aktif' : 'Pemeliharaan'}
                  </Badge>
                ) : null
              }
            />
            <CardBody padding="compact">
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Skeleton width="72%" height={18} />
                  <Skeleton width="50%" height={12} />
                  <Skeleton width="100%" height={195} radius={8} />
                  <Skeleton width="100%" height={36} radius={8} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <Skeleton width="100%" height={34} />
                    <Skeleton width="100%" height={34} />
                    <Skeleton width="100%" height={34} />
                  </div>
                </div>
              ) : selectedCamera ? (
                <>
                  <div className={styles.inspectorMeta}>
                    <h3 className={styles.inspectorTitle}>{selectedCamera.displayName}</h3>
                    <div className={styles.inspectorSub}>
                      <span>{selectedCamera.groupName}</span>
                      {selectedCamera.latitude && selectedCamera.longitude ? (
                        <span className="mono">
                          • {selectedCamera.latitude.toFixed(4)},{' '}
                          {selectedCamera.longitude.toFixed(4)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <CctvPlayer
                    key={selectedCamera.slug}
                    cameraName={selectedCamera.displayName}
                    sourceLabel={selectedCamera.sourceLabel}
                    liveUrl={selectedCamera.streamUrl}
                    connected={selectedCamera.connected}
                    compact
                  />

                  <div className={styles.inspectorFooter}>
                    <Link
                      href={`/cctv/${encodeURIComponent(selectedCamera.slug)}`}
                      className={styles.fullLink}
                    >
                      <span>Buka Layar Penuh &amp; Lapor Kejadian</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className={styles.quickList}>
                    <span className={styles.quickListLabel}>
                      Daftar Cepat ({Math.min(filtered.length, 25)} dari{' '}
                      {formatNumber(filtered.length)})
                    </span>
                    {filtered.slice(0, 25).map((cam) => (
                      <button
                        key={cam.slug}
                        type="button"
                        className={
                          selectedCamera?.slug === cam.slug
                            ? `${styles.quickItem} ${styles.quickItemActive}`
                            : styles.quickItem
                        }
                        onClick={() => setSelectedCamera(cam)}
                      >
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cam.displayName}
                        </span>
                        <Badge tone={cam.connected ? 'success' : 'neutral'}>
                          {cam.connected ? 'Live' : 'Maint.'}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Pilih salah satu pin kamera di peta untuk memuat siaran langsung.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      ) : loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.cameraCard}>
              <Skeleton width="60%" height={14} />
              <Skeleton width="90%" height={20} />
              <Skeleton width="100%" height={12} />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <h3>Tidak ada kamera yang sesuai</h3>
          <p>Ubah kata kunci pencarian atau filter status untuk melihat kamera lainnya.</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {visible.map((cam) => (
              <Link
                key={cam.slug}
                href={`/cctv/${encodeURIComponent(cam.slug)}`}
                className={styles.cameraCard}
              >
                <div className={styles.cardTop}>
                  <span className={styles.groupName} title={cam.groupName}>
                    <MapPin size={12} />
                    <span>{cam.groupName}</span>
                  </span>
                  <Badge tone={cam.connected ? 'success' : 'danger'} withDot>
                    {cam.connected ? 'Live Aktif' : 'Pemeliharaan'}
                  </Badge>
                </div>

                <h2 className={styles.camTitle}>{cam.displayName}</h2>

                <div className={styles.cardBottom}>
                  <span className="mono">
                    {cam.source === 'jogja-kota' ? 'JSS' : 'DIY'} #{cam.externalCameraId}
                  </span>
                  <span className={styles.openLabel}>
                    <span>Buka stream</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Halaman {safePage} dari {totalPages} ({formatNumber(filtered.length)} kamera)
              </span>
              <div className={styles.pageButtons}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} />
                  <span>Sebelumnya</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span>Berikutnya</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
