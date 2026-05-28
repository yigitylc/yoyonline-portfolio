'use client';

import { useMemo } from 'react';

// Mirrors yoyonline-design-v2/preview/viz-ma-distance.html.
// Distance from a moving average expressed as a percent, with a rolling
// 5–95 percentile band, event markers, five-cell KPI strip, and an
// event-study table comparing forward returns at trigger vs unconditional
// baseline.

const N = 260;
const WIN = 60;
const W = 700;
const H = 240;
const PAD_L = 30;
const PAD_R = 36;
const PAD_T = 14;
const PAD_B = 22;

// Deterministic LCG + Box–Muller pulled from the v2 preview file so the
// rendered chart matches the design reference byte-for-byte (seeded
// generator → identical SSR + client render → no hydration mismatch).
function makeRng(seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const gauss = () => {
    const u1 = rand() || 0.001;
    const u2 = rand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };
  return { rand, gauss };
}

interface EventPt {
  i: number;
  up: boolean;
}

interface Computed {
  dist: number[];
  lo: number[];
  hi: number[];
  events: EventPt[];
  yMin: number;
  yMax: number;
  cur: number;
  z: number;
  rPct: number;
  ePct: number;
  tail: number;
}

function compute(): Computed {
  const { rand, gauss } = makeRng(17);

  // Smooth-ish distance series: regime drift (two sine layers) plus
  // occasional shocks. Late bars biased slightly extended.
  const dist: number[] = [];
  let v = -2;
  for (let i = 0; i < N; i++) {
    const drift = Math.sin(i / 28) * 1.2 + Math.sin(i / 11) * 0.6;
    const shock = rand() < 0.04 ? gauss() * 4 : gauss() * 0.7;
    v = 0.92 * v + drift * 0.15 + shock;
    if (i > 220) v += 0.18;
    dist.push(v);
  }

  // Rolling 5/95 band over the last WIN bars.
  const lo: number[] = [];
  const hi: number[] = [];
  for (let i = 0; i < N; i++) {
    const s = Math.max(0, i - WIN + 1);
    const slice = dist.slice(s, i + 1).slice().sort((a, b) => a - b);
    const m = slice.length;
    lo.push(slice[Math.floor(m * 0.05)]);
    hi.push(slice[Math.floor(m * 0.95)]);
  }

  // Events: first bar to breach band, then 8-bar cooldown.
  const events: EventPt[] = [];
  let cd = 0;
  for (let i = WIN; i < N; i++) {
    if (cd > 0) {
      cd--;
      continue;
    }
    if (dist[i] >= hi[i]) {
      events.push({ i, up: true });
      cd = 8;
    } else if (dist[i] <= lo[i]) {
      events.push({ i, up: false });
      cd = 8;
    }
  }

  const yMin = Math.min(-12, Math.floor(Math.min(...dist) - 2));
  const yMax = Math.max(12, Math.ceil(Math.max(...dist) + 2));

  // KPIs from the final bar.
  const last = N - 1;
  const cur = dist[last];
  const slice = dist.slice(N - WIN);
  const mu = slice.reduce((a, b) => a + b, 0) / slice.length;
  const sd = Math.sqrt(
    slice.reduce((a, b) => a + (b - mu) ** 2, 0) / slice.length
  );
  const z = (cur - mu) / sd;
  const sortedR = slice.slice().sort((a, b) => a - b);
  const sortedE = dist.slice().sort((a, b) => a - b);
  const idxR = sortedR.findIndex((x) => x >= cur);
  const idxE = sortedE.findIndex((x) => x >= cur);
  const rPct = ((idxR < 0 ? sortedR.length : idxR) / sortedR.length) * 100;
  const ePct = ((idxE < 0 ? sortedE.length : idxE) / sortedE.length) * 100;
  const tail = Math.min(rPct, 100 - rPct);

  return { dist, lo, hi, events, yMin, yMax, cur, z, rPct, ePct, tail };
}

// Event-study reference numbers from the v2 design preview. These are
// representative of the methodology output; the live Streamlit dashboard
// computes them from real data per ticker.
const EVENT_STUDY = [
  { h: '5 bars', ev: '+0.42%', no: '+0.18%', edge: '+0.24pp', evHit: '54.8%', noHit: '53.2%', hitEdge: '+1.6pp', edgeCls: 'up' as const, hitCls: 'up' as const },
  { h: '10 bars', ev: '+0.31%', no: '+0.36%', edge: '−0.05pp', evHit: '52.4%', noHit: '54.1%', hitEdge: '−1.7pp', edgeCls: 'muted' as const, hitCls: 'down' as const },
  { h: '21 bars', ev: '−0.62%', no: '+0.78%', edge: '−1.40pp', evHit: '47.6%', noHit: '56.8%', hitEdge: '−9.2pp', edgeCls: 'down' as const, hitCls: 'down' as const },
  { h: '63 bars', ev: '+1.21%', no: '+2.34%', edge: '−1.13pp', evHit: '59.5%', noHit: '61.4%', hitEdge: '−1.9pp', edgeCls: 'down' as const, hitCls: 'down' as const },
];

const YEAR_LABELS = ['2022', '2023', '2024', '2025', 'now'];
const YEAR_AT = [0, 65, 130, 195, 259];

function fmtSigned(v: number, p = 2): string {
  return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(p);
}

export default function MaDistanceViz() {
  const c = useMemo(compute, []);

  const xS = (i: number) => PAD_L + (i / (N - 1)) * (W - PAD_L - PAD_R);
  const yS = (v: number) =>
    PAD_T + (1 - (v - c.yMin) / (c.yMax - c.yMin)) * (H - PAD_T - PAD_B);

  const ticks = [-20, -10, 0, 10, 20].filter((t) => t >= c.yMin && t <= c.yMax);

  // Rolling band polygon: hi forward + lo reversed.
  const bandHi = c.hi.map((v, i) => `${i ? 'L' : 'M'}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(' ');
  const bandLo = c.lo
    .map((v, i) => `${xS(i).toFixed(1)},${yS(v).toFixed(1)}`)
    .reverse()
    .join(' L ');
  const bandPath = `${bandHi} L ${bandLo} Z`;

  // Percentile dashed lines (hi + lo).
  const hiLine = c.hi.map((v, i) => `${i ? 'L' : 'M'}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(' ');
  const loLine = c.lo.map((v, i) => `${i ? 'L' : 'M'}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(' ');

  // Above/below-zero shaded areas around the distance line.
  let posArea = `M${xS(0).toFixed(1)},${yS(0).toFixed(1)} `;
  for (let i = 0; i < N; i++) {
    const yv = c.dist[i] > 0 ? c.dist[i] : 0;
    posArea += `L${xS(i).toFixed(1)},${yS(yv).toFixed(1)} `;
  }
  posArea += `L${xS(N - 1).toFixed(1)},${yS(0).toFixed(1)} Z`;

  let negArea = `M${xS(0).toFixed(1)},${yS(0).toFixed(1)} `;
  for (let i = 0; i < N; i++) {
    const yv = c.dist[i] < 0 ? c.dist[i] : 0;
    negArea += `L${xS(i).toFixed(1)},${yS(yv).toFixed(1)} `;
  }
  negArea += `L${xS(N - 1).toFixed(1)},${yS(0).toFixed(1)} Z`;

  const distLine = c.dist
    .map((v, i) => `${i ? 'L' : 'M'}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`)
    .join(' ');

  const lastIdx = N - 1;
  const nowX = xS(lastIdx);
  const nowY = yS(c.dist[lastIdx]);

  return (
    <div className="viz viz-ma-dist">
      <div className="v-head">
        <span className="t">
          NVDA · MA distance from <em>EMA-50</em>
          <span className="ma-legend">
            <span className="sw">
              <span className="band-sw" /> rolling 5–95% band
            </span>
            <span className="sw">
              <span className="dot-ev up-ev" /> +event
            </span>
            <span className="sw">
              <span className="dot-ev down-ev" /> −event
            </span>
          </span>
        </span>
        <span className="sub">2520d · window 500</span>
      </div>

      <svg
        className="ma-chart"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ height: H }}
      >
        <g className="v-grid">
          {ticks
            .filter((t) => t !== 0)
            .map((t) => (
              <line key={t} x1={PAD_L} x2={W - PAD_R} y1={yS(t)} y2={yS(t)} />
            ))}
        </g>
        <g className="v-axis">
          {ticks.map((t) => (
            <text key={t} x={4} y={yS(t) + 3}>
              {(t > 0 ? '+' : t < 0 ? '−' : ' ') + Math.abs(t) + '%'}
            </text>
          ))}
          {YEAR_AT.map((i, k) => (
            <text key={k} x={xS(i) - 12} y={H - 6}>
              {YEAR_LABELS[k]}
            </text>
          ))}
        </g>

        <path className="band-75" d={bandPath} />
        <path className="pctile-line" d={hiLine} />
        <path className="pctile-line" d={loLine} />

        <line className="ma-zero" x1={PAD_L} x2={W - PAD_R} y1={yS(0)} y2={yS(0)} />

        <path className="ma-area-pos" d={posArea} />
        <path className="ma-area-neg" d={negArea} />
        <path className="ma-line" d={distLine} />

        {c.events.map((e, idx) => (
          <circle
            key={idx}
            className={e.up ? 'event-up' : 'event-down'}
            cx={xS(e.i)}
            cy={yS(c.dist[e.i])}
            r={3.6}
          />
        ))}

        <line className="now-line" x1={nowX} x2={nowX} y1={PAD_T} y2={H - PAD_B} />
        <circle className="event-now" cx={nowX} cy={nowY} r={4.5} />
        <text className="now-lbl" x={nowX - 38} y={nowY - 8}>
          now · {fmtSigned(c.cur)}%
        </text>
      </svg>

      <div className="kpis">
        <div className="kpi">
          <div className="l">MA dist</div>
          <div className={`v ${c.cur >= 0 ? 'up' : 'down'}`}>{fmtSigned(c.cur)}%</div>
          <div className="d">vs EMA-50</div>
        </div>
        <div className="kpi">
          <div className="l">Z (500d)</div>
          <div className={`v ${c.z >= 0 ? 'up' : 'down'}`}>{fmtSigned(c.z)}σ</div>
          <div className="d">rolling</div>
        </div>
        <div className="kpi">
          <div className="l">Pctile (roll)</div>
          <div className="v">{c.rPct.toFixed(1)}%</div>
          <div className="d">window 500</div>
        </div>
        <div className="kpi">
          <div className="l">Pctile (exp)</div>
          <div className="v">{c.ePct.toFixed(1)}%</div>
          <div className="d">full-history</div>
        </div>
        <div className="kpi">
          <div className="l">Tail prob.</div>
          <div className="v down">{c.tail.toFixed(1)}%</div>
          <div className="d">two-sided</div>
        </div>
      </div>

      <div className="event-study">
        <div className="es-head">
          <span className="t2">
            Event study · forward returns vs unconditional baseline
          </span>
          <span className="s2">
            N events · {c.events.length} · trigger ≥ 95th pctile
          </span>
        </div>
        <table className="es">
          <thead>
            <tr>
              <th>Horizon</th>
              <th>Event avg</th>
              <th>Normal avg</th>
              <th>Avg edge</th>
              <th>Event hit %</th>
              <th>Normal hit %</th>
              <th>Hit edge</th>
            </tr>
          </thead>
          <tbody>
            {EVENT_STUDY.map((r) => (
              <tr key={r.h}>
                <td>{r.h}</td>
                <td>{r.ev}</td>
                <td>{r.no}</td>
                <td className={r.edgeCls}>{r.edge}</td>
                <td>{r.evHit}</td>
                <td>{r.noHit}</td>
                <td className={r.hitCls}>{r.hitEdge}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
