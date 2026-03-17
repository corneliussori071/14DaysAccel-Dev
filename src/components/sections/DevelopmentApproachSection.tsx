"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ApproachItem {
  title: string;
  description: string;
  video: string;
}

const approaches: ApproachItem[] = [
  {
    title: "AI Accelerated Coding",
    description:
      "Advanced AI tools generate boilerplate, suggest implementations, and speed up repetitive tasks so engineers can focus on what matters.",
    video: "/ai_coding.mp4",
  },
  {
    title: "Engineering Architecture",
    description:
      "System design, scalability, and security are handled by experienced engineers who validate every architectural decision.",
    video: "/experts_oversight.mp4",
  },
  {
    title: "Production Ready Systems",
    description:
      "Final products are structured, maintainable, and scalable, built to meet professional standards from the first deployment.",
    video: "/to_production.mp4",
  },
];

export default function DevelopmentApproachSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 rounded-lg border border-zinc-500 bg-zinc-700 p-6 text-center">
          {isLoggedIn ? (
            <>
              <p className="text-base font-medium text-white">
                Generate professional software engineering prompts
              </p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-white/70">
                Use your tokens to create structured development plans and build
                prompts with the Software Designer.
              </p>
              <div className="mt-5">
                <Link
                  href="/software-designer"
                  className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Open Software Designer
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-base font-medium text-white">
                Sign up to generate professional software engineering prompts
              </p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-white/70">
                Create a free account and receive 1,000 tokens to start
                generating structured development plans and build prompts.
              </p>
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/software-designer?auth=signup"
                  className="rounded-md bg-white px-5 py-2.5 text-center text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/software-designer?auth=login"
                  className="rounded-md border border-white/30 px-5 py-2.5 text-center text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Log In
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            How It Works
          </h2>
          <p className="mt-3 text-sm text-white sm:text-base">
            A Structured Approach to Modern Software Development
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/80">
            We combine AI speed with disciplined engineering practices to
            deliver systems that are both fast to build and reliable in
            production.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {approaches.map((item, index) => (
            <div
              key={item.title}
              className="animate-fade-in-up flex flex-col items-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-full rounded-lg border border-zinc-500 bg-zinc-700 p-6 transition-all hover:-translate-y-1 hover:shadow-md">
                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {item.description}
                </p>
              </div>
              <div className="group mt-6 h-44 w-44 overflow-hidden rounded-full border-2 border-zinc-500 transition-all duration-300 hover:border-white/60 hover:shadow-lg hover:shadow-white/10 lg:h-52 lg:w-52">
                <video
                  src={item.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
