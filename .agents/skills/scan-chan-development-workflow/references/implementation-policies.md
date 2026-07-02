# Implementation Policies

Use these policies while editing code.

## Component Reuse

- Search existing components before creating new ones.
- Prefer domain components from `components/pet`, `components/hud`, `components/scanner`, `components/game`, `components/room`, `components/product`, `components/layout`, and `components/shared`.
- Use `components/ui` primitives for atomic building blocks, but customize compositions to the Scan Chan design system.
- Create a new component only when it has a clear responsibility, stable boundary, and likely reuse or meaningful complexity reduction.

## State Management

- Keep ephemeral UI-only state local.
- Use existing Zustand stores for shared domain state.
- Create a new store only for a new durable domain with documented ownership and migration needs.
- Use narrow selectors to avoid unnecessary renders.
- Keep gameplay/business logic in `lib/`, stores, or API layers according to `docs/PROJECT_ARCHITECTURE.md`.

## File Organization

- Place files according to `docs/PROJECT_ARCHITECTURE.md`.
- Keep route code in `src/app`, reusable UI in `src/components`, pure logic in `src/lib`, hooks in `src/hooks`, stores in `src/stores`, types in `src/types`, and validation in `src/validations`.
- Do not create new top-level categories unless the architecture document supports them.
- Keep file responsibilities narrow.

## Naming

- Use kebab-case filenames for components, hooks, stores, utilities, validations, and tests.
- Use `page.tsx` for pages and `route.ts` for API routes.
- Prefix hooks with `use`.
- Name stores by domain, such as `pet-store.ts`.
- Keep imports ordered by project convention: React, Next.js, external libraries, internal modules, types.

## Design Tokens

- Use design system variables, Tailwind theme tokens, or existing CSS custom properties.
- Do not hardcode colors, shadows, radii, spacing, typography, or motion values when a token exists.
- Keep colors, typography, and brand tone aligned with `docs/BRAND_BOOK.md` and `docs/UI_PRODUCTION_GUIDE.md`.
- Add tokens only when a repeated, documented need exists.

## Animation

- Use existing timing, easing, and motion patterns from `docs/UI_PRODUCTION_GUIDE.md`.
- Use mascot animation rules from `docs/MASCOT_PRODUCTION_GUIDE.md` when the pet moves, reacts, or changes expression.
- Animate `transform` and `opacity`; avoid layout-triggering properties.
- Respect reduced-motion preferences.
- Add animation only when it communicates feedback, continuity, emotion, or state.

## Accessibility

- Provide labels for interactive controls.
- Keep touch targets at least 44x44px.
- Preserve keyboard navigation and visible focus states.
- Meet contrast requirements from the UI guide.
- Announce meaningful async or state changes when needed.
- Ensure reduced-motion behavior remains usable.

## Performance

- Keep interactions under the perceived response targets from `docs/PROJECT_ARCHITECTURE.md`.
- Use narrow Zustand selectors and memoization where data flow justifies it.
- Use Next.js image and loading patterns where applicable.
- Lazy-load heavy UI only when it improves the experience.
- Check bundle, render, animation, and network impact for broad changes.
