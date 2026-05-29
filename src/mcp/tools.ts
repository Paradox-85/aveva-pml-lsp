import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { lintPmlCode } from '../core/diagnostics/engine.js';

export const lintPmlCodeTool = {
  name: 'lint_pml_code',
  description: 'Parse and lint AVEVA PML code using the extracted core parser and diagnostics engine.',
  parameters: z.object({
    code: z.string().describe('PML source code to lint.'),
    uri: z.string().optional().describe('Optional URI/path used to infer parser mode from extension.'),
  }),
  execute: async ({ code, uri }: { code: string; uri?: string }) => JSON.stringify(lintPmlCode(code, { uri }), null, 2),
};

export const validatePmlFileTool = {
  name: 'validate_pml_file',
  description: 'Validate a PML file on disk using the core parser and diagnostics engine.',
  parameters: z.object({
    path: z.string().describe('Path to a PML file accessible to the server.'),
  }),
  execute: async ({ path }: { path: string }) => {
    const code = readFileSync(path, 'utf8');
    return JSON.stringify(lintPmlCode(code, { uri: path }), null, 2);
  },
};

function collectMarkdown(root: string, maxFiles = 50): string[] {
  const out: string[] = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) visit(full);
      else if (/\.(md|json|pml|pmlmac|pmlfnc|pmlfrm|pmlobj)$/i.test(entry)) out.push(full);
      if (out.length >= maxFiles) return;
    }
  };
  visit(root);
  return out;
}

export const searchPmlKbTool = {
  name: 'search_pml_kb',
  description: 'Search local PML knowledge files for a text query.',
  parameters: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(20).default(5),
  }),
  execute: async ({ query, limit }: { query: string; limit: number }) => {
    const root = join(process.cwd(), 'knowledge');
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = collectMarkdown(root).map((file) => {
      const text = readFileSync(file, 'utf8');
      const lower = text.toLowerCase();
      const score = terms.reduce((sum, term) => sum + (lower.includes(term) ? 1 : 0), 0);
      const first = terms.map((term) => lower.indexOf(term)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
      return { file, score, snippet: text.slice(Math.max(0, first - 160), first + 500) };
    }).filter((m) => m.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
    return JSON.stringify(matches, null, 2);
  },
};

export const tools = [lintPmlCodeTool, validatePmlFileTool, searchPmlKbTool];
