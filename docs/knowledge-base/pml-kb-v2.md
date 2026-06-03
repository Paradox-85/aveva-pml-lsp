# PML Knowledge Base v2

> Superseded by [`pml-kb-v3.md`](pml-kb-v3.md). v2 is kept for historical comparison; v3 contains the remediated KB with restored source content, mandatory `p2_*` entries and stricter validation.

## Overview

Structured knowledge base for AVEVA PML (Programmable Macro Language) integrated into the `aveva-pml-lsp` MCP server. Contains **110 entries** across **18 categories**, sourced from official documentation (TM-1401, TM-1402) and real codebase examples (Ramboll JDE/EIS projects).

## Categories

| Category | Description | Entries |
|---|---|---|
| `datatypes` | STRING, REAL, ARRAY, BOOLEAN, DBREF, UNSET | 8 |
| `controlflow` | IF/ELSEIF, DO/ENDDO, BREAK/SKIP, RETURN | 6 |
| `errorhandling` | HANDLE/ENDHANDLE, error variables, import protection | 6 |
| `objects` | .pmlobj definition, constructor, methods, overloading | 8 |
| `forms` | .pmlfrm structure, callbacks, widgets, lifecycle | 12 |
| `macros` | .pmlmac structure, arguments, file paths, pipelines | 7 |
| `functions` | .pmlfnc definition, return values, arguments | 5 |
| `dotnetinterop` | .NET imports, PMLFILEBROWSER, GridControl, Excel | 8 |
| `pdmsinteraction` | CE, navigation, attributes, transactions, DBREF | 8 |
| `namingconventions` | Variable/object/method naming, prefixes, conventions | 5 |
| `typeconversion` | DB→PML mapping, string/real/date conversion | 5 |
| `logging` | ramCommonLogger, severity levels, form integration | 5 |
| `architecturepatterns` | Loader chain, separation of concerns, progress | 7 |
| `arrays` | ARRAY methods, iteration, sorting, evaluate block | 8 |
| `collections` | COLLECT (PML1), COLLECTION (PML2), EVALUATE | 4 |
| `datetime` | DATETIME creation, DATEFORMAT, file timestamps | 3 |
| `ui` | Gadget positioning, form layout, widget types | 3 |
| `syscom` | SYSCOM external commands, sync/async patterns | 2 |

## Source Priority

1. **Codebase** — real PML files in `docs/codebase/` (highest priority)
2. **Official docs** — TM-1401 Rev 3.0, TM-1402 Rev 1.0
3. **General knowledge** — community patterns and best practices

## MCP Tools

### pml_kb_by_category

List all entries for a given category.

```json
Input: { "category": "arrays" }
Output: [{ "id": "arr_methods", "title": "...", "subcategory": "methods" }, ...]
```

### pml_kb_search

Full-text weighted search across all KB fields.

```json
Input: { "query": "HANDLE error", "limit": 5, "category": "errorhandling" }
Output: [{ "id": "eh_handle_endhandle", "score": 15, "matchedField": "id", ... }, ...]
```

### pml_kb_get

Get a single entry by ID or alias.

```json
Input: { "id": "p2_pmlfilebrowser" }
Output: { "id": "p2_pmlfilebrowser", "category": "dotnetinterop", ... }
```

### pml_kb_related

Get related entries for a given entry.

```json
Input: { "id": "eh_handle_endhandle", "limit": 5 }
Output: [{ "id": "eh_handle_any", "title": "...", ... }, ...]
```

### pml_kb_antipatterns

List entries with documented anti-patterns.

```json
Input: { "category": "datatypes" }
Output: [{ "id": "dt_string_declaration", "antipattern": "..." }, ...]
```

### pml_diagnose

Diagnose a PML error message and suggest relevant KB entries.

```json
Input: { "error_text": "HANDLE 41,8 error" }
Output: [{ "pattern": "...", "description": "...", "suggestions": [...] }, ...]
```

## Validation

Run `npm run validate:kb` to validate:

- Unique IDs and aliases
- Valid categories (18 allowed)
- Non-empty required fields
- `exampleCanonical` contains `-- CB <filename>`
- `pitfalls` has at least 1 element
- All `relatedIds` exist
- `sourcecodebase` files exist in `docs/codebase/`

## Known Corrections (from research)

1. **Form callbacks**: 6 standard callbacks (initCall, firstShownCall, okCall, cancelCall, quitCall, killingCall) + optional/project-specific `openCall`
2. **SYSCOM**: Synchronous by default; `SYSCOM |command &|` for async (trailing &)
3. **PMLFILEBROWSER**: Requires `import 'pmlfilebrowser'` + `using namespace 'Aveva.Core.Presentation'` in some versions
4. **DATETIME constructors**: `object DATETIME(year, month, day)` and `object DATETIME(year, month, day, hour, min, sec)`
5. **ARRAY.evaluate(BLOCK)**: Uses `!evalIndex` special variable, requires `!array[!evalIndex]` (not self-shorthand)
