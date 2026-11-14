import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  createFlight,
  flightBossX,
  flightReducer,
  PLAYER_Y,
} from "../lib/plane-game"

describe("404 flight rules", () => {
  it("waits for start, pauses without advancing, and resumes", () => {
    const ready = createFlight()
    assert.equal(
      flightReducer(ready, { type: "tick", dt: 0.05, direction: 1 }),
      ready,
    )
    const running = flightReducer(ready, { type: "start" })
    const paused = flightReducer(running, { type: "pause" })
    assert.equal(
      flightReducer(paused, { type: "tick", dt: 0.05, direction: 1 }),
      paused,
    )
    assert.equal(flightReducer(paused, { type: "resume" }).status, "running")
  })

  it("fires automatically and destroys a target for ten points", () => {
    let game = flightReducer(createFlight(), { type: "start" })
    for (let i = 0; i < 30; i++)
      game = flightReducer(game, { type: "tick", dt: 1 / 30, direction: 0 })
    assert.equal(game.score, 10)
    assert.equal(game.lives, 3)
    assert.ok(game.bullets.length > 0)
  })

  it("keeps the plane on the board and clamps time after a long frame", () => {
    const running = flightReducer(createFlight(), { type: "start" })
    const next = flightReducer(
      { ...running, x: 399 },
      { type: "tick", dt: 100, direction: 1 },
    )
    assert.equal(next.x, 400)
    assert.ok(next.enemies[0].y < 30)
    const left = flightReducer(
      { ...running, x: 21 },
      { type: "tick", dt: 0.05, direction: -1 },
    )
    assert.equal(left.x, 20)
  })

  it("loses lives on collision or an escaped target, then ends and restarts cleanly", () => {
    const running = flightReducer(createFlight(), { type: "start" })
    const over = flightReducer(
      {
        ...running,
        lives: 2,
        fireIn: 1,
        enemies: [
          { id: 20, x: 210, y: PLAYER_Y },
          { id: 21, x: 90, y: 320 },
        ],
      },
      { type: "tick", dt: 0.01, direction: 0 },
    )
    assert.equal(over.lives, 0)
    assert.equal(over.status, "over")
    assert.equal(
      flightReducer(over, { type: "tick", dt: 0.05, direction: 1 }),
      over,
    )
    const fresh = flightReducer(over, { type: "start" })
    assert.equal(fresh.score, 0)
    assert.equal(fresh.lives, 3)
    assert.equal(fresh.status, "running")
  })
})

it("clears target quotas, unlocks the next level, and preserves run score", () => {
  const running = flightReducer(createFlight(), { type: "start" })
  const cleared = flightReducer(
    { ...running, kills: 6, score: 60 },
    { type: "tick", dt: 0.01, direction: 0 },
  )
  assert.equal(cleared.status, "cleared")
  const next = flightReducer(cleared, { type: "next" })
  assert.equal(next.level, 2)
  assert.equal(next.score, 60)
  assert.equal(next.kills, 0)
  const boss = flightReducer(
    { ...next, kills: 10 },
    { type: "tick", dt: 0.01, direction: 0 },
  )
  assert.equal(flightReducer(boss, { type: "next" }).level, 3)
})

it("the boss fires spread patterns and gives brief protection after a hit", () => {
  const running = flightReducer(createFlight(), { type: "start", level: 3 })
  const attack = flightReducer(
    { ...running, attackIn: 0 },
    { type: "tick", dt: 0.01, direction: 0 },
  )
  assert.deepEqual(
    attack.bolts.map((bolt) => bolt.vx),
    [-70, 0, 70],
  )
  const bolts = [
    { id: 50, x: 210, y: PLAYER_Y, vx: 0 },
    { id: 51, x: 210, y: PLAYER_Y, vx: 0 },
  ]
  const hit = flightReducer(
    { ...running, bolts },
    { type: "tick", dt: 0.01, direction: 0 },
  )
  assert.equal(hit.lives, 2)
  assert.equal(hit.shield, 1)
  assert.equal(
    flightReducer(hit, { type: "tick", dt: 0.01, direction: 0 }).lives,
    2,
  )
})

it("awards victory and a boss bonus only when the mothership is defeated", () => {
  const running = flightReducer(createFlight(), { type: "start", level: 3 })
  const next = flightReducer(
    {
      ...running,
      bossHp: 1,
      bullets: [
        { id: 50, x: flightBossX(0.01), y: 70 },
        { id: 51, x: flightBossX(0.01), y: 70 },
      ],
    },
    { type: "tick", dt: 0.01, direction: 0 },
  )
  assert.equal(next.status, "won")
  assert.equal(next.bossHp, 0)
  assert.equal(next.score, 105)
  assert.equal(
    flightReducer(next, { type: "tick", dt: 0.05, direction: 0 }),
    next,
  )
})

it("the final boss can be defeated using the normal movement and automatic cannons", () => {
  let game = flightReducer(createFlight(), { type: "start", level: 3 })
  for (let i = 0; i < 2000 && game.status === "running"; i++) {
    const difference = flightBossX(game.elapsed) - game.x
    game = flightReducer(game, {
      type: "tick",
      dt: 1 / 60,
      direction: Math.abs(difference) < 4 ? 0 : Math.sign(difference),
    })
  }
  assert.equal(game.status, "won")
  assert.ok(game.lives > 0)
})
