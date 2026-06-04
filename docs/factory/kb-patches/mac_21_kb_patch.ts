/**
 * KB Patch for mac_21 (JDE_dbView_extractor.pmlmac)
 * Generated: 2026-06-03
 * Source: docs/codebase/macros/JDE_dbView_extractor.pmlmac
 */

export const kbEntries: KBEntry[] = [
  {
    suggestedId: "dbview_sub_object_types",
    category: "dbview_lifecycle",
    subcategory: "dbview_sub_objects",
    title: "DbView sub-object types: ELEL, EXPFIL, ATTFIL, EXPCOL, ATTCOL",
    principle: "DbView objects expose sub-objects (elements, expression filters, attribute filters, expression columns, attribute columns) that can be queried via !!CollectAllFor with type filter and $!dbView scope.",
    rule: "Use !!CollectAllFor('EXPFIL'|'ATTFIL'|'EXPCOL'|'ATTCOL', ||, $!dbView) to collect DbView sub-objects scoped to a specific DbView instance.",
    syntax: "!subList = !!CollectAllFor('<TYPE>', ||, $!<dbViewRef>)\ndo !item values !subList\n  !prop = !item.Property\nenddo",
    exampleCanonical: "-- Collect all EXPFIL under a DbView\n!expList = !!CollectAllFor('EXPFIL', ||, $!dbView)\ndo !exp values !expList\n  !expr = !exp.Expression\n  !type = !exp.ExpType\nenddo",
    exampleAntipattern: "-- WRONG: Collecting EXPFIL without DbView scope\n!badList = !!CollectAllFor('EXPFIL', ||, world) -- returns ALL EXPFIL in world, not scoped",
    pitfalls: ["Scope must use $!dbView reference, not just the DbView name", "Each sub-object type has different attributes — check type-specific properties"],
    relatedIds: ["collectallfor_basic", "dbview_creation_commands"],
    sourcedoc: "JDE_dbView_extractor.pmlmac",
    sourcecodebase: "JDE_dbView_extractor.pmlmac"
  },
  {
    suggestedId: "dbview_elel_property",
    category: "dbview_lifecycle",
    subcategory: "dbview_sub_objects",
    title: "DbView .elel property for element iteration",
    principle: "DbView objects expose a .elel property that returns the list of elements included in the view.",
    rule: "Access !dbView.elel to iterate through elements of a DbView. Each element is a DBREF.",
    syntax: "do !ele values !dbView.elel\n  !eleName = !ele.Udname\nenddo",
    exampleCanonical: "do !ele values !dbView.elel\n  !string = !dbViewName & |;1_ELEL;;| & !ele & |;;|\n  !data.append(!string.split(|;|))\nenddo",
    exampleAntipattern: "",
    pitfalls: ["!ele is a DBREF, not a string — concatenate with string for CSV output"],
    relatedIds: ["dbview_sub_object_types", "collectallfor_basic"],
    sourcedoc: "JDE_dbView_extractor.pmlmac",
    sourcecodebase: "JDE_dbView_extractor.pmlmac"
  },
  {
    suggestedId: "handle_none_recovery_pattern",
    category: "error_handling",
    subcategory: "specific_error_codes",
    title: "Handle NONE for var command recovery",
    principle: "When a PML var command (like ATTDEF query) may fail due to missing or invalid references, wrap in handle none to provide a fallback value instead of aborting the macro.",
    rule: "Use handle none (without error codes) when the var command is optional and a fallback value is acceptable. The handler assigns a default value to the variable.",
    syntax: "if (!condition) then\n  var !result OBJECT $!<reference> ATTR1 ATTR2\n  handle none\n    !result = !defaultValue\n  endhandle\nendif",
    exampleCanonical: "if (!udName.unset() or !udName.empty()) then\n  var !attData ATTDEF $!<att.DbAttribute> NAME TYPE RPTX SIZE DEFI DTYP UNIT VISI QSET QTXT ITYP DESTEX\n  handle none\n    !udName = !attData[3]\n  endhandle\nendif",
    exampleAntipattern: "-- WRONG: handle any on optional var command\nvar !attData ATTDEF $!<att.DbAttribute> NAME\nhandle any\n  !udName = !attData[3]\nendhandle -- handle any catches ALL errors including programming mistakes",
    pitfalls: ["handle none catches ALL errors including typos — use only when fallback is intentional", "var result array indexing (!attData[3]) depends on attribute order"],
    relatedIds: ["handle_any_generic", "var_command_syntax"],
    sourcedoc: "JDE_dbView_extractor.pmlmac",
    sourcecodebase: "JDE_dbView_extractor.pmlmac"
  },
  {
    suggestedId: "netdatasource_gridcontrol_export",
    category: "grid_controls",
    subcategory: "grid_export",
    title: "NETDATASOURCE + NETGRIDCONTROL Excel export pattern",
    principle: "Use NETGRIDCONTROL with NETDATASOURCE to create tabular data views and export to Excel. NETDATASOURCE takes a name, header array, and data array.",
    rule: "1) Create NETGRIDCONTROL object. 2) Create NETDATASOURCE with header list and data array. 3) Bind data source to grid. 4) Call saveGridToExcel with file path.",
    syntax: "!grid = object NETGRIDCONTROL()\n!grid.clearGrid()\n!source = object NETDATASOURCE('name', !headerList, !dataArray)\n!grid.BindToDataSource(!source)\n!grid.saveGridToExcel('|$!filePath|', clearData)",
    exampleCanonical: "!dataTable = object NETGRIDCONTROL()\n!dataTable.clearGrid()\n!source = object NETDATASOURCE('data', !headerList, !data)\n!dataTable.BindToDataSource(!source)\n!dataTable.saveGridToExcel(|$!dataFile|)",
    exampleAntipattern: "",
    pitfalls: ["NETDATASOURCE constructor signature: (name, headers, data) — headers must be an ARRAY, data must be an ARRAY of arrays or strings", "saveGridToExcel accepts file path as pipe-delimited string with $! variable substitution", "import 'GridControl' with handle ANY tolerance is recommended — NETGRIDCONTROL may not be available in all environments"],
    relatedIds: ["netgridcontrol_core_presentation", "array_split_pattern"],
    sourcedoc: "JDE_dbView_extractor.pmlmac",
    sourcecodebase: "JDE_dbView_extractor.pmlmac"
  },
  {
    suggestedId: "string_unset_empty_methods",
    category: "string_manipulation",
    subcategory: "string_validation",
    title: "String .unset() and .empty() methods",
    principle: "PML string objects provide .unset() and .empty() methods for validation. .unset() checks if the variable is unset/BADREF. .empty() checks if the string is empty or whitespace.",
    rule: "Use !str.unset() to check BADREF/unset state. Use !str.empty() to check for empty/whitespace content. Combine with .or() for guard conditions.",
    syntax: "if (!str.unset() or !str.empty()) then\n  -- handle missing or empty value\nendif",
    exampleCanonical: "if (!udName.unset() or !udName.empty()) then\n  var !attData ATTDEF $!<att.DbAttribute> NAME TYPE RPTX SIZE DEFI DTYP UNIT VISI QSET QTXT ITYP DESTEX\n  handle none\n    !udName = !attData[3]\n  endhandle\nendif",
    exampleAntipattern: "",
    pitfalls: [".unset() returns TRUE if the variable is BADREF or never assigned", ".empty() returns TRUE for empty strings and whitespace-only strings"],
    relatedIds: ["badref_detection", "string_methods"],
    sourcedoc: "JDE_dbView_extractor.pmlmac",
    sourcecodebase: "JDE_dbView_extractor.pmlmac"
  }
];
