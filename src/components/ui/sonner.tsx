"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-emerald-600 shrink-0" strokeWidth={2.5} />
        ),
        info: (
          <InfoIcon className="size-5 text-[var(--theme-primary)] shrink-0" strokeWidth={2.5} />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-600 shrink-0" strokeWidth={2.5} />
        ),
        error: (
          <OctagonXIcon className="size-5 text-rose-600 shrink-0" strokeWidth={2.5} />
        ),
        loading: (
          <Loader2Icon className="size-5 text-[var(--theme-primary)] animate-spin shrink-0" strokeWidth={2.5} />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--theme-surface)",
          "--normal-text": "var(--theme-dark)",
          "--normal-border": "var(--theme-dark)",
          "--success-bg": "var(--theme-surface)",
          "--success-text": "var(--theme-dark)",
          "--success-border": "var(--theme-dark)",
          "--error-bg": "var(--theme-surface)",
          "--error-text": "var(--theme-dark)",
          "--error-border": "var(--theme-dark)",
          "--info-bg": "var(--theme-surface)",
          "--info-text": "var(--theme-dark)",
          "--info-border": "var(--theme-dark)",
          "--warning-bg": "var(--theme-surface)",
          "--warning-text": "var(--theme-dark)",
          "--warning-border": "var(--theme-dark)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: "var(--theme-surface)",
          border: "2px solid var(--theme-dark)",
          color: "var(--theme-dark)",
          boxShadow: "4px 4px 0px var(--theme-dark)",
          borderRadius: "12px",
        },
        classNames: {
          toast: "font-fredoka font-semibold border-2 border-[var(--theme-dark)] bg-[var(--theme-surface)] text-[var(--theme-dark)] shadow-[4px_4px_0px_var(--theme-dark)]",
          title: "font-fredoka text-[var(--theme-dark)] font-bold text-sm",
          description: "text-[var(--theme-dark)] font-medium text-xs opacity-85",
          actionButton: "bg-[var(--theme-primary)] text-white font-bold border-2 border-[var(--theme-dark)] shadow-[2px_2px_0px_var(--theme-dark)]",
          cancelButton: "bg-[var(--theme-surface-inner)] text-[var(--theme-dark)] font-bold border-2 border-[var(--theme-dark)]",
          closeButton: "bg-[var(--theme-surface)] text-[var(--theme-dark)] border-2 border-[var(--theme-dark)] hover:bg-[var(--theme-surface-inner)]",
          success: "!bg-[var(--theme-surface)] !text-[var(--theme-dark)] !border-2 !border-[var(--theme-dark)] !shadow-[4px_4px_0px_var(--theme-dark)]",
          info: "!bg-[var(--theme-surface)] !text-[var(--theme-dark)] !border-2 !border-[var(--theme-dark)] !shadow-[4px_4px_0px_var(--theme-dark)]",
          warning: "!bg-[var(--theme-surface)] !text-[var(--theme-dark)] !border-2 !border-[var(--theme-dark)] !shadow-[4px_4px_0px_var(--theme-dark)]",
          error: "!bg-[var(--theme-surface)] !text-[var(--theme-dark)] !border-2 !border-[var(--theme-dark)] !shadow-[4px_4px_0px_var(--theme-dark)]",
          ...props.toastOptions?.classNames,
        },
        ...props.toastOptions,
      }}
      {...props}
    />
  )
}

export { Toaster }
