# Planning Gate

Use this gate before coding or making design decisions.

## Required Document Read

Always apply `scan-chan-core-rules` first. Then read only the relevant sections of:

- `docs/PROJECT_ARCHITECTURE.md` for layers, file placement, state, APIs, naming, testing, and workflow.
- `docs/UI_PRODUCTION_GUIDE.md` for UI components, layout, spacing, tokens, motion, responsive behavior, and accessibility.
- `docs/MASCOT_PRODUCTION_GUIDE.md` for mascot sprites, expressions, animation frames, SVG structure, and asset export rules.
- `docs/BRAND_BOOK.md` for copy voice, color meaning, typography identity, brand checklist, and touchpoint quality.

For framework-specific work, read the relevant guide in `node_modules/next/dist/docs/` before editing.

## Planning Questions

Answer these before implementation:

- What is the smallest complete change?
- Which files, routes, stores, components, assets, and docs may be affected?
- Which existing components, hooks, stores, utilities, or tokens can be reused?
- Does the change need new state, or can state stay local/derived?
- Does the change need a new file, or does it belong in an existing module?
- Which validation commands or manual checks will prove the work?
- Which docs and changelog entries must change before completion?

## Plan Shape

For multi-file or user-facing work, use a short plan with:

1. Context to read.
2. Implementation steps.
3. Validation steps.
4. Documentation updates.

Skip a written plan only for small, obvious changes.
