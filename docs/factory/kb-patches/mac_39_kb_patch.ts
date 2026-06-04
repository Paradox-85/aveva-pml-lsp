/** KB Patch: mac_39 — LOOPDATA custom object pattern */
import type { KBEntry } from '../../knowledge/schemas/kb-entry';

export const mac_39_kb_patch: KBEntry = {
  id: 'mac_loopdata_object_usage',
  category: 'macros',
  subcategory: 'custom-object',
  title: 'Custom LOOPDATA object usage pattern',
  principle:
    'Custom user-defined objects (e.g. LOOPDATA) are reloaded via PML RELOAD OBJECT, instantiated with object(), and used via method chaining. Path assignment and SaveLog are typical property/method patterns.',
  rule:
    'Use PML RELOAD OBJECT <Name> before instantiating a custom object. Wrap method calls in handle/any blocks for error resilience.',
  syntax: `handle any
  PML RELOAD OBJECT <ObjectName>
endhandle
!obj = object <ObjectName>()
handle any
  !obj.Method()
endhandle
!obj.property = |value|
handle any
  !obj.SaveLog(|filename.xlsx|, false)
endhandle`,
  exampleCanonical: `$* loop-create.pmlmac
handle any
  PML RELOAD OBJECT LOOPDATA
endhandle
!loop = object LOOPDATA()
handle any
  !loop.GetData()
endhandle
handle any
  !loop.LoopCreate()
endhandle
!loop.pathName = |C:\\Temp\\loop-create-log|
handle any
  !loop.SaveLog(|loop-create-log.xlsx|, false)
endhandle
exit`,
  exampleAntipattern: `!loop = object LOOPDATA()
!loop.GetData()
!loop.LoopCreate()
!loop.pathName = |C:\\Temp\\test|
!loop.SaveLog(|test.xlsx|, false)`,
  pitfalls: [
    'LOOPDATA is a RAM-specific custom object; not a built-in PML type',
    'PML RELOAD OBJECT is required before object() instantiation for custom types',
    'SaveLog second argument (false) controls overwrite behavior — must match caller intent',
  ],
  relatedIds: ['mac_basic_structure', 'obj_handle_any_pattern'],
  sourcedoc: 'docs/codebase/macros/loop-create.pmlmac',
  sourcecodebase: 'loop-create.pmlmac',
};
