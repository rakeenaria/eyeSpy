'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatDateShortID, formatNumber } from '@/lib/format';
import type { IncidentListItem, RegionStat, YearFilter } from '@/types/eyespy';
import styles from './HotspotTable.module.css';

interface HotspotTableProps {
  selectedYear: YearFilter;
  regions: RegionStat[];
  recentIncidents: IncidentListItem[];
}

export function HotspotTable({
  selectedYear,
  regions,
  recentIncidents,
}: HotspotTableProps) {
  const [tab, setTab] = useState<'regions' | 'incidents'>('regions');

  return (
    <Card>
      <CardHeader
        title={
          tab === 'regions'
            ? 'Rekapitulasi Resmi per Wilayah Hukum Polres / Polresta DIY'
            : 'Kasus Riil Terkini Terdokumentasi'
        }
        description={
          tab === 'regions'
            ? selectedYear === '2026'
              ? 'Menampilkan insiden terdokumentasi YTD 2026 per wilayah (rilis final per Polres terbit akhir Desember 2026).'
              : 'Data resmi rilis akhir tahun dari 5 satuan Polres/Polresta di bawah Polda DIY.'
            : 'Daftar insiden kriminalitas riil terverifikasi dari rilis kepolisian dan media kredibel DIY.'
        }
        action={
          <div className={styles.tabs} role="tablist" aria-label="Pilih tabel ringkasan">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'regions'}
              className={
                tab === 'regions' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn
              }
              onClick={() => setTab('regions')}
            >
              Per Polres (5 Wilayah)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'incidents'}
              className={
                tab === 'incidents' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn
              }
              onClick={() => setTab('incidents')}
            >
              Kasus Terkini ({recentIncidents.length})
            </button>
          </div>
        }
      />
      <CardBody padding="flush">
        <div className={styles.tableWrap}>
          {tab === 'regions' ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Wilayah</th>
                  <th>Satuan Kepolisian</th>
                  <th>{selectedYear === '2026' ? 'Kasus Terdokumentasi' : 'Total Kasus Resmi'}</th>
                  <th>Perkara Selesai</th>
                  <th>Catatan &amp; Sumber Resmi</th>
                  <th className={styles.alignRight}>Arsip</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((reg) => (
                  <tr key={reg.kabupaten}>
                    <td className={styles.primaryCell}>{reg.kabupaten}</td>
                    <td>{reg.polres}</td>
                    <td className={styles.count}>{formatNumber(reg.totalKasus)} kasus</td>
                    <td className={styles.count}>
                      {reg.kasusSelesai !== null ? `${formatNumber(reg.kasusSelesai)} selesai` : '—'}
                    </td>
                    <td className={styles.noteCell}>
                      {reg.catatan ?? '—'}
                      <span className={styles.subCell}>{reg.sumberResmi}</span>
                    </td>
                    <td className={styles.alignRight}>
                      <Link href="/laporan" className={styles.rowLink}>
                        <span>{reg.documentedCount} arsip</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Lokasi Kejadian</th>
                  <th>Kategori</th>
                  <th>Sumber Verifikasi</th>
                  <th className={styles.alignRight}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.map((inc) => (
                  <tr key={inc.id}>
                    <td className="mono" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                      {formatDateShortID(inc.waktu)}
                    </td>
                    <td className={styles.primaryCell}>
                      {inc.namaTempat}
                      <span className={styles.subCell}>{inc.kabupaten}</span>
                    </td>
                    <td>
                      <Badge tone="neutral">{inc.jenisKejahatan}</Badge>
                    </td>
                    <td>{inc.sumberReferensi ?? 'Basis Data eyeSpy'}</td>
                    <td className={styles.alignRight}>
                      <Link href={`/laporan/${inc.id}`} className={styles.rowLink}>
                        <span>Detail</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
