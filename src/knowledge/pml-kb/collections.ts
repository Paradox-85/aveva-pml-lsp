import type { KBEntry } from '../schemas/kb-entry.js';

export const collectionsEntries: KBEntry[] = [
  {
    "id": "p2_collect_pml1",
    "aliases": ["COLLECT"],
    "category": "collections",
    "subcategory": "pml1-collect",
    "title": "PML1 `var !x COLLECT ...` database collection",
    "principle": "PML1 COLLECT gathers database elements matching a query into a variable for later iteration.",
    "rule": "Use `var !result COLLECT ...` for database-wide selection patterns; wrap risky navigation in HANDLE and validate result before splitting/iterating.",
    "syntax": "var !elements COLLECT ALL BRANCH MEMBERS FOR CE\nvar !backRefElement BACKREF(attname $!backAttribute) of $!element",
    "exampleCanonical": "-- CB ramGetBackRef.pmlfnc\nvar !backRefElement BACKREF(attname $!backAttribute) of $!element\nhandle any\nelsehandle none\n  !backRefElements = !backRefElement.split()\nendhandle",
    "exampleAntipattern": "-- NOT: assume COLLECT/BACKREF always returns a populated ARRAY\n-- Плохо: NONE/empty results need ELSEHANDLE and split/check logic",
    "pitfalls": [
      "COLLECT/BACKREF is PML1-style syntax",
      "Handle NONE results",
      "Convert/split result before ARRAY-style iteration when needed"
    ],
    "relatedIds": [
      "p2_backref",
      "pdms_dbref_resolve",
      "cf_do_enddo_loop"
    ],
    "sourcedoc": "Perplexity PML KB §10.1; TM-1401 PML1 collection syntax",
    "sourcecodebase": "ramGetBackRef.pmlfnc"
  },
  {
    "id": "p2_evaluate_pml1",
    "category": "collections",
    "subcategory": "pml1-evaluate",
    "title": "PML1 `EVALUATE ... FOR ALL FROM` queries",
    "principle": "PML1 EVALUATE extracts attributes such as NAME/FLNN from all elements in a database expression.",
    "rule": "Use EVALUATE for bulk attribute extraction from a collection/query; prefer explicit attribute names and source scope.",
    "syntax": "EVALUATE NAME FOR ALL FROM !elements\nEVALUATE FLNN FOR ALL FROM !refs",
    "exampleCanonical": "-- CB JDE_pipeData_export.pmlmac\n-- JDE export macros use EVALUATE-style bulk database extraction patterns before iterating export rows",
    "exampleAntipattern": "-- NOT: query each DBREF attribute individually in a large nested loop\n-- Плохо: repeated DB hits are slower and harder to protect with HANDLE",
    "pitfalls": [
      "PML1 syntax differs from PML2 object method calls",
      "Scope after FROM must be correct",
      "Returned values may need split/ARRAY conversion"
    ],
    "relatedIds": [
      "p2_collect_pml1",
      "col_evaluate_attributes",
      "pdms_attribute_query"
    ],
    "sourcedoc": "Perplexity PML KB §10.3; TM-1401 PML1 EVALUATE",
    "sourcecodebase": "JDE_pipeData_export.pmlmac"
  },
  {
    "id": "col_collection_object",
    "category": "collections",
    "subcategory": "pml2-collection",
    "title": "PML2 COLLECTION object",
    "principle": "COLLECTION is the PML2 object-oriented alternative for grouping database references.",
    "rule": "Prefer COLLECTION object patterns when codebase/Plant version supports them; keep PML1 COLLECT notes for legacy macros.",
    "syntax": "!collection = object COLLECTION()\n-- add/filter DBREFs according to project API/version",
    "exampleCanonical": "-- CB JDE_pipeData_export.pmlmac\n-- Export macros collect DB elements, then iterate rows/tags for output",
    "exampleAntipattern": "-- NOT: mix COLLECTION object methods with PML1 `var !x COLLECT` syntax in one statement\n-- Плохо: PML1 and PML2 collection APIs have different syntax",
    "pitfalls": [
      "Check target version API",
      "Do not confuse COLLECTION object with COLLECT command",
      "Document conversion to ARRAY if needed"
    ],
    "relatedIds": [
      "p2_collect_pml1",
      "p2_evaluate_pml1"
    ],
    "sourcedoc": "Perplexity PML KB §10.2",
    "sourcecodebase": "JDE_pipeData_export.pmlmac"
  },
  {
    "id": "col_evaluate_attributes",
    "category": "collections",
    "subcategory": "evaluate-attributes",
    "title": "Bulk evaluate attributes from DBREF arrays",
    "principle": "Bulk evaluation avoids repetitive per-element attribute calls in export pipelines.",
    "rule": "Use ARRAY.evaluate(BLOCK) for PML2 arrays and PML1 EVALUATE for database query collections.",
    "syntax": "!names = !refs.evaluate(object BLOCK(|!refs[!evalIndex].name|))",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n!sizeList  = !logList.evaluate(object BLOCK(|!logList[!evalIndex].size()|))",
    "exampleAntipattern": "-- NOT: call `.name` on unset/badRef elements without filtering\n-- Плохо: a single bad DBREF breaks the whole bulk operation",
    "pitfalls": [
      "Filter badRef/unset DBREFs first",
      "BLOCK expression must return a value",
      "PML1 EVALUATE and ARRAY.evaluate have different syntax"
    ],
    "relatedIds": [
      "p2_array_evaluate_block",
      "p2_evaluate_pml1",
      "pdms_dbref_resolve"
    ],
    "sourcedoc": "Perplexity PML KB §10.3; TM-1401 Arrays",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "arrays_findfirst_set_membership",
    "category": "collections",
    "subcategory": "FindFirst",
    "title": "ARRAY.findFirst().set() pattern for membership testing",
    "principle": "Use findFirst() combined with .set() to test whether a value exists in an array.",
    "rule": "if (!array.findFirst(!value).set()) then ... endif",
    "syntax": "if (!<array>.findFirst(<value>).set()) then",
    "exampleCanonical": "-- CB EBE_delta_tag_export.pmlmac\n-- CB mac_03\nif (!deletedTags.findfirst(!tag).set()) then\n  !action = |DELETE|\nelsif (!createdTags.findfirst(!tag).set()) then\n  !action = |NEW|\nendif",
    "exampleAntipattern": "if (!deletedTags.findFirst(!tag) neq UNSET) then  -- less idiomatic",
    "pitfalls": [
      "findFirst returns UNSET if not found; .set() checks for valid result",
      "Must use lowercase findfirst in some PML versions; check case sensitivity"
    ],
    "relatedIds": [
      "p2_collect_pml1"
    ],
    "sourcedoc": "AVEVA PML Array Reference",
    "sourcecodebase": "EBE_delta_tag_export.pmlmac"
  },
  {
    "id": "kb_block_avevalindex",
    "category": "collections",
    "subcategory": "block_evaluation",
    "title": "BLOCK evaluate with !evalIndex special variable",
    "principle": "When evaluating a BLOCK on an ARRAY, !evalIndex is a special variable available inside the block that holds the current index.",
    "rule": "!columns.evaluate(object BLOCK(|!columns[!evalIndex].string()|)) iterates over !columns, with !evalIndex set to each index.",
    "syntax": "!array.evaluate(object BLOCK(|!array[!evalIndex].method()|))",
    "exampleCanonical": "-- CB jacEISDeliveryManager.pmlobj\n-- CB obj_09_columnCollection\n!columnRefNos = !columns.evaluate(object BLOCK(|!columns[!evalIndex].string()|))\n-- CB obj_09_loadReport\n!headings = !headings.evaluate(object BLOCK(|!headings[!evalIndex][1]|))",
    "exampleAntipattern": "-- Using a regular loop instead of evaluate\nDO !i FROM 1 TO !columns.Size()\n  !result.Append(!columns[!i].string())\nENDDO",
    "pitfalls": [
      "!evalIndex is only available inside the BLOCK expression, not outside",
      "BLOCK evaluates each element; the result is an ARRAY of the evaluated values"
    ],
    "relatedIds": [
      "p2_collect_pml1"
    ],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "jacEISDeliveryManager.pmlobj"
  },
  {
    "id": "pml_attribute_query_of",
    "category": "collections",
    "subcategory": "query",
    "title": "Attribute query with of operator",
    "principle": "The of operator queries an attribute on a dbref in expressions",
    "rule": "Use :AttributeName of :dbref to access an attribute value in expressions",
    "syntax": ":AttrName of :dbref",
    "exampleCanonical": "-- CB EIS_data_update.pmlmac\n|:RDLSource of :ClassMappingRefToClass eq 'AKSO_Tag Properties Templates_Rev6'|",
    "exampleAntipattern": "-- WRONG: omit validated pattern for Attribute query with of operator\n-- Review source EIS_data_update.pmlmac before reuse",
    "pitfalls": [
      "Attribute must exist on the dbref type",
      "Use unset()/badref() guards before query"
    ],
    "relatedIds": [
      "pml_unset_badref_check"
    ],
    "sourcedoc": "AVEVA PDMS PML Reference",
    "sourcecodebase": "EIS_data_update.pmlmac"
  }
];
