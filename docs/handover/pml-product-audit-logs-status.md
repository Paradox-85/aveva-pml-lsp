# PML Product Audit — Logs, Session Artifacts, Plans & Status

Auditor: independent read-only scout
Repo: `C:/Work/Development/projects/bami/bami-tech/aveva-automation/clients/bami/rnd/pml-lsp`
Branch: `main`
Report generated: 2026-07-31 09:06:56

> Note: Repo content is dated 2026-05/06. All inline timestamps below come from committed reports/run-state, **not** from the current wall-clock (2026-07-31). Several `pipeline.log` / `run-state` timestamps are clearly synthesized/backdated inside the artifacts; treat exact clocks with caution, but the *narrative* sequence is consistent and committed.

---

## Timeline

| When (artifact date) | What happened | Source |
|---|---|---|
| 2026-05-29 | Bootstrap: PML LSP MCP server core cloned/adapted. KB enrichment Phase 1 validation | `.pi/reports/2026-05-29_pml-kb-validator.md`, git log `1982482`, `857b74d` |
| 2026-05-29 | KB enrichment plan (official AVEVA manuals) + validator report PASS | `.pi/plans/2026-05-29_pml-kb-enrichment.md`, `.pi/reports/2026-05-29_pml-kb-validator.md` |
| 2026-06-02 | Codebase harmonization plan (97 PML files) | `.pi/plans/2026-06-02_pml-codebase-harmonization.md` |
| 2026-06-03 | KB v3 remediation plan (scaffold→content) / implemented | `.pi/plans/2026-06-03_kb-v3-remediation-plan.md`, git `311be24` |
| 2026-06-03 | PML MCP generation benchmark (note: worker MCP tools were **unavailable** in isolated session) | `.pi/research/2026-06-03_pml-mcp-generation-benchmark.md` |
| 2026-06-03 23:33 | Factory rerun complete: **84/84 files, 74 patch_ready, 6 manual_review, 4 gap_analyzed** | `docs/factory/logs/run-state.json`, `pipeline.log.md` |
| 2026-06-04 | KB v3 action plan → 449 D7 gaps, but "KB essentially empty" (issue) | `docs/llm_review/_v3/kb-v3-action-plan.md` |
| 2026-06-04 22:08–22:10 | v4 inventory + gap aggregation (880 mentions / 424-546 candidates) → gap analysis (458 candidates, 328 category_decision_required, 111 manual_review, 19 ready) | `pipeline.log.md`, `kb-v4-gap-*.md` |
| 2026-06-04 22:12 | v4 pre-import gates complete (baseline 118 entries, smoke PASS) | `kb-v4-baseline-smoke.md` |
| 2026-06-04 22:30 | v4 **batch-1 import**: 5 entries (JDE_newtag_import) → 123 entries | `kb-v4-batch-1-import.md` |
| 2026-06-04 23:32 | **validated workbook import**: 371 new entries, 68 REJECT (439-row workbook) | `kb-v4-validated-import.md`, `pipeline.log.md` |
| 2026-06-04 23:33 | validation after mass import: 508 entries PASS; added alias `COLLECT` to `p2_collect_pml1` | `pipeline.log.md` |
| 2026-06-04 23:51 | **fallback cleanup Variant B**: removed 180, repaired 29 | `kb-v4-fallback-cleanup.md` |
| 2026-06-04 23:53 | final v4 validation: **328 entries, 18 categories, 0 issues**; typecheck+tests pass | `kb-v4-run-state.json`, `pipeline.log.md` |
| 2026-06-05 00:55 | Final commit `cfe9dbe` "Enrich PML KB v4 and cleanup fallback entries" (45 files, +69748 lines) | `git log`, `git show --stat HEAD` |

**Last known completed work (committed):** PML KB v4 enrichment pipeline — 328 validated KB entries across 18 categories; all gates (baseline, smoke, inventory, aggregation, decision matrix, batch-1, remaining-ready, validated workbook import, fallback cleanup) PASS; `npm run validate:kb` / `typecheck` / `test` all green.

---

## Evidence (recent session artifacts)

- `docs/factory/logs/kb-v4-run-state.json` :
  - `finalKbEntries: 328`, `finalKbCategories: 18`, `validationStatus: "passed"`.
  - Sequence: baseline 118 → batch-1 123 → remaining-ready 137 → workbook import → cleanup 328.
  - `nextAction: "review final diff hygiene before commit"`, `stopCondition: null`.
  - Imports tracked: batch-1 (5 IDs) + remaining-ready (14 IDs).
  - Manual-validation workbook: 439 rows → `category_decision_required` 328, `manual_review` 111; by action: `CATEGORY_DECISION` 302, `DEFER_SOURCE_NEEDED` 26, `REPAIR_CB` 80, `REPAIR_RELATEDIDS` 1, `REVIEW` 30.
  - Validated import: 371 IMPORT / 68 REJECT rows.
  - Cleanup Variant B: removed 180, repaired 29, remaining fallback-like 4.

- `docs/factory/logs/pipeline.log.md` : complete per-file ledger (74/6/3/1 split for 84 files) and step-by-step v4 chronology summarized above.

- `docs/factory/logs/run-state.json` : model policy = primary `openrouter/google/gemini-2.5-flash`, fallbacks `local-qwen/qwen36-35b-moe`, `groq/openai/gpt-oss-20b` (Groq caused JSON/tool-call failures → fallback only).

- `docs/factory/reports/kb-v4-source-inventory.md` / `.json` : A1–A6, B1–B3, C1–C4 source inventory complete.

- `docs/factory/reports/kb-v4-fallback-cleanup.md` : 4 remaining fallback-like entries listed (architecturepatterns ×2, dotnetinterop ×1, objects ×1).

- `docs/factory/reports/kb-v4-validated-import-errors.json` : **2 failed imports** — `kb-pml-reload-object-directive` and `kb-tagmanagementtmp-object`, both failed on `sourcecodebase missing/not found: 'class-name-refresh.pmlmac, alarm_refresh.pmlmac'` (comma-joined non-existent codebase path).

- `.pi/agents/pml-worker.md` : worker agent contract (WORKER/REVIEWER/SMOKE modes, MCP tool list, model policy, hard rules — no auto-apply of patch drafts).

- `.pi/research/2026-06-03_pml-mcp-generation-benchmark.md` : earlier isolated run where **worker's MCP tools were unavailable**; local lint used instead — a recurring risk noted.

- `.pi/context/codebase-and-patterns.md` : KB invariants (18 categories, mandatory `-- CB <file>` anchor, manual transfer policy, risks: semantic divergence / search fragility / category lock).

- `git log` : 14 commits, `main` up to `cfe9dbe` (2026-06-05). `git status` shows uncommitted `context.md` (dirty, pre-existing) + untracked `nul` and `docs/factory/reports/kb-v4-validated-import-errors.json`.

- `docs/knowledge-base/pml-kb-v3.md` : v3 baseline = 118 entries (87/87 Claude, 18/18 p2).

---

## Unresolved Items

- **v4 final artifact missing:** `docs/knowledge-base/pml-kb-v4.md` and `docs/factory/reports/kb-v4-final-report.{md,json}` do **not** exist → plan Tasks 11 & 14 (changelog + final report) incomplete.
- **2 failed validated-workbook imports** un-remediated: `kb-pml-reload-object-directive`, `kb-tagmanagementtmp-object` (bad multi-file `sourcecodebase`). Errors JSON is untracked/uncommitted.
- **4 fallback-like entries still in KB** (flagged for review).
- **Remaining candidates not imported:** manual workbook still has 302 `CATEGORY_DECISION` + 26 `DEFER_SOURCE_NEEDED` + 80 `REPAIR_CB` + 30 `REVIEW` rows awaiting human decision.
- **Unresolved 6 manual_review / 4 gap_analyzed source files** (from 84-manifest rerun) — most notably obj_03, obj_05, frm_01, fnc_16 (critical/high gaps, no patch).
- **Stress/benchmark (v4-isolated) not run:** plan Tasks 12–13 (stress config, isolated benchmark before/after) show no committed artifacts.
- **`context.md` / `docs/review/kb_review_v4.md`** — README still describes "KB v3" (118 entries); not upgraded to v4 (README claims 118/33 entries).
- **Git hygiene:** uncommitted `context.md` modification and stray `nul` file (Windows artifact).
- **Known upstream limitation:** recursive AVEVA docs crawl partially blocked (HTTP 403); FMSYS/CMSYS method lists deferred to "Phase 2" (README "Known limitations").
- `djee79/pml-lsp` assets excluded pending license clarification.

---

## Implied Next Steps

1. **Finalize v4 docs/report** (plan T11/T14): write `docs/knowledge-base/pml-kb-v4.md`, `kb-v4-changelog.md`, and `kb-v4-final-report.{md,json}`; update README from 118-entry v3 → 328-entry v4 counts.
2. **Repair & import the 2 failed workbook entries** — fix `sourcecodebase` to a single valid codebase path, then re-validate.
3. **Resolve the remaining human-decision backlog** from `kb-v4-manual-validation.xlsx` (302 CATEGORY_DECISION / 26 DEFER / 80 REPAIR_CB / 30 REVIEW) and prune/repair the 4 fallback-like KEEP entries.
4. **Run the planned stress-test / isolated benchmark** (plan T12/T13) and compare pre/post-v4 D1–D7 fidelity; confirm no top-8 search dilution regression.
5. **Reconcile the 6 manual_review + 4 gap_analyzed source files** (obj_03, obj_05, frm_01, fnc_16…) that still lack KB coverage.
6. **Git hygiene:** commit pending reports (`kb-v4-validated-import-errors.json`), resolve `context.md` modification, remove stray `nul`.
7. **Create `docs/review/kb_review_v4.md`** honest coverage/review report (plan T9 analog) documenting residual semantic-divergence and search-fragility risks.

---

## Files of Interest (read-first)

1. `docs/factory/logs/kb-v4-run-state.json` — authoritative final v4 state + nextAction.
2. `docs/factory/logs/pipeline.log.md` — full step chronology + per-file ledger.
3. `docs/factory/reports/kb-v4-gap-*.md` (gap-analysis / manual-validation / validated-import / fallback-cleanup) — decision details & unresolved candidates.
4. `.pi/plans/plan.md` — 17-task v4 pipeline contract (the source of truth for which tasks are done vs pending).
5. `.pi/agents/pml-worker.md` — worker/MCP model & pipeline agent contract.
6. `docs/factory/reports/kb-v4-validated-import-errors.json` — the 2 unimported entries.
