/**
 * KB Patch for mac_44 — RAMBiReportExport.pmlmac
 * Generated: 2026-06-03
 *
 * Adds 4 new KBEntry objects identified in gap analysis:
 *   1. PMLTAGS object (exportasxls)
 *   2. RAMCOMMONLOGGER custom logging object
 *   3. MEASURE/UNIT objects for unit conversion
 *   4. LSTDEF collection query pattern (PML1)
 */

import { KBEntry, KBCategory, normalizeCategory } from '../../../../src/knowledge/schemas/kb-entry';

export const mac44KBEntries: KBEntry[] = [
  {
    id: 'obj_ptmltags_export',
    category: 'objects',
    subcategory: 'PMLTAGS',
    title: 'PMLTAGS Object for Engineering Tag Export',
    principle: 'PMLTAGS is a system object providing methods to export engineering tag data to XLSX format via GridControl integration.',
    rule: "Create via object PMLTAGS(), then call exportasxls(groupName, listName, filePath) to export a list definition's data.",
    syntax: '!!tags = object PMLTAGS()\n!!tags.exportasxls(!groupName, !listName, !filePath)',
    exampleCanonical: `-- CB RAMBiReportExport.pmlmac
!!tags = object PMLTAGS()
!!tags.exportasxls(!gridGroupName, '$!<gridRef.LSTNAM>', '$!filepath')`,
    exampleAntipattern: `!tags = PMLTAGS()  -- missing OBJECT keyword
!!tags.exportxls(...)  -- wrong method name`,
    pitfalls: [
      'Must use OBJECT keyword before PMLTAGS()',
      "exportasxls requires valid LSTDEF groupName, listName, and writable file path",
      'File path must include .xlsx extension for correct export format'
    ],
    relatedIds: ['obj_collection_scope', 'obj_gridcontrol_export'],
    sourcedoc: 'AVEVA Engineering PML Add-ins documentation',
    sourcecodebase: 'RAMBiReportExport.pmlmac'
  },
  {
    id: 'obj_ramcommonlogger',
    category: 'objects',
    subcategory: 'custom-logging',
    title: 'RAMCOMMONLOGGER Custom Error Logger Object',
    principle: 'RAMCOMMONLOGGER is a project-specific PML object for logging macro errors and warnings to Excel files.',
    rule: "Create via object RAMCOMMONLOGGER(), use addHeading() to set column headers, writeErrorDataToExcel() to dump log data.",
    syntax: "!!ramCommonLogger = object RAMCOMMONLOGGER()\n!!ramCommonLogger.addHeading(!headings)\n!!ramCommonLogger.writeErrorDataToExcel(!logFile, false)",
    exampleCanonical: `-- CB JDE_BI_tagRegister-export.pmlmac
!!ramCommonLogger = object RAMCOMMONLOGGER()
!headings = |Tag Name;Attribute Name;Error Text|
!!ramCommonLogger.addHeading(!headings.split(|;|))`,
    exampleAntipattern: `!rc = object RAMCOMMONLOGGER()  -- use !! for global
!!ramCommonLogger.writeErrorDataToExcel(!logFile, true)  -- second arg is append flag`,
    pitfalls: [
      'Must be declared as global (!!) for cross-method access',
      'addHeading expects semicolon-separated string that is split()',
      'writeErrorDataToExcel second parameter controls append mode'
    ],
    relatedIds: ['log_error_handling_basic'],
    sourcedoc: 'Ramboll Jackdaw project macros',
    sourcecodebase: 'JDE_BI_tagRegister-export.pmlmac'
  },
  {
    id: 'obj_measure_unit',
    category: 'objects',
    subcategory: 'measure-unit',
    title: 'MEASURE and UNIT Objects for Unit Conversion',
    principle: 'MEASURE and UNIT are PML system objects for working with engineering units and conversions.',
    rule: "Create MEASURE('name') to get a measure object, then setunits(unit) to configure. Create UNIT('name') to get a unit reference.",
    syntax: "!measure = object MEASURE('AngularFrequency')\n!unit = object UNIT(|rpm|)\n!measure.setunits(!unit)",
    exampleCanonical: `-- CB JDE_BI_tagRegister-export.pmlmac
!AngularFrequencyDimension = object MEASURE('AngularFrequency')
!rpmUnit = object UNIT(|rpm|)
!AngularFrequencyDimension.setunits(!rpmUnit)`,
    exampleAntipattern: "!measure = MEASURE('AngularFrequency')  -- missing OBJECT\n!unit = UNIT('rpm')  -- missing OBJECT",
    pitfalls: [
      'Both MEASURE and UNIT require OBJECT keyword',
      'setunits() may fail silently if unit is not valid for the measure',
      'Unit names are case-sensitive'
    ],
    relatedIds: ['typeconversion_unit_systems'],
    sourcedoc: 'AVEVA Engineering measurement documentation',
    sourcecodebase: 'JDE_BI_tagRegister-export.pmlmac'
  },
  {
    id: 'pml1_lstdef_query',
    category: 'controlflow',
    subcategory: 'list-definition-queries',
    title: 'LSTDEF Collection Query Pattern',
    principle: "PML1 'var !name collect all LSTDEF with (expression)' queries list definitions by name and returns a GRID collection.",
    rule: "Use 'var !grid collect all LSTDEF with (LSTNAM eq |listName|)' to find a single list definition. Access via !grid.first().dbref() and !grid.size().",
    syntax: 'var !grid collect all LSTDEF with (LSTNAM eq |IM-tag-dataset|)\nif (!grid.size() eq 1) then\n  !gridRef = !grid.first().dbref()\n  !gridRef.lstflt = !realUnset\nendif',
    exampleCanonical: `-- CB RAMBiReportExport.pmlmac
var !grid collect all LSTDEF with (LSTNAM eq |IM-tag-dataset|)
if (!grid.size() eq 1) then
  !gridRef = !grid.first().dbref()
  !gridRef.lstflt = !realUnset
endif`,
    exampleAntipattern: `var !grid collect all LSTDEF  -- missing 'with' filter
if (!grid.size() gt 0) then  -- should check eq 1 for uniqueness`,
    pitfalls: [
      "LSTDEF query returns a GRID, not a single DBREF",
      "Always check !grid.size() eq 1 before accessing first()",
      "CATNAM of LSTGRP of $!gridRef extracts the list group name for export",
      '$!gridRef uses query substitution, not direct method call'
    ],
    relatedIds: ['obj_collection_scope', 'pml1_query_substitution'],
    sourcedoc: 'AVEVA PDMS/E3D list definition documentation',
    sourcecodebase: 'RAMBiReportExport.pmlmac'
  }
];

/** Validate all entries before applying */
export function validateMac44Patch(): string[] {
  const errors: string[] = [];
  for (const entry of mac44KBEntries) {
    // Validate category
    try {
      normalizeCategory(entry.category);
    } catch {
      errors.push(`Invalid category for ${entry.id}: ${entry.category}`);
    }
    // Validate required fields
    const required = ['id', 'category', 'subcategory', 'title', 'principle', 'rule', 'syntax', 'exampleCanonical', 'sourcedoc', 'sourcecodebase'];
    for (const field of required) {
      if (!(field in entry) || !entry[field]) {
        errors.push(`Missing required field '${field}' in entry ${entry.id}`);
      }
    }
    // Validate examples have CB prefix
    if (!entry.exampleCanonical.startsWith('-- CB ')) {
      errors.push(`exampleCanonical missing '-- CB' prefix in entry ${entry.id}`);
    }
  }
  return errors;
}
