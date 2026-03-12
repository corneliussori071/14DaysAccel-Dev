export default function CallToActionSection() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50 px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Ready to build professional software?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-zinc-500">
          Explore the full catalogue of available software systems or reach out
          directly to discuss your project requirements.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
            View Project Catalogue
          </button>
          <a
            href="#"
            className="rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Work With Us on Upwork
          </a>
        </div>
      </div>
    </section>
  );
}
