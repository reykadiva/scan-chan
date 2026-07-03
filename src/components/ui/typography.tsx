import * as React from "react"

import { cn } from "@/lib/utils"

function Heading({ className, level = 2, ...props }: React.ComponentProps<"h2"> & { level?: 1 | 2 | 3 | 4 }) {
  const Comp = `h${level}` as "h1" | "h2" | "h3" | "h4"

  return (
    <Comp
      data-slot="heading"
      className={cn(
        "text-balance font-heading font-semibold leading-tight text-foreground",
        level === 1 && "text-3xl sm:text-4xl",
        level === 2 && "text-2xl sm:text-3xl",
        level === 3 && "text-xl sm:text-2xl",
        level === 4 && "text-lg sm:text-xl",
        className,
      )}
      {...props}
    />
  )
}

function Text({ className, tone = "default", ...props }: React.ComponentProps<"p"> & { tone?: "default" | "muted" | "strong" }) {
  return (
    <p data-slot="text" className={cn("text-pretty text-sm leading-6", tone === "muted" && "text-muted-foreground", tone === "strong" && "font-semibold text-foreground", className)} {...props} />
  )
}

function LabelText({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="label-text" className={cn("text-xs font-semibold uppercase tracking-normal text-muted-foreground", className)} {...props} />
}

export { Heading, LabelText, Text }
