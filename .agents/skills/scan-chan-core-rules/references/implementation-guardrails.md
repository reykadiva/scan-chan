# Implementation Guardrails

Use these gates before and during code changes.

## Product Direction

- Keep the pet visible, emotionally present, or clearly served by the workflow.
- Prefer companion moments, feedback, and warmth over dense feature surfaces.
- Avoid dashboard-first, admin-panel, CRUD-table, and generic SaaS compositions.
- Avoid generic AI UI defaults. Every screen should feel specific to Scan Chan.

## UI And Interaction

- Follow `docs/UI_PRODUCTION_GUIDE.md` for components, spacing, motion, accessibility, and responsive behavior.
- Follow `docs/VISUAL_DESIGN_DOCUMENT.md` and `docs/ART_DIRECTION_RESEARCH.md` for visual identity.
- Use purposeful animations only: feedback, attention, state change, emotional expression, or spatial continuity.
- Respect reduced-motion and accessibility requirements.
- Keep copy aligned with `docs/BRAND_BOOK.md`.

## Mascot And Assets

- Follow `docs/CHARACTER_DESIGN_DOCUMENT.md` for personality, expression, behavior, and animation intent.
- Follow `docs/MASCOT_PRODUCTION_GUIDE.md` for sprite, SVG, frame, expression, and export requirements.
- Do not invent mascot traits, behaviors, or assets that contradict the character bible.

## Data And Security

- Keep Guest and Arashu data completely isolated.
- Do not share tables, write paths, identity assumptions, persistence keys, or sync logic across modes unless the architecture explicitly allows it.
- Validate inputs through the project validation layer.
- Do not leak private Arashu data into Guest mode, analytics, logs, caches, or client-only storage.

## Architecture

- Follow `docs/PROJECT_ARCHITECTURE.md` before creating files, folders, stores, routes, APIs, or new patterns.
- Prefer existing layers, helpers, stores, component categories, and naming conventions.
- Keep business and gameplay logic out of React components when the architecture assigns it to `lib/`, stores, or APIs.
- Prefer reusable components when reuse is real and immediate.
- Avoid premature abstractions; extract when a pattern is proven or already established.

## Documentation

- Update docs before completion when implementation changes the product, design, behavior, gameplay, architecture, workflow, or technical contract.
- Update `docs/CHANGELOG.md` for notable changes.
- Update `docs/README.md` when adding new documents or durable documentation practices.
- State in the final response which docs were updated, or why no docs update was required.
