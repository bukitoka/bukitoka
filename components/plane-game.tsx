"use client"

import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react"
import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useId,
  useReducer,
  useRef,
} from "react"
import { Button } from "@/components/ui/button"
import {
  createFlight,
  FLIGHT_HEIGHT,
  FLIGHT_WIDTH,
  flightReducer,
  PLAYER_Y,
} from "@/lib/plane-game"
import { useReducedMotion } from "@/lib/use-motion-preference"

export function PlaneGame({ arcade = false }: { arcade?: boolean }) {
  const [game, dispatch] = useReducer(flightReducer, undefined, createFlight)
  const board = useRef<HTMLDivElement>(null)
  const direction = useRef(0)
  const instructions = useId()
  const reduce = useReducedMotion()
  const running = game.status === "running"

  useEffect(() => {
    if (!running) return
    let previous = performance.now()
    let frame: number
    function tick(now: number) {
      dispatch({
        type: "tick",
        dt: (now - previous) / 1000,
        direction: direction.current,
      })
      previous = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running])

  useEffect(() => {
    const pause = () => {
      direction.current = 0
      dispatch({ type: "pause" })
    }
    const onVisibility = () => {
      if (document.hidden) pause()
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) pause()
      },
      { threshold: 0.25 },
    )
    if (board.current) observer.observe(board.current)
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("blur", pause)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("blur", pause)
    }
  }, [])

  function start() {
    direction.current = 0
    dispatch({ type: "start" })
    board.current?.focus({ preventScroll: true })
  }

  function togglePause() {
    direction.current = 0
    dispatch({ type: running ? "pause" : "resume" })
    if (!running) board.current?.focus({ preventScroll: true })
  }

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button, a")) return
    const key = event.key.toLowerCase()
    if (["arrowleft", "a", "arrowright", "d"].includes(key)) {
      event.preventDefault()
      direction.current = ["arrowleft", "a"].includes(key) ? -1 : 1
    } else if ([" ", "p", "escape"].includes(key)) {
      event.preventDefault()
      if (!event.repeat) {
        if (game.status === "ready" || game.status === "over") start()
        else if (key === "escape") dispatch({ type: "pause" })
        else togglePause()
      }
    }
  }

  function steer(event: PointerEvent<HTMLButtonElement>, value: number) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    direction.current = value
  }

  return (
    <div
      ref={board}
      role="application"
      aria-label={arcade ? "Plane shooter" : "404 plane shooter"}
      aria-describedby={instructions}
      tabIndex={-1}
      data-flight-state={game.status}
      onKeyDown={keyDown}
      onKeyUp={(event) => {
        if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(event.key))
          direction.current = 0
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          direction.current = 0
          dispatch({ type: "pause" })
        }
      }}
      className={`mx-auto w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${arcade ? "p-3 sm:p-4" : "max-w-lg border border-border bg-card p-4 sm:p-6"}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
        <span>{arcade ? "FLIGHT DETOUR" : "404 / FLIGHT DETOUR"}</span>
        <span>
          Score <span data-flight-score>{game.score}</span> · Lives {game.lives}
        </span>
      </div>
      <div className="relative overflow-hidden border border-border bg-background">
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${FLIGHT_WIDTH} ${FLIGHT_HEIGHT}`}
          className="block w-full"
        >
          <text
            x="210"
            y="178"
            textAnchor="middle"
            fontSize="130"
            className="fill-muted font-heading"
          >
            {arcade ? "FLY" : "404"}
          </text>
          {[36, 108, 180, 252].map((y, i) => (
            <path
              key={y}
              d={`M${45 + i * 80} ${y}v7M${350 - i * 70} ${y + 18}v4`}
              className="stroke-border"
            />
          ))}
          {game.bullets.map((bullet) => (
            <rect
              key={bullet.id}
              data-flight-bullet
              x={bullet.x - 2}
              y={bullet.y}
              width="4"
              height="12"
              rx="2"
              className="fill-action"
            />
          ))}
          {game.enemies.map((enemy) => (
            <g key={enemy.id} transform={`translate(${enemy.x} ${enemy.y})`}>
              {enemy.id % 2 === 0 ? (
                <rect
                  x="-11"
                  y="-11"
                  width="22"
                  height="22"
                  transform={reduce ? undefined : `rotate(${enemy.y})`}
                  className="fill-brand-400"
                />
              ) : (
                <circle r="12" className="fill-brand-300" />
              )}
              <path
                d="M-4-3H4M0-7V1"
                className="stroke-background"
                strokeWidth="2"
              />
            </g>
          ))}
          <g data-flight-player transform={`translate(${game.x} ${PLAYER_Y})`}>
            {!reduce && running && (
              <path d="M-4 14L0 25L4 14" className="fill-brand-400" />
            )}
            <path
              d="M0-20L7-4L20 8V15L5 10L0 15L-5 10L-20 15V8L-7-4Z"
              className="fill-action"
            />
            <path
              d="M0-9V5"
              className="stroke-action-foreground"
              strokeWidth="3"
            />
          </g>
        </svg>
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 px-4 text-center">
            <p className="font-heading text-2xl tracking-tight sm:text-3xl">
              {game.status === "ready"
                ? arcade
                  ? "Clear for takeoff."
                  : "Lost page. Found a plane."
                : game.status === "paused"
                  ? "Holding position."
                  : "Flight over."}
            </p>
            <p className="text-sm text-muted-foreground">
              {game.status === "over"
                ? `You scored ${game.score}. Ready for another flight?`
                : "Clear the shapes. Don’t let them past you."}
            </p>
            <Button
              onClick={
                game.status === "paused"
                  ? () => {
                      dispatch({ type: "resume" })
                      board.current?.focus({ preventScroll: true })
                    }
                  : start
              }
            >
              <Play size={16} aria-hidden="true" />
              {game.status === "paused"
                ? "Resume flight"
                : game.status === "over"
                  ? "Play again"
                  : "Start flight"}
            </Button>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {[-1, 1].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={value === -1 ? "Steer left" : "Steer right"}
              disabled={!running}
              onPointerDown={(event) => steer(event, value)}
              onPointerUp={() => {
                direction.current = 0
              }}
              onPointerCancel={() => {
                direction.current = 0
              }}
              onLostPointerCapture={() => {
                direction.current = 0
              }}
              onClick={(event) => {
                if (event.detail === 0 && running)
                  dispatch({ type: "tick", dt: 0.05, direction: value })
              }}
              className="grid size-11 touch-none place-items-center border border-border hover:bg-muted disabled:opacity-40"
            >
              {value === -1 ? (
                <ArrowLeft size={18} aria-hidden="true" />
              ) : (
                <ArrowRight size={18} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={game.status === "ready" || game.status === "over"}
            onClick={togglePause}
            aria-label={running ? "Pause flight" : "Resume flight"}
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
            onClick={start}
            aria-label="Restart flight"
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
        ← → or A / D to steer. Shots fire automatically. Space to pause. On
        mobile, hold the arrow buttons.
      </p>
      <p role="status" className="sr-only">
        {game.status === "over"
          ? `Flight over. Score ${game.score}.`
          : game.status === "paused"
            ? "Flight paused."
            : game.status === "running"
              ? "Flight started. Use arrow keys to steer."
              : "Ready to fly."}
      </p>
    </div>
  )
}
