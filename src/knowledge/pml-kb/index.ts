import type { KBEntry, KBCategory } from '../schemas/kb-entry.js';
import { datatypesEntries } from './datatypes.js';
import { controlflowEntries } from './controlflow.js';
import { errorhandlingEntries } from './errorhandling.js';
import { objectsEntries } from './objects.js';
import { formsEntries } from './forms.js';
import { macrosEntries } from './macros.js';
import { functionsEntries } from './functions.js';
import { dotnetinteropEntries } from './dotnetinterop.js';
import { pdmsinteractionEntries } from './pdmsinteraction.js';
import { namingconventionsEntries } from './namingconventions.js';
import { typeconversionEntries } from './typeconversion.js';
import { loggingEntries } from './logging.js';
import { architecturepatternsEntries } from './architecturepatterns.js';
import { arraysEntries } from './arrays.js';
import { collectionsEntries } from './collections.js';
import { datetimeEntries } from './datetime.js';
import { uiEntries } from './ui.js';
import { syscomEntries } from './syscom.js';

export const allPmlKbEntries: KBEntry[] = [
  ...datatypesEntries,
  ...controlflowEntries,
  ...errorhandlingEntries,
  ...objectsEntries,
  ...formsEntries,
  ...macrosEntries,
  ...functionsEntries,
  ...dotnetinteropEntries,
  ...pdmsinteractionEntries,
  ...namingconventionsEntries,
  ...typeconversionEntries,
  ...loggingEntries,
  ...architecturepatternsEntries,
  ...arraysEntries,
  ...collectionsEntries,
  ...datetimeEntries,
  ...uiEntries,
  ...syscomEntries,
];

export const entriesByCategory = new Map<KBCategory, KBEntry[]>();
for (const entry of allPmlKbEntries) {
  let list = entriesByCategory.get(entry.category);
  if (!list) {
    list = [];
    entriesByCategory.set(entry.category, list);
  }
  list.push(entry);
}

export function getPmlKbEntry(id: string): KBEntry | undefined {
  return allPmlKbEntries.find(e => e.id === id || e.aliases?.includes(id));
}

export function getEntriesByCategory(category: KBCategory): KBEntry[] {
  return entriesByCategory.get(category) ?? [];
}
