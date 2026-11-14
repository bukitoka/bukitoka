"use client"

import ErrorPage from "@/app/error"
import { display, fixel } from "@/app/fonts"
import { Providers } from "@/components/theme-picker"
import "@fontsource/jetbrains-mono/400.css"
import "./globals.css"

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  return (
    <html
      lang="en"
      className={`${fixel.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <ErrorPage error={error} retry={retry} />
        </Providers>
      </body>
    </html>
  )
}
