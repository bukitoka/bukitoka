import { useId } from "react"

export function GridBackground() {
  const gridId = useId()

  return (
    <div
      aria-hidden="true"
      data-grid-background
      className="pointer-events-none fixed inset-0 -z-10 select-none overflow-hidden text-brand-600/10 dark:text-brand-300/8"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id={gridId}
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 H 0 V 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridId})`} />
        <g fill="currentColor" opacity="0.35">
          <rect x="128" y="128" width="64" height="64" />
          <rect x="832" y="320" width="64" height="64" />
          <rect x="1152" y="640" width="64" height="64" />
        </g>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-brand-500/40 dark:text-brand-300/25"
        >
          <path
            data-grid-trace
            d="M 0 192 H 384 V 448 H 768"
            strokeDasharray="96 1440"
            className="opacity-0 motion-safe:md:animate-grid-trace"
          />
          <path
            data-grid-trace
            d="M 1408 0 V 256 H 1024 V 704 H 1280"
            strokeDasharray="96 1440"
            className="opacity-0 motion-safe:md:animate-grid-trace [animation-delay:-12s]"
          />
        </g>
      </svg>
    </div>
  )
}
