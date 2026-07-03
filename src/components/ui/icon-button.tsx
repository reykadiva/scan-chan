import * as React from "react"

import { Button } from "@/components/ui/button"

function IconButton({ children, label, ...props }: Omit<React.ComponentProps<typeof Button>, "size"> & { label: string }) {
  return (
    <Button aria-label={label} size="icon" {...props}>
      {children}
      <span className="sr-only">{label}</span>
    </Button>
  )
}

export { IconButton }
