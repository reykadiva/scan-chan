import * as React from "react"

import { ProgressBar } from "@/components/ui/progress-bar"
import { Surface } from "@/components/ui/surface"
import { LabelText, Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

function StatCard({ className, label, value, description }: React.ComponentProps<"div"> & { label: string; value: number; description?: string }) {
  return (
    <Surface data-slot="stat-card" className={cn("grid gap-3 p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <LabelText>{label}</LabelText>
        <span className="font-heading text-xl font-semibold tabular-nums">{value}</span>
      </div>
      <ProgressBar value={value} />
      {description && <Text tone="muted">{description}</Text>}
    </Surface>
  )
}

export { StatCard }
