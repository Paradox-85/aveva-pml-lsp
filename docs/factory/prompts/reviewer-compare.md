# Reviewer Agent Prompt — Gap Analysis

Important: this prompt must be executed by the `pml-worker` project agent (`.pi/agents/pml-worker.md`).

Variables: `{{FILE_ID}}`, `{{FILE_PATH}}`, `{{DATE}}`, `{{ORIGINAL_CONTENT}}`, `{{BENCHMARK_CONTENT}}`, `{{WORKER_KB_GAPS}}`, `{{WORKER_PATTERNS_USED}}`.

## Invocation mode
`[REVIEWER] task for {{FILE_ID}}`

## Gap dimensions
Analyze all seven dimensions.

### D1: SYNTAX GAPS
Syntax constructs used by the original that are absent, wrong, or underrepresented in KB/parser support. Verify snippets with `aveva_pml_lint_pml_code` when possible.

### D2: PATTERN GAPS
Patterns from the original that the Worker did not find in KB. Include name, original line references, and suggested KB ID. Verify with `aveva_pml_search_pml_kb`.

### D3: STRUCTURE GAPS
Structural differences: method order, lifecycle, setup/execute/finalize flow, error handling scope, object member organization.

### D4: NAMING GAPS
Naming conventions not reflected in KB: globals, locals, object names, forms, functions, customer/project prefixes.

### D5: LOGIC GAPS
Boundary conditions and runtime logic not reproduced: `UNSET`, `BADREF`, fallback attributes, delete/update/new classification, error recovery.

### D6: DEPENDENCY GAPS
External dependencies without KB coverage: `.pmlobj`, `.pmlfnc`, forms, .NET add-ins, AVEVA module objects, custom globals.

### D7: KB COMPLETENESS
Draft new KBEntry objects for real gaps found in D1-D6:

```json
{
  "suggestedId": "...",
  "category": "...",
  "subcategory": "...",
  "title": "...",
  "principle": "...",
  "rule": "...",
  "syntax": "...",
  "exampleCanonical": "-- CB {{FILE_NAME}}\n...",
  "exampleAntipattern": "...",
  "pitfalls": [],
  "relatedIds": [],
  "sourcedoc": "...",
  "sourcecodebase": "{{FILE_NAME}}"
}
```

## Output format
Return only JSON:

```json
{
  "fileId": "{{FILE_ID}}",
  "filePath": "{{FILE_PATH}}",
  "reviewDate": "{{DATE}}",
  "overallGapScore": 0.0,
  "dimensions": {
    "D1_syntax": { "score": 0.0, "gaps": [] },
    "D2_patterns": { "score": 0.0, "gaps": [] },
    "D3_structure": { "score": 0.0, "gaps": [] },
    "D4_naming": { "score": 0.0, "gaps": [] },
    "D5_logic": { "score": 0.0, "gaps": [] },
    "D6_dependencies": { "score": 0.0, "gaps": [] },
    "D7_kbCompleteness": { "newEntriesNeeded": [] }
  },
  "actionRequired": "patch_kb | rerun_worker | skip | manual_review"
}
```
