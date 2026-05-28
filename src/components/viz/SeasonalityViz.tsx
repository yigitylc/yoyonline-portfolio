'use client';

import { useMemo, useState } from 'react';
import { mixHex } from './lib';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];

function seasonal(yIdx: number, mIdx: number): number {
  const seasonalAvg = [-0.5, 0.2, 1.1, 1.6, 0.6, -0.1, 1.4, -0.4, -1.1, 1.0, 2.4, 1.2];
  const base = seasonalAvg[mIdx];
  const shock =
    Math.sin((yIdx + 1) * 1.7 + mIdx * 0.9) * 2.5 +
    Math.sin(yIdx * 0.5 + mIdx * 1.3) * 1.5;
  const shocks = [0, 0, -0.5, 0, -1.5, 0, -2.5, 0, 0, 0];
  return base + shock * 0.55 + (shocks[yIdx] || 0);
}

function colorFor(v: number): string {
  const mag = Math.min(1, Math.abs(v) / 4);
  const t = Math.pow(mag, 0.8);
  if (v >= 0) return mixHex('#F5F2E9', '#137A3F', t);
  return mixHex('#F5F2E9', '#B23026', t);
}

interface Hover {
  y: string;
  m: string;
  v: number;
}

export default function SeasonalityViz() {
  const [hover, setHover] = useState<Hover | null>(null);

  const { data, avgs } = useMemo(() => {
    const d: number[][] = YEARS.map((_, yi) => MONTHS.map((__, mi) => seasonal(yi, mi)));
    const a: number[] = MONTHS.map((__, mi) => {
      const col = d.map((r) => r[mi]);
      return col.reduce((s, v) => s + v, 0) / col.length;
    });
    return { data: d, avgs: a };
  }, []);

  return (
    <div className="viz viz-seasonality">
      <div className="v-head">
        <span className="t">Seasonality · SPY monthly returns</span>
        <span className="sub">2016–2025 · 120 obs · avg %</span>
      </div>

      <div className="grid-row" onMouseLeave={() => setHover(null)}>
        <div />
        {MONTHS.map((m) => (
          <div key={m} className="hdr">
            {m}
          </div>
        ))}
        {YEARS.map((y, yi) => (
          <YearRow
            key={y}
            year={y}
            row={data[yi]}
            onCellHover={(m, v) => setHover({ y, m, v })}
          />
        ))}
      </div>

      <div className="avg-row">
        <div className="y-lbl">AVG</div>
        {avgs.map((a, mi) => (
          <div
            key={MONTHS[mi]}
            className="avg-cell"
            style={{
              background: colorFor(a),
              color: Math.abs(a) > 2 ? 'rgba(255,255,255,0.9)' : 'var(--ink-900)',
            }}
          >
            {(a >= 0 ? '+' : '−') + Math.abs(a).toFixed(1)}
          </div>
        ))}
      </div>

      <div className="legend">
        <div className="legend-bar">
          <span>−4%</span>
          <div className="legend-grad" />
          <span>+4%</span>
        </div>
        <div className="info">
          {hover ? (
            <>
              <span>
                {hover.m} {hover.y}
              </span>{' '}
              · return{' '}
              <span>
                {hover.v >= 0 ? '+' : '−'}
                {Math.abs(hover.v).toFixed(2)}%
              </span>
            </>
          ) : (
            'Hover any cell · best: Nov +2.4% · worst: Sep −1.1%'
          )}
        </div>
      </div>
    </div>
  );
}

interface YearRowProps {
  year: string;
  row: number[];
  onCellHover: (m: string, v: number) => void;
}

function YearRow({ year, row, onCellHover }: YearRowProps) {
  return (
    <>
      <div className="y-lbl">{year}</div>
      {row.map((v, mi) => (
        <div
          key={mi}
          className="heat-cell"
          style={{
            background: colorFor(v),
            color: Math.abs(v) > 2 ? 'rgba(255,255,255,0.85)' : undefined,
          }}
          onMouseEnter={() => onCellHover(MONTHS[mi], v)}
        >
          {(v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1)}
        </div>
      ))}
    </>
  );
}
