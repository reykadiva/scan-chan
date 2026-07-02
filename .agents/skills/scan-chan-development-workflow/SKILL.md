---
name: scan-chan-development-workflow
description: Mandatory development workflow for Scan Chan implementation work. Use before, during, and after every code, UI, component, state, animation, documentation, test, refactor, or PR-readiness task in this workspace. Extends scan-chan-core-rules by defining the required engineering sequence, reuse checks, state/file/naming policies, animation/token/accessibility/performance gates, self-review, documentation updates, changelog policy, and feature completion checklist.
---

# Scan Chan Development Workflow

Use this skill to control how implementation work happens. It extends `scan-chan-core-rules`; do not repeat or override that skill's source-of-truth, pet-first, database-isolation, or conflict rules.

## Required Workflow

1. Apply `scan-chan-core-rules` first.
2. Read `references/planning-gate.md` before proposing or starting implementation.
3. Read `references/implementation-policies.md` before editing code, UI, animation, state, or assets.
4. Read `references/review-and-completion.md` before final response, PR preparation, or handoff.
5. Stop if the requested work conflicts with required docs or an existing implementation pattern.

## Before Coding

- Define the smallest clear scope and what is out of scope.
- Identify the affected app layer, route, component category, store, API, asset, and docs.
- Inspect existing code before introducing files, state, components, tokens, or animation patterns.
- Check the relevant Next.js guide in `node_modules/next/dist/docs/` before editing framework-specific code.
- Prefer a short implementation plan for multi-file or user-facing changes.

## During Implementation

- Reuse existing components, hooks, stores, utilities, and tokens before creating new ones.
- Keep logic in the layer assigned by `docs/PROJECT_ARCHITECTURE.md`.
- Keep UI implementation aligned with `docs/UI_PRODUCTION_GUIDE.md`.
- Keep mascot-related animation or asset work aligned with `docs/MASCOT_PRODUCTION_GUIDE.md`.
- Keep copy, tone, colors, and brand moments aligned with `docs/BRAND_BOOK.md`.
- Validate progressively with focused checks as soon as useful.

## After Implementation

- Run the narrowest meaningful validation first, then broader checks when risk warrants it.
- Self-review the diff before final response.
- Update documentation and changelog entries when the change is durable or user-facing.
- Report what changed, what docs changed, and what validation ran.
- State any checks that could not run.
