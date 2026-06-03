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
  }
];
