# KB v4 tooling

Lightweight, read-mostly tooling for the PML KB v4 enrichment gates.

## Safety rules

- These scripts do **not** import `docs/factory/kb-patches/*.ts` into production KB modules.
- These scripts write reports/checkpoints only under `docs/factory/reports/` and `docs/factory/logs/`.
- Production KB changes must be performed manually in small batches after reviewing `kb-v4-gap-analysis.md`.
- Do not add new KB categories without explicit approval and coordinated schema/index/validation updates.

## Commands

```bash
node scripts/kb-v4/inventory.mjs
node scripts/kb-v4/aggregate-gaps.mjs
node scripts/kb-v4/analyze-gaps.mjs
```

Recommended baseline before running:

```bash
git status --short --branch
npm run typecheck
npm test
npm run validate:kb
```
