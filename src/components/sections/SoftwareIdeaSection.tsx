export default function SoftwareIdeaSection() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50 px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Software Architecture Planner
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-500">
              Describe your business operations and receive a recommended
              software architecture and technology stack tailored to your
              specific requirements.
            </p>
            <p className="mt-3 text-base leading-relaxed text-zinc-500">
              The planner analyzes your inputs and produces a structured
              technical blueprint that experienced engineers review and refine.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <p className="mb-3 text-sm font-medium text-zinc-700">
              Describe your software requirements
            </p>
            <textarea
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-75"
              rows={5}
              placeholder="Describe your business activities and the software you need"
              disabled
            />
            <p className="mt-2 text-xs text-zinc-400">
              Login required to generate a software plan.
            </p>
            <button
              className="mt-4 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled
            >
              Generate Software Plan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
