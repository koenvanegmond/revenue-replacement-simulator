import type { Metadata } from 'next';
import { Playfair_Display, Inter, Archivo_Black } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const archivoBlack = Archivo_Black({
  variable: '--font-archivo-black',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Revenue Replacement Simulator — Fine-Dining 2030',
  description:
    'Model the financial impact of premium NA pairings, menu engineering, and upselling as alcohol revenue structurally declines in Dutch fine-dining restaurants.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${playfair.variable} ${inter.variable} ${archivoBlack.variable}`}>
      <body className="min-h-screen bg-[#FAF7F2] font-[family-name:var(--font-inter)] text-[#1A1A1A] antialiased">
        {children}
      </body>
    </html>
  );
}
