/**
 * KB Patch for mac_07 — JDE_BI_tagRegister-export.pmlmac
 * Generated: 2026-06-03
 * Source: docs/codebase/macros/JDE_BI_tagRegister-export.pmlmac
 * 
 * Adds 6 KB entries identified in gap analysis (D7).
 */

import type { KBEntry } from '../knowledge/schemas/kb-entry';

export const mac_07_kb_patches: KBEntry[] = [
  {
    id: 'kb-mac07-001',
    alias: 'RAMCOMMONLOGGER',
    title: 'RAMCOMMONLOGGER Logging Object',
    category: 'add-in-objects',
    language: 'pml2',
    source: 'docs/codebase/macros/JDE_BI_tagRegister-export.pmlmac',
    description: 'Custom logging object for collecting error data and writing to Excel. Used in Power BI export macros.',
    code: `!!ramCommonLogger = object RAMCOMMONLOGGER()
!headings = |Tag Name;Attribute Name;Error Text|
!!ramCommonLogger.addHeading(!headings.split(|;|))
!!ramCommonLogger.writeErrorDataToExcel(!logFile, false)`,
    methods: [
      { name: 'addHeading(ARRAY headers)', result: 'VOID', purpose: 'Register column headings for error log output' },
      { name: 'writeErrorDataToExcel(STRING filePath, BOOLEAN overwrite)', result: 'VOID', purpose: 'Write collected error data to an Excel file' }
    ],
    tags: ['logging', 'error-handling', 'excel-export', 'add-in'],
    relatedEntries: [],
    priority: 'HIGH',
    notes: 'External/custom add-in object. Not available in core PML.'
  },
  {
    id: 'kb-mac07-002',
    alias: 'PMLTAGS.exportasxls',
    title: 'PMLTAGS.exportasxls Method',
    category: 'engineering-objects',
    language: 'pml2',
    source: 'docs/codebase/macros/JDE_BI_tagRegister-export.pmlmac',
    description: 'Exports tag/list data to an Excel file. Used with LSTDEF grid references.',
    code: `!!tags = object PMLTAGS()
var !gridGroupName CATNAM of LSTGRP of $!gridRef
!!tags.exportasxls(!gridGroupName, '$!<gridRef.LSTNAM>', '$!filepath')`,
    methods: [
      { name: 'exportasxls(STRING gridGroupName, STRING listName, STRING filePath)', result: 'VOID', purpose: 'Export grid data to Excel file' }
    ],
    tags: ['export', 'excel', 'PMLTAGS', 'list-definition'],
    relatedEntries: ['kb-mac07-003'],
    priority: 'MEDIUM',
    notes: 'Part of Aveva.Engineering.Tags namespace.'
  },
  {
    id: 'kb-mac07-003',
    alias: 'jacExportRDLDataReport',
    title: 'jacExportRDLDataReport Custom Function',
    category: 'custom-functions',
    language: 'pml2',
    source: 'docs/codebase/macros/JDE_BI_tagRegister-export.pmlmac',
    description: 'Custom function for exporting RDL tag properties data with filtering and data sanitization.',
    code: `!!jacExportRDLDataReport(!filePath, !rdlFilter, !tagFilter, !emptyPatternList, !replaceData, !isDisplayEmpty)`,
    methods: [
      { name: 'jacExportRDLDataReport(STRING filePath, STRING rdlFilter, STRING tagFilter, ARRAY emptyPatternList, ARRAY replaceData, BOOLEAN isDisplayEmpty)', result: 'VOID', purpose: 'Export RDL tag properties with filters' }
    ],
    tags: ['custom', 'RDL', 'export', 'tag-properties'],
    relatedEntries: ['kb-mac07-002', 'kb-mac07-004'],
    priority: 'MEDIUM',
    notes: 'External/custom function. Likely defined in a shared PML function file.'
  },
  {
    id: 'kb-mac07-004',
    alias: 'jacExportRDLDataReportMatrix',
    title: 'jacExportRDLDataReportMatrix Custom Function',
    category: 'custom-functions',
    language: 'pml2',
    source: 'docs/codebase/macros/JDE_BI_tagRegister-export.pmlmac',
    description: 'Custom function for exporting RDL tag properties in matrix format with common attribute mappings.',
    code: `!!jacExportRDLDataReportMatrix(!filePathRam, !rdlFilter, !tagFilter, !emptyPatternList, !commonAttributes, !replaceData, false)`,
    methods: [
      { name: 'jacExportRDLDataReportMatrix(STRING filePath, STRING rdlFilter, STRING tagFilter, ARRAY emptyPatternList, ARRAY commonAttributes, ARRAY replaceData, BOOLEAN isErrorReport)', result: 'VOID', purpose: 'Export RDL tag properties in matrix format' }
    ],
    tags: ['custom', 'RDL', 'export', 'matrix', 'tag-properties'],
    relatedEntries: ['kb-mac07-002', 'kb-mac07-003'],
    priority: 'MEDIUM',
    notes: 'Extends jacExportRDLDataReport with commonAttributes parameter.'
  },
  {
    id: 'kb-mac07-005',
    alias: 'MEASURE.UNIT.objects',
    title: 'MEASURE and UNIT Objects',
    category: 'engineering-objects',
    language: 'pml2',
    source: 'docs/codebase/macros/JDE_BI_tagRegister-export.pmlmac',
    description: 'Objects for unit management in AVEVA Engineering. MEASURE creates a dimension, UNIT creates a unit reference, setunits() assigns the unit to the dimension.',
    code: `!AngularFrequencyDimension = object MEASURE('AngularFrequency')
!rpmUnit = object UNIT(|rpm|)
!AngularFrequencyDimension.setunits(!rpmUnit)`,
    methods: [
      { name: 'MEASURE(STRING dimensionName)', result: 'MEASURE', purpose: 'Create a measure/dimension object' },
      { name: 'UNIT(STRING unitName)', result: 'UNIT', purpose: 'Create a unit reference object' },
      { name: 'setunits(UNIT unit)', result: 'VOID', purpose: 'Assign a unit to the measure dimension' }
    ],
    tags: ['units', 'MEASURE', 'UNIT', 'engineering'],
    relatedEntries: [],
    priority: 'LOW',
    notes: 'Part of Aveva.Engineering.Tags namespace.'
  },
  {
    id: 'kb-mac07-006',
    alias: 'DATETIME.component-extraction',
    title: 'DATETIME Component Extraction',
    category: 'system-objects',
    language: 'pml2',
    source: 'docs/codebase/macros/JDE_BI_tagRegister-export.pmlmac',
    description: 'DATETIME object methods for extracting date/time components. Commonly chained with .string() for formatting.',
    code: `!dt = OBJECT DATETIME()
!year = !dt.year()
!month = !dt.month().string('I2')
!date = !dt.date().string('I2')
!hour = !dt.hour().string('I2')
!minute = !dt.minute().string('I2')`,
    methods: [
      { name: 'year()', result: 'INTEGER', purpose: 'Return the year component' },
      { name: 'month()', result: 'INTEGER', purpose: 'Return the month component' },
      { name: 'date()', result: 'INTEGER', purpose: 'Return the day component' },
      { name: 'hour()', result: 'INTEGER', purpose: 'Return the hour component' },
      { name: 'minute()', result: 'INTEGER', purpose: 'Return the minute component' }
    ],
    tags: ['datetime', 'timestamp', 'date', 'time'],
    relatedEntries: [],
    priority: 'LOW',
    notes: 'Standard DATETIME object from Aveva.Core.Presentation namespace.'
  }
];
