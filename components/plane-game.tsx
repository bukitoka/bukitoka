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
import { preventGameContextMenu } from "@/lib/game-input"
import {
  createFlight,
  FLIGHT_BOSS_HP,
  FLIGHT_GOALS,
  FLIGHT_HEIGHT,
  FLIGHT_WIDTH,
  flightBossX,
  flightReducer,
  PLAYER_Y,
} from "@/lib/plane-game"
import { useArcadeProgress } from "@/lib/use-arcade-progress"
import { useReducedMotion } from "@/lib/use-motion-preference"

export function PlaneGame() {
  const [game, dispatch] = useReducer(flightReducer, undefined, createFlight)
  const board = useRef<HTMLDivElement>(null)
  const direction = useRef(0)
  const instructions = useId()
  const reduce = useReducedMotion()
  const running = game.status === "running"
  const { progress, save } = useArcadeProgress("flight")
  const displayLevel = game.status === "ready" ? progress.level : game.level
  useEffect(() => {
    if (game.status !== "ready")
      save({
        best: game.score,
        level: game.status === "cleared" ? game.level + 1 : game.level,
        completed: game.status === "won",
      })
  }, [game.score, game.status, game.level, save])

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

  function start(level = 1) {
    direction.current = 0
    dispatch({ type: "start", level })
    board.current?.focus({ preventScroll: true })
  }

  function nextLevel() {
    direction.current = 0
    dispatch({ type: "next" })
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
        if (key === "escape") {
          direction.current = 0
          dispatch({ type: "pause" })
        } else if (game.status === "ready") start(progress.level)
        else if (game.status === "over") start(game.level)
        else if (game.status === "cleared") nextLevel()
        else if (game.status === "won") start()
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
      aria-label="404 plane shooter"
      aria-describedby={instructions}
      tabIndex={-1}
      data-game
      onContextMenu={preventGameContextMenu}
      data-flight-state={game.status}
      data-flight-level={game.level}
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
      className="mx-auto w-full max-w-lg border border-border bg-card p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:p-6"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
        <span>
          FLIGHT / LEVEL {game.status === "ready" ? progress.level : game.level}{" "}
          / 3
        </span>
        <span>
          Score <span data-flight-score>{game.score}</span> · Lives {game.lives}{" "}
          · Best {progress.best}
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
            404
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
          {game.level === 3 && game.bossHp > 0 && (
            <g
              data-flight-boss
              transform={`translate(${flightBossX(game.elapsed)} 55)`}
            >
              <path
                d="M-55 12L-42-10H-20L-12-24H12L20-10H42L55 12L36 23H-36Z"
                className="fill-brand-400"
              />
              <path d="M-16-11H16V5H-16Z" className="fill-brand-900" />
              <path
                d="M-35 9H-24M24 9H35"
                className="stroke-brand-100"
                strokeWidth="4"
              />
              <circle
                cy="23"
                r="6"
                className={
                  game.attackIn < 0.45 ? "fill-action" : "fill-brand-300"
                }
              />
              <rect
                x="-60"
                y="-38"
                width="120"
                height="5"
                className="fill-muted"
              />
              <rect
                x="-60"
                y="-38"
                width={(120 * game.bossHp) / FLIGHT_BOSS_HP}
                height="5"
                className="fill-action"
              />
            </g>
          )}
          {game.bolts.map((bolt) => (
            <circle
              key={bolt.id}
              data-flight-bolt
              cx={bolt.x}
              cy={bolt.y}
              r="5"
              className="fill-action"
            />
          ))}
          <g
            data-flight-player
            transform={`translate(${game.x} ${PLAYER_Y})`}
            opacity={game.shield > 0 ? 0.6 : 1}
          >
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 px-4 text-center">
            <p className="font-heading text-xl leading-tight tracking-tight lg:text-3xl">
              {game.status === "ready"
                ? "Lost page. Found a plane."
                : game.status === "paused"
                  ? "Holding position."
                  : game.status === "cleared"
                    ? "Airspace cleared."
                    : game.status === "won"
                      ? "Boss down. Safe skies."
                      : "Flight over."}
            </p>
            <p className="max-w-64 text-xs leading-relaxed text-muted-foreground">
              {game.status === "over"
                ? `You scored ${game.score}. Ready for another flight?`
                : game.status === "cleared"
                  ? "Next level: faster targets and tighter waves."
                  : game.status === "won"
                    ? "All three levels complete. Nice flying."
                    : (game.status === "ready"
                          ? progress.level
                          : game.level) === 3
                      ? "Defeat the mothership. Dodge its amber bolts while your cannons fire."
                      : "Clear the target quota to unlock the next level. Don’t let shapes pass you."}
            </p>
            <Button
              onClick={() => {
                if (game.status === "paused") {
                  dispatch({ type: "resume" })
                  board.current?.focus({ preventScroll: true })
                } else if (game.status === "cleared") nextLevel()
                else
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
              {game.status === "paused"
                ? "Resume flight"
                : game.status === "cleared"
                  ? "Next flight level"
                  : game.status === "over" || game.status === "won"
                    ? "Play again"
                    : progress.level > 1
                      ? `Continue flight level ${progress.level}`
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
            disabled={game.status !== "running" && game.status !== "paused"}
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
            onClick={() => start()}
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
        mobile, hold the arrow buttons.{" "}
        {displayLevel === 3
          ? `Mothership: ${game.status === "ready" ? FLIGHT_BOSS_HP : game.bossHp}/${FLIGHT_BOSS_HP} health. Dodge the amber spread.`
          : `Targets: ${game.kills}/${FLIGHT_GOALS[game.level - 1]}.`}{" "}
        Unlocked levels save on this device.
      </p>
      <p role="status" className="sr-only">
        {game.status === "won"
          ? "Final boss defeated. Flight complete."
          : game.status === "cleared"
            ? `Flight level ${game.level} cleared.`
            : game.status === "over"
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
