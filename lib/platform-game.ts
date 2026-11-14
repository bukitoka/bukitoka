export const PLATFORM_WIDTH = 420
export const PLATFORM_HEIGHT = 280
export const WORLD_WIDTH = 2800
export const GROUND_Y = 244
export const HERO_WIDTH = 20
export const HERO_HEIGHT = 28
export const FLAG_X = 2680

export const ground = [
  { x: 0, width: 480 },
  { x: 580, width: 540 },
  { x: 1240, width: 560 },
  { x: 1930, width: 870 },
]

export const platforms = [
  { x: 200, y: 185, width: 100 },
  { x: 340, y: 145, width: 90 },
  { x: 720, y: 174, width: 100 },
  { x: 970, y: 185, width: 100 },
  { x: 1350, y: 180, width: 100 },
  { x: 1550, y: 145, width: 120 },
  { x: 2100, y: 185, width: 110 },
]

export const coins = [
  { x: 120, y: 210 },
  { x: 260, y: 150 },
  { x: 375, y: 115 },
  { x: 530, y: 165 },
  { x: 700, y: 210 },
  { x: 775, y: 140 },
  { x: 1020, y: 150 },
  { x: 1190, y: 170 },
  { x: 1360, y: 150 },
  { x: 1620, y: 110 },
  { x: 1860, y: 165 },
  { x: 2110, y: 150 },
  { x: 2390, y: 210 },
  { x: 2540, y: 210 },
  { x: 2660, y: 210 },
]

export const enemies = [370, 790, 1060, 1470, 2200, 2490]
export const enemyX = (index: number, elapsed: number, level = 1) =>
  enemies[index] + Math.sin(elapsed * (1.7 + (level - 1) * 0.5) + index) * 24
export const bossX = (elapsed: number) => 2510 + Math.sin(elapsed * 1.6) * 45

export type PlatformState = {
  status: "ready" | "running" | "paused" | "over" | "won" | "cleared"
  level: number
  bossHp: number
  bossShield: number
  x: number
  y: number
  vy: number
  grounded: boolean
  coyote: number
  facing: number
  elapsed: number
  lives: number
  checkpoint: number
  collected: number[]
  defeated: number[]
}

type PlatformAction =
  | { type: "start"; level?: number; checkpoint?: number }
  | { type: "next" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "jump" }
  | { type: "tick"; dt: number; direction: number }

export function createPlatformGame(level = 1, checkpoint = 42): PlatformState {
  return {
    status: "ready",
    level,
    bossHp: level === 3 ? 3 : 0,
    bossShield: 0,
    x: checkpoint,
    y: GROUND_Y - HERO_HEIGHT,
    vy: 0,
    grounded: true,
    coyote: 0.1,
    facing: 1,
    elapsed: 0,
    lives: 3,
    checkpoint,
    collected: [],
    defeated: [],
  }
}

function loseLife(state: PlatformState): PlatformState {
  const lives = state.lives - 1
  return {
    ...state,
    status: lives === 0 ? "over" : "running",
    lives,
    x: state.checkpoint,
    y: GROUND_Y - HERO_HEIGHT,
    vy: 0,
    grounded: true,
    coyote: 0.1,
  }
}

export function platformReducer(
  state: PlatformState,
  action: PlatformAction,
): PlatformState {
  if (action.type === "start")
    return {
      ...createPlatformGame(action.level ?? 1, action.checkpoint || 42),
      status: "running",
    }
  if (action.type === "next")
    return state.status === "cleared"
      ? { ...createPlatformGame(state.level + 1), status: "running" }
      : state
  if (action.type === "pause")
    return state.status === "running" ? { ...state, status: "paused" } : state
  if (action.type === "resume")
    return state.status === "paused" ? { ...state, status: "running" } : state
  if (state.status !== "running") return state
  if (action.type === "jump")
    return state.grounded || state.coyote > 0
      ? { ...state, vy: -410, grounded: false, coyote: 0 }
      : state

  const dt = Math.max(0, Math.min(action.dt, 0.04))
  const direction = Math.max(-1, Math.min(1, action.direction))
  const x = Math.max(
    0,
    Math.min(WORLD_WIDTH - HERO_WIDTH, state.x + direction * 175 * dt),
  )
  let vy = state.vy + 1000 * dt
  let y = state.y + vy * dt
  let grounded = false
  let checkpoint = state.checkpoint
  const elapsed = state.elapsed + dt

  for (const surface of [
    ...ground.map((segment) => ({ ...segment, y: GROUND_Y })),
    ...platforms,
  ]) {
    if (
      vy >= 0 &&
      state.y + HERO_HEIGHT <= surface.y + 0.1 &&
      y + HERO_HEIGHT >= surface.y &&
      x + HERO_WIDTH > surface.x &&
      x < surface.x + surface.width
    ) {
      y = surface.y - HERO_HEIGHT
      vy = 0
      grounded = true
    }
  }
  if (grounded && y === GROUND_Y - HERO_HEIGHT) {
    if (state.level === 3 && x >= 2360) checkpoint = 2360
    else if (x >= 2050) checkpoint = 2050
    else if (x >= 900) checkpoint = 900
  }

  const collected = [...state.collected]
  coins.forEach((coin, index) => {
    if (
      !collected.includes(index) &&
      Math.abs(x + HERO_WIDTH / 2 - coin.x) < 18 &&
      Math.abs(y + HERO_HEIGHT / 2 - coin.y) < 22
    )
      collected.push(index)
  })
  const defeated = [...state.defeated]
  let next: PlatformState = {
    ...state,
    x,
    y,
    vy,
    grounded,
    checkpoint,
    elapsed,
    bossShield: Math.max(0, state.bossShield - dt),
    collected,
    defeated,
    coyote: grounded ? 0.1 : Math.max(0, state.coyote - dt),
    facing: direction || state.facing,
  }
  if (y > PLATFORM_HEIGHT + 60) return loseLife(next)

  for (let index = 0; index < enemies.length; index++) {
    if (defeated.includes(index) || (state.level === 3 && index >= 4)) continue
    const ex = enemyX(index, elapsed, state.level)
    const top = GROUND_Y - 18
    if (
      x + HERO_WIDTH > ex - 11 &&
      x < ex + 11 &&
      y + HERO_HEIGHT > top &&
      y < GROUND_Y
    ) {
      if (state.vy > 0 && state.y + HERO_HEIGHT <= top + 8) {
        defeated.push(index)
        next = { ...next, vy: -280, grounded: false, coyote: 0 }
      } else return loseLife(next)
    }
  }
  if (state.level === 3 && state.bossHp > 0) {
    const bx = bossX(elapsed)
    if (
      next.bossShield === 0 &&
      x + HERO_WIDTH > bx - 23 &&
      x < bx + 23 &&
      y + HERO_HEIGHT > GROUND_Y - 44 &&
      y < GROUND_Y
    ) {
      if (state.vy > 0 && state.y + HERO_HEIGHT <= GROUND_Y - 34)
        next = {
          ...next,
          bossHp: state.bossHp - 1,
          bossShield: 1.1,
          vy: -340,
          grounded: false,
          coyote: 0,
        }
      else return loseLife(next)
    }
    if (x + HERO_WIDTH >= FLAG_X && next.bossHp > 0)
      return { ...next, x: FLAG_X - HERO_WIDTH }
  }
  if (x + HERO_WIDTH >= FLAG_X)
    return { ...next, status: state.level < 3 ? "cleared" : "won" }
  return next
}
