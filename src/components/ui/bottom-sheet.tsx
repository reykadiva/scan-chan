"use client"

import * as React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

function BottomSheet({ ...props }: React.ComponentProps<typeof Dialog>) {
  return <Dialog {...props} />
}

function BottomSheetTrigger({ ...props }: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger {...props} />
}

function BottomSheetContent({ className, ...props }: React.ComponentProps<typeof DialogContent>) {
  return <DialogContent className={cn("top-auto bottom-0 left-1/2 max-h-[80dvh] translate-y-0 rounded-b-none rounded-t-[2rem] sm:max-w-md", className)} {...props} />
}

export { BottomSheet, BottomSheetContent, BottomSheetTrigger, DialogDescription as BottomSheetDescription, DialogHeader as BottomSheetHeader, DialogTitle as BottomSheetTitle }
