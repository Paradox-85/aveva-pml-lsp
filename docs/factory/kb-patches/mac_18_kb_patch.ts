/**
 * KB Patch for mac_18 (JDE_commPackage-reports.pmlmac)
 * Generated: 2026-06-03
 * Action: patch_kb
 * Source: docs/codebase/macros/JDE_commPackage-reports.pmlmac
 */

import { KBEntry, KBCategory } from '../../src/knowledge/schemas/kb-entry';

export const kbPatchMac18: KBEntry[] = [
  {
    id: 'macro_onerror_golabel_error_trap',
    category: 'errorhandling',
    subcategory: 'macro-level error trap',
    title: 'ONERROR / GOLABEL / LABEL error trap in PML macros',
    principle: 'PML1 macros use ONERROR to redirect control to a named LABEL; the LABEL is paired with a handle block for cleanup.',
    rule: 'Place ONERROR GOLABEL /LabelName at the top of the macro. Define LABEL /LabelName near FINISH. Inside the label, use handle any to capture the error context and perform cleanup (SAVEWORK, UNCLAIM ALL, logging).',
    syntax: 'ONERROR GOLABEL /LabelName\n...\nLABEL /LabelName\nhandle any\n  -- cleanup\nendhandle\nFINISH',
    exampleCanonical: `-- CB mac_18_benchmark.pmlmac
ONERROR GOLABEL /Error
import 'GridControl'
handle any
endhandle
...
do !item values !list
  -- work
enddo
LABEL /Error
handle any
  SAVEWORK
  UNCLAIM ALL
  !!logger.writeError(...)
endhandle
FINISH`,
    exampleAntipattern: `-- ❌ Missing ONERROR — errors crash the macro
import 'GridControl'
do !item values !list
  -- no error handling
enddo
FINISH`,
    pitfalls: [
      'ONERROR must be placed before any import or using statements.',
      'LABEL name must match exactly (case-insensitive but spelling must match).',
      'FINISH must come after the error handler label block.',
    ],
    relatedIds: ['macro_finish_keyword', 'handle_block_syntax'],
    sourcedoc: 'AVEVA PML Customization — Macros',
    sourcecodebase: 'JDE_commPackage-reports.pmlmac',
  },
  {
    id: 'macro_savework_unclaim_all',
    category: 'syscom',
    subcategory: 'PDMS commands',
    title: 'SAVEWORK and UNCLAIM ALL PDMS commands in PML macros',
    principle: 'SAVEWORK saves current database state; UNCLAIM ALL releases all element claims. Used in error recovery to prevent database lock.',
    rule: 'Call SAVEWORK before UNCLAIM ALL in error handlers. UNCLAIM ALL should be called to release any element claims that may have been acquired during processing.',
    syntax: 'SAVEWORK\nUNCLAIM ALL',
    exampleCanonical: `-- CB mac_18_benchmark.pmlmac
LABEL /Error
handle any
  SAVEWORK
  UNCLAIM ALL
  !!ramCommonLogger.writeErrorDataToExcel(...)
endhandle`,
    exampleAntipattern: `-- ❌ UNCLAIM ALL without SAVEWORK — data loss risk
LABEL /Error
handle any
  UNCLAIM ALL
  -- SAVEWORK missing: unsaved changes lost
endhandle`,
    pitfalls: [
      'SAVEWORK is slow on large databases — consider conditional save.',
      'UNCLAIM ALL releases ALL claims; use UNCLAIM !ref for selective release.',
    ],
    relatedIds: ['macro_onerror_golabel_error_trap'],
    sourcedoc: 'AVEVA PDMS Command Reference',
    sourcecodebase: 'JDE_commPackage-reports.pmlmac',
  },
  {
    id: 'pml1_inset_matchwild_operators',
    category: 'controlflow',
    subcategory: 'PML1 operators',
    title: 'PML1 inset and matchwild operators in query expressions',
    principle: 'PML1 provides set-membership (inset) and wildcard matching (matchwild) operators for query expressions in COLLECT ALL and other query commands.',
    rule: 'Use inset for membership testing: VALUE inset (|A|, |B|). Use matchwild for wildcard string matching: matchwild(string, pattern).',
    syntax: '!result = !value inset (|A|, |B|)\n!result = matchwild(!string, |*pattern*|)',
    exampleCanonical: `-- CB mac_18_benchmark.pmlmac
!tagFilter = 'NOT(:TagStatus inset (|VOID|, |Future|)) and ISNAMED'
!tagFilter = !tagFilter & 'matchwild(namn of :TagRefToMCPackage, |*$!<commPckg.namn>*|)'`,
    exampleAntipattern: `-- ❌ Using 'in' instead of 'inset'
!result = !value in (|A|, |B|)  -- not valid PML`,
    pitfalls: [
      'inset expects a parenthesised list of values, not an array.',
      'matchwild pattern uses * for any characters and ? for single character.',
      'matchwild is a function call, not an operator — use matchwild(string, pattern).',
    ],
    relatedIds: ['pml_operators_precedence'],
    sourcedoc: 'AVEVA PML Customization — Expressions',
    sourcecodebase: 'JDE_commPackage-reports.pmlmac',
  },
  {
    id: 'array_2d_initialization',
    category: 'arrays',
    subcategory: 'multi-dimensional',
    title: '2D array initialization in PML',
    principle: 'PML arrays can be indexed with multiple subscripts: array[i][j] for 2D data. Initialize by assigning individual cells.',
    rule: 'Create the array with ARRAY(), then assign cells using !arr[i][j] = value. There is no native 2D array literal — each cell must be assigned individually.',
    syntax: '!arr = object ARRAY()\n!arr[1][1] = \'header1\'\n!arr[1][2] = \'header2\'\n!arr[2][1] = \'value1\'\n!arr[2][2] = \'value2\'',
    exampleCanonical: `-- CB mac_18_benchmark.pmlmac
!commonAttributes = object ARRAY()
!commonAttributes[1][1] = ':RAMTagOwner'
!commonAttributes[1][2] = 'Tag Owner'
!commonAttributes[2][1] = ':TagStatus'
!commonAttributes[2][2] = 'Tag Status'`,
    exampleAntipattern: `-- ❌ JavaScript-style 2D literal (not valid PML)
!arr = [['a','b'], ['c','d']]`,
    pitfalls: [
      'PML ARRAY does not support multi-dimensional literals — each cell must be assigned.',
      'Subscript indices start at 1, not 0.',
      'Appending to a 2D array requires careful management of the outer array size.',
    ],
    relatedIds: ['array_object_methods'],
    sourcedoc: 'AVEVA PML Customization — Arrays',
    sourcecodebase: 'JDE_commPackage-reports.pmlmac',
  },
  {
    id: 'collect_all_variable_substitution',
    category: 'controlflow',
    subcategory: 'query',
    title: 'COLLECT ALL with $! variable substitution in filter expressions',
    principle: 'PML allows $! variable substitution inside COLLECT ALL filter strings, enabling dynamic queries inside loops.',
    rule: 'Use $!varName inside the COLLECT ALL with () expression to substitute the current loop variable\'s value into the filter string.',
    syntax: 'do !item values !list\n  !filter = \'attribute eq |$!<item.attr>*|\'\n  var !results collect all (TYPE) with ($!filter)\n  -- process results\nenddo',
    exampleCanonical: `-- CB mac_18_benchmark.pmlmac
do !commPckgName values !commPckgList
  !commPckg = !commPckgName.dbref()
  !tagFilter = 'NOT(:TagStatus inset (|VOID|, |Future|)) and ISNAMED and matchwild(namn of :TagRefToMCPackage, |*$!<commPckg.namn>*|)'
  var !tagList collect all (ENGITE) with ($!tagFilter)
enddo`,
    exampleAntipattern: `-- ❌ Direct variable reference in COLLECT ALL (not supported)
var !results collect all (TYPE) with (attribute eq !item)
-- Use $! substitution instead`,
    pitfalls: [
      '$! substitution only works inside pipe-delimited strings within COLLECT ALL expressions.',
      'Variable must be a simple reference — method chains like $!<item.method()> are not supported.',
      'Ensure the loop variable is resolved before the COLLECT ALL executes.',
    ],
    relatedIds: ['macro_onerror_golabel_error_trap', 'array_2d_initialization'],
    sourcedoc: 'AVEVA PML Customization — Macros',
    sourcecodebase: 'JDE_commPackage-reports.pmlmac',
  },
  {
    id: 'macro_finish_keyword',
    category: 'macros',
    subcategory: 'termination',
    title: 'FINISH keyword in PML macros',
    principle: 'FINISH terminates macro execution cleanly. It should be placed at the end of the macro, after any error handler LABEL.',
    rule: 'Place FINISH as the last statement in the macro, after the error handler LABEL block. FINISH ensures clean exit and resource release.',
    syntax: 'LABEL /Error\nhandle any\n  -- error cleanup\nendhandle\nFINISH',
    exampleCanonical: `-- CB mac_18_benchmark.pmlmac
LABEL /Error
handle any
  SAVEWORK
  UNCLAIM ALL
  !!ramCommonLogger.writeErrorDataToExcel(...)
endhandle
FINISH`,
    exampleAntipattern: `-- ❌ Code after FINISH (never executes)
FINISH
-- This line is unreachable`,
    pitfalls: [
      'FINISH after LABEL means the label block is only reachable via ONERROR GOLABEL, not via normal flow.',
      'If FINISH is placed before the error handler, the error handler is dead code.',
    ],
    relatedIds: ['macro_onerror_golabel_error_trap'],
    sourcedoc: 'AVEVA PML Customization — Macros',
    sourcecodebase: 'JDE_commPackage-reports.pmlmac',
  },
];
