import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  createSnakeGame,
  placeFood,
  snakeReducer,
  stepSnake,
} from "../lib/snake"

describe("Snake Xenzia rules", () => {
  it("does not move before starting or while paused", () => {
    const ready = createSnakeGame()
    assert.equal(stepSnake(ready), ready)
    const paused = snakeReducer(snakeReducer(ready, { type: "start" }), {
      type: "pause",
    })
    assert.equal(stepSnake(paused), paused)
  })
  it("moves, eats, grows, and keeps the best score on restart", () => {
    let game = snakeReducer(createSnakeGame(), { type: "start" })
    for (let i = 0; i < 4; i++) game = stepSnake(game, () => 0)
    assert.equal(game.score, 1)
    assert.equal(game.snake.length, 4)
    assert.equal(game.best, 1)
    assert.equal(game.snake.includes(game.food ?? -1), false)
    const restarted = snakeReducer(game, { type: "restart" })
    assert.equal(restarted.score, 0)
    assert.equal(restarted.best, 1)
    assert.equal(restarted.status, "running")
  })
  it("rejects reverse direction and more than one turn per tick", () => {
    const game = snakeReducer(createSnakeGame(), { type: "start" })
    assert.equal(snakeReducer(game, { type: "turn", direction: "left" }), game)
    const up = snakeReducer(game, { type: "turn", direction: "up" })
    assert.equal(snakeReducer(up, { type: "turn", direction: "left" }), up)
    const next = stepSnake(up)
    assert.equal(next.direction, "up")
    assert.equal(next.queued, null)
    assert.equal(next.snake[0], game.snake[0] - BOARD_WIDTH)
  })
  it("ends at the wall instead of wrapping to another row", () => {
    const game = {
      ...createSnakeGame(),
      snake: [BOARD_WIDTH - 1, BOARD_WIDTH - 2, BOARD_WIDTH - 3],
      status: "running" as const,
    }
    assert.equal(stepSnake(game).status, "over")
  })
  it("ends when hitting its body", () => {
    const game = {
      ...createSnakeGame(),
      snake: [
        BOARD_WIDTH + 1,
        BOARD_WIDTH + 2,
        2 * BOARD_WIDTH + 2,
        2 * BOARD_WIDTH + 1,
        2 * BOARD_WIDTH,
        BOARD_WIDTH,
      ],
      direction: "left" as const,
      queued: "down" as const,
      status: "running" as const,
      food: 200,
    }
    assert.equal(stepSnake(game).status, "over")
  })
  it("allows moving into the cell the tail is leaving", () => {
    const game = {
      ...createSnakeGame(),
      snake: [
        BOARD_WIDTH + 1,
        BOARD_WIDTH + 2,
        2 * BOARD_WIDTH + 2,
        2 * BOARD_WIDTH + 1,
      ],
      direction: "left" as const,
      queued: "down" as const,
      status: "running" as const,
      food: 200,
    }
    const next = stepSnake(game)
    assert.equal(next.status, "running")
    assert.deepEqual(next.snake, [
      2 * BOARD_WIDTH + 1,
      BOARD_WIDTH + 1,
      BOARD_WIDTH + 2,
      2 * BOARD_WIDTH + 2,
    ])
  })
  it("places food only in free cells and finishes on a full board", () => {
    const full = Array.from(
      { length: BOARD_WIDTH * BOARD_HEIGHT },
      (_, cell) => cell,
    )
    assert.equal(placeFood(full), null)
    assert.equal(
      placeFood(full.slice(1), () => 0.99),
      0,
    )
    const game = {
      ...createSnakeGame(),
      snake: [0, ...full.slice(2)],
      food: 1,
      status: "running" as const,
    }
    const next = stepSnake(game)
    assert.equal(next.status, "won")
    assert.equal(next.food, null)
    assert.equal(next.snake.length, BOARD_WIDTH * BOARD_HEIGHT)
  })
})

it("spawns a timed special circle every third food and rewards it with a slow-down", () => {
  const ready = createSnakeGame()
  const base = {
    ...ready,
    status: "running" as const,
    eaten: 2,
    food: ready.snake[0] + 1,
  }
  const spawned = stepSnake(base, () => 0)
  assert.notEqual(spawned.bonus, null)
  assert.ok(!spawned.snake.includes(spawned.bonus ?? -1))
  assert.notEqual(spawned.food, spawned.bonus)
  const ahead = spawned.snake[0] + 1
  const eaten = stepSnake({ ...spawned, bonus: ahead, food: 0 }, () => 0)
  assert.equal(eaten.score, spawned.score + 3)
  assert.equal(eaten.slowTicks, 40)
  assert.equal(eaten.bonus, null)
  assert.equal(stepSnake({ ...spawned, bonusTicks: 1 }).bonus, null)
  const higher = stepSnake({ ...base, eaten: 4 }, () => 0)
  assert.equal(higher.level, 2)
})
