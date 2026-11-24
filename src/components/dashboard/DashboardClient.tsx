'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton, TableSkeletonRows } from '@/components/ui/Skeleton';
import { YEAR_OPTIONS } from '@/lib/format';
import type { DashboardAnalytics, YearFilter } from '@/types/eyespy';
import { AiChatbot } from './AiChatbot';
import { SecondaryChartsGrid, TrendChartCard } from './AnalyticsCharts';
import { HotspotTable } from './HotspotTable';
import { KpiGrid } from './KpiGrid';
import styles from './DashboardClient.module.css';

// In-memory client cache so switching back between navbar tabs is 0ms instant
const analyticsCache = new Map<YearFilter, DashboardAnalytics>();

function KpiGridSkeleton() {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 16,
        marginBottom: 20,
      }}
      aria-busy="true"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.kpiSkeletonCard}>
          <Skeleton width="62%" height={12} />
          <Skeleton width="48%" height={28} />
          <Skeleton width="84%" height={11} />
        </div>
      ))}
    </section>
  );
}

function ChartCardSkeleton({ title, height = 280 }: { title: string; height?: number }) {
  return (
    <Card>
      <CardHeader title={title} description="Memuat data dari basis data..." />
      <CardBody>
        <Skeleton width="100%" height={height} radius={8} />
      </CardBody>
    </Card>
  );
}

export function DashboardClient() {
  const [selectedYear, setSelectedYear] = useState<YearFilter>('all');
  const [data, setData] = useState<DashboardAnalytics | null>(
    () => analyticsCache.get('all') ?? null
  );
  const [loading, setLoading] = useState<boolean>(() => !analyticsCache.has('all'));

  useEffect(() => {
    const cached = analyticsCache.get(selectedYear);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/analytics?year=${encodeURIComponent(selectedYear)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: DashboardAnalytics | null) => {
        if (!cancelled && json) {
          analyticsCache.set(selectedYear, json);
          setData(json);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

  return (
    <div>
      <PageHeader
        title="Dashboard Analitik Kriminalitas DIY"
        subtitle="Data resmi Rilis Akhir Tahun Polda DIY (2023–2025), 5 Polres/Polresta DIY, dan Pusiknas Bareskrim Polri (2026 YTD)."
        actions={
          <div className={styles.segmented} role="tablist" aria-label="Filter tahun data">
            {YEAR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={selectedYear === opt.value}
                className={
                  selectedYear === opt.value
                    ? `${styles.segmentBtn} ${styles.segmentBtnActive}`
                    : styles.segmentBtn
                }
                onClick={() => setSelectedYear(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {!data ? (
        <>
          <KpiGridSkeleton />

          <section className={styles.mainRow}>
            <ChartCardSkeleton title="Perbandingan Statistik Resmi Polda DIY" height={310} />
            <AiChatbot />
          </section>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <ChartCardSkeleton title="Sebaran per Polres / Wilayah" height={230} />
            <ChartCardSkeleton title="Kategori Tindak Pidana Menonjol" height={230} />
            <ChartCardSkeleton title="Lokasi TKP Dominan (Pusiknas)" height={230} />
          </section>

          <Card>
            <CardHeader title="Rekapitulasi Resmi per Wilayah Hukum Polres / Polresta DIY" />
            <CardBody padding="flush">
              <TableSkeletonRows rows={5} cols={5} />
            </CardBody>
          </Card>
        </>
      ) : (
        <div className={loading ? styles.loadingOverlay : undefined}>
          <KpiGrid data={data} />

          <section className={styles.mainRow}>
            <TrendChartCard data={data} />
            <AiChatbot />
          </section>

          <SecondaryChartsGrid data={data} />

          <HotspotTable
            selectedYear={data.selectedYear}
            regions={data.regionDistribution}
            recentIncidents={data.recentIncidents}
          />

          <footer className={styles.sourceBanner}>
            <span>
              <strong>Sumber Resmi:</strong> Rilis Akhir Tahun Polda DIY 2024 &amp; 2025, Pusiknas
              Bareskrim Polri (Nov 2026), Polresta Yogyakarta, Polresta Sleman, Polres Bantul,
              Polres Kulon Progo, dan Polres Gunungkidul.
            </span>
            <span>
              *2026 YTD Pusiknas mencatat tindak pidana Jan–7 Nov 2026 (di luar laka lantas).
            </span>
          </footer>
        </div>
      )}
    </div>
  );
}
