/**
 * KB Patch for mac_38 — JDE_vendorPackage-reports.pmlmac
 * Generated: 2026-06-03
 * Source: docs/codebase/macros/JDE_vendorPackage-reports.pmlmac
 *
 * Adds two new KBEntry objects for real gaps found during reviewer analysis.
 */

import { KBEntry } from '../../../../src/knowledge/schemas/kb-entry';

export const mac_38_kb_patches: KBEntry[] = [
  {
    id: 'macro_finish_error_handler_placement',
    category: 'errorhandling',
    subcategory: 'macro_lifecycle',
    title: 'FINISH statement placement in error handlers',
    principle:
      'FINISH should be placed inside the error handler block to stop macro execution after error logging.',
    rule:
      'Place FINISH inside handle/.../endhandle to halt on error. Do not rely on commented-out FINISH or place it after endhandle as dead code.',
    syntax:
      'LABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  -- error recovery actions\n  FINISH\nendhandle',
    exampleCanonical: `-- Correct: FINISH inside error handler
LABEL /Error
handle any
  SAVEWORK
  !!logger.writeError('macro failed')
  FINISH
endhandle`,
    exampleAntipattern: `handle any
  SAVEWORK
  --FINISH
endhandle
FINISH`,
    pitfalls: [
      'FINISH inside handle block stops macro; FINISH after endhandle is unreachable if the handle block completes normally.',
      'Commented-out FINISH (--FINISH) is silently ignored and does not stop macro on error.',
    ],
    relatedIds: ['macro_handle_any_pattern', 'macro_savework_unclaim'],
    sourcedoc: 'AVEVA PML Customization Guide - Macro Error Handling',
    sourcecodebase: 'JDE_vendorPackage-reports.pmlmac',
  },
  {
    id: 'macro_string_delimiter_error_handler',
    category: 'datatypes',
    subcategory: 'string',
    title: 'String delimiters required in error handler function calls',
    principle:
      'All string arguments to PML functions must use pipe delimiters (|text|) even inside error handlers.',
    rule:
      'Always wrap string literals in pipe delimiters in function call arguments, including in error handler blocks.',
    syntax: "!!functionName(|/path/to/file.xlsx|, false)",
    exampleCanonical: `-- Correct: pipe-delimited string argument
!!ramCommonLogger.writeErrorDataToExcel(|/project/output/log.xlsx|, false)`,
    exampleAntipattern: `!!ramCommonLogger.writeErrorDataToExcel(/project/output/log.xlsx, false)`,
    pitfalls: [
      'Paths without string delimiters may parse as variable substitutions or cause syntax errors.',
      'Error handlers are often written hastily and may omit delimiters that are present in main code.',
    ],
    relatedIds: ['string_pipe_delimiters', 'array_2d_attribute_table'],
    sourcedoc: 'AVEVA PML Expressions - String Handling',
    sourcecodebase: 'JDE_vendorPackage-reports.pmlmac',
  },
];
