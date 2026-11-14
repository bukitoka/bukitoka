import type { MouseEvent } from "react"

export function preventGameContextMenu(event: MouseEvent<HTMLElement>) {
  if (window.matchMedia("(pointer: coarse), (max-width: 767px)").matches)
    event.preventDefault()
}
