import * as React from "react"

import { AppShell, ResponsiveContainer, SafeArea, SectionContainer } from "@/components/layout"
import { EmptyState, Heading } from "@/components/ui"

export default function AchievementsPage() {
  return (
    <AppShell>
      <SafeArea>
        <ResponsiveContainer>
          <SectionContainer className="min-h-dvh py-8">
            <Heading level={1}>Achievements</Heading>
            <EmptyState
              title="Achievements Coming Soon"
              description="Your achievement gallery will appear here in Sprint 5.2. Keep caring for Scan Chan!"
            />
          </SectionContainer>
        </ResponsiveContainer>
      </SafeArea>
    </AppShell>
  )
}
