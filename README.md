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

## Knowledge Base v3

PML Knowledge Base v3 provides structured AVEVA PML knowledge for the MCP server: **118 entries** across **18 categories**, grounded in official documentation and real `docs/codebase/` examples. It covers all 87 Claude KB source IDs and all 18 mandatory Perplexity `p2_*` patterns. See [`docs/knowledge-base/pml-kb-v3.md`](docs/knowledge-base/pml-kb-v3.md) for full details.

### Categories

| Category | Description | Entries |
|---|---|---|
| `datatypes` | STRING, REAL, ARRAY, BOOLEAN, DBREF, UNSET | 8 |
| `controlflow` | IF/ELSEIF, DO/ENDDO, BREAK/SKIP, RETURN, null/scope | 7 |
| `errorhandling` | HANDLE/ENDHANDLE, error variables, import protection | 6 |
| `objects` | .pmlobj definition, constructor, methods, overloading | 8 |
| `forms` | .pmlfrm structure, callbacks, widgets, NETGRIDCONTROL | 13 |
| `macros` | .pmlmac structure, arguments, file paths, pipelines | 7 |
| `functions` | .pmlfnc definition, return values, arguments | 5 |
| `dotnetinterop` | .NET imports, PMLFILEBROWSER, PMLTAGS, MEASURE/UNIT | 10 |
| `pdmsinteraction` | CE, navigation, attributes, transactions, DBREF, BACKREF | 10 |
| `namingconventions` | Variable/object/method naming, prefixes, conventions | 5 |
| `typeconversion` | DB→PML mapping, string/real/date conversion, NA replacement | 6 |
| `logging` | ramCommonLogger, severity levels, form integration | 5 |
| `architecturepatterns` | Loader chain, separation of concerns, progress | 7 |
| `arrays` | ARRAY methods, iteration, sorting, evaluate/reindex | 9 |
| `collections` | COLLECT (PML1), COLLECTION (PML2), EVALUATE | 4 |
| `datetime` | DATETIME creation, DATEFORMAT, file timestamps | 3 |
| `ui` | Widget prefixes, positioning, show/hide | 3 |
| `syscom` | SYSCOM external commands, sync/async patterns | 2 |

### New MCP tools

- `pml_kb_by_category` — list entries for a category.
- `pml_kb_search` — weighted full-text search across KB fields.
- `pml_kb_get` — get a single entry by ID or alias.
- `pml_kb_related` — list related entries for an entry.
- `pml_kb_antipatterns` — list entries with documented anti-patterns.
- `pml_diagnose` — diagnose PML error text and suggest relevant KB entries.

### Validation

```bash
npm run validate:kb
```

The v3 validator checks required Claude and Perplexity IDs, placeholder text, canonical `-- CB <sourcecodebase>` examples, related IDs, duplicate example reuse, search smoke coverage, and context-token matching.

## Known limitations

- Full recursive AVEVA documentation crawl was partially blocked by direct HTTP 403 and generic shell pages for several child URLs; KB artifacts include citations and gap notes.
- FMSYS/CMSYS full method lists need expansion from official pages in Phase 2.
- djee79 assets are excluded pending license clarification.
- This is a foundation bootstrap, not yet a complete formal PML grammar replacement.
