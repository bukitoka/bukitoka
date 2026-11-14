import { ArrowDown, ArrowUpRight, FileText } from "lucide-react"
import { Arcade } from "@/components/detour/arcade"
import { RotatingRole } from "@/components/rotating-role"
import { HeroTitle, Parallax } from "@/components/scroll-effects"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="pb-6 pt-7 sm:pb-10 sm:pt-12 md:pb-16 md:pt-20">
      <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-[1.3fr_0.8fr]">
        <div>
          <RotatingRole />
          <HeroTitle />
          <div className="mt-6 max-w-lg md:mt-10">
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              In 2021, I was building tools to move customer records and loan
              applications off paper. Since then, the work has taken me through
              warehouses, HR teams, and wine cellars.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:flex sm:flex-wrap md:mt-8">
            <Button asChild className="group px-4 sm:px-6">
              <a href="#contact">
                Hire me
                <ArrowUpRight
                  size={16}
                  className="transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                />
              </a>
            </Button>
            <Button asChild variant="outline" className="px-4 sm:px-6">
              <a href="#work">
                Read the work
                <ArrowDown size={16} />
              </a>
            </Button>
            <Button asChild variant="outline" className="px-4 sm:px-6">
              <a href="/resume">
                View résumé
                <FileText size={16} />
              </a>
            </Button>
          </div>
        </div>
        <Parallax
          className="mx-auto w-full max-w-lg lg:ml-auto lg:mr-0 lg:max-w-none lg:pb-2"
          distance={65}
        >
          <Arcade />
          <p className="mt-3 hidden text-xs leading-relaxed text-muted-foreground sm:block">
            A platform adventure, a little Nokia nostalgia, or a quick flight.
          </p>
        </Parallax>
      </div>
    </section>
  )
}
