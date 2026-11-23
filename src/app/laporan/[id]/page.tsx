import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { formatDateTimeID } from '@/lib/format';
import { getIncidentById } from '@/lib/services/reports';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function DetailLaporanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) notFound();

  const report = await getIncidentById(numId);
  if (!report) notFound();

  return (
    <div>
      <Link href={`/laporan/lokasi/${report.idTempat}`} className={styles.backLink}>
        <ArrowLeft size={14} />
        <span>Kembali ke Daftar Kasus di {report.namaTempat}</span>
      </Link>

      <PageHeader
        title={`Laporan #${report.id} — ${report.jenisKejahatan}`}
        subtitle={`${report.namaTempat}, ${report.kabupaten} • ${formatDateTimeID(report.waktu)}`}
        actions={
          <Badge tone="neutral">
            {report.pelapor === 'sistem' ? 'Rilis / Sistem' : 'Laporan Masyarakat'}
          </Badge>
        }
      />

      <Card>
        <div className={styles.mediaBox}>
          <img
            src={report.gambarTempat || '/images/footage.webp'}
            alt={`Visual lokasi ${report.namaTempat}`}
            className={styles.mediaImg}
          />
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Lokasi Kejadian</span>
            <span className={styles.metaValue}>{report.namaTempat}</span>
            <span className={styles.metaSub}>{report.kabupaten}, D.I. Yogyakarta</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Kategori Kejahatan</span>
            <span className={styles.metaValue}>{report.jenisKejahatan}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Waktu Kejadian</span>
            <span className={`${styles.metaValue} mono`}>{formatDateTimeID(report.waktu)}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Sumber Referensi</span>
            <span className={styles.metaValue}>
              {report.sumberReferensi || 'Basis Data eyeSpy'}
            </span>
          </div>
        </div>

        <CardBody>
          <h2 className={styles.sectionTitle}>Kronologi &amp; Keterangan</h2>
          <p className={styles.chronology}>
            {report.keterangan || 'Tidak ada keterangan tambahan tercatat untuk kasus ini.'}
          </p>

          {report.cctvCameraId ? (
            <div className={styles.cctvLinkRow}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                Laporan ini terkait dengan kamera CCTV Publik #{report.cctvCameraId}.
              </span>
              <Link href={`/cctv/${encodeURIComponent(report.cctvCameraId)}`} className={styles.inlineLink}>
                Buka siaran kamera terkait →
              </Link>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
