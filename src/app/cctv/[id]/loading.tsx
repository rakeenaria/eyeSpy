import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CctvDetailLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton width={210} height={16} />
      <Skeleton width={320} height={28} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)', gap: 18 }}>
        <Card>
          <CardBody>
            <Skeleton width="100%" height={360} radius={8} />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Skeleton width="55%" height={18} />
              <Skeleton width="100%" height={36} />
              <Skeleton width="100%" height={120} />
              <Skeleton width="100%" height={36} />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
