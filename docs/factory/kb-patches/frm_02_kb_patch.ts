/**
 * KB Patch for frm_02 — jackimform.pmlfrm
 * Generated: 2026-06-03
 * Source: docs/codebase/forms/jackimform.pmlfrm
 * 
 * New KB entries identified by gap analysis:
 * - forms_layout_gadget_method_access
 * - forms_conditional_comment_syntax
 * - forms_net_grid_bind_datasource
 * - forms_element_manager_create_tag
 */

import { KBEntry, normalizeCategory } from '../schemas/kb-entry';

export const frm_02_kb_patch: KBEntry[] = [
  {
    id: 'forms_layout_gadget_method_access',
    category: normalizeCategory('forms'),
    subcategory: 'layout',
    title: 'Accessing layout gadgets from form methods via !this.gadgetName',
    principle: 'Gadgets defined in layout sections are accessible in form methods via !this.<gadgetName> without explicit member declaration.',
    rule: 'A list/button/container gadget defined in layout can be referenced as !this.gadgetName in methods. No member declaration needed for gadget access.',
    syntax: 'layout form !!FormName\n  list .myList \'Items\' exit\ndefine method .method()\n  !this.myList.dText = !array\nendmethod',
    exampleCanonical: `-- CB jackimform.pmlfrm
layout form !!JACKIMFORM

\tpath DOWN
\tframe .overallFrame panel anchor all width 20 height 17
\t\tlist .reports 'Templates' CALL || anchor b + l + t width 20 height 31
\texit

member .reports is ARRAY

define method .init()
\t!reports = array()
\t!reports.append('Item 1')
\t!this.reports.dText = !reports
endmethod`,
    exampleAntipattern: `-- Declaring list gadget members as ARRAY when they should remain as gadget references
member .reports is ARRAY  -- .reports is a list gadget, not an ARRAY member`,
    pitfalls: [
      'Gadget attributes (dText, val, tag) differ from PML member types',
      'Linter may report unknown-form-member for gadget references — these are valid PML',
      'Do not mix gadget references with declared members of same name'
    ],
    relatedIds: ['forms_layout_frames', 'forms_layout_containers', 'forms_members_declared'],
    sourcedoc: 'AVEVA PML Customization — Form Gadget Reference',
    sourcecodebase: 'jackimform.pmlfrm'
  },
  {
    id: 'forms_conditional_comment_syntax',
    category: normalizeCategory('forms'),
    subcategory: 'comments',
    title: 'PML conditional comment syntax $( ... $) for disabling code blocks',
    principle: 'PML uses $( ... $) as block comment delimiters that can disable entire code sections including dialog calls.',
    rule: 'Code between $( and $) is treated as a comment block. Commonly used to disable alert.confirm dialogs in production code.',
    syntax: '$( code to disable $)',
    exampleCanonical: `-- CB jackimform.pmlfrm
$(
  if (!!alert.confirm('Do you want to upload new tags?') eq 'YES') then
    -- upload code
  endif
$)`,
    exampleAntipattern: `-- Using -- comments for multi-line blocks
-- if (!!alert.confirm(...)) then
--   -- code
-- endif`,
    pitfalls: [
      '$( and $) must be on their own logical lines or at block start/end',
      'Nested $( $) within block comments may not work correctly',
      'IDEs may not highlight conditional comments the same as -- comments'
    ],
    relatedIds: ['forms_layout_gadget_method_access', 'forms_member_declaration'],
    sourcedoc: 'AVEVA PML Customization — Comments',
    sourcecodebase: 'jackimform.pmlfrm'
  },
  {
    id: 'forms_net_grid_bind_datasource',
    category: normalizeCategory('forms'),
    subcategory: 'netcontrols',
    title: 'Binding NETGRIDCONTROL to NETDATASOURCE for Excel data import',
    principle: 'PMLNETCONTROL gadgets host .NET grid controls that can bind to data sources via bindToDataSource().',
    rule: 'Create NETGRIDCONTROL object, assign to PMLNETCONTROL.control, use PMLFILEBROWSER for file selection, create NETDATASOURCE with file path, then bind and autoFitColumns.',
    syntax: `!grid = object NETGRIDCONTROL()
!container.control = !grid.handle()
!browser = object PMLFILEBROWSER('OPEN')
!browser.show('', '', 'Title', true, 'Filters', 1)
!ds = object NETDATASOURCE('Name', !browser.file())
!grid.bindToDataSource(!ds)
!grid.autoFitColumns()`,
    exampleCanonical: `-- CB jackimform.pmlfrm
!browser = object PMLFILEBROWSER('OPEN')
!browser.show('', '', 'Load data from excel', true, 'Microsoft Excel files (*.xlsx)|*.xlsx|Microsoft Excel files (*.xls)|*.xls', 1)
!dataSource = object NETDATASOURCE('Data for import', !browser.file())
!this.grid.bindToDataSource(!dataSource)
!this.grid.autoFitColumns()`,
    exampleAntipattern: `-- Trying to bind grid without PMLNETCONTROL container wrapper
!this.grid.bindToDataSource(!ds)  -- grid not assigned to container.control`,
    pitfalls: [
      'PMLFILEBROWSER.show() requires specific parameter order for file filters',
      'NETDATASOURCE constructor requires name and file path',
      'autoFitColumns() must be called after bindToDataSource()',
      'GridControl must be imported with handle any/endhandle'
    ],
    relatedIds: ['forms_net_grid_control', 'forms_file_browser_dialog'],
    sourcedoc: 'AVEVA PML Customization — NET Controls',
    sourcecodebase: 'jackimform.pmlfrm'
  },
  {
    id: 'forms_element_manager_create_tag',
    category: normalizeCategory('forms'),
    subcategory: 'engineering',
    title: 'Creating AVEVA tags via CREATEELEMENT and PMLElementManager',
    principle: 'AVEVA.Engineering.PMLElementManager CREATEELEMENT object can create tags with type and attributes.',
    rule: 'Use object CREATEELEMENT(), SetElementTypeByName(), AddAttributeValue(), Execute(), GetErrors() for tag creation with error handling via handle any/endhandle.',
    syntax: `using namespace |Aveva.Engineering.PMLElementManager|
!elem = object CREATEELEMENT()
!elem.SetElementTypeByName('|:$!typeName|')
!elem.AddAttributeValue('|NAME|', !tagName)
!elem.Execute()
!errors = !elem.GetErrors()
do !err values !errors
  !msg = !err.GetError()
enddo`,
    exampleCanonical: `-- CB jackimform.pmlfrm
using namespace |Aveva.Engineering.PMLElementManager|
!elementNet = object CREATEELEMENT()
!elementNet.SetElementTypeByName('|:$!<cleanType>|')
handle any
  !this.logActions.append('|$!tag;Class [:$!cleanType] is not valid|')
  skip
endhandle
!elementNet.AddAttributeValue('|NAME|', !tag)
!elementNet.Execute()
!errors = !elementNet.GetErrors()
do !error values !errors
  !errorMsg = !error.GetError()
  !this.logActions.append('|$!tag;$!errorMsg|')
enddo`,
    exampleAntipattern: `-- Skipping error handling after Execute()
!elem.Execute()
!elem.AddAttributeValue('|NAME|', !tag)  -- wrong order`,
    pitfalls: [
      'SetElementTypeByName() must be called before AddAttributeValue()',
      'GetErrors() returns array — iterate with DO/ENDDO',
      'Element name format must include leading colon for type: |:$!typeName|',
      'handle any/endhandle around SetElementTypeByName catches invalid type names'
    ],
    relatedIds: ['forms_net_grid_bind_datasource', 'pdms_dbref_tag_lookup'],
    sourcedoc: 'AVEVA Engineering API — PMLElementManager',
    sourcecodebase: 'jackimform.pmlfrm'
  }
];
