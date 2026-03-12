interface ApproachItem {
  title: string;
  description: string;
}

const approaches: ApproachItem[] = [
  {
    title: "AI Accelerated Coding",
    description:
      "Advanced AI tools generate boilerplate, suggest implementations, and speed up repetitive tasks so engineers can focus on what matters.",
  },
  {
    title: "Engineering Architecture",
    description:
      "System design, scalability, and security are handled by experienced engineers who validate every architectural decision.",
  },
  {
    title: "Production Ready Systems",
    description:
      "Final products are structured, maintainable, and scalable, built to meet professional standards from the first deployment.",
  },
];

export default function DevelopmentApproachSection() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50 px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
            How It Works
          </h2>
          <p className="mt-3 text-base text-zinc-500">
            A disciplined approach that combines AI velocity with engineering
            quality.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {approaches.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-zinc-200 bg-white p-6"
            >
              <h3 className="text-base font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex h-48 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-zinc-400">
          Workflow animation placeholder
        </div>
      </div>
    </section>
  );
}
