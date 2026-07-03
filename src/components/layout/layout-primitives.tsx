import * as React from "react"

import { cn } from "@/lib/utils"

function Stack({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stack" className={cn("flex flex-col gap-4", className)} {...props} />
}

function Cluster({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="cluster" className={cn("flex flex-wrap items-center gap-3", className)} {...props} />
}

function MobileGrid({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="mobile-grid" className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)} {...props} />
}

export { Cluster, MobileGrid, Stack }
