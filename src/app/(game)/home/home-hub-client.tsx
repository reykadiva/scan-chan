"use client"

import * as React from "react"

import { AppShell, Cluster, MobileGrid, ResponsiveContainer, SafeArea, SectionContainer, Stack } from "@/components/layout"
import { EmptyState, Heading, LoadingState, Panel, StatCard, StatusChip, Surface, Text } from "@/components/ui"
import { buildHomeHubViewModel } from "@/lib/home-hub"
import { useInventoryStore } from "@/stores/inventory-store"
import { usePetStore } from "@/stores/pet-store"
import { useProfileStore } from "@/stores/profile-store"
import { useScannerStore } from "@/stores/scanner-store"
import { useSettingsStore } from "@/stores/settings-store"
import type { HomeHubViewModel, MascotAnimationAdapterTarget } from "@/types"

const rendererTargets: readonly Extract<MascotAnimationAdapterTarget, "pixel-sprite-renderer" | "rive" | "live2d" | "spine">[] = [
  "pixel-sprite-renderer",
  "rive",
  "live2d",
  "spine",
]

export function HomeHubClient() {
  const pet = usePetStore()
  const scanner = useScannerStore()
  const inventory = useInventoryStore()
  const settings = useSettingsStore()
  const profile = useProfileStore()
  const now = getHomeHubSnapshotTime(pet.feedings, pet.memories)

  React.useEffect(() => {
    const petState = usePetStore.getState();
    const settingsState = useSettingsStore.getState();
    
    if (!petState.hasHydrated) {
      petState.setHydrated(true);
    }
    if (!settingsState.hasHydrated) {
      settingsState.setHydrated(true);
    }
    if (!petState.isInitialized) {
      petState.initialize();
    }
    if (!settingsState.isInitialized) {
      settingsState.initialize();
    }
  }, []);

  const viewModel = React.useMemo(
    () =>
      buildHomeHubViewModel({
        now,
        pet: {
          isInitialized: pet.isInitialized,
          hasHydrated: pet.hasHydrated,
          name: pet.name,
          stage: pet.stage,
          stats: {
            hunger: pet.hunger,
            mood: pet.mood,
            energy: pet.energy,
            affection: pet.affection,
            curiosity: pet.curiosity,
          },
          personality: pet.personality,
          memories: pet.memories,
          lifecycle: pet.lifecycle,
          status: pet.status,
          feedings: pet.feedings,
        },
        scanner: {
          isInitialized: scanner.isInitialized,
          scanState: scanner.scanState,
          lastBarcode: scanner.lastBarcode,
          errorMessage: scanner.errorMessage,
        },
        inventory: {
          isInitialized: inventory.isInitialized,
          itemCount: inventory.items.length,
        },
        settings: {
          isInitialized: settings.isInitialized,
          hasHydrated: settings.hasHydrated,
          reducedMotion: settings.reducedMotion,
        },
        profile: {
          isInitialized: profile.isInitialized,
          mode: profile.mode,
          nickname: profile.nickname,
        },
      }),
    [inventory, now, pet, profile, scanner, settings],
  )

  return <HomeHubScreen viewModel={viewModel} />
}

const getHomeHubSnapshotTime = (
  feedings: ReturnType<typeof usePetStore.getState>["feedings"],
  memories: ReturnType<typeof usePetStore.getState>["memories"],
) =>
  Math.max(
    0,
    ...feedings.map((feeding) => feeding.fedAt),
    ...memories.map((memory) => Date.parse(memory.createdAt)).filter(Number.isFinite),
  )

function HomeHubScreen({ viewModel }: { viewModel: HomeHubViewModel }) {
  return (
    <AppShell>
      <SafeArea>
        <ResponsiveContainer>
          <SectionContainer className="min-h-dvh">
            <main id="main-content">
              {viewModel.isLoading ? <LoadingState label="Scan Chan is settling in" /> : viewModel.isEmpty ? <HomeHubEmptyState /> : <HomeHubReady viewModel={viewModel} />}
            </main>
          </SectionContainer>
        </ResponsiveContainer>
      </SafeArea>
    </AppShell>
  )
}

function HomeHubReady({ viewModel }: { viewModel: HomeHubViewModel }) {
  return (
    <div aria-labelledby="home-hub-title" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <Stack className="gap-5">
        <GreetingSection viewModel={viewModel} />
        <MascotPlaceholder viewModel={viewModel} />
        <PetSummarySection viewModel={viewModel} />
      </Stack>
      <Stack className="gap-5">
        <RecommendationCard viewModel={viewModel} />
        <DailySummary viewModel={viewModel} />
        <StatusCards viewModel={viewModel} />
      </Stack>
    </div>
  )
}

function GreetingSection({ viewModel }: { viewModel: HomeHubViewModel }) {
  return (
    <header className="grid gap-2">
      <StatusChip tone="warm">{viewModel.greeting.replace("-", " ")}</StatusChip>
      <Heading id="home-hub-title" level={1}>
        {viewModel.pet?.name ?? "Scan Chan"} is here.
      </Heading>
      <Text tone="muted">A quiet room for checking in, seeing how your companion feels, and choosing the next gentle action.</Text>
    </header>
  )
}

function MascotPlaceholder({ viewModel }: { viewModel: HomeHubViewModel }) {
  const runtime = viewModel.mascotRuntime

  return (
    <Panel aria-label="Mascot display showing current emotion and animation state" className="grid min-h-[22rem] place-items-center p-5 sm:min-h-[28rem]">
      <div className="grid w-full max-w-md place-items-center gap-5 text-center">
        <div
          data-mascot-runtime-slot
          data-animation-intent={runtime?.animationIntent.name}
          data-expression={runtime?.expression}
          className="grid aspect-square w-44 place-items-center rounded-[2rem] border border-dashed border-primary/30 bg-primary/5 sm:w-56"
          role="img"
          aria-label={`${viewModel.pet?.name ?? "Pet"} is feeling ${runtime?.emotion ?? "content"} with ${runtime?.expression ?? "neutral"} expression`}
        >
          <span className="font-heading text-lg font-semibold" aria-hidden="true">Renderer attaches here</span>
        </div>
        <Stack className="items-center gap-2">
          <Text tone="strong">{runtime?.emotion ?? "content"} / {runtime?.expression ?? "neutral"}</Text>
          <Text tone="muted">Intent: {runtime?.animationIntent.name ?? "idle"} ({runtime?.animationIntent.intensity ?? "ambient"})</Text>
          <Cluster className="justify-center" role="list" aria-label="Available renderer targets">
            {rendererTargets.map((target) => (
              <StatusChip key={target} tone="neutral" data-renderer-target={target} role="listitem">
                {target}
              </StatusChip>
            ))}
          </Cluster>
        </Stack>
      </div>
    </Panel>
  )
}

function PetSummarySection({ viewModel }: { viewModel: HomeHubViewModel }) {
  const pet = viewModel.pet
  if (!pet) return null

  return (
    <section aria-labelledby="pet-summary-title" className="grid gap-3">
      <Heading id="pet-summary-title" level={2}>Pet summary</Heading>
      <MobileGrid>
        <StatCard label="Hunger" value={pet.stats.hunger} description={pet.status === "hungry" ? "Ready for a scan soon." : undefined} />
        <StatCard label="Mood" value={pet.stats.mood} />
        <StatCard label="Energy" value={pet.stats.energy} />
        <StatCard label="Affection" value={pet.stats.affection} />
        <StatCard label="Curiosity" value={pet.stats.curiosity} />
      </MobileGrid>
    </section>
  )
}

function RecommendationCard({ viewModel }: { viewModel: HomeHubViewModel }) {
  return (
    <Surface className="grid gap-3 p-5" aria-labelledby="recommendation-title">
      <Heading id="recommendation-title" level={3}>Next gentle action</Heading>
      <Text tone="strong">{viewModel.recommendedAction}</Text>
      <Text tone="muted">This is a ViewModel hint only. Future interactions attach here without moving care logic into the UI.</Text>
    </Surface>
  )
}

function DailySummary({ viewModel }: { viewModel: HomeHubViewModel }) {
  return (
    <Surface className="grid gap-3 p-5" aria-labelledby="daily-summary-title">
      <Heading id="daily-summary-title" level={3}>Today</Heading>
      <Cluster>
        <StatusChip tone="good">{viewModel.dailySummary.feedingsToday} feeds</StatusChip>
        <StatusChip tone="warm">{viewModel.dailySummary.memoriesToday} memories</StatusChip>
      </Cluster>
      <Text tone="muted">Last barcode: {viewModel.dailySummary.lastBarcode ?? "none yet"}</Text>
    </Surface>
  )
}

function StatusCards({ viewModel }: { viewModel: HomeHubViewModel }) {
  return (
    <section aria-labelledby="status-cards-title" className="grid gap-3">
      <Heading id="status-cards-title" level={3}>Room status</Heading>
      <Stack className="gap-3">
        {viewModel.statusCards.map((card) => (
          <Surface key={card.id} className="flex items-center justify-between gap-3 p-4">
            <Text tone="strong">{card.label}</Text>
            <StatusChip tone={card.state === "attention" ? "attention" : card.state === "ready" ? "good" : "neutral"}>{card.value}</StatusChip>
          </Surface>
        ))}
      </Stack>
    </section>
  )
}

function HomeHubEmptyState() {
  return (
    <div aria-labelledby="home-empty-title" className="grid min-h-[70dvh] place-items-center">
      <EmptyState
        title="A quiet room is ready."
        description="Scan Chan has a place to appear once setup initializes the pet state. Nothing is broken; this is the first calm empty state."
      />
    </div>
  )
}
