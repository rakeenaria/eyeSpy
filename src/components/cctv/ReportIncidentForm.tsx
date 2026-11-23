'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import type { CrimeTypeOption } from '@/types/eyespy';
import styles from './ReportIncidentForm.module.css';

interface ReportIncidentFormProps {
  cameraId: string;
  cameraName: string;
  groupName: string;
  crimeTypes: CrimeTypeOption[];
}

export function ReportIncidentForm({
  cameraId,
  cameraName,
  groupName,
  crimeTypes,
}: ReportIncidentFormProps) {
  const [idJenis, setIdJenis] = useState<string>(String(crimeTypes[0]?.idJenis ?? 1));
  const [keterangan, setKeterangan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreatedId(null);

    if (keterangan.trim().length < 10) {
      setError('Mohon tulis kronologi kejadian minimal 10 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idJenis: Number(idJenis),
          keterangan: keterangan.trim(),
          cctvCameraId: cameraId,
          cctvCameraName: cameraName,
          cctvGroupName: groupName,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal mengirim laporan.');
      }
      setCreatedId(Number(json.id));
      setKeterangan('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Laporkan Kejadian Terpantau"
        description="Laporan akan tercatat langsung di basis data laporan eyeSpy beserta referensi kamera ini."
      />
      <CardBody>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="jenis-kejahatan" className={styles.label}>
              Kategori Kejadian
            </label>
            <select
              id="jenis-kejahatan"
              className={styles.select}
              value={idJenis}
              onChange={(e) => setIdJenis(e.target.value)}
            >
              {crimeTypes.map((ct) => (
                <option key={ct.idJenis} value={ct.idJenis}>
                  {ct.namaJenis}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="keterangan-kejadian" className={styles.label}>
              Kronologi / Keterangan
            </label>
            <textarea
              id="keterangan-kejadian"
              className={styles.textarea}
              placeholder="Jelaskan aktivitas mencurigakan, ciri kendaraan, atau insiden yang terlihat pada siaran kamera..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              maxLength={2000}
              required
            />
          </div>

          {error ? (
            <div className={`${styles.feedback} ${styles.feedbackErr}`} role="alert">
              {error}
            </div>
          ) : null}

          {createdId ? (
            <div className={`${styles.feedback} ${styles.feedbackOk}`} role="status">
              <span>Laporan berhasil dicatat dengan ID #{createdId}.</span>
              <Link href={`/laporan/${createdId}`} className={styles.link}>
                Lihat detail laporan →
              </Link>
            </div>
          ) : null}

          <Button type="submit" variant="primary" disabled={submitting}>
            <Send size={14} />
            <span>{submitting ? 'Menyimpan laporan...' : 'Kirim Laporan'}</span>
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
