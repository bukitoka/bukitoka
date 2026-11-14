import assert from "node:assert/strict"
import { it } from "node:test"
import {
  emptyProgress,
  mergeProgress,
  parseProgress,
} from "../lib/arcade-progress"

it("rejects malformed, old, or out-of-range progress", () => {
  for (const raw of [
    null,
    "bad json",
    "{}",
    '{"version":0}',
    JSON.stringify({ ...emptyProgress, level: 9 }),
    JSON.stringify({ ...emptyProgress, best: -1 }),
  ])
    assert.deepEqual(parseProgress(raw), emptyProgress)
  assert.deepEqual(
    parseProgress(
      JSON.stringify({
        ...emptyProgress,
        level: 3,
        checkpoint: 2360,
        best: 12,
      }),
    ),
    { ...emptyProgress, level: 3, checkpoint: 2360, best: 12 },
  )
})

it("keeps higher achievements on replay but resets the checkpoint for a new world", () => {
  const saved = { ...emptyProgress, level: 2, best: 30, checkpoint: 2050 }
  assert.deepEqual(
    mergeProgress(saved, { level: 1, best: 3, checkpoint: 42 }),
    saved,
  )
  assert.equal(
    mergeProgress(saved, { level: 3, checkpoint: 42 }).checkpoint,
    42,
  )
  assert.equal(
    mergeProgress({ ...saved, completed: true }, { completed: false })
      .completed,
    true,
  )
})
