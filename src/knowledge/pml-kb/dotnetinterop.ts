import type { KBEntry } from '../schemas/kb-entry.js';

export const dotnetinteropEntries: KBEntry[] = [
  {
    "id": "dn_import_statement",
    "category": "dotnetinterop",
    "subcategory": "import",
    "title": "import 'Namespace.ClassName'",
    "principle": "PML.NET позволяет включать .NET-объекты и вызывать их методы из PML; перед использованием контрол/сборку надо загрузить командой import, а пространство имён открыть через using namespace — иначе тип будет неизвестен.",
    "rule": "import 'AssemblyOrClassName' (в начале файла, обязательно в handle any/endhandle); открыть пространство имён using namespace 'X' (для .NET) перед созданием экземпляра; затем object NETTYPE().",
    "syntax": "import 'GridControl'\nhandle any\nendhandle\nusing namespace 'Aveva.Core.Presentation'",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\nimport 'GridControl'\nhandle any\nendhandle\nImport 'pmlfilebrowser'\nhandle any\nendhandle\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\nusing namespace 'Aveva.Core.Presentation'",
    "exampleAntipattern": "import 'GridControl'   $* без handle any/endhandle — отсутствие сборки прервёт загрузку файла",
    "pitfalls": [
      "Каждый import оборачивать handle any/endhandle (см. dn_import_guard)",
      "using namespace нужен перед созданием экземпляра .NET-типа",
      "Встречается и import, и Import (регистр не важен)"
    ],
    "relatedIds": [
      "dn_import_guard",
      "eh_import_protection",
      "dn_object_instantiation"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.18 (PML.NET Grid Control — IMPORT, using namespace, object NETGRIDCONTROL())",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "dn_import_guard",
    "category": "dotnetinterop",
    "subcategory": "safety",
    "title": "import всегда обёрнут в handle any / endhandle (ОБЯЗАТЕЛЬНО)",
    "principle": "Загрузка .NET-сборки может завершиться ошибкой (нет DLL, уже загружено, конфликт версий); такая ошибка без перехвата прервёт загрузку всего файла объекта/формы/функции — поэтому обёртка handle any вокруг каждого import является обязательной идиомой production-кода.",
    "rule": "Каждый import немедленно сопровождать handle any / endhandle (тело может быть пустым); ставить эти блоки до define object/setup form/define function.",
    "syntax": "import 'RamAEPMLExcelReader'\nhandle any\nendhandle",
    "exampleCanonical": "-- CB ramExcelReaderClass.pmlobj\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\n\ndefine object RAMEXCELREADERCLASS\n  member .excelTables  is ARRAY\nendobject",
    "exampleAntipattern": "import 'RamAEPMLExcelReader'\ndefine object RAMEXCELREADERCLASS   $* БЕЗ guard — при отсутствии сборки объект не загрузится вовсе",
    "pitfalls": [
      "Это самая частая забытая защита — приводит к 'object not found'",
      "Несколько import → каждый со своим handle/endhandle",
      "Тело handle можно оставить пустым"
    ],
    "relatedIds": [
      "eh_import_protection",
      "dn_import_statement",
      "eh_handle_any"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.18 (IMPORT); TM-1401 M&F §3.13.2 (HANDLE ANY)",
    "sourcecodebase": "ramExcelReaderClass.pmlobj"
  },
  {
    "id": "dn_object_instantiation",
    "category": "dotnetinterop",
    "subcategory": "instantiation",
    "title": "Создание экземпляра .NET-объекта из PML",
    "principle": "После import+using namespace .NET-тип создаётся той же конструкцией object TYPE(), что и обычный PML-объект; полученный экземпляр хранит .NET-объект, методы которого вызываются как PML-методы.",
    "rule": "Открыть using namespace 'X'; создать !obj = object NETTYPE([args]); далее вызывать его .NET-методы как PML-методы (.ReadExcel(), .show(), .handle()).",
    "syntax": "using namespace 'RamAEPMLExcelReader'\n!excelReader = object RamPMLExcelReaderClass()",
    "exampleCanonical": "-- CB ramExcelReaderClass.pmlobj\nusing namespace 'RamAEPMLExcelReader'\n!excelReader       = object RamPMLExcelReaderClass()\n!error = !excelReader.error()\nif(!error.set() AND !error.neq('')) then\n  !isError = true\n  !this.addErrorToList(!error)\nendif\n!this.excelTables  = !excelReader.ReadExcel(!excelFullPath)",
    "exampleAntipattern": "!r = object RamPMLExcelReaderClass()   $* без предшествующего using namespace тип не разрешится",
    "pitfalls": [
      "using namespace должен предшествовать созданию",
      "После создания методы .NET-объекта вызываются как обычные PML-методы",
      "Проверяйте .error() контрола сразу после создания"
    ],
    "relatedIds": [
      "dn_import_statement",
      "dn_method_call",
      "dn_excel_read_pattern"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.18 (object NETGRIDCONTROL(), object NETDATASOURCE(...))",
    "sourcecodebase": "ramExcelReaderClass.pmlobj"
  },
  {
    "id": "dn_method_call",
    "category": "dotnetinterop",
    "subcategory": "method_call",
    "title": "Вызов .NET-метода; передача аргументов PML→.NET",
    "principle": "Методы .NET-объекта вызываются точечной нотацией, а аргументы передаются как обычные PML-значения — фреймворк маппит типы (PML STRING → .NET string, REAL → double, BOOLEAN → bool); рискованный вызов оборачивают в handle.",
    "rule": "Вызывать !obj.Method(args) с PML-значениями; для возвращающих методов присваивать результат; рискованные .NET-вызовы оборачивать handle any; проверять полученные .NET-ошибки (GetErrorDetails()/.error()).",
    "syntax": "!excelData = !excelReader.ReadExcel(!excelFullPath, !sheetName)\n!fileBrowser.show(!directory, !seedFile, !title, false, !extensionString, 2)",
    "exampleCanonical": "-- CB ramTagManagement.pmlobj\n!elementNet = object CREATEELEMENT()\n!elementNet.SetElementTypeByName(|$!<type>|)\nhandle any\n  !this.addErrorToList(!name, 'NAME', !!error.text)\nelsehandle none\n  !elementNet.AddAttributeValue(|NAME|, !validName)\n  !elementNet.ExecuteSync()\n  !errors = !elementNet.GetErrorDetails()\nendhandle",
    "exampleAntipattern": "!elementNet.ExecuteSync()   $* без handle: ошибка .NET прервёт всю операцию без записи в лог",
    "pitfalls": [
      "Любой .NET-вызов может бросить исключение — оборачивайте критичные в handle any",
      "Проверяйте .NET-ошибки через GetErrorDetails()/.error()",
      "Строковый тип элемента подставляйте через |$!<type>|"
    ],
    "relatedIds": [
      "dn_object_instantiation",
      "dn_type_mapping",
      "eh_nested_handle",
      "pdms_element_create"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.18 (вызовы методов .NET grid: bindToDataSource, saveGridToExcel и т.д.)",
    "sourcecodebase": "ramTagManagement.pmlobj"
  },
  {
    "id": "dn_type_mapping",
    "category": "dotnetinterop",
    "subcategory": "types",
    "title": "Маппинг типов PML ↔ .NET и DB↔PML",
    "principle": "При обмене с .NET и при чтении из БД типы приводятся по фиксированной схеме; ramValueConverter инкапсулирует именно это сопоставление DB-типов в обобщённые PML-типы, что позволяет писать типонезависимый код конвертации.",
    "rule": "Знать схему DB→PML: INTEGER/REAL→REAL, WORD/TEXT→STRING, LOGICAL→BOOLEAN, REFERENCE→DBREF; для PML↔.NET — STRING↔string, REAL↔double, BOOLEAN↔bool; целевой тип получать из строки и создавать через object $!type().",
    "syntax": "if(!dbType INSET('INTEGER', 'REAL')) then\n  !type = 'REAL'\nelseif(!dbType INSET('WORD', 'TEXT')) then\n  !type = 'STRING'\n...",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\nif(!dbType INSET('INTEGER', 'REAL')) then\n  !type = 'REAL'\nelseif(!dbType INSET('WORD', 'TEXT')) then\n  !type = 'STRING'\nelseif(!dbType INSET('LOGICAL')) then\n  !type = 'BOOLEAN'\nelseif(!dbType INSET('REFERENCE')) then\n  !type = 'DBREF'\nendif",
    "exampleAntipattern": "-- NOT: создавать .NET object без import/using namespace и HANDLE guard\n-- Плохо: класс не найден или ошибка загрузки dll ломает макрос",
    "pitfalls": [
      "DB-тип REFERENCE → PML DBREF (а не STRING)",
      "LOGICAL → BOOLEAN (три состояния)",
      "Один и тот же конвертер используют riders/loaders — не дублировать схему"
    ],
    "relatedIds": [
      "tc_db_to_pml_mapping",
      "obj_factory_pattern",
      "dt_dbref_usage",
      "dn_method_call"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.18 (PML.NET data exchange) — основа; конкретная схема DB→PML из codebase",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "dn_excel_read_pattern",
    "category": "dotnetinterop",
    "subcategory": "excel",
    "title": "Полный паттерн чтения Excel через .NET",
    "principle": "Чтение Excel инкапсулировано в объект-обёртку (ramExcelReaderClass), который через .NET-ридер открывает файл, читает книгу/лист в массив таблиц и сразу проверяет .error() — это изолирует хрупкий .NET-вызов от остального кода и даёт единую точку обработки ошибок.",
    "rule": "import 'RamAEPMLExcelReader' + handle; using namespace; создать ридер; вызвать .ReadExcel(path) (вся книга) или .ReadExcel(path, sheet) (один лист); проверить .error(); результат — ARRAY таблиц (по листам).",
    "syntax": "using namespace 'RamAEPMLExcelReader'\n!excelReader = object RamPMLExcelReaderClass()\n!this.excelTables = !excelReader.ReadExcel(!excelFullPath)\n!error = !excelReader.error()",
    "exampleCanonical": "-- CB ramExcelReaderClass.pmlobj\n!this.clearData()\n!isError = false\nusing namespace 'RamAEPMLExcelReader'\n!excelReader       = object RamPMLExcelReaderClass()\n!error = !excelReader.error()\nif(!error.set() AND !error.neq('')) then\n  !isError = true\n  !this.addErrorToList(!error)\nendif\n!this.excelTables  = !excelReader.ReadExcel(!excelFullPath)\nreturn !isError",
    "exampleAntipattern": "-- прямой вызов .NET-ридера в каждом макросе без объекта-обёртки и без проверки .error()",
    "pitfalls": [
      "Всегда проверять .error() ридера",
      "Результат — ARRAY таблиц: [имя_листа, данные]",
      "Имена листов искать через .findFirst(|sheet-name|)"
    ],
    "relatedIds": [
      "dn_object_instantiation",
      "dn_import_guard",
      "ap_loader_chain",
      "frm_list_population"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.18 (PML.NET); §3.3 (FILE object — альтернатива для текстовых файлов)",
    "sourcecodebase": "ramExcelReaderClass.pmlobj"
  },
  {
    "id": "dn_file_write_pattern",
    "category": "dotnetinterop",
    "subcategory": "file_write",
    "title": "Запись файла (FILE.writeFile / saveGridToExcel)",
    "principle": "Для записи результатов используется либо PML-объект FILE (текст/CSV: преобразовать данные в массив строк и записать одной операцией), либо .NET grid-метод .saveGridToExcel() (для .xlsx); ramFileWriterClass инкапсулирует текстовый экспорт с разделителем.",
    "rule": "Текст/CSV: собрать ARRAY строк (строки через разделитель), !file = object FILE(!path), !file.writeFile('OVERW', !rows); Excel: привязать данные к NETGRIDCONTROL через NETDATASOURCE и вызвать .saveGridToExcel(path, sheet).",
    "syntax": "!file = object FILE(!path)\n!file.writeFile('OVERW', !textDataFormat)\n-- или для Excel:\n!dataTable.saveGridToExcel(|$!publishPath|, |data|)",
    "exampleCanonical": "-- CB ramFileWriterClass.pmlobj\n!file             = object FILE(!path)\n!file.writeFile('OVERW', !textDataFormat)\n-- CB: JDE_tagProperties_export.pmlmac — экспорт в Excel через .NET grid\n!dataTable = object NETGRIDCONTROL()\n!source = object NETDATASOURCE('data', !headerList, !dataList)\n!dataTable.BindToDataSource(!source)\n!dataTable.saveGridToExcel(|$!publishPath|, |data|)",
    "exampleAntipattern": "-- построчная запись каждой ячейки отдельным writeRecord вместо подготовки массива строк и одной writeFile",
    "pitfalls": [
      "writeFile принимает режим ('WRITE'/'OVERWRITE'/'APPEND'; в codebase встречается 'OVERW')",
      "Excel-экспорт идёт через .NET grid, не через FILE",
      "Имя файла часто с датой — см. mac_file_path_pattern"
    ],
    "relatedIds": [
      "mac_file_path_pattern",
      "dn_excel_read_pattern",
      "log_output_targets",
      "dt_string_substitution"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §3.3 (FILE Object — open/writeRecord/writeFile, OVERWRITE/APPEND); §2.18 (saveGridToExcel)",
    "sourcecodebase": "ramFileWriterClass.pmlobj"
  },
  {
    "id": "p2_pmlfilebrowser",
    "category": "dotnetinterop",
    "subcategory": "filedialogs",
    "title": "PMLFILEBROWSEROPEN/SAVE file dialogs",
    "principle": "Use AVEVA .NET PMLFILEBROWSER from `Aveva.Core.Presentation` for file open/save dialogs.",
    "rule": "Import/namespace the browser class, create OPEN or SAVE browser according to target version, call `.show(...)`, then read `.file()` and check `.set()`/non-empty before use.",
    "syntax": "using namespace 'Aveva.Core.Presentation'\n!fb = object PMLFILEBROWSER('OPEN')\n!fb.show(!directory, !seedFile, !title, false, !extensionString, 2)\n!filename = !fb.file()",
    "exampleCanonical": "-- CB ramExcelReaderClass.pmlobj\nusing namespace 'Aveva.Core.Presentation'\n!fileBrowser = object PMLFILEBROWSER('OPEN')\n!extensionString = 'xlsx files (*.xlsx)|*.xlsx'\n!fileBrowser.show(!directory, !seedFile, !title, false , !extensionString, 2)\n!filename = !fileBrowser.file()",
    "exampleAntipattern": "-- NOT: !filename = !fileBrowser.file() then immediately read Excel without checking result\n-- Плохо: user can cancel dialog; filename may be unset/empty",
    "pitfalls": [
      "Some versions require `import 'PMLFileBrowser'` before using namespace",
      "OPEN vs SAVE constructor/mode must match intent",
      "Always check `.set()` and non-empty file path",
      "Filter string syntax is easy to mistype"
    ],
    "relatedIds": [
      "dn_import_statement",
      "dn_import_guard",
      "dt_unset_handling"
    ],
    "sourcedoc": "AVEVA PML File Browser docs; TM-1402 Form Design; Perplexity PML KB §9.1",
    "sourcecodebase": "ramExcelReaderClass.pmlobj"
  },
  {
    "id": "p2_pmltags",
    "category": "dotnetinterop",
    "subcategory": "tags-api",
    "title": "PMLTAGS / Aveva.Engineering.Tags API",
    "principle": "AVEVA Engineering tag APIs are accessed through .NET interop imports and namespace setup.",
    "rule": "Import the relevant Aveva.Engineering tag/element manager assembly, use namespace, create tag manager objects, and guard calls with HANDLE because API availability depends on installation/version.",
    "syntax": "import 'Aveva.Engineering.PMLElementManager'\nusing namespace 'Aveva.Engineering.PMLElementManager'\n!creator = object CreateElements()",
    "exampleCanonical": "-- CB EIS_data_export.pmlmac\n-- EIS export macros prepare tag/export data and use Aveva Engineering integration patterns for tag workflows",
    "exampleAntipattern": "-- NOT: create tag API objects without import/namespace guard\n-- Плохо: missing assembly stops the whole export macro",
    "pitfalls": [
      "Assembly names differ across AVEVA versions",
      "Guard imports with HANDLE ANY",
      "Keep tag export separate from file formatting pipeline"
    ],
    "relatedIds": [
      "dn_import_statement",
      "dn_import_guard",
      "ap_pipeline_macro"
    ],
    "sourcedoc": "AVEVA Engineering Tags/PMLElementManager docs; Perplexity PML KB §9.4",
    "sourcecodebase": "EIS_data_export.pmlmac"
  },
  {
    "id": "p2_measure_unit",
    "category": "dotnetinterop",
    "subcategory": "measure-unit",
    "title": "MEASURE and UNIT objects",
    "principle": "MEASURE describes the dimension and UNIT describes a concrete unit/scale for numeric values.",
    "rule": "Use UNIT/MEASURE object APIs for engineering units instead of embedding unit text in strings. Convert/format values explicitly when exporting.",
    "syntax": "!u = object UNIT('mm')\n!name = !u.name()\n!measure = !u.dimension()",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n-- Value conversion object centralises DB value to PML type conversion before export/write operations",
    "exampleAntipattern": "-- NOT: !lengthText = !length.string() & 'mm' everywhere\n-- Плохо: unit conversion and display format are duplicated across code",
    "pitfalls": [
      "Verify unit names in target AVEVA version",
      "Separate numeric value from display unit",
      "UNIT.Dimension() returns MEASURE metadata"
    ],
    "relatedIds": [
      "tc_db_to_pml_mapping",
      "tc_real_to_string",
      "dn_type_mapping"
    ],
    "sourcedoc": "AVEVA UNIT/MEASURE object docs; Perplexity PML KB §9.5",
    "sourcecodebase": "ramValueConverter.pmlobj"
  }
];
