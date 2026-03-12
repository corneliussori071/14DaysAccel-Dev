interface NavLink {
  label: string;
  href: string;
}

const navigationLinks: NavLink[] = [
  { label: "Projects", href: "#" },
  { label: "Architecture Planner", href: "#" },
  { label: "Engineering Philosophy", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-white px-6 py-12 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <p className="text-sm font-semibold text-zinc-900">
              14DaysAccel Dev
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              AI-accelerated software development with professional engineering
              oversight.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Navigation
            </p>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Connect
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  Upwork
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-zinc-200 pt-6">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} 14DaysAccel Dev. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
