import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function LaporanDetailLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton width={240} height={16} />
      <Skeleton width={380} height={28} />
      <Card>
        <Skeleton width="100%" height={280} radius={0} />
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton width="45%" height={18} />
            <Skeleton width="100%" height={14} />
            <Skeleton width="92%" height={14} />
            <Skeleton width="80%" height={14} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
