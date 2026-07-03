import * as React from "react"

import { cn } from "@/lib/utils"

function AppShell({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="app-shell" className={cn("min-h-dvh bg-background text-foreground", className)} {...props} />
}

export { AppShell }
