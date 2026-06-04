# PML KB Self-Learning Factory

## Purpose
An isolated pipeline for gap analysis and self-learning of the AVEVA PML Knowledge Base from real PML files under `docs/codebase/`.

## Agent architecture
The factory uses `.pi/agents/pml-worker.md` for both generation and review because builtin `worker` does not inherit the parent MCP toolset. The `pml-worker` agent explicitly declares AVEVA PML MCP tools.

## Pipeline
1. Orchestrator reads a source file and creates a semantic task description without copying source code.
2. `pml-worker` runs `[WORKER]` to generate a blind benchmark using MCP/KB knowledge.
3. Orchestrator saves benchmark into `docs/factory/benchmarks/`.
4. `pml-worker` runs `[REVIEWER]` to compare original and benchmark across D1-D7.
5. Orchestrator saves gap report into `docs/factory/gap-reports/`.
6. If required, KBEntry drafts are saved into `docs/factory/kb-patches/`.
7. KB patches are never applied automatically.

## Safety
- Factory artifacts are isolated under `docs/factory/`.
- Generated benchmark files are not source of truth.
- `autoApplyPatch` is disabled by default.
- Real KB source changes require a separate manual apply phase.
