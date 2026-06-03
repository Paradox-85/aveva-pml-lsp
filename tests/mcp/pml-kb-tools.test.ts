import { describe, expect, it } from 'vitest';
import { pmlKbTools } from '../../src/mcp/pml-kb-tools.js';
import { searchKb } from '../../src/knowledge/search/fuzzy-search.js';
import { matchContext } from '../../src/knowledge/search/context-match.js';

const toolNames = pmlKbTools.map(t => t.name);
const tool = (name: string) => pmlKbTools.find(t => t.name === name)!;

const requiredP2Ids = [
  'p2_pmlfilebrowser','p2_displayprogress','p2_syscom','p2_pmltags','p2_measure_unit','p2_array_evaluate_block','p2_array_reindex','p2_evaluate_pml1','p2_collect_pml1','p2_datetime_api','p2_dateformat','p2_form_7callbacks','p2_netgrid_full','p2_attribute_dynamic','p2_widget_prefix','p2_backref','p2_na_replacement','p2_null_scope',
];

describe('PML KB MCP Tools', () => {
  it('exports 6 tools', () => {
    expect(toolNames).toHaveLength(6);
    expect(toolNames).toContain('pml_kb_by_category');
    expect(toolNames).toContain('pml_kb_search');
    expect(toolNames).toContain('pml_kb_get');
    expect(toolNames).toContain('pml_kb_related');
    expect(toolNames).toContain('pml_kb_antipatterns');
    expect(toolNames).toContain('pml_diagnose');
  });

  it.each([
    ['HANDLE', 'eh_handle_endhandle'],
    ['DATETIME', 'p2_datetime_api'],
    ['DATEFORMAT', 'p2_dateformat'],
    ['PMLFILEBROWSER', 'p2_pmlfilebrowser'],
    ['PMLTAGS', 'p2_pmltags'],
    ['MEASURE UNIT', 'p2_measure_unit'],
    ['BACKREF', 'p2_backref'],
    ['NETGRIDCONTROL', 'p2_netgrid_full'],
    ['999999999 NA', 'p2_na_replacement'],
    ['SYSCOM', 'p2_syscom'],
    ['COLLECT', 'p2_collect_pml1'],
    ['EVALUATE', 'p2_evaluate_pml1'],
  ])('pml_kb_search finds %s -> %s', async (query, expectedId) => {
    const result = await tool('pml_kb_search').execute({ query, limit: 8 } as never);
    const parsed = JSON.parse(result as string);
    expect(parsed.map((r: any) => r.id)).toContain(expectedId);
  });

  it.each(requiredP2Ids)('pml_kb_get returns required p2 entry %s', async (id) => {
    const result = await tool('pml_kb_get').execute({ id } as never);
    const parsed = JSON.parse(result as string);
    expect(parsed.id).toBe(id);
    expect(parsed.exampleCanonical).toContain('-- CB ');
    expect(parsed.exampleAntipattern).not.toMatch(/NOT_FOUND|переносить JavaScript/i);
  });

  it('pml_kb_get returns original Claude entry by ID', async () => {
    const result = await tool('pml_kb_get').execute({ id: 'eh_handle_endhandle' } as never);
    const parsed = JSON.parse(result as string);
    expect(parsed.id).toBe('eh_handle_endhandle');
    expect(parsed.category).toBe('errorhandling');
  });

  it('pml_kb_get returns error for unknown ID', async () => {
    const result = await tool('pml_kb_get').execute({ id: 'nonexistent_id' } as never);
    const parsed = JSON.parse(result as string);
    expect(parsed.error).toContain('not found');
  });

  it('pml_kb_by_category returns arrays entries', async () => {
    const result = await tool('pml_kb_by_category').execute({ category: 'arrays' } as never);
    const parsed = JSON.parse(result as string);
    expect(parsed.length).toBeGreaterThanOrEqual(8);
  });

  it('pml_kb_by_category returns syscom entries', async () => {
    const result = await tool('pml_kb_by_category').execute({ category: 'syscom' } as never);
    const parsed = JSON.parse(result as string);
    expect(parsed.length).toBeGreaterThanOrEqual(1);
  });

  it('pml_kb_related returns related entries', async () => {
    const result = await tool('pml_kb_related').execute({ id: 'eh_handle_endhandle', limit: 5 } as never);
    const parsed = JSON.parse(result as string);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it('pml_diagnose handles master prompt errorText parameter', async () => {
    const result = await tool('pml_diagnose').execute({ errorText: 'HANDLE 41,8 error occurred' } as never);
    const parsed = JSON.parse(result as string);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0].suggestions.map((s: any) => s.id)).toContain('eh_handle_endhandle');
  });

  it('pml_diagnose keeps backward-compatible error_text parameter', async () => {
    const result = await tool('pml_diagnose').execute({ error_text: 'SYSCOM copy failed' } as never);
    const parsed = JSON.parse(result as string);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0].suggestions.map((s: any) => s.id)).toContain('p2_syscom');
  });

  it('pml_kb_antipatterns returns entries with anti-patterns', async () => {
    const result = await tool('pml_kb_antipatterns').execute({} as never);
    const parsed = JSON.parse(result as string);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it.each([
    ['SYSCOM |copy /y a b|', 'p2_syscom'],
    ['!dt = OBJECT DATETIME()', 'p2_datetime_api'],
    ['!fb = object PMLFILEBROWSER(\'OPEN\')', 'p2_pmlfilebrowser'],
    ['var !x COLLECT ALL FROM CE', 'p2_collect_pml1'],
    ['var !b BACKREF(attname HREF) of $!el', 'p2_backref'],
    ['NETGRIDCONTROL selectedCell', 'p2_netgrid_full'],
  ])('context matcher maps %s -> %s', (code, expectedId) => {
    expect(matchContext(code, 8).map(r => r.entry.id)).toContain(expectedId);
  });

  it('direct search helper keeps required smoke coverage', () => {
    expect(searchKb('PMLTAGS', 8).map(r => r.entry.id)).toContain('p2_pmltags');
  });
});
