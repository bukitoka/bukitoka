import { ScrollProgress, ScrollRibbon } from "@/components/scroll-effects"
import { AboutSection } from "@/components/sections/about-section"
import { ContactSection } from "@/components/sections/contact-section"
import { ExperienceSection } from "@/components/sections/experience-section"
import { HeroSection } from "@/components/sections/hero-section"
import { SkillsSection } from "@/components/sections/skills-section"
import { WorkSection } from "@/components/sections/work-section"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <a
        href="#main"
        className="fixed left-4 top-4 z-50 -translate-y-24 bg-primary p-4 text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>
      <SiteNavigation />
      <main id="main" className="mx-auto max-w-360 px-4 sm:px-6 md:px-12">
        <HeroSection />
        <ScrollRibbon />
        <WorkSection />
        <AboutSection />
        <ExperienceSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  )
}
