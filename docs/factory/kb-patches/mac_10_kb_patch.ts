// KB Patch for mac_10 — manual-data-export.pmlmac
// Generated: 2026-06-03
// Action: patch_kb

export interface KBEntry {
  id: string;
  category: string;
  subcategory: string;
  title: string;
  principle: string;
  rule: string;
  syntax: string;
  exampleCanonical: string;
  exampleAntipattern: string;
  pitfalls: string[];
  relatedIds: string[];
  sourcedoc: string;
  sourcecodebase: string;
}

export const kbPatches: KBEntry[] = [
  {
    id: "pml_obj_pmltags",
    category: "objects",
    subcategory: "AVEVA Engineering",
    title: "PMLTAGS object and exportasxls method",
    principle: "The PMLTAGS object provides methods to query and export engineering tag data to spreadsheet formats.",
    rule: "Create a PMLTAGS instance with `object PMLTAGS()`, then call `.exportasxls(!groupName, !listName, !filePath)` to export matching tags.",
    syntax: "!!tags = object PMLTAGS()\n!!tags.exportasxls(!groupName, !listName, !filePath)",
    exampleCanonical: `-- Export tags from a named list
!!tags = object PMLTAGS()
var !grid collect all LSTDEF with (LSTNAM eq |my-list|)
if (!grid.size() eq 1) then
    !gridRef = !grid.first().dbref()
    var !gName CATNAM of LSTGRP of $!gridRef
    !!tags.exportasxls(!gName, '$!<gridRef.LSTNAM>', '$!outPath')
endif`,
    exampleAntipattern: `-- Don't reuse PMLTAGS across different export contexts without clearing
!!tags = object PMLTAGS()
!!tags.exportasxls(...)
!!tags.exportasxls(...) -- stale state may cause wrong export`,
    pitfalls: [
      "PMLTAGS is specific to AVEVA Engineering; it may not be available in PDMS-only environments.",
      "The exportasxls method requires valid group and list names; passing empty strings causes runtime errors."
    ],
    relatedIds: ["pml_query_collect_all", "pml_string_split"],
    sourcedoc: "AVEVA Engineering PML Customization",
    sourcecodebase: "manual-data-export.pmlmac"
  },
  {
    id: "pml_op_inset",
    category: "operators",
    subcategory: "PML1 query operators",
    title: "inset operator for list membership in PML1 queries",
    principle: "The `inset` operator tests whether a value is a member of a list of values in PML1 query expressions.",
    rule: "Use `value inset (list1, list2, ...)` in PML1 query expressions to test membership. Combine with `NOT` to exclude values.",
    syntax: "NOT(:TagStatus inset (|VOID|, |Future|))",
    exampleCanonical: `-- Exclude tags with VOID or Future status
!tagFilter = 'NOT(:TagStatus inset (|VOID|, |Future|)) and ISNAMED'`,
    exampleAntipattern: `-- Don't use inset with PML2 method chaining
!status.inset(...) -- incorrect, use infix form`,
    pitfalls: [
      "inset is a PML1 infix operator; it works inside query expression strings but not in PML2 object method chains.",
      "Values inside inset must be pipe-delimited strings."
    ],
    relatedIds: ["pml_query_collect_all", "pml_op_matchwild"],
    sourcedoc: "AVEVA PDMS/E3D Query Reference",
    sourcecodebase: "manual-data-export.pmlmac"
  },
  {
    id: "pml_obj_lstgrp_lstdef",
    category: "objects",
    subcategory: "AVEVA Engineering Lists",
    title: "LSTDEF and LSTGRP objects for list management",
    principle: "LSTDEF (List Definition) and LSTGRP (List Group) are AVEVA Engineering objects used to manage named lists for tag data grouping.",
    rule: "Query LSTDEF to find a list by name. Access LSTGRP via `LSTGRP of` to get the group. Use CATNAM to get the group name. Set lstflt to clear filters.",
    syntax: "var !grid collect all LSTDEF with (LSTNAM eq |listName|)\n!gridRef = !grid.first().dbref()\n!gridRef.lstflt = !realUnset\nvar !gName CATNAM of LSTGRP of $!gridRef",
    exampleCanonical: `-- Find and clear a list
var !grid collect all LSTDEF with (LSTNAM eq |IM-tag-dataset|)
if (!grid.size() eq 1) then
    !gridRef = !grid.first().dbref()
    !gridRef.lstflt = ARRAY()
    var !gName CATNAM of LSTGRP of $!gridRef
endif`,
    exampleAntipattern: `-- Don't assume grid.size() == 1; always check before accessing first()
var !grid collect all LSTDEF with (LSTNAM eq |missing-list|)
!gridRef = !grid.first().dbref() -- CRASH if grid is empty`,
    pitfalls: [
      "LSTDEF/LSTGRP are Engineering-specific; not available in PDMS.",
      "lstflt is a reference attribute; setting it to an empty ARRAY clears the filter."
    ],
    relatedIds: ["pml_query_collect_all", "pml_obj_pmltags"],
    sourcedoc: "AVEVA Engineering List Reference",
    sourcecodebase: "manual-data-export.pmlmac"
  },
  {
    id: "pml_fmt_datetime_string",
    category: "patterns",
    subcategory: "datetime formatting",
    title: "DATETIME object with .string() format codes",
    principle: "The OBJECT DATETIME() construct returns a datetime object with methods for year, month, date, hour, minute, second. Each can be formatted via .string(formatCode).",
    rule: "Use `.string('I2')` for zero-padded 2-digit integers, `.string('I4')` for 4-digit years. Format codes follow PDMS/E3D FORMAT conventions.",
    syntax: "!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')",
    exampleCanonical: `-- Build a timestamped filename
!dt = OBJECT DATETIME()
!ts = !dt.year().string() & '-' & !dt.month().string('I2') & '-' & !dt.date().string('I2')`,
    exampleAntipattern: `-- Don't use .string() without format code for zero-padding
!month = !dt.month().string() -- may produce single-digit '3' instead of '03'`,
    pitfalls: [
      "Format codes like 'I2' are PDMS/E3D FORMAT codes; their exact behavior may vary by product version.",
      ".year() returns a REAL; .string() on a bare REAL may not zero-pad."
    ],
    relatedIds: ["pml_string_object", "pml_var_local"],
    sourcedoc: "AVEVA E3D PML Customization",
    sourcecodebase: "manual-data-export.pmlmac"
  },
  {
    id: "pml_cmd_matchwild_query",
    category: "functions",
    subcategory: "PML1 query functions",
    title: "matchwild function in PML1 query expressions",
    principle: "The `matchwild` function in PML1 query expressions performs wildcard pattern matching on attribute values or names.",
    rule: "Use `matchwild(attribute, |pattern|)` inside PML1 query expression strings. Supports `*` (any chars) and `?` (single char).",
    syntax: "matchwild(name, |*GB.*|)\nmatchwild(namn of :Ref, |*$!pckgName*|)",
    exampleCanonical: `-- Find tags matching a pattern
!tagFilter = 'ISNAMED and matchwild(name, |*GB.*|)'`,
    exampleAntipattern: `-- Don't use matchwild as a STRING method in query strings
matchwild(!name, |*|) -- incorrect, use PML1 infix form`,
    pitfalls: [
      "matchwild in query strings is PML1-style; the STRING.MatchWild() method is PML2-style. They are not interchangeable in query expression strings.",
      "Variable interpolation in matchwild patterns requires `$!var` syntax inside pipe strings."
    ],
    relatedIds: ["pml_op_inset", "pml_query_collect_all"],
    sourcedoc: "AVEVA PDMS/E3D Query Reference",
    sourcecodebase: "manual-data-export.pmlmac"
  }
];
