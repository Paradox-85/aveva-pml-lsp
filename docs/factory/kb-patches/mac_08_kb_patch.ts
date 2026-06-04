// KB Patch for mac_08 — JDE_vendortag_import.pmlmac
// Generated: 2026-06-03 by pml-worker
// Action: patch_kb

import type { KBEntry } from '../knowledge/schemas/kb-entry';

export const kbPatches: KBEntry[] = [
  {
    suggestedId: 'd7_netgridcontrol_excel_io',
    category: 'net-interop',
    subcategory: 'excel-import-export',
    title: 'NETGRIDCONTROL / NETDATASAVE Excel I/O workflow',
    principle: 'Use NETGRIDCONTROL and NETDATASAVE to read/write Excel files in PML macros. NETDATASAVE constructor accepts "Grid Table" for reading or "data" with header+data arrays for writing. NETGRIDCONTROL methods: bindToDataSource(), getrows(), gettitles(), clearGrid(), saveGridToExcel().',
    rule: "Import 'GridControl' with handle any before using NETGRIDCONTROL. For reading: create NETDATASAVE('Grid Table', !path), bind, call getrows()/gettitles(). For writing: create NETDATASAVE('data', !headers, !data), bind, call saveGridToExcel().",
    syntax: `import 'GridControl'
handle any
endhandle
!ds = object NETDATASAVE('Grid Table', !path)
!grid = object NETGRIDCONTROL()
!grid.bindToDataSource(!ds)
!rows = !grid.getrows()
!titles = !grid.gettitles()`,
    exampleCanonical: `import 'GridControl'
handle any
endhandle
!fileName = |path\\to\\file.xlsx|
!dataSource = object NETDATASAVE('Grid Table', !fileName)
!dataTable = object NETGRIDCONTROL()
!dataTable.bindToDataSource(!dataSource)
!data = !dataTable.getrows()
!heading = !dataTable.gettitles()`,
    exampleAntipattern: `-- Missing GridControl import will fail at runtime
!dataTable = object NETGRIDCONTROL()  -- ERROR: GridControl not loaded`,
    pitfalls: [
      "NETDATASAVE constructor signature differs for read vs write: 'Grid Table' (single arg) vs 'data' (3 args: header array + data array)",
      "Always call clearGrid() before re-binding to a new data source",
      "saveGridToExcel takes two string args: output path and data type name",
      "Use handle any around import 'GridControl' — GridControl may not be loaded in all AVEVA sessions"
    ],
    relatedIds: ['obj_factory_pattern', 'dt_string_substitution'],
    sourcedoc: 'TM-1401 PML Basic',
    sourcecodebase: 'JDE_vendortag_import.pmlmac'
  },
  {
    suggestedId: 'd7_element_creation_api',
    category: 'elements',
    subcategory: 'element-creation-api',
    title: 'AVEVA Elements API: CREATEELEMENT / ELEMENTTYPE workflow',
    principle: 'Use Aveva.Engineering.PMLElementManager namespace for dynamic element creation. CREATEELEMENT creates an element builder, ELEMENTTYPE validates element type, SetElementTypeByName sets the type, AddAttributeValue sets NAME, Execute commits. GetErrors() returns creation errors.',
    rule: "Import |Aveva.Engineering.PMLElementManager| with handle any. Create element builder with object CREATEELEMENT(). Validate type with object ELEMENTTYPE(|:$!type|). If not valid, call SetElementTypeByName(). Add NAME attribute, Execute(), then GetErrors(). Always re-read dbref after creation.",
    syntax: `import |Aveva.Engineering.PMLElementManager|
handle any
endhandle
!el = object CREATEELEMENT()
!et = object ELEMENTTYPE(|:$!type|)
if (!et.valid()) then
  !el.SetElementTypeByName(|:$!type|)
endif
!el.AddAttributeValue(|NAME|, !name)
!el.Execute()
!errors = !el.GetErrors()`,
    exampleCanonical: `using namespace |Aveva.Engineering.PMLElementManager|
!elementNet = object CREATEELEMENT()
!etype = object ELEMENTTYPE(|:$!<Type>|)
if (!etype.valid()) then
  !elementNet.SetElementTypeByName(|:$!<Type>|)
  handle any
    !msg = |Class [$!Type] is not valid|
  elsehandle none
    !elementNet.AddAttributeValue(|NAME|, !tagName)
    !elementNet.Execute()
    !errors = !elementNet.GetErrors()
  endhandle
endif`,
    exampleAntipattern: `-- Missing namespace import causes CREATEELEMENT to be undefined
!elementNet = object CREATEELEMENT()  -- ERROR without using namespace`,
    pitfalls: [
      "ELEMENTTYPE() returns false if type is not recognized — fall back to SetElementTypeByName()",
      "GetErrors() returns an ARRAY of error strings — iterate with do/foreach",
      "Always re-read !tagref = !tagName.dbref() after Execute() to get a valid reference",
      "Handle errors around Execute() — it may fail even with valid type"
    ],
    relatedIds: ['obj_factory_pattern', 'dt_string_substitution'],
    sourcedoc: 'AVEVA Elements API Documentation',
    sourcecodebase: 'JDE_vendortag_import.pmlmac'
  },
  {
    suggestedId: 'd7_attribute_type_gated_assignment',
    category: 'attributes',
    subcategory: 'type-gated-assignment',
    title: 'Type-gated attribute value assignment with objecttype() detection',
    principle: 'Before setting an attribute value, detect the attribute\'s current value type via !currentValue.objecttype(), then use the matching type conversion method: .real() for REAL, .dbref() for DBREF, .string() for STRING. Skip ARRAY types. Wrap each assignment in handle any for error recovery.',
    rule: "Get current value: !currentValue = !tagref.attribute(!attrName). Detect type: !valueType = !currentValue.objecttype(). Use if/elseif chain to match 'REAL' → .real(), 'DBREF' → .dbref(), 'STRING' → .string(). Wrap each assignment in handle any with error logging.",
    syntax: `!currentValue = !tagref.attribute(!attrName)
!valueType = !currentValue.objecttype()
if (!valueType eq 'REAL') then
  !tagref.attribute(!attrName) = !fileValue.real()
  handle any
    !msg = |Error: $!!error.text|
  endhandle
elseif (!valueType eq 'DBREF') then
  !fileValue = |/$!fileValue|
  !tagref.attribute(!attrName) = !fileValue.dbref()
  handle any
    !msg = |Error: $!!error.text|
  endhandle
elseif (!valueType eq 'STRING') then
  !tagref.attribute(!attrName) = !fileValue.string()
  handle any
    !msg = |Error: $!!error.text|
  endhandle
endif`,
    exampleCanonical: `!valueType = !currentValue.objecttype()
if (!valueType eq 'REAL') then
  !tagref.attribute(!attribute1.name()) = !fileValue.real()
  handle any
    !msg = |$!tag;$!acttype;$!attributeName1;$!fileValue;$!!error.text|
  endhandle
elseif (!valueType eq 'DBREF') then
  !fileValue = |/$!fileValue|
  !tagref.attribute(!attribute1.name()) = !fileValue.dbref()
  handle any
    !msg = |$!tag;$!acttype;$!attributeName1;$!fileValue;$!!error.text|
  endhandle
elseif (!valueType eq 'STRING') then
  !tagref.attribute(!attribute1.name()) = !fileValue.string()
  handle any
    !msg = |$!tag;$!acttype;$!attributeName1;$!fileValue;$!!error.text|
  endhandle
endif`,
    exampleAntipattern: `-- Assigning without type detection can fail silently or corrupt data
!tagref.attribute(!attrName) = !fileValue  -- No type check, may assign wrong type`,
    pitfalls: [
      "DBREF values need |/$!fileValue| prefix before calling .dbref()",
      "REAL conversions may fail on non-numeric strings — always wrap in handle any",
      "ARRAY type attributes cannot be set this way — use skip or alternative approach",
      "objecttype() returns uppercase strings: 'REAL', 'DBREF', 'STRING', 'ARRAY'"
    ],
    relatedIds: ['attribute object', 'dt_string_substitution'],
    sourcedoc: 'AVEVA Engineering PML Objects',
    sourcecodebase: 'JDE_vendortag_import.pmlmac'
  },
  {
    suggestedId: 'd7_dual_attribute_fallback',
    category: 'attributes',
    subcategory: 'fallback-assignment',
    title: 'Dual-attribute fallback pattern for mapping table lookups',
    principle: 'When a mapping table provides two possible attribute names for a source column, attempt assignment to the primary attribute first, then fall back to the alternative attribute if the primary is invalid or the alternative name is non-empty.',
    rule: "From mapping table, extract attributeName1 (primary) and attributeName2 (alternative). Create ATTRIBUTE objects for both. Check !attribute1.hash() gt 0 for validity. If primary fails or attributeName2 is non-empty, repeat the type-gated assignment for attribute2.",
    syntax: `!attributeName1 = !mappingData[!mappedIdx][2]
!attributeName2 = !mappingData[!mappedIdx][3]
!attribute1 = object ATTRIBUTE(!attributeName1)
!attribute2 = object ATTRIBUTE(!attributeName2)
-- Primary assignment with error handling
if (!attribute1.hash() gt 0) then
  !currentValue = !tagref.attribute(!attribute1.name())
  -- type-gated assignment ...
endif
-- Fallback to alternative
if (!attributeName2.trim() neq ||) then
  if (!attribute2.hash() gt 0) then
    -- type-gated assignment ...
  endif
endif`,
    exampleCanonical: `!attributeName1 = !mappingData[!mappedIdx][2]
!attributeName2 = !mappingData[!mappedIdx][3]
!attribute1 = object ATTRIBUTE(!attributeName1)
!attribute2 = object ATTRIBUTE(!attributeName2)
if (!attribute1.hash() gt 0) then
  !currentValue = !tagref.attribute(!attribute1.name())
  -- type-gated assignment ...
endif
if (!attributeName2.trim() neq ||) then
  if (!attribute2.hash() gt 0) then
    !currentValue = !tagref.attribute(!attribute2.name())
    -- type-gated assignment ...
  endif
endif`,
    exampleAntipattern: `-- Skipping fallback means some columns may never get assigned
-- when primary attribute name is invalid`,
    pitfalls: [
      "Both attributes must be checked for hash() > 0 before assignment",
      "Trim alternative attribute name before checking emptiness",
      "Error messages should include both attribute names for debugging",
      "Consider logging which attribute was successfully assigned"
    ],
    relatedIds: ['d7_attribute_type_gated_assignment', 'attribute object'],
    sourcedoc: 'AVEVA Engineering PML Objects',
    sourcecodebase: 'JDE_vendortag_import.pmlmac'
  },
  {
    suggestedId: 'd7_empty_na_value_filtering',
    category: 'datatypes',
    subcategory: 'empty-value-detection',
    title: 'Multi-condition empty/NA/unset/zero value filtering',
    principle: 'When importing data from spreadsheets, values may appear as empty strings, "NA", "N/A", "unset", or "0". All of these should be treated as missing data and skipped. Use chained AND conditions: .empty().not() AND .lowCase() neq "na" AND .lowCase() neq "n/a" AND .lowCase() neq "unset" AND value neq "0".',
    rule: "Check value emptiness first with !fileValue.empty().not(). Then check common placeholder strings case-insensitively with .lowCase(). Finally check numeric zero string. Only process if ALL conditions pass (value is non-empty and not a placeholder).",
    syntax: `if (!fileValue.empty().not() and !fileValue.lowCase() neq |na| and !fileValue.lowCase() neq |n/a| and !fileValue.lowCase() neq |unset| and !fileValue neq |0|) then
  -- process value
endif`,
    exampleCanonical: `if (!fileValue.empty().not() and !fileValue.lowCase() neq |na| and !fileValue.lowCase() neq |n/a| and !fileValue.lowCase() neq |unset| and !fileValue neq |0|) then
  !tagref.attribute(!attribute1.name()) = !fileValue.real()
endif`,
    exampleAntipattern: `-- Only checking empty misses NA/unset values that will cause assignment errors
if (!fileValue.empty().not()) then
  !tagref.attribute(!attr) = !fileValue  -- May assign 'NA' string to REAL attribute`,
    pitfalls: [
      "Use .lowCase() for case-insensitive comparison — 'NA', 'na', 'Na' are all placeholders",
      "The .not() after .empty() is necessary — .empty() returns TRUE for empty strings",
      "Numeric zero '0' is a valid value for some attributes but may indicate missing data in vendor imports",
      "Consider adding 'null', 'none', '-' as additional placeholder values"
    ],
    relatedIds: ['dt_string_substitution', 'string object'],
    sourcedoc: 'AVEVA PML String Objects',
    sourcecodebase: 'JDE_vendortag_import.pmlmac'
  },
  {
    suggestedId: 'd7_attribute_hash_validation',
    category: 'attributes',
    subcategory: 'attribute-validation',
    title: 'Attribute existence validation via hash() > 0',
    principle: 'Before attempting to set an attribute value, validate that the attribute is applicable to the current element type by checking !attribute.hash() gt 0. A zero hash means the attribute is not valid for this element type.',
    rule: "After creating ATTRIBUTE object, check !attribute.hash() gt 0. Only proceed with assignment if hash is positive. If hash is zero, log an error message indicating the attribute is not valid for this element type.",
    syntax: `!attribute = object ATTRIBUTE(!name)
if (!attribute.hash() gt 0) then
  -- proceed with assignment
else
  !msg = |Attribute $!name is not valid for this item|
endif`,
    exampleCanonical: `!attribute1 = object ATTRIBUTE(!attributeName1)
if (!attribute1.hash() gt 0) then
  !currentValue = !tagref.attribute(!attribute1.name())
  -- type-gated assignment ...
else
  !msg = |$!tag;$!attributeName1;$!fileValue;Attribute is not valid in AVEVA for this item|
endif`,
    exampleAntipattern: `-- Skipping hash check may cause silent failures when attribute is not valid
!tagref.attribute(!attribute1.name()) = !fileValue  -- May fail silently if attribute not valid`,
    pitfalls: [
      "hash() returns 0 (not an error code) when attribute is not valid",
      "Different element types may support different sets of attributes",
      "Always log the element tag, attribute name, and file value for debugging",
      "This check should be done before attempting any attribute assignment"
    ],
    relatedIds: ['attribute object', 'd7_attribute_type_gated_assignment'],
    sourcedoc: 'AVEVA Engineering PML Objects',
    sourcecodebase: 'JDE_vendortag_import.pmlmac'
  },
  {
    suggestedId: 'd7_special_char_stripping',
    category: 'datatypes',
    subcategory: 'string-cleaning',
    title: 'Special character stripping via iterative replace',
    principle: 'To clean a string of multiple special characters, split a symbol string into an array, then iterate and replace each symbol with an empty string. This is more flexible than a single replace() call when dealing with many characters.',
    rule: "Define a symbol string containing all characters to strip. Split into array. Iterate with do/foreach. Call .replace(!symbol, '') for each. For tag names, prefix with |/$!| and call .dbref().",
    syntax: `!symbol = |. , - ~ * : ; _ / \\ ' " & ? ! # $ % ( )|
!symbols = !symbol.split()
!symbols.append(| |)
do !symb values !symbols
  !Type = !Type.replace(!symb, '')
enddo`,
    exampleCanonical: `!symbol = |. , - ~ * : ; _ / \\ ' " & ? ! # $ % ( )|
!symbols = !symbol.split()
!symbols.append(| |)
do !symb values !symbols
  !Type = !Type.replace(!symb, '')
enddo
!tagName = |/$!<Tag>|
!tagref = !tagName.dbref()`,
    exampleAntipattern: `-- Using a single replace for each character is verbose and error-prone
!Type = !Type.replace('.', '')
!Type = !Type.replace(',', '')
!Type = !Type.replace(' ', '')  -- many more lines needed`,
    pitfalls: [
      "Split on spaces — the symbol string should use spaces as delimiters",
      "Remember to append a space to the symbols array (space is a common character to strip)",
      "The backslash in the symbol string needs proper escaping in PML",
      "This pattern is useful for tag names and element type names"
    ],
    relatedIds: ['dt_string_substitution', 'string object'],
    sourcedoc: 'AVEVA PML String Objects',
    sourcecodebase: 'JDE_vendortag_import.pmlmac'
  }
];
