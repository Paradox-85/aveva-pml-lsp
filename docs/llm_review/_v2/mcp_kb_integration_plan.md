# План интеграции расширенной KB в MCP-сервер aveva-pml-lsp

## Текущая архитектура MCP-сервера

```
aveva-pml-lsp/
├── src/
│   ├── server.ts              # FastMCP сервер (stdio/httpStream)
│   ├── github-kb.ts           # (не используется активно)
│   ├── core/                  # Парсер, AST, диагностика PML
│   │   ├── parser/
│   │   ├── ast/
│   │   ├── diagnostics/
│   │   ├── analysis/
│   │   └── types.ts
│   └── mcp/
│       ├── tools.ts           # lint_pml_code, validate_pml_file, search_pml_kb
│       ├── resources.ts       # pml://docs/syntax, pml://docs/objects, pml://examples
│       └── prompts.ts         # write_macro, review_code
├── knowledge/                 # Локальная база знаний (Markdown, JSON, PML)
│   ├── official/              # syntax-reference, objects-and-methods, best-practices
│   ├── objects/               # PML-объекты (File, Location, Array, etc.)
│   ├── examples/              # Примеры PML-кода (.pml, .pmlfrm, .pmlfnc)
│   ├── snippets/              # VS Code сниппеты (pml.json)
│   └── syntax/                # TextMate грамматика
└── docs/
    └── codebase/              # Production codebase (87 файлов)
```

## Что нужно интегрировать

**pml_knowledge_base.md (v2)** — 101 запись KB + 5 спецразделов:
- 13 категорий записей с principle/rule/syntax/example_canonical/antipattern/pitfalls
- Глоссарий (22 термина)
- Карта зависимостей codebase (граф)
- 8 типичных ошибок с диагностикой
- Чеклист разработчика (7 вопросов)
- Индекс источников (PDF→KB, codebase→KB)

---

## ЭТАП 1: Разбиение монолитного KB на категорийные файлы

### Зачем
Текущий `search_pml_kb` ищет по всем файлам в `knowledge/`. Одна большая KB-файл (240KB) плохо ранжируется при текстовом поиске. Разбиение по категориям позволяет:
- Точнее находить релевантные записи
- Загружать как отдельные MCP-ресурсы
- Инкрементально обновлять

### Как

Создать директорию `knowledge/kb/` и разбить на файлы:

```
knowledge/kb/
├── README.md                        # Метаданные, оглавление, legend
├── categories/
│   ├── data-types.md                # 11 записей
│   ├── control-flow.md              # 7 записей
│   ├── error-handling.md            # 7 записей
│   ├── objects.md                   # 8 записей
│   ├── forms.md                     # 13 записей
│   ├── macros.md                    # 8 записей
│   ├── functions.md                 # 5 записей
│   ├── dotnet-interop.md            # 8 записей
│   ├── pdms-interaction.md          # 11 записей
│   ├── naming-conventions.md        # 5 записей
│   ├── type-conversion.md           # 5 записей
│   ├── logging.md                   # 5 записей
│   └── architecture-patterns.md     # 8 записей
├── special/
│   ├── glossary.md                  # 22 термина
│   ├── dependency-map.md            # Граф зависимостей
│   ├── common-errors.md             # 8 ошибок с диагностикой
│   ├── developer-checklist.md       # 7 вопросов
│   └── source-index.md             # PDF→KB, codebase→KB
└── full-kb.md                       # Полная версия (для справки / export)
```

### Скрипт разбиения

```bash
# Создать из монолитного файла категорийные файлы
# Используя grep + awk по маркерам "### Категория:" и "## Раздел"
mkdir -p knowledge/kb/categories knowledge/kb/special
# Автоматическое разбиение через Node.js скрипт (см. ЭТАП 5)
```

---

## ЭТАП 2: Новые MCP-ресурсы

### 2.1. Категорийные ресурсы

Добавить в `src/mcp/resources.ts`:

```typescript
// Динамическая загрузка категорий KB
const kbCategories = [
  'data-types', 'control-flow', 'error-handling', 'objects',
  'forms', 'macros', 'functions', 'dotnet-interop',
  'pdms-interaction', 'naming-conventions', 'type-conversion',
  'logging', 'architecture-patterns',
];

for (const cat of kbCategories) {
  resources.push({
    uri: `pml://kb/${cat}`,
    name: `PML KB: ${cat}`,
    description: `Knowledge base entries for ${cat} patterns and best practices.`,
    mimeType: 'text/markdown',
    load: async () => ({ text: readKnowledge(`kb/categories/${cat}.md`) }),
  });
}

// Спецразделы
resources.push({
  uri: 'pml://kb/glossary',
  name: 'PML Glossary',
  description: '22 PML/PDMS terms with definitions.',
  mimeType: 'text/markdown',
  load: async () => ({ text: readKnowledge('kb/special/glossary.md') }),
});

resources.push({
  uri: 'pml://kb/common-errors',
  name: 'PML Common Errors',
  description: '8 most common PML errors with symptoms, causes, and fixes.',
  mimeType: 'text/markdown',
  load: async () => ({ text: readKnowledge('kb/special/common-errors.md') }),
});

resources.push({
  uri: 'pml://kb/checklist',
  name: 'PML Developer Checklist',
  description: '7-question checklist before writing PML code.',
  mimeType: 'text/markdown',
  load: async () => ({ text: readKnowledge('kb/special/developer-checklist.md') }),
});

resources.push({
  uri: 'pml://kb/dependency-map',
  name: 'PML Codebase Dependency Map',
  description: 'OWNS/USES/CALLS graph of all codebase objects, forms, functions, macros.',
  mimeType: 'text/markdown',
  load: async () => ({ text: readKnowledge('kb/special/dependency-map.md') }),
});
```

---

## ЭТАП 3: Улучшение search_pml_kb tool

### Проблема текущей реализации
Текущий `search_pml_kb` делает простой text-match по всем файлам. При наличии 101 JSON-записей KB нужен семантически более точный поиск.

### Решение: JSON-индекс + term-scoring

```typescript
// Новый файл: src/core/data/kb-index.ts

interface KBEntry {
  id: string;
  category: string;
  title: string;
  principle: string;
  rule: string;
  pitfalls: string[];
  related_ids: string[];
  // остальные поля
}

// Загрузка KB при старте сервера
let kbEntries: KBEntry[] = [];

export function loadKBIndex(): void {
  const kbPath = join(process.cwd(), 'knowledge', 'kb', 'full-kb.json');
  kbEntries = JSON.parse(readFileSync(kbPath, 'utf8'));
}

export function searchKB(query: string, limit: number = 5): KBEntry[] {
  const terms = query.toLowerCase().split(/\s+/);
  return kbEntries
    .map(entry => {
      const searchable = [
        entry.title, entry.principle, entry.rule,
        entry.category, entry.id, ...entry.pitfalls,
      ].join(' ').toLowerCase();
      const score = terms.reduce((sum, term) =>
        sum + (searchable.includes(term) ? 1 : 0), 0);
      return { entry, score };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(m => m.entry);
}
```

### Новый tool: `lookup_pml_pattern`

```typescript
export const lookupPmlPatternTool = {
  name: 'lookup_pml_pattern',
  description: 'Look up a specific PML pattern or best practice by ID, category, or keyword.',
  parameters: z.object({
    id: z.string().optional().describe('Exact KB entry ID (e.g. "eh_handle_any")'),
    category: z.string().optional().describe('Category filter'),
    query: z.string().optional().describe('Free-text search'),
    limit: z.number().int().min(1).max(20).default(5),
  }),
  execute: async ({ id, category, query, limit }) => {
    if (id) {
      const entry = kbEntries.find(e => e.id === id);
      return entry ? JSON.stringify(entry, null, 2) : 'Not found';
    }
    let results = kbEntries;
    if (category) results = results.filter(e => e.category === category);
    if (query) results = searchKB(query, limit);
    return JSON.stringify(results.slice(0, limit), null, 2);
  },
};
```

---

## ЭТАП 4: Новые промпты

Добавить в `src/mcp/prompts.ts`:

```typescript
{
  name: 'diagnose_error',
  description: 'Diagnose a PML runtime error using the KB common-errors section.',
  arguments: [
    { name: 'error_message', description: 'The PML error message or symptoms.', required: true },
    { name: 'code_context', description: 'Code around the error.', required: false },
  ],
  load: async ({ error_message, code_context }) => {
    const errors = readKnowledge('kb/special/common-errors.md');
    return `Diagnose this PML error using the common errors database:\n\nError: ${error_message}\n${code_context ? `\nCode:\n${code_context}` : ''}\n\nKnown errors:\n${errors}\n\nProvide: symptom match, root cause, fix with code example.`;
  },
},
{
  name: 'review_architecture',
  description: 'Review PML code architecture using KB patterns.',
  arguments: [
    { name: 'code', description: 'PML code to review.', required: true },
    { name: 'type', description: 'File type: pmlobj, pmlfnc, pmlmac, pmlfrm.', required: false },
  ],
  load: async ({ code, type }) => {
    const patterns = readKnowledge('kb/categories/architecture-patterns.md');
    const checklist = readKnowledge('kb/special/developer-checklist.md');
    return `Review this PML ${type ?? 'code'} for architecture patterns and best practices:\n\n${code}\n\nReference patterns:\n${patterns}\n\nChecklist:\n${checklist}`;
  },
},
{
  name: 'explain_pattern',
  description: 'Explain a PML pattern with principle, rule, and codebase examples.',
  arguments: [
    { name: 'topic', description: 'Pattern name or topic (e.g. "error handling", "loader chain").', required: true },
  ],
  load: async ({ topic }) => {
    // search KB for matching entries
    return `Explain the PML pattern "${topic}" using the knowledge base. Include: principle (WHY), rule (WHAT), syntax, canonical example from codebase, common pitfalls.`;
  },
},
```

---

## ЭТАП 5: JSON-версия KB для программного доступа

Создать `knowledge/kb/full-kb.json` — массив JSON-объектов, парсимый программно:

```typescript
// scripts/convert-kb-to-json.ts
// Парсит Markdown KB и извлекает JSON-блоки из ```json ... ``` секций
import { readFileSync, writeFileSync } from 'fs';

const md = readFileSync('knowledge/kb/full-kb.md', 'utf8');
const jsonBlocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)]
  .map(m => {
    try { return JSON.parse(m[1]); } catch { return null; }
  })
  .filter(Boolean);

writeFileSync('knowledge/kb/full-kb.json', JSON.stringify(jsonBlocks, null, 2));
console.log(`Extracted ${jsonBlocks.length} KB entries`);
```

---

## ЭТАП 6: Интеграция с диагностическим движком

### Связь KB → lint rules

Некоторые записи KB описывают паттерны, которые можно проверить статически:

| KB Entry | Lint Rule |
|----------|-----------|
| `eh_import_protection` | WARN: `import` without surrounding `handle any/endhandle` |
| `dt_array_declaration` | WARN: `.append()` без предшествующей инициализации `= object ARRAY()` |
| `obj_constructor_pattern` | WARN: member-объект не инициализирован в конструкторе |
| `pdms_element_existence` | WARN: `.dbRef()` без handle |
| `nc_variable_naming` | INFO: глобальная переменная `!!` в lowercase (конвенция — camelCase) |

Добавить в `src/core/diagnostics/engine.ts`:

```typescript
// KB-informed diagnostic rules
function checkImportGuard(ast: PmlAst): Diagnostic[] {
  // Find `import` statements not wrapped in handle any/endhandle
}

function checkDbRefWithoutHandle(ast: PmlAst): Diagnostic[] {
  // Find .dbRef() calls not inside handle blocks
}
```

---

## ЭТАП 7: Порядок реализации (приоритеты)

| # | Задача | Сложность | Приоритет |
|---|--------|-----------|-----------|
| 1 | Скопировать `full-kb.md` в `knowledge/kb/` | Тривиально | P0 |
| 2 | Разбить на категорийные файлы | Скрипт ~50 строк | P0 |
| 3 | Создать JSON-версию KB | Скрипт ~30 строк | P1 |
| 4 | Добавить MCP-ресурсы (categories + special) | ~40 строк TypeScript | P1 |
| 5 | Реализовать `lookup_pml_pattern` tool | ~60 строк TypeScript | P1 |
| 6 | Добавить новые промпты | ~50 строк TypeScript | P2 |
| 7 | Улучшить search_pml_kb scoring | ~40 строк TypeScript | P2 |
| 8 | Интеграция с lint engine | ~200 строк TypeScript | P3 |

### Минимальный MVP (P0+P1): ~4 часа работы
1. Поместить `full-kb.md` → `knowledge/kb/full-kb.md`
2. Разбить на 13 категорийных + 5 спец-файлов
3. Создать JSON-индекс
4. Добавить ресурсы и tool `lookup_pml_pattern`
5. Обновить README

### Полная реализация (P0–P3): ~2 дня работы
Всё выше + lint rules, промпты, улучшенный scoring
