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
  },
  {
    id: 'pml1_lstdef_query',
    category: 'controlflow',
    subcategory: 'list-definition-queries',
    title: 'LSTDEF Collection Query Pattern',
    principle: "PML1 'var !name collect all LSTDEF with (expression)' queries list definitions by name and returns a GRID collection.",
    rule: "Use 'var !grid collect all LSTDEF with (LSTNAM eq |listName|)' to find a single list definition. Access via !grid.first().dbref() and !grid.size().",
    syntax: 'var !grid collect all LSTDEF with (LSTNAM eq |IM-tag-dataset|)\nif (!grid.size() eq 1) then\n  !gridRef = !grid.first().dbref()\n  !gridRef.lstflt = !realUnset\nendif',
    exampleCanonical: `-- CB RAMBiReportExport.pmlmac
var !grid collect all LSTDEF with (LSTNAM eq |IM-tag-dataset|)
if (!grid.size() eq 1) then
  !gridRef = !grid.first().dbref()
  !gridRef.lstflt = !realUnset
endif`,
    exampleAntipattern: `var !grid collect all LSTDEF  -- missing 'with' filter
if (!grid.size() gt 0) then
  !gridRef = !grid.first().dbref()
endif`,
    pitfalls: [
      "LSTDEF query returns a GRID, not a single DBREF",
      "Always check !grid.size() eq 1 before accessing first()",
      "CATNAM of LSTGRP of $!gridRef extracts the list group name for export",
      '$!gridRef uses query substitution, not direct method call'
    ],
    relatedIds: ['p2_collect_pml1', 'dt_string_substitution'],
    sourcedoc: 'AVEVA PDMS/E3D list definition documentation',
    sourcecodebase: 'RAMBiReportExport.pmlmac'
  },
  {
    "id": "cb_deslnk_attribute_fallback",
    "category": "controlflow",
    "subcategory": "attribute-access",
    "title": "Relationship-derived attribute read with HANDLE fallback",
    "principle": "Relationship-derived attribute reads should be protected with HANDLE fallback when DESLNK navigation is absent.",
    "rule": "Relationship-derived attribute reads must be protected with HANDLE fallback when DESLNK navigation is absent.",
    "syntax": "-- Company Ramboll Energies\n-- Date: 21-11-2023",
    "exampleCanonical": "-- CB JDE_pipeData_export.pmlmac\n-- Company Ramboll Energies\n-- Date: 21-11-2023\nimport 'GridControl'\nhandle ANY\nendhandle\nusing namespace |Aveva.Core.Presentation|\n!dataList = ARRAY()\n!headerList = ARRAY()\n!headerList.append(|Circle Welds VT|)\n!headerList.append(|Circle Welds RT/UT|)\n!headerList.append(|Circle Welds PT/MT|)\n!headerList.append(|Olets VT|)\n!headerList.append(|Olets RT/UT|)\n!headerList.append(|Olets PT/MT|)",
    "exampleAntipattern": "-- WRONG: use Relationship-derived attribute read with HANDLE fallback without validating the source context in JDE_pipeData_export.pmlmac",
    "pitfalls": [
          "Validate against JDE_pipeData_export.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
      "cf_do_enddo_loop"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_pipeData_export.pmlmac"
  },
  {
    "id": "cb_pml1_collect_values_dbref",
    "category": "controlflow",
    "subcategory": "collection-loop",
    "title": "PML1 COLL ALL with VALUES loop and DBREF conversion",
    "principle": "PML1 collection pipelines often chain COLLECT/COLL ALL, VALUES iteration and DBREF conversion.",
    "rule": "PML1 collection pipelines often chain COLLECT/COLL ALL, VALUES iteration and DBREF conversion.",
    "syntax": "!headerList.append(|ACTTYPE|)\n!headerList.append(|Tag Source|)",
    "exampleCanonical": "-- CB JDE_pipeData_export.pmlmac\n!headerList.append(|ACTTYPE|)\n!headerList.append(|Tag Source|)\n--step 1 collect data from AE3D\nvar !lines COLL ALL (PIPE) WITH (matchwild(name of site, |*-MP*|) and matchwild(dbname, |*-MP*|))\ndo !lineStr values !lines\n	--progress\n	!rowIdx = !lines.findFirst(!lineStr)\n	!!displayProgress(!rowIdx, !lines.size())\n	!rowData = ARRAY()\n	!line = !lineStr.dbref()\n	!CircleWeldsVTAE3D=!line.:RAM_VISUALCIRC\n	!CircleWeldsRTUTAE3D=!line.:RAM_RADIOCIRC",
    "exampleAntipattern": "-- WRONG: use PML1 COLL ALL with VALUES loop and DBREF conversion without validating the source context in JDE_pipeData_export.pmlmac",
    "pitfalls": [
          "Validate against JDE_pipeData_export.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
      "cf_do_enddo_loop"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_pipeData_export.pmlmac"
  },
  {
    "id": "pml-control-skip-if",
    "category": "controlflow",
    "subcategory": "conditional-skip",
    "title": "skip if(condition) — Conditional early loop iteration",
    "principle": "skip if(condition) skips the current iteration when the condition is true. It is a compound form of the skip statement.",
    "rule": "skip if(!condition) — equivalent to 'if (!condition) then skip endif'",
    "syntax": "do !i indices !array\n  skip if(!isInvalid)\n  !result = !array[!i]\nenddo",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n-- CB obj_06: skip pseudo attributes and unmapped columns\nif(!isNameUpdate.not()) then\n  skip if(!isPseudo)\nendif\nskip if(!isMasterUnmapped)",
    "exampleAntipattern": "if(!isPseudo) then skip endif -- more verbose than skip if(!isPseudo)",
    "pitfalls": [
      "skip if() only works inside DO/ENDDO loops",
      "Condition must evaluate to BOOLEAN"
    ],
    "relatedIds": [
      "cf_do_enddo_loop"
    ],
    "sourcedoc": "obj_06 (ramImportExcelElementLoader.pmlobj)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "pdms_setcompdate",
    "category": "controlflow",
    "subcategory": "comparison",
    "title": "SETCOMPDATE command — set database comparison date",
    "principle": "SETCOMPDATE sets the comparison date for database queries, enabling delta detection.",
    "rule": "SETCOMPDATE FOR DB $!dbName to $!stampDate",
    "syntax": "SETCOMPDATE FOR DB <dbname> to <datetime>",
    "exampleCanonical": "-- CB EBE_delta_tag_export.pmlmac\n-- CB mac_03\nvar !stampDate SetDate of $!latestStamp\nSETCOMPDATE FOR DB $!dbName to $!stampDate",
    "exampleAntipattern": "-- WRONG: omit validated pattern for SETCOMPDATE command — set database comparison date\n-- Review source EBE_delta_tag_export.pmlmac before reuse",
    "pitfalls": [
      "Must set comparison date before collecting modified/deleted/created elements",
      "Date must be a valid STAMP date"
    ],
    "relatedIds": [
      "macro_setdate_stamp"
    ],
    "sourcedoc": "AVEVA Engineering PML Reference",
    "sourcecodebase": "EBE_delta_tag_export.pmlmac"
  },
  {
    "id": "pml_inset_operator",
    "category": "controlflow",
    "subcategory": "membership",
    "title": "inset operator for array membership check",
    "principle": "inset checks if a value is a member of an array literal",
    "rule": "Use value inset ('A', 'B', 'C') to check membership against a list",
    "syntax": "!value inset ('val1', 'val2', 'val3')",
    "exampleCanonical": "-- CB EIS_data_update.pmlmac\nif (:TagStatus inset ('ACTIVE', 'ASB', 'AFC', 'AFD')) then\n  -- process\nendif",
    "exampleAntipattern": "-- WRONG: omit validated pattern for inset operator for array membership check\n-- Review source EIS_data_update.pmlmac before reuse",
    "pitfalls": [
      "inset is case-sensitive",
      "array literal must use single quotes"
    ],
    "relatedIds": [
      "pml_isnamed_keyword"
    ],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "EIS_data_update.pmlmac"
  },
  {
    "id": "pml_isnamed_keyword",
    "category": "controlflow",
    "subcategory": "dbref",
    "title": "ISNAMED dbref keyword",
    "principle": "ISNAMED checks if a dbref is named (has a NAME attribute)",
    "rule": "Use ISNAMED in dbref expressions to filter named elements only",
    "syntax": "ISNAMED",
    "exampleCanonical": "-- CB EIS_data_update.pmlmac\nif (ISNAMED and :TagName neq NAMN) then\n  -- update\nendif",
    "exampleAntipattern": "-- WRONG: omit validated pattern for ISNAMED dbref keyword\n-- Review source EIS_data_update.pmlmac before reuse",
    "pitfalls": [
      "ISNAMED cannot be used alone outside a dbref expression context"
    ],
    "relatedIds": [
      "pml_inset_operator"
    ],
    "sourcedoc": "AVEVA PDMS PML Reference",
    "sourcecodebase": "EIS_data_update.pmlmac"
  },
  {
    "id": "pml_op_inset",
    "category": "controlflow",
    "subcategory": "PML1 query operators",
    "title": "inset operator for list membership in PML1 queries",
    "principle": "The `inset` operator tests whether a value is a member of a list of values in PML1 query expressions.",
    "rule": "Use `value inset (list1, list2, ...)` in PML1 query expressions to test membership. Combine with `NOT` to exclude values.",
    "syntax": "NOT(:TagStatus inset (|VOID|, |Future|))",
    "exampleCanonical": "-- CB manual-data-export.pmlmac\n-- Exclude tags with VOID or Future status\n!tagFilter = 'NOT(:TagStatus inset (|VOID|, |Future|)) and ISNAMED'",
    "exampleAntipattern": "-- Don't use inset with PML2 method chaining\n!status.inset(...) -- incorrect, use infix form",
    "pitfalls": [
      "inset is a PML1 infix operator; it works inside query expression strings but not in PML2 object method chains.",
      "Values inside inset must be pipe-delimited strings."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PDMS/E3D Query Reference",
    "sourcecodebase": "manual-data-export.pmlmac"
  },
  {
    "id": "obj_08_skip_conditional",
    "category": "controlflow",
    "subcategory": "skip",
    "title": "skip with conditional expression in DO loop",
    "principle": "The `skip` command in PML DO loops can be followed by a conditional expression to selectively skip iterations.",
    "rule": "Use `skip if(!condition)` inside a DO/ENDDO loop to skip the current iteration when the condition is true (non-zero).",
    "syntax": "do !item values !collection\\n  skip if(!condition)\\n  -- process item\\nenddo",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\\ndo !char values !specialCharacters\\n  skip if(!value.occurs(!char).neq(2))\\n  !separationChar = !char\\n  -- process\\nenddo",
    "exampleAntipattern": "-- skip without condition always skips\\n  skip  -- skips every iteration, never executes body",
    "pitfalls": [
      "The condition is evaluated as a BOOLEAN/REAL expression.",
      "skip if(0) does not skip; skip if(1) or skip if(TRUE) does skip.",
      "This is a PML1 construct; PML2 prefers IF/THEN inside the loop body."
    ],
    "relatedIds": [
      "cf_do_enddo_loop"
    ],
    "sourcedoc": "TM-1401 AVEVA Plant PML Basic",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "collect_all_variable_substitution",
    "category": "controlflow",
    "subcategory": "query",
    "title": "COLLECT ALL with $! variable substitution in filter expressions",
    "principle": "PML allows $! variable substitution inside COLLECT ALL filter strings, enabling dynamic queries inside loops.",
    "rule": "Use $!varName inside the COLLECT ALL with () expression to substitute the current loop variable's value into the filter string.",
    "syntax": "do !item values !list\n  !filter = 'attribute eq |$!<item.attr>*|'\n  var !results collect all (TYPE) with ($!filter)\n  -- process results\nenddo",
    "exampleCanonical": "-- CB JDE_commPackage-reports.pmlmac\n-- CB mac_18_benchmark.pmlmac\ndo !commPckgName values !commPckgList\n  !commPckg = !commPckgName.dbref()\n  !tagFilter = 'NOT(:TagStatus inset (|VOID|, |Future|)) and ISNAMED and matchwild(namn of :TagRefToMCPackage, |*$!<commPckg.namn>*|)'\n  var !tagList collect all (ENGITE) with ($!tagFilter)\nenddo",
    "exampleAntipattern": "-- ❌ Direct variable reference in COLLECT ALL (not supported)\nvar !results collect all (TYPE) with (attribute eq !item)\n-- Use $! substitution instead",
    "pitfalls": [
      "$! substitution only works inside pipe-delimited strings within COLLECT ALL expressions.",
      "Variable must be a simple reference — method chains like $!<item.method()> are not supported.",
      "Ensure the loop variable is resolved before the COLLECT ALL executes."
    ],
    "relatedIds": [
      "macro_onerror_golabel_error_trap",
      "array_2d_initialization"
    ],
    "sourcedoc": "AVEVA PML Customization — Macros",
    "sourcecodebase": "JDE_commPackage-reports.pmlmac"
  },
  {
    "id": "d1-pml-reload-object",
    "category": "controlflow",
    "subcategory": "dollar-commands",
    "title": "PML RELOAD OBJECT command",
    "principle": "PML RELOAD OBJECT reloads an object definition from disk; use before constructing instances to ensure fresh definitions.",
    "rule": "Use `PML RELOAD OBJECT <objectName>` before `!var = object <objectName>()` when the object definition may have changed.",
    "syntax": "PML RELOAD OBJECT <objectName>",
    "exampleCanonical": "-- CB cable-area-update.pmlmac\n-- CB mac_02\ndefine object TAGMANAGEMENTTMP\n  member .name is STRING\nendobject\n\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.defineAreasForCables()",
    "exampleAntipattern": "!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.defineAreasForCables()  -- stale definition may be used",
    "pitfalls": [
      "PML RELOAD OBJECT only reloads from disk; if the object was defined inline in the same macro, it has no file to reload from.",
      "Reloading a user-defined type does not automatically update existing instances of that type."
    ],
    "relatedIds": [
      "d3-macro-file-header"
    ],
    "sourcedoc": "AVEVA PML Macros guide",
    "sourcecodebase": "cable-area-update.pmlmac"
  },
  {
    "id": "do_values_loop_pattern",
    "category": "controlflow",
    "subcategory": "loops",
    "title": "do ... values loop for array iteration",
    "principle": "The 'do ... values' construct iterates over each element value in an array, assigning the value to the loop variable.",
    "rule": "Use 'do !var values !array' to iterate over array values. This is the idiomatic PML loop for iterating array elements by value (not index).",
    "syntax": "do !item values !array\n  !itemRef = !item.dbref()\nenddo",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\ndo !tagString values !tags\n    !tagRef = !tagString.dbref()\n    -- process !tagRef\nenddo",
    "exampleAntipattern": "do !i from 1 to !tags.size()\n    !tagString = !tags[!i]  -- index-based, less idiomatic\nenddo",
    "pitfalls": [
      "Loop variable is a STRING copy, not a reference",
      "Cannot modify the original array from within the loop",
      "Nested with do ... from ... to requires careful index management"
    ],
    "relatedIds": [
      "pml1_coll_all_query_syntax"
    ],
    "sourcedoc": "AVEVA PML Customization — Control Logic",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  },
  {
    "id": "matchwild_function_call",
    "category": "controlflow",
    "subcategory": "string_matching",
    "title": "matchwild() Function Call for String Matching",
    "principle": "matchwild() can be used as a standalone function to check if a string matches a wildcard pattern, returning a BOOLEAN result.",
    "rule": "Use matchwild(!string, \\",
    "syntax": "!result = matchwild(!string, \\",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\n-- Check if file is an EX data extractor file\n!isEXfile = matchwild(!fileName, '*ex_data_extractor.xlsx')\nif !isEXfile then\n    -- Handle EX file format\nendif",
    "exampleAntipattern": "-- Using MatchWild() STRING method with wrong argument order\n!isEXfile = !fileName.MatchWild('*ex_data_extractor.xlsx')\n-- Note: STRING.MatchWild() takes the pattern as argument, returns BOOLEAN",
    "pitfalls": [
      "matchwild() as a function is different from MatchWild() STRING method",
      "In PML1 collect expressions, matchwild appears as an operator: matchwild(attr, pattern)",
      "The function form matchwild(!var, pattern) is available in PML2"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Customization Guide — String Functions",
    "sourcecodebase": "JDE_data-import.pmlmac"
  },
  {
    "id": "pml1_coll_all_query_syntax",
    "category": "controlflow",
    "subcategory": "pml1_queries",
    "title": "COLL ALL PML1 declarative collection query",
    "principle": "COLL ALL is the PML1 declarative syntax for querying all elements of a given type from the database, with optional WITH clause for filtering.",
    "rule": "Use COLL ALL (TYPE) WITH (conditions) to build a collection variable. Compound conditions use eq, neq, inset, NOT, EMPTY, ISNAMED, etc.",
    "syntax": "var !varName COLL ALL (ElementType) WITH (:Attr1 eq |value1| and :Attr2 neq |value2|)",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\nvar !tags COLL ALL (ENGITEM) WITH (:TagStatus eq |ACTIVE| and ISNAMED and NOT(EMPTY(:RAMTAGOWNER)) and :RAMTAGOWNER eq |LEIR|)",
    "exampleAntipattern": "var !tags = !!collectallfor('engitem', '|ACTIVE|', !!ce)  -- PML2 procedural form, different semantics",
    "pitfalls": [
      "COLL ALL returns STRING array of element references, not DBREF objects",
      "Each element in the result is a STRING that must be converted via .dbref()",
      "The WITH clause uses PML1 attribute syntax (:AttrName)"
    ],
    "relatedIds": [
      "pml1_eval_for_all_query",
      "do_values_loop_pattern"
    ],
    "sourcedoc": "AVEVA PML Customization — Query Arrays",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  },
  {
    "id": "pml1_eval_for_all_query",
    "category": "controlflow",
    "subcategory": "pml1_queries",
    "title": "EVAL ... FOR ALL PML1 query expression",
    "principle": "EVAL ... FOR ALL is a PML1 declarative syntax for building an array by evaluating an expression over all elements matching a query.",
    "rule": "Use EVAL (expression) FOR ALL (type) WITH (conditions) to derive an array from a query result.",
    "syntax": "var !varName EVAL (expression) FOR ALL (ElementType) WITH (conditions)",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\nvar !classes EVAL (LOWCASE(:RDLName of :MappingRefToClass)) FOR ALL (:ShellClassAttribute) WITH (:RDLSource eq |AKSO_Tag Properties Templates_Rev3|)",
    "exampleAntipattern": "// Manual loop to build array from query results\\n!classes = ARRAY()\\ndo !i values !mappings\\n    !classes.append(!mapping.RDLName)\\nenddo",
    "pitfalls": [
      "EVAL expression is evaluated for each matching element",
      "Returns ARRAY of evaluated expression results",
      "The OF syntax inside EVAL accesses attributes of the loop element"
    ],
    "relatedIds": [
      "pml1_coll_all_query_syntax",
      "do_values_loop_pattern"
    ],
    "sourcedoc": "AVEVA PML Customization — Query Arrays",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  },
  {
    "id": "pml1_inset_matchwild_operators",
    "category": "controlflow",
    "subcategory": "PML1 operators",
    "title": "PML1 inset and matchwild operators in query expressions",
    "principle": "PML1 provides set-membership (inset) and wildcard matching (matchwild) operators for query expressions in COLLECT ALL and other query commands.",
    "rule": "Use inset for membership testing: VALUE inset (|A|, |B|). Use matchwild for wildcard string matching: matchwild(string, pattern).",
    "syntax": "!result = !value inset (|A|, |B|)\n!result = matchwild(!string, |*pattern*|)",
    "exampleCanonical": "-- CB JDE_commPackage-reports.pmlmac\n-- CB mac_18_benchmark.pmlmac\n!tagFilter = 'NOT(:TagStatus inset (|VOID|, |Future|)) and ISNAMED'\n!tagFilter = !tagFilter & 'matchwild(namn of :TagRefToMCPackage, |*$!<commPckg.namn>*|)'",
    "exampleAntipattern": "-- ❌ Using 'in' instead of 'inset'\n!result = !value in (|A|, |B|)  -- not valid PML",
    "pitfalls": [
      "inset expects a parenthesised list of values, not an array.",
      "matchwild pattern uses * for any characters and ? for single character.",
      "matchwild is a function call, not an operator — use matchwild(string, pattern)."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Customization — Expressions",
    "sourcecodebase": "JDE_commPackage-reports.pmlmac"
  },
  {
    "id": "pml_nested_loop_collection_mutation",
    "category": "controlflow",
    "subcategory": "nested_loops",
    "title": "Nested DO/ENDDO with Indices Iteration and Collection.remove()",
    "principle": "When iterating over a collection by indices and conditionally removing elements, the loop index must account for shifting indices after removal. Using 'indices' in the DO clause captures the index set at loop entry time, but removing elements shifts subsequent indices.",
    "rule": "When using DO !idx indices !collection with conditional .remove(), be aware that removing element at !idx shifts all higher indices down by 1. Consider iterating in reverse or using a while loop with manual index control.",
    "syntax": "do !idx indices !collection\n  !ele = !collection[!idx]\n  if (shouldRemove(!ele)) then\n    !collection.remove(!idx)\n    -- Note: higher indices have shifted!\n  endif\nenddo",
    "exampleCanonical": "-- CB TB terminal correction macro.pmlmac\n-- CB mac_46\ndo !d indices !incConn\n  !ele = !incConn[!d]\n  if (!refCon.unset()) then\n    !incConn.remove(!d)\n  else\n    break\n  endif\nenddo",
    "exampleAntipattern": "-- BAD: Assuming indices are stable after remove\n-- This loop may skip elements or access invalid indices",
    "pitfalls": [
      "remove() shifts all higher indices — elements may be skipped",
      "Using 'indices' captures the index set at loop start; removed elements still have valid index values but point to different elements",
      "break exits the entire loop, potentially leaving unprocessed elements"
    ],
    "relatedIds": [
      "cf_do_enddo_loop"
    ],
    "sourcedoc": "AVEVA PML Reference — Control Flow",
    "sourcecodebase": "TB terminal correction macro.pmlmac"
  },
  {
    "id": "using_namespace_directive",
    "category": "controlflow",
    "subcategory": "namespace_management",
    "title": "using namespace Directive for .NET Classes",
    "principle": "The using namespace directive makes .NET classes from a managed assembly available without fully qualifying their names.",
    "rule": "Use using namespace \\",
    "syntax": "using namespace '<Namespace>'",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\nusing namespace |Aveva.Core.Presentation|\n!dataTable = object NETGRIDCONTROL()\n!source = object NETDATASOURCE('data', !headerList, !issueData)\n!dataTable.BindToDataSource(!source)",
    "exampleAntipattern": "-- Fully qualified names are verbose\n!dataTable = object Aveva.Core.Presentation.NETGRIDCONTROL()\n!source = object Aveva.Core.Presentation.NETDATASOURCE(...)",
    "pitfalls": [
      "using namespace must appear in the PML code block where classes are used",
      "Different AVEVA products may expose different namespaces (Pdms.Presentation vs Core.Presentation)",
      "The GridControl module must be imported before using .NET grid classes"
    ],
    "relatedIds": [
      "import_module_handle_any_pattern"
    ],
    "sourcedoc": "AVEVA PML .NET Interfaces Reference",
    "sourcecodebase": "JDE_data-import.pmlmac"
  },
  {
    "id": "control_do_values_iteration",
    "category": "controlflow",
    "subcategory": "iteration",
    "title": "DO VALUES Iteration over ARRAY Elements",
    "principle": "PML supports iterating over ARRAY elements using DO ... VALUES ... ENDDO, which yields each populated element as the loop index.",
    "rule": "Use DO !index VALUES !arrayName to iterate over all populated elements. !index holds the value of each element (not the position).",
    "syntax": "DO !index VALUES !arrayName\n  -- !index contains each element value\nENDDO",
    "exampleCanonical": "-- CB jacEISDeliveryForm.pmlfrm\n-- Iterate over selected list items\n!selectedItems = !this.list.val\ndo !index values !selectedItems\n  !viewName = !this.list.rtext[!index]\n  !this.processView(!viewName)\nenddo",
    "exampleAntipattern": "-- Using FROM/TO with array Size() when VALUES is more natural\n!i = 1\ndo while !i.le(!selectedItems.Size())\n  !index = !selectedItems[!i]\n  !i = !i + 1\nenddo",
    "pitfalls": [
      "!index holds the element value, not the array index",
      "Use !selectedItems[!index] to access array by value when values are indices",
      "Array indices in PML start at 1"
    ],
    "relatedIds": [
      "cf_do_enddo_loop"
    ],
    "sourcedoc": "AVEVA PML Customization Guide - Control Logic",
    "sourcecodebase": "jacEISDeliveryForm.pmlfrm"
  }
];
