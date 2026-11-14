export const BOARD_WIDTH = 24
export const BOARD_HEIGHT = 16

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
  level: number
  eaten: number
  bonus: number | null
  bonusTicks: number
  slowTicks: number
}

export type SnakeAction =
  | { type: "turn"; direction: Direction }
  | { type: "tick" | "start" | "pause" }
  | { type: "restart"; level?: number; best?: number }

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
    { length: BOARD_WIDTH * BOARD_HEIGHT },
    (_, cell) => cell,
  ).filter((cell) => !occupied.has(cell))

  return free.length ? free[Math.floor(random() * free.length)] : null
}

export function createSnakeGame(best = 0, level = 1): SnakeState {
  const head = 8 * BOARD_WIDTH + 7

  return {
    snake: [head, head - 1, head - 2],
    direction: "right",
    queued: null,
    food: head + 4,
    status: "ready",
    score: 0,
    best,
    level,
    eaten: (level - 1) * 5,
    bonus: null,
    bonusTicks: 0,
    slowTicks: 0,
  }
}

export function stepSnake(state: SnakeState, random = Math.random): SnakeState {
  if (state.status !== "running") return state
  const direction = state.queued ?? state.direction
  const [dx, dy] = vectors[direction]
  const x = (state.snake[0] % BOARD_WIDTH) + dx
  const y = Math.floor(state.snake[0] / BOARD_WIDTH) + dy
  const head = y * BOARD_WIDTH + x
  const special = head === state.bonus && state.bonusTicks > 0
  const regular = head === state.food
  const grows = regular || special
  const body = grows ? state.snake : state.snake.slice(0, -1)
  if (
    x < 0 ||
    x >= BOARD_WIDTH ||
    y < 0 ||
    y >= BOARD_HEIGHT ||
    body.includes(head)
  )
    return { ...state, direction, queued: null, status: "over" }
  const snake = [head, ...state.snake]
  if (!grows) snake.pop()
  const score = state.score + (regular ? 1 : special ? 3 : 0)
  const eaten = state.eaten + (regular ? 1 : 0)
  let food = regular ? placeFood(snake, random) : state.food
  let bonusTicks = Math.max(0, state.bonusTicks - 1)
  let bonus = special || bonusTicks === 0 ? null : state.bonus
  if (regular && eaten % 3 === 0) {
    bonus = placeFood(food === null ? snake : [...snake, food], random)
    bonusTicks = bonus === null ? 0 : 50
  } else if (food !== null && food === bonus) {
    bonus = placeFood([...snake, food], random)
  }
  if (food === null && snake.length < BOARD_WIDTH * BOARD_HEIGHT)
    food = placeFood(snake, random)

  return {
    ...state,
    snake,
    direction,
    queued: null,
    food,
    score,
    eaten,
    level: Math.min(3, 1 + Math.floor(eaten / 5)),
    bonus,
    bonusTicks,
    slowTicks: special ? 40 : Math.max(0, state.slowTicks - 1),
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
      return {
        ...createSnakeGame(
          Math.max(state.best, action.best ?? 0),
          action.level ?? 1,
        ),
        status: "running",
      }
  }
}
