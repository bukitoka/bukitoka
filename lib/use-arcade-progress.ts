"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  type ArcadeProgress,
  emptyProgress,
  mergeProgress,
  parseProgress,
} from "@/lib/arcade-progress"

export function useArcadeProgress(
  game: "jump" | "racing" | "snake" | "flight",
) {
  const key = `bukitoka.arcade.${game}.v1`
  const [progress, setProgress] = useState<ArcadeProgress>({ ...emptyProgress })
  const current = useRef<ArcadeProgress>({ ...emptyProgress })
  const loaded = useRef(false)

  useEffect(() => {
    try {
      current.current = parseProgress(localStorage.getItem(key))
    } catch {
      current.current = { ...emptyProgress }
    }
    loaded.current = true
    setProgress(current.current)
  }, [key])

  const save = useCallback(
    (update: Partial<Omit<ArcadeProgress, "version">>) => {
      if (!loaded.current) return
      let existing = current.current
      try {
        existing = mergeProgress(
          existing,
          parseProgress(localStorage.getItem(key)),
        )
      } catch {
        /* Keep the in-memory progress if storage cannot be read. */
      }
      const next = mergeProgress(existing, update)
      if (JSON.stringify(next) === JSON.stringify(current.current)) return
      current.current = next
      setProgress(next)
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* Progress remains available for this visit when storage is blocked. */
      }
    },
    [key],
  )

  return { progress, save }
}
