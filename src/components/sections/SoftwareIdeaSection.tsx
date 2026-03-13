import Link from "next/link";

export default function SoftwareIdeaSection() {
  return (
    <section id="software-idea" className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              AI Software Planner
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white">
              Describe your business or software concept and receive a
              structured development plan with recommended architecture,
              technology stack, and staged build prompts.
            </p>
            <p className="mt-3 text-base leading-relaxed text-white">
              The planner analyzes your inputs and produces a structured
              technical blueprint that experienced engineers review and refine.
            </p>
          </div>
          <div className="animate-fade-in-up rounded-lg border border-zinc-500 bg-zinc-700 p-6" style={{ animationDelay: "0.15s" }}>
            <p className="mb-3 text-sm font-medium text-white">
              Choose how you want to get started
            </p>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="rounded-md border border-white/20 bg-white/5 p-3">
                <span className="font-medium text-white">Option 1:</span>{" "}
                Professional software engineering prompts that ensure proper app
                structure, commit best practices, performance, security, and
                future scalability.
              </li>
              <li className="rounded-md border border-white/20 bg-white/5 p-3">
                <span className="font-medium text-white">Option 2:</span>{" "}
                Generate business ideas with professional software engineering AI
                prompts.
              </li>
            </ul>
            <Link
              href="/software-designer"
              className="mt-5 inline-block rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/90"
            >
              Open Software Planner
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
