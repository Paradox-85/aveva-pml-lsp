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

const rel = p => path.relative(root, p).replaceAll('\\', '/');
const exists = p => fs.existsSync(path.join(root, p));
const readJson = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const listFiles = (dir, pred = () => true) => {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter(pred).sort().map(f => `${dir}/${f}`);
};
const walk = dir => {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    const p = path.join(dir, ent.name).replaceAll('\\', '/');
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out.sort();
};

const manifest = readJson('docs/factory/config/file-manifest.json');
const manifestFiles = manifest.files ?? [];
const pipeline = readJson('docs/factory/config/pipeline.config.json');
const runState = readJson('docs/factory/logs/run-state.json');

let kbInventory = { totalEntries: null, byCategory: {}, importError: null };
try {
  const mod = await import(pathToFileURL(path.join(root, 'dist/knowledge/pml-kb/index.js')).href);
  const entries = mod.allPmlKbEntries ?? [];
  kbInventory.totalEntries = entries.length;
  for (const e of entries) kbInventory.byCategory[e.category] = (kbInventory.byCategory[e.category] ?? 0) + 1;
} catch (err) {
  kbInventory.importError = String(err?.message ?? err);
}

const statusCounts = manifestFiles.reduce((acc, f) => {
  acc[f.status] = (acc[f.status] ?? 0) + 1;
  return acc;
}, {});
const priorityCounts = manifestFiles.reduce((acc, f) => {
  acc[f.priority] = (acc[f.priority] ?? 0) + 1;
  return acc;
}, {});

const inventory = {
  generatedAt: now,
  cwd: root,
  baseline: {
    pipeline: {
      autoApplyPatch: pipeline.autoApplyPatch,
      smokeTestRequired: pipeline.smokeTestRequired,
      batchSize: pipeline.batchSize,
      priorityOrder: pipeline.priorityOrder,
      outputPaths: pipeline.outputPaths,
    },
    runState: {
      completedCount: runState.completedCount,
      totalFiles: runState.totalFiles,
      pendingCount: runState.pendingCount,
      missingCoreArtifacts: runState.missingCoreArtifacts,
      smokeTest: runState.smokeTest,
      counts: runState.counts,
    },
  },
  sources: {
    A1_manifestAndPipeline: ['docs/factory/config/file-manifest.json', 'docs/factory/config/pipeline.config.json'].map(p => ({ path: p, exists: exists(p) })),
    A2_codebase: { index: { path: 'docs/codebase/pml.index', exists: exists('docs/codebase/pml.index') }, files: walk('docs/codebase').filter(p => !p.endsWith('pml.index')) },
    A3_benchmarks: listFiles('docs/factory/benchmarks', f => /_benchmark\./.test(f)),
    A4_gapReports: listFiles('docs/factory/gap-reports', f => /_gap\.json$/.test(f)),
    A5_kbPatches: listFiles('docs/factory/kb-patches', f => /_kb_patch\.ts$/.test(f)),
    A6_logs: walk('docs/factory/logs').filter(p => /\.(json|md)$/.test(p)),
    B1_kbModules: listFiles('src/knowledge/pml-kb', f => /\.ts$/.test(f)),
    B2_validationSearch: [...walk('src/knowledge/validation'), ...walk('src/knowledge/search')].filter(p => /\.ts$/.test(p)),
    B3_referenceDocs: [...walk('docs/llm_review'), ...walk('docs/knowledge-base'), 'docs/combined_pml_reference.md'].filter(p => exists(p)),
    C1_pmlWorker: ['.pi/agents/pml-worker.md', 'docs/factory/prompts/worker-generate.md', 'docs/factory/prompts/reviewer-compare.md'].map(p => ({ path: p, exists: exists(p) })),
  },
  manifest: { totalFiles: manifestFiles.length, statusCounts, priorityCounts, files: manifestFiles },
  kbInventory,
};

fs.writeFileSync(path.join(reportsDir, 'kb-v4-source-inventory.json'), JSON.stringify(inventory, null, 2));

const md = `# KB v4 Source Inventory\n\nGenerated: ${now}\n\n## Baseline\n\n- CWD: \`${root}\`\n- pipeline.autoApplyPatch: \`${pipeline.autoApplyPatch}\`\n- pipeline.smokeTestRequired: \`${pipeline.smokeTestRequired}\`\n- runState.completedCount: \`${runState.completedCount}\` / \`${runState.totalFiles}\`\n- runState.missingCoreArtifacts: \`${JSON.stringify(runState.missingCoreArtifacts)}\`\n- runState.smokeTest: \`${runState.smokeTest}\`\n- Existing KB entries: \`${kbInventory.totalEntries ?? 'unknown'}\`\n\n## Manifest counts\n\n- Status: ${Object.entries(statusCounts).map(([k,v]) => `\`${k}\`=${v}`).join(', ')}\n- Priority: ${Object.entries(priorityCounts).map(([k,v]) => `\`${k}\`=${v}`).join(', ')}\n\n## Source counts\n\n- Codebase files: ${inventory.sources.A2_codebase.files.length}\n- Benchmarks: ${inventory.sources.A3_benchmarks.length}\n- Gap reports: ${inventory.sources.A4_gapReports.length}\n- KB patch drafts: ${inventory.sources.A5_kbPatches.length}\n- Logs: ${inventory.sources.A6_logs.length}\n- KB modules: ${inventory.sources.B1_kbModules.length}\n- Reference docs: ${inventory.sources.B3_referenceDocs.length}\n\n## KB by category\n\n${Object.entries(kbInventory.byCategory).sort().map(([k,v]) => `- ${k}: ${v}`).join('\n')}\n\n## Notes\n\n- This inventory records sources only; it does not import KB entries.\n- Patch drafts remain draft-only until reviewed through the decision matrix.\n`;
fs.writeFileSync(path.join(reportsDir, 'kb-v4-source-inventory.md'), md);

const checkpoint = { generatedAt: now, step: 'inventory', gitHead: null, reports: ['docs/factory/reports/kb-v4-source-inventory.json', 'docs/factory/reports/kb-v4-source-inventory.md'], validationStatus: 'not_run_by_script', nextAction: 'aggregate-gaps' };
fs.writeFileSync(path.join(logsDir, 'kb-v4-run-state.json'), JSON.stringify(checkpoint, null, 2));
fs.appendFileSync(path.join(logsDir, 'pipeline.log.md'), `\n\n## KB v4 inventory — ${now}\n\n- Wrote \`docs/factory/reports/kb-v4-source-inventory.json\`\n- Wrote \`docs/factory/reports/kb-v4-source-inventory.md\`\n`);
console.log(`Wrote ${rel(path.join(reportsDir, 'kb-v4-source-inventory.json'))}`);
console.log(`Wrote ${rel(path.join(reportsDir, 'kb-v4-source-inventory.md'))}`);
