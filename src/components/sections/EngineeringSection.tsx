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
    <section className="border-b border-zinc-200 bg-white px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Engineering Philosophy
          </h2>
          <p className="mt-3 text-base text-zinc-500">
            The principles that guide every project built through this platform.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {principles.map((item, index) => (
            <div key={item.title} className="flex flex-col gap-3">
              <div className="text-sm font-medium text-zinc-300">
                0{index + 1}
              </div>
              <h3 className="text-base font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
