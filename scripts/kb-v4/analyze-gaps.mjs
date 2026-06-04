#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const now = new Date().toISOString();
const reportsDir = path.join(root, 'docs/factory/reports');
const logsDir = path.join(root, 'docs/factory/logs');
fs.mkdirSync(reportsDir, { recursive: true });
fs.mkdirSync(logsDir, { recursive: true });

const readJson = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const exists = p => !!p && fs.existsSync(path.join(root, p));
const basenameSet = dir => {
  const abs = path.join(root, dir);
  const out = new Set();
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p); else out.add(ent.name);
    }
  }
  walk(abs);
  return out;
};

const aggregate = readJson('docs/factory/reports/kb-v4-gap-aggregate.json');
const sourceBasenames = basenameSet('docs/codebase');
const schema = await import(pathToFileURL(path.join(root, 'dist/knowledge/schemas/kb-entry.js')).href);
const kb = await import(pathToFileURL(path.join(root, 'dist/knowledge/pml-kb/index.js')).href);
const allowed = new Set(schema.ALLOWED_CATEGORIES ?? []);
const existingEntries = kb.allPmlKbEntries ?? [];
const existingIds = new Set(existingEntries.map(e => e.id));
const existingAliases = new Set(existingEntries.flatMap(e => e.aliases ?? []));
const existingTitles = new Map(existingEntries.map(e => [`${e.category}::${String(e.title).toLowerCase()}`, e.id]));

function mapCategory(raw, candidate) {
  if (allowed.has(raw)) return { mappedCategory: raw, confidence: 'exact', reason: 'already allowed' };
  const text = `${candidate.candidateId ?? ''} ${candidate.subcategory ?? ''} ${candidate.title ?? ''}`.toLowerCase();
  const rawMap = {
    'control-flow': 'controlflow',
    'error-handling': 'errorhandling',
    'system-objects': /datetime/.test(text) ? 'datetime' : 'objects',
    'builtin-functions': /display|progress|alert|ui/.test(text) ? 'ui' : /error|undefined/.test(text) ? 'errorhandling' : 'functions',
    'statements': /show|form/.test(text) ? 'forms' : 'controlflow',
    'attributes': 'pdmsinteraction',
    'queries': 'pdmsinteraction',
    'dependencies': /namespace|\.net|addin/.test(text) ? 'dotnetinterop' : 'architecturepatterns',
    'expressions': /string|dollar|interpolation|substitution/.test(text) ? 'typeconversion' : 'datatypes',
  };
  if (rawMap[raw]) return { mappedCategory: rawMap[raw], confidence: 'heuristic', reason: `${raw}→${rawMap[raw]} compatibility mapping` };
  if (raw === 'patterns') {
    if (/excel|\.net|interop|com/.test(text)) return { mappedCategory: 'dotnetinterop', confidence: 'heuristic', reason: 'patterns→dotnetinterop by excel/.net/com keywords' };
    if (/form|ui|gadget/.test(text)) return { mappedCategory: 'forms', confidence: 'heuristic', reason: 'patterns→forms by form/ui keywords' };
    if (/array|map|list/.test(text)) return { mappedCategory: 'arrays', confidence: 'heuristic', reason: 'patterns→arrays by array/list keywords' };
    if (/logger|log/.test(text)) return { mappedCategory: 'logging', confidence: 'heuristic', reason: 'patterns→logging by log keywords' };
    if (/syscom|shell|rclone|copy/.test(text)) return { mappedCategory: 'syscom', confidence: 'heuristic', reason: 'patterns→syscom by shell/copy keywords' };
    if (/macro|export|wrapper|dependency/.test(text)) return { mappedCategory: 'architecturepatterns', confidence: 'heuristic', reason: 'patterns→architecturepatterns for orchestration/wrapper patterns' };
    return { mappedCategory: 'architecturepatterns', confidence: 'low', reason: 'generic patterns fallback requires review' };
  }
  if (raw === 'syntax') {
    if (/handle|error|label|savework|unclaim/.test(text)) return { mappedCategory: 'errorhandling', confidence: 'heuristic', reason: 'syntax→errorhandling by handle/error/cleanup keywords' };
    if (/measure|unit|datatype|string|real|boolean/.test(text)) return { mappedCategory: 'datatypes', confidence: 'heuristic', reason: 'syntax→datatypes by type/unit keywords' };
    if (/array|list/.test(text)) return { mappedCategory: 'arrays', confidence: 'heuristic', reason: 'syntax→arrays by array/list keywords' };
    if (/do|if|loop|label|goto/.test(text)) return { mappedCategory: 'controlflow', confidence: 'heuristic', reason: 'syntax→controlflow by flow keywords' };
    return { mappedCategory: null, confidence: 'none', reason: `raw category '${raw}' is not allowed and no safe mapping was inferred` };
  }
  return { mappedCategory: null, confidence: 'none', reason: `raw category '${raw ?? 'missing'}' is not allowed` };
}

const byCandidate = new Map();
for (const c of aggregate.candidates) {
  const normalizedId = typeof c.candidateId === 'string'
    ? c.candidateId
    : c.candidateId == null
      ? null
      : JSON.stringify(c.candidateId);
  c.candidateId = normalizedId;
  const key = normalizedId || `${c.fileId}:unknown:${byCandidate.size}`;
  if (!byCandidate.has(key)) byCandidate.set(key, []);
  byCandidate.get(key).push(c);
}

const decisions = [];
for (const [candidateId, mentions] of byCandidate.entries()) {
  const patch = mentions.find(m => m.source === 'patchDraft') ?? null;
  const structured = patch ?? mentions.find(m => m.category || m.sourcecodebase || m.hasCanonical) ?? null;
  const first = mentions[0];
  const fields = structured ?? {};
  const categoryMap = mapCategory(fields.category, { ...first, ...fields, candidateId });
  const sourcecodebase = fields.sourcecodebase ?? path.basename(first.filePath ?? '');
  const sourceExists = sourceBasenames.has(sourcecodebase);
  const duplicateId = existingIds.has(candidateId) || existingAliases.has(candidateId);
  const duplicateTitleId = fields.title && categoryMap.mappedCategory ? existingTitles.get(`${categoryMap.mappedCategory}::${fields.title.toLowerCase()}`) : null;
  const cbAnchorMatchesSource = !fields.cbAnchorToken || fields.cbAnchorToken === sourcecodebase || path.basename(fields.cbAnchorToken) === sourcecodebase;
  const hasPatch = mentions.some(m => m.source === 'patchDraft');
  const hasPlaceholder = /NOT_FOUND_IN_SOURCES|проверенный PML-паттерн|verified pattern/i.test(JSON.stringify(mentions));
  const checks = {
    hasPatch,
    structuredSource: fields.source ?? null,
    sourcecodebase,
    sourceExists,
    hasCbAnchor: !!fields.hasCbAnchor,
    cbAnchorToken: fields.cbAnchorToken ?? null,
    cbAnchorMatchesSource,
    rawCategory: fields.category ?? null,
    mappedCategory: categoryMap.mappedCategory,
    categoryMappingConfidence: categoryMap.confidence,
    categoryMappingReason: categoryMap.reason,
    duplicateId,
    duplicateTitleId,
    hasRelatedIdsField: !!fields.hasRelatedIds,
    hasSourcedoc: !!fields.hasSourcedoc,
    hasExampleAntipattern: !!fields.hasAntipattern,
    hasPitfalls: !!fields.hasPitfalls,
    hasPlaceholder,
  };
  let decision = 'manual_review';
  const blockers = [];
  if (duplicateId || duplicateTitleId) { decision = 'reject_duplicate'; blockers.push('duplicate id/alias/title'); }
  if (!structured) blockers.push('no structured patch/D7 object with entry fields');
  if (!sourceExists) blockers.push('sourcecodebase missing from docs/codebase basenames');
  if (!fields.hasCbAnchor) blockers.push('missing -- CB anchor in exampleCanonical');
  if (fields.hasCbAnchor && !cbAnchorMatchesSource) blockers.push('-- CB anchor does not match sourcecodebase');
  if (!categoryMap.mappedCategory) { decision = decision === 'reject_duplicate' ? decision : 'category_decision_required'; blockers.push('no allowed category mapping'); }
  if (categoryMap.confidence === 'low') blockers.push('low-confidence category mapping');
  if (!fields.hasRelatedIds) blockers.push('relatedIds field missing');
  if (!fields.hasSourcedoc) blockers.push('sourcedoc field missing');
  if (!fields.hasAntipattern) blockers.push('exampleAntipattern missing');
  if (!fields.hasPitfalls) blockers.push('pitfalls missing');
  if (hasPlaceholder) blockers.push('placeholder/forbidden text detected');
  if (decision !== 'reject_duplicate' && decision !== 'category_decision_required') {
    decision = blockers.length === 0 ? 'import_new_candidate_ready' : 'manual_review';
  }
  decisions.push({
    candidateId,
    mentions: mentions.length,
    fileIds: [...new Set(mentions.map(m => m.fileId))],
    priorities: [...new Set(mentions.map(m => m.priority))],
    statuses: [...new Set(mentions.map(m => m.status))],
    title: fields.title ?? null,
    subcategory: fields.subcategory ?? null,
    fingerprint: `${categoryMap.mappedCategory ?? fields.category ?? 'unknown'}::${fields.subcategory ?? 'unknown'}::${fields.title ?? candidateId}::${sourcecodebase}::${fields.canonicalFirstLine ?? 'NO_CANONICAL'}`,
    targetModule: categoryMap.mappedCategory ? `src/knowledge/pml-kb/${categoryMap.mappedCategory}.ts` : null,
    checks,
    blockers,
    decision,
  });
}

decisions.sort((a,b) => {
  const pr = p => p.includes('critical') ? 0 : p.includes('high') ? 1 : p.includes('medium') ? 2 : 3;
  return pr(a.priorities) - pr(b.priorities) || b.mentions - a.mentions || String(a.candidateId).localeCompare(String(b.candidateId));
});

const counts = decisions.reduce((acc,d) => { acc[d.decision] = (acc[d.decision] ?? 0) + 1; return acc; }, {});
const byCategory = decisions.reduce((acc,d) => { const k=d.checks.mappedCategory ?? 'unmapped'; acc[k]=(acc[k]??0)+1; return acc; }, {});
const analysis = { generatedAt: now, totalCandidates: decisions.length, counts, byCategory, decisions };
fs.writeFileSync(path.join(reportsDir, 'kb-v4-gap-analysis.json'), JSON.stringify(analysis, null, 2));

const section = (title, pred, limit=80) => {
  const rows = decisions.filter(pred).slice(0, limit);
  return `## ${title}\n\n${rows.length ? rows.map(d => `- \`${d.candidateId}\` → ${d.decision}; target=${d.targetModule ?? 'N/A'}; files=${d.fileIds.join(', ')}; blockers=${d.blockers.join('; ') || 'none'}`).join('\n') : '_None_'}\n`;
};
const md = `# KB v4 Gap Analysis / Decision Matrix\n\nGenerated: ${now}\n\n## Summary\n\n- Unique candidates: ${decisions.length}\n- Decisions: ${Object.entries(counts).map(([k,v]) => `\`${k}\`=${v}`).join(', ')}\n- By mapped category: ${Object.entries(byCategory).map(([k,v]) => `\`${k}\`=${v}`).join(', ')}\n\n## Import gate policy\n\nNo candidate may be imported until all checks pass: existing sourcecodebase, \`-- CB\` anchor, allowed category mapping, no duplicate ID/alias/title, relatedIds reviewed, no placeholders, sourcedoc/exampleAntipattern/pitfalls present, and pml-worker lint validation succeeds for examples.\n\n${section('Ready candidates', d => d.decision === 'import_new_candidate_ready')}\n${section('Manual review candidates', d => d.decision === 'manual_review')}\n${section('Category decision required', d => d.decision === 'category_decision_required')}\n${section('Rejected duplicates', d => d.decision === 'reject_duplicate')}\n\n## Next safe step\n\nReview and repair candidates in the matrix; do not import entries until blockers are resolved.\n`;
fs.writeFileSync(path.join(reportsDir, 'kb-v4-gap-analysis.md'), md);

const checkpoint = { generatedAt: now, step: 'analyze-gaps', reports: ['docs/factory/reports/kb-v4-gap-analysis.json', 'docs/factory/reports/kb-v4-gap-analysis.md'], counts, validationStatus: 'not_run_by_script', nextAction: 'manual-review-candidates-before-import' };
fs.writeFileSync(path.join(logsDir, 'kb-v4-run-state.json'), JSON.stringify(checkpoint, null, 2));
fs.appendFileSync(path.join(logsDir, 'pipeline.log.md'), `\n\n## KB v4 gap analysis — ${now}\n\n- Unique candidates: ${decisions.length}\n- Decisions: ${Object.entries(counts).map(([k,v]) => `${k}=${v}`).join(', ')}\n- Wrote \`docs/factory/reports/kb-v4-gap-analysis.json\`\n- Wrote \`docs/factory/reports/kb-v4-gap-analysis.md\`\n`);
console.log(`Wrote docs/factory/reports/kb-v4-gap-analysis.json`);
console.log(`Wrote docs/factory/reports/kb-v4-gap-analysis.md`);
console.log(JSON.stringify({ totalCandidates: decisions.length, counts, byCategory }, null, 2));
