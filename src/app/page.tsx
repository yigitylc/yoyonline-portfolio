import Link from 'next/link';

const capabilities = [
  {
    title: 'Quantitative Models',
    description:
      'Portfolio analytics, risk metrics, and systematic trading strategies built with Python.',
  },
  {
    title: 'Interactive Dashboards',
    description:
      'Live Streamlit and Dash applications for exploring market data, signals, and performance.',
  },
  {
    title: 'Macro Research',
    description:
      'Economic indicators, regime analysis, and cross-asset views using FRED and market data.',
  },
];

const researchTopics = [
  'Macro notes on inflation regimes, yield curves, and central bank policy',
  'Trade ideas and position rationale with risk/reward analysis',
  'Model documentation and methodology writeups',
];

const topicStrip = ['SPX', 'FX Carry', 'Volatility', 'Macro Regimes', 'Breadth', 'Risk Premia'];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with subtle gradient */}
      <div className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              YOY Online
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Quantitative finance models, interactive dashboards, and macro research.
              <br className="hidden sm:inline" />
              Built for analysis. Designed for clarity.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/projects"
                className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                View Projects
              </Link>
              <a
                href="https://github.com/yigitylc"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Topic Strip */}
        <div className="border-y border-slate-200 bg-slate-50/50">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium text-slate-500 tracking-wide overflow-x-auto">
              {topicStrip.map((topic, index) => (
                <span key={topic} className="flex items-center whitespace-nowrap">
                  {index > 0 && (
                    <span className="mr-4 sm:mr-8 text-slate-300" aria-hidden="true">
                      |
                    </span>
                  )}
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Capabilities Section */}
        <section>
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            What You Will Find
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            A collection of quantitative tools and research covering markets, macro, and systematic strategies.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {capabilities.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Research & Writing Section */}
        <section className="mt-20">
          <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 sm:p-10">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">Research and Writing</h2>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    Coming Soon
                  </span>
                </div>
                <p className="mt-4 text-slate-600">
                  Longer-form content on markets, models, and methodology. What to expect:
                </p>
                <ul className="mt-6 space-y-3">
                  {researchTopics.map((topic) => (
                    <li key={topic} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 text-center">
          <p className="text-slate-600">
            Explore the projects to see live dashboards and detailed documentation.
          </p>
          <Link
            href="/projects"
            className="mt-6 inline-block rounded-md bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            Browse All Projects
          </Link>
        </section>
      </div>
    </div>
  );
}
