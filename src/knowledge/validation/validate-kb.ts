import { existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ALLOWED_CATEGORIES } from '../schemas/kb-entry.js';
import { allPmlKbEntries, entriesByCategory } from '../pml-kb/index.js';
import { searchKb } from '../search/fuzzy-search.js';
import { matchContext } from '../search/context-match.js';

export interface ValidationIssue {
  level: 'error' | 'warning';
  entryId: string;
  field: string;
  message: string;
}

export interface ValidationReport {
  totalEntries: number;
  categoryCount: number;
  issues: ValidationIssue[];
  categorySummary: Record<string, number>;
}

export const REQUIRED_CLAUDE_IDS = [
  'dt_string_declaration','dt_real_declaration','dt_array_declaration','dt_boolean_values','dt_dbref_usage','dt_unset_handling','dt_type_coercion','dt_string_substitution',
  'cf_if_elseif_structure','cf_do_enddo_loop','cf_break_skip','cf_return_from_function','cf_guard_clause','cf_nested_loops',
  'eh_handle_endhandle','eh_handle_any','eh_error_variable','eh_import_protection','eh_nested_handle','eh_logging_pattern',
  'obj_definition_structure','obj_constructor_pattern','obj_member_declaration','obj_method_declaration','obj_delegation_pattern','obj_overloading_delegation','obj_factory_pattern','obj_namespace_loading',
  'frm_file_structure','frm_initialise_method','frm_callback_syntax','frm_widget_common_params','frm_button_callback','frm_list_population','frm_textinput_read','frm_sensitivity_control','frm_form_as_class','frm_loader_chain','frm_show_dismiss',
  'mac_file_structure','mac_arguments','mac_calling_other_macros','mac_output_control','mac_file_path_pattern','mac_pipeline_pattern','mac_global_variables',
  'fnc_definition_syntax','fnc_return_value','fnc_argument_scope','fnc_pdms_navigation','fnc_array_accumulator',
  'dn_import_statement','dn_import_guard','dn_object_instantiation','dn_method_call','dn_type_mapping','dn_excel_read_pattern','dn_file_write_pattern',
  'pdms_current_element','pdms_navigation_commands','pdms_attribute_query','pdms_attribute_update','pdms_element_create','pdms_element_existence','pdms_dbref_resolve','pdms_transaction',
  'nc_variable_naming','nc_object_naming','nc_method_naming','nc_file_naming','nc_prefix_conventions',
  'tc_db_to_pml_mapping','tc_string_to_real','tc_real_to_string','tc_date_parsing','tc_boolean_from_string',
  'log_severity_levels','log_common_logger_api','log_form_integration','log_output_targets','log_contextual_info',
  'ap_loader_chain','ap_form_controller','ap_separation_of_concerns','ap_pipeline_macro','ap_data_object','ap_utility_function',
] as const;

export const REQUIRED_P2_IDS = [
  'p2_pmlfilebrowser','p2_displayprogress','p2_syscom','p2_pmltags','p2_measure_unit','p2_array_evaluate_block','p2_array_reindex','p2_evaluate_pml1','p2_collect_pml1','p2_datetime_api','p2_dateformat','p2_form_7callbacks','p2_netgrid_full','p2_attribute_dynamic','p2_widget_prefix','p2_backref','p2_na_replacement','p2_null_scope',
] as const;

const FORBIDDEN_PLACEHOLDER_PATTERNS = [
  /проверенный PML-паттерн/i,
  /переносить JavaScript\/C#\/Python/i,
  /используйте PML2-объекты, !local\/!!global переменные/i,
  /NOT_FOUND_IN_SOURCES/i,
  /NOTFOUNDINSOURCES/i,
];

const SEARCH_SMOKE: Array<{ query: string; expectedId: string }> = [
  { query: 'HANDLE', expectedId: 'eh_handle_endhandle' },
  { query: 'DATETIME', expectedId: 'p2_datetime_api' },
  { query: 'DATEFORMAT', expectedId: 'p2_dateformat' },
  { query: 'PMLFILEBROWSER', expectedId: 'p2_pmlfilebrowser' },
  { query: 'PMLTAGS', expectedId: 'p2_pmltags' },
  { query: 'MEASURE UNIT', expectedId: 'p2_measure_unit' },
  { query: 'BACKREF', expectedId: 'p2_backref' },
  { query: 'NETGRIDCONTROL', expectedId: 'p2_netgrid_full' },
  { query: '999999999 NA', expectedId: 'p2_na_replacement' },
  { query: 'SYSCOM', expectedId: 'p2_syscom' },
  { query: 'COLLECT', expectedId: 'p2_collect_pml1' },
  { query: 'EVALUATE', expectedId: 'p2_evaluate_pml1' },
];

const CONTEXT_SMOKE: Array<{ code: string; expectedId: string }> = [
  { code: 'HANDLE ANY\nENDHANDLE', expectedId: 'eh_handle_any' },
  { code: 'SYSCOM |copy /y a b|', expectedId: 'p2_syscom' },
  { code: '!dt = OBJECT DATETIME()', expectedId: 'p2_datetime_api' },
  { code: '!fb = object PMLFILEBROWSER(\'OPEN\')', expectedId: 'p2_pmlfilebrowser' },
  { code: 'var !x COLLECT ALL FROM CE', expectedId: 'p2_collect_pml1' },
  { code: 'var !b BACKREF(attname HREF) of $!el', expectedId: 'p2_backref' },
  { code: 'NETGRIDCONTROL selectedCell', expectedId: 'p2_netgrid_full' },
];

function collectCodebaseFiles(): Set<string> {
  const root = join(process.cwd(), 'docs', 'codebase');
  const files = new Set<string>();
  if (!existsSync(root)) return files;
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) visit(full);
      else files.add(entry.toLowerCase());
    }
  };
  visit(root);
  return files;
}

function add(issues: ValidationIssue[], level: ValidationIssue['level'], entryId: string, field: string, message: string): void {
  issues.push({ level, entryId, field, message });
}

function duplicateCanonicalGroups(): Array<{ key: string; ids: string[] }> {
  const groups = new Map<string, string[]>();
  for (const entry of allPmlKbEntries) {
    const key = entry.exampleCanonical.split('\n').slice(0, 4).join('\n').trim();
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), entry.id]);
  }
  return [...groups.entries()]
    .map(([key, ids]) => ({ key, ids }))
    .filter(g => g.ids.length > 5);
}

export function validateKb(): ValidationReport {
  const issues: ValidationIssue[] = [];
  const seenIds = new Map<string, string>();
  const seenAliases = new Map<string, string>();
  const codebaseFiles = collectCodebaseFiles();
  const allowedSet = new Set<string>(ALLOWED_CATEGORIES);
  const categorySummary: Record<string, number> = {};
  const allIds = new Set(allPmlKbEntries.map(e => e.id));

  for (const id of REQUIRED_CLAUDE_IDS) {
    if (!allIds.has(id)) add(issues, 'error', id, 'id', 'Required Claude KB ID is missing');
  }
  for (const id of REQUIRED_P2_IDS) {
    if (!allIds.has(id)) add(issues, 'error', id, 'id', 'Required Perplexity p2 ID is missing');
  }

  for (const entry of allPmlKbEntries) {
    categorySummary[entry.category] = (categorySummary[entry.category] ?? 0) + 1;

    if (seenIds.has(entry.id)) add(issues, 'error', entry.id, 'id', `Duplicate ID: already used by ${seenIds.get(entry.id)}`);
    seenIds.set(entry.id, entry.id);

    for (const alias of entry.aliases ?? []) {
      if (seenIds.has(alias)) add(issues, 'error', entry.id, 'aliases', `Alias "${alias}" conflicts with existing ID`);
      if (seenAliases.has(alias)) add(issues, 'error', entry.id, 'aliases', `Alias "${alias}" also used by ${seenAliases.get(alias)}`);
      seenAliases.set(alias, entry.id);
    }

    if (!allowedSet.has(entry.category)) add(issues, 'error', entry.id, 'category', `Invalid category: "${entry.category}"`);

    for (const field of ['subcategory', 'title', 'principle', 'rule', 'syntax', 'exampleCanonical', 'exampleAntipattern', 'sourcedoc', 'sourcecodebase'] as const) {
      if (!entry[field] || entry[field].trim() === '') add(issues, 'error', entry.id, field, `Field "${field}" is empty`);
    }

    if (!entry.pitfalls || entry.pitfalls.length === 0) add(issues, 'error', entry.id, 'pitfalls', 'pitfalls array must have at least 1 element');

    const serialized = JSON.stringify(entry);
    for (const pattern of FORBIDDEN_PLACEHOLDER_PATTERNS) {
      if (pattern.test(serialized)) add(issues, 'error', entry.id, 'content', `Forbidden placeholder/gap marker matched: ${pattern.source}`);
    }

    if (!entry.exampleCanonical.includes('-- CB ')) {
      add(issues, 'error', entry.id, 'exampleCanonical', 'exampleCanonical must contain "-- CB <filename>" prefix');
    } else if (!entry.exampleCanonical.toLowerCase().includes(entry.sourcecodebase.toLowerCase())) {
      add(issues, 'error', entry.id, 'exampleCanonical', `exampleCanonical CB filename must match sourcecodebase "${entry.sourcecodebase}"`);
    }

    if (entry.sourcecodebase && !codebaseFiles.has(entry.sourcecodebase.toLowerCase())) {
      add(issues, 'error', entry.id, 'sourcecodebase', `Codebase file "${entry.sourcecodebase}" not found in docs/codebase`);
    }

    for (const rid of entry.relatedIds) {
      const found = allPmlKbEntries.some(e => e.id === rid || e.aliases?.includes(rid));
      if (!found) add(issues, 'error', entry.id, 'relatedIds', `Related ID "${rid}" not found in KB`);
    }

    const relatedRequired = /HANDLE|DBREF|ARRAY|\.NET|FORM|DATETIME|SYSCOM|COLLECT|EVALUATE|PMLFILEBROWSER|BACKREF|NETGRIDCONTROL/i.test(`${entry.title}\n${entry.rule}\n${entry.syntax}`);
    if (relatedRequired && entry.relatedIds.length === 0) {
      add(issues, 'error', entry.id, 'relatedIds', 'relatedIds must not be empty for connected HANDLE/DBREF/ARRAY/.NET/FORM/DATETIME/SYSCOM/COLLECT/EVALUATE patterns');
    }
  }

  for (const group of duplicateCanonicalGroups()) {
    add(issues, 'error', group.ids[0], 'exampleCanonical', `Canonical example reused by more than 5 entries: ${group.ids.join(', ')}`);
  }

  for (const { query, expectedId } of SEARCH_SMOKE) {
    const results = searchKb(query, 8).map(r => r.entry.id);
    if (!results.includes(expectedId)) {
      add(issues, 'error', expectedId, 'search', `Search smoke query "${query}" did not return expected ID in top 8. Got: ${results.join(', ')}`);
    }
  }

  for (const { code, expectedId } of CONTEXT_SMOKE) {
    const results = matchContext(code, 8).map(r => r.entry.id);
    if (!results.includes(expectedId)) {
      add(issues, 'error', expectedId, 'context-match', `Context smoke code "${code}" did not return expected ID in top 8. Got: ${results.join(', ')}`);
    }
  }

  return {
    totalEntries: allPmlKbEntries.length,
    categoryCount: entriesByCategory.size,
    issues,
    categorySummary,
  };
}

function printReportAndExit(): void {
  const report = validateKb();
  console.log('\nKB Validation Report');
  console.log('====================');
  console.log(`Total entries: ${report.totalEntries}`);
  console.log(`Categories: ${report.categoryCount}`);
  console.log(`Issues: ${report.issues.length}`);

  for (const [cat, count] of Object.entries(report.categorySummary).sort()) {
    console.log(`  ${cat}: ${count} entries`);
  }

  if (report.issues.length > 0) {
    console.log('\nIssues:');
    for (const issue of report.issues) {
      console.log(`  [${issue.level.toUpperCase()}] ${issue.entryId}.${issue.field}: ${issue.message}`);
    }
    process.exit(1);
  }

  console.log('\n✅ All checks passed.');
  process.exit(0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  printReportAndExit();
}
