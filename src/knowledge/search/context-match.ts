import type { KBEntry } from '../schemas/kb-entry.js';
import { getPmlKbEntry } from '../pml-kb/index.js';

/** Direct PML tokens to high-confidence KB entries. Keep this list aligned with validate-kb smoke tests. */
const TOKEN_ENTRY_MAP: Array<{ token: RegExp; ids: string[]; relevance: number }> = [
  { token: /\bPMLFILEBROWSER\b/i, ids: ['p2_pmlfilebrowser', 'dn_import_statement'], relevance: 100 },
  { token: /\bNETGRIDCONTROL\b|selectedCell|selectionByRow|columnExcelFilter/i, ids: ['p2_netgrid_full', 'frm_loader_chain'], relevance: 96 },
  { token: /\bPMLTAGS\b|Aveva\.Engineering\.Tags|PMLElementManager|CreateElements/i, ids: ['p2_pmltags', 'dn_import_statement'], relevance: 95 },
  { token: /\bMEASURE\b|\bUNIT\b/i, ids: ['p2_measure_unit', 'tc_db_to_pml_mapping'], relevance: 94 },
  { token: /\bSYSCOM\b/i, ids: ['p2_syscom', 'syscom_open_file'], relevance: 93 },
  { token: /\bDATEFORMAT\b/i, ids: ['p2_dateformat', 'p2_datetime_api'], relevance: 92 },
  { token: /\bDATETIME\b/i, ids: ['p2_datetime_api', 'datetime_file_timestamp', 'tc_date_parsing'], relevance: 91 },
  { token: /999999999|\bNA\b/i, ids: ['p2_na_replacement', 'tc_real_to_string'], relevance: 90 },
  { token: /\bBACKREFWITHNAME\b|\bBACKREF\b/i, ids: ['p2_backref', 'p2_collect_pml1'], relevance: 89 },
  { token: /\bCOLLECT\b/i, ids: ['p2_collect_pml1', 'p2_evaluate_pml1'], relevance: 88 },
  { token: /\bEVALUATE\b/i, ids: ['p2_evaluate_pml1', 'p2_array_evaluate_block', 'col_evaluate_attributes'], relevance: 87 },
  { token: /\bHANDLE\b|\bENDHANDLE\b|\bELSEHANDLE\b/i, ids: ['eh_handle_any', 'eh_handle_endhandle', 'eh_error_variable'], relevance: 86 },
  { token: /\bDBREF\b|\.badRef\b|\.attribute\(/i, ids: ['dt_dbref_usage', 'pdms_dbref_resolve', 'p2_attribute_dynamic'], relevance: 84 },
  { token: /\bARRAY\b|\.append\(|\.size\(|MaxIndex|sortUnique|evalIndex/i, ids: ['dt_array_declaration', 'arr_methods', 'p2_array_evaluate_block'], relevance: 82 },
  { token: /\bSAVEWORK\b|\bUNCLAIM\b|\bWORKON\b/i, ids: ['pdms_transaction'], relevance: 80 },
  { token: /\bIFDEFINED\b|\bIFUNDEFINED\b/i, ids: ['p2_null_scope', 'dt_unset_handling'], relevance: 78 },
  { token: /initCall|firstShownCall|okCall|cancelCall|quitCall|killingCall/i, ids: ['p2_form_7callbacks', 'frm_callback_syntax'], relevance: 76 },
  { token: /\.bu[A-Z]|\.fr[A-Z]|\.te[A-Z]|\.li[A-Z]|\.op[A-Z]|\.co[A-Z]|\.pa[A-Z]|\.tp[A-Z]|\.me[A-Z]|\.gr[A-Z]/, ids: ['p2_widget_prefix', 'nc_prefix_conventions'], relevance: 74 },
  { token: /\bDO\b|\bENDDO\b/i, ids: ['cf_do_enddo_loop', 'arr_iteration'], relevance: 60 },
  { token: /\bIF\b|\bELSEIF\b|\bENDIF\b/i, ids: ['cf_if_elseif_structure'], relevance: 58 },
  { token: /\bBREAK\b|\bSKIP\b/i, ids: ['cf_break_skip'], relevance: 56 },
  { token: /\bRETURN\b/i, ids: ['cf_return_from_function', 'fnc_return_value'], relevance: 54 },
  { token: /\bIMPORT\b|\bUSING\s+NAMESPACE\b/i, ids: ['dn_import_statement', 'dn_import_guard'], relevance: 52 },
];

export interface ContextMatch {
  entry: KBEntry;
  token: string;
  relevance: number;
}

/** Match PML code context tokens to relevant KB entries. */
export function matchContext(code: string, limit = 10): ContextMatch[] {
  const results: ContextMatch[] = [];
  const seen = new Set<string>();

  for (const { token, ids, relevance } of TOKEN_ENTRY_MAP) {
    const match = code.match(token);
    if (!match) continue;
    for (const id of ids) {
      const entry = getPmlKbEntry(id);
      if (!entry || seen.has(entry.id)) continue;
      seen.add(entry.id);
      results.push({ entry, token: match[0], relevance });
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
}
