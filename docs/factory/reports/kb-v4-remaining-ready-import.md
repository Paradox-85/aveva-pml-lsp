# KB v4 Remaining Ready Import Report

Generated: 2026-06-04

## Imported entries

Imported the remaining 14 `import_new_candidate_ready` entries after pre-import review, relatedIds normalization, and antipattern repair.

| ID | Target module |
|---|---|
| `d7_display_progress` | `src/knowledge/pml-kb/ui.ts` |
| `d7_savework_unclaim` | `src/knowledge/pml-kb/macros.ts` |
| `d7_string_dbref_conversion` | `src/knowledge/pml-kb/typeconversion.ts` |
| `dbref_attribute_access_assignment` | `src/knowledge/pml-kb/objects.ts` |
| `loopdata_object` | `src/knowledge/pml-kb/objects.ts` |
| `net_grid_data_source_workflow` | `src/knowledge/pml-kb/dotnetinterop.ts` |
| `obj_measure_unit` | `src/knowledge/pml-kb/objects.ts` |
| `obj_ptmltags_export` | `src/knowledge/pml-kb/objects.ts` |
| `obj_ramcommonlogger` | `src/knowledge/pml-kb/objects.ts` |
| `pdms_collect_all_multi_class` | `src/knowledge/pml-kb/pdmsinteraction.ts` |
| `pdms_dtxr_attribute` | `src/knowledge/pml-kb/pdmsinteraction.ts` |
| `pdms_namn_attribute` | `src/knowledge/pml-kb/pdmsinteraction.ts` |
| `pml1_lstdef_query` | `src/knowledge/pml-kb/controlflow.ts` |
| `string_interpolation_dollar_var` | `src/knowledge/pml-kb/typeconversion.ts` |

## Repairs applied before import

- Normalized non-existing `relatedIds` to existing/imported IDs.
- Mapped draft-only categories such as `queries` / `attributes` to allowed `pdmsinteraction`.
- Removed draft-only `normalizeCategory(...)` expressions from production entries.
- Filled empty `exampleAntipattern` values.
- Repaired parse-invalid antipattern examples for `obj_ptmltags_export` and `pml1_lstdef_query`.

## Validation

### `npm run validate:kb`

Passed.

```text
Total entries: 137
Categories: 18
Issues: 0
✅ All checks passed.
```

### `npm run typecheck`

Passed.

### `npm test`

Passed.

```text
Test Files  5 passed (5)
Tests       65 passed (65)
```

## Notes

- No new categories were added.
- Patch drafts were not auto-imported wholesale; entries were selectively copied/repaired.
- Search/context smoke is covered by `npm run validate:kb` and passed.
