'use client';

import Aurora from '@/components/ui/Aurora';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { MarkdownView } from '@/components/ui/MarkdownView';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './AiMitigationCard.module.css';

const AURORA_STOPS = ["#2fb1ff","#64c5ff","#2fb1ff"];

interface AiMitigationCardProps {
  content: string;
  model: string;
  loading: boolean;
  basisLabel?: string;
}

export function AiMitigationCard({
  content,
  model,
  loading,
  basisLabel,
}: AiMitigationCardProps) {
  return (
    <Card className={styles.auroraCard}>
      <div className={styles.auroraBg} aria-hidden="true">
        <Aurora
          colorStops={AURORA_STOPS}
          amplitude={1}
          blend={0.5}
          height={0.45}
          speed={1}
          glow={0.6}
          lightMode
        />
      </div>
      <CardHeader
        title="Analisis AI & Rekomendasi Mitigasi"
        description={
          basisLabel ||
          'Analisis berbasis statistik resmi Polda DIY, 5 Polres, Pusiknas Bareskrim Polri & arsip insiden riil pada filter aktif.'
        }
        action={
          <Badge tone="accent">
            {model === 'database-summary' ? 'Analisis Data' : 'Groq AI'}
          </Badge>
        }
      />
      <CardBody padding="flush">
        <div className={styles.scrollArea}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }} aria-busy="true">
              <Skeleton width="38%" height={16} />
              <Skeleton width="100%" height={13} />
              <Skeleton width="94%" height={13} />
              <Skeleton width="78%" height={13} />
              <Skeleton width="42%" height={16} style={{ marginTop: 8 }} />
              <Skeleton width="96%" height={13} />
              <Skeleton width="88%" height={13} />
            </div>
          ) : (
            <MarkdownView content={content} />
          )}
        </div>
      </CardBody>
    </Card>
  );
}
