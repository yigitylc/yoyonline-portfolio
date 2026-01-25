import Link from 'next/link';
import { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow">
      <div className="mb-2">
        <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 uppercase">
          {project.type}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
      <p className="mt-2 text-sm text-gray-600">{project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <Link
          href={`/projects/${project.slug}`}
          className="inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
