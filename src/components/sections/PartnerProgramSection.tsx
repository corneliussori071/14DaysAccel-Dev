export default function PartnerProgramSection() {
  return (
    <section className="border-b border-zinc-200 bg-white px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Partner Program
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
              Earn 30% on every referral
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              Join our affiliate program and earn a 30% commission on all
              purchases made by users you refer, including recurring
              subscriptions. Share your unique link, track your earnings, and get
              paid consistently.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href="https://14daysacceldev.affonso.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-zinc-900 px-5 py-2.5 text-center text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md"
              >
                Join Partner Program
              </a>
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                title: "30% recurring commission",
                description:
                  "Earn on every payment your referrals make, including monthly and annual subscriptions.",
              },
              {
                title: "90-day cookie window",
                description:
                  "Referrals are tracked for 90 days, so you get credit even if they sign up later.",
              },
              {
                title: "Real-time dashboard",
                description:
                  "Track clicks, signups, and earnings from your account dashboard.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4"
              >
                <p className="text-sm font-medium text-zinc-900">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
