---
name: scan-chan-core-rules
description: Permanent workspace engineering handbook for Barcode Adventure / Scan Chan. Use in every conversation inside this workspace and before any implementation, review, design, gameplay, UI, data, architecture, documentation, or asset decision. Enforces project documentation as the single source of truth, pet-first product direction, Guest/Arashu database isolation, anti-dashboard UI, maintainable Next.js engineering, and documentation synchronization.
---

# Scan Chan Core Rules

Use this skill as the permanent engineering handbook for Scan Chan work. Treat it as binding process guidance, but never as a replacement for the project documents in `docs/`.

## Operating Protocol

Before making implementation decisions:

1. Consult the required source documents listed in `references/document-map.md`.
2. Check the task against `references/implementation-guardrails.md`.
3. Follow the existing project architecture, component patterns, and documentation policy.
4. Stop and explain the conflict if two source documents disagree. Do not guess.
5. Update relevant documentation before considering work complete when implementation changes architecture, design, behavior, gameplay, UI, UX, balancing, assets, or technical workflow.

For Next.js code, read the relevant guide in `node_modules/next/dist/docs/` before editing because this project may use breaking changes or unfamiliar conventions.

## Permanent Rules

- Treat `docs/` as the single source of truth.
- Never violate the Game Design Document, Visual Design Document, Player Experience Document, Art Direction Research, Character Design Document, Brand Book, Mascot Production Guide, UI Production Guide, or Project Architecture.
- Keep the pet as the primary focus of the application.
- Never build dashboard-first interfaces.
- Never generate generic SaaS layouts.
- Never produce generic AI-looking UI.
- Prioritize emotional experience over feature density.
- Keep Guest database and Arashu database completely isolated.
- Keep the codebase scalable and maintainable.
- Prefer reusable components and existing project patterns.
- Keep animations purposeful, readable, and aligned with the motion system.
- Keep documentation synchronized with implementation.

## Decision Gate

Before editing files, be able to answer:

- Which source documents govern this change?
- Does the change keep the pet central?
- Does the change avoid dashboard, admin, and generic SaaS patterns?
- Does the change preserve Guest/Arashu isolation?
- Does the change fit existing architecture and reusable component boundaries?
- Which documentation files need updates before completion?

If any answer is unclear, inspect the relevant docs or stop and report the ambiguity.

## Completion Gate

Before final response:

- Verify implementation and documentation agree.
- Mention documentation updated, or state why no documentation update was needed.
- Call out any unresolved doc conflict instead of hiding it.
- Report validation performed, including tests or checks that could not be run.
