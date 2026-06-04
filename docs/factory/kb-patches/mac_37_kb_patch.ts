/**
 * KB Patch for mac_37: JDE_tagProperties_upload
 * Generated: 2026-06-03
 * Source: docs/codebase/macros/JDE_tagProperties_upload.pmlmac
 * Category: dotnetinterop / objects / typeconversion
 */

import type { KBEntry } from '../../../knowledge/schemas/kb-entry';

export const kbPatches_mac_37: readonly KBEntry[] = [
  {
    id: 'net_grid_data_source_workflow',
    category: 'dotnetinterop',
    subcategory: 'GridControl',
    title: 'NETDATASOURCE + NETGRIDCONTROL data-binding workflow',
    principle:
      'Use NETDATASOURCE to bind an external data file to a NETGRIDCONTROL, then retrieve rows via getrows() for iteration.',
    rule:
      "import |GridControl| with handle/elsehandle; create NETDATASOURCE with grid table name and file path; create NETGRIDCONTROL; call bindToDataSource then getrows; iterate with DO...VALUES.",
    syntax: `!dataSource = object NETDATASOURCE('Grid Table', !fileName)
!dataTable = object NETGRIDCONTROL()
!dataTable.bindToDataSource(!dataSource)
!data = !dataTable.getrows()
do !row values !data
  ...
ENDDO`,
    exampleCanonical: `-- CB JDE_tagProperties_upload.pmlmac
!dataSource = object NETDATASOURCE('Grid Table', !fileName)
!dataTable = object NETGRIDCONTROL()
!dataTable.bindToDataSource(!dataSource)
!data = !dataTable.getrows()
do !row values !data
  !Tag = !row[1]
  !EngCon = !row[2]
  !InsCon = !row[3]
enddo`,
    exampleAntipattern: '',
    pitfalls: [
      "NETDATASOURCE constructor first arg is the table/grid name, not the file path.",
      'getrows() may return UNSET if the file is empty or unreadable — always check .Unset().',
      'GridControl must be imported before use.',
    ],
    relatedIds: ['net_interfaces_overview', 'pml_array_iteration'],
    sourcedoc: 'NET Interfaces.md, test2form.pmlfrm',
    sourcecodebase: 'JDE_tagProperties_upload.pmlmac',
  },
  {
    id: 'dbref_attribute_access_assignment',
    category: 'objects',
    subcategory: 'dbref',
    title: 'dbref tag reference with attribute read/write via .:AttributeName',
    principle:
      'Use |$!<var>| to build a tag reference string, resolve with .dbref(), then read/write attributes via .:AttributeName notation.',
    rule:
      '!tagName = |$!<Tag>|; !tagref = !tagName.dbref(); !tagref.:RAMTAGOWNER = !value',
    syntax: `!tagName = |$!<TagName>|
!tagref = !tagName.dbref()
!tagref.:RAMInstallationContractors = !newValue`,
    exampleCanonical: `-- CB JDE_tagProperties_upload.pmlmac
!tagName = |$!<Tag>|
!tagref = !tagName.dbref()
!tagref.:RAMTAGOWNER = !EngCon`,
    exampleAntipattern:
      '!tagref = !Tag.dbref()  -- Tag must be a string reference, not a raw value',
    pitfalls: [
      'dbref() requires a properly formatted tag reference string (e.g., |$!<Tag>|).',
      'Attribute name after .: must be a valid system or UDA attribute.',
      'Reading a non-existent attribute may raise an exception — wrap in handle/elsehandle.',
    ],
    relatedIds: ['pml_string_interpolation_dollar', 'handle_any_elsehandle_none'],
    sourcedoc: 'JDE_tagProperties_upload.pmlmac',
    sourcecodebase: 'JDE_tagProperties_upload.pmlmac',
  },
  {
    id: 'string_interpolation_dollar_var',
    category: 'typeconversion',
    subcategory: 'dollar',
    title: 'Dollar-string interpolation $! and $< for tag references',
    principle:
      "Use $! for variable substitution and $< for tag/element reference construction within pipe-delimited strings.",
    rule:
      '|$!<variable>| expands variable value into a tag reference; $!!error.text accesses error object text.',
    syntax: `!tagName = |$!<Tag>|
!errorText = $!!error.text`,
    exampleCanonical: `-- CB JDE_tagProperties_upload.pmlmac
!tagName = |$!<Tag>|
!tagref = !tagName.dbref()
!issueMsg = |$!<Tag>;$!!error.text|`,
    exampleAntipattern: '',
    pitfalls: [
      '$! and $< only work inside pipe-delimited strings.',
      '$!!error.text must be accessed within a handle/elsehandle block.',
    ],
    relatedIds: ['pml_string_delimiters', 'handle_any_elsehandle_none'],
    sourcedoc: 'best-practices.md, commands-reference.md',
    sourcecodebase: 'JDE_tagProperties_upload.pmlmac',
  },
] as const;
