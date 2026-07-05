"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Heading, Text } from "@/components/ui/typography"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-orange-50 to-amber-50 p-6">
      <div className="mx-auto grid max-w-md gap-6 rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="text-6xl">😿</div>
        <div className="grid gap-2">
          <Heading level={2}>Something went wrong</Heading>
          <Text tone="muted">Scan Chan encountered an unexpected problem. Don&apos;t worry, your progress is safe!</Text>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="rounded-xl bg-red-50 p-4 text-left text-sm">
            <summary className="cursor-pointer font-medium text-red-900">Error Details</summary>
            <pre className="mt-2 overflow-x-auto text-xs text-red-700">{error.message}</pre>
          </details>
        )}
        <Button onClick={reset} size="lg">
          Try Again
        </Button>
      </div>
    </div>
  )
}

export { ErrorBoundaryClass as ErrorBoundary }
