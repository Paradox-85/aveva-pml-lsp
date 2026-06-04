import { KBEntry, KBCategory, normalizeCategory } from '../../src/knowledge/schemas/kb-entry';

export const mac_03_kb_patches: KBEntry[] = [
  {
    id: 'macro_setdate_stamp',
    category: normalizeCategory('datetime'),
    subcategory: 'SetDate',
    title: 'SetDate of dbref — extract date from STAMP',
    principle: 'Use SetDate of dbref to extract a date value from a STAMP element.',
    rule: 'VAR !date SetDate of $!stampVar',
    syntax: 'VAR !resultVar SetDate of $!dbref',
    exampleCanonical: `-- CB mac_03
!latestStamp = !stamps.first()
var !stampDate SetDate of $!latestStamp`,
    exampleAntipattern: '',
    pitfalls: [
      'STAMP must be a valid dbref; otherwise SetDate returns UNSET',
    ],
    relatedIds: ['dt_datetime_object'],
    sourcedoc: 'AVEVA Engineering PML Reference',
    sourcecodebase: 'EBE_delta_tag_export.pmlmac',
  },
  {
    id: 'pdms_old_qualifier',
    category: normalizeCategory('pdmsinteraction'),
    subcategory: 'OLD',
    title: 'OLD attribute qualifier for deleted element values',
    principle: 'Use OLD qualifier to retrieve the value of an attribute before an element was deleted.',
    rule: 'VAR !val OLD $!attribute of $!dbref',
    syntax: 'OLD <attribute_expression> of <dbref>',
    exampleCanonical: `-- CB mac_03
if (!action eq |DELETE|) then
  !evaluate = |var !val OLD $!expression of $!tag|
endif
$!<evaluate>`,
    exampleAntipattern: '',
    pitfalls: [
      'OLD qualifier only works for deleted elements; using it on existing elements may fail',
      'Must use dynamic $! evaluation to pass attribute name at runtime',
    ],
    relatedIds: ['pdms_dbref_access'],
    sourcedoc: 'AVEVA Engineering Database Interface',
    sourcecodebase: 'EBE_delta_tag_export.pmlmac',
  },
  {
    id: 'pdms_setcompdate',
    category: normalizeCategory('pdmsinteraction'),
    subcategory: 'comparison',
    title: 'SETCOMPDATE command — set database comparison date',
    principle: 'SETCOMPDATE sets the comparison date for database queries, enabling delta detection.',
    rule: 'SETCOMPDATE FOR DB $!dbName to $!stampDate',
    syntax: 'SETCOMPDATE FOR DB <dbname> to <datetime>',
    exampleCanonical: `-- CB mac_03
var !stampDate SetDate of $!latestStamp
SETCOMPDATE FOR DB $!dbName to $!stampDate`,
    exampleAntipattern: '',
    pitfalls: [
      'Must set comparison date before collecting modified/deleted/created elements',
      'Date must be a valid STAMP date',
    ],
    relatedIds: ['macro_setdate_stamp', 'collections_collection_filter'],
    sourcedoc: 'AVEVA Engineering PML Reference',
    sourcecodebase: 'EBE_delta_tag_export.pmlmac',
  },
  {
    id: 'objects_pmltags',
    category: normalizeCategory('objects'),
    subcategory: 'PMLTAGS',
    title: 'PMLTAGS object and GetListDefinition method',
    principle: 'PMLTAGS is a system object providing access to tag list definitions and database views.',
    rule: '!!tags = object PMLTAGS()\n!gridDef = !!tags.GetListDefinition(!catName, !listName)\n!viewName = !gridDef.DbViewName()',
    syntax: 'PMLTAGS.GetListDefinition(category, listName) → DBREF',
    exampleCanonical: `-- CB mac_03
!!tags = object PMLTAGS()
!gridDef = !!tags.GetListDefinition('EQUINOR_TR3111_V7', !listName)
!sourceDbView = !gridDef.DbViewName()`,
    exampleAntipattern: '',
    pitfalls: [
      'Category name must match exactly; case-sensitive',
      'List name must exist in the specified category',
    ],
    relatedIds: ['pdms_dbref_access'],
    sourcedoc: 'AVEVA Engineering Tags API',
    sourcecodebase: 'EBE_delta_tag_export.pmlmac',
  },
  {
    id: 'dotnet_netdatasource',
    category: normalizeCategory('dotnetinterop'),
    subcategory: 'NetDataSource',
    title: 'NetDataSource .NET object for grid data binding',
    principle: 'NetDataSource creates a .NET data source from PML arrays for binding to grid controls.',
    rule: '!source = object NetDataSource(name, headers, data)\n!grid.BindToDataSource(!source)',
    syntax: 'NetDataSource(STRING name, ARRAY headers, ARRAY data)',
    exampleCanonical: `-- CB mac_03
!source = object NetDataSource('$!<gridName>', !headerList, !dataList)
!dataTable.clearGrid()
!dataTable.BindToDataSource(!source)`,
    exampleAntipattern: '',
    pitfalls: [
      'headers must be ARRAY of STRING',
      'data must be ARRAY of ARRAY (rows)',
      'namespace must be Aveva.Core.Presentation',
    ],
    relatedIds: ['ui_netgridcontrol'],
    sourcedoc: 'AVEVA Core Presentation API',
    sourcecodebase: 'EBE_delta_tag_export.pmlmac',
  },
  {
    id: 'ui_netgridcontrol_export',
    category: normalizeCategory('ui'),
    subcategory: 'NETGRIDCONTROL',
    title: 'NETGRIDCONTROL saveGridToExcel method',
    principle: 'NETGRIDCONTROL.saveGridToExcel exports the bound grid to an Excel file.',
    rule: '!grid.saveGridToExcel(path, format, description)',
    syntax: 'saveGridToExcel(STRING path, STRING format, STRING description)',
    exampleCanonical: `-- CB mac_03
!dataTable.saveGridToExcel('|$!publishPath$!dataFileName|', |data|, |Export delta. Author: $!<userName> Date: $!<startDateTime> Comparison Date: $!<stampDate>|)`,
    exampleAntipattern: '',
    pitfalls: [
      'Path must include file extension (.xlsx)',
      'Format parameter determines Excel export format',
    ],
    relatedIds: ['dotnet_netdatasource', 'ui_netgridcontrol_basic'],
    sourcedoc: 'AVEVA Core Presentation API',
    sourcecodebase: 'EBE_delta_tag_export.pmlmac',
  },
  {
    id: 'errorhandling_elsehandle_none',
    category: normalizeCategory('errorhandling'),
    subcategory: 'elsehandle',
    title: 'elsehandle none — empty elsehandle as no-op',
    principle: 'elsehandle none is a valid empty handler that explicitly marks a block with no error recovery.',
    rule: 'handle any\n  -- error handling code\nelsehandle none\n  -- success path, no error handler needed\nendhandle',
    syntax: 'elsehandle none',
    exampleCanonical: `-- CB mac_03
$!<evaluate>
handle any
  !rowDataList.append(!!error.text)
elsehandle none
  !rowDataList.append(!val)
endhandle`,
    exampleAntipattern: 'handle any\n  -- nothing\nendhandle  -- missing elsehandle; implicit no-op but less explicit',
    pitfalls: [
      'elsehandle none is optional; omitting it is equivalent but less explicit',
      'Do not confuse with missing elsehandle entirely in nested blocks',
    ],
    relatedIds: ['errorhandling_handle_any'],
    sourcedoc: 'AVEVA PML Customization Guide',
    sourcecodebase: 'EBE_delta_tag_export.pmlmac',
  },
  {
    id: 'arrays_findfirst_set_membership',
    category: normalizeCategory('arrays'),
    subcategory: 'FindFirst',
    title: 'ARRAY.findFirst().set() pattern for membership testing',
    principle: 'Use findFirst() combined with .set() to test whether a value exists in an array.',
    rule: 'if (!array.findFirst(!value).set()) then ... endif',
    syntax: 'if (!<array>.findFirst(<value>).set()) then',
    exampleCanonical: `-- CB mac_03
if (!deletedTags.findfirst(!tag).set()) then
  !action = |DELETE|
elseif (!createdTags.findfirst(!tag).set()) then
  !action = |NEW|
endif`,
    exampleAntipattern: 'if (!deletedTags.findFirst(!tag) neq UNSET) then  -- less idiomatic',
    pitfalls: [
      'findFirst returns UNSET if not found; .set() checks for valid result',
      'Must use lowercase findfirst in some PML versions; check case sensitivity',
    ],
    relatedIds: ['arrays_findFirst', 'arrays_sortUnique'],
    sourcedoc: 'AVEVA PML Array Reference',
    sourcecodebase: 'EBE_delta_tag_export.pmlmac',
  },
];
