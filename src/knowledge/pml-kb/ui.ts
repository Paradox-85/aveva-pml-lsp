import type { KBEntry } from '../schemas/kb-entry.js';

export const uiEntries: KBEntry[] = [
  {
    "id": "p2_widget_prefix",
    "category": "ui",
    "subcategory": "widget-prefixes",
    "title": "Widget prefix conventions `.bu/.fr/.te/.li/.op/.co/.pa/.tp/.me/.gr`",
    "principle": "Consistent gadget prefixes make form code searchable and distinguish widget types at a glance.",
    "rule": "Use project prefixes: `.bu` button, `.fr` frame, `.te` text input, `.li` list, `.op` option, `.co` combo, `.pa` paragraph/panel, `.tp` tab page, `.me` member object, `.gr` grid.",
    "syntax": "button .buOK callback |!this.onOK()|\ntext .teFilter\nmember .meConfigDetails is RAMIMPORTEXCELCONFIGLOADER",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\nmember .meConfigDetails is RAMIMPORTEXCELCONFIGLOADER\n!this.buOK.callback = |!this.onOK()|\n!this.buCancel.callback = |!this.onCancel()|",
    "exampleAntipattern": "-- NOT: name a button `.text1` or a member object `.buConfig`\n-- Плохо: prefix lies about widget/member type and breaks grep-based maintenance",
    "pitfalls": [
      "This is a project convention, not core PML syntax",
      "Keep prefix aligned with actual gadget type",
      "Do not reuse the same suffix for multiple widgets"
    ],
    "relatedIds": [
      "nc_prefix_conventions",
      "frm_widget_common_params",
      "p2_form_7callbacks"
    ],
    "sourcedoc": "Perplexity PML KB §11.2; codebase form naming",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "ui_anchor_positioning",
    "category": "ui",
    "subcategory": "layout",
    "title": "Form gadget positioning and anchors",
    "principle": "Form layouts depend on explicit gadget positioning and consistent parent/container relationships.",
    "rule": "Define gadgets in form setup and keep layout changes close to widget declarations or lifecycle initialization.",
    "syntax": "setup form !!myForm dialog resizable\n  button .buOK at ...\nexit",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\nsetup form !!ramImportExcelProcessor dialog resizable\n  member .meConfigDetails is RAMIMPORTEXCELCONFIGLOADER\nexit",
    "exampleAntipattern": "-- NOT: create UI state from unrelated macro globals\n-- Плохо: layout becomes order-dependent and hard to reload",
    "pitfalls": [
      "Form reload can reset UI state",
      "Keep gadget names stable for callbacks",
      "Use project prefix conventions"
    ],
    "relatedIds": [
      "p2_widget_prefix",
      "frm_file_structure"
    ],
    "sourcedoc": "TM-1402 Form Design; Perplexity PML KB §3.4",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "ui_show_hide",
    "category": "ui",
    "subcategory": "visibility",
    "title": "Show/hide and sensitivity control",
    "principle": "UI state should be changed through form/gadget methods rather than recreating forms.",
    "rule": "Use form lifecycle and gadget sensitivity/visibility methods consistently; initialize state in init/firstShown callbacks.",
    "syntax": "!this.buOK.active = true\n-- form show/dismiss according to TM-1402 patterns",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\n!this.initCall = |!this.init()|\n!this.buOK.callback = |!this.onOK()|",
    "exampleAntipattern": "-- NOT: reload the whole PML form to disable one button\n-- Плохо: user state and loaded data are lost",
    "pitfalls": [
      "Initialize UI state once",
      "Separate button callbacks from form callbacks",
      "Avoid global state for transient visibility"
    ],
    "relatedIds": [
      "frm_sensitivity_control",
      "p2_form_7callbacks"
    ],
    "sourcedoc": "TM-1402 Form Design; Perplexity PML KB §3.5",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    id: 'd7_display_progress',
    category: 'ui',
    subcategory: 'progress',
    title: 'Display progress with !!displayProgress',
    principle: 'Use !!displayProgress(current, total) in loops to show progress in AVEVA UI.',
    rule: 'Call !!displayProgress(!current, !total) inside DO loops to update the user-facing progress indicator.',
    syntax: `DO !row values !data
  !rowIdx = !data.findFirst(!row)
  !!displayProgress(!rowIdx, !data.size())
ENDDO`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
DO !row values !data
  !rowIdx = !data.findFirst(!row)
  !!displayProgress(!rowIdx, !data.size())
ENDDO`,
    exampleAntipattern: `-- No progress shown in long loops
DO !row values !data
  -- no progress update
ENDDO`,
    pitfalls: [
      '!!displayProgress is a global helper function, not a method of a specific object',
      'First argument should be current iteration count, second should be total'
    ],
    relatedIds: ['p2_displayprogress', 'frm_callback_syntax'],
    sourcedoc: 'AVEVA Engineering PML Customization',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    "id": "pml-builtin-display-progress",
    "category": "ui",
    "subcategory": "ui-feedback",
    "title": "displayProgress() — Show import progress bar",
    "principle": "displayProgress(current, total) displays a progress indicator in the AVEVA UI. Used for long-running import loops.",
    "rule": "Call with (current, total) parameters. PML is case-insensitive so !!displayProgress works.",
    "syntax": "!!displayProgress(1, 100)\ndo !i from 1 to !total\n  if(!i.gt(!onePercent)) then\n    !!displayProgress(!i, !total)\n  endif\nenddo",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n-- CB obj_06: progress tracking in import loop\n!!displayProgress(1, 100)\ndo !index indices !masterList\n  if(!index.gt(!onePercentValue)) then\n    !!displayProgress(!index, !masterList.size())\n  endif\nenddo",
    "exampleAntipattern": "!!displayProgress(!i) -- requires two parameters (current, total)",
    "pitfalls": [
      "Requires two parameters: current count and total",
      "Call sparingly to avoid UI flicker"
    ],
    "relatedIds": [
      "pml-builtin-undefined"
    ],
    "sourcedoc": "obj_06 (ramImportExcelElementLoader.pmlobj)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "pml-builtin-error-text",
    "category": "ui",
    "subcategory": "error-handling",
    "title": "!!error.text — Global error message in handle/elsehandle",
    "principle": "Inside a handle/elsehandle block, !!error.text contains the human-readable error message from the last exception.",
    "rule": "Access !!error.text only inside handle or elsehandle blocks. Contains string description of the error.",
    "syntax": "handle any\n  !errorMsg = !!error.text\nelsehandle None\n  !result = !value\nendhandle",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n-- CB obj_06: error message capture\nhandle any\n  !this.addErrorToList(!element.name, !attribute, 'ER13 - ' + !!error.text + !additionalMessage)\nelsehandle None\n  !attributeType = !currentValue.objecttype()\nendhandle",
    "exampleAntipattern": "!msg = !!error.text -- outside handle block returns empty or undefined",
    "pitfalls": [
      "Only available inside handle/elsehandle blocks",
      "PML is case-insensitive but !!Error.text and !!error.text are the same"
    ],
    "relatedIds": [
      "pml-builtin-undefined"
    ],
    "sourcedoc": "obj_06 (ramImportExcelElementLoader.pmlobj)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "pml-builtin-undefined",
    "category": "ui",
    "subcategory": "variable-check",
    "title": "undefined() — Check if a global variable is uninitialized",
    "principle": "Use undefined() to safely check whether a global variable (prefixed with !!) has been assigned before use. Prevents BADREF errors on first access.",
    "rule": "Call undefined(!!globalVar) before accessing the variable. Returns BOOLEAN.",
    "syntax": "if(undefined(!!globalVar)) then\n  !!globalVar = object CUSTOMTYPE()\nendif",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n-- CB obj_06: lazy global initialization\nif(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif",
    "exampleAntipattern": "!!ramCommonLogger.addLogDetails(...) -- may throw BADREF on first call",
    "pitfalls": [
      "undefined() only works on global variables (!! prefix), not local variables"
    ],
    "relatedIds": [
      "pml-builtin-error-text"
    ],
    "sourcedoc": "obj_06 (ramImportExcelElementLoader.pmlobj)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "displayprogress_two_arg",
    "category": "ui",
    "subcategory": "progress",
    "title": "!!displayProgress(index, total) two-argument progress indicator",
    "principle": "!!displayProgress(currentIndex, totalItems) shows a progress bar in the AVEVA UI with position within a total count.",
    "rule": "Use !!displayProgress(current, total) where current is the 1-based index of the current item and total is the total number of items.",
    "syntax": "!!displayProgress(currentIndex, totalItems)",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\n!tagIdx = !tags.findFirst(!tagString)\n!!displayProgress(!tagIdx, !tags.size())",
    "exampleAntipattern": "!!FMSYS.setProgress(50)  -- percentage-based, not index-based",
    "pitfalls": [
      "!!displayProgress is different from !!FMSYS.setProgress()",
      "currentIndex should be 1-based to match PML array indexing",
      "total should be the actual array size, not a guess",
      "Progress resets automatically when macro completes"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Customization — FMSYS Object",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  },
  {
    "id": "ui_alert_warning_method",
    "category": "ui",
    "subcategory": "alert",
    "title": "!!alert.warning() System Alert Method",
    "principle": "The !!alert global object provides a .warning() method for displaying warning messages to users.",
    "rule": "Use !!alert.warning('message') to display a non-fatal warning dialog.",
    "syntax": "!!alert.warning('Warning message text')",
    "exampleCanonical": "-- CB jacEISDeliveryForm.pmlfrm\nif(!isDetailsSet) then\n  !!alert.warning('PML Function cannot be previewed')\nelse\n  -- process data\nendif",
    "exampleAntipattern": "-- Using $P for user-facing messages (goes to command line, not visible)\n$P Warning: no data selected",
    "pitfalls": [
      "!!alert.warning() is non-blocking",
      "Message text should be concise and actionable",
      "Use for user-facing warnings, not debug output"
    ],
    "relatedIds": [
      "errorhandling_defined_global_form",
      "objects_file_set_exists_pattern"
    ],
    "sourcedoc": "AVEVA PML Objects Reference - Alert",
    "sourcecodebase": "jacEISDeliveryForm.pmlfrm"
  },
  {
    "id": "ui_container_pmlnetcontrol_net",
    "category": "ui",
    "subcategory": "container",
    "title": "Container Gadget with PMLNETCONTROL Type",
    "principle": "PML container gadgets can host .NET controls via PMLNETCONTROL sub-type, enabling rich data grids and custom UI elements.",
    "rule": "Declare container gadget with PMLNETCONTROL and a sub-type string. Set the .control property to the .NET object's handle().",
    "syntax": "container .contName PMLNETCONTROL 'SUBTYPE' anchor all at x y wid h\n-- In method:\n!this.contName.control = !netObject.handle()",
    "exampleCanonical": "-- CB jacEISDeliveryForm.pmlfrm\ncontainer .coSelectionList PMLNETCONTROL 'NET' anchor all at xmax+2 ymin width 80 height 20\n-- In constructor:\n!this.coSelectionList.control = !this.gridSelectionList.handle()",
    "exampleAntipattern": "-- Using container without PMLNETCONTROL for .NET controls\ncontainer .coSelectionList anchor all at xmax+2 ymin width 80 height 20",
    "pitfalls": [
      "PMLNETCONTROL requires GridControl or appropriate import",
      "The .control property must be set to the .NET object's handle()",
      "Container must be anchored for proper resizing"
    ],
    "relatedIds": [
      "objects_net_data_source_binding"
    ],
    "sourcedoc": "AVEVA PML Customization Guide - Gadgets",
    "sourcecodebase": "jacEISDeliveryForm.pmlfrm"
  }
];
