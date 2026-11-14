import { ExperienceStep } from "@/components/experience-step"
import { AnimatedHeading } from "@/components/scroll-effects"
import { SectionLabel } from "@/components/sections/section-label"
import { experience } from "@/data/profile"
import { resume } from "@/data/resume"

export function ExperienceSection() {
  return (
    <section id="experience" className="border-t border-border py-12 md:py-24">
      <SectionLabel number="03">The longer version</SectionLabel>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="self-start lg:sticky lg:top-24">
          <AnimatedHeading className="font-heading text-4xl sm:text-5xl tracking-[-0.055em] md:text-6xl">
            How one role
            <br />
            led to the next.
          </AnimatedHeading>
        </div>
        <div>
          <ExperienceStep index={0}>
            <article className="border-b border-border py-5 md:py-6">
              <p className="mb-2 font-mono text-[11px] tracking-wider text-muted-foreground">
                {resume.education.period}
              </p>
              <h3 className="font-heading text-2xl tracking-tight">
                {resume.education.school}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {resume.education.degree}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {resume.education.result}
              </p>
            </article>
          </ExperienceStep>
          {experience.toReversed().map((job, i) => (
            <ExperienceStep key={job.company} index={i + 1}>
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
            </ExperienceStep>
          ))}
        </div>
      </div>
    </section>
  )
}
