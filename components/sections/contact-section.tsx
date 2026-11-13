import { ArrowUpRight, FileText } from "lucide-react"
import { ContactShapes } from "@/components/illustrations/contact-shapes"
import { AnimatedHeading } from "@/components/scroll-effects"
import { GitHubIcon, LinkedInIcon } from "@/components/social-icons"

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative mb-6 overflow-hidden border border-border bg-brand-100 px-5 py-10 text-brand-900 dark:bg-brand-800 dark:text-brand-100 md:px-12 md:py-20"
    >
      <div className="relative lg:max-w-[68%]">
        <AnimatedHeading className="max-w-3xl font-heading text-[clamp(2.25rem,6vw,6rem)] leading-[0.98] tracking-[-0.065em]">
          What are you
          <br />
          working on?
          <ArrowUpRight
            className="ml-4 inline size-14 md:size-20"
            strokeWidth={1}
          />
        </AnimatedHeading>
        <p className="mt-5 max-w-md text-base leading-relaxed">
          A new product, a slow checkout, or a workflow held together by
          spreadsheets. Tell me where you’re stuck.
        </p>
        <a
          href="mailto:kusuma.jaya1512@gmail.com"
          className="mt-6 inline-flex min-h-11 max-w-full items-center break-all text-sm underline decoration-brand-600 underline-offset-8 dark:decoration-brand-400 sm:text-xl"
        >
          kusuma.jaya1512@gmail.com
        </a>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm md:mt-10">
          <a
            href="https://github.com/bukitoka"
            className="flex min-h-11 items-center gap-2"
          >
            <GitHubIcon />
            GitHub
            <ArrowUpRight size={14} />
          </a>
          <a
            href="https://linkedin.com/in/kusumajy"
            className="flex min-h-11 items-center gap-2"
          >
            <LinkedInIcon />
            LinkedIn
            <ArrowUpRight size={14} />
          </a>
          <a href="/resume" className="flex min-h-11 items-center gap-2">
            View résumé
            <FileText size={14} />
          </a>
        </div>
      </div>
      <ContactShapes />
    </section>
  )
}
