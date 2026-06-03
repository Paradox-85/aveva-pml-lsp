import type { KBEntry } from '../schemas/kb-entry.js';
import { allPmlKbEntries } from '../pml-kb/index.js';

/** Map of error patterns to relevant KB entry IDs */
const ERROR_PATTERNS: Array<{ pattern: RegExp; entryIds: string[]; description: string }> = [
  {
    pattern: /\bHANDLE\s+\d+\s*,\s*\d+/i,
    entryIds: ['eh_handle_endhandle', 'eh_handle_any'],
    description: 'Numeric error code in HANDLE — use HANDLE ANY for catch-all',
  },
  {
    pattern: /error\s*(41,\s*8|41\.8)/i,
    entryIds: ['eh_handle_endhandle', 'pdms_current_element'],
    description: 'Error 41,8: Must be at ZONE level or below',
  },
  {
    pattern: /!!error\.text/i,
    entryIds: ['eh_error_variable'],
    description: 'Accessing error message via !!error.text',
  },
  {
    pattern: /DBREF.*conversion|convert.*DBREF/i,
    entryIds: ['dt_dbref_usage', 'pdms_dbref_resolve', 'tc_db_to_pml_mapping'],
    description: 'DBREF conversion issue — check .set()/.badRef() and wrap in HANDLE',
  },
  {
    pattern: /array.*index.*0|index.*out.*of.*range/i,
    entryIds: ['dt_array_declaration', 'arr_iteration'],
    description: 'Array index issue — PML arrays start at 1, not 0',
  },
  {
    pattern: /PMLFILEBROWSER|file.*browser/i,
    entryIds: ['p2_pmlfilebrowser', 'dn_import_statement'],
    description: 'PMLFILEBROWSER usage — requires import and namespace',
  },
  {
    pattern: /SYSCOM/i,
    entryIds: ['p2_syscom'],
    description: 'SYSCOM external command — synchronous by default, use & for async',
  },
  {
    pattern: /DATETIME|DATEFORMAT/i,
    entryIds: ['dt_string_substitution', 'datetime_formatting', 'datetime_creation'],
    description: 'DATETIME/DATEFORMAT usage pattern',
  },
  {
    pattern: /COLLECT|EVALUATE/i,
    entryIds: ['coll_pml1_collect', 'coll_evaluate', 'arr_evaluate_block'],
    description: 'COLLECT/EVALUATE — PML1 database query patterns',
  },
  {
    pattern: /NETGRIDCONTROL|grid.*control/i,
    entryIds: ['p2_netgridcontrol', 'frm_widget_common_params'],
    description: 'NETGRIDCONTROL — requires import GridControl and namespace',
  },
  {
    pattern: /form.*callback|initcall|okcall|cancelcall/i,
    entryIds: ['p2_form_7callbacks', 'frm_callback_syntax', 'frm_initialise_method'],
    description: 'Form lifecycle callbacks — 6 standard: initCall, firstShownCall, okCall, cancelCall, quitCall, killingCall',
  },
  {
    pattern: /HANDLE\s+ANY/i,
    entryIds: ['eh_handle_any', 'eh_import_protection'],
    description: 'HANDLE ANY — catch-all error handler',
  },
];

export interface DiagnoseResult {
  errorPattern: string;
  description: string;
  suggestions: KBEntry[];
}

/** Diagnose a PML error text or code snippet and suggest relevant KB entries */
export function diagnosePmlError(errorText: string): DiagnoseResult[] {
  const results: DiagnoseResult[] = [];

  for (const { pattern, entryIds, description } of ERROR_PATTERNS) {
    if (!pattern.test(errorText)) continue;

    const suggestions = entryIds
      .map(id => allPmlKbEntries.find(e => e.id === id || e.aliases?.includes(id)))
      .filter((e): e is KBEntry => e !== undefined);

    results.push({
      errorPattern: pattern.source,
      description,
      suggestions,
    });
  }

  return results;
}

/** Get related entries for a given entry ID */
export function getRelatedEntries(id: string, limit = 5): KBEntry[] {
  const entry = allPmlKbEntries.find(e => e.id === id || e.aliases?.includes(id));
  if (!entry) return [];

  return entry.relatedIds
    .map(rid => allPmlKbEntries.find(e => e.id === rid || e.aliases?.includes(rid)))
    .filter((e): e is KBEntry => e !== undefined)
    .slice(0, limit);
}
