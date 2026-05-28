import type { Metadata } from 'next';
import { Instrument_Serif, Newsreader } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const newsreader = Newsreader({
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-editorial',
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'YOY Online — Markets, modelled.',
  description:
    'Quantitative finance models, interactive dashboards, and macro research by Yigit Osman Yalcin. Built for analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = `${instrumentSerif.variable} ${newsreader.variable} ${GeistSans.variable} ${GeistMono.variable}`;

  return (
    <html lang="en" className={fontVars}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
