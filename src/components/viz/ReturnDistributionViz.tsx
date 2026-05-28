'use client';

import { useMemo } from 'react';
import { mulberry32, gaussFactory, fmtSignedPct } from './lib';

const W = 700;
const H = 220;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 22;
const BIN_W = 0.25;
const MIN_B = -4;
const MAX_B = 4;

export default function ReturnDistributionViz() {
  const { binVals, mu, sigma, skew, kurt, var95, var99, maxN } = useMemo(() => {
    const rand = mulberry32(909);
    const gauss = gaussFactory(rand);
    const returns: number[] = [];
    for (let i = 0; i < 252; i++) {
      let z = gauss();
      if (rand() < 0.04) z *= 2.8;
      if (rand() < 0.02) z -= 1.5;
      returns.push(0.05 + z * 1.0);
    }
    const bins: Record<string, number> = {};
    for (let v = MIN_B; v <= MAX_B; v += BIN_W) bins[v.toFixed(2)] = 0;
    returns.forEach((r) => {
      const b = Math.max(MIN_B, Math.min(MAX_B - BIN_W, Math.floor(r / BIN_W) * BIN_W));
      bins[b.toFixed(2)] = (bins[b.toFixed(2)] || 0) + 1;
    });
    const binVals = Object.entries(bins)
      .map(([k, v]) => ({ x: +k, n: v }))
      .sort((a, b) => a.x - b.x);

    const mu = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance = returns.reduce((s, r) => s + (r - mu) ** 2, 0) / returns.length;
    const sigma = Math.sqrt(variance);
    const skew = returns.reduce((s, r) => s + ((r - mu) / sigma) ** 3, 0) / returns.length;
    const kurt = returns.reduce((s, r) => s + ((r - mu) / sigma) ** 4, 0) / returns.length;
    const sorted = [...returns].sort((a, b) => a - b);
    const var95 = sorted[Math.floor(252 * 0.05)];
    const var99 = sorted[Math.floor(252 * 0.01)];
    const maxN = Math.max(...binVals.map((b) => b.n));

    return { binVals, mu, sigma, skew, kurt, var95, var99, maxN };
  }, []);

  const x = (v: number) => PAD_L + ((v - MIN_B) / (MAX_B - MIN_B)) * (W - PAD_L - PAD_R);
  const y = (n: number) => PAD_T + (1 - n / maxN) * (H - PAD_T - PAD_B);
  const xw = (W - PAD_L - PAD_R) / ((MAX_B - MIN_B) / BIN_W) - 1.5;

  const totalArea = 252 * BIN_W;
  const fy = (v: number) => {
    const z = (v - mu) / sigma;
    return (totalArea * Math.exp(-0.5 * z * z)) / (sigma * Math.sqrt(2 * Math.PI));
  };
  let normalPath = '';
  for (let v = MIN_B; v <= MAX_B; v += 0.05) {
    normalPath += (normalPath === '' ? 'M' : 'L') + x(v).toFixed(1) + ',' + y(fy(v)).toFixed(1) + ' ';
  }

  return (
    <div className="viz viz-retdist">
      <div className="v-head">
        <span className="t">
          SPY daily return distribution
          <span className="v-legend">
            <span className="sw">
              <span className="ln" /> N(μ,σ²)
            </span>
            <span className="sw">
              <span className="ln" style={{ borderColor: 'var(--down-500)' }} /> VaR
            </span>
          </span>
        </span>
        <span className="sub">252d · 0.25% bins</span>
      </div>

      <svg viewBox="0 0 700 220" preserveAspectRatio="none" style={{ height: 220 }}>
        <g className="v-grid">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const ny = PAD_T + (1 - t) * (H - PAD_T - PAD_B);
            return <line key={t} x1={PAD_L} x2={W - PAD_R} y1={ny} y2={ny} />;
          })}
        </g>
        <g className="v-axis">
          {[-4, -2, 0, 2, 4].map((v) => (
            <text key={v} x={x(v) - 6} y={H - 6}>
              {(v >= 0 ? '+' : '−') + Math.abs(v) + '%'}
            </text>
          ))}
          {[0, Math.floor(maxN / 2), maxN].map((n) => (
            <text key={n} x={4} y={y(n) + 3}>
              {n}
            </text>
          ))}
        </g>
        {binVals.map((b) => {
          if (b.n === 0) return null;
          const cls = b.x < -0.5 ? 'neg' : b.x > 0.5 ? 'pos' : '';
          return (
            <rect
              key={b.x}
              className={`bar ${cls}`}
              x={x(b.x) + 0.7}
              y={y(b.n)}
              width={xw}
              height={H - PAD_B - y(b.n)}
            />
          );
        })}
        <path className="normal" d={normalPath} />
        {[
          { v: var95, lbl: 'VaR 95', stroke: 'var(--down-500)' },
          { v: var99, lbl: 'VaR 99', stroke: 'var(--down-700)' },
        ].map(({ v, lbl, stroke }) => (
          <g key={lbl}>
            <line
              className="var"
              x1={x(v)}
              x2={x(v)}
              y1={PAD_T}
              y2={H - PAD_B}
              stroke={stroke}
            />
            <text className="var-lbl" x={x(v) - 28} y={PAD_T + 12} fill={stroke}>
              {lbl}
            </text>
          </g>
        ))}
      </svg>

      <div className="stats">
        <div className="stat">
          <div className="l">μ daily</div>
          <div className={`v ${mu >= 0 ? 'up' : 'down'}`}>{fmtSignedPct(mu)}</div>
        </div>
        <div className="stat">
          <div className="l">σ daily</div>
          <div className="v">{sigma.toFixed(2)}%</div>
        </div>
        <div className="stat">
          <div className="l">Skew</div>
          <div className={`v ${skew >= 0 ? 'up' : 'down'}`}>{skew.toFixed(2)}</div>
        </div>
        <div className="stat">
          <div className="l">Kurt</div>
          <div className="v">{kurt.toFixed(2)}</div>
        </div>
        <div className="stat">
          <div className="l">VaR-95</div>
          <div className="v down">{fmtSignedPct(var95)}</div>
        </div>
        <div className="stat">
          <div className="l">VaR-99</div>
          <div className="v down">{fmtSignedPct(var99)}</div>
        </div>
      </div>
    </div>
  );
}
