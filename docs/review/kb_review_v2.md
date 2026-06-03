# KB v2 Review Report

**Date:** 2026-06-03
**Status:** Implemented, validated

## Summary

| Metric | Value |
|---|---|
| Total entries | 110 |
| Categories | 18 |
| Source files | Claude KB (87) + Perplexity KB + Codebase |
| High-priority entries | 5 |
| MCP tools | 6 new |
| Tests | 30 total |

## Category Coverage

| Category | Entries | Codebase Coverage |
|---|---|---|
| datatypes | 8 | ramValueConverter.pmlobj |
| controlflow | 6 | ramValueConverter.pmlobj, EIS_data_export.pmlmac |
| errorhandling | 6 | ramValueConverter.pmlobj, ramCommonLogger.pmlobj |
| objects | 8 | ramValueConverter.pmlobj, ramCommonLogger.pmlobj |
| forms | 12 | ramImportExcelProcessor.pmlfrm |
| macros | 7 | EIS_data_export.pmlmac, JDE_pipeData_export.pmlmac |
| functions | 5 | jacExportRDLDataReport.pmlfnc, ramGetBackRef.pmlfnc |
| dotnetinterop | 8 | ramExcelReaderClass.pmlobj |
| pdmsinteraction | 8 | ramTagManagement.pmlobj, JDE_pipeData_export.pmlmac |
| namingconventions | 5 | Project-wide conventions |
| typeconversion | 5 | ramValueConverter.pmlobj |
| logging | 5 | ramCommonLogger.pmlobj |
| architecturepatterns | 7 | ramImportExcelProcessor.pmlfrm, EIS_data_export.pmlmac |
| arrays | 8 | ramCommonLogger.pmlobj, ramValueConverter.pmlobj |
| collections | 4 | JDE_pipeData_export.pmlmac |
| datetime | 3 | EIS_data_export.pmlmac |
| ui | 3 | ramImportExcelProcessor.pmlfrm |
| syscom | 2 | EIS_data_export.pmlmac |

## High-Priority Entries Status

| Entry | Status | Notes |
|---|---|---|
| `p2_pmlfilebrowser` | ✅ | Canonical from ramExcelReaderClass.pmlobj; import nuance documented |
| `p2_displayprogress` | ✅ | !!displayProgress + !!FMSYS pattern |
| `p2_syscom` | ✅ | Sync/async documented; & pattern noted |
| `p2_array_evaluate_block` | ✅ | !evalIndex pattern; self-shorthand pitfall documented |
| `p2_form_7callbacks` | ✅ | 6 standard + optional openCall; research correction applied |

## Resolved Issues

1. Form callbacks corrected from 7 to 6 standard + optional openCall
2. SYSCOM async pattern clarified (trailing &)
3. PMLFILEBROWSER import requirement documented
4. ID format: snake_case retained (no kebab-case migration)
5. Perplexity KB: used existing `docs/perplexity_pml_knowledge_base.md`

## Unresolved Gaps

1. `ARRAY.reIndex()` / `sortedIndices()` — verified from codebase but not from official docs
2. `NETGRIDCONTROL` full API — partial, based on codebase only
3. Some `exampleAntipattern` entries may not have real codebase counter-examples
4. `MEASURE`/`UNIT` API limited to single codebase pattern

## Recommendations for v3

1. Add more entries from other project codebases beyond Ramboll
2. Verify `ARRAY.reIndex()` / `sortedIndices()` against official documentation
3. Expand `NETGRIDCONTROL` with full method reference
4. Add PML1 compatibility notes to each entry
5. Consider adding `severity` field for pitfall importance rating
6. Add `version_added` field for tracking entry history
