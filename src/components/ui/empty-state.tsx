import * as React from "react"

import { Heading, Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

function EmptyState({ className, title, description, action }: React.ComponentProps<"div"> & { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div data-slot="empty-state" role="status" className={cn("mx-auto grid max-w-sm place-items-center gap-3 py-10 text-center", className)}>
      <Heading level={3}>{title}</Heading>
      {description && <Text tone="muted">{description}</Text>}
      {action}
    </div>
  )
}

export { EmptyState }
