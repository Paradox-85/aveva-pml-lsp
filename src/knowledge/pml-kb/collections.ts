import type { KBEntry } from '../schemas/kb-entry.js';

export const collectionsEntries: KBEntry[] = [
  {
    "id": "p2_collect_pml1",
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
  }
];
