import Link from "next/link";
import { getFeaturedProjects } from "@/services/projectService";
import FeaturedProjectsCarousel from "./FeaturedProjectsCarousel";

export default async function FeaturedProjectsSection() {
  const projects = await getFeaturedProjects();

  return (
    <section className="border-b border-zinc-500 bg-[#545454] px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Featured Software Systems
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white sm:text-base">
            Explore our catalogue of software systems we have built and those
            currently in development. Every listed project is available to be
            customised for your business needs, often within 24 hours depending
            on scope.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
            Browse each project freely — some include testing accounts so you
            can try them first. When you are ready, send us a contract on
            Upwork to get started.
          </p>
          <div className="mt-6">
            <Link
              href="/projects"
              className="inline-block rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg hover:shadow-white/10"
            >
              View Full Project Catalogue
            </Link>
          </div>
        </div>

        {projects.length > 0 && (
          <FeaturedProjectsCarousel projects={projects} />
        )}
      </div>
    </section>
  );
}
