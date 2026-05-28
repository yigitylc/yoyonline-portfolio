'use client';

import { useMemo } from 'react';
import { mulberry32, gaussFactory } from './lib';

const N = 503;
const W = 700;
const H = 160;
const PAD_L = 30;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 22;

export default function MacdBreadthViz() {
  const data = useMemo(() => {
    const rand = mulberry32(404);
    const gauss = gaussFactory(rand);
    const arr: number[] = [];
    for (let i = 0; i < N; i++) {
      let z = gauss();
      let v = z * 60 + 25;
      if (rand() < 0.05) v += (rand() - 0.3) * 120;
      arr.push(v);
    }
    arr.sort((a, b) => a - b);
    return arr;
  }, []);

  const minV = Math.min(-200, ...data);
  const maxV = Math.max(200, ...data);
  const absMax = Math.max(Math.abs(minV), Math.abs(maxV));
  const x = (i: number) => PAD_L + (i / (N - 1)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - (v - -absMax) / (2 * absMax)) * (H - PAD_T - PAD_B);
  const zeroY = y(0);
  const barW = Math.max(0.8, (W - PAD_L - PAD_R) / N - 0.4);

  return (
    <div className="viz viz-macd">
      <div className="v-head">
        <span className="t">MACD-V breadth · S&amp;P 500 constituents</span>
        <span className="sub">503 names · sorted · vol-normalised</span>
      </div>

      <div className="kpi-strip">
        <div className="kpi-cell">
          <span className="l">Bull %</span>
          <span className="v up">62.4%</span>
        </div>
        <div className="kpi-cell">
          <span className="l">Bear %</span>
          <span className="v down">21.8%</span>
        </div>
        <div className="kpi-cell">
          <span className="l">Neutral</span>
          <span className="v">15.8%</span>
        </div>
        <div className="kpi-cell">
          <span className="l">Regime · 14d</span>
          <span className="regime">● Risk-on</span>
        </div>
      </div>

      <svg viewBox="0 0 700 160" preserveAspectRatio="none" style={{ height: 160 }}>
        {['80', '150'].map((bv) => {
          const b = +bv;
          return (
            <rect
              key={bv}
              className="band"
              x={PAD_L}
              y={y(b)}
              width={W - PAD_L - PAD_R}
              height={y(-b) - y(b)}
              opacity={0.12}
            />
          );
        })}
        <g className="v-grid">
          {[-150, -80, 0, 80, 150].map((v) => {
            const yy = y(v);
            return (
              <line
                key={v}
                x1={PAD_L}
                x2={W - PAD_R}
                y1={yy}
                y2={yy}
                className={v === 0 ? 'v-zero' : ''}
              />
            );
          })}
        </g>
        <g className="v-axis">
          {[-150, -80, 0, 80, 150].map((v) => (
            <text key={v} x={4} y={y(v) + 3}>
              {(v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v)}
            </text>
          ))}
        </g>
        {data.map((v, i) => {
          const xv = x(i);
          const top = v >= 0 ? y(v) : zeroY;
          const h = Math.abs(y(v) - zeroY);
          let fill = '#7C8898';
          if (v > 80) fill = 'var(--up-500)';
          else if (v < -80) fill = 'var(--down-500)';
          else if (v > 0) fill = 'var(--up-300)';
          else fill = 'var(--down-300)';
          return (
            <rect
              key={i}
              className="bar"
              x={xv}
              y={top}
              width={barW}
              height={h}
              fill={fill}
            />
          );
        })}
        <text
          x={PAD_L}
          y={H - 6}
          fontFamily="var(--font-mono)"
          fontSize={9}
          fill="var(--fg-tertiary)"
          letterSpacing="0.06em"
        >
          0
        </text>
        <text
          x={W - PAD_R - 20}
          y={H - 6}
          fontFamily="var(--font-mono)"
          fontSize={9}
          fill="var(--fg-tertiary)"
        >
          {N}
        </text>
      </svg>

      <div className="v-foot">
        <span>← Most bearish ‖ Most bullish →</span>
        <span>
          <span style={{ color: 'var(--ink-900)' }}>▲ +120</span> ·{' '}
          <span style={{ color: 'var(--ink-900)' }}>▼ −80</span> · histogram bands ±80 / ±150
        </span>
      </div>
    </div>
  );
}
