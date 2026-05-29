import { describe, expect, it } from 'vitest';
import { resources } from '../../src/mcp/resources.js';

describe('MCP resources', () => {
  it('loads syntax docs', async () => {
    const resource = resources.find((item) => item.uri === 'pml://docs/syntax');
    expect(resource).toBeTruthy();
    const loaded = await resource!.load();
    expect(loaded.text.length).toBeGreaterThan(0);
  });

  it('loads loop examples', async () => {
    const resource = resources.find((item) => item.uri === 'pml://examples/loop_objects');
    expect(resource).toBeTruthy();
    const loaded = await resource!.load();
    expect(loaded.text).toContain('DO !index');
  });
});
