import { describe, expect, it } from 'vitest';
import { lintPmlCode } from '../../src/core/diagnostics/engine.js';

const messages = (code: string) => lintPmlCode(code).diagnostics.map((d) => d.message).join('\n');

describe('lintPmlCode', () => {
  it('detects hallucinated C-style for loops', () => {
    expect(messages('for(!i=0; !i<10; !i++) { }')).toContain('for(...)');
  });

  it('detects array index zero', () => {
    expect(messages('!value = !items[0]')).toContain('Array indices in PML start at 1');
  });

  it('reports parser errors for unbalanced if/endif blocks', () => {
    const result = lintPmlCode('IF (!ok) THEN\n  !x = 1');
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });
});
