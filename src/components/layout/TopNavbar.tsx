'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BarChart3, Camera, Eye, FileText, Menu, X } from 'lucide-react';
import styles from './TopNavbar.module.css';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: BarChart3, match: (p: string) => p === '/' },
  { href: '/cctv', label: 'CCTV Publik', icon: Camera, match: (p: string) => p.startsWith('/cctv') },
  { href: '/laporan', label: 'Laporan', icon: FileText, match: (p: string) => p.startsWith('/laporan') },
];

export function TopNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.brandGroup}>
          <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
            <span className={styles.brandMark} aria-hidden="true">
              <Eye size={15} strokeWidth={2.2} />
            </span>
            <span>
              eye<span className={styles.brandAccent}>Spy</span>
            </span>
          </Link>

          <nav aria-label="Navigasi utama">
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.match(pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={true}
                      className={
                        active ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                      }
                    >
                      <Icon size={15} strokeWidth={1.75} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className={styles.meta}>
          <span className={styles.metaTag}>D.I. Yogyakarta • Data 2024–2026</span>
        </div>

        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <div className={styles.mobileMenu}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={
                  active ? `${styles.mobileLink} ${styles.mobileLinkActive}` : styles.mobileLink
                }
              >
                <Icon size={16} strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}
