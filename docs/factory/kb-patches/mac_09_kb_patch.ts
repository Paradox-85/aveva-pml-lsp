/**
 * KB Patch for mac_09 (JDE_newtag_import.pmlmac)
 * Generated: 2026-06-03
 * Source: docs/codebase/macros/JDE_newtag_import.pmlmac
 */

import { KBEntry } from '../../../src/knowledge/schemas/kb-entry';

export const kbPatchEntries: KBEntry[] = [
  {
    id: 'd7_element_creation_api',
    category: 'dotnetinterop',
    subcategory: 'PMLElementManager',
    title: 'Element creation via Aveva.Engineering.PMLElementManager',
    principle: 'Use CREATEELEMENT and ELEMENTTYPE objects to create elements with typed attributes in AVEVA Engineering.',
    rule: 'Create ELEMENTTYPE with class name, validate name() is not UNKNOWN, then call SetElementTypeByName, AddAttributeValue, Execute, and GetErrors.',
    syntax: `!elem = object CREATEELEMENT()
!et = object ELEMENTTYPE('|:$<ClassName>|')
if (!et.name() neq |UNKNOWN|) then
  !elem.SetElementTypeByName('|:$<ClassName>|')
  !elem.AddAttributeValue('|NAME|', !tagName)
  !elem.Execute()
  !errors = !elem.GetErrors()
endif`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!elem = object CREATEELEMENT()
!et = object ELEMENTTYPE('|:$!<Type>|')
if (!et.name() neq |UNKNOWN|) then
  !elem.SetElementTypeByName('|:$!<Type>|')
  !elem.AddAttributeValue(|NAME|, !tag)
  !elem.Execute()
  !errors = !elem.GetErrors()
  DO !error values !errors
    !err = |$!tag;NA;NA;$!error|
    !issueData.append(!err.split(|;|))
  ENDDO
endif`,
    exampleAntipattern: `-- Creating element without type validation
!elem = object CREATEELEMENT()
!elem.SetElementTypeByName('|:$!<Type>|')  -- crashes if type is unknown
!elem.Execute()`,
    pitfalls: [
      'Always check ELEMENTTYPE.name() neq UNKNOWN before calling SetElementTypeByName',
      'GetErrors() returns an ARRAY of error strings — iterate to log them',
      'CREATEELEMENT is in Aveva.Engineering.PMLElementManager namespace, not a builtin'
    ],
    relatedIds: ['obj_namespace_loading', 'obj_attribute_hash'],
    sourcedoc: 'AVEVA Engineering PML Customization — Database Interfaces',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    id: 'd7_display_progress',
    category: 'ui',
    subcategory: 'progress',
    title: 'Display progress with !!displayProgress',
    principle: 'Use !!displayProgress(current, total) in loops to show progress in AVEVA UI.',
    rule: 'Call !!displayProgress(!current, !total) inside DO loops to update the user-facing progress indicator.',
    syntax: `DO !row values !data
  !rowIdx = !data.findFirst(!row)
  !!displayProgress(!rowIdx, !data.size())
ENDDO`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
DO !row values !data
  !rowIdx = !data.findFirst(!row)
  !!displayProgress(!rowIdx, !data.size())
ENDDO`,
    exampleAntipattern: `-- No progress shown in long loops
DO !row values !data
  -- no progress update
ENDDO`,
    pitfalls: [
      '!!displayProgress is a global helper function, not a method of a specific object',
      'First argument should be current iteration count, second should be total'
    ],
    relatedIds: ['fmsys_set_progress'],
    sourcedoc: 'AVEVA Engineering PML Customization',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    id: 'd7_string_dbref_conversion',
    category: 'typeconversion',
    subcategory: 'dbref',
    title: 'STRING to DBREF conversion via .dbref() method',
    principle: 'Convert a STRING variable to a DBREF using the .dbref() method for database element references.',
    rule: 'Use !tagName.dbref() where !tagName is a STRING in the format /$<element_path> to obtain a DBREF.',
    syntax: `!tagName = |/path/to/element|
!tagRef = !tagName.dbref()`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!tag = |/$!<Tag>|
!tagRef = !tag.dbref()`,
    exampleAntipattern: `-- Using dbref command instead of method
DBREF !tagRef /path/to/element  -- PML1 style, not PML2 method`,
    pitfalls: [
      'The string must be in valid element path format (e.g., /$<Type>/<Name>)',
      'The referenced element must exist or be creatable in the current session scope',
      'DBREF conversion does not validate element existence — handle errors after use'
    ],
    relatedIds: ['dt_dbref_creation'],
    sourcedoc: 'AVEVA Engineering PML Customization — PML Expressions',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    id: 'd7_netgridcontrol_excel_io',
    category: 'dotnetinterop',
    subcategory: 'GridControl',
    title: 'NETGRIDCONTROL and NETDATASOURCE for Excel import/export',
    principle: 'Use NETGRIDCONTROL and NETDATASOURCE objects to read/write Excel files in PML macros.',
    rule: 'Create NETGRIDCONTROL, bind to NETDATASOURCE with file path, call getrows()/gettitles(), iterate data, write results back via clearGrid + BindToDataSource + saveGridToExcel.',
    syntax: `!grid = object NETGRIDCONTROL()
!source = object NETDATASOURCE('Grid Table', !fileName)
!grid.bindToDataSource(!source)
!data = !grid.getrows()
!heading = !grid.gettitles()`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!grid = object NETGRIDCONTROL()
!dataSource = object NETDATASOURCE('Grid Table', !fileName)
!grid.bindToDataSource(!dataSource)
!data = !grid.getrows()
!heading = !grid.gettitles()`,
    exampleAntipattern: `-- Missing import for GridControl
!grid = object NETGRIDCONTROL()  -- fails without import 'GridControl'`,
    pitfalls: [
      "Must import 'GridControl' with handle any/endhandle",
      "NETDATASOURCE constructor signature: NETDATASOURCE('Grid Table', fileName) for read, NETDATASOURCE('data', headers, data) for write",
      "saveGridToExcel requires the data argument to match the NETDATASOURCE name"
    ],
    relatedIds: ['net_interfaces_overview'],
    sourcedoc: 'AVEVA PML Add-ins documentation',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    id: 'd7_attribute_type_gated_assignment',
    category: 'typeconversion',
    subcategory: 'attribute_assignment',
    title: 'Type-gated attribute value assignment',
    principle: 'Before assigning an attribute value, check the attribute type (objecttype) and use the appropriate conversion method (real(), string(), dbref()).',
    rule: 'Obtain attribute value via !tagRef.attribute(!attr.name()), check objecttype(), then assign using the matching conversion method within a handle any block.',
    syntax: `!currentValue = !tagRef.attribute(!attr.name())
!valType = !currentValue.objecttype()
if (!valType eq 'REAL') then
  !tagRef.attribute(!attr.name()) = !fileVal.real()
endif
if (!valType eq 'STRING') then
  !tagRef.attribute(!attr.name()) = !fileVal.string()
endif
if (!valType eq 'DBREF') then
  !tagRef.attribute(!attr.name()) = (!fileVal).dbref()
endif`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!currentValue = !tagRef.attribute(!attr.name())
!valType = !currentValue.objecttype()
if (!valType eq 'REAL') then
  !tagRef.attribute(!attr.name()) = !fileVal.real()
  handle any
    !err = |$!tag;$!col;$!fileVal;$!!error.text|
    !issueData.append(!err.split(|;|))
  endhandle
endif`,
    exampleAntipattern: `-- Assigning without type check
!tagRef.attribute(!attr.name()) = !fileVal  -- may fail if types mismatch`,
    pitfalls: [
      'Always check objecttype() before assigning — different types need different conversion methods',
      'Wrap each type-gated assignment in handle any to catch conversion failures',
      'ARRAY type attributes should be skipped (not assigned via simple assignment)',
      'DBREF values need / prefix prepended before .dbref() conversion'
    ],
    relatedIds: ['obj_attribute_hash', 'dt_string_methods'],
    sourcedoc: 'AVEVA Engineering PML Customization',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    id: 'd7_special_char_stripping',
    category: 'datatypes',
    subcategory: 'string',
    title: 'Special character stripping from type names',
    principle: 'Strip invalid characters from element type names using iterative replace() over a character list.',
    rule: 'Define a symbol string containing all invalid characters, split into an array, iterate with DO/ENDDO, calling replace() on each symbol.',
    syntax: `!symbol = |. , - ~ * : ; _ / \\ ' " & ? ! # $ % ( )|
!symbols = !symbol.split()
!symbols.append(| |)
!symbols.append('|')
DO !symb values !symbols
  !type = !type.replace(!symb, '')
ENDDO`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!sym = |. , - ~ * : ; _ / \\ ' " & ? ! # $ % ( )|
!symList = !sym.split()
!symList.append(| |)
!symList.append('|')
DO !symb values !symList
  !typeRaw = !typeRaw.replace(!symb, '')
ENDDO
!typeRaw = !typeRaw.trim()`,
    exampleAntipattern: `-- Single replace call misses other characters
!type = !type.replace(|. , - ~|, '')  -- only removes first occurrence of the whole substring`,
    pitfalls: [
      'Must iterate over individual characters, not replace the whole string at once',
      'Trim() after stripping to remove leading/trailing whitespace',
      'The en-dash (‐) character is Unicode and must be copied exactly from source',
      'Pipe character (|) must be appended separately as it may not appear in the split'
    ],
    relatedIds: ['dt_string_methods', 'cb_mac_09_tag_cleaning'],
    sourcedoc: 'AVEVA PML String Object documentation',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    id: 'd7_savework_unclaim',
    category: 'macros',
    subcategory: 'cleanup',
    title: 'SAVEWORK and UNCLAIM ALL macro cleanup commands',
    principle: 'End Excel-driven element modification macros with SAVEWORK to commit changes and UNCLAIM ALL to release database claims.',
    rule: 'Place SAVEWORK followed by UNCLAIM ALL at the end of macros that modify elements to ensure all changes are committed and no database locks remain.',
    syntax: `SAVEWORK
UNCLAIM ALL`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!reportGrid.saveGridToExcel(!feedbackFile, |data|)

SAVEWORK
UNCLAIM ALL`,
    exampleAntipattern: `-- Missing SAVEWORK
!reportGrid.saveGridToExcel(!feedbackFile, |data|)
-- macro ends without SAVEWORK — changes may not persist`,
    pitfalls: [
      'SAVEWORK must follow the last element-modifying operation',
      'UNCLAIM ALL releases all claimed elements — do not use if you need to keep claims',
      'Both should be at the very end of the macro'
    ],
    relatedIds: ['cleanup_command'],
    sourcedoc: 'AVEVA PML Command Reference',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    id: 'd7_attribute_hash_validation',
    category: 'objects',
    subcategory: 'attribute',
    title: 'Attribute hash validation before assignment',
    principle: 'Use attribute.hash() to verify that an attribute name is valid for the target element before attempting to set its value.',
    rule: 'Create ATTRIBUTE object, check hash() > 0, then proceed with value assignment. Log errors for invalid attributes.',
    syntax: `!attr = object ATTRIBUTE(|$!col|)
if (!attr.hash() gt 0) then
  !tagRef.attribute(!attr.name()) = !fileVal
else
  !err = |Attribute [$!col] is not valid in AVEVA|
  !issueData.append(!err.split(|;|))
endif`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!attr = object ATTRIBUTE(|$!col|)
if (!attr.hash() gt 0) then
  -- proceed with assignment
else
  !err = |$!tag;$!col;$!fileVal;Attribute [$!col] is not valid in AVEVA|
  !issueData.append(!err.split(|;|))
endif`,
    exampleAntipattern: `-- No hash check before assignment
!attr = object ATTRIBUTE(|$!col|)
!tagRef.attribute(!attr.name()) = !fileVal  -- may silently fail`,
    pitfalls: [
      'hash() returns 0 for non-existent attributes — always check before assignment',
      'System attributes (prefixed with :) and UDAs both return valid hashes',
      'Empty attribute names return hash 0'
    ],
    relatedIds: ['obj_attribute_hash'],
    sourcedoc: 'AVEVA Engineering PML Customization — Attribute Class',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  }
];
