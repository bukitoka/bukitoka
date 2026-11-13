import type { ReactNode } from "react"

export function SectionLabel({
  number,
  children,
}: {
  number: string
  children: ReactNode
}) {
  return (
    <div className="mb-6 flex items-start gap-3 md:mb-10 font-mono text-[11px] uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.16em]">
      <span className="text-muted-foreground">{number}</span>
      <span>{children}</span>
      <span aria-hidden="true" className="mt-2 h-px min-w-6 flex-1 bg-border" />
    </div>
  )
}
