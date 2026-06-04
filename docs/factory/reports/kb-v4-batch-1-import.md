# KB v4 Batch 1 Import Report

Generated: 2026-06-04

## Imported entries

| ID | Target module | Source codebase |
|---|---|---|
| `d7_attribute_hash_validation` | `src/knowledge/pml-kb/objects.ts` | `JDE_newtag_import.pmlmac` |
| `d7_attribute_type_gated_assignment` | `src/knowledge/pml-kb/typeconversion.ts` | `JDE_newtag_import.pmlmac` |
| `d7_element_creation_api` | `src/knowledge/pml-kb/dotnetinterop.ts` | `JDE_newtag_import.pmlmac` |
| `d7_netgridcontrol_excel_io` | `src/knowledge/pml-kb/dotnetinterop.ts` | `JDE_newtag_import.pmlmac` |
| `d7_special_char_stripping` | `src/knowledge/pml-kb/datatypes.ts` | `JDE_newtag_import.pmlmac` |

## Pre-import pml-worker review

All 5 candidates were checked by `pml-worker` before import.

- `found: true` for all candidates
- `readyForImport: true` for all candidates
- canonical examples: `parseErrorCount: 0`
- antipattern examples: `parseErrorCount: 0`
- blockers: none reported

## Import notes

- Entries were manually copied from draft patches into production KB modules.
- `relatedIds` were normalized to existing/imported KB IDs to satisfy strict validator requirements.
- No new categories were added.
- No automatic import of `docs/factory/kb-patches/*.ts` was performed.

## Validation

### `npm run validate:kb`

Result: passed.

```text
KB Validation Report
====================
Total entries: 123
Categories: 18
Issues: 0
✅ All checks passed.
```

Category deltas after batch 1:

- `datatypes`: 8 → 9
- `dotnetinterop`: 10 → 12
- `objects`: 8 → 9
- `typeconversion`: 6 → 7

### `npm run typecheck`

Result: passed.

## Residual risks

- Semantic review remains recommended after more batches because these entries come from factory patch drafts.
- Search/context smoke currently passes via `validate:kb`, but future batches may still dilute top-8 retrieval.
