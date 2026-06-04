import { KBEntry, normalizeCategory } from '../../../../src/knowledge/schemas/kb-entry';

/**
 * KB Patch for frm_03 (ramCommonLoggerForm.pmlfrm)
 * 
 * Adds 4 new KB entries discovered during gap analysis:
 * 1. NETDATASOURCE with 'Collection List' data type
 * 2. NETGRIDCONTROL.fixedRows() method
 * 3. NETGRIDCONTROL.rowAddDeleteGrid() method
 * 4. form-size anchor positioning keyword
 */

export const frm_03_kb_patch: KBEntry[] = [
  {
    id: 'netdatasource_collection_list_type',
    category: normalizeCategory('objects'),
    subcategory: 'NETDATASOURCE',
    title: "NETDATASOURCE with 'Collection List' data type",
    principle: "NETDATASOURCE supports multiple data type strings including 'Collection List' for generic collection-based data binding.",
    rule: "Use 'Collection List' as the first argument to NETDATASOURCE when binding generic array-based data that is not a PDMS database query.",
    syntax: "!nds = object NETDATASOURCE('Collection List', !headings, !rows)",
    exampleCanonical: `-- CB ramCommonLoggerForm.pmlfrm
define method .loadGrid()
  !headings = !!ramCommonLogger.getValidHeadingArrayFormat()
  !rows = !!ramCommonLogger.getValidLogArrayFormat()
  !nds = object NETDATASOURCE('Collection List', !headings, !rows)
  !this.gridLogList.bindToDataSource(!nds)
  !this.gridLogList.autoFitColumns()
endmethod`,
    exampleAntipattern: '',
    pitfalls: [
      "Using 'Collection List' with PDMS database queries will fail — use 'Piping', 'CABLE', etc. for DB queries.",
      "The !rows array must be an array of arrays (each inner array is a row)."
    ],
    relatedIds: ['netdatasource_grid_drawings_type', 'netdatasource_piping_type'],
    sourcedoc: 'AVEVA E3D Design Customization Guide - PML .NET Objects',
    sourcecodebase: 'ramCommonLoggerForm.pmlfrm'
  },
  {
    id: 'netgridcontrol_fixedRows_method',
    category: normalizeCategory('objects'),
    subcategory: 'NETGRIDCONTROL',
    title: 'NETGRIDCONTROL.fixedRows() method',
    principle: 'The fixedRows() method pins the header rows so they remain visible during vertical scrolling.',
    rule: 'Call !grid.fixedRows(true) to keep column headers fixed at the top of the grid.',
    syntax: '!grid.fixedRows(true)',
    exampleCanonical: `-- CB ramCommonLoggerForm.pmlfrm
!this.gridLogList.fixedRows(true)`,
    exampleAntipattern: '',
    pitfalls: [
      'fixedRows() should be set before bindToDataSource() for reliable behavior.',
      'This is distinct from fixedHeaders() — fixedRows pins data rows, fixedHeaders pins header rows.'
    ],
    relatedIds: ['netgridcontrol_columnExcelFilter_method', 'netgridcontrol_editableGrid_method'],
    sourcedoc: 'AVEVA E3D Design Customization Guide - PML .NET Objects',
    sourcecodebase: 'ramCommonLoggerForm.pmlfrm'
  },
  {
    id: 'netgridcontrol_rowAddDeleteGrid_method',
    category: normalizeCategory('objects'),
    subcategory: 'NETGRIDCONTROL',
    title: 'NETGRIDCONTROL.rowAddDeleteGrid() method',
    principle: 'The rowAddDeleteGrid() method enables inline row addition and deletion in the grid.',
    rule: 'Call !grid.rowAddDeleteGrid(true) to allow users to add/remove rows directly in the grid UI.',
    syntax: '!grid.rowAddDeleteGrid(true)',
    exampleCanonical: `-- CB ramCommonLoggerForm.pmlfrm
!this.gridLogList.rowAddDeleteGrid(true)
!this.gridLogList.editableGrid(false)`,
    exampleAntipattern: '',
    pitfalls: [
      'rowAddDeleteGrid(true) allows row insertion/deletion but does NOT make cell values editable — combine with editableGrid(false) to prevent cell editing while allowing row operations.',
      'This method is specific to NETGRIDCONTROL and not available on standard grid types.'
    ],
    relatedIds: ['netgridcontrol_editableGrid_method', 'netgridcontrol_fixedRows_method'],
    sourcedoc: 'AVEVA E3D Design Customization Guide - PML .NET Objects',
    sourcecodebase: 'ramCommonLoggerForm.pmlfrm'
  },
  {
    id: 'form_anchor_form_size_keyword',
    category: normalizeCategory('ui'),
    subcategory: 'form_layout',
    title: 'form-size anchor positioning keyword',
    principle: "The 'form-size' keyword in anchor positioning references the full form dimensions, equivalent to the form's client area bounds.",
    rule: "Use 'form-size' instead of ad-hoc expressions like 'form+1' for reliable form-relative positioning.",
    syntax: "anchor all at xmin form-size ymax+0.5",
    exampleCanonical: `-- CB ramCommonLoggerForm.pmlfrm
frame .frLogList anchor all at xmin form-size ymax+0.5 width 60 height 10
button .buExport anchor l+b at xmin form-size ymax+0.5 WIDTH 10`,
    exampleAntipattern: `anchor all at xmin form+1 ymax+0.5
-- 'form+1' is non-standard and may behave unpredictably across PML versions.`,
    pitfalls: [
      "form-size represents the form's client area, not the full window including title bar.",
      "Do not mix form-size with numeric offsets without testing — form-size already accounts for form dimensions."
    ],
    relatedIds: ['form_anchor_keywords', 'form_gadget_positioning'],
    sourcedoc: 'AVEVA E3D Design Customization Guide - Form Gadgets',
    sourcecodebase: 'ramCommonLoggerForm.pmlfrm'
  }
];
