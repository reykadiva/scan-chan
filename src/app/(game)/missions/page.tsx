import * as React from "react"

import { AppShell, ResponsiveContainer, SafeArea, SectionContainer } from "@/components/layout"
import { EmptyState, Heading } from "@/components/ui"

export default function MissionsPage() {
  return (
    <AppShell>
      <SafeArea>
        <ResponsiveContainer>
          <SectionContainer className="min-h-dvh py-8">
            <Heading level={1}>Daily Missions</Heading>
            <EmptyState
              title="Missions Coming Soon"
              description="Your daily care missions will appear here in Sprint 5.3. Check back soon!"
            />
          </SectionContainer>
        </ResponsiveContainer>
      </SafeArea>
    </AppShell>
  )
}
