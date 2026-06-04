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
  },

  {
    id: 'd7_element_creation_api',
    category: 'dotnetinterop',
    subcategory: 'PMLElementManager',
    title: 'Element creation via Aveva.Engineering.PMLElementManager',
    principle: 'Use CREATEELEMENT and ELEMENTTYPE objects to create elements with typed attributes in AVEVA Engineering.',
    rule: 'Create ELEMENTTYPE with class name, validate name() is not UNKNOWN, then call SetElementTypeByName, AddAttributeValue, Execute, and GetErrors.',
    syntax: `!elem = object CREATEELEMENT()
!et = object ELEMENTTYPE('|:$<ClassName>|')
if (!et.name() neq |UNKNOWN|) then
  !elem.SetElementTypeByName('|:$<ClassName>|')
  !elem.AddAttributeValue('|NAME|', !tagName)
  !elem.Execute()
  !errors = !elem.GetErrors()
endif`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!elem = object CREATEELEMENT()
!et = object ELEMENTTYPE('|:$!<Type>|')
if (!et.name() neq |UNKNOWN|) then
  !elem.SetElementTypeByName('|:$!<Type>|')
  !elem.AddAttributeValue(|NAME|, !tag)
  !elem.Execute()
  !errors = !elem.GetErrors()
  DO !error values !errors
    !err = |$!tag;NA;NA;$!error|
    !issueData.append(!err.split(|;|))
  ENDDO
endif`,
    exampleAntipattern: `-- Creating element without type validation
!elem = object CREATEELEMENT()
!elem.SetElementTypeByName('|:$!<Type>|')  -- crashes if type is unknown
!elem.Execute()`,
    pitfalls: [
      'Always check ELEMENTTYPE.name() neq UNKNOWN before calling SetElementTypeByName',
      'GetErrors() returns an ARRAY of error strings — iterate to log them',
      'CREATEELEMENT is in Aveva.Engineering.PMLElementManager namespace, not a builtin'
    ],
    relatedIds: ['obj_namespace_loading', 'd7_attribute_hash_validation', 'pdms_element_create'],
    sourcedoc: 'AVEVA Engineering PML Customization — Database Interfaces',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    id: 'd7_netgridcontrol_excel_io',
    category: 'dotnetinterop',
    subcategory: 'GridControl',
    title: 'NETGRIDCONTROL and NETDATASOURCE for Excel import/export',
    principle: 'Use NETGRIDCONTROL and NETDATASOURCE objects to read/write Excel files in PML macros.',
    rule: 'Create NETGRIDCONTROL, bind to NETDATASOURCE with file path, call getrows()/gettitles(), iterate data, write results back via clearGrid + BindToDataSource + saveGridToExcel.',
    syntax: `!grid = object NETGRIDCONTROL()
!source = object NETDATASOURCE('Grid Table', !fileName)
!grid.bindToDataSource(!source)
!data = !grid.getrows()
!heading = !grid.gettitles()`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!grid = object NETGRIDCONTROL()
!dataSource = object NETDATASOURCE('Grid Table', !fileName)
!grid.bindToDataSource(!dataSource)
!data = !grid.getrows()
!heading = !grid.gettitles()`,
    exampleAntipattern: `-- Missing import for GridControl
!grid = object NETGRIDCONTROL()  -- fails without import 'GridControl'`,
    pitfalls: [
      "Must import 'GridControl' with handle any/endhandle",
      "NETDATASOURCE constructor signature: NETDATASOURCE('Grid Table', fileName) for read, NETDATASOURCE('data', headers, data) for write",
      'saveGridToExcel requires the data argument to match the NETDATASOURCE name'
    ],
    relatedIds: ['p2_netgrid_full', 'dn_import_statement', 'dn_object_instantiation', 'dn_excel_read_pattern'],
    sourcedoc: 'AVEVA PML Add-ins documentation',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    id: 'net_grid_data_source_workflow',
    category: 'dotnetinterop',
    subcategory: 'GridControl',
    title: 'NETDATASOURCE + NETGRIDCONTROL data-binding workflow',
    principle:
      'Use NETDATASOURCE to bind an external data file to a NETGRIDCONTROL, then retrieve rows via getrows() for iteration.',
    rule:
      "import |GridControl| with handle/elsehandle; create NETDATASOURCE with grid table name and file path; create NETGRIDCONTROL; call bindToDataSource then getrows; iterate with DO...VALUES.",
    syntax: `!dataSource = object NETDATASOURCE('Grid Table', !fileName)
!dataTable = object NETGRIDCONTROL()
!dataTable.bindToDataSource(!dataSource)
!data = !dataTable.getrows()
do !row values !data
  ...
ENDDO`,
    exampleCanonical: `-- CB JDE_tagProperties_upload.pmlmac
!dataSource = object NETDATASOURCE('Grid Table', !fileName)
!dataTable = object NETGRIDCONTROL()
!dataTable.bindToDataSource(!dataSource)
!data = !dataTable.getrows()
do !row values !data
  !Tag = !row[1]
  !EngCon = !row[2]
  !InsCon = !row[3]
enddo`,
    exampleAntipattern: `-- WRONG: use grid before binding a data source
!data = !dataTable.getrows()`,
    pitfalls: [
      "NETDATASOURCE constructor first arg is the table/grid name, not the file path.",
      'getrows() may return UNSET if the file is empty or unreadable — always check .Unset().',
      'GridControl must be imported before use.',
    ],
    relatedIds: ['p2_netgrid_full', 'dn_object_instantiation', 'cf_do_enddo_loop'],
    sourcedoc: 'NET Interfaces.md, test2form.pmlfrm',
    sourcecodebase: 'JDE_tagProperties_upload.pmlmac',
  },
  {
    "id": "cb_netgrid_excel_export_macro",
    "category": "dotnetinterop",
    "subcategory": "dotnet-grid-export",
    "title": "GridControl NETGRIDCONTROL and NETDATASOURCE Excel export",
    "principle": "GridControl exports bind NETDATASOURCE data to NETGRIDCONTROL and save the grid to Excel.",
    "rule": "GridControl exports bind NETDATASOURCE data to NETGRIDCONTROL and save the grid to Excel.",
    "syntax": "	!dataList.append(!rowData)\nenddo",
    "exampleCanonical": "-- CB JDE_pipeData_export.pmlmac\n	!dataList.append(!rowData)\nenddo\n!publishPath = |C:\Users\ADZV\OneDrive - Ramboll\Ramboll_Jackdaw - Admin Team\Aveva\_RAM data\_analisys\Pipes\pipe_export.xlsx|\n!dataTable = object NETGRIDCONTROL()\n!dataTable.clearGrid()\n!source = object NETDATASOURCE('data', !headerList, !dataList)\n!dataTable.BindToDataSource(!source)\n!dataTable.saveGridToExcel(|$!publishPath|, |data|)",
    "exampleAntipattern": "-- WRONG: use GridControl NETGRIDCONTROL and NETDATASOURCE Excel export without validating the source context in JDE_pipeData_export.pmlmac",
    "pitfalls": [
          "Validate against JDE_pipeData_export.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_pipeData_export.pmlmac"
  },
  {
    "id": "KB-DEP-NAMESPACE-RAMAEUPDATEELEMENT",
    "category": "dotnetinterop",
    "subcategory": "using-namespace",
    "title": "AVEVA automation add-in namespace objects",
    "principle": "The `using namespace 'ModuleName'` directive allows creating objects from .NET add-in assemblies. AVEVA provides internal namespaces like RamAEUpdateElement with factory objects (CREATEELEMENT, DELETEELEMENT, UPDATEATTRIBUTE, RECLASSIFYELEMENT).",
    "rule": "Always wrap namespace object creation in handle/elsehandle blocks since .NET objects may throw exceptions.",
    "syntax": "using namespace 'NamespaceName'\n!obj = object OBJECTNAME()\nhandle any\n  -- error handling\nelsehandle none\n  -- success\nendhandle",
    "exampleCanonical": "-- CB ramTagManagement.pmlobj\nusing namespace 'RamAEUpdateElement'\n!elementNet = object CREATEELEMENT()\n!elementNet.setElementTypeByName('|$!<type>|')\nhandle any\n  !this.addErrorToList(!name, 'NAME', !!error.text)\nelsehandle none\n  !elementNet.addAttributeValue(|NAME|, !validName)\n  !elementNet.executeSync()\nendhandle",
    "exampleAntipattern": "-- No error handling on .NET object creation\n!obj = object CREATEELEMENT()\n!obj.executeSync() -- may throw",
    "pitfalls": [
      "The namespace must be imported/available at runtime.",
      ".NET objects may throw exceptions not caught by PML's handle any unless explicitly wrapped.",
      "Some namespace objects require specific execution order (e.g., setElementType before execute)."
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "AVEVA PML Add-ins Guide",
    "sourcecodebase": "ramTagManagement.pmlobj"
  },
  {
    "id": "engineering-tags-common-attribute-map",
    "category": "dotnetinterop",
    "subcategory": "attribute-mapping",
    "title": "Two-column Engineering Tags attribute map",
    "principle": "A two-column attribute map centralizes Engineering Tags source and target attribute names.",
    "rule": "A two-column attribute map centralizes Engineering Tags source and target attribute names.",
    "syntax": "-- Run path: $m \"C:\Users\ADZV\OneDrive - Ramboll\AVEVA_SERVER\Addons\PMLLIB\RAM\Engineering\jackdow\run-macro\EIS_data_export.pmlmac\"\n-- Run set of routine macro for update data in Jackdaw (JDE)",
    "exampleCanonical": "-- CB EIS_data_export.pmlmac\n-- Run path: $m \"C:\Users\ADZV\OneDrive - Ramboll\AVEVA_SERVER\Addons\PMLLIB\RAM\Engineering\jackdow\run-macro\EIS_data_export.pmlmac\"\n-- Run set of routine macro for update data in Jackdaw (JDE)\n--Author: Andrei Aitzhanov\n-- Company Ramboll Energies\n-- Date: 26-03-2023\n--ONERROR GOLABEL /Error\nimport 'Aveva.Engineering.Tags.Pml'\nhandle any\nendhandle",
    "exampleAntipattern": "-- WRONG: use Two-column Engineering Tags attribute map without validating the source context in EIS_data_export.pmlmac",
    "pitfalls": [
          "Validate against EIS_data_export.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "EIS_data_export.pmlmac"
  },
  {
    "id": "export-data-sentinel-replacement-list",
    "category": "dotnetinterop",
    "subcategory": "data-cleaning",
    "title": "Sentinel replacement list for Excel export normalization",
    "principle": "Engineering exports often pass an ARRAY of semicolon-delimited source/replacement strings to normalize unset, invalid, or placeholder values.",
    "rule": "Engineering exports often pass an ARRAY of semicolon-delimited source/replacement strings to normalize unset, invalid, or placeholder values.",
    "syntax": "!replaceData = OBJECT ARRAY()\\n!replaceData.Append('source;replacement')",
    "exampleCanonical": "-- CB EIS_data_export.pmlmac\n-- Pattern: Sentinel replacement list for Excel export normalization",
    "exampleAntipattern": "-- WRONG: omit validated pattern for Sentinel replacement list for Excel export normalization\n-- Review source EIS_data_export.pmlmac before reuse",
    "pitfalls": [
      "Validate Sentinel replacement list for Excel export normalization against EIS_data_export.pmlmac before reuse."
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "EIS_data_export.pmlmac"
  },
  {
    "id": "customer-ram-aepml-excel-reader-namespace",
    "category": "dotnetinterop",
    "subcategory": "namespace",
    "title": "RamAEPMLExcelReader — Customer Import Namespace",
    "principle": "PML import directive for customer Excel reader add-in.",
    "rule": "Use import or using namespace to load the RamAEPMLExcelReader add-in before instantiating its classes.",
    "syntax": "import 'RamAEPMLExcelReader'\\nhandle any\\nendhandle",
    "exampleCanonical": "-- CB ramImportExcelConfigLoader.pmlobj\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\n\ndefine object RAMIMPORTEXCELCONFIGLOADER\n  -- object body\nendobject",
    "exampleAntipattern": "// ❌ Missing import\n!reader = object RamPMLExcelReaderClass()  -- Fails without import",
    "pitfalls": [
      "Must be imported at file scope before any usage",
      "Handle import errors with handle any/endhandle block"
    ],
    "relatedIds": [
      "customer-ram-pml-excel-reader-class"
    ],
    "sourcedoc": "ramImportExcelConfigLoader.pmlobj",
    "sourcecodebase": "ramImportExcelConfigLoader.pmlobj"
  },
  {
    "id": "customer-ram-common-logger-addlogdetails",
    "category": "dotnetinterop",
    "subcategory": "logging",
    "title": "RAMCOMMONLOGGER.addLogDetails() — Customer Logging Method",
    "principle": "Customer-specific method to log error details with context.",
    "rule": "Pass element type (via objecttype()), error array, and optionally other context to addLogDetails.",
    "syntax": "!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)",
    "exampleCanonical": "-- CB ramImportExcelConfigLoader.pmlobj\n!errorList = object ARRAY()\n!errorList.append(!element)\n!errorList.append(!detail)\n!errorList.append(!error)\n!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)",
    "exampleAntipattern": "// ❌ Missing error list wrapping\n!!ramCommonLogger.addLogDetails(!this.objecttype(), !element)  -- Wrong signature",
    "pitfalls": [
      "Validate RAMCOMMONLOGGER.addLogDetails() — Customer Logging Method against ramImportExcelConfigLoader.pmlobj before reuse."
    ],
    "relatedIds": [
      "customer-ram-common-logger-global"
    ],
    "sourcedoc": "ramImportExcelConfigLoader.pmlobj",
    "sourcecodebase": "ramImportExcelConfigLoader.pmlobj"
  },
  {
    "id": "customer-ram-pml-excel-reader-class",
    "category": "dotnetinterop",
    "subcategory": "excel-reader",
    "title": "RamPMLExcelReaderClass — Customer Excel Reader",
    "principle": "Customer-specific Excel reading class used by RAMImportExcelConfigLoader.",
    "rule": "RamPMLExcelReaderClass() is instantiated via object constructor. Its ReadExcel(!path) method returns a nested ARRAY of sheet tables.",
    "syntax": "!excelReader = object RamPMLExcelReaderClass()\\n!tables = !excelReader.ReadExcel(!excelFullPath)",
    "exampleCanonical": "-- CB ramImportExcelConfigLoader.pmlobj\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\n\nusing namespace 'RamAEPMLExcelReader'\n!excelReader = object RamPMLExcelReaderClass()\n!excelTables = !excelReader.ReadExcel(!excelFullPath)",
    "exampleAntipattern": "// ❌ Do not hardcode path or forget import\n!excelTables = RamPMLExcelReaderClass.ReadExcel('C:\\\\\\\\data.xlsx')",
    "pitfalls": [
      "Requires import of RamAEPMLExcelReader before use",
      "ReadExcel returns nested ARRAY; each sheet is a sub-array"
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "ramImportExcelConfigLoader.pmlobj",
    "sourcecodebase": "ramImportExcelConfigLoader.pmlobj"
  },
  {
    "id": "dotnet_netdatasource",
    "category": "dotnetinterop",
    "subcategory": "NetDataSource",
    "title": "NetDataSource .NET object for grid data binding",
    "principle": "NetDataSource creates a .NET data source from PML arrays for binding to grid controls.",
    "rule": "!source = object NetDataSource(name, headers, data)\n!grid.BindToDataSource(!source)",
    "syntax": "NetDataSource(STRING name, ARRAY headers, ARRAY data)",
    "exampleCanonical": "-- CB EBE_delta_tag_export.pmlmac\n-- CB mac_03\n!source = object NetDataSource('$!<gridName>', !headerList, !dataList)\n!dataTable.clearGrid()\n!dataTable.BindToDataSource(!source)",
    "exampleAntipattern": "-- WRONG: omit validated pattern for NetDataSource .NET object for grid data binding\n-- Review source EBE_delta_tag_export.pmlmac before reuse",
    "pitfalls": [
      "headers must be ARRAY of STRING",
      "data must be ARRAY of ARRAY (rows)",
      "namespace must be Aveva.Core.Presentation"
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "AVEVA Core Presentation API",
    "sourcecodebase": "EBE_delta_tag_export.pmlmac"
  },
  {
    "id": "ui_netgridcontrol_export",
    "category": "dotnetinterop",
    "subcategory": "NETGRIDCONTROL",
    "title": "NETGRIDCONTROL saveGridToExcel method",
    "principle": "NETGRIDCONTROL.saveGridToExcel exports the bound grid to an Excel file.",
    "rule": "!grid.saveGridToExcel(path, format, description)",
    "syntax": "saveGridToExcel(STRING path, STRING format, STRING description)",
    "exampleCanonical": "-- CB EBE_delta_tag_export.pmlmac\n-- CB mac_03\n!dataTable.saveGridToExcel('|$!publishPath$!dataFileName|', |data|, |Export delta. Author: $!<userName> Date: $!<startDateTime> Comparison Date: $!<stampDate>|)",
    "exampleAntipattern": "-- WRONG: omit validated pattern for NETGRIDCONTROL saveGridToExcel method\n-- Review source EBE_delta_tag_export.pmlmac before reuse",
    "pitfalls": [
      "Path must include file extension (.xlsx)",
      "Format parameter determines Excel export format"
    ],
    "relatedIds": [
      "dotnet_netdatasource"
    ],
    "sourcedoc": "AVEVA Core Presentation API",
    "sourcecodebase": "EBE_delta_tag_export.pmlmac"
  },
  {
    "id": "dotnet_gridcontrol_export",
    "category": "dotnetinterop",
    "subcategory": "GridControl",
    "title": "GridControl .NET add-in for Excel export",
    "principle": "The GridControl add-in provides NETGRIDCONTROL and NETDATASOURCE objects for building tabular data and exporting to Excel.",
    "rule": "Import GridControl, use 'handle any' for the import, create NETDATASOURCE with header/data arrays, bind to NETGRIDCONTROL, then call saveGridToExcel().",
    "syntax": "import 'GridControl'\nhandle any\nendhandle\n!source = object NETDATASOURCE('data', !headers, !data)\n!grid = object NETGRIDCONTROL()\n!grid.BindToDataSource(!source)\n!grid.saveGridToExcel(!path)",
    "exampleCanonical": "-- CB EBA_full_tag_export.pmlmac\nusing namespace |Aveva.Core.Presentation|\n!dataTable = object NETGRIDCONTROL()\n!dataTable.clearGrid()\n!source = object NETDATASOURCE('data', !headerList, !dataList)\n!dataTable.BindToDataSource(!source)\n!dataTable.saveGridToExcel(|$!<publishPath>$!<dataFileName>|)",
    "exampleAntipattern": "-- WRONG: omit validated pattern for GridControl .NET add-in for Excel export\n-- Review source EBA_full_tag_export.pmlmac before reuse",
    "pitfalls": [
      "NETDATASOURCE 'data' mode requires header array as second argument.",
      "saveGridToExcel accepts a full file path including extension.",
      "Namespace may be 'Aveva.Core.Presentation' or 'Aveva.Pdms.Presentation' depending on E3D version."
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "AVEVA E3D .NET Add-in Reference",
    "sourcecodebase": "EBA_full_tag_export.pmlmac"
  },
  {
    "id": "kb-tagmanagementtmp-object",
    "category": "dotnetinterop",
    "subcategory": "pdms_addons",
    "title": "TAGMANAGEMENTTMP Object",
    "principle": "TAGMANAGEMENTTMP is a custom/external object used for tag management operations including alarm updates and class name updates.",
    "rule": "Always PML RELOAD OBJECT before creating instances of TAGMANAGEMENTTMP to ensure latest method definitions are loaded.",
    "syntax": "PML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.GetMappingData()\n!tagMgmt.ClassNameUpdate(boolean)",
    "exampleCanonical": "-- CB class-name-refresh.pmlmac\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.GetMappingData()\n!tagMgmt.ClassNameUpdate(true)",
    "exampleAntipattern": "!tagMgmt = object TAGMANAGEMENTTMP()  -- missing RELOAD OBJECT first\n!tagMgmt.ClassNameUpdate(true)",
    "pitfalls": [
      "Skipping PML RELOAD OBJECT may cause stale method definitions.",
      "ClassNameUpdate expects a boolean argument; omitting it causes runtime error."
    ],
    "relatedIds": [
      "kb-pml-reload-object-directive"
    ],
    "sourcedoc": "AVEVA PDMS/Plant Customization Guide",
    "sourcecodebase": "class-name-refresh.pmlmac"
  },
  {
    "id": "netdatasource_3arg_constructor",
    "category": "dotnetinterop",
    "subcategory": "datasource",
    "title": "NetDataSource 3-argument constructor with headers and data",
    "principle": "NetDataSource accepts (name, headers, data) where headers is an array of column names and data is a 2D array of rows.",
    "rule": "!source = object NetDataSource('$!<gridName>', !headerList, !dataList) where !dataList is ARRAY of ARRAY.",
    "syntax": "!source = object NetDataSource('|gridName|', !headers, !rows)",
    "exampleCanonical": "-- CB JDE_delta_tag_export.pmlmac\n-- CB mac_22\n!source = object NetDataSource('$!<gridName>', !headerList, !dataList)",
    "exampleAntipattern": "Passing flat array as data — causes column misalignment",
    "pitfalls": [
      "Data must be ARRAY of ARRAY (each row is an ARRAY)",
      "Header count must match column count in each row"
    ],
    "relatedIds": [
      "netgridcontrol_methods"
    ],
    "sourcedoc": "AVEVA Core.Presentation GridControl",
    "sourcecodebase": "JDE_delta_tag_export.pmlmac"
  },
  {
    "id": "netdatasource_gridcontrol_export",
    "category": "dotnetinterop",
    "subcategory": "grid_export",
    "title": "NETDATASOURCE + NETGRIDCONTROL Excel export pattern",
    "principle": "Use NETGRIDCONTROL with NETDATASOURCE to create tabular data views and export to Excel. NETDATASOURCE takes a name, header array, and data array.",
    "rule": "1) Create NETGRIDCONTROL object. 2) Create NETDATASOURCE with header list and data array. 3) Bind data source to grid. 4) Call saveGridToExcel with file path.",
    "syntax": "!grid = object NETGRIDCONTROL()\n!grid.clearGrid()\n!source = object NETDATASOURCE('name', !headerList, !dataArray)\n!grid.BindToDataSource(!source)\n!grid.saveGridToExcel('|$!filePath|)', clearData)",
    "exampleCanonical": "-- CB JDE_dbView_extractor.pmlmac\n!dataTable = object NETGRIDCONTROL()\n!dataTable.clearGrid()\n!source = object NETDATASOURCE('data', !headerList, !data)\n!dataTable.BindToDataSource(!source)\n!dataTable.saveGridToExcel(|$!dataFile|)",
    "exampleAntipattern": "-- WRONG: omit validated pattern for NETDATASOURCE + NETGRIDCONTROL Excel export pattern\n-- Review source JDE_dbView_extractor.pmlmac before reuse",
    "pitfalls": [
      "NETDATASOURCE constructor signature: (name, headers, data) — headers must be an ARRAY, data must be an ARRAY of arrays or strings",
      "saveGridToExcel accepts file path as pipe-delimited string with $! variable substitution",
      "import 'GridControl' with handle ANY tolerance is recommended — NETGRIDCONTROL may not be available in all environments"
    ],
    "relatedIds": [
      "netgridcontrol_core_presentation"
    ],
    "sourcedoc": "JDE_dbView_extractor.pmlmac",
    "sourcecodebase": "JDE_dbView_extractor.pmlmac"
  },
  {
    "id": "netdatasource_object",
    "category": "dotnetinterop",
    "subcategory": "grid_controls",
    "title": "NETDATASOURCE for Excel/data binding",
    "principle": "NETDATASOURCE provides data source for NETGRIDCONTROL, can read from Excel files",
    "rule": "object NETDATASOURCE('DataSourceName', filePath) binds external data to grid control",
    "syntax": "!source = object NETDATASOURCE('name', !filePath)\n!grid.bindToDataSource(!source)\n!rows = !grid.getrows()",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\n!fileName = |C:\\data\\source.xlsx|\n!dataSource = object NETDATASOURCE('Grid Table', !fileName)\n!dataTable.bindToDataSource(!dataSource)\n!data = !dataTable.getrows()",
    "exampleAntipattern": "NETDATASOURCE('name')  -- missing file path argument",
    "pitfalls": [
      "Requires GridControl add-in loaded",
      "File path must be valid and accessible"
    ],
    "relatedIds": [
      "netgridcontrol_core_presentation"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "cb_mac_23_createObjectsFromExcelSheet",
    "category": "dotnetinterop",
    "subcategory": "excel-import",
    "title": "!!createObjectsFromExcelSheet — глобальная функция импорта из Excel",
    "principle": "!!createObjectsFromExcelSheet — глобальная PML-функция для чтения данных из Excel-таблицы и возврата ARRAY строк.",
    "rule": "Используйте !!createObjectsFromExcelSheet когда необходимо загрузить данные из Excel-листа в PML-массив для дальнейшей обработки.",
    "syntax": "!!createObjectsFromExcelSheet(!fileName IS STRING, !sheetName IS STRING, !hasHeader IS BOOLEAN, !columns IS ARRAY, !strict IS BOOLEAN, !trim IS BOOLEAN, !skipEmpty IS BOOLEAN) → ARRAY",
    "exampleCanonical": "-- CB JDE_exData_import.pmlmac\n-- Чтение Excel-файла с указанными колонками\\n!fileName = |C:\\\\data\\\\tags.xlsx|\\n!columns = ARRAY()\\n!columns.Append(|Tag No|)\\n!columns.Append(|Description|)\\n!data = !!createObjectsFromExcelSheet(!fileName, |Tags|, true, !columns, false, true, true)\\nif (!data.size() gt 0) then\\n  -- обработка данных\\nendif",
    "exampleAntipattern": "-- НЕ: передача пустого имени файла\\n!data = !!createObjectsFromExcelSheet(||, |Sheet|, true, ARRAY(), false, false, false)\\n-- Это приведёт к ошибке",
    "pitfalls": [
      "Функция требует установленного .NET/Excel COM-связывания.",
      "Путь к файлу должен быть абсолютным.",
      "Если !columns не указан, используются все колонки листа.",
      "Функция возвращает ARRAY; каждый элемент — ARRAY строк (строка Excel)."
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "AVEVA PML Functions — Global functions",
    "sourcecodebase": "JDE_exData_import.pmlmac"
  },
  {
    "id": "pml_dotnet_netgridcontrol",
    "category": "dotnetinterop",
    "subcategory": "gridcontrol",
    "title": "NETGRIDCONTROL and NETDATASOURCE for Excel/CSV data import",
    "principle": "Use NETGRIDCONTROL with NETDATASOURCE to import spreadsheet data into PML macros. GridControl add-in must be imported before use.",
    "rule": "Always import 'GridControl' with error handling before creating NETGRIDCONTROL instances.",
    "syntax": "!grid = object NETGRIDCONTROL()\n!source = object NETDATASOURCE('Grid Table', !filePath)\n!grid.bindToDataSource(!source)\n!rows = !grid.getrows()\n!titles = !grid.gettitles()",
    "exampleCanonical": "-- CB EBE_assetRegister_import.pmlmac\n-- Import Excel data into PML\nimport 'GridControl'\nhandle any\nendhandle\nusing namespace |Aveva.Core.Presentation|\n!dataTable = object NETGRIDCONTROL()\n!dataSource = object NETDATASOURCE('Grid Table', !filePath)\n!dataTable.bindToDataSource(!dataSource)\n!data = !dataTable.getrows()\n!heading = !dataTable.gettitles()",
    "exampleAntipattern": "!dataTable = object NETGRIDCONTROL()  -- GridControl not imported",
    "pitfalls": [
      "GridControl add-in must be installed and accessible in the AVEVA environment",
      "NETDATASource constructor varies by add-in version",
      "Aveva.Core.Presentation namespace required for NETGRIDCONTROL"
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "NET Interfaces.md",
    "sourcecodebase": "EBE_assetRegister_import.pmlmac"
  },
  {
    "id": "forms_net_grid_bind_datasource",
    "category": "dotnetinterop",
    "subcategory": "netcontrols",
    "title": "Binding NETGRIDCONTROL to NETDATASOURCE for Excel data import",
    "principle": "PMLNETCONTROL gadgets host .NET grid controls that can bind to data sources via bindToDataSource().",
    "rule": "Create NETGRIDCONTROL object, assign to PMLNETCONTROL.control, use PMLFILEBROWSER for file selection, create NETDATASOURCE with file path, then bind and autoFitColumns.",
    "syntax": "!grid = object NETGRIDCONTROL()\n!container.control = !grid.handle()\n!browser = object PMLFILEBROWSER('OPEN')\n!browser.show('', '', 'Title', true, 'Filters', 1)\n!ds = object NETDATASOURCE('Name', !browser.file())\n!grid.bindToDataSource(!ds)\n!grid.autoFitColumns()",
    "exampleCanonical": "-- CB jackimform.pmlfrm\n!browser = object PMLFILEBROWSER('OPEN')\n!browser.show('', '', 'Load data from excel', true, 'Microsoft Excel files (*.xlsx)|*.xlsx|Microsoft Excel files (*.xls)|*.xls', 1)\n!dataSource = object NETDATASOURCE('Data for import', !browser.file())\n!this.grid.bindToDataSource(!dataSource)\n!this.grid.autoFitColumns()",
    "exampleAntipattern": "Trying to bind grid without PMLNETCONTROL container wrapper.",
    "pitfalls": [
      "PMLFILEBROWSER.show() requires specific parameter order for file filters",
      "NETDATASOURCE constructor requires name and file path",
      "autoFitColumns() must be called after bindToDataSource()",
      "GridControl must be imported with handle any/endhandle"
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "AVEVA PML Customization — NET Controls",
    "sourcecodebase": "jackimform.pmlfrm"
  },
  {
    "id": "netdatasource_collection_list_type",
    "category": "dotnetinterop",
    "subcategory": "NETDATASOURCE",
    "title": "NETDATASOURCE with 'Collection List' data type",
    "principle": "NETDATASOURCE supports multiple data type strings including 'Collection List' for generic collection-based data binding.",
    "rule": "Use 'Collection List' as the first argument to NETDATASOURCE when binding generic array-based data that is not a PDMS database query.",
    "syntax": "!nds = object NETDATASOURCE('Collection List', !headings, !rows)",
    "exampleCanonical": "-- CB ramCommonLoggerForm.pmlfrm\ndefine method .loadGrid()\n  !headings = !!ramCommonLogger.getValidHeadingArrayFormat()\n  !rows = !!ramCommonLogger.getValidLogArrayFormat()\n  !nds = object NETDATASOURCE('Collection List', !headings, !rows)\n  !this.gridLogList.bindToDataSource(!nds)\n  !this.gridLogList.autoFitColumns()\nendmethod",
    "exampleAntipattern": "-- WRONG: omit validated pattern for NETDATASOURCE with 'Collection List' data type\n-- Review source ramCommonLoggerForm.pmlfrm before reuse",
    "pitfalls": [
      "Using 'Collection List' with PDMS database queries will fail — use 'Piping', 'CABLE', etc. for DB queries.",
      "The !rows array must be an array of arrays (each inner array is a row)."
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "AVEVA E3D Design Customization Guide - PML .NET Objects",
    "sourcecodebase": "ramCommonLoggerForm.pmlfrm"
  },
  {
    "id": "netgridcontrol_fixedRows_method",
    "category": "dotnetinterop",
    "subcategory": "NETGRIDCONTROL",
    "title": "NETGRIDCONTROL.fixedRows() method",
    "principle": "The fixedRows() method pins the header rows so they remain visible during vertical scrolling.",
    "rule": "Call !grid.fixedRows(true) to keep column headers fixed at the top of the grid.",
    "syntax": "!grid.fixedRows(true)",
    "exampleCanonical": "-- CB ramCommonLoggerForm.pmlfrm\n!this.gridLogList.fixedRows(true)",
    "exampleAntipattern": "-- WRONG: omit validated pattern for NETGRIDCONTROL.fixedRows() method\n-- Review source ramCommonLoggerForm.pmlfrm before reuse",
    "pitfalls": [
      "fixedRows() should be set before bindToDataSource() for reliable behavior.",
      "This is distinct from fixedHeaders() — fixedRows pins data rows, fixedHeaders pins header rows."
    ],
    "relatedIds": [
      "dn_import_statement"
    ],
    "sourcedoc": "AVEVA E3D Design Customization Guide - PML .NET Objects",
    "sourcecodebase": "ramCommonLoggerForm.pmlfrm"
  },
  {
    "id": "netgridcontrol_rowAddDeleteGrid_method",
    "category": "dotnetinterop",
    "subcategory": "NETGRIDCONTROL",
    "title": "NETGRIDCONTROL.rowAddDeleteGrid() method",
    "principle": "The rowAddDeleteGrid() method enables inline row addition and deletion in the grid.",
    "rule": "Call !grid.rowAddDeleteGrid(true) to allow users to add/remove rows directly in the grid UI.",
    "syntax": "!grid.rowAddDeleteGrid(true)",
    "exampleCanonical": "-- CB ramCommonLoggerForm.pmlfrm\n!this.gridLogList.rowAddDeleteGrid(true)\n!this.gridLogList.editableGrid(false)",
    "exampleAntipattern": "-- WRONG: omit validated pattern for NETGRIDCONTROL.rowAddDeleteGrid() method\n-- Review source ramCommonLoggerForm.pmlfrm before reuse",
    "pitfalls": [
      "rowAddDeleteGrid(true) allows row insertion/deletion but does NOT make cell values editable — combine with editableGrid(false) to prevent cell editing while allowing row operations.",
      "This method is specific to NETGRIDCONTROL and not available on standard grid types."
    ],
    "relatedIds": [
      "netgridcontrol_fixedRows_method"
    ],
    "sourcedoc": "AVEVA E3D Design Customization Guide - PML .NET Objects",
    "sourcecodebase": "ramCommonLoggerForm.pmlfrm"
  }
];
