import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="border-b border-zinc-500 bg-[#545454] px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-16 text-center text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Your trusted software sourcecode and automated software designer tool
        </h1>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in-up">
            <p className="text-lg font-medium text-white sm:text-xl">
              Acquire ready-to-deploy SaaS or custom software for your startup
              or existing business in just a few clicks.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
              We use advanced AI tools to generate tens of thousands of lines of
              production-grade code for complex projects, reducing development
              costs to a few hundred dollars and cutting timelines to under 14
              days. Every project is supervised by experienced engineers who
              ensure proper security, clean data architecture, strong
              performance, and long-term scalability.
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
