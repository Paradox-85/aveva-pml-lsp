import { describe, expect, it } from 'vitest';
import { validateKb } from '../../src/knowledge/validation/validate-kb.js';
import { allPmlKbEntries, entriesByCategory, getPmlKbEntry } from '../../src/knowledge/pml-kb/index.js';
import { ALLOWED_CATEGORIES } from '../../src/knowledge/schemas/kb-entry.js';

describe('KB Validation', () => {
  it('has at least 87 entries', () => {
    expect(allPmlKbEntries.length).toBeGreaterThanOrEqual(87);
  });

  it('has all 18 categories non-empty', () => {
    for (const cat of ALLOWED_CATEGORIES) {
      const entries = entriesByCategory.get(cat);
      expect(entries, `Category "${cat}" should not be empty`).toBeDefined();
      expect(entries!.length, `Category "${cat}" should have entries`).toBeGreaterThan(0);
    }
  });

  it('arrays category has at least 8 entries', () => {
    const arr = entriesByCategory.get('arrays');
    expect(arr).toBeDefined();
    expect(arr!.length).toBeGreaterThanOrEqual(8);
  });

  it('syscom category has at least 1 entry', () => {
    const sys = entriesByCategory.get('syscom');
    expect(sys).toBeDefined();
    expect(sys!.length).toBeGreaterThanOrEqual(1);
  });

  it('high-priority entry p2_pmlfilebrowser exists', () => {
    const entry = getPmlKbEntry('p2_pmlfilebrowser');
    expect(entry).toBeDefined();
    expect(entry!.category).toBe('dotnetinterop');
  });

  it('high-priority entry p2_displayprogress exists', () => {
    const entry = getPmlKbEntry('p2_displayprogress');
    expect(entry).toBeDefined();
  });

  it('high-priority entry p2_syscom exists', () => {
    const entry = getPmlKbEntry('p2_syscom');
    expect(entry).toBeDefined();
    expect(entry!.category).toBe('syscom');
  });

  it('high-priority entry p2_array_evaluate_block exists', () => {
    const entry = getPmlKbEntry('p2_array_evaluate_block');
    expect(entry).toBeDefined();
    expect(entry!.category).toBe('arrays');
  });

  it('high-priority entry p2_form_7callbacks exists', () => {
    const entry = getPmlKbEntry('p2_form_7callbacks');
    expect(entry).toBeDefined();
    expect(entry!.category).toBe('forms');
  });

  it('passes KB validation with no errors', () => {
    const report = validateKb();
    const errors = report.issues.filter(i => i.level === 'error');
    expect(errors, `Validation errors: ${errors.map(e => `${e.entryId}: ${e.message}`).join('; ')}`).toHaveLength(0);
  });

  it('validation report contains category summary', () => {
    const report = validateKb();
    expect(Object.keys(report.categorySummary).length).toBe(18);
    expect(report.totalEntries).toBe(allPmlKbEntries.length);
  });
});
