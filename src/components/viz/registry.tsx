import type { ReactNode } from 'react';
import CumulativeReturnsViz from './CumulativeReturnsViz';
import BetaCorrelationPreview from '@/components/previews/BetaCorrelationPreview';
import MacdBreadthViz from './MacdBreadthViz';
import ReturnDistributionViz from './ReturnDistributionViz';
import SeasonalityViz from './SeasonalityViz';
import QuadrantViz from './QuadrantViz';
import MonteCarloViz from './MonteCarloViz';
import YieldCurveViz from './YieldCurveViz';
import MaDistanceViz from './MaDistanceViz';

// Maps each project slug to one or more visualization previews mirroring
// the live Streamlit dashboard. Slugs without an entry render no preview.
export function vizForSlug(slug: string): ReactNode {
  switch (slug) {
    case 'ma-distance-percentile':
      return <MaDistanceViz />;
    case 'portfolio-analytics-dashboard':
      return <CumulativeReturnsViz />;
    case 'beta-correlation-quant':
      return <BetaCorrelationPreview />;
    case 'macd-breadth-indicator':
      return <MacdBreadthViz />;
    case 'return-observations':
      return <ReturnDistributionViz />;
    case 'seasonality-terminal':
      return <SeasonalityViz />;
    case 'macro-economic-modeling':
      return (
        <>
          <QuadrantViz />
          <YieldCurveViz />
        </>
      );
    case 'try-carry-trade':
      return <MonteCarloViz />;
    default:
      return null;
  }
}
