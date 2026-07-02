# Document Map

Consult these documents before implementation decisions. Use targeted reads for narrow tasks and fuller reads when behavior, architecture, UI, assets, or gameplay may change.

| Document | Governs |
|----------|---------|
| `docs/GAME_DESIGN_DOCUMENT.md` | Gameplay philosophy, pet system, progression, economy, balancing, rewards |
| `docs/VISUAL_DESIGN_DOCUMENT.md` | Art direction, color, typography, layout, animation language |
| `docs/PLAYER_EXPERIENCE_DOCUMENT.md` | Emotional pillars, companion philosophy, ethical design, experience checklist |
| `docs/ART_DIRECTION_RESEARCH.md` | Visual DNA, identity principles, mascot/UI evolution strategy |
| `docs/CHARACTER_DESIGN_DOCUMENT.md` | Mascot identity, personality, body language, expressions, animation behavior |
| `docs/BRAND_BOOK.md` | Voice, copy, brand identity, color meaning, typography, marketing/material language |
| `docs/MASCOT_PRODUCTION_GUIDE.md` | Mascot sprites, animation frames, SVG rules, asset pipeline, production quality |
| `docs/UI_PRODUCTION_GUIDE.md` | Design system, layout, spacing, radius, elevation, components, motion, accessibility |
| `docs/PROJECT_ARCHITECTURE.md` | Folder structure, application layers, routes, components, state, database, APIs, testing, coding standards |

## Conflict Rule

If documents conflict, stop and explain:

- The files and sections that conflict.
- The implementation decision blocked by the conflict.
- The smallest clarification needed from the developer.

Do not choose one document over another unless the documents themselves establish priority.

## Documentation Sync Rule

When implementation changes architecture, design, behavior, gameplay, UI, UX, balancing, assets, or technical workflow, update the owning document before completion. If multiple documents are affected, update all of them.
