import * as React from "react"

import { cn } from "@/lib/utils"

function LoadingState({ className, label = "Loading" }: React.ComponentProps<"div"> & { label?: string }) {
  return (
    <div data-slot="loading-state" role="status" aria-live="polite" className={cn("flex min-h-24 items-center justify-center gap-3 text-sm text-muted-foreground", className)}>
      <span className="size-3 rounded-full bg-primary/70" />
      <span>{label}</span>
    </div>
  )
}

export { LoadingState }
