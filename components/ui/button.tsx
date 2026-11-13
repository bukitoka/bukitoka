import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-12 items-center justify-center gap-3 border px-6 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-action bg-action text-action-foreground hover:border-action-hover hover:bg-action-hover focus-visible:outline-action",
        outline: "border-border bg-transparent text-foreground hover:bg-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export function Button({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp className={cn(buttonVariants({ variant, className }))} {...props} />
  )
}
