// KB Patch for mac_02 — cable-area-update.pmlmac
// Generated: 2026-06-03
// Action: patch_kb — apply 3 new KBEntry candidates

import { KBEntry } from '../knowledge/schemas/kb-entry';

export const kbPatches: KBEntry[] = [
  {
    id: 'd1-pml-reload-object',
    category: 'syntax',
    subcategory: 'dollar-commands',
    title: 'PML RELOAD OBJECT command',
    principle: 'PML RELOAD OBJECT reloads an object definition from disk; use before constructing instances to ensure fresh definitions.',
    rule: 'Use `PML RELOAD OBJECT <objectName>` before `!var = object <objectName>()` when the object definition may have changed.',
    syntax: 'PML RELOAD OBJECT <objectName>',
    exampleCanonical: `$* mac_02 — cable-area-update.pmlmac\n$* Reloads TAGMANAGEMENTTMP and invokes defineAreasForCables().\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.defineAreasForCables()`,
    exampleAntipattern: `!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.defineAreasForCables()  -- stale definition may be used`,
    pitfalls: [
      'PML RELOAD OBJECT only reloads from disk; if the object was defined inline in the same macro, it has no file to reload from.',
      'Reloading a user-defined type does not automatically update existing instances of that type.',
    ],
    relatedIds: ['d3-macro-file-header', 'd4-object-constructor'],
    sourcedoc: 'AVEVA PML Macros guide',
    sourcecodebase: 'cable-area-update.pmlmac',
  },
  {
    id: 'd3-macro-file-header',
    category: 'structure',
    subcategory: 'macro-conventions',
    title: 'Macro file header comment conventions',
    principle: 'Use `$*` comment lines for macro headers; they are safe inline and after commands. Legacy `--$m` header with quoted path is PML1 style.',
    rule: 'Replace `--$m "path/to/file.pmlmac"` with `$*` comment lines describing the macro purpose.',
    syntax: '$* <description>\n$* <more description>\nPML <command>\n...',
    exampleCanonical: `$* cable-area-update.pmlmac\n$* Reloads TAGMANAGEMENTTMP and invokes defineAreasForCables().\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.defineAreasForCables()`,
    exampleAntipattern: `--$m "C:\\path\\to\\cable-area-update.pmlmac"\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.defineAreasForCables()`,
    pitfalls: [
      '`--$m` with a path is a PML1 legacy convention; `$*` is the canonical PML2 comment style.',
      'The `--$m` comment may contain a file path that is stale or environment-specific.',
    ],
    relatedIds: ['d1-pml-reload-object', 'd2-object-method-call'],
    sourcedoc: 'AVEVA PML Syntax Reference',
    sourcecodebase: 'cable-area-update.pmlmac',
  },
  {
    id: 'd6-user-defined-object-method',
    category: 'dependencies',
    subcategory: 'user-defined-types',
    title: 'Custom methods on user-defined object types',
    principle: 'User-defined objects (e.g., TAGMANAGEMENTTMP) may have project-specific methods not covered by system KB. Method signatures must be verified from source.',
    rule: 'When calling methods on user-defined objects, ensure the method exists in the object definition. Document custom methods in KB.',
    syntax: '!var = object <UserDefinedType>()\n!var.<customMethod>()',
    exampleCanonical: `!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.defineAreasForCables()`,
    exampleAntipattern: `!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.nonExistentMethod()  -- method not defined on type`,
    pitfalls: [
      'User-defined object methods are not discoverable through system KB; they must be verified against the `.pmlobj` source.',
      'Method names on user-defined types are case-insensitive in PML but should follow project conventions.',
    ],
    relatedIds: ['d4-object-constructor', 'd2-object-method-call'],
    sourcedoc: 'Methods on User-Defined Object Types KB',
    sourcecodebase: 'cable-area-update.pmlmac',
  },
];
