import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  withDot?: boolean;
  className?: string;
}

export function Badge({
  children,
  tone = 'neutral',
  withDot = false,
  className,
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}${className ? ` ${className}` : ''}`}>
      {withDot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
