import type { KBEntry } from '../schemas/kb-entry.js';

export const architecturepatternsEntries: KBEntry[] = [
  {
    "id": "ap_loader_chain",
    "category": "architecturepatterns",
    "subcategory": "data_pipeline",
    "title": "Трёхуровневый паттерн: ConfigLoader → DataLoader → ElementLoader",
    "principle": "Сложные операции импорта данных декомпозируются в цепочку объектов, каждый отвечает за свой уровень абстракции: ConfigLoader — загрузка конфигурации (настройки, маппинги), DataLoader — загрузка и трансформация данных (Excel→структуры), ElementLoader — запись в PDMS (создание/обновление элементов). Цепочка соединяется через setter-injection: каждый следующий уровень получает предыдущий через setXxx().",
    "rule": "Разделяйте импорт на три уровня: (1) ConfigLoader читает настройки, (2) DataLoader читает данные и маппит их, (3) ElementLoader создаёт/обновляет элементы PDMS. Каждый уровень — отдельный объект с чёткой ответственностью. Соединение — через setter-injection.",
    "syntax": "-- Инициализация цепочки:\n!config = object RAMIMPORTEXCELCONFIGLOADER()\n!data   = object RAMIMPORTEXCELDATALOADER()\n!loader = object RAMIMPORTEXCELELEMENTLOADER()\n\n-- Связывание:\n!data.setConfigDetail(!config)\n!loader.setDataLoader(!data)\n\n-- Выполнение:\n!loader.loadElement()",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\n-- Члены формы:\nmember .meConfigDetails     is RAMIMPORTEXCELCONFIGLOADER\nmember .meExcelDataProcessor is RAMIMPORTEXCELDATALOADER\nmember .meExcelElementLoader is RAMIMPORTEXCELELEMENTLOADER\n\n-- Связывание в методе .setDataLoader():\ndefine method .setDataLoader()\n  !this.meExcelDataProcessor.setConfigDetail(!this.meConfigDetails)\n  !this.meExcelElementLoader.setDataLoader(!this.meExcelDataProcessor)\nendmethod\n\n-- Последовательность вызовов в .importData():\ndefine method .importData()\n  !this.setConfigDetail()    -- 1. загрузить конфигурацию\n  !this.setDataLoader()      -- 2. связать цепочку\n  !this.initiateLoader()     -- 3. запустить загрузку элементов\nendmethod",
    "exampleAntipattern": "-- NOT: смешивать UI, чтение Excel, PDMS write и logging в одном методе\n-- Плохо: pipeline невозможно тестировать и безопасно прерывать",
    "pitfalls": [
      "Порядок инициализации критичен: Config → Data → Element (Data зависит от Config)",
      "Каждый уровень должен иметь метод clear/reset для повторного использования",
      "ElementLoader зависит от DataLoader.getMasterList() — если данные не загружены, loadElement не сработает"
    ],
    "relatedIds": [
      "ap_form_controller",
      "ap_separation_of_concerns",
      "frm_loader_chain",
      "obj_delegation_pattern"
    ],
    "sourcedoc": "Codebase-derived; official PDF section not identified — архитектурный паттерн codebase",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "ap_form_controller",
    "category": "architecturepatterns",
    "subcategory": "mvc",
    "title": "Форма как Controller: координация без бизнес-логики",
    "principle": "В PML-архитектуре форма выступает как Controller (в терминах MVC): она владеет UI-виджетами и объектами-членами (Model), координирует их взаимодействие, но не содержит бизнес-логику. Логика обработки данных инкапсулирована в объектах (ConfigLoader, DataLoader, ElementLoader). Форма только связывает их и управляет потоком.",
    "rule": "Форма: инициализирует объекты-члены в конструкторе, связывает их через setters, вызывает методы объектов по callback'ам кнопок. Бизнес-логика — в объектах, не в форме. Форма отвечает за: показ прогресса, обновление UI, обработку пользовательских действий.",
    "syntax": "setup form !!formName\n  member .controller is SOMEOBJECT\nexit\n\ndefine method .initialise()\n  !this.controller = object SOMEOBJECT()\nendmethod\n\ndefine method .onButtonClick()\n  !this.controller.doWork()\n  !this.updateUI()\nendmethod",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\nsetup form !!ramImportExcelProcessor dialog size 80 30\n  member .meConfigDetails      is RAMIMPORTEXCELCONFIGLOADER\n  member .meExcelDataProcessor is RAMIMPORTEXCELDATALOADER\n  member .meExcelElementLoader is RAMIMPORTEXCELELEMENTLOADER\n\n  button .buImport 'Import' callback '!this.importData()'\nexit\n\ndefine method .ramImportExcelProcessor()\n  !this.meConfigDetails      = object RAMIMPORTEXCELCONFIGLOADER()\n  !this.meExcelDataProcessor = object RAMIMPORTEXCELDATALOADER()\n  !this.meExcelElementLoader = object RAMIMPORTEXCELELEMENTLOADER()\nendmethod\n\ndefine method .importData()\n  !this.setConfigDetail()\n  !this.setDataLoader()\n  !this.initiateLoader()\nendmethod",
    "exampleAntipattern": "-- NOT: смешивать UI, чтение Excel, PDMS write и logging в одном методе\n-- Плохо: pipeline невозможно тестировать и безопасно прерывать",
    "pitfalls": [
      "Форма не должна напрямую работать с PDMS — это задача ElementLoader",
      "Callback формы вызывает метод формы, который делегирует объекту",
      "Члены формы инициализируются в конструкторе формы, не в initialise()"
    ],
    "relatedIds": [
      "ap_loader_chain",
      "ap_separation_of_concerns",
      "frm_form_as_class",
      "frm_callback_syntax"
    ],
    "sourcedoc": "TM-1402 PML Form Design Rev 1.0, §1.4 (Form as class); §2.15 (Form members)",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "ap_separation_of_concerns",
    "category": "architecturepatterns",
    "subcategory": "design",
    "title": "Разделение ответственности: объект = одна задача",
    "principle": "Каждый объект PML должен отвечать за одну задачу. ramExcelReaderClass — только чтение Excel. ramValueConverter — только конвертация типов. ramCommonLogger — только логирование. ramFileWriterClass — только запись файлов. Это позволяет переиспользовать объекты в разных контекстах без связанности.",
    "rule": "Один объект = одна ответственность. Если объект делает две несвязанные вещи — разделите на два. Утилитарные объекты (конвертер, логгер, writer) не должны зависеть от бизнес-контекста. Бизнес-объекты (ElementLoader, TagManagement) не должны содержать утилитарную логику.",
    "syntax": "-- Утилитарные объекты (контекстно-независимые):\n-- ramValueConverter — конвертация типов\n-- ramCommonLogger — логирование\n-- ramExcelReaderClass — чтение Excel\n-- ramFileWriterClass — запись файлов\n\n-- Бизнес-объекты (контекстно-зависимые):\n-- ramImportExcelElementLoader — импорт элементов в PDMS\n-- ramTagManagement — создание/поиск тегов\n-- jacEISDeliveryManager — EIS-доставка",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\nmember .errorData is ARRAY   -- только хранение ошибок конвертации\n-- методы: .convertValue(), .convertDBTypeToType(), .parseDate()\n-- НЕ содержит: логику импорта, работу с PDMS, UI\n\n-- CB: ramExcelReaderClass.pmlobj — чистый ридер\nmember .excelTables is ARRAY   -- результат чтения\n-- методы: .loadExcelData(), .error()\n-- НЕ содержит: маппинг данных, создание элементов\n\n-- CB: ramImportExcelElementLoader.pmlobj — бизнес-объект\nmember .tagManagement is RAMTAGMANAGEMENT     -- делегирует создание\nmember .valueConverter is RAMVALUECONVERTER   -- делегирует конвертацию\n-- НЕ содержит: чтение Excel, UI",
    "exampleAntipattern": "-- NOT: смешивать UI, чтение Excel, PDMS write и logging в одном методе\n-- Плохо: pipeline невозможно тестировать и безопасно прерывать",
    "pitfalls": [
      "TagManagementTmp — пример объекта-антипаттерна: 20+ методов разной ответственности в одном объекте (legacy)",
      "Если метод объекта вызывает $P или !!alert — это смешение Model и View",
      "Логгер передаётся через !!global, не через member — осознанный выбор для упрощения API"
    ],
    "relatedIds": [
      "ap_form_controller",
      "ap_loader_chain",
      "obj_delegation_pattern",
      "ap_data_object"
    ],
    "sourcedoc": "Codebase-derived; official PDF section not identified — архитектурный принцип, не описан в PDF",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "ap_pipeline_macro",
    "category": "architecturepatterns",
    "subcategory": "orchestration",
    "title": "Макрос как orchestrator: pipeline шагов",
    "principle": "Production-макрос не содержит бизнес-логику — он оркестрирует: устанавливает контекст (TAGS, CE), создаёт логгер, последовательно вызывает шаги (объекты/функции), обрабатывает ошибки (ONERROR), сохраняет результат (SAVEWORK), экспортирует лог. Каждый шаг маркируется через $P для отслеживания прогресса.",
    "rule": "Pipeline-макрос: (1) TAGS — установка контекста; (2) ONERROR GOLABEL — глобальный обработчик; (3) создание !!ramCommonLogger с заголовками; (4) последовательность $P STEP N + вызов функции/метода; (5) в LABEL /Error: SAVEWORK + UNCLAIM ALL + экспорт лога; (6) FINISH.",
    "syntax": "TAGS\nONERROR GOLABEL /Error\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n$P --- STEP 1: ... ---\n-- вызов шага\n$P --- STEP 2: ... ---\n-- вызов шага\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\nendhandle\nFINISH",
    "exampleCanonical": "-- CB JDE_routine-macro-run.pmlmac\nTAGS\nONERROR GOLABEL /Error\n\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n!headings = |Tag Name;Attribute Name;Error Text|\n!!ramCommonLogger.addHeading(!headings.split(|;|))\n\n$P --- START ROUTINE PROCESSING ---\n$P --- STEP 1: DELETE UNTAGGED ITEMS  ---\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.deleteUnnamedTags()\n\n$P --- STEP 3: UPDATE CLASS NAME ---\n!!jacUpdateClassDetails(!rdlMasterFile, |Class-mapping|, ...)\n\n$P --- STEP 5: UPDATE TAG NAME ---\n!!jacUpdateTagName(|NAMN|, |:TagName|, ...)\n-- ... ещё шаги ...\n\n$P --- STEP 10: FINISH TASKS  ---\n!!ramCommonLogger.writeErrorDataToExcel(|...log.xlsx|, false)\n\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  !!ramCommonLogger.writeErrorDataToExcel(|...log.xlsx|, false)\nendhandle\nFINISH",
    "exampleAntipattern": "-- NOT: смешивать UI, чтение Excel, PDMS write и logging в одном методе\n-- Плохо: pipeline невозможно тестировать и безопасно прерывать",
    "pitfalls": [
      "ONERROR GOLABEL — PDMS-механизм (не PML handle), срабатывает на необработанные ошибки",
      "LABEL /Error + FINISH — обязательны в конце pipeline для корректного завершения",
      "Нумерация $P STEP может не совпадать (STEP 3 после STEP 1) — это нормально, шаги отключаются комментированием"
    ],
    "relatedIds": [
      "mac_pipeline_pattern",
      "pdms_transaction",
      "log_common_logger_api",
      "eh_handle_any"
    ],
    "sourcedoc": "TM-1401 PML Macros Rev 2.0, §1.2 (Macro structure); TM-1401 PML Basic Rev 3.0, §8 (ONERROR, GOLABEL, LABEL)",
    "sourcecodebase": "JDE_routine-macro-run.pmlmac"
  },
  {
    "id": "ap_data_object",
    "category": "architecturepatterns",
    "subcategory": "design",
    "title": "Data-object: объект только с данными",
    "principle": "Для передачи структурированных данных между модулями используются data-objects — объекты, содержащие только members (данные) и минимальный конструктор/геттеры, без бизнес-логики. Это PML-аналог структуры (struct) или DTO.",
    "rule": "Data-object содержит: (1) members с типами (REAL, STRING, ARRAY, DBREF); (2) конструктор, инициализирующий дефолтные значения; (3) опционально геттеры/сеттеры. Не содержит: бизнес-логику, обращения к PDMS, .NET calls, $P вывод.",
    "syntax": "define object DATANAME\n  member .field1 is REAL\n  member .field2 is STRING\n  member .items  is ARRAY\nendobject\n\ndefine method .dataName()\n  !this.field1 = 0\n  !this.field2 = ''\n  !this.items  = object ARRAY()\nendmethod",
    "exampleCanonical": "-- CB RAMTagMaturityData.pmlobj\ndefine object RAMTAGMATURITYDATA\n  member .draftCount    is REAL\n  member .activeCount   is REAL\n  member .afcCount      is REAL\n  member .asbCount      is REAL\n  member .voidCount     is REAL\nendobject\n\ndefine method .RAMTagMaturityData()\n  !this.draftCount    = 0\n  !this.activeCount   = 0\n  !this.afcCount      = 0\n  !this.asbCount      = 0\n  !this.voidCount     = 0\nendmethod\n\ndefine method .GetTotal() is REAL\n  return !this.draftCount + !this.activeCount + !this.afcCount + !this.asbCount + !this.voidCount\nendmethod\n\n-- CB: LoopData.pmlobj — data-object с import dlls для расширения\ndefine object LOOPDATA\n  member .tags         is ARRAY\n  member .errorList    is ARRAY\n  member .logPathName  is STRING\nendobject",
    "exampleAntipattern": "-- NOT: смешивать UI, чтение Excel, PDMS write и logging в одном методе\n-- Плохо: pipeline невозможно тестировать и безопасно прерывать",
    "pitfalls": [
      "Data-object не должен обращаться к PDMS — он хранит данные, не управляет ими",
      "Конструктор обязателен: инициализирует REAL=0, STRING='', ARRAY=object ARRAY()",
      "GetTotal() — допустимый метод в data-object (вычисление по собственным данным)"
    ],
    "relatedIds": [
      "obj_member_declaration",
      "obj_constructor_pattern",
      "ap_separation_of_concerns",
      "ap_loader_chain"
    ],
    "sourcedoc": "TM-1401 PML Macros Rev 2.0, §2.2 (Object members, constructors)",
    "sourcecodebase": "RAMTagMaturityData.pmlobj"
  },
  {
    "id": "ap_utility_function",
    "category": "architecturepatterns",
    "subcategory": "design",
    "title": "Функция vs метод объекта: критерий выбора",
    "principle": "PML предлагает два механизма для переиспользуемой логики: функция (.pmlfnc) — standalone, без состояния, вызывается через !!functionName(); метод объекта — привязан к состоянию объекта (members), вызывается через !obj.method(). Выбор определяется: нужно ли хранить состояние между вызовами?",
    "rule": "Используйте функцию (.pmlfnc), когда: операция stateless (вход→выход), не нужно хранить промежуточные данные, вызывается из разных контекстов. Используйте метод объекта, когда: нужно состояние между вызовами, операция является частью бизнес-процесса объекта, результат зависит от members.",
    "syntax": "-- Функция (stateless utility):\ndefine function !!functionName(!arg1 is TYPE1, !arg2 is TYPE2) is RETURN_TYPE\n  !functionName = !result\nendfunction\n\n-- Метод объекта (stateful):\ndefine method .methodName(!arg is TYPE) is RETURN_TYPE\n  !result = !this.memberData + !arg\n  return !result\nendmethod",
    "exampleCanonical": "-- CB ramGetBackRef.pmlfnc\ndefine function !!ramGetBackRef(!element is DBREF, !backAttribute is STRING) is DBREF\n  !backRefElement = object DBREF()\n  var !backRefElement BACKREF(attname $!backAttribute) of $!element\n  handle any\n  endhandle\n  return !backRefElement\nendfunction\n\n-- CB: jacPropagateParentData.pmlfnc — standalone функция\ndefine function !!jacPropagateParentData(!parentAttribute is STRING, ...)\n  -- не хранит состояние, не зависит от объекта\n  -- получает всё через аргументы, возвращает результат\nendfunction\n\n-- CB: ramValueConverter.pmlobj, .convertValue() — метод объекта (stateful)\n-- использует !this.errorData (member) для накопления ошибок\n-- состояние между вызовами: .addErrorData() записывает в member",
    "exampleAntipattern": "-- NOT: смешивать UI, чтение Excel, PDMS write и logging в одном методе\n-- Плохо: pipeline невозможно тестировать и безопасно прерывать",
    "pitfalls": [
      "Функция с префиксом !! — глобально доступна после pml rehash",
      "Функция не может хранить состояние — нет members, нет !this",
      "Если функция становится слишком сложной (>50 строк, >5 аргументов) — вероятно нужен объект"
    ],
    "relatedIds": [
      "fnc_definition_syntax",
      "obj_method_declaration",
      "fnc_return_value",
      "ap_separation_of_concerns"
    ],
    "sourcedoc": "TM-1401 PML Macros Rev 2.0, §1.4 (Functions vs methods — scope and purpose)",
    "sourcecodebase": "ramGetBackRef.pmlfnc"
  },
  {
    "id": "p2_displayprogress",
    "category": "architecturepatterns",
    "subcategory": "progress",
    "title": "!!displayProgress + !!FMSYS progress/interrupt pattern",
    "principle": "Long-running export/import loops should report progress and give users a chance to interrupt.",
    "rule": "Call `!!displayProgress(current,total)` or FMSYS progress methods inside loops, check `!!FMSYS.interrupt` where supported, and reset progress after completion.",
    "syntax": "do !lineStr values !lines\n  !rowIdx = !lines.findFirst(!lineStr)\n  !!displayProgress(!rowIdx, !lines.size())\n  if !!FMSYS.interrupt then BREAK endif\nenddo\n!!FMSYS.setProgress(0)",
    "exampleCanonical": "-- CB JDE_pipeData_export.pmlmac\ndo !lineStr values !lines\n  !rowIdx = !lines.findFirst(!lineStr)\n  !!displayProgress(!rowIdx, !lines.size())\nenddo",
    "exampleAntipattern": "-- NOT: run thousands of export rows without progress or interrupt checks\n-- Плохо: user cannot distinguish slow processing from a frozen PDMS session",
    "pitfalls": [
      "Reset progress to 0 after completion",
      "Check interrupt in long loops",
      "findFirst can be O(n²) and duplicate-ambiguous",
      "!!displayProgress is a helper/global command, not necessarily an FMSYS method"
    ],
    "relatedIds": [
      "cf_do_enddo_loop",
      "arr_iteration",
      "mac_pipeline_pattern"
    ],
    "sourcedoc": "TM-1401 FMSYS/progress docs; Perplexity PML KB §7.3",
    "sourcecodebase": "JDE_pipeData_export.pmlmac"
  },
  {
    "id": "custom-file-writer-dependency-ramfilewriterclass",
    "category": "architecturepatterns",
    "subcategory": "custom-objects",
    "title": "RAMFILEWRITERCLASS export methods used by common logger objects",
    "principle": "Custom writer object dependencies should document method names and argument order because they are external API contracts.",
    "rule": "Custom writer object dependencies should document method names and argument order because they are external API contracts.",
    "syntax": "!this.fileWriter.writeDataToExcelFile(!pathName, !isDisplayFile, !heading, !finalLog)",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n-- Pattern: RAMFILEWRITERCLASS export methods used by common logger objects",
    "exampleAntipattern": "-- WRONG: omit validated pattern for RAMFILEWRITERCLASS export methods used by common logger objects\n-- Review source ramCommonLogger.pmlobj before reuse",
    "pitfalls": [
      "Validate RAMFILEWRITERCLASS export methods used by common logger objects against ramCommonLogger.pmlobj before reuse."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "engineering-tags-rdl-export-wrapper",
    "category": "architecturepatterns",
    "subcategory": "engineering-tags-export",
    "title": "RDL-driven Engineering Tags export wrapper",
    "principle": "Engineering tag export macros may delegate domain-specific extraction to custom global routines that accept output path, RDL filter, tag filter, empty patterns, replacement rules, and display flags.",
    "rule": "Document the wrapper signature and preserve filter/list arguments when generating benchmark macros; do not replace the wrapper with generic COLLECTION/XLS logic unless the wrapper is unavailable by task scope.",
    "syntax": "!!jacExportRDLDataReport(!filePath, !rdlFilter, !tagFilter, !emptyPatternList, !replaceData, !isDisplayEmpty)",
    "exampleCanonical": "-- CB EIS_data_export.pmlmac\n!rdlFilter = |(:RDLSource eq 'SOURCE_A' or :RDLSource eq 'SOURCE_B')|\n!tagFilter = ':TagStatus inset (|ACTIVE|, |ASB|, |AFC|, |AFD|) and ISNAMED'\n!isDisplayEmpty = true\n!!jacExportRDLDataReport(!filePath, !rdlFilter, !tagFilter, !emptyPatternList, !replaceData, !isDisplayEmpty)",
    "exampleAntipattern": "-- WRONG: omit validated pattern for RDL-driven Engineering Tags export wrapper\n-- Review source EIS_data_export.pmlmac before reuse",
    "pitfalls": [
      "Dropping emptyPatternList or replaceData changes exported data semantics",
      "Replacing custom RDL wrappers with generic COLLECTION queries loses RDL template behavior"
    ],
    "relatedIds": [
      "ap_pipeline_macro"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "EIS_data_export.pmlmac"
  },
  {
    "id": "patterns-reader-caching",
    "category": "architecturepatterns",
    "subcategory": "lazy-initialization",
    "title": "Object reader caching with lazy initialization",
    "principle": "Validated PML pattern for Object reader caching with lazy initialization.",
    "rule": "Validated PML pattern for Object reader caching with lazy initialization.",
    "syntax": "if (!this.reader eq | |) THEN\\n  !this.reader = object RamAEPMLExcelReader()\\nendif",
    "exampleCanonical": "-- CB ramExcelReaderClass.pmlobj\n-- Pattern: Object reader caching with lazy initialization",
    "exampleAntipattern": "-- WRONG: omit validated pattern for Object reader caching with lazy initialization\n-- Review source ramExcelReaderClass.pmlobj before reuse",
    "pitfalls": [
      "Validate Object reader caching with lazy initialization against ramExcelReaderClass.pmlobj before reuse."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "ramExcelReaderClass.pmlobj"
  },
  {
    "id": "d6-user-defined-object-method",
    "category": "architecturepatterns",
    "subcategory": "user-defined-types",
    "title": "Custom methods on user-defined object types",
    "principle": "User-defined objects (e.g., TAGMANAGEMENTTMP) may have project-specific methods not covered by system KB. Method signatures must be verified from source.",
    "rule": "When calling methods on user-defined objects, ensure the method exists in the object definition. Document custom methods in KB.",
    "syntax": "!var = object <UserDefinedType>()\n!var.<customMethod>()",
    "exampleCanonical": "-- CB cable-area-update.pmlmac\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.defineAreasForCables()",
    "exampleAntipattern": "!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.nonExistentMethod()  -- method not defined on type",
    "pitfalls": [
      "User-defined object methods are not discoverable through system KB; they must be verified against the `.pmlobj` source.",
      "Method names on user-defined types are case-insensitive in PML but should follow project conventions."
    ],
    "relatedIds": [],
    "sourcedoc": "Methods on User-Defined Object Types KB",
    "sourcecodebase": "cable-area-update.pmlmac"
  }
];
