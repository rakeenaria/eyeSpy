import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { TopNavbar } from '@/components/layout/TopNavbar';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'eyeSpy — Intelijen Keamanan & CCTV Publik D.I. Yogyakarta',
  description:
    'Platform pemantauan CCTV publik Jogja Istimewa, analitik data kriminalitas riil D.I. Yogyakarta 2024–2026, dan asisten AI keamanan.',
  icons: {
    icon: '/images/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <TopNavbar />
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
