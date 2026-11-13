export const BOARD_SIZE = 18

export type Direction = "up" | "right" | "down" | "left"

export type GameStatus = "ready" | "running" | "paused" | "over" | "won"

export type SnakeState = {
  snake: number[]
  direction: Direction
  queued: Direction | null
  food: number | null
  status: GameStatus
  score: number
  best: number
}

export type SnakeAction =
  | { type: "turn"; direction: Direction }
  | { type: "tick" | "start" | "pause" | "restart" }

const vectors: Record<Direction, readonly [number, number]> = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
}

const opposite: Record<Direction, Direction> = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
}

export function placeFood(
  snake: number[],
  random = Math.random,
): number | null {
  const occupied = new Set(snake)
  const free = Array.from(
    { length: BOARD_SIZE * BOARD_SIZE },
    (_, cell) => cell,
  ).filter((cell) => !occupied.has(cell))

  return free.length ? free[Math.floor(random() * free.length)] : null
}

export function createSnakeGame(best = 0): SnakeState {
  const head = 9 * BOARD_SIZE + 7

  return {
    snake: [head, head - 1, head - 2],
    direction: "right",
    queued: null,
    food: head + 4,
    status: "ready",
    score: 0,
    best,
  }
}

export function stepSnake(state: SnakeState, random = Math.random): SnakeState {
  if (state.status !== "running") return state
  const direction = state.queued ?? state.direction
  const [dx, dy] = vectors[direction]
  const x = (state.snake[0] % BOARD_SIZE) + dx
  const y = Math.floor(state.snake[0] / BOARD_SIZE) + dy
  const head = y * BOARD_SIZE + x
  const grows = head === state.food
  const body = grows ? state.snake : state.snake.slice(0, -1)
  if (
    x < 0 ||
    x >= BOARD_SIZE ||
    y < 0 ||
    y >= BOARD_SIZE ||
    body.includes(head)
  )
    return { ...state, direction, queued: null, status: "over" }
  const snake = [head, ...state.snake]
  if (!grows) snake.pop()
  const score = state.score + (grows ? 1 : 0)
  const food = grows ? placeFood(snake, random) : state.food

  return {
    ...state,
    snake,
    direction,
    queued: null,
    food,
    score,
    best: Math.max(state.best, score),
    status: food === null ? "won" : "running",
  }
}

export function snakeReducer(
  state: SnakeState,
  action: SnakeAction,
): SnakeState {
  switch (action.type) {
    case "tick":
      return stepSnake(state)
    case "turn":
      return state.status === "running" &&
        state.queued === null &&
        action.direction !== state.direction &&
        action.direction !== opposite[state.direction]
        ? { ...state, queued: action.direction }
        : state
    case "start":
      return state.status === "ready" || state.status === "paused"
        ? { ...state, status: "running" }
        : state
    case "pause":
      return state.status === "running" ? { ...state, status: "paused" } : state
    case "restart":
      return { ...createSnakeGame(state.best), status: "running" }
  }
}
