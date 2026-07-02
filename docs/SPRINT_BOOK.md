# Scan Chan - Sprint Book

**Version**: 1.0  
**Last Updated**: July 2, 2026  
**Status**: Active - Mandatory Reference for All Production Planning  
**Document Type**: Definitive Production Roadmap and Sprint Governance

---

> **This document defines the official production roadmap for Scan Chan.**
>
> It is not an implementation plan. It is not a task list. It does not replace the Game Design Document, Project Architecture, UI Production Guide, Brand Book, Character Bible, Mascot Production Guide, Player Experience Document, Visual Design Document, or Art Direction Research.
>
> This document defines the order in which production happens, the purpose of each sprint, the boundaries that protect each sprint, and the approval gates every contributor must pass before moving forward.

---

## Table of Contents

- [1. Sprint Philosophy](#1-sprint-philosophy)
- [2. Development Rules](#2-development-rules)
- [3. Sprint Overview](#3-sprint-overview)
- [4. Sprint 0 - Project Cleanup](#4-sprint-0---project-cleanup)
- [5. Sprint 1 - Foundation](#5-sprint-1---foundation)
- [6. Sprint 2 - Core Gameplay](#6-sprint-2---core-gameplay)
- [7. Sprint 3 - Pet Systems](#7-sprint-3---pet-systems)
- [8. Sprint 4 - UI Polish](#8-sprint-4---ui-polish)
- [9. Sprint 5 - Content Production](#9-sprint-5---content-production)
- [10. Sprint 6 - Persistence](#10-sprint-6---persistence)
- [11. Sprint 7 - Accessibility](#11-sprint-7---accessibility)
- [12. Sprint 8 - Optimization](#12-sprint-8---optimization)
- [13. Sprint 9 - Release Candidate](#13-sprint-9---release-candidate)
- [14. Definition of Done](#14-definition-of-done)
- [15. Project Timeline Philosophy](#15-project-timeline-philosophy)
- [16. Sprint Checklist](#16-sprint-checklist)

---

## 1. Sprint Philosophy

### 1.1 Why Development Is Divided Into Sprints

Scan Chan is a long-term companion project. It cannot be built safely as a loose stream of features. The product depends on emotional consistency, technical isolation, mascot quality, state integrity, and a UI system that never loses sight of the pet. A sprint structure protects those qualities by forcing production to happen in a deliberate order.

Each sprint creates one durable layer of the product. Later sprints depend on earlier sprints being stable, documented, and playable. The sprint system prevents contributors from solving visible problems while leaving invisible foundations broken.

Without sprints, contributors are likely to:

- Polish UI before the correct data model exists.
- Build gameplay before Guest and Arashu isolation is secure.
- Add rewards before the reward philosophy is protected.
- Add mascot animations before the mascot production pipeline is ready.
- Add persistence before state ownership is stable.
- Optimize systems that may still be removed.

The sprint sequence exists to avoid this waste. It lets the project move with patience, certainty, and craft.

### 1.2 Why Each Sprint Has a Single Focus

Each sprint has one primary focus because mixed-focus sprints create blurred decisions. When a sprint tries to build architecture, gameplay, visual polish, accessibility, and content at the same time, contributors cannot tell which tradeoff matters most.

A single-focus sprint gives every decision a clear priority:

| Sprint Type | Primary Question |
|-------------|------------------|
| Cleanup | What must be removed or replaced before the new product can be trusted? |
| Foundation | Can future systems be built without fighting architecture? |
| Gameplay | Does scanning become feeding, discovery, and reward? |
| Pet Systems | Does the companion feel alive, remembered, and cared for? |
| UI Polish | Does the experience feel like Scan Chan, not a web app? |
| Content | Is there enough meaningful material to support repeated play? |
| Persistence | Can progress survive time, devices, and failure? |
| Accessibility | Can every player use the product with comfort and dignity? |
| Performance | Does the app feel instant, smooth, and reliable? |
| Release | Is the whole product ready for public trust? |

Single-focus sprints do not mean contributors ignore quality outside the sprint. They mean contributors do not prematurely build systems that belong to future sprints.

### 1.3 Why Unfinished Work Must Never Leak Into Later Sprints

Unfinished work is expensive because it becomes invisible dependency. If Sprint 1 leaves state ownership unclear, Sprint 2 will build scanning gameplay on unstable state. If Sprint 2 leaves reward sequencing unfinished, Sprint 3 will attach pet reactions to a broken pipeline. If Sprint 3 leaves pet stats ambiguous, Sprint 4 will polish screens that express the wrong emotional state.

Unfinished work must not leak forward because:

- Later contributors will assume earlier systems are approved.
- Bugs become harder to trace once multiple sprints depend on them.
- Documentation becomes misleading if a sprint is marked complete while behavior is incomplete.
- UI polish can hide broken logic.
- Content production can normalize incorrect terminology.
- Release pressure increases when foundational debt is deferred.

If a sprint cannot meet its Definition of Done, the project remains in that sprint. The roadmap does not move forward because the calendar says so. The roadmap moves forward only when the product is ready.

### 1.4 Why Polish Is Delayed Until Foundations Are Stable

Polish is important in Scan Chan. The product must feel warm, crafted, gentle, and emotionally specific. But polish applied too early creates false confidence.

UI polish is delayed until foundational systems are stable because:

- Pet-first UI depends on real pet state.
- Scanner feedback depends on a real scan-to-food pipeline.
- Mascot reactions depend on documented emotional state.
- Reward animation depends on reward queue order.
- Accessibility depends on final interaction structure.
- Performance work depends on realistic app composition.

Early polish is allowed only when it proves a foundational decision. It must not become final surface work that later systems are forced to preserve.

The correct order is:

1. Make the system true.
2. Make the system playable.
3. Make the system emotionally clear.
4. Make the system beautiful.
5. Make the system resilient.
6. Make the system releasable.

---

## 2. Development Rules

These rules are immutable. They apply to every human contributor, AI contributor, review pass, branch, pull request, and handoff.

### 2.1 Source of Truth Rules

- `docs/` is the single source of truth.
- `docs/SPRINT_BOOK.md` defines production order.
- `docs/PROJECT_ARCHITECTURE.md` defines engineering structure.
- `docs/GAME_DESIGN_DOCUMENT.md` defines gameplay truth.
- `docs/UI_PRODUCTION_GUIDE.md` defines UI production truth.
- `docs/MASCOT_PRODUCTION_GUIDE.md` defines mascot asset production truth.
- `docs/CHARACTER_DESIGN_DOCUMENT.md` defines mascot identity truth.
- `docs/BRAND_BOOK.md` defines voice, brand, and presentation truth.
- `docs/PLAYER_EXPERIENCE_DOCUMENT.md` defines emotional experience truth.
- `docs/VISUAL_DESIGN_DOCUMENT.md` and `docs/ART_DIRECTION_RESEARCH.md` define visual direction truth.
- If documents conflict, stop and resolve the conflict before implementation.

### 2.2 Sprint Order Rules

- Never skip a sprint.
- Never reorder sprints.
- Never start a later sprint because it appears easier or more exciting.
- Never build future sprint features early.
- Never merge work that depends on unfinished future sprint systems.
- Never mark a sprint complete while known blocking work remains.
- Never let branch naming override roadmap order.

### 2.3 Scope Rules

- Each sprint must have one primary focus.
- Each sprint must explicitly define what it must not build.
- Every contribution must name the sprint it belongs to.
- Work that does not belong to the active sprint is deferred unless it fixes a blocker.
- Future-compatible structure is allowed.
- Future feature implementation is not allowed.

### 2.4 Rewrite Rules

- Never rewrite completed systems without a documented reason.
- Refactor only when it improves maintainability, removes real debt, or aligns implementation with mandatory docs.
- Do not combine major refactors with feature work unless the sprint explicitly requires migration.
- Preserve working behavior during migration whenever possible.
- Remove legacy code only after replacement behavior exists or the sprint explicitly authorizes removal.

### 2.5 Playability Rules

- Every sprint must end in a playable state.
- "Playable" means the app can be opened, navigated, and used through the primary flow relevant to the sprint.
- A sprint may have placeholder content, but it must not have placeholder architecture.
- A sprint may have simple visuals, but it must not violate the pet-first design direction.
- A sprint may defer polish, but it must not ship broken emotional behavior.

### 2.6 Checklist Rules

Every sprint must pass:

- Engineering Checklist from `docs/PROJECT_ARCHITECTURE.md`.
- Experience Checklist from `docs/PLAYER_EXPERIENCE_DOCUMENT.md`.
- Design and Component Checklists from `docs/UI_PRODUCTION_GUIDE.md` when UI is affected.
- Character Checklist from `docs/CHARACTER_DESIGN_DOCUMENT.md` when the mascot is affected.
- Production Checklist from `docs/MASCOT_PRODUCTION_GUIDE.md` when mascot assets are affected.
- Brand Checklist from `docs/BRAND_BOOK.md` when copy, visual identity, tone, or marketing surfaces are affected.
- Creative review from the Scan Chan Design Director skill for visual, UX, motion, mascot, scanner, reward, and Home Hub work.

### 2.7 Documentation Rules

- Every sprint must keep documentation synchronized with implementation.
- Documentation updates happen before sprint approval.
- `docs/CHANGELOG.md` is updated for every durable roadmap, behavior, architecture, visual, content, persistence, accessibility, performance, or release change.
- `docs/README.md` is updated when a new durable document is added.
- `AGENTS.md` is updated when mandatory reference policy changes.
- If implementation exposes a documentation gap, the gap must be fixed or logged before the sprint can close.

---

## 3. Sprint Overview

| Sprint | Name | Purpose | Goals | Dependencies | Expected Outcome | Definition of Done |
|--------|------|---------|-------|--------------|------------------|--------------------|
| Sprint 0 | Project Cleanup | Remove or quarantine legacy v1 assumptions before v2 production begins. | Identify deprecated routes, UI, terminology, state, assets, and database assumptions; define migration path; remove dead code when safe. | Mandatory docs loaded; current implementation audited. | A clean, documented starting point for v2 foundation work. | Legacy surfaces are removed, replaced, or explicitly quarantined; docs and changelog reflect migration state; app remains runnable. |
| Sprint 1 | Foundation | Build the stable architecture that all later gameplay and UI depends on. | Folder structure, route skeleton, state ownership, database separation, tokens, shared components, layout shell, navigation skeleton, loading/error systems. | Sprint 0 complete. | A pet-first app shell with correct architecture and safe data boundaries. | App opens to the new structural shell; Guest/Arashu boundaries are defined; foundational stores/components/routes exist; no future gameplay is built. |
| Sprint 2 | Core Gameplay | Make scanning become feeding, discovery, and reward. | Scanner flow, barcode validation, food generation, reward pipeline, scan feedback, mission pipeline, first feeding sequence. | Sprint 1 complete. | The player can scan a product and see it become a meaningful pet-care action. | Scan-to-food-to-reward flow works end to end; no pet evolution yet; mission pipeline exists but remains simple. |
| Sprint 3 | Pet Systems | Make the companion feel alive through stats, moods, interactions, evolution, and daily behavior. | Hunger, Mood, Energy, Affection, Curiosity, idle behavior, interaction reactions, evolution triggers, daily loop. | Sprint 2 complete. | The pet becomes the emotional center of the playable app. | Pet state changes are readable, non-punitive, persistent for the session, and aligned with the GDD and Character Bible. |
| Sprint 4 | UI Polish | Refine the interface into the Scan Chan visual and emotional standard. | Motion, transitions, microinteractions, lighting, visual consistency, design tokens, responsive composition, refined states. | Sprint 3 complete. | The app feels warm, handcrafted, pet-first, and visually cohesive. | UI passes Design Director review, UI Production Guide checklist, Brand Checklist, and reduced-motion requirements. |
| Sprint 5 | Content | Produce enough structured content to support repeated play. | Items, foods, achievements, collections, furniture placeholders, localization preparation, balancing. | Sprint 4 complete. | The game has meaningful material without overbuilding future systems. | Content is documented, categorized, balanced, and presented without feature-density or collection pressure. |
| Sprint 6 | Persistence | Make progress durable across sessions and modes. | Guest save, Arashu sync, cloud architecture, migration, offline queue, conflict resolution. | Sprint 5 complete. | Player progress and pet history survive real use safely. | Guest and Arashu persistence are isolated, tested, recoverable, and documented. |
| Sprint 7 | Accessibility | Ensure the product can be used comfortably by all supported players. | Keyboard flow, reduced motion, contrast, touch targets, screen readers, responsive review. | Sprint 6 complete. | Accessibility is a first-class quality gate, not late patchwork. | Critical flows pass accessibility review and manual assistive checks. |
| Sprint 8 | Performance | Make the app fast, smooth, and resilient under realistic use. | Bundle size, lazy loading, memory, FPS, image optimization, caching, database optimization. | Sprint 7 complete. | The experience feels instant and stable on target devices. | Performance targets are measured, documented, and met or explicitly risk-accepted. |
| Sprint 9 | Release Candidate | Prepare the full product for launch trust. | QA, bug fixing, regression testing, store assets, Steam checklist, release checklist, launch preparation. | Sprint 8 complete. | A release candidate that can be confidently shipped. | No known release-blocking bugs; docs, assets, QA, changelog, and release checklist are complete. |

---

## 4. Sprint 0 - Project Cleanup

### 4.1 Purpose

Sprint 0 prepares the project for v2 production. It is not a redesign sprint. It is not a feature sprint. It is the point where the project stops pretending the v1 barcode game structure is the same product as the v2 Scan Chan companion experience.

The goal is to remove confusion before new work begins. Every legacy element must be classified as one of:

- Keep as-is.
- Keep temporarily and quarantine.
- Replace during a named sprint.
- Remove during Sprint 0.
- Remove after replacement exists.

### 4.2 Legacy Cleanup Principles

- Do not delete useful logic just because it is visually outdated.
- Do not preserve outdated UI just because it still works.
- Do not keep terminology that contradicts the Brand Book.
- Do not keep dashboard patterns as hidden "temporary" foundations.
- Do not migrate old systems into new names without checking the docs.
- Do not start Sprint 1 until the cleanup boundary is documented.

### 4.3 Files to Remove

The following files are candidates for removal or replacement during Sprint 0. Removal must happen only after confirming they are unused or after a documented replacement exists.

| File | Sprint 0 Decision | Reason |
|------|-------------------|--------|
| `src/app/play/page.tsx` | Replace or remove after Home Hub route exists | Current Game Hub is tab/dashboard-oriented and conflicts with pet-first Home Hub direction. |
| `src/app/play/mode/page.tsx` | Replace with onboarding mode route | Current flow can inform mode selection, but copy and placement should move into v2 onboarding architecture. |
| `src/app/play/mode/arashu-login/page.tsx` | Replace with auth route under architecture-defined structure | Current route does not match planned route groups and contains informal copy. |
| `src/components/pixel-cat.tsx` | Quarantine as v1 legacy, then remove after mascot system exists | Current 24x24 SVG prototype conflicts with the 48x48 mascot production guide. |
| `src/components/game/game-stats.tsx` | Remove or replace with ambient pet-stat HUD | Current XP/stat dashboard presentation conflicts with ambient stat philosophy. |
| `src/components/game/daily-missions.tsx` | Replace during Sprint 2 mission pipeline | Current mission structure is XP/task oriented and must become gentle pet-care suggestion flow. |
| `src/components/game/game-achievements.tsx` | Replace during Sprint 5 content production | Current achievement list can inform data but not final presentation. |
| `src/components/game/scan-history.tsx` | Replace with memory/scrapbook or pantry presentation | Current history view is database-like, not memory-oriented. |
| `src/components/game/product-list.tsx` | Replace with collection/pantry presentation | Current product list supports v1 utility behavior and must not become the v2 collection model. |
| `src/components/game/xp-popup.tsx` | Replace or refactor into reward pipeline | XP feedback must be sequenced through the reward system and pet reaction flow. |
| `src/components/game/achievement-popup.tsx` | Replace or refactor into reward pipeline | Achievement presentation must follow reward philosophy and UI Production Guide. |

Sprint 0 must produce the exact final removal decision for each candidate. If a file remains after Sprint 0, it must be labeled as intentionally retained, intentionally quarantined, or scheduled for a later sprint.

### 4.4 Systems to Replace

| Current System | Replacement Direction | Owning Sprint |
|----------------|-----------------------|---------------|
| Game Hub tab system | Pet-first Home Hub room and bottom navigation | Sprint 1 |
| XP/level/streak-first store | Domain stores for pet, game, UI, and settings | Sprint 1 |
| Single Prisma database assumption | Isolated Guest and Arashu data architecture | Sprint 1 and Sprint 6 |
| Generic mission templates | Gentle pet-care mission pipeline | Sprint 2 |
| Product scan as database lookup | Scan-to-food generation and feeding pipeline | Sprint 2 |
| PixelCat prototype | Production mascot asset/rendering system | Sprint 1 and Sprint 3 |
| Product history list | Memory/scrapbook and pantry-style collection | Sprint 5 |
| Achievement list | Trophy shelf or warm milestone gallery | Sprint 5 |
| Technical scanner page | Scanner as focused care/discovery flow | Sprint 2 and Sprint 4 |

### 4.5 Deprecated UI

The following UI patterns are deprecated and must not be used as the basis for v2:

- Dashboard hub pages.
- Feature tabs as primary game navigation.
- Dense stat cards.
- Product database lists as primary emotional surfaces.
- Bento marketing grids focused on features.
- "High score" or competitive framing.
- Generic SaaS cards with thin borders.
- Utility-first scanner framing disconnected from the pet.
- Mascot-as-icon decoration instead of mascot-as-companion.
- Emoji-heavy rewards or headings.

### 4.6 Deprecated Terminology

The following terms must be removed from player-facing copy unless a governing document explicitly permits them in a specific context:

| Deprecated Term | Replacement Direction |
|-----------------|-----------------------|
| Game Hub | Home, Home Hub, room, or companion space |
| Barcode Hunter | Scan Chan |
| Hunter | Companion, caretaker, explorer, or no label |
| High Scores | Milestones, memories, progress, or achievements |
| Compete | Grow, discover, care, remember |
| Submit | Continue, save, yes please, or context-specific warm copy |
| Database-first language | Pantry, scrapbook, collection, discoveries |
| User | Player, caretaker, or you |
| Grind | Journey, care, routine, progress |
| Start Game | Begin your story, meet your companion, or context-specific invitation |

### 4.7 Technical Debt to Resolve or Log

Sprint 0 must inspect and classify:

- Route structure mismatch between current app and `docs/PROJECT_ARCHITECTURE.md`.
- Single database/client assumption.
- Legacy `player-store.ts` ownership and migration path.
- Hardcoded mascot colors and sizes.
- Current use of XP/streak mechanics against the no-pressure experience rules.
- Current use of product registration and product CRUD inside the emotional game flow.
- Current copy that violates Brand Book voice.
- Any duplicated or internally conflicting documentation sections.
- Any untracked or uncommitted documentation governance files.

### 4.8 Migration Strategy

Sprint 0 does not complete the full v2 migration. It defines the migration path.

Required migration output:

1. A legacy inventory with keep/remove/replace decisions.
2. A route migration map from current routes to target routes.
3. A component migration map from current components to target component categories.
4. A state migration map from `player-store.ts` to future domain stores.
5. A database migration note describing what exists now and what Sprint 1/Sprint 6 must change.
6. A terminology cleanup list.
7. A documentation discrepancy list.

### 4.9 Sprint 0 Must Build

- Documentation-backed cleanup decisions.
- Safe removal of dead or clearly obsolete files.
- Quarantine labels or comments only where needed to prevent accidental reuse.
- A stable baseline that still runs.

### 4.10 Sprint 0 Must Not Build

- New pet stats.
- New evolution logic.
- New scanner gameplay.
- New reward pipeline.
- New mascot production assets.
- New persistence sync.
- Final UI polish.
- New content systems.

### 4.11 Sprint 0 Expected Outcome

At the end of Sprint 0, every contributor understands what parts of the current app are legacy, what parts are reusable, and what must be replaced. The project is no longer ambiguous about whether it is a barcode utility, a gamified product tracker, or a virtual pet companion. It is definitively moving into the v2 Scan Chan roadmap.

---

## 5. Sprint 1 - Foundation

### 5.1 Purpose

Sprint 1 builds the foundation that every later sprint depends on. It establishes structure, state ownership, mode boundaries, token usage, navigation skeleton, shared systems, and the pet-first app frame.

Sprint 1 is successful when future contributors can build gameplay without inventing architecture.

### 5.2 Folder Structure

Sprint 1 must align the repository with `docs/PROJECT_ARCHITECTURE.md`.

Required structure decisions:

- Route groups for landing, game, auth, and onboarding.
- `components/pet` for mascot rendering surfaces and pet UI.
- `components/hud` for ambient status presentation.
- `components/scanner` for camera and scan feedback.
- `components/game` for gameplay feature components.
- `components/room` for pet environment.
- `components/layout` for shell, navigation, transitions.
- `components/shared` for loading, error, empty, and dialog patterns.
- `stores` split by durable domain.
- `lib` organized around pure logic, configuration, adapters, and pipelines.
- `types` organized by domain.
- Validation schemas in the project-approved validation layer.

Sprint 1 must not create new top-level folders unless `docs/PROJECT_ARCHITECTURE.md` is updated first.

### 5.3 Architecture

Sprint 1 must establish:

- Presentation layer boundaries.
- Game/domain logic boundaries.
- Persistence boundaries.
- API boundaries.
- Shared utility boundaries.
- Import conventions.
- File naming conventions.
- Error handling conventions.
- Environment variable conventions.

The architecture must make it obvious where later work belongs. If a contributor cannot tell where to place a pet stat calculation, scan result parser, mascot component, or loading state, Sprint 1 is incomplete.

### 5.4 State Management

Sprint 1 must define the durable state domains:

| Store | Responsibility |
|-------|----------------|
| Pet store | Pet identity, current stats, current mood, current animation state, evolution stage placeholder, interaction state. |
| Game store | Scan session state, rewards queue, mission progress placeholder, achievement unlock placeholder. |
| UI store | Navigation state, modals, transient UI preferences, reduced-motion awareness if global. |
| Settings store | Player preferences, sound setting, motion setting, theme setting, mode setting. |

Sprint 1 may create minimal schemas and placeholder fields where later sprints own deeper behavior. It must not implement final pet gameplay, final missions, final evolution, or final persistence sync.

State rules:

- Ephemeral UI state remains local.
- Durable gameplay state belongs to a domain store.
- Business logic does not live inside React components.
- Store persistence must be versioned if data is written to storage.
- Guest and Arashu state must never share persistence keys casually.

### 5.5 Database

Sprint 1 must establish the database direction, not all final persistence.

Required foundation:

- Current schema audited against v2 requirements.
- Guest and Arashu isolation architecture defined in code or documented migration path.
- Pet data model planned or minimally introduced if Sprint 1 requires app shell state.
- Product, scan, memory, mission, and achievement ownership clarified.
- Migration safety documented.
- Prisma/client adapter strategy aligned with current Prisma version.

Sprint 1 must not fake isolation by using one shared database path with a mode flag unless `docs/PROJECT_ARCHITECTURE.md` explicitly allows that for a temporary phase and the risk is documented.

### 5.6 Guest Mode

Guest mode foundation must define:

- No required authentication.
- Local-first progression.
- Guest persistence key naming.
- Public product pool boundary.
- No access to Arashu data.
- Mode switching behavior.
- What happens when Guest data is absent, corrupt, or reset.

Guest mode must feel like a valid experience, not a demo.

### 5.7 Arashu Mode

Arashu mode foundation must define:

- Authentication entry point.
- Private data boundary.
- Server-synced progression direction.
- No leakage into Guest mode.
- Private product pool boundary.
- Future exclusive content boundary.
- Error and loading treatment for auth states.

Arashu mode may remain minimally functional in Sprint 1, but the isolation contract must be correct.

### 5.8 Shared Components

Sprint 1 must establish reusable primitives and shared patterns:

- App shell.
- Bottom navigation skeleton.
- Page transition wrapper.
- Loading screen.
- Error boundary.
- Empty state shell.
- Modal/dialog foundation.
- Pet stage area placeholder.
- HUD placeholder.
- Primary action button pattern.

These components must use documented tokens and naming conventions. They must not become generic SaaS primitives copied without Scan Chan styling.

### 5.9 Theme

Sprint 1 must establish:

- Font loading strategy for Fredoka and Nunito.
- CSS variable or token structure.
- Light theme foundation.
- Dark/night theme direction if implemented.
- Warm background foundation.
- No pure black or pure white backgrounds where docs forbid them.
- Token names that can survive future sprints.

### 5.10 Design Tokens

Sprint 1 must define or align tokens for:

- Color.
- Typography.
- Spacing.
- Radius.
- Elevation.
- Motion duration.
- Motion easing.
- Z-index/layers.
- Touch target minimums.
- Safe-area spacing.

Hardcoded values are acceptable only where no token exists and the value is a one-off technical necessity. Repeated values must become tokens only when the UI Production Guide supports them.

### 5.11 Core Layout

Sprint 1 must build the structural Home Hub shell:

- Pet zone.
- Room/environment zone.
- HUD zone.
- Primary action zone.
- Bottom navigation zone.
- Responsive container behavior.
- Safe-area behavior.

The shell may use placeholder visuals, but the hierarchy must be correct: the pet area dominates.

### 5.12 Navigation Skeleton

Sprint 1 must define the navigation skeleton without building final feature screens.

Minimum navigation:

- Home.
- Scan entry point.
- Collection placeholder.
- Missions or care placeholder if active in architecture.
- Settings/profile placeholder.

Navigation must be bottom-oriented and touch-friendly on mobile. It must avoid dashboard sidebars and dense menu systems.

### 5.13 Error Boundaries

Sprint 1 must include:

- Route-level error handling strategy.
- Shared error state component.
- Warm brand-aligned error copy.
- Recovery actions.
- Logging boundary.
- No technical stack traces in player-facing UI.

### 5.14 Loading System

Sprint 1 must include:

- App startup loading state.
- Route loading state.
- Async action loading state.
- Brand-aligned loading copy.
- Reduced-motion-safe loading behavior.
- No spinner-only cold loading if a warm alternative is feasible.

### 5.15 Project Conventions

Sprint 1 must document and apply:

- File naming.
- Component naming.
- Hook naming.
- Store naming.
- Type naming.
- Import order.
- Comment philosophy.
- Validation placement.
- Testing placement.
- Documentation update expectations.

### 5.16 Sprint 1 Must Build

- Target folder and route skeleton.
- App shell.
- Home Hub structural frame.
- Navigation skeleton.
- Token foundation.
- Shared loading/error/empty state patterns.
- Domain store foundation.
- Guest/Arashu isolation foundation.
- Minimal pet placeholder that preserves hierarchy.
- Documentation updates for any architecture adjustments.

### 5.17 Sprint 1 Must Not Build

- Full scanner gameplay.
- Food generation.
- Final reward animations.
- Final pet stat balancing.
- Evolution behavior.
- Full content catalog.
- Full persistence sync.
- Store assets.
- Final marketing pages.
- Accessibility-only overhaul beyond foundational requirements.
- Performance optimization beyond architecture basics.

### 5.18 Sprint 1 Expected Outcome

At the end of Sprint 1, the app should feel structurally like Scan Chan even if many systems are placeholders. A contributor should be able to open the app and see the future shape: a pet-centered room, warm shell, clear navigation, correct boundaries, and no dashboard-first foundation.

---

## 6. Sprint 2 - Core Gameplay

### 6.1 Purpose

Sprint 2 turns scanning into gameplay. It does not build the full pet system. It proves the emotional bridge: the player scans something real, the app understands it, and the pet receives it as a care action.

### 6.2 Scanner

Sprint 2 must build or refactor the scanner so it:

- Opens from the Home Hub primary action.
- Feels like entering a focused discovery mode.
- Keeps scanning visually primary while preserving a pet presence when appropriate.
- Handles camera permission states warmly.
- Handles scan failure gently.
- Handles retry without pressure.
- Returns to the Home Hub for feeding feedback.

The scanner must not feel like a retail utility or technical debug page.

### 6.3 Barcode Flow

Sprint 2 must define:

- Barcode validation.
- Duplicate scan handling.
- Product lookup.
- Unknown product handling.
- Scan cooldown behavior if retained.
- Error handling.
- Offline or failed-network placeholder behavior if persistence is not ready.
- Data passed into the food generation pipeline.

### 6.4 Food Generation

Sprint 2 must create the first version of food generation:

- Product metadata becomes a food-like presentation.
- Known products produce more specific food output.
- Unknown products produce a gentle generic discovery.
- Product categories influence food type.
- The generated food object is separate from raw product database data.
- Food data supports future pet preference logic.

Food generation must not become a complex content economy yet. It exists to support feeding.

### 6.5 Reward Pipeline

Sprint 2 must build the reward sequence foundation:

1. Scan succeeds.
2. Food is generated.
3. Feeding event is created.
4. Pet reaction placeholder plays.
5. XP or progress reward is calculated.
6. Mission progress updates if applicable.
7. Reward UI displays in order.
8. Result is saved to current-mode state.

Rewards must be queued. Two reward animations must not compete.

### 6.6 Animations

Sprint 2 animation is functional, not final polish.

Required animation coverage:

- Scanner enter.
- Scanner success.
- Scanner failure.
- Return to Home.
- Product/food appearance.
- Basic feeding reaction placeholder.
- XP or reward feedback.

All motion must honor reduced motion. No animation should be added only for decoration.

### 6.7 Feedback

Feedback must be:

- Immediate.
- Warm.
- Recoverable.
- Specific enough to build trust.
- Free of shame or urgency.

Feedback states required:

- Camera starting.
- Camera permission blocked.
- Scanning in progress.
- Scan success.
- Product found.
- Product unknown.
- Scan failed.
- Duplicate scan.
- Feeding complete.

### 6.8 Mission Pipeline

Sprint 2 may introduce the mission pipeline, but only as a simple gameplay support system.

Mission rules:

- Missions are suggestions, not chores.
- Missions must be completable with low effort.
- Missions must not punish absence.
- Mission progress must not dominate the Home Hub.
- Mission copy must follow the Brand Book.
- Mission rewards must sequence through the reward pipeline.

### 6.9 No Pet Evolution Yet

Sprint 2 must not implement pet evolution. It may emit progression events that Sprint 3 will later consume, but it must not build:

- Evolution thresholds.
- Evolution animation.
- New evolution stage assets.
- Evolution modal.
- Long-term growth balancing.

### 6.10 Sprint 2 Expected Outcome

At the end of Sprint 2, the core loop should be playable:

Open Home -> tap Scan -> scan product -> return Home -> feed pet -> receive warm feedback.

The pet may still be simple. The gameplay meaning must be clear.

---

## 7. Sprint 3 - Pet Systems

### 7.1 Purpose

Sprint 3 makes Scan Chan feel alive. This is where the pet stops being a placeholder reaction target and becomes the central companion system.

### 7.2 Pet Stats

Sprint 3 must implement the five core stats from the Game Design Document:

- Hunger.
- Mood.
- Energy.
- Affection.
- Curiosity.

Stats must be represented in state, updated through gameplay, and communicated visually or behaviorally. Raw numbers may exist for debugging or advanced views, but the default experience must remain ambient.

### 7.3 Hunger

Hunger must:

- Respond to feeding.
- Decay gently according to documented design.
- Never create damage, death, panic, or shame.
- Influence food-seeking body language.
- Support category-based recovery later.

### 7.4 Mood

Mood must:

- Respond to variety, attention, and mission completion.
- Influence expression and idle behavior.
- Never imply the pet is emotionally harmed by player absence.
- Support warm, subtle low-mood presentation.

### 7.5 Energy

Energy must:

- Support sleep, waking, idle pacing, and activity level.
- Recover through rest.
- Prevent unhealthy pressure loops.
- Make night and rest feel cozy, not restrictive.

### 7.6 Affection

Affection must:

- Represent relationship strength.
- Grow through care and presence.
- Decay very slowly or according to documented rules.
- Preserve the affection floor for established players.
- Never be weaponized as punishment.

### 7.7 Curiosity

Curiosity must:

- Reward new products and varied categories.
- Influence investigation animations.
- Support discovery without forcing novelty.
- Make the physical world feel interesting.

### 7.8 Evolution

Sprint 3 introduces evolution as a system, not final spectacle polish.

Required:

- Evolution stage state.
- Eligibility calculation.
- Thresholds aligned with the GDD.
- No accidental repeated evolution.
- First implementation of evolution trigger.
- Placeholder or simple evolution presentation that does not violate the emotional tone.
- Documentation of any balancing decisions.

Final full-screen polish may continue in Sprint 4.

### 7.9 Pet Interactions

Sprint 3 must introduce direct pet interactions:

- Tap or click pet.
- Gentle petting/attention feedback.
- Affection response.
- Idle interruption rules.
- Respect for sleeping or low-energy state.
- Accessible alternative interaction.

Pet interaction must feel like spending time with a companion, not clicking a reward dispenser.

### 7.10 Idle Behaviors

Sprint 3 must implement the first durable idle behavior system:

- Breathing.
- Blinking.
- Ear twitch.
- Tail movement.
- Sleep state.
- Greeting state.
- Post-feeding settling.

The system must support future expansion without hardcoded chaos.

### 7.11 Daily Loop

Sprint 3 must define the playable daily loop:

- Open app.
- Pet greets or continues current behavior.
- Player observes needs.
- Player scans or interacts.
- Pet responds.
- Player can leave without guilt.

The daily loop must not depend on punishment, streak anxiety, or urgent notification design.

### 7.12 Companion Experience

Sprint 3 must be reviewed against:

- Player Experience Document.
- Character Bible.
- Game Design Document.
- Brand Book.
- Mascot Production Guide.
- UI Production Guide.

The core question is: does the pet feel more alive, more comforting, and more specific to Scan Chan?

### 7.13 Sprint 3 Expected Outcome

At the end of Sprint 3, the player should feel that Scan Chan is a companion with needs, moods, reactions, and continuity. The app should no longer feel like a scanner with a mascot.

---

## 8. Sprint 4 - UI Polish

### 8.1 Purpose

Sprint 4 turns the functional v2 experience into a crafted Scan Chan experience. It does not add major new systems. It refines what exists until it feels coherent, warm, readable, and emotionally specific.

### 8.2 Animations

Sprint 4 must refine:

- Page transitions.
- Scanner transitions.
- Feeding sequence timing.
- Reward queue transitions.
- Pet idle animation timing.
- Modal and sheet transitions.
- Navigation active states.
- Empty/loading/error state motion.

Animations must follow documented easing, duration, and reduced-motion rules.

### 8.3 Transitions

Transitions must communicate spatial and emotional continuity:

- Home to Scanner feels like entering focus.
- Scanner to Home feels like returning with a gift.
- Home to Collection feels like opening a scrapbook or pantry.
- Home to Settings feels calm and unobtrusive.
- Rewards step forward briefly and then retreat.

No transition should feel like a generic web page swap.

### 8.4 Motion

Motion review must check:

- Purpose.
- Timing.
- Easing.
- Performance.
- Reduced-motion alternative.
- Emotional fit.
- No layout-triggering animation.

### 8.5 Microinteractions

Sprint 4 must refine:

- Button press states.
- Focus states.
- Hover states.
- Touch feedback.
- Pet tap feedback.
- Scan success feedback.
- Mission completion feedback.
- Achievement unlock feedback.
- Form validation feedback.

Microinteractions must be subtle and warm. They should make the app feel responsive without becoming noisy.

### 8.6 Visual Polish

Visual polish includes:

- Token consistency.
- Spacing rhythm.
- Radius consistency.
- Elevation consistency.
- Warm shadows.
- Text hierarchy.
- Icon consistency.
- State consistency.
- Responsive composition.
- Elimination of generic UI leftovers.

### 8.7 Lighting

Sprint 4 must refine the room atmosphere:

- Warm primary lighting.
- Time-of-day direction if implemented.
- Night mode direction if implemented.
- Pet readability against background.
- Reward lighting.
- Modal overlay warmth.

Lighting must frame the pet and room. It must not become decorative noise.

### 8.8 Accessibility Improvements

Sprint 4 may improve accessibility where tied to UI polish:

- Visible focus states.
- Better motion alternatives.
- Color contrast fixes.
- Touch target corrections.
- Text readability.
- Navigation landmarks.

Full project-wide accessibility audit belongs to Sprint 7.

### 8.9 Consistency Review

Sprint 4 must include a Design Director review across:

- Home Hub.
- Scanner.
- Feeding sequence.
- Collection placeholder or early collection.
- Missions.
- Achievements.
- Settings/profile.
- Empty states.
- Loading states.
- Error states.
- Reward presentation.

### 8.10 Sprint 4 Expected Outcome

At the end of Sprint 4, the app should feel recognizably Scan Chan even without reading the logo. It should be warm, pet-first, soft, coherent, and free of generic dashboard residue.

---

## 9. Sprint 5 - Content Production

### 9.1 Purpose

Sprint 5 creates the content foundation that makes repeated play meaningful. It must add enough content to support curiosity and progression without turning Scan Chan into a checklist or collection grind.

### 9.2 Items

Items must be defined as emotional and gameplay objects, not inventory clutter.

Item categories may include:

- Food representations.
- Memory artifacts.
- Simple decorations.
- Reward objects.
- Future furniture placeholders.

Each item must have:

- Purpose.
- Category.
- Unlock source.
- Presentation rules.
- Brand-safe name.
- Future localization readiness.

### 9.3 Food

Food content must support:

- Product categories.
- Known vs unknown products.
- Favorite food emergence.
- Repeated scan handling.
- Warm reaction copy.
- Visual categorization.

Food must remain tied to real-world scanning. It must not become an abstract shop economy.

### 9.4 Achievements

Achievements must:

- Celebrate meaningful milestones.
- Avoid unhealthy play.
- Avoid comparison.
- Avoid shame.
- Use warm language.
- Trigger reward presentation through the pipeline.
- Support visual presentation as shelf, scrapbook, or milestone gallery.

Achievement copy must be reviewed against the Brand Book.

### 9.5 Collections

Collections must feel like:

- Scrapbook.
- Pantry.
- Memory archive.
- Personal history.

Collections must not feel like:

- Spreadsheet.
- Database admin.
- Completion checklist.
- Competitive gallery.

### 9.6 Furniture Placeholders

Sprint 5 may create furniture placeholders only to support future room growth.

Allowed:

- Placeholder data schema.
- Locked or coming-later presentation if brand-aligned.
- Simple room decoration references.
- Documentation of future furniture categories.

Not allowed:

- Full furniture shop.
- Placement editor.
- Monetized decoration system.
- Complex room inventory.

### 9.7 Localization Preparation

Sprint 5 must prepare content for future localization:

- Avoid hardcoded copy scattered through logic.
- Keep content names and descriptions structured.
- Avoid idioms that cannot translate.
- Avoid jokes that depend on cultural timing.
- Keep brand voice simple and warm.

### 9.8 Balancing

Sprint 5 must balance:

- XP pacing.
- Mission rewards.
- Stat recovery.
- Achievement thresholds.
- Content unlock cadence.
- Repeat scan value.
- New product value.

Balancing must support comfort and long-term attachment, not compulsion.

### 9.9 Sprint 5 Expected Outcome

At the end of Sprint 5, Scan Chan should have enough meaningful content to feel alive across repeated sessions while still leaving future expansion space.

---

## 10. Sprint 6 - Persistence

### 10.1 Purpose

Sprint 6 makes player progress durable. It ensures that care, memories, pet state, scan history, and mode-specific data survive real-world use.

### 10.2 Guest Save

Guest save must:

- Work without authentication.
- Persist local progress.
- Use versioned storage.
- Recover from corrupt or missing data.
- Support migration from previous local versions if needed.
- Never write to Arashu persistence paths.
- Make reset/export/import policies clear if included.

### 10.3 Arashu Sync

Arashu sync must:

- Authenticate securely.
- Use private server-synced data.
- Preserve complete isolation from Guest.
- Handle loading and sync states warmly.
- Handle failed sync without data loss.
- Avoid leaking private data into logs, analytics, caches, or Guest state.

### 10.4 Cloud Architecture

Sprint 6 must define:

- Sync ownership.
- Server data model.
- Client cache strategy.
- Conflict strategy.
- Retry strategy.
- API validation.
- Auth boundaries.
- Error states.

### 10.5 Migration

Migration must cover:

- Existing v1 localStorage data.
- Existing Product/ScanLog data if retained.
- Store version changes.
- Database schema changes.
- Prisma migrations.
- Rollback or recovery notes.

No migration should silently discard player history unless explicitly approved and documented.

### 10.6 Offline Queue

Sprint 6 must define and implement an offline queue if offline scanning or deferred sync is supported.

Queue requirements:

- Stores pending actions safely.
- Preserves action order.
- Retries with backoff.
- Handles duplicates.
- Surfaces recoverable errors.
- Does not mix Guest and Arashu actions.

### 10.7 Conflict Resolution

Conflict resolution must define:

- Source of truth per mode.
- Timestamp strategy.
- Merge strategy.
- Server-wins or client-wins cases.
- User-visible recovery when automatic resolution is unsafe.
- Logging policy that protects private data.

### 10.8 Sprint 6 Expected Outcome

At the end of Sprint 6, a player can trust that their companion, memories, and progress will still be there later. Data persistence must feel invisible because it is reliable.

---

## 11. Sprint 7 - Accessibility

### 11.1 Purpose

Sprint 7 makes accessibility a complete product quality pass. Accessibility is not a compliance checkbox. It is part of Scan Chan's promise of comfort, warmth, and respect.

### 11.2 Keyboard

Required keyboard coverage:

- Navigate primary routes.
- Activate primary actions.
- Open and close modals.
- Use scanner fallback controls where possible.
- Move through forms.
- Use settings.
- Recover from errors.

Focus order must match visual and emotional order.

### 11.3 Reduced Motion

Reduced motion must cover:

- Page transitions.
- Scanner transitions.
- Pet idle animations.
- Feeding sequence.
- Reward presentation.
- Evolution sequence.
- Particles.
- Hover and press effects.

Reduced motion must preserve meaning. It must not simply remove feedback.

### 11.4 Color Contrast

Sprint 7 must audit:

- Text.
- Buttons.
- Icons.
- Focus rings.
- Form errors.
- Toasts.
- HUD.
- Scanner overlays.
- Reward states.
- Dark/night mode if present.

Warmth must not come at the cost of readability.

### 11.5 Touch Targets

All interactive targets must meet documented size and spacing:

- Minimum 44x44px.
- Primary actions preferably larger.
- Bottom navigation comfortable for thumbs.
- Pet interaction area forgiving.
- Scanner controls reachable.

### 11.6 Screen Readers

Screen reader support must include:

- Page landmarks.
- Button names.
- Form labels.
- Error messages.
- Loading updates.
- Reward announcements where meaningful.
- Pet state summaries where appropriate.
- Scanner permission and fallback guidance.

The pet should not be reduced to noisy repeated announcements. Screen reader output must be warm and useful.

### 11.7 Responsive Review

Sprint 7 must test:

- Small mobile.
- Large mobile.
- Tablet.
- Desktop.
- Landscape.
- Tall screens.
- Narrow screens.

Text must not overlap. The pet must remain central where relevant. Navigation must remain reachable.

### 11.8 Sprint 7 Expected Outcome

At the end of Sprint 7, Scan Chan should be comfortable to use across input methods, motion preferences, visual needs, and screen sizes.

---

## 12. Sprint 8 - Optimization

### 12.1 Purpose

Sprint 8 makes the product feel instant, smooth, and durable. Performance is emotional quality: lag breaks presence, jank breaks trust, and slow load breaks the feeling of returning to a companion.

### 12.2 Bundle Size

Sprint 8 must audit:

- Route bundle sizes.
- Shared component imports.
- Animation libraries.
- Scanner dependencies.
- Icon usage.
- Unused dependencies.
- Dynamic import opportunities.

Optimization must not make code clever or fragile.

### 12.3 Lazy Loading

Lazy loading must be applied to:

- Heavy scanner code when not on scanner route.
- Rare reward/evolution sequences.
- Large content collections.
- Non-critical settings panels.
- Optional media.

Do not lazy-load core Home Hub elements that must appear instantly.

### 12.4 Memory

Memory review must cover:

- Camera lifecycle.
- Event listeners.
- Animation loops.
- Timers.
- Zustand subscriptions.
- Image/object URLs.
- Offline queue size.

No background process should keep running after the related UI is closed.

### 12.5 FPS

FPS review must cover:

- Home Hub idle state.
- Pet animations.
- Feeding sequence.
- Scanner overlay.
- Reward animations.
- Evolution sequence.
- Low-end mobile devices.

Animations should use transform and opacity. Layout-triggering animation must be removed.

### 12.6 Image Optimization

Sprint 8 must optimize:

- Mascot assets.
- Room assets.
- Product images.
- Screenshot/store assets.
- Static icons.
- Preloading strategy.
- Cache headers where applicable.

Pixel art must preserve crisp scaling.

### 12.7 Caching

Caching must cover:

- Product lookups.
- Static assets.
- App shell.
- Guest local data.
- Arashu sync responses where safe.
- Offline queue behavior.

Private Arashu data must not be cached in places that violate privacy.

### 12.8 Database Optimization

Database optimization must review:

- Indexes.
- Query shape.
- Pagination.
- Scan history lookups.
- Product lookup by barcode.
- Memory retrieval.
- Achievement and mission retrieval.
- Arashu private query boundaries.

### 12.9 Sprint 8 Expected Outcome

At the end of Sprint 8, the app should load quickly, animate smoothly, avoid memory leaks, and handle realistic data without degrading the companion experience.

---

## 13. Sprint 9 - Release Candidate

### 13.1 Purpose

Sprint 9 prepares Scan Chan for public trust. It is not the place to add major new features. It is the place to prove that the product is ready.

### 13.2 QA

QA must cover:

- First launch.
- Mode selection.
- Guest flow.
- Arashu flow.
- Home Hub.
- Scanner.
- Feeding.
- Missions.
- Achievements.
- Collection.
- Persistence.
- Offline behavior.
- Error recovery.
- Accessibility.
- Performance.
- Responsive layouts.

### 13.3 Bug Fixing

Bug fixing rules:

- Fix release blockers first.
- Do not refactor unless required to fix the bug safely.
- Do not introduce new systems.
- Add regression tests or manual QA notes for fixed bugs.
- Update docs if the fix changes behavior.

### 13.4 Regression Testing

Regression testing must prove:

- Sprint 1 foundation still holds.
- Sprint 2 scanning flow still works.
- Sprint 3 pet systems still behave correctly.
- Sprint 4 UI polish has not regressed.
- Sprint 5 content remains balanced.
- Sprint 6 persistence is safe.
- Sprint 7 accessibility still passes.
- Sprint 8 performance targets still hold.

### 13.5 Store Assets

Store assets must follow:

- Brand Book.
- Screenshot Guidelines.
- Character Bible.
- Mascot Production Guide.
- UI Production Guide.

Required asset categories may include:

- App icon.
- Hero screenshot.
- Home Hub screenshot.
- Scanner screenshot.
- Feeding screenshot.
- Achievement or evolution screenshot.
- Short description.
- Long description.
- Trailer or preview video if release channel requires it.

### 13.6 Steam Checklist

If Steam release is active, Sprint 9 must prepare:

- Capsule artwork.
- Library artwork.
- Store screenshots.
- Trailer if required.
- Short description.
- About section.
- System requirements.
- Controller/keyboard claims only if tested.
- Privacy/disclosure text.
- Release build.
- Depot/package validation.

Steam assets must communicate companionship first, not feature count.

### 13.7 Release Checklist

Release preparation must include:

- Version number.
- Changelog.
- Known issues.
- Deployment target.
- Rollback plan.
- Database migration plan.
- Monitoring plan.
- Privacy review.
- Accessibility notes.
- Performance notes.
- Final documentation review.

### 13.8 Launch Preparation

Launch preparation must avoid urgency-based marketing. No countdown pressure, no FOMO, no aggressive CTA language. Launch should feel like opening the door to a warm room.

### 13.9 Sprint 9 Expected Outcome

At the end of Sprint 9, Scan Chan has a release candidate that is stable, documented, tested, emotionally consistent, brand-safe, accessible, performant, and ready for external players.

---

## 14. Definition of Done

Every sprint must satisfy this Definition of Done before the project may move forward.

### 14.1 Documentation

- [ ] All mandatory reference documents affected by the sprint are updated.
- [ ] `docs/CHANGELOG.md` includes the sprint's durable changes.
- [ ] `docs/README.md` is updated if documentation structure changed.
- [ ] No known implementation/documentation discrepancy remains unresolved.
- [ ] Any source-document conflict is documented and resolved.

### 14.2 Engineering

- [ ] Work follows `docs/PROJECT_ARCHITECTURE.md`.
- [ ] Files live in approved folders.
- [ ] State ownership is correct.
- [ ] Guest and Arashu isolation is preserved.
- [ ] No business logic is hidden in UI components when architecture assigns it elsewhere.
- [ ] No new technical debt is accepted without documentation.
- [ ] Engineering Checklist passes.

### 14.3 Design and Experience

- [ ] Pet remains the primary focus where the surface involves gameplay, Home, scanner, reward, or pet interaction.
- [ ] UI avoids dashboard, SaaS, and generic AI-looking patterns.
- [ ] UI Production Guide checklist passes for affected UI.
- [ ] Player Experience Checklist passes.
- [ ] Brand Checklist passes for affected copy, visuals, and touchpoints.
- [ ] Design Director review passes for affected visual, UX, motion, mascot, reward, scanner, and Home Hub decisions.

### 14.4 Mascot and Assets

- [ ] Mascot-related work follows the Character Bible.
- [ ] Mascot assets follow the Mascot Production Guide.
- [ ] Asset naming, folder placement, export format, and scale are correct.
- [ ] Reduced-motion alternatives exist for mascot motion where needed.
- [ ] No temporary mascot work is mistaken for production-approved mascot work.

### 14.5 Playability

- [ ] The app opens.
- [ ] The active sprint's primary flow can be completed.
- [ ] Errors have recovery paths.
- [ ] Loading states are present.
- [ ] The app is not left in a half-migrated state.
- [ ] Future sprint placeholders do not look like broken features.

### 14.6 Validation

- [ ] Type, lint, build, test, or other relevant checks ran as appropriate.
- [ ] Manual QA was performed for affected flows.
- [ ] Accessibility checks ran when UI changed.
- [ ] Performance checks ran when animation, assets, scanner, persistence, or routing changed.
- [ ] Any skipped validation is documented with the reason.

---

## 15. Project Timeline Philosophy

### 15.1 Quality Over Speed

Scan Chan is built on trust. A player trusts the app with their time, their attention, their daily rituals, and eventually their memories. Speed cannot be allowed to damage that trust.

Quality is prioritized over speed because:

- Emotional inconsistency is hard to repair.
- Data loss is unacceptable.
- Mascot identity must remain coherent.
- UI slop weakens the brand.
- Technical shortcuts become long-term friction.
- Players remember how the app feels more than how fast it shipped.

The project would rather move slowly and become loved than move quickly and become forgettable.

### 15.2 Why Unfinished Systems Should Never Accumulate

Unfinished systems create noise. They confuse contributors, mislead QA, and tempt future work to depend on unstable assumptions.

Accumulated unfinished systems cause:

- Broken mental models.
- Duplicate abstractions.
- Inconsistent UI.
- Incorrect documentation.
- Hidden migration costs.
- Release risk.

Every sprint must close its own loop. If a system is intentionally incomplete, it must be clearly labeled, documented, and isolated from future assumptions.

### 15.3 Why Future Contributors Must Never Reorder the Roadmap

The roadmap order is not arbitrary. It reflects dependency order.

Foundation comes before gameplay because gameplay needs state, routes, and data boundaries. Gameplay comes before pet systems because the pet needs real actions to respond to. Pet systems come before UI polish because polish must express real pet state. Content comes before persistence because persistence should save stable systems. Accessibility and performance come after the core is real because audits need realistic surfaces. Release comes last because trust is earned through the whole chain.

Reordering the roadmap creates false progress. It may produce visible output sooner, but it increases total project risk.

Future contributors must treat this Sprint Book as production law unless the document itself is intentionally revised through documentation review.

---

## 16. Sprint Checklist

Every sprint must pass this checklist before approval.

### 16.1 Start-of-Sprint Checklist

- [ ] Active sprint is named.
- [ ] Previous sprint is complete.
- [ ] Mandatory references are loaded.
- [ ] Scope is written.
- [ ] Out-of-scope work is written.
- [ ] Dependencies are understood.
- [ ] Relevant docs are identified.
- [ ] Existing implementation is inspected.
- [ ] Risks are listed.
- [ ] Validation plan is defined.

### 16.2 During-Sprint Checklist

- [ ] Work remains inside sprint boundaries.
- [ ] Future sprint features are not being built early.
- [ ] Documentation stays synchronized.
- [ ] Design decisions receive the required creative review.
- [ ] Architecture decisions follow Project Architecture.
- [ ] Guest and Arashu isolation is protected.
- [ ] Reusable components and tokens are preferred.
- [ ] Accessibility is considered as work is built, not only at the end.
- [ ] Performance risk is tracked.
- [ ] New debt is either avoided or explicitly documented.

### 16.3 End-of-Sprint Approval Checklist

- [ ] Sprint purpose was achieved.
- [ ] Expected outcome is playable.
- [ ] Definition of Done passes.
- [ ] Engineering Checklist passes.
- [ ] Experience Checklist passes.
- [ ] Design Checklist passes when UI changed.
- [ ] Brand Checklist passes when copy, tone, visuals, or presentation changed.
- [ ] Character and Mascot Production Checklists pass when mascot work changed.
- [ ] Changelog is updated.
- [ ] Documentation index is current.
- [ ] Known issues are documented.
- [ ] Next sprint is unblocked.

### 16.4 Rejection Conditions

A sprint must not be approved if any of the following are true:

- The app is not playable.
- Guest and Arashu isolation is weakened.
- Pet-first hierarchy is violated.
- Dashboard-first UI becomes the main experience.
- A mandatory checklist fails.
- Documentation is outdated.
- Future sprint systems were built early and now constrain the roadmap.
- Known blockers are hidden as polish tasks.
- User-facing copy violates the Brand Book.
- Mascot behavior violates the Character Bible.
- Data migration risk is unresolved.

---

**Document Status**: This is the active production roadmap for Scan Chan. Every contributor must consult it before planning or implementing work. Update this document only when the production roadmap intentionally changes.

**Document End**
