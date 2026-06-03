# PML Knowledge Base v3

## Overview

PML KB v3 is the remediated Knowledge Base implementation for the MCP server. It replaces the v2 scaffold/placeholder content with source-preserving Claude KB entries, mandatory Perplexity `p2_*` patterns, stronger validation, and smoke-tested search/context matching.

## Scope

- **Total entries:** 118
- **Categories:** 18
- **Claude KB coverage:** 87/87 source IDs present
- **Mandatory Perplexity `p2_*` coverage:** 18/18 present
- **Primary code evidence:** `docs/codebase/**/*.pml*`
- **Validation command:** `npm run validate:kb`

## Category Coverage

| Category | Entries | Notes |
|---|---:|---|
| `datatypes` | 8 | Claude data types restored |
| `controlflow` | 7 | Claude control flow + `p2_null_scope` |
| `errorhandling` | 6 | HANDLE/ENDHANDLE, `!!error.text` |
| `objects` | 8 | Object definitions, members, constructors, delegation |
| `forms` | 13 | Form callbacks + `p2_form_7callbacks` + `p2_netgrid_full` |
| `macros` | 7 | Macro structure, arguments, pipeline/global patterns |
| `functions` | 5 | Function definitions, returns, array accumulator |
| `dotnetinterop` | 10 | .NET import patterns + PMLFILEBROWSER/PMLTAGS/MEASURE/UNIT |
| `pdmsinteraction` | 10 | DBREF, transactions, dynamic attributes, BACKREF |
| `namingconventions` | 5 | Variable/object/method/file/prefix conventions |
| `typeconversion` | 6 | Conversion patterns + `999999999 -> NA` |
| `logging` | 5 | ramCommonLogger patterns and output targets |
| `architecturepatterns` | 7 | Loader chain, separation, progress |
| `arrays` | 9 | ARRAY methods + evaluate/reindex patterns |
| `collections` | 4 | PML1 COLLECT/EVALUATE + PML2 COLLECTION notes |
| `datetime` | 3 | DATETIME, DATEFORMAT, file timestamps |
| `ui` | 3 | Widget prefixes, layout, show/hide |
| `syscom` | 2 | SYSCOM external commands/open-file patterns |

## Required Perplexity Entries

All mandatory Perplexity-derived IDs are present:

- `p2_pmlfilebrowser`
- `p2_displayprogress`
- `p2_syscom`
- `p2_pmltags`
- `p2_measure_unit`
- `p2_array_evaluate_block`
- `p2_array_reindex`
- `p2_evaluate_pml1`
- `p2_collect_pml1`
- `p2_datetime_api`
- `p2_dateformat`
- `p2_form_7callbacks`
- `p2_netgrid_full`
- `p2_attribute_dynamic`
- `p2_widget_prefix`
- `p2_backref`
- `p2_na_replacement`
- `p2_null_scope`

## Source Priority

1. `docs/codebase/**` — production PML examples and project-specific patterns.
2. Official AVEVA documentation / TM-1401 / TM-1402 / `docs/combined_pml_reference.md`.
3. `docs/claude_pml_knowledge_base.md` and `docs/perplexity_pml_knowledge_base.md`.
4. General PML knowledge only when explicitly marked as lower-confidence.

## MCP Tools

### `pml_kb_by_category`

```json
{ "category": "arrays" }
```

Returns entry summaries for the category.

### `pml_kb_search`

```json
{ "query": "PMLFILEBROWSER", "limit": 5 }
```

Weighted full-text search across IDs, aliases, title, rule, syntax, examples and pitfalls.

### `pml_kb_get`

```json
{ "id": "p2_pmlfilebrowser" }
```

Returns a full KB entry by ID or alias.

### `pml_kb_related`

```json
{ "id": "p2_backref", "limit": 5 }
```

Returns related entries through `relatedIds`.

### `pml_kb_antipatterns`

```json
{ "category": "syscom" }
```

Returns entries with documented anti-patterns.

### `pml_diagnose`

Master prompt contract:

```json
{ "errorText": "HANDLE 41,8 error occurred" }
```

Backward-compatible alias is also accepted:

```json
{ "error_text": "SYSCOM copy failed" }
```

## Validation v3

`npm run validate:kb` now checks:

- all 87 Claude IDs are present;
- all 18 mandatory `p2_*` IDs are present;
- unique IDs and aliases;
- category belongs to 18 allowed categories;
- required fields are non-empty;
- no placeholder/gap markers such as `NOT_FOUND_IN_SOURCES` or generic v2 text;
- `exampleCanonical` contains `-- CB <sourcecodebase>`;
- referenced `sourcecodebase` exists under `docs/codebase/**`;
- all `relatedIds` resolve;
- duplicate canonical examples are not reused by more than 5 entries;
- search smoke queries return expected entries;
- context matcher smoke snippets return expected entries.

## Known v3 Caveats

- `p2_array_reindex`: Perplexity-derived; local codebase confirms evaluate/sortUnique fallback, but official `reIndex/sortedIndices` documentation still needs confirmation.
- `p2_netgrid_full`: NETGRIDCONTROL is confirmed in codebase, but the detailed .NET API is version-specific.
- `p2_measure_unit`: official UNIT/MEASURE API is documented, while local codebase evidence is conversion-centric.
- `p2_pmltags`: official API pattern is documented; local evidence is tag/export workflow rather than a compact full API snippet.
