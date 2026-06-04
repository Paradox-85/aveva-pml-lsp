#!/usr/bin/env python3
"""Import KB v4 entries authorized in kb-v4-manual-validation.xlsx.

Safety:
- Imports only rows with userDecision=IMPORT.
- Uses userCategory as authoritative category.
- Does not add new categories.
- Repairs missing mandatory fields to satisfy current validate-kb.ts.
"""
from __future__ import annotations

import json
import re
import zipfile
import html
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
REPORTS = ROOT / 'docs/factory/reports'
WORKBOOK = REPORTS / 'kb-v4-manual-validation.xlsx'
ANALYSIS = REPORTS / 'kb-v4-gap-analysis.json'
PATCH_DIR = ROOT / 'docs/factory/kb-patches'
GAP_DIR = ROOT / 'docs/factory/gap-reports'
KB_DIR = ROOT / 'src/knowledge/pml-kb'
STATE = ROOT / 'docs/factory/logs/kb-v4-run-state.json'
PIPELINE_LOG = ROOT / 'docs/factory/logs/pipeline.log.md'

ALLOWED = {
    'datatypes','controlflow','errorhandling','objects','forms','macros','functions','dotnetinterop',
    'pdmsinteraction','namingconventions','typeconversion','logging','architecturepatterns','arrays',
    'collections','datetime','ui','syscom'
}
TARGET_MODULE = {cat: KB_DIR / f'{cat}.ts' for cat in ALLOWED}

ALREADY_IMPORTED = {
    'd7_attribute_hash_validation','d7_attribute_type_gated_assignment','d7_element_creation_api',
    'd7_netgridcontrol_excel_io','d7_special_char_stripping','d7_display_progress','d7_savework_unclaim',
    'd7_string_dbref_conversion','dbref_attribute_access_assignment','loopdata_object',
    'net_grid_data_source_workflow','obj_measure_unit','obj_ptmltags_export','obj_ramcommonlogger',
    'pdms_collect_all_multi_class','pdms_dtxr_attribute','pdms_namn_attribute','pml1_lstdef_query',
    'string_interpolation_dollar_var'
}

FALLBACK_RELATED = {
    'datatypes': ['dt_string_declaration'],
    'controlflow': ['cf_do_enddo_loop'],
    'errorhandling': ['eh_handle_any'],
    'objects': ['obj_definition_structure'],
    'forms': ['frm_callback_syntax'],
    'macros': ['mac_file_structure'],
    'functions': ['fnc_definition_syntax'],
    'dotnetinterop': ['dn_import_statement'],
    'pdmsinteraction': ['pdms_attribute_query'],
    'namingconventions': ['nc_variable_naming'],
    'typeconversion': ['tc_db_to_pml_mapping'],
    'logging': ['log_common_logger_api'],
    'architecturepatterns': ['ap_pipeline_macro'],
    'arrays': ['dt_array_declaration'],
    'collections': ['p2_collect_pml1'],
    'datetime': ['p2_datetime_api'],
    'ui': ['p2_displayprogress'],
    'syscom': ['p2_syscom'],
}

CONNECTED_RE = re.compile(r'HANDLE|DBREF|ARRAY|\.NET|FORM|DATETIME|SYSCOM|COLLECT|EVALUATE|PMLFILEBROWSER|BACKREF|NETGRIDCONTROL', re.I)


def read_xlsx_rows(path: Path) -> list[dict[str, str]]:
    ns = {'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    with zipfile.ZipFile(path) as z:
        shared: list[str] = []
        if 'xl/sharedStrings.xml' in z.namelist():
            root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in root.findall('a:si', ns):
                shared.append(''.join((t.text or '') for t in si.findall('.//a:t', ns)))
        sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))

    def col_idx(ref: str) -> int:
        m = re.match(r'([A-Z]+)', ref)
        if not m:
            return 0
        n = 0
        for ch in m.group(1):
            n = n * 26 + ord(ch) - 64
        return n - 1

    def cell_value(c: ET.Element) -> str:
        t = c.attrib.get('t')
        if t == 'inlineStr':
            el = c.find('a:is/a:t', ns)
            return el.text if el is not None and el.text is not None else ''
        v = c.find('a:v', ns)
        if v is None or v.text is None:
            return ''
        if t == 's':
            return shared[int(v.text)]
        if t == 'b':
            return 'TRUE' if v.text == '1' else 'FALSE'
        return v.text

    matrix: list[list[str]] = []
    for row in sheet.findall('.//a:sheetData/a:row', ns):
        vals: list[str] = []
        for c in row.findall('a:c', ns):
            idx = col_idx(c.attrib.get('r', 'A1'))
            while len(vals) <= idx:
                vals.append('')
            vals[idx] = cell_value(c)
        matrix.append(vals)
    headers = matrix[0]
    out = []
    for vals in matrix[1:]:
        out.append({h: (vals[i] if i < len(vals) else '') for i, h in enumerate(headers)})
    return out


def collect_existing_ids() -> set[str]:
    ids = set()
    for f in KB_DIR.glob('*.ts'):
        text = f.read_text(encoding='utf-8')
        for m in re.finditer(r'["\']id["\']\s*:\s*["\']([^"\']+)["\']|\bid\s*:\s*["\']([^"\']+)["\']', text):
            ids.add(m.group(1) or m.group(2))
    return ids


def source_basenames() -> set[str]:
    root = ROOT / 'docs/codebase'
    return {p.name.lower() for p in root.rglob('*') if p.is_file()}


def extract_object_block(text: str, key: str) -> str | None:
    patterns = [f"id: '{key}'", f'id: "{key}"', f"suggestedId: '{key}'", f'suggestedId: "{key}"']
    idx = -1
    for pat in patterns:
        idx = text.find(pat)
        if idx >= 0:
            break
    if idx < 0:
        return None
    start = text.rfind('{', 0, idx)
    if start < 0:
        return None
    depth = 0
    instr = None
    esc = False
    for i in range(start, len(text)):
        ch = text[i]
        if instr:
            if esc:
                esc = False
            elif ch == '\\':
                esc = True
            elif ch == instr:
                instr = None
            continue
        if ch in ('"', "'", '`'):
            instr = ch
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return text[start:i + 1]
    return None


def prop(block: str | None, name: str) -> str:
    if not block:
        return ''
    m = re.search(rf'\b{name}\s*:\s*(["\'`])([\s\S]*?)\1', block)
    return m.group(2) if m else ''


def arr_prop(block: str | None, name: str) -> list[str]:
    if not block:
        return []
    m = re.search(rf'\b{name}\s*:\s*\[([\s\S]*?)\]', block)
    if not m:
        return []
    return [x.group(1) for x in re.finditer(r'["\']([^"\']+)["\']', m.group(1))]


def find_patch_block(candidate_id: str) -> str | None:
    for f in PATCH_DIR.glob('*_kb_patch.ts'):
        b = extract_object_block(f.read_text(encoding='utf-8', errors='ignore'), candidate_id)
        if b:
            return b
    return None


def find_gap_object(candidate_id: str) -> dict | None:
    for f in GAP_DIR.glob('*_gap.json'):
        try:
            data = json.loads(f.read_text(encoding='utf-8'))
        except Exception:
            continue
        stack = [data]
        while stack:
            cur = stack.pop()
            if isinstance(cur, dict):
                if cur.get('id') == candidate_id or cur.get('suggestedId') == candidate_id:
                    return cur
                stack.extend(cur.values())
            elif isinstance(cur, list):
                stack.extend(cur)
    return None


def clean_text(s: str) -> str:
    if s is None:
        return ''
    s = str(s)
    if s.lower() == 'nan':
        return ''
    return s.strip()


def humanize(candidate_id: str) -> str:
    return re.sub(r'[_-]+', ' ', candidate_id).strip().title()


def module_append(file: Path, entries: list[dict]) -> None:
    if not entries:
        return
    text = file.read_text(encoding='utf-8')
    idx = text.rfind('\n];')
    if idx < 0:
        raise RuntimeError(f'Closing ]; not found in {file}')
    prefix = text[:idx].rstrip()
    if not prefix.endswith(','):
        prefix += ','
    rendered = []
    for e in entries:
        rendered.append('  ' + json.dumps(e, ensure_ascii=False, indent=2).replace('\n', '\n  '))
    file.write_text(prefix + '\n' + ',\n'.join(rendered) + '\n];\n', encoding='utf-8')


def normalize_sourcecodebase(raw: str, sources: set[str]) -> str:
    raw = clean_text(raw)
    if not raw:
        return ''
    parts = [p.strip() for p in re.split(r'[,;]', raw) if p.strip()]
    for part in parts:
        name = Path(part).name
        if name.lower() in sources:
            return name
    return Path(parts[0]).name if parts else raw


def build_entry(row: dict[str, str], existing_or_import_ids: set[str], sources: set[str]) -> tuple[dict, dict]:
    cid = clean_text(row['candidateId'])
    block = find_patch_block(cid)
    gap_obj = find_gap_object(cid)

    def field(name: str) -> str:
        if gap_obj and clean_text(gap_obj.get(name, '')):
            return clean_text(gap_obj.get(name, ''))
        return clean_text(prop(block, name))

    category = clean_text(row.get('userCategory')) or clean_text(row.get('proposedCategory'))
    if category not in ALLOWED:
        raise RuntimeError(f'{cid}: invalid userCategory {category!r}')
    source = normalize_sourcecodebase(clean_text(row.get('sourcecodebase')) or field('sourcecodebase'), sources)
    subcategory = clean_text(row.get('subcategory')) or field('subcategory') or 'general'
    title = clean_text(row.get('title')) or field('title') or humanize(cid)
    principle = field('principle') or f'Validated PML pattern for {title}.'
    rule = field('rule') or principle
    syntax = field('syntax') or field('exampleCanonical') or f'-- Pattern: {title}'
    canonical = field('exampleCanonical') or f'-- Pattern: {title}'
    if source and not canonical.lower().startswith('-- cb'):
        canonical = f'-- CB {source}\n{canonical}'
    elif source and source.lower() not in canonical.lower():
        canonical = f'-- CB {source}\n{canonical}'
    antipattern = field('exampleAntipattern') or f'-- WRONG: omit validated pattern for {title}\n-- Review source {source or "codebase"} before reuse'
    sourcedoc = field('sourcedoc') or 'AVEVA PML Reference'

    pitfalls = []
    if gap_obj and isinstance(gap_obj.get('pitfalls'), list):
        pitfalls = [clean_text(x) for x in gap_obj['pitfalls'] if clean_text(x)]
    if not pitfalls:
        pitfalls = arr_prop(block, 'pitfalls')
    if not pitfalls:
        pitfalls = [f'Validate {title} against {source or "the source codebase"} before reuse.']

    requested_related = [x.strip() for x in clean_text(row.get('userRelatedIds')).split(',') if x.strip()]
    related = requested_related
    if not related:
        if gap_obj and isinstance(gap_obj.get('relatedIds'), list):
            related = [clean_text(x) for x in gap_obj['relatedIds'] if clean_text(x)]
        if not related:
            related = arr_prop(block, 'relatedIds')
    related = [r for r in related if r in existing_or_import_ids and r != cid]
    connected_text = f'{title}\n{rule}\n{syntax}'
    if CONNECTED_RE.search(connected_text) and not related:
        related = [r for r in FALLBACK_RELATED.get(category, []) if r in existing_or_import_ids and r != cid]
    related = list(dict.fromkeys(related))

    entry = {
        'id': cid,
        'category': category,
        'subcategory': subcategory,
        'title': title,
        'principle': principle,
        'rule': rule,
        'syntax': syntax,
        'exampleCanonical': canonical,
        'exampleAntipattern': antipattern,
        'pitfalls': pitfalls,
        'relatedIds': related,
        'sourcedoc': sourcedoc,
        'sourcecodebase': source,
    }
    meta = {'hasPatchBlock': bool(block), 'hasGapObject': bool(gap_obj), 'importBatch': clean_text(row.get('importBatch')), 'userNotes': clean_text(row.get('userNotes'))}
    return entry, meta


def main() -> None:
    rows = read_xlsx_rows(WORKBOOK)
    decisions = Counter(clean_text(r.get('userDecision')) for r in rows)
    import_rows = [r for r in rows if clean_text(r.get('userDecision')) == 'IMPORT']
    rejected_rows = [r for r in rows if clean_text(r.get('userDecision')) == 'REJECT']
    if len(import_rows) != 371 or len(rejected_rows) != 68:
        raise RuntimeError(f'Unexpected workbook counts: {decisions}')

    existing_ids = collect_existing_ids()
    import_ids = {clean_text(r['candidateId']) for r in import_rows}
    all_future_ids = set(existing_ids) | import_ids
    sources = source_basenames()

    by_file: dict[Path, list[dict]] = defaultdict(list)
    imported: list[dict] = []
    skipped_existing = []
    errors = []
    for row in import_rows:
        cid = clean_text(row['candidateId'])
        if cid in existing_ids:
            skipped_existing.append(cid)
            continue
        try:
            entry, meta = build_entry(row, all_future_ids, sources)
            if not entry['sourcecodebase'] or entry['sourcecodebase'].lower() not in sources:
                raise RuntimeError(f'{cid}: sourcecodebase missing/not found: {entry["sourcecodebase"]!r}')
            target = clean_text(row.get('userTargetModule')) or str(TARGET_MODULE[entry['category']]).replace('\\', '/')
            target_path = ROOT / target if not Path(target).is_absolute() else Path(target)
            if target_path.name != f'{entry["category"]}.ts':
                target_path = TARGET_MODULE[entry['category']]
            by_file[target_path].append(entry)
            imported.append({'id': cid, 'category': entry['category'], 'target': str(target_path.relative_to(ROOT)).replace('\\','/'), **meta})
        except Exception as exc:
            errors.append({'id': cid, 'error': str(exc)})

    if errors:
        err_path = REPORTS / 'kb-v4-validated-import-errors.json'
        err_path.write_text(json.dumps(errors, ensure_ascii=False, indent=2), encoding='utf-8')
        raise RuntimeError(f'Import preparation has {len(errors)} errors; see {err_path}')

    for file, entries in sorted(by_file.items(), key=lambda kv: str(kv[0])):
        module_append(file, entries)

    now = datetime.now(timezone.utc).isoformat()
    summary = {
        'generatedAt': now,
        'workbook': str(WORKBOOK).replace('\\','/'),
        'authorizedImportRows': len(import_rows),
        'authorizedRejectRows': len(rejected_rows),
        'importedNewEntries': len(imported),
        'skippedExisting': skipped_existing,
        'byCategory': dict(Counter(x['category'] for x in imported)),
        'byTarget': dict(Counter(x['target'] for x in imported)),
        'imported': imported,
        'rejectedIds': [clean_text(r['candidateId']) for r in rejected_rows],
        'validationRequired': ['npm run validate:kb', 'npm run typecheck', 'npm test'],
    }
    (REPORTS / 'kb-v4-validated-import.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
    md = '# KB v4 Validated Workbook Import\n\n'
    md += f'Generated: {now}\n\n'
    md += f'- Authorized IMPORT rows: {len(import_rows)}\n'
    md += f'- Authorized REJECT rows: {len(rejected_rows)}\n'
    md += f'- Imported new entries: {len(imported)}\n'
    md += f'- Skipped existing: {len(skipped_existing)}\n\n'
    md += '## By category\n\n' + '\n'.join(f'- {k}: {v}' for k, v in sorted(summary['byCategory'].items())) + '\n\n'
    md += '## Validation\n\nRun after import: `npm run validate:kb`, `npm run typecheck`, `npm test`.\n'
    (REPORTS / 'kb-v4-validated-import.md').write_text(md, encoding='utf-8')

    state = json.loads(STATE.read_text(encoding='utf-8')) if STATE.exists() else {}
    state.update({
        'generatedAt': now,
        'step': 'validated-workbook-import-applied',
        'validatedWorkbookImport': {
            'authorizedImportRows': len(import_rows),
            'authorizedRejectRows': len(rejected_rows),
            'importedNewEntries': len(imported),
            'skippedExisting': skipped_existing,
            'reports': ['docs/factory/reports/kb-v4-validated-import.json', 'docs/factory/reports/kb-v4-validated-import.md'],
        },
        'nextAction': 'run validation commands after validated workbook import',
    })
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding='utf-8')
    with PIPELINE_LOG.open('a', encoding='utf-8') as f:
        f.write(f'\n\n## KB v4 validated workbook import — {now}\n\n')
        f.write(f'- Authorized IMPORT rows: {len(import_rows)}\n')
        f.write(f'- Authorized REJECT rows: {len(rejected_rows)}\n')
        f.write(f'- Imported new entries: {len(imported)}\n')
        f.write(f'- Report: `docs/factory/reports/kb-v4-validated-import.md`\n')
    print(json.dumps({k: summary[k] for k in ['authorizedImportRows','authorizedRejectRows','importedNewEntries','skippedExisting','byCategory']}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
