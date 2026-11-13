"use client"

import { AnimatePresence, motion, useInView } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/lib/use-motion-preference"

const roles = [
  "full-stack engineer",
  "frontend engineer",
  "backend engineer",
  "bug detective",
  "database whisperer",
  "pixel perfectionist",
  "deployment pilot",
  "workflow tinkerer",
  "performance nerd",
  "refactoring enthusiast",
  "console.log detective",
  "CSS negotiator",
  "tab hoarder",
  "semicolon dodger",
  "merge conflict mediator",
  "localhost resident",
  "404 explorer",
  "cache exorcist",
  "professional Googler",
]

export function RotatingRole() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5 })
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce || !inView) return

    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % roles.length)
    }, 3200)

    return () => window.clearInterval(timer)
  }, [reduce, inView])

  return (
    <div
      ref={ref}
      className="mb-5 flex min-w-0 items-center gap-1 text-lg tracking-tight md:mb-8 md:text-xl"
    >
      <p className="sr-only">
        Hi, I’m Kusuma, a full-stack engineer, with a few other tricks up my
        sleeve.
      </p>
      <p
        aria-hidden="true"
        className="flex min-w-0 flex-wrap items-baseline gap-x-2"
      >
        <span className="shrink-0">Hi, I’m Kusuma, a</span>
        <span className="relative grid overflow-hidden font-medium text-foreground">
          {roles.map((role) => (
            <span
              key={role}
              className="invisible col-start-1 row-start-1 whitespace-nowrap"
            >
              {role}.
            </span>
          ))}
          <AnimatePresence initial={false} mode="sync">
            <motion.span
              key={reduce ? roles[0] : roles[index]}
              className="absolute inset-0 whitespace-nowrap"
              initial={{ y: "40%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-40%", opacity: 0 }}
              transition={{
                duration: reduce ? 0 : 0.65,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {reduce ? roles[0] : roles[index]}.
            </motion.span>
          </AnimatePresence>
        </span>
      </p>
    </div>
  )
}
