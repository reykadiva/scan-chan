import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-fredoka font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand-cyan text-white hover:brightness-110 active:translate-y-[2px] shadow-[0_4px_0_-1px_rgba(0,0,0,0.05),_0_8px_15px_-5px_rgba(0,0,0,0.1),_inset_0_-3px_0_0_rgba(0,0,0,0.15),_inset_0_2px_0_0_rgba(255,255,255,0.4)] active:shadow-[0_2px_0_-1px_rgba(0,0,0,0.05),_0_4px_6px_-3px_rgba(0,0,0,0.1),_inset_0_-2px_0_0_rgba(0,0,0,0.15),_inset_0_2px_0_0_rgba(255,255,255,0.4)]",
        outline:
          "border-2 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 active:translate-y-[2px] shadow-[0_4px_0_-1px_rgba(0,0,0,0.05)] active:shadow-[0_1px_0_-1px_rgba(0,0,0,0.05)] text-slate-700",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-brand-pink text-white hover:brightness-110 active:translate-y-[2px] shadow-[0_4px_0_-1px_rgba(0,0,0,0.05),_0_8px_15px_-5px_rgba(0,0,0,0.1),_inset_0_-3px_0_0_rgba(0,0,0,0.15),_inset_0_2px_0_0_rgba(255,255,255,0.4)] active:shadow-[0_2px_0_-1px_rgba(0,0,0,0.05),_0_4px_6px_-3px_rgba(0,0,0,0.1),_inset_0_-2px_0_0_rgba(0,0,0,0.15),_inset_0_2px_0_0_rgba(255,255,255,0.4)]",
        link: "text-brand-cyan underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-8 gap-1.5 rounded-full px-3 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-full px-4 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 rounded-full px-8 text-base has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
        icon: "size-10 rounded-full",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
