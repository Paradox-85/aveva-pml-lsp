// Auto-generated KB patch draft from docs/factory Phase 1 full-cycle runner.
// Source: docs/codebase/objects/ramImportExcelConfigLoader.pmlobj
// Status: draft only. Do not apply automatically.

export const obj04KbPatchDraft = [
  {
    id: 'customer-ram-pml-excel-reader-class',
    category: 'customer-addin',
    subcategory: 'excel-reader',
    title: 'RamPMLExcelReaderClass — Customer Excel Reader',
    principle: 'Customer-specific Excel reading class used by RAMImportExcelConfigLoader.',
    rule: 'RamPMLExcelReaderClass() is instantiated via object constructor. Its ReadExcel(!path) method returns a nested ARRAY of sheet tables.',
    syntax: '!excelReader = object RamPMLExcelReaderClass()\n!tables = !excelReader.ReadExcel(!excelFullPath)',
    exampleCanonical: `import 'RamAEPMLExcelReader'
handle any
endhandle

using namespace 'RamAEPMLExcelReader'
!excelReader = object RamPMLExcelReaderClass()
!excelTables = !excelReader.ReadExcel(!excelFullPath)`,
    exampleAntipattern: `// ❌ Do not hardcode path or forget import
!excelTables = RamPMLExcelReaderClass.ReadExcel('C:\\\\data.xlsx')`,
    pitfalls: [
      'Requires import of RamAEPMLExcelReader before use',
      'ReadExcel returns nested ARRAY; each sheet is a sub-array',
      'Sheet access uses !tables[!sheetIndex][columnIndex] pattern'
    ],
    relatedIds: ['array-evaluate-block', 'array-findFirst'],
    sourcedoc: 'ramImportExcelConfigLoader.pmlobj',
    sourcecodebase: 'ramImportExcelConfigLoader.pmlobj'
  },
  {
    id: 'customer-ram-aepml-excel-reader-namespace',
    category: 'customer-addin',
    subcategory: 'namespace',
    title: 'RamAEPMLExcelReader — Customer Import Namespace',
    principle: 'PML import directive for customer Excel reader add-in.',
    rule: 'Use import or using namespace to load the RamAEPMLExcelReader add-in before instantiating its classes.',
    syntax: "import 'RamAEPMLExcelReader'\nhandle any\nendhandle",
    exampleCanonical: `import 'RamAEPMLExcelReader'
handle any
endhandle

define object RAMIMPORTEXCELCONFIGLOADER
  -- object body
endobject`,
    exampleAntipattern: `// ❌ Missing import
!reader = object RamPMLExcelReaderClass()  -- Fails without import`,
    pitfalls: [
      'Must be imported at file scope before any usage',
      'Handle import errors with handle any/endhandle block'
    ],
    relatedIds: ['customer-ram-pml-excel-reader-class'],
    sourcedoc: 'ramImportExcelConfigLoader.pmlobj',
    sourcecodebase: 'ramImportExcelConfigLoader.pmlobj'
  },
  {
    id: 'customer-ram-common-logger-global',
    category: 'customer-pattern',
    subcategory: 'logging',
    title: '!!ramCommonLogger — Global Logger Lazy Initialization',
    principle: 'Lazy initialization of a shared global logger object.',
    rule: 'Check undefined(!!ramCommonLogger) before creating the object to avoid re-initialization.',
    syntax: `if(undefined(!!ramCommonLogger)) then
  !!ramCommonLogger = object RAMCOMMONLOGGER()
endif`,
    exampleCanonical: `define method .addErrorToList(!element is STRING, !detail is STRING, !error is STRING)
  if(undefined(!!ramCommonLogger)) then
    !!ramCommonLogger = object RAMCOMMONLOGGER()
  endif
  !errorList = object ARRAY()
  !errorList.append(!element)
  !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)
endmethod`,
    exampleAntipattern: `// ❌ Always recreates the logger
!!ramCommonLogger = object RAMCOMMONLOGGER()  -- Overwrites existing logger`,
    pitfalls: [
      '!!ramCommonLogger is a global variable; ensure it is not cleared elsewhere',
      'RAMCOMMONLOGGER object must be defined in the same session'
    ],
    relatedIds: ['undefined-function', 'global-variable-pattern'],
    sourcedoc: 'ramImportExcelConfigLoader.pmlobj',
    sourcecodebase: 'ramImportExcelConfigLoader.pmlobj'
  },
  {
    id: 'customer-ram-common-logger-addlogdetails',
    category: 'customer-addin',
    subcategory: 'logging',
    title: 'RAMCOMMONLOGGER.addLogDetails() — Customer Logging Method',
    principle: 'Customer-specific method to log error details with context.',
    rule: 'Pass element type (via objecttype()), error array, and optionally other context to addLogDetails.',
    syntax: `!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)`,
    exampleCanonical: `!errorList = object ARRAY()
!errorList.append(!element)
!errorList.append(!detail)
!errorList.append(!error)
!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)`,
    exampleAntipattern: `// ❌ Missing error list wrapping
!!ramCommonLogger.addLogDetails(!this.objecttype(), !element)  -- Wrong signature`,
    pitfalls: [
      'errorList must be an ARRAY with [element, detail, error] structure',
      'objecttype() returns the object type name for context'
    ],
    relatedIds: ['customer-ram-common-logger-global', 'array-append'],
    sourcedoc: 'ramImportExcelConfigLoader.pmlobj',
    sourcecodebase: 'ramImportExcelConfigLoader.pmlobj'
  },
  {
    id: 'string-neq-method',
    category: 'builtin-object',
    subcategory: 'string-methods',
    title: 'STRING.neq() — PML2 Not-Equal Method',
    principle: 'STRING.neq() is the PML2 method-form equivalent of the PML1 NE comparison operator.',
    rule: 'Use .neq() for case-sensitive not-equal comparison on STRING objects.',
    syntax: `!result = !str.neq(|value|)`,
    exampleCanonical: `!parameterDetail = !this.classMappingList[!index][3].upcase()
if(!parameterDetail.set() AND !parameterDetail.trim().neq('')) then
  -- Non-empty parameter found
endif`,
    exampleAntipattern: `// ❌ Confusing .neq() with PML1 NE in object context
if !parameterDetail NE |value| then  -- Works but not PML2 idiomatic`,
    pitfalls: [
      '.neq() is a STRING method, not a standalone operator',
      'Must be called on a STRING object instance',
      'Case-sensitive comparison (use .EQNoCase() for case-insensitive)'
    ],
    relatedIds: ['string-object', 'string-eqnocase-method'],
    sourcedoc: 'ramImportExcelConfigLoader.pmlobj',
    sourcecodebase: 'ramImportExcelConfigLoader.pmlobj'
  },
  {
    id: 'lazy-global-initialization-pattern',
    category: 'codebase-pattern',
    subcategory: 'global-variables',
    title: 'Lazy Global Variable Initialization Pattern',
    principle: 'Check undefined() before assigning a global object to avoid overwriting existing state.',
    rule: 'Use if(undefined(!!globalVar)) then to safely initialize globals only once.',
    syntax: `if(undefined(!!globalVar)) then
  !!globalVar = object TARGETCLASS()
endif`,
    exampleCanonical: `if(undefined(!!ramCommonLogger)) then
  !!ramCommonLogger = object RAMCOMMONLOGGER()
endif`,
    exampleAntipattern: `// ❌ Always reinitializes
!!ramCommonLogger = object RAMCOMMONLOGGER()  -- Destroys previous state`,
    pitfalls: [
      'undefined() returns true for UNSET values, not just for undefined variables',
      'Ensure global is not cleared between method calls',
      'Consider thread-safety in multi-threaded contexts'
    ],
    relatedIds: ['undefined-function', 'global-variable-pattern'],
    sourcedoc: 'ramImportExcelConfigLoader.pmlobj',
    sourcecodebase: 'ramImportExcelConfigLoader.pmlobj'
  },
  {
    id: 'array-evaluate-block-evalIndex',
    category: 'builtin-object',
    subcategory: 'array-methods',
    title: 'ARRAY.Evaluate() with BLOCK and !evalIndex',
    principle: 'Evaluate a BLOCK expression against each element of an ARRAY using !evalIndex as the loop variable.',
    rule: 'Use !this.array.evaluate(object BLOCK(|!this.array[!evalIndex][field]|)) to extract specific fields from nested arrays.',
    syntax: `!result = !array.evaluate(object BLOCK(|!array[!evalIndex][field]|))`,
    exampleCanonical: `!excelClassNames = !this.classMappingList.evaluate(
  object BLOCK(|!this.classMappingList[!evalIndex][1].upcase()|))
!sheetNames = !excelTables.evaluate(object BLOCK(|!excelTables[!evalIndex][1]|))`,
    exampleAntipattern: `// ❌ DO loop with manual indexing (less idiomatic)
DO !i FROM 1 TO !array.Size()
  !names[i] = !array[!i][1].upcase()
ENDDO`,
    pitfalls: [
      '!evalIndex is a built-in variable available only inside BLOCK expressions',
      'BLOCK must be wrapped with object BLOCK(...)',
      'Pipe-delimited string |...| is used inside BLOCK for PML1-style expression'
    ],
    relatedIds: ['array-object', 'string-upcase-method'],
    sourcedoc: 'ramImportExcelConfigLoader.pmlobj',
    sourcecodebase: 'ramImportExcelConfigLoader.pmlobj'
  },
  {
    id: 'array-reindex-sortedindices-pattern',
    category: 'builtin-object',
    subcategory: 'array-methods',
    title: 'ARRAY.ReIndex() with SortedIndices() — Sort-Based Reordering',
    principle: 'Use SortedIndices() to get sort order, then ReIndex() to reorder the array.',
    rule: '!sorted = !orderList.sortedIndices(); !reordered = !original.reIndex(!sorted)',
    syntax: `!sortOrder = !orderList.sortedIndices()
!reordered = !original.reIndex(!sortOrder)`,
    exampleCanonical: `!orderList = !actionList.evaluate(object BLOCK(|!actionList[!evalIndex][2]|))
!sortOrder = !orderList.sortedIndices()
!finalList = !actionList.reIndex(!sortOrder)`,
    exampleAntipattern: `// ❌ Manual sorting with DO loop
DO !i FROM 1 TO !list.Size()
  DO !j FROM !i+1 TO !list.Size()
    IF !list[!i] GT !list[!j] THEN
      -- Swap
    ENDIF
  ENDDO
ENDDO`,
    pitfalls: [
      'ReIndex modifies the array in place (no return value)',
      'sortedIndices() returns a NEW REAL ARRAY',
      'Must use the return value of sortedIndices(), not the original array'
    ],
    relatedIds: ['array-object', 'array-evaluate-block-evalIndex'],
    sourcedoc: 'ramImportExcelConfigLoader.pmlobj',
    sourcecodebase: 'ramImportExcelConfigLoader.pmlobj'
  }
] as const;
