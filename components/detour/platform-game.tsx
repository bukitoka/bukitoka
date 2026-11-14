"use client"

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react"
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
  coins,
  createPlatformGame,
  enemies,
  enemyX,
  FLAG_X,
  GROUND_Y,
  ground,
  PLATFORM_HEIGHT,
  PLATFORM_WIDTH,
  platformReducer,
  platforms,
  WORLD_WIDTH,
} from "@/lib/platform-game"
import { useReducedMotion } from "@/lib/use-motion-preference"

export function PlatformGame() {
  const [game, dispatch] = useReducer(
    platformReducer,
    undefined,
    createPlatformGame,
  )
  const board = useRef<HTMLDivElement>(null)
  const direction = useRef(0)
  const instructions = useId()
  const bricks = useId()
  const reduce = useReducedMotion()
  const running = game.status === "running"
  const camera = Math.max(
    0,
    Math.min(WORLD_WIDTH - PLATFORM_WIDTH, game.x - 130),
  )

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

  function start() {
    direction.current = 0
    dispatch({ type: "start" })
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
      direction.current = ["arrowleft", "a"].includes(key) ? -1 : 1
    } else if ([" ", "arrowup", "w"].includes(key)) {
      event.preventDefault()
      if (!event.repeat) dispatch({ type: "jump" })
    } else if (["p", "escape"].includes(key)) {
      event.preventDefault()
      direction.current = 0
      if (!event.repeat) {
        if (game.status === "paused" && key === "p") resume()
        else dispatch({ type: "pause" })
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
      aria-label="Super Kusuma platform game"
      aria-describedby={instructions}
      tabIndex={-1}
      data-platform-status={game.status}
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
      className="p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
        <span>WORLD 01</span>
        <span>
          Coins <span data-platform-coins>{game.collected.length}</span> /{" "}
          {coins.length} · Lives {game.lives}
        </span>
      </div>
      <div className="relative overflow-hidden border border-border bg-background">
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${PLATFORM_WIDTH} ${PLATFORM_HEIGHT}`}
          className="block w-full"
        >
          <defs>
            <pattern
              id={bricks}
              width="28"
              height="18"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 0H28V18H0ZM14 0V18"
                fill="none"
                className="stroke-brand-500/50"
                strokeWidth="0.7"
              />
            </pattern>
          </defs>
          <circle cx="350" cy="50" r="20" className="fill-action/60" />
          <path
            d="M0 244V204A65 65 0 0 1 130 204V244M220 244V190A90 90 0 0 1 400 190V244"
            className="fill-muted"
          />
          <path
            d="M50 67H100M68 55H120M200 95H258"
            className="stroke-border"
            strokeWidth="5"
          />
          <g transform={`translate(${-camera} 0)`}>
            {ground.map((segment) => (
              <g key={segment.x}>
                <rect
                  x={segment.x}
                  y={GROUND_Y}
                  width={segment.width}
                  height="36"
                  className="fill-brand-700"
                />
                <rect
                  x={segment.x}
                  y={GROUND_Y}
                  width={segment.width}
                  height="36"
                  fill={`url(#${bricks})`}
                />
                <path
                  d={`M${segment.x} ${GROUND_Y}h${segment.width}`}
                  className="stroke-brand-300"
                  strokeWidth="4"
                />
              </g>
            ))}
            {platforms.map((platform) => (
              <g key={platform.x}>
                <rect
                  x={platform.x}
                  y={platform.y}
                  width={platform.width}
                  height="14"
                  className="fill-brand-600"
                />
                <path
                  d={`M${platform.x} ${platform.y}h${platform.width}`}
                  className="stroke-brand-300"
                  strokeWidth="3"
                />
              </g>
            ))}
            {coins.map(
              (coin, index) =>
                !game.collected.includes(index) && (
                  <g key={coin.x}>
                    <circle
                      cx={coin.x}
                      cy={coin.y}
                      r="7"
                      fill="none"
                      className="stroke-action"
                      strokeWidth="3"
                    />
                    <path
                      d={`M${coin.x} ${coin.y - 3}v6`}
                      className="stroke-action"
                      strokeWidth="2"
                    />
                  </g>
                ),
            )}
            {[900, 2050].map((x) => (
              <g key={x}>
                <path
                  d={`M${x} 244V203`}
                  className="stroke-brand-400"
                  strokeWidth="3"
                />
                <path
                  d={`M${x} 203h20l-5 11h-15Z`}
                  className={
                    game.checkpoint >= x ? "fill-action" : "fill-brand-400"
                  }
                />
              </g>
            ))}
            <path
              d={`M${FLAG_X} 244V102`}
              className="stroke-foreground"
              strokeWidth="4"
            />
            <path d={`M${FLAG_X} 102h55l-12 30h-43Z`} className="fill-action" />
            {enemies.map(
              (_, index) =>
                !game.defeated.includes(index) && (
                  <g
                    key={enemies[index]}
                    transform={`translate(${enemyX(index, game.elapsed)} ${GROUND_Y - 18})`}
                  >
                    <path
                      d="M-11 18V5A11 11 0 0 1 11 5V18Z"
                      className="fill-brand-400"
                    />
                    <path
                      d="M-6 7H-3M3 7H6"
                      className="stroke-background"
                      strokeWidth="3"
                    />
                  </g>
                ),
            )}
            <g
              data-platform-player
              transform={`translate(${game.x} ${game.y})`}
            >
              <g
                transform={
                  game.facing < 0 ? "translate(20 0) scale(-1 1)" : undefined
                }
              >
                <rect
                  x="4"
                  y="1"
                  width="12"
                  height="10"
                  rx="2"
                  className="fill-action"
                />
                <path
                  d="M3 1H17V5H20"
                  className="stroke-brand-300"
                  strokeWidth="4"
                />
                <rect
                  x="12"
                  y="6"
                  width="2"
                  height="2"
                  className="fill-brand-900"
                />
                <rect
                  x="1"
                  y="12"
                  width="18"
                  height="9"
                  rx="2"
                  className="fill-action"
                />
                <path
                  d={`M5 20v${!reduce && direction.current && running && Math.floor(game.elapsed * 10) % 2 ? 5 : 8}M15 20v8`}
                  className="stroke-brand-300"
                  strokeWidth="5"
                />
              </g>
            </g>
          </g>
        </svg>
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 px-3 text-center">
            <p className="font-heading text-2xl tracking-tight sm:text-3xl">
              {game.status === "ready"
                ? "Super Kusuma"
                : game.status === "paused"
                  ? "Take a breather."
                  : game.status === "won"
                    ? "You made it!"
                    : "One more run?"}
            </p>
            <p className="max-w-60 text-xs leading-relaxed text-muted-foreground">
              {game.status === "ready"
                ? "Grab coins. Hop over gaps. Reach the flag."
                : game.status === "paused"
                  ? "Your adventure will wait."
                  : `${game.collected.length} coins collected. Fancy another adventure?`}
            </p>
            <Button
              onClick={game.status === "paused" ? resume : start}
              className="px-4"
            >
              <Play size={16} aria-hidden="true" />
              {game.status === "ready"
                ? "Start adventure"
                : game.status === "paused"
                  ? "Resume adventure"
                  : "Play again"}
            </Button>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {[-1, 1].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={value === -1 ? "Move left" : "Move right"}
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
                if (!event.detail && running)
                  dispatch({ type: "tick", dt: 0.04, direction: value })
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
          <button
            type="button"
            aria-label="Jump"
            disabled={!running}
            onPointerDown={(event) => {
              event.preventDefault()
              dispatch({ type: "jump" })
            }}
            onClick={(event) => {
              if (!event.detail) dispatch({ type: "jump" })
            }}
            className="grid size-11 touch-none place-items-center border border-border bg-action text-action-foreground disabled:opacity-40"
          >
            <ArrowUp size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={game.status !== "running" && game.status !== "paused"}
            aria-label={running ? "Pause adventure" : "Resume adventure"}
            onClick={() => {
              direction.current = 0
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
            aria-label="Restart adventure"
            onClick={start}
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
        ← → or A / D to move. Space / ↑ to jump. P to pause. On mobile, hold an
        arrow and tap jump.
      </p>
      <p role="status" className="sr-only">
        {game.status === "won"
          ? "You reached the flag!"
          : game.status === "over"
            ? "Adventure over. Try again."
            : game.status === "paused"
              ? "Adventure paused."
              : `Adventure ${game.status}. Lives ${game.lives}. Coins ${game.collected.length}.`}
      </p>
    </div>
  )
}
