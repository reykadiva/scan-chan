import * as React from "react"

import { cn } from "@/lib/utils"

function ProgressBar({ className, value, max = 100, label }: React.ComponentProps<"div"> & { value: number; max?: number; label?: string }) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  return (
    <div data-slot="progress-bar" className={cn("w-full", className)}>
      {label && <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>}
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export { ProgressBar }
