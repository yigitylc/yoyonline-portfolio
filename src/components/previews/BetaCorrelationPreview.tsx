'use client';

import { useMemo, useState } from 'react';
import { mixHex } from '@/components/viz/lib';

// Interactive Overview preview for the Beta & Correlation Analysis
// project. Two panels share a single frame:
//   - Left: 7×7 correlation matrix with hover row/col highlight and
//     click-to-pin behaviour.
//   - Right: ranked diagnostics table with sortable headers and
//     click-to-select rows.
// Deterministic representative data only — the live Streamlit dashboard
// at asset-analyticsyoy.streamlit.app drives the real numbers.

const TICKERS = ['SPY', 'QQQ', 'IWM', 'TLT', 'GLD', 'BTC', 'VIX'] as const;

const M: number[][] = [
  [1.0, 0.95, 0.89, -0.42, 0.08, 0.31, -0.78],
  [0.95, 1.0, 0.82, -0.38, 0.05, 0.36, -0.74],
  [0.89, 0.82, 1.0, -0.45, 0.12, 0.28, -0.71],
  [-0.42, -0.38, -0.45, 1.0, 0.32, -0.18, 0.34],
  [0.08, 0.05, 0.12, 0.32, 1.0, 0.21, 0.04],
  [0.31, 0.36, 0.28, -0.18, 0.21, 1.0, -0.24],
  [-0.78, -0.74, -0.71, 0.34, 0.04, -0.24, 1.0],
];

function colorFor(v: number): string {
  const mag = Math.abs(v);
  const a = Math.pow(mag, 0.85);
  if (v >= 0) return mixHex('#F5F2E9', '#137A3F', a);
  return mixHex('#F5F2E9', '#B23026', a);
}

interface Row {
  tic: string;
  ret: number;
  vol: number;
  beta: number | null;
  corr: number | null;
  sharpe: number | null;
  maxDD: number;
}

const ROWS: Row[] = [
  { tic: 'SPY', ret: 14.2, vol: 15.8, beta: 1.0, corr: 1.0, sharpe: 0.81, maxDD: -18.7 },
  { tic: 'QQQ', ret: 21.4, vol: 19.2, beta: 1.17, corr: 0.95, sharpe: 1.04, maxDD: -24.3 },
  { tic: 'IWM', ret: 8.9, vol: 22.1, beta: 1.31, corr: 0.89, sharpe: 0.42, maxDD: -28.5 },
  { tic: 'TLT', ret: -4.6, vol: 14.8, beta: -0.42, corr: -0.42, sharpe: -0.18, maxDD: -31.2 },
  { tic: 'GLD', ret: 12.7, vol: 13.4, beta: 0.08, corr: 0.08, sharpe: 0.62, maxDD: -16.4 },
  { tic: 'BTC', ret: 84.3, vol: 58.6, beta: 0.31, corr: 0.31, sharpe: 1.21, maxDD: -47.8 },
  { tic: 'VIX', ret: -12.4, vol: 88.2, beta: -4.18, corr: -0.78, sharpe: null, maxDD: -62.1 },
];

type SortKey = 'tic' | 'ret' | 'vol' | 'beta' | 'corr' | 'sharpe' | 'maxDD';
type SortDir = 'asc' | 'desc';

interface Pair {
  r: number;
  c: number;
}

function fmtSignedPct(v: number, p = 1): string {
  return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(p) + '%';
}
function fmtPct(v: number, p = 1): string {
  if (v >= 0) return v.toFixed(p) + '%';
  return '−' + Math.abs(v).toFixed(p) + '%';
}
function fmtNum(v: number | null, p = 2): string {
  if (v === null) return '—';
  return (v >= 0 ? '' : '−') + Math.abs(v).toFixed(p);
}

export default function BetaCorrelationPreview() {
  // Matrix state.
  const [hover, setHover] = useState<Pair | null>(null);
  const [pinned, setPinned] = useState<Pair | null>(null);

  // Table state.
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedTic, setSelectedTic] = useState<string | null>(null);

  const sortedRows = useMemo(() => {
    if (!sortKey) return ROWS;
    const copy = [...ROWS];
    copy.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      const diff = (va as number) - (vb as number);
      return sortDir === 'asc' ? diff : -diff;
    });
    return copy;
  }, [sortKey, sortDir]);

  function clickHeader(k: SortKey) {
    if (sortKey === k) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(k);
      setSortDir('desc');
    }
  }

  function toggleSelect(t: string) {
    setSelectedTic((cur) => (cur === t ? null : t));
  }

  function togglePin(r: number, c: number) {
    setPinned((cur) => (cur && cur.r === r && cur.c === c ? null : { r, c }));
  }

  const matrixInfoPair = hover ?? pinned;
  const matrixIsPinned = !hover && pinned !== null;
  const selectedRow = selectedTic
    ? ROWS.find((row) => row.tic === selectedTic) ?? null
    : null;

  return (
    <div className="viz viz-beta-corr">
      <div className="v-head">
        <span className="t">
          Beta &amp; correlation · cross-asset diagnostics
        </span>
        <span className="sub">252d · daily returns · benchmark SPY</span>
      </div>

      <div className="bc-grid">
        {/* LEFT — correlation matrix */}
        <section className="bc-panel">
          <div className="bc-panel-h">
            <span>Correlation matrix · ρ</span>
            <span className="sub">click to pin</span>
          </div>
          <div
            className="bc-matrix"
            style={{
              gridTemplateColumns: `32px repeat(${TICKERS.length}, minmax(0, 1fr))`,
            }}
            onMouseLeave={() => setHover(null)}
          >
            <div />
            {TICKERS.map((tic, c) => (
              <div
                key={tic}
                className={`bc-cell-lbl col${
                  matrixInfoPair?.c === c ? ' hi' : ''
                }`}
              >
                {tic}
              </div>
            ))}
            {TICKERS.map((tic, r) => (
              <MatrixRow
                key={tic}
                r={r}
                tic={tic}
                hover={hover}
                pinned={pinned}
                onHover={(c) => setHover({ r, c })}
                onPin={(c) => togglePin(r, c)}
              />
            ))}
          </div>
          <div className="bc-matrix-legend">
            <div className="bc-grad-bar">
              <span>−1.0</span>
              <div className="bc-grad" />
              <span>+1.0</span>
            </div>
            <div className="bc-info">
              {matrixInfoPair ? (
                <>
                  <span>
                    {TICKERS[matrixInfoPair.r]} / {TICKERS[matrixInfoPair.c]}
                  </span>{' '}
                  · ρ{' '}
                  <span>
                    {M[matrixInfoPair.r][matrixInfoPair.c] >= 0 ? '+' : '−'}
                    {Math.abs(
                      M[matrixInfoPair.r][matrixInfoPair.c]
                    ).toFixed(2)}
                  </span>
                  {matrixIsPinned && <span className="bc-pin-mark"> · pinned</span>}
                </>
              ) : (
                'Hover or click a cell'
              )}
            </div>
          </div>
        </section>

        {/* RIGHT — ranked diagnostics */}
        <section className="bc-panel">
          <div className="bc-panel-h">
            <span>Ranked diagnostics · trailing 12m</span>
            <span className="sub">click header to sort</span>
          </div>
          <table className="bc-table">
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr>
                <SortHeader
                  k="tic"
                  label="Ticker"
                  align="left"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onClick={clickHeader}
                />
                <SortHeader k="ret" label="Ret" sortKey={sortKey} sortDir={sortDir} onClick={clickHeader} />
                <SortHeader k="vol" label="Vol" sortKey={sortKey} sortDir={sortDir} onClick={clickHeader} />
                <SortHeader k="beta" label="β" sortKey={sortKey} sortDir={sortDir} onClick={clickHeader} />
                <SortHeader k="corr" label="ρ" sortKey={sortKey} sortDir={sortDir} onClick={clickHeader} />
                <SortHeader k="sharpe" label="Shp" sortKey={sortKey} sortDir={sortDir} onClick={clickHeader} />
                <SortHeader k="maxDD" label="DD" sortKey={sortKey} sortDir={sortDir} onClick={clickHeader} />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => {
                const selected = selectedTic === row.tic;
                return (
                  <tr
                    key={row.tic}
                    className={selected ? 'sel' : ''}
                    aria-selected={selected}
                    onClick={() => toggleSelect(row.tic)}
                  >
                    <td className="tic">{row.tic}</td>
                    <td className={`r ${row.ret >= 0 ? 'up' : 'down'}`}>
                      {fmtSignedPct(row.ret, 1)}
                    </td>
                    <td className="r">{row.vol.toFixed(1)}%</td>
                    <td className="r">{fmtNum(row.beta)}</td>
                    <td className="r">{fmtNum(row.corr)}</td>
                    <td className="r">{fmtNum(row.sharpe)}</td>
                    <td className="r down">{fmtPct(row.maxDD, 1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="bc-table-foot">
            {selectedRow ? (
              <>
                Selected: <span>{selectedRow.tic}</span>
                {' · β '}
                <span>{fmtNum(selectedRow.beta)}</span>
                {' · ρ '}
                <span>{fmtNum(selectedRow.corr)}</span>
                {' · Sharpe '}
                <span>{fmtNum(selectedRow.sharpe)}</span>
              </>
            ) : (
              'Click a row to select an asset'
            )}
          </div>
        </section>
      </div>

      <div className="v-foot">
        <span>
          Indicative preview · live dashboard fetches data interactively.
        </span>
        <span>Source: asset-analyticsyoy.streamlit.app</span>
      </div>
    </div>
  );
}

interface MatrixRowProps {
  r: number;
  tic: string;
  hover: Pair | null;
  pinned: Pair | null;
  onHover: (c: number) => void;
  onPin: (c: number) => void;
}

function MatrixRow({ r, tic, hover, pinned, onHover, onPin }: MatrixRowProps) {
  const active = hover ?? pinned;
  const rowHi = active?.r === r;
  return (
    <>
      <div className={`bc-cell-lbl row${rowHi ? ' hi' : ''}`}>{tic}</div>
      {M[r].map((v, c) => {
        const isPinned = pinned?.r === r && pinned?.c === c;
        return (
          <div
            key={c}
            className={`bc-corr-cell ${Math.abs(v) > 0.5 ? 'light' : 'dim'}${
              isPinned ? ' pinned' : ''
            }`}
            style={{ background: colorFor(v) }}
            onMouseEnter={() => onHover(c)}
            onClick={() => onPin(c)}
          >
            {v.toFixed(2)}
          </div>
        );
      })}
    </>
  );
}

interface SortHeaderProps {
  k: SortKey;
  label: string;
  sortKey: SortKey | null;
  sortDir: SortDir;
  onClick: (k: SortKey) => void;
  align?: 'left' | 'right';
}

function SortHeader({
  k,
  label,
  sortKey,
  sortDir,
  onClick,
  align = 'right',
}: SortHeaderProps) {
  const active = sortKey === k;
  const ariaSort: 'none' | 'ascending' | 'descending' = active
    ? sortDir === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';
  return (
    <th className={align === 'right' ? 'r' : ''} aria-sort={ariaSort}>
      <button
        type="button"
        className={active ? 'sorted' : ''}
        onClick={() => onClick(k)}
      >
        {label}
        {active && (
          <span className="bc-sort-arr">{sortDir === 'asc' ? '▲' : '▼'}</span>
        )}
      </button>
    </th>
  );
}
