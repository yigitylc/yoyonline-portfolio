import Link from 'next/link';

const liveProjects = [
  {
    slug: 'try-carry-trade',
    title: 'TRY Carry Trade Analysis',
    description: 'Turkish Lira carry trade analysis with Monte Carlo simulations.',
    streamlitUrl: 'https://try-carry-trade-appgit-yigityalcin.streamlit.app',
  },
  {
    slug: 'return-observations',
    title: 'Return Observations',
    description: 'Analyze return distributions, volatility, and z-scores.',
    streamlitUrl: 'https://returnobs-yoy.streamlit.app',
  },
];

const features = [
  {
    title: 'Models',
    description: 'Quantitative finance models for portfolio analytics, risk, and trading strategies.',
  },
  {
    title: 'Dashboards',
    description: 'Interactive tools for exploring market data, correlations, and performance metrics.',
  },
  {
    title: 'Research',
    description: 'Trading ideas, current positions, and macro views. Coming soon.',
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          YOY Online
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Finance &amp; Trading dashboards, models, and research.
        </p>
        <div className="mt-8">
          <Link
            href="/projects"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            View Projects &amp; Models
          </Link>
        </div>
      </div>

      {/* Live Demos */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Live Demos</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {liveProjects.map((project) => (
            <div
              key={project.slug}
              className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
            >
              <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 uppercase">
                Live
              </span>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {project.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{project.description}</p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Details
                </Link>
                <a
                  href={project.streamlitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Open Demo
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What You'll Find */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          What You&apos;ll Find Here
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
