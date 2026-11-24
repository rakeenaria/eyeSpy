import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { TopNavbar } from '@/components/layout/TopNavbar';
import GradientASCII from '@/components/ui/GradientASCII';
import '@/styles/globals.css';

const PAGE_BG_COLORS = ['#d9f1ff', '#6fd0ff'];

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
        <div className="page-bg-layer" aria-hidden="true">
          <GradientASCII
            colors={PAGE_BG_COLORS}
            shape="rise"
            characters=" =+xX0S8#@"
            cellSize={22}
            density={0.8}
            lightMode
          />
        </div>
        <TopNavbar />
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
