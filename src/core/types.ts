export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4,
}

export interface PmlDiagnostic {
  range: Range;
  message: string;
  severity: DiagnosticSeverity;
  source?: string;
  code?: string;
}

export type Diagnostic = PmlDiagnostic;

export interface PmlTextDocument {
  uri: string;
  getText(): string;
  positionAt(offset: number): Position;
  offsetAt(position: Position): number;
}

export type TextDocument = PmlTextDocument;

export class StringTextDocument implements PmlTextDocument {
  constructor(public uri: string, private text: string) {}
  getText(): string { return this.text; }
  positionAt(offset: number): Position {
    offset = Math.max(0, Math.min(offset, this.text.length));
    const before = this.text.slice(0, offset);
    const lines = before.split(/\r?\n/);
    return { line: lines.length - 1, character: lines[lines.length - 1]?.length ?? 0 };
  }
  offsetAt(position: Position): number {
    const lines = this.text.split(/\r?\n/);
    let offset = 0;
    for (let i = 0; i < Math.min(position.line, lines.length); i++) {
      offset += lines[i].length + 1;
    }
    return Math.max(0, Math.min(offset + position.character, this.text.length));
  }
}
