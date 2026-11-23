import styles from '@/components/ui/PageSkeleton.module.css';

export default function Loading() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Memuat halaman">
      <div className={styles.headerSkel} />
      <div className={styles.grid4}>
        <div className={styles.cardSkel} />
        <div className={styles.cardSkel} />
        <div className={styles.cardSkel} />
        <div className={styles.cardSkel} />
      </div>
      <div className={styles.bigSkel} />
    </div>
  );
}
