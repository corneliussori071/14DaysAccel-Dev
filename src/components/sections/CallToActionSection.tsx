import Link from "next/link";

export default function CallToActionSection() {
  return (
    <section id="contact" className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Ready to build professional software?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white">
          Explore the full catalogue of available software systems or reach out
          directly to discuss your project requirements.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/projects"
            className="rounded-md bg-white px-5 py-2.5 text-center text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md"
          >
            View Project Catalogue
          </Link>
          <a
            href="https://www.upwork.com/freelancers/14daysaccel"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-white px-5 py-2.5 text-center text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md"
          >
            Work With Us on Upwork
          </a>
        </div>
      </div>
    </section>
  );
}
