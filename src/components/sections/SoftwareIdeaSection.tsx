export default function SoftwareIdeaSection() {
  return (
    <section id="software-idea" className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Software Architecture Planner
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Describe your business operations and receive a recommended
              software architecture and technology stack tailored to your
              specific requirements.
            </p>
            <p className="mt-3 text-base leading-relaxed text-zinc-300">
              The planner analyzes your inputs and produces a structured
              technical blueprint that experienced engineers review and refine.
            </p>
          </div>
          <div className="animate-fade-in-up rounded-lg border border-zinc-500 bg-zinc-700 p-6" style={{ animationDelay: "0.15s" }}>
            <p className="mb-3 text-sm font-medium text-zinc-200">
              Describe your software requirements
            </p>
            <textarea
              className="w-full rounded-md border border-zinc-500 bg-zinc-800 p-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-75"
              rows={5}
              placeholder="Describe your business activities and the software you need"
              disabled
            />
            <p className="mt-2 text-xs text-zinc-400">
              Login required to generate a software plan.
            </p>
            <button
              className="mt-4 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
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
