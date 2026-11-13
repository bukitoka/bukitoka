import type { ReactNode } from "react"
import { resume } from "@/data/resume"

function ResumeMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="size-14 shrink-0 min-[400px]:size-20 sm:size-28"
    >
      <circle
        cx="42"
        cy="42"
        r="28"
        fill="none"
        strokeWidth="12"
        className="stroke-brand-600"
      />
      <rect
        x="48"
        y="48"
        width="36"
        height="36"
        strokeWidth="5"
        className="fill-brand-100 stroke-brand-600"
      />
      <rect x="70" y="12" width="13" height="13" className="fill-action" />
    </svg>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 text-base font-semibold">
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-brand-200" />
    </h2>
  )
}

function SheetFooter({ page }: { page: number }) {
  return (
    <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-brand-200 pt-4 font-mono text-xs text-brand-600">
      <span>{resume.displayName} / Résumé</span>
      <span>{page} / 2</span>
    </footer>
  )
}

const sheetClass =
  "border border-brand-200 bg-white px-5 py-8 sm:px-10 sm:py-10"

export function ResumeSheet() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <article aria-label="Resume page one" className={sheetClass}>
        <header className="mb-5 flex items-start justify-between gap-5 border-b border-brand-600 pb-6">
          <div className="min-w-0">
            <h1 className="font-heading text-3xl leading-tight tracking-tight sm:text-5xl">
              {resume.name}
            </h1>
            <p className="mt-3 text-[15px] font-semibold sm:text-xl">
              {resume.role}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-brand-600">
              {resume.focus}
            </p>
          </div>
          <ResumeMark />
        </header>
        <address className="mb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm not-italic text-brand-600">
          <a
            href={`mailto:${resume.email}`}
            className="min-h-8 break-all underline-offset-4 hover:underline"
          >
            {resume.email}
          </a>
          <a
            href={resume.phoneLink}
            className="min-h-8 underline-offset-4 hover:underline"
          >
            {resume.phone}
          </a>
          <span>{resume.location}</span>
          <a
            href={resume.github}
            className="min-h-8 underline-offset-4 hover:underline"
          >
            github.com/bukitoka
          </a>
          <a
            href={resume.linkedin}
            className="min-h-8 underline-offset-4 hover:underline"
          >
            linkedin.com/in/kusumajy
          </a>
        </address>
        <SectionTitle>Summary</SectionTitle>
        <p className="mb-8 text-[15px] leading-7 text-brand-600">
          {resume.summary}
        </p>
        <section>
          <SectionTitle>Work Experience</SectionTitle>
          <div className="space-y-7">
            {resume.experience.map((job) => (
              <article key={job.company}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-heading text-2xl tracking-tight">
                    {job.company}
                  </h3>
                  <p className="font-mono text-xs tracking-wide text-brand-600">
                    {job.date}
                  </p>
                </div>
                <p className="mt-1 text-sm font-medium text-brand-600">
                  {job.role}
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-4 text-[15px] leading-relaxed">
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <SheetFooter page={1} />
      </article>
      <article aria-label="Resume page two" className={sheetClass}>
        <section className="mb-8">
          <SectionTitle>Projects</SectionTitle>
          <div className="space-y-6">
            {resume.projects.map((project) => (
              <article
                key={project.name}
                className="border-b border-brand-200 pb-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-heading text-2xl tracking-tight">
                    {project.name}
                  </h3>
                  <span className="font-mono text-xs text-brand-600">
                    {project.year}
                  </span>
                </div>
                <a
                  href={project.href}
                  className="mt-1 inline-block max-w-full break-all text-sm text-brand-600 underline-offset-4 hover:underline"
                >
                  {project.href.replace(/^https?:\/\//, "")}
                </a>
                <ul className="mt-3 list-disc space-y-2 pl-4 text-[15px] leading-relaxed">
                  {project.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-relaxed text-brand-600">
                  {project.stack.join(" · ")}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="mb-8">
          <SectionTitle>Skills</SectionTitle>
          <dl className="space-y-3">
            {resume.skills.map((skill) => (
              <div
                key={skill.label}
                className="grid gap-1 text-[15px] sm:grid-cols-[9rem_1fr] sm:gap-4"
              >
                <dt className="font-semibold text-brand-600">{skill.label}</dt>
                <dd className="leading-relaxed">{skill.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="mb-8">
          <SectionTitle>Education</SectionTitle>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-heading text-xl">{resume.education.school}</h3>
            <p className="font-mono text-xs text-brand-600">
              {resume.education.period}
            </p>
          </div>
          <p className="mt-2 text-[15px] leading-relaxed">
            {resume.education.degree} · {resume.education.result}
          </p>
        </section>
        <section>
          <SectionTitle>Certifications</SectionTitle>
          <p className="text-[15px] leading-relaxed">{resume.certification}</p>
        </section>
        <section className="mt-8">
          <SectionTitle>Languages</SectionTitle>
          <p className="text-[15px] leading-relaxed">{resume.languages}</p>
        </section>
        <SheetFooter page={2} />
      </article>
    </div>
  )
}
