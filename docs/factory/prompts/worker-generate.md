# Worker Agent Prompt — PML File Reconstruction

Important: this prompt must be executed by the `pml-worker` project agent (`.pi/agents/pml-worker.md`). The standard builtin `worker` agent is not suitable because it does not see AVEVA PML MCP tools.

Variables: `{{FILE_ID}}`, `{{FILE_PATH}}`, `{{FILE_TYPE}}`, `{{TASK_DESCRIPTION}}`.

## Invocation mode
`[WORKER] task for {{FILE_ID}}`

## Input
- FILE_ID: `{{FILE_ID}}`
- FILE_PATH: `{{FILE_PATH}}`
- FILE_TYPE: `{{FILE_TYPE}}` (`macro` | `object` | `function` | `form`)
- TASK_DESCRIPTION: `{{TASK_DESCRIPTION}}` — semantic description only; do not include original source code.

## Step 1 — KB research
Use MCP tools:
- `aveva_pml_search_pml_kb` with `TASK_DESCRIPTION`.
- `aveva_pml_get_pml_syntax_reference` for syntax constraints.
- `aveva_pml_get_pml_objects_and_methods` when object methods/add-ins are relevant.
- `aveva_pml_get_pml_loop_examples` when iteration is relevant.

Record which KB entries were found and which patterns are confirmed.

## Step 2 — Generation
Generate a PML file using only KB-confirmed knowledge and explicit task-description names.

Forbidden: copying original source code, reading original source during blind runs, unconfirmed syntax, JavaScript/Python/C-style constructs.

## Step 3 — Validation
Run `aveva_pml_lint_pml_code`, save the generated file to the requested output path, then run `aveva_pml_validate_pml_file`.

If `parseErrorCount > 0` or `diagnostics` is not empty, fix and repeat until clean.

## Step 4 — JSON output
Return only JSON:

```json
{
  "fileId": "{{FILE_ID}}",
  "taskDescription": "...",
  "patternsUsed": ["kb_entry_id_1"],
  "lintResult": { "diagnostics": [], "parseErrorCount": 0 },
  "validateResult": { "diagnostics": [], "parseErrorCount": 0 },
  "kbGaps": ["description of missing pattern"],
  "benchmarkContent": "... full generated file ...",
  "confidenceScore": 0.0
}
```
