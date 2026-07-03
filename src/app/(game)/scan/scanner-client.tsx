"use client"

import { useEffect, useRef, useState } from "react"
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
import {
  createBrowserCameraAdapter,
  createCameraSessionCoordinator,
  selectBarcodeDecoder,
  createBarcodeDetectorDecoder,
  createZXingDecoder,
  decodeBarcodeWithFallback,
  applyBarcodeScanGuard,
  decodeBarcodeFromVideo,
} from "@/lib/scanner"
import type { BrowserCameraAdapter, BrowserCameraDeviceModel, CameraSessionCoordinator } from "@/types/scanner"

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
  const {
    permissionState,
    scanState,
    errorMessage,
    lastBarcode,
    setPermissionState,
    setScanState,
    setLastBarcode,
    setErrorMessage,
    reset,
  } = useScannerStore()

  const [devices, setDevices] = useState<readonly BrowserCameraDeviceModel[]>([])
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState<number>(-1)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const adapterRef = useRef<BrowserCameraAdapter | null>(null)
  const coordinatorRef = useRef<CameraSessionCoordinator | null>(null)
  const lastScannedAtRef = useRef<number | null>(null)
  const decodingLoopRef = useRef<NodeJS.Timeout | null>(null)

  const blocked = permissionState === "denied"
  const unavailable = errorMessage === "camera-unavailable"
  const loading = scanState === "requesting-permission"

  // Initialize camera adapter and list devices
  useEffect(() => {
    let active = true
    const initAdapter = async () => {
      try {
        const adapter = createBrowserCameraAdapter()
        adapterRef.current = adapter
        const enumerated = await adapter.enumerateDevices()
        if (active) {
          setDevices(enumerated)
          if (enumerated.length > 0) {
            setCurrentDeviceIndex(0)
          }
        }
      } catch (err) {
        console.error("Failed to list camera devices:", err)
        if (active) {
          setErrorMessage("camera-unavailable")
        }
      }
    }

    void initAdapter()

    return () => {
      active = false
      if (decodingLoopRef.current) {
        clearTimeout(decodingLoopRef.current)
      }
      if (coordinatorRef.current) {
        void coordinatorRef.current.shutdown(Date.now())
      }
    }
  }, [setErrorMessage])

  // Start camera helper
  const startCamera = async (deviceId?: string) => {
    if (!adapterRef.current) return
    try {
      setScanState("requesting-permission")
      setPermissionState("prompt")

      if (deviceId) {
        await adapterRef.current.createStream({ deviceId, now: Date.now() })
      }

      const session = adapterRef.current.createSession({
        id: "scanner-session-" + Date.now(),
        now: Date.now(),
        facingMode: "environment",
      })

      const coordinator = createCameraSessionCoordinator({
        adapter: adapterRef.current,
        session,
        permission: "granted",
      })
      coordinatorRef.current = coordinator

      await coordinator.warmUp(Date.now())
      await coordinator.start(Date.now())

      const stream = adapterRef.current.getStream()
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream
        setPermissionState("granted")
        setScanState("scanning")
        setErrorMessage(null)
      } else {
        throw new Error("Could not acquire browser camera stream.")
      }
    } catch (err: unknown) {
      console.error("Camera start error:", err)
      setPermissionState("denied")
      setScanState("error")
      const message = err instanceof Error ? err.message : "Camera access was denied or failed."
      setErrorMessage(message)
    }
  }

  // Handle manual/re-request trigger
  const handleRequestCamera = () => {
    const targetDevice = devices[currentDeviceIndex]
    void startCamera(targetDevice?.deviceId)
  }

  // Switch camera toggle
  const handleSwitchCamera = async () => {
    if (devices.length <= 1 || !adapterRef.current) return
    const nextIndex = (currentDeviceIndex + 1) % devices.length
    setCurrentDeviceIndex(nextIndex)

    const nextDevice = devices[nextIndex]
    if (scanState === "scanning" && coordinatorRef.current) {
      // Shutdown current and start new
      await coordinatorRef.current.shutdown(Date.now())
      void startCamera(nextDevice.deviceId)
    }
  }

  // Decoding loop
  useEffect(() => {
    const loop = async () => {
      if (scanState !== "scanning" || !videoRef.current || !adapterRef.current) return

      const video = videoRef.current
      if (video.readyState >= 2 && video.videoWidth > 0) {
        const now = Date.now()
        const frame = await adapterRef.current.readFrame(now)

        const barcodeDetector = createBarcodeDetectorDecoder({
          detect: async () => {
            interface BarcodeDetectorInstance {
              detect: (source: HTMLVideoElement) => Promise<readonly { rawValue: string; format: string }[]>;
            }
            if (typeof window !== "undefined" && "BarcodeDetector" in window) {
              try {
                const DetectorClass = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => BarcodeDetectorInstance }).BarcodeDetector
                const detectorInstance = new DetectorClass({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "qr_code"] })
                const results = await detectorInstance.detect(video)
                return results.map((r) => ({ rawValue: r.rawValue, format: r.format }))
              } catch (e) {
                console.debug("Native BarcodeDetector failed, falling back:", e)
              }
            }
            return []
          },
        })

        const zxingDecoder = createZXingDecoder(async () => {
          return decodeBarcodeFromVideo(video)
        })

        const selected = selectBarcodeDecoder({ barcodeDetector, zxing: zxingDecoder })

        try {
          const decoded = await decodeBarcodeWithFallback({ frame, selected, now })
          if (decoded && !("code" in decoded)) {
            const guarded = applyBarcodeScanGuard(decoded, {
              lastValue: lastBarcode,
              lastScannedAt: lastScannedAtRef.current,
              cooldownMs: 2000,
            })

            if (guarded && !("code" in guarded)) {
              lastScannedAtRef.current = guarded.decodedAt
              // Sprint 3.8: Mock success - log and save barcode value
              console.log("Decoded barcode successfully:", guarded.value)
              setLastBarcode(guarded.value)
              setScanState("success")
              return
            }
          }
        } catch (error) {
          console.debug("Frame decode attempt yielded no results:", error)
        }
      }

      decodingLoopRef.current = setTimeout(loop, 300)
    }

    if (scanState === "scanning") {
      decodingLoopRef.current = setTimeout(loop, 300)
    }

    return () => {
      if (decodingLoopRef.current) {
        clearTimeout(decodingLoopRef.current)
      }
    }
  }, [scanState, lastBarcode, setLastBarcode, setScanState])

  const handleReset = () => {
    if (coordinatorRef.current) {
      void coordinatorRef.current.shutdown(Date.now())
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    reset()
  }

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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,166,35,0.2),transparent_34%),linear-gradient(135deg,rgba(34,211,238,0.16),transparent_45%)] animate-pulse" />
                  
                  {(scanState === "scanning" || scanState === "ready") && (
                    <video
                      ref={videoRef}
                      className="absolute inset-0 h-full w-full object-cover"
                      playsInline
                      muted
                      autoPlay
                    />
                  )}

                  <ScannerFrame state={scanState} />

                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3 z-10">
                    <StatusChip tone={scanState === "error" || blocked ? "attention" : scanState === "success" ? "good" : "warm"}>
                      {scannerStates[scanState]}
                    </StatusChip>
                    <Cluster>
                      <IconButton
                        label="Switch camera"
                        variant="outline"
                        onClick={handleSwitchCamera}
                        disabled={devices.length <= 1}
                      >
                        <RefreshCw className="size-4" />
                      </IconButton>
                      <IconButton label="Flash placeholder" variant="outline" disabled>
                        <Flashlight className="size-4" />
                      </IconButton>
                    </Cluster>
                  </div>
                  <div className="absolute inset-x-4 bottom-4 z-10">
                    <StatusPanel blocked={blocked} loading={loading} unavailable={unavailable} errorMessage={errorMessage} />
                  </div>
                </div>
              </SectionContainer>

              <aside className="rounded-[1.5rem] bg-white/80 p-4 shadow-sm" aria-label="Scanner controls">
                <Stack>
                  <div>
                    <Heading id="scanner-title" level={2} className="text-lg">Camera Controls</Heading>
                    <Text tone="muted" className="text-sm">Start scanning or toggle settings below.</Text>
                  </div>
                  <Button onClick={handleRequestCamera} disabled={scanState === "scanning"}>
                    <Camera className="size-4" />
                    Start Camera
                  </Button>
                  <Button variant="outline" onClick={() => { setPermissionState("granted"); setScanState("scanning"); setErrorMessage(null) }}>
                    Force Scan Mode
                  </Button>
                  <Button variant="outline" onClick={() => setScanState("success")}>Success Mock</Button>
                  <Button variant="outline" onClick={() => { setScanState("error"); setErrorMessage("Try moving the item into softer light.") }}>
                    Failure Mock
                  </Button>
                  <Button variant="ghost" onClick={handleReset}>Reset Scanner</Button>
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
    <div className="absolute inset-0 grid place-items-center p-6 pointer-events-none">
      <div className="relative aspect-[4/3] w-full max-w-xl rounded-[1.5rem] border border-white/15 bg-black/20">
        {["left-4 top-4 border-l-4 border-t-4", "right-4 top-4 border-r-4 border-t-4", "bottom-4 left-4 border-b-4 border-l-4", "bottom-4 right-4 border-b-4 border-r-4"].map((corner) => (
          <span key={corner} className={cn("absolute size-12 rounded-sm border-brand-cyan", corner)} />
        ))}
        <div className="absolute inset-x-8 top-1/2 h-px bg-brand-cyan/70 animate-pulse" />
        <div className="absolute inset-0 grid place-items-center text-center">
          <Stack className="max-w-xs items-center gap-2 text-white">
            <ScanLine className="size-10 opacity-80" />
            <Text className="text-white">
              {state === "scanning" ? "Align barcode inside the frame" : "Camera stream will display here"}
            </Text>
          </Stack>
        </div>
      </div>
    </div>
  )
}

function StatusPanel({ blocked, loading, unavailable, errorMessage }: { blocked: boolean; loading: boolean; unavailable: boolean; errorMessage: string | null }) {
  if (loading) return <LoadingState className="rounded-2xl bg-white/90" label="Requesting camera access..." />
  if (blocked) return <EmptyState className="rounded-2xl bg-white/90 py-6" title="Camera blocked" description="Please allow camera access in your browser settings to scan barcodes." />
  if (unavailable) return <EmptyState className="rounded-2xl bg-white/90 py-6" title="Camera unavailable" description="We couldn't detect any video capture devices." />
  if (errorMessage) return <EmptyState className="rounded-2xl bg-white/90 py-6" title="Scan failed" description={errorMessage} />

  return (
    <div className="rounded-2xl bg-white/90 p-4 text-center shadow-sm" role="status" aria-live="polite">
      <Text className="font-semibold">Ready to scan!</Text>
      <Text tone="muted" className="text-sm">Align any product barcode to feed Scan Chan.</Text>
    </div>
  )
}
