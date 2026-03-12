export default function SoftwareIdeaSection() {
  return (
    <section id="software-idea" className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Software Architecture Planner
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white">
              Describe your business operations and receive a recommended
              software architecture and technology stack tailored to your
              specific requirements.
            </p>
            <p className="mt-3 text-base leading-relaxed text-white">
              The planner analyzes your inputs and produces a structured
              technical blueprint that experienced engineers review and refine.
            </p>
          </div>
          <div className="animate-fade-in-up rounded-lg border border-zinc-500 bg-zinc-700 p-6" style={{ animationDelay: "0.15s" }}>
            <p className="mb-3 text-sm font-medium text-white">
              Describe your software requirements
            </p>
            <textarea
              className="w-full rounded-md border border-white/30 bg-white/10 p-4 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:cursor-not-allowed disabled:opacity-75"
              rows={5}
              placeholder="Describe your business activities and the software you need"
              disabled
            />
            <p className="mt-2 text-xs text-white/70">
              Login required to generate a software plan.
            </p>
            <button
              className="mt-4 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
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
