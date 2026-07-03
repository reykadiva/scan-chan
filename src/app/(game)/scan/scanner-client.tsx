"use client"

import { Camera, Flashlight, RefreshCw, ScanLine, X } from "lucide-react"
import Link from "next/link"

import { AppShell } from "@/components/layout/app-shell"
import { Cluster, Stack } from "@/components/layout/layout-primitives"
import { ResponsiveContainer, SafeArea, SectionContainer } from "@/components/layout/containers"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { IconButton } from "@/components/ui/icon-button"
import { LoadingState } from "@/components/ui/loading-state"
import { StatusChip } from "@/components/ui/status-chip"
import { Heading, Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import { useScannerStore } from "@/stores/scanner-store"

const scannerStates = {
  idle: "Ready",
  "requesting-permission": "Permission",
  ready: "Camera ready",
  scanning: "Scanning",
  paused: "Paused",
  success: "Scan found",
  error: "Needs attention",
} as const

export function ScannerClient() {
  const { permissionState, scanState, errorMessage, setPermissionState, setScanState, setErrorMessage, reset } = useScannerStore()
  const blocked = permissionState === "denied"
  const unavailable = errorMessage === "camera-unavailable"
  const loading = scanState === "requesting-permission"

  return (
    <AppShell className="bg-[#FFF8F0]">
      <SafeArea>
        <ResponsiveContainer className="min-h-dvh py-4 sm:py-6">
          <Stack className="min-h-[calc(100dvh-2rem)] gap-4">
            <header className="flex items-center justify-between gap-3">
              <Cluster>
                <div className="grid size-11 place-items-center rounded-2xl bg-white text-brand-cyan shadow-sm" aria-hidden="true">
                  <ScanLine className="size-5" />
                </div>
                <div>
                  <Heading level={1} className="text-xl sm:text-2xl">Scanner</Heading>
                  <Text tone="muted" className="text-sm">Offer Scan Chan a real-world find.</Text>
                </div>
              </Cluster>
              <Button asChild aria-label="Close scanner" variant="outline" size="icon">
                <Link href="/home">
                  <X className="size-4" />
                  <span className="sr-only">Close scanner</span>
                </Link>
              </Button>
            </header>

            <main className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]" aria-labelledby="scanner-title">
              <SectionContainer className="py-0">
                <div className="relative min-h-[62dvh] overflow-hidden rounded-[2rem] bg-[#1A1625] shadow-xl" aria-label="Camera preview placeholder">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,166,35,0.2),transparent_34%),linear-gradient(135deg,rgba(34,211,238,0.16),transparent_45%)]" />
                  <ScannerFrame state={scanState} />
                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
                    <StatusChip tone={scanState === "error" || blocked ? "attention" : scanState === "success" ? "good" : "warm"}>
                      {scannerStates[scanState]}
                    </StatusChip>
                    <Cluster>
                      <IconButton label="Switch camera" variant="outline" onClick={() => setScanState("ready")}>
                        <RefreshCw className="size-4" />
                      </IconButton>
                      <IconButton label="Flash placeholder" variant="outline" disabled>
                        <Flashlight className="size-4" />
                      </IconButton>
                    </Cluster>
                  </div>
                  <div className="absolute inset-x-4 bottom-4">
                    <StatusPanel blocked={blocked} loading={loading} unavailable={unavailable} errorMessage={errorMessage} />
                  </div>
                </div>
              </SectionContainer>

              <aside className="rounded-[1.5rem] bg-white/80 p-4 shadow-sm" aria-label="Scanner controls">
                <Stack>
                  <div>
                    <Heading id="scanner-title" level={2} className="text-lg">Camera check</Heading>
                    <Text tone="muted" className="text-sm">This screen is a UI foundation. Live camera and decoding connect through the scanner stack.</Text>
                  </div>
                  <Button onClick={() => { setPermissionState("prompt"); setScanState("requesting-permission") }}>
                    <Camera className="size-4" />
                    Request camera
                  </Button>
                  <Button variant="outline" onClick={() => { setPermissionState("granted"); setScanState("scanning"); setErrorMessage(null) }}>
                    Preview ready
                  </Button>
                  <Button variant="outline" onClick={() => setScanState("success")}>Success placeholder</Button>
                  <Button variant="outline" onClick={() => { setScanState("error"); setErrorMessage("Try moving the item into softer light.") }}>
                    Failure placeholder
                  </Button>
                  <Button variant="ghost" onClick={reset}>Reset scanner</Button>
                </Stack>
              </aside>
            </main>
          </Stack>
        </ResponsiveContainer>
      </SafeArea>
    </AppShell>
  )
}

function ScannerFrame({ state }: { state: keyof typeof scannerStates }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-6">
      <div className="relative aspect-[4/3] w-full max-w-xl rounded-[1.5rem] border border-white/15 bg-black/20">
        {["left-4 top-4 border-l-4 border-t-4", "right-4 top-4 border-r-4 border-t-4", "bottom-4 left-4 border-b-4 border-l-4", "bottom-4 right-4 border-b-4 border-r-4"].map((corner) => (
          <span key={corner} className={cn("absolute size-12 rounded-sm border-brand-cyan", corner)} />
        ))}
        <div className="absolute inset-x-8 top-1/2 h-px bg-brand-cyan/70" />
        <div className="absolute inset-0 grid place-items-center text-center">
          <Stack className="max-w-xs items-center gap-2 text-white">
            <ScanLine className="size-10 opacity-80" />
            <Text className="text-white">{state === "scanning" ? "Hold steady near the barcode." : "Camera preview attaches here."}</Text>
          </Stack>
        </div>
      </div>
    </div>
  )
}

function StatusPanel({ blocked, loading, unavailable, errorMessage }: { blocked: boolean; loading: boolean; unavailable: boolean; errorMessage: string | null }) {
  if (loading) return <LoadingState className="rounded-2xl bg-white/90" label="Asking for camera access" />
  if (blocked) return <EmptyState className="rounded-2xl bg-white/90 py-6" title="Camera is blocked" description="Allow camera access when you are ready to scan." />
  if (unavailable) return <EmptyState className="rounded-2xl bg-white/90 py-6" title="Camera unavailable" description="You can still continue later with manual barcode entry." />
  if (errorMessage) return <EmptyState className="rounded-2xl bg-white/90 py-6" title="Scan needs another try" description={errorMessage} />

  return (
    <div className="rounded-2xl bg-white/90 p-4 text-center shadow-sm" role="status" aria-live="polite">
      <Text className="font-semibold">Ready when you are.</Text>
      <Text tone="muted" className="text-sm">No product processing happens in this foundation screen.</Text>
    </div>
  )
}
