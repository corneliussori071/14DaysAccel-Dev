interface SectionContainerProps {
  children: React.ReactNode;
  id?: string;
  variant?: "light" | "dark";
}

export default function SectionContainer({
  children,
  id,
  variant = "light",
}: SectionContainerProps) {
  const bg = variant === "dark" ? "bg-zinc-950" : "bg-zinc-50";
  const border =
    variant === "dark" ? "border-zinc-800" : "border-zinc-200";

  return (
    <section
      id={id}
      className={`border-b ${border} ${bg} px-6 py-20 md:px-12 lg:px-24`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
