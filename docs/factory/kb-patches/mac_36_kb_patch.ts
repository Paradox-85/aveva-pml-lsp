/**
 * KB Patch for mac_36
 * Generated: 2026-06-03
 * Source: docs/codebase/macros/JDE_tagProperties_export_with_RDL.pmlmac
 * Action: patch_kb
 *
 * New KB entries identified in gap analysis D7.
 */

import type { KBEntry, KBCategory } from '../../src/knowledge/schemas/kb-entry';

export const mac_36_kb_patches: KBEntry[] = [
  {
    id: 'pml1_coll_all_query_syntax',
    category: 'controlflow' as KBCategory,
    subcategory: 'pml1_queries',
    title: 'COLL ALL PML1 declarative collection query',
    principle: 'COLL ALL is the PML1 declarative syntax for querying all elements of a given type from the database, with optional WITH clause for filtering.',
    rule: 'Use COLL ALL (TYPE) WITH (conditions) to build a collection variable. Compound conditions use eq, neq, inset, NOT, EMPTY, ISNAMED, etc.',
    syntax: 'var !varName COLL ALL (ElementType) WITH (:Attr1 eq |value1| and :Attr2 neq |value2|)',
    exampleCanonical: `-- mac_36
var !tags COLL ALL (ENGITEM) WITH (:TagStatus eq |ACTIVE| and ISNAMED and NOT(EMPTY(:RAMTAGOWNER)) and :RAMTAGOWNER eq |LEIR| and (LOWCASE(:TagClassName) inset(|gas detector|, |heat detector|, |junction box|, |manual call point|, |signal cable|, |smoke detector|)))`,
    exampleAntipattern: "var !tags = !!collectallfor('engitem', '|ACTIVE|', !!ce)  -- PML2 procedural form, different semantics",
    pitfalls: [
      'COLL ALL returns STRING array of element references, not DBREF objects',
      'Each element in the result is a STRING that must be converted via .dbref()',
      'The WITH clause uses PML1 attribute syntax (:AttrName)',
      'Compound WITH conditions require parentheses around grouped expressions'
    ],
    relatedIds: ['pml1_eval_for_all_query', 'do_values_loop_pattern'],
    sourcedoc: 'AVEVA PML Customization — Query Arrays',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'pml1_eval_for_all_query',
    category: 'controlflow' as KBCategory,
    subcategory: 'pml1_queries',
    title: 'EVAL ... FOR ALL PML1 query expression',
    principle: 'EVAL ... FOR ALL is a PML1 declarative syntax for building an array by evaluating an expression over all elements matching a query.',
    rule: 'Use EVAL (expression) FOR ALL (type) WITH (conditions) to derive an array from a query result.',
    syntax: 'var !varName EVAL (expression) FOR ALL (ElementType) WITH (conditions)',
    exampleCanonical: `-- mac_36
var !classes EVAL (LOWCASE(:RDLName of :MappingRefToClass)) FOR ALL (:ShellClassAttribute) WITH (:RDLSource eq |AKSO_Tag Properties Templates_Rev3|)`,
    exampleAntipattern: '// Manual loop to build array from query results\n!classes = ARRAY()\ndo !i values !mappings\n    !classes.append(!mapping.RDLName)\nenddo',
    pitfalls: [
      'EVAL expression is evaluated for each matching element',
      'Returns ARRAY of evaluated expression results',
      'The OF syntax inside EVAL accesses attributes of the loop element'
    ],
    relatedIds: ['pml1_coll_all_query_syntax', 'do_values_loop_pattern'],
    sourcedoc: 'AVEVA PML Customization — Query Arrays',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'do_values_loop_pattern',
    category: 'controlflow' as KBCategory,
    subcategory: 'loops',
    title: 'do ... values loop for array iteration',
    principle: 'The "do ... values" construct iterates over each element value in an array, assigning the value to the loop variable.',
    rule: 'Use "do !var values !array" to iterate over array values. This is the idiomatic PML loop for iterating array elements by value (not index).',
    syntax: 'do !item values !array\n  !itemRef = !item.dbref()\nenddo',
    exampleCanonical: `-- mac_36
do !tagString values !tags
    !tagRef = !tagString.dbref()
    !tagIdx = !tags.findFirst(!tagString)
    !!displayProgress(!tagIdx, !tags.size())
    -- process !tagRef
enddo`,
    exampleAntipattern: 'do !i from 1 to !tags.size()\n    !tagString = !tags[!i]  -- index-based, less idiomatic\nenddo',
    pitfalls: [
      'Loop variable is a STRING copy, not a reference',
      'Cannot modify the original array from within the loop',
      'Nested with do ... from ... to requires careful index management',
      'findFirst() returns REAL index; use .set() to check if found'
    ],
    relatedIds: ['pml1_coll_all_query_syntax', 'nested_do_loops_with_break'],
    sourcedoc: 'AVEVA PML Customization — Control Logic',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'string_inset_function',
    category: 'datatypes' as KBCategory,
    subcategory: 'string',
    title: 'inset() string containment function',
    principle: 'inset() checks whether a string value is contained in a list of string values.',
    rule: 'Use inset(string, |val1|, |val2|, ...) to test if the string matches any of the listed values. Returns TRUE or FALSE.',
    syntax: 'inset(:AttributeName, |value1|, |value2|, |value3|)',
    exampleCanonical: `-- mac_36
LOWCASE(:TagClassName) inset(|gas detector|, |heat detector|, |junction box|, |manual call point|, |signal cable|, |smoke detector|)`,
    exampleAntipattern: ':TagClassName eq |gas detector| or :TagClassName eq |heat detector| or :TagClassName eq |junction box|  -- verbose equivalent',
    pitfalls: [
      'inset() is case-sensitive; use LOWCASE() or UPCASE() for case-insensitive matching',
      'Only available in PML1 WITH clause expressions',
      'All values in the list must be strings'
    ],
    relatedIds: ['pml1_coll_all_query_syntax', 'string_ift_function'],
    sourcedoc: 'AVEVA PML Customization — PML Expressions',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'string_ift_function',
    category: 'datatypes' as KBCategory,
    subcategory: 'string',
    title: 'IFT() conditional function',
    principle: 'IFT() is a PML inline conditional function: IFT(condition, trueValue, falseValue).',
    rule: 'Use IFT(test, valueIfTrue, valueIfFalse) for inline conditional logic in expressions.',
    syntax: 'IFT(condition, trueValue, falseValue)',
    exampleCanonical: `-- mac_36
!expression = IFT(!mappingRowRef.:RDLDabaconExpression.unset() or !mappingRowRef.:RDLDabaconExpression.empty(), !attributeEntry.:RDLDabaconExpression, !mappingRowRef.:RDLDabaconExpression)`,
    exampleAntipattern: 'if (!condition) then\n    !result = |true_val|\nelse\n    !result = |false_val|\nendif  -- longer form',
    pitfalls: [
      'All three arguments are evaluated before the function call — no short-circuit evaluation',
      'Return type is ANY; may need explicit type handling',
      'Useful in WITH clause and expression assignments'
    ],
    relatedIds: ['string_inset_function', 'block_evaluate_expression'],
    sourcedoc: 'AVEVA PML Customization — PML Expressions',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'block_evaluate_expression',
    category: 'objects' as KBCategory,
    subcategory: 'block',
    title: 'BLOCK object with evaluate() for dynamic PML expressions',
    principle: 'The BLOCK object wraps a PML expression string and can be evaluated against a DBREF to produce a runtime value.',
    rule: 'Use "object BLOCK(expressionString)" to create a block, then "dbref.evaluate(block)" to compute the result.',
    syntax: '!block = object BLOCK(!expressionString)\n!result = !dbref.evaluate(!block)',
    exampleCanonical: `-- mac_36
!block = object BLOCK(!expression)
!value = !tagRef.evaluate(!block)
handle any
    !value = 'Error: $!!error.text'
endhandle`,
    exampleAntipattern: '!value = !tagRef.:AttributeName  -- static attribute access only',
    pitfalls: [
      'Expression string must be valid PML syntax',
      'Handle exceptions with handle ANY around evaluate() call',
      'Returns ANY type; may be STRING, REAL, or ERROR',
      'The expression is evaluated in the context of the DBREF'
    ],
    relatedIds: ['string_ift_function', 'nested_handle_any_in_loop'],
    sourcedoc: 'AVEVA PML Customization — Object Methods',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'netgridcontrol_methods',
    category: 'objects' as KBCategory,
    subcategory: 'netgridcontrol',
    title: 'NETGRIDCONTROL object methods: clearGrid, BindToDataSource, saveGridToExcel',
    principle: 'NETGRIDCONTROL is a .NET add-in object for displaying tabular data in PML. Key methods include clearGrid(), BindToDataSource(), and saveGridToExcel().',
    rule: 'Create NETGRIDCONTROL, clearGrid(), bind NETDATASOURCE, then optionally saveGridToExcel() for export.',
    syntax: '!grid = object NETGRIDCONTROL()\n!grid.clearGrid()\n!source = object NETDATASOURCE(label, headers, data)\n!grid.BindToDataSource(!source)\n!grid.saveGridToExcel(path)',
    exampleCanonical: `-- mac_36
!dataTable = object NETGRIDCONTROL()
!dataTable.clearGrid()
!source = object NETDATASOURCE('data', !headerList, !dataList)
!dataTable.BindToDataSource(!source)
!dataTable.saveGridToExcel(|$!publishPath|)`,
    exampleAntipattern: '!grid = object array()  -- ARRAY is not NETGRIDCONTROL',
    pitfalls: [
      "Requires 'import GridControl' and 'using namespace |Aveva.Core.Presentation|'",
      "NETDATASOURCE label parameter is a string identifier",
      'saveGridToExcel() path must be a valid file path string',
      'clearGrid() resets the grid before binding a new data source'
    ],
    relatedIds: ['netdatasource_constructor'],
    sourcedoc: 'AVEVA PML Add-ins — GridControl',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'netdatasource_constructor',
    category: 'objects' as KBCategory,
    subcategory: 'netdatasource',
    title: 'NETDATASOURCE constructor for grid data binding',
    principle: 'NETDATASOURCE creates a data source object for binding tabular data to NETGRIDCONTROL.',
    rule: 'Use object NETDATASOURCE(label, headerArray, dataArray) to create a data source where each element in dataArray corresponds to a row and each column corresponds to an element in headerArray.',
    syntax: "object NETDATASOURCE(label STRING, headerArray ARRAY, dataArray ARRAY)",
    exampleCanonical: `-- mac_36
!headerList = ARRAY()
!headerList.append(|Tag Name|)
!headerList.append(|Property Value|)
!dataList = ARRAY()
!dataList.append(!tagDataRow)  -- each row is an ARRAY
!source = object NETDATASOURCE('data', !headerList, !dataList)`,
    exampleAntipattern: '!source = object array()  -- ARRAY is not NETDATASOURCE',
    pitfalls: [
      'dataArray must be an ARRAY of ARRAYs (rows)',
      'Each inner array element count must match header count',
      'Label is an arbitrary string identifier for the data source'
    ],
    relatedIds: ['netgridcontrol_methods'],
    sourcedoc: 'AVEVA PML Add-ins — GridControl',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'datetime_object_constructor',
    category: 'datetime' as KBCategory,
    subcategory: 'datetime',
    title: 'OBJECT DATETIME() constructor and accessor methods',
    principle: 'OBJECT DATETIME() creates a datetime object. Access year, month, date, hour, minute via accessor methods.',
    rule: "Use !dt = OBJECT DATETIME() then !dt.year(), !dt.month(), etc. Convert to formatted string with .string('format').",
    syntax: "!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')",
    exampleCanonical: `-- mac_36
!dt = OBJECT DATETIME()
!year = !dt.year()
!month = !dt.month().string('I2')
!date = !dt.date().string('I2')
!hour = !dt.hour().string('I2')
!minute = !dt.minute().string('I2')`,
    exampleAntipattern: "!year = !!datetime.year()  -- incorrect global reference",
    pitfalls: [
      ".string('I2') pads with leading zero for single-digit months/days/hours",
      'Available as PML2 object; verify PML1 equivalent if needed',
      '.string() format codes follow standard PML string formatting'
    ],
    relatedIds: [],
    sourcedoc: 'AVEVA PML Customization — Object Methods',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'nested_handle_any_in_loop',
    category: 'errorhandling' as KBCategory,
    subcategory: 'nested_handle',
    title: 'Nested handle ANY inside do loops for per-iteration error recovery',
    principle: 'A handle ANY block can be nested inside a do loop to catch and recover from errors per-iteration without aborting the entire loop.',
    rule: 'Wrap per-iteration risky operations in handle ANY. Set fallback values in the handler. Use endhandle to close the block.',
    syntax: "do !i values !array\n    handle any\n        !result = |fallback value|\n    endhandle\nenddo",
    exampleCanonical: `-- mac_36
if (!expression.unset().not() or !expression.empty().not()) then
    !block = object BLOCK(!expression)
    !value = !tagRef.evaluate(!block)
    handle any
        !value = 'Error when calculating value as per expression [$!attributeEntry.:RDLDabaconExpression] for element [$!tagRef.name]. Error: $!!error.text'
    endhandle
else
    !value = |Value can't be calculated in AVEVA. Expression has not been defined|
endif`,
    exampleAntipattern: "handle any\n    do !i values !array\n        -- entire loop in one handler\n    enddo\nendhandle  -- catches too broadly",
    pitfalls: [
      'Nested handle ANY inside outer handle ANY requires careful scoping',
      '!!error.text is available only within the handler block',
      'Always set a fallback value in the handler to avoid UNSET propagation',
      'The handler can access variables from the enclosing scope'
    ],
    relatedIds: ['block_evaluate_expression', 'var_delete_loop_clear'],
    sourcedoc: 'AVEVA PML Customization — Control Logic',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'var_delete_loop_clear',
    category: 'datatypes' as KBCategory,
    subcategory: 'variables',
    title: 'var !name DELETE to explicitly clear variable in loop',
    principle: 'var !name DELETE explicitly unsets a variable before reuse in a loop iteration.',
    rule: 'Use "var !varName DELETE" at the start of a loop body to ensure the variable is UNSET before assignment.',
    syntax: 'do !i from 1 to !count\n    var !result DELETE\n    !result = compute(!i)\nenddo',
    exampleCanonical: `-- mac_36
do !x from !idx to !classes.size()
    var !value DELETE
    -- ... compute !value ...
enddo`,
    exampleAntipattern: '// No var !value DELETE — stale value from previous iteration may persist\n!value = compute(!x)  -- could be overwritten or not',
    pitfalls: [
      'DELETE unsets the variable; accessing it before assignment returns UNSET',
      'Useful when the assignment might be skipped (e.g., inside conditional blocks)',
      'Not needed if the variable is always assigned unconditionally in every iteration'
    ],
    relatedIds: ['nested_handle_any_in_loop'],
    sourcedoc: 'AVEVA PML Customization — VAR Command',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  },
  {
    id: 'displayprogress_two_arg',
    category: 'ui' as KBCategory,
    subcategory: 'progress',
    title: '!!displayProgress(index, total) two-argument progress indicator',
    principle: '!!displayProgress(currentIndex, totalItems) shows a progress bar in the AVEVA UI with position within a total count.',
    rule: 'Use !!displayProgress(current, total) where current is the 1-based index of the current item and total is the total number of items.',
    syntax: '!!displayProgress(currentIndex, totalItems)',
    exampleCanonical: `-- mac_36
!tagIdx = !tags.findFirst(!tagString)
!!displayProgress(!tagIdx, !tags.size())`,
    exampleAntipattern: '!!FMSYS.setProgress(50)  -- percentage-based, not index-based',
    pitfalls: [
      '!!displayProgress is different from !!FMSYS.setProgress()',
      'currentIndex should be 1-based to match PML array indexing',
      'total should be the actual array size, not a guess',
      'Progress resets automatically when macro completes'
    ],
    relatedIds: ['nested_do_loops_with_break'],
    sourcedoc: 'AVEVA PML Customization — FMSYS Object',
    sourcecodebase: 'JDE_tagProperties_export_with_RDL.pmlmac'
  }
];
