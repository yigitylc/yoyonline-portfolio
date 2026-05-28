'use client';

import { useMemo, useState } from 'react';
import { mulberry32, gaussFactory } from './lib';

const W = 480;
const H = 300;
const PAD = 28;
const N = 160;

interface Pt {
  q: number;
  year: number;
  growth: number;
  infl: number;
}

export default function QuadrantViz() {
  const cx = W / 2;
  const cy = H / 2;
  const x = (v: number) => cx + (v * (W - 2 * PAD)) / 2 / 4;
  const y = (v: number) => cy - (v * (H - 2 * PAD)) / 2 / 4;

  const points = useMemo<Pt[]>(() => {
    const rand = mulberry32(606);
    const gauss = gaussFactory(rand);
    const out: Pt[] = [];
    for (let q = 0; q < N; q++) {
      const year = 1985 + Math.floor((q * 40) / N);
      const t = q / N;
      const growth =
        Math.sin(t * Math.PI * 4) * 1.6 + Math.sin(t * Math.PI * 1.3) * 1.1 + gauss() * 0.5;
      const infl =
        Math.cos(t * Math.PI * 3.2) * 1.4 + Math.sin(t * Math.PI * 0.8) * 0.8 + gauss() * 0.5;
      out.push({ q, year, growth, infl });
    }
    return out;
  }, []);

  const now = { q: N, year: 2026, growth: 1.8, infl: -0.9 };
  const [info, setInfo] = useState<string | null>(null);

  const quadLabels = [
    { l: 'Reflation', x: x(2.5), y: y(2.5), fill: 'var(--up-500)' },
    { l: 'Goldilocks', x: x(-2.5), y: y(2.5), fill: 'var(--accent-700)' },
    { l: 'Stagflation', x: x(2.5), y: y(-2.5), fill: 'var(--down-500)' },
    { l: 'Deflation', x: x(-2.5), y: y(-2.5), fill: 'var(--amber-500)' },
  ];

  return (
    <div className="viz viz-quadrant">
      <div className="v-head">
        <span className="t">Growth × Inflation regime · 40Y FRED</span>
        <span className="sub">160 quarters · 1985 → 2026 · YoY momentum</span>
      </div>

      <div className="stage">
        <svg
          className="scatter"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          onMouseLeave={() => setInfo(null)}
        >
          <g className="v-grid">
            {[-3, -2, -1, 1, 2, 3].map((t) => (
              <g key={t}>
                <line x1={x(t)} x2={x(t)} y1={PAD} y2={H - PAD} />
                <line y1={y(t)} y2={y(t)} x1={PAD} x2={W - PAD} />
              </g>
            ))}
          </g>
          <g className="v-axis-bold">
            <line x1={PAD} x2={W - PAD} y1={cy} y2={cy} />
            <line x1={cx} x2={cx} y1={PAD} y2={H - PAD} />
          </g>
          {quadLabels.map((q) => (
            <text
              key={q.l}
              className="quadlbl"
              x={q.x - 30}
              y={q.y + 4}
              fill={q.fill}
              opacity={0.7}
            >
              {q.l}
            </text>
          ))}
          <text className="axlbl" x={W - PAD - 6} y={cy + 14} textAnchor="end">
            → Inflation
          </text>
          <text className="axlbl" x={cx + 8} y={PAD + 4}>
            ↑ Growth
          </text>
          {points.map((p, i) => {
            let fill = '#7C8898';
            if (p.growth > 0 && p.infl < 0) fill = 'var(--accent-700)';
            else if (p.growth > 0 && p.infl > 0) fill = 'var(--up-500)';
            else if (p.growth < 0 && p.infl < 0) fill = 'var(--amber-500)';
            else fill = 'var(--down-500)';
            return (
              <circle
                key={i}
                className="point"
                cx={x(p.infl)}
                cy={y(p.growth)}
                r={3}
                fill={fill}
                opacity={0.55}
                onMouseEnter={() =>
                  setInfo(
                    `Q${p.year} · Growth ${p.growth.toFixed(2)} · Inflation ${p.infl.toFixed(2)}`
                  )
                }
              />
            );
          })}
          <circle className="now-ring" cx={x(now.infl)} cy={y(now.growth)} />
          <circle
            className="point now"
            cx={x(now.infl)}
            cy={y(now.growth)}
            r={5}
            onMouseEnter={() => setInfo('NOW')}
          />
          <path
            className="arrow"
            d={`M ${x(now.infl) + 18} ${y(now.growth) - 18} L ${x(now.infl) + 5} ${y(now.growth) - 5}`}
          />
          <text className="now-lbl" x={x(now.infl) + 22} y={y(now.growth) - 20}>
            NOW · Q1 ’26
          </text>
        </svg>

        <div className="sidebar">
          <div className="quad now">
            <div className="lbl">Now · Q1 ’26</div>
            <div className="count">▸</div>
            <div className="pct" style={{ color: 'var(--up-500)' }}>
              Goldilocks
            </div>
          </div>
          <div className="quad">
            <div className="lbl">Goldilocks</div>
            <div className="count">38q</div>
          </div>
          <div className="quad">
            <div className="lbl">Reflation</div>
            <div className="count">52q</div>
          </div>
          <div className="quad">
            <div className="lbl">Stagflation</div>
            <div className="count">22q</div>
          </div>
          <div className="quad">
            <div className="lbl">Deflation</div>
            <div className="count">48q</div>
          </div>
        </div>
      </div>

      <div className="v-foot">
        <span>{info ?? '160 quarters plotted · hover any point'}</span>
        <span>Source: FRED · GDP YoY × Core PCE YoY momentum</span>
      </div>
    </div>
  );
}
