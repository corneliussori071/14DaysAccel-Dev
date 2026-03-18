export default function UpworkCTASection() {
  return (
    <section className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Finished generating your software design and need our team to build
            it for you?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            No problem. Our experienced team is ready to turn your ideas into a
            production-ready MVP within 14 days and hand over the complete source
            code to you.
          </p>
          <div className="mt-8">
            <a
              href="https://www.upwork.com/freelancers/14daysaccel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg hover:shadow-white/10"
            >
              Send Us a Contract on Upwork
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
