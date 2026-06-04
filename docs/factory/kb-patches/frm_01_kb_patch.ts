/**
 * KB Patch for frm_01 (jacEISDeliveryForm.pmlfrm)
 * 
 * New KB entries identified during gap analysis:
 * - ui_form_menu_dynamic: Dynamic menu creation in PML forms
 * - control_do_values_iteration: DO VALUES iteration over ARRAY
 * - errorhandling_defined_global_form: defined() check for global forms
 * - objects_file_set_exists_pattern: FILE object set() + exists() pattern
 * - objects_net_data_source_binding: NETGRIDCONTROL + NETDATASOURCE binding
 * - ui_container_pmlnetcontrol_net: Container with PMLNETCONTROL
 * - objects_pml_folder_browser: PMLFolderBrowser object
 * - ui_alert_warning_method: !!alert.warning() usage
 */

import { KBEntry, KBCategory } from '../../../knowledge/schemas/kb-entry';

export const frm_01_kb_patches: KBEntry[] = [
  {
    id: 'ui_form_menu_dynamic',
    category: 'forms' as KBCategory,
    subcategory: 'menu',
    title: 'Dynamic Menu Creation in PML Forms',
    principle: 'PML forms support dynamic menu creation via !this.newMenu() and bar.add() methods, enabling runtime popup and bar menus.',
    rule: "Use !this.newMenu('menuName') to create a menu object, then .add('callback', 'label', 'command') to add entries. Use !this.bar.add('category', 'name') for bar menu entries.",
    syntax: "!menu = !this.newMenu('menuName')\n!menu.add('callback', 'Label Text', '!this.methodName()')\n!this.bar.add('Category', 'name')",
    exampleCanonical: "-- Dynamic menu in form constructor\n!this.bar.add('Tools', 'toolsMenu')\n!toolsMenu = !this.newMenu('toolsMenu')\n!toolsMenu.add('callback', 'Option 1', '!this.doOption1()')\n!toolsMenu.add('callback', 'Option 2', '!this.doOption2()')",
    exampleAntipattern: "-- Static menu defined at form setup (less flexible)\n!menu = menu\n!menu.add('Static', '.staticMethod')",
    pitfalls: [
      "Menu names must be unique within the form scope",
      "Callback commands are strings, not method references",
      "Bar menu categories appear as submenus"
    ],
    relatedIds: ['ui_button_callback', 'ui_container_popup'],
    sourcedoc: 'AVEVA PML Customization Guide - Forms and Menus',
    sourcecodebase: 'jacEISDeliveryForm.pmlfrm'
  },
  {
    id: 'control_do_values_iteration',
    category: 'controlflow' as KBCategory,
    subcategory: 'iteration',
    title: 'DO VALUES Iteration over ARRAY Elements',
    principle: 'PML supports iterating over ARRAY elements using DO ... VALUES ... ENDDO, which yields each populated element as the loop index.',
    rule: "Use DO !index VALUES !arrayName to iterate over all populated elements. !index holds the value of each element (not the position).",
    syntax: "DO !index VALUES !arrayName\n  -- !index contains each element value\nENDDO",
    exampleCanonical: "-- Iterate over selected list items\n!selectedItems = !this.list.val\ndo !index values !selectedItems\n  !viewName = !this.list.rtext[!index]\n  !this.processView(!viewName)\nenddo",
    exampleAntipattern: "-- Using FROM/TO with array Size() when VALUES is more natural\n!i = 1\ndo while !i.le(!selectedItems.Size())\n  !index = !selectedItems[!i]\n  !i = !i + 1\nenddo",
    pitfalls: [
      "!index holds the element value, not the array index",
      "Use !selectedItems[!index] to access array by value when values are indices",
      "Array indices in PML start at 1"
    ],
    relatedIds: ['datatypes_array_methods', 'control_do_from_to'],
    sourcedoc: 'AVEVA PML Customization Guide - Control Logic',
    sourcecodebase: 'jacEISDeliveryForm.pmlfrm'
  },
  {
    id: 'errorhandling_defined_global_form',
    category: 'errorhandling' as KBCategory,
    subcategory: 'defined_check',
    title: 'defined() Check for Global Form Objects',
    principle: 'Use defined() to check if a global form object exists before attempting to access it, preventing runtime errors.',
    rule: "Use if(defined(!!globalForm)) to check existence. If the form exists, access its methods; otherwise, create a new instance.",
    syntax: "if(defined(!!globalForm)) then\n  !!globalForm.method()\nelse\n  !!globalVar = object CLASS()\nendif",
    exampleCanonical: "-- Safe access to global logger form\nif(defined(!!ramcommonloggerform)) then\n  !!ramcommonloggerform.clearData()\nelse\n  !!RAMCOMMONLOGGER = object RAMCOMMONLOGGER()\nendif",
    exampleAntipattern: "-- Direct access without check (will error if form not loaded)\n!!ramcommonloggerform.clearData()",
    pitfalls: [
      "defined() checks variable existence, not object validity",
      "Global form names are case-insensitive in PML"
    ],
    relatedIds: ['datatypes_defined_undefined', 'objects_form_lifecycle'],
    sourcedoc: 'AVEVA PML Customization Guide - Expressions',
    sourcecodebase: 'jacEISDeliveryForm.pmlfrm'
  },
  {
    id: 'objects_file_set_exists_pattern',
    category: 'objects' as KBCategory,
    subcategory: 'file',
    title: 'FILE Object set() and exists() Pattern',
    principle: 'The FILE object requires .set() to resolve the path before .exists() can reliably check for the file or folder.',
    rule: "Create FILE object with path, call .set() to resolve, then use .exists() to check. Combine with AND for conditional logic.",
    syntax: "!file = object FILE(!path)\nif(!file.set() AND !file.exists()) then\n  -- file/folder exists\nelse\n  -- handle missing\nendif",
    exampleCanonical: "!file = object FILE(!outputFolder.val)\nif(!file.set() AND !file.exists()) then\n  -- proceed with export\nelse\n  !!alert.warning('Please select valid output folder')\nendif",
    exampleAntipattern: "-- Checking exists without set (may fail on relative paths)\n!file = object FILE(!path)\nif(!file.exists()) then",
    pitfalls: [
      ".set() resolves the path and returns success/failure",
      ".exists() checks both files and folders",
      "Use .fullname() to get resolved absolute path"
    ],
    relatedIds: ['objects_file_methods', 'errorhandling_defined_global_form'],
    sourcedoc: 'AVEVA PML Objects Reference - FILE',
    sourcecodebase: 'jacEISDeliveryForm.pmlfrm'
  },
  {
    id: 'objects_net_data_source_binding',
    category: 'objects' as KBCategory,
    subcategory: 'netgrid',
    title: 'NETGRIDCONTROL with NETDATASOURCE Binding',
    principle: 'NETGRIDCONTROL from GridControl add-in can be bound to data via NETDATASOURCE object for dynamic data display.',
    rule: "Create NETGRIDCONTROL object, configure properties (columnExcelFilter, fixedRows, etc.), create NETDATASOURCE with columns and rows, then bind with bindToDataSource().",
    syntax: "using namespace 'Aveva.Core.Presentation'\n!grid = object NETGRIDCONTROL()\n!grid.columnExcelFilter(true)\n!grid.fixedRows(true)\n!nds = object NETDATASOURCE('name', !headings, !rows)\n!grid.bindToDataSource(!nds)",
    exampleCanonical: "!this.gridSelectionList = object NETGRIDCONTROL()\n!this.coSelectionList.control = !this.gridSelectionList.handle()\n!this.gridSelectionList.columnExcelFilter(true)\n!this.gridSelectionList.fixedRows(true)\n!this.gridSelectionList.singleRowSelection(false)\n!this.gridSelectionList.editableGrid(true)\n!this.gridSelectionList.outlookGroupStyle(false)\n!nds = object NETDATASOURCE('viewName', !headings, !rows)\n!this.gridSelectionList.bindToDataSource(!nds)",
    exampleAntipattern: "-- Direct assignment without binding (no data display)\n!grid = object NETGRIDCONTROL()\n!grid.data = !rows",
    pitfalls: [
      "NETGRIDCONTROL requires GridControl import",
      "NETDATASOURCE namespace must be set",
      "Column names in headings must match data array dimensions"
    ],
    relatedIds: ['objects_file_methods', 'ui_container_pmlnetcontrol_net'],
    sourcedoc: 'AVEVA GridControl Add-in Documentation',
    sourcecodebase: 'jacEISDeliveryForm.pmlfrm'
  },
  {
    id: 'ui_container_pmlnetcontrol_net',
    category: 'ui' as KBCategory,
    subcategory: 'container',
    title: 'Container Gadget with PMLNETCONTROL Type',
    principle: 'PML container gadgets can host .NET controls via PMLNETCONTROL sub-type, enabling rich data grids and custom UI elements.',
    rule: "Declare container gadget with PMLNETCONTROL and a sub-type string. Set the .control property to the .NET object's handle().",
    syntax: "container .contName PMLNETCONTROL 'SUBTYPE' anchor all at x y wid h\n-- In method:\n!this.contName.control = !netObject.handle()",
    exampleCanonical: "container .coSelectionList PMLNETCONTROL 'NET' anchor all at xmax+2 ymin width 80 height 20\n-- In constructor:\n!this.coSelectionList.control = !this.gridSelectionList.handle()",
    exampleAntipattern: "-- Using container without PMLNETCONTROL for .NET controls\ncontainer .coSelectionList anchor all at xmax+2 ymin width 80 height 20",
    pitfalls: [
      "PMLNETCONTROL requires GridControl or appropriate import",
      "The .control property must be set to the .NET object's handle()",
      "Container must be anchored for proper resizing"
    ],
    relatedIds: ['objects_net_data_source_binding', 'ui_button_callback'],
    sourcedoc: 'AVEVA PML Customization Guide - Gadgets',
    sourcecodebase: 'jacEISDeliveryForm.pmlfrm'
  },
  {
    id: 'objects_pml_folder_browser',
    category: 'objects' as KBCategory,
    subcategory: 'browser',
    title: 'PMLFolderBrowser Object for Folder Selection',
    principle: 'PMLFolderBrowser provides a standard folder selection dialog accessible from PML forms.',
    rule: "Create PMLFolderBrowser object, call .show(title, mode) to display, then read .selectedPath() for the result.",
    syntax: "using namespace 'Aveva.Core.Presentation'\n!browser = object PMLFOLDERBROWSER()\n!browser.show('Select Folder', true)\n!path = !browser.selectedPath()",
    exampleCanonical: "using namespace 'Aveva.Core.Presentation'\n!folderBrowser = object PMLFOLDERBROWSER()\n!folderBrowser.show('Select Output Folder', true)\n!this.teOutputFolder.val = !folderBrowser.selectedPath()",
    exampleAntipattern: "-- Using FILE object for folder browsing (less user-friendly)\n!file = object FILE('')\n!file.browse()",
    pitfalls: [
      "PMLFOLDERBROWSER requires Aveva.Core.Presentation namespace",
      "selectedPath() returns empty string if dialog cancelled",
      "Second parameter of .show() controls multi-select mode"
    ],
    relatedIds: ['objects_file_methods', 'ui_button_callback'],
    sourcedoc: 'AVEVA PML Objects Reference',
    sourcecodebase: 'jacEISDeliveryForm.pmlfrm'
  },
  {
    id: 'ui_alert_warning_method',
    category: 'ui' as KBCategory,
    subcategory: 'alert',
    title: '!!alert.warning() System Alert Method',
    principle: 'The !!alert global object provides a .warning() method for displaying warning messages to users.',
    rule: "Use !!alert.warning('message') to display a non-fatal warning dialog.",
    syntax: "!!alert.warning('Warning message text')",
    exampleCanonical: "if(!isDetailsSet) then\n  !!alert.warning('PML Function cannot be previewed')\nelse\n  -- process data\nendif",
    exampleAntipattern: "-- Using $P for user-facing messages (goes to command line, not visible)\n$P Warning: no data selected",
    pitfalls: [
      "!!alert.warning() is non-blocking",
      "Message text should be concise and actionable",
      "Use for user-facing warnings, not debug output"
    ],
    relatedIds: ['errorhandling_defined_global_form', 'objects_file_set_exists_pattern'],
    sourcedoc: 'AVEVA PML Objects Reference - Alert',
    sourcecodebase: 'jacEISDeliveryForm.pmlfrm'
  }
];
