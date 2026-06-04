// Auto-generated KB patch draft from docs/factory gap analysis.
// Source: docs/codebase/objects/ramCommonLogger.pmlobj
// Status: draft only. Do not apply automatically.

export const obj01KbPatchDraft = [
  {
    id: 'object-logger-overload-default-severity',
    category: 'objects',
    subcategory: 'method-overloading',
    title: 'Logger object overloads delegate to a central ARRAY implementation with default REAL severity',
    principle: 'Expose convenience overloads, but normalize all log inputs through one canonical implementation.',
    syntax: 'define method .addLogDetails(!toolName is STRING, !details is ARRAY, !severityLevel is REAL)',
    sourcecodebase: 'ramCommonLogger.pmlobj'
  },
  {
    id: 'array-tabular-normalisation-defined-set',
    category: 'objects',
    subcategory: 'array-processing',
    title: 'Normalize sparse ARRAY rows for tabular export using maximum width and defined/set guards',
    principle: 'Tabular export should produce rows of equal width while preserving sparse PML ARRAY safety.',
    syntax: 'if(defined(!row[!i]) AND !row[!i].set()) then ... else ... endif',
    sourcecodebase: 'ramCommonLogger.pmlobj'
  },
  {
    id: 'custom-file-writer-dependency-ramfilewriterclass',
    category: 'dependencies',
    subcategory: 'custom-objects',
    title: 'RAMFILEWRITERCLASS export methods used by common logger objects',
    principle: 'Custom writer object dependencies should document method names and argument order because they are external API contracts.',
    syntax: '!this.fileWriter.writeDataToExcelFile(!pathName, !isDisplayFile, !heading, !finalLog)',
    sourcecodebase: 'ramCommonLogger.pmlobj'
  },
  {
    id: 'logger-form-refresh-side-effect',
    category: 'forms',
    subcategory: 'global-form-integration',
    title: 'Logger updates can mark a global form refresh button by changing gadget background',
    principle: 'A non-UI object can signal UI refresh state through a guarded global form reference.',
    syntax: 'if(defined(!!ramCommonLoggerForm)) then\n  !!ramCommonLoggerForm.buRefresh.background = 2\nendif',
    sourcecodebase: 'ramCommonLogger.pmlobj'
  }
] as const;
