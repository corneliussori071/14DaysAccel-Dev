export default function HeroSection() {
  return (
    <section className="border-b border-zinc-200 bg-white px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-400">
              AI-Accelerated Development
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 md:text-6xl">
              14DaysAccel Dev
            </h1>
            <p className="mt-6 text-xl font-medium text-zinc-600">
              Accelerated software development using advanced AI tools and
              professional engineering practices.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-500">
              AI accelerates code generation while experienced engineers make
              architectural, security, and performance decisions to ensure
              production quality software.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
                View Projects
              </button>
              <button className="rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                Describe Your Software Idea
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex h-72 w-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-sm text-zinc-400">
              Video demonstration placeholder
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
