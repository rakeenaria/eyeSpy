'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatNumber } from '@/lib/format';
import type { DashboardAnalytics } from '@/types/eyespy';
import styles from './AnalyticsCharts.module.css';

const TOOLTIP_STYLE = {
  backgroundColor: '#09090B',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 12px',
  color: '#FFFFFF',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(9,9,11,0.18)',
};

const AXIS_TICK = { fill: '#71717A', fontSize: 11 };

export function TrendChartCard({ data }: { data: DashboardAnalytics }) {
  const { selectedYear, officialStats, tkpDistribution } = data;
  const stat2024 = officialStats.find((s) => s.tahun === 2024);
  const stat2025 = officialStats.find((s) => s.tahun === 2025);
  const stat2026 = officialStats.find((s) => s.tahun === 2026);

  // Build authentic chart dataset directly from official Polda DIY & Pusiknas figures
  const yearlyComparison = officialStats.map((s) => ({
    label: s.tahun === 2026 ? '2026 YTD*' : String(s.tahun),
    totalKasus: s.crimeTotal ?? 0,
    kasusSelesai: s.crimeClearance ?? 0,
  }));

  const year2024Breakdown = [
    { label: 'Crime Total', nilai: stat2024?.crimeTotal ?? 10764 },
    { label: 'Selesai', nilai: stat2024?.crimeClearance ?? 8589 },
    { label: 'Laka Lantas', nilai: stat2024?.lakaLantas ?? 6646 },
    { label: 'Crime Index', nilai: stat2024?.crimeIndex ?? 1529 },
    { label: 'Puncak Agu', nilai: 1045 },
    { label: 'Terendah Nov', nilai: 860 },
  ];

  const year2025Breakdown = [
    { label: 'Crime Total', nilai: stat2025?.crimeTotal ?? 10768 },
    { label: 'Selesai', nilai: stat2025?.crimeClearance ?? 8940 },
    { label: 'Laka Lantas', nilai: stat2025?.lakaLantas ?? 6533 },
    { label: 'Penipuan', nilai: 860 },
    { label: 'Narkotika', nilai: 690 },
    { label: 'Anak', nilai: 156 },
  ];

  const year2026Breakdown = [
    { label: 'Sep 2026', nilai: 436 },
    { label: 'Okt 2026', nilai: 466 },
    ...tkpDistribution.map((t) => ({ label: `TKP ${t.lokasiTkp}`, nilai: t.jumlah })),
  ];

  const titleMap: Record<string, string> = {
    all: 'Perbandingan Statistik Resmi Polda DIY (2023–2026 YTD)',
    '2024': 'Rincian Indikator Resmi Polda DIY 2024',
    '2025': 'Rincian Indikator Resmi Polda DIY 2025',
    '2026': 'Data Resmi Pusiknas Bareskrim Polri — Polda DIY 2026 YTD',
  };

  const descMap: Record<string, string> = {
    all: 'Total laporan vs penyelesaian perkara (Rilis Akhir Tahun Polda DIY 2023–2025 & Pusiknas 2026 YTD tindak pidana).',
    '2024': 'Angka resmi Rilis Akhir Tahun Polda DIY 2024 (puncak Agustus 1.045, terendah November 860 kasus).',
    '2025': 'Angka resmi Konferensi Pers Akhir Tahun Polda DIY (30 Des 2025) dengan clearance rate 83,02%.',
    '2026': 'Perbandingan tren Sep→Okt 2026 (+6,88%) serta sebaran TKP dominan dari total 4.212 kasus Jan–7 Nov 2026.',
  };

  const singleYearSeries =
    selectedYear === '2024'
      ? year2024Breakdown
      : selectedYear === '2025'
        ? year2025Breakdown
        : year2026Breakdown;

  return (
    <Card>
      <CardHeader
        title={titleMap[selectedYear]}
        description={descMap[selectedYear]}
        action={
          <Badge tone="neutral">
            {selectedYear === '2026' ? 'Pusiknas Polri' : 'Resmi Polda DIY'}
          </Badge>
        }
      />
      <CardBody>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height="100%">
            {selectedYear === 'all' ? (
              <BarChart data={yearlyComparison} margin={{ top: 8, right: 12, left: -6, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#09090B', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: '#F4F4F5', padding: '1px 0' }}
                  labelStyle={{ color: '#A1A1AA', marginBottom: 4 }}
                  formatter={(value, name) => [
                    `${formatNumber(Number(value))} kasus`,
                    name === 'totalKasus' ? 'Total Kasus' : 'Perkara Selesai',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 6 }}
                  formatter={(v) => (v === 'totalKasus' ? 'Total Kasus' : 'Perkara Selesai')}
                />
                <Bar dataKey="totalKasus" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="kasusSelesai" fill="#93C5FD" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            ) : (
              <BarChart data={singleYearSeries} margin={{ top: 8, right: 12, left: -6, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#09090B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: '#F4F4F5' }}
                  labelStyle={{ color: '#A1A1AA', marginBottom: 4 }}
                  formatter={(value) => [`${formatNumber(Number(value))} kasus`, 'Jumlah Resmi']}
                />
                <Bar dataKey="nilai" radius={[4, 4, 0, 0]} barSize={34}>
                  {singleYearSeries.map((entry, idx) => (
                    <Cell key={entry.label} fill={idx === 0 ? '#2563EB' : '#60A5FA'} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className={styles.statStrip}>
          <div className={styles.statCell}>
            <span className={styles.statCellLabel}>Puncak vs Terendah (2024)</span>
            <span className={styles.statCellValue}>Agu 1.045 • Nov 860 kasus</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statCellLabel}>Clearance Rate (2024 → 2025)</span>
            <span className={styles.statCellValue}>
              {stat2024?.clearanceRate ?? '79,79'}% → {stat2025?.clearanceRate ?? '83,02'}%
            </span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statCellLabel}>Pusiknas 2026 YTD (Jan–7 Nov)</span>
            <span className={styles.statCellValue}>
              {formatNumber(stat2026?.crimeTotal)} pidana (Sep 436 → Okt 466)
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function SecondaryChartsGrid({ data }: { data: DashboardAnalytics }) {
  const { regionDistribution, categoryDistribution, tkpDistribution, selectedYear } = data;

  const maxRegion = Math.max(...regionDistribution.map((r) => r.totalKasus), 1);
  const maxCat = Math.max(...categoryDistribution.map((c) => c.jumlah), 1);
  const maxTkp = Math.max(...tkpDistribution.map((t) => t.jumlah), 1);

  return (
    <section className={styles.secondaryGrid} aria-label="Distribusi wilayah, kategori, dan TKP">
      {/* 1. Sebaran Wilayah */}
      <Card>
        <CardHeader
          title="Sebaran per Polres / Wilayah"
          description={
            selectedYear === '2026'
              ? 'Kasus spesifik terdokumentasi YTD 2026 (rilis final Polres terbit Des 2026).'
              : `Data rilis resmi 5 Polres/Polresta DIY (${selectedYear === 'all' ? '2024–2025' : selectedYear}).`
          }
        />
        <CardBody>
          <div className={styles.chartWrapSm}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionDistribution}
                layout="vertical"
                margin={{ top: 4, right: 18, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="kabupaten"
                  width={92}
                  tick={{ fill: '#09090B', fontSize: 11.5 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: '#F4F4F5' }}
                  formatter={(value) => [`${formatNumber(Number(value))} kasus`, 'Jumlah']}
                />
                <Bar dataKey="totalKasus" radius={[0, 4, 4, 0]} barSize={18}>
                  {regionDistribution.map((entry) => (
                    <Cell
                      key={entry.kabupaten}
                      fill={entry.totalKasus === maxRegion ? '#2563EB' : '#93C5FD'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* 2. Kategori Kejahatan */}
      <Card>
        <CardHeader
          title="Kategori Tindak Pidana Menonjol"
          description={
            selectedYear === '2026'
              ? 'Kasus spesifik terdokumentasi YTD 2026 di wilayah hukum Polda DIY.'
              : `Kategori menonjol rilis resmi Polda DIY & Polres (${selectedYear === 'all' ? '2024–2025' : selectedYear}).`
          }
        />
        <CardBody>
          <div className={styles.chartWrapSm}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryDistribution.slice(0, 6)}
                layout="vertical"
                margin={{ top: 4, right: 18, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="namaJenis"
                  width={118}
                  tick={{ fill: '#09090B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: '#F4F4F5' }}
                  formatter={(value) => [`${formatNumber(Number(value))} kasus`, 'Jumlah']}
                />
                <Bar dataKey="jumlah" radius={[0, 4, 4, 0]} barSize={16}>
                  {categoryDistribution.slice(0, 6).map((entry) => (
                    <Cell
                      key={entry.namaJenis}
                      fill={entry.jumlah === maxCat ? '#2563EB' : '#93C5FD'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* 3. Lokasi TKP Terbanyak (Data Resmi Pusiknas Bareskrim Polri) */}
      <Card>
        <CardHeader
          title="Lokasi TKP Dominan (Pusiknas)"
          description="Sebaran TKP tertinggi di wilayah hukum Polda DIY (Pusiknas Polri 2026)."
        />
        <CardBody>
          <div className={styles.chartWrapSm}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tkpDistribution}
                margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="lokasiTkp"
                  tick={{ fill: '#09090B', fontSize: 11.5 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: '#F4F4F5' }}
                  formatter={(value) => [`${formatNumber(Number(value))} kasus`, 'TKP Resmi']}
                />
                <Bar dataKey="jumlah" radius={[4, 4, 0, 0]} barSize={44}>
                  {tkpDistribution.map((entry) => (
                    <Cell
                      key={entry.lokasiTkp}
                      fill={entry.jumlah === maxTkp ? '#2563EB' : '#93C5FD'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
