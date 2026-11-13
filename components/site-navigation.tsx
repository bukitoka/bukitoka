"use client"

import { ArrowUpRight } from "lucide-react"
import { motion, useInView } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { ThemePicker } from "@/components/theme-picker"
import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/lib/use-motion-preference"

const links = [
  { id: "work", label: "Selected work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Let’s talk" },
]

export function SiteNavigation() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { amount: 0.2 })
  const [active, setActive] = useState("")
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const section = entries.find((entry) => entry.isIntersecting)
        if (section) setActive(section.target.id)
      },
      { rootMargin: "-15% 0px -65% 0px" },
    )
    for (const { id } of links) {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <header ref={ref} id="top" className="border-b border-border">
      <motion.div
        className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 sm:flex-nowrap sm:px-6 sm:py-5 md:px-12"
        initial={false}
        animate={
          reduce || !inView
            ? { y: 0, opacity: 1 }
            : { y: [-12, 0], opacity: [0.6, 1] }
        }
        transition={{
          duration: reduce || !inView ? 0 : 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <a
          href="#top"
          aria-label="Kusuma home"
          className="group flex items-center gap-3"
        >
          <span className="grid size-10 place-items-center bg-primary font-heading text-2xl text-primary-foreground transition-transform duration-300 motion-safe:group-hover:-rotate-6">
            k.
          </span>
          <span className="font-heading text-2xl tracking-tight sm:text-3xl">
            Kusuma
          </span>
        </a>
        <nav
          aria-label="Main navigation"
          onPointerLeave={() => setPreview(null)}
          className="order-last flex w-full items-center justify-between gap-4 text-base font-medium sm:order-0 sm:w-auto sm:justify-start sm:gap-6 md:gap-8"
        >
          {links.map(({ id, label }) => (
            <motion.a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              onClick={() => setActive(id)}
              onPointerEnter={() => setPreview(id)}
              onFocus={() => setPreview(id)}
              onBlur={() => setPreview(null)}
              className="group relative flex min-h-11 items-center gap-1.5"
              whileHover={reduce ? undefined : { y: -2 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
            >
              <span>{label}</span>
              {id === "contact" && (
                <ArrowUpRight
                  aria-hidden="true"
                  size={16}
                  className="transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:-translate-y-0.5 motion-safe:group-focus-visible:translate-x-0.5"
                />
              )}
              {(preview ?? active) === id && (
                <motion.span
                  aria-hidden="true"
                  data-nav-indicator
                  layoutId="nav-underline"
                  className="absolute inset-x-0 bottom-1 h-px origin-left bg-action"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 30 }
                  }
                />
              )}
            </motion.a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild className="hidden min-h-11 px-4 lg:inline-flex">
            <a href="#contact">
              Hire me
              <ArrowUpRight size={14} />
            </a>
          </Button>
          <ThemePicker />
        </div>
      </motion.div>
    </header>
  )
}
