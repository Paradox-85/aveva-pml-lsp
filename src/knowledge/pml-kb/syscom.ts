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
  },
  {
    "id": "cmd_pml_reload_object",
    "category": "syscom",
    "subcategory": "library_management",
    "title": "PML RELOAD OBJECT command",
    "principle": "Use PML RELOAD OBJECT to reload a PML object definition from the library before creating instances, ensuring the latest version is loaded.",
    "rule": "Place PML RELOAD OBJECT <ObjectName> before object <ObjectName>() in macros that depend on custom object definitions. This is necessary when the object may have been updated in the library without a server restart.",
    "syntax": "PML RELOAD OBJECT <objectName>",
    "exampleCanonical": "-- CB manual-valve-description.pmlmac\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.manualValveDescriptionUpdate(':RAMTAGOWNER INSET(|RAM|, |AKSO|)')",
    "exampleAntipattern": "!tagMgmt = object TAGMANAGEMENTTMP()  -- may use stale object definition",
    "pitfalls": [
      "PML RELOAD OBJECT is a command, not a PML statement — it does not use = assignment.",
      "The object must exist in the PMLLIB library path; otherwise the reload silently succeeds but object() may fail.",
      "In production macros, wrap object() and method calls in HANDLE/ENDHANDLE for safety."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA E3D PML Customization Guide — Macro Programming",
    "sourcecodebase": "manual-valve-description.pmlmac"
  },
  {
    "id": "d1-pml-reload-object-command",
    "category": "syscom",
    "subcategory": "object-lifecycle",
    "title": "PML RELOAD OBJECT command",
    "principle": "Reload a previously-defined PML object before creating instances to ensure the latest code is loaded.",
    "rule": "Use `PML RELOAD OBJECT <name>` before `!var = object <name>()` when the object may have been updated since the session started.",
    "syntax": "PML RELOAD OBJECT <objectName>",
    "exampleCanonical": "-- CB alarm_refresh.pmlmac\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.alarmsDataUpdate()",
    "exampleAntipattern": "!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.alarmsDataUpdate()",
    "pitfalls": [
      "RELOAD only works for objects previously defined in the current session (via .pmlobj file loaded earlier).",
      "RELOAD does not work for system objects.",
      "If the object has been modified externally, RELOAD is necessary to pick up changes without restarting AVEVA."
    ],
    "relatedIds": [
      "d3-macro-file-header"
    ],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "alarm_refresh.pmlmac"
  },
  {
    "id": "macro_savework_unclaim_all",
    "category": "syscom",
    "subcategory": "PDMS commands",
    "title": "SAVEWORK and UNCLAIM ALL PDMS commands in PML macros",
    "principle": "SAVEWORK saves current database state; UNCLAIM ALL releases all element claims. Used in error recovery to prevent database lock.",
    "rule": "Call SAVEWORK before UNCLAIM ALL in error handlers. UNCLAIM ALL should be called to release any element claims that may have been acquired during processing.",
    "syntax": "SAVEWORK\nUNCLAIM ALL",
    "exampleCanonical": "-- CB JDE_commPackage-reports.pmlmac\n-- CB mac_18_benchmark.pmlmac\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  !!ramCommonLogger.writeErrorDataToExcel(...)\nendhandle",
    "exampleAntipattern": "-- ❌ UNCLAIM ALL without SAVEWORK — data loss risk\nLABEL /Error\nhandle any\n  UNCLAIM ALL\n  -- SAVEWORK missing: unsaved changes lost\nendhandle",
    "pitfalls": [
      "SAVEWORK is slow on large databases — consider conditional save.",
      "UNCLAIM ALL releases ALL claims; use UNCLAIM !ref for selective release."
    ],
    "relatedIds": [
      "macro_onerror_golabel_error_trap"
    ],
    "sourcedoc": "AVEVA PDMS Command Reference",
    "sourcecodebase": "JDE_commPackage-reports.pmlmac"
  }
];
