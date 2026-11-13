"use client"

import { useSyncExternalStore } from "react"

function createMediaQueryStore(query: string) {
  return {
    subscribe(onChange: () => void) {
      const media = window.matchMedia(query)
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    getSnapshot() {
      return window.matchMedia(query).matches
    },
    getServerSnapshot() {
      return true
    },
  }
}

const reducedMotion = createMediaQueryStore("(prefers-reduced-motion: reduce)")

const limitedMotion = createMediaQueryStore(
  "(prefers-reduced-motion: reduce), (max-width: 767px), (hover: none)",
)

export function useReducedMotion() {
  return useSyncExternalStore(
    reducedMotion.subscribe,
    reducedMotion.getSnapshot,
    reducedMotion.getServerSnapshot,
  )
}

export function useLimitedMotion() {
  return useSyncExternalStore(
    limitedMotion.subscribe,
    limitedMotion.getSnapshot,
    limitedMotion.getServerSnapshot,
  )
}
