import type { KBEntry } from '../schemas/kb-entry.js';
import { allPmlKbEntries, getPmlKbEntry } from '../pml-kb/index.js';

export interface SearchResult {
  entry: KBEntry;
  score: number;
  matchedField: string;
  snippet: string;
}

/** Weighted fuzzy search across KB entries */
export function searchKb(query: string, limit = 10, category?: string): SearchResult[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const candidates = category
    ? allPmlKbEntries.filter(e => e.category === category)
    : allPmlKbEntries;

  const results: SearchResult[] = [];

  for (const entry of candidates) {
    const fields: Array<{ name: string; value: string; weight: number }> = [
      { name: 'id', value: entry.id, weight: 10 },
      { name: 'aliases', value: (entry.aliases ?? []).join(' '), weight: 9 },
      { name: 'title', value: entry.title, weight: 8 },
      { name: 'category', value: entry.category, weight: 7 },
      { name: 'subcategory', value: entry.subcategory, weight: 7 },
      { name: 'principle', value: entry.principle, weight: 5 },
      { name: 'rule', value: entry.rule, weight: 5 },
      { name: 'syntax', value: entry.syntax, weight: 4 },
      { name: 'pitfalls', value: entry.pitfalls.join(' '), weight: 3 },
      { name: 'exampleCanonical', value: entry.exampleCanonical, weight: 2 },
    ];

    let bestScore = 0;
    let bestField = '';
    let bestSnippet = '';

    for (const field of fields) {
      const lower = field.value.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (lower.includes(term)) {
          score += field.weight;
          // Bonus for exact match
          if (lower === term) score += 5;
          // Bonus for match at start
          if (lower.startsWith(term)) score += 3;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestField = field.name;
        const idx = lower.indexOf(terms[0]);
        bestSnippet = field.value.slice(Math.max(0, idx - 40), idx + 100);
      }
    }

    if (bestScore > 0) {
      results.push({ entry, score: bestScore, matchedField: bestField, snippet: bestSnippet });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Search by entry ID or alias (exact match) */
export function getByIdOrAlias(id: string): KBEntry | undefined {
  return getPmlKbEntry(id);
}

/** Get anti-patterns for a category */
export function getAntipatterns(category?: string): KBEntry[] {
  const candidates = category
    ? allPmlKbEntries.filter(e => e.category === category)
    : allPmlKbEntries;
  return candidates.filter(e => e.exampleAntipattern && !e.exampleAntipattern.startsWith('NOT_FOUND'));
}
