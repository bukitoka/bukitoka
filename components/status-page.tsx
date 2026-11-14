import { ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"
import { PlaneGame } from "@/components/plane-game"
import { ThemePicker } from "@/components/theme-picker"
import { Button } from "@/components/ui/button"

export function StatusPage({
  code,
  title,
  description,
  action,
}: {
  code: "404" | "500"
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-svh max-w-[1440px] flex-col px-4 sm:px-6 md:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-4 sm:py-5">
        <a
          href="/"
          aria-label="Kusuma home"
          className="flex items-center gap-3"
        >
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center bg-primary font-heading text-2xl text-primary-foreground"
          >
            k.
          </span>
          <span className="font-heading text-2xl tracking-tight sm:text-3xl">
            Kusuma
          </span>
        </a>
        <ThemePicker />
      </header>
      <main className="grid flex-1 items-center gap-8 py-12 md:grid-cols-2 md:gap-12 md:py-20">
        <div>
          <p className="mb-5 font-mono text-xs tracking-widest text-muted-foreground">
            {code} /{" "}
            {code === "404" ? "PAGE NOT FOUND" : "SOMETHING WENT WRONG"}
          </p>
          <h1 className="max-w-xl font-heading text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {action}
            <Button asChild variant={action ? "outline" : "default"}>
              <a href="/">
                Back to home <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </Button>
            {!action && (
              <Button asChild variant="outline">
                <a href="/#work">
                  See selected work{" "}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </Button>
            )}
          </div>
        </div>
        {code === "404" ? (
          <PlaneGame />
        ) : (
          <div
            aria-hidden="true"
            className="relative mx-auto w-full max-w-lg border border-border bg-card p-5 sm:p-8"
          >
            <svg aria-hidden="true" viewBox="0 0 420 260" className="w-full">
              <circle
                cx="210"
                cy="130"
                r="70"
                fill="none"
                strokeWidth="28"
                className="stroke-brand-400"
              />
              <path
                d="M110 59H48V123H77C130 123 132 201 72 201H36"
                fill="none"
                strokeWidth="22"
                className="stroke-foreground"
              />
              <circle
                cx="350"
                cy="130"
                r="47"
                fill="none"
                strokeWidth="22"
                className="stroke-foreground"
              />
              <rect
                x="260"
                y="40"
                width="30"
                height="30"
                className="fill-action"
              />
            </svg>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4 font-mono text-[10px] tracking-wider text-muted-foreground">
              <span>TIME FOR A RESET</span>
              <span className="size-3 bg-action" />
            </div>
          </div>
        )}
      </main>
      <footer className="border-t border-border py-5 text-sm text-muted-foreground">
        <a
          href="mailto:kusuma.jaya1512@gmail.com"
          className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
        >
          Need a hand? Email Kusuma.
        </a>
      </footer>
    </div>
  )
}
