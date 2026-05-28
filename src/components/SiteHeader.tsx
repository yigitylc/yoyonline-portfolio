'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Yahoo Finance symbols we request, in display order.
const SYMBOLS = [
  '^GSPC',
  '^NDX',
  '^DJI',
  '^RUT',
  '^VIX',
  '^TNX',
  'EURUSD=X',
  'TRY=X',
  'BTC-USD',
  'GC=F',
  'CL=F',
] as const;

// Yahoo symbol → display label shown in the strip.
const DISPLAY: Record<string, string> = {
  '^GSPC': 'SPX',
  '^NDX': 'NDX',
  '^DJI': 'DJI',
  '^RUT': 'RUT',
  '^VIX': 'VIX',
  '^TNX': 'UST10Y',
  'EURUSD=X': 'EURUSD',
  'TRY=X': 'USDTRY',
  'BTC-USD': 'BTC',
  'GC=F': 'GOLD',
  'CL=F': 'WTI',
};

interface QuoteRow {
  symbol: string;
  last: number;
  change: number;
  changePct: number;
}

interface QuotesResponse {
  asOf: number;
  quotes: QuoteRow[];
}

const REFRESH_MS = 60_000;
const PLACEHOLDER = '——';

function formatPrice(symbol: string, last: number): string {
  // U.S. locale grouping; per-symbol decimal precision.
  if (symbol === '^TNX') return last.toFixed(3);
  if (symbol === 'EURUSD=X') return last.toFixed(4);
  if (symbol === 'TRY=X') return last.toFixed(3);
  if (symbol === 'BTC-USD') {
    return Math.round(last).toLocaleString('en-US');
  }
  if (last >= 1000) {
    return last.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return last.toFixed(2);
}

function formatPct(pct: number): string {
  const sign = pct >= 0 ? '+' : '−'; // U+2212 minus
  return `${sign}${Math.abs(pct).toFixed(2)}%`;
}

function formatNY() {
  const d = new Date();
  const hh = String((d.getUTCHours() + 24 - 5) % 24).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function Clock() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    setT(formatNY());
    const i = setInterval(() => setT(formatNY()), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <span className="clock" suppressHydrationWarning>
      <span className="dot" /> NY · {t ?? '--:--:--'} ET
    </span>
  );
}

interface TickerItem {
  display: string;
  px: string;
  ch: string;
  up: boolean | null;
}

function buildItems(quotes: QuoteRow[] | null): TickerItem[] {
  // Always render one row per requested symbol, in fixed order, so the
  // initial em-dash placeholders take the same slots as the eventual
  // populated values — no layout shift when the fetch resolves.
  const map = new Map<string, QuoteRow>();
  if (quotes) {
    for (const q of quotes) map.set(q.symbol, q);
  }
  return SYMBOLS.map((sym) => {
    const display = DISPLAY[sym] ?? sym;
    const q = map.get(sym);
    if (!q) {
      return { display, px: PLACEHOLDER, ch: PLACEHOLDER, up: null };
    }
    return {
      display,
      px: formatPrice(sym, q.last),
      ch: formatPct(q.changePct),
      up: q.changePct >= 0,
    };
  });
}

function TickerStrip() {
  const [quotes, setQuotes] = useState<QuoteRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/quotes?symbols=${encodeURIComponent(SYMBOLS.join(','))}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = (await res.json()) as QuotesResponse;
        if (!cancelled && Array.isArray(data.quotes)) {
          setQuotes(data.quotes);
        }
      } catch {
        // Network blip — keep showing the previous snapshot.
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const single = buildItems(quotes);
  // Duplicate the list for the infinite-scroll trick.
  const items = [...single, ...single];

  return (
    <div className="ticker-strip" aria-hidden="true">
      <div className="ticker-badge">LIVE · delayed 15m</div>
      <div className="ticker-track">
        {items.map((t, i) => (
          <span className="ticker-item" key={`${i}-${t.display}`}>
            <span className="tic">{t.display}</span>
            <span className="px">{t.px}</span>
            <span
              className={
                t.up === null ? 'ch-idle' : t.up ? 'up' : 'down'
              }
            >
              {t.ch}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function isActive(
  pathname: string | null,
  target: 'home' | 'projects' | 'research'
) {
  if (!pathname) return false;
  if (target === 'home') return pathname === '/';
  if (target === 'projects') return pathname.startsWith('/projects');
  if (target === 'research') return pathname.startsWith('/research');
  return false;
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <TickerStrip />
      <header className="nav">
        <div className="container nav-inner">
          <Link className="brand" href="/">
            YOY<span className="brand-dot" />
            <span className="brand-it">online</span>
          </Link>
          <nav className="nav-links">
            <Link href="/" className={isActive(pathname, 'home') ? 'on' : ''}>
              Home
            </Link>
            <Link
              href="/projects"
              className={isActive(pathname, 'projects') ? 'on' : ''}
            >
              Projects &amp; Models
            </Link>
            <span className="nav-soon" aria-disabled="true">
              Research <span className="nav-soon-tag">Soon</span>
            </span>
            <Clock />
          </nav>
        </div>
      </header>
    </>
  );
}
