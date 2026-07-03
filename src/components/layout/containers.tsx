import * as React from "react"

import { cn } from "@/lib/utils"

function ResponsiveContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="responsive-container" className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />
}

function SectionContainer({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="section-container" className={cn("py-6 sm:py-8", className)} {...props} />
}

function SafeArea({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="safe-area" className={cn("px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))]", className)} {...props} />
}

export { ResponsiveContainer, SafeArea, SectionContainer }
