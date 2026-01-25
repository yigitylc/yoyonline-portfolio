export interface Project {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  type: 'notebook' | 'streamlit' | 'dash';
  sourcePath: string;
  demoUrl: string;
  embedUrl: string;
}

export const projects: Project[] = [
  {
    slug: 'portfolio-analytics-dashboard',
    title: 'Advanced Portfolio Analytics Dashboard',
    summary:
      'Interactive Dash app for portfolio performance analysis with Sharpe ratio, Beta, drawdowns, and correlation matrices.',
    tags: ['Dash', 'Plotly', 'Portfolio Analytics', 'Python'],
    type: 'dash',
    sourcePath: 'Advanced Portfolio Analytics Dashboard Fixed.ipynb',
    demoUrl: '',
    embedUrl: '',
  },
  {
    slug: 'beta-correlation-quant',
    title: 'Beta Correlation Quant Dashboard',
    summary:
      'Quantitative analysis tool for exploring beta and correlation relationships across assets.',
    tags: ['Dash', 'Plotly', 'Quant', 'Python'],
    type: 'dash',
    sourcePath: 'beta correlation quant dash.ipynb',
    demoUrl: '',
    embedUrl: '',
  },
  {
    slug: 'try-carry-trade',
    title: 'TRY Carry Trade Analysis',
    summary:
      'Premium Streamlit dashboard for Turkish Lira carry trade analysis with Monte Carlo simulations and regime-based modeling.',
    tags: ['Streamlit', 'FX', 'Monte Carlo', 'Python'],
    type: 'streamlit',
    sourcePath: 'app_streamlit.py',
    demoUrl: '',
    embedUrl: '',
  },
  {
    slug: 'investment-analysis-try',
    title: 'Investment Analysis: TRY Time Deposits',
    summary:
      'Analysis of Turkish Lira time deposit investment strategies and returns.',
    tags: ['Jupyter', 'Finance', 'Analysis', 'Python'],
    type: 'notebook',
    sourcePath: 'investment analysis time deposit in TRY.ipynb',
    demoUrl: '',
    embedUrl: '',
  },
  {
    slug: 'macd-breadth-indicator',
    title: 'MACD-V Breadth Indicator',
    summary:
      'Technical analysis notebook implementing a robust MACD-V breadth indicator using Wilder smoothing.',
    tags: ['Jupyter', 'Technical Analysis', 'Indicators', 'Python'],
    type: 'notebook',
    sourcePath: 'MACD-V BREADTH INDICATOR WILDER, ROBUST.ipynb',
    demoUrl: '',
    embedUrl: '',
  },
  {
    slug: 'macro-economic-modeling',
    title: 'Macro Economic Modeling',
    summary:
      'Macroeconomic modeling and analysis notebook for understanding economic trends and relationships.',
    tags: ['Jupyter', 'Macro', 'Economics', 'Python'],
    type: 'notebook',
    sourcePath: 'Macro economic modeling.ipynb',
    demoUrl: '',
    embedUrl: '',
  },
  {
    slug: 'return-observations',
    title: 'Return Observations Analysis',
    summary:
      'Statistical analysis of asset returns, distributions, and patterns.',
    tags: ['Jupyter', 'Statistics', 'Returns', 'Python'],
    type: 'notebook',
    sourcePath: 'return obs.ipynb',
    demoUrl: '',
    embedUrl: '',
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
