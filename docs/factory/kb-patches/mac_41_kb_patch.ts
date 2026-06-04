/**
 * KB Patch for mac_41 — manual-valve-description.pmlmac
 * Generated: 2026-06-03
 *
 * New KB entries identified by gap analysis:
 * 1. cmd_pml_reload_object — PML RELOAD OBJECT command
 * 2. err_macro_no_error_handling — macro error handling pattern
 */

import { KBEntry, KBCategory, normalizeCategory } from '../../../../src/knowledge/schemas/kb-entry';

export const mac_41_kb_patches: KBEntry[] = [
  {
    id: 'cmd_pml_reload_object',
    category: normalizeCategory('macros'),
    subcategory: 'library_management',
    title: 'PML RELOAD OBJECT command',
    principle: 'Use PML RELOAD OBJECT to reload a PML object definition from the library before creating instances, ensuring the latest version is loaded.',
    rule: 'Place PML RELOAD OBJECT <ObjectName> before object <ObjectName>() in macros that depend on custom object definitions. This is necessary when the object may have been updated in the library without a server restart.',
    syntax: 'PML RELOAD OBJECT <objectName>',
    exampleCanonical: `-- CB manual-valve-description.pmlmac
PML RELOAD OBJECT TAGMANAGEMENTTMP
!tagMgmt = object TAGMANAGEMENTTMP()
!tagMgmt.manualValveDescriptionUpdate(':RAMTAGOWNER INSET(|RAM|, |AKSO|)')`,
    exampleAntipattern: '!tagMgmt = object TAGMANAGEMENTTMP()  -- may use stale object definition',
    pitfalls: [
      'PML RELOAD OBJECT is a command, not a PML statement — it does not use = assignment.',
      'The object must exist in the PMLLIB library path; otherwise the reload silently succeeds but object() may fail.',
      'In production macros, wrap object() and method calls in HANDLE/ENDHANDLE for safety.',
    ],
    relatedIds: ['obj_object_constructor', 'cmd_pml_command_stream'],
    sourcedoc: 'AVEVA E3D PML Customization Guide — Macro Programming',
    sourcecodebase: 'manual-valve-description.pmlmac',
  },
  {
    id: 'err_macro_no_error_handling',
    category: normalizeCategory('errorhandling'),
    subcategory: 'macro',
    title: 'Macro error handling pattern — HANDLE/ENDHANDLE around object operations',
    principle: 'Wrap object instantiation and method calls in HANDLE/ENDHANDLE blocks to prevent silent failures.',
    rule: 'After object() construction and before calling methods on custom objects, use: handle any ... endhandle to catch and report errors.',
    syntax: 'handle any\n  -- error recovery or logging\nendhandle',
    exampleCanonical: `PML RELOAD OBJECT TAGMANAGEMENTTMP
handle any
  !tagMgmt = object TAGMANAGEMENTTMP()
  handle any
    !tagMgmt.manualValveDescriptionUpdate(':RAMTAGOWNER INSET(|RAM|, |AKSO|)')
  endhandle
endhandle`,
    exampleAntipattern: `!tagMgmt = object TAGMANAGEMENTTMP()
!tagMgmt.manualValveDescriptionUpdate(':RAMTAGOWNER INSET(|RAM|, |AKSO|)')  -- no error handling`,
    pitfalls: [
      'Nested HANDLE/ENDHANDLE blocks can mask errors from inner blocks if the outer handler catches "any".',
      'Using HANDLE ANY on object() may hide library-load issues; consider checking the result before method calls.',
    ],
    relatedIds: ['cmd_pml_reload_object', 'obj_object_constructor'],
    sourcedoc: 'AVEVA E3D PML Customization Guide — Error Handling',
    sourcecodebase: 'manual-valve-description.pmlmac',
  },
];
