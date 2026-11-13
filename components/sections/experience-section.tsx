import { Reveal } from "@/components/reveal"
import { AnimatedHeading } from "@/components/scroll-effects"
import { SectionLabel } from "@/components/sections/section-label"
import { experience } from "@/data/profile"

export function ExperienceSection() {
  return (
    <section id="experience" className="border-t border-border py-12 md:py-24">
      <SectionLabel number="03">The longer version</SectionLabel>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <AnimatedHeading className="font-heading text-4xl sm:text-5xl tracking-[-0.055em] md:text-6xl">
          How one role
          <br />
          led to the next.
        </AnimatedHeading>
        <div>
          {experience.toReversed().map((job, i) => (
            <Reveal key={job.company} delay={i * 0.08}>
              <details
                className="group border-b border-border py-5 md:py-6"
                open={i === 0}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 font-mono text-[11px] tracking-wider text-muted-foreground">
                      {job.date.replaceAll("—", "/")}
                    </p>
                    <h3 className="font-heading text-2xl tracking-tight">
                      {job.company}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {job.role}
                    </p>
                  </div>
                  <span
                    className="mt-5 text-2xl text-muted-foreground transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {job.description}
                </p>
              </details>
            </Reveal>
          ))}
          <div className="pt-6 text-sm leading-relaxed text-muted-foreground">
            Bachelor’s Degree, Information System · ITB STIKOM Bali
            <br />
            2017–2021 · GPA 3.74 · EF SET English C1 Advanced
          </div>
        </div>
      </div>
    </section>
  )
}
