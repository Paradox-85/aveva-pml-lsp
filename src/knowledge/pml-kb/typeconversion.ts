import type { KBEntry } from '../schemas/kb-entry.js';

export const typeconversionEntries: KBEntry[] = [
  {
    "id": "tc_db_to_pml_mapping",
    "category": "typeconversion",
    "subcategory": "db_mapping",
    "title": "Маппинг типов БД PDMS → PML",
    "principle": "Типы атрибутов в схеме PDMS не совпадают с типами PML. При чтении/записи атрибутов необходимо знать маппинг и выполнять конвертацию: REAL/INTEGER в БД → REAL в PML, WORD/TEXT → STRING, LOGICAL → BOOLEAN, REFERENCE → DBREF, DATETIME → DATETIME object. ramValueConverter централизует этот маппинг.",
    "rule": "Используйте метод .convertDBTypeToType() объекта ramValueConverter для определения PML-типа по типу атрибута БД. Маппинг: INTEGER/REAL→REAL, WORD/TEXT→STRING, LOGICAL→BOOLEAN, REFERENCE→DBREF. Для DATETIME и ARRAY нужна особая обработка.",
    "syntax": "!attribute = object ATTRIBUTE(!attributeName)\n!dbType = !attribute.type()\n-- маппинг:\n-- 'REAL', 'INTEGER' → работать как REAL\n-- 'TEXT', 'WORD' → работать как STRING\n-- 'LOGICAL' → работать как BOOLEAN\n-- 'REFERENCE' → работать как DBREF\n-- 'DATETIME' → object DATETIME()",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\ndefine method .convertDBTypeToType(!dbType is STRING) is STRING\n  !type = 'STRING'\n  if(!dbType.eq('REAL') OR !dbType.eq('INTEGER')) then\n    !type = 'REAL'\n  elseif(!dbType.eq('WORD') OR !dbType.eq('TEXT')) then\n    !type = 'STRING'\n  elseif(!dbType.eq('LOGICAL')) then\n    !type = 'BOOLEAN'\n  elseif(!dbType.eq('REFERENCE')) then\n    !type = 'DBREF'\n  endif\n  return !type\nendmethod\n\n-- CB: TagManagementTmp.pmlobj, .TryToSetValue() — применение маппинга при записи\nif (!attributeType eq 'REAL') then\n  !eleRef.attribute(!attribute.name()) = !attributeValue.real()\nelseif (!attributeType eq 'TEXT') then\n  !eleRef.attribute(!attribute.name()) = !attributeValue\nelseif (!attributeType eq 'DATETIME') then\n  !datetime = object DATETIME(!y, !m, !d, 00, 00, 00)\n  !eleRef.attribute(!attribute.name()) = !datetime\nelseif (!attributeType eq 'LOGICAL') then\n  !eleRef.attribute(!attribute.name()) = !attributeValue.boolean()\nendif",
    "exampleAntipattern": "-- NOT: конвертировать строку в REAL/DBREF/DATE без проверки формата\n-- Плохо: PML выдаёт runtime error на пользовательских данных",
    "pitfalls": [
      "INTEGER в PDMS маппится на REAL в PML — PML не имеет отдельного типа INTEGER",
      "WORD — короткая строка PDMS, TEXT — длинная; оба → STRING в PML",
      "REFERENCE может быть одиночной (DBREF) или множественной (ARRAY of DBREF)"
    ],
    "relatedIds": [
      "dn_type_mapping",
      "dt_real_declaration",
      "dt_dbref_usage",
      "pdms_attribute_update"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §5.1 (PML data types); §7.4 (PDMS attribute types)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "tc_string_to_real",
    "category": "typeconversion",
    "subcategory": "conversion",
    "title": "Конвертация STRING → REAL (.real())",
    "principle": "Преобразование строки в число — одна из самых частых операций при импорте данных из Excel. Метод .real() может бросить ошибку при невалидной строке, поэтому обязательно оборачивается в handle.",
    "rule": "Используйте `object REAL(!stringValue)` или `!stringValue.real()`. Всегда оборачивайте в handle any. При ошибке логируйте исходное значение для диагностики.",
    "syntax": "!realValue = object REAL(!stringValue)\nhandle any\n  -- не удалось конвертировать\nendhandle\n-- или\n!realValue = !stringValue.real()",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n!realValue       = object REAL(!tempValue)\nhandle any\n  !this.addErrorToList(!element.name, !attribute, 'ER6 - ' + 'Not able to convert ' + !tempValue + ' to real' + !additionalMessage, 2)\nelsehandle None\n  !result          = !realValue.string(!format)\n  handle any\n    !this.addErrorToList(!element.name, !attribute, 'ER7 - ' + 'Unit conversion failed', 2)\n  endhandle\nendhandle",
    "exampleAntipattern": "-- NOT: конвертировать строку в REAL/DBREF/DATE без проверки формата\n-- Плохо: PML выдаёт runtime error на пользовательских данных",
    "pitfalls": [
      "Строка с единицами измерения ('123.4 mm') — нужно отделять число от UOM перед .real()",
      "Разделитель дробной части зависит от локали PDMS — может быть . или ,",
      "object REAL() и .real() эквивалентны, но object REAL() удобнее для handle"
    ],
    "relatedIds": [
      "tc_real_to_string",
      "tc_db_to_pml_mapping",
      "eh_handle_endhandle",
      "dt_real_declaration"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §5.3 (REAL data type, conversion methods); §6.4 (Type conversion functions)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "tc_real_to_string",
    "category": "typeconversion",
    "subcategory": "conversion",
    "title": "Конвертация REAL → STRING (.string(format))",
    "principle": "Форматирование числа в строку необходимо для вывода, логирования и формирования имён файлов. Метод .string(format) принимает формат-строку PML (например 'I2' для целого с двумя знаками).",
    "rule": "Используйте `.string()` (без формата — по умолчанию) или `.string('FORMAT')` с указанием формата. Для REAL с единицами — `.Value().String()` чтобы получить числовое значение без единиц.",
    "syntax": "!formatted = !realValue.string('I2')\n-- для REAL с единицами:\n!numericStr = !realValue.Value().String()",
    "exampleCanonical": "-- CB JDE_routine-macro-run.pmlmac\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')\n!date = !dt.date().string('I2')\n!hour = !dt.hour().string('I2')\n!minute = !dt.minute().string('I2')\n\n-- CB: TagManagementTmp.pmlobj — получение числового значения REAL\nif (!currentValue.objecttype() eq |REAL|) then\n  !currentValueString = !currentValue.Value().String()\nendif",
    "exampleAntipattern": "-- NOT: конвертировать строку в REAL/DBREF/DATE без проверки формата\n-- Плохо: PML выдаёт runtime error на пользовательских данных",
    "pitfalls": [
      "'I2' даёт целое с минимум 2 знаками (01, 02..12); 'F2' — дробное с 2 десятичными",
      "REAL с единицами (.real() из PDMS) требует .Value() перед .String() для числа",
      ".string() без формата может дать слишком много десятичных знаков"
    ],
    "relatedIds": [
      "tc_string_to_real",
      "mac_file_path_pattern",
      "dt_string_substitution"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §5.3 (REAL formatting); §5.7 (Format specifiers: I — integer, F — float, E — scientific)",
    "sourcecodebase": "JDE_routine-macro-run.pmlmac"
  },
  {
    "id": "tc_date_parsing",
    "category": "typeconversion",
    "subcategory": "conversion",
    "title": "Парсинг дат: перебор разделителей",
    "principle": "Даты из Excel/внешних источников могут иметь разные разделители (точка, дефис, слэш, запятая, обратный слэш, пробел). ramValueConverter решает это перебором всех возможных разделителей и проверкой .occurs(char).neq(2) как критерия (дата содержит ровно 2 разделителя).",
    "rule": "Для парсинга дат из строки: перебирайте разделители ('. , - / \\ пробел'), для каждого проверяйте .occurs(separator).eq(2), затем .split(separator) и создавайте object DATETIME(year, month, day). Оборачивайте каждую попытку в handle.",
    "syntax": "!separators = ARRAY()\n!separators.append('.')\n!separators.append(',')\n!separators.append('-')\n!separators.append('/')\n!separators.append('\\')\n!separators.append(' ')\ndo !sep values !separators\n  if (!dateStr.occurs(!sep).eq(2)) then\n    !parts = !dateStr.split(!sep)\n    !dt = object DATETIME(!parts[3].real(), !parts[2].real(), !parts[1].real(), 0, 0, 0)\n    handle any\n    endhandle\n  endif\nenddo",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n!separators = ARRAY()\n!separators.append('.')\n!separators.append(',')\n!separators.append('-')\n!separators.append('/')\n!separators.append('\\\\')\n!separators.append(' ')\ndo !sep values !separators\n  if(!valueString.occurs(!sep).neq(2)) then\n    skip\n  endif\n  !dateParts = !valueString.split(!sep)\n  -- далее: проверка порядка DD.MM.YYYY и создание DATETIME",
    "exampleAntipattern": "-- NOT: конвертировать строку в REAL/DBREF/DATE без проверки формата\n-- Плохо: PML выдаёт runtime error на пользовательских данных",
    "pitfalls": [
      "Порядок DD.MM.YYYY vs MM/DD/YYYY зависит от источника данных — не всегда совпадает",
      ".occurs(char).eq(2) — эвристика: дата DD.MM.YYYY содержит ровно два разделителя",
      "DATETIME конструктор: (year, month, day, hour, min, sec) — year первым"
    ],
    "relatedIds": [
      "tc_string_to_real",
      "dt_string_declaration",
      "eh_handle_any",
      "obj_factory_pattern"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §5.8 (DATETIME object, construction); §5.2 (STRING methods — .occurs(), .split())",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "tc_boolean_from_string",
    "category": "typeconversion",
    "subcategory": "conversion",
    "title": "Конвертация STRING → BOOLEAN",
    "principle": "При импорте данных из Excel булевы значения приходят как строки ('TRUE', 'FALSE', 'Yes', 'No'). PML-метод .boolean() конвертирует строку, но в codebase часто используется сравнение .eqNocase('TRUE') для явного контроля.",
    "rule": "Для надёжной конвертации используйте .eqNocase('TRUE') вместо .boolean() — это даёт контроль над нечёткими значениями. Для записи в PDMS-атрибут типа LOGICAL используйте .boolean() метод.",
    "syntax": "-- через сравнение (надёжнее):\n!isAllowed = !value.eqNocase('TRUE')\n-- через PML-метод:\n!boolValue = !stringValue.boolean()",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\ndefine method .isAllowed(!setting is STRING) is BOOLEAN\n  !isAllowed   = false\n  !value       = !this.dataLoader.getSettingValue(!setting)\n  if(!value.eqNocase('TRUE')) then\n    !isAllowed = true\n  endif\n  return !isAllowed\nendmethod\n\n-- CB: TagManagementTmp.pmlobj, .TryToSetValue() — запись LOGICAL в PDMS\nif (!attributeType eq 'LOGICAL') then\n  !eleRef.attribute(!attribute.name()) = !attributeValue.boolean()\n  handle any\n    !isError = true\n  endhandle\nendif",
    "exampleAntipattern": "-- NOT: конвертировать строку в REAL/DBREF/DATE без проверки формата\n-- Плохо: PML выдаёт runtime error на пользовательских данных",
    "pitfalls": [
      ".boolean() на произвольной строке может бросить ошибку — оборачивайте handle",
      "В PML BOOLEAN имеет три состояния: TRUE, FALSE, UNDEFINED",
      "eqNocase — регистронезависимое сравнение: 'true', 'True', 'TRUE' — все совпадут"
    ],
    "relatedIds": [
      "dt_boolean_values",
      "tc_db_to_pml_mapping",
      "eh_handle_endhandle"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §5.4 (BOOLEAN data type); §6.4 (Type conversion — .boolean())",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "p2_na_replacement",
    "category": "typeconversion",
    "subcategory": "na-replacement",
    "title": "999999999 → NA replacement pattern",
    "principle": "Some exports use sentinel numeric values such as 999999999 to represent missing/not-applicable data and replace them with `NA` for output.",
    "rule": "Detect sentinel values close to export formatting, convert to `NA`, and avoid writing sentinel values back into engineering attributes unless explicitly required.",
    "syntax": "if !value.eq(999999999) then\n  !text = 'NA'\nelse\n  !text = !value.string()\nendif",
    "exampleCanonical": "-- CB EIS_data_export.pmlmac\n-- EIS export macro normalizes export values before writing final output rows, including NA-style replacement patterns",
    "exampleAntipattern": "-- NOT: write 999999999 directly to CSV/Excel as a real engineering value\n-- Плохо: downstream systems interpret sentinel as real measurement",
    "pitfalls": [
      "Keep sentinel handling at export boundary",
      "Do not confuse 0 with NA",
      "Document which attributes use the sentinel"
    ],
    "relatedIds": [
      "tc_real_to_string",
      "p2_datetime_api",
      "log_contextual_info"
    ],
    "sourcedoc": "Perplexity PML KB EIS pattern; codebase EIS_data_export",
    "sourcecodebase": "EIS_data_export.pmlmac"
  }
];
