import type { KBEntry } from '../schemas/kb-entry.js';

export const datatypesEntries: KBEntry[] = [
  {
    "id": "dt_string_declaration",
    "category": "datatypes",
    "subcategory": "string",
    "title": "Объявление и инициализация STRING",
    "principle": "Тип переменной фиксируется в момент первого присвоения и не меняется в течение её жизни, поэтому строковый литерал обязан быть обёрнут в текстовые разделители — иначе PML попытается прочитать его как команду или другой тип.",
    "rule": "Строку объявлять через присвоение литерала в одинарных кавычках 'text' или вертикальных чертах |text|; пустую/UNSET строку — через STRING() или object STRING().",
    "syntax": "!name = |Fred|            $* локальная STRING\n!name = STRING()          $* локальная UNSET STRING\n!s    = object STRING()   $* то же, явный конструктор",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n!this.logElement   = object STRING()\n!this.logAttribute = object STRING()",
    "exampleAntipattern": "!name = Fred   $* ОШИБКА: без разделителей PML читает Fred как команду/идентификатор",
    "pitfalls": [
      "Сравнение строк регистрозависимо (String comparisons are case sensitive), хотя имена переменных — нет",
      "Пустая STRING после object STRING() находится в состоянии UNSET, а не ''"
    ],
    "relatedIds": [
      "dt_unset_handling",
      "dt_string_substitution",
      "tc_real_to_string"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.3.1; §2.9 (text delimiters: 'single quotes' or |vertical bars|)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "dt_real_declaration",
    "category": "datatypes",
    "subcategory": "real",
    "title": "Объявление REAL, отличие от INTEGER",
    "principle": "В PML 2 нет отдельного типа INTEGER — все числа представлены типом REAL; «целочисленность» достигается не типом, а форматированием (FORMAT/INTEGERFMT) при выводе.",
    "rule": "Числовую переменную объявлять присвоением числа (!x = 3) или через REAL()/object REAL() для UNSET; для целочисленного вида применять !!INTEGERFMT при конвертации в строку, а не отдельный тип.",
    "syntax": "!!answer = 42        $* GLOBAL REAL\n!x = REAL()          $* локальная UNSET REAL\n!s = !x.string(!!INTEGERFMT)   $* вывод как целое",
    "exampleCanonical": "-- CB RAMTagMaturityData.pmlobj\n!this.L0 = 0\n!this.L1 = 0\n!result = !this.L0 + !this.L1 + !this.L2",
    "exampleAntipattern": "-- NOT: использовать значение без проверки .set()/.unset() для dt_real_declaration\n-- Плохо: PML может получить UNSET или неверный тип во время выполнения",
    "pitfalls": [
      "Деление и арифметика всегда в REAL — для целого результата округляйте через !!INTEGERFMT или .nint()",
      "STRING нельзя умножать на REAL без .real()"
    ],
    "relatedIds": [
      "tc_string_to_real",
      "tc_real_to_string",
      "dt_type_coercion"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.2.1 (типы STRING/REAL/BOOLEAN/ARRAY); §2.3.1",
    "sourcecodebase": "RAMTagMaturityData.pmlobj"
  },
  {
    "id": "dt_array_declaration",
    "category": "datatypes",
    "subcategory": "array",
    "title": "ARRAY: индексация с 1, append(), size()",
    "principle": "Массив создаётся либо присвоением первого элемента, либо как пустой через ARRAY(); индексация начинается с 1 (не с 0), поэтому код, перенесённый из языков с нулевой базой, ломается тихо.",
    "rule": "Инициализировать массив через object ARRAY() перед накоплением; добавлять элементы методом .append() (или .appendArray() для слияния); первый элемент — [1]; размер — .size().",
    "syntax": "!result = object ARRAY()\n!result.append(!data)\n!result.appendArray(!detail.split(!splitChar))\n!n = !result.size()\n!first = !result[1]",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n!details = object ARRAY()\n!details.AppendArray(!detail.split(!splitChar))\n!this.addLogDetails(!toolName, !details, !severityLevel)",
    "exampleAntipattern": "!x[0] = |a|   $* ОШИБКА: индекс 0 недопустим, элементы нумеруются с 1",
    "pitfalls": [
      "Обращение к индексу 0 — типичная ошибка",
      "ARRAY ELEMENT может сам быть ARRAY → многомерный массив",
      "Перед append() массив должен существовать (object ARRAY())"
    ],
    "relatedIds": [
      "fnc_array_accumulator",
      "cf_do_enddo_loop",
      "dt_unset_handling"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.8 (Arrays); §4.5.1 (.size(), .clear(), .removeFrom())",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "dt_boolean_values",
    "category": "datatypes",
    "subcategory": "boolean",
    "title": "BOOLEAN: TRUE/FALSE/UNSET — три состояния",
    "principle": "BOOLEAN-переменная имеет не два, а три возможных состояния: TRUE, FALSE и UNSET (не инициализирована); проверка «if (!flag)» обрабатывает только TRUE, а UNSET ведёт себя не как FALSE и может вызвать ошибку.",
    "rule": "Инициализировать булевы члены явным FALSE/TRUE в конструкторе; перед логической проверкой непроверенной переменной использовать .set()/.unset(); если значение уже BOOLEAN — сравнение не нужно: if (!flag) then.",
    "syntax": "!!flag = TRUE\nif ( !booleanVariable ) then ... endif\nif ( !value.set() ) then ... endif",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n!this.isFormatApplied = false\n!this.isUnitRequired = false\n!this.isNameWithoutSlah = false",
    "exampleAntipattern": "-- проверка булева, который никогда не инициализировали:\nif (!this.isError) then ...   $* при UNSET .isError даёт неопределённое поведение",
    "pitfalls": [
      "UNSET ≠ FALSE",
      "Инициализируйте все булевы члены в конструкторе .clearFormat()/.clearData()"
    ],
    "relatedIds": [
      "dt_unset_handling",
      "cf_if_elseif_structure",
      "tc_boolean_from_string"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.11 (IF, BOOLEAN expressions); §6.2 (Set()/Unset())",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "dt_dbref_usage",
    "category": "datatypes",
    "subcategory": "dbref",
    "title": "DBREF — ссылка на элемент PDMS",
    "principle": "DBREF — это объект-ссылка на элемент базы данных PDMS, а не сам элемент; его члены суть атрибуты элемента, поэтому через DBREF можно и читать, и присваивать атрибуты, но ссылка может быть UNSET или badref.",
    "rule": "Объявлять member как DBREF; получать через .dbref() от валидного строкового имени или из коллекции; перед разыменованием проверять .set()/.badref(); !!CE — глобальный DBREF текущего элемента.",
    "syntax": "member .ceRef is DBREF\n!elementRefe = object DBREF()\n!elementRefe = !finalName.dbref()\n!branchHeadBore = !!CE.hbore",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n!elementRefe    = object DBREF()\n!finalName      = !this.convertStringToValidDBString(!elementName)\nif(!finalName.set()) then\n  !elementRefe  = !finalName.dbref()\nendif\nreturn !elementRefe",
    "exampleAntipattern": "!bore = !ref.hbore   $* без проверки .badref()/.set() — ошибка, если ref невалиден или атрибут отсутствует",
    "pitfalls": [
      "Перед разыменованием атрибута проверяйте, что он валиден для текущего типа элемента",
      "badref() для битой ссылки",
      "DBREF из неверной строки бросает ошибку — оборачивайте в handle"
    ],
    "relatedIds": [
      "pdms_dbref_resolve",
      "pdms_current_element",
      "dt_unset_handling",
      "tc_db_to_pml_mapping"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.3.4 (!!CE — global DBREF); §4.6 (Using the !!CE Object)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "dt_unset_handling",
    "category": "datatypes",
    "subcategory": "unset",
    "title": "Проверка unset()/set() для неинициализированных переменных",
    "principle": "Любая объявленная без значения переменная находится в состоянии UNSET; обращение к ней в выражении или к её атрибуту часто приводит к ошибке выполнения, поэтому проверка состояния — обязательный guard перед использованием значения.",
    "rule": "Перед использованием значения, пришедшего извне (атрибут PDMS, ячейка Excel, аргумент), проверять .set()/.unset(); метод .set() возвращает TRUE если значение присвоено, .unset() — обратное.",
    "syntax": "if(!value.set()) then ... endif\nif !line.unset() then BREAK endif\nif(!this.logElement.unset() AND !this.logAttribute.unset()) then ...",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\ndo\n  !line = !file.ReadRecord()\n  if !line.unset() then\n    BREAK\n  else\n    !n = !n + 1\n  endif\nenddo",
    "exampleAntipattern": "!result = !value.string()   $* если !value UNSET — может упасть; сперва if(!value.set())",
    "pitfalls": [
      "UNSET-значение в арифметике/строке вызывает ошибку",
      "Чтение readRecord() возвращает UNSET в конце файла — это и есть признак EOF"
    ],
    "relatedIds": [
      "dt_boolean_values",
      "dt_dbref_usage",
      "eh_handle_any",
      "pdms_attribute_query"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §6.2 (Set()/Unset() — methods available to all objects); §2.3.1",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "dt_type_coercion",
    "category": "datatypes",
    "subcategory": "coercion",
    "title": "Неявные преобразования типов",
    "principle": "PML почти не делает неявных преобразований между числом и строкой: STRING нельзя умножить на REAL, оператор '+' над строками конкатенирует, а оператор '&' принудительно приводит оба операнда к STRING — поэтому смешение типов даёт либо ошибку, либо неожиданный результат.",
    "rule": "Для арифметики приводить строку к числу методом .real(); для конкатенации с авто-приведением к строке использовать '&'; не полагаться на авто-конвертацию там, где типы разные.",
    "syntax": "!result = !value.real() * 2     $* явное приведение STRING→REAL\n!c = !a & !b & !m               $* '&' приводит к STRING\n!z = !x + !y                    $* '+' : REAL если оба REAL, иначе строка/ошибка",
    "exampleCanonical": "-- CB ramFileWriterClass.pmlobj\nif(!i.eq(1)) then\n  !rowConcat = !dataList[!i].string()\nelse\n  !rowConcat = !rowConcat + !this.separator + !dataList[!i].string()\nendif",
    "exampleAntipattern": "!value = |56|\n!result = !value * 2   $* ОШИБКА: STRING * REAL недопустимо (TM-1401 §4.5)",
    "pitfalls": [
      "STRING * REAL → ошибка",
      "'+' над строками = конкатенация, не сложение",
      "В PML1 (VAR !z (|$!x|+|$!y|)) результат — STRING; в PML2 (!z=!x+!y) — REAL если оба REAL"
    ],
    "relatedIds": [
      "tc_string_to_real",
      "tc_real_to_string",
      "dt_real_declaration"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §4.5 (switching types, .real()); §3.9 (Concatenation Operator '&')",
    "sourcecodebase": "ramFileWriterClass.pmlobj"
  },
  {
    "id": "dt_string_substitution",
    "category": "datatypes",
    "subcategory": "substitution",
    "title": "$!name против $!<expression> в строках",
    "principle": "Символ $ раскрывает (expand) содержимое переменной в строку до того, как строка читается как команда; форма $!name подставляет простую переменную, а форма $!<...> нужна, когда внутри подстановки есть точка-метод или выражение, иначе PML не поймёт границу имени.",
    "rule": "Для простой переменной писать $!name; если требуется подставить результат метода/выражения (с точкой, скобками) — обязательно оборачивать в $!<expression>.",
    "syntax": "NEW $!componentType XLEN $!xLength       $* простая подстановка\n|...extract_$!<year>-$!<month>-$!<date>|  $* подстановка выражений\n!result = !value$!<valueFormattingText>.string($!formatStr)",
    "exampleCanonical": "-- CB JDE_tagProperties_export.pmlmac\n!publishPath = |C:\\...\\TagPropertyValue_extract_$!<year>-$!<month>-$!<date>-$!<hour>.xlsx|",
    "exampleAntipattern": "!file = |report_$!dt.year().xlsx|   $* НЕВЕРНО: точка-метод требует $!<dt.year()>",
    "pitfalls": [
      "$!name перед точкой-методом обрывается на точке",
      "Если нужен буквальный символ $, вводить два: $$",
      "Команды подаются в процессор как STRING — переменные иного типа надо раскрыть через $"
    ],
    "relatedIds": [
      "mac_file_path_pattern",
      "tc_db_to_pml_mapping"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.3 (Communicating with AVEVA Products — $ expansion); §2.9 ($ escape char)",
    "sourcecodebase": "JDE_tagProperties_export.pmlmac"
  }
];
