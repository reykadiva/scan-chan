import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusChipVariants = cva("inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-semibold", {
  variants: {
    tone: {
      neutral: "border-border bg-muted text-muted-foreground",
      warm: "border-amber-200 bg-amber-50 text-amber-900",
      good: "border-emerald-200 bg-emerald-50 text-emerald-900",
      attention: "border-orange-200 bg-orange-50 text-orange-900",
    },
  },
  defaultVariants: { tone: "neutral" },
})

function StatusChip({ className, tone, ...props }: React.ComponentProps<"span"> & VariantProps<typeof statusChipVariants>) {
  return <span data-slot="status-chip" className={cn(statusChipVariants({ tone }), className)} {...props} />
}

export { StatusChip, statusChipVariants }
