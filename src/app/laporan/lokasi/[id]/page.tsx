import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatDateTimeID } from '@/lib/format';
import { getLocationWithIncidents } from '@/lib/services/reports';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function LokasiLaporanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) notFound();

  const { location, incidents } = await getLocationWithIncidents(numId);
  if (!location) notFound();

  return (
    <div>
      <Link href="/laporan" className={styles.backLink}>
        <ArrowLeft size={14} />
        <span>Kembali ke Rekapitulasi Laporan</span>
      </Link>

      <PageHeader
        title={location.namaTempat}
        subtitle={`Wilayah ${location.kabupaten}, D.I. Yogyakarta • ${incidents.length} insiden tercatat`}
      />

      <Card>
        <CardHeader
          title="Riwayat Kasus pada Lokasi Ini"
          description="Menampilkan seluruh insiden terdokumentasi dan laporan masyarakat di titik ini."
        />
        <CardBody padding="flush">
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 52 }}>No</th>
                  <th>Waktu Kejadian</th>
                  <th>Kategori</th>
                  <th>Pelapor / Sumber</th>
                  <th>Kronologi Singkat</th>
                  <th className={styles.alignRight}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                      Belum ada laporan kejahatan tercatat untuk lokasi ini.
                    </td>
                  </tr>
                ) : (
                  incidents.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="mono" style={{ color: 'var(--text-muted)' }}>
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="mono" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                        {formatDateTimeID(item.waktu)}
                      </td>
                      <td>
                        <Badge tone="neutral">{item.jenisKejahatan}</Badge>
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {item.sumberReferensi || (item.pelapor === 'sistem' ? 'Rilis Kepolisian' : 'Masyarakat')}
                      </td>
                      <td>
                        {item.keterangan.length > 110
                          ? `${item.keterangan.slice(0, 110)}...`
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
        </CardBody>
      </Card>
    </div>
  );
}
