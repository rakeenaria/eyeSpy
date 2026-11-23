import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CctvPlayer } from '@/components/cctv/CctvPlayer';
import { ReportIncidentForm } from '@/components/cctv/ReportIncidentForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { findPublicCctvCamera } from '@/lib/services/jogja-cctv';
import { getCrimeTypeOptions } from '@/lib/services/reports';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function CctvDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [{ camera, nearbyLive }, crimeTypes] = await Promise.all([
    findPublicCctvCamera(decodedId),
    getCrimeTypeOptions(),
  ]);

  if (!camera) {
    notFound();
  }

  return (
    <div>
      <Link href="/cctv" className={styles.backLink}>
        <ArrowLeft size={14} />
        <span>Kembali ke Peta &amp; Daftar CCTV Publik</span>
      </Link>

      <PageHeader
        title={camera.displayName}
        subtitle={`${camera.groupName} • ${camera.sourceLabel} • ID #${camera.externalCameraId}`}
        actions={
          <Badge tone={camera.connected ? 'success' : 'danger'} withDot>
            {camera.connected ? 'Live Aktif' : 'Pemeliharaan'}
          </Badge>
        }
      />

      <div className={styles.detailGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CctvPlayer
            cameraName={camera.displayName}
            sourceLabel={camera.sourceLabel}
            liveUrl={camera.streamUrl}
            connected={camera.connected}
          />

          {!camera.connected && nearbyLive.length > 0 ? (
            <Card>
              <CardHeader
                title="Kamera Live Aktif yang Dapat Dipantau Saat Ini"
                description="Siaran langsung aktif dari jaringan CCTV Pemkot Yogyakarta (JSS)."
              />
              <CardBody padding="compact">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                  {nearbyLive.map((cam) => (
                    <Link
                      key={cam.slug}
                      href={`/cctv/${encodeURIComponent(cam.slug)}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                        fontSize: 12.5,
                        fontWeight: 500,
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cam.displayName}
                      </span>
                      <ArrowRight size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
                    </Link>
                  ))}
                </div>
              </CardBody>
            </Card>
          ) : null}
        </div>

        <ReportIncidentForm
          cameraId={camera.externalCameraId}
          cameraName={camera.displayName}
          groupName={camera.groupName}
          crimeTypes={crimeTypes}
        />
      </div>
    </div>
  );
}
