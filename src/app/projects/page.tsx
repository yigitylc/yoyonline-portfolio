'use client';

import { useMemo, useState } from 'react';
import ProjectCard from '@/components/ProjectCard';
import { projects } from '@/data/projects';

const FILTER_TAGS = [
  'all',
  'Risk',
  'Macro',
  'FX',
  'Momentum',
  'Seasonality',
  'Python',
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState<string>('');

  const liveCount = useMemo(
    () => projects.filter((p) => p.status === 'live').length,
    []
  );

  const sorted = useMemo(
    () => [...projects].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((p) => {
      if (
        filter !== 'all' &&
        !p.tags.some((t) => t.toLowerCase().includes(filter.toLowerCase()))
      ) {
        return false;
      }
      if (q && !(p.title + ' ' + p.summary).toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [filter, query, sorted]);

  return (
    <div className="projects-page">
      <section className="container projects-head">
        <div className="eyebrow">§ Index · {liveCount} live models</div>
        <h1 className="page-title">Projects &amp; Models</h1>
        <p className="page-lead">
          Live dashboards and analysis tools for quantitative finance. Click any
          card to view the model description, methodology, and the embedded
          dashboard.
        </p>

        <div className="projects-tools">
          <div className="search-wrap">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className="search"
              placeholder="Search models · MACD-V, carry, breadth…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search models"
            />
          </div>
          <div className="segment" role="tablist" aria-label="Filter by tag">
            {FILTER_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={filter === t}
                className={filter === t ? 'on' : ''}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container">
        {filtered.length > 0 ? (
          <div className="proj-grid">
            {filtered.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <p>No models match — try clearing filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
