import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="brand brand-dark">
            YOY<span className="brand-dot" />
            <span className="brand-it">online</span>
          </div>
          <div className="footer-tag">Capital · Markets · Models</div>
        </div>
        <div className="footer-cols">
          <div>
            <div className="footer-h">Models</div>
            <Link href="/projects/ma-distance-percentile">MA Distance %ile</Link>
            <Link href="/projects/portfolio-analytics-dashboard">Portfolio Risk &amp; Return</Link>
            <Link href="/projects/beta-correlation-quant">Beta &amp; Correlation</Link>
            <Link href="/projects/seasonality-terminal">Seasonality</Link>
          </div>
          <div>
            <div className="footer-h">Research</div>
            <span className="footer-soon">Macro notes · soon</span>
            <span className="footer-soon">Trade ideas · soon</span>
            <span className="footer-soon">Methodology · soon</span>
          </div>
          <div>
            <div className="footer-h">Connect</div>
            <span className="footer-soon">LinkedIn ↗</span>
            <span className="footer-soon">GitHub ↗</span>
            <span className="footer-soon">RSS ↗</span>
          </div>
        </div>
      </div>
      <div className="footer-base container">
        <span>© YOY ONLINE · {year}</span>
        <span>Built for analysis.</span>
      </div>
    </footer>
  );
}
