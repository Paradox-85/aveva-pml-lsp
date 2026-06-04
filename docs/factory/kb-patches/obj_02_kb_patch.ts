// Auto-generated KB patch draft from docs/factory gap analysis.
// Source: docs/codebase/objects/ramExcelReaderClass.pmlobj
// Status: draft only. Do not apply automatically.

export const obj02KbPatchDraft = [
  { id: 'objects-ram-aepml-excel-reader', category: 'objects', subcategory: 'external-addins', title: 'RamAEPMLExcelReader / RamPMLExcelReaderClass', syntax: "import 'RamAEPMLExcelReader'\nusing namespace 'RamAEPMLExcelReader'\n!reader = object RamPMLExcelReaderClass()\n!data = !reader.ReadExcel(!filePath)\n!error = !reader.error()", sourcecodebase: 'ramExcelReaderClass.pmlobj' },
  { id: 'objects-string-set-neq-methods', category: 'objects', subcategory: 'string-methods', title: 'STRING .set() and .neq() methods', syntax: "if(!str.set() AND !str.neq('')) then\n  -- assigned and non-empty\nendif", sourcecodebase: 'ramExcelReaderClass.pmlobj' },
  { id: 'objects-pmlfilebrowser-showopen', category: 'objects', subcategory: 'presentation', title: 'PMLFileBrowser constructor and file selection patterns', syntax: "!fileBrowser = object PMLFILEBROWSER('OPEN')\n!fileBrowser.show('', '', 'Select file', false, 'xlsx files (*.xlsx)|*.xlsx', 2)\n!filename = !fileBrowser.file()", sourcecodebase: 'ramExcelReaderClass.pmlobj' },
  { id: 'objects-ramcommonlogger', category: 'objects', subcategory: 'logging', title: 'RAMCOMMONLOGGER logging class and global instance', syntax: "if(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif\n!errorList = !errorData.split('#')\n!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)", sourcecodebase: 'ramExcelReaderClass.pmlobj' },
  { id: 'objects-error-global', category: 'objects', subcategory: 'error-handling', title: '!!Error global error object in elsehandle blocks', syntax: "handle any\n  -- risky code\nelsehandle\n  $P Error: $!!Error.text\nendhandle", sourcecodebase: 'ramExcelReaderClass.pmlobj' },
  { id: 'objects-array-block-evaluate', category: 'objects', subcategory: 'array-methods', title: 'ARRAY.Evaluate with compound BLOCK expressions', syntax: "!column = !rows.evaluate(object BLOCK(|!rows[!evalIndex][!columnIdx]|))", sourcecodebase: 'ramExcelReaderClass.pmlobj' },
  { id: 'patterns-reader-caching', category: 'patterns', subcategory: 'lazy-initialization', title: 'Object reader caching with lazy initialization', syntax: "if (!this.reader eq | |) THEN\n  !this.reader = object RamAEPMLExcelReader()\nendif", sourcecodebase: 'ramExcelReaderClass.pmlobj' },
  { id: 'objects-string-join-method', category: 'objects', subcategory: 'array-methods', title: 'ARRAY.Join() method for concatenation', syntax: "!rowString = !rowData.Join(| |)", sourcecodebase: 'ramExcelReaderClass.pmlobj' }
] as const;
