"use client"

import { motion, useInView } from "motion/react"
import { type ReactNode, useRef } from "react"
import { useReducedMotion } from "@/lib/use-motion-preference"

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.12 })

  return (
    <div ref={ref} className="min-w-0">
      <motion.div
        className={`h-full min-w-0 ${className ?? ""}`}
        initial={false}
        animate={
          reduce || !inView
            ? { y: 0, opacity: 1 }
            : { y: [24, 0], opacity: [0.25, 1] }
        }
        transition={{
          duration: reduce || !inView ? 0 : 0.6,
          delay: reduce || !inView ? 0 : delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
