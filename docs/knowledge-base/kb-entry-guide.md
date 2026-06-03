# How to Add a New KB Entry

## Step 1: Choose the Category

Pick one of 18 categories: datatypes, controlflow, errorhandling, objects, forms, macros, functions, dotnetinterop, pdmsinteraction, namingconventions, typeconversion, logging, architecturepatterns, arrays, collections, datetime, ui, syscom.

## Step 2: Create the Entry

Open the corresponding file in `src/knowledge/pml-kb/<category>.ts` and add a new `KBEntry` object:

```typescript
{
  id: 'prefix_descriptive_name',       // snake_case, unique
  category: 'categoryname',             // one of 18
  subcategory: 'specific-topic',
  title: 'Human-readable title',
  principle: 'One-line principle',
  rule: 'Detailed rule description',
  syntax: `PML syntax example`,
  exampleCanonical: `-- CB sourcefile.pmlxxx
!realExample = object TYPE()`,
  exampleAntipattern: `-- NOT: wrong pattern
-- Explanation why`,
  pitfalls: [
    'Pitfall 1',
    'Pitfall 2',
  ],
  relatedIds: ['existing_entry_id'],
  sourcedoc: 'TM-1401 Rev 3.0',
  sourcecodebase: 'sourcefile.pmlxxx',
  aliases: ['alternative-name'],   // optional
}
```

## Step 3: ID Naming Convention

- Use snake_case for compatibility with the source KB: `dt_string_declaration`, `eh_handle_endhandle`.
- Prefix by domain: `dt_` (datatypes), `cf_` (controlflow), `eh_` (errorhandling), etc.
- Mandatory Perplexity additions use the exact `p2_` IDs from the master prompt.
- If a kebab-case alias is needed, add it to `aliases` rather than renaming the source ID.

## Step 4: Verify

```bash
npm run typecheck
npm test
npm run validate:kb
```

The v3 validator is intentionally strict. It rejects placeholder text, unresolved `relatedIds`, missing mandatory Claude/Perplexity IDs, duplicate canonical examples reused by too many entries, and `exampleCanonical` values that do not include `-- CB <sourcecodebase>`.

## Field Reference

| Field | Required | Description |
|---|---|---|
| `id` | ✅ | Unique snake_case identifier |
| `category` | ✅ | One of 18 allowed categories |
| `subcategory` | ✅ | Specific topic within category |
| `title` | ✅ | Short human-readable title |
| `principle` | ✅ | One-line summary |
| `rule` | ✅ | Detailed rule description |
| `syntax` | ✅ | PML syntax pattern |
| `exampleCanonical` | ✅ | Real example with `-- CB <filename>` prefix |
| `exampleAntipattern` | ✅ | Anti-pattern or empty string |
| `pitfalls` | ✅ | Array of at least 1 pitfall |
| `relatedIds` | ✅ | Array of related entry IDs |
| `sourcedoc` | ✅ | Source documentation reference |
| `sourcecodebase` | ✅ | Source codebase filename |
| `aliases` | ❌ | Optional alternative IDs |
