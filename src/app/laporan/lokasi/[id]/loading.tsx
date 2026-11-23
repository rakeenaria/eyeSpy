import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton, TableSkeletonRows } from '@/components/ui/Skeleton';

export default function LokasiLaporanLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton width={220} height={16} />
      <Skeleton width={340} height={28} />
      <Card>
        <CardBody padding="flush">
          <TableSkeletonRows rows={6} cols={5} />
        </CardBody>
      </Card>
    </div>
  );
}
