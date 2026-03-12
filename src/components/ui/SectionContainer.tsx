interface SectionContainerProps {
  children: React.ReactNode;
  id?: string;
}

export default function SectionContainer({
  children,
  id,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24"
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
