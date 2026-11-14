import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createFlight, flightReducer, PLAYER_Y } from "../lib/plane-game"

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
