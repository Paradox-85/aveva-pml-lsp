# KB Review Report v3

**Date:** 2026-06-03  
**Status:** Remediated and validated

## Summary

| Metric | Value |
|---|---:|
| Total entries | 118 |
| Categories | 18 |
| Claude KB IDs present | 87/87 |
| Required Perplexity `p2_*` IDs present | 18/18 |
| Placeholder/generic markers | 0 |
| Validation issues | 0 |
| Test count | 65 passed |

## What changed from v2

1. Restored source content from `docs/claude_pml_knowledge_base.md` instead of using generic placeholder text.
2. Added all mandatory Perplexity-derived `p2_*` entries.
3. Replaced generic anti-patterns with PML-specific anti-patterns.
4. Added `docs/knowledge-base/extraction-report-v3.md` and `docs/knowledge-base/gap-analysis-v3.md`.
5. Hardened `src/knowledge/validation/validate-kb.ts` to catch missing required IDs, placeholders, bad examples, unresolved relations, search gaps and context-match gaps.
6. Fixed `pml_diagnose` master prompt contract to accept `errorText`; kept `error_text` as backward-compatible alias.
7. Fixed context matching for key PML tokens such as SYSCOM, PMLFILEBROWSER, COLLECT, BACKREF and NETGRIDCONTROL.

## Category Coverage

| Category | Entries | Codebase Coverage |
|---|---:|---|
| datatypes | 8 | ramValueConverter.pmlobj, RAMTagMaturityData.pmlobj |
| controlflow | 7 | createObjectsFromExcelSheet.pmlfnc, JDE macros |
| errorhandling | 6 | ramValueConverter.pmlobj, ramCommonLogger.pmlobj |
| objects | 8 | ramCommonLogger.pmlobj, ramValueConverter.pmlobj, loader objects |
| forms | 13 | ramImportExcelProcessor.pmlfrm, validation/logger forms |
| macros | 7 | JDE/EIS routine and export macros |
| functions | 5 | createObjectsFromExcelSheet.pmlfnc, jacExportRDLDataReport.pmlfnc, ramGetBackRef.pmlfnc |
| dotnetinterop | 10 | ramExcelReaderClass.pmlobj, file writer/value converter, EIS export workflow |
| pdmsinteraction | 10 | ramTagManagement.pmlobj, ramGetBackRef.pmlfnc, import element loader patterns |
| namingconventions | 5 | project-wide ram/jac/JDE/EIS/EBE conventions |
| typeconversion | 6 | ramValueConverter.pmlobj, EIS export normalization |
| logging | 5 | ramCommonLogger.pmlobj, ramCommonLoggerForm.pmlfrm |
| architecturepatterns | 7 | ramImportExcelProcessor loader chain, JDE/EIS pipelines |
| arrays | 9 | ramCommonLogger.pmlobj, JDE_pipeData_export.pmlmac |
| collections | 4 | ramGetBackRef.pmlfnc, JDE_pipeData_export.pmlmac |
| datetime | 3 | EIS_data_export.pmlmac |
| ui | 3 | ramImportExcelProcessor.pmlfrm |
| syscom | 2 | EIS_data_export.pmlmac, ramFileWriterClass.pmlobj |

## Required `p2_*` Status

| Entry | Status | Notes |
|---|---|---|
| `p2_pmlfilebrowser` | ✅ | Codebase + import/version nuance |
| `p2_displayprogress` | ✅ | Progress/interrupt/reset pitfalls |
| `p2_syscom` | ✅ | Quoting, sync/async `&`, output verification |
| `p2_pmltags` | ✅ | Official/API-derived, codebase tag/export workflow |
| `p2_measure_unit` | ✅ | Official/API-derived, conversion-centric codebase evidence |
| `p2_array_evaluate_block` | ✅ | Codebase BLOCK/evalIndex example |
| `p2_array_reindex` | ✅ | Added with caveat: official docs still need confirmation |
| `p2_evaluate_pml1` | ✅ | PML1 bulk query pattern |
| `p2_collect_pml1` | ✅ | BACKREF/COLLECT PML1 style example |
| `p2_datetime_api` | ✅ | DATETIME constructor/component pattern |
| `p2_dateformat` | ✅ | DATEFORMAT + formatting caveat |
| `p2_form_7callbacks` | ✅ | Corrected to 6 standard + optional/project-specific openCall |
| `p2_netgrid_full` | ✅ | Codebase NETGRID workflow + API caveat |
| `p2_attribute_dynamic` | ✅ | Dynamic `.attribute(name)` with HANDLE guard |
| `p2_widget_prefix` | ✅ | Project widget prefix convention |
| `p2_backref` | ✅ | ramGetBackRef canonical pattern |
| `p2_na_replacement` | ✅ | EIS sentinel export normalization |
| `p2_null_scope` | ✅ | ifdefined/ifundefined scope distinction |

## Validation Evidence

Commands run:

```bash
npm run typecheck
npm test -- --run
npm run validate:kb
```

Observed result:

- TypeScript typecheck: pass
- Vitest: 65 tests passed
- KB validator: 118 entries, 18 categories, 0 issues

## Remaining Gaps / Caveats

1. `p2_array_reindex`: needs official AVEVA confirmation for exact `reIndex/sortedIndices` API in the target Plant version.
2. `p2_netgrid_full`: NETGRIDCONTROL detailed API is .NET/version-specific; codebase evidence covers workflow, not every property listed in the prompt.
3. `p2_pmltags`: local codebase evidence is tag/export workflow; a compact direct PMLTAGS code snippet should be added when available.
4. `p2_measure_unit`: local codebase evidence is value-conversion oriented; a direct UNIT/MEASURE snippet should be added when available.

## Recommendations for v4

1. Add confidence/source fields (`codebase`, `official`, `perplexity-only`) to `KBEntry`.
2. Add line references for `exampleCanonical` snippets.
3. Add a generated JSON artifact in addition to TypeScript modules for easier diff/review.
4. Add exact MCP integration tests against a running FastMCP server transport.
