import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects, getProjectBySlug } from '@/data/projects';

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

function getRunInstructions(type: string, sourcePath: string): string {
  switch (type) {
    case 'notebook':
      return `jupyter notebook "${sourcePath}"`;
    case 'streamlit':
      return `streamlit run ${sourcePath}`;
    case 'dash':
      return `# Extract code from notebook and run:\npython app.py`;
    default:
      return 'See source file for details.';
  }
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/projects"
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        &larr; Back to Projects
      </Link>

      <div className="mt-6">
        <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 uppercase">
          {project.type}
        </span>
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
        <h2 className="text-xl font-semibold text-gray-900">File Info</h2>
        <div className="mt-2 rounded bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Source:</span> {project.sourcePath}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            <span className="font-medium">Type:</span> {project.type}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Live Demo</h2>
        {project.embedUrl ? (
          <div className="mt-2">
            <iframe
              src={project.embedUrl}
              className="h-96 w-full rounded border"
              title={project.title}
            />
            {project.demoUrl && (
              <p className="mt-2 text-sm text-gray-600">
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Open demo in new tab &rarr;
                </a>
              </p>
            )}
          </div>
        ) : (
          <div className="mt-2 flex h-48 items-center justify-center rounded bg-gray-100">
            <p className="text-gray-500">
              Demo not deployed yet. Run locally to preview.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">
          How to Run Locally
        </h2>
        <div className="mt-2 rounded bg-gray-900 p-4">
          <pre className="text-sm text-green-400 whitespace-pre-wrap">
            {getRunInstructions(project.type, project.sourcePath)}
          </pre>
        </div>
      </div>
    </div>
  );
}
