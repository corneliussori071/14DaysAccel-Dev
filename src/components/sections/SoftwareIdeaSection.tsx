import Link from "next/link";

export default function SoftwareIdeaSection() {
  return (
    <section id="software-idea" className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl text-center">
        <div className="animate-fade-in-up mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            AI Software Planner
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white sm:text-base">
            Turn your business idea into a structured development plan with
            clear architecture, recommended technologies, and staged build
            prompts.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
            The system analyses your input and produces a technical blueprint
            designed for real-world implementation.
          </p>
          <div className="mt-8">
            <Link
              href="/software-designer"
              className="inline-block rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg hover:shadow-white/10"
            >
              Open Software Planner
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
