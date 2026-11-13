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
import {
  BOARD_SIZE,
  createSnakeGame,
  type Direction,
  snakeReducer,
} from "@/lib/snake"

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
  { direction: "up", Icon: ArrowUp, position: "col-start-2" },
  { direction: "left", Icon: ArrowLeft, position: "col-start-1 row-start-2" },
  { direction: "down", Icon: ArrowDown, position: "col-start-2 row-start-2" },
  { direction: "right", Icon: ArrowRight, position: "col-start-3 row-start-2" },
] as const

export function SnakeGame() {
  const [game, dispatch] = useReducer(snakeReducer, undefined, () =>
    createSnakeGame(),
  )
  const board = useRef<HTMLButtonElement>(null)
  const instructions = useId()
  const grid = useId()
  const running = game.status === "running"

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(
      () => dispatch({ type: "tick" }),
      Math.max(90, 170 - game.score * 4),
    )
    return () => window.clearInterval(timer)
  }, [running, game.score])

  useEffect(() => {
    const pause = () => dispatch({ type: "pause" })
    const onVisibility = () => {
      if (document.hidden) pause()
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) pause()
      },
      { threshold: 0.15 },
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
    dispatch({
      type:
        game.status === "over" || game.status === "won" ? "restart" : "start",
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
      className="p-3 sm:p-4"
      data-snake-status={game.status}
      role="application"
      aria-label="Snake Xenzia"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          dispatch({ type: "pause" })
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3 font-mono text-xs">
        <span>
          Score{" "}
          <strong className="text-action">
            {String(game.score).padStart(2, "0")}
          </strong>
        </span>
        <span className="text-muted-foreground">
          Best this visit {String(game.best).padStart(2, "0")}
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
        className="relative block aspect-square w-full overflow-hidden border border-brand-500 p-0 bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action dark:bg-brand-900"
      >
        <svg
          role="img"
          aria-label={`Snake board. Score ${game.score}.`}
          viewBox={`0 0 ${BOARD_SIZE * 10} ${BOARD_SIZE * 10}`}
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
              x={(cell % BOARD_SIZE) * 10 + 1}
              y={Math.floor(cell / BOARD_SIZE) * 10 + 1}
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
              cx={(game.food % BOARD_SIZE) * 10 + 5}
              cy={Math.floor(game.food / BOARD_SIZE) * 10 + 5}
              r="3"
              className="fill-action stroke-brand-900 dark:stroke-brand-100"
              strokeWidth="0.8"
            />
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
            <span className="font-heading text-3xl tracking-tight sm:text-4xl">
              {title}
            </span>
            <span className="max-w-60 text-xs leading-relaxed text-muted-foreground">
              {game.status === "ready"
                ? "Eat the amber dots. Avoid the walls and your own tail."
                : game.status === "paused"
                  ? "Your next move can wait."
                  : `You scored ${game.score}. Ready for another go?`}
            </span>
          </span>
        )}
      </button>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <Button
          type="button"
          className="px-3 text-xs"
          onClick={() => {
            if (running) dispatch({ type: "pause" })
            else start()
          }}
        >
          {running ? <Pause size={14} /> : <Play size={14} />}{" "}
          {running
            ? "Pause game"
            : game.status === "paused"
              ? "Resume game"
              : game.status === "over" || game.status === "won"
                ? "Play again"
                : "Start game"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="px-3 text-xs"
          onClick={() => {
            dispatch({ type: "restart" })
            board.current?.focus({ preventScroll: true })
          }}
        >
          <RotateCcw size={14} />
          Restart
        </Button>
      </div>
      <fieldset
        aria-label="Snake direction"
        className="mx-auto mt-3 grid w-fit grid-cols-3 gap-1"
      >
        {controls.map(({ direction, Icon, position }) => (
          <button
            key={direction}
            type="button"
            aria-label={`Steer ${direction}`}
            disabled={!running}
            onClick={() => dispatch({ type: "turn", direction })}
            className={`${position} grid size-11 place-items-center border border-border transition-colors hover:bg-muted active:bg-brand-300 active:text-brand-900 disabled:opacity-35`}
          >
            <Icon size={18} />
          </button>
        ))}
      </fieldset>
      <p
        id={instructions}
        className="mt-3 text-center text-xs leading-relaxed text-muted-foreground"
      >
        Arrow keys or WASD to steer. Space to pause.
        <br />
        On your phone, use the arrows above.
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
