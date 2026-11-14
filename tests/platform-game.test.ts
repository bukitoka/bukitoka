import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  coins,
  createPlatformGame,
  enemyX,
  FLAG_X,
  GROUND_Y,
  HERO_HEIGHT,
  platformReducer,
} from "../lib/platform-game"

const start = () => platformReducer(createPlatformGame(), { type: "start" })

describe("Super Kusuma platform rules", () => {
  it("only advances after starting, and pauses and resumes without losing progress", () => {
    const ready = createPlatformGame()
    assert.equal(
      platformReducer(ready, { type: "tick", dt: 0.02, direction: 1 }),
      ready,
    )
    const moved = platformReducer(start(), {
      type: "tick",
      dt: 0.02,
      direction: 1,
    })
    const paused = platformReducer(moved, { type: "pause" })
    assert.equal(
      platformReducer(paused, { type: "tick", dt: 0.04, direction: 1 }),
      paused,
    )
    assert.equal(platformReducer(paused, { type: "resume" }).x, moved.x)
  })

  it("jumps, prevents double jumping, and lands on the ground", () => {
    let game = platformReducer(start(), { type: "jump" })
    assert.equal(game.vy, -410)
    assert.equal(platformReducer(game, { type: "jump" }), game)
    for (let i = 0; i < 60; i++)
      game = platformReducer(game, { type: "tick", dt: 1 / 60, direction: 0 })
    assert.equal(game.y, GROUND_Y - HERO_HEIGHT)
    assert.equal(game.grounded, true)
  })

  it("allows the player to clear every ground gap", () => {
    for (const x of [450, 1100, 1780]) {
      let game = platformReducer({ ...start(), x }, { type: "jump" })
      for (let i = 0; i < 50; i++)
        game = platformReducer(game, { type: "tick", dt: 1 / 60, direction: 1 })
      assert.equal(game.lives, 3, `gap after ${x}`)
      assert.equal(game.grounded, true, `landing after ${x}`)
      assert.ok(game.x > x + 140)
    }
  })

  it("collects a coin only once", () => {
    let game = { ...start(), x: coins[0].x - 10 }
    game = platformReducer(game, { type: "tick", dt: 0.01, direction: 0 })
    game = platformReducer(game, { type: "tick", dt: 0.01, direction: 0 })
    assert.deepEqual(game.collected, [0])
  })

  it("saves checkpoints and restores position after falling", () => {
    const saved = platformReducer(
      { ...start(), x: 905 },
      { type: "tick", dt: 0.01, direction: 0 },
    )
    assert.equal(saved.checkpoint, 900)
    const fallen = platformReducer(
      { ...saved, x: 1190, y: 350, grounded: false },
      { type: "tick", dt: 0.01, direction: 0 },
    )
    assert.equal(fallen.x, 900)
    assert.equal(fallen.lives, 2)
  })

  it("stomps enemies from above but loses a life on a side collision", () => {
    const elapsed = 0.01
    const x = enemyX(0, elapsed) - 10
    const stomped = platformReducer(
      { ...start(), x, y: 196, vy: 250, grounded: false },
      { type: "tick", dt: elapsed, direction: 0 },
    )
    assert.deepEqual(stomped.defeated, [0])
    assert.ok(stomped.vy < 0)
    const hit = platformReducer(
      { ...start(), x },
      { type: "tick", dt: elapsed, direction: 0 },
    )
    assert.equal(hit.lives, 2)
  })

  it("wins at the flag and resets after game over", () => {
    const won = platformReducer(
      { ...start(), x: FLAG_X - 15 },
      { type: "tick", dt: 0.01, direction: 1 },
    )
    assert.equal(won.status, "won")
    const over = platformReducer(
      { ...start(), lives: 1, y: 350 },
      { type: "tick", dt: 0.01, direction: 0 },
    )
    assert.equal(over.status, "over")
    const fresh = platformReducer(over, { type: "start" })
    assert.equal(fresh.lives, 3)
    assert.equal(fresh.x, 42)
    assert.deepEqual(fresh.collected, [])
  })
})
