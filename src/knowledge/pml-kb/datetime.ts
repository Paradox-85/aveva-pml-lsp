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
  }
];
