'use client';

import { useMemo, useState } from 'react';
import { mulberry32, gaussFactory } from './lib';

const W = 700;
const H = 240;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 10;
const PAD_B = 22;
const N_PATHS = 80;
const STEPS = 60;
const MU = 0.08;
const SIGMA = 0.18;
const START = 100;
const dt = 1 / STEPS;

function genPaths(seed: number): number[][] {
  const rand = mulberry32(seed);
  const gauss = gaussFactory(rand);
  const out: number[][] = [];
  for (let p = 0; p < N_PATHS; p++) {
    const path: number[] = [START];
    let s = START;
    for (let t = 1; t <= STEPS; t++) {
      s = s * Math.exp((MU - 0.5 * SIGMA * SIGMA) * dt + SIGMA * Math.sqrt(dt) * gauss());
      path.push(s);
    }
    out.push(path);
  }
  return out;
}

export default function MonteCarloViz() {
  const [seed, setSeed] = useState(7);

  const { paths, median, p5, p50, p95, ploss, yMin, yMax } = useMemo(() => {
    const paths = genPaths(seed);
    const endVals = paths.map((p) => p[p.length - 1]).sort((a, b) => a - b);
    const p5 = endVals[Math.floor(N_PATHS * 0.05)];
    const p50 = endVals[Math.floor(N_PATHS * 0.5)];
    const p95 = endVals[Math.floor(N_PATHS * 0.95)];
    const ploss = endVals.filter((v) => v < START).length / N_PATHS;
    const median: number[] = [];
    for (let t = 0; t <= STEPS; t++) {
      const col = paths.map((p) => p[t]).sort((a, b) => a - b);
      median.push(col[Math.floor(N_PATHS * 0.5)]);
    }
    const allVals = paths.flat();
    const yMin = Math.min(...allVals) * 0.96;
    const yMax = Math.max(...allVals) * 1.04;
    return { paths, median, p5, p50, p95, ploss, yMin, yMax };
  }, [seed]);

  const x = (i: number) => PAD_L + (i / STEPS) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);

  const fmt = (v: number) =>
    (v >= START ? '+' : '−') + ((Math.abs(v - START) / START) * 100).toFixed(1) + '%';

  return (
    <div className="viz viz-mc">
      <div className="v-head">
        <span className="t">Monte Carlo · 1,000 paths</span>
        <span className="sub">geometric brownian · 12m horizon · μ=8% σ=18%</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: H }}>
        <g className="v-grid">
          {[0, 1, 2, 3, 4].map((t) => {
            const yv = yMin + ((yMax - yMin) * t) / 4;
            return <line key={t} x1={PAD_L} x2={W - PAD_R} y1={y(yv)} y2={y(yv)} />;
          })}
        </g>
        <g className="v-axis">
          {[0, 1, 2, 3, 4].map((t) => {
            const yv = yMin + ((yMax - yMin) * t) / 4;
            return (
              <text key={t} x={4} y={y(yv) + 3}>
                {yv.toFixed(0)}
              </text>
            );
          })}
          {['t=0', '3m', '6m', '9m', '12m'].map((lbl, i) => (
            <text key={lbl} x={x((STEPS * i) / 4) - 8} y={H - 6}>
              {lbl}
            </text>
          ))}
        </g>
        <circle className="startdot" cx={x(0)} cy={y(START)} r={3} />
        {paths.map((p, idx) => {
          const end = p[p.length - 1];
          const cls = `path ${end >= START ? 'up' : 'down'}`;
          const d = p
            .map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
            .join(' ');
          return <path key={idx} className={cls} d={d} />;
        })}
        <path
          className="median"
          d={median.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
        />
      </svg>

      <div className="v-legend">
        <span className="swatch">
          <span className="sq" style={{ background: 'rgba(19,122,63,0.4)' }} /> Above median
        </span>
        <span className="swatch">
          <span className="sq" style={{ background: 'rgba(178,48,38,0.4)' }} /> Below
        </span>
        <span className="swatch">
          <span className="sq" style={{ background: 'var(--ink-900)' }} /> Median path
        </span>
        <div className="controls">
          <button type="button" onClick={() => setSeed((s) => s + 1)}>
            ↻ Re-run
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="l">P5</div>
          <div className="v down">{fmt(p5)}</div>
        </div>
        <div className="stat">
          <div className="l">P50 · Median</div>
          <div className={`v ${p50 >= START ? 'up' : 'down'}`}>{fmt(p50)}</div>
        </div>
        <div className="stat">
          <div className="l">P95</div>
          <div className="v up">{fmt(p95)}</div>
        </div>
        <div className="stat">
          <div className="l">P(loss)</div>
          <div className={`v ${ploss > 0.5 ? 'down' : 'up'}`}>{(ploss * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
