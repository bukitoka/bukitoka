"use client"

import { ArrowDownRight } from "lucide-react"
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import { type PointerEvent, type ReactNode, useRef } from "react"
import { useLimitedMotion, useReducedMotion } from "@/lib/use-motion-preference"

const ease = [0.22, 1, 0.36, 1] as const

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduce = useReducedMotion()
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      data-scroll-progress
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-brand-300"
      style={{ scaleX: reduce ? scrollYProgress : progress }}
    />
  )
}

export function HeroTitle() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { amount: 0.2 })

  return (
    <h1
      ref={ref}
      className="font-heading text-[clamp(2.5rem,7.3vw,7rem)] leading-[0.94] tracking-[-0.075em]"
    >
      {["It started", "with paperwork."].map((line, i) => (
        <span
          key={line}
          className="block overflow-hidden pb-[0.08em] mb-[-0.08em]"
        >
          <motion.span
            className={`flex items-center gap-5 ${i === 1 ? "text-brand-400" : ""}`}
            initial={false}
            animate={
              reduce || !inView
                ? { y: 0, rotate: 0 }
                : { y: ["110%", "0%"], rotate: [3, 0] }
            }
            transition={{
              duration: reduce || !inView ? 0 : 1.1,
              delay: reduce || !inView ? 0 : 0.12 + i * 0.13,
              ease,
            }}
          >
            {line}
            {i === 1 && (
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={
                  reduce || !inView ? { rotate: 0 } : { rotate: [-45, 0] }
                }
                transition={{
                  duration: reduce || !inView ? 0 : 1.2,
                  delay: reduce || !inView ? 0 : 0.6,
                  ease,
                }}
              >
                <ArrowDownRight
                  className="hidden size-12 shrink-0 text-brand-400 xl:block"
                  strokeWidth={1}
                />
              </motion.span>
            )}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}

export function Parallax({
  children,
  className,
  distance = 45,
}: {
  children: ReactNode
  className?: string
  distance?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useLimitedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  return (
    <div ref={ref} className={`min-w-0 ${className ?? ""}`}>
      <motion.div data-parallax style={{ y: reduce ? 0 : y }}>
        {children}
      </motion.div>
    </div>
  )
}

export function AnimatedHeading({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.25 })

  return (
    <div ref={ref} className="overflow-hidden pb-2">
      <motion.h2
        className={className}
        initial={false}
        animate={
          reduce || !inView
            ? { y: 0, rotate: 0 }
            : { y: ["105%", "0%"], rotate: [2, 0] }
        }
        transition={{ duration: reduce || !inView ? 0 : 0.9, ease }}
      >
        {children}
      </motion.h2>
    </div>
  )
}

export function ProjectCard({ children }: { children: ReactNode }) {
  const reduce = useLimitedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(x, { stiffness: 160, damping: 22 })
  const rotateY = useSpring(y, { stiffness: 160, damping: 22 })

  function move(event: PointerEvent<HTMLElement>) {
    if (reduce || event.pointerType !== "mouse") return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(-((event.clientY - rect.top) / rect.height - 0.5) * 5)
    y.set(((event.clientX - rect.left) / rect.width - 0.5) * 5)
  }

  return (
    <motion.article
      className="group h-full border border-border bg-card"
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: reduce ? undefined : 1200,
      }}
      whileHover={reduce ? undefined : { y: -8 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      {children}
    </motion.article>
  )
}

export function ScrollRibbon() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="my-4 hidden overflow-hidden border-y border-border py-5 sm:block md:my-6"
    >
      <motion.div
        data-scroll-ribbon
        className="flex w-max items-center gap-5 pr-5 font-heading text-[clamp(1.5rem,3vw,3rem)] md:gap-8 md:pr-8 leading-none tracking-tighter text-muted-foreground"
        style={{ x: reduce ? 0 : x }}
      >
        {[
          "Customer records.",
          "Warehouse stock.",
          "Wine cellars.",
          "Sales follow-ups.",
        ].map((text, i) => (
          <span key={text} className="flex items-center gap-5 md:gap-8">
            <span>{text}</span>
            <motion.span
              className={`block size-7 shrink-0 ${i % 2 === 0 ? "rounded-full bg-brand-300" : "border-[6px] border-brand-400"}`}
              style={{ rotate: reduce ? 0 : rotate }}
            />
          </span>
        ))}
      </motion.div>
    </div>
  )
}
