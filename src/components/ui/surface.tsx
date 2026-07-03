import * as React from "react"

import { cn } from "@/lib/utils"

function Surface({ className, interactive = false, ...props }: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      data-slot="surface"
      data-interactive={interactive}
      className={cn("rounded-3xl border border-white/70 bg-card text-card-foreground shadow-[0_12px_30px_-18px_rgba(45,38,32,0.30)]", interactive && "transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-20px_rgba(45,38,32,0.35)]", className)}
      {...props}
    />
  )
}

function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="panel" className={cn("rounded-[2rem] border border-border/70 bg-card/95 p-5 shadow-[0_18px_48px_-32px_rgba(45,38,32,0.35)] sm:p-6", className)} {...props} />
}

export { Panel, Surface }
