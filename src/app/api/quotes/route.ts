import { NextResponse } from 'next/server';

// Refresh the route response at most once per minute.
export const revalidate = 60;

const DEFAULT_SYMBOLS = [
  'SPY',
  'QQQ',
  'DIA',
  'IWM',
  '^VIX',
  '^TNX',
  'EURUSD=X',
  'TRY=X',
  'BTC-USD',
  'GC=F',
  'CL=F',
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

interface Quote {
  symbol: string;
  last: number;
  change: number;
  changePct: number;
  asOf: number;
}

// Per-process snapshot cache — covers transient Yahoo failures within
// the lifetime of a serverless instance. Combined with Next's fetch
// cache (revalidate: 60) and the route's own revalidate, this means
// the upstream is hit at most a few times per minute.
const snapshotCache = new Map<string, Quote>();

interface YahooChartMeta {
  regularMarketPrice?: number;
  // Canonical prior regular-session close. This is what Yahoo's UI
  // uses for the headline daily % change. Prefer this over
  // chartPreviousClose, which is the close of the bar BEFORE the
  // requested range (so with range=5d it's ~5 trading days ago, not
  // yesterday — using it as the baseline yields a multi-day return
  // rather than today's change).
  previousClose?: number;
  regularMarketPreviousClose?: number;
  chartPreviousClose?: number;
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: YahooChartMeta;
      indicators?: {
        quote?: Array<{ close?: Array<number | null> }>;
      };
    }>;
    error?: { code?: string; description?: string } | null;
  };
}

async function fetchYahoo(symbol: string): Promise<Quote | null> {
  // range=1d so Yahoo's chartPreviousClose collapses onto yesterday's
  // close — keeps all three "prev" fields in agreement and forces a
  // true 1-day return regardless of which one we end up reading.
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?interval=1d&range=1d`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as YahooChartResponse;
    const result = json.chart?.result?.[0];
    if (!result || !result.meta) return null;

    const meta = result.meta;
    let last = meta.regularMarketPrice;
    if (typeof last !== 'number') {
      const closes = result.indicators?.quote?.[0]?.close ?? [];
      for (let i = closes.length - 1; i >= 0; i--) {
        const v = closes[i];
        if (typeof v === 'number' && Number.isFinite(v)) {
          last = v;
          break;
        }
      }
    }
    const prev =
      typeof meta.regularMarketPreviousClose === 'number'
        ? meta.regularMarketPreviousClose
        : typeof meta.previousClose === 'number'
        ? meta.previousClose
        : typeof meta.chartPreviousClose === 'number'
        ? meta.chartPreviousClose
        : undefined;

    if (typeof last !== 'number' || typeof prev !== 'number' || prev === 0) {
      return null;
    }

    const change = last - prev;
    const changePct = (change / prev) * 100;

    const quote: Quote = {
      symbol,
      last,
      change,
      changePct,
      asOf: Date.now(),
    };
    snapshotCache.set(symbol, quote);
    return quote;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('symbols');
  const symbols = raw
    ? raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : DEFAULT_SYMBOLS;

  const settled = await Promise.allSettled(symbols.map(fetchYahoo));

  const quotes = symbols.map((sym, i) => {
    const r = settled[i];
    if (r.status === 'fulfilled' && r.value) return r.value;
    return snapshotCache.get(sym) ?? null;
  });

  const present = quotes.filter((q): q is Quote => q !== null);

  return NextResponse.json(
    {
      asOf: Date.now(),
      quotes: present,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
