import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readKnowledge(relativePath: string): string {
  return readFileSync(join(process.cwd(), 'knowledge', relativePath), 'utf8');
}

export const resources = [
  {
    uri: 'pml://docs/syntax',
    name: 'PML syntax reference',
    description: 'Official-doc grounded PML syntax reference.',
    mimeType: 'text/markdown',
    load: async () => ({ text: readKnowledge('official/syntax-reference.md') }),
  },
  {
    uri: 'pml://docs/objects',
    name: 'PML objects and methods',
    description: 'Official-doc grounded PML object and method reference plus extracted source knowledge.',
    mimeType: 'text/markdown',
    load: async () => ({ text: readKnowledge('official/objects-and-methods.md') }),
  },
  {
    uri: 'pml://examples/loop_objects',
    name: 'PML loop examples',
    description: 'Working PML loop/object examples from the local example corpus.',
    mimeType: 'text/plain',
    load: async () => ({ text: readKnowledge('examples/loops.pml') }),
  },
];
