interface Principle {
  title: string;
  description: string;
}

const principles: Principle[] = [
  {
    title: "AI tools accelerate coding",
    description:
      "AI handles routine implementation tasks, reducing development time without compromising standards.",
  },
  {
    title: "Engineering expertise ensures architectural quality",
    description:
      "Every system is designed by engineers who understand scalability, maintainability, and security at a production level.",
  },
  {
    title: "Systems designed to scale and remain maintainable",
    description:
      "Code is structured for long-term use, with clear architecture, documentation, and separation of concerns.",
  },
];

export default function EngineeringSection() {
  return (
    <section id="engineering" className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Engineering Philosophy
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white sm:text-base">
            The principles that guide every project built through this platform.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {principles.map((item, index) => (
            <div
              key={item.title}
              className="flex animate-fade-in-up flex-col gap-3 rounded-lg border border-zinc-500 bg-zinc-700 p-6 transition-all hover:-translate-y-1 hover:border-zinc-400"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="text-sm font-medium text-white/60">
                0{index + 1}
              </div>
              <h3 className="text-base font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/80">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
