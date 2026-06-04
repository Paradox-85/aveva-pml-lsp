#!/usr/bin/env python3
"""Cleanup/repair fallback-like KB v4 entries per user-approved Variant B.

Variant B:
- remove cb_* fallback stubs except 4 repair exceptions
- remove explicit duplicate IDs
- additionally remove mac_08:unknown:72 and mac_08:unknown:76
- repair approved entries by replacing placeholder content with source-backed snippets
"""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
KB_DIR = ROOT / 'src/knowledge/pml-kb'
CODEBASE = ROOT / 'docs/codebase'
REPORTS = ROOT / 'docs/factory/reports'
LOGS = ROOT / 'docs/factory/logs'

REPAIR_IDS = set('''
mac_08:unknown:73 mac_08:unknown:74 mac_08:unknown:75 mac_08:unknown:77
mac_20:unknown:167 mac_20:unknown:168 mac_20:unknown:173 mac_20:unknown:174
mac_20:unknown:175 mac_20:unknown:177 mac_20:unknown:178
mac_22:unknown:195 mac_22:unknown:197 mac_22:unknown:198 mac_22:unknown:200
mac_25:unknown:207 mac_27:unknown:210 mac_27:unknown:211
cb_deslnk_attribute_fallback cb_pml1_collect_values_dbref
cb_netgrid_excel_export_macro cb_macro_dual_source_pipe_attribute_export
measure-unit-setunits-defaults engineering-tags-common-attribute-map
array-tabular-normalisation-defined-set objects-error-global
objects-ram-aepml-excel-reader objects-string-join-method
logger-form-refresh-side-effect
'''.split())

CB_EXCEPTIONS = {
    'cb_deslnk_attribute_fallback',
    'cb_pml1_collect_values_dbref',
    'cb_netgrid_excel_export_macro',
    'cb_macro_dual_source_pipe_attribute_export',
}

REMOVE_DUPLICATES = {
  'mac_20:unknown:169', 'mac_20:unknown:170', 'mac_20:unknown:171',
  'mac_20:unknown:172', 'mac_20:unknown:176', 'mac_21:unknown:184',
  'mac_21:unknown:185', 'mac_21:unknown:186', 'mac_21:unknown:187',
  'mac_21:unknown:188', 'mac_22:unknown:196', 'mac_22:unknown:199',
  'mac_22:unknown:201', 'mac_08:unknown:71',
  'macro-error-label-savework-unclaim',
  'objects-array-block-evaluate', 'objects-pmlfilebrowser-showopen',
  'objects-ramcommonlogger', 'objects-string-set-neq-methods',
  # Variant B extra duplicate removals
  'mac_08:unknown:72', 'mac_08:unknown:76',
}

KEYWORDS = {
    'mac_08:unknown:73': ['objecttype', 'attribute'],
    'mac_08:unknown:74': ['Hash', 'mapping', 'attribute'],
    'mac_08:unknown:75': ['empty', 'unset', 'NA', '0'],
    'mac_08:unknown:77': ['replace', 'special'],
    'mac_20:unknown:167': ['.after', 'after('],
    'mac_20:unknown:168': ['DELETE', 'MEM'],
    'mac_20:unknown:173': ['DBVW', 'DbView'],
    'mac_20:unknown:174': ['EXPFILTER', 'EXPCOLUMN', 'ATTCOLUMN', 'EXPFIL', 'EXPCOL', 'ATTCOL'],
    'mac_20:unknown:175': ['ELEL ADD', 'ELEL REM', 'ELEL'],
    'mac_20:unknown:177': ['UTYP'],
    'mac_20:unknown:178': ['do !', 'objecttype', 'dispatch'],
    'mac_22:unknown:195': ['PMLTAGS', 'GetListDefinition'],
    'mac_22:unknown:197': ['OLD'],
    'mac_22:unknown:198': ['SETCOMPDATE'],
    'mac_22:unknown:200': ['findfirst', '.set'],
    'mac_25:unknown:207': ['!!ce', 'ce.'],
    'mac_27:unknown:210': ['COLLECT ALL', '/tree'],
    'mac_27:unknown:211': ['ALPHA FILE', 'OUTPUT', 'TABULATE', 'CHANGES SINCE'],
    'cb_deslnk_attribute_fallback': ['deslnk', 'handle', 'elsehandle'],
    'cb_pml1_collect_values_dbref': ['COLL ALL', 'VALUES', 'dbref'],
    'cb_netgrid_excel_export_macro': ['NETGRIDCONTROL', 'NETDATASOURCE', 'saveGridToExcel'],
    'cb_macro_dual_source_pipe_attribute_export': ['AE3D', 'AE', 'pipe'],
    'measure-unit-setunits-defaults': ['MEASURE', 'UNIT', 'setunits'],
    'engineering-tags-common-attribute-map': ['attribute', 'map', 'header'],
    'array-tabular-normalisation-defined-set': ['defined', 'set', 'Join', 'append'],
    'objects-error-global': ['!!Error', 'elsehandle'],
    'objects-ram-aepml-excel-reader': ['RamAEPMLExcelReader', 'RamPMLExcelReader', 'ExcelReader'],
    'objects-string-join-method': ['.Join', 'Join()'],
    'logger-form-refresh-side-effect': ['background', 'refresh', 'form'],
}

PRINCIPLES = {
    'mac_08:unknown:73': 'Attribute assignment can be gated by objecttype() so different element classes receive the correct attribute values.',
    'mac_08:unknown:74': 'Mapping-table lookups often need a primary attribute and a fallback attribute when the preferred value is absent.',
    'mac_08:unknown:75': 'Export/import filters should reject empty, unset, NA-like, and zero sentinel values before processing.',
    'mac_08:unknown:77': 'Iterative STRING.replace() calls can normalize special characters before comparing or exporting values.',
    'mac_20:unknown:167': 'STRING.after() extracts the suffix after a marker and is useful for parsing generated command/text fields.',
    'mac_20:unknown:168': 'PDMS DELETE MEM commands can remove members using dollar-substituted element references.',
    'mac_20:unknown:173': 'DbView creation is a multi-command lifecycle that creates DBVW and then configures filters/columns/lists.',
    'mac_20:unknown:174': 'DbView sub-objects such as EXPFILTER, EXPCOLUMN and ATTCOLUMN define filtering and extraction columns.',
    'mac_20:unknown:175': 'ELEL ADD and ELEL REM manage element-list membership for DbView extraction scopes.',
    'mac_20:unknown:177': 'UTYP sets the expected value type for DbView columns and must match the exported attribute/expression.',
    'mac_20:unknown:178': 'Data-driven macro templates can dispatch behavior by element or attribute type instead of hard-coding one path.',
    'mac_22:unknown:195': 'PMLTAGS and GetListDefinition provide a tag-list API used before delta/export processing.',
    'mac_22:unknown:197': 'OLD-prefixed delta queries read historical values for comparison against current ENGITEM data.',
    'mac_22:unknown:198': 'SETCOMPDATE STAMP establishes the comparison timestamp used by delta tag queries.',
    'mac_22:unknown:200': 'ARRAY.findFirst().set() is a compact membership guard before appending or processing duplicates.',
    'mac_25:unknown:207': '!!CE dot notation accesses current-element properties directly in command/report macros.',
    'mac_27:unknown:210': 'COLLECT ALL with a tree filter restricts collection to elements under a specific tree/root expression.',
    'mac_27:unknown:211': 'ALPHA FILE reporting chains combine OUTPUT/TABULATE/CHANGES SINCE before closing the alpha output file.',
    'cb_deslnk_attribute_fallback': 'Relationship-derived attribute reads should be protected with HANDLE fallback when DESLNK navigation is absent.',
    'cb_pml1_collect_values_dbref': 'PML1 collection pipelines often chain COLLECT/COLL ALL, VALUES iteration and DBREF conversion.',
    'cb_netgrid_excel_export_macro': 'GridControl exports bind NETDATASOURCE data to NETGRIDCONTROL and save the grid to Excel.',
    'cb_macro_dual_source_pipe_attribute_export': 'Pipe attribute exports may need to merge AE3D and AE sources with fallback selection.',
    'measure-unit-setunits-defaults': 'MEASURE and UNIT objects should set explicit units/defaults before numeric export or conversion.',
    'engineering-tags-common-attribute-map': 'A two-column attribute map centralizes Engineering Tags source and target attribute names.',
    'array-tabular-normalisation-defined-set': 'Sparse ARRAY rows need defined/set guards and width normalization before tabular export.',
    'objects-error-global': '!!Error carries details from HANDLE/ELSEHANDLE blocks and should be logged before recovery.',
    'objects-ram-aepml-excel-reader': 'RamAEPMLExcelReader wraps Excel reading behavior for reusable PML object workflows.',
    'objects-string-join-method': 'ARRAY.Join() converts array values to delimited text for logs or export cells.',
    'logger-form-refresh-side-effect': 'Logger-side UI refresh flags can be communicated through gadget state such as background color.',
}

RULES = {k: v.replace(' should ', ' must ').replace(' can ', ' can ') for k, v in PRINCIPLES.items()}


def json_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def find_source(name: str) -> Path | None:
    name = Path(name).name
    matches = [p for p in CODEBASE.rglob('*') if p.is_file() and p.name.lower() == name.lower()]
    return matches[0] if matches else None


def extract_value(block: str, key: str) -> str:
    m = re.search(rf'"{re.escape(key)}"\s*:\s*"((?:\\.|[^"\\])*)"', block)
    if not m:
        return ''
    try:
        return json.loads('"' + m.group(1) + '"')
    except Exception:
        return m.group(1)


def find_snippet(source_path: Path, entry_id: str, title: str) -> str:
    text = source_path.read_text(encoding='utf-8', errors='ignore')
    lines = text.splitlines()
    needles = KEYWORDS.get(entry_id, [])
    if not needles:
        needles = [w for w in re.split(r'\W+', title) if len(w) > 4][:4]
    lower_lines = [l.lower() for l in lines]

    best_idx = None
    best_score = -1
    for i, line in enumerate(lower_lines):
        score = sum(1 for n in needles if n.lower() in line)
        if score > best_score:
            best_score = score
            best_idx = i
    if best_idx is None or best_score <= 0:
        best_idx = 0

    start = max(0, best_idx - 4)
    end = min(len(lines), best_idx + 11)
    # Expand to include nearby handle/endhandle or if/endif boundaries where cheap.
    snippet = lines[start:end]
    # Keep snippets bounded and non-empty.
    snippet = [l.rstrip() for l in snippet if l.strip()]
    if len(snippet) > 15:
        snippet = snippet[:15]
    if not snippet:
        snippet = [f'-- Source pattern not isolated automatically; review {source_path.name}']
    return '\n'.join(snippet)


def replace_string_field(block: str, key: str, value: str) -> str:
    pattern = rf'("{re.escape(key)}"\s*:\s*)"(?:\\.|[^"\\])*"'
    repl = rf'\1{json_string(value)}'
    new, count = re.subn(pattern, repl, block, count=1)
    if count == 0:
        # Insert after title if missing.
        new = re.sub(r'("title"\s*:\s*"(?:\\.|[^"\\])*",)', rf'\1\n    "{key}": {json_string(value)},', block, count=1)
    return new


def replace_array_field(block: str, key: str, values: list[str]) -> str:
    arr = json.dumps(values, ensure_ascii=False, indent=6)
    arr = arr.replace('\n', '\n    ')
    pattern = rf'("{re.escape(key)}"\s*:\s*)\[[\s\S]*?\]'
    repl = rf'\1{arr}'
    return re.sub(pattern, repl, block, count=1)


def repair_block(block: str, entry_id: str) -> tuple[str, dict]:
    title = extract_value(block, 'title') or entry_id
    source = extract_value(block, 'sourcecodebase')
    source_path = find_source(source)
    if not source_path:
        raise RuntimeError(f'{entry_id}: source file not found: {source!r}')
    snippet = find_snippet(source_path, entry_id, title)
    canonical = f'-- CB {source}\n{snippet}'
    syntax = snippet.split('\n')[0]
    if len(snippet.split('\n')) > 1:
        syntax += '\n' + snippet.split('\n')[1]
    principle = PRINCIPLES.get(entry_id, f'{title} is a source-backed PML pattern from {source}.')
    rule = RULES.get(entry_id, f'Use the {title} pattern only in the source-backed context shown in {source}.')
    antipattern = f'-- WRONG: use {title} without validating the source context in {source}'
    pitfalls = [
        f'Validate against {source} before reusing the pattern.',
        'Keep source-specific names and database context explicit when adapting this snippet.',
    ]
    block = replace_string_field(block, 'principle', principle)
    block = replace_string_field(block, 'rule', rule)
    block = replace_string_field(block, 'syntax', syntax)
    block = replace_string_field(block, 'exampleCanonical', canonical)
    block = replace_string_field(block, 'exampleAntipattern', antipattern)
    block = replace_array_field(block, 'pitfalls', pitfalls)
    return block, {'id': entry_id, 'source': source, 'sourcePath': str(source_path.relative_to(ROOT)).replace('\\', '/'), 'snippetLines': len(snippet.splitlines())}


def iter_objects(text: str):
    positions = []
    for m in re.finditer(r'\n\s*\{\n\s+"id"\s*:', text):
        positions.append(m.start() + 1)
    for idx, start in enumerate(positions):
        next_start = positions[idx + 1] if idx + 1 < len(positions) else text.rfind('\n];')
        if next_start < 0:
            next_start = len(text)
        yield start, next_start, text[start:next_start]


def get_id(block: str) -> str | None:
    m = re.search(r'"id"\s*:\s*"([^"]+)"', block)
    return m.group(1) if m else None


def is_fallback(block: str) -> bool:
    return 'Validated PML pattern for' in block or '-- Pattern:' in block


def main() -> None:
    removed = []
    repaired = []
    errors = []
    all_ids = set()
    fallback_ids = set()

    # Determine exact remove ids from current files.
    for file in KB_DIR.glob('*.ts'):
        text = file.read_text(encoding='utf-8')
        for _, _, block in iter_objects(text):
            eid = get_id(block)
            if not eid:
                continue
            all_ids.add(eid)
            if is_fallback(block):
                fallback_ids.add(eid)

    remove_cb = {eid for eid in fallback_ids if eid.startswith('cb_') and eid not in CB_EXCEPTIONS}
    remove_ids = (remove_cb | REMOVE_DUPLICATES) & all_ids

    for file in sorted(KB_DIR.glob('*.ts')):
        text = file.read_text(encoding='utf-8')
        out = []
        last = 0
        changed = False
        for start, end, block in iter_objects(text):
            out.append(text[last:start])
            eid = get_id(block)
            if eid in remove_ids:
                removed.append({'id': eid, 'file': str(file.relative_to(ROOT)).replace('\\', '/')})
                changed = True
                # Drop leading/trailing comma in this object block carefully.
                last = end
                continue
            if eid in REPAIR_IDS:
                try:
                    new_block, meta = repair_block(block, eid)
                    out.append(new_block)
                    repaired.append({'id': eid, 'file': str(file.relative_to(ROOT)).replace('\\', '/'), **meta})
                    changed = True
                except Exception as exc:
                    errors.append({'id': eid, 'file': str(file.relative_to(ROOT)).replace('\\', '/'), 'error': str(exc)})
                    out.append(block)
            else:
                out.append(block)
            last = end
        out.append(text[last:])
        if changed:
            new_text = ''.join(out)
            # Normalize accidental comma gaps caused by object deletion.
            new_text = re.sub(r',\s*,', ',', new_text)
            new_text = re.sub(r'\[\s*,', '[', new_text)
            new_text = re.sub(r',\s*\n\];', '\n];', new_text)
            file.write_text(new_text, encoding='utf-8')

    if errors:
        (REPORTS / 'kb-v4-fallback-cleanup-errors.json').write_text(json.dumps(errors, ensure_ascii=False, indent=2), encoding='utf-8')
        raise RuntimeError(f'Repair errors: {len(errors)}')

    # Recount remaining fallback-like entries.
    remaining_fallback = []
    total_entries = 0
    for file in KB_DIR.glob('*.ts'):
        text = file.read_text(encoding='utf-8')
        for _, _, block in iter_objects(text):
            eid = get_id(block)
            if eid:
                total_entries += 1
                if is_fallback(block):
                    remaining_fallback.append({'id': eid, 'file': str(file.relative_to(ROOT)).replace('\\', '/')})

    now = datetime.now(timezone.utc).isoformat()
    summary = {
        'generatedAt': now,
        'variant': 'B',
        'removedCount': len(removed),
        'repairedCount': len(repaired),
        'remainingFallbackLikeCount': len(remaining_fallback),
        'totalEntriesAfterCleanup': total_entries,
        'removedByFile': dict(Counter(x['file'] for x in removed)),
        'repairedByFile': dict(Counter(x['file'] for x in repaired)),
        'remainingFallbackLike': remaining_fallback,
        'removed': sorted(removed, key=lambda x: (x['file'], x['id'])),
        'repaired': sorted(repaired, key=lambda x: (x['file'], x['id'])),
    }
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / 'kb-v4-fallback-cleanup.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
    md = '# KB v4 Fallback Cleanup — Variant B\n\n'
    md += f'Generated: {now}\n\n'
    md += f'- Removed entries: {len(removed)}\n'
    md += f'- Repaired entries: {len(repaired)}\n'
    md += f'- Remaining fallback-like entries: {len(remaining_fallback)}\n'
    md += f'- Total entries after cleanup: {total_entries}\n\n'
    md += '## Remaining fallback-like entries\n\n'
    if remaining_fallback:
        md += '\n'.join(f"- `{x['id']}` ({x['file']})" for x in remaining_fallback) + '\n'
    else:
        md += 'None.\n'
    (REPORTS / 'kb-v4-fallback-cleanup.md').write_text(md, encoding='utf-8')

    state_path = LOGS / 'kb-v4-run-state.json'
    state = json.loads(state_path.read_text(encoding='utf-8')) if state_path.exists() else {}
    state.update({
        'generatedAt': now,
        'step': 'fallback-cleanup-variant-b-applied',
        'fallbackCleanup': {
            'variant': 'B',
            'removedCount': len(removed),
            'repairedCount': len(repaired),
            'remainingFallbackLikeCount': len(remaining_fallback),
            'totalEntriesAfterCleanup': total_entries,
            'reports': ['docs/factory/reports/kb-v4-fallback-cleanup.json', 'docs/factory/reports/kb-v4-fallback-cleanup.md'],
        },
        'nextAction': 'run validation after fallback cleanup',
    })
    LOGS.mkdir(parents=True, exist_ok=True)
    state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding='utf-8')
    with (LOGS / 'pipeline.log.md').open('a', encoding='utf-8') as f:
        f.write(f'\n\n## KB v4 fallback cleanup Variant B — {now}\n\n')
        f.write(f'- Removed entries: {len(removed)}\n')
        f.write(f'- Repaired entries: {len(repaired)}\n')
        f.write(f'- Remaining fallback-like entries: {len(remaining_fallback)}\n')
        f.write('- Reports: `docs/factory/reports/kb-v4-fallback-cleanup.md`, `.json`\n')
    print(json.dumps({k: summary[k] for k in ['variant', 'removedCount', 'repairedCount', 'remainingFallbackLikeCount', 'totalEntriesAfterCleanup', 'removedByFile', 'repairedByFile']}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
