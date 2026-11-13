"use client"

import { Pause, Play, Plus, Shuffle } from "lucide-react"
import { motion, useInView } from "motion/react"
import { useRef, useState } from "react"
import { SnakeGame } from "@/components/detour/snake-game"
import { useReducedMotion } from "@/lib/use-motion-preference"

const compositions = [
  {
    name: "Orbit",
    ring: { left: "10%", top: "12%", width: "65%", height: "65%", rotate: 0 },
    square: { left: "52%", top: "50%", width: "36%", height: "36%", rotate: 0 },
    dot: { left: "70%", top: "14%", width: "14%", height: "14%" },
  },
  {
    name: "Balance",
    ring: { left: "12%", top: "14%", width: "48%", height: "48%", rotate: 90 },
    square: {
      left: "39%",
      top: "39%",
      width: "43%",
      height: "43%",
      rotate: 45,
    },
    dot: { left: "12%", top: "72%", width: "14%", height: "14%" },
  },
  {
    name: "Signal",
    ring: { left: "34%", top: "12%", width: "54%", height: "54%", rotate: 180 },
    square: { left: "13%", top: "48%", width: "38%", height: "38%", rotate: 0 },
    dot: { left: "70%", top: "73%", width: "14%", height: "14%" },
  },
]

export function ShapePlayground() {
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState<"shapes" | "snake">("shapes")
  const [index, setIndex] = useState(0)
  const [remix, setRemix] = useState(0)
  const [playing, setPlaying] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: "80px" })
  const reduce = useReducedMotion()
  const composition = compositions[index]
  const spinning = playing && mode === "shapes" && inView && !reduce
  const ringRotation = composition.ring.rotate + remix * 90
  const squareRotation = composition.square.rotate + remix * 45
  const transition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 100, damping: 18 }

  return (
    <div
      className="border border-border bg-card"
      data-composition={composition.name}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="shape-playground-content"
        onClick={() => setExpanded((value) => !value)}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-sm sm:hidden"
      >
        Take a small detour
        <Plus
          aria-hidden="true"
          size={18}
          className={
            expanded ? "rotate-45 transition-transform" : "transition-transform"
          }
        />
      </button>
      <div
        id="shape-playground-content"
        className={expanded ? "block" : "hidden sm:block"}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-widest">
          <span>A small detour</span>
          <span className="text-muted-foreground">
            {mode === "shapes" ? `0${index + 1} / 03` : "SNAKE XENZIA"}
          </span>
        </div>
        <fieldset
          aria-label="Choose your detour"
          className="grid grid-cols-2 gap-1 border-b border-border p-1"
        >
          {[
            { value: "shapes", label: "Shapes" },
            { value: "snake", label: "Snake Xenzia" },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value as "shapes" | "snake")}
              className="min-h-11 px-2 text-xs transition-colors hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
              data-active={mode === value}
            >
              {label}
            </button>
          ))}
        </fieldset>
        <div hidden={mode !== "snake"}>
          <SnakeGame />
        </div>
        <div hidden={mode !== "shapes"}>
          <div
            ref={ref}
            role="img"
            aria-label={`${composition.name} geometric composition, variation ${remix + 1}`}
            className="relative aspect-square overflow-hidden bg-brand-800"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid grid-cols-4"
            >
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-r border-brand-500/30" />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid grid-rows-4"
            >
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-b border-brand-500/30" />
              ))}
            </div>
            <motion.div
              aria-hidden="true"
              className="absolute rounded-full bg-brand-300"
              initial={false}
              animate={{
                ...composition.ring,
                rotate: spinning
                  ? [ringRotation, ringRotation + 360]
                  : ringRotation,
              }}
              transition={{
                ...transition,
                rotate: spinning
                  ? { duration: 24, repeat: Infinity, ease: "linear" }
                  : transition,
              }}
            >
              <div className="absolute inset-[23%] rounded-full bg-brand-800" />
              <div className="absolute left-1/2 top-0 size-1/2 bg-brand-100" />
            </motion.div>
            <motion.div
              aria-hidden="true"
              className="absolute border-16 border-brand-100 bg-brand-600 sm:border-22"
              initial={false}
              animate={{
                ...composition.square,
                rotate: spinning
                  ? [squareRotation, squareRotation - 180]
                  : squareRotation,
              }}
              transition={{
                ...transition,
                rotate: spinning
                  ? { duration: 18, repeat: Infinity, ease: "linear" }
                  : transition,
              }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute rounded-full bg-brand-500"
              initial={false}
              animate={composition.dot}
              transition={transition}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-4 left-4 font-mono text-[9px] tracking-[0.15em] text-brand-100"
            >
              A CIRCLE, A SQUARE. YOUR CALL.
            </span>
          </div>
          <div className="p-3">
            <fieldset
              aria-label="Composition style"
              className="grid grid-cols-3 gap-1"
            >
              {compositions.map((item, i) => (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={index === i}
                  onClick={() => {
                    setIndex(i)
                    setRemix(0)
                  }}
                  className="min-h-11 px-2 text-xs transition-colors hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  data-active={index === i}
                >
                  {item.name}
                </button>
              ))}
            </fieldset>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setRemix((value) => value + 1)}
                className="flex min-h-11 items-center gap-2 px-2 text-xs hover:bg-muted"
              >
                <Shuffle size={14} />
                Remix
              </button>
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                disabled={reduce}
                aria-pressed={playing && !reduce}
                className="flex min-h-11 items-center gap-2 px-2 text-xs hover:bg-muted disabled:opacity-50"
              >
                {playing && !reduce ? <Pause size={14} /> : <Play size={14} />}{" "}
                {playing && !reduce ? "Pause motion" : "Play motion"}
              </button>
            </div>
            <p
              role="status"
              className="mt-2 px-2 font-mono text-[10px] leading-relaxed text-muted-foreground"
            >
              {composition.name} · variation {remix + 1}
              {reduce ? " · reduced motion" : " · choose, remix, play"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
