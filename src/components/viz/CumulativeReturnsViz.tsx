'use client';

import { useMemo } from 'react';
import { mulberry32, gaussFactory } from './lib';

const N = 252 * 5;
const Wu = 700;
const Hu = 170;
const Wl = 700;
const Hl = 60;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 8;
const PAD_B = 14;

function genSeries(rand: () => number, muY: number, sigmaY: number, seedShift: number): number[] {
  const gauss = gaussFactory(rand);
  const mu = muY / 252;
  const sigma = sigmaY / Math.sqrt(252);
  const out: number[] = [100];
  let logsum = 0;
  for (let i = 1; i <= N; i++) {
    let z = gauss();
    if ((i + seedShift) % 700 < 50) z -= 1.4;
    logsum += mu - 0.5 * sigma * sigma + sigma * z;
    out.push(100 * Math.exp(logsum));
  }
  return out;
}

function drawdown(series: number[]): number[] {
  const dd: number[] = [];
  let peak = series[0];
  for (let i = 0; i < series.length; i++) {
    peak = Math.max(peak, series[i]);
    dd.push((series[i] / peak - 1) * 100);
  }
  return dd;
}

export default function CumulativeReturnsViz() {
  const { A, B, ddA, yMin, yMax, minDD } = useMemo(() => {
    const A = genSeries(mulberry32(101), 0.1142, 0.16, 0);
    const B = genSeries(mulberry32(257), 0.0884, 0.18, 0);
    const ddA = drawdown(A);
    const ddB = drawdown(B);
    const yMin = Math.min(...A, ...B) * 0.98;
    const yMax = Math.max(...A, ...B) * 1.02;
    const minDD = Math.max(-30, Math.min(...ddA, ...ddB) * 1.05);
    return { A, B, ddA, yMin, yMax, minDD };
  }, []);

  const xu = (i: number) => PAD_L + (i / N) * (Wu - PAD_L - PAD_R);
  const yu = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * (Hu - PAD_T - PAD_B);
  const xl = (i: number) => PAD_L + (i / N) * (Wl - PAD_L - PAD_R);
  const yl = (v: number) => 4 + (1 - (v - minDD) / (0 - minDD)) * (Hl - 18);

  const pathA = A.map((v, i) => `${i ? 'L' : 'M'}${xu(i).toFixed(1)},${yu(v).toFixed(1)}`).join(' ');
  const pathB = B.map((v, i) => `${i ? 'L' : 'M'}${xu(i).toFixed(1)},${yu(v).toFixed(1)}`).join(' ');
  const ddPath = ddA.map((v, i) => `${i ? 'L' : 'M'}${xl(i).toFixed(1)},${yl(v).toFixed(1)}`).join(' ');
  const ddArea = `${ddPath} L ${xl(N).toFixed(1)},${yl(0).toFixed(1)} L ${xl(0).toFixed(1)},${yl(0).toFixed(1)} Z`;

  const yTicksUpper = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <div className="viz viz-cumret">
      <div className="v-head">
        <span className="t">Portfolio A vs B · cumulative + drawdown</span>
        <span className="sub">5y · daily · base 100</span>
      </div>

      <svg className="upper" viewBox="0 0 700 170" preserveAspectRatio="none">
        <g className="v-grid">
          {[0, 0.5, 1].map((t, i) => {
            const yy = PAD_T + t * (Hu - PAD_T - PAD_B);
            return <line key={i} x1={PAD_L} x2={Wu - PAD_R} y1={yy} y2={yy} />;
          })}
        </g>
        <g className="v-axis">
          {yTicksUpper.map((v, i) => (
            <text key={i} x={4} y={yu(v) + 3}>
              {v.toFixed(0)}
            </text>
          ))}
        </g>
        <line className="v-zero" x1={PAD_L} x2={Wu - PAD_R} y1={yu(100)} y2={yu(100)} />
        <path className="line a" d={pathA} />
        <path className="line b" d={pathB} />
      </svg>

      <svg className="lower" viewBox="0 0 700 60" preserveAspectRatio="none">
        <line className="v-zero" x1={PAD_L} x2={Wl - PAD_R} y1={yl(0)} y2={yl(0)} />
        <g className="v-axis">
          {[0, minDD].map((v, i) => (
            <text key={i} x={4} y={yl(v) + 3}>
              {v.toFixed(0)}%
            </text>
          ))}
        </g>
        <path className="dd-area" d={ddArea} />
        <path className="dd-line" d={ddPath} />
        {['Y−5', 'Y−4', 'Y−3', 'Y−2', 'Y−1', 'Now'].map((lbl, i) => (
          <text
            key={lbl}
            x={xl((N * i) / 5) - 10}
            y={Hl - 2}
            fontFamily="var(--font-mono)"
            fontSize={9}
            fill="var(--fg-tertiary)"
          >
            {lbl}
          </text>
        ))}
      </svg>

      <div className="stats">
        <div className="pf-block">
          <div className="name a">
            <span className="dot" /> Portfolio A
          </div>
          <dl>
            <dt>CAGR</dt>
            <dd className="up">+11.42%</dd>
            <dt>Sharpe</dt>
            <dd>1.342</dd>
            <dt>Sortino</dt>
            <dd>2.018</dd>
            <dt>Max DD</dt>
            <dd className="down">−18.74%</dd>
            <dt>β vs SPX</dt>
            <dd>0.873</dd>
          </dl>
        </div>
        <div className="pf-block">
          <div className="name b">
            <span className="dot" /> Portfolio B
          </div>
          <dl>
            <dt>CAGR</dt>
            <dd className="up">+8.84%</dd>
            <dt>Sharpe</dt>
            <dd>0.918</dd>
            <dt>Sortino</dt>
            <dd>1.412</dd>
            <dt>Max DD</dt>
            <dd className="down">−24.12%</dd>
            <dt>β vs SPX</dt>
            <dd>1.084</dd>
          </dl>
        </div>
      </div>

      <div className="v-foot">
        <span>Source: portfolio-analyticsyoy.streamlit.app · synthetic preview</span>
        <span>252d rolling · benchmark SPX</span>
      </div>
    </div>
  );
}
