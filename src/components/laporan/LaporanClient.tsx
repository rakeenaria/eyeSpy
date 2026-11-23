'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { TableSkeletonRows } from '@/components/ui/Skeleton';
import {
  MONTH_OPTIONS,
  REGION_OPTIONS,
  YEAR_OPTIONS,
  formatDateShortID,
  formatDateTimeID,
} from '@/lib/format';
import type { IncidentListItem, LocationSummaryRow, YearFilter } from '@/types/eyespy';
import { AiMitigationCard } from './AiMitigationCard';
import styles from './LaporanClient.module.css';

interface ReportsBundle {
  locations: LocationSummaryRow[];
  incidents: IncidentListItem[];
}

const reportsCache = new Map<string, ReportsBundle>();
const summaryCache = new Map<string, { content: string; model: string }>();

export function LaporanClient() {
  const [viewMode, setViewMode] = useState<'incidents' | 'locations'>('incidents');
  const [year, setYear] = useState<YearFilter>('all');
  const [month, setMonth] = useState<string>('00');
  const [region, setRegion] = useState<string>('Semua Wilayah');
  const [search, setSearch] = useState('');

  const filterKey = `${year}|${month}|${region}`;
  const summaryKey = `${year}|${month}`;

  const [locations, setLocations] = useState<LocationSummaryRow[]>(
    () => reportsCache.get(filterKey)?.locations ?? []
  );
  const [incidents, setIncidents] = useState<IncidentListItem[]>(
    () => reportsCache.get(filterKey)?.incidents ?? []
  );
  const [loadingTable, setLoadingTable] = useState<boolean>(() => !reportsCache.has(filterKey));

  const [summary, setSummary] = useState<{ content: string; model: string }>(
    () => summaryCache.get(summaryKey) ?? { content: '', model: 'Groq AI' }
  );
  const [loadingSummary, setLoadingSummary] = useState<boolean>(() => !summaryCache.has(summaryKey));

  // Fetch reports bundle whenever year/month/region changes
  useEffect(() => {
    const cached = reportsCache.get(filterKey);
    if (cached) {
      setLocations(cached.locations);
      setIncidents(cached.incidents);
      setLoadingTable(false);
      return;
    }

    let cancelled = false;
    setLoadingTable(true);

    const qs = new URLSearchParams();
    qs.set('year', year);
    if (month !== '00') qs.set('month', month);
    if (region !== 'Semua Wilayah') qs.set('region', region);

    Promise.all([
      fetch(`/api/reports?view=locations&${qs.toString()}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/reports?view=incidents&${qs.toString()}`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([locData, incData]) => {
        if (cancelled) return;
        const bundle: ReportsBundle = {
          locations: locData?.locations ?? [],
          incidents: incData?.incidents ?? [],
        };
        reportsCache.set(filterKey, bundle);
        setLocations(bundle.locations);
        setIncidents(bundle.incidents);
      })
      .finally(() => {
        if (!cancelled) setLoadingTable(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterKey, year, month, region]);

  // Fetch AI mitigation summary independently (never blocks table!)
  useEffect(() => {
    const cached = summaryCache.get(summaryKey);
    if (cached) {
      setSummary(cached);
      setLoadingSummary(false);
      return;
    }

    let cancelled = false;
    setLoadingSummary(true);

    fetch(`/api/ai/summary?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.content) {
          const val = { content: d.content, model: d.model };
          summaryCache.set(summaryKey, val);
          setSummary(val);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSummary(false);
      });

    return () => {
      cancelled = true;
    };
  }, [summaryKey, year, month]);

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (r) =>
        r.namaTempat.toLowerCase().includes(q) ||
        r.kabupaten.toLowerCase().includes(q) ||
        r.jenisTerbanyak.toLowerCase().includes(q)
    );
  }, [locations, search]);

  const filteredIncidents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return incidents;
    return incidents.filter(
      (r) =>
        r.namaTempat.toLowerCase().includes(q) ||
        r.kabupaten.toLowerCase().includes(q) ||
        r.jenisKejahatan.toLowerCase().includes(q) ||
        r.keterangan.toLowerCase().includes(q)
    );
  }, [incidents, search]);

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Rekapitulasi Laporan Kejahatan DIY"
        subtitle="Arsip insiden kriminalitas riil terdokumentasi periode 2024–2026 serta laporan langsung warga melalui portal CCTV."
        actions={
          <div className={styles.tabs} role="tablist" aria-label="Mode tampilan laporan">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'incidents'}
              className={
                viewMode === 'incidents' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn
              }
              onClick={() => setViewMode('incidents')}
            >
              Log Insiden {!loadingTable ? `(${filteredIncidents.length})` : ''}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'locations'}
              className={
                viewMode === 'locations' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn
              }
              onClick={() => setViewMode('locations')}
            >
              Rekap Lokasi {!loadingTable ? `(${filteredLocations.length})` : ''}
            </button>
          </div>
        }
      />

      <AiMitigationCard
        content={summary.content}
        model={summary.model}
        loading={loadingSummary}
      />

      <div className={styles.toolbar}>
        <select
          className={styles.select}
          value={year}
          onChange={(e) => setYear(e.target.value as YearFilter)}
          aria-label="Filter tahun"
        >
          {YEAR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Tahun: {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          aria-label="Filter bulan"
        >
          {MONTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Filter kabupaten atau kota"
        >
          {REGION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Cari lokasi, kategori, atau kronologi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari laporan"
          />
        </div>
      </div>

      {viewMode === 'incidents' ? (
        <Card>
          <CardHeader
            title="Daftar Insiden Kriminalitas Riil (2024–2026)"
            description="Diurutkan dari kejadian terbaru beserta sumber referensi verifikasi."
          />
          <CardBody padding="flush">
            {loadingTable ? (
              <TableSkeletonRows rows={7} cols={6} />
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Lokasi &amp; Wilayah</th>
                      <th>Kategori</th>
                      <th>Pelapor / Sumber</th>
                      <th>Ringkasan Kronologi</th>
                      <th className={styles.alignRight}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                          Tidak ada insiden yang sesuai dengan filter saat ini.
                        </td>
                      </tr>
                    ) : (
                      filteredIncidents.map((item) => (
                        <tr key={item.id}>
                          <td className="mono" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                            {formatDateTimeID(item.waktu)}
                          </td>
                          <td className={styles.primaryCell}>
                            {item.namaTempat}
                            <span className={styles.mutedSmall}>{item.kabupaten}</span>
                          </td>
                          <td>
                            <Badge tone="neutral">{item.jenisKejahatan}</Badge>
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                              {item.pelapor === 'sistem'
                                ? 'Rilis Kepolisian'
                                : 'Laporan Warga / Media'}
                            </span>
                            {item.sumberReferensi ? (
                              <span className={styles.mutedSmall}>{item.sumberReferensi}</span>
                            ) : null}
                          </td>
                          <td className={styles.chronoCell}>
                            {item.keterangan.length > 105
                              ? `${item.keterangan.slice(0, 105)}...`
                              : item.keterangan}
                          </td>
                          <td className={styles.alignRight}>
                            <Link href={`/laporan/${item.id}`} className={styles.actionLink}>
                              <span>Detail</span>
                              <ArrowRight size={13} />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Rekapitulasi per Titik Lokasi"
            description="Agregasi jumlah insiden dan variasi tindak pidana berdasarkan lokasi kejadian."
          />
          <CardBody padding="flush">
            {loadingTable ? (
              <TableSkeletonRows rows={7} cols={6} />
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 52 }}>No</th>
                      <th>Tempat Kejadian</th>
                      <th>Jumlah Laporan</th>
                      <th>Variasi Kejahatan</th>
                      <th>Kejahatan Dominan</th>
                      <th>Kejadian Terakhir</th>
                      <th className={styles.alignRight}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLocations.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>
                          Tidak ada data lokasi untuk periode yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      filteredLocations.map((row, idx) => (
                        <tr key={row.idTempat}>
                          <td className="mono" style={{ color: 'var(--text-muted)' }}>
                            {String(idx + 1).padStart(2, '0')}
                          </td>
                          <td className={styles.primaryCell}>
                            {row.namaTempat}
                            <span className={styles.mutedSmall}>{row.kabupaten}</span>
                          </td>
                          <td className={styles.numCell}>{row.jumlahLaporan} kasus</td>
                          <td className={styles.numCell}>{row.variasiKejahatan} jenis</td>
                          <td>
                            <Badge tone="neutral">{row.jenisTerbanyak}</Badge>
                          </td>
                          <td className="mono" style={{ fontSize: 12 }}>
                            {row.laporanTerakhir ? formatDateShortID(row.laporanTerakhir) : '—'}
                          </td>
                          <td className={styles.alignRight}>
                            <Link
                              href={`/laporan/lokasi/${row.idTempat}`}
                              className={styles.actionLink}
                            >
                              <span>Rincian</span>
                              <ArrowRight size={13} />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
