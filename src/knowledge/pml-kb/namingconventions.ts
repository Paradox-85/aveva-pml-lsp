import type { KBEntry } from '../schemas/kb-entry.js';

export const namingconventionsEntries: KBEntry[] = [
  {
    "id": "nc_variable_naming",
    "category": "namingconventions",
    "subcategory": "variables",
    "title": "Именование переменных: !local vs !!GLOBAL",
    "principle": "PML различает локальные (!prefix) и глобальные (!!prefix) переменные. Локальные существуют только в текущей области видимости (функция/метод/макрос). Глобальные живут до конца сессии PDMS и используются для межмодульного обмена данными. В codebase локальные в camelCase, глобальные — для системных объектов (!!ramCommonLogger, !!alert).",
    "rule": "Локальные: !camelCase (!index, !elementRefe, !tagRef, !isError). Глобальные: !!camelCase для объектов-синглтонов (!!ramCommonLogger, !!displayProgress). Временные счётчики: !i, !idx, !index. Булевы переменные: !is-префикс (!isError, !isClassIdentifiable, !isForceValid).",
    "syntax": "!localVariable = 'value'\n!!globalSingleton = object CLASSNAME()",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n!isClassIdentifiable    = !className.set() AND !className.neq('')\n!isForceValid           = !isDefaultClassSet AND (!isForceCreateAllowed OR !isForceReclassifyAllowed)\n!isReclassifyNeeded     = !className.eqNocase(!elementRefe.acttype).not()\n!isAddedForReclassify   = false\n!elementRefe            = !this.validateName(!excelTagName)\n\n-- глобальные объекты:\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n!!displayProgress(1, 100)",
    "exampleAntipattern": "-- NOT: смешивать ram/jac/JDE/EIS префиксы без правила\n-- Плохо: код теряет проектный контекст и становится трудно искать зависимости",
    "pitfalls": [
      "!!global переменные не очищаются между запусками макроса — могут содержать устаревшие данные",
      "!this доступен только внутри методов объекта, не в функциях или макросах",
      "Булев !is-префикс помогает читаемости: if(!isError.not()) then — явно виден смысл"
    ],
    "relatedIds": [
      "mac_global_variables",
      "obj_member_declaration",
      "dt_boolean_values"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §3.2 (Variables — ! prefix for local, !! for global); §3.5 (Scope rules)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "nc_object_naming",
    "category": "namingconventions",
    "subcategory": "objects",
    "title": "Именование объектов с префиксом проекта",
    "principle": "В multi-team окружении AVEVA каждая команда использует уникальный префикс для всех своих артефактов, чтобы избежать конфликтов имён при pml rehash. Префикс идентифицирует владельца кода.",
    "rule": "Имя объекта: camelCase с lowercase-префиксом проекта/команды. Определение (define object) — UPPERCASE (PML-конвенция). Примеры из codebase: ram* (Ramboll), jac* (Jackdaw project), mlp* (MLP проект).",
    "syntax": "define object RAMVALUECONVERTER\n-- файл: ramValueConverter.pmlobj (camelCase с префиксом ram)",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n-- ram-серия (Ramboll common utilities):\n--   ramCommonLogger, ramExcelReaderClass, ramFileWriterClass\n--   ramValueConverter, ramTagManagement\n--   ramImportExcelConfigLoader, ramImportExcelDataLoader, ramImportExcelElementLoader\n-- jac-серия (Jackdaw project-specific):\n--   jacEISDeliveryManager\n-- Без префикса (legacy):\n--   TagManagementTmp, LoopData, RAMTagMaturityData",
    "exampleAntipattern": "-- NOT: смешивать ram/jac/JDE/EIS префиксы без правила\n-- Плохо: код теряет проектный контекст и становится трудно искать зависимости",
    "pitfalls": [
      "define object всегда UPPERCASE — PML автоматически приводит к uppercase при загрузке",
      "Имя файла должно совпадать с именем объекта (в lowercase): ramValueConverter.pmlobj → RAMVALUECONVERTER",
      "Объекты без префикса (TagManagementTmp) рискуют конфликтовать с другими командами"
    ],
    "relatedIds": [
      "obj_definition_structure",
      "obj_namespace_loading",
      "nc_file_naming",
      "nc_prefix_conventions"
    ],
    "sourcedoc": "TM-1401 PML Macros Rev 2.0, §2.1 (Object naming, pml rehash — naming conflicts)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "nc_method_naming",
    "category": "namingconventions",
    "subcategory": "methods",
    "title": "Именование методов: verbNoun паттерн",
    "principle": "Методы объектов именуются в camelCase по паттерну verb+Noun, отражая действие и объект. Getter-методы начинаются с get/is, мутирующие — с set/add/load/clear/update/delete/write.",
    "rule": "Используйте: get* (чтение), set* (запись), add* (добавление), load* (загрузка данных), clear* (очистка), is* (булев запрос), validate* (проверка), create* (создание), write* (запись в файл).",
    "syntax": "define method .getProcessedValue(!value is STRING, !param is STRING) is STRING\ndefine method .setDataLoader(!loader is RAMIMPORTEXCELDATALOADER)\ndefine method .addErrorToList(!element is STRING, !detail is STRING, !error is STRING)\ndefine method .loadElement()\ndefine method .clearData()\ndefine method .isAllowed(!setting is STRING) is BOOLEAN\ndefine method .validateName(!name is STRING) is DBREF\ndefine method .createElement(!name is STRING, !type is STRING) is DBREF",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\ndefine method .setDataLoader(!dataLoader is RAMIMPORTEXCELDATALOADER)\ndefine method .loadElement()\ndefine method .validateName(!name is STRING) is DBREF\ndefine method .isAllowed(!setting is STRING) is BOOLEAN\ndefine method .getProcessedValue(!name is STRING, !parameter is STRING) is STRING\ndefine method .getValueSplit(!attributeValue is STRING, !split is ARRAY) is BOOLEAN\ndefine method .addErrorToList(!element is STRING, !detail is STRING, !errorDetail is STRING)\ndefine method .getReclassificationList() is ARRAY",
    "exampleAntipattern": "-- NOT: смешивать ram/jac/JDE/EIS префиксы без правила\n-- Плохо: код теряет проектный контекст и становится трудно искать зависимости",
    "pitfalls": [
      "Конструктор именуется как класс (camelCase): .ramImportExcelElementLoader()",
      "Методы, возвращающие значение, объявляются с `is TYPE`",
      "Перегрузки метода — одно имя, разные сигнатуры (addErrorToList с 3 и 4 аргументами)"
    ],
    "relatedIds": [
      "obj_method_declaration",
      "obj_overloading_delegation",
      "nc_object_naming"
    ],
    "sourcedoc": "TM-1401 PML Macros Rev 2.0, §2.3 (Method naming conventions)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "nc_file_naming",
    "category": "namingconventions",
    "subcategory": "files",
    "title": "Расширения файлов PML и их роли",
    "principle": "PML использует расширение файла для определения типа артефакта. Каждое расширение загружается отдельно через pml rehash и имеет свои правила структуры. Правильное расширение критично — файл с неверным расширением не будет найден pml rehash.",
    "rule": "`.pmlobj` — определение объекта (define object + members + methods). `.pmlfnc` — функция (define function, standalone). `.pmlmac` — макрос (скрипт, точка входа для pipeline). `.pmlfrm` — форма (setup form + widgets + callbacks). Имя файла = имя артефакта в lowercase.",
    "syntax": "-- Файловая структура проекта:\n-- objects/   ramValueConverter.pmlobj\n-- functions/ createObjectsFromExcelSheet.pmlfnc\n-- macros/    JDE_data-import.pmlmac\n-- forms/     ramImportExcelProcessor.pmlfrm",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n-- objects/ (12 файлов): ramValueConverter.pmlobj, ramCommonLogger.pmlobj, ...\n-- functions/ (18 файлов): createObjectsFromExcelSheet.pmlfnc, jacExportRDLDataReport.pmlfnc, ...\n-- macros/ (50+ файлов): JDE_data-import.pmlmac, JDE_tagProperties_export.pmlmac, ...\n-- forms/ (7 файлов): ramImportExcelProcessor.pmlfrm, rptoutput.pmlfrm, ...",
    "exampleAntipattern": "-- NOT: смешивать ram/jac/JDE/EIS префиксы без правила\n-- Плохо: код теряет проектный контекст и становится трудно искать зависимости",
    "pitfalls": [
      "pml rehash ищет файлы по расширению в указанных каталогах PMLLIB",
      "Имя файла pmlobj должно совпадать с define object NAME (в lowercase)",
      "Имя файла pmlfnc должно совпадать с define function !!NAME"
    ],
    "relatedIds": [
      "obj_definition_structure",
      "fnc_definition_syntax",
      "mac_file_structure",
      "frm_file_structure"
    ],
    "sourcedoc": "TM-1401 PML Macros Rev 2.0, §1.3 (File types and extensions); §2.1 (pml rehash and file discovery)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "nc_prefix_conventions",
    "category": "namingconventions",
    "subcategory": "project",
    "title": "Префиксные конвенции в codebase",
    "principle": "В production codebase используется система префиксов для идентификации принадлежности кода к проекту/серии. Это позволяет нескольким командам работать на одном PDMS-сервере без конфликтов имён.",
    "rule": "Объекты: ram* (Ramboll common), jac* (Jackdaw-specific). Макросы-pipeline: JDE_* (Jackdaw Data Engineering), EIS_* (EIS delivery), EBA_*/EBE_* (EBE project). Функции: jac* (Jackdaw project), ram* (Ramboll utility), mlp* (MLP). UDA-атрибуты PDMS: :RAM* (Ramboll), :pcs* (PCS).",
    "syntax": "-- Серии макросов:\n-- JDE_* — Jackdaw Data Engineering pipeline (import/export/update)\n-- EIS_* — EIS delivery reports\n-- EBA_* — EBA full tag export\n-- EBE_* — EBE asset register",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n-- JDE-серия (17 макросов): JDE_data-import, JDE_tagProperties_export,\n--   JDE_RDL-import, JDE_newtag_import, JDE_delta_tag_export,\n--   JDE_commPackage-reports, JDE_vendorPackage-reports,\n--   JDE_routine-macro-run, JDE_outputMacro, ...\n-- EIS-серия (2): EIS_data_export, EIS_data_update\n-- EBA/EBE-серия (3): EBA_full_tag_export, EBE_assetRegister_import,\n--   EBE_delta_tag_export\n-- UDA-атрибуты в PDMS (из codebase):\n--   :RAMTagOwner, :RambollTagStatus, :RAMEquipmentNumber\n--   :pcsEXCLASS, :PcsIPGRADE, :PcsRANGESI",
    "exampleAntipattern": "-- NOT: смешивать ram/jac/JDE/EIS префиксы без правила\n-- Плохо: код теряет проектный контекст и становится трудно искать зависимости",
    "pitfalls": [
      "При добавлении нового проекта выберите уникальный 3-4 буквенный префикс",
      "Префикс UDA (:RAM*, :pcs*) регистрируется в RDL/Schema — не произвольный",
      "Legacy-файлы без префикса (TagManagementTmp, LoopData) — унаследованные, не образец для подражания"
    ],
    "relatedIds": [
      "nc_object_naming",
      "nc_file_naming",
      "mac_pipeline_pattern"
    ],
    "sourcedoc": "Codebase-derived; official PDF section not identified — конвенция codebase, не описана в PDF",
    "sourcecodebase": "ramValueConverter.pmlobj"
  }
];
