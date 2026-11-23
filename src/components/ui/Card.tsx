import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section className={className ? `${styles.card} ${className}` : styles.card}>
      {children}
    </section>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <h2 className={styles.title}>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  padding?: 'default' | 'compact' | 'flush';
  className?: string;
}

export function CardBody({ children, padding = 'default', className }: CardBodyProps) {
  const baseClass =
    padding === 'flush'
      ? styles.bodyFlush
      : padding === 'compact'
        ? styles.bodyCompact
        : styles.body;
  return (
    <div className={className ? `${baseClass} ${className}` : baseClass}>
      {children}
    </div>
  );
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className={styles.footer}>{children}</div>;
}
