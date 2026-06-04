import { KBEntry } from '../schemas/kb-entry';

export const mac_27_kb_patch: KBEntry[] = [
  {
    suggestedId: 'cb_mac_27_collect_all_tree',
    category: 'data-access',
    subcategory: 'collect-all-with-tree-filter',
    title: 'COLLECT ALL with tree filter (for /tree)',
    principle:
      'PML COLLECT ALL can restrict the search scope to a subtree using the `for /treePath` clause, enabling targeted database queries without traversing the entire tree.',
    rule:
      'Use `for /<treePath>` after the `with (<condition>)` clause to limit the COLLECT ALL search to a specific subtree. The tree path must be a valid PDMS/E3D tree reference.',
    syntax:
      'var !<result> collect all (<type>) with (<condition>) for /<treePath>',
    exampleCanonical:
      '-- CB mac_27_collect_all_tree.pmlmac\n-- Collect all ENGGRP with mcount > 0 under /TMS_ENG\ntype TMS_ENG\n\nvar !enggrps collect all (ENGGRP) with (mcount gt 0) for /TMS_ENG\n\ndo !enggrp values !enggrps\n  !engrpRef = !enggrp.dbref()\n  $P Found ENGGRP: $!<engrpRef.seq> $!<engrpRef.name>\nenddo',
    exampleAntipattern:
      '-- Anti-pattern: collecting all ENGGRP without tree filter (slow on large projects)\n-- var !allEnggrps collect all (ENGGRP) with (mcount gt 0)\n-- This traverses the entire database tree and may be very slow.',
    pitfalls: [
      'The tree path must start with `/` and reference a valid top-level tree in the project.',
      'The `with` condition is evaluated on each candidate element; use simple comparisons (gt, lt, eq, neq) for best performance.',
      'COLLECT ALL returns an empty array if no elements match — always check `.size()` before iterating.',
    ],
    relatedIds: ['official-manual-004', 'official-manual-041'],
    sourcedoc: 'AVEVA PML Customization Guide — Control Logic / COLLECT ALL',
    sourcecodebase: 'JDE_outputMacro.pmlmac',
  },
  {
    suggestedId: 'cb_mac_27_alpha_io_chain',
    category: 'io-reporting',
    subcategory: 'alpha-file-output-tabulate',
    title: 'ALPHA FILE / OUTPUT TABULATE / CHANGES SINCE / ALPHA FILE END report chain',
    principle:
      'PML1 provides a chain of ALPHA-file commands for generating tabulated reports of database elements. The chain opens a file, writes tabulated output with optional change tracking, and closes the file.',
    rule:
      'Open the file with `ALPHA FILE "<path>" OVERWRITE`, write tabulated data with `OUTPUT TABULATE <indent> $<element> CHANGES SINCE <datetime>`, then close with `ALPHA FILE END`. All commands in the chain must appear between the OPEN and END statements.',
    syntax:
      'ALPHA FILE "<filepath>" [OVERWRITE|APPEND]\nOUTPUT TABULATE <indent> $<element> [CHANGES SINCE <datetime>]\nALPHA FILE END',
    exampleCanonical:
      '-- CB mac_27_alpha_io_chain.pmlmac\n-- Report all members of an ENGGRP with changes since a fixed date\n\nALPHA FILE "C:\\Temp\\output_$!<engrpRef.seq>.txt" OVERWRITE\nOUTPUT TABULATE 2 $!enggrp CHANGES SINCE 00:00 01 March 2024\nALPHA FILE END',
    exampleAntipattern:
      '-- Anti-pattern: forgetting ALPHA FILE END or mixing ALPHA FILE with regular file I/O\n-- ALPHA FILE "C:\\Temp\\report.txt" OVERWRITE\n-- OUTPUT TABULATE 2 $!enggrp\n-- -- Missing ALPHA FILE END!\n-- $P This will leave the file handle open.\n\n-- Anti-pattern: using wrong syntax for CHANGES SINCE\n-- OUTPUT TABULATE 2 $!enggrp CHANGES SINCE TODAY  -- WRONG: must be a datetime literal like 00:00 01 March 2024',
    pitfalls: [
      'The datetime in CHANGES SINCE must be a valid PML datetime literal (HH:MM DD Month YYYY format).',
      'ALPHA FILE OVERWRITE replaces any existing file; use APPEND to add to an existing file.',
      'OUTPUT TABULATE without CHANGES SINCE reports all current values; with CHANGES SINCE it reports only elements changed since the given datetime.',
      'ALPHA FILE END is mandatory — omitting it leaves the file handle open and may cause data loss.',
      'The indent parameter (e.g., 2) controls the depth of member expansion in the tabulated output.',
    ],
    relatedIds: [],
    sourcedoc: 'AVEVA PML Customization Guide — Command Stream / ALPHA Commands',
    sourcecodebase: 'JDE_outputMacro.pmlmac',
  },
];
