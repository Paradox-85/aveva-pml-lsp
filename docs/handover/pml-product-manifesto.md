# PML-LSP Product Manifesto / Engineering Brief

## Repository
- **Repository:** `https://github.com/Paradox-85/aveva-pml-lsp`
- **Audited working repository:** `aveva-automation/clients/bami/rnd/pml-lsp`
- **Audit baseline:** branch `main`, commit `cfe9dbe`

## Source Documentation Used

### Core product and codebase documentation
- `README.md`
- `package.json`
- `src/server.ts`
- `src/mcp/tools.ts`
- `src/mcp/pml-kb-tools.ts`
- `src/mcp/resources.ts`
- `src/mcp/prompts.ts`
- `src/core/diagnostics/engine.ts`
- `src/core/parser/parser.ts`
- `src/knowledge/validation/validate-kb.ts`
- `src/knowledge/pml-kb/*.ts`

### Knowledge base and factory documentation
- `docs/knowledge-base/pml-kb-v3.md`
- `docs/factory/README.md`
- `docs/factory/logs/kb-v4-run-state.json`
- `docs/factory/logs/pipeline.log.md`
- `docs/factory/reports/kb-v4-*.md`
- `docs/factory/reports/kb-v4-validated-import-errors.json`

### Internal planning and research artifacts
- `.pi/plans/plan.md`
- `.pi/plans/2026-05-29_pml-kb-enrichment.md`
- `.pi/plans/2026-06-02_pml-codebase-harmonization.md`
- `.pi/plans/2026-06-03_kb-v3-remediation-plan.md`
- `.pi/plans/2026-06-03_pml-mcp-generation-benchmark.md`
- `.pi/research/20260731-090656-pml-product-audit-code-architecture.md`
- `.pi/research/20260731-090656-pml-product-audit-docs-map.md`
- `.pi/research/20260731-090656-pml-product-audit-logs-status.md`
- `.pi/research/20260731-090656-pml-product-audit-runtime-gaps.md`
- `.pi/review/20260731-090656-pml-product-audit.md`

### Upstream reference material used for context separation
- `temp/vscode-pml-aveva-e3d/README.md`
- `temp/vscode-pml-aveva-e3d/ROADMAP.md`
- `temp/vscode-pml-aveva-e3d/V1.0_PLAN.md`
- `temp/vscode-pml-aveva-e3d/ARCHITECTURE_ANALYSIS.md`

---

## 1. Purpose

`pml-lsp` is a standalone MCP server that gives AI agents reliable static intelligence for AVEVA PML 1 / PML 2: parsing, diagnostics, knowledge retrieval, and guided code generation.

The strategic goal is larger than syntax support.

This product should become the foundation for an AI-assisted AVEVA customization workflow where teams can:
- generate PML scripts, forms, methods, and objects faster,
- validate them before runtime,
- progressively accumulate reusable domain knowledge,
- and eventually move from prototype-grade automation to production-grade delivery.

The business intent is clear:

> Reduce delivery time for deeply customized AVEVA solutions from months to weeks.

---

## 2. Product Vision

The long-term vision is a two-mode product.

### Mode A — Offline PML Intelligence
The agent works without a live AVEVA session:
- writes PML code,
- lint-checks and validates it,
- searches the structured PML knowledge base,
- uses documented patterns and anti-patterns,
- prepares reusable assets before runtime.

This mode already exists in substantial form.

### Mode B — Live AVEVA Session Copilot
The agent works against an active AVEVA / Avivo Engineering session:
- connects to a real running session,
- inspects project/model/database context,
- generates PML in the context of the actual environment,
- executes macros/commands safely,
- reads logs and runtime errors,
- iterates automatically: generate → run → inspect → fix → rerun.

This mode does **not** exist yet and must be built as the next major product phase.

---

## 3. Current Product State

### What is already strong

The current repository already provides a solid static-analysis foundation:

- standalone MCP server architecture,
- PML parser and diagnostics engine,
- PML-specific checks beyond syntax,
- structured KB with 328 validated entries across 18 categories,
- focused MCP tools for KB exploration and diagnosis,
- green baseline gates:
  - typecheck passes,
  - tests pass,
  - KB validation passes.

This means the project is already useful as a **static PML intelligence layer**.

### What it is not yet

The current product is **not**:
- a true LSP server,
- a runtime AVEVA integration layer,
- a live macro execution system,
- a session-aware engineering copilot,
- a closed-loop self-improving runtime platform.

In short:

> The static half is real.  
> The runtime half is still future work.

---

## 4. Honest Product Definition

To avoid ambiguity, the team should use this definition consistently:

> `pml-lsp` is an MCP server for static PML intelligence, not yet a live AVEVA execution platform.

That distinction matters for architecture, scope, roadmap, user expectations, and release planning.

---

## 5. Core Problems to Solve Next

The audit shows five immediate product-level gaps.

### 1. Documentation truth gap
The repository content has moved to KB v4-scale reality, but core docs still describe older KB v3-scale numbers and status.

Impact:
- wrong understanding for new developers,
- wrong handoff context,
- risk of planning against stale documentation.

### 2. Test coverage gap
Important internal parser/diagnostics tests are disabled and partially broken.

Impact:
- reduced confidence in core engine evolution,
- regression risk in the most valuable subsystem.

### 3. Security / file-surface gap
`validate_pml_file` accepts arbitrary file paths.

Impact:
- unsafe surface for untrusted MCP clients,
- product hardening is incomplete.

### 4. Search/indexing maturity gap
KB search is still file-scan/heuristic-driven.

Impact:
- scalability and relevance limitations,
- weak foundation for larger future corpora and self-learning loops.

### 5. Runtime integration gap
There is no bridge to a live AVEVA session.

Impact:
- no real execution,
- no runtime verification,
- no agentic closed loop,
- no proof that generated PML works in the actual target environment.

---

## 6. What “Product-Ready” Means

The product should not be considered product-ready until it satisfies both tracks below.

### Track A — Static Product Readiness
The repository must become operationally clean and trustworthy:
- documentation matches code,
- disabled tests are fixed/enabled,
- unsafe file access is constrained,
- KB v4 artifacts are finalized,
- roadmap and ADRs exist,
- MCP protocol-level E2E checks exist.

### Track B — Runtime Product Readiness
The product must support real AVEVA execution workflows:
- discover/connect to a live session,
- run PML safely,
- collect runtime output and logs,
- classify runtime failures,
- support iterative repair,
- persist successful patterns for future reuse.

Only when both tracks exist can the system credibly move from “prototype” to “delivery platform”.

---

## 7. Recommended Target Operating Model

The next product architecture should consist of three layers.

### Layer 1 — Static Intelligence Layer
Already mostly present:
- parser,
- diagnostics,
- KB,
- prompts,
- MCP tools.

### Layer 2 — Runtime Bridge Layer
Must be added:
- AVEVA-side bridge/driver,
- session discovery,
- macro execution,
- log collection,
- result transport back to MCP.

Possible implementation styles:
- command-file / macro-runner bridge,
- in-session helper macro host,
- socket/queue bridge near the AVEVA process,
- or COM/.NET-based control layer if the target product allows it.

### Layer 3 — Closed-Loop Agent Workflow
Must be designed on top:
- generate code,
- lint statically,
- execute in session,
- read runtime output,
- diagnose,
- patch,
- rerun,
- persist learnings.

This third layer is where the strategic value lives.

---

## 8. Immediate Next Phase Recommendation

The next phase should be a **real-world validation phase**, not more abstract enrichment alone.

### Recommended objective
Test the MCP server against a real local AVEVA / Avivo Engineering installation with company-held licenses.

### Why
Because the biggest unanswered question is no longer:
- “Can the agent generate syntactically reasonable PML?”

The real question is:
- “Can the system generate PML that works inside a real session, against real context, with recoverable errors and an improvement loop?”

That can only be answered on a live target.

---

## 9. Proposed Validation Program

### Phase 1 — Stabilize the static product
Before live integration:
- update README and product docs,
- finalize KB v4 documentation,
- enable/fix disabled tests,
- harden file access,
- add MCP E2E checks,
- remove technical debris and dead code.

### Phase 2 — Build a runtime bridge MVP
Implement minimal live-session capabilities:
- `discover_sessions`
- `run_pml_in_session`
- `run_macro_file`
- `read_session_logs`

Goal:
prove that the MCP server can safely execute and observe real PML behavior.

### Phase 3 — Run real acceptance scenarios
Use a local architect machine with active AVEVA / Avivo Engineering session and test simple but real workflows:
- loop over data,
- collect simple objects,
- build a basic report,
- run a simple form/script,
- trigger a controlled error and capture it,
- validate fix-and-rerun loop behavior.

### Phase 4 — Build the self-improvement loop
For each task:
- save prompt/intention,
- save generated macro,
- save lint result,
- save runtime result,
- save corrected revision,
- feed successful examples back into the searchable corpus.

That turns the product from a static tool into a compounding system.

---

## 10. Definition of Success

This initiative succeeds when the team can truthfully say:

1. An agent can generate valid PML with strong static checks.
2. The system can connect to a real AVEVA/Avivo session.
3. Generated scripts can be executed safely in that session.
4. Runtime errors can be captured and interpreted.
5. The system can iteratively improve outputs based on runtime evidence.
6. Repeated successful patterns become reusable product knowledge.
7. Teams can use this workflow to deliver custom AVEVA solutions dramatically faster.

---

## 11. Engineering Priorities

Priority order for the development team:

### Priority 0 — Truth and safety
- align docs with actual codebase state,
- harden unsafe file access,
- repair disabled/broken tests.

### Priority 1 — Static product maturity
- finalize KB v4 artifacts,
- improve KB search/indexing,
- add MCP E2E tests,
- add ADRs and roadmap.

### Priority 2 — Runtime bridge MVP
- session discovery,
- macro execution,
- log capture,
- session-scoped state.

### Priority 3 — Closed-loop runtime iteration
- diagnose runtime failures,
- auto-repair loop with stop guards,
- runtime example ingestion into KB.

### Priority 4 — Productization
- deployment model,
- versioning,
- operational runbooks,
- safe execution policies,
- release criteria for pilot and production.

---

## 12. Final Position

This project is already valuable.

It is not an empty prototype.  
It has a real static-analysis core and a meaningful validated KB.

But it is also not yet the final product vision.

The next decisive step is not more abstract planning alone.  
The next decisive step is **live runtime validation on a real AVEVA / Avivo Engineering environment**, followed by iterative product hardening.

> Static intelligence is the foundation.  
> Runtime execution and feedback will make it a product.
