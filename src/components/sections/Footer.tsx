"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  label: string;
  href: string;
}

const navigationLinks: NavLink[] = [
  { label: "Projects", href: "/projects" },
  { label: "Software Planner", href: "/software-designer" },
  { label: "Pricing", href: "/subscriptions" },
  { label: "Engineering Philosophy", href: "/#engineering" },
];

const accountLinks: NavLink[] = [
  { label: "Log In", href: "/software-designer?auth=login" },
  { label: "Sign Up", href: "/software-designer?auth=signup" },
  { label: "My Account", href: "/profile" },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/sys")) return null;

  return (
    <footer className="bg-zinc-950 px-6 py-12 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="text-sm font-semibold text-white">
              14DaysAccel Dev
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              AI-accelerated software development with professional engineering
              oversight.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Navigation
            </p>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Account
            </p>
            <ul className="space-y-2">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Connect
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/corneliussori071"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.upwork.com/freelancers/14daysaccel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Upwork
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-zinc-800 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} 14DaysAccel Dev. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/terms"
                className="text-xs text-zinc-500 transition-colors hover:text-white"
              >
                Terms and Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-xs text-zinc-500 transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
