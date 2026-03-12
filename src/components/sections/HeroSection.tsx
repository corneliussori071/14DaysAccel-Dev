import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="border-b border-zinc-500 bg-[#545454] px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in-up">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/70">
              AI-Accelerated Development
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-white md:text-6xl">
              14DaysAccel Dev
            </h1>
            <p className="mt-6 text-xl font-medium text-white">
              Accelerated software development using advanced AI tools and
              professional engineering practices.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              AI accelerates code generation while experienced engineers make
              architectural, security, and performance decisions to ensure
              production quality software.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="rounded-md bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10"
              >
                View Projects
              </Link>
              <Link
                href="/#software-idea"
                className="rounded-md border border-white/40 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/20"
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
