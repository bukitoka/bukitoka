import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createRace, RACE_PLAYER_Y, raceReducer } from "../lib/racing-game"

const start = () => raceReducer(createRace(), { type: "start" })

describe("Arcade Racer rules", () => {
  it("waits for start and pauses without moving traffic or distance", () => {
    const ready = createRace()
    assert.equal(raceReducer(ready, { type: "tick", dt: 0.05 }), ready)
    const paused = raceReducer(start(), { type: "pause" })
    assert.equal(raceReducer(paused, { type: "tick", dt: 0.05 }), paused)
    assert.equal(raceReducer(paused, { type: "resume" }).status, "running")
  })

  it("changes lanes without leaving the road", () => {
    let game = start()
    for (let i = 0; i < 4; i++)
      game = raceReducer(game, { type: "move", direction: -1 })
    assert.equal(game.lane, 0)
    for (let i = 0; i < 4; i++)
      game = raceReducer(game, { type: "move", direction: 1 })
    assert.equal(game.lane, 2)
  })

  it("advances distance and spawns traffic without jumping after a delayed frame", () => {
    const next = raceReducer(
      { ...start(), spawnIn: 0 },
      { type: "tick", dt: 100 },
    )
    assert.equal(next.distance, 0.6)
    assert.equal(next.traffic.length, 2)
    assert.equal(next.traffic[0].y, -19)
  })

  it("loses one life per collision and shields against simultaneous hits", () => {
    const next = raceReducer(
      {
        ...start(),
        traffic: [
          { id: 5, lane: 1, y: RACE_PLAYER_Y },
          { id: 6, lane: 1, y: RACE_PLAYER_Y },
        ],
      },
      { type: "tick", dt: 0.01 },
    )
    assert.equal(next.lives, 2)
    assert.equal(next.shield, 1)
    assert.equal(next.traffic.length, 1)
    const shielded = raceReducer(next, { type: "tick", dt: 0.01 })
    assert.equal(shielded.lives, 2)
  })

  it("ends at zero lives, removes passed traffic, and restarts cleanly", () => {
    const passed = raceReducer(
      { ...start(), traffic: [{ id: 5, lane: 0, y: 345 }] },
      { type: "tick", dt: 0.01 },
    )
    assert.equal(passed.traffic.length, 0)
    const over = raceReducer(
      { ...start(), lives: 1, traffic: [{ id: 5, lane: 1, y: RACE_PLAYER_Y }] },
      { type: "tick", dt: 0.01 },
    )
    assert.equal(over.status, "over")
    const fresh = raceReducer(over, { type: "start" })
    assert.equal(fresh.distance, 0)
    assert.equal(fresh.lives, 3)
    assert.equal(fresh.lane, 1)
  })
})

it("steers smoothly and only collides with traffic at the actual car position", () => {
  const moved = raceReducer(start(), { type: "move", direction: -1 })
  assert.equal(moved.x, 210)
  const next = raceReducer(moved, { type: "tick", dt: 0.016 })
  assert.ok(next.x > 120 && next.x < 210)
  const hit = raceReducer(
    { ...moved, traffic: [{ id: 10, lane: 1, y: RACE_PLAYER_Y }] },
    { type: "tick", dt: 0.001 },
  )
  assert.equal(hit.lives, 2)
})

it("unlocks harder laps and finishes after outlasting the final rival", () => {
  const cleared = raceReducer(
    { ...start(), distance: 150 },
    { type: "tick", dt: 0.01 },
  )
  assert.equal(cleared.status, "cleared")
  assert.equal(raceReducer(cleared, { type: "next" }).level, 2)
  const boss = {
    ...createRace(3),
    status: "running" as const,
    rivalLead: 1,
    traffic: [{ id: 10, lane: 2, y: 345, gate: true }],
  }
  assert.equal(raceReducer(boss, { type: "tick", dt: 0.01 }).status, "won")
  const wave = raceReducer(
    { ...createRace(3), status: "running", spawnIn: 0 },
    { type: "tick", dt: 0.01 },
  )
  assert.equal(wave.traffic.length, 2)
  assert.ok(wave.traffic.every((car) => car.lane !== 0))
})

it("lets a player beat the rival by following each warning without unavoidable collisions", () => {
  let game = raceReducer(createRace(3), { type: "start", level: 3 })
  for (let frame = 0; frame < 2000 && game.status === "running"; frame++) {
    if (game.spawnIn < 0.8 && game.lane !== game.safeLane)
      game = raceReducer(game, {
        type: "move",
        direction: game.lane < game.safeLane ? 1 : -1,
      })
    game = raceReducer(game, { type: "tick", dt: 1 / 60 })
  }
  assert.equal(game.status, "won")
  assert.equal(game.lives, 3)
})
