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
    title: 'Advanced Portfolio Analytics Dashboard',
    summary:
      'Interactive dashboard for portfolio performance analysis with Sharpe ratio, Beta, drawdowns, and correlation matrices.',
    tags: ['Dash', 'Plotly', 'Portfolio Analytics', 'Python'],
    status: 'coming_soon',
  },
  {
    slug: 'beta-correlation-quant',
    title: 'Beta Correlation Quant Dashboard',
    summary:
      'Quantitative analysis tool for exploring beta and correlation relationships across assets.',
    tags: ['Dash', 'Plotly', 'Quant', 'Python'],
    status: 'coming_soon',
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
