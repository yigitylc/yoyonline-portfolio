export interface MethodologySection {
  heading: string;
  body?: string;
  bullets?: string[];
}

export interface Methodology {
  method?: string;
  inputs?: string[];
  outputs?: string[];
  // Alternative shape for projects whose methodology doesn't fit the
  // method/inputs/outputs triad. When `sections` is present the detail
  // page renders these in order and ignores the other fields.
  sections?: MethodologySection[];
  // Lines for the right-hand References side-card on the Methodology
  // tab. When omitted, a generic placeholder line renders.
  references?: string[];
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  status: 'live' | 'coming_soon';
  streamlitUrl?: string;
  repoUrl?: string;
  methodology?: Methodology;
  order?: number;
}

export const projects: Project[] = [
  {
    slug: 'ma-distance-percentile',
    title: 'MA Distance %ile',
    summary:
      "Mean-reversion gauge that ranks the price's distance from its moving average as a rolling percentile. Flags tail events and reports the forward-return distribution at t+1 / t+5 / t+20 following each event.",
    tags: ['Streamlit', 'Trend', 'Momentum', 'Distance', 'Percentile', 'Mean reversion', 'Event study', 'Python'],
    status: 'live',
    streamlitUrl: 'https://madistance-ile.streamlit.app',
    repoUrl: 'https://github.com/yigitylc/ma_distance_-ile',
    methodology: {
      method:
        'Computes the percentage distance between close and a configurable moving average (default 200d). Converts the distance into a rolling percentile rank over a trailing window (default 252d) to make the signal scale-free across assets and regimes. Tail events fire when the percentile crosses an upper or lower threshold.',
      inputs: [
        'Daily close prices from Yahoo Finance for a chosen ticker.',
        'Moving-average length, configurable; default 200 trading days.',
        'Rolling-percentile window, configurable; default 252 trading days.',
        'Tail-event thresholds, configurable percentile cutoffs; default 5th / 95th.',
      ],
      outputs: [
        'MA distance line and the bounding percentile band over time.',
        'Tail probability — the share of recent history with a more extreme distance than today.',
        'Event-study table: median forward return at t+1 / t+5 / t+20 following each tail event, with hit rate and event count.',
      ],
    },
    order: 1,
  },
  {
    slug: 'portfolio-analytics-dashboard',
    title: 'Portfolio Risk & Return Comparison',
    summary:
      'Two-portfolio side-by-side comparison with custom weights against an SPY benchmark — cumulative returns, drawdowns, Sharpe, Sortino, Calmar, VaR, CVaR, beta, alpha, information ratio, correlation, R-squared, rolling beta/Sharpe, correlation matrix, and relative performance.',
    tags: ['Streamlit', 'Portfolio Analysis', 'Risk Metrics', 'Python'],
    status: 'live',
    streamlitUrl: 'https://portfolio-analyticsyoy.streamlit.app',
    methodology: {
      sections: [
        {
          heading: 'Universe and weights',
          body: 'Two custom portfolios (A and B) are built from user-selected tickers and weights and compared side by side against a chosen benchmark — SPY by default. Weights are validated to sum to 100% before any statistic is computed.',
        },
        {
          heading: 'Return preparation',
          body: 'Daily adjusted closes are converted to daily returns. Each portfolio’s return on a given day is the weight-sum of its constituent returns. The user picks the lookback period that fixes the sample window for every metric.',
        },
        {
          heading: 'Performance and risk metrics',
          body: 'Standard performance and risk metrics are computed independently for portfolio A, portfolio B, and the benchmark.',
          bullets: [
            'Cumulative-return and drawdown paths over the selected window.',
            'Sharpe, Sortino, and Calmar ratios for risk-adjusted comparison.',
            'VaR and CVaR at user-configured confidence levels to size tail risk.',
          ],
        },
        {
          heading: 'Benchmark-relative statistics',
          body: 'Each portfolio is regressed against the chosen benchmark to produce a consistent set of relative statistics.',
          bullets: [
            'Beta and R-squared describe sensitivity to and explained variance with the benchmark.',
            'Alpha is the intercept of the same regression — return in excess of what beta would predict.',
            'Information ratio compares active return to active risk versus the benchmark.',
            'Correlation reports co-movement alongside R-squared for completeness.',
          ],
        },
        {
          heading: 'Rolling and cross-asset diagnostics',
          body: 'Static metrics are paired with rolling and pairwise views so stability over time is visible.',
          bullets: [
            'Rolling beta and rolling Sharpe over a configurable window show how the relationship evolves.',
            'A correlation matrix between portfolios, benchmark, and selected constituents surfaces overlap and diversification.',
            'A relative-performance overlay rebases A, B, and benchmark to a common starting value for direct visual comparison.',
          ],
        },
        {
          heading: 'Interpretation discipline',
          bullets: [
            'Short windows are more reactive but noisier.',
            'Long windows are more stable but slower to reflect new regimes.',
            'Compare across windows to see whether beta, Sharpe, and correlation relationships are stable or shifting.',
          ],
        },
      ],
    },
    order: 2,
  },
  {
    slug: 'beta-correlation-quant',
    title: 'Beta & Correlation Analysis',
    summary:
      'Beta, correlation, and Sharpe analytics across a multi-asset universe with ranked tables and visual diagnostics against a chosen benchmark.',
    tags: ['Streamlit', 'Beta', 'Correlation', 'Sharpe', 'Risk', 'Python'],
    status: 'live',
    streamlitUrl: 'https://asset-analyticsyoy.streamlit.app',
    methodology: {
      sections: [
        {
          heading: 'Universe construction',
          body: 'The comparison universe is built from S&P 500 constituents, Nasdaq-100 constituents, exchange-traded funds, and ADRs — roughly 600 tickers in total. The user selects which subset to evaluate before any statistic is computed.',
        },
        {
          heading: 'Return preparation',
          body: 'Daily prices are converted into simple or log returns based on the configured setting. The active lookback window — 1W, 2W, 1M, 2M, 1Q, 6M, 1Y, or 2Y — fixes the sample used for every estimate that follows.',
        },
        {
          heading: 'Benchmark-relative statistics',
          body: 'Beta and correlation are computed against the selected benchmark (SPY by default, with QQQ and IWM also available).',
          bullets: [
            'Beta estimates the sensitivity of an asset’s returns to the benchmark’s returns.',
            'Correlation measures co-movement with the benchmark, and pairwise across assets in the matrix view.',
            'Correlation describes co-movement only; it does not measure position size or directional exposure magnitude.',
          ],
        },
        {
          heading: 'Risk-adjusted ranking',
          bullets: [
            'Sharpe ratios use the configured annual risk-free rate, the selected return method, and the active lookback window.',
            'Rankings shift with the window length and the simple/log return setting; both choices are exposed in the UI.',
            'Sharpe is a descriptive diagnostic for cross-asset comparison, not a standalone trading signal.',
          ],
        },
        {
          heading: 'Relative performance',
          body: 'Normalized price paths rebase every selected asset to a common starting value over the chosen period. Top and bottom performers are read directly from the same baseline so visual comparisons are like-for-like.',
        },
        {
          heading: 'Interpretation discipline',
          bullets: [
            'Short windows are more reactive but noisier.',
            'Long windows are more stable but slower to reflect new regimes.',
            'Multi-period comparison shows whether beta, correlation, and Sharpe relationships are stable across horizons or shifting.',
          ],
        },
      ],
    },
    order: 3,
  },
  {
    slug: 'macd-breadth-indicator',
    title: 'MACD-V Breadth Indicator (Volatility-Normalized Momentum)',
    summary:
      'Market breadth dashboard analyzing S&P 500 constituents using volatility-normalized MACD-V with Wilder ATR smoothing. Visualizes momentum regimes, bull/bear ratios, and histogram breadth. Reference: Spiroglou, "MACD-V: Volatility Normalised Momentum" (SSRN 4099617).',
    tags: ['Streamlit', 'Technical Analysis', 'Breadth', 'Momentum', 'Python'],
    status: 'live',
    streamlitUrl: 'https://macd-v-breadthwild.streamlit.app',
    methodology: {
      sections: [
        {
          heading: 'Breadth universe',
          body: 'MACD-V is computed for each S&P 500 constituent independently, then the per-stock readings are aggregated into market-wide breadth measures. The dashboard surfaces participation across the index rather than any single name’s signal, and runs over a configurable historical window — 1Y, 3Y, 5Y, 10Y, or full available history.',
        },
        {
          heading: 'Indicator construction',
          body: 'MACD-V — Volatility Normalised Momentum (Spiroglou, SSRN 4099617) — scales the difference between a short and a long EMA by ATR so momentum readings are comparable across securities with very different volatility profiles.',
          bullets: [
            'MACD-V = ((EMA(12) − EMA(26)) / ATR(26)) × 100',
            'ATR(26) uses Welles Wilder smoothing.',
            'EMA short, EMA long, and ATR length are exposed as configurable parameters.',
          ],
        },
        {
          heading: 'Signal and histogram',
          bullets: [
            'Signal = EMA(9) of MACD-V; the signal-EMA length is configurable.',
            'MACD-VH = MACD-V − Signal — the histogram is the spread between the indicator and its signal line.',
            'Histogram breadth counts how many constituents sit above or below the chosen overbought/oversold histogram thresholds.',
          ],
        },
        {
          heading: 'Momentum buckets',
          body: 'Each constituent’s MACD-V reading is assigned to a momentum bucket; threshold boundaries are configurable. Defaults:',
          bullets: [
            'Extreme — readings above +150 (overbought) or below −150 (oversold).',
            'Strong — readings between +50 and +150, or between −50 and −150.',
            'Weak / neutral — readings between −50 and +50.',
            'Histogram stretched — MACD-VH above +40 (overbought) or below −40 (oversold).',
          ],
        },
        {
          heading: 'Breadth panels',
          body: 'The dashboard renders six aggregate views, all driven by the same per-constituent MACD-V series.',
          bullets: [
            'S&P 500 trend context — index price with 20 / 50 / 100 / 200 EMAs; background bands shade the visible trend regime.',
            'Bull % vs bear % — share of constituents currently bullish vs bearish on MACD-V.',
            'Bull / bear ratio — same data plotted as a ratio on a log scale.',
            'Momentum strength distribution — extreme / strong / weak buckets shown as a stacked area over time.',
            'Net momentum indicator — bulls minus bears expressed as a single net series.',
            'Histogram overbought/oversold — share of constituents whose MACD-VH is stretched past the configured thresholds.',
          ],
        },
        {
          heading: 'Interpretation discipline',
          bullets: [
            'The dashboard reports breadth — participation and momentum aggregated across the index — not a single-name trading signal.',
            'Extreme breadth readings can persist for extended periods during strong trends.',
            'Breadth that deteriorates while the index is still rising can warn that index-level strength is narrowing.',
            'Parameter changes shift sensitivity: shorter EMAs and ATR react faster but raise the noise floor; longer windows are smoother but slower.',
          ],
        },
      ],
    },
    order: 4,
  },
  {
    slug: 'return-observations',
    title: 'Return Analysis',
    summary:
      'Return-distribution analysis covering rolling and EWMA volatility, z-scores with reference bands, and drawdown-free streak counts for one or more selected tickers at daily, weekly, or monthly frequency.',
    tags: ['Streamlit', 'Return Analysis', 'Volatility', 'Z-score', 'Python'],
    status: 'live',
    streamlitUrl: 'https://returnobs-yoy.streamlit.app',
    methodology: {
      sections: [
        {
          heading: 'Return series construction',
          body: 'Selected ticker price histories are converted into daily, weekly, or monthly return series based on the chosen frequency. The start and end date inputs fix the analysis window before any statistic is computed. Multiple tickers can be entered at once as a comma- or space-separated list, so several names can be compared in one pass.',
        },
        {
          heading: 'Distribution view',
          body: 'The return distribution chart plots the empirical histogram of historical returns over the chosen window, with mean and ±σ reference lines overlaid so central tendency and tail observations are easy to locate at a glance.',
        },
        {
          heading: 'Volatility estimation',
          body: 'Two volatility estimators are exposed; either can be de-meaned via a toggle.',
          bullets: [
            'Rolling volatility uses a fixed lookback window of N observations; the window length is configurable.',
            'EWMA volatility applies exponential decay so recent observations receive more weight than older ones.',
            'The λ parameter controls how slowly the EWMA estimate adapts — higher λ means slower decay and more weight on historical observations.',
          ],
        },
        {
          heading: 'Z-score normalization',
          body: 'Each return is divided by the current volatility estimate to produce a z-score. Reference bands at ±1σ, ±2σ, and ±3σ make it easy to spot observations that are unusually large in either direction given the prevailing volatility level.',
        },
        {
          heading: 'Streak analysis',
          body: 'Streak analysis counts the number of consecutive periods in which the return did not fall below a configurable drop threshold. It surfaces how long a ticker has gone without a material downside move at the selected frequency.',
        },
        {
          heading: 'Summary statistics',
          body: 'A summary table consolidates the return, volatility, distribution, and streak diagnostics across the selected tickers so they can be compared side by side rather than read one chart at a time.',
        },
        {
          heading: 'Interpretation discipline',
          bullets: [
            'Distribution and z-score views are historical diagnostics, not forecasts of forward returns.',
            'Daily, weekly, and monthly frequencies can tell different stories — a quiet daily series may still show stretched weekly or monthly tails.',
            'EWMA reacts faster to recent volatility changes; rolling volatility is easier to interpret but more dependent on the chosen window length.',
            'A long streak without a large drop can indicate trend persistence, but it can also be fragility waiting to express itself if volatility expands.',
          ],
        },
      ],
    },
    order: 5,
  },
  {
    slug: 'seasonality-terminal',
    title: 'Seasonality Terminal',
    summary:
      'Calendar-effect analysis with monthly return distributions, stability metrics, and rolling regime overlays for any ticker. Surfaces persistent month-of-year anomalies across equities and ETFs.',
    tags: ['Streamlit', 'Seasonality', 'Statistics', 'Returns', 'Python'],
    status: 'live',
    streamlitUrl: 'https://seasonality-terminalyoy.streamlit.app',
    methodology: {
      sections: [
        {
          heading: 'Return and level construction',
          body: 'The selected ticker’s price history is aggregated into monthly observations. For standard total-return assets the calculation is the monthly return. For ^VIX, the dashboard automatically switches to point change (Δ) or level mode because VIX is an index level rather than a total-return security — applying percent-return math to it would distort the seasonality readout.',
        },
        {
          heading: 'Seasonality heatmap',
          body: 'The heatmap arranges observations on a year × month grid. Each cell shows that month’s value — return, point change, or level depending on the selected mode — coloured by sign and magnitude. Trailing averages by month sit alongside the grid so recent seasonal behaviour can be read against the longer record.',
        },
        {
          heading: 'Stability metrics',
          body: 'For every calendar month, the dashboard reports a set of summary statistics that separate central tendency from consistency and dispersion.',
          bullets: [
            'Mean and median — average and middle of the monthly distribution.',
            'Hit rate — share of years in which the month closed positive.',
            'Downside frequency — share of years in which the month closed below a chosen threshold.',
            'Interquartile range (IQR) — width of the middle 50% of historical observations.',
          ],
        },
        {
          heading: 'Rolling regime analysis',
          body: 'The rolling regime panel tracks how one selected month evolves through time. By recomputing the chosen statistic over a sliding window, it shows whether a seasonal pattern is persistent across decades or whether it lived in a single historical era.',
        },
        {
          heading: 'Distribution view',
          body: 'Monthly boxplots show the full distribution of historical outcomes by calendar month side by side. An optional jitter overlay scatters individual yearly observations on top of each box, so single-year outliers and clustering are both visible.',
        },
        {
          heading: 'Interpretation discipline',
          bullets: [
            'Seasonality is descriptive — a historical record of calendar behaviour, not a standalone forecast.',
            'A month with a high average can still have large dispersion; mean alone undersells the variation.',
            'Hit rate and downside frequency add a consistency lens that average return cannot provide on its own.',
            'Rolling windows help distinguish patterns that hold across multiple historical regimes from those that only existed in one window.',
            'VIX requires the level / point-change mode because percent returns on an index level are not directly comparable to those on a total-return security.',
          ],
        },
      ],
    },
    order: 6,
  },
  {
    slug: 'macro-economic-modeling',
    title: 'Macroeconomic Modeling',
    summary:
      'Dashboard analyzing CPI, PCE, GDP from FRED with inflation momentum, scenario projections, and Growth vs Inflation quadrant analysis.',
    tags: ['Streamlit', 'Macro', 'FRED', 'Python'],
    status: 'live',
    streamlitUrl: 'https://macroeconomicmodelingyoy.streamlit.app',
    methodology: {
      sections: [
        {
          heading: 'Data source and series selection',
          body: 'All series are pulled from the Federal Reserve Economic Data (FRED) API. The dashboard concentrates on inflation, growth, and activity — specifically CPI, PCE, real GDP, industrial production, and real personal consumption expenditures.',
        },
        {
          heading: 'Inflation block',
          body: 'CPI and PCE measures are compared side by side. Headline and core indexes are tracked alongside year-over-year change and a 3-month rolling momentum overlay. Annualized inflation rates over 12, 6, and 3-month windows surface near-term acceleration or deceleration relative to the trend.',
        },
        {
          heading: 'PCE momentum and scenarios',
          body: 'The PCE section isolates headline and core PCE momentum and overlays conditional scenario paths. Each scenario specifies a near-term monthly change and the chart shows the resulting year-over-year inflation trajectory, so the sensitivity of the YoY path to upcoming prints is visible.',
        },
        {
          heading: 'Growth and activity block',
          body: 'Real GDP is tracked on two complementary bases: year-over-year growth and quarter-over-quarter annualized growth. Industrial production and real personal consumption expenditures are each shown in levels and as year-over-year change, so cycle position and momentum can be read alongside each other.',
        },
        {
          heading: 'Relationship analysis',
          body: 'An OLS regression estimates the relationship between real GDP growth and CPI inflation momentum. The fit and residuals are descriptive: they summarise the historical co-movement between the two series, not a forecast of either.',
        },
        {
          heading: 'Interpretation discipline',
          bullets: [
            'Macroeconomic series are released at different frequencies — CPI and PCE monthly, GDP quarterly, industrial production monthly — and many are revised after first publication.',
            'Annualized short-window inflation rates (3M and 6M) react sharply to recent monthly prints and can diverge from the 12M trend.',
            'Scenario paths are conditional illustrations of how the YoY series would evolve under a stated input — not predictions.',
            'Regression relationships between growth and inflation can shift across cycles; coefficients estimated over one period may not hold in another.',
          ],
        },
      ],
      references: [
        'Data source · FRED API (Federal Reserve Bank of St. Louis).',
        'CPIAUCSL · Consumer Price Index for All Urban Consumers, all items.',
        'CPILFESL · CPI, all items less food and energy (core CPI).',
        'PCEPI · Personal Consumption Expenditures Chain-Type Price Index (headline PCE).',
        'PCEPILFE · PCE Price Index excluding food and energy (core PCE).',
        'GDPC1 · Real Gross Domestic Product (chained 2017 dollars).',
        'INDPRO · Industrial Production Index.',
        'PCECC96 · Real Personal Consumption Expenditures.',
      ],
    },
    order: 7,
  },
  {
    slug: 'try-carry-trade',
    title: 'TRY Carry Trade Analysis',
    summary:
      'Monte Carlo simulation and regime-conditioned modeling of the Turkish Lira carry trade. Generates 10,000 forward paths under GBM with state-dependent volatility, and decomposes realised returns into carry, spot, and regime components.',
    tags: ['Streamlit', 'FX', 'Monte Carlo', 'Python'],
    status: 'live',
    streamlitUrl: 'https://try-carry-trade-appgit-yigityalcin.streamlit.app',
    order: 8,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
