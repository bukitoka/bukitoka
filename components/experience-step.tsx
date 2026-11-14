"use client"

import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import { type ReactNode, useRef } from "react"
import { useReducedMotion } from "@/lib/use-motion-preference"

export function ExperienceStep({
  children,
  index,
}: {
  children: ReactNode
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { amount: 0.25 })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 45%"],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 25 })
  const rotate = useTransform(progress, [0, 1], [-90, 0])

  return (
    <div ref={ref} className="relative pl-9 sm:pl-12">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-2 w-px bg-border"
      >
        <motion.div
          data-experience-progress
          className="absolute inset-0 origin-top bg-brand-400"
          style={{ scaleY: reduce ? 1 : progress }}
        />
      </div>
      <motion.span
        aria-hidden="true"
        className={`absolute left-0 top-7 size-[17px] border-[3px] border-background ${index % 2 === 0 ? "bg-action" : "rounded-full bg-brand-300"}`}
        style={{ rotate: reduce ? 0 : rotate }}
      />
      <motion.div
        data-experience-entry
        initial={false}
        animate={
          reduce || !inView
            ? { x: 0, opacity: 1 }
            : { x: [20, 0], opacity: [0.35, 1] }
        }
        transition={{
          duration: reduce || !inView ? 0 : 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
