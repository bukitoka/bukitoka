import { Mail } from "lucide-react"
import Image from "next/image"
import { Reveal } from "@/components/reveal"
import { AnimatedHeading, Parallax } from "@/components/scroll-effects"
import { SectionLabel } from "@/components/sections/section-label"
import { GitHubIcon, LinkedInIcon } from "@/components/social-icons"

export function AboutSection() {
  return (
    <section id="about" className="border-t border-border py-12 md:py-24">
      <SectionLabel number="02">What stayed the same</SectionLabel>
      <div className="grid gap-9 md:gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="grid grid-cols-[7rem_1fr] items-center gap-5 sm:block">
          <Parallax className="max-w-xs sm:max-w-md" distance={30}>
            <div className="relative">
              <Image
                src="/portrait.jpeg"
                alt="I Ketut Kusumajaya, full-stack engineer based in Bali"
                width={362}
                height={429}
                sizes="(max-width: 639px) 112px, (max-width: 1023px) 448px, 40vw"
                className="aspect-square w-full object-cover sm:grayscale transition-[filter] duration-700 sm:hover:grayscale-0"
              />
              <div
                aria-hidden="true"
                data-profile-badge
                className="absolute -bottom-2 -right-2 grid size-10 place-items-center rounded-full border-4 border-background bg-brand-300 font-heading text-2xl text-brand-900 sm:-bottom-5 sm:-right-3 sm:size-24 sm:border-8 sm:text-4xl md:-right-5"
              >
                k.
              </div>
            </div>
          </Parallax>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground sm:mt-6">
            I Ketut Kusumajaya.
          </p>
        </Reveal>
        <Reveal>
          <AnimatedHeading className="font-heading text-4xl sm:text-5xl leading-[1.05] tracking-[-0.055em] md:text-6xl">
            Someone has to
            <br />
            use this tomorrow.
          </AnimatedHeading>
          <p className="mt-7 max-w-xl leading-relaxed text-muted-foreground">
            At MKM Honda, that meant moving customer records and loan workflows
            off paper. At Grune, it meant turning stock and delivery tracking
            into a warehouse app.
          </p>
          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
            The release wasn’t the end of the job. There were reports to get
            right and production issues to fix. That’s the part of building
            software I keep coming back to.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://github.com/bukitoka"
              aria-label="GitHub profile"
              className="grid size-11 place-items-center transition-colors hover:bg-muted"
            >
              <GitHubIcon />
            </a>
            <a
              href="https://linkedin.com/in/kusumajy"
              aria-label="LinkedIn profile"
              className="grid size-11 place-items-center transition-colors hover:bg-muted"
            >
              <LinkedInIcon />
            </a>
            <a
              href="mailto:kusuma.jaya1512@gmail.com"
              aria-label="Email Kusuma"
              className="grid size-11 place-items-center transition-colors hover:bg-muted"
            >
              <Mail size={20} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
