# Scan Chan — AI Development Handbook

**Version**: 1.0  
**Last Updated**: July 4, 2026  
**Status**: Mandatory Reference for All AI Contributors  
**Purpose**: Permanent ruleset for AI agents working on Scan Chan

---

## Mandatory Documentation References

Before implementing ANY feature, read these documents in order:

1. **docs/SPRINT_BOOK.md** — Sprint order, boundaries, Definition of Done
2. **docs/PROJECT_ARCHITECTURE.md** — Engineering blueprint, layer rules, forbidden patterns
3. **docs/GAME_DESIGN_DOCUMENT.md** — Gameplay truth, pet system, progression
4. **docs/PLAYER_EXPERIENCE_DOCUMENT.md** — Emotional pillars, ethical design
5. **docs/UI_PRODUCTION_GUIDE.md** — Design system, component specs, animation timing
6. **docs/CHARACTER_DESIGN_DOCUMENT.md** — Mascot identity, personality, behavior
7. **docs/BRAND_BOOK.md** — Voice, color, typography, brand identity
8. **docs/MASCOT_PRODUCTION_GUIDE.md** — Pixel specs, animation, asset pipeline

If documents conflict, STOP and resolve the conflict before proceeding.

---

## Project Overview

**Name**: Scan Chan  
**Type**: Virtual pet game with barcode scanning as the feeding mechanism  
**Platform**: Mobile-first web app (Next.js 16, React 19, TypeScript)  
**Architecture**: Layered architecture with strict separation of concerns  
**Database**: Dual Prisma clients (Guest public, Arashu private)  
**State**: Zustand stores with localStorage persistence (Guest) or server sync (Arashu)

**Core Philosophy**: The pet comes first. Every decision serves the player-pet bond.

---

## Current Sprint Status

Sprint 4.4 is complete. Do NOT start Sprint 4.5 without explicit authorization.

**Completed Sprints**:
- Sprint 0: Project cleanup
- Sprint 1.1-1.7: Foundation (boundaries, data, services, flows, testing)
- Sprint 2.1-2.9: Core gameplay (pet, feeding, scanner pipeline, Home Hub)
- Sprint 3.1-3.9: Scanner implementation (camera, decoder, mobile optimization)
- Sprint 4.1-4.4: Inventory system (domain, viewmodel, UI, gameplay integration)

**Current State**: Repository is in a stable, validated state. All tests pass. Documentation is synchronized.

---

## Architecture Overview

### Layer Structure

```
Presentation Layer (React, hooks, styles)
    ↓ consumes
Game Layer (Pure functions, domain logic)
    ↓ orchestrated by
Service Layer (Validation, authorization)
    ↓ accesses
Repository Layer (Data access interfaces)
    ↓ implements
Persistence Layer (Prisma, localStorage)
```

### Fundamental Rules

1. **Data flows downward only** — Upper layers NEVER import from lower layers
2. **Business logic lives in `lib/`** — Pure functions, framework-agnostic
3. **Components are presentational** — No game rules, no database calls
4. **Stores hold state, not logic** — Zustand stores delegate to pure functions
5. **Services orchestrate** — Services coordinate repositories, never stores or UI
6. **Repositories own persistence** — Only repositories touch Prisma clients

---

## Layer Responsibilities

### Presentation Layer (`src/app/`, `src/components/`, `src/hooks/`)

**ALWAYS**:
- Render UI from state
- Handle user interaction
- Delegate logic to stores or pure functions
- Follow UI Production Guide specifications
- Pass Component Checklist before shipping

**NEVER**:
- Embed game logic in components
- Make direct database calls
- Access Prisma clients
- Import from Service or Repository layers
- Use `any` type

### Game Layer (`src/lib/`)

**ALWAYS**:
- Write pure, deterministic functions
- Accept inputs, return outputs
- Document all formulas
- Keep framework-agnostic (no React imports)
- Test every function

**NEVER**:
- Import React, hooks, or components
- Access database directly
- Mutate state
- Call APIs
- Use side effects

**Approved Engines**:
- `lib/pet/` — Pet stats, decay, personality, memories
- `lib/game/` — Missions, achievements, XP calculations
- `lib/inventory/` — Inventory operations, gameplay flows
- `lib/scanner/` — Scanner pipeline, product translation
- `lib/mascot-runtime/` — Mascot behavior, expressions

### Service Layer (`src/services/`)

**ALWAYS**:
- Receive repositories via constructor injection
- Validate inputs through Zod schemas
- Enforce business rules (cooldowns, limits)
- Return structured results
- Handle errors gracefully

**NEVER**:
- Import stores, Prisma clients, or API routes
- Mutate stores directly
- Import other services (unless documented orchestration need)
- Embed game logic (delegate to `lib/`)

### Repository Layer (`src/repositories/`)

**ALWAYS**:
- Accept Prisma client via constructor
- Provide typed query methods
- Handle Prisma errors
- Use transactions for multi-step operations

**NEVER**:
- Import stores, services, or UI components
- Embed business logic
- Create global Prisma instances
- Import from other repositories

### Persistence Layer (`src/lib/database/`)

**ALWAYS**:
- Use isolated Guest/Arashu Prisma clients
- Select client based on mode
- Store UTC timestamps only
- Run migrations for schema changes

**NEVER**:
- Mix Guest and Arashu data
- Use raw SQL in application code (migrations only)
- Create shared mutable state

---

## Domain Rules

### Pet Domain

**Stats**:
- Hunger, Mood, Energy, Affection, Curiosity (0-100)
- Decay is non-punitive: never reduces to 0 through absence alone
- Affection has permanent floor (25 for established players)

**Personality**:
- Emergent from care patterns (not binary traits)
- Six traits: Foodie, Adventurous, Routine-loving, Independent, Social, Nocturnal
- Signals accumulate gradually, never force abrupt changes

**Memories**:
- Created for meaningful moments only
- Types: First Feed, Favorites, Milestones, Special Moments, Rare Finds
- Avoid memory clutter from routine actions

**Lifecycle**:
- Five stages: Kitten, Young Cat, Adult Cat, Wise Cat, Legendary Cat
- Evolution triggered by XP thresholds
- Stage affects appearance, behavior, unlocks

### Scanner Domain

**Pipeline**: Barcode → Product Lookup → Product Translation → Food → Feeding → Pet State

**Rules**:
- Camera adapters own device access only
- Decoders normalize to `NormalizedBarcodeResult`
- Product translation maps to `FoodModel`
- Feeding engine validates and applies stat changes
- Scanner never embeds feeding or pet logic

### Inventory Domain

**Engine**:
- Pure functions: `createInventory`, `addItem`, `removeItem`, `sortInventory`
- Stackable items with automatic metadata merge
- Deterministic sorting (type/quantity/itemKey/id)
- Zero-quantity slots pruned automatically

**Gameplay Flow**:
- Actions: `use`, `consume`, `inspect`, `favorite`
- Consume/use for food/products → feeds pet, awards XP
- Use for furniture/decoration → toggles equipped state
- Inspect → records timestamp
- Favorite → toggles favorite flag

---

## React Rules

1. **No business logic in components** — Delegate to stores or pure functions
2. **Composition over inheritance** — Compose components, never extend
3. **Props are typed** — Every prop has explicit TypeScript type
4. **Children are explicit** — Use `ReactNode` or specific types, never `any`
5. **Effects are necessary** — Only use `useEffect` when React state/lifecycle required
6. **Effects clean up** — Return cleanup function from effects with subscriptions
7. **No layout-triggering animations** — Only `transform` and `opacity`
8. **Narrow selectors** — Zustand selectors select minimal data needed
9. **Memoize expensive computations** — Use `useMemo` for heavy calculations
10. **Accessibility is mandatory** — Every interactive element has `aria-label`

---

## Zustand Rules

1. **Stores hold state, not logic** — Delegate mutations to pure functions in `lib/`
2. **Actions are explicit** — Every state change goes through a named action
3. **Initial state is typed** — Export typed `initialState` constant
4. **Persistence is selective** — Use `partialize` to persist only necessary fields
5. **Selectors are narrow** — Select minimal data to prevent unnecessary re-renders
6. **No cross-store imports** — Stores never import other stores
7. **Devtools enabled** — Always wrap with `devtools()` middleware
8. **Version migrations** — Increment version when persisted schema changes
9. **Reset is implemented** — Every store has a `reset` action
10. **Hydration tracking** — Track `hasHydrated` flag for persistence

**Approved Stores**:
- `pet-store.ts` — Pet state, stats, memories
- `game-store.ts` — XP, level, missions, achievements
- `ui-store.ts` — Modal state, overlays, themes
- `settings-store.ts` — Sound, motion, notifications
- `inventory-store.ts` — Inventory items, capacity, selected item

---

## Application Flow Rules

1. **Flows coordinate services** — Never access repositories, stores, or UI directly
2. **Flows are deterministic** — Same inputs produce same outputs
3. **Flows handle orchestration** — Sequence service calls for complex operations
4. **Flows return results** — Structured success/failure outcomes
5. **Flows are testable** — Pure functions with mocked service dependencies

---

## Service Rules

1. **Constructor injection** — Receive repositories via constructor
2. **Validate all inputs** — Use Zod schemas before processing
3. **Structured responses** — Return `{ success, data, error }` format
4. **No store mutations** — Services return data, callers update stores
5. **No Prisma imports** — Services receive repositories, not Prisma clients
6. **Error handling** — Catch errors, log them, return structured failures
7. **Authorization first** — Check permissions before mutations
8. **Business rules enforced** — Cooldowns, limits, caps checked consistently

---

## Repository Rules

1. **Constructor injection only** — Accept Prisma client via constructor parameter
2. **Typed methods** — All methods return typed domain models
3. **Error handling** — Catch and transform Prisma errors to domain errors
4. **Transactions** — Use Prisma transactions for multi-table operations
5. **No business logic** — Repositories are data access only
6. **Query optimization** — Select only required fields, use indexes
7. **Single responsibility** — One repository per aggregate root

---

## Prisma Rules

1. **Isolated clients** — Guest and Arashu clients never mix
2. **Client selection** — Use `getPrismaClient(mode)` to select client
3. **UTC timestamps** — All dates stored as UTC, converted at display
4. **Migrations** — Every schema change requires migration file
5. **Seeds** — Seed files must be idempotent
6. **Generated types** — Run `npm run db:generate` after schema changes
7. **No raw SQL** — Use Prisma query builder (raw SQL only in migrations)

---

## Pure Function Requirements

1. **No side effects** — Functions do not modify external state
2. **Deterministic** — Same input always produces same output
3. **Framework-agnostic** — No React, Next.js, or browser API imports
4. **Testable in isolation** — Can test without mocking frameworks
5. **Documented formulas** — Complex calculations have explanatory comments
6. **Type-safe inputs** — All parameters explicitly typed
7. **Type-safe outputs** — All return values explicitly typed

**Pure Function Locations**:
- `src/lib/pet/` — Pet stat calculations, decay formulas
- `src/lib/game/` — XP formulas, mission logic
- `src/lib/inventory/` — Inventory operations
- `src/lib/scanner/` — Scanner state machine
- `src/lib/mascot-runtime/` — Behavior calculations

---

## State Management Rules

1. **Zustand for global state** — Never use React Context for global data
2. **Local state for UI only** — `useState` for component-local UI state
3. **Persist selectively** — Only persist user data, not derived state
4. **Normalize data** — Avoid nested duplication, use IDs for relations
5. **Actions update atomically** — Complete state changes in single action
6. **Selectors prevent re-renders** — Use narrow selectors to minimize updates
7. **Reset on logout** — Clear persisted state when user logs out

---

## Testing Requirements

### Unit Tests

**ALWAYS test**:
- Pure functions in `lib/`
- Zustand store actions
- Utility functions
- Validation schemas

**Location**: `tests/unit/`  
**Framework**: Vitest  
**Coverage target**: 80% for game logic, 100% for critical paths

### Integration Tests

**ALWAYS test**:
- API routes
- Service orchestration
- Repository queries
- Database migrations

**Location**: `tests/integration/`  
**Framework**: Vitest + Supertest  
**Requirement**: Use test database, never production

### Component Tests

**ALWAYS test**:
- User interactions
- Conditional rendering
- Error states
- Accessibility

**Location**: `tests/unit/`  
**Framework**: Vitest + Testing Library  
**Requirement**: No snapshot tests (they break on trivial changes)

### E2E Tests

**ALWAYS test**:
- Critical user flows (scan → feed → XP gain)
- Onboarding flow
- Mode switching
- Authentication (Arashu mode)

**Location**: `tests/e2e/`  
**Framework**: Playwright  
**Requirement**: Run before merge to main

---

## Documentation Requirements

### Code Documentation

1. **JSDoc for public APIs** — Document exported functions, parameters, returns
2. **Why not what** — Comments explain reasoning, not implementation
3. **Examples for complex logic** — Show usage in comment block
4. **No stale comments** — Update comments when code changes
5. **Type annotations** — Explicit types document intent

### Architecture Documentation

1. **Update PROJECT_ARCHITECTURE.md** — When layer boundaries change
2. **Update GAME_DESIGN_DOCUMENT.md** — When gameplay rules change
3. **Update CHANGELOG.md** — For every feature, fix, or breaking change
4. **Update this file (AGENTS.md)** — When adding mandatory rules
5. **Update README.md** — When adding new root-level documents

### Sprint Documentation

1. **Update SPRINT_BOOK.md** — When completing sprint milestones
2. **Update sprint boundaries** — Document what was deferred
3. **Update Definition of Done** — Keep checklist current
4. **Document decisions** — Explain why patterns were chosen

---

## Validation Checklist

Before committing ANY code, verify:

### Architecture Validation

- [ ] Code is in correct layer (Presentation/Game/Service/Repository/Persistence)
- [ ] No upward dependencies (lower layers never import upper layers)
- [ ] Business logic is in `lib/`, not components or services
- [ ] No circular dependencies
- [ ] API routes delegate to services, not repositories directly

### Type Safety Validation

- [ ] No `any` types (use `unknown` if type is truly unknown)
- [ ] All function parameters typed explicitly
- [ ] All function returns typed explicitly
- [ ] Zod schemas validate all external inputs
- [ ] TypeScript strict mode passes (`npx tsc --noEmit`)

### Code Quality Validation

- [ ] ESLint passes (`npm run lint`)
- [ ] All tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console.log in production code
- [ ] No TODO without issue reference

### Pet-First Validation

- [ ] Feature serves the player-pet bond
- [ ] No SaaS patterns or dashboard layouts
- [ ] UI follows Brand Book voice and tone
- [ ] Animations follow UI Production Guide timing
- [ ] Pet reacts appropriately to player actions

### Performance Validation

- [ ] No layout-triggering animations (only `transform`/`opacity`)
- [ ] Images use Next.js `<Image>` component
- [ ] Heavy components lazy-loaded with `dynamic()`
- [ ] Expensive computations memoized with `useMemo`
- [ ] Bundle size impact checked

### Accessibility Validation

- [ ] Interactive elements have `aria-label`
- [ ] Touch targets are 44×44px minimum
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible

---

## Commit Workflow

### Before Committing

1. **Run validation** — `npm run lint && npx tsc --noEmit && npm run test && npm run build`
2. **Check git status** — `git status` to verify only intended files staged
3. **Review diff** — `git diff --cached` to verify changes
4. **Pass checklist** — Complete Validation Checklist above
5. **Update docs** — Update CHANGELOG.md and relevant documentation

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types**:
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `style` — Formatting, whitespace
- `refactor` — Code restructuring without behavior change
- `test` — Adding or updating tests
- `chore` — Build process, dependencies

**Example**:
```
feat: add inventory gameplay integration

- Connect inventory UI to gameplay actions
- Wire Pet Store for stat updates
- Wire Game Store for XP rewards
- Add success/failure feedback UI
```

### Never Commit

- Secrets or API keys
- `console.log` statements
- Commented-out code
- `TODO` without issue reference
- `.env` files
- `node_modules/`
- Build artifacts

---

## Sprint Workflow

### Sprint Rules

1. **Never skip sprints** — Complete current sprint before starting next
2. **Never reorder sprints** — Follow SPRINT_BOOK.md order
3. **Never start Sprint X.Y without authorization** — Wait for explicit approval
4. **Read documentation first** — Review all mandatory docs before implementation
5. **Pass Definition of Done** — Every sprint must meet completion criteria

### Sprint Implementation Order

1. **Types** — Define interfaces first
2. **Constants** — Define configuration values
3. **Game Logic** — Pure functions in `lib/`
4. **Validation** — Zod schemas for inputs
5. **Store** — Zustand store with actions
6. **API Routes** — Server endpoints
7. **Components** — UI components (atomic to composite)
8. **Pages** — Route pages
9. **Tests** — Unit, integration, component, E2E
10. **Documentation** — Update all relevant docs

### Sprint Completion

After implementation:

1. **Run full validation** — All checks must pass
2. **Update CHANGELOG.md** — Document what was added/changed
3. **Update SPRINT_BOOK.md** — Mark sprint complete
4. **Commit changes** — Use proper commit message format
5. **Stop** — Do NOT start next sprint without authorization

---

## Definition of Done

Every sprint must meet ALL criteria before marking complete:

### Implementation

- [ ] All planned features implemented
- [ ] No placeholder code remains
- [ ] All TODO items resolved or documented
- [ ] Code follows all coding standards
- [ ] No console.log in production code

### Architecture

- [ ] Code is in correct layer
- [ ] No circular dependencies
- [ ] No upward layer imports
- [ ] Business logic in pure functions
- [ ] Services delegate to repositories

### Quality

- [ ] ESLint passes with 0 errors
- [ ] TypeScript compiles with 0 errors
- [ ] All tests pass (unit, integration, E2E)
- [ ] Build succeeds
- [ ] No `any` types used

### Testing

- [ ] Unit tests for game logic
- [ ] Integration tests for API routes
- [ ] Component tests for interactions
- [ ] E2E tests for critical flows
- [ ] Test coverage meets targets

### Documentation

- [ ] CHANGELOG.md updated
- [ ] Relevant design docs updated
- [ ] Code comments explain why, not what
- [ ] API documentation current
- [ ] AGENTS.md updated if rules changed

### User Experience

- [ ] Feature serves player-pet bond
- [ ] UI follows Brand Book
- [ ] Animations follow UI Production Guide
- [ ] Accessibility requirements met
- [ ] Performance requirements met

### Sprint Boundaries

- [ ] Only sprint features implemented
- [ ] No future sprint work included
- [ ] Deferred work documented
- [ ] Sprint scope respected

---

## Forbidden Implementations

**NEVER implement these patterns**:

1. **God Objects** — Split into focused modules
2. **Magic Numbers** — Use named constants in `lib/game-config.ts`
3. **Callback Hell** — Use async/await with proper error handling
4. **Prop Drilling** — Use Zustand stores or React Context
5. **Premature Optimization** — Profile first, optimize second
6. **Premature Abstraction** — Wait for 3+ usages before abstracting
7. **Silent Failures** — Always log, recover, and inform
8. **Mutable Shared State** — Use immutable state via Zustand
9. **Side Effects in Render** — Use useEffect with proper cleanup
10. **Framework Coupling** — Keep business logic in `lib/`, not React
11. **Comment Rot** — Self-documenting code, comments explain why
12. **Copy-Paste Programming** — Extract shared utilities
13. **SaaS Patterns** — No dashboards, admin panels, or CRUD tables
14. **AI-Generated Defaults** — Customize every component per UI Production Guide
15. **Global Singletons** — Use dependency injection
16. **Direct Database Access** — Always go through repositories
17. **Business Logic in Components** — Delegate to game layer
18. **Business Logic in Services** — Delegate to game layer
19. **Store Mutations in Services** — Services return data, stores update
20. **Mixed Concerns** — One file, one responsibility

---

## Performance Guidelines

### Rendering Performance

1. **GPU-accelerated animations** — Only `transform` and `opacity` properties
2. **Lazy load heavy components** — Use `dynamic()` from `next/dynamic`
3. **Memoize expensive computations** — Use `useMemo` and `useCallback`
4. **Narrow Zustand selectors** — Select minimal data to prevent re-renders
5. **Virtual scrolling** — For lists with 100+ items

### Bundle Performance

1. **Code splitting** — Use dynamic imports for route-level splitting
2. **Tree shaking** — Import only what's needed from libraries
3. **Image optimization** — Use Next.js `<Image>` component with proper sizing
4. **Font optimization** — Use `next/font` for Fredoka and Nunito
5. **Analyze bundle** — Run `npm run build` and check output

### Network Performance

1. **API response caching** — Cache stable data in stores
2. **Optimistic updates** — Update UI before server confirmation
3. **Debounce inputs** — Debounce search and filter inputs
4. **Prefetch routes** — Use Next.js `<Link prefetch>`
5. **Minimize payloads** — Select only required fields in Prisma queries

### Database Performance

1. **Index frequently queried fields** — Add indexes to Prisma schema
2. **Use transactions** — Batch related mutations
3. **Avoid N+1 queries** — Use Prisma `include` for relations
4. **Paginate large lists** — Implement cursor-based pagination
5. **Monitor query performance** — Use Prisma query logs

---

## Coding Standards

### File Organization

1. **Imports order** — React, Next.js, third-party, local (types, components, hooks, utils)
2. **One component per file** — Except tightly coupled helper components
3. **Named exports** — Prefer named exports over default exports
4. **Barrel exports** — Use `index.ts` to expose public APIs
5. **Co-locate tests** — Test files live next to implementation

### Naming Conventions

1. **Components** — PascalCase (e.g., `PetCanvas`, `InventoryClient`)
2. **Files** — kebab-case for multi-word (e.g., `pet-store.ts`, `game-engine.ts`)
3. **Functions** — camelCase (e.g., `calculateStatDecay`, `buildViewModel`)
4. **Constants** — SCREAMING_SNAKE_CASE (e.g., `MAX_HUNGER`, `DEFAULT_CAPACITY`)
5. **Types/Interfaces** — PascalCase with descriptive suffixes (e.g., `PetStateModel`, `InventoryEngineResult`)
6. **Private functions** — Prefix with underscore (e.g., `_helperFunction`)
7. **Boolean variables** — Prefix with `is`, `has`, `should` (e.g., `isLoading`, `hasHydrated`)

### TypeScript Standards

1. **Strict mode enabled** — `strict: true` in tsconfig.json
2. **No `any` types** — Use `unknown` if type is truly unknown
3. **Explicit return types** — Always declare function return types
4. **Interface for objects** — Use `interface` for object shapes, `type` for unions/primitives
5. **Readonly by default** — Mark parameters and properties `readonly` when possible
6. **Avoid type assertions** — Prefer type guards and validation
7. **Generic constraints** — Use `extends` to constrain generics

### Code Style

1. **Destructure props** — Destructure at function signature
2. **Early returns** — Guard clauses at top of functions
3. **Ternary for simple conditionals** — Use ternary for simple if/else, full if/else for complex
4. **Array methods over loops** — Prefer `map`, `filter`, `reduce` over `for` loops
5. **Optional chaining** — Use `?.` for nullable access
6. **Nullish coalescing** — Use `??` instead of `||` for defaults
7. **Template literals** — Use template literals for string interpolation
8. **Arrow functions** — Use arrow functions for callbacks and short functions
9. **Async/await** — Use async/await over raw promises
10. **No magic numbers** — Extract to named constants

### Comment Standards

1. **JSDoc for public APIs** — Document exported functions with JSDoc
2. **Inline comments explain why** — Explain reasoning, not what code does
3. **TODO format** — `// TODO(username): Description [issue-123]`
4. **FIXME format** — `// FIXME(username): Description [issue-123]`
5. **No commented code** — Delete unused code, don't comment it out
6. **Keep comments current** — Update comments when code changes

---

## Future Development Principles

### Scalability Principles

1. **Design for growth** — New features should plug in without refactoring core
2. **Horizontal scaling** — Game systems should support future additions
3. **Vertical scaling** — Database should handle 100x current data
4. **Platform agnostic** — Core logic should work on mobile wrappers
5. **Multiplayer ready** — State architecture should support future real-time features

### Maintainability Principles

1. **Documentation as code** — Keep docs synchronized with implementation
2. **Self-documenting code** — Clear naming reduces need for comments
3. **Test coverage** — Maintain 80%+ coverage for game logic
4. **Dependency discipline** — Audit and remove unused dependencies monthly
5. **Regular refactoring** — Clean up technical debt continuously

### Quality Principles

1. **Zero tolerance for warnings** — Fix all ESLint and TypeScript warnings
2. **Zero console.log** — Use proper logging utilities
3. **Zero `any` types** — Explicit types everywhere
4. **Zero unhandled errors** — Every error is caught, logged, recovered
5. **Zero data loss** — Defensive persistence with validation

### Product Principles

1. **Pet comes first** — Every decision serves the player-pet bond
2. **No dark patterns** — Ethical design only, no manipulation
3. **Accessibility is mandatory** — Everyone can play comfortably
4. **Performance is a feature** — Fast and smooth always
5. **Privacy is respected** — User data is protected

### AI Collaboration Principles

1. **Read documentation first** — Mandatory docs before implementation
2. **Follow established patterns** — Reuse existing architecture
3. **Ask before breaking changes** — Confirm before major refactors
4. **Validate before committing** — All checks must pass
5. **Document decisions** — Update CHANGELOG.md and relevant docs

---

**End of AI Development Handbook**

This document is the single source of truth for AI contributors working on Scan Chan. When this document conflicts with other sources, STOP and resolve the conflict before proceeding.
