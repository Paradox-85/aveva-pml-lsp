import type { KBEntry } from '../schemas/kb-entry.js';

export const syscomEntries: KBEntry[] = [
  {
    "id": "p2_syscom",
    "category": "syscom",
    "subcategory": "external",
    "title": "SYSCOM — external OS commands from PML",
    "principle": "SYSCOM executes operating-system commands from PML; it is synchronous by default and should be quoted carefully.",
    "rule": "Use `SYSCOM |command|` for copy/start/bat operations. Quote paths with spaces. Check file existence after the command because exit code handling is limited. Use trailing `&` only for deliberate async launch.",
    "syntax": "SYSCOM |copy /y \"$!<filePath>\" \"$!<filePathOrigin>\"|\nSYSCOM |start excel.exe \"$!<filePath>\"|\nSYSCOM |notepad.exe &|",
    "exampleCanonical": "-- CB EIS_data_export.pmlmac\nSYSCOM |copy /y \"$!<filePath>\" \"$!<filePathOrigin>\"|",
    "exampleAntipattern": "-- NOT: SYSCOM copy /y C:\\My Files\\a.xlsx C:\\Backup\\a.xlsx\n-- Плохо: paths with spaces are not quoted; command can fail or copy wrong path",
    "pitfalls": [
      "Synchronous by default: PDMS waits for command completion",
      "Use `&` for async only when safe",
      "No reliable structured exit code in normal PML flow; verify outputs",
      "Quote every path interpolated from variables"
    ],
    "relatedIds": [
      "mac_file_path_pattern",
      "dt_string_substitution",
      "syscom_open_file"
    ],
    "sourcedoc": "TM-1401 Macros and Functions; Perplexity PML KB §9.6",
    "sourcecodebase": "EIS_data_export.pmlmac"
  },
  {
    "id": "syscom_open_file",
    "category": "syscom",
    "subcategory": "open-file",
    "title": "Opening generated files with SYSCOM",
    "principle": "After export, SYSCOM can open a generated file in Excel or another external program.",
    "rule": "Only open files after confirming they were written. Prefer quoting the generated path and avoid blocking long-running external tools unless intended.",
    "syntax": "if !filePath.set() then\n  SYSCOM |start excel.exe \"$!<filePath>\"|\nendif",
    "exampleCanonical": "-- CB ramFileWriterClass.pmlobj\n-- File writer class produces export files that can be opened by external tools via SYSCOM patterns",
    "exampleAntipattern": "-- NOT: open Excel before closing/flushing the output file\n-- Плохо: external application may read incomplete data",
    "pitfalls": [
      "Flush/close file writer first",
      "Quote file path",
      "Consider async start for UI convenience"
    ],
    "relatedIds": [
      "p2_syscom",
      "log_output_targets"
    ],
    "sourcedoc": "Perplexity PML KB §9.6; codebase file writer patterns",
    "sourcecodebase": "ramFileWriterClass.pmlobj"
  }
];
