import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="border-b border-zinc-200 bg-white px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-400">
              AI-Accelerated Development
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 md:text-6xl">
              14DaysAccel Dev
            </h1>
            <p className="mt-6 text-xl font-medium text-zinc-600">
              Accelerated software development using advanced AI tools and
              professional engineering practices.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-500">
              AI accelerates code generation while experienced engineers make
              architectural, security, and performance decisions to ensure
              production quality software.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                View Projects
              </Link>
              <Link
                href="/#software-idea"
                className="rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Describe Your Software Idea
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <video
              className="w-full rounded-lg border border-zinc-200"
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
