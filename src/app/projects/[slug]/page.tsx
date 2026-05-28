import { notFound } from 'next/navigation';
import ProjectDetail from '@/components/ProjectDetail';
import { projects, getProjectBySlug } from '@/data/projects';

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const related = projects
    .filter((p) => p.slug !== project.slug)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, 3);

  return <ProjectDetail project={project} related={related} />;
}
