'use client';

import { useState } from 'react';

const W = 700;
const H = 200;
const PAD_L = 36;
const PAD_R = 16;
const PAD_T = 14;
const PAD_B = 26;

const TENORS = [1 / 12, 3 / 12, 6 / 12, 1, 2, 3, 5, 7, 10, 20, 30];
const TENOR_LABELS = ['1m', '3m', '6m', '1y', '2y', '3y', '5y', '7y', '10y', '20y', '30y'];

const SNAPSHOTS = [
  { date: '2020-01', curve: [1.55, 1.55, 1.55, 1.5, 1.45, 1.5, 1.6, 1.7, 1.8, 2.1, 2.3] },
  { date: '2021-01', curve: [0.05, 0.07, 0.08, 0.1, 0.12, 0.18, 0.45, 0.8, 1.1, 1.65, 1.85] },
  { date: '2022-06', curve: [1.2, 1.85, 2.5, 2.85, 3.05, 3.1, 3.15, 3.18, 3.12, 3.3, 3.25] },
  { date: '2023-01', curve: [4.55, 4.7, 4.78, 4.7, 4.3, 4.0, 3.65, 3.62, 3.55, 3.75, 3.7] },
  { date: '2023-10', curve: [5.5, 5.55, 5.5, 5.4, 5.05, 4.85, 4.7, 4.75, 4.85, 5.08, 5.05] },
  { date: '2024-01', curve: [5.43, 5.4, 5.2, 4.85, 4.3, 4.1, 4.0, 4.05, 4.05, 4.3, 4.25] },
  { date: '2026-05', curve: [4.2, 4.18, 4.1, 3.95, 3.85, 3.92, 4.1, 4.2, 4.29, 4.55, 4.62] },
];

const REF = SNAPSHOTS[5];

export default function YieldCurveViz() {
  const [idx, setIdx] = useState(6);
  const current = SNAPSHOTS[idx];

  const allY = SNAPSHOTS.flatMap((s) => s.curve);
  const yMin = Math.min(...allY) - 0.4;
  const yMax = Math.max(...allY) + 0.4;
  const xMin = Math.log(TENORS[0]);
  const xMax = Math.log(TENORS[TENORS.length - 1]);
  const x = (t: number) => PAD_L + ((Math.log(t) - xMin) / (xMax - xMin)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);

  function buildPath(curve: number[]): string {
    return curve.map((v, i) => `${i ? 'L' : 'M'}${x(TENORS[i]).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  }

  const gridYs: number[] = [];
  for (let v = Math.ceil(yMin); v <= Math.floor(yMax); v++) gridYs.push(v);

  const slope = (current.curve[8] - current.curve[4]) * 100;
  const isInverted = slope < 0;

  return (
    <div className="viz viz-yc">
      <div className="v-head">
        <span className="t">UST yield curve</span>
        <span className="sub">par yields · % · scrub to morph</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: H }}>
        <g className="v-grid">
          {gridYs.map((v) => (
            <line key={v} x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} />
          ))}
        </g>
        <g className="v-axis">
          {gridYs.map((v) => (
            <text key={v} x={4} y={y(v) + 3}>
              {v}%
            </text>
          ))}
          {TENORS.map((t, i) =>
            [0, 3, 4, 6, 8, 10].includes(i) ? (
              <text key={i} x={x(t) - 8} y={H - 8}>
                {TENOR_LABELS[i]}
              </text>
            ) : null
          )}
        </g>
        <path className="curve cmp" d={buildPath(REF.curve)} />
        {REF.curve.map((v, i) => (
          <circle key={i} className="point cmp" cx={x(TENORS[i])} cy={y(v)} r={1.6} />
        ))}
        <path className="curve cur" d={buildPath(current.curve)} />
        {current.curve.map((v, i) => (
          <circle key={i} className="point cur" cx={x(TENORS[i])} cy={y(v)} r={2.8} />
        ))}
      </svg>

      <div style={{ display: 'flex', gap: 18, paddingTop: 8, flexWrap: 'wrap' }}>
        <span className="tag-line cur">
          <span className="sq" /> Today
        </span>
        <span className="tag-line cmp" style={{ marginLeft: 'auto' }}>
          <span className="sq" /> Reference: {REF.date}
        </span>
      </div>

      <div className="controls">
        <span className="date">{current.date}</span>
        <div className="scrub">
          <input
            type="range"
            min={0}
            max={SNAPSHOTS.length - 1}
            value={idx}
            step={1}
            onChange={(e) => setIdx(+e.target.value)}
            aria-label="Yield curve snapshot"
          />
        </div>
        <span className={`slope${isInverted ? ' inv' : ''}`}>
          2s10s:{' '}
          <b>
            {slope >= 0 ? '+' : '−'}
            {Math.abs(slope).toFixed(0)}bp
          </b>
        </span>
      </div>
    </div>
  );
}
