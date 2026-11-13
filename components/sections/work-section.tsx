import { ArrowUpRight } from "lucide-react"
import { AutoCRMIllustration } from "@/components/illustrations/autocrm-illustration"
import { WineAdoreIllustration } from "@/components/illustrations/wineadore-illustration"
import { Reveal } from "@/components/reveal"
import { AnimatedHeading, ProjectCard } from "@/components/scroll-effects"
import { SectionLabel } from "@/components/sections/section-label"
import { projects } from "@/data/profile"

export function WorkSection() {
  return (
    <section id="work" className="py-12 md:py-24">
      <SectionLabel number="01">What happened next</SectionLabel>
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 md:mb-12">
          <AnimatedHeading className="font-heading text-4xl sm:text-5xl leading-none tracking-[-0.055em] md:text-7xl">
            From loan forms
            <br />
            to wine cellars.
          </AnimatedHeading>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            The industries changed. The work still started with the same thing:
            understanding what someone needed to get done.
          </p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.number} delay={i * 0.14}>
            <ProjectCard>
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit ${project.name}`}
                className="block"
              >
                <div className="relative flex aspect-[1.55] sm:aspect-[1.35] items-center justify-center overflow-hidden bg-brand-900 px-5 py-12 text-brand-100 sm:p-8">
                  {project.kind === "wine" ? (
                    <WineAdoreIllustration />
                  ) : (
                    <AutoCRMIllustration />
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-4 right-4 grid size-10 place-items-center border border-border bg-background text-foreground"
                  >
                    <ArrowUpRight size={20} />
                  </span>
                </div>
              </a>
              <div className="p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-3xl tracking-tight">
                    {project.name}
                  </h3>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {project.year}
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
                <p className="mt-4 border-l-2 border-brand-400 pl-3 text-sm leading-relaxed">
                  {project.outcome}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="border border-border bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <details className="group/notes mt-5 border-t border-border pt-1">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-sm">
                    Behind the build
                    <span
                      aria-hidden="true"
                      className="text-xl transition-transform group-open/notes:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <ul className="mb-4 list-disc space-y-3 pl-4 text-sm leading-relaxed text-muted-foreground">
                    {project.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </details>
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:underline"
                >
                  Explore {project.name}
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </ProjectCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
