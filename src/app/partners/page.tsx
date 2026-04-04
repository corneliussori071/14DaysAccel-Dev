import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partner Program",
  description:
    "Earn 30% recurring commission by referring clients to 14DaysAccel Dev. Join our affiliate program for web developers, agencies, consultants, and content creators.",
};

const AFFILIATE_SIGNUP_URL = "https://14daysacceldev.affonso.io/";

const benefits = [
  {
    title: "30% Recurring Commission",
    description:
      "Earn on every payment your referrals make, including monthly and annual subscriptions, for the lifetime of the customer.",
  },
  {
    title: "90-Day Cookie Window",
    description:
      "Referrals are tracked for 90 days, so you get credit even if they convert weeks after clicking your link.",
  },
  {
    title: "Dashboard Access",
    description:
      "Track clicks, signups, and commissions in real time from your personal affiliate dashboard.",
  },
  {
    title: "Reliable Payouts",
    description:
      "Commissions are paid out consistently. No chasing invoices, no guesswork.",
  },
  {
    title: "Marketing Resources",
    description:
      "Get access to banners, widgets, email templates, and more from the Marketing Toolkit to promote 14DaysAccel Dev effectively.",
  },
];

const audiences = [
  "Web developers and freelancers",
  "Digital agencies and consultancies",
  "Business coaches and startup advisors",
  "Tech bloggers, YouTubers, and newsletter writers",
  "No-code and low-code builders",
  "SaaS reviewers and educators",
];

const steps = [
  {
    step: 1,
    title: "Apply",
    description: "Fill out a short form to join the affiliate program.",
  },
  {
    step: 2,
    title: "Get Approved",
    description:
      "We review applications and approve qualified partners within 48 hours.",
  },
  {
    step: 3,
    title: "Share Your Link",
    description:
      "Receive your unique referral link and start sharing it with your audience.",
  },
  {
    step: 4,
    title: "Earn Commissions",
    description:
      "Earn 30% on every sale from your referrals, for as long as they remain a customer.",
  },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-zinc-200 bg-zinc-950 px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Affiliate Program
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Earn 30% recurring commission
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Refer clients and audiences to 14DaysAccel Dev, the platform where
            businesses acquire production-ready software in under 14 days, and
            earn 30% on every payment they make.
          </p>
          <div className="mt-10">
            <a
              href={AFFILIATE_SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md bg-white px-8 py-3 text-sm font-semibold text-zinc-900 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Join the Partner Program
            </a>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="border-b border-zinc-200 bg-white px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
              What You Get
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">
              Everything you need to start earning from day one.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-5"
              >
                <p className="text-sm font-semibold text-zinc-900">
                  {benefit.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is It For */}
      <section className="border-b border-zinc-200 bg-zinc-50 px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                Who Is It For?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-600">
                Our affiliate program is built for anyone with an audience that
                needs software. If you work with startups, small businesses, or
                tech-savvy professionals looking for rapid software delivery,
                this program is for you.
              </p>
            </div>
            <ul className="space-y-3">
              {audiences.map((audience) => (
                <li
                  key={audience}
                  className="flex items-center gap-3 text-sm text-zinc-700"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                    &#10003;
                  </span>
                  {audience}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-zinc-200 bg-white px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
              How It Works
            </h2>
          </div>
          <div className="mt-12 space-y-0">
            {steps.map((item, index) => (
              <div key={item.step} className="relative flex gap-6 pb-10">
                {/* Vertical connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-5 top-10 h-full w-px bg-zinc-200" />
                )}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {item.step}
                </div>
                <div className="pt-1.5">
                  <p className="text-sm font-semibold text-zinc-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Now CTA */}
      <section className="bg-zinc-950 px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Ready to start earning?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
            Join the 14DaysAccel Dev affiliate program today. It takes less than
            two minutes to apply, and you could start earning commissions this
            week.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={AFFILIATE_SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md bg-white px-8 py-3 text-sm font-semibold text-zinc-900 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Join the Partner Program
            </a>
            <Link
              href="/partners/marketing-toolkit"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Marketing Toolkit
            </Link>
            <Link
              href="/"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
