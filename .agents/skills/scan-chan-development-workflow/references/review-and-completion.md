# Review And Completion

Use this before final response, PR preparation, or handoff.

## Self-Review

- Review the diff for unrelated changes.
- Confirm files live in the expected architecture layer.
- Confirm no duplicated logic, dead code, debug logs, or untracked TODOs were added.
- Confirm naming, imports, and comments follow project conventions.
- Confirm UI uses Scan Chan tokens, component patterns, and brand voice.
- Confirm state is local, derived, or stored in the correct domain store.

## Accessibility Checklist

- Interactive elements have accessible names.
- Keyboard flow works for new interactions.
- Focus states are visible.
- Touch targets meet minimum size.
- Color contrast meets requirements.
- Reduced-motion behavior exists for motion-heavy changes.

## Performance Checklist

- No layout-triggering animations.
- No unnecessary broad store subscriptions.
- Heavy components or assets are loaded intentionally.
- Expensive computation is memoized or moved out of render when needed.
- Images and media use project-approved loading/optimization patterns.

## Documentation Update Policy

Update docs before completion when implementation changes product behavior, UI, UX, design system, mascot behavior, assets, architecture, state, APIs, workflows, tests, or durable conventions.

Use the owning document:

- `docs/PROJECT_ARCHITECTURE.md` for engineering workflow, architecture, state, APIs, file organization, testing, and coding standards.
- `docs/UI_PRODUCTION_GUIDE.md` for UI components, tokens, layout, motion, responsive, and accessibility rules.
- `docs/MASCOT_PRODUCTION_GUIDE.md` for mascot assets, sprite/SVG/animation production, expressions, and export rules.
- `docs/BRAND_BOOK.md` for voice, copy, colors, typography, marketing, and brand touchpoints.

## Changelog Policy

Update `docs/CHANGELOG.md` for notable additions, changes, fixes, removals, migrations, durable workflow changes, and user-visible behavior.

Use concise bullets. Do not turn changelog entries into implementation essays.

## PR Readiness Checklist

- Scope is clear and limited.
- Tests or validation ran, or skipped checks are explained.
- Documentation and changelog are updated when required.
- UI changes have accessibility, responsive, and reduced-motion consideration.
- State and data changes preserve Guest/Arashu separation through `scan-chan-core-rules`.
- The diff has no unrelated formatting or generated churn.

## Feature Completion Checklist

- The implemented behavior matches the relevant docs.
- Existing project patterns were reused where appropriate.
- New abstractions are justified.
- The work is maintainable, typed, and easy to review.
- Docs and changelog are synchronized.
- Final response lists changed areas and validation.
