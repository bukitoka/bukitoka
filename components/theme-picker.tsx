"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { MotionConfig } from "motion/react"
import { ThemeProvider, useTheme } from "next-themes"
import { type ReactNode, useEffect, useState } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  )
}

export function ThemePicker() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <fieldset className="flex" aria-label="Color theme">
      {[
        { value: "light", Icon: Sun },
        { value: "dark", Icon: Moon },
        { value: "system", Icon: Monitor },
      ].map(({ value, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={`${value === "system" ? "Device" : value} theme`}
          title={`${value === "system" ? "Device" : value} theme`}
          className="grid size-11 place-items-center transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring data-[active=true]:bg-brand-300 data-[active=true]:text-brand-900"
          data-active={mounted && theme === value}
          aria-pressed={mounted && theme === value}
        >
          <Icon size={16} />
        </button>
      ))}
    </fieldset>
  )
}
