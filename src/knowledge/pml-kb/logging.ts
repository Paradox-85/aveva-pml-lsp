import type { KBEntry } from '../schemas/kb-entry.js';

export const loggingEntries: KBEntry[] = [
  {
    "id": "log_severity_levels",
    "category": "logging",
    "subcategory": "severity",
    "title": "Уровни severity в логировании",
    "principle": "Система логирования codebase использует числовой severity: значение передаётся первым элементом лог-массива или отдельным аргументом метода addLogDetails(). В codebase реально встречаются значения 0 (информация/debug в ramValueConverter), 1 (предупреждения в ramImportExcelElementLoader), 2 (ошибки — значение по умолчанию в ramCommonLogger). Формальная шкала 1=INFO/2=WARNING/3=ERROR не документирована в PDF — это конвенция codebase.",
    "rule": "Передавайте severity как REAL-параметр в addLogDetails(): 0 — debug/info, 1 — warning, 2 — error (default). Default severity=2 в ramCommonLogger означает, что без явного указания всё логируется как ошибка.",
    "syntax": "-- severity как параметр:\n!!ramCommonLogger.addLogDetails(!source, !errorList, !severityLevel)\n-- severity по умолчанию (=2):\n!!ramCommonLogger.addLogDetails(!source, !errorList)",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\ndefine method .addLogDetails(!objectName is STRING, !data is ARRAY)\n  !this.addLogDetails(!objectName, !data, 2)\nendmethod\n\n-- CB: ramImportExcelElementLoader.pmlobj — severity 1 (warning) vs 2 (error)\n!this.addErrorToList(!elementRefe.name, 'Type', 'ER15 - Excel Type mismatch', 1)\n-- vs\n!this.addErrorToList(!element.name, !attribute, 'ER6 - Not able to convert', 2)\n\n-- CB: ramValueConverter.pmlobj — severity 0 (debug/info)\n!this.addErrorData(!sourceType, !dataList, 0)",
    "exampleAntipattern": "-- NOT: логировать только текст ошибки без severity/tool/context\n-- Плохо: невозможно отфильтровать и воспроизвести проблему",
    "pitfalls": [
      "Default severity=2 — если забыли указать, всё записывается как ERROR",
      "Severity 0 используется только в ramValueConverter для debug-информации",
      "Нет встроенной фильтрации по severity в ramCommonLogger — все записи попадают в лог"
    ],
    "relatedIds": [
      "log_common_logger_api",
      "log_contextual_info",
      "eh_logging_pattern"
    ],
    "sourcedoc": "Codebase-derived; official PDF section not identified — система severity не описана в PDF; это конвенция codebase",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "log_common_logger_api",
    "category": "logging",
    "subcategory": "api",
    "title": "API ramCommonLogger: перегрузки addLogDetails",
    "principle": "ramCommonLogger использует паттерн перегрузок (delegation): короткие методы делегируют к полному с дефолтными значениями. Лог-данные хранятся как ARRAY of ARRAY. Каждая запись — массив строк [элемент, атрибут, описание ошибки...].",
    "rule": "Используйте !!ramCommonLogger.addLogDetails(objectName, dataArray) для стандартного логирования (severity=2) или !!ramCommonLogger.addLogDetails(objectName, dataArray, severity) для явного уровня. Инициализируйте !!ramCommonLogger = object RAMCOMMONLOGGER() в начале pipeline. Заголовки задаются через .addHeading(headerArray).",
    "syntax": "-- инициализация\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n!headings = |Tag Name;Attribute Name;Error Text|\n!!ramCommonLogger.addHeading(!headings.split(|;|))\n-- логирование\n!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\n!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList, 1)\n-- экспорт\n!!ramCommonLogger.writeErrorDataToExcel(!path, !openFile)",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\ndefine method .addLogDetails(!objectName is STRING, !data is ARRAY)\n  !this.addLogDetails(!objectName, !data, 2)\nendmethod\n\ndefine method .addLogDetails(!objectName is STRING, !data is ARRAY, !severity is REAL)\n  !logRow = object ARRAY()\n  !logRow.append(!severity)\n  !logRow.append(!objectName)\n  !logRow.appendArray(!data)\n  !this.errorData.append(!logRow)\n  !this.fileWriter.appendToLog(!logRow)\nendmethod\n\n-- CB: JDE_routine-macro-run.pmlmac — полный lifecycle\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n!headings = |Tag Name;Attribute Name;Error Text|\n!!ramCommonLogger.addHeading(!headings.split(|;|))\n-- ... pipeline шаги ...\n!!ramCommonLogger.writeErrorDataToExcel(|...log_$!<year>-$!<month>.xlsx|, false)",
    "exampleAntipattern": "-- NOT: логировать только текст ошибки без severity/tool/context\n-- Плохо: невозможно отфильтровать и воспроизвести проблему",
    "pitfalls": [
      "!!ramCommonLogger — глобальная переменная, создаётся один раз в pipeline-макросе",
      "addLogDetails принимает ARRAY (не отдельные строки) — формируйте массив перед вызовом",
      "writeErrorDataToExcel использует .NET NETGRIDCONTROL и NETDATASOURCE для экспорта"
    ],
    "relatedIds": [
      "log_severity_levels",
      "log_form_integration",
      "obj_overloading_delegation",
      "mac_pipeline_pattern"
    ],
    "sourcedoc": "Codebase-derived; official PDF section not identified — ramCommonLogger не описан в PDF; это компонент codebase",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "log_form_integration",
    "category": "logging",
    "subcategory": "integration",
    "title": "Форма логгера: ramCommonLoggerForm",
    "principle": "ramCommonLoggerForm отображает логи в UI через PMLNETCONTROL (DataGrid). Форма привязана к объекту ramCommonLogger и обновляется при вызове метода refresh. Используется для интерактивного мониторинга процессов (импорт, валидация).",
    "rule": "Показывайте форму логгера через show !!ramCommonLoggerForm. Данные привязываются через NETGRIDCONTROL.bindToDataSource(). Для автообновления при добавлении новых записей используйте callback-механизм формы.",
    "syntax": "-- показ формы логгера\nshow !!ramCommonLoggerForm\n-- привязка данных\n!this.logGrid.bindToDataSource(!source)",
    "exampleCanonical": "-- CB ramCommonLoggerForm.pmlfrm\nsetup form !!ramCommonLoggerForm dialog size 80 30\n  !this.formTitle = |Common Log|\n  title !this.formTitle\n  PMLNETControl .logGrid NETGRIDCONTROL 75 24\n\n  button .buRefresh 'Refresh' at xmax-16 ymax+0.5 callback '!this.refresh()'\n  button .buExport  'Export'  at xmax-8 ymax+0.5 callback '!this.export()'\nexit\n\ndefine method .refresh()\n  if(undefined(!!ramCommonLogger)) then\n    return\n  endif\n  !this.logGrid.clearGrid()\n  !source = object NETDATASOURCE('data', !!ramCommonLogger.heading, !!ramCommonLogger.errorData)\n  !this.logGrid.bindToDataSource(!source)\nendmethod",
    "exampleAntipattern": "-- NOT: логировать только текст ошибки без severity/tool/context\n-- Плохо: невозможно отфильтровать и воспроизвести проблему",
    "pitfalls": [
      "undefined(!!ramCommonLogger) — guard: проверка что логгер создан перед refresh",
      "Форма использует PMLNETControl — требует import 'GridControl' (в parent объекте)",
      "Данные передаются через NETDATASOURCE — не прямое присвоение"
    ],
    "relatedIds": [
      "log_common_logger_api",
      "frm_form_as_class",
      "frm_button_callback",
      "dn_object_instantiation"
    ],
    "sourcedoc": "TM-1402 PML Form Design Rev 1.0, §2.18 (PMLNETControl, NETGRIDCONTROL)",
    "sourcecodebase": "ramCommonLoggerForm.pmlfrm"
  },
  {
    "id": "log_output_targets",
    "category": "logging",
    "subcategory": "targets",
    "title": "Цели вывода логов: файл, форма, консоль",
    "principle": "В codebase используются три канала логирования: (1) Excel-файл через writeErrorDataToExcel — для постоянного хранения; (2) форма ramCommonLoggerForm — для интерактивного мониторинга; (3) $P в консоль PDMS — для отладки и прогресса. Канал выбирается по назначению: production pipeline → Excel, интерактивный процесс → форма, debug → $P.",
    "rule": "Production pipelines: всегда пишите в Excel-файл через !!ramCommonLogger.writeErrorDataToExcel(). Интерактивные формы: показывайте ramCommonLoggerForm для мониторинга. Отладка: используйте $P для вывода в командную строку PDMS. Не полагайтесь только на $P — вывод теряется после закрытия сессии.",
    "syntax": "-- Excel-файл (production)\n!!ramCommonLogger.writeErrorDataToExcel(!path, !openFile)\n-- консоль PDMS (debug)\n$P --- STEP 1: DELETE UNTAGGED ITEMS ---\n-- прогресс-бар\n!!displayProgress(!index, !totalSize)",
    "exampleCanonical": "-- CB JDE_routine-macro-run.pmlmac\n-- 1. Консоль (прогресс):\n$P --- START ROUTINE PROCESSING ---\n$P --- STEP 1: DELETE UNTAGGED ITEMS ---\n\n-- 2. Прогресс-бар (UI):\n!!displayProgress(!index, !totalSize)\n\n-- 3. Excel-файл (финальный лог):\n!!ramCommonLogger.writeErrorDataToExcel(|...log_$!<year>-$!<month>-$!<date>-$!<hour>.xlsx|, false)\n\n-- CB: ramFileWriterClass.pmlobj — текстовый лог через FILE\n!file = object FILE(!path)\n!file.writeFile('OVERW', !textDataFormat)",
    "exampleAntipattern": "-- NOT: логировать только текст ошибки без severity/tool/context\n-- Плохо: невозможно отфильтровать и воспроизвести проблему",
    "pitfalls": [
      "$P в production pipeline быстро заполняет буфер командной строки",
      "writeErrorDataToExcel второй параметр (!openFile) = true откроет Explorer (не для batch-режима)",
      "Имя файла лога формируется с датой — см. mac_file_path_pattern"
    ],
    "relatedIds": [
      "log_common_logger_api",
      "log_form_integration",
      "mac_output_control",
      "dn_file_write_pattern"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §4.3 ($P — output command); TM-1402 Form Design Rev 1.0, §3.3 (FILE object for logging)",
    "sourcecodebase": "JDE_routine-macro-run.pmlmac"
  },
  {
    "id": "log_contextual_info",
    "category": "logging",
    "subcategory": "content",
    "title": "Контекстная информация в каждом лог-сообщении",
    "principle": "Каждая запись лога должна содержать достаточно контекста для диагностики без обращения к исходному коду. В codebase стандартный набор: имя элемента, имя атрибута, описание ошибки с кодом (ER1-ER16), severity. Без контекста лог-запись бесполезна.",
    "rule": "Лог-запись должна содержать: (1) имя элемента/тега — что обрабатывали, (2) имя атрибута/операции — что делали, (3) текст ошибки с кодом — что пошло не так, (4) значения — что пытались установить и что было. Используйте .objecttype() для идентификации источника (какой объект записал лог).",
    "syntax": "!errorList = object ARRAY()\n!errorList.append(!element.name)    -- ЧТО обрабатывали\n!errorList.append(!attribute)        -- с КАКИМ атрибутом\n!errorList.append(!errorDetail)      -- ЧТО пошло не так\n!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList, !severity)",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n-- Предупреждение (severity 1) — несоответствие типа:\n!this.addErrorToList(!elementRefe.name, 'Type', 'ER15 - ' + 'Excel Type - $!className AVEVA Type - ' + !elementRefe.acttype, 1)\n\n-- Ошибка (severity 2) — невозможность конвертации:\n!this.addErrorToList(!element.name, !attribute, 'ER6 - ' + 'Not able to convert ' + !tempValue + ' to real', 2)\n\n-- Ошибка (severity 2) — сбой записи:\n!this.addErrorToList(!element.name, !attribute, 'ER7 - ' + 'Unit conversion failed. Original value - ' + !tempValue + ' to unit - ' + !dbUnit.string(), 2)\n\n-- CB: TagManagementTmp.pmlobj — лог через split для CSV-формата\n!msg = '$!<tagRef.name>;ClassNameUpdate();$!!<error.text>'\n!this.errorList.append(!msg.split(|;|))",
    "exampleAntipattern": "-- NOT: логировать только текст ошибки без severity/tool/context\n-- Плохо: невозможно отфильтровать и воспроизвести проблему",
    "pitfalls": [
      "Коды ER1–ER16 позволяют группировать и фильтровать ошибки в Excel-логе",
      "objecttype() возвращает имя класса объекта — идентифицирует источник ошибки",
      "Конкатенация через + может обрезаться при длинных строках — используйте |...| для pipe-строк"
    ],
    "relatedIds": [
      "log_severity_levels",
      "log_common_logger_api",
      "eh_logging_pattern",
      "dt_string_substitution"
    ],
    "sourcedoc": "Codebase-derived; official PDF section not identified — паттерн контекстного логирования из codebase",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  }
];
