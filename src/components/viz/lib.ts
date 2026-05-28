// Shared utilities for visualization components.
// Deterministic RNG so SSR and client renders match under static export.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f7) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box–Muller transform — gives standard-normal draws from a uniform PRNG
export function gaussFactory(rand: () => number): () => number {
  return () => {
    let u1 = rand();
    let u2 = rand();
    if (u1 === 0) u1 = 1e-9;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };
}

function parseHex(s: string): [number, number, number] {
  return [
    parseInt(s.slice(1, 3), 16),
    parseInt(s.slice(3, 5), 16),
    parseInt(s.slice(5, 7), 16),
  ];
}

export function mixHex(h1: string, h2: string, t: number): string {
  const p1 = parseHex(h1);
  const p2 = parseHex(h2);
  const r = Math.round(p1[0] + (p2[0] - p1[0]) * t);
  const g = Math.round(p1[1] + (p2[1] - p1[1]) * t);
  const b = Math.round(p1[2] + (p2[2] - p1[2]) * t);
  return `rgb(${r},${g},${b})`;
}

export function fmtSignedPct(v: number, p = 2): string {
  return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(p) + '%';
}

export function fmtSigned(v: number, p = 2): string {
  return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(p);
}
