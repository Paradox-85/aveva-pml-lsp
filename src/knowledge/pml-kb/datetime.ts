import type { KBEntry } from '../schemas/kb-entry.js';

export const datetimeEntries: KBEntry[] = [
  {
    "id": "p2_datetime_api",
    "category": "datetime",
    "subcategory": "datetime-object",
    "title": "OBJECT DATETIME full API",
    "principle": "DATETIME represents date/time values and supports constructors, component access, comparison and UTC/local conversion.",
    "rule": "Create with `OBJECT DATETIME()` for current time or constructor arguments for explicit dates. Use `.year()/.month()/.date()/.string()` and comparison/conversion methods instead of manual string parsing when possible.",
    "syntax": "!dt = OBJECT DATETIME()\n!dt2 = OBJECT DATETIME(2026, 6, 3)\n!year = !dt.year()\n!stamp = !dt.string()",
    "exampleCanonical": "-- CB EIS_data_export.pmlmac\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')",
    "exampleAntipattern": "-- NOT: build all timestamps by substring offsets without validating date format\n-- Плохо: locale/format differences break parsing",
    "pitfalls": [
      "Constructor overloads vary by version; verify target Plant/E3D docs",
      "Month/date components may need formatting such as string('I2')",
      "Use UTC/local conversion deliberately"
    ],
    "relatedIds": [
      "p2_dateformat",
      "tc_date_parsing",
      "dt_string_substitution"
    ],
    "sourcedoc": "AVEVA DATETIME Object docs; Perplexity PML KB §5.4",
    "sourcecodebase": "EIS_data_export.pmlmac"
  },
  {
    "id": "p2_dateformat",
    "category": "datetime",
    "subcategory": "dateformat-object",
    "title": "DATEFORMAT object for formatting dates",
    "principle": "DATEFORMAT centralizes date string formatting instead of scattering manual concatenation rules.",
    "rule": "Use DATEFORMAT when the target AVEVA version exposes it; otherwise document the manual component formatting fallback.",
    "syntax": "!fmt = object DATEFORMAT()\n-- version-specific DATEFORMAT configuration\n!text = !datetime.string()",
    "exampleCanonical": "-- CB EIS_data_export.pmlmac\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')",
    "exampleAntipattern": "-- NOT: concatenate year/month/day without zero-padding\n-- Плохо: file names and lexical sorting become inconsistent",
    "pitfalls": [
      "DATEFORMAT API is version-specific",
      "Always zero-pad month/day for filenames",
      "Keep display format separate from storage filename format"
    ],
    "relatedIds": [
      "p2_datetime_api",
      "tc_date_parsing"
    ],
    "sourcedoc": "AVEVA DATEFORMAT/DATETIME docs; Perplexity PML KB §5.4",
    "sourcecodebase": "EIS_data_export.pmlmac"
  },
  {
    "id": "datetime_file_timestamp",
    "category": "datetime",
    "subcategory": "file-timestamp",
    "title": "DATETIME-based file timestamp pattern",
    "principle": "Export macros use DATETIME components to build stable timestamped filenames.",
    "rule": "Read year/month/day from DATETIME and format month/day with `string('I2')` before concatenating paths.",
    "syntax": "!dt = OBJECT DATETIME()\n!stamp = !dt.year().string() & !dt.month().string('I2') & !dt.date().string('I2')",
    "exampleCanonical": "-- CB EIS_data_export.pmlmac\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')",
    "exampleAntipattern": "-- NOT: !stamp = !dt.year() & !dt.month() & !dt.date()\n-- Плохо: month/day are not consistently zero-padded",
    "pitfalls": [
      "Convert REAL components to STRING explicitly when needed",
      "Pad month/day",
      "Avoid locale-dependent display strings in filenames"
    ],
    "relatedIds": [
      "p2_datetime_api",
      "p2_dateformat",
      "mac_file_path_pattern"
    ],
    "sourcedoc": "Perplexity PML KB §5.4; codebase EIS export",
    "sourcecodebase": "EIS_data_export.pmlmac"
  },
  {
    "id": "pml-object-datetime-dateformat",
    "category": "datetime",
    "subcategory": "datetime",
    "title": "DATETIME and DATEFORMAT objects — Timestamp generation",
    "principle": "DATETIME provides current date/time components. DATEFORMAT formats them into strings with configurable patterns.",
    "rule": "!time = object DATETIME()\n!dateFormat = object DATEFORMAT('Y_M_D')\n!dateStr = !dateFormat.string(!time)\n!fileName = !dateFormat.string(!time) + '_' + !time.hour().string() + ...",
    "syntax": "!time = object DATETIME()\n!dateFormat = object DATEFORMAT('Y_M_D')\n!dateStr = !dateFormat.string(!time)\n!fileName = !dateFormat.string(!time) + '_' + !time.hour().string() + !time.minute().string() + !time.second().string()",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n-- CB obj_06: timestamp-based filename\n!time = object DATETIME()\n!dateFormat = object DATEFORMAT('Y_M_D')\n!dateStr = !dateFormat.string(!time)\n!fileName = !dateFormat.string(!time) + '_' + !time.hour().string() + !time.minute().string() + !time.second().string()",
    "exampleAntipattern": "!fileName = !time.string() -- less control over format",
    "pitfalls": [
      "DATEFORMAT pattern uses Y_M_D not YYYY-MM-DD",
      "hour()/minute()/second() return numeric values requiring .string()"
    ],
    "relatedIds": [
      "pml-object-measure-format"
    ],
    "sourcedoc": "obj_06 (ramImportExcelElementLoader.pmlobj)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "macro_setdate_stamp",
    "category": "datetime",
    "subcategory": "SetDate",
    "title": "SetDate of dbref — extract date from STAMP",
    "principle": "Use SetDate of dbref to extract a date value from a STAMP element.",
    "rule": "VAR !date SetDate of $!stampVar",
    "syntax": "VAR !resultVar SetDate of $!dbref",
    "exampleCanonical": "-- CB EBE_delta_tag_export.pmlmac\n-- CB mac_03\n!latestStamp = !stamps.first()\nvar !stampDate SetDate of $!latestStamp",
    "exampleAntipattern": "-- WRONG: omit validated pattern for SetDate of dbref — extract date from STAMP\n-- Review source EBE_delta_tag_export.pmlmac before reuse",
    "pitfalls": [
      "STAMP must be a valid dbref; otherwise SetDate returns UNSET"
    ],
    "relatedIds": [
      "p2_datetime_api"
    ],
    "sourcedoc": "AVEVA Engineering PML Reference",
    "sourcecodebase": "EBE_delta_tag_export.pmlmac"
  },
  {
    "id": "datetime_object_constructor",
    "category": "datetime",
    "subcategory": "datetime",
    "title": "OBJECT DATETIME() constructor and accessor methods",
    "principle": "OBJECT DATETIME() creates a datetime object. Access year, month, date, hour, minute via accessor methods.",
    "rule": "Use !dt = OBJECT DATETIME() then !dt.year(), !dt.month(), etc. Convert to formatted string with .string('format').",
    "syntax": "!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')\n!date = !dt.date().string('I2')",
    "exampleAntipattern": "!year = !!datetime.year()  -- incorrect global reference",
    "pitfalls": [
      ".string('I2') pads with leading zero for single-digit months/days/hours",
      "Available as PML2 object; verify PML1 equivalent if needed"
    ],
    "relatedIds": [
      "p2_datetime_api"
    ],
    "sourcedoc": "AVEVA PML Customization — Object Methods",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  }
];
