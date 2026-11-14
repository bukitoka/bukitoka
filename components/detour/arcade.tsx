"use client"

import { Plus } from "lucide-react"
import { useInView } from "motion/react"
import { useId, useRef, useState } from "react"
import { PlatformGame } from "@/components/detour/platform-game"
import { RacingGame } from "@/components/detour/racing-game"
import { SnakeGame } from "@/components/detour/snake-game"
import { preventGameContextMenu } from "@/lib/game-input"

const games = [
  { value: "platform", label: "Mini Jump" },
  { value: "snake", label: "Snake Xenzia" },
  { value: "racing", label: "Arcade Racer" },
] as const

export function Arcade() {
  const [expanded, setExpanded] = useState(true)
  const [mode, setMode] = useState<(typeof games)[number]["value"]>("platform")
  const content = useId()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.15 })

  return (
    <fieldset
      className="min-w-0 border border-border bg-card"
      aria-label="Mini arcade"
      data-arcade
      data-game
      onContextMenu={preventGameContextMenu}
      data-arcade-visible={inView}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={content}
        onClick={() => setExpanded((value) => !value)}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-sm sm:hidden"
      >
        Take a small detour
        <Plus
          aria-hidden="true"
          size={18}
          className={`transition-transform ${expanded ? "rotate-45" : ""}`}
        />
      </button>
      <div
        ref={ref}
        id={content}
        className={expanded ? "block" : "hidden sm:block"}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-widest">
          <span>A small detour</span>
          <span className="text-muted-foreground">03 / ARCADE</span>
        </div>
        <fieldset
          aria-label="Choose your detour"
          className="grid grid-cols-3 gap-1 border-b border-border p-1"
        >
          {games.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              data-active={mode === value}
              className="min-h-12 px-1 text-xs leading-tight transition-colors hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
            >
              {label}
            </button>
          ))}
        </fieldset>
        <div hidden={mode !== "platform"}>
          <PlatformGame />
        </div>
        <div hidden={mode !== "snake"}>
          <SnakeGame />
        </div>
        <div hidden={mode !== "racing"}>
          <RacingGame />
        </div>
      </div>
    </fieldset>
  )
}
