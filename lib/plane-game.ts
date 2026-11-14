export const FLIGHT_WIDTH = 420
export const FLIGHT_HEIGHT = 300
export const PLAYER_Y = 264

export type FlightStatus =
  | "ready"
  | "running"
  | "paused"
  | "over"
  | "cleared"
  | "won"
export const FLIGHT_GOALS = [6, 10]
export const FLIGHT_BOSS_HP = 12
export const flightBossX = (elapsed: number) =>
  FLIGHT_WIDTH / 2 + Math.sin(elapsed * 1.1) * 100
type Target = { id: number; x: number; y: number }
type Bolt = Target & { vx: number }

export type FlightState = {
  status: FlightStatus
  x: number
  level: number
  kills: number
  elapsed: number
  bossHp: number
  attackIn: number
  bolts: Bolt[]
  shield: number
  score: number
  lives: number
  bullets: Target[]
  enemies: Target[]
  fireIn: number
  spawnIn: number
  nextId: number
}

type FlightAction =
  | { type: "start"; level?: number }
  | { type: "next" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "tick"; dt: number; direction: number }

export function createFlight(level = 1, score = 0): FlightState {
  return {
    status: "ready",
    x: FLIGHT_WIDTH / 2,
    score,
    level,
    kills: 0,
    elapsed: 0,
    bossHp: level === 3 ? FLIGHT_BOSS_HP : 0,
    attackIn: 1.4,
    bolts: [],
    shield: 0,
    lives: 3,
    bullets: [],
    enemies:
      level === 3
        ? []
        : [
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
  if (action.type === "start")
    return { ...createFlight(action.level ?? 1), status: "running" }
  if (action.type === "next")
    return state.status === "cleared"
      ? { ...createFlight(state.level + 1, state.score), status: "running" }
      : state
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
  const elapsed = state.elapsed + dt
  let kills = state.kills
  let bossHp = state.bossHp
  let attackIn = state.attackIn - dt
  let shield = Math.max(0, state.shield - dt)
  let nextId = state.nextId
  let fireIn = state.fireIn - dt
  let spawnIn = state.spawnIn - dt
  const bullets = state.bullets
    .map((bullet) => ({ ...bullet, y: bullet.y - 360 * dt }))
    .filter((bullet) => bullet.y > -10)
  const enemies = state.enemies.map((enemy) => ({
    ...enemy,
    y:
      enemy.y +
      Math.min(100, 36 + (state.level - 1) * 18 + state.score / 20) * dt,
  }))

  if (fireIn <= 0) {
    bullets.push({ id: nextId++, x, y: PLAYER_Y - 20 })
    fireIn = 0.24
  }
  if (state.level < 3 && spawnIn <= 0) {
    enemies.push({
      id: nextId++,
      x: 30 + ((nextId * 83) % (FLIGHT_WIDTH - 60)),
      y: -16,
    })
    spawnIn = Math.max(0.45, 1 - state.score / 1000 - (state.level - 1) * 0.22)
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
      kills++
    } else if (
      enemy.y > FLIGHT_HEIGHT + 16 ||
      (Math.abs(enemy.x - x) < 24 && Math.abs(enemy.y - PLAYER_Y) < 23)
    ) {
      lives = Math.max(0, lives - 1)
    } else {
      remaining.push(enemy)
    }
  }

  const bolts = state.bolts
    .map((bolt) => ({
      ...bolt,
      x: bolt.x + bolt.vx * dt,
      y: bolt.y + 135 * dt,
    }))
    .filter(
      (bolt) =>
        bolt.y < FLIGHT_HEIGHT + 16 &&
        bolt.x > -16 &&
        bolt.x < FLIGHT_WIDTH + 16,
    )
  if (state.level === 3) {
    const bx = flightBossX(elapsed)
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i]
      if (
        bossHp > 0 &&
        Math.abs(bullet.x - bx) < 53 &&
        bullet.y >= 27 &&
        bullet.y <= 85
      ) {
        bullets.splice(i, 1)
        bossHp = Math.max(0, bossHp - 1)
        score += 5
      }
    }
    if (attackIn <= 0 && bossHp > 0) {
      for (const vx of [-70, 0, 70])
        bolts.push({ id: nextId++, x: bx, y: 85, vx })
      attackIn = 1.4
    }
    for (let i = bolts.length - 1; i >= 0; i--) {
      if (
        Math.abs(bolts[i].x - x) < 17 &&
        Math.abs(bolts[i].y - PLAYER_Y) < 20 &&
        shield === 0
      ) {
        bolts.splice(i, 1)
        lives = Math.max(0, lives - 1)
        shield = 1
      }
    }
    if (bossHp === 0 && state.bossHp > 0) score += 100
  }

  return {
    status:
      lives === 0
        ? "over"
        : state.level === 3 && bossHp === 0
          ? "won"
          : state.level < 3 && kills >= FLIGHT_GOALS[state.level - 1]
            ? "cleared"
            : "running",
    level: state.level,
    elapsed,
    kills,
    bossHp,
    attackIn,
    bolts,
    shield,
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
