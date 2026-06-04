#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const now = new Date().toISOString();
const reportsDir = path.join(root, 'docs/factory/reports');
const logsDir = path.join(root, 'docs/factory/logs');
fs.mkdirSync(reportsDir, { recursive: true });
fs.mkdirSync(logsDir, { recursive: true });

const readJson = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const exists = p => !!p && fs.existsSync(path.join(root, p));
const readMaybe = p => exists(p) ? fs.readFileSync(path.join(root, p), 'utf8') : null;

function extractPatchCandidates(text) {
  if (!text) return [];
  const blocks = [...text.matchAll(/\{[\s\S]*?sourcecodebase\s*:\s*['"`]([^'"`]+)['"`][\s\S]*?\}/g)].map(m => m[0]);
  return blocks.map(block => {
    const get = name => block.match(new RegExp(`${name}\\s*:\\s*(['\"\`])([\\s\\S]*?)\\1`))?.[2] ?? null;
    const id = get('id');
    const category = get('category');
    const subcategory = get('subcategory');
    const title = get('title');
    const sourcecodebase = get('sourcecodebase');
    const canonical = block.match(/exampleCanonical\s*:\s*`([\s\S]*?)`/)?.[1] ?? get('exampleCanonical');
    const hasRelatedIds = /relatedIds\s*:/.test(block);
    const hasAntipattern = /exampleAntipattern\s*:/.test(block);
    const hasSourcedoc = /sourcedoc\s*:/.test(block);
    const hasPitfalls = /pitfalls\s*:/.test(block);
    const cbAnchorToken = canonical?.match(/--\s*CB\s+([^\s]+)/)?.[1] ?? null;
    return { id, category, subcategory, title, sourcecodebase, hasCanonical: !!canonical, canonicalFirstLine: canonical?.split(/\r?\n/)[0] ?? null, hasCbAnchor: !!cbAnchorToken, cbAnchorToken, hasRelatedIds, hasAntipattern, hasSourcedoc, hasPitfalls };
  }).filter(c => c.id || c.sourcecodebase || c.category);
}

const manifest = readJson('docs/factory/config/file-manifest.json');
const files = manifest.files ?? [];
const aggregate = {
  generatedAt: now,
  totalManifestFiles: files.length,
  counts: { byStatus: {}, byPriority: {}, withGapReport: 0, withPatchDraft: 0, parseErrors: 0 },
  files: [],
  candidates: [],
};

for (const item of files) {
  aggregate.counts.byStatus[item.status] = (aggregate.counts.byStatus[item.status] ?? 0) + 1;
  aggregate.counts.byPriority[item.priority] = (aggregate.counts.byPriority[item.priority] ?? 0) + 1;
  let gap = null;
  let gapReadError = null;
  if (exists(item.gapReportFile)) {
    aggregate.counts.withGapReport++;
    try { gap = readJson(item.gapReportFile); } catch (err) { gapReadError = String(err?.message ?? err); aggregate.counts.parseErrors++; }
  }
  const patchText = readMaybe(item.kbPatchFile);
  if (patchText) aggregate.counts.withPatchDraft++;
  const patchCandidates = extractPatchCandidates(patchText);
  const dimensionScores = {};
  const dimensionGaps = [];
  if (gap?.dimensions) {
    for (const [dim, data] of Object.entries(gap.dimensions)) {
      if (typeof data?.score === 'number') dimensionScores[dim] = data.score;
      if (Array.isArray(data?.gaps)) {
        for (const g of data.gaps) dimensionGaps.push({ dimension: dim, ...g });
      }
    }
  }
  const d7NewEntries = gap?.dimensions?.D7_kbCompleteness?.newEntriesNeeded ?? [];
  for (const raw of d7NewEntries) {
    if (typeof raw === 'string') {
      aggregate.candidates.push({ fileId: item.id, candidateId: raw, source: 'gap.D7', priority: item.priority, status: item.status, filePath: item.path, patchFile: item.kbPatchFile });
    } else if (raw && typeof raw === 'object') {
      const canonical = raw.exampleCanonical ?? null;
      aggregate.candidates.push({
        fileId: item.id,
        candidateId: raw.suggestedId ?? raw.id ?? null,
        source: 'gap.D7.object',
        priority: item.priority,
        status: item.status,
        filePath: item.path,
        patchFile: item.kbPatchFile,
        category: raw.category ?? null,
        subcategory: raw.subcategory ?? null,
        title: raw.title ?? null,
        sourcecodebase: raw.sourcecodebase ?? null,
        hasCanonical: !!canonical,
        canonicalFirstLine: canonical?.split(/\r?\n/)[0] ?? null,
        hasCbAnchor: /--\s*CB\s+\S+/.test(canonical ?? ''),
        cbAnchorToken: canonical?.match(/--\s*CB\s+([^\s]+)/)?.[1] ?? null,
        hasRelatedIds: Array.isArray(raw.relatedIds),
        hasAntipattern: typeof raw.exampleAntipattern === 'string' && raw.exampleAntipattern.length > 0,
        hasSourcedoc: typeof raw.sourcedoc === 'string' && raw.sourcedoc.length > 0,
        hasPitfalls: Array.isArray(raw.pitfalls) && raw.pitfalls.length > 0,
      });
    }
  }
  for (const c of patchCandidates) {
    aggregate.candidates.push({ fileId: item.id, candidateId: c.id, source: 'patchDraft', priority: item.priority, status: item.status, filePath: item.path, patchFile: item.kbPatchFile, ...c });
  }
  aggregate.files.push({
    id: item.id,
    path: item.path,
    type: item.type,
    priority: item.priority,
    status: item.status,
    gapReportFile: item.gapReportFile,
    kbPatchFile: item.kbPatchFile,
    hasGapReport: exists(item.gapReportFile),
    hasPatchDraft: !!patchText,
    gapReadError,
    actionRequired: gap?.actionRequired ?? null,
    overallGapScore: gap?.overallGapScore ?? null,
    dimensionScores,
    d7NewEntries,
    dimensionGapCount: dimensionGaps.length,
    patchCandidateCount: patchCandidates.length,
  });
}
aggregate.counts.totalCandidates = aggregate.candidates.length;
aggregate.counts.uniqueCandidateIds = new Set(aggregate.candidates.map(c => c.candidateId).filter(Boolean)).size;

fs.writeFileSync(path.join(reportsDir, 'kb-v4-gap-aggregate.json'), JSON.stringify(aggregate, null, 2));

const topMissing = Object.entries(aggregate.candidates.reduce((acc, c) => { if (c.candidateId) acc[c.candidateId] = (acc[c.candidateId] ?? 0) + 1; return acc; }, {})).sort((a,b) => b[1]-a[1]).slice(0, 30);
const md = `# KB v4 Gap Aggregate\n\nGenerated: ${now}\n\n## Counts\n\n- Manifest files: ${aggregate.totalManifestFiles}\n- Status: ${Object.entries(aggregate.counts.byStatus).map(([k,v]) => `\`${k}\`=${v}`).join(', ')}\n- Priority: ${Object.entries(aggregate.counts.byPriority).map(([k,v]) => `\`${k}\`=${v}`).join(', ')}\n- Gap reports: ${aggregate.counts.withGapReport}\n- Patch drafts: ${aggregate.counts.withPatchDraft}\n- Candidate mentions: ${aggregate.counts.totalCandidates}\n- Unique candidate IDs: ${aggregate.counts.uniqueCandidateIds}\n- Parse/read errors: ${aggregate.counts.parseErrors}\n\n## Top candidate IDs by mentions\n\n${topMissing.map(([id,n]) => `- \`${id}\`: ${n}`).join('\n')}\n\n## Files needing manual attention\n\n${aggregate.files.filter(f => f.status !== 'patch_ready').map(f => `- ${f.id} (${f.status}, ${f.priority}) — gap=${f.hasGapReport}, patch=${f.hasPatchDraft}, D7=${f.d7NewEntries.length}`).join('\n')}\n\n## Safety note\n\nThis is aggregation only. Patch drafts remain untrusted until decision matrix checks sourcecodebase, -- CB anchor, category mapping, duplicate IDs, placeholders, and relatedIds.\n`;
fs.writeFileSync(path.join(reportsDir, 'kb-v4-gap-aggregate.md'), md);

const checkpoint = { generatedAt: now, step: 'aggregate-gaps', reports: ['docs/factory/reports/kb-v4-gap-aggregate.json', 'docs/factory/reports/kb-v4-gap-aggregate.md'], counts: aggregate.counts, validationStatus: 'not_run_by_script', nextAction: 'analyze-gaps' };
fs.writeFileSync(path.join(logsDir, 'kb-v4-run-state.json'), JSON.stringify(checkpoint, null, 2));
fs.appendFileSync(path.join(logsDir, 'pipeline.log.md'), `\n\n## KB v4 gap aggregate — ${now}\n\n- Candidate mentions: ${aggregate.counts.totalCandidates}\n- Unique candidate IDs: ${aggregate.counts.uniqueCandidateIds}\n- Wrote \`docs/factory/reports/kb-v4-gap-aggregate.json\`\n- Wrote \`docs/factory/reports/kb-v4-gap-aggregate.md\`\n`);
console.log(`Wrote docs/factory/reports/kb-v4-gap-aggregate.json`);
console.log(`Wrote docs/factory/reports/kb-v4-gap-aggregate.md`);
