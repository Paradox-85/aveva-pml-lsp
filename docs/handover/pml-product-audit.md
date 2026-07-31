# External audit of pml-lsp — product, code, documentation, readiness for an AVEVA session

**Auditor:** independent read-only review subagent (review type #4 — current overall state of the codebase)
**Repository:** `aveva-automation/clients/bami/rnd/pml-lsp` (branch `main`, HEAD `cfe9dbe`)
**Audit date:** 2026-07-31
**Method:** read-only inspection + execution of `npm run validate:kb`, `tsc --noEmit`, `vitest run` (no code edits)
**Input context:** `.pi/context/20260731-090656-pml-product-audit-context.md` (read in full)

---

## 1. Executive summary

The repository is a **standalone MCP server** for static analysis of PML 1/2 (not a real LSP despite the name). The architecture is clean and layered; the parser→AST→diagnostics core is mature; the KB validator is the most "production-shaped" part. The baseline quality check is **green**:

| Gate | Result | Evidence |
|---|---|---|
| `tsc --noEmit` | ✅ PASS (exit 0) | executed during the audit |
| `vitest run` | ✅ 65/65 tests, 5 files | `tests/{mcp,parser,diagnostics,knowledge}/*` |
| `npm run validate:kb` | ✅ **328 entries / 18 categories / 0 issues** | validator output (see §3.6) |

**Main product conclusion:** the static "half" of the loop (write PML → validate statically → search KB) is working and mature. The "half" run→read-logs→fix against a live AVEVA/Avivo session is **completely absent** (0 lines of runtime code).

**Most serious discrepancy (proven):** the documentation and README claim **KB v3 = 118 entries** (`README.md:63`), but the **actually committed code = KB v4 = 328 entries** (commit `cfe9dbe`, confirmed by running the validator). The v4-import **was applied to the production code** `src/knowledge/pml-kb/*.ts` — this closes the context's "Open Question #1". The README systemically lags behind the code.

**Key risks for the receiving developers:** (1) documentation drift; (2) 7 of 12 test files (the densest AST corpus) are disabled in CI and contain 3 broken imports; (3) `validate_pml_file` reads an arbitrary path from disk — an RCE/path-traversal surface for an untrusted MCP client; (4) `search_pml_kb` rescans all `knowledge/` files on every call; (5) dead code and junk artifacts (`github-kb.ts`, the `nul` file).

---

## 2. Solution map / manifesto draft (for handoff to developers)

```
pml-lsp = MCP server for static PML intelligence (NOT LSP, NOT a editor)
├── WHAT IT IS
│   • Offline, stateless-per-call, read-only code analysis + KB search
│   • Transport: stdio (default) | Streamable HTTP (--http-stream :8080)
│   • Platform: OS-agnostic Node >=20.19, ESM/NodeNext, TS strict
├── CORE (mature, VS Code-independent) — src/core/
│   • lexer → parser (recursive descent, 5 modes by extension)
│   • AST nodes → diagnostics engine (5 rule families)
│   • static tables: PDMS commands, system objects/methods
├── MCP SURFACE — src/mcp/ (9 tools, 3 resources, 2 prompts)
│   • lint_pml_code | validate_pml_file | search_pml_kb
│   • pml_kb_{by_category,search,get,related,antipatterns} | pml_diagnose
├── KNOWLEDGE — src/knowledge/ + knowledge/
│   • 328 structured KB entries / 18 categories (KB v4, committed)
│   • weighted-substring fuzzy search, context-match, error-diagnose
│   • standalone validator (required IDs, placeholders, -- CB canon, smoke)
├── WHAT IT IS NOT
│   • Not an LSP server (no textDocument/*, UTF-16, incremental sync)
│   • Does not attach to AVEVA (no spawn/COM/OLE/socket-bridge)
│   • Does not execute PML, does not read runtime logs, has no feedback-loop
└── ORIGIN
    • Core adapted from mikhalchankasm/vscode-pml-aveva-e3d (MIT)
    • djee79/pml-lsp excluded on licensing; clone under temp/ (in the tree)
```

**Positioning (honest):** "foundation/bootstrap MCP server for static PML intelligence and KB search". The documentation already says so (`README.md:135`), but the numeric facts are stale.

---

## 3. Current status by subsystem

### 3.1 Transport and bootstrap — `src/server.ts` (34 LOC)
**Status: mature.** FastMCP, registers 9 tools/3 resources/2 prompts. Transport selection via `--http-stream` or `MCP_TRANSPORT=httpStream`, port `PORT ?? 8080`. Evidence: `src/server.ts:122-140`.

### 3.2 MCP tools — `src/mcp/tools.ts` + `pml-kb-tools.ts`
**Status: working, with reservations.** 3 base + 6 KB = 9 tools. Results are returned as `JSON.stringify(...)` (strings, not typed MCP content objects) — acceptable with FastMCP/zod, but loses the typed surface. Evidence: `src/mcp/tools.ts:114` `export const tools = [..., ...pmlKbTools]`.

### 3.3 Diagnostics engine — `src/core/diagnostics/engine.ts`
**Status: mature.** `lintPmlCode` composes 5 families: parse-errors → typo (Levenshtein) → array-index (`arr[0]` — PML 1-based) → form-references → hallucination-guard (`for(` C-style). Returns `{ diagnostics, astNodeCount, parseErrorCount }`.

### 3.4 Parser/lexer/AST — `src/core/parser/*`, `src/core/ast/nodes.ts`
**Status: mature, large.** recursive-descent parser with error recovery, modes by URI extension (`.pmlobj/.pmlfrm/.pmlfnc/.pmlcmd`). Evidence: `parser.ts:32-57` `parserModeFromUri`.

### 3.5 KB data/search — `src/knowledge/search/*`
**Status: prototype.** `fuzzy-search.ts` — naive weighted substring scoring (weights 10..2) without index/embeddings; `context-match.ts` — regex token→entry; `diagnose.ts` — static table of 12 error patterns. Enough for a small corpus, not robust to stemming/typos in queries.

### 3.6 KB v4 — `src/knowledge/pml-kb/*.ts` + `validate-kb.ts`
**Status: committed, valid.** Authoritative count by the validator (run during the audit):

```
Total entries: 328   Categories: 18   Issues: 0
pdmsinteraction:43 objects:41 datatypes:35 dotnetinterop:33 macros:30
controlflow:26 forms:20 errorhandling:20 arrays:12 architecturepatterns:11
typeconversion:11 ui:10 arrays... [18 categories, total 328]
```

The validator (`npm run validate:kb`) — the strongest "production-shaped" element: checks required Claude/Perplexity IDs, placeholders, the canonical `-- CB <sourcecodebase>`, reachability of relatedIds, duplicates, smoke-search. Non-zero exit on any error.

### 3.7 Tests — `tests/` vs `src/core/**/__tests__/`
**Status: green, but with a hole.** `vitest run` = 65/65 PASS. **BUT** 7 test files under `src/core/**/__tests__/` are disabled in both vitest and tsconfig (`vitest.config.ts:9`, `tsconfig.json:13`) — including `corpusSnapshot.test.ts` (the densest AST corpus) and `formFixtures.test.ts`. Three of them contain **broken relative imports**.

### 3.8 Containerization — `Dockerfile`/`docker-compose.yml`
**Status: exists, not verified** (the audit did not run a container). The image is a thin stdio-Node; for live mode, proximity to the Windows host/COM is not solved.

---

## 4. Evidence-backed findings

### 🔴 BLOCKER

**B1. README/docs drifted: KB v3=118 is claimed, but actually KB v4=328 (committed).**
- Evidence: `README.md:63` "**118 entries** across **18 categories**"; `README.md` section heading "Knowledge Base v3".
- Counter-evidence (run during the audit): `npm run validate:kb` → `Total entries: 328 / Categories: 18 / Issues: 0`. The files `src/knowledge/pml-kb/*.ts` contain 328 entries.
- This closes the context's "Open Question #1": **the v4-import was applied to the production code** (commit `cfe9dbe`).
- Why a blocker: a receiving developer reading the README will get an incorrect map of the product; the category table with numbers (`README.md:99-126`) is systemically wrong (e.g. `objects` shown as 8, actually 41; `pdmsinteraction` shown as 10, actually 43).
- Fix: update the README (heading, numbers, link to the v4 doc), write the missing `docs/knowledge-base/pml-kb-v4.md` and a changelog (plan T11 — incomplete).

**B2. `validate_pml_file` reads an arbitrary path from disk without restrictions.**
- Evidence: `src/mcp/tools.ts:27-39` — `readFileSync(path, 'utf8')` on the `path` from the calling MCP client, without allow-list/sanitization.
- Risk: an untrusted MCP client (or prompt-injected agent) reads any file in the server's context (credentials, `/etc/shadow` analogues) → leak via the diagnostic message; a potential RCE vector on further processing.
- Fix: path validation/normalization, allow-list of extensions + root directory, an optional flag to enable disk reads, and documented threat-model.

### 🟡 NOTE (important)

**N1. 7 of 12 test files are disabled in CI; 3 contain broken imports.**
- Evidence: `vitest.config.ts:9` and `tsconfig.json:13` exclude `src/core/**/__tests__/**`. The disabled corpus: `corpusSnapshot.test.ts`, `formFixtures.test.ts`, `parser.test.ts` (duplicate), `arrayIndexChecker.test.ts`, `formReferenceValidator.test.ts`, `typoDetector.test.ts`, `pdmsCommands.test.ts`.
- Broken imports (relative path is wrong, should be `../../types.js`): `arrayIndexChecker.test.ts:9`, `formReferenceValidator.test.ts:1`, `typoDetector.test.ts:8` — all `from '../types.js'`.
- Risk: the densest AST/diagnostics check **never runs**; parser regressions are not caught in CI. If these tests are enabled "as-is", they will fail on the imports.
- Fix: repair the 3 imports → remove the exclusion → run; if some snapshots are stale, regenerate them.

**N2. `search_pml_kb` — O(all knowledge/ files) per call, no cache/index.**
- Evidence: `src/mcp/tools.ts:40-78` — `collectMarkdown(root)` recursively `readdirSync`+`readFileSync` of all `.md/.json/.pml*` (up to 50) on every call; the result is not cached.
- Irony: `src/github-kb.ts` contains a ready `TtlCache`, but it is **imported by nobody** (grep for `github-kb` in `src/`/`tests/` → 0 matches; exit 1) — dead code.
- Fix: index/cache the KB tree; reuse (or delete) `github-kb.ts`.

**N3. No E2E/integration harness at the MCP-protocol level.**
- Evidence: no test starts `server.ts` over stdio/http, no `initialize`/`tools/list`, no end-to-end lint→diagnostic snapshot. All 65 tests are unit.
- Risk: a tool/transport registration regression is not caught.

**N4. No ADR and no product roadmap of its own.**
- Evidence: ROADMAP/V1.0_PLAN under `temp/vscode-pml-aveva-e3d/` describe the **upstream VS Code product**, not the current MCP server. Architectural decisions (fastmcp, exclusion of djee79, 18 categories, snake/CAMEL IDs) are captured only in the prose of the README/plans.
- Fix: introduce `docs/adr/` + `docs/ROADMAP.md` for the MCP server itself.

**N5. Seven "completed" v4 plan tasks have no artifacts + an unresolved human-decision backlog.**
- Evidence (from the context): plan T11 (`docs/knowledge-base/pml-kb-v4.md`) and T14 (final-report) do not exist; 2 failed imports (`kb-pml-reload-object-directive`, `kb-tagmanagementtmp-object` — bad `sourcecodebase`) are not remediated; manual-workbook backlog: 302 CATEGORY_DECISION + 26 DEFER + 80 REPAIR_CB + 30 REVIEW.
- Note: the validator passes (0 issues), but the backlog means KB v4 is **functionally valid, but not "finalized" by process**.

### 🟢 NOTE (minor)

**n1. `nul` file (181B) at the root** — a Windows redirect-to-`NUL` artifact. `git status` shows it as untracked. Delete it. Evidence: `ls -la nul` → 181B; `git status` → `?? nul`.

**n2. `context.md` is dirty (modified)** — the "# Code Context" heading is misleading: it describes the LLM runtime (gemma-4-26B 128k), not the codebase. Evidence: `git status` → ` M context.md`.

**n3. `progress.md` (72B) is effectively empty** — Tasks/Notes headings without content; no centralized product progress journal.

**n4. `dist/` is committed** — build output + source maps in the tree. Usually generated; typically in `.gitignore`.

**n5. Cloned upstream repos under `temp/`** (`vscode-pml-aveva-e3d`, `pml-lsp`) — in the commit tree; should be gitignored/removed (keeping LICENSE attribution).

**n6. Hallucination-guard — only regex `for(`** (`engine.ts:33-58`) — deliberately narrow "guard, not grammar"; a deliberate limitation, but should be documented as such.

**n7. `package.json` without a `files` whitelist / without `prepare`/CI-pipeline** for this repo.

---

## 5. Proposed target operating model

**Principle:** the product should position itself honestly and have explicit boundaries of "what is in the MVP, what is not".

1. **Rebrand in spirit, without touching the npm-name:** write "MCP server for static PML intelligence" everywhere in the docs, not "LSP". Keep the package name (compatibility).
2. **Two clear product phases:**
   - **Phase A (current, "offline static").** Parser + diagnostics + KB + KB-validator. Close the doc-drift, enable the disabled tests, fix `validate_pml_file`, delete the dead code. Goal: reproducible `npm ci && npm test && npm run validate:kb` = green.
   - **Phase B (future, "live session").** See §6 — a separate roadmap block, a new subsystem (bridge/driver), not an extension of the current code.
3. **Introduce ADRs** for: the choice of fastmcp; the LSP-vs-MCP decision; the 18-category policy; the `-- CB` canon; the test exclusion.
4. **Introduce a version/roadmap** for the MCP server itself (0.1.0 → 0.2.0 = doc-truth + test-coverage + security gate; 1.0.0 = + live-session MVP).

---

## 6. Path to real AVEVA/Avivo session integration & test loop

**Readiness verdict: 0%.** In `src/`, `tests/`, `scripts/` there is no mechanism to connect/execute/read logs of a live session (grep for `spawn`/`COM`/`ActiveX`/`OLE`/`connect` → only the MCP server's own lifecycle). The server is OS-agnostic Node/stdio; AVEVA/PDMS/E3D is Windows GUI/COM. **This is a new subsystem, not an edit to the existing one.**

**Ordered architectural steps (by dependency):**

1. **AVEVA-side bridge/driver (new package).** Realistic options: (a) helper-macro/host that AVEVA calls; (b) command-file/macro runner — drops a `.pmlmac`+`SYSCOM` into `PMLLIB` and polls a sentinel result; (c) socket/queue-bridge (outbound "run macro" + inbound "result/log"), deployed beside/inside AVEVA via COM.
2. **New MCP tools:** `discover_sessions`, `run_pml_in_session`, `run_macro_file`, `read_session_logs`, `poll`/`tail`. Entry points: `src/mcp/tools.ts` (today only 3 static + 6 KB).
3. **State in the server:** transition from stateless-per-call to a session-scoped store (handle, project/DB context, conversation history).
4. **Config/credentials:** extend `.env.example` — `AVEVA_HOST`, `AVEVA_PROJECT`, `AVEVA_LOGIN`, `PMLLIB_PATH`, `BRIDGE_ENDPOINT` (today only `PORT` + placeholder `MCP_API_KEY`).
5. **Integration harness:** `tests-e2e/` with `describe.onlyOnEnv('AVEVA_HOST')` — offline skip by default, online with `AVEVA_HOST`. Golden side-effects (created DBREF, written table, exact error text).
6. **Feedback loop:** run-macro → parse log → errors into `lint`/`pml_diagnose` → patch → rerun, with a **fix-retry guard** (max iterations + semantic diff, not just "0 parse errors").
7. **Self-improvement corpus:** persist `(intent, macro, lint-result, runtime-outcome)` to `knowledge/examples/runtime/` → searchable via `search_pml_kb`. Today the KB is static strings; there is no ingestion path for runtime outcomes.

**Critical constraints (for the architect):**
- Static lint **cannot** substitute for runtime validation (documented semantic blind spot: e.g. `object |GridControl.DataSource|()` is syntactically valid but wrong in AVEVA — needs `NETDATASOURCE`/`NETGRIDCONTROL`).
- Any `run_pml_in_session` must be wrapped in a safe-execution context + rolling audit log (SAVEWORK/UNCLAIM discipline is documented in the `syscom.ts` KB); a live DB must not be touched without guardrails.
- Open decisions: bridge topology (in-app macro hook vs socket daemon); exactly one target AVEVA version first (PDMS DESIGN vs E3D vs Avivo Engineering — different namespaces); how much to delegate to the C# command-manager API vs pure PML.

**Acceptance scenarios (with binary evidence, all UNPASSABLE today):** attach/connectivity (A1–A2), execute-in-target (B3–B6: trivial command, macro-file+DBREF, error-surfacing, namespace-missing), read-logs (C7–C8: capture, poll/stream), iterative-fix (D9–D10: loop firing, retry-guard), self-improvement/tests (E11–E12: e2e golden + corpus ingestion).

---

## 7. Prioritized roadmap to product-ready

**P0 — close the holes before any handoff (Phase A):**
1. **B1 doc-truth:** update the README (328/v4, category numbers, section heading, link); create `docs/knowledge-base/pml-kb-v4.md` + changelog. *(hours)*
2. **B2 security:** sanitize `validate_pml_file` (allow-list of extensions + root, optional flag, threat-model in the doc). *(hours)*
3. **N1 test-coverage:** repair the 3 broken imports in `src/core/**/__tests__/`, remove the exclusion from `vitest.config.ts`+`tsconfig.json`, regenerate stale snapshots, run. *(half-day)*
4. **Cleanup:** delete `nul`, resolve `context.md`/`progress.md`, remove `dist/` and `temp/*` from the commit (into `.gitignore`, keeping LICENSE attribution). *(hours)*

**P1 — Phase A maturity:**
5. Cache/index for `search_pml_kb`; delete or apply the dead `github-kb.ts`.
6. E2E MCP-protocol test (stdio `initialize`/`tools/list`).
7. ADR + a `docs/ROADMAP.md` of its own.
8. Finalize the v4 process: remediate the 2 failed imports; resolve/close the human-decision backlog (302+26+80+30) or explicitly document it as deferred; stress-test/benchmark (plan T12–T13).

**P2 — start Phase B (live session):**
9. Spike: choose the bridge topology (recommendation — start with command-file/macro runner + sentinel-poll as the least invasive for the first AVEVA version).
10. MVP tool set (`discover_sessions`, `run_pml_in_session`, `read_session_logs`) + `.env` contract + `tests-e2e/` onlyOnEnv.
11. Feedback-loop with fix-retry guard; runtime-corpus ingestion into the KB.

**P3 — product:**
12. Finalize the safe-execution context + audit log; deployment documentation (Windows proximity, COM/PMLLIB).
13. 0.2.0 (Phase A done) → 1.0.0 (live-session MVP) versioning.

---

## Review

- **Correct (with evidence):** a mature layered core (parser/AST/diagnostics/KB-validator); `tsc --noEmit` exit 0; `vitest run` 65/65 PASS; `validate:kb` 328/18/0 issues; clean registration of 9 tools/3 resources/2 prompts in `server.ts`; deliberate "foundation, not formal grammar" positioning (`README.md:135`).
- **Blocker:** **B1** — README/docs systemically drifted (claims v3=118, actually committed v4=328, proven by the validator); **B2** — `validate_pml_file` reads an arbitrary path without restrictions (RCE/leak surface).
- **Note (important):** **N1** — 7/12 test files disabled, 3 with broken imports (densest AST corpus not in CI); **N2** — `search_pml_kb` O(all files)/call + dead `github-kb.ts`; **N3** — no E2E MCP-protocol test; **N4** — no ADR/roadmap of its own; **N5** — the v4 process is not finalized (2 failed imports + human-decision backlog).
- **Note (minor):** the `nul` file, dirty `context.md`, empty `progress.md`, committed `dist/`, clones in `temp/`, regex-only hallucination-guard, no `files` whitelist.
- **Read-only audit:** no edits were made; all commands are inspection/execution of existing gates. The context file `.pi/context/...` was read in full and cross-checked against the code; "Open Question #1" (was v4 applied) — **closed**: v4=328 is committed to `src/knowledge/pml-kb/*.ts`.
