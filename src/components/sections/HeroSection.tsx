import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="border-b border-zinc-500 bg-[#545454] px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-16 text-center text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Accelerated Software Development
        </h1>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in-up">
            <p className="text-lg font-medium text-white sm:text-xl">
              Build production-ready software faster using AI-powered
              development guided by real engineering standards.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
              AI accelerates implementation while experienced engineers handle
              architecture, security, and performance, ensuring every system is
              built to scale from day one.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/projects"
                className="rounded-md bg-white px-5 py-2.5 text-center text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10"
              >
                View Projects
              </Link>
              <Link
                href="/software-designer"
                className="rounded-md bg-white px-5 py-2.5 text-center text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg hover:shadow-white/10"
              >
                Describe Your Software Idea
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <video
              className="w-full rounded-lg border border-zinc-500"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/video_demo.mp4" type="video/mp4" />
              Your browser does not support the video element.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
