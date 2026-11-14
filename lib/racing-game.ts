export const RACE_LANES = [120, 210, 300]
export const RACE_PLAYER_Y = 244

type Traffic = { id: number; lane: number; y: number; gate?: boolean }
export type RaceState = {
  status: "ready" | "running" | "paused" | "over" | "cleared" | "won"
  lane: number
  x: number
  level: number
  rivalLead: number
  safeLane: number
  distance: number
  lives: number
  traffic: Traffic[]
  spawnIn: number
  shield: number
  nextId: number
}

type RaceAction =
  | { type: "start"; level?: number }
  | { type: "next" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "move"; direction: -1 | 1 }
  | { type: "tick"; dt: number }

export function createRace(level = 1): RaceState {
  return {
    status: "ready",
    lane: 1,
    x: RACE_LANES[1],
    level,
    rivalLead: level === 3 ? 5 : 0,
    safeLane: 0,
    distance: 0,
    lives: 3,
    traffic: level === 3 ? [] : [{ id: 0, lane: 1, y: -25 }],
    spawnIn: level === 3 ? 1.8 : 0.9,
    shield: 0,
    nextId: 1,
  }
}

export function raceReducer(state: RaceState, action: RaceAction): RaceState {
  if (action.type === "start")
    return { ...createRace(action.level ?? 1), status: "running" }
  if (action.type === "next")
    return state.status === "cleared"
      ? { ...createRace(state.level + 1), status: "running" }
      : state
  if (action.type === "pause")
    return state.status === "running" ? { ...state, status: "paused" } : state
  if (action.type === "resume")
    return state.status === "paused" ? { ...state, status: "running" } : state
  if (state.status !== "running") return state
  if (action.type === "move")
    return {
      ...state,
      lane: Math.max(0, Math.min(2, state.lane + action.direction)),
    }

  const dt = Math.max(0, Math.min(0.05, action.dt))
  const speed = Math.min(
    240,
    120 + (state.level - 1) * 45 + state.distance * 0.05,
  )
  const targetX = RACE_LANES[state.lane]
  const x =
    Math.abs(state.x - targetX) < 0.2
      ? targetX
      : targetX + (state.x - targetX) * Math.exp(-14 * dt)
  let rivalLead = state.rivalLead
  let safeLane = state.safeLane
  let lives = state.lives
  let shield = Math.max(0, state.shield - dt)
  let spawnIn = state.spawnIn - dt
  let nextId = state.nextId
  const traffic: Traffic[] = []
  for (const car of state.traffic) {
    const y = car.y + speed * dt
    if (
      Math.abs(RACE_LANES[car.lane] - x) < 30 &&
      Math.abs(y - RACE_PLAYER_Y) < 42 &&
      shield === 0
    ) {
      lives = Math.max(0, lives - 1)
      shield = 1
    } else if (y < 340) traffic.push({ ...car, y })
    else if (car.gate) rivalLead = Math.max(0, rivalLead - 1)
  }
  if (spawnIn <= 0) {
    if (state.level === 3) {
      const blocked = [0, 1, 2].filter((lane) => lane !== safeLane)
      blocked.forEach((lane, index) => {
        traffic.push({ id: nextId++, lane, y: -36, gate: index === 0 })
      })
      safeLane = (safeLane + 1) % 3
      spawnIn = 2.5
    } else {
      traffic.push({ id: nextId, lane: (nextId * 2) % 3, y: -36 })
      nextId++
      spawnIn = Math.max(
        0.65,
        0.95 - state.distance / 3000 - (state.level - 1) * 0.15,
      )
    }
  }
  const distance = state.distance + (speed * dt) / 10
  return {
    ...state,
    status:
      lives === 0
        ? "over"
        : state.level === 3 && rivalLead === 0
          ? "won"
          : state.level < 3 && distance >= 150
            ? "cleared"
            : "running",
    x,
    rivalLead,
    safeLane,
    distance,
    lives,
    traffic,
    spawnIn,
    shield,
    nextId,
  }
}
