import { Reveal } from "@/components/reveal"
import { SectionLabel } from "@/components/sections/section-label"
import { TechLogo } from "@/components/tech-logo"
import { skills } from "@/data/profile"

export function SkillsSection() {
  return (
    <section className="py-12 md:py-20">
      <SectionLabel number="04">How I build it</SectionLabel>
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {skills.map((skill, i) => (
          <Reveal
            key={skill.title}
            delay={i * 0.12}
            className="grid grid-cols-[2.5rem_1fr] gap-x-4 md:block"
          >
            <div
              aria-hidden="true"
              className="row-span-2 flex size-10 items-center justify-center border border-border md:mb-6 md:size-12"
            >
              {i === 0 ? (
                <span className="size-6 rounded-full bg-brand-300" />
              ) : i === 1 ? (
                <span className="size-6 bg-brand-300" />
              ) : i === 2 ? (
                <span className="h-6 w-3 rounded-r-full bg-brand-300" />
              ) : (
                <span className="size-6 rotate-45 border-4 border-brand-300" />
              )}
            </div>
            <h3 className="font-heading text-2xl tracking-tight">
              {skill.title}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-3 text-sm text-muted-foreground md:mt-4">
              {skill.items.split(" · ").map((name) => (
                <li
                  key={name}
                  className="inline-flex min-h-7 items-center gap-2"
                >
                  <TechLogo name={name} />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
