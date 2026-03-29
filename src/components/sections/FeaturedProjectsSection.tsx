import Link from "next/link";
import { getFeaturedProjects } from "@/services/projectService";
import FeaturedProjectsCarousel from "./FeaturedProjectsCarousel";

export default async function FeaturedProjectsSection() {
  const projects = await getFeaturedProjects();

  return (
    <section className="border-b border-zinc-200 bg-zinc-50 px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Featured Software Systems
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-zinc-700">
            Explore our catalogue of software systems we have built and those
            currently in development. Every listed project is available to be
            customised for your business needs, often within 24 hours depending
            on scope.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-base leading-relaxed text-zinc-600">
            Browse each project freely, some include testing accounts so you
            can try them first before making a commitment. Upon purchase, you
            receive a secure download link and a detailed set up instructions
            suitable for experts, beginners and a copy-paste AI prompt to fully
            handle deployment for you. You are also able to open a ticket for
            any purchased product if you are facing any challenge.
          </p>
          <div className="mt-6">
            <Link
              href="/projects"
              className="inline-block rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-lg"
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
