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
  },

  {
    id: 'd7_special_char_stripping',
    category: 'datatypes',
    subcategory: 'string',
    title: 'Special character stripping from type names',
    principle: 'Strip invalid characters from element type names using iterative replace() over a character list.',
    rule: 'Define a symbol string containing all invalid characters, split into an array, iterate with DO/ENDDO, calling replace() on each symbol.',
    syntax: `!symbol = |. , - ~ * : ; _ / \\ ' " & ? ! # $ % ( )|\n!symbols = !symbol.split()\n!symbols.append(| |)\n!symbols.append('|')\nDO !symb values !symbols\n  !type = !type.replace(!symb, '')\nENDDO`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac\n!sym = |. , - ~ * : ; _ / \\ ' " & ? ! # $ % ( )|
!symList = !sym.split()
!symList.append(| |)
!symList.append('|')
DO !symb values !symList
  !typeRaw = !typeRaw.replace(!symb, '')
ENDDO
!typeRaw = !typeRaw.trim()`,
    exampleAntipattern: `-- Single replace call misses other characters
!type = !type.replace(|. , - ~|, '')  -- only removes first occurrence of the whole substring`,
    pitfalls: [
      'Must iterate over individual characters, not replace the whole string at once',
      'Trim() after stripping to remove leading/trailing whitespace',
      'The en-dash (‐) character is Unicode and must be copied exactly from source',
      'Pipe character (|) must be appended separately as it may not appear in the split'
    ],
    relatedIds: ['dt_string_declaration', 'dt_string_substitution'],
    sourcedoc: 'AVEVA PML String Object documentation',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    "id": "measure-unit-setunits-defaults",
    "category": "datatypes",
    "subcategory": "units",
    "title": "MEASURE and UNIT objects with setunits",
    "principle": "MEASURE and UNIT objects should set explicit units/defaults before numeric export or conversion.",
    "rule": "MEASURE and UNIT objects must set explicit units/defaults before numeric export or conversion.",
    "syntax": "--set default units\n!AngularFrequencyDimension = object MEASURE('AngularFrequency')",
    "exampleCanonical": "-- CB EIS_data_export.pmlmac\n--set default units\n!AngularFrequencyDimension = object MEASURE('AngularFrequency')\n!rpmUnit = object UNIT(|rpm|)\n!AngularFrequencyDimension.setunits(!rpmUnit)\n!commonAttribiutes = object ARRAY()\n!commonAttribiutes[1][1] = ':RAMTagOwner'\n!commonAttribiutes[1][2] = 'Tag Owner'\n!commonAttribiutes[2][1] = ':TagStatus'\n!commonAttribiutes[2][2] = 'Tag Status'\n!commonAttribiutes[3][1] = 'NAMN of :TagRefToPurchaseOrder'\n!commonAttribiutes[3][2] = 'PO Number'\n!commonAttribiutes[4][1] = ':RAMPackageNumber of :TagRefToPurchaseOrder'\n!commonAttribiutes[4][2] = 'Package'",
    "exampleAntipattern": "-- WRONG: use MEASURE and UNIT objects with setunits without validating the source context in EIS_data_export.pmlmac",
    "pitfalls": [
          "Validate against EIS_data_export.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "EIS_data_export.pmlmac"
  },
  {
    "id": "kb_builtin_undefined",
    "category": "datatypes",
    "subcategory": "variable_introspection",
    "title": "undefined() function for global variable existence check",
    "principle": "Use undefined() to check if a global variable has been assigned before accessing it.",
    "rule": "undefined(!!globalVar) returns TRUE if the global is unassigned, FALSE if assigned.",
    "syntax": "if(undefined(!!globalVar)) then ... endif",
    "exampleCanonical": "-- CB jacEISDeliveryManager.pmlobj\n-- CB obj_09_addErrorToList\nif(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif",
    "exampleAntipattern": "-- Accessing unassigned global without check\n!!ramCommonLogger.addLogDetails(...) -- may crash if not initialized",
    "pitfalls": [
      "Only works with global variables (!!), not local variables (!)"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "jacEISDeliveryManager.pmlobj"
  },
  {
    "id": "kb_pml1_project_code_evar",
    "category": "datatypes",
    "subcategory": "system_variables",
    "title": "PROJECT CODE system variable with !!evar()",
    "principle": "PROJECT CODE is a PML1 system query variable that returns the current PDMS project code. Use !!evar() to evaluate it in PML2 context.",
    "rule": "!!evar(|PDMSUSER|) returns the PDMS user data path. !!evar(!varName + |DFLTS|) returns the project defaults path.",
    "syntax": "var !code PROJECT CODE\n!!evar(!code + |DFLTS|)",
    "exampleCanonical": "-- CB jacEISDeliveryManager.pmlobj\n-- CB obj_09_readConfiguration\n!!filePath = !!evar(|PDMSUSER|) + |\\EISConfiguration.xlsx|\nif(!file.exists().not()) then\n  var !projectCode PROJECT CODE\n  !filePath = !!evar(!projectCode + |DFLTS|) + |\\EISConfiguration.xlsx|\nendif",
    "exampleAntipattern": "-- Using hardcoded paths instead of system variables\n!filePath = 'C:\\\\project\\\\defaults\\\\config.xlsx'",
    "pitfalls": [
      "PROJECT CODE requires being in a PDMS session context",
      "DFLTS path depends on PDMS installation configuration"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PDMS Query Reference",
    "sourcecodebase": "jacEISDeliveryManager.pmlobj"
  },
  {
    "id": "pml_string_format_i2",
    "category": "datatypes",
    "subcategory": "format",
    "title": "STRING.String(FORMAT) with I2 zero-padding",
    "principle": "Use STRING.String(REAL, FORMAT) to format numbers with fixed-width zero-padding",
    "rule": "Use 'I2' format for 2-digit zero-padded integers",
    "syntax": "!int.String('I2')",
    "exampleCanonical": "-- CB EIS_data_update.pmlmac\n!month = !dt.month().string('I2')\n!date = !dt.date().string('I2')\n!hour = !dt.hour().string('I2')",
    "exampleAntipattern": "!month = !dt.month() -- no formatting, single digits",
    "pitfalls": [
      "I2 requires the value to be a REAL or INTEGER",
      "FORMAT is case-sensitive"
    ],
    "relatedIds": [
      "dt_string_declaration"
    ],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "EIS_data_update.pmlmac"
  },
  {
    "id": "d7_empty_na_value_filtering",
    "category": "datatypes",
    "subcategory": "empty-value-detection",
    "title": "Multi-condition empty/NA/unset/zero value filtering",
    "principle": "When importing data from spreadsheets, values may appear as empty strings, 'NA', 'N/A', 'unset', or '0'. All of these should be treated as missing data and skipped. Use chained AND conditions: .empty().not() AND .lowCase() neq 'na' AND .lowCase() neq 'n/a' AND .lowCase() neq 'unset' AND value neq '0'.",
    "rule": "Check value emptiness first with !fileValue.empty().not(). Then check common placeholder strings case-insensitively with .lowCase(). Finally check numeric zero string. Only process if ALL conditions pass (value is non-empty and not a placeholder).",
    "syntax": "if (!fileValue.empty().not() and !fileValue.lowCase() neq |na| and !fileValue.lowCase() neq |n/a| and !fileValue.lowCase() neq |unset| and !fileValue neq |0|) then\\n  -- process value\\nendif",
    "exampleCanonical": "-- CB JDE_vendortag_import.pmlmac\nif (!fileValue.empty().not() and !fileValue.lowCase() neq |na| and !fileValue.lowCase() neq |n/a| and !fileValue.lowCase() neq |unset| and !fileValue neq |0|) then\\n  !tagref.attribute(!attribute1.name()) = !fileValue.real()\\nendif",
    "exampleAntipattern": "-- Only checking empty misses NA/unset values that will cause assignment errors\\nif (!fileValue.empty().not()) then\\n  !tagref.attribute(!attr) = !fileValue  -- May assign 'NA' string to REAL attribute",
    "pitfalls": [
      "Use .lowCase() for case-insensitive comparison — 'NA', 'na', 'Na' are all placeholders",
      "The .not() after .empty() is necessary — .empty() returns TRUE for empty strings",
      "Numeric zero '0' is a valid value for some attributes but may indicate missing data in vendor imports",
      "Consider adding 'null', 'none', '-' as additional placeholder values"
    ],
    "relatedIds": [
      "dt_string_substitution"
    ],
    "sourcedoc": "AVEVA PML String Objects",
    "sourcecodebase": "JDE_vendortag_import.pmlmac"
  },
  {
    "id": "mac_08:unknown:75",
    "category": "datatypes",
    "subcategory": "empty-value-detection",
    "title": "Multi-condition empty/NA/unset/zero value filtering",
    "principle": "Export/import filters should reject empty, unset, NA-like, and zero sentinel values before processing.",
    "rule": "Export/import filters must reject empty, unset, NA-like, and zero sentinel values before processing.",
    "syntax": "						!attributeName1 = !mappingData[!mappedIdx][2]\n						!attributeName2 = !mappingData[!mappedIdx][3]",
    "exampleCanonical": "-- CB JDE_vendortag_import.pmlmac\n						!attributeName1 = !mappingData[!mappedIdx][2]\n						!attributeName2 = !mappingData[!mappedIdx][3]\n						!attribute1 = object ATTRIBUTE(!attributeName1)\n						!attribute2 = object ATTRIBUTE(!attributeName2)\n						if (!fileValue.empty().not() and !fileValue.lowcase() neq |na| and !fileValue.lowcase() neq |n/a| and !fileValue.lowcase() neq |unset| and !fileValue neq |0|) then\n							--set value for attribute 1 (shell attribute)\n							if (!attribute1.hash() gt 0) then\n								!currentValue = !tagref.attribute(!attribute1.name())\n								handle none\n									!isError = false\n									!valueType = !currentValue.objecttype()\n									if (!valueType eq 'REAL') then\n										!tagref.attribute(!attribute1.name()) = !fileValue.real()\n										handle any",
    "exampleAntipattern": "-- WRONG: use Multi-condition empty/NA/unset/zero value filtering without validating the source context in JDE_vendortag_import.pmlmac",
    "pitfalls": [
          "Validate against JDE_vendortag_import.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_vendortag_import.pmlmac"
  },
  {
    "id": "mac_08:unknown:77",
    "category": "datatypes",
    "subcategory": "string-cleaning",
    "title": "Special character stripping via iterative replace",
    "principle": "Iterative STRING.replace() calls can normalize special characters before comparing or exporting values.",
    "rule": "Iterative STRING.replace() calls can normalize special characters before comparing or exporting values.",
    "syntax": "		--progress\n		!rowIdx = !data.findFirst(!row)",
    "exampleCanonical": "-- CB JDE_vendortag_import.pmlmac\n		--progress\n		!rowIdx = !data.findFirst(!row)\n		!!displayProgress(!rowIdx, !data.size())\n		!Tag = !row[!nameId].replace(|‐|, |-|).trim()\n		!Type = !row[!typeId]\n		--clean Type\n		!symbol = |. , - ~ * : ; _ / \ ' \" & ? ! # $ % ( )|\n		!symbols = !symbol.split()\n		!symbols.append(| |)\n		do !symb values !symbols\n			!Type = !Type.replace(!symb, '')\n		enddo",
    "exampleAntipattern": "-- WRONG: use Special character stripping via iterative replace without validating the source context in JDE_vendortag_import.pmlmac",
    "pitfalls": [
          "Validate against JDE_vendortag_import.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_vendortag_import.pmlmac"
  },
  {
    "id": "obj_08_dateformat_constructor",
    "category": "datatypes",
    "subcategory": "dateformat",
    "title": "DATEFORMAT object string constructor",
    "principle": "DATEFORMAT objects can be created using `object DATEFORMAT(string)` where the string specifies the date format pattern.",
    "rule": "Use `object DATEFORMAT(\\",
    "syntax": "!dateFormat = object DATEFORMAT(\\",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\\n!this.dateFormat = object DATEFORMAT(\\",
    "exampleAntipattern": "-- DATEFORMAT has no default constructor without arguments in all versions\\n  !df = object DATEFORMAT()  -- may fail; use empty string instead",
    "pitfalls": [
      "DATEFORMAT constructor signature varies by AVEVA version.",
      "The empty string constructor is the safest cross-version approach.",
      "DATEFORMAT is used by STRING.String(DATEFORMAT) for date-to-string conversion."
    ],
    "relatedIds": [
      "dt_string_declaration"
    ],
    "sourcedoc": "AVEVA E3D PML Reference — DATEFORMAT Object",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "obj_08_datetime_constructor",
    "category": "datatypes",
    "subcategory": "datetime",
    "title": "DATETIME object 3-argument constructor (year, month, day)",
    "principle": "DATETIME objects can be constructed from three REAL arguments representing year, month, and day.",
    "rule": "Use `object DATETIME(year, month, day)` where each argument is a REAL number. The constructor creates a DATETIME from the individual components.",
    "syntax": "!dt = object DATETIME(!year, !month, !day)",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\\n!datetime = object DATETIME(\\n  !value.split(!separationChar)[3].real(),\\n  !value.split(!separationChar)[2].real(),\\n  !value.split(!separationChar)[1].real()\\n)\\n-- Parses \"DD.MM.YYYY\" format where separationChar is \".\"",
    "exampleAntipattern": "-- DATETIME has no single-string constructor in all versions\\n  !dt = object DATETIME(\"2024-01-15\")  -- may fail; use 3-arg form",
    "pitfalls": [
      "Argument order is year, month, day — not day, month, year.",
      "Each argument should be a REAL (use .real() on strings).",
      "Invalid dates (e.g., month > 12) may cause runtime errors."
    ],
    "relatedIds": [
      "obj_08_dateformat_constructor",
      "obj_08_dynamic_constructor"
    ],
    "sourcedoc": "AVEVA E3D PML Reference — DATETIME Object",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "obj_08_dbref_namn",
    "category": "datatypes",
    "subcategory": "dbref",
    "title": "DBREF namn member — name without slash prefix",
    "principle": "DBREF objects expose a `namn` member that returns the element name without the leading \"/\" slash character.",
    "rule": "Access `!dbrefVal.namn` to get the element name without the slash prefix. This is distinct from the `Name` member which includes the full path.",
    "syntax": "!nameWithoutSlash = !dbrefVal.namn",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\\nif(!type.eq(\\",
    "exampleAntipattern": "-- Confusing namn with Name\\n  !name = !dbrefVal.Name  -- includes full path with /",
    "pitfalls": [
      "`namn` is lowercase — PML is case-insensitive but this follows convention.",
      "`namn` is a member, not a method — do not use parentheses.",
      "Only DBREF objects have the namn member."
    ],
    "relatedIds": [
      "dt_string_declaration"
    ],
    "sourcedoc": "AVEVA E3D PML Reference — DBREF Object",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "obj_08_dynamic_constructor",
    "category": "datatypes",
    "subcategory": "dynamic_type",
    "title": "Dynamic type constructor with $!string variable",
    "principle": "PML allows dynamic type construction using the $! prefix with a STRING variable containing a type name.",
    "rule": "Use `object $!typeName()` where `typeName` is a STRING variable or expression containing a valid PML type name (e.g., \"STRING\", \"REAL\", \"DBREF\"). The parser resolves the type at runtime.",
    "syntax": "!obj = object $!typeName()",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\\n!data = object $!subType()\\n-- If !subType is \"REAL\", this creates a REAL object\\n-- If !subType is \"DBREF\", this creates a DBREF object",
    "exampleAntipattern": "-- Dynamic constructor with literal type name defeats the purpose\\n!data = object REAL()  -- always creates REAL, not dynamic",
    "pitfalls": [
      "The type string must match a valid PML type name exactly.",
      "Invalid type names will cause a runtime error.",
      "This pattern is advanced and should be documented carefully."
    ],
    "relatedIds": [
      "dt_string_declaration",
      "dt_array_declaration"
    ],
    "sourcedoc": "AVEVA PML Customization — Object Construction",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "obj_08_dynamic_method_call",
    "category": "datatypes",
    "subcategory": "dynamic_method",
    "title": "Dynamic method call via $! dollar-substitution",
    "principle": "PML allows dynamic method invocation by embedding a variable in the method name path using $! dollar-substitution syntax.",
    "rule": "Use `!value$!<methodText>.method(arg)` where `<methodText>` is a local variable containing the method call text (e.g., `.value()`). The parser substitutes the variable content into the method chain at parse time.",
    "syntax": "!result = !value$!<methodText>.string($!formatStr)",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\\n!valueFormattingText = \\",
    "exampleAntipattern": "-- Cannot use a method call result as the method name\\n!result = !value.!dynamicMethod()  -- INVALID syntax",
    "pitfalls": [
      "The dollar-substitution is resolved at parse time, not runtime.",
      "The substituted text must be a valid method call suffix.",
      "This is an advanced PML feature rarely documented."
    ],
    "relatedIds": [
      "obj_08_dynamic_constructor"
    ],
    "sourcedoc": "AVEVA PML Customization — Dollar Special Symbols",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "obj_08_format_label",
    "category": "datatypes",
    "subcategory": "format",
    "title": "FORMAT object label member",
    "principle": "FORMAT objects have a `label` member that can be set to append a unit label to formatted output strings.",
    "rule": "Set `!formatObj.label = !unitLabel` to configure the FORMAT object with a unit label for string formatting operations.",
    "syntax": "!format.label = !value.unit().shortname()",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\\nif(!this.isFormatApplied AND !this.isUnitRequired) then\\n  !format.label = !value.unit().shortname()\\n  !formatStr = \\",
    "exampleAntipattern": "-- FORMAT has no setLabel() method — must assign to label member directly\\n  !format.setLabel(!unit)  -- INVALID: no such method",
    "pitfalls": [
      "`label` is a member assignment, not a method call.",
      "FORMAT object documentation is scarce in official KB.",
      "The label is used by STRING.String(FORMAT) to append unit text."
    ],
    "relatedIds": [
      "dt_string_declaration"
    ],
    "sourcedoc": "AVEVA E3D PML Reference — FORMAT Object",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "obj_08_real_unit",
    "category": "datatypes",
    "subcategory": "real",
    "title": "REAL object unit() method and unit properties",
    "principle": "REAL objects in AVEVA have a `unit()` method that returns a unit descriptor object with `name()` and `shortname()` methods.",
    "rule": "Use `!realVal.unit().name()` to get the full unit name and `!realVal.unit().shortname()` to get the abbreviated unit name.",
    "syntax": "!unitName = !value.unit().name()\\n!unitShort = !value.unit().shortname()",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\\n!isReal = !value.objectType().EQNoCase(\\",
    "exampleAntipattern": "-- Checking unit on non-REAL value\\n  !u = !stringVal.unit()  -- INVALID: STRING has no unit() method",
    "pitfalls": [
      "Only REAL objects have the unit() method.",
      "The unit() method may return UNSET if the REAL has no assigned unit.",
      "Always verify the object type before calling unit()."
    ],
    "relatedIds": [
      "dt_real_declaration"
    ],
    "sourcedoc": "AVEVA E3D PML Reference — REAL Object",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "obj_08_unset_method",
    "category": "datatypes",
    "subcategory": "unset",
    "title": "unset() method on PML objects",
    "principle": "PML objects support an `unset()` method that returns TRUE if the object has no assigned value.",
    "rule": "Use `!obj.unset()` to test whether an object reference is unset (not yet initialized or cleared). Use `!obj.set()` to test whether it IS set.",
    "syntax": "if(!obj.unset()) then\\n  -- object is not initialized\\nendif\\nif(!obj.set()) then\\n  -- object is initialized\\nendif",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\\nif(!this.logElement.unset() AND !this.logAttribute.unset()) then\\n  !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorData)\\nelse\\n  -- build error list\\nendif",
    "exampleAntipattern": "-- Comparing to UNSET literal instead of using method\\n  if(!obj eq UNSET) then  -- may not work; use .unset() method instead",
    "pitfalls": [
      "`unset()` is a method, not a keyword — use parentheses.",
      "The negation `.not()` can also be used: `!obj.unset().not()` equals `!obj.set()`.",
      "STRING objects created with `object STRING()` are set (empty, not unset)."
    ],
    "relatedIds": [
      "dt_string_declaration",
      "obj_08_ramcommonlogger"
    ],
    "sourcedoc": "AVEVA PML Customization — Object Methods",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "mac_20:unknown:167",
    "category": "datatypes",
    "subcategory": "string_manipulation",
    "title": "STRING .after() method for substring extraction",
    "principle": "STRING.after() extracts the suffix after a marker and is useful for parsing generated command/text fields.",
    "rule": "STRING.after() extracts the suffix after a marker and is useful for parsing generated command/text fields.",
    "syntax": "	--step 1: create dbView\n	!dbView = !dbViewName.dbref()",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n	--step 1: create dbView\n	!dbView = !dbViewName.dbref()\n	handle any\n		!dbViewDesc = !dbViewName.after(|/|)\n		NEW DBVW $!dbViewName\n		!dbViewUdname = !dbViewDesc.replace(|-|, | |)\n		DESC |$!dbViewUdname|\n		UDNA |$!dbViewUdname|\n		AUTCRE TRUE\n		ALWDEL TRUE\n		ELEL REM ALL\n		!dbView = !!ce\n	endhandle",
    "exampleAntipattern": "-- WRONG: use STRING .after() method for substring extraction without validating the source context in JDE_dbView_creator.pmlmac",
    "pitfalls": [
          "Validate against JDE_dbView_creator.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
          "string_after_method",
          "dt_string_declaration"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "pml_string_chained_methods",
    "category": "datatypes",
    "subcategory": "string",
    "title": "Chained STRING methods: replace().trim(), findfirst(), lowcase()",
    "principle": "STRING objects support method chaining in PML2. Common patterns include replace().trim() for data cleaning and findfirst() for array searching.",
    "rule": "Chain .replace().trim() for cleaning input strings. Use .findfirst() to search ARRAY of strings.",
    "syntax": "!clean = !raw.replace(|search|, |replace|).trim()\n!idx = !array.findfirst(|value|)\n!lower = !text.lowcase()",
    "exampleCanonical": "-- CB EBE_assetRegister_import.pmlmac\n!tag = !row[!nameId].replace(|-|, |-|).trim()\n!class = !row[!classId].replace(|-|, |-|).trim()\n!nameId = !heading.findfirst(|NAME|)\nif (!class.lowcase() neq |unset|) then",
    "exampleAntipattern": "!tag = trim(!row[!nameId])  -- trim is method, not function",
    "pitfalls": [
      "findfirst returns an index value, not a boolean — use .set() to test validity",
      "replace takes two pipe-delimited strings: search pattern and replacement",
      "lowcase() returns a copy, does not modify in place"
    ],
    "relatedIds": [
      "dt_string_declaration"
    ],
    "sourcedoc": "string object.md, ARRAY object.md",
    "sourcecodebase": "EBE_assetRegister_import.pmlmac"
  },
  {
    "id": "string_after_method",
    "category": "datatypes",
    "subcategory": "string_manipulation",
    "title": "STRING .after() method for substring extraction",
    "principle": "STRING objects provide .after() method to extract substring after a delimiter",
    "rule": "!result = !str.after(|delimiter|) returns the portion of string after the first occurrence of delimiter",
    "syntax": "!result = !stringVar.after(|delimiter|)",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\n!name = |/RAM/MyView|\n!afterSlash = !name.after(|/|)\n$P Result: $!afterSlash",
    "exampleAntipattern": "!afterSlash = !name.substring(|/|)  -- not valid PML",
    "pitfalls": [
      "Returns empty string if delimiter not found",
      "Case-sensitive delimiter matching"
    ],
    "relatedIds": [
      "string_replace_method"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "string_replace_method",
    "category": "datatypes",
    "subcategory": "string_manipulation",
    "title": "STRING .replace() method for text substitution",
    "principle": "STRING objects provide .replace(old, new) method for text substitution",
    "rule": "!result = !str.replace(|oldText|, |newText|) returns string with all occurrences of oldText replaced by newText",
    "syntax": "!result = !stringVar.replace(|old|, |new|)",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\n!dbViewUdname = !dbViewDesc.replace(|-|, | |)\n$P Converted: $!dbViewUdname",
    "exampleAntipattern": "!result = !str.replace('-',' ')  -- single quotes not valid PML pipe strings",
    "pitfalls": [
      "Use | pipe delimiters for string arguments",
      "Replaces all occurrences, not just first"
    ],
    "relatedIds": [
      "string_after_method"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "string_unset_empty_methods",
    "category": "datatypes",
    "subcategory": "string_validation",
    "title": "String .unset() and .empty() methods",
    "principle": "PML string objects provide .unset() and .empty() methods for validation. .unset() checks if the variable is unset/BADREF. .empty() checks if the string is empty or whitespace.",
    "rule": "Use !str.unset() to check BADREF/unset state. Use !str.empty() to check for empty/whitespace content. Combine with .or() for guard conditions.",
    "syntax": "if (!str.unset() or !str.empty()) then\n  -- handle missing or empty value\nendif",
    "exampleCanonical": "-- CB JDE_dbView_extractor.pmlmac\nif (!udName.unset() or !udName.empty()) then\n  var !attData ATTDEF $!<att.DbAttribute> NAME TYPE RPTX SIZE DEFI DTYP UNIT VISI QSET QTXT ITYP DESTEX\n  handle none\n    !udName = !attData[3]\n  endhandle\nendif",
    "exampleAntipattern": "-- WRONG: omit validated pattern for String .unset() and .empty() methods\n-- Review source JDE_dbView_extractor.pmlmac before reuse",
    "pitfalls": [
      ".unset() returns TRUE if the variable is BADREF or never assigned",
      ".empty() returns TRUE for empty strings and whitespace-only strings"
    ],
    "relatedIds": [
      "dt_string_declaration"
    ],
    "sourcedoc": "JDE_dbView_extractor.pmlmac",
    "sourcecodebase": "JDE_dbView_extractor.pmlmac"
  },
  {
    "id": "variable_interpolation_dollar",
    "category": "datatypes",
    "subcategory": "string",
    "title": "$!<var> variable interpolation in pipe-delimited strings",
    "principle": "PML supports $!<variable> syntax for interpolating local/global variable values into pipe-delimited strings at macro execution time.",
    "rule": "Use $!<varname> inside |...| strings to embed variable values. For attribute references use $!/attribute.",
    "syntax": "!publishPath = |C:\\path\\file_$!<year>-$!<month>-$!<date>.xlsx|",
    "exampleCanonical": "-- CB JDE_fullDataProperties-export.pmlmac\n!publishPath = |C:\\...\\TagPropertyValue_full_extract_$!<year>-$!<month>-$!<date>-$!<hour>.xlsx|\n-- CB LoopData.pmlobj\n!logFile = |$!<this.pathName>\\$!logName|",
    "exampleAntipattern": "-- WRONG: omit validated pattern for $!<var> variable interpolation in pipe-delimited strings\n-- Review source JDE_fullDataProperties-export.pmlmac before reuse",
    "pitfalls": [
      "$!<var> vs $!var: angle brackets are used for local variables in some contexts; $!name per syntax reference is for command substitution.",
      "Mixing $!<var> and $!name in the same string is valid but may cause confusion."
    ],
    "relatedIds": [
      "datetime_object_methods"
    ],
    "sourcedoc": "AVEVA PML Syntax — Dollar special symbols",
    "sourcecodebase": "JDE_fullDataProperties-export.pmlmac"
  },
  {
    "id": "macro_string_delimiter_error_handler",
    "category": "datatypes",
    "subcategory": "string",
    "title": "String delimiters required in error handler function calls",
    "principle": "All string arguments to PML functions must use pipe delimiters (|text|) even inside error handlers.",
    "rule": "Always wrap string literals in pipe delimiters in function call arguments, including in error handler blocks.",
    "syntax": "!!functionName(|/path/to/file.xlsx|, false)",
    "exampleCanonical": "-- CB JDE_vendorPackage-reports.pmlmac\n-- Correct: pipe-delimited string argument\n!!ramCommonLogger.writeErrorDataToExcel(|/project/output/log.xlsx|, false)\n\n-- Anti-pattern: bare path without delimiters\n!!ramCommonLogger.writeErrorDataToExcel(/project/output/log.xlsx, false)",
    "exampleAntipattern": "!!ramCommonLogger.writeErrorDataToExcel(/project/output/log.xlsx, false)",
    "pitfalls": [
      "Paths without string delimiters may parse as variable substitutions or cause syntax errors.",
      "Error handlers are often written hastily and may omit delimiters that are present in main code."
    ],
    "relatedIds": [
      "dt_string_declaration"
    ],
    "sourcedoc": "AVEVA PML Expressions - String Handling",
    "sourcecodebase": "JDE_vendorPackage-reports.pmlmac"
  },
  {
    "id": "pml_block_constructor",
    "category": "datatypes",
    "subcategory": "block",
    "title": "object BLOCK(...) Constructor for Collection Evaluation",
    "principle": "Use object BLOCK(...) to create an inline code block that can be passed to collection methods like evaluate(). The block is evaluated once per collection element with the element referenced by the loop variable.",
    "rule": "Wrap a PML expression in object BLOCK(|expression|) to pass it as a block argument. Inside the block, use the loop variable name (e.g., !evalIndex) to access the current collection element.",
    "syntax": "!result = !collection.evaluate(object BLOCK(|!loopVar.:Attribute|))",
    "exampleCanonical": "-- CB TB terminal correction macro.pmlmac\n-- CB mac_46\n!markings = !channelTerminals.evaluate(\n  object BLOCK(|!channelTerminals[!evalIndex].:marking[1]|)\n)",
    "exampleAntipattern": "-- BAD: Passing a string instead of a block\n!markings = !channelTerminals.evaluate('|!channelTerminals[!evalIndex].:marking[1]|')",
    "pitfalls": [
      "The variable name inside object BLOCK must match the implicit iteration variable of the collection",
      "object BLOCK(...) is not the same as a string expression — it creates a PML code block",
      "Block variables are scoped to the evaluate() call"
    ],
    "relatedIds": [
      "dt_string_declaration"
    ],
    "sourcedoc": "AVEVA PML Reference — Collection Methods",
    "sourcecodebase": "TB terminal correction macro.pmlmac"
  },
  {
    "id": "string_ift_function",
    "category": "datatypes",
    "subcategory": "string",
    "title": "IFT() conditional function",
    "principle": "IFT() is a PML inline conditional function: IFT(condition, trueValue, falseValue).",
    "rule": "Use IFT(test, valueIfTrue, valueIfFalse) for inline conditional logic in expressions.",
    "syntax": "IFT(condition, trueValue, falseValue)",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\n!expression = IFT(!mappingRowRef.:RDLDabaconExpression.unset() or !mappingRowRef.:RDLDabaconExpression.empty(), !attributeEntry.:RDLDabaconExpression, !mappingRowRef.:RDLDabaconExpression)",
    "exampleAntipattern": "if (!condition) then\n    !result = |true_val|\nelse\n    !result = |false_val|\nendif  -- longer form",
    "pitfalls": [
      "All three arguments are evaluated before the function call — no short-circuit evaluation",
      "Return type is ANY; may need explicit type handling"
    ],
    "relatedIds": [
      "string_inset_function",
      "block_evaluate_expression"
    ],
    "sourcedoc": "AVEVA PML Customization — PML Expressions",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  },
  {
    "id": "string_inset_function",
    "category": "datatypes",
    "subcategory": "string",
    "title": "inset() string containment function",
    "principle": "inset() checks whether a string value is contained in a list of string values.",
    "rule": "Use inset(string, |val1|, |val2|, ...) to test if the string matches any of the listed values. Returns TRUE or FALSE.",
    "syntax": "inset(:AttributeName, |value1|, |value2|, |value3|)",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\nLOWCASE(:TagClassName) inset(|gas detector|, |heat detector|, |junction box|)",
    "exampleAntipattern": ":TagClassName eq |gas detector| or :TagClassName eq |heat detector|  -- verbose equivalent",
    "pitfalls": [
      "inset() is case-sensitive; use LOWCASE() or UPCASE() for case-insensitive matching",
      "Only available in PML1 WITH clause expressions"
    ],
    "relatedIds": [
      "pml1_coll_all_query_syntax",
      "string_ift_function"
    ],
    "sourcedoc": "AVEVA PML Customization — PML Expressions",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  },
  {
    "id": "var_delete_loop_clear",
    "category": "datatypes",
    "subcategory": "variables",
    "title": "var !name DELETE to explicitly clear variable in loop",
    "principle": "var !name DELETE explicitly unsets a variable before reuse in a loop iteration.",
    "rule": "Use \"var !varName DELETE\" at the start of a loop body to ensure the variable is UNSET before assignment.",
    "syntax": "do !i from 1 to !count\\n    var !result DELETE\\n    !result = compute(!i)\\nenddo",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\ndo !x from !idx to !classes.size()\n    var !value DELETE\n    -- ... compute !value ...\nenddo",
    "exampleAntipattern": "// No var !value DELETE — stale value from previous iteration may persist\\n!value = compute(!x)  -- could be overwritten or not",
    "pitfalls": [
      "DELETE unsets the variable; accessing it before assignment returns UNSET",
      "Useful when the assignment might be skipped (e.g., inside conditional blocks)",
      "Not needed if the variable is always assigned unconditionally in every iteration"
    ],
    "relatedIds": [
      "nested_handle_any_in_loop"
    ],
    "sourcedoc": "AVEVA PML Customization — VAR Command",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  }
];
