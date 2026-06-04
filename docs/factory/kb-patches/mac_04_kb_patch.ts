// Auto-generated KB patch draft from docs/factory gap analysis.
// Source: docs/codebase/macros/EIS_data_export.pmlmac
// Status: draft only. Do not apply automatically.

export const mac04KbPatchDraft = [
  {
    id: 'engineering-tags-rdl-export-wrapper',
    category: 'patterns',
    subcategory: 'engineering-tags-export',
    title: 'RDL-driven Engineering Tags export wrapper',
    principle: 'Engineering tag export macros may delegate domain-specific extraction to custom global routines that accept output path, RDL filter, tag filter, empty patterns, replacement rules, and display flags.',
    rule: 'Document the wrapper signature and preserve filter/list arguments when generating benchmark macros; do not replace the wrapper with generic COLLECTION/XLS logic unless the wrapper is unavailable by task scope.',
    syntax: '!!jacExportRDLDataReport(!filePath, !rdlFilter, !tagFilter, !emptyPatternList, !replaceData, !isDisplayEmpty)',
    exampleCanonical: `-- CB EIS_data_export.pmlmac
!rdlFilter = |(:RDLSource eq 'SOURCE_A' or :RDLSource eq 'SOURCE_B')|
!tagFilter = ':TagStatus inset (|ACTIVE|, |ASB|, |AFC|, |AFD|) and ISNAMED'
!isDisplayEmpty = true
!!jacExportRDLDataReport(!filePath, !rdlFilter, !tagFilter, !emptyPatternList, !replaceData, !isDisplayEmpty)`,
    pitfalls: ['Dropping emptyPatternList or replaceData changes exported data semantics', 'Replacing custom RDL wrappers with generic COLLECTION queries loses RDL template behavior'],
    sourcecodebase: 'EIS_data_export.pmlmac'
  },
  {
    id: 'engineering-tags-common-attribute-map',
    category: 'patterns',
    subcategory: 'attribute-mapping',
    title: 'Two-column Engineering Tags attribute map',
    principle: 'Export macros can use a two-dimensional ARRAY where each row maps an AVEVA attribute expression to a display column header.',
    syntax: "!commonAttributes = OBJECT ARRAY()\n!commonAttributes[1][1] = ':AttributeName'\n!commonAttributes[1][2] = 'Column Header'",
    sourcecodebase: 'EIS_data_export.pmlmac'
  },
  {
    id: 'export-data-sentinel-replacement-list',
    category: 'patterns',
    subcategory: 'data-cleaning',
    title: 'Sentinel replacement list for Excel export normalization',
    principle: 'Engineering exports often pass an ARRAY of semicolon-delimited source/replacement strings to normalize unset, invalid, or placeholder values.',
    syntax: "!replaceData = OBJECT ARRAY()\n!replaceData.Append('source;replacement')",
    sourcecodebase: 'EIS_data_export.pmlmac'
  },
  {
    id: 'measure-unit-setunits-defaults',
    category: 'syntax',
    subcategory: 'units',
    title: 'MEASURE and UNIT objects with setunits',
    principle: 'PML macros can set default units for a measure by constructing MEASURE and UNIT objects and calling setunits.',
    syntax: "!dimension = OBJECT MEASURE('AngularFrequency')\n!unit = OBJECT UNIT(|rpm|)\n!dimension.setunits(!unit)",
    sourcecodebase: 'EIS_data_export.pmlmac'
  },
  {
    id: 'macro-error-label-savework-unclaim',
    category: 'syntax',
    subcategory: 'error-handling',
    title: 'Macro error label with workbook/save and claim cleanup',
    principle: 'Operational macros may define a LABEL target containing HANDLE ANY logic that logs errors and performs SAVEWORK/UNCLAIM cleanup.',
    syntax: 'LABEL /Error\nHANDLE ANY\n  !!logger.writeErrorDataToExcel(!logFile, false)\n  SAVEWORK\n  UNCLAIM ALL\nENDHANDLE',
    sourcecodebase: 'EIS_data_export.pmlmac'
  }
] as const;
