import type { KBEntry } from '../schemas/kb-entry.js';

export const macrosEntries: KBEntry[] = [
  {
    "id": "mac_file_structure",
    "category": "macros",
    "subcategory": "structure",
    "title": "Структура файла .pmlmac",
    "principle": "Макрос — это последовательность команд PDMS (и PML2), выполняемых построчно как при вводе в командное окно; в production он служит точкой входа pipeline: объявляет переменные/заголовки, защищает .NET-импорт, выполняет шаги и сохраняет результат.",
    "rule": "Структура production-макроса: комментарий с путём запуска → import + handle → объявление переменных и заголовков → (опц.) ONERROR GOLABEL → шаги обработки → сохранение/вывод; запускается через $m/путь или drag&drop.",
    "syntax": "-- Run path: $m \"...\\macro.pmlmac\"\nimport 'GridControl'\nhandle ANY\nendhandle\n... логика ...",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\nimport 'GridControl'\nhandle ANY\nendhandle\nimport 'RamPMLExcelReader'\nhandle any\nendhandle\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()",
    "exampleAntipattern": "-- NOT: хранить состояние pipeline в локальной переменной между макросами\n-- Плохо: после нового macro call локальное состояние потеряно",
    "pitfalls": [
      "Макрос выполняется построчно как команды — PML2 тоже работает",
      "Рекомендуется писать новые рутины как функции, а не макросы (TM-1401 §2.9)",
      "PML1 макросы лежат под PDMSUI, PML2 файлы — под PMLLIB"
    ],
    "relatedIds": [
      "mac_arguments",
      "mac_pipeline_pattern",
      "eh_import_protection",
      "obj_namespace_loading"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.1 (A Simple Macro); §2.1.1; §2.9",
    "sourcecodebase": "JDE_data-import.pmlmac"
  },
  {
    "id": "mac_arguments",
    "category": "macros",
    "subcategory": "arguments",
    "title": "Аргументы макроса $1..$9 и значения по умолчанию $d",
    "principle": "Параметризованный макрос получает до 9 аргументов через пробел ($1..$9), что делает его гибким; если при drag&drop аргументы не переданы, без значений по умолчанию ($d1=...) макрос упадёт — поэтому defaults задают в начале.",
    "rule": "Использовать $1..$9 в теле; задавать умолчания в начале $d1=..., $d2=...; одиночную строку с пробелами как один аргумент передавать в $< ... $>.",
    "syntax": "$d1=HandWheel\n$d2=500\nNEW EQUIP /$1\nXLEN $2 YLEN $3 ZLEN $4",
    "exampleCanonical": "-- CB JDE_tagProperties_export.pmlmac\n-- CB/PDF: JDE_*.mac используют именованные переменные вместо $1..$9; синтаксис $1/$d — из TM-1401\n$d1=HandWheel\n$d2=500\nNEW EQUIPMENT /$1\nNEW SUBE /$1-Centre",
    "exampleAntipattern": "$M/path.mac    $* без аргументов и без $d-умолчаний параметры UNSET → ошибка",
    "pitfalls": [
      "До 9 аргументов через пробел",
      "Строка с пробелами как один аргумент — $<...$>",
      "Production-макросы codebase чаще хардкодят пути/переменные, чем используют $1..$9"
    ],
    "relatedIds": [
      "mac_file_structure",
      "mac_calling_other_macros",
      "dt_string_substitution"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.4 (Parameterised Macros — $1..$9, $d=, $< $>)",
    "sourcecodebase": "JDE_tagProperties_export.pmlmac"
  },
  {
    "id": "mac_calling_other_macros",
    "category": "macros",
    "subcategory": "composition",
    "title": "Вызов макроса из макроса ($M) и вызов функций",
    "principle": "Макрос может вызывать другой макрос через $M/путь, передавая аргументы; в современном codebase оркестрация чаще делается вызовом глобальных функций (!!func(...)) из управляющего макроса — функции предзагружены через PMLLIB и принимают типизированные аргументы.",
    "rule": "Вызов макроса: $M/полный_путь арг1 арг2; вызов функции из макроса: !result = !!functionName(args); управляющий «routine»-макрос последовательно вызывает шаги-функции и логирует.",
    "syntax": "$M/%PDMSUI%\\examples\\parameterMac.mac ABCDE 300 400 600\n!issueData = !!createObjectsFromExcelSheet(!fileName, !sheetName, ...)",
    "exampleCanonical": "-- CB JDE_routine-macro-run.pmlmac\n$P --- STEP 3: UPDATE CLASS NAME AS PER SHELL RDL MAPPING  ---\n!!jacUpdateClassDetails(!rdlMasterFile, |Class-mapping|, |NA|, |...filter...|, |...|, true)\n$P --- STEP 5: UPDATE TAG NAME ---\n!!jacUpdateTagName(|NAMN|, |:TagName|, !replaceArray, |...filter...|, true)",
    "exampleAntipattern": "-- NOT: хранить состояние pipeline в локальной переменной между макросами\n-- Плохо: после нового macro call локальное состояние потеряно",
    "pitfalls": [
      "$M требует путь к файлу; функция вызывается по имени без пути (PMLLIB)",
      "Routine-макрос — оркестратор: шаги-функции + логирование + ONERROR GOLABEL"
    ],
    "relatedIds": [
      "mac_pipeline_pattern",
      "ap_pipeline_macro",
      "fnc_definition_syntax",
      "mac_output_control"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.1 ($m/FILENAME); §3.4; §4.1 (functions preloaded through PMLLIB)",
    "sourcecodebase": "JDE_routine-macro-run.pmlmac"
  },
  {
    "id": "mac_output_control",
    "category": "macros",
    "subcategory": "output",
    "title": "Управление выводом: $p (печать) и $* (комментарий/подавление)",
    "principle": "Директива $p выводит строку в командное окно (полезно как трассировка шагов pipeline), а $* начинает комментарий до конца строки; в сочетании с $!подстановкой $p даёт информативные сообщения о ходе работы.",
    "rule": "Печать/эхо в командное окно: $P текст $!переменная; комментарий в конце строки: $*; строка-комментарий: -- в начале; блок-комментарий: $( ... $).",
    "syntax": "$P --- STEP 1: DELETE UNTAGGED ITEMS  ---\n!!answer = 42   $* комментарий в конце строки",
    "exampleCanonical": "-- CB JDE_routine-macro-run.pmlmac\n$P --- START ROUTINE PROCESSING ---\n$P --- STEP 1: DELETE UNTAGGED ITEMS  ---\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.deleteUnnamedTags()",
    "exampleAntipattern": "-- NOT: хранить состояние pipeline в локальной переменной между макросами\n-- Плохо: после нового macro call локальное состояние потеряно",
    "pitfalls": [
      "Три вида комментариев: -- (строка), $* (конец строки), $( $) (блок)",
      "$p печатает в командное окно — для прогресса используют !!displayProgress/!!fmsys.SETPROGRESS"
    ],
    "relatedIds": [
      "mac_file_structure",
      "log_output_targets",
      "dt_string_substitution"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.9 ($* end-of-line comment, -- line comment, $( $) block comment); §2.5 ($p)",
    "sourcecodebase": "JDE_routine-macro-run.pmlmac"
  },
  {
    "id": "mac_file_path_pattern",
    "category": "macros",
    "subcategory": "filesystem",
    "title": "Имя файла с датой/временем через DATETIME + $!<...>",
    "principle": "Экспортные макросы формируют уникальное имя выходного файла, встраивая компоненты текущей даты/времени; их получают из объекта DATETIME и форматируют (string('I2') для двух цифр), а затем подставляют в путь через $!<выражение>, чтобы метод-точка раскрылась корректно.",
    "rule": "Создать !dt = object DATETIME(); извлечь .year()/.month()/.date()/.hour()/.minute(); форматировать целые через .string('I2'); собрать путь со вставками $!<year> и т.д.; затем сохранить через .saveGridToExcel или FILE.writeFile.",
    "syntax": "!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')\n!path = |...extract_$!<year>-$!<month>-$!<date>-$!<hour>.xlsx|",
    "exampleCanonical": "-- CB JDE_tagProperties_export.pmlmac\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')\n!date = !dt.date().string('I2')\n!hour = !dt.hour().string('I2')\n!minute = !dt.minute().string('I2')\n!publishPath = |C:\\...\\TagPropertyValue_extract_$!<year>-$!<month>-$!<date>-$!<hour>.xlsx|",
    "exampleAntipattern": "!path = |report_$!dt.year().xlsx|   $* метод-точка не раскроется без $!<dt.year()>",
    "pitfalls": [
      "Метод-точка в подстановке требует $!<...>",
      "Двузначный формат — .string('I2')",
      "Обратные слэши в путях Windows безопасны внутри | |"
    ],
    "relatedIds": [
      "dt_string_substitution",
      "dn_file_write_pattern",
      "mac_pipeline_pattern"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.3 ($ expansion); §6.1 (DATETIME among built-in objects)",
    "sourcecodebase": "JDE_tagProperties_export.pmlmac"
  },
  {
    "id": "mac_pipeline_pattern",
    "category": "macros",
    "subcategory": "pipeline",
    "title": "Макрос как ETL-pipeline (серия JDE/EIS/EBE)",
    "principle": "Серии JDE/EIS/EBE — это однонаправленные ETL-конвейеры: каждый макрос выполняет одну фазу (import данных / export свойств / RDL-mapping / создание view) и обычно следует схеме «собрать → обработать в цикле → сохранить/применить», логируя ход через общий логгер.",
    "rule": "Один макрос = одна фаза pipeline; внутри: настроить логгер/заголовки → собрать данные (COLL ... / COLLECTION) → цикл обработки с прогрессом → запись результата (Excel/файл) или применение к БД; управляющий routine-макрос вызывает фазы по порядку.",
    "syntax": "var !tags COLL ALL (ENGITEM) WITH (...)\ndo !tagString values !tags\n  ... сбор строки ...\n  !dataList.append(!tagDataRow)\nenddo\n!dataTable.saveGridToExcel(|$!publishPath|, |data|)",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\nvar !tags COLL ALL (ENGITEM) WITH (:TagStatus eq |ACTIVE| and ISNAMED and NOT(EMPTY(:RAMTAGOWNER)) and :RAMTAGOWNER eq |LEIR|)\ndo !tagString values !tags\n  !idx = !idx + 1\n  !tagRef = !tagString.dbref()\n  !!displayProgress(!tagIdx, !tags.size())\n  ...\nenddo\n!source = object NETDATASOURCE('data', !headerList, !dataList)\n!dataTable.BindToDataSource(!source)\n!dataTable.saveGridToExcel(|$!publishPath|, |data|)",
    "exampleAntipattern": "-- один макрос, который и импортирует, и экспортирует, и мапит RDL — нарушает разделение фаз",
    "pitfalls": [
      "Одна фаза на макрос — не смешивать import/export",
      "Прогресс на внешнем цикле через !!displayProgress",
      "Логирование старта/итогов через !!ramCommonLogger"
    ],
    "relatedIds": [
      "ap_pipeline_macro",
      "mac_calling_other_macros",
      "mac_file_path_pattern",
      "log_common_logger_api"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §5 (Collections) — основа сбора; паттерн pipeline из codebase",
    "sourcecodebase": "JDE_data-import.pmlmac"
  },
  {
    "id": "mac_global_variables",
    "category": "macros",
    "subcategory": "state",
    "title": "Передача данных между макросами через !!global",
    "principle": "Глобальные переменные (!!var) живут всю сессию PDMS и видны из любой PML-рутины, поэтому служат каналом передачи общего состояния между фазами pipeline; типичный пример — единый логгер !!ramCommonLogger, создаваемый один раз и наполняемый всеми шагами.",
    "rule": "Создавать общий глобал лениво через undefined()-guard; наполнять из разных макросов/функций; помнить, что глобал не очищается между запусками — при необходимости пересоздавать (object ...()) в начале управляющего макроса.",
    "syntax": "if(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif",
    "exampleCanonical": "-- CB JDE_routine-macro-run.pmlmac\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n!headings = |Tag Name;Attribute Name;Error Text|\n!!ramCommonLogger.addHeading(!headings.split(|;|))",
    "exampleAntipattern": "-- использование !!ramCommonLogger в новой сессии без проверки undefined() и без пересоздания → старые/отсутствующие данные",
    "pitfalls": [
      "!!global не очищается между запусками — возможна утечка состояния",
      "Пересоздавайте логгер в начале routine-макроса или используйте undefined()-guard",
      "Стандартные глобалы (!!CE, !!ERROR, !!ALERT) не удалять"
    ],
    "relatedIds": [
      "cf_guard_clause",
      "log_common_logger_api"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.3.1 (Local vs Global variables, !!global); §2.3.4 (special global objects)",
    "sourcecodebase": "JDE_routine-macro-run.pmlmac"
  },
  {
    id: 'd7_savework_unclaim',
    category: 'macros',
    subcategory: 'cleanup',
    title: 'SAVEWORK and UNCLAIM ALL macro cleanup commands',
    principle: 'End Excel-driven element modification macros with SAVEWORK to commit changes and UNCLAIM ALL to release database claims.',
    rule: 'Place SAVEWORK followed by UNCLAIM ALL at the end of macros that modify elements to ensure all changes are committed and no database locks remain.',
    syntax: `SAVEWORK
UNCLAIM ALL`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!reportGrid.saveGridToExcel(!feedbackFile, |data|)

SAVEWORK
UNCLAIM ALL`,
    exampleAntipattern: `-- Missing SAVEWORK
!reportGrid.saveGridToExcel(!feedbackFile, |data|)
-- macro ends without SAVEWORK — changes may not persist`,
    pitfalls: [
      'SAVEWORK must follow the last element-modifying operation',
      'UNCLAIM ALL releases all claimed elements — do not use if you need to keep claims',
      'Both should be at the very end of the macro'
    ],
    relatedIds: ['pdms_transaction', 'mac_pipeline_pattern'],
    sourcedoc: 'AVEVA PML Command Reference',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    "id": "cb_macro_dual_source_pipe_attribute_export",
    "category": "macros",
    "subcategory": "macro-export",
    "title": "Dual-source AE3D and AE pipe attribute export",
    "principle": "Pipe attribute exports may need to merge AE3D and AE sources with fallback selection.",
    "rule": "Pipe attribute exports may need to merge AE3D and AE sources with fallback selection.",
    "syntax": "-- Run path: $m \"C:\Users\ADZV\OneDrive - Ramboll\AVEVA_SERVER\Addons\PMLLIB\RAM\Engineering\jackdow\JDE_pipeData_export.pmlmac\"\n-- PML export pipe data from AE3D",
    "exampleCanonical": "-- CB JDE_pipeData_export.pmlmac\n-- Run path: $m \"C:\Users\ADZV\OneDrive - Ramboll\AVEVA_SERVER\Addons\PMLLIB\RAM\Engineering\jackdow\JDE_pipeData_export.pmlmac\"\n-- PML export pipe data from AE3D\n--Author: Andrei Aitzhanov\n-- Company Ramboll Energies\n-- Date: 21-11-2023\nimport 'GridControl'\nhandle ANY\nendhandle\nusing namespace |Aveva.Core.Presentation|\n!dataList = ARRAY()\n!headerList = ARRAY()",
    "exampleAntipattern": "-- WRONG: use Dual-source AE3D and AE pipe attribute export without validating the source context in JDE_pipeData_export.pmlmac",
    "pitfalls": [
          "Validate against JDE_pipeData_export.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
      "mac_file_structure"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_pipeData_export.pmlmac"
  },
  {
    "id": "lazy-global-initialization-pattern",
    "category": "macros",
    "subcategory": "global-variables",
    "title": "Lazy Global Variable Initialization Pattern",
    "principle": "Check undefined() before assigning a global object to avoid overwriting existing state.",
    "rule": "Use if(undefined(!!globalVar)) then to safely initialize globals only once.",
    "syntax": "if(undefined(!!globalVar)) then\n  !!globalVar = object TARGETCLASS()\nendif",
    "exampleCanonical": "-- CB ramImportExcelConfigLoader.pmlobj\nif(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif",
    "exampleAntipattern": "// ❌ Always reinitializes\n!!ramCommonLogger = object RAMCOMMONLOGGER()  -- Destroys previous state",
    "pitfalls": [
      "undefined() returns true for UNSET values, not just for undefined variables",
      "Ensure global is not cleared between method calls",
      "Consider thread-safety in multi-threaded contexts"
    ],
    "relatedIds": [],
    "sourcedoc": "ramImportExcelConfigLoader.pmlobj",
    "sourcecodebase": "ramImportExcelConfigLoader.pmlobj"
  },
  {
    "id": "err_macro_no_error_handling",
    "category": "macros",
    "subcategory": "macro",
    "title": "Macro error handling pattern — HANDLE/ENDHANDLE around object operations",
    "principle": "Wrap object instantiation and method calls in HANDLE/ENDHANDLE blocks to prevent silent failures.",
    "rule": "After object() construction and before calling methods on custom objects, use: handle any ... endhandle to catch and report errors.",
    "syntax": "handle any\n  -- error recovery or logging\nendhandle",
    "exampleCanonical": "-- CB manual-valve-description.pmlmac\nPML RELOAD OBJECT TAGMANAGEMENTTMP\nhandle any\n  !tagMgmt = object TAGMANAGEMENTTMP()\n  handle any\n    !tagMgmt.manualValveDescriptionUpdate(':RAMTAGOWNER INSET(|RAM|, |AKSO|)')\n  endhandle\nendhandle",
    "exampleAntipattern": "!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.manualValveDescriptionUpdate(':RAMTAGOWNER INSET(|RAM|, |AKSO|)')  -- no error handling",
    "pitfalls": [
      "Nested HANDLE/ENDHANDLE blocks can mask errors from inner blocks if the outer handler catches 'any'.",
      "Using HANDLE ANY on object() may hide library-load issues; consider checking the result before method calls."
    ],
    "relatedIds": [
      "cmd_pml_reload_object"
    ],
    "sourcedoc": "AVEVA E3D PML Customization Guide — Error Handling",
    "sourcecodebase": "manual-valve-description.pmlmac"
  },
  {
    "id": "kb-pml-reload-object-directive",
    "category": "macros",
    "subcategory": "object_lifecycle",
    "title": "PML RELOAD OBJECT Directive",
    "principle": "PML RELOAD OBJECT reloads a PML object definition from its source, ensuring the latest version is available for instantiation.",
    "rule": "Use PML RELOAD OBJECT before creating instances of custom or addon objects that may have been updated.",
    "syntax": "PML RELOAD OBJECT <objectName>",
    "exampleCanonical": "-- CB class-name-refresh.pmlmac\nPML RELOAD OBJECT TAGMANAGEMENTTMP",
    "exampleAntipattern": "-- WRONG: omit validated pattern for PML RELOAD OBJECT Directive\n-- Review source class-name-refresh.pmlmac before reuse",
    "pitfalls": [
      "RELOAD OBJECT only affects objects loaded via PML; objects defined in .pmlobj files may need different reload mechanisms.",
      "Repeated reloads without cleanup may cause memory leaks for some object types."
    ],
    "relatedIds": [
      "kb-tagmanagementtmp-object"
    ],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "class-name-refresh.pmlmac"
  },
  {
    "id": "mac_20:unknown:178",
    "category": "macros",
    "subcategory": "data_driven",
    "title": "Data-driven macro template pattern with multi-type dispatch",
    "principle": "Data-driven macro templates can dispatch behavior by element or attribute type instead of hard-coding one path.",
    "rule": "Data-driven macro templates can dispatch behavior by element or attribute type instead of hard-coding one path.",
    "syntax": "!fileName = 'C:\Users\ADZV\OneDrive - Ramboll\AVEVA_SERVER\Addons\PMLLIB\RAM\Engineering\jackdow\templates\JDE_dbViewExtract.xlsx'\n!dataSource = object NETDATASOURCE('Grid Table', !fileName)",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n!fileName = 'C:\Users\ADZV\OneDrive - Ramboll\AVEVA_SERVER\Addons\PMLLIB\RAM\Engineering\jackdow\templates\JDE_dbViewExtract.xlsx'\n!dataSource = object NETDATASOURCE('Grid Table', !fileName)\n!dataTable.bindToDataSource(!dataSource)\n!data = !dataTable.getrows()\ndo !row values !data\n	!dbViewName = !row[1]\n	!parameterType = !row[2]\n	!name = !row[3]\n	!value = !row[4]\n	!dataType = !row[5]\n	--step 1: create dbView\n	!dbView = !dbViewName.dbref()\n	handle any\n		!dbViewDesc = !dbViewName.after(|/|)",
    "exampleAntipattern": "-- WRONG: use Data-driven macro template pattern with multi-type dispatch without validating the source context in JDE_dbView_creator.pmlmac",
    "pitfalls": [
          "Validate against JDE_dbView_creator.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "mac_25:unknown:207",
    "category": "macros",
    "subcategory": "pseudo-variables",
    "title": "Extracting tag/element properties via !!ce dot notation",
    "principle": "!!CE dot notation accesses current-element properties directly in command/report macros.",
    "rule": "!!CE dot notation accesses current-element properties directly in command/report macros.",
    "syntax": "!tag = !!ce\n!tagName = !tag.name",
    "exampleCanonical": "-- CB JDE_getTagInfo.pmlmac\n!tag = !!ce\n!tagName = !tag.name\n!tagDescription = !tag.desc\n!tagActtype = !tag.acttype",
    "exampleAntipattern": "-- WRONG: use Extracting tag/element properties via !!ce dot notation without validating the source context in JDE_getTagInfo.pmlmac",
    "pitfalls": [
          "Validate against JDE_getTagInfo.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_getTagInfo.pmlmac"
  },
  {
    "id": "mac_27:unknown:211",
    "category": "macros",
    "subcategory": "alpha-file-output-tabulate",
    "title": "ALPHA FILE / OUTPUT TABULATE / CHANGES SINCE / ALPHA FILE END report chain",
    "principle": "ALPHA FILE reporting chains combine OUTPUT/TABULATE/CHANGES SINCE before closing the alpha output file.",
    "rule": "ALPHA FILE reporting chains combine OUTPUT/TABULATE/CHANGES SINCE before closing the alpha output file.",
    "syntax": "var !enggrps collect all (ENGGRP) with (mcount gt 0) for /TMS_ENG\ndo !enggrp values !enggrps",
    "exampleCanonical": "-- CB JDE_outputMacro.pmlmac\nvar !enggrps collect all (ENGGRP) with (mcount gt 0) for /TMS_ENG\ndo !enggrp values !enggrps\n	!engrpRef = !enggrp.dbref()\n	ALPHA FILE \"C:\Temp\output_$!<engrpRef.seq>.txt\" OVERWRITE\n	OUTPUT TABULATE 2 $!enggrp CHANGES SINCE 00:00 01 March 2024\n	ALPHA FILE END\nenddo",
    "exampleAntipattern": "-- WRONG: use ALPHA FILE / OUTPUT TABULATE / CHANGES SINCE / ALPHA FILE END report chain without validating the source context in JDE_outputMacro.pmlmac",
    "pitfalls": [
          "Validate against JDE_outputMacro.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
          "macro_setdate_stamp",
          "pdms_setcompdate"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_outputMacro.pmlmac"
  },
  {
    "id": "mac_dollar_m_metadata",
    "category": "macros",
    "subcategory": "macro_metadata",
    "title": "Dollar-m ($m) metadata comment in PML macros",
    "principle": "Macros often include a --$m or $* $m comment line with the original file path for traceability. This is a convention, not a PML command execution.",
    "rule": "When embedding $m in a macro header, use $* $m \"path\" format in benchmarks. The original may use --$m \"path\" as a full-line comment.",
    "syntax": "$* $m \"original_file_path.pmlmac\"",
    "exampleCanonical": "-- CB equipment-name-refresh.pmlmac\n--$m \"C:\\path\\to\\original\\macro.pmlmac\"\nPML RELOAD OBJECT MYOBJECT\n!obj = object MYOBJECT()",
    "exampleAntipattern": "Do not execute $m as a command when it is intended as metadata.",
    "pitfalls": [
      "$m is both a command (run macro) and a metadata marker in comments. Context determines intent.",
      "In benchmarks, convert --$m to $* $m for inline-safe comment format."
    ],
    "relatedIds": [
      "mac_file_path_pattern"
    ],
    "sourcedoc": "AVEVA PML Customization Guide — Dollar Special Symbols",
    "sourcecodebase": "equipment-name-refresh.pmlmac"
  },
  {
    "id": "macro-ce-property-extract",
    "category": "macros",
    "subcategory": "pseudo-variables",
    "title": "Extracting tag/element properties via !!ce dot notation",
    "principle": "Macros that need tag metadata should use !!ce as the current-element reference and access attributes via dot notation (.name, .desc, .acttype).",
    "rule": "Always assign !!ce to a local !var first to avoid repeated pseudo-variable lookups. Use !local naming for all extracted properties.",
    "syntax": "!ref = !!ce\n!prop = !ref.attr",
    "exampleCanonical": "-- CB JDE_getTagInfo.pmlmac\n!tag = !!ce\n!tagName = !tag.name\n!tagDescription = !tag.desc\n!tagActtype = !tag.acttype",
    "exampleAntipattern": "!!ce.name -- accessing !!ce directly multiple times without caching",
    "pitfalls": [
      "If the current element is not a tag type, .desc or .acttype may return empty or error.",
      "Consider adding BADREF checks if the macro may run on non-tag elements."
    ],
    "relatedIds": [],
    "sourcedoc": "PML1 Syntax.md, best-practices.md",
    "sourcecodebase": "JDE_getTagInfo.pmlmac"
  },
  {
    "id": "macro_data_driven_template_pattern",
    "category": "macros",
    "subcategory": "data_driven",
    "title": "Data-driven macro template pattern with multi-type dispatch",
    "principle": "Macros can drive behavior from Excel data by reading rows and dispatching on parameter type codes",
    "rule": "Read Excel via NETGRIDCONTROL/NETDATASOURCE → iterate rows → check parameterType field → execute corresponding command block",
    "syntax": "!data = !dataTable.getrows()\ndo !row values !data\n  !param = !row[2]\n  if (!param eq |TYPE1|) then\n    -- type 1 processing\n  elseif (!param eq |TYPE2|) then\n    -- type 2 processing\n  endif\nenddo",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\ndo !row values !data\n  !parameterType = !row[2]\n  if (!parameterType eq |1_ELEL| and !dbView.set()) then\n    $!<dbViewName> ELEL ADD $!<value>\n  endif\n  if (!parameterType eq |2_EXPFIL| and !dbView.set()) then\n    NEW EXPFILTER\n    EXPRESSION |$!<value>|\n    EXPTYPE 'PML'\n  endif\nenddo",
    "exampleAntipattern": "for !row in !data  -- not valid PML, use DO/ENDDO",
    "pitfalls": [
      "Each conditional uses !dbView.set() to ensure context is set",
      "Parameter type codes are strings requiring | delimiters",
      "Multiple independent if blocks (not elseif) allow multiple actions per row"
    ],
    "relatedIds": [
      "handle_tuple_error_codes"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "macro_metadata_comment_dollar_m",
    "category": "macros",
    "subcategory": "metadata",
    "title": "--$m macro metadata comment — source path tracking",
    "principle": "The --$m comment on line 1 of a macro file records the full source path of the macro, typically for development tracking and debugging.",
    "rule": "Place --$m with the full quoted path as the first line of any macro file. This is a comment, not an executable directive.",
    "syntax": "--$m \"C:\\path\\to\\macro.pmlmac\"",
    "exampleCanonical": "-- CB JDE_fullDataProperties-export.pmlmac\n--$m \"C:\\Users\\ADZV\\OneDrive - Ramboll\\AVEVA_SERVER\\Addons\\PMLLIB\\RAM\\Engineering\\jackdow\\_publish\\macro\\JDE_fullDataProperties-export.pmlmac\"",
    "exampleAntipattern": "$M \"C:\\path\\to\\macro.pmlmac\"",
    "pitfalls": [
      "Do not confuse --$m (comment) with $M (macro execution command).",
      "The $M command executes a macro file; --$m is purely a metadata comment."
    ],
    "relatedIds": [
      "datetime_object_methods",
      "variable_interpolation_dollar"
    ],
    "sourcedoc": "AVEVA PML Syntax — Dollar special symbols",
    "sourcecodebase": "JDE_fullDataProperties-export.pmlmac"
  },
  {
    "id": "d3-macro-file-header",
    "category": "macros",
    "subcategory": "header-conventions",
    "title": "PML macro file header comment patterns",
    "principle": "Macros use comment headers to record source path and metadata. PML1 uses `--$m` with path; PML2 recommends `$*` comments.",
    "rule": "Prefer `$*` for inline-safe comments. Use `--$m \"path\"` in legacy macros for path tracking.",
    "syntax": "$* comment text\n--$m \"original file path\"",
    "exampleCanonical": "-- CB alarm_refresh.pmlmac\n$* Factory benchmark generated from semantic source summary only for mac_01\n$* Source path: docs/codebase/macros/alarm_refresh.pmlmac\n\nPML RELOAD OBJECT TAGMANAGEMENTTMP",
    "exampleAntipattern": "--$m \"C:\\Users\\ADZV\\OneDrive - Ramboll\\AVEVA_SERVER\\Addons\\PMLLIB\\RAM\\Engineering\\jackdow\\run-macro\\alarm_refresh.pmlmac\"",
    "pitfalls": [
      "`--$m` is a PML1 legacy pattern; `$*` is preferred in new code.",
      "Path comments in `--$m` format may contain OneDrive/cloud-sync paths that break in production environments.",
      "Do not copy absolute OneDrive paths into shared benchmarks."
    ],
    "relatedIds": [
      "d1-pml-reload-object-command"
    ],
    "sourcedoc": "AVEVA PML Language Reference",
    "sourcecodebase": "alarm_refresh.pmlmac"
  },
  {
    "id": "fn_path_exists_check",
    "category": "macros",
    "subcategory": "filesystem",
    "title": "Проверка существования директории перед экспортом",
    "principle": "Перед записью файла в каталог необходимо проверить его существование и создать при необходимости.",
    "rule": "Использовать FILE.exists() или SYSCOM для проверки/создания директории перед экспортом.",
    "syntax": "!dirObj = object FILE('$!exportFolder')\nif !dirObj.exists().not() then\n  SYSCOM |mkdir \"$!exportFolder\"|\nendif",
    "exampleCanonical": "-- CB EBE_full_tag_export.pmlmac\n-- NOT FOUND IN SOURCES — pattern missing from current codebase",
    "exampleAntipattern": "-- CB EBE_full_tag_export.pmlmac:\n-- !publishPath = 'C:\\Users\\...\\_AUEDB_export\\'\n-- $* БЕЗ проверки: если папка удалена, экспорт упадёт",
    "pitfalls": [
      "Путь с пробелами требует двойных кавычек в SYSCOM",
      "mkdir не создаёт вложенные папки — нужен recursive mkdir"
    ],
    "relatedIds": [
      "eh_export_error_handling",
      "dn_file_write_pattern",
      "p2_syscom"
    ],
    "sourcedoc": "EBE_full_tag_export.pmlmac",
    "sourcecodebase": "EBE_full_tag_export.pmlmac"
  },
  {
    "id": "import_module_handle_any_pattern",
    "category": "macros",
    "subcategory": "module_loading",
    "title": "import Module with handle any/endhandle Pattern",
    "principle": "The import statement loads external PML modules/add-ins. Combined with handle any/endhandle, it provides error-tolerant module loading.",
    "rule": "Use import \\",
    "syntax": "import '<ModuleName>'\nhandle any\nendhandle",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\nimport 'GridControl'\nhandle any\nendhandle\n\nimport 'RamPMLExcelReader'\nhandle any\nendhandle",
    "exampleAntipattern": "-- No error handling — missing module crashes macro\nimport 'GridControl'\n-- Macro crashes if GridControl is not available",
    "pitfalls": [
      "handle any absorbs all errors from the import, so the module may fail silently",
      "Verify module availability before using its classes/methods",
      "handle any/endhandle can be replaced with specific error handling if needed"
    ],
    "relatedIds": [
      "mac_file_structure"
    ],
    "sourcedoc": "AVEVA PML Customization Guide — Module Loading",
    "sourcecodebase": "JDE_data-import.pmlmac"
  },
  {
    "id": "mac_dollar_m_metadata_comment",
    "category": "macros",
    "subcategory": "metadata_comments",
    "title": "$m metadata comment convention in PML macro headers",
    "principle": "Macros may include a --$m or $* $m comment line with the original file path for traceability. This is a human convention, not a PML command execution. The $m in this context is distinct from the PML $M command (which loads and runs a macro file).",
    "rule": "When embedding $m in a macro header, use -- $m \"path\" format in original macros. In benchmarks, convert to $* $m \"path\" for inline-safe comment format.",
    "syntax": "-- $m \"original_file_path.pmlmac\"\n-- or\n$* $m \"original_file_path.pmlmac\"",
    "exampleCanonical": "-- CB JDE_3D_items_extractor.pmlmac\n-- $m \"C:\\path\\to\\original\\macro.pmlmac\"\n!data = object array()\nvar !sites collect all SITE\ndo !siteName values !sites\n  !siteRef = !siteName.dbref()\nenddo",
    "exampleAntipattern": "-- WRONG: omit validated pattern for $m metadata comment convention in PML macro headers\n-- Review source JDE_3D_items_extractor.pmlmac before reuse",
    "pitfalls": [
      "$m (lowercase) in comments is a metadata marker convention; $M (uppercase) is a PML command that loads and runs a macro file.",
      "Do not execute $m as a command when it is intended as metadata in a comment line."
    ],
    "relatedIds": [
      "mac_file_path_pattern"
    ],
    "sourcedoc": "AVEVA PML Customization Guide — Dollar Special Symbols",
    "sourcecodebase": "JDE_3D_items_extractor.pmlmac"
  },
  {
    "id": "mac_loopdata_object_usage",
    "category": "macros",
    "subcategory": "custom-object",
    "title": "Custom LOOPDATA object usage pattern",
    "principle": "Custom user-defined objects (e.g. LOOPDATA) are reloaded via PML RELOAD OBJECT, instantiated with object(), and used via method chaining. Path assignment and SaveLog are typical property/method patterns.",
    "rule": "Use PML RELOAD OBJECT <Name> before instantiating a custom object. Wrap method calls in handle/any blocks for error resilience.",
    "syntax": "handle any\n  PML RELOAD OBJECT <ObjectName>\nendhandle\n!obj = object <ObjectName>()\nhandle any\n  !obj.Method()\nendhandle\n!obj.property = |value|\nhandle any\n  !obj.SaveLog(|filename.xlsx|, false)\nendhandle",
    "exampleCanonical": "-- CB loop-create.pmlmac\n$* loop-create.pmlmac\nhandle any\n  PML RELOAD OBJECT LOOPDATA\nendhandle\n!loop = object LOOPDATA()\nhandle any\n  !loop.GetData()\nendhandle\nhandle any\n  !loop.LoopCreate()\nendhandle\n!loop.pathName = |C:\\Temp\\loop-create-log|\nhandle any\n  !loop.SaveLog(|loop-create-log.xlsx|, false)\nendhandle\nexit",
    "exampleAntipattern": "!loop = object LOOPDATA()\n!loop.GetData()\n!loop.LoopCreate()\n!loop.pathName = |C:\\Temp\\test|\n!loop.SaveLog(|test.xlsx|, false)",
    "pitfalls": [
      "LOOPDATA is a RAM-specific custom object; not a built-in PML type",
      "PML RELOAD OBJECT is required before object() instantiation for custom types",
      "SaveLog second argument (false) controls overwrite behavior — must match caller intent"
    ],
    "relatedIds": [
      "mac_file_structure"
    ],
    "sourcedoc": "docs/codebase/macros/loop-create.pmlmac",
    "sourcecodebase": "loop-create.pmlmac"
  },
  {
    "id": "mac_minimal_pattern",
    "category": "macros",
    "subcategory": "minimal",
    "title": "Минимальный макрос: reload + instantiate + call без boilerplate",
    "principle": "Не все макросы требуют import/handle/переменных; минимальный паттерн — комментарий-путь → PML RELOAD OBJECT → object NAME() → метод — валиден и встречается в production.",
    "rule": "Минимальный макрос: (опц.) --$m комментарий → PML RELOAD OBJECT <имя> → !var = object <имя>() → !var.метод() ; error-handling и import-guard отсутствуют намеренно.",
    "syntax": "--$m \"path/to/macro.pmlmac\"\nPML RELOAD OBJECT OBJECTNAME\n!obj = object OBJECTNAME()\n!obj.someMethod()",
    "exampleCanonical": "-- CB pipeSupport-refresh.pmlmac\n--$m \"C:\\Users\\ADZV\\OneDrive - Ramboll\\AVEVA_SERVER\\Addons\\PMLLIB\\RAM\\Engineering\\jackdow\\run-macro\\pipeSupport-refresh.pmlmac\"\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.pipeSupportDataUpdate()",
    "exampleAntipattern": "-- WRONG: omit validated pattern for Минимальный макрос: reload + instantiate + call без boilerplate\n-- Review source pipeSupport-refresh.pmlmac before reuse",
    "pitfalls": [
      "Отсутствие error handling означает, что ошибки propagate вверх по стеку вызовов",
      "TAGMANAGEMENTTMP должен быть загружен (pml rehash + pml reload) до вызова",
      "Минимальный макрос не защищает от отсутствующих зависимостей"
    ],
    "relatedIds": [
      "mac_file_structure",
      "obj_namespace_loading",
      "obj_constructor_pattern"
    ],
    "sourcedoc": "pipeSupport-refresh.pmlmac",
    "sourcecodebase": "pipeSupport-refresh.pmlmac"
  },
  {
    "id": "macro_finish_keyword",
    "category": "macros",
    "subcategory": "termination",
    "title": "FINISH keyword in PML macros",
    "principle": "FINISH terminates macro execution cleanly. It should be placed at the end of the macro, after any error handler LABEL.",
    "rule": "Place FINISH as the last statement in the macro, after the error handler LABEL block. FINISH ensures clean exit and resource release.",
    "syntax": "LABEL /Error\nhandle any\n  -- error cleanup\nendhandle\nFINISH",
    "exampleCanonical": "-- CB JDE_commPackage-reports.pmlmac\n-- CB mac_18_benchmark.pmlmac\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  !!ramCommonLogger.writeErrorDataToExcel(...)\nendhandle\nFINISH",
    "exampleAntipattern": "-- ❌ Code after FINISH (never executes)\nFINISH\n-- This line is unreachable",
    "pitfalls": [
      "FINISH after LABEL means the label block is only reachable via ONERROR GOLABEL, not via normal flow.",
      "If FINISH is placed before the error handler, the error handler is dead code."
    ],
    "relatedIds": [
      "macro_onerror_golabel_error_trap"
    ],
    "sourcedoc": "AVEVA PML Customization — Macros",
    "sourcecodebase": "JDE_commPackage-reports.pmlmac"
  },
  {
    "id": "macro_reload_object_command",
    "category": "macros",
    "subcategory": "object_management",
    "title": "PML RELOAD OBJECT Command",
    "principle": "PML RELOAD OBJECT forces re-loading of an object definition before instantiation in a macro.",
    "rule": "Use PML RELOAD OBJECT <ObjectName> at the top of a macro before creating instances of that object, especially when the object definition may have changed since the last session.",
    "syntax": "PML RELOAD OBJECT <ObjectName>",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\n-- Reload object before use\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()",
    "exampleAntipattern": "-- Creating object without reload when definition may have changed\n!tagMgmt = object TAGMANAGEMENTTMP()  -- May use stale definition",
    "pitfalls": [
      "PML RELOAD OBJECT is a command-style statement, not an object method",
      "The object must be defined in the current session or available via import",
      "Use only when necessary; unnecessary reloads can cause performance issues"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "JDE_data-import.pmlmac"
  },
  {
    "id": "macro_savework_keyword",
    "category": "macros",
    "subcategory": "save_operations",
    "title": "SAVEWORK Keyword in PML Macros",
    "principle": "SAVEWORK commits pending database modifications made during macro execution.",
    "rule": "Place SAVEWORK at the end of a macro that modifies database attributes or creates/deletes elements to ensure changes are persisted.",
    "syntax": "--SAVEWORK",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\n-- Modify some attributes\n:Description = |Updated by macro|\n--SAVEWORK",
    "exampleAntipattern": "-- Missing SAVEWORK — changes may be lost\n:Description = |Updated by macro|\n-- End of macro",
    "pitfalls": [
      "SAVEWORK may be written as --SAVEWORK (commented out) for safety during testing",
      "SAVEWORK only commits changes made via DBREF attribute assignment",
      "SAVEWORK does not commit changes from external add-ins"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "JDE_data-import.pmlmac"
  },
  {
    "id": "pml_macro_finish_directive",
    "category": "macros",
    "subcategory": "execution",
    "title": "FINISH directive to terminate macro execution",
    "principle": "FINISH is a macro directive that immediately terminates execution of the current macro. It is the equivalent of exit in a form context.",
    "rule": "Use FINISH at the end of macros that have completed their work or encountered a fatal error.",
    "syntax": "-- cleanup operations\n!file.Close()\nFINISH",
    "exampleCanonical": "-- CB EBE_assetRegister_import.pmlmac\n!IssueFile.Close()\nFINISH",
    "exampleAntipattern": "!IssueFile.Close()  -- macro continues executing after this",
    "pitfalls": [
      "FINISH terminates the entire macro, not just the current block",
      "Do not use FINISH in form methods — use RETURN or exit instead",
      "FINISH is macro-specific, not available in all PML contexts"
    ],
    "relatedIds": [],
    "sourcedoc": "macros.md",
    "sourcecodebase": "EBE_assetRegister_import.pmlmac"
  },
  {
    "id": "forms_conditional_comment_syntax",
    "category": "macros",
    "subcategory": "comments",
    "title": "PML conditional comment syntax $( ... $) for disabling code blocks",
    "principle": "PML uses $( ... $) as block comment delimiters that can disable entire code sections including dialog calls.",
    "rule": "Code between $( and $) is treated as a comment block. Commonly used to disable alert.confirm dialogs in production code.",
    "syntax": "$( code to disable $)",
    "exampleCanonical": "-- CB jackimform.pmlfrm\n$(\n  if (!!alert.confirm('Do you want to upload new tags?') eq 'YES') then\n    -- upload code\n  endif\n$)",
    "exampleAntipattern": "Using -- comments for multi-line blocks:\n-- if (!!alert.confirm(...)) then\n--   -- code\n-- endif",
    "pitfalls": [
      "$( and $) must be on their own logical lines or at block start/end",
      "Nested $( $) within block comments may not work correctly",
      "IDEs may not highlight conditional comments the same as -- comments"
    ],
    "relatedIds": [
      "forms_layout_gadget_method_access"
    ],
    "sourcedoc": "AVEVA PML Customization — Comments",
    "sourcecodebase": "jackimform.pmlfrm"
  }
];
