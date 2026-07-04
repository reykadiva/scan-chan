# Scan Chan — Implementation Plan

**Version**: 1.0  
**Last Updated**: June 30, 2026  
**Status**: Planning Phase  
**Document Type**: Technical Implementation Details

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Database Design](#3-database-design)
- [4. State Management](#4-state-management)
- [5. API Design](#5-api-design)
- [6. Component Architecture](#6-component-architecture)
- [7. Performance Considerations](#7-performance-considerations)
- [8. Security Considerations](#8-security-considerations)

---

## 1. Overview

This document provides detailed technical specifications for implementing the systems described in the Game Design Document. It serves as the reference for developers during implementation.

### 1.1 Documentation Standards

- All technical decisions are recorded here before implementation
- Changes to architecture require updating this document
- Code should match the specifications described here
- Discrepancies between code and documentation must be resolved immediately

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Pet Display │  │ Scanner     │  │ UI Components       │ │
│  │ (Canvas/DOM)│  │ (Camera)    │  │ (shadcn/ui)         │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│  ┌──────▼──────────────────────────────────────▼──────────┐ │
│  │              State Management (Zustand)                 │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │ │
│  │  │Pet Store│ │Game Store│ │UI Store │ │Persist Layer│  │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │ │
│  └────────────────────────┬───────────────────────────────┘ │
└───────────────────────────┼─────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │   API Layer   │
                    └───────┬───────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
    ┌───────▼───────┐               ┌───────▼───────┐
    │ Guest Database│               │Arashu Database│
    │   (Public)    │               │   (Private)   │
    └───────────────┘               └───────────────┘
```

### 2.2 Mode Separation

Guest and Arashu modes use completely separate data paths:

| Aspect | Guest Mode | Arashu Mode |
|--------|------------|-------------|
| Authentication | None (device-based) | Supabase Auth |
| Database | Public Prisma client | Private Prisma client |
| State Storage | localStorage | Server-synced |
| Product Pool | Shared | Private |
| Features | Standard | Standard + Exclusive |

### 2.3 Data Flow

1. User scans barcode
2. Scanner component captures code
3. API validates and processes scan
4. Pet store updates stats based on product category
5. Memory is recorded
6. XP is awarded
7. Missions are checked for completion
8. Achievements are evaluated
9. UI reflects all changes

---

## 3. Database Design

### 3.1 Core Models

#### Pet Model

```prisma
model Pet {
  id            String   @id @default(cuid())
  creatorId     String
  mode          String   // 'guest' | 'arashu'
  name          String
  stage         Int      // 1-5 (evolution stage)
  level         Int      @default(1)
  xp            Int      @default(0)
  
  // Stats (0-100)
  hunger        Int      @default(80)
  mood          Int      @default(80)
  energy        Int      @default(100)
  affection     Int      @default(50)
  curiosity     Int      @default(70)
  
  // Personality (calculated from care patterns)
  personality   Json?
  
  // Timestamps
  lastFedAt     DateTime?
  lastActiveAt  DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  memories      Memory[]
  achievements  Achievement[]
  products      Product[]
  
  @@index([creatorId, mode])
}
```

#### Memory Model

```prisma
model Memory {
  id          String   @id @default(cuid())
  petId       String
  type        String   // 'first_feed', 'favorite', 'milestone', 'special'
  title       String
  description String?
  productCode String?
  metadata    Json?
  createdAt   DateTime @default(now())
  
  pet         Pet      @relation(fields: [petId], references: [id])
  
  @@index([petId, type])
}
```

#### Achievement Model

```prisma
model Achievement {
  id          String   @id @default(cuid())
  petId       String
  key         String   // unique achievement identifier
  unlockedAt  DateTime @default(now())
  
  pet         Pet      @relation(fields: [petId], references: [id])
  
  @@unique([petId, key])
}
```

### 3.2 Database Separation Strategy

Two separate database connections:

```typescript
// lib/prisma-guest.ts
export const prismaGuest = new PrismaClient({
  datasourceUrl: process.env.GUEST_DATABASE_URL,
})

// lib/prisma-arashu.ts
export const prismaArashu = new PrismaClient({
  datasourceUrl: process.env.ARASHU_DATABASE_URL,
})

// lib/prisma.ts (router)
export function getPrismaClient(mode: 'guest' | 'arashu') {
  return mode === 'arashu' ? prismaArashu : prismaGuest
}
```

---

## 4. State Management

### 4.1 Store Architecture

```typescript
// stores/pet-store.ts
interface PetState {
  // Pet identity
  pet: Pet | null
  mode: 'guest' | 'arashu'
  
  // Stats
  stats: {
    hunger: number
    mood: number
    energy: number
    affection: number
    curiosity: number
  }
  
  // Progression
  level: number
  xp: number
  stage: number
  
  // Collections
  memories: Memory[]
  achievements: Achievement[]
  products: Product[]
  
  // Actions
  feedPet: (product: Product) => void
  updateStats: () => void // called periodically for decay
  addXP: (amount: number) => void
  checkEvolution: () => void
  recordMemory: (memory: MemoryInput) => void
  unlockAchievement: (key: string) => void
}
```

### 4.2 Stat Decay Calculation

```typescript
// lib/stat-decay.ts
export function calculateStatDecay(
  currentStats: PetStats,
  lastActiveAt: Date,
  now: Date
): PetStats {
  const hoursElapsed = (now.getTime() - lastActiveAt.getTime()) / (1000 * 60 * 60)
  
  return {
    hunger: Math.max(0, currentStats.hunger - (hoursElapsed * 5)),
    mood: Math.max(0, currentStats.mood - (hoursElapsed * 3)),
    energy: calculateEnergyDecay(currentStats.energy, hoursElapsed, lastActiveAt),
    affection: Math.max(25, currentStats.affection - (hoursElapsed / 24)), // -1 per day, min 25
    curiosity: Math.max(0, currentStats.curiosity - (hoursElapsed * 4)),
  }
}
```

### 4.3 Persistence Strategy

| Data Type | Storage | Sync Frequency |
|-----------|---------|----------------|
| Pet identity | Server + Local | On change |
| Stats | Server + Local | Every action |
| Memories | Server | On creation |
| Achievements | Server | On unlock |
| Products | Server | On scan |
| UI preferences | Local only | N/A |

---

## 5. API Design

### 5.1 Core Endpoints

#### Pet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pet` | Create new pet |
| GET | `/api/pet` | Get current pet |
| PATCH | `/api/pet` | Update pet (name, etc.) |
| POST | `/api/pet/feed` | Feed pet (scan product) |
| POST | `/api/pet/sync` | Sync local state with server |

#### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Register new product |
| GET | `/api/products` | List products (paginated) |
| GET | `/api/products/[barcode]` | Get product by barcode |
| DELETE | `/api/products/[barcode]` | Delete product (admin) |

#### Memory Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memories` | List memories |
| GET | `/api/memories/[id]` | Get memory details |

#### Mission Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/missions/daily` | Get daily missions |
| GET | `/api/missions/weekly` | Get weekly missions |
| POST | `/api/missions/[id]/complete` | Mark mission complete |

#### Achievement Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/achievements` | List all achievements |
| GET | `/api/achievements/unlocked` | List unlocked achievements |

### 5.2 Mode-Aware Middleware

```typescript
// middleware/mode-aware.ts
export async function modeAwareHandler(req: Request) {
  const mode = await getModeFromRequest(req) // 'guest' | 'arashu'
  const prisma = getPrismaClient(mode)
  
  // Continue with mode-specific prisma client
}
```

---

## 6. Component Architecture

### 6.1 Component Hierarchy

```
App
├── Layout
│   ├── ModeProvider (context)
│   └── PetProvider (context)
├── Pages
│   ├── LandingPage
│   ├── ModeSelection
│   ├── GameHub
│   │   ├── PetDisplay (main focus)
│   │   ├── StatsPanel (ambient)
│   │   ├── QuickActions
│   │   └── TabNavigation
│   │       ├── MissionsTab
│   │       ├── StatsTab
│   │       ├── HistoryTab
│   │       ├── AchievementsTab
│   │       └── ProductsTab
│   ├── ScannerPage
│   │   ├── CameraView
│   │   ├── ScanOverlay
│   │   └── PetReaction (shows pet during scan)
│   ├── MemoryPage
│   │   └── ScrapbookView
│   └── ProductDetailPage
└── Shared
    ├── PetSprite
    ├── StatIndicator
    ├── AchievementPopup
    └── XPPopup
```

### 6.2 Key Components

#### PetSprite

```typescript
interface PetSpriteProps {
  stage: 1 | 2 | 3 | 4 | 5
  mood: 'happy' | 'content' | 'sad' | 'sleepy' | 'excited'
  personality: PersonalityTraits
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
}
```

#### StatIndicator

```typescript
interface StatIndicatorProps {
  stat: 'hunger' | 'mood' | 'energy' | 'affection' | 'curiosity'
  value: number // 0-100
  showValue?: boolean // hidden by default
  size?: 'small' | 'large'
}
```

---

## 7. Performance Considerations

### 7.1 Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Pet animation FPS | 60fps |
| API response time | < 200ms |
| Bundle size (initial) | < 200KB |

### 7.2 Optimization Strategies

**Image Optimization**:
- Sprite sheets for pet animations
- WebP format for all assets
- Lazy loading for off-screen elements

**Code Splitting**:
- Route-based splitting
- Dynamic imports for scanner
- Lazy load heavy components

**Caching**:
- Product data cached client-side
- Pet state persisted to localStorage
- API responses cached where appropriate

---

## 8. Security Considerations

### 8.1 Authentication

**Guest Mode**:
- No authentication required
- Device-based identity (fingerprint or localStorage)
- Rate limiting by IP

**Arashu Mode**:
- Supabase authentication required
- JWT tokens for API access
- Refresh token rotation

### 8.2 Data Protection

- Product data validated on input
- File uploads limited to 5MB, JPEG/PNG/WebP only
- No sensitive data in client state
- API keys stored in environment variables

### 8.3 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Scan | 10 per minute |
| Product create | 5 per minute |
| General API | 60 per minute |

---

## 9. Sprint 5 - Content Production Implementation

### 9.1 Sprint 5.1: Content Foundation

**Content Type Definitions** (`src/types/content.ts`):
```typescript
interface AchievementDefinition {
  id: string
  key: string
  name: string
  description: string
  unlockCondition: UnlockConditionType
  threshold?: number
  rewardXp: number
}

interface MissionDefinition {
  id: string
  type: 'daily' | 'weekly'
  name: string
  description: string
  objective: ObjectiveType
  target: number
  rewardXp: number
}

interface FoodCategoryDefinition {
  category: FoodCategory
  statBoosts: Partial<PetStatsState>
  reactionMessages: string[]
}
```

**Content Registry** (`src/lib/content/registry.ts`):
- Load and validate content definitions
- Export typed content accessors
- Support hot-reload in development

### 9.2 Sprint 5.2: Achievement System

**Achievement Engine** (`src/lib/game/achievement-engine.ts`):
- Pure functions for unlock condition checking
- Support conditions: scan count, level, streak, evolution, collection
- Deterministic, testable, framework-agnostic

**Service Integration**:
- `GameService.checkAchievements(petState, gameState): Achievement[]`
- `GameService.unlockAchievement(userId, achievementKey): Result`

**Store Integration**:
- `game-store.ts`: Add `achievements: Achievement[]`, `unlockedAchievementKeys: string[]`
- Actions: `checkAndUnlockAchievements()`, `unlockAchievement(key)`

### 9.3 Sprint 5.3: Mission System

**Mission Engine** (`src/lib/game/mission-engine.ts`):
- Daily mission generation (3 per day)
- Weekly mission generation (1 per week)
- Progress tracking: scan count, product variety, consecutive days
- Completion detection

**Service Integration**:
- `GameService.generateDailyMissions(date): Mission[]`
- `GameService.updateMissionProgress(userId, action): Mission[]`
- `GameService.completeMission(userId, missionId): Result`

### 9.4 Sprint 5.4: Food & Product Content

**Enhanced Translation**:
- Extend product-to-food mapping with detailed categories
- Add reaction message selection based on personality
- Support favorite food tracking

**Food Categories**:
- Snack, Meal, Drink, Treat, Fresh, Packaged
- Each category has unique stat boost profile
- Reaction messages vary by category and personality

### 9.5 Sprint 5.5: Content Presentation

**Achievement Gallery** (`src/app/(game)/achievements/page.tsx`):
- Grid layout with locked/unlocked states
- Milestone celebration animations
- Progress indicators for in-progress achievements

**Mission List** (`src/app/(game)/missions/page.tsx`):
- Daily/weekly tabs
- Progress bars
- Completion celebration
- Reward claim UI

### 9.6 Sprint 5.6: Balancing & Polish

**Configuration Tuning** (`src/lib/game-config.ts`):
- XP_PER_SCAN, XP_PER_NEW_PRODUCT, XP_PER_MISSION
- MISSION_REWARD_MULTIPLIERS
- ACHIEVEMENT_THRESHOLDS
- STAT_RECOVERY_RATES

**Integration Tests**:
- Full scan → feed → XP → mission progress → achievement unlock flow
- Daily mission refresh
- Streak tracking
- Level progression

---

## 10. Sprint 6 - Persistence Implementation

**Guest Save** (Zustand persist middleware):
- Already functional via `localStorage`
- Versioned storage keys (`scan-chan-guest-{store}-state`)
- Corruption recovery via version checking

**Arashu Sync** (`src/services/sync/sync-service.ts`):
- `syncToServer()` - Push local state to database
- `loadFromServer()` - Pull server state to local
- Server-wins conflict resolution
- Offline queue with exponential backoff (max 3 retries)

**Sync Repository** (`src/repositories/sync-repository.ts`):
- `syncPetState()`, `syncGameState()`, `syncInventoryState()`, `syncSettingsState()`
- `loadPetState()`, `loadGameState()`, `loadInventoryState()`, `loadSettingsState()`
- Uses existing Prisma schema (Pet, PetStats, Progress, Inventory, Settings, SyncMetadata)

**Offline Queue** (`src/lib/sync/queue.ts`):
- `createSyncQueue()` for action buffering
- Enqueue, dequeue, retry, remove operations
- Unique action IDs with timestamps

**Versioned Storage** (`src/lib/sync/storage.ts`):
- `createVersionedStorage()` for localStorage wrapper
- Version checking and corruption recovery
- Guest/Arashu isolation

---

## 11. Sprint 7 - Accessibility Implementation

Sprint 7 is decomposed into five focused sub-sprints for incremental validation and manageable scope.

### 11.1 Sprint 7.1: Keyboard Navigation Foundation

**Focus Management Hooks**:
- `useFocusTrap(ref)` - Trap focus within modals/sheets
- `useFocusVisible()` - Manage focus-visible state
- `useKeyboard(key, callback)` - Key event handler

**Escape Key System**:
- Global escape handler for modals
- Escape handler for sheets
- Escape handler for dropdowns

**Skip Navigation**:
- Skip link component (`components/shared/skip-nav.tsx`)
- Jump to main content
- Keyboard shortcut documentation

**Tab Order Validation**:
- Home page tab order
- Scanner page tab order
- Collection page tab order
- Settings page tab order

**Focus Ring Visibility**:
- Ensure `focus-visible:ring` on all interactive elements
- Test focus indicators on all backgrounds
- Document focus indicator standards

**Modal Focus Trapping**:
- Focus trap on modal open
- Return focus on modal close
- Focus first focusable element on open

**Testing**:
- Unit tests for focus utilities (10+ tests)
- Integration tests for tab order
- Manual keyboard navigation testing

### 11.2 Sprint 7.2: Reduced Motion Support

**CSS Media Query Utilities** (`src/styles/motion.css`):
- `@media (prefers-reduced-motion: reduce)` variants
- Motion utility classes
- Animation variant system

**Animation Variants**:
- Page transitions: fade-only fallback
- Pet idle animations: minimal breathing variant
- Particles/bursts: static or disabled
- Popups/modals: fade-only transition
- Hover effects: color-only fallback
- Scanner transitions: instant or fade

**Settings Integration**:
- Manual reduced motion toggle in settings store
- Persist preference across sessions
- Apply preference globally

**Documentation**:
- Document reduced motion behavior per component
- Update UI Production Guide with motion variants
- Create reduced motion testing checklist

**Testing**:
- Visual regression tests for reduced motion
- Manual testing with OS-level reduced motion
- Animation variant validation

### 11.3 Sprint 7.3: Color Contrast & Touch Targets

**Contrast Audit** (WCAG AA):
- Text on backgrounds (4.5:1 minimum)
- Button text (4.5:1 minimum)
- Icons on backgrounds (3:1 minimum)
- Focus rings (visible on all backgrounds)
- Form errors (4.5:1 minimum)
- Toasts/notifications (4.5:1 minimum)
- HUD elements (4.5:1 minimum)
- Scanner overlays (4.5:1 minimum)

**Color Adjustments**:
- Adjust colors where contrast fails
- Document adjusted color tokens
- Preserve brand warmth while meeting standards

**Touch Target Validation**:
- Audit all interactive elements (44×44px minimum)
- Validate spacing between targets (8px minimum)
- Pet tap area expansion (20% larger than sprite)
- Button size review (48×48px preferred)
- Bottom navigation thumb-zone validation

**Documentation**:
- Contrast audit report with measurements
- Touch target validation report
- Updated accessibility standards documentation

**Testing**:
- Automated contrast checking tools
- Manual touch target measurement
- Mobile device testing

### 11.4 Sprint 7.4: Screen Reader Support

**ARIA Labels** (50+ additions):
- All buttons (`aria-label`)
- All icon buttons (`aria-label`)
- All links (`aria-label`)
- All form controls (`aria-label` or associated `<label>`)
- All navigation items (`aria-label`)

**Navigation Landmarks**:
- `<nav>` for navigation regions
- `<main>` for main content
- `<aside>` for sidebars
- `<section>` for distinct content sections
- `<header>` and `<footer>` where appropriate

**Live Regions** (`aria-live`):
- Pet state changes (hunger, mood, energy)
- XP gain announcements
- Level up announcements
- Achievement unlock announcements
- Error messages
- Loading state updates

**Form Field Labels**:
- All inputs associated with `<label>`
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required`

**Image Alt Text**:
- Meaningful `alt` text for all images
- Empty `alt=""` for decorative images
- Pet sprite alt text that describes emotional state

**Screen Reader Testing Notes**:
- Document screen reader testing procedure
- Test with NVDA (Windows)
- Test with VoiceOver (macOS/iOS)
- Document known issues

**Testing**:
- Integration tests for ARIA presence (15+ tests)
- Manual screen reader testing
- Automated accessibility scanning

### 11.5 Sprint 7.5: Responsive Review & Documentation

**Responsive Testing Matrix**:
- Small mobile (320-375px)
- Large mobile (375-428px)
- Tablet (768-1024px)
- Desktop (1024px+)
- Landscape orientation
- Tall screens (aspect ratio > 2:1)
- Narrow screens (< 360px)

**Layout Fixes**:
- Text wrapping for narrow screens
- Pet centering across all sizes
- Navigation reachability on all devices
- Touch target sizing on mobile
- Overflow handling

**Accessibility Checklist Update**:
- Update Component Checklist in UI Production Guide
- Add accessibility validation steps
- Document testing procedures

**Testing Procedures Documentation**:
- Keyboard navigation testing steps
- Screen reader testing steps
- Reduced motion testing steps
- Contrast validation steps
- Touch target validation steps
- Responsive testing steps

**Known Issues Log**:
- Document any unresolved accessibility issues
- Risk assessment for each issue
- Planned remediation timeline

**README Update**:
- Add accessibility section
- Document supported assistive technologies
- Link to testing procedures

---

**Document Status**: This document will be expanded as implementation continues. Sprint 7 accessibility implementation is now fully specified.

**Document End**
