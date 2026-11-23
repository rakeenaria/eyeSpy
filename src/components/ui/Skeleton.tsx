import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 16,
  radius,
  style,
  className,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={className ? `${styles.skeleton} ${className}` : styles.skeleton}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

export function TableSkeletonRows({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div aria-busy="true" aria-label="Memuat data tabel">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className={styles.row}>
          {Array.from({ length: cols }).map((__, cIdx) => (
            <Skeleton
              key={cIdx}
              height={14}
              width={cIdx === 0 ? '14%' : cIdx === cols - 1 ? '10%' : `${Math.floor(66 / Math.max(1, cols - 2))}%`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
