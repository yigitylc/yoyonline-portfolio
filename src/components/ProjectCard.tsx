import Link from 'next/link';
import { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

function hostFromUrl(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace('.streamlit.app', '');
  } catch {
    return '';
  }
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const isLive = project.status === 'live';
  const num = String(index ?? project.order ?? 99).padStart(2, '0');
  const host = hostFromUrl(project.streamlitUrl);

  return (
    <Link href={`/projects/${project.slug}`} className="proj-card">
      <div className="proj-card-top">
        <span className={`status ${isLive ? 'st-live' : 'st-soon'}`}>
          {isLive ? 'Live' : 'Coming Soon'}
        </span>
        <span className="proj-num">/ MODEL {num}</span>
      </div>
      <h3 className="proj-title">{project.title}</h3>
      <p className="proj-short">{project.summary}</p>
      <div className="proj-tags">
        {project.tags.slice(0, 4).map((t) => (
          <span className="tag" key={t}>
            {t}
          </span>
        ))}
      </div>
      <div className="proj-foot">
        <span className="proj-link">
          Open dashboard <span className="arr">→</span>
        </span>
        <span className="proj-host">{host}</span>
      </div>
    </Link>
  );
}
