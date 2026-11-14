export const FLIGHT_WIDTH = 420
export const FLIGHT_HEIGHT = 300
export const PLAYER_Y = 264

export type FlightStatus = "ready" | "running" | "paused" | "over"
type Target = { id: number; x: number; y: number }

export type FlightState = {
  status: FlightStatus
  x: number
  score: number
  lives: number
  bullets: Target[]
  enemies: Target[]
  fireIn: number
  spawnIn: number
  nextId: number
}

type FlightAction =
  | { type: "start" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "tick"; dt: number; direction: number }

export function createFlight(): FlightState {
  return {
    status: "ready",
    x: FLIGHT_WIDTH / 2,
    score: 0,
    lives: 3,
    bullets: [],
    enemies: [
      { id: 0, x: 90, y: 24 },
      { id: 1, x: 210, y: 64 },
      { id: 2, x: 330, y: 24 },
    ],
    fireIn: 0,
    spawnIn: 1,
    nextId: 3,
  }
}

export function flightReducer(
  state: FlightState,
  action: FlightAction,
): FlightState {
  if (action.type === "start") return { ...createFlight(), status: "running" }
  if (action.type === "pause")
    return state.status === "running" ? { ...state, status: "paused" } : state
  if (action.type === "resume")
    return state.status === "paused" ? { ...state, status: "running" } : state
  if (state.status !== "running") return state

  const dt = Math.max(0, Math.min(action.dt, 0.05))
  const x = Math.max(
    20,
    Math.min(
      FLIGHT_WIDTH - 20,
      state.x + Math.max(-1, Math.min(1, action.direction)) * 230 * dt,
    ),
  )
  let nextId = state.nextId
  let fireIn = state.fireIn - dt
  let spawnIn = state.spawnIn - dt
  const bullets = state.bullets
    .map((bullet) => ({ ...bullet, y: bullet.y - 360 * dt }))
    .filter((bullet) => bullet.y > -10)
  const enemies = state.enemies.map((enemy) => ({
    ...enemy,
    y: enemy.y + Math.min(75, 36 + state.score / 20) * dt,
  }))

  if (fireIn <= 0) {
    bullets.push({ id: nextId++, x, y: PLAYER_Y - 20 })
    fireIn = 0.24
  }
  if (spawnIn <= 0) {
    enemies.push({
      id: nextId++,
      x: 30 + ((nextId * 83) % (FLIGHT_WIDTH - 60)),
      y: -16,
    })
    spawnIn = Math.max(0.5, 1 - state.score / 1000)
  }

  let score = state.score
  let lives = state.lives
  const remaining: Target[] = []
  for (const enemy of enemies) {
    const hit = bullets.findIndex(
      (bullet) =>
        Math.abs(bullet.x - enemy.x) < 18 && Math.abs(bullet.y - enemy.y) < 20,
    )
    if (hit !== -1) {
      bullets.splice(hit, 1)
      score += 10
    } else if (
      enemy.y > FLIGHT_HEIGHT + 16 ||
      (Math.abs(enemy.x - x) < 24 && Math.abs(enemy.y - PLAYER_Y) < 23)
    ) {
      lives = Math.max(0, lives - 1)
    } else {
      remaining.push(enemy)
    }
  }

  return {
    status: lives === 0 ? "over" : "running",
    x,
    score,
    lives,
    bullets,
    enemies: remaining,
    fireIn,
    spawnIn,
    nextId,
  }
}
