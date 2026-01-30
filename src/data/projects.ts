export interface Project {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  status: 'live' | 'coming_soon';
  streamlitUrl?: string;
}

export const projects: Project[] = [
  {
    slug: 'return-observations',
    title: 'Return Observations Analysis',
    summary:
      'Analyze return distributions, volatility (Rolling/EWMA), z-scores, and consecutive periods without large drops for selected tickers.',
    tags: ['Streamlit', 'Statistics', 'Volatility', 'Python'],
    status: 'live',
    streamlitUrl: 'https://returnobs-yoy.streamlit.app',
  },
  {
    slug: 'try-carry-trade',
    title: 'TRY Carry Trade Analysis',
    summary:
      'Premium Streamlit dashboard for Turkish Lira carry trade analysis with Monte Carlo simulations and regime-based modeling.',
    tags: ['Streamlit', 'FX', 'Monte Carlo', 'Python'],
    status: 'live',
    streamlitUrl: 'https://try-carry-trade-appgit-yigityalcin.streamlit.app',
  },
  {
    slug: 'portfolio-analytics-dashboard',
    title: 'Portfolio Analytics',
    summary:
      'Two-portfolio comparison tool covering cumulative returns, drawdowns, Sharpe, Sortino, Beta, correlation matrices, and rolling risk metrics across a broad S&P 500 + Nasdaq-100 + ETF universe.',
    tags: ['Streamlit', 'Portfolio Analytics', 'Risk Metrics', 'Python'],
    status: 'live',
    streamlitUrl: 'https://portfolio-analyticsyoy.streamlit.app',
  },
  {
    slug: 'beta-correlation-quant',
    title: 'Beta & Correlation Analytics',
    summary:
      'Interactive analytics across a large asset universe to compare beta, correlations, Sharpe, and relative performance versus a benchmark. Includes ranking tables and visual diagnostics built for scale.',
    tags: ['Streamlit', 'Beta', 'Correlation', 'Sharpe', 'Risk', 'Python'],
    status: 'live',
    streamlitUrl: 'https://asset-analyticsyoy.streamlit.app',
  },
  {
    slug: 'macd-breadth-indicator',
    title: 'MACD-V Breadth Indicator (Volatility-Normalized Momentum)',
    summary:
      'Market breadth dashboard analyzing S&P 500 constituents using volatility-normalized MACD-V with Wilder ATR smoothing. Visualizes momentum regimes, bull/bear ratios, and histogram breadth. Reference: Spiroglou, "MACD-V: Volatility Normalised Momentum" (SSRN 4099617).',
    tags: ['Streamlit', 'Technical Analysis', 'Breadth', 'Momentum', 'Python'],
    status: 'live',
    streamlitUrl: 'https://macd-v-breadthwild.streamlit.app',
  },
  {
    slug: 'macro-economic-modeling',
    title: 'Macro Economic Modeling',
    summary:
      'Dashboard analyzing CPI, PCE, GDP from FRED with inflation momentum, scenario projections, and Growth vs Inflation quadrant analysis.',
    tags: ['Streamlit', 'Macro', 'FRED', 'Python'],
    status: 'live',
    streamlitUrl: 'https://macroeconomicmodelingyoy.streamlit.app',
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
