# PML-LSP Product Audit — Readiness for "Live AVEVA Session Execution" Mode

**Research date:** 2026-07-31 (scout, external audit)
**Scope repo:** `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp`
**Research question:** How ready is the product for a future operating mode: *attach to a live AVEVA / Avivo Engineering session, run PML commands, read logs, iteratively fix*.
**Method:** read-only source inspection (no execution, no mutation). Exact commands & grep used below.

---

## Verdict (TL;DR)

**The product is NOT ready for the live-session mode at all — it contains zero runtime capability.** It is a purely **static / offline code-intelligence MCP server**: parse → lint → search KB → return diagnostics. There is:
- no mechanism to **connect/attach** to an active AVEVA process,
- no way to **execute** PML inside a target app,
- no **log/error capture** from a live app (only static lint diagnostics),
- no **feedback loop / self-improvement** on real runtime behavior (tests are all offline/static).

The "ready" part is only the **generation/linting half** of the loop — writing syntactically sane PML, and validating it statically. The **run-validate-fix** half is entirely absent.

---

## 1. Current capabilities (verified)

Everything below is offline and read-only against local files. No file is ever executed or sent to AVEVA.

| Capability | Where | Evidence |
|---|---|---|
| MCP server skeleton (stdio + Streamable HTTP transports) | `src/server.ts` | `FastMCP` server; `transportType: 'httpStream'` or `'stdio'` — **MCP transport only, not a session bridge**. |
| PML **lint / parse** (diagnostics engine) | `src/mcp/tools.ts:13` `lint_pml_code`; `src/core/diagnostics/engine.ts` | `lintPmlCode(code, {uri})` — pure static analysis of PML source text. |
| **Validate a PML file on disk** | `src/mcp/tools.ts:22` `validate_pml_file` | `readFileSync(path)` + same lint engine. Reads a local file, never sends it anywhere. |
| **Static KB search** | `src/mcp/tools.ts:47` `search_pml_kb` + `src/mcp/pml-kb-tools.ts` (6 tools) | Regex/term search over local `knowledge/` markdown; `pml_kb_search/get/by_category/related/antipatterns/pml_diagnose`. |
| Static resources (syntax, objects, loop examples) | `src/mcp/resources.ts` | `pml://docs/syntax`, `pml://docs/objects`, `pml://examples/loop_objects`. |
| Static prompts (`write_macro`, `review_code`) | `src/mcp/prompts.ts` | Guide LLM to author/review PML — output is text, no execution. |
| Static PML lexicon tables (methods/keywords for completions) | `src/core/data/systemObjects.ts`, `src/core/data/pdmsCommands.ts` | **Static string tables only.** `SessionMethods`, `SystemGlobalFunctions` contain the literals `'current session'`, `'sessions'` — these are completion/Hovertip data, not live session access. |

**Runtime transport facts:** Dockerfile runs `CMD ["node", "dist/server.js"]` → stdio MCP. `.env.example` shows only `PORT`, `MCP_API_KEY` (marked "future placeholder"), `PML_KB_CACHE_TTL_SECONDS` (marked "future Kb refresh"). No secrets/credentials, no AVEVA host/port, no automator/driver config.

---

## 2. Missing capabilities (gap analysis)

| Required for live-session mode | Status | Evidence |
|---|---|---|
| **Attach to a live AVEVA / Avivo Engineering session** (find process, connect via COM/ActiveX/OLE/PMLNETCommandManager/command socket) | **ABSENT** | No occurrence of `spawn`, `child_process`, `COM`, `ActiveX`, `OLE`, `attach`, `connect` for a session anywhere in `src/`, `tests/`, `scripts/` (grep). The only `process.cwd()`/`process.argv` use is the MCP server's own lifecycle (`src/server.ts:41,46,51`). |
| **Execute PML / run a `.pmlmac` in the target app** | **ABSENT** | No tool calls `$M`, `SYSCOM`, `executeSync`, `.execute()` on a live app. All such strings appear only inside KB documentation (`src/knowledge/pml-kb/*.ts`, `syscom.ts`) describing what PML *could* do inside AVEVA — not tooling this server offers. The only tool-to-tool "execute" is the MCP `execute` handler that runs JS, not PML in AVEVA (`src/mcp/*.ts`). |
| **Read runtime logs / error stream from the live session** | **ABSENT** | No log/file tail, no stdout/stderr capture from a target process, no LSP `didOpen`/lifecycle — `npm start` just binds stdio for MCP messages. Diagnostics are computed statically from source text, never received from a running engineer. |
| **Iterative fix loop against real runtime** (run → read result → patch → rerun) | **ABSENT** | No tool returns runtime results; the only "loop" is man-in-the-loop: LLM writes code → `lint_pml_code` → LLM edits → relint. That loop validates *syntax* only, not behavior. |
| **Self-improvement via tests against real runtime** | **PARTIAL / NO** | 12 test files under `tests/` + `src/**/__tests__/` are all **offline unit/vitest** (parser, diagnostics, KB validation, MCP tool wiring). No integration test invokes a real AVEVA session; no golden output captured from a live app. `npm test` = `vitest run` — pure unit. |
| Feedback/telemetry/conversation state for a long-lived engineer session | **ABSENT** | MCP server is stateless per-call; no session object, no conversation store. |
| Credential/host config for AVEVA machines | **ABSENT** | `.env.example` has none (only MCP port + placeholder API key). Docker image is a thin Node stdio process. |

### Note on the one prior "session" artifact
`.pi/research/2026-06-03_pml-mcp-generation-benchmark.md` and `.pi/plans/2026-06-03_pml-mcp-generation-benchmark.md` reference a benchmark that generates PML macros and validates them. Confirmed findings there:
- validation is **MCP parse/lint only** (static); the "current session / session history" (`t2_sessionHistory_xlsx_export.pmlmac`) is a *PML macro that reads AVEVA session history from within AVEVA* — not the server attaching to a session.
- Explicitly: **"Worker could not access MCP AVEVA tools inside isolated session … Full MCP-in-worker workflow NOT PASSED."**
- **No real AVEVA runtime** was ever run during that benchmark; semantic fidelity was judged manually against benchmark sources, judged LOW–MEDIUM.

---

## 3. Required architecture moves (to reach the live-session mode)

Ordered by dependency (foundation first):

1. **Session/Driver layer (new).** Add an AVEVA-side executor. Realistic in-process options:
   - Helper macro/host that AVEVA calls, or
   - A **command-file/macro runner** that drops a `.pmlmac` + `SYSCOM`/batch into the app's `PMLLIB` and polls for a sentinel result, or
   - A dedicated **socket/queue bridge**: outbound "run macro / run command" + inbound "result/log", deployed beside (or via COM into) AVEVA. Needs a new package — does not exist here.
2. **`run_pml_in_session` / `run_macro_file` MCP tool(s).** Accept macro source or path + session target; return structured result + exit/error + captured log.
3. **Log verb. ** `read_session_logs` / `fetch_last_output` tool reading the bridge's log sink (file tail or socket).
4. **State/handles in the server.** Maintain session handle, project/DB context, conversational history; move off stateless-per-call to a session-scoped store.
5. **Config/credentials** in `.env`/config: AVEVA host, project/login, PMLLIB path, bridge endpoint; wire an `MCP_API_KEY` only if server is exposed over HTTP.
6. **Gate on a real runtime.** Add an **integration harness** (Vitest `describe.onlyOnEnv('AVEVA_HOST')` or a separate `tests-e2e/`) that drives a real session and asserts golden side-effects (e.g., table written, DBREF created, error text returned).
7. **Feedback loop.** Close the loop: run macro → parse returned log → feed diagnostics/errors back into `lint`/agent → patch macro → rerun, with a **fix-retry guard** (max iterations + semantic diff check, not just "zero parse errors").
8. **Self-improvement corpus.** Persist every (intent, generated macro, lint result, real-runtime outcome) as a golden example feeding KB enrichment — the current KB is static strings; there is no ingestion path for real runtime outcomes.

---

## 4. Acceptance scenarios for a real architect machine (verifiable, with evidence)

Environment assumptions: a Windows box with AVEVA PDMS/E3D or Avivo Engineering installed, project + PMLLIB writable, and the bridge package deployed. Each must produce **binary/structured evidence**, not a human "it looked fine".

### A. Attach / connectivity
1. **Session discovery:** call MCP tool `discover_sessions` → returns a non-empty JSON list of reachable sessions (host, app, project, login). *Evidence: exit 0, `sessions:[\n{"host":"...","app":"AVEVA E3D","login":"..."}\n]`.*
2. **Wrong-target check:** point host at an unreachable machine → returns a typed error `session_connect_failed` with cause, no hang (timeout < 30 s). *Evidence: exit code/message recorded.*

### B. Execute PML in-target
3. **Trivial command:** run single PML `!!var = 'hello'` in target session → response echoes a handle and offers to read `!!var`. *Evidence: `{"ok":true,"handle":"h_1"}` then `read_var → "hello"`.*
4. **Macro file:** write a `.pmlmac` that creates a temp UDA/DBREF/table; run via `run_macro_file(path)`; then query the DB from inside the session to confirm the object exists. *Evidence: `{"executed":true,"rows_affected":1}` + DB query returns the created ref.*
5. **Error surfacing:** run a macro with a deliberate runtime error (e.g., `$!undefined.boom()`) → returns the **PML error text/severity** (not just "parse ok"). *Evidence: `{"ok":false,"errorText":"HANDLE 41,8 error …","line":…}`.*
6. **Failure of a macro inside real app:** run a `.pmlfrm`/`.pmlobj` referencing a missing namespace → returns exact AVEVA import/load error. *Evidence: error string contains the namespace name.*

### C. Read logs
7. **Log capture:** after (5), `read_session_logs(handle, since=<ts>)` returns the error lines printed by the session console. *Evidence: substring match with the runtime error.*
8. **Poll/stream:** a long-running macro emits progress; `poll`/`tail` receives ≥2 distinct incremental lines before completion. *Evidence: timestamps strictly increasing, >1 entries.*

### D. Iterative fix
9. **Fix loop firing:** send a macro that initially errors; feed the returned error into `pml_diagnose`; confirm the KB suggestion is relevant; regenerate a corrected macro; rerun; assert it now returns `ok` and the DB side-effect is present. *Evidence: transcript of run1(fail)→diagnose→run2(ok), with exit codes + error strings attached.*
10. **Fix-retry guard:** force an unfixable error; assert the loop stops after the configured max iterations and reports `loop_exhausted` (not infinite). *Evidence: iteration counter == configured max.*

### E. Self-improvement / tests
11. **E2E golden test:** `tests-e2e/session.spec.ts` tagged `describe.onlyOnEnv('AVEVA_HOST')` runs scenarios 3–5 offline by default (skipped) and online when `AVEVA_HOST` env is set. `npm run test:e2e` passes with real machine. *Evidence: CI/ran locally reports `N passed, 0 failed, AVEVA_HOST present`.*
12. **Golden corpus ingestion:** after a successful run, the run produces a record (intent, macro, lint, runtime outcome) written to `knowledge/examples/runtime/` and searchable via `search_pml_kb`. *Evidence: new file appears + `search_pml_kb('runtime:<id>')` returns it.*

**All scenarios are currently UNPASSABLE** — none of the required tools (`discover_sessions`, `run_pml_in_session`, `run_macro_file`, `read_session_logs`, `pml_diagnose` exists today but the rest do not) exist in `src/mcp/tools.ts` (lines 10–96). The single existing tool that *would* support part of scenario 9 is `pml_diagnose` (`src/mcp/pml-kb-tools.ts:105`).

---

## 5. Files most likely to need changes (entry points for the next agent)

1. `src/mcp/tools.ts` — add session tools (`discover`, `run`, `read_logs`); today only 3 static tools + KB tools (lines 10–96).
2. `src/server.ts` — transition from stateless stdio/HTTP to a session-scoped state store and the new transport to the AVEVA bridge (lines 41–59).
3. New package (not present): AVEVA-side bridge/driver (macro runner / socket sink).
4. `src/mcp/prompts.ts` — prompts currently end at "validate with lint_pml_code"; must be extended to *run* then *read logs* then *fix*.
5. `.env.example` — add `AVEVA_HOST`, `AVEVA_PROJECT`, `AVEVA_LOGIN`, `PMLLIB_PATH`, `BRIDGE_ENDPOINT`.
6. `Dockerfile` — current image is a pure stdio Node process; a live-mode deployment needs host-machine proximity/COM, so the container story needs revisiting.
7. `tests/` + new `tests-e2e/` — offline unit tests exist (12 files) but no runtime integration harness.

---

## 6. Constraints & risks (for the audit)

- **Platform reality:** AVEVA/PDMS/E3D run on Windows with a GUI/DB session; attach requires COM/ActiveX/OLE or an in-app macro hook, plus a PMLLIB runnable. The current server is OS-agnostic Node/stdio and has no Windows process integration.
- **Semantic blind spot already documented:** existing lint accepts constructs that are syntactically valid but invalid at AVEVA runtime (e.g., `object |GridControl.DataSource|()` vs `NETDATASOURCE`/`NETGRIDCONTROL`, per prior benchmark). Static lint therefore **cannot** substitute for runtime validation.
- **Licensing:** djee79/pml-lsp assets are excluded pending license clarification (README) — do not re-acquire them for the bridge.
- **No executor should touch the live DB without explicit guardrails** (SAVEWORK/UNCLAIM discipline is documented in `syscom.ts` KB); any `run_pml_in_session` tool must wrap in a safe execution context and rolling audit log.
- Open (needs architect decision): bridge deployment topology (in-app macro hook vs. socket daemon), exactly-one AVEVA version to target first (PDMS DESIGN vs E3D vs Avivo Engineering *Tags* namespaces used in KB), and how much to defer to the platform's own command-manager C# API vs pure PML.

*End of scout artifact. All file/line references verified on 2026-07-31 against the repo at the noted working branch (`main`).*
