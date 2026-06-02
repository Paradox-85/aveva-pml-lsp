# Plan: PML Knowledge Base Enrichment from Official AVEVA Manuals

Date: 2026-05-29
Repo: `C:\Work\Development\bami\bami-tech\aveva-automation\clients\bami\rnd\pml-lsp`
Manuals: `C:\Work\Development\_source\_manuals & trainings\AVEVA\02_trainings & manuals`
Extraction temp: `C:\Temp\pml-kb-extract`

## Scope

Enrich the PML LSP knowledge base and source data from local official/manual training documents. The work includes extraction, analysis, writing/updating KB markdown/JSON/snippets, updating TypeScript data files, validation, then commit/push only after a final approval checkpoint.

## Orchestration Model

- Orchestrator: coordinates all phases, keeps approval gates, final git commit/push.
- ExtractorAgent: scans manuals and extracts raw text to `C:\Temp\pml-kb-extract`.
- AnalystAgent: categorizes extracted text into KB-ready sections A–K.
- WriterAgent: performs approved repository edits.
- ValidatorAgent: reviews final output, runs validations, reports blockers.

Only one writer will modify the repository at a time. Reviewer/validator agents are read-only.

## Phase 0 — Baseline and Safety

1. Check repository status and current branch.
2. Inspect existing structures:
   - `knowledge/official/`
   - `knowledge/official/code-examples-corpus.json`
   - `knowledge/snippets/pml.json`
   - `src/core/data/pdmsCommands.ts`
   - TypeScript config/package scripts.
3. Record any pre-existing modified files; do not overwrite unrelated user changes.

Approval required only if the working tree contains unrelated modifications that could conflict.

## Phase 1 — Extraction

1. Recursively scan manuals directory for:
   - `.pdf`
   - `.doc`
   - `.docx`
2. Prioritize known files:
   - `TM-1401-AVEVA-Plant-12-Series-Programmable-Macro-Language-Basic-Rev-3.0.pdf`
   - `TM-1401-AVEVA-Plant-12-Series-PML-Macros-and-Functions-Rev-2.0.pdf`
   - `TM-1402-AVEVA-Plant-12-Series-PML-Form-Design-Rev-1.0.pdf`
   - `PML-Basics-Part-1-3.pdf`
   - `Spravochnik-po-PML-5.pdf`
   - `PML-Trainer-notes-4.pdf`
   - `PML-2-Overview-PML-Guru-Aveva-PDMS-2.pdf`
   - `Proekty-AVEVA-E3D-Instruktsiia_rev21-Night-Macroses-9.pdf`
   - `PML.docx`
3. Use Python extraction:
   - PDF: try `PyMuPDF` (`fitz`) first; fall back to `pdfplumber` if available.
   - DOCX: use `python-docx`.
   - DOC: attempt available local conversion/read method; if unavailable, log as failed extraction without failing the whole mission.
4. Save each extracted text as:
   - `C:\Temp\pml-kb-extract\<safe-relative-filename>.txt`
5. Produce extraction inventory:
   - scanned file path
   - extension
   - output `.txt` path
   - character count
   - extraction status
   - error message if failed

Artifacts under temp only; no extracted raw manuals/text will be committed.

## Phase 2 — Analysis and Categorization

Analyze extracted text and build a structured evidence map for categories A–K:

- A: Syntax & Language Reference
- B: Variables & Types
- C: Control Flow
- D: Error Handling
- E: Arrays
- F: Collections (PML1/PML2)
- G: FMSYS/CMSYS/Special System Objects
- H: Forms (PMLFRM)
- I: FILE Object
- J: DABACON Database Navigation & Attributes
- K: Best Practices & Coding Patterns

For each item, collect:
- source file name
- matching text/code example
- normalized summary
- target KB file
- suitability for `code-examples-corpus.json`

Create temporary analysis artifact:
- `C:\Temp\pml-kb-extract\analysis\2026-05-29_pml-kb-analysis.md`

## Phase 3 — Repository Writing

### Update existing files

1. `knowledge/official/syntax-reference.md`
   - dollar symbols table
   - `$R` trace levels
   - PML1/PML2 operators and comparisons
   - comments and concatenation

2. `knowledge/official/objects-and-methods.md`
   - FMSYS/CMSYS methods
   - FILE object methods
   - COLLECTION object
   - ARRAY object
   - UNDOABLE object

3. `knowledge/official/best-practices.md`
   - comments, naming, error handling, tracing, collections, reload, badref, undo pattern

4. `knowledge/official/forms-and-ui.md`
   - form definition/show/hide patterns
   - gadgets, callbacks, menus, docking/anchoring, progress UI

### Create new files

5. `knowledge/official/dabacon-reference.md`
6. `knowledge/official/control-flow-reference.md`
7. `knowledge/official/variables-and-types.md`
8. `knowledge/official/collections-reference.md`
9. `knowledge/official/arrays-reference.md`

Each KB file must be substantive (>500 chars), source-grounded, and free of placeholders.

### Update JSON corpus

10. `knowledge/official/code-examples-corpus.json`
    - preserve existing schema
    - add at least 50 new entries
    - categories: `control-flow`, `variable`, `collection`, `form`, `file`, `fmsys`, `error-handling`, `array`, `dabacon`
    - prioritize real production/manual examples from `PML.docx`, TM-1401, TM-1402, PML-Basics, Spravochnik, Trainer Notes, E3D Macros.

### Update snippets

11. `knowledge/snippets/pml.json`
    - add 11 snippets:
      - `pml-handle-any`
      - `pml-do-values`
      - `pml-do-indices`
      - `pml-collection`
      - `pml-collectallfor`
      - `pml-file-write`
      - `pml-fmsys-progress`
      - `pml-undoable`
      - `pml-if-elseif`
      - `pml-define-function`
      - `pml-define-object`

## Phase 4 — LSP Source Updates

1. Update `src/core/data/pdmsCommands.ts`:
   - add `PML_DOLLAR_COMMANDS`
   - add `DABACON_PSEUDO_ATTRS`
   - add `NAVIGATION_KEYWORDS`
   - preserve existing exports and behavior.

2. Create `src/core/data/systemObjects.ts`:
   - `FmsysMethods`
   - `ArrayMethods`
   - `StringMethods`
   - `FileMethods`
   - `CollectionMethods`
   - `UniversalMethods`

Check whether project naming conventions prefer PascalCase vs uppercase constants before finalizing.

## Phase 5 — Validation

ValidatorAgent must verify:

- all 9 KB files exist and each has >500 chars
- JSON files parse successfully:
  - `knowledge/official/code-examples-corpus.json`
  - `knowledge/snippets/pml.json`
- corpus has at least 50 newly added entries
- all 11 snippets exist
- no placeholder/stub text in KB files, including:
  - `TODO`
  - `PLACEHOLDER`
  - obvious ellipsis-only pseudo-content where real content is expected
- code examples contain actual PML-like code
- `src/core/data/systemObjects.ts` compiles
- `src/core/data/pdmsCommands.ts` includes requested exports
- run project validation:
  - TypeScript no-emit/typecheck command available in package scripts, or `tsc --noEmit`
  - `npm test`
- inspect final diff for unrelated changes.

## Phase 6 — Approval Before Commit/Push

Before any git commit/push, report:

1. extracted/scanned manual list and failed extractions
2. changed/created KB files with character counts
3. number of corpus examples added
4. number of snippets added
5. number of system object methods registered
6. validation command results
7. final `git diff --stat`

Wait for explicit approval before committing and pushing.

## Phase 7 — Commit and Push

After approval:

1. Stage only intended paths:
   - `knowledge/official/`
   - `knowledge/snippets/pml.json`
   - `src/core/data/`
2. Commit with the requested message.
3. Push to `origin main` as requested, unless current branch protection or repo state requires clarification.
4. Report final commit SHA and push result.

## Risks / Watch Points

- Some PDFs may be scanned/image-only; if OCR tools are unavailable, log them as extraction failures rather than fabricating content.
- `.doc` extraction may require external tooling not installed; failures must be reported.
- Avoid committing raw extracted text, manuals, binaries, archives, generated build output, or customer data dumps.
- Manuals may contain copyrighted text; KB should summarize and quote only practical snippets/examples needed for LSP knowledge, not bulk-copy entire manuals.
- Existing JSON schema may differ from the requested sample; preserve actual schema compatibility.
- `npm test` may expose pre-existing unrelated failures; separate those from introduced failures.

## Approval Gate

Implementation must not begin until the user explicitly replies with approval such as `go`, `ok`, `run`, `start`, or `yes`.
