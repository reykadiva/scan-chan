# Scan Chan Core Rules

Permanent workspace skill for Barcode Adventure / Scan Chan.

This skill is the project engineering handbook for Codex conversations in this workspace. It keeps implementation work aligned with the authoritative documents in `docs/`, the pet-first product philosophy, the anti-dashboard UI direction, database isolation rules, and documentation synchronization policy.

## Contents

- `SKILL.md` - concise operating protocol and permanent rules.
- `references/document-map.md` - required source documents and ownership areas.
- `references/implementation-guardrails.md` - implementation, UI, data, architecture, and documentation gates.
- `agents/openai.yaml` - UI metadata for Codex skill discovery.

## Maintenance

Keep this skill concise. Add detail to reference files only when the rule is stable and useful across many future tasks. Do not duplicate source-of-truth content from `docs/`; link to the owning document instead.

Project documentation remains authoritative. If this skill and `docs/` disagree, update the skill or stop and report the conflict.
