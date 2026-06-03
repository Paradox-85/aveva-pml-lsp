# KB v3 Gap Analysis

## Resolved in v3

- Restored Claude KB fields from docs/claude_pml_knowledge_base.md.
- Added mandatory Perplexity p2 IDs.
- Replaced generic placeholder text generated in v2.
- Added stricter validation targets for mandatory IDs and placeholder phrases.

## Remaining evidence caveats

- p2_array_reindex: Perplexity-derived; codebase contains evaluate/sortUnique fallback, official reIndex/sortedIndices docs still need confirmation.
- p2_netgrid_full: detailed API is .NET/version-specific; codebase confirms NETGRID usage but not every method in prompt.
- p2_measure_unit: official object API confirmed externally, local codebase evidence is conversion-centric rather than a full UNIT workflow.
- p2_pmltags: official API pattern confirmed externally, local codebase evidence is export/tag workflow rather than direct full API snippet.

## Duplicate canonical example groups > 5

None
