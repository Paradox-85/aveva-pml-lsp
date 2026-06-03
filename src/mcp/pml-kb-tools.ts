import { z } from 'zod';
import type { KBCategory } from '../knowledge/schemas/kb-entry.js';
import { ALLOWED_CATEGORIES } from '../knowledge/schemas/kb-entry.js';
import { allPmlKbEntries, getEntriesByCategory, getPmlKbEntry } from '../knowledge/pml-kb/index.js';
import { searchKb } from '../knowledge/search/fuzzy-search.js';
import { diagnosePmlError, getRelatedEntries } from '../knowledge/search/diagnose.js';

const categorySchema = z.enum(ALLOWED_CATEGORIES as unknown as [KBCategory, ...KBCategory[]]);

export const pmlKbByCategoryTool = {
  name: 'pml_kb_by_category',
  description: 'List all KB entries for a given PML knowledge category.',
  parameters: z.object({
    category: categorySchema.describe('Category to list entries for.'),
  }),
  execute: async ({ category }: { category: KBCategory }) => {
    const entries = getEntriesByCategory(category);
    return JSON.stringify(entries.map(e => ({
      id: e.id,
      title: e.title,
      subcategory: e.subcategory,
    })), null, 2);
  },
};

export const pmlKbSearchTool = {
  name: 'pml_kb_search',
  description: 'Search PML knowledge base by keywords. Searches across id, title, category, syntax, pitfalls.',
  parameters: z.object({
    query: z.string().describe('Search query (multiple terms supported).'),
    limit: z.number().int().min(1).max(20).default(10).describe('Max results.'),
    category: z.string().optional().describe('Filter by category.'),
  }),
  execute: async ({ query, limit, category }: { query: string; limit: number; category?: string }) => {
    const results = searchKb(query, limit, category);
    return JSON.stringify(results.map(r => ({
      id: r.entry.id,
      title: r.entry.title,
      category: r.entry.category,
      score: r.score,
      matchedField: r.matchedField,
      snippet: r.snippet,
    })), null, 2);
  },
};

export const pmlKbGetTool = {
  name: 'pml_kb_get',
  description: 'Get a single KB entry by ID or alias.',
  parameters: z.object({
    id: z.string().describe('Entry ID or alias.'),
  }),
  execute: async ({ id }: { id: string }) => {
    const entry = getPmlKbEntry(id);
    if (!entry) return JSON.stringify({ error: `Entry not found: ${id}` }, null, 2);
    return JSON.stringify(entry, null, 2);
  },
};

export const pmlKbRelatedTool = {
  name: 'pml_kb_related',
  description: 'Get related KB entries for a given entry ID.',
  parameters: z.object({
    id: z.string().describe('Entry ID to find related entries for.'),
    limit: z.number().int().min(1).max(20).default(5).describe('Max related entries.'),
  }),
  execute: async ({ id, limit }: { id: string; limit: number }) => {
    const related = getRelatedEntries(id, limit);
    return JSON.stringify(related.map(e => ({
      id: e.id,
      title: e.title,
      category: e.category,
    })), null, 2);
  },
};

export const pmlKbAntipatternsTool = {
  name: 'pml_kb_antipatterns',
  description: 'List KB entries that have documented anti-patterns.',
  parameters: z.object({
    category: z.string().optional().describe('Filter by category.'),
  }),
  execute: async ({ category }: { category?: string }) => {
    const candidates = category
      ? allPmlKbEntries.filter(e => e.category === category)
      : allPmlKbEntries;
    const withAnti = candidates.filter(e => e.exampleAntipattern && !e.exampleAntipattern.startsWith('NOT_FOUND'));
    return JSON.stringify(withAnti.map(e => ({
      id: e.id,
      title: e.title,
      antipattern: e.exampleAntipattern,
    })), null, 2);
  },
};

export const pmlDiagnoseTool = {
  name: 'pml_diagnose',
  description: 'Diagnose a PML error message or code snippet and suggest KB entries.',
  parameters: z.object({
    errorText: z.string().optional().describe('Error message or code snippet to diagnose.'),
    error_text: z.string().optional().describe('Backward-compatible alias for errorText.'),
  }).refine(input => Boolean(input.errorText ?? input.error_text), {
    message: 'Either errorText or error_text is required',
  }),
  execute: async ({ errorText, error_text }: { errorText?: string; error_text?: string }) => {
    const results = diagnosePmlError(errorText ?? error_text ?? '');
    return JSON.stringify(results.map(r => ({
      pattern: r.errorPattern,
      description: r.description,
      suggestions: r.suggestions.map(s => ({ id: s.id, title: s.title })),
    })), null, 2);
  },
};

export const pmlKbTools = [
  pmlKbByCategoryTool,
  pmlKbSearchTool,
  pmlKbGetTool,
  pmlKbRelatedTool,
  pmlKbAntipatternsTool,
  pmlDiagnoseTool,
];
