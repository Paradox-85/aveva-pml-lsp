import type { KBEntry } from 'knowledge/schemas/kb-entry';

export const kbPatches: KBEntry[] = [
  {
    id: 'macro_reload_object_command',
    category: 'macros',
    subcategory: 'object_management',
    title: 'PML RELOAD OBJECT Command',
    principle:
      'PML RELOAD OBJECT forces re-loading of an object definition before instantiation in a macro.',
    rule:
      'Use PML RELOAD OBJECT <ObjectName> at the top of a macro before creating instances of that object, especially when the object definition may have changed since the last session.',
    syntax: 'PML RELOAD OBJECT <ObjectName>',
    exampleCanonical: `-- Reload object before use
PML RELOAD OBJECT TAGMANAGEMENTTMP
!tagMgmt = object TAGMANAGEMENTTMP()`,
    exampleAntipattern: `-- Creating object without reload when definition may have changed
!tagMgmt = object TAGMANAGEMENTTMP()  -- May use stale definition`,
    pitfalls: [
      'PML RELOAD OBJECT is a command-style statement, not an object method',
      'The object must be defined in the current session or available via import',
      'Use only when necessary; unnecessary reloads can cause performance issues',
    ],
    relatedIds: ['macro_import_module', 'object_instantiation'],
    sourcedoc: 'AVEVA PML Customization Guide',
    sourcecodebase: 'JDE_data-import.pmlmac',
  },
  {
    id: 'string_format_specifier_I2',
    category: 'objects',
    subcategory: 'string_formatting',
    title: 'STRING String() with Format Specifier (I2)',
    principle:
      'STRING objects can be formatted using format specifiers passed to the String() method for consistent numeric representation.',
    rule:
      'Use !value.String(\'I2\') to format an integer or real value as a zero-padded two-character string. Format specifiers control width and padding.',
    syntax: '!value.String(\'<format_specifier>\')',
    exampleCanonical: `!dt = OBJECT DATETIME()
!year = !dt.year()
!month = !dt.month().String('I2')  -- Zero-padded: 01..12
!date = !dt.date().String('I2')    -- Zero-padded: 01..31
!hour = !dt.hour().String('I2')    -- Zero-padded: 00..23
!minute = !dt.minute().String('I2') -- Zero-padded: 00..59`,
    exampleAntipattern: `-- No formatting produces inconsistent widths
!month = !dt.month().String()  -- Returns "1" or "12"
!date = !dt.date().String()   -- Returns "5" or "31"`,
    pitfalls: [
      'Format specifiers like \'I2\' are product-specific (PDMS/E3D)',
      'I2 means integer with minimum width 2, zero-padded',
      'Not all AVEVA products support the same format specifiers',
    ],
    relatedIds: ['string_object_methods', 'datetime_object'],
    sourcedoc: 'AVEVA PML Customization Guide — Expression Formatting',
    sourcecodebase: 'JDE_data-import.pmlmac',
  },
  {
    id: 'macro_savework_keyword',
    category: 'macros',
    subcategory: 'save_operations',
    title: 'SAVEWORK Keyword in PML Macros',
    principle:
      'SAVEWORK commits pending database modifications made during macro execution.',
    rule:
      'Place SAVEWORK at the end of a macro that modifies database attributes or creates/deletes elements to ensure changes are persisted.',
    syntax: '--SAVEWORK',
    exampleCanonical: `-- Modify some attributes
:Description = |Updated by macro|
--SAVEWORK`,
    exampleAntipattern: `-- Missing SAVEWORK — changes may be lost
:Description = |Updated by macro|
-- End of macro`,
    pitfalls: [
      'SAVEWORK may be written as --SAVEWORK (commented out) for safety during testing',
      'SAVEWORK only commits changes made via DBREF attribute assignment',
      'SAVEWORK does not commit changes from external add-ins',
    ],
    relatedIds: ['macro_flow', 'dbref_attribute_assignment'],
    sourcedoc: 'AVEVA PML Customization Guide',
    sourcecodebase: 'JDE_data-import.pmlmac',
  },
  {
    id: 'datetime_object_methods',
    category: 'objects',
    subcategory: 'system_objects',
    title: 'DATETIME Object and Time Methods',
    principle:
      'The DATETIME object provides access to current date and time components for use in filenames, logging, and timestamps.',
    rule:
      'Create a DATETIME object with OBJECT DATETIME(), then use .year(), .month(), .date(), .hour(), .minute(), .second() methods to extract components.',
    syntax: `!dt = OBJECT DATETIME()
!year  = !dt.year()
!month = !dt.month()
!date  = !dt.date()
!hour  = !dt.hour()
!minute = !dt.minute()
!second = !dt.second()`,
    exampleAntipattern: `-- Using STRING concatenation for date parts produces inconsistent output
!dateStr = !month & |_| & !date  -- "1_5" vs "12_31"`,
    pitfalls: [
      'DATETIME is a PML system object, not a form member object',
      'Month values are 1-12, not 0-11',
      'Hour values are 0-23 (24-hour format)',
      'Format with String(\'I2\') for zero-padded output',
    ],
    relatedIds: ['string_format_specifier_I2', 'object_instantiation'],
    sourcedoc: 'AVEVA PML Customization Guide — System Objects',
    sourcecodebase: 'JDE_data-import.pmlmac',
  },
  {
    id: 'matchwild_function_call',
    category: 'controlflow',
    subcategory: 'string_matching',
    title: 'matchwild() Function Call for String Matching',
    principle:
      'matchwild() can be used as a standalone function to check if a string matches a wildcard pattern, returning a BOOLEAN result.',
    rule:
      'Use matchwild(!string, \'<pattern>\') to test if a string matches a wildcard pattern. Returns TRUE if matched, FALSE otherwise. Wildcards: * (any characters), ? (single character).',
    syntax: '!result = matchwild(!string, \'<pattern>\')',
    exampleCanonical: `-- Check if file is an EX data extractor file
!isEXfile = matchwild(!fileName, '*ex_data_extractor.xlsx')
if !isEXfile then
    -- Handle EX file format
endif`,
    exampleAntipattern: `-- Using MatchWild() STRING method with wrong argument order
!isEXfile = !fileName.MatchWild('*ex_data_extractor.xlsx')
-- Note: STRING.MatchWild() takes the pattern as argument, returns BOOLEAN`,
    pitfalls: [
      'matchwild() as a function is different from MatchWild() STRING method',
      'In PML1 collect expressions, matchwild appears as an operator: matchwild(attr, pattern)',
      'The function form matchwild(!var, pattern) is available in PML2',
    ],
    relatedIds: ['string_object_methods', 'pml1_vs_pml2_patterns'],
    sourcedoc: 'AVEVA PML Customization Guide — String Functions',
    sourcecodebase: 'JDE_data-import.pmlmac',
  },
  {
    id: 'using_namespace_directive',
    category: 'controlflow',
    subcategory: 'namespace_management',
    title: 'using namespace Directive for .NET Classes',
    principle:
      'The using namespace directive makes .NET classes from a managed assembly available without fully qualifying their names.',
    rule:
      'Use using namespace \'<Namespace>\' to import a .NET namespace, then reference classes directly (e.g., NETGRIDCONTROL instead of Aveva.Core.Presentation.NETGRIDCONTROL).',
    syntax: "using namespace '<Namespace>'",
    exampleCanonical: `using namespace |Aveva.Core.Presentation|
!dataTable = object NETGRIDCONTROL()
!source = object NETDATASOURCE('data', !headerList, !issueData)
!dataTable.BindToDataSource(!source)`,
    exampleAntipattern: `-- Fully qualified names are verbose
!dataTable = object Aveva.Core.Presentation.NETGRIDCONTROL()
!source = object Aveva.Core.Presentation.NETDATASOURCE(...)`,
    pitfalls: [
      'using namespace must appear in the PML code block where classes are used',
      'Different AVEVA products may expose different namespaces (Pdms.Presentation vs Core.Presentation)',
      'The GridControl module must be imported before using .NET grid classes',
    ],
    relatedIds: ['net_interfaces', 'import_module_handle_any_pattern'],
    sourcedoc: 'AVEVA PML .NET Interfaces Reference',
    sourcecodebase: 'JDE_data-import.pmlmac',
  },
  {
    id: 'netgridcontrol_core_presentation',
    category: 'objects',
    subcategory: 'net_controls',
    title: 'NETGRIDCONTROL and NETDATASOURCE with Aveva.Core.Presentation',
    principle:
      'NETGRIDCONTROL provides a data-bound grid control for displaying tabular data in PML, and NETDATASOURCE provides the data binding layer.',
    rule:
      'Create a NETGRIDCONTROL object, call clearGrid(), create a NETDATASOURCE with column headers and data array, bind via BindToDataSource(), then optionally save to Excel via saveGridToExcel().',
    syntax: `using namespace |Aveva.Core.Presentation|
!grid = object NETGRIDCONTROL()
!grid.clearGrid()
!source = object NETDATASOURCE('data', !headers, !data)
!grid.BindToDataSource(!source)
!grid.saveGridToExcel(!filename)`,
    exampleAntipattern: `-- Missing clearGrid() may leave stale data
!grid = object NETGRIDCONTROL()
!source = object NETDATASOURCE('data', !headers, !data)
!grid.BindToDataSource(!source)  -- Old data may persist`,
    pitfalls: [
      'NETGRIDCONTROL requires the GridControl module to be imported',
      'NETDATASOURCE constructor signature varies by AVEVA product version',
      'saveGridToExcel() may not be available in all AVEVA products',
      'Use Aveva.Core.Presentation or Aveva.Pdms.Presentation depending on product',
    ],
    relatedIds: ['using_namespace_directive', 'import_module_handle_any_pattern'],
    sourcedoc: 'AVEVA PML .NET Interfaces Reference',
    sourcecodebase: 'JDE_data-import.pmlmac',
  },
  {
    id: 'import_module_handle_any_pattern',
    category: 'macros',
    subcategory: 'module_loading',
    title: 'import Module with handle any/endhandle Pattern',
    principle:
      'The import statement loads external PML modules/add-ins. Combined with handle any/endhandle, it provides error-tolerant module loading.',
    rule:
      'Use import \'ModuleName\' followed by handle any/endhandle to gracefully handle missing modules without crashing the macro.',
    syntax: `import '<ModuleName>'
handle any
endhandle`,
    exampleCanonical: `import 'GridControl'
handle any
endhandle

import 'RamPMLExcelReader'
handle any
endhandle`,
    exampleAntipattern: `-- No error handling — missing module crashes macro
import 'GridControl'
-- Macro crashes if GridControl is not available`,
    pitfalls: [
      'handle any absorbs all errors from the import, so the module may fail silently',
      'Verify module availability before using its classes/methods',
      'handle any/endhandle can be replaced with specific error handling if needed',
    ],
    relatedIds: ['net_interfaces', 'macro_flow'],
    sourcedoc: 'AVEVA PML Customization Guide — Module Loading',
    sourcecodebase: 'JDE_data-import.pmlmac',
  },
];
