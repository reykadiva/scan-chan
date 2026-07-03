import * as React from "react"

import { cn } from "@/lib/utils"

function SrOnly({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="sr-only" className={cn("sr-only", className)} {...props} />
}

function LiveRegion({ className, politeness = "polite", ...props }: React.ComponentProps<"div"> & { politeness?: "polite" | "assertive" }) {
  return <div data-slot="live-region" aria-live={politeness} className={cn("sr-only", className)} {...props} />
}

export { LiveRegion, SrOnly }
