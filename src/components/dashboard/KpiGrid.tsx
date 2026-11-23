import { Building2, MapPin, ShieldCheck, TrendingUp } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import type { DashboardAnalytics } from '@/types/eyespy';
import styles from './KpiGrid.module.css';

interface KpiGridProps {
  data: DashboardAnalytics;
}

export function KpiGrid({ data }: KpiGridProps) {
  const { selectedYear, kpi, activeOfficial } = data;
  const is2026 = selectedYear === '2026';

  const firstTitle = is2026
    ? 'Tindak Pidana 2026 YTD (Pusiknas)'
    : selectedYear === 'all'
      ? 'Total Kasus Polda DIY (2024–2025)'
      : `Total Kasus Polda DIY (${selectedYear})`;

  const firstValue = formatNumber(kpi.officialCrimeTotal);

  const firstSub = is2026
    ? 'Jan–7 Nov 2026 (Pusiknas Polri) • Okt 466 (+6,88% vs Sep 436)'
    : selectedYear === 'all'
      ? 'Akumulasi 2024 (10.764) + 2025 (10.768) • Plus 4.212 YTD 2026'
      : activeOfficial?.sumberResmi ?? 'Rilis Akhir Tahun Polda DIY';

  const secondTitle = is2026 ? 'Lonjakan Bulanan Terbaru' : 'Penyelesaian Perkara';

  const secondValue = is2026
    ? '+6,88%'
    : kpi.officialClearanceRate !== null
      ? `${kpi.officialClearanceRate}%`
      : '—';

  const secondSub = is2026
    ? 'Sep 2026 (436 kasus) → Okt 2026 (466 kasus) • Pusiknas Polri'
    : kpi.officialClearanceCount
      ? `${formatNumber(kpi.officialClearanceCount)} perkara selesai ditangani`
      : 'Data resmi Polda DIY';

  return (
    <section className={styles.grid} aria-label="Ringkasan metrik resmi utama">
      <article className={styles.card}>
        <div className={styles.labelRow}>
          <span className={styles.label}>{firstTitle}</span>
          <TrendingUp size={15} strokeWidth={1.75} className={styles.icon} />
        </div>
        <div className={styles.value}>{firstValue}</div>
        <span className={styles.sub}>{firstSub}</span>
      </article>

      <article className={styles.card}>
        <div className={styles.labelRow}>
          <span className={styles.label}>{secondTitle}</span>
          <ShieldCheck size={15} strokeWidth={1.75} className={styles.icon} />
        </div>
        <div className={`${styles.value} ${styles.accentValue}`}>{secondValue}</div>
        <span className={styles.sub}>{secondSub}</span>
      </article>

      <article className={styles.card}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Wilayah Hukum Tertinggi</span>
          <MapPin size={15} strokeWidth={1.75} className={styles.icon} />
        </div>
        <div className={styles.value} title={kpi.topRegionPolres}>
          {kpi.topRegionName}
        </div>
        <span className={styles.sub}>
          {kpi.topRegionPolres}: {formatNumber(kpi.topRegionCount)}{' '}
          {is2026 ? 'kasus terdokumentasi YTD' : 'perkara tercatat'}
        </span>
      </article>

      <article className={styles.card}>
        <div className={styles.labelRow}>
          <span className={styles.label}>TKP Paling Sering (Pusiknas)</span>
          <Building2 size={15} strokeWidth={1.75} className={styles.icon} />
        </div>
        <div className={styles.value} title={kpi.topTkpName}>
          {kpi.topTkpName}
        </div>
        <span className={styles.sub}>
          {formatNumber(kpi.topTkpCount)} kasus di jalan umum (Pusiknas Polri 2026)
        </span>
      </article>
    </section>
  );
}
