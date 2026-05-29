import { ArrayIndexChecker } from '../analysis/arrayIndexChecker.js';
import { FormReferenceValidator } from '../analysis/formReferenceValidator.js';
import { Parser, parserModeFromUri, ParserOptions } from '../parser/parser.js';
import { Diagnostic, DiagnosticSeverity, Range, StringTextDocument } from '../types.js';
import { detectTypos } from './typoDetector.js';

export interface LintOptions extends ParserOptions {
  uri?: string;
}

export interface LintResult {
  diagnostics: Diagnostic[];
  astNodeCount: number;
  parseErrorCount: number;
}

function parseErrorRange(error: { token?: { line: number; column: number; length?: number } }): Range {
  const line = Math.max(0, (error.token?.line ?? 1) - 1);
  const character = Math.max(0, (error.token?.column ?? 1) - 1);
  const length = Math.max(1, error.token?.length ?? 1);
  return {
    start: { line, character },
    end: { line, character: character + length },
  };
}

function countNodes(value: unknown): number {
  if (!value || typeof value !== 'object') return 0;
  let count = 0;
  const obj = value as Record<string, unknown>;
  if (typeof obj.type === 'string' && 'range' in obj) count++;
  for (const child of Object.values(obj)) {
    if (Array.isArray(child)) {
      for (const item of child) count += countNodes(item);
    } else if (child && typeof child === 'object') {
      count += countNodes(child);
    }
  }
  return count;
}

function hallucinationDiagnostics(code: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = code.split(/\r?\n/);
  lines.forEach((line, index) => {
    const match = line.match(/\bfor\s*\(/i);
    if (match?.index !== undefined) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line: index, character: match.index },
          end: { line: index, character: match.index + match[0].length },
        },
        message: 'Likely hallucinated non-PML loop syntax: use PML DO/ENDDO constructs instead of for(...).',
        source: 'pml-hallucination-guard',
        code: 'for-parentheses-not-pml',
      });
    }
  });
  return diagnostics;
}

export function lintPmlCode(code: string, options: LintOptions = {}): LintResult {
  const parser = new Parser();
  const uri = options.uri ?? 'memory:///document.pmlmac';
  const mode = options.mode ?? parserModeFromUri(uri);
  const result = parser.parse(code, { mode });
  const document = new StringTextDocument(uri, code);

  const diagnostics: Diagnostic[] = result.errors.map((error) => ({
    severity: DiagnosticSeverity.Error,
    range: parseErrorRange(error),
    message: error.message,
    source: 'pml-parser',
    code: 'parse-error',
  }));

  diagnostics.push(...detectTypos(document, result.errors));
  diagnostics.push(...new ArrayIndexChecker().check(result.ast));
  diagnostics.push(...new FormReferenceValidator().check(result.ast));
  diagnostics.push(...hallucinationDiagnostics(code));

  return {
    diagnostics,
    astNodeCount: countNodes(result.ast),
    parseErrorCount: result.errors.length,
  };
}
