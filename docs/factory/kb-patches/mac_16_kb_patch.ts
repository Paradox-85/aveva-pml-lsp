// KB Patch for mac_16 — JDE_3D_items_extractor.pmlmac
// Generated: 2026-06-03
// Gap score: 0.08 (very low)
// Action: patch_kb

import { KBEntry } from "../../../../src/knowledge/schemas/kb-entry";

export const patches: KBEntry[] = [
  {
    id: "mac_dollar_m_metadata_comment",
    category: "macros",
    subcategory: "metadata_comments",
    title: "$m metadata comment convention in PML macro headers",
    principle:
      "Macros may include a --$m or $* $m comment line with the original file path for traceability. This is a human convention, not a PML command execution. The $m in this context is distinct from the PML $M command (which loads and runs a macro file).",
    rule:
      'When embedding $m in a macro header, use -- $m "path" format in original macros. In benchmarks, convert to $* $m "path" for inline-safe comment format.',
    syntax: `-- $m "original_file_path.pmlmac"
-- or
$* $m "original_file_path.pmlmac"`,
    exampleCanonical: `-- $m "C:\\path\\to\\original\\macro.pmlmac"
!data = object array()
var !sites collect all SITE
do !siteName values !sites
  !siteRef = !siteName.dbref()
enddo`,
    exampleAntipattern: "",
    pitfalls: [
      "$m (lowercase) in comments is a metadata marker convention; $M (uppercase) is a PML command that loads and runs a macro file.",
      "Do not execute $m as a command when it is intended as metadata in a comment line."
    ],
    relatedIds: ["mac_file_path_pattern", "pml_dollar_symbols", "pml_comment_conventions"],
    sourcedoc: "AVEVA PML Customization Guide — Dollar Special Symbols",
    sourcecodebase: "JDE_3D_items_extractor.pmlmac"
  }
];
