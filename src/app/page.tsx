import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';
import { projects } from '@/data/projects';

const capabilities = [
  {
    tag: 'Models',
    title: 'Quantitative Models',
    body: 'Portfolio analytics, risk metrics, and systematic trading strategies built with Python.',
    stat: { v: '7', l: 'live dashboards' },
  },
  {
    tag: 'Tools',
    title: 'Interactive Dashboards',
    body: 'Live Streamlit applications for exploring market data, signals, and performance.',
    stat: { v: 'Python', l: 'Streamlit stack' },
  },
  {
    tag: 'Research',
    title: 'Macro Research',
    body: 'Economic indicators, regime analysis, and cross-asset views using FRED and market data.',
    stat: { v: '40Y', l: 'history depth' },
  },
];

function HeroChart() {
  const points =
    '0,180 60,176 120,168 180,172 240,158 300,162 360,140 420,144 480,124 540,128 600,108 660,114 720,92 780,96 840,72 900,76 960,58 1020,62 1080,40 1140,46 1180,28';
  const area =
    'M0,180 L60,176 L120,168 L180,172 L240,158 L300,162 L360,140 L420,144 L480,124 L540,128 L600,108 L660,114 L720,92 L780,96 L840,72 L900,76 L960,58 L1020,62 L1080,40 L1140,46 L1180,28 L1180,210 L0,210 Z';
  return (
    <svg
      className="hero-chart"
      viewBox="0 0 1180 210"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#137A3F" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#137A3F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="hero-grid">
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" y1={y} x2="1180" y2={y} />
        ))}
      </g>
      <path d={area} fill="url(#hero-g)" className="hero-area" />
      <polyline
        points={points}
        fill="none"
        stroke="#137A3F"
        strokeWidth="1.6"
        className="hero-line"
      />
    </svg>
  );
}

export default function Home() {
  const sorted = [...projects].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );
  const featured = sorted.slice(0, 3);
  const totalLive = projects.filter((p) => p.status === 'live').length;

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <HeroChart />
        </div>
        <div className="container hero-inner">
          <div className="eyebrow hero-eyebrow">
            <span className="hero-dot" /> § YOY · ONLINE
          </div>
          <h1 className="hero-title">
            Financial tools
            <br />
            <em>for markets.</em>
          </h1>
          <p className="hero-lead">
            Quantitative finance models, interactive dashboards, and macro
            research.
            <br />
            Built for analysis.
          </p>
          <div className="hero-cta">
            <Link href="/projects" className="btn btn-primary">
              View all projects <span className="arr">→</span>
            </Link>
            <a href="#capabilities" className="btn btn-ghost">
              Read methodology
            </a>
          </div>
        </div>
      </section>

      {/* WHAT YOU WILL FIND */}
      <section id="capabilities" className="container section">
        <div className="section-head">
          <div className="eyebrow">§ 01 · Capabilities</div>
          <h2 className="section-title">What you will find here</h2>
          <p className="section-lead">
            A collection of quantitative tools and research covering markets,
            macro, and systematic strategies. Every model ships with
            documentation and a live interactive dashboard.
          </p>
        </div>
        <div className="cap-grid">
          {capabilities.map((c) => (
            <div className="cap-card" key={c.title}>
              <div className="cap-tag">{c.tag}</div>
              <h3 className="cap-title">{c.title}</h3>
              <p className="cap-body">{c.body}</p>
              <div className="cap-stat">
                <span className="num">{c.stat.v}</span>
                <span className="cap-stat-l">{c.stat.l}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED MODELS */}
      <section className="container section">
        <div className="section-head row-head">
          <div>
            <div className="eyebrow">§ 02 · Featured</div>
            <h2 className="section-title">Latest models</h2>
          </div>
          <Link className="see-all" href="/projects">
            See all {totalLive} models →
          </Link>
        </div>
        <div className="proj-grid">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      {/* RESEARCH */}
      <section className="container section">
        <div className="section-head">
          <div className="eyebrow">§ 03 · Research and writing</div>
          <h2 className="section-title">
            Notes from the desk <span className="soon">Coming Soon</span>
          </h2>
          <p className="section-lead">
            Longer-form content on markets, models, and methodology. What to
            expect:
          </p>
          <ul className="research-list">
            <li>
              <span className="bullet">▸</span> Macro notes on inflation
              regimes, yield curves, and central bank policy
            </li>
            <li>
              <span className="bullet">▸</span> Trade ideas and position
              rationale with risk/reward analysis
            </li>
            <li>
              <span className="bullet">▸</span> Model documentation and
              methodology writeups
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="container section cta-section">
        <p className="cta-body">
          Explore the projects to see live dashboards and detailed
          documentation.
        </p>
        <Link href="/projects" className="btn btn-primary btn-lg">
          Browse all projects <span className="arr">→</span>
        </Link>
      </section>
    </div>
  );
}
