import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Quantitative Finance Portfolio
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Interactive dashboards and analysis tools for finance and trading
        </p>
        <div className="mt-8">
          <Link
            href="/projects"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            View Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
