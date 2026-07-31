# Solution map by documentation and text artifacts — pml-lsp

**Research date:** 2026-07-31
**Type:** external audit of documentation/plans (read-only; this artifact is the only record)
**Repository:** `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp` (branch `main`)

---

## Scope

The goal is to build a solution map from the text artifacts (README, plans, ADR/notes, research, reports, docs), capturing the declared product goal and promised capabilities, planned/next steps, gaps, and contradictions. The research is read-only; the only record is this file.

The artifacts are divided into MULTIPLE generations/layers, and it is important not to mix them:

1. **Upstream source** (`temp/vscode-pml-aveva-e3d/`) — the cloned MIT repository `mikhalchankasm/vscode-pml-aveva-e3d`, a PML VS Code extension (v0.12.30, production-ready). Its ROADMAP/V1.0_PLAN/ARCHITECTURE describe a **VS Code product**, not the current MCP server.
2. **Current product** (`README.md`, `src/server.ts`) — a standalone MCP server for PML diagnostics/knowledge.
3. **Plans/research** (`.pi/plans/*`, `.pi/research/*`, `docs/factory/*`) — the internal process of enriching the Knowledge Base v3→v4.
4. **Docs KB** (`docs/knowledge-base/*`, `knowledge/official/*`) — the PML knowledge base.

---

## Commands used

```bash
pwd
find . -maxdepth 4 \( -iname 'README*' -o -iname '*.md' -o -path './docs/*' -o -path './.pi/*' \) | sort
find . -maxdepth 3 -iname '*.md' -o -iname '*.txt' -o -iname '*.org' -o -iname '*.rst'
find docs/factory -maxdepth 2 -name '*.json' -o -maxdepth 2 -name '*.md'
grep -RInE 'manifest|vision|roadmap|TODO|MCP|PML|AVEVA|Avivo|Engineering|prototype|product|plan|next step|следующ|цель|задач' . \
  --include='*.md' --include='*.txt' --include='*.json' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build
cat README.md context.md progress.md package.json Dockerfile docker-compose.yml src/server.ts
git log --oneline; git branch -a
```
Plus per-file reading of the key markdown files via `read`.

---

## Document map

### Root documentation
| File | Purpose |
|---|---|
| `README.md` | Main product manifest: goal, framework, layout, tools, KB v3 |
| `context.md` (944B) | Service print of the pi context (not about the product itself — about the LLM runtime gemma-4-26B) |
| `progress.md` (72B) | Almost empty — heading "In Progress", Tasks/Files Changed/Notes sections empty |
| `research.md` (21K) | Research of the PML codebase in `docs/codebase/` (reorganization, duplicates) |
| `package.json` | `@bami/pml-lsp-mcp-server` v0.1.0, fastmcp+zod, vitest |
| `Dockerfile`/`docker-compose.yml` | Containerization of the MCP server (Node 24, httpStream :8080) |

### `.pi/` (internal agent artifacts)
| File | Purpose |
|---|---|
| `.pi/agents/pml-worker.md` | Specialized Worker/Reviewer/Smoke agent for the KB factory |
| `.pi/agents/pml-mcp-diagnostic.md` | Diagnostic agent (presence of MCP tools) |
| `.pi/context/codebase-and-patterns.md` | KB schema, validation, v4 risks |
| `.pi/context/scout.md` | Context print for the v4 executor |
| `.pi/meta-prompt.md` | Meta-prompt for executing the v4 plan |
| `.pi/plans/plan.md` | 17-step KB v4 enrichment plan |
| `.pi/plans/2026-05-29_pml-kb-enrichment.md` | Plan to enrich the KB from official AVEVA manuals |
| `.pi/plans/2026-06-02_pml-codebase-harmonization.md` | Plan to reorganize `docs/codebase/` (done ✅) |
| `.pi/plans/2026-06-03_kb-v3-remediation-plan.md` | Plan to fix KB v3 ("PENDING APPROVAL" at the time of reading) |
| `.pi/plans/2026-06-03_pml-mcp-generation-benchmark.md` | Plan for the benchmark of PML generation via MCP |
| `.pi/reports/2026-05-29_pml-kb-validator.md` | Validation report of KB-enrichment (Phase 5) |
| `.pi/research/research.md` | Overview of RAG/ReliabilityBench best practices for v4 |
| `.pi/research/2026-06-03_pml-mcp-generation-benchmark.md` | Results of the generation benchmark |
| `.pi/temp/*` | Temporary generated benchmark files |

### `docs/`
| File | Purpose |
|---|---|
| `docs/factory/README.md` | Description of the self-learning factory (generation/review/gap/patch) |
| `docs/factory/config/file-manifest.json` | 84 source files for processing |
| `docs/factory/config/pipeline.config.json` | Pipeline config |
| `docs/factory/logs/*` | run-state.json, kb-v4-run-state.json, phase1-full-run-summary.json |
| `docs/factory/reports/kb-v4-*.md/.json` | v4 reports (baseline, batch, gap-analysis, manual-validation, validated-import, fallback-cleanup) |
| `docs/factory/benchmarks/*`, `gap-reports/*`, `kb-patches/*` | Factory artifacts (pml-worker) |
| `docs/codebase/**` | Copied/reorganized real PML sources of the client (Ramboll JDE/EIS) + `pml.index` |
| `docs/knowledge-base/pml-kb-v2.md` | KB v2 (obsolete, 110 entries) |
| `docs/knowledge-base/pml-kb-v3.md` | KB v3 (118 entries, current) |
| `docs/knowledge-base/gap-analysis-v3.md`, `extraction-report-v3.md`, `kb-entry-guide.md` | KB v3 support |
| `docs/combined_pml_reference.md` | Compiled reference from TM-1401/1402 PDF |
| `docs/llm_review/perplexity_pml_knowledge_base.md` | External Perplexity "master contract" of patterns (1357 lines) |
| `docs/examples/*.pmlmac` | Real examples (t1, t2) |

### `knowledge/` (PML knowledge base)
`knowledge/official/*.md` (9 files, source-grounded), `knowledge/snippets/pml.json`, `knowledge/syntax/`, `knowledge/objects/*.md` (README with TODO statuses), `knowledge/examples/`.

### Upstream reference (`temp/vscode-pml-aveva-e3d/`) — NOT the current product
`README.md`, `ROADMAP.md`, `V1.0_PLAN.md`, `ARCHITECTURE_ANALYSIS.md`, `CHANGELOG.md`, `RELEASE_NOTES.md`, `TROUBLESHOOTING.md`, `CONTRIBUTING.md`, `VERSIONING.md`, `AGENTS.md` — describe the PML VS Code extension v0.12.30.

---

## Declared product goal

**Main (README.md:8-11):**
> "Standalone Model Context Protocol server foundation for AVEVA PML 1 / PML 2 diagnostics, syntax knowledge, examples, and agentic coding assistance."

**Reinforcement (README.md:15-17):**
> "exposes PML language-server style functionality to any MCP-capable agent, including Claude Code, pi-based orchestration, and local LLM bridges. It is not tied to VS Code extension APIs."

**Also (package.json:6):** "Standalone MCP server foundation for AVEVA PML diagnostics and knowledge resources."

**Meaning:** from the PML LSP engine borrowed from the upstream VS Code extension, a **framework/bootstrap** for an MCP server for agentic PML coding is built — the parser/AST/diagnostics core is moved to `src/core` (VS Code-independent), with an MCP layer on top (tools/resources/prompts) + the PML Knowledge Base v3 (structured knowledge for LLM agents).

---

## Promised capabilities (per documentation)

### Tier 1 — explicitly stated in the README (Tier 1 — actually implemented)
- 3 core tools: `lint_pml_code`, `validate_pml_file`, `search_pml_kb` (README.md:46-58; confirmed `src/mcp/tools.ts:8-46`)
- MCP resources: `pml://docs/syntax`, `pml://docs/objects`, `pml://examples/loop_objects` (README.md:35-42; `src/mcp/resources.ts`)
- Transports: stdio and HTTP Streamable (`dist/server.js --http-stream`, :8080/mcp) (README.md:28-40; `src/server.ts:26-35`)
- Containerization (Dockerfile, docker-compose :8080)

### Tier 2 — KB v3 (README.md:60-126, docs/knowledge-base/pml-kb-v3.md)
- **118 entries / 18 categories** (README.md:63-73)
- Coverage: 87/87 Claude KB source IDs + 18/18 mandatory Perplexity `p2_*`
- 6 new KB MCP tools: `pml_kb_by_category`, `pml_kb_search`, `pml_kb_get`, `pml_kb_related`, `pml_kb_antipatterns`, `pml_diagnose` (README.md:107-113)
- Validation via `npm run validate:kb` (README.md:99-105)

### Tier 3 — promised in the plans (planned, status ambiguous)
- **KB v4** — up to **328 entries** (see `docs/factory/logs/kb-v4-run-state.json`): 17-step plan, controlled import, stress-test, benchmark (`.pi/plans/plan.md`)
- **Full recursive AVEVA docs crawl** — partially blocked by 403 (README.md:128-131)
- **FMSYS/CMSYS method lists** — "need expansion from official pages in Phase 2" (README.md:132-133)
- **A complete formal PML grammar** — "not yet a complete formal PML grammar replacement" (README.md:135)

### Tier 4 — inheritance from upstream (describes the VS Code product, not the current one)
- IntelliSense/Completion, Hover, Go-to-Definition, Find References, Document Symbols, SignatureHelp, Semantic Highlighting, Rename (F2), formatter, `$P` print tools, PDMS command starter whitelist, workspace indexing, form gadget snippets (temp/vscode-pml-aveva-e3d/README.md:10-23; ROADMAP.md) — these are **not** current pml-lsp promises as an MCP server (the MCP server has no editor / VS Code providers).

---

## Planned / Next steps (from `.pi/plans`)

### Active v4 plan — `.pi/plans/plan.md` (17 tasks)
1. Baseline/boundaries (check validate:kb, run-state: 84 files, 74 patch_ready/6 manual_review/4 gap_analyzed)
2. Smoke pml-worker via MCP tools
3. Source inventory A1-A6/B1-B3/C1-C4
4. Lightweight aggregation tooling (`scripts/kb-v4/*.mjs`)
5. Aggregation of gap reports + patch drafts
6. Gap analysis and deduplication (decision matrix: import_new/enrich_existing/reject_duplicate/manual_review)
7. Controlled import policy (`kb-patches/*.ts` are NOT imported directly)
8. Enrichment of existing categories in small batches (5-10)
9. New category requests only through the gate (CATEGORY LOCK — 18 categories)
10. Extension of validation/search gates
11. Changelog and v4 documentation (`docs/knowledge-base/pml-kb-v4.md`)
12. Stress-test agent plan (ReliabilityBench: consistency/robustness/fault tolerance, metrics D1-D7)
13. Isolated batch benchmark before/after v4
14. Final reporting
15. Checkpointing/resume (`kb-v4-run-state.json`)
16. Final validation
17. Commit strategy (in small logical steps)

**Validation gates G0-G8** and **12 Stop Conditions S1-S12** — detailed in `.pi/plans/plan.md:196-211` / `:214-231`.

### Completed / status plans
- `2026-06-02_pml-codebase-harmonization.md` — status **✅ DONE and verified** (reorganization of `docs/codebase/` → ~47 PML files)
- `2026-06-03_kb-v3-remediation-plan.md` — status **PENDING APPROVAL** at the time of reading (but v3 is actually implemented, and the README describes it)
- `2026-05-29_pml-kb-enrichment.md` — implemented (validators report in `.pi/reports`)

---

## Findings (key observations with file:line)

1. **`README.md:3` + `package.json:6`** — the product is positioned as a "foundation/bootstrap", not as a final LSP grammar. The deliberate limitation is explicitly stated (`README.md:135`).
2. **`README.md:15-17`** — key difference from upstream: "not tied to VS Code extension APIs"; `src/core/` — VS Code-independent parser/AST.
3. **`README.md:63`** — KB v3 = "**118 entries** across **18 categories**". Consistent with `docs/knowledge-base/extraction-report-v3.md:3` "Final entries generated: **118**" — aligned.
4. **`docs/factory/logs/kb-v4-run-state.json:93-96`** — raises a question: v4 data indicates **328 entries** after import, then fallback-cleanup (removed 180, left 328) — but this is **internal research/pipeline state, NOT a committed state**, since `kb-v4-baseline-smoke.md` records 118 entries and "No KB entries were imported".
5. **`docs/factory/logs/kb-v4-run-state.json:152-155`** — manualValidationWorkbook: 328 rows "category_decision_required", 111 "manual_review" — i.e. **302 entries require a category decision** (DEFER_SOURCE_NEEDED 26, REPAIR_CB 80). So the v4 route is NOT complete, pending human decisions.
6. **`git log` (11 commits, single branch `main`)** — commits: bootstrap from vscode-pml-aveva-e3d, official manuals, KB v3 remediation, "Enrich PML KB v4 and cleanup fallback entries", restructure docs (moving LLM materials to `docs/llm_review/`).
7. **`context.md` / `.pi/context/scout.md`** — the "Code Context" document actually describes the **LLM runtime** (gemma-4-26B, 128k context in tensor-lxc), not the domain — this is runtime infra per pi, not the product.
8. **`progress.md` (72B)** — empty/stale (Tasks/Notes headings empty).
9. **`docs/factory/README.md:26-29`** — "KB patches are never applied automatically", "autoApplyPatch is disabled by default" — controlled import policy.
10. **`src/mcp/tools.ts` + `src/mcp/pml-kb-tools.ts`** — actual number of MCP tools: **3 base + 6 KB = 9** tools, plus 2 prompts (`write_macro`, `review_code`) and 3 resources. The README lists them (unnumbered but complete).

---

## Documentation gaps

1. **No formal product roadmap for the current MCP server.** ROADMAP.md refers to the **upstream VS Code project** (temp/), and the current product has no ROADMAP/VISION of its own outside `.pi/plans`. For an external audit this is the main gap — the map of goals/stages for the MCP server itself is not explicitly documented.
2. **No ADR (Architecture Decision Records).** The upstream analysis explicitly notes "ADR: ❌ Missing" (temp/.../ARCHITECTURE_ANALYSIS.md:215), and the current repository also contains no ADR. Decisions (choosing fastmcp, dropping djee79 over licensing, 18 categories, CAMEL case vs snake_case) are recorded only in the prose of plans/README.
3. **V1.0_PLAN.md and related milestones** — only for the upstream VS Code product; there is no corresponding "product plan" / target version for the MCP server (the README says nothing about a version roadmap).
4. **`progress.md` is empty**, there is no single centralized product progress journal; state is scattered across `docs/factory/logs/*`, `.pi/research/*`, and git commits.
5. **The v4 status is ambiguous**: the v4 plans (`.pi/plans/plan.md`) and run-state describe an import to **328** entries and `category_decision_required` for **302** rows, whereas the baseline smoke records **118** and "no imports". It needs clarification: was the v4-import applied to the source code, or is it only isolated factory artifacts? A quick look at `src/knowledge` did not reveal the 328 entries — the v4 stage is likely **not committed** to `src/knowledge/pml-kb/`.
6. **The full AVEVA docs crawler is not finished** — there was an HTTP 403 block (README.md:128-131); `knowledge/official/pml1-vs-pml2.md` contains a "Migration placeholders" section (noted in `.pi/reports/2026-05-29_pml-kb-validator.md:63-64`).
7. **FMSYS/CMSYS full method lists** — "need expansion in Phase 2" (README.md:132-133), not done in the current artifacts.
8. **`sourcecodebase` binding and license**: `djee79/pml-lsp` is excluded due to a missing LICENSE (README.md:21-23). This is a deliberate limitation, documented.
9. **`text corpus` `section` field is empty** for 61/65 examples (`.pi/reports/2026-05-29_pml-kb-validator.md:98-105`) — noted as pending.
10. **`nul` file (181B) at the root** — a "broken" artifact (Windows NUL trap), mentioned as pre-existing dirty state in `kb-v4-baseline-smoke.md:11` — technical clutter requiring a decision.

---

## Contradictions between documents

1. **KB entry count: v2=110 / v3=118 / v4=328.** v2 and v3 are consistent (README → extraction-report). v4=328 contradicts the baseline smoke report (118, no import). → Need to clarify whether the v4-import is applied, rolled back, or nothing more than a factory artifact.
2. **v3-plan status:** in `.pi/plans/2026-06-03_kb-v3-remediation-plan.md:5` the label is **PENDING APPROVAL**, but v3 is already described as implemented in `README.md` and `docs/knowledge-base/pml-kb-v3.md`. → Either the plan was marked retroactively, or the README is ahead of the facts.
3. **Current state vs README:** the README describes v3 validation/tools as stable; the state of `kb-v4-run-state.json` says "fallback-cleanup-variant-b-validated", "searchSmokeRepair COLLECT alias added" — i.e. the code was already changed for the v4 mass import, which diverges from "No imports" in `kb-v4-baseline-smoke.md` (№1).
4. **`context.md` heading "# Code Context"** is misleading — it is the LLM runtime config (128k), not a description of the product's codebase; combined with the empty `progress.md`, it creates a distorted "solution map" on a quick audit.
5. **Model/runtime**: `run-state.json:30-36` says primary `openrouter/google/gemini-2.5-flash`, Groq "kept as fallback only" after tool-call/JSON failures; `context.md` mentions gemma-4-26B 128k. — this is about the agent runtime, not the product, but it is not centralized and can be read as a contradiction.

---

## Open Questions

1. Was KB v4 (328 entries) applied to the production code `src/knowledge/pml-kb/*.ts`, or are these artifacts of an isolated factory investigation? If it was applied — why does `kb-v4-baseline-smoke.md` claim "No imports"?
2. What has been decided about the 302 "category_decision_required" v4 rows (is a human gate needed for categories >18)?
3. Is there an official roadmap/version target for the pml-lsp MCP server separate from upstream? (Not found.)
4. Will the FMSYS/CMSYS Phase-2 and the full AVEVA docs crawl continue, or are they frozen?
5. Status of `djee79/pml-lsp` assets — will they be added after the license is clarified, or permanently excluded?
6. Will a full "formal PML grammar replacement" be created (README.md:135), or will the product remain a bootstrap/foundation?
7. The `nul` file and `context.md` at the root are runtime tech-debt; when will they be cleaned up outside the v4 plan?
8. Are ADRs planned for the recorded architectural decisions (fastmcp, license, 18 categories, snake_case IDs)?

---

## Supervisor coordination

Not required. The read-only research is complete; there are no blocking decisions. The artifact is saved at the path above.
