import { Reveal } from "@/components/reveal"
import { SectionLabel } from "@/components/sections/section-label"
import { skills } from "@/data/profile"

export function SkillsSection() {
  return (
    <section className="py-12 md:py-20">
      <SectionLabel number="04">How I build it</SectionLabel>
      <div className="grid gap-8 md:grid-cols-3">
        {skills.map((skill, i) => (
          <Reveal
            key={skill.title}
            delay={i * 0.12}
            className="grid grid-cols-[2.5rem_1fr] gap-x-4 md:block"
          >
            <div className="row-span-2 flex size-10 items-center justify-center border border-border md:mb-6 md:size-12">
              {i === 0 ? (
                <span className="size-6 rounded-full bg-brand-300" />
              ) : i === 1 ? (
                <span className="size-6 bg-brand-300" />
              ) : (
                <span className="size-6 rotate-45 border-4 border-brand-300" />
              )}
            </div>
            <h3 className="font-heading text-2xl tracking-tight">
              {skill.title}
            </h3>
            <p className="mt-1 max-w-xs text-sm leading-7 text-muted-foreground md:mt-3">
              {skill.items}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
