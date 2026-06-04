// KB Patch for mac_15 — equipment-name-refresh.pmlmac
// Generated: 2026-06-03
// Gap score: 0.1 (low)
// Action: patch_kb

import { KBEntry } from "../../../../src/knowledge/schemas/kb-entry";

export const patches: KBEntry[] = [
  {
    id: "mac_dollar_m_metadata",
    category: "dollar_commands",
    subcategory: "macro_metadata",
    title: "Dollar-m ($m) metadata comment in PML macros",
    principle: "Macros often include a --$m or $* $m comment line with the original file path for traceability. This is a convention, not a PML command execution.",
    rule: "When embedding $m in a macro header, use $* $m \"path\" format in benchmarks. The original may use --$m \"path\" as a full-line comment.",
    syntax: "$* $m \"original_file_path.pmlmac\"",
    exampleCanonical: `--$m "C:\\path\\to\\original\\macro.pmlmac"
PML RELOAD OBJECT MYOBJECT
!obj = object MYOBJECT()`,
    exampleAntipattern: "Do not execute $m as a command when it is intended as metadata.",
    pitfalls: [
      "$m is both a command (run macro) and a metadata marker in comments. Context determines intent.",
      "In benchmarks, convert --$m to $* $m for inline-safe comment format."
    ],
    relatedIds: ["mac_file_path_pattern", "pml_dollar_symbols"],
    sourcedoc: "AVEVA PML Customization Guide — Dollar Special Symbols",
    sourcecodebase: "equipment-name-refresh.pmlmac"
  },
  {
    id: "obj_tagmanagementtmp_equipmentnamupdate",
    category: "object_methods",
    subcategory: "tagmanagementtmp",
    title: "TAGMANAGEMENTTMP.EquipmentNameUpdate(boolean) method",
    principle: "TAGMANAGEMENTTMP is a user-defined object type with multiple update methods (alarmsDataUpdate, ClassNameUpdate, EquipmentNameUpdate). Each takes a boolean parameter.",
    rule: "Create TAGMANAGEMENTTMP instance via 'object TAGMANAGEMENTTMP()' and call update methods with boolean arguments.",
    syntax: "!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.EquipmentNameUpdate(false)",
    exampleCanonical: `PML RELOAD OBJECT TAGMANAGEMENTTMP
!tagMgmt = object TAGMANAGEMENTTMP()
!tagMgmt.EquipmentNameUpdate(false)`,
    exampleAntipattern: "Do not assume TAGMANAGEMENTTMP has no-argument constructor — always use 'object TAGMANAGEMENTTMP()'.",
    pitfalls: [
      "TAGMANAGEMENTTMP methods like EquipmentNameUpdate, ClassNameUpdate, alarmsDataUpdate all take boolean parameters.",
      "The boolean parameter typically controls force/overwrite behavior."
    ],
    relatedIds: ["mac_file_path_pattern", "pml_object_constructor"],
    sourcedoc: "AVEVA PML Customization Guide — Object Methods",
    sourcecodebase: "equipment-name-refresh.pmlmac"
  }
];
