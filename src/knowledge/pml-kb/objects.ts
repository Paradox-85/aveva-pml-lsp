import type { KBEntry } from '../schemas/kb-entry.js';

export const objectsEntries: KBEntry[] = [
  {
    "id": "obj_definition_structure",
    "category": "objects",
    "subcategory": "structure",
    "title": "Структура файла .pmlobj",
    "principle": "Файл объекта описывает пользовательский тип: блок define object ... endobject задаёт члены (состояние), а следующие за ним define method ... endmethod задают поведение; имя файла должно совпадать с именем объекта, иначе динамическая загрузка по имени не сработает.",
    "rule": "Порядок: (опц.) import+handle → define object NAME / member .x is TYPE / endobject → define method .name() ... endmethod; имя файла = имя объекта (.pmlobj); члены и методы доступны через точку.",
    "syntax": "define object NAME\n  member .field is TYPE\nendobject\n\ndefine method .name()\n  ...\nendmethod",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\ndefine object RAMVALUECONVERTER\n  member .realFormat      is FORMAT\n  member .isFormatApplied is BOOLEAN\n  member .isUnitRequired  is BOOLEAN\n  member .dateFormat      is DATEFORMAT\n  member .isError         is BOOLEAN\n  member .logElement      is STRING\n  member .logAttribute    is STRING\nendobject",
    "exampleAntipattern": "-- NOT: обращаться к member объекта до инициализации в конструкторе\n-- Плохо: методы получают UNSET-состояние объекта",
    "pitfalls": [
      "Имя файла должно совпадать с именем объекта",
      "Нет public/private и нет наследования (TM-1401 §2.2)",
      "После правки .pmlobj нужен pml reload object / pml rehash all"
    ],
    "relatedIds": [
      "obj_member_declaration",
      "obj_method_declaration",
      "obj_constructor_pattern",
      "obj_namespace_loading"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §3.4 (User-Defined Objects); TM-1401 M&F §2.3 (PML Objects)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "obj_constructor_pattern",
    "category": "objects",
    "subcategory": "constructor",
    "title": "Конструктор объекта (метод с именем объекта)",
    "principle": "Метод, чьё имя совпадает с именем объекта, играет роль конструктора и вызывается при создании экземпляра через object NAME(); это место для инициализации членов в детерминированное состояние, поскольку иначе они остаются UNSET.",
    "rule": "Объявлять define method .NAME() (или с аргументами для перегрузки); внутри инициализировать члены (часто делегируя в .clearData()/.clearFormat()); допускается несколько конструкторов с разными аргументами.",
    "syntax": "define method .ramValueConverter()\n  !this.clearData()\n  !this.clearFormat()\nendmethod",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\ndefine method .ramCommonLogger()\n  !this.clearData()\n  !this.fileWriter  = object RAMFILEWRITERCLASS()\nendmethod",
    "exampleAntipattern": "!obj = object RAMVALUECONVERTER   $* НЕВЕРНО: без () конструктор не вызовется, члены UNSET",
    "pitfalls": [
      "Создание без () не вызывает конструктор",
      "Можно перегружать конструктор разными аргументами",
      "Инициализируйте члены-массивы object ARRAY(), иначе append() упадёт"
    ],
    "relatedIds": [
      "obj_definition_structure",
      "obj_member_declaration",
      "obj_delegation_pattern"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §3.4 (constructor method, multiple constructors); TM-1401 M&F §2.3.3 (object NAME())",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "obj_member_declaration",
    "category": "objects",
    "subcategory": "members",
    "title": "Объявление членов (member .x is TYPE)",
    "principle": "Члены — это переменные объекта, их тип фиксируется в объявлении; член может быть и пользовательским объектом, что даёт агрегацию (объект владеет другим объектом) вместо наследования, которого в PML нет.",
    "rule": "Объявлять member .name is TYPE внутри define object; TYPE может быть встроенным (STRING/REAL/BOOLEAN/ARRAY), системным (FORMAT/DATEFORMAT/DBREF) или пользовательским (другой объект); значения по умолчанию задавать в конструкторе, не в объявлении.",
    "syntax": "member .logDataList is ARRAY\nmember .fileWriter  is RAMFILEWRITERCLASS",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\ndefine object RAMCOMMONLOGGER\n  member .logDataList is ARRAY\n  member .headings is ARRAY\n  member .fileWriter is RAMFILEWRITERCLASS\nendobject",
    "exampleAntipattern": "-- NOT: обращаться к member объекта до инициализации в конструкторе\n-- Плохо: методы получают UNSET-состояние объекта",
    "pitfalls": [
      "Значения по умолчанию не задаются в объявлении — только в конструкторе",
      "Член-объект агрегируется, доступны его члены и методы"
    ],
    "relatedIds": [
      "obj_delegation_pattern",
      "obj_constructor_pattern",
      "ap_data_object"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.3 (member ... is STRING); TM-1402 §3.4",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "obj_method_declaration",
    "category": "objects",
    "subcategory": "methods",
    "title": "Объявление метода; доступ через !this",
    "principle": "Метод определяется в файле объекта и обращается к собственному состоянию через специальную локальную переменную !this; метод может возвращать значение (is TYPE) или нет (процедура), и вызывается на экземпляре через точку.",
    "rule": "Объявлять define method .name(args) [is TYPE] ... endmethod; внутри читать/писать члены через !this.member; вызывать другие методы того же объекта через !this.other(); возврат — return.",
    "syntax": "define method .isError() is BOOLEAN\n  return !this.isError\nendmethod",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\ndefine method .setLogInformation(!element is STRING, !attribute is STRING)\n  !this.clearData()\n  !this.logElement   = !element\n  !this.logAttribute = !attribute\nendmethod",
    "exampleAntipattern": "-- NOT: обращаться к member объекта до инициализации в конструкторе\n-- Плохо: методы получают UNSET-состояние объекта",
    "pitfalls": [
      "Член-метод и член-данное могут совпадать по имени (.isError член и .isError() метод) — встречается в codebase, но запутывает",
      "!this заменяет явную ссылку на владельца"
    ],
    "relatedIds": [
      "obj_method_declaration",
      "fnc_definition_syntax",
      "obj_overloading_delegation",
      "nc_method_naming"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.4 (Functions and Methods); §2.5 (!this — special local variable); TM-1402 §2.4",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "obj_delegation_pattern",
    "category": "objects",
    "subcategory": "aggregation",
    "title": "Объект владеет другим объектом как членом (делегирование)",
    "principle": "Поскольку в PML нет наследования, переиспользование достигается агрегацией: объект объявляет член типа другого объекта, создаёт его в конструкторе и делегирует ему задачу — так логгер владеет файл-райтером, а конфиг-лоадер использует Excel-ридер.",
    "rule": "Объявить member .x is OTHEROBJECT; создать в конструкторе (!this.x = object OTHEROBJECT()); вызывать его методы для делегирования специализированной работы; не дублировать чужую логику.",
    "syntax": "member .fileWriter is RAMFILEWRITERCLASS\n...\n!this.fileWriter = object RAMFILEWRITERCLASS()",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\ndefine object RAMCOMMONLOGGER\n  member .logDataList is ARRAY\n  member .headings is ARRAY\n  member .fileWriter is RAMFILEWRITERCLASS\nendobject\n\ndefine method .ramCommonLogger()\n  !this.clearData()\n  !this.fileWriter  = object RAMFILEWRITERCLASS()\nendmethod",
    "exampleAntipattern": "-- копирование логики записи файла внутрь логгера вместо делегирования fileWriter",
    "pitfalls": [
      "Не забыть создать член-объект в конструкторе — иначе он UNSET",
      "Глубокая агрегация требует порядка загрузки (зависимый объект должен быть доступен)"
    ],
    "relatedIds": [
      "obj_member_declaration",
      "ap_loader_chain",
      "frm_loader_chain",
      "ap_separation_of_concerns"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.3 (member может быть user-defined object: PRODUCT has member .site is FACTORY)",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "obj_overloading_delegation",
    "category": "objects",
    "subcategory": "overloading",
    "title": "Короткие перегрузки делегируют к полному методу",
    "principle": "PML поддерживает перегрузку методов по списку аргументов; чтобы не дублировать логику, короткие перегрузки лишь подставляют значения по умолчанию и вызывают одну «полную» реализацию — единственное место, где живёт настоящая логика.",
    "rule": "Определить несколько методов с одним именем и разными аргументами; в коротких вариантах добавить умолчания (например severity=2, обернуть detail в массив) и вызвать наиболее полный перегруженный метод; полную логику держать в одном месте.",
    "syntax": "define method .addLogDetails(!toolName is STRING, !detail is STRING)\n  !this.addLogDetails(!toolName, !detail, 2)\nendmethod",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\ndefine method .addLogDetails(!toolName is STRING, !detail is STRING)\n  !this.addLogDetails(!toolName, !detail, 2)\nendmethod\n\ndefine method .addLogDetails(!toolName is STRING, !detail is STRING, !severityLevel is REAL)\n  !details = object ARRAY()\n  !details.Append(!detail)\n  !this.addLogDetails(!toolName, !details, !severityLevel)\nendmethod\n\ndefine method .addLogDetails(!toolName is STRING, !details is ARRAY, !severityLevel is REAL)\n  ...\n  !this.logDataList.append(!finalLog)\nendmethod",
    "exampleAntipattern": "-- три независимые реализации addLogDetails с продублированной логикой записи",
    "pitfalls": [
      "Все перегрузки должны вести к единой полной реализации, иначе теряется смысл",
      "Перегрузка различается по числу/типам аргументов, не по имени"
    ],
    "relatedIds": [
      "obj_method_declaration",
      "log_common_logger_api",
      "obj_constructor_pattern"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.2 (overloading of methods is supported)",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "obj_factory_pattern",
    "category": "objects",
    "subcategory": "factory",
    "title": "object $!TYPE() — динамическое создание по строковому имени типа",
    "principle": "Поскольку $ раскрывает строку до того, как она читается синтаксисом, конструкцию object $!TYPE() можно использовать как фабрику: тип объекта берётся из строковой переменной во время выполнения, что позволяет одному методу конвертировать значение в любой запрошенный тип.",
    "rule": "Когда целевой тип известен лишь в рантайме (из конфигурации/Excel), создавать экземпляр через object $!typeVar(); аналогично можно динамически вызывать метод через !value.$!conversionType().",
    "syntax": "!data   = object $!subType()\n!result = !value.$!conversionType()",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n!data = object $!subType()\n...\n!result = object $!conversionType()\n...\n!result = !value.$!conversionType()",
    "exampleAntipattern": "-- большой if/elseif на каждый возможный тип вместо object $!subType()",
    "pitfalls": [
      "Если строка типа невалидна — конструктор бросит ошибку, оборачивайте в handle",
      "Динамический вызов метода !value.$!m() требует, чтобы метод существовал у типа !value"
    ],
    "relatedIds": [
      "dt_string_substitution",
      "tc_db_to_pml_mapping",
      "obj_constructor_pattern"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.3 ($ expansion of variable into string before reading); §2.9",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "obj_namespace_loading",
    "category": "objects",
    "subcategory": "loading",
    "title": "Загрузка объектов: pml rehash all, pml reload, using namespace",
    "principle": "PML 2-объекты ищутся динамически по PMLLIB через индекс pml.index; новый файл невидим, пока индекс не пересобран (pml rehash all), а изменённое определение уже загруженного объекта требует pml reload — иначе работает старая версия в памяти.",
    "rule": "После создания нового .pmlobj/.pmlfnc/.pmlfrm — pml rehash all; после правки уже загруженного — pml reload object NAME / pml reload form NAME (в codebase встречается PML RELOAD OBJECT внутри макроса перед использованием); using namespace 'X' открывает .NET-пространство имён.",
    "syntax": "PML REHASH ALL\nPML RELOAD OBJECT TAGMANAGEMENTTMP\nusing namespace 'RamAEPMLExcelReader'",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()",
    "exampleAntipattern": "-- правка .pmlobj без pml reload → в сессии продолжает работать старое определение",
    "pitfalls": [
      "Новый файл без rehash недоступен по имени",
      "Изменённый загруженный объект без reload — старая версия",
      "using namespace относится к .NET-сборкам (TM-1402 §2.18)"
    ],
    "relatedIds": [
      "dn_import_statement",
      "obj_definition_structure"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.7 (PML REHASH / REHASH ALL, pml reload object/form); §2.9; TM-1402 §2.2",
    "sourcecodebase": "JDE_data-import.pmlmac"
  }
];
