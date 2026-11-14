export type ArcadeProgress = {
  version: 1
  level: number
  best: number
  checkpoint: number
  completed: boolean
}
export const emptyProgress: ArcadeProgress = {
  version: 1,
  level: 1,
  best: 0,
  checkpoint: 0,
  completed: false,
}

export function parseProgress(raw: string | null): ArcadeProgress {
  try {
    const value = JSON.parse(raw ?? "null")
    if (
      value?.version !== 1 ||
      !Number.isInteger(value.level) ||
      value.level < 1 ||
      value.level > 3 ||
      !Number.isFinite(value.best) ||
      value.best < 0 ||
      value.best > 1e9 ||
      !Number.isInteger(value.checkpoint) ||
      value.checkpoint < 0 ||
      value.checkpoint > 2800 ||
      typeof value.completed !== "boolean"
    )
      return { ...emptyProgress }
    return {
      version: 1,
      level: value.level,
      best: value.best,
      checkpoint: value.checkpoint,
      completed: value.completed,
    }
  } catch {
    return { ...emptyProgress }
  }
}

export function mergeProgress(
  old: ArcadeProgress,
  update: Partial<Omit<ArcadeProgress, "version">>,
): ArcadeProgress {
  const level = Math.max(old.level, update.level ?? 1)
  const checkpoint =
    (update.level ?? old.level) < old.level
      ? old.checkpoint
      : level > old.level
        ? (update.checkpoint ?? 0)
        : Math.max(old.checkpoint, update.checkpoint ?? 0)
  return {
    version: 1,
    level,
    checkpoint,
    best: Math.max(old.best, update.best ?? 0),
    completed: old.completed || !!update.completed,
  }
}
