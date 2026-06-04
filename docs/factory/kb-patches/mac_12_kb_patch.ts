import { KBEntry, KBCategory, normalizeCategory } from '../../src/knowledge/schemas/kb-entry';

export const mac_12_kb_patches: KBEntry[] = [
  {
    id: 'pdms_namn_attribute',
    category: normalizeCategory('pdmsinteraction'),
    subcategory: 'attributes',
    title: 'namn — PDMS object name pseudo-attribute',
    principle: 'The "namn" pseudo-attribute returns the PDMS name of an object. It is accessed as "namn of $!ref" or via substitute expression "$!ref.namn".',
    rule: 'Use "var !name namn of $!ref" or "$!ref.namn" in pipe strings. Alias for "name" in some PDMS versions.',
    syntax: 'var !name namn of $!objectRef',
    exampleCanonical: `-- CB EBA_full_tag_export.pmlmac
var !itemRef = !item.dbref()
!name = $!<itemRef.namn>`,
    exampleAntipattern: '',
    pitfalls: [
      '"namn" is a PDMS-specific spelling; E3D may use "name" instead. Use "$!ref.namn" for maximum compatibility.',
    ],
    relatedIds: ['pdms_dtxr_attribute', 'pdms_isnamed_filter'],
    sourcedoc: 'AVEVA E3D/PDMS Attribute Reference',
    sourcecodebase: 'EBA_full_tag_export.pmlmac',
  },
  {
    id: 'pdms_dtxr_attribute',
    category: normalizeCategory('pdmsinteraction'),
    subcategory: 'attributes',
    title: 'dtxr — PDMS description-text pseudo-attribute',
    principle: 'The "dtxr" pseudo-attribute returns the description text of a PDMS object. Used as a fallback when "desc" is unavailable.',
    rule: 'Use "var !desc dtxr of $!ref" to retrieve the description text. Typically used as a fallback after "desc of $!ref" fails.',
    syntax: 'var !desc dtxr of $!objectRef',
    exampleCanonical: `-- CB EBA_full_tag_export.pmlmac
var !desc desc of $!item
handle any
    var !desc dtxr of $!item
endhandle`,
    exampleAntipattern: '',
    pitfalls: [
      '"dtxr" may be empty if no description is set. Always check UNSET before using.',
    ],
    relatedIds: ['pdms_namn_attribute', 'pdms_desc_attribute'],
    sourcedoc: 'AVEVA E3D/PDMS Attribute Reference',
    sourcecodebase: 'EBA_full_tag_export.pmlmac',
  },
  {
    id: 'dotnet_gridcontrol_export',
    category: normalizeCategory('dotnetinterop'),
    subcategory: 'GridControl',
    title: 'GridControl .NET add-in for Excel export',
    principle: 'The GridControl add-in provides NETGRIDCONTROL and NETDATASOURCE objects for building tabular data and exporting to Excel.',
    rule: 'Import GridControl, use "handle any" for the import, create NETDATASOURCE with header/data arrays, bind to NETGRIDCONTROL, then call saveGridToExcel().',
    syntax: `import 'GridControl'
handle any
endhandle
!source = object NETDATASOURCE('data', !headers, !data)
!grid = object NETGRIDCONTROL()
!grid.BindToDataSource(!source)
!grid.saveGridToExcel(!path)`,
    exampleCanonical: `-- CB EBA_full_tag_export.pmlmac
using namespace |Aveva.Core.Presentation|
!dataTable = object NETGRIDCONTROL()
!dataTable.clearGrid()
!source = object NETDATASOURCE('data', !headerList, !dataList)
!dataTable.BindToDataSource(!source)
!dataTable.saveGridToExcel(|$!<publishPath>$!<dataFileName>|)`,
    exampleAntipattern: '',
    pitfalls: [
      "NETDATASOURCE 'data' mode requires header array as second argument.",
      'saveGridToExcel accepts a full file path including extension.',
      "Namespace may be 'Aveva.Core.Presentation' or 'Aveva.Pdms.Presentation' depending on E3D version.",
    ],
    relatedIds: ['dotnet_namespace_using', 'dotnet_object_construction'],
    sourcedoc: 'AVEVA E3D .NET Add-in Reference',
    sourcecodebase: 'EBA_full_tag_export.pmlmac',
  },
  {
    id: 'pdms_collect_all_multi_class',
    category: normalizeCategory('pdmsinteraction'),
    subcategory: 'queries',
    title: 'collect all with multiple PDMS class names and filters',
    principle: 'The "collect all" query can target multiple PDMS class names in one expression, optionally with a filter clause.',
    rule: 'Use "var !items collect all (CLASS1 CLASS2 CLASS3) with (FILTER)" to collect objects across multiple types in a single query.',
    syntax: 'var !items collect all (CLASS_A CLASS_B) with (EXPRESSION)',
    exampleCanonical: `-- CB EBA_full_tag_export.pmlmac
var !items collect all (EQUI SUBE STRUC FRMW SBFR PIPE HVAC CWAY SUPPO BRAN MEM) with (ISNAMED)`,
    exampleAntipattern: '',
    pitfalls: [
      'ISNAMED filter excludes unnamed objects.',
      'Large class sets can be slow; consider restricting scope with site/zone filters.',
    ],
    relatedIds: ['pdms_namn_attribute', 'pdms_isnamed_filter'],
    sourcedoc: 'AVEVA E3D/PDMS Query Reference',
    sourcecodebase: 'EBA_full_tag_export.pmlmac',
  },
  {
    id: 'macro_finish_directive',
    category: normalizeCategory('macros'),
    subcategory: 'lifecycle',
    title: 'FINISH directive — macro termination',
    principle: 'The FINISH directive explicitly terminates a PML macro execution and returns control to the calling context.',
    rule: 'Place FINISH at the end of a macro to signal clean completion. Equivalent to implicit end-of-file termination but makes intent explicit.',
    syntax: 'FINISH',
    exampleCanonical: `-- CB EBA_full_tag_export.pmlmac
!dataTable.saveGridToExcel(|$!<publishPath>$!<dataFileName>|)

FINISH`,
    exampleAntipattern: '',
    pitfalls: [
      'FINISH in a macro is optional — the macro ends at EOF. Use it to clarify intent.',
    ],
    relatedIds: ['macro_import_handle'],
    sourcedoc: 'AVEVA E3D PML Macros Reference',
    sourcecodebase: 'EBA_full_tag_export.pmlmac',
  },
];
