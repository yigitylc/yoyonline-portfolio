import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects, getProjectBySlug } from '@/data/projects';

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const isLive = project.status === 'live';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/projects"
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        &larr; Back to Projects &amp; Models
      </Link>

      <div className="mt-6">
        {isLive ? (
          <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 uppercase">
            Live
          </span>
        ) : (
          <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 uppercase">
            Coming Soon
          </span>
        )}
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          {project.title}
        </h1>
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
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        <p className="mt-2 text-gray-600">{project.summary}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Live Demo</h2>
        {isLive && project.streamlitUrl ? (
          <div className="mt-4">
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src={`${project.streamlitUrl}/?embed=true`}
                className="w-full h-[900px] sm:h-[75vh] min-h-[600px]"
                style={{ border: 'none' }}
                title={project.title}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                allow="clipboard-write; fullscreen"
              />
            </div>
            <div className="mt-4">
              <a
                href={project.streamlitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Open in Streamlit
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg font-medium">Coming Soon</p>
            <p className="text-gray-500 mt-2">
              This project is being converted to an interactive Streamlit app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
