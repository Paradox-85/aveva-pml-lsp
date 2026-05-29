# PML LSP MCP Server

Standalone Model Context Protocol server foundation for AVEVA PML 1 / PML 2 diagnostics, syntax knowledge, examples, and agentic coding assistance.

## Purpose

This project exposes PML language-server style functionality to any MCP-capable agent, including Claude Code, pi-based orchestration, and local LLM bridges. It is not tied to VS Code extension APIs.

## Framework

Selected framework: `fastmcp` TypeScript. It wraps the official MCP TypeScript SDK, supports stdio and Streamable HTTP transports, and has a concise API for tools/resources/prompts.

## Source attribution

- Core parser/AST/diagnostic/data foundation adapted from `mikhalchankasm/vscode-pml-aveva-e3d`, MIT License, Copyright (c) 2025 MIKHALCHANKA SIARHEI.
- `djee79/pml-lsp` was cloned and analyzed for comparison only. It has no LICENSE file at the time of analysis, so no code/data/tests were copied from it.
- Official PML knowledge artifacts cite AVEVA documentation pages under `https://docs.aveva.com/`.

## Project layout

```text
src/server.ts              # MCP server entrypoint
src/mcp/                   # MCP tools, resources, prompts
src/core/                  # VS Code-independent PML parser/AST/diagnostics/data
knowledge/official/        # Official-doc grounded KB artifacts
knowledge/syntax/          # TextMate grammar source knowledge
knowledge/objects/         # PML object/type knowledge from MIT source repo
knowledge/snippets/        # Snippets from MIT source repo
knowledge/examples/        # Examples from MIT source repo and smoke examples
tests/                     # Unit/integration tests
```

## Setup

```bash
npm install
npm run typecheck
npm test
npm run build
npm start
```

## MCP usage

### Claude Code / stdio

Configure an MCP server command pointing to:

```bash
node dist/server.js
```

### HTTP Streamable transport

```bash
npm run build
node dist/server.js --http-stream
```

Default URL: `http://localhost:8080/mcp`.

## Tools

- `lint_pml_code` — parses and lints PML using `src/core/diagnostics/engine.ts`.
- `validate_pml_file` — validates a file from disk.
- `search_pml_kb` — searches local knowledge files.

## Resources

- `pml://docs/syntax`
- `pml://docs/objects`
- `pml://examples/loop_objects`

## Known limitations

- Full recursive AVEVA documentation crawl was partially blocked by direct HTTP 403 and generic shell pages for several child URLs; KB artifacts include citations and gap notes.
- FMSYS/CMSYS full method lists need expansion from official pages in Phase 2.
- djee79 assets are excluded pending license clarification.
- This is a foundation bootstrap, not yet a complete formal PML grammar replacement.
