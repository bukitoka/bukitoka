"use client"

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react"
import { type KeyboardEvent, useEffect, useId, useReducer, useRef } from "react"
import { Button } from "@/components/ui/button"
import { preventGameContextMenu } from "@/lib/game-input"
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  createSnakeGame,
  type Direction,
  snakeReducer,
} from "@/lib/snake"
import { useArcadeProgress } from "@/lib/use-arcade-progress"

const keys: Record<string, Direction> = {
  ArrowUp: "up",
  w: "up",
  ArrowRight: "right",
  d: "right",
  ArrowDown: "down",
  s: "down",
  ArrowLeft: "left",
  a: "left",
}

const controls = [
  { direction: "left", Icon: ArrowLeft },
  { direction: "up", Icon: ArrowUp },
  { direction: "down", Icon: ArrowDown },
  { direction: "right", Icon: ArrowRight },
] as const

export function SnakeGame() {
  const [game, dispatch] = useReducer(snakeReducer, undefined, () =>
    createSnakeGame(),
  )
  const board = useRef<HTMLButtonElement>(null)
  const gameRoot = useRef<HTMLDivElement>(null)
  const instructions = useId()
  const grid = useId()
  const running = game.status === "running"
  const { progress, save } = useArcadeProgress("snake")
  const slowed = game.slowTicks > 0
  useEffect(() => {
    if (game.status !== "ready")
      save({
        level: game.level,
        best: game.best,
        completed: game.status === "won",
      })
  }, [game.status, game.level, game.best, save])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(
      () => dispatch({ type: "tick" }),
      Math.max(75, 170 - game.score * 2 - (game.level - 1) * 18) +
        (slowed ? 55 : 0),
    )
    return () => window.clearInterval(timer)
  }, [running, game.score, game.level, slowed])

  useEffect(() => {
    const pause = () => dispatch({ type: "pause" })
    const onVisibility = () => {
      if (document.hidden) pause()
    }
    const onOutsidePointer = (event: PointerEvent) => {
      if (gameRoot.current && !gameRoot.current.contains(event.target as Node))
        pause()
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) pause()
      },
      { threshold: 0.15 },
    )
    if (board.current) observer.observe(board.current)
    document.addEventListener("pointerdown", onOutsidePointer, true)
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("blur", pause)
    return () => {
      observer.disconnect()
      document.removeEventListener("pointerdown", onOutsidePointer, true)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("blur", pause)
    }
  }, [])

  function start() {
    if (game.status === "paused") dispatch({ type: "start" })
    else
      dispatch({
        type: "restart",
        level: game.status === "ready" ? progress.level : game.level,
        best: progress.best,
      })
    board.current?.focus({ preventScroll: true })
  }

  function steer(event: KeyboardEvent<HTMLButtonElement>) {
    const direction = keys[event.key] ?? keys[event.key.toLowerCase()]
    if (direction && running) {
      event.preventDefault()
      dispatch({ type: "turn", direction })
    }
    if (event.code === "Space") {
      event.preventDefault()
      if (running) dispatch({ type: "pause" })
      else start()
    }
    if (event.key === "Escape") {
      event.preventDefault()
      dispatch({ type: "pause" })
    }
  }

  const title =
    game.status === "ready"
      ? "Snake Xenzia"
      : game.status === "paused"
        ? "Paused"
        : game.status === "won"
          ? "You filled the board."
          : "One more round?"

  return (
    <div
      ref={gameRoot}
      className="p-3 sm:p-4"
      data-game
      onContextMenu={preventGameContextMenu}
      data-snake-status={game.status}
      role="application"
      aria-label="Snake Xenzia"
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          dispatch({ type: "pause" })
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3 font-mono text-xs">
        <span>
          L{game.status === "ready" ? progress.level : game.level} · Score{" "}
          <strong className="text-action">
            {String(game.score).padStart(2, "0")}
          </strong>
        </span>
        <span className="text-muted-foreground">
          Best {String(Math.max(game.best, progress.best)).padStart(2, "0")}
        </span>
      </div>
      <button
        type="button"
        ref={board}
        onClick={() => {
          if (running) dispatch({ type: "pause" })
          else start()
        }}
        aria-label="Snake Xenzia game board"
        aria-describedby={instructions}
        onKeyDown={steer}
        className="relative block aspect-[3/2] w-full overflow-hidden border border-brand-500 p-0 bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action dark:bg-brand-900"
      >
        <svg
          role="img"
          aria-label={`Snake board. Score ${game.score}.`}
          viewBox={`0 0 ${BOARD_WIDTH * 10} ${BOARD_HEIGHT * 10}`}
          className="size-full"
        >
          <title>Snake Xenzia board</title>
          <defs>
            <pattern
              id={grid}
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M10 0H0V10"
                fill="none"
                className="stroke-brand-600/15"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${grid})`} />
          {game.snake.map((cell, index) => (
            <rect
              key={cell}
              x={(cell % BOARD_WIDTH) * 10 + 1}
              y={Math.floor(cell / BOARD_WIDTH) * 10 + 1}
              width="8"
              height="8"
              className={
                index === 0
                  ? "fill-action stroke-brand-900 dark:stroke-brand-100"
                  : "fill-brand-600 dark:fill-brand-300"
              }
              strokeWidth="0.5"
            />
          ))}
          {game.food !== null && (
            <circle
              cx={(game.food % BOARD_WIDTH) * 10 + 5}
              cy={Math.floor(game.food / BOARD_WIDTH) * 10 + 5}
              r="3"
              className="fill-action stroke-brand-900 dark:stroke-brand-100"
              strokeWidth="0.8"
            />
          )}
          {game.bonus !== null && (
            <g>
              <circle
                cx={(game.bonus % BOARD_WIDTH) * 10 + 5}
                cy={Math.floor(game.bonus / BOARD_WIDTH) * 10 + 5}
                r="4"
                className="fill-action stroke-brand-900 dark:stroke-brand-100"
                strokeWidth="1"
              />
              <circle
                cx={(game.bonus % BOARD_WIDTH) * 10 + 5}
                cy={Math.floor(game.bonus / BOARD_WIDTH) * 10 + 5}
                r="5"
                fill="none"
                className="stroke-action"
                strokeWidth="0.7"
                strokeDasharray={`${(game.bonusTicks / 50) * 31.4} 31.4`}
              />
            </g>
          )}
        </svg>
        {!running && (
          <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-100/90 px-5 text-center text-brand-900 dark:bg-brand-900/90 dark:text-brand-100">
            <span
              aria-hidden="true"
              className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground"
            >
              A LITTLE NOKIA NOSTALGIA
            </span>
            <span className="font-heading text-2xl tracking-tight sm:text-3xl">
              {title}
            </span>
            <span className="max-w-60 text-xs leading-relaxed text-muted-foreground">
              {game.status === "ready"
                ? "Eat the dots. Golden rings give +3 points and a short slow-down."
                : game.status === "paused"
                  ? "Your next move can wait."
                  : `You scored ${game.score}. Ready for another go?`}
            </span>
          </span>
        )}
      </button>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <fieldset
          aria-label="Snake direction"
          className="grid grid-cols-4 gap-1"
        >
          {controls.map(({ direction, Icon }) => (
            <button
              key={direction}
              type="button"
              aria-label={`Steer ${direction}`}
              disabled={!running}
              onClick={() => {
                dispatch({ type: "turn", direction })
                board.current?.focus({ preventScroll: true })
              }}
              className="grid size-11 place-items-center border border-border transition-colors hover:bg-muted active:bg-brand-300 active:text-brand-900 disabled:opacity-35"
            >
              <Icon size={18} aria-hidden="true" />
            </button>
          ))}
        </fieldset>
        <div className="flex gap-1">
          <Button
            type="button"
            className="size-11 min-h-11 px-0"
            aria-label={
              running
                ? "Pause game"
                : game.status === "paused"
                  ? "Resume game"
                  : game.status === "over" || game.status === "won"
                    ? "Play again"
                    : progress.level > 1
                      ? `Continue level ${progress.level}`
                      : "Start game"
            }
            onClick={() => {
              if (running) dispatch({ type: "pause" })
              else start()
            }}
          >
            {running ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="size-11 min-h-11 px-0"
            aria-label="Restart"
            onClick={() => {
              dispatch({ type: "restart", best: progress.best })
              board.current?.focus({ preventScroll: true })
            }}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>
      <p
        id={instructions}
        className="mt-3 text-center text-xs leading-relaxed text-muted-foreground"
      >
        Arrow keys or WASD to steer. Space to pause. Golden rings expire, so be
        quick.
        <br />
        On your phone, use the arrows above.{" "}
        {slowed
          ? "Slow-down active."
          : game.level === 3
            ? "Max speed level."
            : `Next level at ${game.level * 5} regular dots.`}
      </p>
      <p role="status" className="sr-only">
        {game.status === "over"
          ? `Game over. Your score is ${game.score}.`
          : game.status === "won"
            ? `You won. Your score is ${game.score}.`
            : game.status === "paused"
              ? "Game paused."
              : game.status === "running"
                ? `Playing. Score ${game.score}.`
                : "Snake is ready. Start when you like."}
      </p>
    </div>
  )
}
