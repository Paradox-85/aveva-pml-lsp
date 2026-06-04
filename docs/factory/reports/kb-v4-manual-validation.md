# KB v4 Manual Validation Workbook

Generated: 2026-06-04T23:06:39.232677Z

## Files

- Excel workbook: `docs/factory/reports/kb-v4-manual-validation.xlsx`
- JSON data: `docs/factory/reports/kb-v4-manual-validation.json`
- CSV fallback: `docs/factory/reports/kb-v4-manual-validation.csv`

## Scope

Rows: 439 remaining candidates after excluding already imported v4 entries.

## Counts

- By decision: {'category_decision_required': 328, 'manual_review': 111}
- By priority: {'critical': 48, 'high': 61, 'medium': 177, 'low': 153}
- By recommended action: {'DEFER_SOURCE_NEEDED': 26, 'CATEGORY_DECISION': 302, 'REPAIR_CB': 80, 'REPAIR_RELATEDIDS': 1, 'REVIEW': 30}

## Human validation workflow

1. Open `kb-v4-manual-validation.xlsx`.
2. Filter/sort by `priority`, `recommendedAction`, and `confidence`.
3. Fill `userDecision` with one of: `IMPORT`, `REPAIR`, `REJECT`, `DEFER`, `CATEGORY_DECISION`.
4. Optionally fill `userCategory`, `userTargetModule`, `userRelatedIds`, `userNotes`, `importBatch`.
5. Return the edited workbook/CSV/JSON and ask the agent to import only `userDecision=IMPORT` rows.

## Import rule

The agent must not import rows unless `userDecision=IMPORT` is present after human validation.
