'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Project } from '@/data/projects';
import { vizForSlug } from '@/components/viz/registry';

type Tab = 'overview' | 'live' | 'methodology';

interface ProjectDetailProps {
  project: Project;
  related: Project[];
}

function hostname(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export default function ProjectDetail({ project, related }: ProjectDetailProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const isLive = project.status === 'live';
  const num = String(project.order ?? 99).padStart(2, '0');
  const host = hostname(project.streamlitUrl);
  const primaryTag = project.tags[1] || project.tags[0] || '';

  return (
    <div className="detail-page">
      <div className="container detail-crumb">
        <Link href="/projects">← Back to Projects &amp; Models</Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">{project.title}</span>
      </div>

      <section className="container detail-head">
        <div className="detail-meta">
          <span className={`status ${isLive ? 'st-live' : 'st-soon'}`}>
            {isLive ? 'Live' : 'Coming Soon'}
          </span>
          <span className="proj-num">
            / MODEL {num}
            {primaryTag ? ` · ${primaryTag}` : ''}
          </span>
        </div>
        <h1 className="page-title">{project.title}</h1>
        <p className="page-lead">{project.summary}</p>
        <div className="proj-tags">
          {project.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="container detail-tabs">
        <div className="tabs" role="tablist" aria-label="Project sections">
          {(['overview', 'live', 'methodology'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={tab === t ? 'on' : ''}
              onClick={() => setTab(t)}
            >
              {t === 'live' ? 'Live demo' : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="container detail-content">
        {tab === 'overview' && (
          <div className="detail-grid">
            <div className="detail-main">
              {(() => {
                const viz = vizForSlug(project.slug);
                if (!viz) return null;
                return (
                  <section className="viz-section">
                    <div className="viz-section-head eyebrow">
                      Visualization preview
                    </div>
                    <div className="viz-stack">{viz}</div>
                    <p className="viz-caption">
                      Indicative preview · the live dashboard fetches real-time
                      data and exposes interactive controls.
                    </p>
                  </section>
                );
              })()}

              <h3 className="h-section">Overview</h3>
              <p className="body-text">{project.summary}</p>

              <h3 className="h-section">What&rsquo;s inside</h3>
              <ul className="check-list">
                <li>
                  Interactive Streamlit dashboard with real-time controls and
                  parameters.
                </li>
                <li>
                  Methodology documentation explaining inputs, transforms, and
                  outputs.
                </li>
                <li>
                  Ranked tables, distribution charts, and rolling-window
                  diagnostics.
                </li>
                <li>
                  Cross-asset comparisons against benchmarks where relevant.
                </li>
              </ul>
            </div>
            <aside className="detail-side">
              <div className="side-card">
                <div className="side-head">Quick facts</div>
                <dl className="side-dl">
                  <dt>Status</dt>
                  <dd>
                    <span
                      className={`status ${isLive ? 'st-live' : 'st-soon'}`}
                    >
                      {isLive ? 'Live' : 'Coming Soon'}
                    </span>
                  </dd>
                  <dt>Stack</dt>
                  <dd>Streamlit · Python</dd>
                  <dt>Model №</dt>
                  <dd className="num">{num}</dd>
                  {primaryTag && (
                    <>
                      <dt>Focus</dt>
                      <dd>{primaryTag}</dd>
                    </>
                  )}
                  {host && (
                    <>
                      <dt>Host</dt>
                      <dd className="num">
                        {host.replace('.streamlit.app', '')}
                      </dd>
                    </>
                  )}
                  {project.repoUrl && (
                    <>
                      <dt>Repo</dt>
                      <dd className="num">
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {project.repoUrl.replace(/^https?:\/\//, '')} ↗
                        </a>
                      </dd>
                    </>
                  )}
                </dl>
                {isLive && project.streamlitUrl && (
                  <a
                    className="btn btn-primary side-cta"
                    href={project.streamlitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Streamlit <span className="arr">↗</span>
                  </a>
                )}
              </div>
              {related.length > 0 && (
                <div className="side-card">
                  <div className="side-head">Related models</div>
                  <ul className="rel-list">
                    {related.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/projects/${p.slug}`}
                          className="rel-list-link"
                        >
                          <span className="rel-num">
                            /{String(p.order ?? 99).padStart(2, '0')}
                          </span>
                          <span className="rel-t">{p.title}</span>
                          <span className="rel-arr">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        )}

        {tab === 'live' && (
          <div className="live-frame">
            <div className="live-bar">
              <div className="live-left">
                <span className="live-dot" />
                <span className="live-lbl">
                  {isLive
                    ? `LIVE · ${host || 'streamlit'}`
                    : 'COMING SOON'}
                </span>
              </div>
              {isLive && project.streamlitUrl && (
                <a
                  className="live-open"
                  href={project.streamlitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in new tab ↗
                </a>
              )}
            </div>
            <div className="live-stage">
              {isLive && project.streamlitUrl ? (
                <iframe
                  src={`${project.streamlitUrl}/?embed=true`}
                  className="live-iframe"
                  title={project.title}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  allow="clipboard-write; fullscreen"
                />
              ) : (
                <div className="live-placeholder-frame">
                  <div className="lp-inner">
                    <div className="lp-icon">●</div>
                    <div className="lp-title">Coming Soon</div>
                    <div className="lp-body">
                      This project is being converted to an interactive
                      Streamlit dashboard.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'methodology' && (
          <div className="detail-grid">
            <div className="detail-main">
              {project.methodology?.sections ? (
                project.methodology.sections.map((s) => (
                  <div key={s.heading}>
                    <h3 className="h-section">{s.heading}</h3>
                    {s.body && <p className="body-text">{s.body}</p>}
                    {s.bullets && s.bullets.length > 0 && (
                      <ul className="check-list">
                        {s.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <>
                  <h3 className="h-section">Method</h3>
                  <p className="body-text">
                    {project.methodology?.method ??
                      'The model ingests daily price and macro inputs, normalises them against rolling-window estimates, and surfaces both point-in-time signals and regime classifications. Transforms are reversible; the dashboard exposes each lever as an interactive control so behaviour can be inspected.'}
                  </p>
                  <h3 className="h-section">Inputs</h3>
                  <ul className="check-list">
                    {(
                      project.methodology?.inputs ?? [
                        'Daily close prices from Yahoo Finance, FRED, or model-specific feeds.',
                        'Configurable lookback windows · 30 / 63 / 126 / 252 trading days.',
                        'Benchmark selection from a broad equity, fixed-income, and FX universe.',
                      ]
                    ).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <h3 className="h-section">Outputs</h3>
                  <ul className="check-list">
                    {(
                      project.methodology?.outputs ?? [
                        'Cumulative-return and drawdown curves with benchmark overlay.',
                        'Rolling Sharpe and Sortino with configurable window length.',
                        'Ranked cross-sectional tables (β, correlation, breadth).',
                      ]
                    ).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <aside className="detail-side">
              <div className="side-card">
                <div className="side-head">References</div>
                <ul className="rel-list rel-list-plain">
                  {project.methodology?.references &&
                  project.methodology.references.length > 0 ? (
                    project.methodology.references.map((line) => (
                      <li key={line}>
                        <span className="rel-t">{line}</span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <span className="rel-t">
                        See the live dashboard for source citations specific to
                        this model.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </aside>
          </div>
        )}

      </section>
    </div>
  );
}
