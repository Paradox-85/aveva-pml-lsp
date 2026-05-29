import { describe, expect, it } from 'vitest';
import { Parser, parserModeFromUri } from '../../src/core/parser/parser.js';

function parse(code: string, uri = 'memory:///test.pmlmac') {
  return new Parser().parse(code, { mode: parserModeFromUri(uri) });
}

describe('PML parser foundation', () => {
  it('parses a simple function definition into an AST program', () => {
    const result = parse(`DEFINE FUNCTION !!Echo(!value IS STRING) IS STRING\n  RETURN !value\nENDFUNCTION`, 'memory:///echo.pmlfnc');
    expect(result.ast.type).toBe('Program');
    expect(result.ast.body.length).toBeGreaterThan(0);
    expect(result.errors.length).toBe(0);
  });

  it('parses PML DO/ENDDO loop constructs', () => {
    const result = parse(`DO !index FROM 1 TO 3\n  !value = !index\nENDDO`);
    expect(result.ast.body.some((statement) => statement.type === 'DoStatement')).toBe(true);
  });

  it('selects parser mode from PML file extensions', () => {
    expect(parserModeFromUri('file:///form.pmlfrm')).toBe('form');
    expect(parserModeFromUri('file:///object.pmlobj')).toBe('object');
    expect(parserModeFromUri('file:///function.pmlfnc')).toBe('function');
    expect(parserModeFromUri('file:///command.pmlcmd')).toBe('command');
    expect(parserModeFromUri('file:///macro.pmlmac')).toBe('default');
  });
});
