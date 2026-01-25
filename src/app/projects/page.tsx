import { projects } from '@/data/projects';
import ProjectCard from '@/components/ProjectCard';

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
      <p className="mt-2 text-gray-600">
        Explore my quantitative finance dashboards and analysis tools.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
