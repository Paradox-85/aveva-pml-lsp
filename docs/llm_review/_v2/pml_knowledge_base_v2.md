# PML Knowledge Base — MCP Server (AVEVA Plant 12 Series)

## Метаданные

- **Дата формирования:** 2026-06-03 (v2.0 — расширенная, +PML.docx +100 Секретов PML +unread codebase functions)
- **Версии источников (СКЕЛЕТ / PDF):**
  - `TM-1401 PML (Basic) Rev 3.0` (12.0.SP4)
  - `TM-1401 PML Macros and Functions Rev 2.0` (12.0.SP5)
  - `TM-1402 PML Form Design Rev 1.0` (12.0.SP5)
- **Версия источника (МЯСО / codebase):** `github.com/Paradox-85/aveva-pml-lsp`, ветка `main`, путь `docs/codebase` (87 файлов: 12 objects, 7 forms, 18 functions, 50 macros)
- **Количество записей KB по категориям:**

| Категория | Записей |
|---|---|
| data_types | 11 |
| control_flow | 7 |
| error_handling | 7 |
| objects | 8 |
| forms | 13 |
| macros | 8 |
| functions | 5 |
| dotnet_interop | 8 |
| pdms_interaction | 11 |
| naming_conventions | 5 |
| type_conversion | 5 |
| logging | 5 |
| architecture_patterns | 8 |
| **Итого записей KB** | **101** |
| + Спец-раздел 2: Глоссарий | 22 термина |
| + Спец-раздел 3: Карта зависимостей | граф codebase |
| + Спец-раздел 4: Типичные ошибки | 8 ошибок |
| + Спец-раздел 5: Чеклист | 7 вопросов |
| + Спец-раздел 6: Индекс источников | PDF→KB + codebase→KB |

> **Условные обозначения источников.** `PDF:` — раздел учебного руководства (СКЕЛЕТ, источник истины для синтаксиса). `CB:` — файл production-кода (МЯСО, источник истины для паттернов). Поле `example_canonical` для категорий objects/forms/dotnet_interop/architecture_patterns/type_conversion/logging содержит **дословный** код из codebase. Если конкретный синтаксис не найден ни в одном источнике — поле помечено `NOT_FOUND_IN_SOURCES`.

---

## Раздел 1: Записи KB (по категориям)

### Категория: data_types

### [dt_string_declaration]
```json
{
  "id": "dt_string_declaration",
  "category": "data_types",
  "subcategory": "string",
  "title": "Объявление и инициализация STRING",
  "principle": "Тип переменной фиксируется в момент первого присвоения и не меняется в течение её жизни, поэтому строковый литерал обязан быть обёрнут в текстовые разделители — иначе PML попытается прочитать его как команду или другой тип.",
  "rule": "Строку объявлять через присвоение литерала в одинарных кавычках 'text' или вертикальных чертах |text|; пустую/UNSET строку — через STRING() или object STRING().",
  "syntax": "!name = |Fred|            $* локальная STRING\n!name = STRING()          $* локальная UNSET STRING\n!s    = object STRING()   $* то же, явный конструктор",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .clearData()\n!this.logElement   = object STRING()\n!this.logAttribute = object STRING()",
  "example_antipattern": "!name = Fred   $* ОШИБКА: без разделителей PML читает Fred как команду/идентификатор",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.3.1; §2.9 (text delimiters: 'single quotes' or |vertical bars|)",
  "source_codebase": "ramValueConverter.pmlobj",
  "pitfalls": ["Сравнение строк регистрозависимо (String comparisons are case sensitive), хотя имена переменных — нет", "Пустая STRING после object STRING() находится в состоянии UNSET, а не ''"],
  "related_ids": ["dt_unset_handling", "dt_string_substitution", "tc_real_to_string"]
}
```

### [dt_real_declaration]
```json
{
  "id": "dt_real_declaration",
  "category": "data_types",
  "subcategory": "real",
  "title": "Объявление REAL, отличие от INTEGER",
  "principle": "В PML 2 нет отдельного типа INTEGER — все числа представлены типом REAL; «целочисленность» достигается не типом, а форматированием (FORMAT/INTEGERFMT) при выводе.",
  "rule": "Числовую переменную объявлять присвоением числа (!x = 3) или через REAL()/object REAL() для UNSET; для целочисленного вида применять !!INTEGERFMT при конвертации в строку, а не отдельный тип.",
  "syntax": "!!answer = 42        $* GLOBAL REAL\n!x = REAL()          $* локальная UNSET REAL\n!s = !x.string(!!INTEGERFMT)   $* вывод как целое",
  "example_canonical": "-- CB: RAMTagMaturityData.pmlobj, .RAMTagMaturityData()\n!this.L0 = 0\n!this.L1 = 0\n!result = !this.L0 + !this.L1 + !this.L2",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.2.1 (типы STRING/REAL/BOOLEAN/ARRAY); §2.3.1",
  "source_codebase": "RAMTagMaturityData.pmlobj",
  "pitfalls": ["Деление и арифметика всегда в REAL — для целого результата округляйте через !!INTEGERFMT или .nint()", "STRING нельзя умножать на REAL без .real()"],
  "related_ids": ["tc_string_to_real", "tc_real_to_string", "dt_type_coercion"]
}
```

### [dt_array_declaration]
```json
{
  "id": "dt_array_declaration",
  "category": "data_types",
  "subcategory": "array",
  "title": "ARRAY: индексация с 1, append(), size()",
  "principle": "Массив создаётся либо присвоением первого элемента, либо как пустой через ARRAY(); индексация начинается с 1 (не с 0), поэтому код, перенесённый из языков с нулевой базой, ломается тихо.",
  "rule": "Инициализировать массив через object ARRAY() перед накоплением; добавлять элементы методом .append() (или .appendArray() для слияния); первый элемент — [1]; размер — .size().",
  "syntax": "!result = object ARRAY()\n!result.append(!data)\n!result.appendArray(!detail.split(!splitChar))\n!n = !result.size()\n!first = !result[1]",
  "example_canonical": "-- CB: ramCommonLogger.pmlobj, .addLogSplitDetails(...)\n!details = object ARRAY()\n!details.AppendArray(!detail.split(!splitChar))\n!this.addLogDetails(!toolName, !details, !severityLevel)",
  "example_antipattern": "!x[0] = |a|   $* ОШИБКА: индекс 0 недопустим, элементы нумеруются с 1",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.8 (Arrays); §4.5.1 (.size(), .clear(), .removeFrom())",
  "source_codebase": "ramCommonLogger.pmlobj",
  "pitfalls": ["Обращение к индексу 0 — типичная ошибка", "ARRAY ELEMENT может сам быть ARRAY → многомерный массив", "Перед append() массив должен существовать (object ARRAY())"],
  "related_ids": ["fnc_array_accumulator", "cf_do_enddo_loop", "dt_unset_handling"]
}
```

### [dt_boolean_values]
```json
{
  "id": "dt_boolean_values",
  "category": "data_types",
  "subcategory": "boolean",
  "title": "BOOLEAN: TRUE/FALSE/UNSET — три состояния",
  "principle": "BOOLEAN-переменная имеет не два, а три возможных состояния: TRUE, FALSE и UNSET (не инициализирована); проверка «if (!flag)» обрабатывает только TRUE, а UNSET ведёт себя не как FALSE и может вызвать ошибку.",
  "rule": "Инициализировать булевы члены явным FALSE/TRUE в конструкторе; перед логической проверкой непроверенной переменной использовать .set()/.unset(); если значение уже BOOLEAN — сравнение не нужно: if (!flag) then.",
  "syntax": "!!flag = TRUE\nif ( !booleanVariable ) then ... endif\nif ( !value.set() ) then ... endif",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .clearFormat()\n!this.isFormatApplied = false\n!this.isUnitRequired = false\n!this.isNameWithoutSlah = false",
  "example_antipattern": "-- проверка булева, который никогда не инициализировали:\nif (!this.isError) then ...   $* при UNSET .isError даёт неопределённое поведение",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.11 (IF, BOOLEAN expressions); §6.2 (Set()/Unset())",
  "source_codebase": "ramValueConverter.pmlobj",
  "pitfalls": ["UNSET ≠ FALSE", "Инициализируйте все булевы члены в конструкторе .clearFormat()/.clearData()"],
  "related_ids": ["dt_unset_handling", "cf_if_elseif_structure", "tc_boolean_from_string"]
}
```

### [dt_dbref_usage]
```json
{
  "id": "dt_dbref_usage",
  "category": "data_types",
  "subcategory": "dbref",
  "title": "DBREF — ссылка на элемент PDMS",
  "principle": "DBREF — это объект-ссылка на элемент базы данных PDMS, а не сам элемент; его члены суть атрибуты элемента, поэтому через DBREF можно и читать, и присваивать атрибуты, но ссылка может быть UNSET или badref.",
  "rule": "Объявлять member как DBREF; получать через .dbref() от валидного строкового имени или из коллекции; перед разыменованием проверять .set()/.badref(); !!CE — глобальный DBREF текущего элемента.",
  "syntax": "member .ceRef is DBREF\n!elementRefe = object DBREF()\n!elementRefe = !finalName.dbref()\n!branchHeadBore = !!CE.hbore",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .convertStringToDbref()\n!elementRefe    = object DBREF()\n!finalName      = !this.convertStringToValidDBString(!elementName)\nif(!finalName.set()) then\n  !elementRefe  = !finalName.dbref()\nendif\nreturn !elementRefe",
  "example_antipattern": "!bore = !ref.hbore   $* без проверки .badref()/.set() — ошибка, если ref невалиден или атрибут отсутствует",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.3.4 (!!CE — global DBREF); §4.6 (Using the !!CE Object)",
  "source_codebase": "ramValueConverter.pmlobj",
  "pitfalls": ["Перед разыменованием атрибута проверяйте, что он валиден для текущего типа элемента", "badref() для битой ссылки", "DBREF из неверной строки бросает ошибку — оборачивайте в handle"],
  "related_ids": ["pdms_dbref_resolve", "pdms_current_element", "dt_unset_handling", "tc_db_to_pml_mapping"]
}
```

### [dt_unset_handling]
```json
{
  "id": "dt_unset_handling",
  "category": "data_types",
  "subcategory": "unset",
  "title": "Проверка unset()/set() для неинициализированных переменных",
  "principle": "Любая объявленная без значения переменная находится в состоянии UNSET; обращение к ней в выражении или к её атрибуту часто приводит к ошибке выполнения, поэтому проверка состояния — обязательный guard перед использованием значения.",
  "rule": "Перед использованием значения, пришедшего извне (атрибут PDMS, ячейка Excel, аргумент), проверять .set()/.unset(); метод .set() возвращает TRUE если значение присвоено, .unset() — обратное.",
  "syntax": "if(!value.set()) then ... endif\nif !line.unset() then BREAK endif\nif(!this.logElement.unset() AND !this.logAttribute.unset()) then ...",
  "example_canonical": "-- CB: ramFileWriterClass.pmlobj — чтение файла до UNSET-маркера конца\ndo\n  !line = !file.ReadRecord()\n  if !line.unset() then\n    BREAK\n  else\n    !n = !n + 1\n  endif\nenddo",
  "example_antipattern": "!result = !value.string()   $* если !value UNSET — может упасть; сперва if(!value.set())",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §6.2 (Set()/Unset() — methods available to all objects); §2.3.1",
  "source_codebase": "ramValueConverter.pmlobj, ramExcelReaderClass.pmlobj",
  "pitfalls": ["UNSET-значение в арифметике/строке вызывает ошибку", "Чтение readRecord() возвращает UNSET в конце файла — это и есть признак EOF"],
  "related_ids": ["dt_boolean_values", "dt_dbref_usage", "eh_handle_any", "pdms_attribute_query"]
}
```

### [dt_type_coercion]
```json
{
  "id": "dt_type_coercion",
  "category": "data_types",
  "subcategory": "coercion",
  "title": "Неявные преобразования типов",
  "principle": "PML почти не делает неявных преобразований между числом и строкой: STRING нельзя умножить на REAL, оператор '+' над строками конкатенирует, а оператор '&' принудительно приводит оба операнда к STRING — поэтому смешение типов даёт либо ошибку, либо неожиданный результат.",
  "rule": "Для арифметики приводить строку к числу методом .real(); для конкатенации с авто-приведением к строке использовать '&'; не полагаться на авто-конвертацию там, где типы разные.",
  "syntax": "!result = !value.real() * 2     $* явное приведение STRING→REAL\n!c = !a & !b & !m               $* '&' приводит к STRING\n!z = !x + !y                    $* '+' : REAL если оба REAL, иначе строка/ошибка",
  "example_canonical": "-- CB: ramFileWriterClass.pmlobj, .getTextExportFormatRow()\nif(!i.eq(1)) then\n  !rowConcat = !dataList[!i].string()\nelse\n  !rowConcat = !rowConcat + !this.separator + !dataList[!i].string()\nendif",
  "example_antipattern": "!value = |56|\n!result = !value * 2   $* ОШИБКА: STRING * REAL недопустимо (TM-1401 §4.5)",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §4.5 (switching types, .real()); §3.9 (Concatenation Operator '&')",
  "source_codebase": "ramFileWriterClass.pmlobj",
  "pitfalls": ["STRING * REAL → ошибка", "'+' над строками = конкатенация, не сложение", "В PML1 (VAR !z (|$!x|+|$!y|)) результат — STRING; в PML2 (!z=!x+!y) — REAL если оба REAL"],
  "related_ids": ["tc_string_to_real", "tc_real_to_string", "dt_real_declaration"]
}
```

### [dt_string_substitution]
```json
{
  "id": "dt_string_substitution",
  "category": "data_types",
  "subcategory": "substitution",
  "title": "$!name против $!<expression> в строках",
  "principle": "Символ $ раскрывает (expand) содержимое переменной в строку до того, как строка читается как команда; форма $!name подставляет простую переменную, а форма $!<...> нужна, когда внутри подстановки есть точка-метод или выражение, иначе PML не поймёт границу имени.",
  "rule": "Для простой переменной писать $!name; если требуется подставить результат метода/выражения (с точкой, скобками) — обязательно оборачивать в $!<expression>.",
  "syntax": "NEW $!componentType XLEN $!xLength       $* простая подстановка\n|...extract_$!<year>-$!<month>-$!<date>|  $* подстановка выражений\n!result = !value$!<valueFormattingText>.string($!formatStr)",
  "example_canonical": "-- CB: JDE_tagProperties_export.pmlmac\n!publishPath = |C:\\...\\TagPropertyValue_extract_$!<year>-$!<month>-$!<date>-$!<hour>.xlsx|",
  "example_antipattern": "!file = |report_$!dt.year().xlsx|   $* НЕВЕРНО: точка-метод требует $!<dt.year()>",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.3 (Communicating with AVEVA Products — $ expansion); §2.9 ($ escape char)",
  "source_codebase": "JDE_tagProperties_export.pmlmac, ramValueConverter.pmlobj",
  "pitfalls": ["$!name перед точкой-методом обрывается на точке", "Если нужен буквальный символ $, вводить два: $$", "Команды подаются в процессор как STRING — переменные иного типа надо раскрыть через $"],
  "related_ids": ["mac_file_path_pattern", "tc_db_to_pml_mapping", "ce_typical_error_substitution"]
}
```

---

### Категория: control_flow

### [cf_if_elseif_structure]
```json
{
  "id": "cf_if_elseif_structure",
  "category": "control_flow",
  "subcategory": "conditional",
  "title": "Структура IF / ELSEIF / ELSE / ENDIF",
  "principle": "PML вычисляет первое условие IF и, найдя TRUE, выполняет только этот блок и завершает конструкцию; ELSEIF проверяется по порядку, а ELSE гарантирует выполнение хотя бы одной ветви — поэтому порядок условий определяет логику.",
  "rule": "Выражение условия должно возвращать BOOLEAN; завершать конструкцию ENDIF; THEN обязателен после условия; в одной конструкции допустим только один ELSE; вкладывать IF можно произвольно.",
  "syntax": "if ( !number LT 0 ) then\n  !negative = TRUE\nelseif ( !number EQ 0 ) then\n  ...\nelse\n  ...\nendif",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .convertDBTypeToType()\nif(!dbType INSET('INTEGER', 'REAL')) then\n  !type = 'REAL'\nelseif(!dbType INSET('WORD', 'TEXT')) then\n  !type = 'STRING'\nelseif(!dbType INSET('LOGICAL')) then\n  !type = 'BOOLEAN'\nelseif(!dbType INSET('REFERENCE')) then\n  !type = 'DBREF'\nendif",
  "example_antipattern": "if (!x LT 0)\n  ...    $* ОШИБКА: пропущен THEN",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.11 / §3.11.1 (IF, ELSEIF, ELSE)",
  "source_codebase": "ramValueConverter.pmlobj",
  "pitfalls": ["Забытый THEN", "Более одного ELSE", "Условие, не возвращающее BOOLEAN", "Если значение уже BOOLEAN — сравнение не нужно: if(!flag) then"],
  "related_ids": ["cf_guard_clause", "dt_boolean_values", "cf_do_enddo_loop"]
}
```

### [cf_do_enddo_loop]
```json
{
  "id": "cf_do_enddo_loop",
  "category": "control_flow",
  "subcategory": "loop",
  "title": "Цикл DO ... ENDDO; DO VALUES / DO INDEX",
  "principle": "DO-цикл повторяет блок кода, давая переиспользование и компактность; для обхода массивов есть две формы — DO ... VALUES (переменная принимает каждый элемент) и DO ... INDEX/INDICES (переменная принимает номера 1..size) — выбор формы определяет, что в руках: значение или индекс.",
  "rule": "Завершать цикл ENDDO; для счётного цикла — DO !i FROM a TO b BY step; для обхода массива по значениям — DO !x VALUES !arr; по индексам — DO !i INDEX !arr (или INDICES); бесконечный цикл — DO !n (выход через BREAK).",
  "syntax": "DO !i FROM 1 TO 10 BY 2 ... ENDDO\nDO !x VALUES !array ... ENDDO\nDO !i INDEX !array ... ENDDO",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .convertArrayValue()\ndo !splitValue values !splitValues\n  !data = object $!subType()\n  ...\n  !result.append(!data)\nenddo",
  "example_antipattern": "do !n\n  ... $* без BREAK/диапазона — бесконечный цикл, PDMS придётся аварийно завершать",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.10 (DO loop); §3.10.3 (DO INDEX and DO VALUES)",
  "source_codebase": "ramValueConverter.pmlobj, JDE_tagProperties_export.pmlmac",
  "pitfalls": ["Бесконечный DO !n без BREAK", "Путаница VALUES (значение) и INDEX (номер)", "INDICES — синоним INDEX, встречается в codebase"],
  "related_ids": ["cf_break_skip", "dt_array_declaration", "cf_nested_loops"]
}
```

### [cf_break_skip]
```json
{
  "id": "cf_break_skip",
  "category": "control_flow",
  "subcategory": "loop_control",
  "title": "BREAK (выход) против SKIP (пропуск итерации)",
  "principle": "BREAK полностью покидает текущий цикл, а SKIP лишь прерывает текущую итерацию и переходит к следующей — путаница между ними меняет, обработается ли остаток данных или цикл остановится.",
  "rule": "Использовать BREAK для досрочного выхода (часто с условием BREAK IF (...)); SKIP — чтобы пропустить часть итераций (SKIP IF (...)); обе команды можно вызывать и внутри IF-конструкции.",
  "syntax": "BREAK IF (!value GT 1000)\nSKIP IF (!n LE 5) OR (!n GT 15)\nif (...) then BREAK endif",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .convertValue() (date parsing)\ndo !char values !specialCharacters\n  skip if(!value.occurs(!char).neq(2))\n  !separationChar  = !char\n  ...\n  break\nenddo",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.10.1 (BREAK); §3.10.2 (SKIP)",
  "source_codebase": "ramValueConverter.pmlobj",
  "pitfalls": ["BREAK выходит только из ближайшего цикла, не из всех вложенных", "SKIP пропускает остаток итерации, но цикл продолжается"],
  "related_ids": ["cf_do_enddo_loop", "cf_nested_loops", "tc_date_parsing"]
}
```

### [cf_return_from_function]
```json
{
  "id": "cf_return_from_function",
  "category": "control_flow",
  "subcategory": "exit",
  "title": "RETURN из функции против EXIT/завершения макроса",
  "principle": "RETURN одновременно завершает функцию/метод и (опционально) отдаёт значение вызывающему; команда return — единственный штатный способ покинуть функцию досрочно, тогда как макрос (.pmlmac) завершается по концу файла или по GOLABEL, а не через RETURN-значение.",
  "rule": "В функции/методе использовать return [значение] для выхода; тип возврата объявлять в строке define (... is TYPE); ранний выход из функции — return без вычислений; в макросах для прыжков используется GOLABEL, а структура setup form завершается exit.",
  "syntax": "define function !!area(!radius is REAL) is REAL\n  !circleArea = !radius.power(2) * 3.142\n  return !circleArea\nendfunction",
  "example_canonical": "-- CB: createObjectsFromExcelSheet.pmlfnc — ранний return при отсутствии файла\nif (!exelFile.exists().not()) then\n  $P File $!excelFullPath is not existing!\n  !msg = |NA;NA;NA;NA;File [$!excelFullPath] is not existing!|\n  !issueData.append(!msg.split(|;|))\n  return !issueData\nendif",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.9 (return exits a function/method as well as returns a value); §4.2; §3.12 (GOLABEL)",
  "source_codebase": "createObjectsFromExcelSheet.pmlfnc",
  "pitfalls": ["return без значения в функции с объявленным is TYPE — вернёт UNSET", "GOLABEL усложняет чтение (TM-1401 §3.12), применять ограниченно"],
  "related_ids": ["cf_guard_clause", "fnc_return_value", "fnc_definition_syntax"]
}
```

### [cf_guard_clause]
```json
{
  "id": "cf_guard_clause",
  "category": "control_flow",
  "subcategory": "guard",
  "title": "Guard clause — ранняя проверка и выход",
  "principle": "Проверка предусловий в начале функции с немедленным выходом/инициализацией (guard clause) предотвращает работу с невалидными данными и держит «горизонтальную» вложенность низкой — это доминирующий паттерн production-кода.",
  "rule": "В начале функции/метода проверять обязательные условия (наличие глобального логгера, существование файла, валидность ссылки) и либо инициализировать недостающее, либо делать ранний return/skip; только потом основная логика.",
  "syntax": "if(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif",
  "example_canonical": "-- CB: jacExportRDLDataReport.pmlfnc (повторяется в большинстве функций codebase)\nif(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif\n!!ramCommonLogger.addLogDetails('jacExportRDLDataReport', '--------------------Execution start--------------------', 0)",
  "example_antipattern": "-- использование !!ramCommonLogger без проверки undefined() — ошибка при первом запуске сессии",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.11 (IF); §6.2 (Unset()) — синтаксическая основа; паттерн из codebase",
  "source_codebase": "jacExportRDLDataReport.pmlfnc, jacPropagateParentData.pmlfnc, jacNameRegExValidatorTTY.pmlfnc, ramValueConverter.pmlobj",
  "pitfalls": ["Глобал может быть не создан в новой сессии — всегда undefined()-guard перед использованием !!global", "Ранний return до накопления массива оставит вызывающего без данных — возвращайте уже заполненный issueData"],
  "related_ids": ["cf_return_from_function", "mac_global_variables", "log_common_logger_api", "eh_handle_any"]
}
```

### [cf_nested_loops]
```json
{
  "id": "cf_nested_loops",
  "category": "control_flow",
  "subcategory": "nesting",
  "title": "Вложенные циклы: правила и ограничения",
  "principle": "BREAK/SKIP действуют только на ближайший охватывающий цикл, поэтому при вложении (обход тегов → обход атрибутов) важно понимать, какой именно цикл прерывается; для управления состоянием прогресса и накопления данных применяют отдельные счётчики/массивы на каждом уровне.",
  "rule": "Каждый DO завершать своим ENDDO; BREAK/SKIP относятся к текущему уровню; для выхода из нескольких уровней использовать флаг или GOLABEL (с осторожностью); прогресс показывать на внешнем цикле.",
  "syntax": "do !tagString values !tags\n  ...\n  do !attString values !tagRef.attributes()\n    ...\n  enddo\nenddo",
  "example_canonical": "-- CB: JDE_tagProperties_export.pmlmac — теги x атрибуты\ndo !tagString values !tags\n  !idx = !idx + 1\n  !tagRef = !tagString.dbref()\n  !tagIdx = !tags.findFirst(!tagString)\n  !!displayProgress(!tagIdx, !tags.size())\n  do !attString values !tagRef.attributes()\n    var !attValue DELETE\n    !attValue = !tagRef.attribute(!attString)\n    ...\n  enddo\nenddo",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.10–§3.12.1 (DO loops, Conditional Branching)",
  "source_codebase": "JDE_tagProperties_export.pmlmac, jacPropagateParentData.pmlfnc",
  "pitfalls": ["BREAK во вложенном цикле не выходит из внешнего", "Очищайте временные переменные между итерациями (var !attValue DELETE)", "Тяжёлые вложенные циклы — обновляйте прогресс на внешнем уровне"],
  "related_ids": ["cf_break_skip", "cf_do_enddo_loop", "fnc_pdms_navigation"]
}
```

---

### Категория: error_handling

### [eh_handle_endhandle]
```json
{
  "id": "eh_handle_endhandle",
  "category": "error_handling",
  "subcategory": "basic",
  "title": "Базовая конструкция HANDLE / ENDHANDLE",
  "principle": "Без обработки ошибка прерывает все выполняющиеся макросы/функции и показывает alert пользователю; HANDLE перехватывает ошибку строки, расположенной непосредственно перед ним, и позволяет разработчику ограничить влияние сбоя на пользователя.",
  "rule": "Размещать HANDLE сразу после потенциально сбойной команды; различать коды через HANDLE (sec,code) / ELSEHANDLE; ELSEHANDLE ANY — на любой прочий сбой; ELSEHANDLE NONE — ветвь успеха; завершать ENDHANDLE.",
  "syntax": "NEW EQUI /ABCD\nHANDLE (41, 8)\n  $p Need to be at a ZONE or below\nELSEHANDLE (41, 12)\n  $p That name has already been used\nELSEHANDLE ANY\n  $p Another error has occurred\nELSEHANDLE NONE\n  $p Everything OK\nENDHANDLE",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .convertStringToValidDBString()\n!elementRefe    = object DBREF(!name)\nhandle ANY\n  !this.isError = true\n  !this.addErrorData('Unable to convert $!elementName to DBREF')\nelsehandle None\n  !finalName    = !elementRefe.Name\nendhandle",
  "example_antipattern": "!ref = object DBREF(!name)   $* без handle — невалидное имя прервёт весь макрос",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.13 / §3.13.2 (Error Handling Using the HANDLE Syntax); §3.13.1 (Error Codes)",
  "source_codebase": "ramValueConverter.pmlobj",
  "pitfalls": ["HANDLE перехватывает только ошибку предшествующей строки/блока", "Код ошибки имеет вид (section, code), напр. (41,8)", "ELSEHANDLE NONE срабатывает только при отсутствии ошибки"],
  "related_ids": ["eh_handle_any", "eh_error_variable", "dn_import_guard", "eh_nested_handle"]
}
```

### [eh_handle_any]
```json
{
  "id": "eh_handle_any",
  "category": "error_handling",
  "subcategory": "catch_all",
  "title": "HANDLE ANY — перехват всех ошибок",
  "principle": "HANDLE ANY ловит любую ошибку, не различая код; это уместно, когда конкретный код не важен (защита .NET-импорта, конвертации, чтения атрибута), но опасно, если им маскируют логические ошибки, которые следовало бы исправить.",
  "rule": "Использовать HANDLE ANY для операций, чей конкретный код ошибки не важен (импорт DLL, попытка преобразования, доступ к возможно-отсутствующему атрибуту); внутри ставить graceful-обработку (лог + флаг), а не молчаливое подавление без следа.",
  "syntax": "handle ANY\n  !this.isError = true\n  !this.addErrorData('...')\nendhandle",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .convertArrayValue() (REAL conversion)\n!data = !splitValue.real()\nhandle ANY\n  !this.isError = true\n  !this.addErrorData('Not able to convert string to real in converter')\nendhandle",
  "example_antipattern": "handle ANY\nendhandle   $* пустой перехват без лога: ошибка проглочена бесследно (см. eh_logging_pattern)",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.13.2 (ELSEHANDLE ANY)",
  "source_codebase": "ramValueConverter.pmlobj, ramExcelReaderClass.pmlobj",
  "pitfalls": ["Пустой handle any/endhandle прячет ошибки — допустим лишь когда сбой заведомо некритичен", "HANDLE ANY не различает коды — не использовать там, где нужна реакция на конкретный код"],
  "related_ids": ["eh_handle_endhandle", "eh_logging_pattern", "dn_import_guard", "eh_import_protection"]
}
```

### [eh_error_variable]
```json
{
  "id": "eh_error_variable",
  "category": "error_handling",
  "subcategory": "error_object",
  "title": "Доступ к тексту ошибки (!!ERROR / !!error.text)",
  "principle": "Глобальный объект !!ERROR хранит сведения о последней ошибке; внутри блока handle к его тексту можно обратиться, чтобы залогировать причину, вместо общей фразы — это превращает перехват в диагностируемое событие.",
  "rule": "Внутри handle-блока читать !!error.text для записи реальной причины в лог; не путать с собственным булевым флагом .isError, который объект ведёт отдельно.",
  "syntax": "handle ANY\n  !this.addErrorData(!!error.text)\nendhandle",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .convertToString() (ARRAY branch)\nhandle ANY\n  !this.isError        = true\n  !this.addErrorData(!!error.text)\nendhandle",
  "example_antipattern": "handle ANY\n  !this.addErrorData('error')   $* теряется реальная причина; используйте !!error.text",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.3.4 (!!ERROR — global ERROR object); §3.13.1 (Error Codes)",
  "source_codebase": "ramValueConverter.pmlobj, ramTagManagement.pmlobj",
  "pitfalls": ["!!error.text валиден только сразу после ошибки внутри handle", "Это глобальный объект — он перезаписывается следующей ошибкой"],
  "related_ids": ["eh_handle_any", "eh_logging_pattern", "log_contextual_info"]
}
```

### [eh_import_protection]
```json
{
  "id": "eh_import_protection",
  "category": "error_handling",
  "subcategory": "dotnet",
  "title": "Защита .NET import через handle any/endhandle (ОБЯЗАТЕЛЬНО)",
  "principle": "Команда import загружает .NET-сборку, которая может отсутствовать, быть уже загруженной или конфликтовать; без обёртки handle any такой сбой прервёт загрузку всего объекта/формы — поэтому защита import является обязательной идиомой codebase.",
  "rule": "Каждый import 'Namespace.Class' немедленно оборачивать парой handle any / endhandle (пустое тело допустимо — цель в том, чтобы не дать ошибке загрузки прервать файл); ставить блоки в начале файла объекта/формы/функции.",
  "syntax": "import 'RamAEPMLExcelReader'\nhandle any\nendhandle",
  "example_canonical": "-- CB: ramExcelReaderClass.pmlobj (начало файла)\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\n\ndefine object RAMEXCELREADERCLASS\n  member .excelTables  is ARRAY\nendobject",
  "example_antipattern": "import 'RamAEPMLExcelReader'\ndefine object RAMEXCELREADERCLASS   $* БЕЗ handle: при отсутствии сборки весь объект не загрузится",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.18 (PML.NET — IMPORT syntax, namespace); TM-1401 M&F §3.13.2 (HANDLE ANY) — синтаксис handle",
  "source_codebase": "ramExcelReaderClass.pmlobj, ramFileWriterClass.pmlobj, ramImportExcelConfigLoader.pmlobj, createObjectsFromExcelSheet.pmlfnc, jacExportRDLDataReport.pmlfnc, все JDE_*.pmlmac",
  "pitfalls": ["Пропуск handle вокруг import — частая причина 'object not found' при загрузке", "Несколько import — каждый оборачивается отдельно", "Регистр: встречается и import, и Import"],
  "related_ids": ["dn_import_statement", "dn_import_guard", "eh_handle_any", "dn_object_instantiation"]
}
```

### [eh_nested_handle]
```json
{
  "id": "eh_nested_handle",
  "category": "error_handling",
  "subcategory": "nesting",
  "title": "Вложенные блоки HANDLE и порядок перехвата",
  "principle": "Каждый handle-блок привязан к своей предшествующей операции, поэтому несколько последовательных или вложенных handle позволяют по-разному реагировать на сбой разных шагов одной процедуры (создание элемента vs. установка атрибута), не смешивая их обработку.",
  "rule": "Для последовательности рискованных шагов ставить отдельный handle на каждый; внутри handle с ELSEHANDLE NONE можно безопасно выполнять следующий рискованный шаг и навешивать на него свой handle.",
  "syntax": "handle any\n  !this.addErrorToList(!name, 'NAME', !!error.text)\nelsehandle none\n  !elementNet.AddAttributeValue(|NAME|, !validName)\n  !elementNet.ExecuteSync()\n  !errors = !elementNet.GetErrorDetails()\nendhandle",
  "example_canonical": "-- CB: ramTagManagement.pmlobj, .createElement()\n!elementNet.SetElementTypeByName(|$!<type>|)\nhandle any\n  !this.addErrorToList(!name, 'NAME', !!error.text)\nelsehandle none\n  !elementNet.AddAttributeValue(|NAME|, !validName)\n  !elementNet.ExecuteSync()\n  !errors      = !elementNet.GetErrorDetails()\nendhandle\n\n!dbRefe = !validName.dbRef()\nhandle any\nendhandle",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.13.2 (HANDLE / ELSEHANDLE NONE)",
  "source_codebase": "ramTagManagement.pmlobj, createObjectsFromExcelSheet.pmlfnc",
  "pitfalls": ["Не путать вложение блоков с цепочкой ELSEHANDLE одного блока", "ELSEHANDLE NONE — место для следующего шага, выполняемого только при успехе предыдущего"],
  "related_ids": ["eh_handle_endhandle", "eh_handle_any", "pdms_element_create"]
}
```

### [eh_logging_pattern]
```json
{
  "id": "eh_logging_pattern",
  "category": "error_handling",
  "subcategory": "logging",
  "title": "Паттерн: поймал ошибку → залогировал → деградировал мягко",
  "principle": "Production-код не падает на первой ошибке: пойманный сбой записывается в общий логгер (с контекстом — элемент, атрибут, причина), выставляется флаг ошибки, а обработка продолжается для остальных данных — это обеспечивает устойчивость пакетных операций над тысячами тегов.",
  "rule": "В handle-блоке: (1) выставить .isError = true; (2) вызвать addErrorData/addErrorToList/!!ramCommonLogger.addLogDetails с контекстом; (3) не прерывать общий цикл, если сбой касается одного элемента — продолжать (graceful degradation).",
  "syntax": "handle ANY\n  !this.isError = true\n  !this.addErrorData('<контекст: что и почему не удалось>')\nendhandle",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .addErrorData() — единая точка логирования\ndefine method .addErrorData(!errorData is STRING)\n  if(undefined(!!ramCommonLogger)) then\n    !!ramCommonLogger = object RAMCOMMONLOGGER()\n  endif\n  if(!this.logElement.unset() AND !this.logAttribute.unset()) then\n    !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorData)\n  else\n    !errorList = object ARRAY()\n    !errorList.append(!this.logElement)\n    !errorList.append(!this.logAttribute)\n    !errorList.append(!errorData)\n    !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\n  endif\nendmethod",
  "example_antipattern": "handle ANY\n  return   $* проглатывает ошибку и обрывает весь пакет, не залогировав причину",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.13 (Error Handling) — основа; паттерн логирования из codebase",
  "source_codebase": "ramValueConverter.pmlobj, ramTagManagement.pmlobj, ramCommonLogger.pmlobj",
  "pitfalls": ["Молчаливое подавление без лога делает сбой невидимым", "Логируйте контекст (элемент+атрибут+причина), а не просто 'error'", "Создавайте !!ramCommonLogger лениво через undefined()-guard"],
  "related_ids": ["eh_handle_any", "eh_error_variable", "log_common_logger_api", "log_contextual_info", "cf_guard_clause"]
}
```

---

### Категория: objects

### [obj_definition_structure]
```json
{
  "id": "obj_definition_structure",
  "category": "objects",
  "subcategory": "structure",
  "title": "Структура файла .pmlobj",
  "principle": "Файл объекта описывает пользовательский тип: блок define object ... endobject задаёт члены (состояние), а следующие за ним define method ... endmethod задают поведение; имя файла должно совпадать с именем объекта, иначе динамическая загрузка по имени не сработает.",
  "rule": "Порядок: (опц.) import+handle → define object NAME / member .x is TYPE / endobject → define method .name() ... endmethod; имя файла = имя объекта (.pmlobj); члены и методы доступны через точку.",
  "syntax": "define object NAME\n  member .field is TYPE\nendobject\n\ndefine method .name()\n  ...\nendmethod",
  "example_canonical": "-- CB: ramValueConverter.pmlobj (начало)\ndefine object RAMVALUECONVERTER\n  member .realFormat      is FORMAT\n  member .isFormatApplied is BOOLEAN\n  member .isUnitRequired  is BOOLEAN\n  member .dateFormat      is DATEFORMAT\n  member .isError         is BOOLEAN\n  member .logElement      is STRING\n  member .logAttribute    is STRING\nendobject",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 Form Design Rev 1.0, §3.4 (User-Defined Objects); TM-1401 M&F §2.3 (PML Objects)",
  "source_codebase": "ramValueConverter.pmlobj, ramCommonLogger.pmlobj, RAMTagMaturityData.pmlobj",
  "pitfalls": ["Имя файла должно совпадать с именем объекта", "Нет public/private и нет наследования (TM-1401 §2.2)", "После правки .pmlobj нужен pml reload object / pml rehash all"],
  "related_ids": ["obj_member_declaration", "obj_method_declaration", "obj_constructor_pattern", "obj_namespace_loading"]
}
```

### [obj_constructor_pattern]
```json
{
  "id": "obj_constructor_pattern",
  "category": "objects",
  "subcategory": "constructor",
  "title": "Конструктор объекта (метод с именем объекта)",
  "principle": "Метод, чьё имя совпадает с именем объекта, играет роль конструктора и вызывается при создании экземпляра через object NAME(); это место для инициализации членов в детерминированное состояние, поскольку иначе они остаются UNSET.",
  "rule": "Объявлять define method .NAME() (или с аргументами для перегрузки); внутри инициализировать члены (часто делегируя в .clearData()/.clearFormat()); допускается несколько конструкторов с разными аргументами.",
  "syntax": "define method .ramValueConverter()\n  !this.clearData()\n  !this.clearFormat()\nendmethod",
  "example_canonical": "-- CB: ramCommonLogger.pmlobj\ndefine method .ramCommonLogger()\n  !this.clearData()\n  !this.fileWriter  = object RAMFILEWRITERCLASS()\nendmethod",
  "example_antipattern": "!obj = object RAMVALUECONVERTER   $* НЕВЕРНО: без () конструктор не вызовется, члены UNSET",
  "source_doc": "TM-1402 Form Design Rev 1.0, §3.4 (constructor method, multiple constructors); TM-1401 M&F §2.3.3 (object NAME())",
  "source_codebase": "ramCommonLogger.pmlobj, ramValueConverter.pmlobj, RAMTagMaturityData.pmlobj",
  "pitfalls": ["Создание без () не вызывает конструктор", "Можно перегружать конструктор разными аргументами", "Инициализируйте члены-массивы object ARRAY(), иначе append() упадёт"],
  "related_ids": ["obj_definition_structure", "obj_member_declaration", "obj_delegation_pattern"]
}
```

### [obj_member_declaration]
```json
{
  "id": "obj_member_declaration",
  "category": "objects",
  "subcategory": "members",
  "title": "Объявление членов (member .x is TYPE)",
  "principle": "Члены — это переменные объекта, их тип фиксируется в объявлении; член может быть и пользовательским объектом, что даёт агрегацию (объект владеет другим объектом) вместо наследования, которого в PML нет.",
  "rule": "Объявлять member .name is TYPE внутри define object; TYPE может быть встроенным (STRING/REAL/BOOLEAN/ARRAY), системным (FORMAT/DATEFORMAT/DBREF) или пользовательским (другой объект); значения по умолчанию задавать в конструкторе, не в объявлении.",
  "syntax": "member .logDataList is ARRAY\nmember .fileWriter  is RAMFILEWRITERCLASS",
  "example_canonical": "-- CB: ramCommonLogger.pmlobj\ndefine object RAMCOMMONLOGGER\n  member .logDataList is ARRAY\n  member .headings is ARRAY\n  member .fileWriter is RAMFILEWRITERCLASS\nendobject",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.3 (member ... is STRING); TM-1402 §3.4",
  "source_codebase": "ramCommonLogger.pmlobj, ramImportExcelConfigLoader.pmlobj, LoopData.pmlobj",
  "pitfalls": ["Значения по умолчанию не задаются в объявлении — только в конструкторе", "Член-объект агрегируется, доступны его члены и методы"],
  "related_ids": ["obj_delegation_pattern", "obj_constructor_pattern", "ap_data_object"]
}
```

### [obj_method_declaration]
```json
{
  "id": "obj_method_declaration",
  "category": "objects",
  "subcategory": "methods",
  "title": "Объявление метода; доступ через !this",
  "principle": "Метод определяется в файле объекта и обращается к собственному состоянию через специальную локальную переменную !this; метод может возвращать значение (is TYPE) или нет (процедура), и вызывается на экземпляре через точку.",
  "rule": "Объявлять define method .name(args) [is TYPE] ... endmethod; внутри читать/писать члены через !this.member; вызывать другие методы того же объекта через !this.other(); возврат — return.",
  "syntax": "define method .isError() is BOOLEAN\n  return !this.isError\nendmethod",
  "example_canonical": "-- CB: ramValueConverter.pmlobj\ndefine method .setLogInformation(!element is STRING, !attribute is STRING)\n  !this.clearData()\n  !this.logElement   = !element\n  !this.logAttribute = !attribute\nendmethod",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.4 (Functions and Methods); §2.5 (!this — special local variable); TM-1402 §2.4",
  "source_codebase": "ramValueConverter.pmlobj, ramCommonLogger.pmlobj",
  "pitfalls": ["Член-метод и член-данное могут совпадать по имени (.isError член и .isError() метод) — встречается в codebase, но запутывает", "!this заменяет явную ссылку на владельца"],
  "related_ids": ["obj_method_declaration", "fnc_definition_syntax", "obj_overloading_delegation", "nc_method_naming"]
}
```

### [obj_delegation_pattern]
```json
{
  "id": "obj_delegation_pattern",
  "category": "objects",
  "subcategory": "aggregation",
  "title": "Объект владеет другим объектом как членом (делегирование)",
  "principle": "Поскольку в PML нет наследования, переиспользование достигается агрегацией: объект объявляет член типа другого объекта, создаёт его в конструкторе и делегирует ему задачу — так логгер владеет файл-райтером, а конфиг-лоадер использует Excel-ридер.",
  "rule": "Объявить member .x is OTHEROBJECT; создать в конструкторе (!this.x = object OTHEROBJECT()); вызывать его методы для делегирования специализированной работы; не дублировать чужую логику.",
  "syntax": "member .fileWriter is RAMFILEWRITERCLASS\n...\n!this.fileWriter = object RAMFILEWRITERCLASS()",
  "example_canonical": "-- CB: ramCommonLogger.pmlobj — логгер владеет файл-райтером\ndefine object RAMCOMMONLOGGER\n  member .logDataList is ARRAY\n  member .headings is ARRAY\n  member .fileWriter is RAMFILEWRITERCLASS\nendobject\n\ndefine method .ramCommonLogger()\n  !this.clearData()\n  !this.fileWriter  = object RAMFILEWRITERCLASS()\nendmethod",
  "example_antipattern": "-- копирование логики записи файла внутрь логгера вместо делегирования fileWriter",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.3 (member может быть user-defined object: PRODUCT has member .site is FACTORY)",
  "source_codebase": "ramCommonLogger.pmlobj (owns RAMFILEWRITERCLASS), ramImportExcelConfigLoader.pmlobj (uses RamPMLExcelReaderClass), ramTagManagement.pmlobj (uses RAMVALUECONVERTER)",
  "pitfalls": ["Не забыть создать член-объект в конструкторе — иначе он UNSET", "Глубокая агрегация требует порядка загрузки (зависимый объект должен быть доступен)"],
  "related_ids": ["obj_member_declaration", "ap_loader_chain", "frm_loader_chain", "ap_separation_of_concerns"]
}
```

### [obj_overloading_delegation]
```json
{
  "id": "obj_overloading_delegation",
  "category": "objects",
  "subcategory": "overloading",
  "title": "Короткие перегрузки делегируют к полному методу",
  "principle": "PML поддерживает перегрузку методов по списку аргументов; чтобы не дублировать логику, короткие перегрузки лишь подставляют значения по умолчанию и вызывают одну «полную» реализацию — единственное место, где живёт настоящая логика.",
  "rule": "Определить несколько методов с одним именем и разными аргументами; в коротких вариантах добавить умолчания (например severity=2, обернуть detail в массив) и вызвать наиболее полный перегруженный метод; полную логику держать в одном месте.",
  "syntax": "define method .addLogDetails(!toolName is STRING, !detail is STRING)\n  !this.addLogDetails(!toolName, !detail, 2)\nendmethod",
  "example_canonical": "-- CB: ramCommonLogger.pmlobj — цепочка перегрузок addLogDetails\ndefine method .addLogDetails(!toolName is STRING, !detail is STRING)\n  !this.addLogDetails(!toolName, !detail, 2)\nendmethod\n\ndefine method .addLogDetails(!toolName is STRING, !detail is STRING, !severityLevel is REAL)\n  !details = object ARRAY()\n  !details.Append(!detail)\n  !this.addLogDetails(!toolName, !details, !severityLevel)\nendmethod\n\ndefine method .addLogDetails(!toolName is STRING, !details is ARRAY, !severityLevel is REAL)\n  ...\n  !this.logDataList.append(!finalLog)\nendmethod",
  "example_antipattern": "-- три независимые реализации addLogDetails с продублированной логикой записи",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.2 (overloading of methods is supported)",
  "source_codebase": "ramCommonLogger.pmlobj",
  "pitfalls": ["Все перегрузки должны вести к единой полной реализации, иначе теряется смысл", "Перегрузка различается по числу/типам аргументов, не по имени"],
  "related_ids": ["obj_method_declaration", "log_common_logger_api", "obj_constructor_pattern"]
}
```

### [obj_factory_pattern]
```json
{
  "id": "obj_factory_pattern",
  "category": "objects",
  "subcategory": "factory",
  "title": "object $!TYPE() — динамическое создание по строковому имени типа",
  "principle": "Поскольку $ раскрывает строку до того, как она читается синтаксисом, конструкцию object $!TYPE() можно использовать как фабрику: тип объекта берётся из строковой переменной во время выполнения, что позволяет одному методу конвертировать значение в любой запрошенный тип.",
  "rule": "Когда целевой тип известен лишь в рантайме (из конфигурации/Excel), создавать экземпляр через object $!typeVar(); аналогично можно динамически вызывать метод через !value.$!conversionType().",
  "syntax": "!data   = object $!subType()\n!result = !value.$!conversionType()",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .convertArrayValue() и .convertValue()\n!data = object $!subType()\n...\n!result = object $!conversionType()\n...\n!result = !value.$!conversionType()",
  "example_antipattern": "-- большой if/elseif на каждый возможный тип вместо object $!subType()",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.3 ($ expansion of variable into string before reading); §2.9",
  "source_codebase": "ramValueConverter.pmlobj",
  "pitfalls": ["Если строка типа невалидна — конструктор бросит ошибку, оборачивайте в handle", "Динамический вызов метода !value.$!m() требует, чтобы метод существовал у типа !value"],
  "related_ids": ["dt_string_substitution", "tc_db_to_pml_mapping", "obj_constructor_pattern"]
}
```

### [obj_namespace_loading]
```json
{
  "id": "obj_namespace_loading",
  "category": "objects",
  "subcategory": "loading",
  "title": "Загрузка объектов: pml rehash all, pml reload, using namespace",
  "principle": "PML 2-объекты ищутся динамически по PMLLIB через индекс pml.index; новый файл невидим, пока индекс не пересобран (pml rehash all), а изменённое определение уже загруженного объекта требует pml reload — иначе работает старая версия в памяти.",
  "rule": "После создания нового .pmlobj/.pmlfnc/.pmlfrm — pml rehash all; после правки уже загруженного — pml reload object NAME / pml reload form NAME (в codebase встречается PML RELOAD OBJECT внутри макроса перед использованием); using namespace 'X' открывает .NET-пространство имён.",
  "syntax": "PML REHASH ALL\nPML RELOAD OBJECT TAGMANAGEMENTTMP\nusing namespace 'RamAEPMLExcelReader'",
  "example_canonical": "-- CB: JDE_data-import.pmlmac — принудительная перезагрузка перед использованием\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()",
  "example_antipattern": "-- правка .pmlobj без pml reload → в сессии продолжает работать старое определение",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.7 (PML REHASH / REHASH ALL, pml reload object/form); §2.9; TM-1402 §2.2",
  "source_codebase": "JDE_data-import.pmlmac, createObjectsFromExcelSheet.pmlfnc",
  "pitfalls": ["Новый файл без rehash недоступен по имени", "Изменённый загруженный объект без reload — старая версия", "using namespace относится к .NET-сборкам (TM-1402 §2.18)"],
  "related_ids": ["dn_import_statement", "ce_typical_error_rehash", "obj_definition_structure"]
}
```

---

### Категория: forms

### [frm_file_structure]
```json
{
  "id": "frm_file_structure",
  "category": "forms",
  "subcategory": "structure",
  "title": "Структура файла .pmlfrm",
  "principle": "Форма — это глобальный объект (!!formName), описанный одним файлом: блок setup form ... exit задаёт гаджеты, члены и callbacks, а следующие define method задают поведение; форма владеет гаджетами как членами, что делает её естественным контроллером.",
  "rule": "Порядок: (опц.) import+handle, using namespace → setup form !!NAME [dialog ...] / гаджеты / member ... / exit → define method-ы (включая конструктор с именем формы и .init()); сохранять как .pmlfrm под PMLLIB.",
  "syntax": "setup form !!exampleForm\n  ...gadgets / members...\nexit\n\ndefine method .init()\n  ...\nendmethod",
  "example_canonical": "-- CB: ramImportExcelValidationForm.pmlfrm\nimport 'GridControl'\nhandle any\nendhandle\nusing namespace 'Aveva.Core.Presentation'\nsetup form !!ramImportExcelValidationForm resize\n  option .opExcelSheet |Select Excel Sheet| tagwidth 15 anchor T+L at xmin ymin width 30\n  frame .frExcelList anchor all at xmin ymax+0.5 width 150 height 20\n    container .coExcelList NOBOX PMLNETControl 'Data List' dock fill\n  exit\n  member .dataLoader    is RAMIMPORTEXCELDATALOADER\n  member .gridExcelList is NETGRIDCONTROL\nexit",
  "example_antipattern": "-- FRAME без парного EXIT: форма НЕ ЗАГРУЗИТСЯ, командная строка останется в режиме setup (TM-1402 §2.11)",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.3 (Defining a Form); §2.1 (Forms are Global Objects)",
  "source_codebase": "ramImportExcelValidationForm.pmlfrm, ramImportExcelProcessor.pmlfrm",
  "pitfalls": ["Каждому FRAME нужен парный EXIT, иначе форма не грузится и CL зависает в setup-режиме (выход — EXIT до ошибки)", "Имя файла = имя формы", "dialog dock / resize задаются в строке setup form"],
  "related_ids": ["frm_initialise_method", "frm_form_as_class", "frm_frame_exit_balance", "obj_namespace_loading"]
}
```

### [frm_initialise_method]
```json
{
  "id": "frm_initialise_method",
  "category": "forms",
  "subcategory": "lifecycle",
  "title": "Метод инициализации (.init() через initCall)",
  "principle": "Конструктор формы (метод с именем формы) выполняется однократно при загрузке, а INITCALL (.init()) — каждый раз при показе формы, поэтому значения по умолчанию и заполнение гаджетов размещают в .init(), а привязку callbacks и создание .NET-гаджетов — в конструкторе.",
  "rule": "Назначить !this.initCall = |!this.init()| в конструкторе; в .init() заполнять/сбрасывать значения гаджетов; в конструкторе — задать callbacks, создать .NET-контролы, построить меню; помнить про 7 событийных callback'ов формы.",
  "syntax": "define method .ramImportExcelProcessor()   $* конструктор\n  !this.initCall = |!this.init()|\n  ...callbacks, .NET grid, menu...\nendmethod\n\ndefine method .init()                       $* при каждом показе\n  !this.clearData()\nendmethod",
  "example_canonical": "-- CB: ramCommonLoggerForm.pmlfrm\ndefine method .ramCommonLoggerForm()\n  !this.initCall            = |!this.init()|\n  !this.buExport.callback   = |!this.browseExcel()|\n  !this.buClear.callback    = |!this.clearData()|\n  !this.buRefresh.callback  = |!this.init()|\n  ...\nendmethod\n\ndefine method .init()\n  !this.loadGrid()\nendmethod",
  "example_antipattern": "-- заполнение списков прямо в конструкторе: данные не обновятся при повторном показе формы",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.4 (CONSTRUCTOR vs INITCALL vs FIRSTSHOWNCALL etc. — 7 event callbacks)",
  "source_codebase": "ramCommonLoggerForm.pmlfrm, ramImportExcelProcessor.pmlfrm",
  "pitfalls": ["Конструктор — один раз при загрузке; INITCALL — при каждом показе", "Если default-значения не выставлены в .init(), пользователь видит UNSET/старые данные", "7 callback'ов: constructor, initCall, firstShownCall, okCall, cancelCall, quitCall, killingCall"],
  "related_ids": ["frm_callback_syntax", "frm_file_structure", "frm_form_as_class"]
}
```

### [frm_callback_syntax]
```json
{
  "id": "frm_callback_syntax",
  "category": "forms",
  "subcategory": "callback",
  "title": "Синтаксис callback гаджета",
  "principle": "Callback — это строка-команда, выполняемая при взаимодействии с гаджетом; она может (1) показать форму, (2) выполнить команду, (3) вызвать функцию/метод; callback можно задать либо inline в определении гаджета (call |...|), либо присвоением !this.widget.callback в конструкторе.",
  "rule": "Inline: button .b |Tag| call |!this.method()|; через присвоение: !this.b.callback = |!this.method()|; open callback (две скобки) — call |!this.opencall(| с методом, принимающим (!gad is GADGET, !key is STRING).",
  "syntax": "button .button |Print| call |!this.print()|\n!this.buImport.callback = |!this.importData()|",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm (конструктор)\n!this.buAdd.callback             = |!this.addToList()|\n!this.buRemove.callback          = |!this.removeFromList()|\n!this.buConfigBrowse.callback    = |!this.browseConfigFile()|\n!this.buImport.callback          = |!this.importData()|\n!this.buValidationForm.callback  = |!this.showValidationForm()|",
  "example_antipattern": "button .b |X| call !this.method()   $* callback должен быть строкой в | | : call |!this.method()|",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.4 (Callbacks); §2.20 (Open Callbacks — single bracket); TM-1401 M&F §2.5",
  "source_codebase": "ramImportExcelProcessor.pmlfrm, ramCommonLoggerForm.pmlfrm, ramImportExcelValidationForm.pmlfrm",
  "pitfalls": ["Open callback опознаётся по одной открывающей скобке call |!this.m(| и требует метод с 2 аргументами (GADGET, STRING)", "Callback — всегда STRING", "TEXTPANE нельзя дать callback — действие через кнопку"],
  "related_ids": ["frm_button_callback", "frm_open_callback", "frm_initialise_method"]
}
```

### [frm_widget_common_params]
```json
{
  "id": "frm_widget_common_params",
  "category": "forms",
  "subcategory": "widgets",
  "title": "Общие параметры гаджетов",
  "principle": "Гаджет занимает область формы и (опционально) имеет действие; поэтому почти у каждого определения есть позиция (AT / PATH), размер (width/height) и привязка (anchor/dock), а у интерактивных — callback; гаджет — это объект со своими членами/методами.",
  "rule": "Определять: имя (.name), тип (button/text/list/option/...), tag-подпись (|...|), позицию (at x y или относительно другого гаджета), размер (width/height), привязку (anchor/dock); для текстового ввода — is TYPE; для интерактива — call/callback.",
  "syntax": "button .buImport |Import Data| anchor r+b at xmax form-size ymin WIDTH 10\ntext .teConfigFile |Config File| tagwidth 10 at xmin ymax+1 width 50 is STRING",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm\nbutton .buAdd        |Add|             anchor r+t  at xmax+1           ymin+3             WIDTH 6\ntext   .teConfigFile  |Config File|     anchor l+r+b tagwidth 10 at xmin.frExcelList ymax.frExcelList+1 width 50 is STRING\nbutton .buImport      |Import Data|     anchor r+b  at xmax form-size  ymin               WIDTH 10",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.5 (Form Gadgets); §2.5.2 (Gadget Positioning); §2.5.3 (Docking and Anchoring)",
  "source_codebase": "ramImportExcelProcessor.pmlfrm",
  "pitfalls": ["DOCK и ANCHOR взаимоисключающие — только один на гаджет", "TEXT-гаджет требует is TYPE (STRING/REAL) — определяет тип введённого значения", "Позиционирование относительно другого гаджета: at xmax.other + N ymin.other"],
  "related_ids": ["frm_button_callback", "frm_textinput_read", "frm_list_population", "frm_sensitivity_control"]
}
```

### [frm_button_callback]
```json
{
  "id": "frm_button_callback",
  "category": "forms",
  "subcategory": "button",
  "title": "BUTTON с callback — привязка действия",
  "principle": "Кнопка чаще всего либо вызывает действие, либо показывает дочернюю форму; её callback может вызвать локальный метод, глобальную функцию или объектный метод, и если заданы и callback, и форма — сначала выполнится callback, затем покажется форма.",
  "rule": "button .name |Tag| [linklabel] [toggle] [pixmap] [form !!child] call |action|; для иконки добавлять pixmap и .addPixmap() в конструкторе; toggle хранит BOOLEAN в .val.",
  "syntax": "button .buRefresh |Refresh Log| anchor r+t at xmin+50 ymin WIDTH 10\n!this.buRefresh.callback = |!this.init()|",
  "example_canonical": "-- CB: ramCommonLoggerForm.pmlfrm\nbutton .buRefresh   |Refresh Log|  anchor r+t  at xmin+50  ymin  WIDTH 10\nbutton .buExport    |Export Data|  anchor l+b  at xmin form+1 ymax+0.5 WIDTH 10\nbutton .buClear     |Clear Log|    anchor r+b  at xmax form-size ymin\n...\n!this.buExport.callback = |!this.browseExcel()|",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.7 (Button Gadgets)",
  "source_codebase": "ramCommonLoggerForm.pmlfrm, ramImportExcelProcessor.pmlfrm",
  "pitfalls": ["Если заданы и callback, и form — сначала callback, потом форма", "toggle-кнопка хранит состояние в .val (BOOLEAN)", "pixmap-иконку добавляют через .addPixmap(!!pml.getPathName('icon.png'))"],
  "related_ids": ["frm_callback_syntax", "frm_widget_common_params"]
}
```

### [frm_list_population]
```json
{
  "id": "frm_list_population",
  "category": "forms",
  "subcategory": "list",
  "title": "Заполнение LIST/grid: dtext/rtext, setRows/setHeadings, NETDATASOURCE",
  "principle": "LIST-гаджет показывает ARRAY значений: dtext — отображаемый текст, rtext — скрытое «реальное» значение (часто DBREF.string()), что позволяет показывать имена, а действовать по ссылкам; в современном production-коде вместо LIST используется .NET grid, заполняемый через NETDATASOURCE.",
  "rule": "Классический LIST: присвоить .dtext = !array (и при необходимости .rtext = !refArray); многоколоночный — .setHeadings(!arr) + .setRows(!arr2D); .NET grid: создать NETDATASOURCE(title, headings, data) и .bindToDataSource(!nds).",
  "syntax": "!this.lst.dtext = !values\n!this.lst.rtext = !rtext\n!nds = object NETDATASOURCE('Excel List', !heading, !data)\n!this.gridExcelList.bindToDataSource(!nds)",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm (.NET grid)\n!data    = object ARRAY()\n!this.heading = object ARRAY()\n!this.heading.append('Excel Name')\n!this.heading.append('Is Transpose')\n!this.heading.append('Excel Path')\n!nds = object NETDATASOURCE('Excel List', !this.heading, !data)\n!this.gridExcelList.bindToDataSource(!nds)",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.10 (List Gadgets — dtext/rtext/setRows/setHeadings); §2.18 (NETDATASOURCE, bindToDataSource)",
  "source_codebase": "ramImportExcelProcessor.pmlfrm, ramCommonLoggerForm.pmlfrm",
  "pitfalls": ["dtext — показ, rtext — реальное значение для выборки", "Все значения LIST задаются присвоением ARRAY", "Для .NET grid сначала создать NETGRIDCONTROL и привязать .handle() к container.control"],
  "related_ids": ["frm_widget_common_params", "dn_object_instantiation", "log_form_integration"]
}
```

### [frm_textinput_read]
```json
{
  "id": "frm_textinput_read",
  "category": "forms",
  "subcategory": "text",
  "title": "Чтение значения TEXT-гаджета (.val)",
  "principle": "TEXT-гаджет создаёт переменную того типа, который задан через is TYPE; прочитать введённое значение можно через член .val — и его тип будет соответствовать объявленному, что важно при дальнейшем использовании в PML.",
  "rule": "Объявить text .name ... is STRING|REAL [format !!FMT]; читать введённое через !this.name.val; писать значение — присвоением !this.name.val = ...; для нередактируемого, но выделяемого поля — .setEditable(FALSE)/.editable = false.",
  "syntax": "text .txt1 |Val as String| width 10 is STRING\n!v = !this.txt1.val\n!this.teConfigFile.editable = false",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm, .initiateLoader()\n!configFilePath    = !this.teConfigFile.val\n!isValidConfigPath = !configFilePath.set() AND !configFilePath.neq('')",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.8 (Text Entry Gadgets — WIDTH, TYPE, .val, setEditable)",
  "source_codebase": "ramImportExcelProcessor.pmlfrm",
  "pitfalls": ["Тип .val определяется is TYPE гаджета — REAL-поле вернёт REAL", "Прочитанное значение может быть UNSET — проверяйте .set()", "Нередактируемое (.editable=false) лучше деактивированного, если нужно копировать текст"],
  "related_ids": ["frm_widget_common_params", "dt_unset_handling", "frm_sensitivity_control"]
}
```

### [frm_sensitivity_control]
```json
{
  "id": "frm_sensitivity_control",
  "category": "forms",
  "subcategory": "state",
  "title": "Управление доступностью/видимостью гаджета (.active / .visible / .editable)",
  "principle": "Гаджет — объект с членами состояния, поэтому его можно динамически включать/выключать (.active), скрывать/показывать (.visible) и делать (не)редактируемым (.editable/setEditable) прямо из методов, не переопределяя форму.",
  "rule": "Делать неактивным: !this.gad.active = FALSE; скрывать: !this.gad.visible = FALSE; запрещать ввод, сохраняя выделение: !this.gad.editable = false (или .setEditable(FALSE)).",
  "syntax": "!!exampleCallback.ok.active = FALSE\n!!exampleCallback.cancel.visible = FALSE\n!this.txt6.setEditable(FALSE)",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm\n!this.teConfigFile.editable      = false\n-- CB: ramImportExcelValidationForm.pmlfrm\n!this.gridExcelList.editableGrid(false)",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.5.1 (active/visible — Built-in Members and Methods for Gadgets); §2.8 (setEditable)",
  "source_codebase": "ramImportExcelProcessor.pmlfrm, ramImportExcelValidationForm.pmlfrm",
  "pitfalls": ["Метод .setsens(true/false) в источниках TM-1401/TM-1402/codebase не подтверждён — используйте .active = TRUE/FALSE (NOT_FOUND_IN_SOURCES для .setsens)", "active=FALSE серит и блокирует; editable=false блокирует ввод, но позволяет выделение"],
  "related_ids": ["frm_widget_common_params", "frm_textinput_read"]
}
```

### [frm_form_as_class]
```json
{
  "id": "frm_form_as_class",
  "category": "forms",
  "subcategory": "architecture",
  "title": "Форма как класс: члены-объекты и делегирование логики",
  "principle": "Форма — это объект, поэтому ей можно дать члены любых типов (включая пользовательские объекты) с временем жизни формы; бизнес-логику выносят в эти члены-объекты, а форма лишь координирует — это даёт чистое разделение UI и логики.",
  "rule": "Объявлять member .x is SOMEOBJECT в setup form; создавать их в конструкторе/инициализации; методы формы должны делегировать вычисления членам-объектам, а сами заниматься UI (чтение гаджетов, отображение результата).",
  "syntax": "member .meConfigDetails      is RAMIMPORTEXCELCONFIGLOADER\nmember .meExcelDataProcessor is RAMIMPORTEXCELDATALOADER\nmember .meExcelElementLoader is RAMIMPORTEXCELELEMENTLOADER",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm — форма владеет тремя лоадерами\nmember .meConfigDetails            is RAMIMPORTEXCELCONFIGLOADER\nmember .meExcelDataProcessor       is RAMIMPORTEXCELDATALOADER\nmember .meExcelElementLoader       is RAMIMPORTEXCELELEMENTLOADER\nmember .gridExcelList              is NETGRIDCONTROL\nmember .heading                    is ARRAY\nmember .isReloadNeeded             is BOOLEAN",
  "example_antipattern": "-- вся логика парсинга Excel и создания элементов прямо в методах формы вместо объектов-лоадеров",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.16 (User-Defined Form Members); §2.1 (Forms are Global Objects)",
  "source_codebase": "ramImportExcelProcessor.pmlfrm",
  "pitfalls": ["Члены-объекты живут столько же, сколько форма — удаляются при выгрузке", "Не складывать бизнес-логику в методы формы — делегируйте членам", "Член-объект надо создать (в конструкторе/init), иначе UNSET"],
  "related_ids": ["frm_loader_chain", "ap_form_controller", "obj_delegation_pattern", "frm_initialise_method"]
}
```

### [frm_loader_chain]
```json
{
  "id": "frm_loader_chain",
  "category": "forms",
  "subcategory": "architecture",
  "title": "Цепочка лоадеров: форма владеет ConfigLoader → DataLoader → ElementLoader",
  "principle": "Импорт из Excel разбит на три специализированных объекта: ConfigLoader читает конфигурацию, DataLoader парсит и мапит данные (используя конфиг), ElementLoader создаёт/обновляет элементы PDMS (используя загруженные данные); форма владеет всеми тремя и связывает их, что даёт явный однонаправленный поток данных.",
  "rule": "Объявить три члена-лоадера; в инициализации: загрузить конфиг → передать его DataLoader (setConfigDetail) → DataLoader парсит → передать DataLoader в ElementLoader (setDataLoader) → ElementLoader создаёт элементы; каждый этап логирует результат.",
  "syntax": "!this.meConfigDetails.loadConfigDetails(!configFilePath)\n!this.meExcelDataProcessor.setConfigDetail(!this.meConfigDetails)\n!this.meExcelElementLoader.setDataLoader(!this.meExcelDataProcessor)\n!this.meExcelElementLoader.loadElement()",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm, .initiateLoader() + .importData()\n!this.meConfigDetails.loadConfigDetails(!configFilePath)\n!this.meExcelDataProcessor.clearMappings()\n!this.meExcelDataProcessor.setConfigDetail(!this.meConfigDetails)\n!this.meExcelDataProcessor.loadExcelData(!this.getExcelPathList(), !this.getExcelTransposeList())\n!this.meExcelDataProcessor.initiateMappings()\n...\n!this.meExcelElementLoader.setDataLoader(!this.meExcelDataProcessor)\n!this.meExcelElementLoader.loadElement()",
  "example_antipattern": "-- единый монолитный метод формы, читающий Excel, мапящий и создающий элементы одновременно",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.16 (form members); §3.4 (objects) — архитектурный паттерн из codebase",
  "source_codebase": "ramImportExcelProcessor.pmlfrm, ramImportExcelConfigLoader.pmlobj, ramImportExcelDataLoader.pmlobj, ramImportExcelElementLoader.pmlobj",
  "pitfalls": ["Поток строго однонаправлен: Config → Data → Element", "Перед повторным запуском вызывать clearMappings()/initiateLoader() (флаг isReloadNeeded)", "Каждый лоадер — отдельный объект с одной ответственностью"],
  "related_ids": ["frm_form_as_class", "ap_loader_chain", "ap_form_controller", "obj_delegation_pattern"]
}
```

### [frm_show_dismiss]
```json
{
  "id": "frm_show_dismiss",
  "category": "forms",
  "subcategory": "lifecycle",
  "title": "Показ/скрытие форм; модальность",
  "principle": "Поскольку форма ищется по PMLLIB, её не нужно загружать вручную: show !!formName загружает и показывает за один шаг, а .hide()/.show()/.shown() управляют видимостью уже загруженной формы; режим (dialog/dock/resize) задаётся в строке setup form.",
  "rule": "Показать: show !!formName (или !!formName.show()); скрыть: !!formName.hide(); проверить: !!formName.shown(); загрузить без показа: loadform !!formName; режим окна — параметры строки setup form (dialog, dock left, resizable).",
  "syntax": "show !!exampleForm\n!!gphsettings.show()\n!!gphsettings.hide()\nq var !!gphsettings.shown()\nsetup form !!exampleForm dialog dock left",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm — пункт меню показывает форму логгера\n!control.add('callback',  'Show Logger...',   'show !!RAMCOMMONLOGGERFORM')",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.3.2 (Showing and Hiding Forms); §2.3.3 (Built-in Methods .show()/.hide()/.shown()); §2.3.1 (dialog dock/resizeable)",
  "source_codebase": "ramImportExcelProcessor.pmlfrm",
  "pitfalls": ["Форма с menubar НЕ может быть docked (TM-1402 §2.3.1)", "Форма с OK/Cancel обычно не нуждается в docking", "loadform грузит без показа — для доступа к данным формы"],
  "related_ids": ["frm_initialise_method", "frm_file_structure", "form_menu_bar"]
}
```

---

### Категория: macros

### [mac_file_structure]
```json
{
  "id": "mac_file_structure",
  "category": "macros",
  "subcategory": "structure",
  "title": "Структура файла .pmlmac",
  "principle": "Макрос — это последовательность команд PDMS (и PML2), выполняемых построчно как при вводе в командное окно; в production он служит точкой входа pipeline: объявляет переменные/заголовки, защищает .NET-импорт, выполняет шаги и сохраняет результат.",
  "rule": "Структура production-макроса: комментарий с путём запуска → import + handle → объявление переменных и заголовков → (опц.) ONERROR GOLABEL → шаги обработки → сохранение/вывод; запускается через $m/путь или drag&drop.",
  "syntax": "-- Run path: $m \"...\\macro.pmlmac\"\nimport 'GridControl'\nhandle ANY\nendhandle\n... логика ...",
  "example_canonical": "-- CB: JDE_data-import.pmlmac (начало)\nimport 'GridControl'\nhandle ANY\nendhandle\nimport 'RamPMLExcelReader'\nhandle any\nendhandle\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.1 (A Simple Macro); §2.1.1; §2.9",
  "source_codebase": "JDE_data-import.pmlmac, JDE_tagProperties_export.pmlmac, JDE_routine-macro-run.pmlmac",
  "pitfalls": ["Макрос выполняется построчно как команды — PML2 тоже работает", "Рекомендуется писать новые рутины как функции, а не макросы (TM-1401 §2.9)", "PML1 макросы лежат под PDMSUI, PML2 файлы — под PMLLIB"],
  "related_ids": ["mac_arguments", "mac_pipeline_pattern", "eh_import_protection", "obj_namespace_loading"]
}
```

### [mac_arguments]
```json
{
  "id": "mac_arguments",
  "category": "macros",
  "subcategory": "arguments",
  "title": "Аргументы макроса $1..$9 и значения по умолчанию $d",
  "principle": "Параметризованный макрос получает до 9 аргументов через пробел ($1..$9), что делает его гибким; если при drag&drop аргументы не переданы, без значений по умолчанию ($d1=...) макрос упадёт — поэтому defaults задают в начале.",
  "rule": "Использовать $1..$9 в теле; задавать умолчания в начале $d1=..., $d2=...; одиночную строку с пробелами как один аргумент передавать в $< ... $>.",
  "syntax": "$d1=HandWheel\n$d2=500\nNEW EQUIP /$1\nXLEN $2 YLEN $3 ZLEN $4",
  "example_canonical": "-- CB/PDF: JDE_*.mac используют именованные переменные вместо $1..$9; синтаксис $1/$d — из TM-1401\n$d1=HandWheel\n$d2=500\nNEW EQUIPMENT /$1\nNEW SUBE /$1-Centre",
  "example_antipattern": "$M/path.mac    $* без аргументов и без $d-умолчаний параметры UNSET → ошибка",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.4 (Parameterised Macros — $1..$9, $d=, $< $>)",
  "source_codebase": "JDE_tagProperties_export.pmlmac (Appendix B-style $d/$1 в TM-1401)",
  "pitfalls": ["До 9 аргументов через пробел", "Строка с пробелами как один аргумент — $<...$>", "Production-макросы codebase чаще хардкодят пути/переменные, чем используют $1..$9"],
  "related_ids": ["mac_file_structure", "mac_calling_other_macros", "dt_string_substitution"]
}
```

### [mac_calling_other_macros]
```json
{
  "id": "mac_calling_other_macros",
  "category": "macros",
  "subcategory": "composition",
  "title": "Вызов макроса из макроса ($M) и вызов функций",
  "principle": "Макрос может вызывать другой макрос через $M/путь, передавая аргументы; в современном codebase оркестрация чаще делается вызовом глобальных функций (!!func(...)) из управляющего макроса — функции предзагружены через PMLLIB и принимают типизированные аргументы.",
  "rule": "Вызов макроса: $M/полный_путь арг1 арг2; вызов функции из макроса: !result = !!functionName(args); управляющий «routine»-макрос последовательно вызывает шаги-функции и логирует.",
  "syntax": "$M/%PDMSUI%\\examples\\parameterMac.mac ABCDE 300 400 600\n!issueData = !!createObjectsFromExcelSheet(!fileName, !sheetName, ...)",
  "example_canonical": "-- CB: JDE_routine-macro-run.pmlmac — оркестрация шагов вызовами функций\n$P --- STEP 3: UPDATE CLASS NAME AS PER SHELL RDL MAPPING  ---\n!!jacUpdateClassDetails(!rdlMasterFile, |Class-mapping|, |NA|, |...filter...|, |...|, true)\n$P --- STEP 5: UPDATE TAG NAME ---\n!!jacUpdateTagName(|NAMN|, |:TagName|, !replaceArray, |...filter...|, true)",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.1 ($m/FILENAME); §3.4; §4.1 (functions preloaded through PMLLIB)",
  "source_codebase": "JDE_routine-macro-run.pmlmac, JDE_data-import.pmlmac",
  "pitfalls": ["$M требует путь к файлу; функция вызывается по имени без пути (PMLLIB)", "Routine-макрос — оркестратор: шаги-функции + логирование + ONERROR GOLABEL"],
  "related_ids": ["mac_pipeline_pattern", "ap_pipeline_macro", "fnc_definition_syntax", "mac_output_control"]
}
```

### [mac_output_control]
```json
{
  "id": "mac_output_control",
  "category": "macros",
  "subcategory": "output",
  "title": "Управление выводом: $p (печать) и $* (комментарий/подавление)",
  "principle": "Директива $p выводит строку в командное окно (полезно как трассировка шагов pipeline), а $* начинает комментарий до конца строки; в сочетании с $!подстановкой $p даёт информативные сообщения о ходе работы.",
  "rule": "Печать/эхо в командное окно: $P текст $!переменная; комментарий в конце строки: $*; строка-комментарий: -- в начале; блок-комментарий: $( ... $).",
  "syntax": "$P --- STEP 1: DELETE UNTAGGED ITEMS  ---\n!!answer = 42   $* комментарий в конце строки",
  "example_canonical": "-- CB: JDE_routine-macro-run.pmlmac\n$P --- START ROUTINE PROCESSING ---\n$P --- STEP 1: DELETE UNTAGGED ITEMS  ---\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.deleteUnnamedTags()",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.9 ($* end-of-line comment, -- line comment, $( $) block comment); §2.5 ($p)",
  "source_codebase": "JDE_routine-macro-run.pmlmac, createObjectsFromExcelSheet.pmlfnc ($P)",
  "pitfalls": ["Три вида комментариев: -- (строка), $* (конец строки), $( $) (блок)", "$p печатает в командное окно — для прогресса используют !!displayProgress/!!fmsys.SETPROGRESS"],
  "related_ids": ["mac_file_structure", "log_output_targets", "dt_string_substitution"]
}
```

### [mac_file_path_pattern]
```json
{
  "id": "mac_file_path_pattern",
  "category": "macros",
  "subcategory": "filesystem",
  "title": "Имя файла с датой/временем через DATETIME + $!<...>",
  "principle": "Экспортные макросы формируют уникальное имя выходного файла, встраивая компоненты текущей даты/времени; их получают из объекта DATETIME и форматируют (string('I2') для двух цифр), а затем подставляют в путь через $!<выражение>, чтобы метод-точка раскрылась корректно.",
  "rule": "Создать !dt = object DATETIME(); извлечь .year()/.month()/.date()/.hour()/.minute(); форматировать целые через .string('I2'); собрать путь со вставками $!<year> и т.д.; затем сохранить через .saveGridToExcel или FILE.writeFile.",
  "syntax": "!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')\n!path = |...extract_$!<year>-$!<month>-$!<date>-$!<hour>.xlsx|",
  "example_canonical": "-- CB: JDE_tagProperties_export.pmlmac\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')\n!date = !dt.date().string('I2')\n!hour = !dt.hour().string('I2')\n!minute = !dt.minute().string('I2')\n!publishPath = |C:\\...\\TagPropertyValue_extract_$!<year>-$!<month>-$!<date>-$!<hour>.xlsx|",
  "example_antipattern": "!path = |report_$!dt.year().xlsx|   $* метод-точка не раскроется без $!<dt.year()>",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.3 ($ expansion); §6.1 (DATETIME among built-in objects)",
  "source_codebase": "JDE_tagProperties_export.pmlmac, JDE_data-import.pmlmac",
  "pitfalls": ["Метод-точка в подстановке требует $!<...>", "Двузначный формат — .string('I2')", "Обратные слэши в путях Windows безопасны внутри | |"],
  "related_ids": ["dt_string_substitution", "dn_file_write_pattern", "mac_pipeline_pattern"]
}
```

### [mac_pipeline_pattern]
```json
{
  "id": "mac_pipeline_pattern",
  "category": "macros",
  "subcategory": "pipeline",
  "title": "Макрос как ETL-pipeline (серия JDE/EIS/EBE)",
  "principle": "Серии JDE/EIS/EBE — это однонаправленные ETL-конвейеры: каждый макрос выполняет одну фазу (import данных / export свойств / RDL-mapping / создание view) и обычно следует схеме «собрать → обработать в цикле → сохранить/применить», логируя ход через общий логгер.",
  "rule": "Один макрос = одна фаза pipeline; внутри: настроить логгер/заголовки → собрать данные (COLL ... / COLLECTION) → цикл обработки с прогрессом → запись результата (Excel/файл) или применение к БД; управляющий routine-макрос вызывает фазы по порядку.",
  "syntax": "var !tags COLL ALL (ENGITEM) WITH (...)\ndo !tagString values !tags\n  ... сбор строки ...\n  !dataList.append(!tagDataRow)\nenddo\n!dataTable.saveGridToExcel(|$!publishPath|, |data|)",
  "example_canonical": "-- CB: JDE_tagProperties_export.pmlmac (фаза export)\nvar !tags COLL ALL (ENGITEM) WITH (:TagStatus eq |ACTIVE| and ISNAMED and NOT(EMPTY(:RAMTAGOWNER)) and :RAMTAGOWNER eq |LEIR|)\ndo !tagString values !tags\n  !idx = !idx + 1\n  !tagRef = !tagString.dbref()\n  !!displayProgress(!tagIdx, !tags.size())\n  ...\nenddo\n!source = object NETDATASOURCE('data', !headerList, !dataList)\n!dataTable.BindToDataSource(!source)\n!dataTable.saveGridToExcel(|$!publishPath|, |data|)",
  "example_antipattern": "-- один макрос, который и импортирует, и экспортирует, и мапит RDL — нарушает разделение фаз",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §5 (Collections) — основа сбора; паттерн pipeline из codebase",
  "source_codebase": "JDE_data-import.pmlmac, JDE_tagProperties_export.pmlmac, EIS_data_export.pmlmac, EBE_full_tag_export.pmlmac, JDE_routine-macro-run.pmlmac",
  "pitfalls": ["Одна фаза на макрос — не смешивать import/export", "Прогресс на внешнем цикле через !!displayProgress", "Логирование старта/итогов через !!ramCommonLogger"],
  "related_ids": ["ap_pipeline_macro", "mac_calling_other_macros", "mac_file_path_pattern", "log_common_logger_api"]
}
```

### [mac_global_variables]
```json
{
  "id": "mac_global_variables",
  "category": "macros",
  "subcategory": "state",
  "title": "Передача данных между макросами через !!global",
  "principle": "Глобальные переменные (!!var) живут всю сессию PDMS и видны из любой PML-рутины, поэтому служат каналом передачи общего состояния между фазами pipeline; типичный пример — единый логгер !!ramCommonLogger, создаваемый один раз и наполняемый всеми шагами.",
  "rule": "Создавать общий глобал лениво через undefined()-guard; наполнять из разных макросов/функций; помнить, что глобал не очищается между запусками — при необходимости пересоздавать (object ...()) в начале управляющего макроса.",
  "syntax": "if(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif",
  "example_canonical": "-- CB: JDE_routine-macro-run.pmlmac — общий логгер на весь прогон\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n!headings = |Tag Name;Attribute Name;Error Text|\n!!ramCommonLogger.addHeading(!headings.split(|;|))",
  "example_antipattern": "-- использование !!ramCommonLogger в новой сессии без проверки undefined() и без пересоздания → старые/отсутствующие данные",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.3.1 (Local vs Global variables, !!global); §2.3.4 (special global objects)",
  "source_codebase": "JDE_routine-macro-run.pmlmac, все функции codebase (undefined()-guard)",
  "pitfalls": ["!!global не очищается между запусками — возможна утечка состояния", "Пересоздавайте логгер в начале routine-макроса или используйте undefined()-guard", "Стандартные глобалы (!!CE, !!ERROR, !!ALERT) не удалять"],
  "related_ids": ["cf_guard_clause", "log_common_logger_api", "ce_typical_error_global_not_cleared"]
}
```

---

### Категория: functions

### [fnc_definition_syntax]
```json
{
  "id": "fnc_definition_syntax",
  "category": "functions",
  "subcategory": "definition",
  "title": "Синтаксис define function",
  "principle": "Функция — это глобальный метод в собственном файле, предзагружаемый через PMLLIB; её сигнатура объявляет типы аргументов и (для возвращающей) тип результата в конце строки define, что обеспечивает проверку типов и предзагрузку.",
  "rule": "define function !!name(!arg is TYPE, ...) [is RETTYPE]; имя функции = имя файла (.pmlfnc) с !!; тело — построчно как в макросе; завершать endfunction; функция без is TYPE — процедура (без возврата значения).",
  "syntax": "define function !!area(!radius is REAL) is REAL\n  !circleArea = !radius.power(2) * 3.142\n  return !circleArea\nendfunction",
  "example_canonical": "-- CB: createObjectsFromExcelSheet.pmlfnc\ndefine function !!createObjectsFromExcelSheet(!excelFullPath is STRING, !sheetName is STRING, !isTranspose is BOOLEAN, !columns is ARRAY, !isCreate is BOOLEAN, !forceUpdate is BOOLEAN, !arrayAppend is BOOLEAN, !isEXfile is BOOLEAN, !exAttributesData is ARRAY) is ARRAY\n  ...\n  return !issueData\nendfunction",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §4.2 (Creating a PML Function); §2.4; §4.3 (procedures — no is TYPE)",
  "source_codebase": "createObjectsFromExcelSheet.pmlfnc, jacExportRDLDataReport.pmlfnc, ramGetBackRef.pmlfnc",
  "pitfalls": ["Имя файла должно совпадать с именем функции", "ANY-аргумент отключает проверку типов — применять осознанно (TM-1401 §2.4.1)", "Функции предпочтительнее макросов для новой логики"],
  "related_ids": ["fnc_return_value", "fnc_argument_scope", "mac_calling_other_macros"]
}
```

### [fnc_return_value]
```json
{
  "id": "fnc_return_value",
  "category": "functions",
  "subcategory": "return",
  "title": "Возврат значения функции",
  "principle": "Функция возвращает значение командой return, а тип результата объявлен в сигнатуре (is TYPE); метод-функция объекта возвращает аналогично — это позволяет использовать вызов прямо в выражениях.",
  "rule": "Объявить is TYPE в сигнатуре; присвоить результат локальной переменной; завершить return !result; для раннего выхода вернуть уже накопленное значение; процедура (без is TYPE) ничего не возвращает.",
  "syntax": "define method .GetTotal() is REAL\n  !result = REAL()\n  !result = !this.L0 + !this.L1 + ...\n  return !result\nendmethod",
  "example_canonical": "-- CB: RAMTagMaturityData.pmlobj\ndefine method .GetTotal() is REAL\n  !result = REAL()\n  !result = !this.L0 + !this.L1 + !this.L2 + !this.L3 + !this.L4 + !this.L5 + !this.L6 + !this.L7 + !this.L8\n  return !result\nendmethod",
  "example_antipattern": "define function !!f() is REAL\n  !x = 5   $* нет return — функция вернёт UNSET",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §4.2 (return keyword, define function ... is TYPE)",
  "source_codebase": "RAMTagMaturityData.pmlobj, ramGetBackRef.pmlfnc, ramValueConverter.pmlobj",
  "pitfalls": ["is TYPE без return → UNSET", "Тип return должен совпадать с объявленным is TYPE", "Метод концатенации работает, если return подходящего типа (TM-1401 §4.5.2)"],
  "related_ids": ["fnc_definition_syntax", "cf_return_from_function", "fnc_array_accumulator"]
}
```

### [fnc_argument_scope]
```json
{
  "id": "fnc_argument_scope",
  "category": "functions",
  "subcategory": "scope",
  "title": "Аргументы локальны (pass by value)",
  "principle": "Аргументы функции/метода становятся локальными переменными внутри тела; изменение аргумента не затрагивает внешнюю переменную вызывающего (pass by value), поэтому для возврата изменённых данных нужно вернуть их через return.",
  "rule": "Внутри функции считать аргументы локальными копиями; чтобы отдать результат — использовать return (или, в методе, изменять члены через !this); для глобального эффекта — обращаться к !!global явно (как в процедурах над !!CE).",
  "syntax": "define function !!area( !length is REAL, !width is REAL) is REAL\n  !area = !length * !width\n  return !area\nendfunction",
  "example_canonical": "-- CB: ramGetBackRef.pmlfnc — аргументы используются локально, результат через return\ndefine function !!ramGetBackRef(!element is STRING, !backAttribute is STRING, !attribute is STRING) is STRING\n  !result = object STRING()\n  var !backRefElement BACKREF(attname $!backAttribute) of $!element\n  var !result $!attribute of $!backRefElement\n  return !result\nendfunction",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §2.4 (Arguments become local variables within the function/method)",
  "source_codebase": "ramGetBackRef.pmlfnc",
  "pitfalls": ["Изменение аргумента не видно вызывающему", "Для побочного эффекта на БД процедуры пишут через !!CE/DBREF, а не через аргументы", "ANY-аргумент не проверяется на тип"],
  "related_ids": ["fnc_return_value", "fnc_definition_syntax", "mac_global_variables"]
}
```

### [fnc_pdms_navigation]
```json
{
  "id": "fnc_pdms_navigation",
  "category": "functions",
  "subcategory": "navigation",
  "title": "Навигация по иерархии PDMS внутри функции",
  "principle": "Функции отчётов/обновления обходят дерево PDMS: собирают элементы COLLECTION-объектом по типу+фильтру, затем для каждого читают атрибуты и связанные элементы (по reference-атрибутам, .owner), поднимаясь по иерархии до нужного типа.",
  "rule": "Собрать набор: object COLLECTION() → .type('ENGITE') → .filter(EXPRESSION) → .results(); обходить через do !i indices; читать reference-атрибут как DBREF и проверять .badref(); подниматься циклом до нужного типа через .owner.",
  "syntax": "!collection = object COLLECTION()\n!collection.type('ENGITE')\n!expression = object EXPRESSION(!filter)\n!collection.filter(!expression)\n!tags = !collection.results()",
  "example_canonical": "-- CB: jacPropagateParentData.pmlfnc — обход и переход по reference-атрибуту\n!tags = !collection.results()\ndo !i indices !tags\n  !childRefe         = !tags[!i]\n  !parentElementRefe = !childRefe.attribute(!relationAttName)\n  if(!parentElementRefe.badref().not()) then\n    do !attToPropagate values !attListToPropagate\n      ...\n    enddo\n  endif\nenddo",
  "example_antipattern": "!parent = !ref.attribute(!rel)\n!val = !parent.attribute(!a)   $* без !parent.badref().not() — ошибка на битой ссылке",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §4.6 (!!CE navigation: .owner, .hpos); §5 (COLLECT); TM-1402 §4.3 (COLLECTION object)",
  "source_codebase": "jacPropagateParentData.pmlfnc, jacExportRDLDataReport.pmlfnc, ramGetBackRef.pmlfnc",
  "pitfalls": ["Reference-атрибут может быть badref — всегда проверять перед разыменованием", "COLLECTION.scope() принимает DBREF; .filter() — EXPRESSION-объект", "Подъём по иерархии — цикл с .owner и break по типу"],
  "related_ids": ["pdms_navigation_commands", "pdms_dbref_resolve", "fnc_array_accumulator", "cf_nested_loops"]
}
```

### [fnc_array_accumulator]
```json
{
  "id": "fnc_array_accumulator",
  "category": "functions",
  "subcategory": "accumulator",
  "title": "Накопление результатов в ARRAY и возврат",
  "principle": "Функции отчётов накапливают результат построчно в локальный ARRAY (часто — массив массивов: строки таблицы), добавляя элементы в цикле через .append()/.appendArray(), и возвращают его — это устойчивый способ собрать табличный результат за один проход.",
  "rule": "Инициализировать !result = object ARRAY() (или ARRAY()); в цикле формировать строку (!row = ARRAY(); !row.append(...)) и !result.append(!row); по завершении return !result; для уникализации — .sortUnique().",
  "syntax": "!issueData = ARRAY()\n...\n!issueData.append(!msg.split(|;|))\nreturn !issueData",
  "example_canonical": "-- CB: JDE_tagProperties_export.pmlmac — накопление строк таблицы\n!tagDataRow = ARRAY()\n!tagDataRow.append(!tagRef.namn)\n!tagDataRow.append(!tagRef.:RAMTAGOWNER)\n!tagDataRow.append(!tagRef.:TagStatus)\n...\n!dataList.append(!tagDataRow)",
  "example_antipattern": "!result.append(!x)   $* без предварительного !result = object ARRAY() append упадёт на UNSET",
  "source_doc": "TM-1401 Macros and Functions Rev 2.0, §3.8 (Arrays); §4.5.1 (.size(), array methods); §5.2 (EVALUATE → ARRAY)",
  "source_codebase": "JDE_tagProperties_export.pmlmac, createObjectsFromExcelSheet.pmlfnc, jacExportRDLDataReport.pmlfnc",
  "pitfalls": ["Инициализировать массив до append()", "Массив строк-таблиц — это ARRAY of ARRAY", "Уникализация результата — .sortUnique()/.unique()"],
  "related_ids": ["dt_array_declaration", "fnc_return_value", "fnc_pdms_navigation", "mac_pipeline_pattern"]
}
```

---

### Категория: dotnet_interop

### [dn_import_statement]
```json
{
  "id": "dn_import_statement",
  "category": "dotnet_interop",
  "subcategory": "import",
  "title": "import 'Namespace.ClassName'",
  "principle": "PML.NET позволяет включать .NET-объекты и вызывать их методы из PML; перед использованием контрол/сборку надо загрузить командой import, а пространство имён открыть через using namespace — иначе тип будет неизвестен.",
  "rule": "import 'AssemblyOrClassName' (в начале файла, обязательно в handle any/endhandle); открыть пространство имён using namespace 'X' (для .NET) перед созданием экземпляра; затем object NETTYPE().",
  "syntax": "import 'GridControl'\nhandle any\nendhandle\nusing namespace 'Aveva.Core.Presentation'",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm (начало)\nimport 'GridControl'\nhandle any\nendhandle\nImport 'pmlfilebrowser'\nhandle any\nendhandle\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\nusing namespace 'Aveva.Core.Presentation'",
  "example_antipattern": "import 'GridControl'   $* без handle any/endhandle — отсутствие сборки прервёт загрузку файла",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.18 (PML.NET Grid Control — IMPORT, using namespace, object NETGRIDCONTROL())",
  "source_codebase": "ramImportExcelProcessor.pmlfrm, ramExcelReaderClass.pmlobj, ramFileWriterClass.pmlobj",
  "pitfalls": ["Каждый import оборачивать handle any/endhandle (см. dn_import_guard)", "using namespace нужен перед созданием экземпляра .NET-типа", "Встречается и import, и Import (регистр не важен)"],
  "related_ids": ["dn_import_guard", "eh_import_protection", "dn_object_instantiation"]
}
```

### [dn_import_guard]
```json
{
  "id": "dn_import_guard",
  "category": "dotnet_interop",
  "subcategory": "safety",
  "title": "import всегда обёрнут в handle any / endhandle (ОБЯЗАТЕЛЬНО)",
  "principle": "Загрузка .NET-сборки может завершиться ошибкой (нет DLL, уже загружено, конфликт версий); такая ошибка без перехвата прервёт загрузку всего файла объекта/формы/функции — поэтому обёртка handle any вокруг каждого import является обязательной идиомой production-кода.",
  "rule": "Каждый import немедленно сопровождать handle any / endhandle (тело может быть пустым); ставить эти блоки до define object/setup form/define function.",
  "syntax": "import 'RamAEPMLExcelReader'\nhandle any\nendhandle",
  "example_canonical": "-- CB: ramExcelReaderClass.pmlobj\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\n\ndefine object RAMEXCELREADERCLASS\n  member .excelTables  is ARRAY\nendobject",
  "example_antipattern": "import 'RamAEPMLExcelReader'\ndefine object RAMEXCELREADERCLASS   $* БЕЗ guard — при отсутствии сборки объект не загрузится вовсе",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.18 (IMPORT); TM-1401 M&F §3.13.2 (HANDLE ANY)",
  "source_codebase": "ramExcelReaderClass.pmlobj, ramFileWriterClass.pmlobj, ramImportExcelConfigLoader.pmlobj, createObjectsFromExcelSheet.pmlfnc, jacExportRDLDataReport.pmlfnc, LoopData.pmlobj, все JDE_*.pmlmac",
  "pitfalls": ["Это самая частая забытая защита — приводит к 'object not found'", "Несколько import → каждый со своим handle/endhandle", "Тело handle можно оставить пустым"],
  "related_ids": ["eh_import_protection", "dn_import_statement", "eh_handle_any"]
}
```

### [dn_object_instantiation]
```json
{
  "id": "dn_object_instantiation",
  "category": "dotnet_interop",
  "subcategory": "instantiation",
  "title": "Создание экземпляра .NET-объекта из PML",
  "principle": "После import+using namespace .NET-тип создаётся той же конструкцией object TYPE(), что и обычный PML-объект; полученный экземпляр хранит .NET-объект, методы которого вызываются как PML-методы.",
  "rule": "Открыть using namespace 'X'; создать !obj = object NETTYPE([args]); далее вызывать его .NET-методы как PML-методы (.ReadExcel(), .show(), .handle()).",
  "syntax": "using namespace 'RamAEPMLExcelReader'\n!excelReader = object RamPMLExcelReaderClass()",
  "example_canonical": "-- CB: ramExcelReaderClass.pmlobj, .loadExcelData()\nusing namespace 'RamAEPMLExcelReader'\n!excelReader       = object RamPMLExcelReaderClass()\n!error = !excelReader.error()\nif(!error.set() AND !error.neq('')) then\n  !isError = true\n  !this.addErrorToList(!error)\nendif\n!this.excelTables  = !excelReader.ReadExcel(!excelFullPath)",
  "example_antipattern": "!r = object RamPMLExcelReaderClass()   $* без предшествующего using namespace тип не разрешится",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.18 (object NETGRIDCONTROL(), object NETDATASOURCE(...))",
  "source_codebase": "ramExcelReaderClass.pmlobj, ramImportExcelConfigLoader.pmlobj, ramTagManagement.pmlobj",
  "pitfalls": ["using namespace должен предшествовать созданию", "После создания методы .NET-объекта вызываются как обычные PML-методы", "Проверяйте .error() контрола сразу после создания"],
  "related_ids": ["dn_import_statement", "dn_method_call", "dn_excel_read_pattern"]
}
```

### [dn_method_call]
```json
{
  "id": "dn_method_call",
  "category": "dotnet_interop",
  "subcategory": "method_call",
  "title": "Вызов .NET-метода; передача аргументов PML→.NET",
  "principle": "Методы .NET-объекта вызываются точечной нотацией, а аргументы передаются как обычные PML-значения — фреймворк маппит типы (PML STRING → .NET string, REAL → double, BOOLEAN → bool); рискованный вызов оборачивают в handle.",
  "rule": "Вызывать !obj.Method(args) с PML-значениями; для возвращающих методов присваивать результат; рискованные .NET-вызовы оборачивать handle any; проверять полученные .NET-ошибки (GetErrorDetails()/.error()).",
  "syntax": "!excelData = !excelReader.ReadExcel(!excelFullPath, !sheetName)\n!fileBrowser.show(!directory, !seedFile, !title, false, !extensionString, 2)",
  "example_canonical": "-- CB: ramTagManagement.pmlobj, .createElement() — вызовы .NET CREATEELEMENT\n!elementNet = object CREATEELEMENT()\n!elementNet.SetElementTypeByName(|$!<type>|)\nhandle any\n  !this.addErrorToList(!name, 'NAME', !!error.text)\nelsehandle none\n  !elementNet.AddAttributeValue(|NAME|, !validName)\n  !elementNet.ExecuteSync()\n  !errors = !elementNet.GetErrorDetails()\nendhandle",
  "example_antipattern": "!elementNet.ExecuteSync()   $* без handle: ошибка .NET прервёт всю операцию без записи в лог",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.18 (вызовы методов .NET grid: bindToDataSource, saveGridToExcel и т.д.)",
  "source_codebase": "ramTagManagement.pmlobj, ramExcelReaderClass.pmlobj, ramFileWriterClass.pmlobj",
  "pitfalls": ["Любой .NET-вызов может бросить исключение — оборачивайте критичные в handle any", "Проверяйте .NET-ошибки через GetErrorDetails()/.error()", "Строковый тип элемента подставляйте через |$!<type>|"],
  "related_ids": ["dn_object_instantiation", "dn_type_mapping", "eh_nested_handle", "pdms_element_create"]
}
```

### [dn_type_mapping]
```json
{
  "id": "dn_type_mapping",
  "category": "dotnet_interop",
  "subcategory": "types",
  "title": "Маппинг типов PML ↔ .NET и DB↔PML",
  "principle": "При обмене с .NET и при чтении из БД типы приводятся по фиксированной схеме; ramValueConverter инкапсулирует именно это сопоставление DB-типов в обобщённые PML-типы, что позволяет писать типонезависимый код конвертации.",
  "rule": "Знать схему DB→PML: INTEGER/REAL→REAL, WORD/TEXT→STRING, LOGICAL→BOOLEAN, REFERENCE→DBREF; для PML↔.NET — STRING↔string, REAL↔double, BOOLEAN↔bool; целевой тип получать из строки и создавать через object $!type().",
  "syntax": "if(!dbType INSET('INTEGER', 'REAL')) then\n  !type = 'REAL'\nelseif(!dbType INSET('WORD', 'TEXT')) then\n  !type = 'STRING'\n...",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .convertDBTypeToType()\nif(!dbType INSET('INTEGER', 'REAL')) then\n  !type = 'REAL'\nelseif(!dbType INSET('WORD', 'TEXT')) then\n  !type = 'STRING'\nelseif(!dbType INSET('LOGICAL')) then\n  !type = 'BOOLEAN'\nelseif(!dbType INSET('REFERENCE')) then\n  !type = 'DBREF'\nendif",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.18 (PML.NET data exchange) — основа; конкретная схема DB→PML из codebase",
  "source_codebase": "ramValueConverter.pmlobj",
  "pitfalls": ["DB-тип REFERENCE → PML DBREF (а не STRING)", "LOGICAL → BOOLEAN (три состояния)", "Один и тот же конвертер используют riders/loaders — не дублировать схему"],
  "related_ids": ["tc_db_to_pml_mapping", "obj_factory_pattern", "dt_dbref_usage", "dn_method_call"]
}
```

### [dn_excel_read_pattern]
```json
{
  "id": "dn_excel_read_pattern",
  "category": "dotnet_interop",
  "subcategory": "excel",
  "title": "Полный паттерн чтения Excel через .NET",
  "principle": "Чтение Excel инкапсулировано в объект-обёртку (ramExcelReaderClass), который через .NET-ридер открывает файл, читает книгу/лист в массив таблиц и сразу проверяет .error() — это изолирует хрупкий .NET-вызов от остального кода и даёт единую точку обработки ошибок.",
  "rule": "import 'RamAEPMLExcelReader' + handle; using namespace; создать ридер; вызвать .ReadExcel(path) (вся книга) или .ReadExcel(path, sheet) (один лист); проверить .error(); результат — ARRAY таблиц (по листам).",
  "syntax": "using namespace 'RamAEPMLExcelReader'\n!excelReader = object RamPMLExcelReaderClass()\n!this.excelTables = !excelReader.ReadExcel(!excelFullPath)\n!error = !excelReader.error()",
  "example_canonical": "-- CB: ramExcelReaderClass.pmlobj, .loadExcelData()\n!this.clearData()\n!isError = false\nusing namespace 'RamAEPMLExcelReader'\n!excelReader       = object RamPMLExcelReaderClass()\n!error = !excelReader.error()\nif(!error.set() AND !error.neq('')) then\n  !isError = true\n  !this.addErrorToList(!error)\nendif\n!this.excelTables  = !excelReader.ReadExcel(!excelFullPath)\nreturn !isError",
  "example_antipattern": "-- прямой вызов .NET-ридера в каждом макросе без объекта-обёртки и без проверки .error()",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.18 (PML.NET); §3.3 (FILE object — альтернатива для текстовых файлов)",
  "source_codebase": "ramExcelReaderClass.pmlobj, ramImportExcelConfigLoader.pmlobj, createObjectsFromExcelSheet.pmlfnc",
  "pitfalls": ["Всегда проверять .error() ридера", "Результат — ARRAY таблиц: [имя_листа, данные]", "Имена листов искать через .findFirst(|sheet-name|)"],
  "related_ids": ["dn_object_instantiation", "dn_import_guard", "ap_loader_chain", "frm_list_population"]
}
```

### [dn_file_write_pattern]
```json
{
  "id": "dn_file_write_pattern",
  "category": "dotnet_interop",
  "subcategory": "file_write",
  "title": "Запись файла (FILE.writeFile / saveGridToExcel)",
  "principle": "Для записи результатов используется либо PML-объект FILE (текст/CSV: преобразовать данные в массив строк и записать одной операцией), либо .NET grid-метод .saveGridToExcel() (для .xlsx); ramFileWriterClass инкапсулирует текстовый экспорт с разделителем.",
  "rule": "Текст/CSV: собрать ARRAY строк (строки через разделитель), !file = object FILE(!path), !file.writeFile('OVERW', !rows); Excel: привязать данные к NETGRIDCONTROL через NETDATASOURCE и вызвать .saveGridToExcel(path, sheet).",
  "syntax": "!file = object FILE(!path)\n!file.writeFile('OVERW', !textDataFormat)\n-- или для Excel:\n!dataTable.saveGridToExcel(|$!publishPath|, |data|)",
  "example_canonical": "-- CB: ramFileWriterClass.pmlobj — текстовый экспорт через FILE\n!file             = object FILE(!path)\n!file.writeFile('OVERW', !textDataFormat)\n-- CB: JDE_tagProperties_export.pmlmac — экспорт в Excel через .NET grid\n!dataTable = object NETGRIDCONTROL()\n!source = object NETDATASOURCE('data', !headerList, !dataList)\n!dataTable.BindToDataSource(!source)\n!dataTable.saveGridToExcel(|$!publishPath|, |data|)",
  "example_antipattern": "-- построчная запись каждой ячейки отдельным writeRecord вместо подготовки массива строк и одной writeFile",
  "source_doc": "TM-1402 Form Design Rev 1.0, §3.3 (FILE Object — open/writeRecord/writeFile, OVERWRITE/APPEND); §2.18 (saveGridToExcel)",
  "source_codebase": "ramFileWriterClass.pmlobj, JDE_tagProperties_export.pmlmac, RAMBiReportExport.pmlfnc",
  "pitfalls": ["writeFile принимает режим ('WRITE'/'OVERWRITE'/'APPEND'; в codebase встречается 'OVERW')", "Excel-экспорт идёт через .NET grid, не через FILE", "Имя файла часто с датой — см. mac_file_path_pattern"],
  "related_ids": ["mac_file_path_pattern", "dn_excel_read_pattern", "log_output_targets", "dt_string_substitution"]
}
```

---

### Категория: pdms_interaction

#### [pdms_current_element]
```json
{
  "id": "pdms_current_element",
  "category": "pdms_interaction",
  "subcategory": "navigation",
  "title": "CE (Current Element) — точка отсчёта навигации",
  "principle": "Все команды навигации и запросов атрибутов в PDMS работают относительно Current Element (CE) — текущей позиции в дереве проекта. Смена CE определяет контекст операций, поэтому код обязан знать, где находится CE перед запросом.",
  "rule": "Используйте команду TAGS (перейти к корню Tags) или прямой переход по имени/DBREF, чтобы установить CE. CE является неявным контекстом для `q att`, навигации (up/first/next) и COLL ALL.",
  "syntax": "TAGS\n-- или\n$!elementRef\n-- устанавливает CE на элемент, на который указывает DBREF",
  "example_canonical": "-- CB: JDE_routine-macro-run.pmlmac — первая строка pipeline\nTAGS\n\nONERROR GOLABEL /Error\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n-- ... далее все операции идут от TAGS как корня",
  "example_antipattern": "-- выполнение операций с атрибутами без проверки/установки CE:\nq att :TagStatus\n-- ошибка: если CE не установлен на нужный элемент, вернёт атрибут произвольного текущего элемента",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §7.2 (Current Element, CE); TM-1401 PML Macros Rev 2.0, §3 (PDMS Navigation)",
  "source_codebase": "JDE_routine-macro-run.pmlmac, JDE_data-import.pmlmac",
  "pitfalls": ["CE — глобальное состояние: любая команда навигации меняет его для всей сессии", "После вызова функции/макроса CE может сдвинуться — восстанавливать при необходимости", "TAGS — это PDMS-команда перехода к корневому элементу тегов, не PML-ключевое слово"],
  "related_ids": ["pdms_navigation_commands", "pdms_attribute_query", "cf_guard_clause"]
}
```

#### [pdms_navigation_commands]
```json
{
  "id": "pdms_navigation_commands",
  "category": "pdms_interaction",
  "subcategory": "navigation",
  "title": "Навигация по иерархии: members, owner, deslnk",
  "principle": "Дерево PDMS обходится через иерархические ссылки: .members (дочерние), owner (родитель), deslnk (ссылка на design-элемент). Навигация через `var ... FOR` / `EVAL ... FOR ALL ... FOR` позволяет собирать данные по ветке дерева без ручного обхода.",
  "rule": "Используйте `var !list EVAL (EXPRESSION) FOR ALL (TYPE) FOR $!element` для сбора данных по ветке; .members для прямых потомков; OWNER для подъёма; .deslnk для перехода из Engineering в Design.",
  "syntax": "var !list EVAL (ATTRIBUTE) FOR ALL (TYPE) FOR $!element\n-- или\n!children = !element.members\n!parent = !element.owner\n!designElement = !element.deslnk[1]",
  "example_canonical": "-- CB: TagManagementTmp.pmlobj, .pipeDataTransfer()\n!desPipes = !pipe1D.deslnk\ndo !desPipe values !desPipes\n  !desBranches = !desPipe.members\n  handle any\n    $P 3D PIPE $!<desPipe.name> are not having any members\n  elsehandle none\n    do !desBran values !desPipe.members\n      !pipeLength = !pipeLength + !desBran.CLLEN\n      handle any\n        $P Length calculation error for $!<desBran.name>: $!!error.text\n      endhandle\n    enddo\n  endhandle\nenddo",
  "example_antipattern": "-- обращение к .members без handle: если элемент не имеет потомков, возможна ошибка\n!children = !element.members\ndo !child values !children\n  -- при пустом списке ошибки не будет, но при badref — будет\nenddo",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §7.3 (Navigation commands); TM-1401 PML Macros Rev 2.0, §3 (PDMS Navigation, var EVAL FOR)",
  "source_codebase": "TagManagementTmp.pmlobj (.pipeDataTransfer, .getPipesBySuppoRef), jacPropagateParentData.pmlfnc, jacExportRDLDataReport.pmlfnc",
  "pitfalls": ["deslnk может быть ARRAY (один 1D-элемент может ссылаться на несколько 3D)", "Всегда проверяйте badref() перед обращением к members или deslnk", "var EVAL FOR ALL — собирает ARRAY из выражения, результат всегда массив строк"],
  "related_ids": ["pdms_current_element", "pdms_dbref_resolve", "dt_dbref_usage", "eh_handle_any"]
}
```

#### [pdms_attribute_query]
```json
{
  "id": "pdms_attribute_query",
  "category": "pdms_interaction",
  "subcategory": "attributes",
  "title": "Запрос атрибутов: .attribute(), q att, COLL ALL",
  "principle": "Чтение атрибутов элементов PDMS — ключевая операция. Есть три подхода: прямой доступ через точечную нотацию (!ref.:AttributeName), метод .attribute('name'), и PDMS-команда `q att`. COLL ALL собирает ARRAY элементов по фильтру. Каждый может вернуть UNSET — это нужно обрабатывать.",
  "rule": "Для программного доступа используйте !ref.:UDAName (для UDA) или !ref.attribute('name'); для массовых запросов — `var !list COLL ALL (TYPE) WITH (FILTER)`. Всегда проверяйте результат на .unset() и .empty().",
  "syntax": "-- точечная нотация (прямой доступ к UDA)\n!value = !elementRef.:TagStatus\n-- метод attribute (для динамических имён)\n!value = !elementRef.attribute(!att.name())\n-- COLLECTION запрос\nvar !tags COLL ALL (ENGITEM) WITH (:TagStatus eq |ACTIVE| AND ISNAMED)",
  "example_canonical": "-- CB: TagManagementTmp.pmlobj, .GetTagData()\nvar !tags COLL ALL (ENGITEM) WITH (:TagStatus eq |ACTIVE| and ISNAMED and NOT(EMPTY(:RAMTAGOWNER)) and NOT(EMPTY(:TagStatus)) and NOT(EMPTY(:RambollTagStatus)))\n!this.tags = !tags\n\n-- CB: ramImportExcelElementLoader.pmlobj, .loadElement()\n!elementRefe.acttype   -- встроенный атрибут (тип элемента)\n!elementRefe.name      -- встроенный атрибут (полное имя)\n!elementRefe.namn      -- встроенный атрибут (короткое имя)",
  "example_antipattern": "-- чтение атрибута без проверки на UNSET и без handle:\n!status = !tagRef.:TagStatus\n$P Status is $!status\n-- если :TagStatus не задан, $!status будет UNSET и вывод непредсказуем",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §7.4 (Query attributes, UNSET); TM-1401 PML Macros Rev 2.0, §3.2 (COLLECTION queries)",
  "source_codebase": "TagManagementTmp.pmlobj (COLL ALL во всех методах), ramImportExcelElementLoader.pmlobj (.loadElement), jacExportRDLDataReport.pmlfnc",
  "pitfalls": ["COLL ALL может вернуть пустой массив — проверяйте .size()", "Сложные фильтры COLL ALL с .NET-типами (|:Pipeline|) могут вызвать ошибку — оборачивайте handle", "Разница между .name (полный путь /A/B/C) и .namn (только имя C)"],
  "related_ids": ["dt_unset_handling", "pdms_current_element", "cf_do_enddo_loop", "fnc_pdms_navigation"]
}
```

#### [pdms_attribute_update]
```json
{
  "id": "pdms_attribute_update",
  "category": "pdms_interaction",
  "subcategory": "attributes",
  "title": "Обновление атрибутов элементов PDMS",
  "principle": "Запись значений атрибутов PDMS требует, чтобы элемент был claimable (доступен для записи). Присвоение выполняется через прямую нотацию (!ref.:UDA = value) или через .attribute() для динамических имён. Перед записью необходимо проверить dbwrite и modatt.",
  "rule": "Перед записью атрибута проверяйте !ref.dbwrite и !ref.modatt (или используйте утилитарную функцию !!dbRefUpdatable). Оборачивайте запись в handle. Для ARRAY-атрибутов используйте APPEND-синтаксис или полное присвоение.",
  "syntax": "-- прямое присвоение UDA\n!elementRef.:TagStatus = |ACTIVE|\n-- присвоение через attribute() для динамического имени\n!elementRef.attribute(!att.name()) = !value\n-- ARRAY APPEND через PDMS-команду\n$!elementRef :TagRefToDocument APPEND $!docRef",
  "example_canonical": "-- CB: TagManagementTmp.pmlobj, .TryToSetValue() — безопасная запись с проверкой\n!isModifiable = !!dbRefUpdatable(!eleRef)\nif (!isModifiable.not()) then\n  !isError = true\n  !msg = 'Element can not be claimed!'\nendif\nif (!isError.not()) then\n  if (!attributeType eq 'REAL') then\n    !eleRef.attribute(!attribute.name()) = !attributeValue.real()\n    handle any\n      !isError = true\n    endhandle\n  endif\n  if (!attributeType eq 'TEXT') then\n    !eleRef.attribute(!attribute.name()) = !attributeValue\n    handle any\n      !isError = true\n    endhandle\n  endif\nendif",
  "example_antipattern": "-- запись без проверки claimability и без handle:\n!tagRef.:TagStatus = |ACTIVE|\n-- если элемент принадлежит другому пользователю или readonly, ошибка прервёт выполнение",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §7.5 (Updating attributes); TM-1401 PML Macros Rev 2.0, §3.3 (PDMS element modification)",
  "source_codebase": "TagManagementTmp.pmlobj (.TryToSetValue, .TryToSetArrayValue), ramImportExcelElementLoader.pmlobj (.modifyElement)",
  "pitfalls": ["dbwrite/modatt=false означает элемент locked другим пользователем или readonly", "ARRAY-атрибуты (like :TagRefToDocument) могут требовать APPEND вместо прямого присвоения", "Тип значения должен соответствовать типу атрибута (REAL/TEXT/REFERENCE/DATETIME)"],
  "related_ids": ["pdms_attribute_query", "pdms_element_existence", "tc_db_to_pml_mapping", "eh_handle_endhandle"]
}
```

#### [pdms_element_create]
```json
{
  "id": "pdms_element_create",
  "category": "pdms_interaction",
  "subcategory": "elements",
  "title": "Создание элементов через .NET PMLElementManager",
  "principle": "Создание новых элементов PDMS в production-коде выполняется через .NET API (Aveva.Engineering.PMLElementManager): CREATEELEMENT→SetElementTypeByName→AddAttributeValue(NAME)→Execute(). Это даёт контроль над типом и именем в одной транзакции, в отличие от PDMS-команды `new TYPE`.",
  "rule": "Используйте `using namespace |Aveva.Engineering.PMLElementManager|`, создайте CREATEELEMENT(), вызовите SetElementTypeByName(type), AddAttributeValue('NAME', name), Execute(). Оборачивайте каждый шаг handle. Проверяйте тип через ELEMENTTYPE перед созданием.",
  "syntax": "using namespace |Aveva.Engineering.PMLElementManager|\n!createNet = object CREATEELEMENT()\n!etype = object ELEMENTTYPE(!type)\nif (!etype.name() neq |UNKNOWN|) then\n  !createNet.SetElementTypeByName(!type)\n  !createNet.AddAttributeValue(|NAME|, !name)\n  !createNet.Execute()\nendif",
  "example_canonical": "-- CB: ramTagManagement.pmlobj, .createElement()\nusing namespace |Aveva.Engineering.PMLElementManager|\n!createNet = object CREATEELEMENT()\n!etype = object ELEMENTTYPE(!type)\nif(!etype.name() neq |UNKNOWN|) then\n  !createNet.SetElementTypeByName(!type)\n  handle any\n    !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\n    return !elementRef\n  endhandle\n  !createNet.AddAttributeValue(|NAME|, !name)\n  !createNet.ExecuteSync()\n  handle any\n    !errorDetail = !createNet.GetErrorDetails()\n    !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\n  endhandle\nendif\n\n-- далее проверяем, что элемент создан:\n!elementRef = !name.dbRef()\nhandle any\n  !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\nendhandle",
  "example_antipattern": "-- использование PDMS-команды new без проверки типа и существования:\nnew :ENGITEM /$!tagName\n-- ошибка: нет контроля типа, нет проверки дублей, нет обработки ошибок",
  "source_doc": "TM-1401 PML Macros Rev 2.0, §4.3 (.NET Interop — PMLElementManager); TM-1401 PML Basic Rev 3.0, §7.6 (Creating elements)",
  "source_codebase": "ramTagManagement.pmlobj (.createElement), TagManagementTmp.pmlobj (.alarmItemDataUpdate — создание Alarm через то же API)",
  "pitfalls": ["ELEMENTTYPE.name() == 'UNKNOWN' — тип не существует в схеме данных", "ExecuteSync() vs Execute(): Sync блокирует до завершения", "После Execute необходимо заново получить DBREF через !name.dbRef() — createElement не возвращает ссылку напрямую"],
  "related_ids": ["dn_import_guard", "dn_object_instantiation", "pdms_element_existence", "eh_handle_any"]
}
```

#### [pdms_element_existence]
```json
{
  "id": "pdms_element_existence",
  "category": "pdms_interaction",
  "subcategory": "elements",
  "title": "Проверка существования элемента по имени",
  "principle": "Перед созданием или модификацией элемента необходимо проверить, существует ли он в базе данных PDMS. Стандартный паттерн: !name.dbRef() в блоке handle any — если ошибка, элемент не найден.",
  "rule": "Используйте `!ref = !name.dbRef()` внутри handle any. Если handle сработал — элемент не существует. Дополнительно проверяйте .badref() для ссылок, полученных из атрибутов.",
  "syntax": "!elementRef = !name.dbRef()\nhandle any\n  -- элемент не найден\nendhandle\n-- или проверка badref:\nif (!someRef.badref()) then\n  -- ссылка невалидна\nendif",
  "example_canonical": "-- CB: ramImportExcelElementLoader.pmlobj, .validateName()\n!elementRefe        = object DBREF()\n!validName          = !name.trim()\n!isSlashNeeded      = !validName.subString(1,1).neq('/') AND !validName.subString(1,1).neq('=') $\n                      AND !validName.occurs(' ').eq(0)\nif(!isSlashNeeded) then\n  !validName        = '/' + !name\nendif\n!elementRefe        = !validName.dbRef()\nhandle any\nendhandle\nreturn !elementRefe\n\n-- CB: ramImportExcelElementLoader.pmlobj, .loadElement()\nif(!elementRefe.unset()) then\n  -- элемент не найден: создать\n  !elementRefe = !this.tagManagement.createElement(!excelTagName, !className)\nendif",
  "example_antipattern": "-- вызов !name.dbRef() без handle — при отсутствии элемента ошибка прервёт выполнение:\n!ref = !tagName.dbRef()\n!ref.:TagStatus = |ACTIVE|\n-- если элемент не существует, вторая строка не выполнится и макрос прервётся",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §5.9 (DBREF methods, badref); TM-1401 PML Macros Rev 2.0, §3.1 (Element existence check)",
  "source_codebase": "ramImportExcelElementLoader.pmlobj (.validateName, .loadElement), ramTagManagement.pmlobj (.createElement), TagManagementTmp.pmlobj (.tryGetElement)",
  "pitfalls": ["!name.dbRef() без '/' в начале — ищет относительно CE, не от корня", "badref() и unset() — разные проверки: badref для ссылок из атрибутов, unset для переменных", "Имя элемента PDMS case-insensitive для поиска, но case-sensitive при создании"],
  "related_ids": ["pdms_element_create", "dt_dbref_usage", "dt_unset_handling", "eh_handle_any"]
}
```

#### [pdms_dbref_resolve]
```json
{
  "id": "pdms_dbref_resolve",
  "category": "pdms_interaction",
  "subcategory": "elements",
  "title": "Получение и работа с DBREF",
  "principle": "DBREF — это ссылка на элемент в иерархии PDMS. Получение: .dbRef() из строки, object DBREF() для пустой ссылки, напрямую из атрибута типа REFERENCE. Ключевые свойства: .name (полный путь), .namn (короткое имя), .acttype (тип), .badref() (валидность).",
  "rule": "Перед использованием DBREF проверяйте .badref() — невалидная ссылка означает удалённый или несуществующий элемент. Для BACKREF (обратные ссылки) используйте `var !list BACKREF(attname :ATTR) of $!element`.",
  "syntax": "-- из строки\n!ref = !nameString.dbRef()\n-- пустая ссылка\n!ref = object DBREF()\n-- из атрибута\n!parentRef = !tagRef.:TagRefToParentTag\n-- проверка\nif (!ref.badref().not()) then\n  !typeName = !ref.acttype\nendif\n-- обратная ссылка\nvar !backRefElement BACKREF(attname $!backAttribute) of $!element",
  "example_canonical": "-- CB: ramGetBackRef.pmlfnc — получение BACKREF\ndefine function !!ramGetBackRef(!element is DBREF, !backAttribute is STRING) is DBREF\n  !backRefElement = object DBREF()\n  var !backRefElement BACKREF(attname $!backAttribute) of $!element\n  handle any\n  endhandle\n  return !backRefElement\nendfunction\n\n-- CB: jacPropagateParentData.pmlfnc — проверка badref перед навигацией\n!parentRef = !tagRef.attribute(!parentAttribute)\nif(!parentRef.badref().not()) then\n  do !attIdx indices !attList\n    !attValue = !parentRef.attribute(!attList[!attIdx])\n    -- ...\n  enddo\nendif",
  "example_antipattern": "-- обращение к свойствам DBREF без проверки badref:\n!parentRef = !tagRef.:TagRefToParentTag\n!parentName = !parentRef.namn\n-- если :TagRefToParentTag не установлен или удалён, .namn вызовет runtime error",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §5.9 (DBREF data type, badref, dbref); TM-1401 PML Macros Rev 2.0, §3.4 (BACKREF)",
  "source_codebase": "ramGetBackRef.pmlfnc, jacPropagateParentData.pmlfnc, ramImportExcelElementLoader.pmlobj (.validateName), TagManagementTmp.pmlobj",
  "pitfalls": ["badref() возвращает TRUE для удалённых элементов и для незаполненных ссылочных атрибутов", ".dbRef() из строки без '/' ищет относительно CE", "BACKREF возвращает DBREF (не ARRAY) — если обратных ссылок несколько, нужен COLL"],
  "related_ids": ["dt_dbref_usage", "pdms_element_existence", "dt_unset_handling", "fnc_pdms_navigation"]
}
```

#### [pdms_transaction]
```json
{
  "id": "pdms_transaction",
  "category": "pdms_interaction",
  "subcategory": "transaction",
  "title": "Транзакции: SAVEWORK, UNCLAIM ALL, GETWORK",
  "principle": "PDMS использует концепцию claim/release для контроля конкурентного доступа к элементам. SAVEWORK фиксирует все изменения в БД. UNCLAIM ALL освобождает все заблокированные элементы. В production-макросах SAVEWORK выполняется в конце pipeline и в блоке обработки ошибок (ONERROR).",
  "rule": "Вызывайте SAVEWORK после завершения всех модификаций. В блоке ONERROR/handle обязательно вызывайте SAVEWORK + UNCLAIM ALL, чтобы не заблокировать элементы при аварийном завершении.",
  "syntax": "SAVEWORK\nUNCLAIM ALL",
  "example_canonical": "-- CB: JDE_routine-macro-run.pmlmac — SAVEWORK в обработчике ошибок\nONERROR GOLABEL /Error\n-- ... pipeline шаги ...\n\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  !!ramCommonLogger.writeErrorDataToExcel(|..log_$!<year>-$!<month>.xlsx|, false)\nendhandle\nFINISH\n\n-- CB: JDE_exData_import.pmlmac — SAVEWORK после завершения импорта\nSAVEWORK",
  "example_antipattern": "-- макрос модифицирует десятки элементов без SAVEWORK в обработчике ошибок:\ndo !tag values !tags\n  !tagRef.:TagStatus = |ACTIVE|\nenddo\n-- если макрос прервётся, все claim'ы останутся и заблокируют элементы для других пользователей",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §7.7 (SAVEWORK, GETWORK — транзакции PDMS, claim-based concurrency); NOT_FOUND_IN_SOURCES: workon — в PDF не описан как PML-команда, возможно команда PDMS CLI",
  "source_codebase": "JDE_routine-macro-run.pmlmac, JDE_exData_import.pmlmac, JDE_RDL-import.pmlmac, JDE_newtag_import.pmlmac, EIS_data_update.pmlmac, JDE_BI_tagRegister-export.pmlmac (SAVEWORK в 13 макросах codebase)",
  "pitfalls": ["SAVEWORK без UNCLAIM ALL оставит элементы в состоянии claimed", "ONERROR GOLABEL — PDMS-механизм; handle/endhandle — PML-механизм; оба нужны", "FINISH — PDMS-команда завершения макроса, не PML-ключевое слово"],
  "related_ids": ["mac_pipeline_pattern", "eh_handle_any", "pdms_attribute_update", "pdms_current_element"]
}
```

---

### Категория: naming_conventions

#### [nc_variable_naming]
```json
{
  "id": "nc_variable_naming",
  "category": "naming_conventions",
  "subcategory": "variables",
  "title": "Именование переменных: !local vs !!GLOBAL",
  "principle": "PML различает локальные (!prefix) и глобальные (!!prefix) переменные. Локальные существуют только в текущей области видимости (функция/метод/макрос). Глобальные живут до конца сессии PDMS и используются для межмодульного обмена данными. В codebase локальные в camelCase, глобальные — для системных объектов (!!ramCommonLogger, !!alert).",
  "rule": "Локальные: !camelCase (!index, !elementRefe, !tagRef, !isError). Глобальные: !!camelCase для объектов-синглтонов (!!ramCommonLogger, !!displayProgress). Временные счётчики: !i, !idx, !index. Булевы переменные: !is-префикс (!isError, !isClassIdentifiable, !isForceValid).",
  "syntax": "!localVariable = 'value'\n!!globalSingleton = object CLASSNAME()",
  "example_canonical": "-- CB: ramImportExcelElementLoader.pmlobj — конвенция именования\n!isClassIdentifiable    = !className.set() AND !className.neq('')\n!isForceValid           = !isDefaultClassSet AND (!isForceCreateAllowed OR !isForceReclassifyAllowed)\n!isReclassifyNeeded     = !className.eqNocase(!elementRefe.acttype).not()\n!isAddedForReclassify   = false\n!elementRefe            = !this.validateName(!excelTagName)\n\n-- глобальные объекты:\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n!!displayProgress(1, 100)",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §3.2 (Variables — ! prefix for local, !! for global); §3.5 (Scope rules)",
  "source_codebase": "ramImportExcelElementLoader.pmlobj, JDE_routine-macro-run.pmlmac, ramValueConverter.pmlobj",
  "pitfalls": ["!!global переменные не очищаются между запусками макроса — могут содержать устаревшие данные", "!this доступен только внутри методов объекта, не в функциях или макросах", "Булев !is-префикс помогает читаемости: if(!isError.not()) then — явно виден смысл"],
  "related_ids": ["mac_global_variables", "obj_member_declaration", "dt_boolean_values"]
}
```

#### [nc_object_naming]
```json
{
  "id": "nc_object_naming",
  "category": "naming_conventions",
  "subcategory": "objects",
  "title": "Именование объектов с префиксом проекта",
  "principle": "В multi-team окружении AVEVA каждая команда использует уникальный префикс для всех своих артефактов, чтобы избежать конфликтов имён при pml rehash. Префикс идентифицирует владельца кода.",
  "rule": "Имя объекта: camelCase с lowercase-префиксом проекта/команды. Определение (define object) — UPPERCASE (PML-конвенция). Примеры из codebase: ram* (Ramboll), jac* (Jackdaw project), mlp* (MLP проект).",
  "syntax": "define object RAMVALUECONVERTER\n-- файл: ramValueConverter.pmlobj (camelCase с префиксом ram)",
  "example_canonical": "-- CB: объекты codebase — система префиксов\n-- ram-серия (Ramboll common utilities):\n--   ramCommonLogger, ramExcelReaderClass, ramFileWriterClass\n--   ramValueConverter, ramTagManagement\n--   ramImportExcelConfigLoader, ramImportExcelDataLoader, ramImportExcelElementLoader\n-- jac-серия (Jackdaw project-specific):\n--   jacEISDeliveryManager\n-- Без префикса (legacy):\n--   TagManagementTmp, LoopData, RAMTagMaturityData",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Macros Rev 2.0, §2.1 (Object naming, pml rehash — naming conflicts)",
  "source_codebase": "Все 12 объектов codebase (ramValueConverter.pmlobj, jacEISDeliveryManager.pmlobj и др.)",
  "pitfalls": ["define object всегда UPPERCASE — PML автоматически приводит к uppercase при загрузке", "Имя файла должно совпадать с именем объекта (в lowercase): ramValueConverter.pmlobj → RAMVALUECONVERTER", "Объекты без префикса (TagManagementTmp) рискуют конфликтовать с другими командами"],
  "related_ids": ["obj_definition_structure", "obj_namespace_loading", "nc_file_naming", "nc_prefix_conventions"]
}
```

#### [nc_method_naming]
```json
{
  "id": "nc_method_naming",
  "category": "naming_conventions",
  "subcategory": "methods",
  "title": "Именование методов: verbNoun паттерн",
  "principle": "Методы объектов именуются в camelCase по паттерну verb+Noun, отражая действие и объект. Getter-методы начинаются с get/is, мутирующие — с set/add/load/clear/update/delete/write.",
  "rule": "Используйте: get* (чтение), set* (запись), add* (добавление), load* (загрузка данных), clear* (очистка), is* (булев запрос), validate* (проверка), create* (создание), write* (запись в файл).",
  "syntax": "define method .getProcessedValue(!value is STRING, !param is STRING) is STRING\ndefine method .setDataLoader(!loader is RAMIMPORTEXCELDATALOADER)\ndefine method .addErrorToList(!element is STRING, !detail is STRING, !error is STRING)\ndefine method .loadElement()\ndefine method .clearData()\ndefine method .isAllowed(!setting is STRING) is BOOLEAN\ndefine method .validateName(!name is STRING) is DBREF\ndefine method .createElement(!name is STRING, !type is STRING) is DBREF",
  "example_canonical": "-- CB: ramImportExcelElementLoader.pmlobj — полный набор паттернов\ndefine method .setDataLoader(!dataLoader is RAMIMPORTEXCELDATALOADER)\ndefine method .loadElement()\ndefine method .validateName(!name is STRING) is DBREF\ndefine method .isAllowed(!setting is STRING) is BOOLEAN\ndefine method .getProcessedValue(!name is STRING, !parameter is STRING) is STRING\ndefine method .getValueSplit(!attributeValue is STRING, !split is ARRAY) is BOOLEAN\ndefine method .addErrorToList(!element is STRING, !detail is STRING, !errorDetail is STRING)\ndefine method .getReclassificationList() is ARRAY",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Macros Rev 2.0, §2.3 (Method naming conventions)",
  "source_codebase": "ramImportExcelElementLoader.pmlobj, ramCommonLogger.pmlobj, ramExcelReaderClass.pmlobj, ramValueConverter.pmlobj",
  "pitfalls": ["Конструктор именуется как класс (camelCase): .ramImportExcelElementLoader()", "Методы, возвращающие значение, объявляются с `is TYPE`", "Перегрузки метода — одно имя, разные сигнатуры (addErrorToList с 3 и 4 аргументами)"],
  "related_ids": ["obj_method_declaration", "obj_overloading_delegation", "nc_object_naming"]
}
```

#### [nc_file_naming]
```json
{
  "id": "nc_file_naming",
  "category": "naming_conventions",
  "subcategory": "files",
  "title": "Расширения файлов PML и их роли",
  "principle": "PML использует расширение файла для определения типа артефакта. Каждое расширение загружается отдельно через pml rehash и имеет свои правила структуры. Правильное расширение критично — файл с неверным расширением не будет найден pml rehash.",
  "rule": "`.pmlobj` — определение объекта (define object + members + methods). `.pmlfnc` — функция (define function, standalone). `.pmlmac` — макрос (скрипт, точка входа для pipeline). `.pmlfrm` — форма (setup form + widgets + callbacks). Имя файла = имя артефакта в lowercase.",
  "syntax": "-- Файловая структура проекта:\n-- objects/   ramValueConverter.pmlobj\n-- functions/ createObjectsFromExcelSheet.pmlfnc\n-- macros/    JDE_data-import.pmlmac\n-- forms/     ramImportExcelProcessor.pmlfrm",
  "example_canonical": "-- CB: codebase — файловая структура\n-- objects/ (12 файлов): ramValueConverter.pmlobj, ramCommonLogger.pmlobj, ...\n-- functions/ (18 файлов): createObjectsFromExcelSheet.pmlfnc, jacExportRDLDataReport.pmlfnc, ...\n-- macros/ (50+ файлов): JDE_data-import.pmlmac, JDE_tagProperties_export.pmlmac, ...\n-- forms/ (7 файлов): ramImportExcelProcessor.pmlfrm, rptoutput.pmlfrm, ...",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Macros Rev 2.0, §1.3 (File types and extensions); §2.1 (pml rehash and file discovery)",
  "source_codebase": "Вся структура docs/codebase/: objects/, functions/, macros/, forms/",
  "pitfalls": ["pml rehash ищет файлы по расширению в указанных каталогах PMLLIB", "Имя файла pmlobj должно совпадать с define object NAME (в lowercase)", "Имя файла pmlfnc должно совпадать с define function !!NAME"],
  "related_ids": ["obj_definition_structure", "fnc_definition_syntax", "mac_file_structure", "frm_file_structure"]
}
```

#### [nc_prefix_conventions]
```json
{
  "id": "nc_prefix_conventions",
  "category": "naming_conventions",
  "subcategory": "project",
  "title": "Префиксные конвенции в codebase",
  "principle": "В production codebase используется система префиксов для идентификации принадлежности кода к проекту/серии. Это позволяет нескольким командам работать на одном PDMS-сервере без конфликтов имён.",
  "rule": "Объекты: ram* (Ramboll common), jac* (Jackdaw-specific). Макросы-pipeline: JDE_* (Jackdaw Data Engineering), EIS_* (EIS delivery), EBA_*/EBE_* (EBE project). Функции: jac* (Jackdaw project), ram* (Ramboll utility), mlp* (MLP). UDA-атрибуты PDMS: :RAM* (Ramboll), :pcs* (PCS).",
  "syntax": "-- Серии макросов:\n-- JDE_* — Jackdaw Data Engineering pipeline (import/export/update)\n-- EIS_* — EIS delivery reports\n-- EBA_* — EBA full tag export\n-- EBE_* — EBE asset register",
  "example_canonical": "-- CB: codebase — серии макросов\n-- JDE-серия (17 макросов): JDE_data-import, JDE_tagProperties_export,\n--   JDE_RDL-import, JDE_newtag_import, JDE_delta_tag_export,\n--   JDE_commPackage-reports, JDE_vendorPackage-reports,\n--   JDE_routine-macro-run, JDE_outputMacro, ...\n-- EIS-серия (2): EIS_data_export, EIS_data_update\n-- EBA/EBE-серия (3): EBA_full_tag_export, EBE_assetRegister_import,\n--   EBE_delta_tag_export\n-- UDA-атрибуты в PDMS (из codebase):\n--   :RAMTagOwner, :RambollTagStatus, :RAMEquipmentNumber\n--   :pcsEXCLASS, :PcsIPGRADE, :PcsRANGESI",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "NOT_FOUND_IN_SOURCES — конвенция codebase, не описана в PDF",
  "source_codebase": "Все файлы codebase (87 файлов): objects/ram*, objects/jac*, macros/JDE_*, macros/EIS_*, macros/EBA_*, macros/EBE_*",
  "pitfalls": ["При добавлении нового проекта выберите уникальный 3-4 буквенный префикс", "Префикс UDA (:RAM*, :pcs*) регистрируется в RDL/Schema — не произвольный", "Legacy-файлы без префикса (TagManagementTmp, LoopData) — унаследованные, не образец для подражания"],
  "related_ids": ["nc_object_naming", "nc_file_naming", "mac_pipeline_pattern"]
}
```

---

### Категория: type_conversion

#### [tc_db_to_pml_mapping]
```json
{
  "id": "tc_db_to_pml_mapping",
  "category": "type_conversion",
  "subcategory": "db_mapping",
  "title": "Маппинг типов БД PDMS → PML",
  "principle": "Типы атрибутов в схеме PDMS не совпадают с типами PML. При чтении/записи атрибутов необходимо знать маппинг и выполнять конвертацию: REAL/INTEGER в БД → REAL в PML, WORD/TEXT → STRING, LOGICAL → BOOLEAN, REFERENCE → DBREF, DATETIME → DATETIME object. ramValueConverter централизует этот маппинг.",
  "rule": "Используйте метод .convertDBTypeToType() объекта ramValueConverter для определения PML-типа по типу атрибута БД. Маппинг: INTEGER/REAL→REAL, WORD/TEXT→STRING, LOGICAL→BOOLEAN, REFERENCE→DBREF. Для DATETIME и ARRAY нужна особая обработка.",
  "syntax": "!attribute = object ATTRIBUTE(!attributeName)\n!dbType = !attribute.type()\n-- маппинг:\n-- 'REAL', 'INTEGER' → работать как REAL\n-- 'TEXT', 'WORD' → работать как STRING\n-- 'LOGICAL' → работать как BOOLEAN\n-- 'REFERENCE' → работать как DBREF\n-- 'DATETIME' → object DATETIME()",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .convertDBTypeToType()\ndefine method .convertDBTypeToType(!dbType is STRING) is STRING\n  !type = 'STRING'\n  if(!dbType.eq('REAL') OR !dbType.eq('INTEGER')) then\n    !type = 'REAL'\n  elseif(!dbType.eq('WORD') OR !dbType.eq('TEXT')) then\n    !type = 'STRING'\n  elseif(!dbType.eq('LOGICAL')) then\n    !type = 'BOOLEAN'\n  elseif(!dbType.eq('REFERENCE')) then\n    !type = 'DBREF'\n  endif\n  return !type\nendmethod\n\n-- CB: TagManagementTmp.pmlobj, .TryToSetValue() — применение маппинга при записи\nif (!attributeType eq 'REAL') then\n  !eleRef.attribute(!attribute.name()) = !attributeValue.real()\nelseif (!attributeType eq 'TEXT') then\n  !eleRef.attribute(!attribute.name()) = !attributeValue\nelseif (!attributeType eq 'DATETIME') then\n  !datetime = object DATETIME(!y, !m, !d, 00, 00, 00)\n  !eleRef.attribute(!attribute.name()) = !datetime\nelseif (!attributeType eq 'LOGICAL') then\n  !eleRef.attribute(!attribute.name()) = !attributeValue.boolean()\nendif",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §5.1 (PML data types); §7.4 (PDMS attribute types)",
  "source_codebase": "ramValueConverter.pmlobj (.convertDBTypeToType), TagManagementTmp.pmlobj (.TryToSetValue), ramImportExcelElementLoader.pmlobj (.convertValue)",
  "pitfalls": ["INTEGER в PDMS маппится на REAL в PML — PML не имеет отдельного типа INTEGER", "WORD — короткая строка PDMS, TEXT — длинная; оба → STRING в PML", "REFERENCE может быть одиночной (DBREF) или множественной (ARRAY of DBREF)"],
  "related_ids": ["dn_type_mapping", "dt_real_declaration", "dt_dbref_usage", "pdms_attribute_update"]
}
```

#### [tc_string_to_real]
```json
{
  "id": "tc_string_to_real",
  "category": "type_conversion",
  "subcategory": "conversion",
  "title": "Конвертация STRING → REAL (.real())",
  "principle": "Преобразование строки в число — одна из самых частых операций при импорте данных из Excel. Метод .real() может бросить ошибку при невалидной строке, поэтому обязательно оборачивается в handle.",
  "rule": "Используйте `object REAL(!stringValue)` или `!stringValue.real()`. Всегда оборачивайте в handle any. При ошибке логируйте исходное значение для диагностики.",
  "syntax": "!realValue = object REAL(!stringValue)\nhandle any\n  -- не удалось конвертировать\nendhandle\n-- или\n!realValue = !stringValue.real()",
  "example_canonical": "-- CB: ramImportExcelElementLoader.pmlobj, .convertValue()\n!realValue       = object REAL(!tempValue)\nhandle any\n  !this.addErrorToList(!element.name, !attribute, 'ER6 - ' + 'Not able to convert ' + !tempValue + ' to real' + !additionalMessage, 2)\nelsehandle None\n  !result          = !realValue.string(!format)\n  handle any\n    !this.addErrorToList(!element.name, !attribute, 'ER7 - ' + 'Unit conversion failed', 2)\n  endhandle\nendhandle",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §5.3 (REAL data type, conversion methods); §6.4 (Type conversion functions)",
  "source_codebase": "ramImportExcelElementLoader.pmlobj (.convertValue), TagManagementTmp.pmlobj (.TryToSetValue), TagManagementTmp.pmlobj (.pipeSupportDataUpdate — !weightStr.real())",
  "pitfalls": ["Строка с единицами измерения ('123.4 mm') — нужно отделять число от UOM перед .real()", "Разделитель дробной части зависит от локали PDMS — может быть . или ,", "object REAL() и .real() эквивалентны, но object REAL() удобнее для handle"],
  "related_ids": ["tc_real_to_string", "tc_db_to_pml_mapping", "eh_handle_endhandle", "dt_real_declaration"]
}
```

#### [tc_real_to_string]
```json
{
  "id": "tc_real_to_string",
  "category": "type_conversion",
  "subcategory": "conversion",
  "title": "Конвертация REAL → STRING (.string(format))",
  "principle": "Форматирование числа в строку необходимо для вывода, логирования и формирования имён файлов. Метод .string(format) принимает формат-строку PML (например 'I2' для целого с двумя знаками).",
  "rule": "Используйте `.string()` (без формата — по умолчанию) или `.string('FORMAT')` с указанием формата. Для REAL с единицами — `.Value().String()` чтобы получить числовое значение без единиц.",
  "syntax": "!formatted = !realValue.string('I2')\n-- для REAL с единицами:\n!numericStr = !realValue.Value().String()",
  "example_canonical": "-- CB: JDE_routine-macro-run.pmlmac — форматирование даты\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')\n!date = !dt.date().string('I2')\n!hour = !dt.hour().string('I2')\n!minute = !dt.minute().string('I2')\n\n-- CB: TagManagementTmp.pmlobj — получение числового значения REAL\nif (!currentValue.objecttype() eq |REAL|) then\n  !currentValueString = !currentValue.Value().String()\nendif",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §5.3 (REAL formatting); §5.7 (Format specifiers: I — integer, F — float, E — scientific)",
  "source_codebase": "JDE_routine-macro-run.pmlmac, JDE_tagProperties_export.pmlmac, ramValueConverter.pmlobj, TagManagementTmp.pmlobj",
  "pitfalls": ["'I2' даёт целое с минимум 2 знаками (01, 02..12); 'F2' — дробное с 2 десятичными", "REAL с единицами (.real() из PDMS) требует .Value() перед .String() для числа", ".string() без формата может дать слишком много десятичных знаков"],
  "related_ids": ["tc_string_to_real", "mac_file_path_pattern", "dt_string_substitution"]
}
```

#### [tc_date_parsing]
```json
{
  "id": "tc_date_parsing",
  "category": "type_conversion",
  "subcategory": "conversion",
  "title": "Парсинг дат: перебор разделителей",
  "principle": "Даты из Excel/внешних источников могут иметь разные разделители (точка, дефис, слэш, запятая, обратный слэш, пробел). ramValueConverter решает это перебором всех возможных разделителей и проверкой .occurs(char).neq(2) как критерия (дата содержит ровно 2 разделителя).",
  "rule": "Для парсинга дат из строки: перебирайте разделители ('. , - / \\ пробел'), для каждого проверяйте .occurs(separator).eq(2), затем .split(separator) и создавайте object DATETIME(year, month, day). Оборачивайте каждую попытку в handle.",
  "syntax": "!separators = ARRAY()\n!separators.append('.')\n!separators.append(',')\n!separators.append('-')\n!separators.append('/')\n!separators.append('\\')\n!separators.append(' ')\ndo !sep values !separators\n  if (!dateStr.occurs(!sep).eq(2)) then\n    !parts = !dateStr.split(!sep)\n    !dt = object DATETIME(!parts[3].real(), !parts[2].real(), !parts[1].real(), 0, 0, 0)\n    handle any\n    endhandle\n  endif\nenddo",
  "example_canonical": "-- CB: ramValueConverter.pmlobj, .parseDate()\n!separators = ARRAY()\n!separators.append('.')\n!separators.append(',')\n!separators.append('-')\n!separators.append('/')\n!separators.append('\\\\')\n!separators.append(' ')\ndo !sep values !separators\n  if(!valueString.occurs(!sep).neq(2)) then\n    skip\n  endif\n  !dateParts = !valueString.split(!sep)\n  -- далее: проверка порядка DD.MM.YYYY и создание DATETIME",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §5.8 (DATETIME object, construction); §5.2 (STRING methods — .occurs(), .split())",
  "source_codebase": "ramValueConverter.pmlobj (.parseDate, .convertValue — перебор разделителей даты)",
  "pitfalls": ["Порядок DD.MM.YYYY vs MM/DD/YYYY зависит от источника данных — не всегда совпадает", ".occurs(char).eq(2) — эвристика: дата DD.MM.YYYY содержит ровно два разделителя", "DATETIME конструктор: (year, month, day, hour, min, sec) — year первым"],
  "related_ids": ["tc_string_to_real", "dt_string_declaration", "eh_handle_any", "obj_factory_pattern"]
}
```

#### [tc_boolean_from_string]
```json
{
  "id": "tc_boolean_from_string",
  "category": "type_conversion",
  "subcategory": "conversion",
  "title": "Конвертация STRING → BOOLEAN",
  "principle": "При импорте данных из Excel булевы значения приходят как строки ('TRUE', 'FALSE', 'Yes', 'No'). PML-метод .boolean() конвертирует строку, но в codebase часто используется сравнение .eqNocase('TRUE') для явного контроля.",
  "rule": "Для надёжной конвертации используйте .eqNocase('TRUE') вместо .boolean() — это даёт контроль над нечёткими значениями. Для записи в PDMS-атрибут типа LOGICAL используйте .boolean() метод.",
  "syntax": "-- через сравнение (надёжнее):\n!isAllowed = !value.eqNocase('TRUE')\n-- через PML-метод:\n!boolValue = !stringValue.boolean()",
  "example_canonical": "-- CB: ramImportExcelElementLoader.pmlobj, .isAllowed()\ndefine method .isAllowed(!setting is STRING) is BOOLEAN\n  !isAllowed   = false\n  !value       = !this.dataLoader.getSettingValue(!setting)\n  if(!value.eqNocase('TRUE')) then\n    !isAllowed = true\n  endif\n  return !isAllowed\nendmethod\n\n-- CB: TagManagementTmp.pmlobj, .TryToSetValue() — запись LOGICAL в PDMS\nif (!attributeType eq 'LOGICAL') then\n  !eleRef.attribute(!attribute.name()) = !attributeValue.boolean()\n  handle any\n    !isError = true\n  endhandle\nendif",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §5.4 (BOOLEAN data type); §6.4 (Type conversion — .boolean())",
  "source_codebase": "ramImportExcelElementLoader.pmlobj (.isAllowed, .loadExcelData — !isTransposeList[!i].boolean()), TagManagementTmp.pmlobj (.TryToSetValue)",
  "pitfalls": [".boolean() на произвольной строке может бросить ошибку — оборачивайте handle", "В PML BOOLEAN имеет три состояния: TRUE, FALSE, UNDEFINED", "eqNocase — регистронезависимое сравнение: 'true', 'True', 'TRUE' — все совпадут"],
  "related_ids": ["dt_boolean_values", "tc_db_to_pml_mapping", "eh_handle_endhandle"]
}
```

---

### Категория: logging

#### [log_severity_levels]
```json
{
  "id": "log_severity_levels",
  "category": "logging",
  "subcategory": "severity",
  "title": "Уровни severity в логировании",
  "principle": "Система логирования codebase использует числовой severity: значение передаётся первым элементом лог-массива или отдельным аргументом метода addLogDetails(). В codebase реально встречаются значения 0 (информация/debug в ramValueConverter), 1 (предупреждения в ramImportExcelElementLoader), 2 (ошибки — значение по умолчанию в ramCommonLogger). Формальная шкала 1=INFO/2=WARNING/3=ERROR не документирована в PDF — это конвенция codebase.",
  "rule": "Передавайте severity как REAL-параметр в addLogDetails(): 0 — debug/info, 1 — warning, 2 — error (default). Default severity=2 в ramCommonLogger означает, что без явного указания всё логируется как ошибка.",
  "syntax": "-- severity как параметр:\n!!ramCommonLogger.addLogDetails(!source, !errorList, !severityLevel)\n-- severity по умолчанию (=2):\n!!ramCommonLogger.addLogDetails(!source, !errorList)",
  "example_canonical": "-- CB: ramCommonLogger.pmlobj — default severity = 2\ndefine method .addLogDetails(!objectName is STRING, !data is ARRAY)\n  !this.addLogDetails(!objectName, !data, 2)\nendmethod\n\n-- CB: ramImportExcelElementLoader.pmlobj — severity 1 (warning) vs 2 (error)\n!this.addErrorToList(!elementRefe.name, 'Type', 'ER15 - Excel Type mismatch', 1)\n-- vs\n!this.addErrorToList(!element.name, !attribute, 'ER6 - Not able to convert', 2)\n\n-- CB: ramValueConverter.pmlobj — severity 0 (debug/info)\n!this.addErrorData(!sourceType, !dataList, 0)",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "NOT_FOUND_IN_SOURCES — система severity не описана в PDF; это конвенция codebase",
  "source_codebase": "ramCommonLogger.pmlobj (default=2), ramImportExcelElementLoader.pmlobj (severity 1 и 2), ramValueConverter.pmlobj (severity 0)",
  "pitfalls": ["Default severity=2 — если забыли указать, всё записывается как ERROR", "Severity 0 используется только в ramValueConverter для debug-информации", "Нет встроенной фильтрации по severity в ramCommonLogger — все записи попадают в лог"],
  "related_ids": ["log_common_logger_api", "log_contextual_info", "eh_logging_pattern"]
}
```

#### [log_common_logger_api]
```json
{
  "id": "log_common_logger_api",
  "category": "logging",
  "subcategory": "api",
  "title": "API ramCommonLogger: перегрузки addLogDetails",
  "principle": "ramCommonLogger использует паттерн перегрузок (delegation): короткие методы делегируют к полному с дефолтными значениями. Лог-данные хранятся как ARRAY of ARRAY. Каждая запись — массив строк [элемент, атрибут, описание ошибки...].",
  "rule": "Используйте !!ramCommonLogger.addLogDetails(objectName, dataArray) для стандартного логирования (severity=2) или !!ramCommonLogger.addLogDetails(objectName, dataArray, severity) для явного уровня. Инициализируйте !!ramCommonLogger = object RAMCOMMONLOGGER() в начале pipeline. Заголовки задаются через .addHeading(headerArray).",
  "syntax": "-- инициализация\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n!headings = |Tag Name;Attribute Name;Error Text|\n!!ramCommonLogger.addHeading(!headings.split(|;|))\n-- логирование\n!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\n!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList, 1)\n-- экспорт\n!!ramCommonLogger.writeErrorDataToExcel(!path, !openFile)",
  "example_canonical": "-- CB: ramCommonLogger.pmlobj — цепочка перегрузок\ndefine method .addLogDetails(!objectName is STRING, !data is ARRAY)\n  !this.addLogDetails(!objectName, !data, 2)\nendmethod\n\ndefine method .addLogDetails(!objectName is STRING, !data is ARRAY, !severity is REAL)\n  !logRow = object ARRAY()\n  !logRow.append(!severity)\n  !logRow.append(!objectName)\n  !logRow.appendArray(!data)\n  !this.errorData.append(!logRow)\n  !this.fileWriter.appendToLog(!logRow)\nendmethod\n\n-- CB: JDE_routine-macro-run.pmlmac — полный lifecycle\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n!headings = |Tag Name;Attribute Name;Error Text|\n!!ramCommonLogger.addHeading(!headings.split(|;|))\n-- ... pipeline шаги ...\n!!ramCommonLogger.writeErrorDataToExcel(|...log_$!<year>-$!<month>.xlsx|, false)",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "NOT_FOUND_IN_SOURCES — ramCommonLogger не описан в PDF; это компонент codebase",
  "source_codebase": "ramCommonLogger.pmlobj (полная реализация), JDE_routine-macro-run.pmlmac (lifecycle), ramImportExcelElementLoader.pmlobj (использование)",
  "pitfalls": ["!!ramCommonLogger — глобальная переменная, создаётся один раз в pipeline-макросе", "addLogDetails принимает ARRAY (не отдельные строки) — формируйте массив перед вызовом", "writeErrorDataToExcel использует .NET NETGRIDCONTROL и NETDATASOURCE для экспорта"],
  "related_ids": ["log_severity_levels", "log_form_integration", "obj_overloading_delegation", "mac_pipeline_pattern"]
}
```

#### [log_form_integration]
```json
{
  "id": "log_form_integration",
  "category": "logging",
  "subcategory": "integration",
  "title": "Форма логгера: ramCommonLoggerForm",
  "principle": "ramCommonLoggerForm отображает логи в UI через PMLNETCONTROL (DataGrid). Форма привязана к объекту ramCommonLogger и обновляется при вызове метода refresh. Используется для интерактивного мониторинга процессов (импорт, валидация).",
  "rule": "Показывайте форму логгера через show !!ramCommonLoggerForm. Данные привязываются через NETGRIDCONTROL.bindToDataSource(). Для автообновления при добавлении новых записей используйте callback-механизм формы.",
  "syntax": "-- показ формы логгера\nshow !!ramCommonLoggerForm\n-- привязка данных\n!this.logGrid.bindToDataSource(!source)",
  "example_canonical": "-- CB: ramCommonLoggerForm.pmlfrm — структура формы\nsetup form !!ramCommonLoggerForm dialog size 80 30\n  !this.formTitle = |Common Log|\n  title !this.formTitle\n  PMLNETControl .logGrid NETGRIDCONTROL 75 24\n\n  button .buRefresh 'Refresh' at xmax-16 ymax+0.5 callback '!this.refresh()'\n  button .buExport  'Export'  at xmax-8 ymax+0.5 callback '!this.export()'\nexit\n\ndefine method .refresh()\n  if(undefined(!!ramCommonLogger)) then\n    return\n  endif\n  !this.logGrid.clearGrid()\n  !source = object NETDATASOURCE('data', !!ramCommonLogger.heading, !!ramCommonLogger.errorData)\n  !this.logGrid.bindToDataSource(!source)\nendmethod",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 PML Form Design Rev 1.0, §2.18 (PMLNETControl, NETGRIDCONTROL)",
  "source_codebase": "ramCommonLoggerForm.pmlfrm, ramCommonLogger.pmlobj (.writeErrorDataToExcel)",
  "pitfalls": ["undefined(!!ramCommonLogger) — guard: проверка что логгер создан перед refresh", "Форма использует PMLNETControl — требует import 'GridControl' (в parent объекте)", "Данные передаются через NETDATASOURCE — не прямое присвоение"],
  "related_ids": ["log_common_logger_api", "frm_form_as_class", "frm_button_callback", "dn_object_instantiation"]
}
```

#### [log_output_targets]
```json
{
  "id": "log_output_targets",
  "category": "logging",
  "subcategory": "targets",
  "title": "Цели вывода логов: файл, форма, консоль",
  "principle": "В codebase используются три канала логирования: (1) Excel-файл через writeErrorDataToExcel — для постоянного хранения; (2) форма ramCommonLoggerForm — для интерактивного мониторинга; (3) $P в консоль PDMS — для отладки и прогресса. Канал выбирается по назначению: production pipeline → Excel, интерактивный процесс → форма, debug → $P.",
  "rule": "Production pipelines: всегда пишите в Excel-файл через !!ramCommonLogger.writeErrorDataToExcel(). Интерактивные формы: показывайте ramCommonLoggerForm для мониторинга. Отладка: используйте $P для вывода в командную строку PDMS. Не полагайтесь только на $P — вывод теряется после закрытия сессии.",
  "syntax": "-- Excel-файл (production)\n!!ramCommonLogger.writeErrorDataToExcel(!path, !openFile)\n-- консоль PDMS (debug)\n$P --- STEP 1: DELETE UNTAGGED ITEMS ---\n-- прогресс-бар\n!!displayProgress(!index, !totalSize)",
  "example_canonical": "-- CB: JDE_routine-macro-run.pmlmac — все три канала\n-- 1. Консоль (прогресс):\n$P --- START ROUTINE PROCESSING ---\n$P --- STEP 1: DELETE UNTAGGED ITEMS ---\n\n-- 2. Прогресс-бар (UI):\n!!displayProgress(!index, !totalSize)\n\n-- 3. Excel-файл (финальный лог):\n!!ramCommonLogger.writeErrorDataToExcel(|...log_$!<year>-$!<month>-$!<date>-$!<hour>.xlsx|, false)\n\n-- CB: ramFileWriterClass.pmlobj — текстовый лог через FILE\n!file = object FILE(!path)\n!file.writeFile('OVERW', !textDataFormat)",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §4.3 ($P — output command); TM-1402 Form Design Rev 1.0, §3.3 (FILE object for logging)",
  "source_codebase": "JDE_routine-macro-run.pmlmac ($P + writeErrorDataToExcel), ramCommonLoggerForm.pmlfrm (UI), ramFileWriterClass.pmlobj (text file)",
  "pitfalls": ["$P в production pipeline быстро заполняет буфер командной строки", "writeErrorDataToExcel второй параметр (!openFile) = true откроет Explorer (не для batch-режима)", "Имя файла лога формируется с датой — см. mac_file_path_pattern"],
  "related_ids": ["log_common_logger_api", "log_form_integration", "mac_output_control", "dn_file_write_pattern"]
}
```

#### [log_contextual_info]
```json
{
  "id": "log_contextual_info",
  "category": "logging",
  "subcategory": "content",
  "title": "Контекстная информация в каждом лог-сообщении",
  "principle": "Каждая запись лога должна содержать достаточно контекста для диагностики без обращения к исходному коду. В codebase стандартный набор: имя элемента, имя атрибута, описание ошибки с кодом (ER1-ER16), severity. Без контекста лог-запись бесполезна.",
  "rule": "Лог-запись должна содержать: (1) имя элемента/тега — что обрабатывали, (2) имя атрибута/операции — что делали, (3) текст ошибки с кодом — что пошло не так, (4) значения — что пытались установить и что было. Используйте .objecttype() для идентификации источника (какой объект записал лог).",
  "syntax": "!errorList = object ARRAY()\n!errorList.append(!element.name)    -- ЧТО обрабатывали\n!errorList.append(!attribute)        -- с КАКИМ атрибутом\n!errorList.append(!errorDetail)      -- ЧТО пошло не так\n!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList, !severity)",
  "example_canonical": "-- CB: ramImportExcelElementLoader.pmlobj — структурированные лог-записи\n-- Предупреждение (severity 1) — несоответствие типа:\n!this.addErrorToList(!elementRefe.name, 'Type', 'ER15 - ' + 'Excel Type - $!className AVEVA Type - ' + !elementRefe.acttype, 1)\n\n-- Ошибка (severity 2) — невозможность конвертации:\n!this.addErrorToList(!element.name, !attribute, 'ER6 - ' + 'Not able to convert ' + !tempValue + ' to real', 2)\n\n-- Ошибка (severity 2) — сбой записи:\n!this.addErrorToList(!element.name, !attribute, 'ER7 - ' + 'Unit conversion failed. Original value - ' + !tempValue + ' to unit - ' + !dbUnit.string(), 2)\n\n-- CB: TagManagementTmp.pmlobj — лог через split для CSV-формата\n!msg = '$!<tagRef.name>;ClassNameUpdate();$!!<error.text>'\n!this.errorList.append(!msg.split(|;|))",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "NOT_FOUND_IN_SOURCES — паттерн контекстного логирования из codebase",
  "source_codebase": "ramImportExcelElementLoader.pmlobj (.addErrorToList — все ER-коды), TagManagementTmp.pmlobj (split-формат), ramCommonLogger.pmlobj (.addLogDetails — структура)",
  "pitfalls": ["Коды ER1–ER16 позволяют группировать и фильтровать ошибки в Excel-логе", "objecttype() возвращает имя класса объекта — идентифицирует источник ошибки", "Конкатенация через + может обрезаться при длинных строках — используйте |...| для pipe-строк"],
  "related_ids": ["log_severity_levels", "log_common_logger_api", "eh_logging_pattern", "dt_string_substitution"]
}
```

---

### Категория: architecture_patterns

#### [ap_loader_chain]
```json
{
  "id": "ap_loader_chain",
  "category": "architecture_patterns",
  "subcategory": "data_pipeline",
  "title": "Трёхуровневый паттерн: ConfigLoader → DataLoader → ElementLoader",
  "principle": "Сложные операции импорта данных декомпозируются в цепочку объектов, каждый отвечает за свой уровень абстракции: ConfigLoader — загрузка конфигурации (настройки, маппинги), DataLoader — загрузка и трансформация данных (Excel→структуры), ElementLoader — запись в PDMS (создание/обновление элементов). Цепочка соединяется через setter-injection: каждый следующий уровень получает предыдущий через setXxx().",
  "rule": "Разделяйте импорт на три уровня: (1) ConfigLoader читает настройки, (2) DataLoader читает данные и маппит их, (3) ElementLoader создаёт/обновляет элементы PDMS. Каждый уровень — отдельный объект с чёткой ответственностью. Соединение — через setter-injection.",
  "syntax": "-- Инициализация цепочки:\n!config = object RAMIMPORTEXCELCONFIGLOADER()\n!data   = object RAMIMPORTEXCELDATALOADER()\n!loader = object RAMIMPORTEXCELELEMENTLOADER()\n\n-- Связывание:\n!data.setConfigDetail(!config)\n!loader.setDataLoader(!data)\n\n-- Выполнение:\n!loader.loadElement()",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm — оркестрация цепочки\n-- Члены формы:\nmember .meConfigDetails     is RAMIMPORTEXCELCONFIGLOADER\nmember .meExcelDataProcessor is RAMIMPORTEXCELDATALOADER\nmember .meExcelElementLoader is RAMIMPORTEXCELELEMENTLOADER\n\n-- Связывание в методе .setDataLoader():\ndefine method .setDataLoader()\n  !this.meExcelDataProcessor.setConfigDetail(!this.meConfigDetails)\n  !this.meExcelElementLoader.setDataLoader(!this.meExcelDataProcessor)\nendmethod\n\n-- Последовательность вызовов в .importData():\ndefine method .importData()\n  !this.setConfigDetail()    -- 1. загрузить конфигурацию\n  !this.setDataLoader()      -- 2. связать цепочку\n  !this.initiateLoader()     -- 3. запустить загрузку элементов\nendmethod",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "NOT_FOUND_IN_SOURCES — архитектурный паттерн codebase",
  "source_codebase": "ramImportExcelProcessor.pmlfrm (оркестратор), ramImportExcelConfigLoader.pmlobj (уровень 1), ramImportExcelDataLoader.pmlobj (уровень 2), ramImportExcelElementLoader.pmlobj (уровень 3)",
  "pitfalls": ["Порядок инициализации критичен: Config → Data → Element (Data зависит от Config)", "Каждый уровень должен иметь метод clear/reset для повторного использования", "ElementLoader зависит от DataLoader.getMasterList() — если данные не загружены, loadElement не сработает"],
  "related_ids": ["ap_form_controller", "ap_separation_of_concerns", "frm_loader_chain", "obj_delegation_pattern"]
}
```

#### [ap_form_controller]
```json
{
  "id": "ap_form_controller",
  "category": "architecture_patterns",
  "subcategory": "mvc",
  "title": "Форма как Controller: координация без бизнес-логики",
  "principle": "В PML-архитектуре форма выступает как Controller (в терминах MVC): она владеет UI-виджетами и объектами-членами (Model), координирует их взаимодействие, но не содержит бизнес-логику. Логика обработки данных инкапсулирована в объектах (ConfigLoader, DataLoader, ElementLoader). Форма только связывает их и управляет потоком.",
  "rule": "Форма: инициализирует объекты-члены в конструкторе, связывает их через setters, вызывает методы объектов по callback'ам кнопок. Бизнес-логика — в объектах, не в форме. Форма отвечает за: показ прогресса, обновление UI, обработку пользовательских действий.",
  "syntax": "setup form !!formName\n  member .controller is SOMEOBJECT\nexit\n\ndefine method .initialise()\n  !this.controller = object SOMEOBJECT()\nendmethod\n\ndefine method .onButtonClick()\n  !this.controller.doWork()\n  !this.updateUI()\nendmethod",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm — форма как Controller\nsetup form !!ramImportExcelProcessor dialog size 80 30\n  member .meConfigDetails      is RAMIMPORTEXCELCONFIGLOADER\n  member .meExcelDataProcessor is RAMIMPORTEXCELDATALOADER\n  member .meExcelElementLoader is RAMIMPORTEXCELELEMENTLOADER\n\n  button .buImport 'Import' callback '!this.importData()'\nexit\n\ndefine method .ramImportExcelProcessor()\n  !this.meConfigDetails      = object RAMIMPORTEXCELCONFIGLOADER()\n  !this.meExcelDataProcessor = object RAMIMPORTEXCELDATALOADER()\n  !this.meExcelElementLoader = object RAMIMPORTEXCELELEMENTLOADER()\nendmethod\n\ndefine method .importData()\n  !this.setConfigDetail()\n  !this.setDataLoader()\n  !this.initiateLoader()\nendmethod",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 PML Form Design Rev 1.0, §1.4 (Form as class); §2.15 (Form members)",
  "source_codebase": "ramImportExcelProcessor.pmlfrm (полная реализация Controller)",
  "pitfalls": ["Форма не должна напрямую работать с PDMS — это задача ElementLoader", "Callback формы вызывает метод формы, который делегирует объекту", "Члены формы инициализируются в конструкторе формы, не в initialise()"],
  "related_ids": ["ap_loader_chain", "ap_separation_of_concerns", "frm_form_as_class", "frm_callback_syntax"]
}
```

#### [ap_separation_of_concerns]
```json
{
  "id": "ap_separation_of_concerns",
  "category": "architecture_patterns",
  "subcategory": "design",
  "title": "Разделение ответственности: объект = одна задача",
  "principle": "Каждый объект PML должен отвечать за одну задачу. ramExcelReaderClass — только чтение Excel. ramValueConverter — только конвертация типов. ramCommonLogger — только логирование. ramFileWriterClass — только запись файлов. Это позволяет переиспользовать объекты в разных контекстах без связанности.",
  "rule": "Один объект = одна ответственность. Если объект делает две несвязанные вещи — разделите на два. Утилитарные объекты (конвертер, логгер, writer) не должны зависеть от бизнес-контекста. Бизнес-объекты (ElementLoader, TagManagement) не должны содержать утилитарную логику.",
  "syntax": "-- Утилитарные объекты (контекстно-независимые):\n-- ramValueConverter — конвертация типов\n-- ramCommonLogger — логирование\n-- ramExcelReaderClass — чтение Excel\n-- ramFileWriterClass — запись файлов\n\n-- Бизнес-объекты (контекстно-зависимые):\n-- ramImportExcelElementLoader — импорт элементов в PDMS\n-- ramTagManagement — создание/поиск тегов\n-- jacEISDeliveryManager — EIS-доставка",
  "example_canonical": "-- CB: ramValueConverter.pmlobj — чистый конвертер без бизнес-логики\nmember .errorData is ARRAY   -- только хранение ошибок конвертации\n-- методы: .convertValue(), .convertDBTypeToType(), .parseDate()\n-- НЕ содержит: логику импорта, работу с PDMS, UI\n\n-- CB: ramExcelReaderClass.pmlobj — чистый ридер\nmember .excelTables is ARRAY   -- результат чтения\n-- методы: .loadExcelData(), .error()\n-- НЕ содержит: маппинг данных, создание элементов\n\n-- CB: ramImportExcelElementLoader.pmlobj — бизнес-объект\nmember .tagManagement is RAMTAGMANAGEMENT     -- делегирует создание\nmember .valueConverter is RAMVALUECONVERTER   -- делегирует конвертацию\n-- НЕ содержит: чтение Excel, UI",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "NOT_FOUND_IN_SOURCES — архитектурный принцип, не описан в PDF",
  "source_codebase": "ramValueConverter.pmlobj, ramExcelReaderClass.pmlobj, ramCommonLogger.pmlobj, ramFileWriterClass.pmlobj (утилиты); ramImportExcelElementLoader.pmlobj, ramTagManagement.pmlobj (бизнес)",
  "pitfalls": ["TagManagementTmp — пример объекта-антипаттерна: 20+ методов разной ответственности в одном объекте (legacy)", "Если метод объекта вызывает $P или !!alert — это смешение Model и View", "Логгер передаётся через !!global, не через member — осознанный выбор для упрощения API"],
  "related_ids": ["ap_form_controller", "ap_loader_chain", "obj_delegation_pattern", "ap_data_object"]
}
```

#### [ap_pipeline_macro]
```json
{
  "id": "ap_pipeline_macro",
  "category": "architecture_patterns",
  "subcategory": "orchestration",
  "title": "Макрос как orchestrator: pipeline шагов",
  "principle": "Production-макрос не содержит бизнес-логику — он оркестрирует: устанавливает контекст (TAGS, CE), создаёт логгер, последовательно вызывает шаги (объекты/функции), обрабатывает ошибки (ONERROR), сохраняет результат (SAVEWORK), экспортирует лог. Каждый шаг маркируется через $P для отслеживания прогресса.",
  "rule": "Pipeline-макрос: (1) TAGS — установка контекста; (2) ONERROR GOLABEL — глобальный обработчик; (3) создание !!ramCommonLogger с заголовками; (4) последовательность $P STEP N + вызов функции/метода; (5) в LABEL /Error: SAVEWORK + UNCLAIM ALL + экспорт лога; (6) FINISH.",
  "syntax": "TAGS\nONERROR GOLABEL /Error\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n$P --- STEP 1: ... ---\n-- вызов шага\n$P --- STEP 2: ... ---\n-- вызов шага\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\nendhandle\nFINISH",
  "example_canonical": "-- CB: JDE_routine-macro-run.pmlmac — полный pipeline\nTAGS\nONERROR GOLABEL /Error\n\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n!headings = |Tag Name;Attribute Name;Error Text|\n!!ramCommonLogger.addHeading(!headings.split(|;|))\n\n$P --- START ROUTINE PROCESSING ---\n$P --- STEP 1: DELETE UNTAGGED ITEMS  ---\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.deleteUnnamedTags()\n\n$P --- STEP 3: UPDATE CLASS NAME ---\n!!jacUpdateClassDetails(!rdlMasterFile, |Class-mapping|, ...)\n\n$P --- STEP 5: UPDATE TAG NAME ---\n!!jacUpdateTagName(|NAMN|, |:TagName|, ...)\n-- ... ещё шаги ...\n\n$P --- STEP 10: FINISH TASKS  ---\n!!ramCommonLogger.writeErrorDataToExcel(|...log.xlsx|, false)\n\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  !!ramCommonLogger.writeErrorDataToExcel(|...log.xlsx|, false)\nendhandle\nFINISH",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Macros Rev 2.0, §1.2 (Macro structure); TM-1401 PML Basic Rev 3.0, §8 (ONERROR, GOLABEL, LABEL)",
  "source_codebase": "JDE_routine-macro-run.pmlmac (14 шагов), JDE_data-import.pmlmac (pipeline с PML RELOAD OBJECT)",
  "pitfalls": ["ONERROR GOLABEL — PDMS-механизм (не PML handle), срабатывает на необработанные ошибки", "LABEL /Error + FINISH — обязательны в конце pipeline для корректного завершения", "Нумерация $P STEP может не совпадать (STEP 3 после STEP 1) — это нормально, шаги отключаются комментированием"],
  "related_ids": ["mac_pipeline_pattern", "pdms_transaction", "log_common_logger_api", "eh_handle_any"]
}
```

#### [ap_data_object]
```json
{
  "id": "ap_data_object",
  "category": "architecture_patterns",
  "subcategory": "design",
  "title": "Data-object: объект только с данными",
  "principle": "Для передачи структурированных данных между модулями используются data-objects — объекты, содержащие только members (данные) и минимальный конструктор/геттеры, без бизнес-логики. Это PML-аналог структуры (struct) или DTO.",
  "rule": "Data-object содержит: (1) members с типами (REAL, STRING, ARRAY, DBREF); (2) конструктор, инициализирующий дефолтные значения; (3) опционально геттеры/сеттеры. Не содержит: бизнес-логику, обращения к PDMS, .NET calls, $P вывод.",
  "syntax": "define object DATANAME\n  member .field1 is REAL\n  member .field2 is STRING\n  member .items  is ARRAY\nendobject\n\ndefine method .dataName()\n  !this.field1 = 0\n  !this.field2 = ''\n  !this.items  = object ARRAY()\nendmethod",
  "example_canonical": "-- CB: RAMTagMaturityData.pmlobj — чистый data-object\ndefine object RAMTAGMATURITYDATA\n  member .draftCount    is REAL\n  member .activeCount   is REAL\n  member .afcCount      is REAL\n  member .asbCount      is REAL\n  member .voidCount     is REAL\nendobject\n\ndefine method .RAMTagMaturityData()\n  !this.draftCount    = 0\n  !this.activeCount   = 0\n  !this.afcCount      = 0\n  !this.asbCount      = 0\n  !this.voidCount     = 0\nendmethod\n\ndefine method .GetTotal() is REAL\n  return !this.draftCount + !this.activeCount + !this.afcCount + !this.asbCount + !this.voidCount\nendmethod\n\n-- CB: LoopData.pmlobj — data-object с import dlls для расширения\ndefine object LOOPDATA\n  member .tags         is ARRAY\n  member .errorList    is ARRAY\n  member .logPathName  is STRING\nendobject",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Macros Rev 2.0, §2.2 (Object members, constructors)",
  "source_codebase": "RAMTagMaturityData.pmlobj (5 members + GetTotal), LoopData.pmlobj (data + import dlls для внешних операций)",
  "pitfalls": ["Data-object не должен обращаться к PDMS — он хранит данные, не управляет ими", "Конструктор обязателен: инициализирует REAL=0, STRING='', ARRAY=object ARRAY()", "GetTotal() — допустимый метод в data-object (вычисление по собственным данным)"],
  "related_ids": ["obj_member_declaration", "obj_constructor_pattern", "ap_separation_of_concerns", "ap_loader_chain"]
}
```

#### [ap_utility_function]
```json
{
  "id": "ap_utility_function",
  "category": "architecture_patterns",
  "subcategory": "design",
  "title": "Функция vs метод объекта: критерий выбора",
  "principle": "PML предлагает два механизма для переиспользуемой логики: функция (.pmlfnc) — standalone, без состояния, вызывается через !!functionName(); метод объекта — привязан к состоянию объекта (members), вызывается через !obj.method(). Выбор определяется: нужно ли хранить состояние между вызовами?",
  "rule": "Используйте функцию (.pmlfnc), когда: операция stateless (вход→выход), не нужно хранить промежуточные данные, вызывается из разных контекстов. Используйте метод объекта, когда: нужно состояние между вызовами, операция является частью бизнес-процесса объекта, результат зависит от members.",
  "syntax": "-- Функция (stateless utility):\ndefine function !!functionName(!arg1 is TYPE1, !arg2 is TYPE2) is RETURN_TYPE\n  !functionName = !result\nendfunction\n\n-- Метод объекта (stateful):\ndefine method .methodName(!arg is TYPE) is RETURN_TYPE\n  !result = !this.memberData + !arg\n  return !result\nendmethod",
  "example_canonical": "-- CB: ramGetBackRef.pmlfnc — standalone функция (stateless)\ndefine function !!ramGetBackRef(!element is DBREF, !backAttribute is STRING) is DBREF\n  !backRefElement = object DBREF()\n  var !backRefElement BACKREF(attname $!backAttribute) of $!element\n  handle any\n  endhandle\n  return !backRefElement\nendfunction\n\n-- CB: jacPropagateParentData.pmlfnc — standalone функция\ndefine function !!jacPropagateParentData(!parentAttribute is STRING, ...)\n  -- не хранит состояние, не зависит от объекта\n  -- получает всё через аргументы, возвращает результат\nendfunction\n\n-- CB: ramValueConverter.pmlobj, .convertValue() — метод объекта (stateful)\n-- использует !this.errorData (member) для накопления ошибок\n-- состояние между вызовами: .addErrorData() записывает в member",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Macros Rev 2.0, §1.4 (Functions vs methods — scope and purpose)",
  "source_codebase": "ramGetBackRef.pmlfnc, jacPropagateParentData.pmlfnc (stateless functions); ramValueConverter.pmlobj (.convertValue — stateful method)",
  "pitfalls": ["Функция с префиксом !! — глобально доступна после pml rehash", "Функция не может хранить состояние — нет members, нет !this", "Если функция становится слишком сложной (>50 строк, >5 аргументов) — вероятно нужен объект"],
  "related_ids": ["fnc_definition_syntax", "obj_method_declaration", "fnc_return_value", "ap_separation_of_concerns"]
}
```

---

## Раздел 2: Глоссарий PML-терминов

| Термин | Определение |
|--------|-------------|
| **CE** | Current Element — текущий элемент в иерархии PDMS, относительно которого выполняются все команды навигации и запросы атрибутов. Устанавливается командами TAGS, навигации или прямым переходом по DBREF. |
| **PDMS** | Plant Design Management System — система управления проектными данными AVEVA. Хранит иерархию элементов (Tags, Equipment, Pipes) в реляционной БД (DABACON). PML — встроенный язык программирования PDMS. |
| **DBREF** | Database Reference — тип данных PML, представляющий ссылку на элемент в иерархии PDMS. Получается через .dbRef() из строки или из атрибута типа REFERENCE. Проверяется через .badref() и .unset(). |
| **namespace** | Механизм группировки .NET-классов. В PML используется `using namespace 'NamespaceName'` для доступа к .NET-классам без полного квалификатора. Пример: `using namespace 'Aveva.Engineering.PMLElementManager'`. |
| **pmlobj** | Расширение файла PML-объекта. Содержит `define object NAME`, members (атрибуты), конструктор, методы. Загружается через `pml rehash all`. Имя файла должно совпадать с именем объекта (в lowercase). |
| **pmlfnc** | Расширение файла PML-функции. Содержит `define function !!NAME(args)`. Standalone-операция без состояния. Вызывается через `!!functionName(args)`. Загружается через `pml rehash all`. |
| **pmlmac** | Расширение файла PML-макроса. Скрипт с точкой входа, выполняется через `$M macroname` или из командной строки PDMS. Аргументы через `$1..$9`. Используется для pipeline-оркестрации. |
| **pmlfrm** | Расширение файла PML-формы. Содержит `setup form !!NAME`, определение виджетов, callback'и, методы. Показывается через `show !!formName`. Форма = класс с members и методами. |
| **pml rehash** | Команда PDMS, которая перечитывает все PML-файлы из каталогов PMLLIB и перестраивает индекс. `pml rehash all` обновляет все типы (objects, functions, macros, forms). Обязательна после изменения .pmlobj/.pmlfnc. |
| **handle/endhandle** | Конструкция обработки ошибок PML. `handle any` перехватывает все ошибки; `handle (code1,code2)` — конкретные коды; `elsehandle none` — выполняется при отсутствии ошибки. Аналог try/catch. |
| **UNSET** | Состояние переменной PML, которая объявлена но не инициализирована, или атрибута PDMS без значения. Проверяется через `!var.unset()` или `unset(!var)`. Отличается от пустой строки '' и от FALSE. |
| **workon** | NOT_FOUND_IN_SOURCES — не обнаружено в PDF и codebase как PML-команда. Возможно, PDMS CLI-команда для переключения рабочей области (WorkOn MDB). |
| **savework** | Команда PDMS, фиксирующая все изменения элементов в БД. Аналог commit. В codebase используется в 13 макросах, обязательно в блоке ONERROR/handle для предотвращения потери данных. |
| **$P** | Директива PML для вывода текста в командную строку PDMS. Аналог print/echo. Используется для отладки и маркировки шагов pipeline ($P --- STEP 1: ... ---). Результат не сохраняется после закрытия сессии. |
| **$\*** | Директива PML для подавления вывода PDMS-команд. Команда после $* выполняется, но её стандартный вывод не отображается. Полезно при массовых операциях, чтобы не засорять консоль. |
| **$1** | Первый аргумент макроса, переданный из командной строки. Макрос получает аргументы через $1..$9. Пример: `$M mymacro arg1 arg2` → $1='arg1', $2='arg2'. Проверка наличия: `if ('$1' ne '') then`. |
| **$M** | Директива запуска макроса из другого макроса или командной строки PDMS. Синтаксис: `$M macroname arg1 arg2`. Макрос ищется в каталогах PMLLIB. |
| **callback** | Механизм привязки PML-метода к событию виджета формы. Синтаксис: `callback '!this.methodName()'`. При наступлении события (клик, изменение) PDMS вызывает указанный метод формы. Передаётся как строка. |
| **gadget** | Синоним виджета (widget) в терминологии AVEVA PML Forms. Элемент UI формы: BUTTON, TEXTINPUT, LIST, CHECKBOX и т.д. Имеет свойства (.val, .value, .selection) и события (callback). |
| **widget** | Элемент пользовательского интерфейса PML-формы. Типы: BUTTON, TEXT (label), TEXTINPUT, FRAME, LIST, LISTBOX, COMBOBOX, CHECKBOX, RADIOBUTTON, OPTION, PMLNETControl. Определяется в блоке setup form. |
| **form member** | Переменная-член формы PML. Объявляется через `member .name is TYPE` внутри setup form. Доступна из всех методов формы через `!this.name`. Используется для хранения объектов-контроллеров и состояния UI. |
| **object member** | Переменная-член объекта PML. Объявляется через `member .name is TYPE` внутри define object. Хранит состояние объекта между вызовами методов. Доступна через `!this.name` внутри методов. |

---

## Раздел 3: Карта зависимостей codebase

### Формы (Controllers/UI)

```
ramImportExcelProcessor.pmlfrm  [ГЛАВНАЯ ФОРМА ИМПОРТА]
  ├── OWNS: ramImportExcelConfigLoader.pmlobj  (member .meConfigDetails)
  ├── OWNS: ramImportExcelDataLoader.pmlobj    (member .meExcelDataProcessor)
  ├── OWNS: ramImportExcelElementLoader.pmlobj (member .meExcelElementLoader)
  ├── USES: !!ramCommonLogger (global)
  ├── USES: NETGRIDCONTROL / NETDATASOURCE (.NET)
  └── CALLS: !!displayProgress() (global function)

ramCommonLoggerForm.pmlfrm  [ФОРМА ПРОСМОТРА ЛОГОВ]
  ├── USES: !!ramCommonLogger (global — reads .heading, .errorData)
  ├── USES: NETGRIDCONTROL / NETDATASOURCE (.NET)
  └── CALLS: ramFileWriterClass.pmlobj (через logger.writeErrorDataToExcel)

ramImportExcelValidationForm.pmlfrm  [ФОРМА ВАЛИДАЦИИ]
  ├── USES: NETGRIDCONTROL / NETDATASOURCE (.NET)
  └── USES: !!ramCommonLogger (global)

ramImportExcelReclassificationForm.pmlfrm  [ФОРМА РЕКЛАССИФИКАЦИИ]
  ├── USES: ramImportExcelElementLoader.pmlobj (получает reclassifyMasterList)
  └── USES: NETGRIDCONTROL / NETDATASOURCE (.NET)

jacEISDeliveryForm.pmlfrm  [ФОРМА EIS-ДОСТАВКИ]
  └── OWNS: jacEISDeliveryManager.pmlobj (member)

rptoutput.pmlfrm  [ФОРМА ОТЧЁТОВ — LEGACY, САМАЯ КРУПНАЯ ~125KB]
  └── USES: PDMS commands (GETWORK, SAVEWORK, var COLL ALL, WRITEALPHAFILE)
```

### Объекты (Model/Business Logic)

```
ramImportExcelElementLoader.pmlobj  [СОЗДАНИЕ/ОБНОВЛЕНИЕ ЭЛЕМЕНТОВ]
  ├── OWNS: ramTagManagement.pmlobj       (member .tagManagement)
  ├── OWNS: ramValueConverter.pmlobj      (member .valueConverter)
  ├── RECEIVES: ramImportExcelDataLoader  (через .setDataLoader())
  ├── USES: !!ramCommonLogger (global)
  ├── USES: !!displayProgress() (global function)
  └── IMPORTS: RamAEUpdateElement (.NET)

ramImportExcelDataLoader.pmlobj  [ЗАГРУЗКА ДАННЫХ ИЗ EXCEL]
  ├── RECEIVES: ramImportExcelConfigLoader (через .setConfigDetail())
  ├── USES: RamAEPMLExcelReader (.NET namespace)
  └── IMPORTS: RamAEPMLExcelReader (.NET)

ramImportExcelConfigLoader.pmlobj  [ЗАГРУЗКА КОНФИГУРАЦИИ]
  ├── OWNS: ramExcelReaderClass.pmlobj    (member .excelConfiguration)
  └── USES: RamAEPMLExcelReader (.NET namespace)

ramExcelReaderClass.pmlobj  [ЧТЕНИЕ EXCEL — ОБЁРТКА .NET]
  ├── IMPORTS: RamAEPMLExcelReader (.NET)
  └── USES: RamPMLExcelReaderClass (.NET class)

ramTagManagement.pmlobj  [СОЗДАНИЕ ЭЛЕМЕНТОВ PDMS]
  ├── IMPORTS: Aveva.Engineering.PMLElementManager (.NET)
  ├── USES: CREATEELEMENT, ELEMENTTYPE (.NET classes)
  └── USES: !!ramCommonLogger (global)

ramValueConverter.pmlobj  [КОНВЕРТАЦИЯ ТИПОВ]
  └── standalone (no external dependencies except PML builtins)

ramCommonLogger.pmlobj  [ЛОГИРОВАНИЕ]
  ├── OWNS: ramFileWriterClass.pmlobj     (member .fileWriter)
  └── USES: NETGRIDCONTROL / NETDATASOURCE для Excel-экспорта

ramFileWriterClass.pmlobj  [ЗАПИСЬ ФАЙЛОВ]
  └── USES: object FILE() (PML built-in)

jacEISDeliveryManager.pmlobj  [EIS-МЕНЕДЖЕР]
  ├── OWNS: ramExcelReaderClass.pmlobj    (member .excelConfiguration)
  └── IMPORTS: JacReportExtractor (.NET)

TagManagementTmp.pmlobj  [LEGACY УПРАВЛЕНИЕ ТЕГАМИ]
  ├── IMPORTS: Aveva.Engineering.PMLElementManager (.NET)
  ├── IMPORTS: GridControl (.NET)
  ├── IMPORTS: RamPMLExcelReader (.NET)
  ├── USES: !!ramCommonLogger (global) — в методе addErrorToList
  ├── USES: !!displayProgress() (global)
  ├── USES: !!alert (global — PDMS built-in)
  └── USES: PDMS commands (var COLL ALL, SAVEWORK, var EVAL FOR)

LoopData.pmlobj  [DATA-OBJECT ДЛЯ ЦИКЛОВ]
  ├── IMPORTS: Aveva.Engineering.PMLElementManager (.NET)
  ├── IMPORTS: GridControl (.NET)
  └── IMPORTS: RamPMLExcelReader (.NET)

RAMTagMaturityData.pmlobj  [DATA-OBJECT ЗРЕЛОСТИ ТЕГОВ]
  └── standalone (no dependencies — pure data)
```

### Функции (Standalone Utilities)

```
createObjectsFromExcelSheet.pmlfnc
  ├── USES: !!ramCommonLogger (global)
  ├── USES: $P (PDMS output)
  └── USES: handle (2,752) — PDMS-specific error codes

jacExportRDLDataReport.pmlfnc
  ├── USES: COLLECTION().type().filter().results()
  ├── USES: !!ramCommonLogger (global — через undefined() guard)
  └── USES: CLOCK (PDMS performance measurement)

jacPropagateParentData.pmlfnc
  ├── USES: var COLL ALL (PDMS collection)
  └── USES: DBREF navigation (badref, attribute)

ramGetBackRef.pmlfnc
  └── USES: var BACKREF (PDMS backref query)

jacNameRegExValidatorTTY.pmlfnc
  └── IMPORTS: System.Text.RegularExpressions (.NET)

jacUpdateClassDetails.pmlfnc / jacUpdateEquipmentNumber.pmlfnc /
jacUpdateTagName.pmlfnc / jacUpdateTagNameWithBore.pmlfnc
  ├── USES: var COLL ALL (PDMS collection)
  └── USES: !!ramCommonLogger (global)
```

### Макросы (Pipeline Orchestrators)

```
JDE_routine-macro-run.pmlmac  [ГЛАВНЫЙ ОРКЕСТРАТОР — 14 шагов]
  ├── CREATES: !!ramCommonLogger (global)
  ├── CREATES: TagManagementTmp (local)
  ├── CALLS: !!jacUpdateClassDetails()
  ├── CALLS: !!jacUpdateTagName()
  ├── CALLS: !!jacUpdateTagNameWithBore()
  ├── CALLS: !!jacRemoveDocumentDuplicate()
  ├── CALLS: !!jacPropagateParentData()
  └── USES: SAVEWORK, UNCLAIM ALL, ONERROR GOLABEL

JDE_data-import.pmlmac  [ИМПОРТ ДАННЫХ]
  ├── USES: PML RELOAD OBJECT TAGMANAGEMENTTMP
  ├── CALLS: !!createObjectsFromExcelSheet(...)
  └── USES: SAVEWORK

JDE_tagProperties_export.pmlmac  [ЭКСПОРТ ТЕГОВ]
  ├── USES: var COLL ALL (PDMS collection)
  ├── USES: OBJECT DATETIME() (date formatting)
  ├── USES: NETGRIDCONTROL / NETDATASOURCE (.NET)
  └── OUTPUT: .xlsx file via saveGridToExcel

EIS_data_export.pmlmac / EIS_data_update.pmlmac
  └── USES: jacEISDeliveryManager.pmlobj (через форму)
```

---

## Раздел 4: Типичные ошибки и их диагностика

### 4.1. Забытый `handle any / endhandle` вокруг `import`

| Аспект | Описание |
|--------|----------|
| **Симптом** | Макрос/объект не загружается при `pml rehash all`. Ошибка вида: "Cannot find class 'ClassName'" или "Import failed". Ошибка возникает при первом использовании объекта, не при загрузке. |
| **Причина** | Директива `import 'Namespace.Class'` пытается загрузить .NET-сборку. Если сборка не найдена на текущей машине (другая среда, отсутствует DLL), import бросает исключение, которое прерывает загрузку всего pmlobj. |
| **Решение** | Всегда оборачивать import в `handle any / endhandle` — это **обязательный паттерн** codebase. |
| **Пример (codebase)** | `import 'RamAEPMLExcelReader'` / `handle any` / `endhandle` — ramExcelReaderClass.pmlobj, ramImportExcelDataLoader.pmlobj, TagManagementTmp.pmlobj, jacEISDeliveryManager.pmlobj |
| **KB-запись** | `eh_import_protection`, `dn_import_guard` |

### 4.2. Использование `$!name` вместо `$!<name.method()>` в строке

| Аспект | Описание |
|--------|----------|
| **Симптом** | Строковая подстановка возвращает неожиданный результат или ошибку. Вместо вызова метода PML подставляет имя переменной + текст ".method()" буквально. |
| **Причина** | `$!name` подставляет только простую переменную. Для выражений (вызов метода, доступ к свойству) нужны угловые скобки `$!<expression>`. |
| **Решение** | Используйте `$!<variable.method()>` для любых выражений внутри строковой подстановки. `$!name` — только для простых переменных. |
| **Пример (codebase)** | `|$!<combinedDesc>$!<puName>|` (TagManagementTmp), `|log_$!<year>-$!<month>-$!<date>-$!<hour>.xlsx|` (JDE_routine-macro-run), `'ER15 - Excel Type - $!className AVEVA Type - ' + !elementRefe.acttype` (ramImportExcelElementLoader) |
| **KB-запись** | `dt_string_substitution` |

### 4.3. Обращение к ARRAY с индексом 0

| Аспект | Описание |
|--------|----------|
| **Симптом** | Runtime error при обращении `!array[0]`. Ошибка вида: "Index out of range" или "Invalid array index". |
| **Причина** | В PML индексация массивов начинается с 1, не с 0. `!array[1]` — первый элемент, `!array[!array.size()]` — последний. |
| **Решение** | Используйте `do !i from 1 to !array.size()` или `do !item values !array`. Никогда не обращайтесь к !array[0]. |
| **Пример (codebase)** | `do !index indices !masterList` / `!listDetails = !masterList[!index]` — ramImportExcelElementLoader; `do !idx from 2 to !size` — TagManagementTmp (от 2, т.к. [1] — заголовок) |
| **KB-запись** | `dt_array_declaration`, `cf_do_enddo_loop` |

### 4.4. `UNSET` вместо `FALSE` в логических проверках

| Аспект | Описание |
|--------|----------|
| **Симптом** | Условие `if(!var) then` не работает как ожидалось. Переменная не FALSE, а UNSET — это третье состояние. Условие может пройти или не пройти непредсказуемо. |
| **Причина** | PML BOOLEAN имеет три состояния: TRUE, FALSE, UNDEFINED (UNSET). Неинициализированная переменная — UNSET, не FALSE. `if(!var)` для UNSET-переменной ведёт себя не так, как для FALSE. |
| **Решение** | Всегда инициализируйте булевы переменные: `!isError = false`. Проверяйте на UNSET явно: `if(!var.unset()) then`. Не полагайтесь на implicit conversion UNSET→FALSE. |
| **Пример (codebase)** | `!isError = false` / `!isAddedForReclassify = false` — ramImportExcelElementLoader; конструкторы: `!this.draftCount = 0` — RAMTagMaturityData |
| **KB-запись** | `dt_boolean_values`, `dt_unset_handling` |

### 4.5. Не вызван `pml rehash all` после изменения `.pmlobj`

| Аспект | Описание |
|--------|----------|
| **Симптом** | Изменённый объект/функция не обновляется в PDMS. Старая версия продолжает использоваться. Новые методы "не находятся". |
| **Причина** | PML кэширует загруженные объекты. Без `pml rehash all` PDMS использует старую версию из кэша. Для отдельного объекта можно использовать `PML RELOAD OBJECT OBJECTNAME`. |
| **Решение** | После изменения файла: `pml rehash all` (перечитать всё) или `PML RELOAD OBJECT CLASSNAME` (перечитать один объект). В production pipeline: перезагрузка в начале макроса. |
| **Пример (codebase)** | `PML RELOAD OBJECT TAGMANAGEMENTTMP` — JDE_data-import.pmlmac (явная перезагрузка перед использованием) |
| **KB-запись** | `obj_namespace_loading` |

### 4.6. Глобальная переменная `!!var` не очищена между запусками

| Аспект | Описание |
|--------|----------|
| **Симптом** | При повторном запуске макроса глобальная переменная содержит данные от предыдущего запуска. Лог-файл содержит ошибки от прошлого запуска. Прогресс начинается не с нуля. |
| **Причина** | Глобальные переменные (!!prefix) живут до конца сессии PDMS. Повторный запуск макроса не сбрасывает их автоматически. |
| **Решение** | Пересоздавайте глобальные объекты в начале pipeline: `!!ramCommonLogger = object RAMCOMMONLOGGER()`. Конструктор объекта должен вызывать .clear() для members. Используйте `undefined(!!var)` для проверки существования. |
| **Пример (codebase)** | `!!ramCommonLogger = object RAMCOMMONLOGGER()` — JDE_routine-macro-run.pmlmac (пересоздание в начале); `if(undefined(!!ramCommonLogger)) then !!ramCommonLogger = object RAMCOMMONLOGGER() endif` — lazy init в ramImportExcelElementLoader |
| **KB-запись** | `mac_global_variables`, `nc_variable_naming` |

### 4.7. Форма без метода `initialise()` — виджеты не инициализированы

| Аспект | Описание |
|--------|----------|
| **Симптом** | При первом показе формы виджеты пустые, списки не заполнены, кнопки неактивны. Форма выглядит "сломанной" при первом `show`. |
| **Причина** | Метод `initialise()` формы вызывается автоматически при первом `show`. Если он отсутствует или пуст — виджеты остаются в дефолтном состоянии. Отличается от конструктора: конструктор инициализирует members, initialise — виджеты. |
| **Решение** | Определите метод `initialise()` (или `init()` через callback) для заполнения виджетов начальными данными. В codebase конструктор формы создаёт объекты-members, а init/initialise заполняет UI. |
| **Пример (codebase)** | `define method .ramImportExcelProcessor()` — создаёт объекты-members; `define method .init()` — заполняет UI через `!this.initCall()` — ramImportExcelProcessor.pmlfrm |
| **KB-запись** | `frm_initialise_method`, `frm_form_as_class` |

### 4.8. Вызов метода объекта до его создания (`object NAME()` не вызван)

| Аспект | Описание |
|--------|----------|
| **Симптом** | Runtime error: "Object not defined" или "Method not found". Переменная содержит UNSET, а не экземпляр объекта. |
| **Причина** | PML-объект должен быть явно создан через `!obj = object CLASSNAME()` перед вызовом методов. Объявление `member .x is CLASSNAME` не создаёт экземпляр — только резервирует слот. Конструктор обязан вызывать `!this.member = object CLASSNAME()` для каждого member-объекта. |
| **Решение** | В конструкторе объекта/формы создавайте все member-объекты: `!this.tagManagement = object RAMTAGMANAGEMENT()`. Для глобальных: проверяйте `undefined(!!var)` перед использованием. |
| **Пример (codebase)** | `define method .ramImportExcelElementLoader()` / `!this.tagManagement = object RAMTAGMANAGEMENT()` / `!this.valueConverter = object RAMVALUECONVERTER()` — ramImportExcelElementLoader.pmlobj; `if(undefined(!!ramCommonLogger)) then !!ramCommonLogger = object RAMCOMMONLOGGER() endif` — lazy init guard |
| **KB-запись** | `obj_constructor_pattern`, `obj_member_declaration` |

---

## Раздел 5: Чеклист разработчика PML

Перед написанием PML-кода ответьте на следующие вопросы:

### 5.1. Нужен ли `.pmlobj` или достаточно `.pmlfnc`?

**Критерий выбора:**
- Нужно ли хранить состояние между вызовами (members, промежуточные данные)? → `.pmlobj`
- Операция stateless (вход→выход, без побочных эффектов)? → `.pmlfnc`
- Нужна ли группа связанных методов? → `.pmlobj`
- Одна standalone-операция (один вызов, один результат)? → `.pmlfnc`

**Примеры из codebase:**
- `ramGetBackRef.pmlfnc` — stateless: получить BACKREF → вернуть DBREF
- `ramValueConverter.pmlobj` — stateful: накапливает errorData в member

### 5.2. Где хранить состояние?

| Вариант | Когда использовать | Пример из codebase |
|---------|-------------------|-------------------|
| Members объекта (`!this.field`) | Состояние принадлежит бизнес-сущности, переиспользуется между вызовами методов | `!this.errorData` в ramCommonLogger, `!this.excelTables` в ramExcelReaderClass |
| Members формы (`!this.widget`) | UI-состояние, привязка данных к виджетам | `!this.meConfigDetails` в ramImportExcelProcessor |
| `!!globalVar` | Синглтон на всю сессию (логгер, прогресс-бар) | `!!ramCommonLogger`, `!!displayProgress` |
| Локальная `!var` | Временные вычисления внутри метода/функции | `!index`, `!isError`, `!elementRefe` |

### 5.3. Все ли `.NET import` защищены `handle any`?

**Чеклист:**
- [ ] Каждый `import 'Namespace.Class'` обёрнут в `handle any / endhandle`
- [ ] Import расположен в **начале файла** (до define object/function)
- [ ] Проверено: объект работает, если .NET-сборка не найдена (graceful degradation)

**Антипаттерн:** `import 'MyLibrary'` без handle → при отсутствии DLL весь объект не загрузится.

### 5.4. Инициализированы ли все ARRAY перед `append()`?

**Чеклист:**
- [ ] `!array = object ARRAY()` или `!array = ARRAY()` перед первым `.append()`
- [ ] В конструкторе объекта: `!this.items = object ARRAY()` для каждого ARRAY-member
- [ ] После очистки: `.clear()` оставляет ARRAY пустым (не UNSET)

**Антипаттерн:** `.append()` на UNSET-переменной → runtime error.

### 5.5. Проверены ли все DBREF на UNSET/badref перед разыменованием?

**Чеклист:**
- [ ] `!ref.badref().not()` перед доступом к свойствам (`!ref.name`, `!ref.acttype`)
- [ ] `!ref.unset().not()` для переменных, которые могут быть не заполнены
- [ ] `.dbRef()` обёрнут в `handle any / endhandle`
- [ ] Для атрибутов типа REFERENCE: проверка `!tagRef.:Attribute.badref()` перед использованием

**Антипаттерн:** `!name = !tagRef.:TagRefToParentTag.namn` без проверки badref → error если ссылка не установлена.

### 5.6. Есть ли логирование каждого критичного шага?

**Чеклист:**
- [ ] `!!ramCommonLogger` создан в начале pipeline
- [ ] Заголовки заданы: `!!ramCommonLogger.addHeading(!headers.split(|;|))`
- [ ] Каждый шаг маркирован: `$P --- STEP N: DESCRIPTION ---`
- [ ] Ошибки логируются с контекстом: `[элемент, атрибут, описание, severity]`
- [ ] Лог экспортируется в Excel в конце и в обработчике ошибок

### 5.7. Будет ли код работать при пустом входном наборе?

**Чеклист:**
- [ ] `var COLL ALL` может вернуть пустой ARRAY — цикл `do !item values !emptyArray` просто не выполнится
- [ ] Excel-файл может не существовать: `!file = object FILE(!path)` / `if (!file.exists()) then`
- [ ] Excel-лист может быть пустым: проверка `!excelRows.size() gt 0` перед обработкой
- [ ] Имя тега может быть пустым/UNSET: `!name.trim()` + `.set()` + `.neq('')`
- [ ] .NET-объект может не создаться: `!excelReader.error()` после ReadExcel

**Примеры из codebase:**
- `if(!file.exists()) then` — createObjectsFromExcelSheet.pmlfnc (ранний return)
- `!error = !excelReader.error()` / `if(!error.set() AND !error.neq(''))` — ramExcelReaderClass.pmlobj
- `if(!elementRefe.unset()) then` — ramImportExcelElementLoader.pmlobj (создать элемент, если не найден)

---

## Раздел 6: Индекс источников

### 6.1. PDF-документы → записи KB

| PDF-документ | Разделы | Записи KB |
|-------------|---------|-----------|
| **TM-1401 PML Basic Rev 3.0** | §3 Variables | dt_string_declaration, dt_real_declaration, dt_boolean_values, dt_unset_handling, nc_variable_naming |
| | §4 Comments, $P, $* | mac_output_control |
| | §5 Data types | dt_array_declaration, dt_dbref_usage, dt_type_coercion, dt_string_substitution |
| | §5.2 STRING methods | tc_string_to_real, tc_real_to_string, tc_date_parsing |
| | §5.4 BOOLEAN | dt_boolean_values, tc_boolean_from_string |
| | §5.9 DBREF | pdms_dbref_resolve, pdms_element_existence |
| | §6 Operators, control flow | cf_if_elseif_structure, cf_do_enddo_loop, cf_break_skip |
| | §7 PDMS interaction | pdms_current_element, pdms_navigation_commands, pdms_attribute_query, pdms_attribute_update, pdms_element_create, pdms_transaction |
| | §8 Error handling | eh_handle_endhandle, eh_handle_any, eh_error_variable, eh_nested_handle |
| | §8 ONERROR, GOLABEL | ap_pipeline_macro, pdms_transaction |
| **TM-1401 PML Macros Rev 2.0** | §1 Macros | mac_file_structure, mac_arguments, mac_calling_other_macros, mac_global_variables |
| | §1.4 Functions | fnc_definition_syntax, fnc_return_value, fnc_argument_scope |
| | §2 Objects | obj_definition_structure, obj_constructor_pattern, obj_member_declaration, obj_method_declaration, obj_namespace_loading |
| | §3 PDMS Navigation | fnc_pdms_navigation, pdms_navigation_commands, pdms_attribute_query |
| | §4 .NET Interop | dn_import_statement, dn_import_guard, dn_object_instantiation, dn_method_call, dn_type_mapping |
| **TM-1402 Form Design Rev 1.0** | §1 Form structure | frm_file_structure, frm_show_dismiss |
| | §1.4 Form as class | frm_form_as_class, frm_loader_chain |
| | §2 Widgets | frm_widget_common_params, frm_button_callback, frm_list_population, frm_textinput_read, frm_sensitivity_control |
| | §2.15 Form members | obj_delegation_pattern, frm_form_as_class |
| | §2.18 PMLNETControl | dn_excel_read_pattern, dn_file_write_pattern, log_form_integration |
| | §3 Callbacks | frm_callback_syntax, frm_initialise_method |
| | §3.3 FILE object | dn_file_write_pattern |

### 6.2. Файлы codebase → записи KB

| Файл codebase | Записи KB |
|---------------|-----------|
| **ramValueConverter.pmlobj** | tc_db_to_pml_mapping, tc_date_parsing, obj_factory_pattern, dt_type_coercion, dn_type_mapping |
| **ramCommonLogger.pmlobj** | log_severity_levels, log_common_logger_api, obj_overloading_delegation, eh_logging_pattern |
| **ramExcelReaderClass.pmlobj** | dn_excel_read_pattern, dn_import_guard, eh_import_protection, obj_delegation_pattern |
| **ramFileWriterClass.pmlobj** | dn_file_write_pattern, log_output_targets |
| **ramImportExcelConfigLoader.pmlobj** | ap_loader_chain, obj_delegation_pattern |
| **ramImportExcelDataLoader.pmlobj** | ap_loader_chain, obj_overloading_delegation |
| **ramImportExcelElementLoader.pmlobj** | pdms_element_existence, pdms_element_create, pdms_attribute_update, tc_string_to_real, tc_boolean_from_string, cf_guard_clause, ap_loader_chain, nc_variable_naming, nc_method_naming, log_contextual_info |
| **ramTagManagement.pmlobj** | pdms_element_create, pdms_element_existence, dn_object_instantiation |
| **LoopData.pmlobj** | ap_data_object, dn_import_guard |
| **RAMTagMaturityData.pmlobj** | ap_data_object, obj_constructor_pattern |
| **TagManagementTmp.pmlobj** | pdms_attribute_query, pdms_attribute_update, pdms_navigation_commands, pdms_transaction, cf_nested_loops, eh_nested_handle, nc_prefix_conventions |
| **jacEISDeliveryManager.pmlobj** | obj_delegation_pattern, dn_import_guard, nc_object_naming |
| **ramImportExcelProcessor.pmlfrm** | ap_form_controller, ap_loader_chain, frm_form_as_class, frm_loader_chain, frm_callback_syntax |
| **ramCommonLoggerForm.pmlfrm** | log_form_integration, frm_button_callback |
| **ramImportExcelValidationForm.pmlfrm** | frm_widget_common_params |
| **rptoutput.pmlfrm** | pdms_transaction (SAVEWORK reference) |
| **createObjectsFromExcelSheet.pmlfnc** | fnc_array_accumulator, fnc_argument_scope, eh_handle_any |
| **jacExportRDLDataReport.pmlfnc** | fnc_pdms_navigation, pdms_attribute_query |
| **jacPropagateParentData.pmlfnc** | pdms_dbref_resolve, fnc_pdms_navigation |
| **ramGetBackRef.pmlfnc** | pdms_dbref_resolve, ap_utility_function |
| **jacNameRegExValidatorTTY.pmlfnc** | dn_method_call |
| **JDE_routine-macro-run.pmlmac** | ap_pipeline_macro, pdms_transaction, pdms_current_element, mac_pipeline_pattern, log_common_logger_api, log_output_targets |
| **JDE_data-import.pmlmac** | mac_calling_other_macros, obj_namespace_loading |
| **JDE_tagProperties_export.pmlmac** | mac_file_path_pattern, dn_file_write_pattern, tc_real_to_string |
| **EIS_data_export.pmlmac** | pdms_transaction |

---

# ═══════════════════════════════════════════════════
# V2 EXPANSION — Дополнительные записи KB
# Источники: PML.docx, 100 Секретов PML, unread codebase functions
# ═══════════════════════════════════════════════════

## Раздел 1 (продолжение): Дополнительные записи KB

### Категория: data_types (дополнение)

#### [dt_position_methods]
```json
{
  "id": "dt_position_methods",
  "category": "data_types",
  "subcategory": "position",
  "title": "POSITION: Distance, Midpoint, Wrt",
  "principle": "Тип POSITION в PML представляет 3D-координату (E/N/U или X/Y/Z). Объекты POSITION имеют методы для вычисления расстояний (.Distance), нахождения середины (.Midpoint) и преобразования координат (.Wrt) — позволяют делать геометрические расчёты без внешних библиотек.",
  "rule": "Используйте !pos.Distance(!pos2) для расстояния, !pos.Midpoint(!pos2) для средней точки, !pos.Wrt(WORLD) для преобразования в мировые координаты. Результат Distance — REAL с единицами, String('D2') для форматирования.",
  "syntax": "!pos1 = !!CE.Pos.Wrt(WORLD)\n!distance = !pos1.Distance(!pos2).String('D2')\n!midpoint = !pos1.Midpoint(!pos2)",
  "example_canonical": "-- Источник: 100 Секретов PML, §059\nID @\n!pos1 = !!CE.Pos.Wrt(WORLD)\nID @\n!pos2 = !!CE.Pos.Wrt(WORLD)\n!getDistance = !pos1.Distance(!pos2).String('D2')\n\n-- §060 — середина отрезка\n!getMiddle = !pos1.Midpoint(!pos2)",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §5.10 (POSITION data type, methods); 100 Секретов PML §059–060",
  "source_codebase": "NOT_FOUND_IN_SOURCES — позиционные методы в codebase не используются (codebase работает с инженерными данными, не с геометрией)",
  "pitfalls": [".Wrt(WORLD) преобразует в абсолютные координаты — без него координаты относительно owner", "Distance возвращает REAL с единицами (mm) — используйте .String('D2') для форматирования", "POSITION литерал: E1000 N2000 U500 (East/North/Up)"],
  "related_ids": ["dt_real_declaration", "tc_real_to_string", "pdms_current_element"]
}
```

#### [dt_datetime_object]
```json
{
  "id": "dt_datetime_object",
  "category": "data_types",
  "subcategory": "datetime",
  "title": "DATETIME: создание, методы year/month/date/hour",
  "principle": "Объект DATETIME представляет дату и время. Создаётся через конструктор object DATETIME(year,month,day,hour,min,sec) или object DATETIME() для текущего момента. Методы .year(), .month(), .date(), .hour(), .minute() возвращают REAL-компоненты.",
  "rule": "Текущее время: `!dt = OBJECT DATETIME()`. Конкретная дата: `!dt = object DATETIME(2024, 1, 15, 10, 30, 0)`. Для форматирования дат используйте `.month().string('I2')` и т.д.",
  "syntax": "!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')\n!date = !dt.date().string('I2')",
  "example_canonical": "-- CB: JDE_routine-macro-run.pmlmac — формирование даты для имени файла\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')\n!date = !dt.date().string('I2')\n!hour = !dt.hour().string('I2')\n\n-- CB: TagManagementTmp.pmlobj — DATETIME для записи в PDMS\n!datetime = object DATETIME(!y.real(), !m.real(), !d.real(), 00, 00, 00)",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §5.8 (DATETIME); 100 Секретов PML §001 (CLOCK)",
  "source_codebase": "JDE_routine-macro-run.pmlmac, TagManagementTmp.pmlobj (.TryToSetValue), ramValueConverter.pmlobj (.parseDate)",
  "pitfalls": ["Конструктор: (year, month, day, hour, min, sec) — year первым", "object DATETIME() без аргументов = текущее время", "CLOCK INIT/READ — для замера производительности, не для получения даты"],
  "related_ids": ["tc_date_parsing", "tc_real_to_string", "mac_file_path_pattern"]
}
```

### Категория: control_flow (дополнение)

#### [cf_golabel_flow]
```json
{
  "id": "cf_golabel_flow",
  "category": "control_flow",
  "subcategory": "flow",
  "title": "GOLABEL/LABEL — переход по меткам в коде",
  "principle": "GOLABEL и LABEL — PML1-механизм безусловного перехода. Используется для: (1) глобальной обработки ошибок в pipeline (ONERROR GOLABEL /Error), (2) организации retry-циклов с пользовательским вводом. Не рекомендуется для обычной логики — предпочтительнее IF/DO/handle.",
  "rule": "LABEL /name определяет метку. GOLABEL /name выполняет безусловный переход. ONERROR GOLABEL /name — глобальный обработчик ошибок PDMS. В обработчике ошибок обязательно SAVEWORK + UNCLAIM ALL.",
  "syntax": "ONERROR GOLABEL /Error\n-- ... код ...\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\nendhandle\nFINISH",
  "example_canonical": "-- CB: JDE_routine-macro-run.pmlmac\nONERROR GOLABEL /Error\n-- ... pipeline ...\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  !!ramCommonLogger.writeErrorDataToExcel(|...log.xlsx|, false)\nendhandle\nFINISH\n\n-- Источник: 100 Секретов PML §086 — retry-цикл\nLABEL /startagain\n!inputD = !!Alert.Input('Введите число от 1 до 10', '1')\nif (!inputD.Real() LT 1 OR !inputD.Real() GT 10) then\n  GOLABEL /startagain\nendif",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §8 (ONERROR, GOLABEL, LABEL); 100 Секретов PML §086",
  "source_codebase": "JDE_routine-macro-run.pmlmac (ONERROR GOLABEL /Error)",
  "pitfalls": ["GOLABEL — аналог goto, злоупотребление ведёт к spaghetti-коду", "ONERROR GOLABEL — PDMS-механизм (не PML handle): ловит ошибки PDMS-команд", "LABEL/GOLABEL работают только внутри одного файла/макроса"],
  "related_ids": ["ap_pipeline_macro", "pdms_transaction", "eh_handle_endhandle"]
}
```

### Категория: pdms_interaction (дополнение)

#### [pdms_collection_object]
```json
{
  "id": "pdms_collection_object",
  "category": "pdms_interaction",
  "subcategory": "query",
  "title": "PML2 COLLECTION — объектно-ориентированный запрос",
  "principle": "PML2 предоставляет объект COLLECTION как OOP-альтернативу PML1-команде `var !x COLL ALL`. COLLECTION позволяет: задать тип (.type()), фильтр (.filter(EXPRESSION)), scope (.addScope()), и получить массив DBREF (.results()). В отличие от PML1 COLL, results() возвращает массив DBREF, а не строк.",
  "rule": "Создайте объект COLLECTION(), задайте .type('TYPE') и .filter(object EXPRESSION(filterString)), вызовите .results() для массива DBREF. Для простого сбора используйте !!CollectAllFor('TYPE', |filter|, CE).",
  "syntax": "!collection = object COLLECTION()\n!collection.type('ENGITE')\n!expression = object EXPRESSION(!filter)\n!collection.filter(!expression)\n!tags = !collection.results()\n-- или\n!items = !!CollectAllFor('TYPE', |FILTER|, CE)",
  "example_canonical": "-- CB: jacUpdateTagName.pmlfnc — PML2 COLLECTION с динамическим фильтром\n!collection = object COLLECTION()\n!collection.type('ENGITE')\nif(!filter.set() AND !filter.trim().neq('')) then\n  !expression = object EXPRESSION(!filter)\n  !collection.filter(!expression)\nendif\n!tags = !collection.results()\n\n-- CB: jacDeleteUnnamed.pmlfnc — EXPRESSION с фиксированным фильтром\n!collection = object COLLECTION()\n!collection.type('ENGITE')\n!expression = object EXPRESSION(':TagStatus INSET (|ACTIVE|, |VOID|) and NOT(ISNAMED)')\n!collection.filter(!expression)\n!tags = !collection.results()",
  "example_antipattern": "-- использование PML1 VAR COLL ALL без handle (медленнее и возвращает строки, не DBREF):\nVAR !items COLLECT ALL (ENGITE) FOR CE\n-- каждый элемент — строка RefNo, не DBREF; для работы нужно .dbRef()",
  "source_doc": "TM-1401 PML Macros Rev 2.0, §3.2 (COLLECTION object); 100 Секретов PML §035",
  "source_codebase": "jacUpdateTagName.pmlfnc, jacUpdateClassDetails.pmlfnc, jacDeleteUnnamed.pmlfnc, jacRemoveDocumentDuplicate.pmlfnc",
  "pitfalls": ["COLLECTION().results() возвращает DBREF[], а PML1 COLL — STRING[]", "object EXPRESSION() может бросить ошибку при невалидном фильтре — оборачивайте handle", "!!CollectAllFor() — обёртка PML1 COLLECT внутри, медленнее чистого COLLECTION"],
  "related_ids": ["pdms_attribute_query", "pdms_current_element", "cf_do_enddo_loop"]
}
```

#### [pdms_block_evaluate]
```json
{
  "id": "pdms_block_evaluate",
  "category": "pdms_interaction",
  "subcategory": "query",
  "title": "BLOCK + EVALUATE — пакетное вычисление для массивов",
  "principle": "Паттерн BLOCK+EVALUATE позволяет вычислить выражение для каждого элемента массива без цикла DO. object BLOCK('expression with !evalIndex') создаёт «шаблон», .evaluate(!block) применяет его к каждому элементу. Это PML-аналог map/select.",
  "rule": "Создайте BLOCK с выражением, использующим !evalIndex (индекс текущего элемента), и вызовите !array.evaluate(!block). Результат — новый ARRAY с вычисленными значениями.",
  "syntax": "!block = object BLOCK('!array[!evalIndex].attribute(:NAME)')\n!names = !array.evaluate(!block)\n-- или\n!block = object BLOCK('!array[!evalIndex].name')\n!nameList = !array.evaluate(!block)",
  "example_canonical": "-- CB: jacUpdateClassDetails.pmlfnc — извлечение атрибутов из DBREF-массива\n!shellClassTypes = !shellClassRefes.evaluate(object BLOCK(|!shellClassRefes[!evalIndex].attribute(':RDLDabaconExpression').upcase()|))\n\n-- CB: jacExportFullDataReport.pmlfnc — извлечение системных атрибутов\n!engiteAttributes = !systemAttributes.evaluate(object BLOCK(|!systemAttributes[!evalIndex].name()|))\n\n-- Источник: PML.docx — сортировка по полю объекта\n!bl = object BLOCK('!objsArray[!evalindex].b')\n!oneFieldExtractArray = !objsArray.evaluate(!bl)\n!sortedIndexes = !oneFieldExtractArray.sortedindices()\n!objsArray.reindex(!sortedIndexes)",
  "example_antipattern": "-- ручной цикл DO для извлечения одного поля из каждого элемента массива:\ndo !i indices !array\n  !names.append(!array[!i].name)\nenddo\n-- работает, но медленнее и многословнее BLOCK+evaluate",
  "source_doc": "TM-1401 PML Macros Rev 2.0, §2.8 (BLOCK object, evaluate); 100 Секретов PML §010 (EVALUATE); PML.docx (sortedindices+reindex)",
  "source_codebase": "jacUpdateClassDetails.pmlfnc, jacExportFullDataReport.pmlfnc, TagManagementTmp.pmlobj (.GetExAttributes)",
  "pitfalls": ["!evalIndex — специальная переменная внутри BLOCK, не объявляется явно", "BLOCK-выражение — строка, поэтому ошибки синтаксиса обнаруживаются только при evaluate()", "Результат evaluate() — всегда ARRAY of STRING (даже если исходные значения REAL/DBREF)"],
  "related_ids": ["pdms_collection_object", "pdms_attribute_query", "fnc_array_accumulator"]
}
```

#### [pdms_attribute_metadata]
```json
{
  "id": "pdms_attribute_metadata",
  "category": "pdms_interaction",
  "subcategory": "metadata",
  "title": "ATTRIBUTE object и ATTDEF — метаданные атрибутов",
  "principle": "object ATTRIBUTE(!name) и PML1-команда ATTDEF позволяют запросить метаданные атрибута: тип (REAL/TEXT/REFERENCE/LOGICAL), hash-код, категорию, видимость. Это необходимо при динамической работе с атрибутами — когда имя атрибута приходит из конфигурации.",
  "rule": "Используйте `object ATTRIBUTE(!name)` для PML2: .hash() (0 = не существует), .name(), .type(), .category(). Используйте `VAR !data ATTDEF attName TYPE SIZE RPTX` для PML1-метаданных.",
  "syntax": "!attribute = object ATTRIBUTE(!attributeName)\nif (!attribute.hash() neq 0) then\n  !type = !attribute.type()\n  !name = !attribute.name()\nendif\n-- PML1:\nVAR !data ATTDEF POS NAME RPTX TYPE SIZE",
  "example_canonical": "-- CB: ramImportExcelElementLoader.pmlobj — проверка существования атрибута\n!attribute = object ATTRIBUTE(!attributeName)\nif (!attribute.hash() eq 0) then\n  !isError = true\n  !msg = 'Attribute $!attributeName is not existing'\nendif\n\n-- CB: TagManagementTmp.pmlobj — определение типа для конвертации\n!attributeType = !attribute.type()\nif (!attributeType eq 'REAL') then\n  !eleRef.attribute(!attribute.name()) = !attributeValue.real()\nendif\n\n-- CB: jacExportFullDataReport.pmlfnc — системные атрибуты через ELEMENTTYPE\n!baseElement = object elementType('ENGITE')\n!systemAttributes = !baseElement.SYSTEMATTRIBUTES()",
  "example_antipattern": "-- доступ к атрибуту без проверки hash = 0:\n!value = !eleRef.attribute(!attName)\n-- если атрибут не существует в схеме данных, ошибка runtime",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §7.4 (ATTRIBUTE object); PML.docx (ATTDEF); 100 Секретов PML §072",
  "source_codebase": "ramImportExcelElementLoader.pmlobj (.convertValue), TagManagementTmp.pmlobj (.TryToSetValue), jacExportFullDataReport.pmlfnc",
  "pitfalls": [".hash() == 0 означает атрибут не зарегистрирован в текущей схеме", "ATTDEF TYPE возвращает числовой код (1=INT, 2=REAL, 5=REFERENCE), не строку", ".type() объекта ATTRIBUTE возвращает строку ('REAL', 'TEXT', 'REFERENCE')"],
  "related_ids": ["tc_db_to_pml_mapping", "pdms_attribute_update", "pdms_attribute_query"]
}
```

### Категория: forms (дополнение)

#### [frm_track_ce_change]
```json
{
  "id": "frm_track_ce_change",
  "category": "forms",
  "subcategory": "events",
  "title": "TRACK — автоматический вызов при смене CE",
  "principle": "Команда TRACK в форме позволяет подписаться на изменение Current Element: при каждой смене CE автоматически вызывается указанный метод. Это основа для «живых» форм, которые обновляются при навигации пользователя.",
  "rule": "В setup form добавьте `TRACK |DBTYPE| call |!this.methodName()|`. DBTYPE зависит от модуля: DESICE (Design), PADDCE (Draft), CATACE (Catalogue), SYSTCE (Admin). Метод вызывается автоматически при каждой смене CE.",
  "syntax": "setup form !!myForm\n  TRACK |DESICE| call |!this.trackce()|\n  text .ceType 'Type:' width 10 is string\nexit\n\ndefine method .trackce()\n  !this.ceType.val = !!CE.Type\nendmethod",
  "example_canonical": "-- Источник: 100 Секретов PML §070 + PML.docx\nsetup form !!testForm\n  TRACK |PADDCE| call |!this.trackce()|\n  TRACK |DESICE| call |!this.trackce()|\n  text .text1 'Тип CE' width 10 is string\nexit\n\ndefine method .trackce()\n  !getType = !!CE.Type\n  !this.text1.val = !getType\nendmethod\n\n-- PML.docx — также:\n-- track |DBCHANGED| call |!this.trackce()|\n-- для отслеживания изменений в БД",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 PML Form Design Rev 1.0, §3.5 (TRACK command); 100 Секретов PML §070; PML.docx",
  "source_codebase": "NOT_FOUND_IN_SOURCES — в codebase формы используют callback-архитектуру вместо TRACK",
  "pitfalls": ["TRACK вызывает метод при КАЖДОЙ смене CE — метод должен быть быстрым", "Типы БД: DESICE (Design), PADDCE (Draft), CATACE (Catalogue), SYSTCE (Admin), SCHECE (Schematics)", "TRACK |DBCHANGED| — срабатывает при любых изменениях в БД, не только при смене CE"],
  "related_ids": ["frm_callback_syntax", "frm_initialise_method", "pdms_current_element"]
}
```

#### [frm_lifecycle]
```json
{
  "id": "frm_lifecycle",
  "category": "forms",
  "subcategory": "lifecycle",
  "title": "Жизненный цикл формы: конструктор → FirstShownCall → initCall",
  "principle": "Форма PML имеет три фазы инициализации: (1) конструктор (имя формы) — создаёт member-объекты, вызывается один раз; (2) FirstShownCall — вызывается при первом show; (3) initCall — вызывается при каждом show. Разделение позволяет: тяжёлую инициализацию — в конструкторе, обновление UI — в initCall.",
  "rule": "Конструктор: инициализация members (object CLASSNAME()). FirstShownCall: первичная загрузка данных в виджеты. initCall: обновление при каждом показе. Не путайте: initialise() — альтернативное имя для initCall.",
  "syntax": "setup form !!myForm\n  member .data is SOMEOBJECT\nexit\n\ndefine method .myForm()        -- конструктор (1 раз)\n  !this.data = object SOMEOBJECT()\nendmethod\n\ndefine method .firstShownCall() -- при первом show\n  !this.loadInitialData()\nendmethod\n\ndefine method .initCall()       -- при каждом show\n  !this.refreshUI()\nendmethod",
  "example_canonical": "-- CB: ramImportExcelProcessor.pmlfrm — конструктор + init\ndefine method .ramImportExcelProcessor()    -- конструктор\n  !this.meConfigDetails      = object RAMIMPORTEXCELCONFIGLOADER()\n  !this.meExcelDataProcessor = object RAMIMPORTEXCELDATALOADER()\n  !this.meExcelElementLoader = object RAMIMPORTEXCELELEMENTLOADER()\nendmethod\n\n-- PML.docx — описание lifecycle\n-- конструктор: метод с таким же названием как и форма\n-- initCall: вызывается каждый раз при вызове Show()\n-- FirstShownCall: при первом вызове формы",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 PML Form Design Rev 1.0, §3.1 (Form lifecycle); PML.docx",
  "source_codebase": "ramImportExcelProcessor.pmlfrm (конструктор + init)",
  "pitfalls": ["Конструктор вызывается ДО layout — виджеты ещё не доступны для заполнения", "initCall вызывается при КАЖДОМ show — не делайте тяжёлые операции", "Если форма dialog — show блокирует, initCall вызывается до блокировки"],
  "related_ids": ["frm_initialise_method", "frm_form_as_class", "obj_constructor_pattern"]
}
```

### Категория: macros (дополнение)

#### [mac_debug_trace]
```json
{
  "id": "mac_debug_trace",
  "category": "macros",
  "subcategory": "debugging",
  "title": "Отладка PML: $R-коды, PML TRACE, $M-/$M+",
  "principle": "PML предоставляет встроенные инструменты отладки: $R-коды для трассировки (вывод выполняемых строк), $M-/$M+ для пошаговой отладки (пауза/продолжение макроса), PML TRACE ON/OFF для включения трассировки. CLOCK INIT/READ для замера производительности.",
  "rule": "$R4 — трассировка в Shell; $R6 — в Alpha window; $R7 filename — в файл; $R100 — полная трассировка. $M- внутри макроса — пауза, $M+ — продолжить. CLOCK INIT перед операцией, CLOCK READ после.",
  "syntax": "-- Трассировка\n$R6\n-- ... отлаживаемый код ...\n$R0\n\n-- Пауза макроса\n$M-\n-- ... действия пользователя ...\n-- $M+ в командной строке для продолжения\n\n-- Замер времени\nCLOCK INIT\n-- ... операция ...\nCLOCK READ",
  "example_canonical": "-- Источник: PML.docx — $R-коды\n-- $R4 traces executed lines only to Shell window\n-- $R6 traces executed lines only to alpha window\n-- $R7 filename traces to file\n-- $R65 filename traces macro/function changes to file\n-- $R100 full trace of executed lines to Shell window\n-- $R0 — выключить трассировку\n\n-- Источник: 100 Секретов PML §030, §083\nCLOCK INIT\n-- ...операция...\nCLOCK READ\n\n-- §083 — пауза макроса\n-- первый блок кода\n$M-\n-- пауза: пользователь делает действия в PDMS\n-- $M+ в командной строке для продолжения\n-- второй блок кода",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §9 (Debugging PML); PML.docx ($R-коды); 100 Секретов PML §030, §083",
  "source_codebase": "jacExportRDLDataReport.pmlfnc (CLOCK INIT/READ для performance)",
  "pitfalls": ["$R-коды суммируются: $R = 4+32 = 36 (executed lines + line numbers)", "PML TRACE ON требует PMLTRACE=ON в переменных окружения", "$M- работает только в макросах (.pmlmac), не в методах объектов"],
  "related_ids": ["mac_output_control", "mac_pipeline_pattern", "log_output_targets"]
}
```

### Категория: dotnet_interop (дополнение)

#### [dn_file_dialog]
```json
{
  "id": "dn_file_dialog",
  "category": "dotnet_interop",
  "subcategory": "ui",
  "title": "PMLFILEBROWSER / PMLFolderBrowser — диалоги файлов",
  "principle": "Для интерактивного выбора файлов/папок в PML используются .NET-объекты из Aveva.Pdms.Presentation: PMLFILEBROWSER (открытие/сохранение файла) и PMLFolderBrowser (выбор папки). Это замена hardcoded-путям в production-коде.",
  "rule": "import 'PMLFileBrowser' + handle; using namespace 'Aveva.Pdms.Presentation'; создать PMLFILEBROWSER('LOAD'/'SAVE'); .show(path, default, title, modal, filter, filterIndex); получить .file(). Для папки: PMLFolderBrowser().Show(title, true); .selectedPath().",
  "syntax": "import 'PMLFileBrowser'\nhandle any\nendhandle\nusing namespace 'Aveva.Pdms.Presentation'\n!browser = object PMLFILEBROWSER('LOAD')\n!browser.show(!path, '', 'Открытие файла', false, 'txt (*.txt)|*.txt', 2)\n!fileName = !browser.file()",
  "example_canonical": "-- Источник: 100 Секретов PML §013 — открытие файла\nusing namespace 'Aveva.Pdms.Presentation'\nImport 'pmlfilebrowser'\nhandle any\nendhandle\n!browser = object PMLFILEBROWSER('LOAD')\n!filePath = 'D:\\'\n!browser.show(!filePath, '', 'Открытие текстового файла', false, 'Файлы txt (*.txt)|*.txt', 2)\n!FileName = !browser.file()\n\n-- §066 — выбор папки\nimport 'PMLFileBrowser'\nhandle any\nendhandle\nusing namespace 'Aveva.Pdms.Presentation'\n!folder = object PMLFolderBrowser()\n!folder.Show('Выберите папку', true)\n!FolderPath = !folder.selectedPath()",
  "example_antipattern": "-- hardcoded пути в production коде без диалога:\n!path = 'C:\\Users\\ADZV\\OneDrive - Ramboll\\...\\file.xlsx'\n-- путь привязан к одной машине, не работает у других пользователей",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.18 (PML.NET); 100 Секретов PML §013, §014, §066; PML.docx",
  "source_codebase": "NOT_FOUND_IN_SOURCES — в codebase пути hardcoded (legacy), но PMLFileBrowser описан в PML.docx",
  "pitfalls": ["import 'PMLFileBrowser' обязательно с handle — сборка может отсутствовать", "Фильтр формата: 'txt (*.txt)|*.txt' — пара описание|шаблон", "PMLFILEBROWSER('SAVE') для диалога сохранения, ('LOAD') для открытия"],
  "related_ids": ["dn_import_guard", "dn_object_instantiation", "dn_excel_read_pattern"]
}
```

### Категория: error_handling (дополнение)

#### [eh_specific_error_codes]
```json
{
  "id": "eh_specific_error_codes",
  "category": "error_handling",
  "subcategory": "specific_codes",
  "title": "Специфичные коды ошибок: handle(group,code)",
  "principle": "PML позволяет перехватывать не только все ошибки (handle ANY), но и конкретные коды ошибок через handle(group, code). Это позволяет обрабатывать разные ошибки по-разному: например (41,12) — элемент с таким именем уже существует, (61,528) — пользователь нажал Esc в режиме ID.",
  "rule": "Используйте handle(group, code) для перехвата конкретной ошибки. Комбинируйте с elsehandle none для кода при отсутствии ошибки. Коды ошибок: (41,12) — duplicate name, (61,528) — Esc in ID mode, (2,752) — PDMS-specific, (47,10) — string too long, (47,15) — mode not available.",
  "syntax": "handle (41,12)\n  $P Элемент уже существует\nelsehandle none\n  $P Создано успешно\nendhandle",
  "example_canonical": "-- Источник: 100 Секретов PML §085 — перехват дубликата имени\nNEW EQUI /EquiName\nHANDLE (41,12)\n  $P Уже существует\n  DELETE EQUI\nELSEHANDLE NONE\n  $P Создано\nENDHANDLE\n\n-- §019 — перехват Esc в режиме ID\nID @\nHANDLE(61,528)\n  BREAK\nENDHANDLE\n!name = !!CE.NAME\n\n-- CB: createObjectsFromExcelSheet.pmlfnc\nhandle (2,752)\n  -- PDMS-специфичная ошибка\nendhandle\n\n-- CB: TagManagementTmp.pmlobj — перехват конкретных handle\nhandle (2,111)\n  !result.appendArray(!this.getPipesBySuppoRef(!result, !pcomRef))\nelsehandle (2,115)\n  !msg = 'REFNO is Nullref'\nendhandle",
  "example_antipattern": "-- использование handle ANY там, где нужна конкретная обработка:\nNEW EQUI /Name\nhandle any\nendhandle\n-- проглатывает ВСЕ ошибки, включая критичные (нет прав, нет типа, etc)",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §8.2 (handle with error codes); 100 Секретов PML §019, §085",
  "source_codebase": "createObjectsFromExcelSheet.pmlfnc (handle (2,752)), TagManagementTmp.pmlobj (handle (2,111), (2,115), (2,107))",
  "pitfalls": ["Коды ошибок PML не документированы централизованно — show !!messagelist для списка", "handle(group,code) ловит ТОЛЬКО указанный код, остальные пробрасываются выше", "elsehandle none — выполняется когда ошибки НЕ было (аналог try-else в Python)"],
  "related_ids": ["eh_handle_endhandle", "eh_handle_any", "eh_nested_handle"]
}
```

### Категория: architecture_patterns (дополнение)

#### [ap_progress_reporting]
```json
{
  "id": "ap_progress_reporting",
  "category": "architecture_patterns",
  "subcategory": "ui",
  "title": "Отображение прогресса: !!FMSYS.setProgress",
  "principle": "Длительные операции в PDMS обязаны отображать прогресс для пользователя. PML предоставляет !!FMSYS.setProgress(percent) для прогресс-бара и !!FMSYS.setProgressText(text) для текста. !!displayProgress(current, total) — обёртка из codebase. Прогресс-бар появляется автоматически при setProgress > 0.",
  "rule": "Перед циклом: !!FMSYS.setProgress(0). Внутри цикла: !percent = 100 * !index / !total; !!FMSYS.setProgress(!percent). После цикла: !!FMSYS.setProgress(0) для скрытия. Для текста: !!FMSYS.setProgressText('Loading...').",
  "syntax": "!!FMSYS.setProgress(0)\ndo !i indices !items\n  -- операция\n  !percent = 100 * !i / !items.size()\n  !!FMSYS.setProgress(!percent)\nenddo\n!!FMSYS.setProgress(0)",
  "example_canonical": "-- Источник: 100 Секретов PML §018\n!!FMSYS.setProgress(0)\ndo !x from 1 to !items.Size()\n  -- операция\n  !percent = 100 * $!x / !items.Size()\n  !!FMSYS.setProgress(!percent)\nenddo\n\n-- CB: ramImportExcelElementLoader.pmlobj — обёртка displayProgress\n!!displayProgress(1, 100)\ndo !index indices !masterList\n  if(!index.gt(!onePercentValue)) then\n    !!displayProgress(!index, !masterList.size())\n  endif\n  -- операция\nenddo\n\n-- PML.docx — текст прогресса\n!!FMSYS.setProgressText('Tag-doc links recovering from UDAs..')",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1402 Form Design Rev 1.0, §2.19 (!!FMSYS); 100 Секретов PML §018; PML.docx",
  "source_codebase": "ramImportExcelElementLoader.pmlobj (!!displayProgress), TagManagementTmp.pmlobj (!!FMSYS.setProgressText)",
  "pitfalls": ["!!FMSYS.setProgress(0) скрывает прогресс-бар — обязательно в конце", "setProgress принимает REAL 0-100, не дробные проценты", "Не вызывайте setProgress при каждой итерации — замедляет; используйте guard типа !index.gt(!onePercentValue)"],
  "related_ids": ["mac_pipeline_pattern", "cf_do_enddo_loop", "log_output_targets"]
}
```

#### [ap_syscom_external]
```json
{
  "id": "ap_syscom_external",
  "category": "architecture_patterns",
  "subcategory": "integration",
  "title": "SYSCOM — запуск внешних команд из PML",
  "principle": "Команда SYSCOM позволяет запускать внешние процессы из PML: открыть файл, запустить конвертер, открыть папку в Explorer. Это мост между PML и операционной системой.",
  "rule": "SYSCOM |command| — запуск внешней команды. Для фоновых процессов добавьте &. Для путей с пробелами используйте двойные кавычки внутри |...|.",
  "syntax": "SYSCOM |explorer /root, \"$!logFilePath\"|\nSYSCOM |NOTEPAD /P \"$!filePath\"|\nSYSCOM |CMD /C $!converter \"$!file\" &|",
  "example_canonical": "-- Источник: 100 Секретов PML §043 — печать из блокнота\nVAR !COMMAND ' NOTEPAD /P ' + '\"ПУТЬ_К_ФАЙЛУ\" '\nSYSCOM |$!COMMAND|\n\n-- §088 — конвертация в UTF-8\n!ConverterPath = 'C:\\AVEVA\\Plant\\PDMS12.1.SP4\\Transc.exe'\nSYSCOM 'CMD /C $!ConverterPath 0 \"$!FileToConvert\" 65001 -s -b &'\n\n-- PML.docx — открыть папку\nSYSCOM |explorer /root, \"$!logFilePath\"|",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §9.3 (SYSCOM); 100 Секретов PML §043, §064, §088; PML.docx",
  "source_codebase": "NOT_FOUND_IN_SOURCES — в codebase не используется SYSCOM (серверный код)",
  "pitfalls": ["SYSCOM блокирует PML до завершения команды — добавляйте & для фоновых процессов", "Пути с пробелами — обязательно в кавычках внутри SYSCOM", "SYSCOM не возвращает результат — для получения данных пишите во временный файл и читайте через FILE object"],
  "related_ids": ["dn_file_write_pattern", "mac_output_control", "log_output_targets"]
}
```

### Категория: data_types (дополнение)

#### [dt_array_advanced]
```json
{
  "id": "dt_array_advanced",
  "category": "data_types",
  "subcategory": "array",
  "title": "Продвинутые методы ARRAY: Sort, SortedIndices, Invert, ReIndex, SortUnique",
  "principle": "ARRAY в PML имеет набор продвинутых методов: .Sort() (in-place), .SortedIndices() (возвращает массив индексов отсортированных элементов), .reindex(!indices) (переставляет элементы по индексам), .Invert() (разворот), .SortUnique() (удаление дублей + сортировка). Вместе с BLOCK+evaluate они дают мощный инструмент обработки данных.",
  "rule": ".Sort() — сортирует оригинал (необратимо, скопируйте перед вызовом). .SortedIndices() — возвращает ARRAY индексов. .reindex(!indices) — применяет порядок индексов. .SortUnique() — удаляет дубли и сортирует. .Invert() — разворачивает порядок.",
  "syntax": "!sorted = !array\n!sorted.Sort()\n\n!indices = !array.SortedIndices()\n!array.reindex(!indices)\n\n!unique = !array.SortUnique()\n\n!reversed = !array\n!reversed.Invert()",
  "example_canonical": "-- PML.docx — сортировка массива объектов по полю\n!bl = object BLOCK('!objsArray[!evalindex].b')\n!oneFieldExtractArray = !objsArray.evaluate(!bl)\n!sortedIndexes = !oneFieldExtractArray.sortedindices()\n!objsArray.reindex(!sortedIndexes)\n\n-- CB: TagManagementTmp.pmlobj — SortUnique для дедупликации\n!docUniqueList = !docList.sortUnique()\n\n-- 100 Секретов PML §081 — VAR SORT (PML1)\nVAR !SortIndex SORT !ARRAY DESCENDING",
  "example_antipattern": "NOT_FOUND_IN_SOURCES",
  "source_doc": "TM-1401 PML Basic Rev 3.0, §5.6 (ARRAY methods); 100 Секретов PML §081; PML.docx",
  "source_codebase": "TagManagementTmp.pmlobj (.sortUnique), jacExportFullDataReport.pmlfnc (.SortUnique)",
  "pitfalls": [".Sort() модифицирует оригинал — создайте копию перед вызовом: !copy = !original; !copy.Sort()", "SortedIndices() возвращает REAL-массив индексов, не отсортированные значения", ".SortUnique() — эквивалент .Sort() + .Unique() в одном вызове"],
  "related_ids": ["dt_array_declaration", "pdms_block_evaluate", "fnc_array_accumulator"]
}
```

