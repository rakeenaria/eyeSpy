import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <Card>
      <CardBody>
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' }}>
            404 — NOT FOUND
          </p>
          <h1 style={{ margin: '0 0 8px', fontSize: 20 }}>Halaman tidak ditemukan</h1>
          <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Data kamera, lokasi, atau laporan yang Anda cari tidak tersedia di basis data eyeSpy.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--accent)',
              fontWeight: 500,
              fontSize: 13.5,
            }}
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
