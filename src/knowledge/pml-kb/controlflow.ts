import type { KBEntry } from '../schemas/kb-entry.js';

export const controlflowEntries: KBEntry[] = [
  {
    "id": "cf_if_elseif_structure",
    "category": "controlflow",
    "subcategory": "conditional",
    "title": "Структура IF / ELSEIF / ELSE / ENDIF",
    "principle": "PML вычисляет первое условие IF и, найдя TRUE, выполняет только этот блок и завершает конструкцию; ELSEIF проверяется по порядку, а ELSE гарантирует выполнение хотя бы одной ветви — поэтому порядок условий определяет логику.",
    "rule": "Выражение условия должно возвращать BOOLEAN; завершать конструкцию ENDIF; THEN обязателен после условия; в одной конструкции допустим только один ELSE; вкладывать IF можно произвольно.",
    "syntax": "if ( !number LT 0 ) then\n  !negative = TRUE\nelseif ( !number EQ 0 ) then\n  ...\nelse\n  ...\nendif",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\nif(!dbType INSET('INTEGER', 'REAL')) then\n  !type = 'REAL'\nelseif(!dbType INSET('WORD', 'TEXT')) then\n  !type = 'STRING'\nelseif(!dbType INSET('LOGICAL')) then\n  !type = 'BOOLEAN'\nelseif(!dbType INSET('REFERENCE')) then\n  !type = 'DBREF'\nendif",
    "exampleAntipattern": "if (!x LT 0)\n  ...    $* ОШИБКА: пропущен THEN",
    "pitfalls": [
      "Забытый THEN",
      "Более одного ELSE",
      "Условие, не возвращающее BOOLEAN",
      "Если значение уже BOOLEAN — сравнение не нужно: if(!flag) then"
    ],
    "relatedIds": [
      "cf_guard_clause",
      "dt_boolean_values",
      "cf_do_enddo_loop"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.11 / §3.11.1 (IF, ELSEIF, ELSE)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "cf_do_enddo_loop",
    "category": "controlflow",
    "subcategory": "loop",
    "title": "Цикл DO ... ENDDO; DO VALUES / DO INDEX",
    "principle": "DO-цикл повторяет блок кода, давая переиспользование и компактность; для обхода массивов есть две формы — DO ... VALUES (переменная принимает каждый элемент) и DO ... INDEX/INDICES (переменная принимает номера 1..size) — выбор формы определяет, что в руках: значение или индекс.",
    "rule": "Завершать цикл ENDDO; для счётного цикла — DO !i FROM a TO b BY step; для обхода массива по значениям — DO !x VALUES !arr; по индексам — DO !i INDEX !arr (или INDICES); бесконечный цикл — DO !n (выход через BREAK).",
    "syntax": "DO !i FROM 1 TO 10 BY 2 ... ENDDO\nDO !x VALUES !array ... ENDDO\nDO !i INDEX !array ... ENDDO",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\ndo !splitValue values !splitValues\n  !data = object $!subType()\n  ...\n  !result.append(!data)\nenddo",
    "exampleAntipattern": "do !n\n  ... $* без BREAK/диапазона — бесконечный цикл, PDMS придётся аварийно завершать",
    "pitfalls": [
      "Бесконечный DO !n без BREAK",
      "Путаница VALUES (значение) и INDEX (номер)",
      "INDICES — синоним INDEX, встречается в codebase"
    ],
    "relatedIds": [
      "cf_break_skip",
      "dt_array_declaration",
      "cf_nested_loops"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.10 (DO loop); §3.10.3 (DO INDEX and DO VALUES)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "cf_break_skip",
    "category": "controlflow",
    "subcategory": "loop_control",
    "title": "BREAK (выход) против SKIP (пропуск итерации)",
    "principle": "BREAK полностью покидает текущий цикл, а SKIP лишь прерывает текущую итерацию и переходит к следующей — путаница между ними меняет, обработается ли остаток данных или цикл остановится.",
    "rule": "Использовать BREAK для досрочного выхода (часто с условием BREAK IF (...)); SKIP — чтобы пропустить часть итераций (SKIP IF (...)); обе команды можно вызывать и внутри IF-конструкции.",
    "syntax": "BREAK IF (!value GT 1000)\nSKIP IF (!n LE 5) OR (!n GT 15)\nif (...) then BREAK endif",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\ndo !char values !specialCharacters\n  skip if(!value.occurs(!char).neq(2))\n  !separationChar  = !char\n  ...\n  break\nenddo",
    "exampleAntipattern": "-- NOT: продолжать обработку после невалидного входа в cf_break_skip\n-- Плохо: нет guard clause/SKIP/BREAK, ошибка проявится глубже в цикле",
    "pitfalls": [
      "BREAK выходит только из ближайшего цикла, не из всех вложенных",
      "SKIP пропускает остаток итерации, но цикл продолжается"
    ],
    "relatedIds": [
      "cf_do_enddo_loop",
      "cf_nested_loops",
      "tc_date_parsing"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.10.1 (BREAK); §3.10.2 (SKIP)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "cf_return_from_function",
    "category": "controlflow",
    "subcategory": "exit",
    "title": "RETURN из функции против EXIT/завершения макроса",
    "principle": "RETURN одновременно завершает функцию/метод и (опционально) отдаёт значение вызывающему; команда return — единственный штатный способ покинуть функцию досрочно, тогда как макрос (.pmlmac) завершается по концу файла или по GOLABEL, а не через RETURN-значение.",
    "rule": "В функции/методе использовать return [значение] для выхода; тип возврата объявлять в строке define (... is TYPE); ранний выход из функции — return без вычислений; в макросах для прыжков используется GOLABEL, а структура setup form завершается exit.",
    "syntax": "define function !!area(!radius is REAL) is REAL\n  !circleArea = !radius.power(2) * 3.142\n  return !circleArea\nendfunction",
    "exampleCanonical": "-- CB createObjectsFromExcelSheet.pmlfnc\nif (!exelFile.exists().not()) then\n  $P File $!excelFullPath is not existing!\n  !msg = |NA;NA;NA;NA;File [$!excelFullPath] is not existing!|\n  !issueData.append(!msg.split(|;|))\n  return !issueData\nendif",
    "exampleAntipattern": "-- NOT: продолжать обработку после невалидного входа в cf_return_from_function\n-- Плохо: нет guard clause/SKIP/BREAK, ошибка проявится глубже в цикле",
    "pitfalls": [
      "return без значения в функции с объявленным is TYPE — вернёт UNSET",
      "GOLABEL усложняет чтение (TM-1401 §3.12), применять ограниченно"
    ],
    "relatedIds": [
      "cf_guard_clause",
      "fnc_return_value",
      "fnc_definition_syntax"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.9 (return exits a function/method as well as returns a value); §4.2; §3.12 (GOLABEL)",
    "sourcecodebase": "createObjectsFromExcelSheet.pmlfnc"
  },
  {
    "id": "cf_guard_clause",
    "category": "controlflow",
    "subcategory": "guard",
    "title": "Guard clause — ранняя проверка и выход",
    "principle": "Проверка предусловий в начале функции с немедленным выходом/инициализацией (guard clause) предотвращает работу с невалидными данными и держит «горизонтальную» вложенность низкой — это доминирующий паттерн production-кода.",
    "rule": "В начале функции/метода проверять обязательные условия (наличие глобального логгера, существование файла, валидность ссылки) и либо инициализировать недостающее, либо делать ранний return/skip; только потом основная логика.",
    "syntax": "if(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif",
    "exampleCanonical": "-- CB jacExportRDLDataReport.pmlfnc\nif(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif\n!!ramCommonLogger.addLogDetails('jacExportRDLDataReport', '--------------------Execution start--------------------', 0)",
    "exampleAntipattern": "-- использование !!ramCommonLogger без проверки undefined() — ошибка при первом запуске сессии",
    "pitfalls": [
      "Глобал может быть не создан в новой сессии — всегда undefined()-guard перед использованием !!global",
      "Ранний return до накопления массива оставит вызывающего без данных — возвращайте уже заполненный issueData"
    ],
    "relatedIds": [
      "cf_return_from_function",
      "mac_global_variables",
      "log_common_logger_api",
      "eh_handle_any"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.11 (IF); §6.2 (Unset()) — синтаксическая основа; паттерн из codebase",
    "sourcecodebase": "jacExportRDLDataReport.pmlfnc"
  },
  {
    "id": "cf_nested_loops",
    "category": "controlflow",
    "subcategory": "nesting",
    "title": "Вложенные циклы: правила и ограничения",
    "principle": "BREAK/SKIP действуют только на ближайший охватывающий цикл, поэтому при вложении (обход тегов → обход атрибутов) важно понимать, какой именно цикл прерывается; для управления состоянием прогресса и накопления данных применяют отдельные счётчики/массивы на каждом уровне.",
    "rule": "Каждый DO завершать своим ENDDO; BREAK/SKIP относятся к текущему уровню; для выхода из нескольких уровней использовать флаг или GOLABEL (с осторожностью); прогресс показывать на внешнем цикле.",
    "syntax": "do !tagString values !tags\n  ...\n  do !attString values !tagRef.attributes()\n    ...\n  enddo\nenddo",
    "exampleCanonical": "-- CB JDE_tagProperties_export.pmlmac\ndo !tagString values !tags\n  !idx = !idx + 1\n  !tagRef = !tagString.dbref()\n  !tagIdx = !tags.findFirst(!tagString)\n  !!displayProgress(!tagIdx, !tags.size())\n  do !attString values !tagRef.attributes()\n    var !attValue DELETE\n    !attValue = !tagRef.attribute(!attString)\n    ...\n  enddo\nenddo",
    "exampleAntipattern": "-- NOT: продолжать обработку после невалидного входа в cf_nested_loops\n-- Плохо: нет guard clause/SKIP/BREAK, ошибка проявится глубже в цикле",
    "pitfalls": [
      "BREAK во вложенном цикле не выходит из внешнего",
      "Очищайте временные переменные между итерациями (var !attValue DELETE)",
      "Тяжёлые вложенные циклы — обновляйте прогресс на внешнем уровне"
    ],
    "relatedIds": [
      "cf_break_skip",
      "cf_do_enddo_loop",
      "fnc_pdms_navigation"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.10–§3.12.1 (DO loops, Conditional Branching)",
    "sourcecodebase": "JDE_tagProperties_export.pmlmac"
  },
  {
    "id": "p2_null_scope",
    "category": "controlflow",
    "subcategory": "ifdefined-ifundefined",
    "title": "`ifdefined`/`ifundefined` scoping",
    "principle": "Use definedness checks to distinguish missing variables from variables that exist but hold empty/unset values.",
    "rule": "Apply `ifdefined`/`ifundefined` at scope boundaries, especially around optional macro arguments/globals. Do not treat it as the same as `.set()` on an object value.",
    "syntax": "ifdefined !optional then\n  -- variable exists\nendif\nifundefined !!globalConfig then\n  !!globalConfig = object ARRAY()\nendif",
    "exampleCanonical": "-- CB JDE_routine-macro-run.pmlmac\n-- Routine macros guard optional/global pipeline state before executing import/export steps",
    "exampleAntipattern": "-- NOT: use `.set()` on a variable that may not be defined at all\n-- Плохо: undefined variable and unset object are different failure modes",
    "pitfalls": [
      "Definedness is about variable existence, not value validity",
      "Scope matters for !local vs !!global",
      "After ifdefined you may still need `.set()`/type checks"
    ],
    "relatedIds": [
      "dt_unset_handling",
      "mac_global_variables",
      "cf_guard_clause"
    ],
    "sourcedoc": "Perplexity PML KB null/scope pattern; TM-1401 variables",
    "sourcecodebase": "JDE_routine-macro-run.pmlmac"
  }
];
