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
  }
];
