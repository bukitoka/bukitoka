"use client"

import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react"
import { type KeyboardEvent, useEffect, useId, useReducer, useRef } from "react"
import { Button } from "@/components/ui/button"
import { preventGameContextMenu } from "@/lib/game-input"
import {
  createRace,
  RACE_LANES,
  RACE_PLAYER_Y,
  raceReducer,
} from "@/lib/racing-game"
import { useArcadeProgress } from "@/lib/use-arcade-progress"
import { useReducedMotion } from "@/lib/use-motion-preference"

function Car({ player = false }: { player?: boolean }) {
  return (
    <>
      <path
        d="M-19-15V-4M19-15V-4M-19 9V20M19 9V20"
        className="stroke-brand-900"
        strokeWidth="6"
      />
      <rect
        x="-16"
        y="-25"
        width="32"
        height="50"
        rx="6"
        className={player ? "fill-action" : "fill-brand-300"}
      />
      <path
        d="M-11-11H11L8-3H-8ZM-8 11H8L11 17H-11Z"
        className="fill-brand-800"
      />
      <path d="M-9-22H-4M4-22H9" className="stroke-brand-100" strokeWidth="3" />
      <path
        d="M-11 22H-6M6 22H11"
        className="stroke-brand-600"
        strokeWidth="3"
      />
    </>
  )
}

export function RacingGame() {
  const [game, dispatch] = useReducer(raceReducer, undefined, createRace)
  const board = useRef<HTMLDivElement>(null)
  const instructions = useId()
  const reduce = useReducedMotion()
  const running = game.status === "running"
  const { progress, save } = useArcadeProgress("racing")
  const distanceMilestone =
    game.status === "running"
      ? Math.floor(game.distance / 10) * 10
      : Math.floor(game.distance)
  useEffect(() => {
    if (game.status === "ready") return
    save({
      level: game.status === "cleared" ? game.level + 1 : game.level,
      best: (game.level - 1) * 150 + distanceMilestone,
      completed: game.status === "won",
    })
  }, [game.status, game.level, distanceMilestone, save])

  useEffect(() => {
    if (!running) return
    let previous = performance.now()
    let frame: number
    function tick(now: number) {
      dispatch({ type: "tick", dt: (now - previous) / 1000 })
      previous = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running])

  useEffect(() => {
    const pause = () => dispatch({ type: "pause" })
    const visibility = () => {
      if (document.hidden) pause()
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) pause()
      },
      { threshold: 0.2 },
    )
    if (board.current) observer.observe(board.current)
    document.addEventListener("visibilitychange", visibility)
    window.addEventListener("blur", pause)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", visibility)
      window.removeEventListener("blur", pause)
    }
  }, [])

  function start(level = 1) {
    dispatch({ type: "start", level })
    board.current?.focus({ preventScroll: true })
  }

  function resume() {
    dispatch({ type: "resume" })
    board.current?.focus({ preventScroll: true })
  }

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button, a")) return
    const key = event.key.toLowerCase()
    if (["arrowleft", "a", "arrowright", "d"].includes(key)) {
      event.preventDefault()
      if (!event.repeat)
        dispatch({
          type: "move",
          direction: ["arrowleft", "a"].includes(key) ? -1 : 1,
        })
    } else if ([" ", "p", "escape"].includes(key)) {
      event.preventDefault()
      if (!event.repeat) {
        if (running) dispatch({ type: "pause" })
        else if (game.status === "paused" && key !== "escape") resume()
      }
    }
  }

  return (
    <div
      ref={board}
      role="application"
      aria-label="Arcade racing game"
      aria-describedby={instructions}
      tabIndex={-1}
      data-game
      onContextMenu={preventGameContextMenu}
      data-race-status={game.status}
      onKeyDown={keyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          dispatch({ type: "pause" })
      }}
      className="p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
        <span>
          LEVEL {game.status === "ready" ? progress.level : game.level} / 3
          {game.level === 3 ? " · FINAL RIVAL" : ""}
        </span>
        <span>
          <span data-race-distance>{Math.floor(game.distance)}</span> m · Lives{" "}
          {game.lives}
        </span>
      </div>
      <div className="relative overflow-hidden border border-border bg-background">
        <svg aria-hidden="true" viewBox="0 0 420 300" className="block w-full">
          <rect width="420" height="300" className="fill-brand-700" />
          <rect x="70" width="280" height="300" className="fill-brand-900" />
          {[20, 100, 180, 260].map((y) => (
            <g key={y}>
              <circle cx="25" cy={y} r="12" className="fill-brand-600" />
              <rect
                x="385"
                y={y - 10}
                width="20"
                height="20"
                className="fill-brand-600"
              />
            </g>
          ))}
          <path
            d="M76 0V300M344 0V300"
            className="stroke-brand-300"
            strokeWidth="3"
          />
          <g
            transform={`translate(0 ${reduce ? 0 : (game.distance * 10) % 60})`}
          >
            {[-60, 0, 60, 120, 180, 240, 300].map((y) => (
              <path
                key={y}
                d={`M165 ${y}v28M255 ${y}v28`}
                className="stroke-brand-300/60"
                strokeWidth="3"
              />
            ))}
          </g>
          {game.level === 3 && (
            <g>
              <rect
                x="170"
                y="10"
                width="80"
                height="50"
                rx="7"
                className="fill-brand-400"
              />
              <path d="M180 20H240V32H180Z" className="fill-brand-900" />
              {[0, 1, 2, 3, 4].map((i) => (
                <rect
                  key={i}
                  x={177 + i * 14}
                  y="43"
                  width="10"
                  height="5"
                  className={
                    i < game.rivalLead ? "fill-action" : "fill-brand-600"
                  }
                />
              ))}
              {game.spawnIn < 0.8 && (
                <rect
                  x={RACE_LANES[game.safeLane] - 37}
                  y="70"
                  width="74"
                  height="220"
                  fill="none"
                  className="stroke-action"
                  strokeWidth="2"
                  strokeDasharray="8 7"
                />
              )}
            </g>
          )}
          {game.traffic.map((car) => (
            <g
              key={car.id}
              transform={`translate(${RACE_LANES[car.lane]} ${car.y}) rotate(180)`}
            >
              <Car />
            </g>
          ))}
          <g
            data-race-player
            transform={`translate(${game.x.toFixed(2)} ${RACE_PLAYER_Y})`}
            opacity={game.shield > 0 ? 0.6 : 1}
          >
            <Car player />
          </g>
        </svg>
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 px-3 text-center">
            <p className="font-heading text-2xl tracking-tight sm:text-3xl">
              {game.status === "ready"
                ? "Arcade Racer"
                : game.status === "paused"
                  ? "A quick pit stop."
                  : game.status === "cleared"
                    ? "Lap cleared."
                    : game.status === "won"
                      ? "Rival beaten!"
                      : "Race over."}
            </p>
            <p className="max-w-60 text-xs leading-relaxed text-muted-foreground">
              {game.status === "over"
                ? `${Math.floor(game.distance)} metres driven. Another lap?`
                : game.status === "cleared"
                  ? "Faster traffic awaits on the next level."
                  : game.status === "won"
                    ? "All three levels complete. The road is yours."
                    : game.level === 3
                      ? "Outlast five rival gates. Follow the marked open lane."
                      : "Dodge traffic. Reach 150 metres to unlock the next level."}
            </p>
            <Button
              onClick={() => {
                if (game.status === "paused") resume()
                else if (game.status === "cleared") {
                  dispatch({ type: "next" })
                  board.current?.focus({ preventScroll: true })
                } else
                  start(
                    game.status === "ready"
                      ? progress.level
                      : game.status === "over"
                        ? game.level
                        : 1,
                  )
              }}
            >
              <Play size={16} aria-hidden="true" />
              {game.status === "ready"
                ? progress.level > 1
                  ? `Continue level ${progress.level}`
                  : "Start racing"
                : game.status === "paused"
                  ? "Resume racing"
                  : game.status === "cleared"
                    ? "Next level"
                    : "Race again"}
            </Button>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {[-1, 1].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={
                value === -1 ? "Change lane left" : "Change lane right"
              }
              disabled={!running}
              onClick={() => {
                dispatch({ type: "move", direction: value as -1 | 1 })
                board.current?.focus({ preventScroll: true })
              }}
              className="grid size-11 place-items-center border border-border hover:bg-muted disabled:opacity-40"
            >
              {value === -1 ? (
                <ArrowLeft size={18} aria-hidden="true" />
              ) : (
                <ArrowRight size={18} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={running ? "Pause racing" : "Resume racing"}
            disabled={game.status !== "running" && game.status !== "paused"}
            onClick={() => {
              if (running) dispatch({ type: "pause" })
              else resume()
            }}
            className="grid size-11 place-items-center border border-border hover:bg-muted disabled:opacity-40"
          >
            {running ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            aria-label="Restart racing"
            onClick={() => start()}
            className="grid size-11 place-items-center border border-border hover:bg-muted"
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <p
        id={instructions}
        className="mt-3 text-xs leading-relaxed text-muted-foreground"
      >
        ← → or A / D to change lanes. Space to pause. On mobile, tap the arrows.
        Three lives, three levels. Best: {Math.floor(progress.best)} m.
        {game.level === 3 && running && game.spawnIn < 0.8
          ? ` Open lane: ${["left", "centre", "right"][game.safeLane]}.`
          : ""}
      </p>
      <p role="status" className="sr-only">
        {game.status === "over"
          ? `Race over. Distance ${Math.floor(game.distance)} metres.`
          : `Race ${game.status}. Lives ${game.lives}.`}
      </p>
    </div>
  )
}
