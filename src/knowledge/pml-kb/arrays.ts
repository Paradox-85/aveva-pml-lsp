import type { KBEntry } from '../schemas/kb-entry.js';

export const arraysEntries: KBEntry[] = [
  {
    "id": "arr_iteration",
    "category": "arrays",
    "subcategory": "iteration",
    "title": "ARRAY iteration patterns",
    "principle": "Итерируйте ARRAY через DO INDEX или DO VALUES в зависимости от того, нужен ли индекс.",
    "rule": "DO INDEX даёт стабильный индекс и подходит для progress; DO VALUES короче, но findFirst внутри цикла может быть O(n²) и неоднозначен при дублях.",
    "syntax": "do !i index !items\n  !item = !items[!i]\nenddo\n\ndo !item values !items\n  -- value-only loop\nenddo",
    "exampleCanonical": "-- CB JDE_pipeData_export.pmlmac\ndo !lineStr values !lines\n  !rowIdx = !lines.findFirst(!lineStr)\n  !!displayProgress(!rowIdx, !lines.size())\nenddo",
    "exampleAntipattern": "-- NOT: do !item values !items; !idx = !items.findFirst(!item) for duplicate-sensitive logic\n-- Плохо: findFirst вернёт первый дубль, а не текущую позицию",
    "pitfalls": [
      "PML arrays are 1-based",
      "Use DO INDEX when position matters",
      "findFirst inside loop is potentially O(n²)"
    ],
    "relatedIds": [
      "dt_array_declaration",
      "p2_displayprogress",
      "arr_find_first"
    ],
    "sourcedoc": "Perplexity PML KB §6.2; TM-1401 Arrays",
    "sourcecodebase": "JDE_pipeData_export.pmlmac"
  },
  {
    "id": "arr_methods",
    "category": "arrays",
    "subcategory": "methods",
    "title": "Core ARRAY methods",
    "principle": "ARRAY methods such as append, size, split, sortUnique and MaxIndex are common building blocks for PML pipelines.",
    "rule": "Create arrays with object ARRAY()/ARRAY(), append values, check size/maxIndex before indexed reads, and keep method call casing consistent with codebase style.",
    "syntax": "!a = object ARRAY()\n!a.append(!value)\n!n = !a.size()\n!max = !a.sortUnique().MaxIndex()",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n!finalLog = object ARRAY()\n!finalLog.Append(!severityLevel)\n!finalLog.Append(!toolName)\n!this.logDataList.append(!finalLog)",
    "exampleAntipattern": "-- NOT: !a[0] = !value\n-- Плохо: PML arrays use 1-based indices; index 0 is invalid for normal reads",
    "pitfalls": [
      "Index from 1",
      "Check MaxIndex()/size() before access",
      "Append nested ARRAY intentionally, not accidentally"
    ],
    "relatedIds": [
      "dt_array_declaration",
      "arr_iteration",
      "p2_array_evaluate_block"
    ],
    "sourcedoc": "Perplexity PML KB §6.3; TM-1401 Arrays",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "arr_sort",
    "category": "arrays",
    "subcategory": "sort",
    "title": "Sorting and maximum index in ARRAY",
    "principle": "SortUnique and MaxIndex are used to derive ordered unique values and pick boundary elements.",
    "rule": "Call `.sortUnique()` on comparable values, then `.MaxIndex()` before reading the last value. For DBREF attribute sorting prefer evaluate(BLOCK) to extract comparable keys first.",
    "syntax": "!sizes = !logList.evaluate(object BLOCK(|!logList[!evalIndex].size()|))\n!maxIndex = !sizes.SortUnique().MaxIndex()\n!maxSize = !sizes[!maxIndex]",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n!sizeList  = !logList.evaluate(object BLOCK(|!logList[!evalIndex].size()|))\n!maxIndex  = !sizeList.SortUnique().MaxIndex()\n!maxSize   = !sizeList[!maxIndex]",
    "exampleAntipattern": "-- NOT: !maxSize = !sizes[!sizes.MaxIndex()] before sorting/filtering unset values\n-- Плохо: unset/non-comparable values break ordering assumptions",
    "pitfalls": [
      "Sort comparable values only",
      "Check result is not empty",
      "For DBREF arrays evaluate attributes first"
    ],
    "relatedIds": [
      "p2_array_evaluate_block",
      "p2_array_reindex",
      "arr_methods"
    ],
    "sourcedoc": "Perplexity PML KB §6.4; TM-1401 Arrays",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "arr_append_array",
    "category": "arrays",
    "subcategory": "append-array",
    "title": "Appending rows/nested arrays",
    "principle": "A common table pattern is ARRAY of row ARRAYs.",
    "rule": "Build a row ARRAY, append typed columns in stable order, then append the row to the parent list.",
    "syntax": "!row = object ARRAY()\n!row.append(!col1)\n!row.append(!col2)\n!rows.append(!row)",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n!finalLog = object ARRAY()\n!finalLog.Append(!severityLevel)\n!finalLog.Append(!toolName)\n!this.logDataList.append(!finalLog)",
    "exampleAntipattern": "-- NOT: reuse the same !row object without recreating it per record\n-- Плохо: later updates can mutate/shared-state rows unexpectedly",
    "pitfalls": [
      "Create a fresh row per record",
      "Document column order",
      "Avoid mixing scalar and row-array entries in one list"
    ],
    "relatedIds": [
      "arr_methods",
      "log_contextual_info"
    ],
    "sourcedoc": "Perplexity PML KB §6.1; codebase logger pattern",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "arr_multidimensional",
    "category": "arrays",
    "subcategory": "multidimensional",
    "title": "Multidimensional data with nested ARRAYs",
    "principle": "PML table-like data is represented as ARRAY of ARRAY rows, not as C-style multidimensional arrays.",
    "rule": "Use nested ARRAYs and explicit column indices/names. Validate row size before reading a column.",
    "syntax": "!rows = object ARRAY()\n!row = !rows[!i]\n!value = !row[3]",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n!finalLog = object ARRAY()\n!finalLog.Append(!severityLevel)\n!finalLog.Append(!toolName)\n!this.logDataList.append(!finalLog)",
    "exampleAntipattern": "-- NOT: !rows[!i,!j]\n-- Плохо: PML does not use comma-subscript multidimensional array syntax",
    "pitfalls": [
      "Nested ARRAYs need explicit row extraction",
      "Check row size",
      "Keep column constants documented"
    ],
    "relatedIds": [
      "arr_append_array",
      "arr_methods"
    ],
    "sourcedoc": "Perplexity PML KB §6.1; TM-1401 Arrays",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "arr_find_first",
    "category": "arrays",
    "subcategory": "find-first",
    "title": "ARRAY.findFirst() usage",
    "principle": "findFirst returns the first matching value and is useful for lookup, not current-loop index when duplicates exist.",
    "rule": "Use findFirst for membership/lookup. For loop progress or duplicate-sensitive processing use DO INDEX.",
    "syntax": "!idx = !items.findFirst(!value)\nif !idx.gt(0) then\n  !found = !items[!idx]\nendif",
    "exampleCanonical": "-- CB JDE_pipeData_export.pmlmac\n!rowIdx = !lines.findFirst(!lineStr)\n!!displayProgress(!rowIdx, !lines.size())",
    "exampleAntipattern": "-- NOT: use findFirst to identify current element when ARRAY can contain duplicates\n-- Плохо: duplicate values all map to the first occurrence",
    "pitfalls": [
      "Duplicates make findFirst ambiguous",
      "Check index before reading",
      "Prefer DO INDEX when index is required"
    ],
    "relatedIds": [
      "arr_iteration",
      "p2_displayprogress"
    ],
    "sourcedoc": "Perplexity PML KB §6.3",
    "sourcecodebase": "JDE_pipeData_export.pmlmac"
  },
  {
    "id": "arr_unique_union",
    "category": "arrays",
    "subcategory": "unique-union",
    "title": "Unique values and union-like arrays",
    "principle": "Use sortUnique to remove duplicates from scalar arrays where ordering is acceptable.",
    "rule": "Collect scalar values, call sortUnique(), then iterate the unique result. For DBREF objects extract stable scalar keys before de-duplication.",
    "syntax": "!unique = !values.sortUnique()\ndo !value values !unique\n  -- process once\nenddo",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n!sizeList  = !logList.evaluate(object BLOCK(|!logList[!evalIndex].size()|))\n!maxIndex  = !sizeList.SortUnique().MaxIndex()",
    "exampleAntipattern": "-- NOT: sortUnique DBREF rows directly and expect attribute-based uniqueness\n-- Плохо: object identity/order may not equal business key uniqueness",
    "pitfalls": [
      "sortUnique sorts as well as de-duplicates",
      "Use scalar keys for DBREF uniqueness",
      "Beware unset values"
    ],
    "relatedIds": [
      "arr_sort",
      "p2_array_evaluate_block"
    ],
    "sourcedoc": "Perplexity PML KB §6.3",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "p2_array_evaluate_block",
    "category": "arrays",
    "subcategory": "evaluate-block",
    "title": "ARRAY.evaluate(object BLOCK) — bulk evaluation",
    "principle": "`.evaluate(object BLOCK(...))` applies an expression to every ARRAY element and returns a new ARRAY of results.",
    "rule": "Inside BLOCK reference the original array explicitly as `!array[!evalIndex]`; `!evalIndex` is the special per-element index variable.",
    "syntax": "!sizes = !logList.evaluate(object BLOCK(|!logList[!evalIndex].size()|))\n!names = !results.evaluate(object BLOCK(|!results[!evalIndex].flnn|))",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n!sizeList  = !logList.evaluate(object BLOCK(|!logList[!evalIndex].size()|))\n!maxIndex  = !sizeList.SortUnique().MaxIndex()\n!maxSize   = !sizeList[!maxIndex]",
    "exampleAntipattern": "-- NOT: !logList.evaluate(object BLOCK(|![!evalIndex].size()|))\n-- Плохо: there is no self shorthand inside BLOCK; include the array variable name",
    "pitfalls": [
      "!evalIndex is reserved inside BLOCK evaluation",
      "Result is a new ARRAY; source is not mutated",
      "The expression must return a value for every element"
    ],
    "relatedIds": [
      "arr_methods",
      "arr_sort",
      "col_evaluate_attributes"
    ],
    "sourcedoc": "TM-1401 Arrays — BLOCK operations; Perplexity PML KB §6.4",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "p2_array_reindex",
    "category": "arrays",
    "subcategory": "reindex-sortedindices",
    "title": "ARRAY.reIndex() and sortedIndices() for DBREF ordering",
    "principle": "For DBREF arrays, sorted index arrays let code reorder objects by evaluated attribute without losing the original DBREFs.",
    "rule": "Evaluate sort keys into a scalar ARRAY, obtain sorted indices/reindex mapping where supported, then read original DBREFs by sorted index. If API is unavailable in target Plant version, use evaluate + sortUnique fallback.",
    "syntax": "!keys = !refs.evaluate(object BLOCK(|!refs[!evalIndex].name|))\n-- version-dependent: !idx = !keys.sortedIndices()\n-- version-dependent: !refs.reIndex(!idx)",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n!sizeList  = !logList.evaluate(object BLOCK(|!logList[!evalIndex].size()|))\n!maxIndex  = !sizeList.SortUnique().MaxIndex()",
    "exampleAntipattern": "-- NOT: sort DBREF objects directly and expect NAME/FLNN order\n-- Плохо: DBREF object ordering is not the same as sorting by an attribute",
    "pitfalls": [
      "API availability is version-dependent; verify in target AVEVA version",
      "Keep key array aligned with source DBREF array",
      "Fallback to evaluate + explicit lookup if sortedIndices is unavailable"
    ],
    "relatedIds": [
      "p2_array_evaluate_block",
      "arr_sort",
      "pdms_dbref_resolve"
    ],
    "sourcedoc": "Perplexity PML KB §6.4; codebase fallback uses evaluate/sortUnique",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  }
];
