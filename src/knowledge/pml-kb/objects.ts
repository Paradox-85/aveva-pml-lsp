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
  },

  {
    id: 'd7_attribute_hash_validation',
    category: 'objects',
    subcategory: 'attribute',
    title: 'Attribute hash validation before assignment',
    principle: 'Use attribute.hash() to verify that an attribute name is valid for the target element before attempting to set its value.',
    rule: 'Create ATTRIBUTE object, check hash() > 0, then proceed with value assignment. Log errors for invalid attributes.',
    syntax: `!attr = object ATTRIBUTE(|$!col|)
if (!attr.hash() gt 0) then
  !tagRef.attribute(!attr.name()) = !fileVal
else
  !err = |Attribute [$!col] is not valid in AVEVA|
  !issueData.append(!err.split(|;|))
endif`,
    exampleCanonical: `-- CB JDE_newtag_import.pmlmac
!attr = object ATTRIBUTE(|$!col|)
if (!attr.hash() gt 0) then
  -- proceed with assignment
else
  !err = |$!tag;$!col;$!fileVal;Attribute [$!col] is not valid in AVEVA|
  !issueData.append(!err.split(|;|))
endif`,
    exampleAntipattern: `-- No hash check before assignment
!attr = object ATTRIBUTE(|$!col|)
!tagRef.attribute(!attr.name()) = !fileVal  -- may silently fail`,
    pitfalls: [
      'hash() returns 0 for non-existent attributes — always check before assignment',
      'System attributes (prefixed with :) and UDAs both return valid hashes',
      'Empty attribute names return hash 0'
    ],
    relatedIds: ['pdms_attribute_update', 'dt_dbref_usage'],
    sourcedoc: 'AVEVA Engineering PML Customization — Attribute Class',
    sourcecodebase: 'JDE_newtag_import.pmlmac'
  },
  {
    id: 'dbref_attribute_access_assignment',
    category: 'objects',
    subcategory: 'dbref',
    title: 'dbref tag reference with attribute read/write via .:AttributeName',
    principle:
      'Use |$!<var>| to build a tag reference string, resolve with .dbref(), then read/write attributes via .:AttributeName notation.',
    rule:
      '!tagName = |$!<Tag>|; !tagref = !tagName.dbref(); !tagref.:RAMTAGOWNER = !value',
    syntax: `!tagName = |$!<TagName>|
!tagref = !tagName.dbref()
!tagref.:RAMInstallationContractors = !newValue`,
    exampleCanonical: `-- CB JDE_tagProperties_upload.pmlmac
!tagName = |$!<Tag>|
!tagref = !tagName.dbref()
!tagref.:RAMTAGOWNER = !EngCon`,
    exampleAntipattern:
      '!tagref = !Tag.dbref()  -- Tag must be a string reference, not a raw value',
    pitfalls: [
      'dbref() requires a properly formatted tag reference string (e.g., |$!<Tag>|).',
      'Attribute name after .: must be a valid system or UDA attribute.',
      'Reading a non-existent attribute may raise an exception — wrap in handle/elsehandle.',
    ],
    relatedIds: ['dt_string_substitution', 'eh_handle_any', 'pdms_attribute_update', 'dt_dbref_usage'],
    sourcedoc: 'JDE_tagProperties_upload.pmlmac',
    sourcecodebase: 'JDE_tagProperties_upload.pmlmac',
  },
  {
  id: 'loopdata_object',
  category: 'objects',
  subcategory: 'loopdata',
  title: 'LOOPDATA Object — Data Export and Logging',
  principle:
    'LOOPDATA is an AVEVA system object for exporting loop data and instrument field information to external files such as Excel spreadsheets.',
  rule:
    'Use PML RELOAD OBJECT LOOPDATA before instantiation. Create an instance with object LOOPDATA(), call GetData() to populate data, set InstrumentFieldDataTransfer(false) to disable instrument field transfer, set pathName to the export directory, and call SaveLog(filename, overwrite) to write the export.',
  syntax: `!loop = object LOOPDATA()
!loop.GetData()
!loop.InstrumentFieldDataTransfer(FALSE)
!loop.pathName = |<export_path>|
!loop.SaveLog(|<filename>.xlsx|, FALSE)`,
  exampleCanonical: `-- CB loop-data-update.pmlmac
PML RELOAD OBJECT LOOPDATA

!loop = object LOOPDATA()

!loop.GetData()

!loop.InstrumentFieldDataTransfer(FALSE)

!loop.pathName = |C:\\path\\to\\log|

!loop.SaveLog(|loop-data-update-log.xlsx|, FALSE)`,
  exampleAntipattern: `-- WRONG: call methods before constructing LOOPDATA
!loop.GetData()`,
  pitfalls: [
    'LOOPDATA must be reloaded with PML RELOAD OBJECT LOOPDATA before first use in a PML session.',
    'pathName must reference a writable directory on the target machine.',
    'SaveLog second argument is a BOOLEAN: TRUE overwrites existing file, FALSE does not.',
    'GetData() must be called before SaveLog() to populate the export data.',
  ],
  relatedIds: ['obj_constructor_pattern', 'log_output_targets'],
  sourcedoc: 'AVEVA E3D LOOPDATA class documentation',
  sourcecodebase: 'loop-data-update.pmlmac',
},
  {
    id: 'obj_measure_unit',
    category: 'objects',
    subcategory: 'measure-unit',
    title: 'MEASURE and UNIT Objects for Unit Conversion',
    principle: 'MEASURE and UNIT are PML system objects for working with engineering units and conversions.',
    rule: "Create MEASURE('name') to get a measure object, then setunits(unit) to configure. Create UNIT('name') to get a unit reference.",
    syntax: "!measure = object MEASURE('AngularFrequency')\n!unit = object UNIT(|rpm|)\n!measure.setunits(!unit)",
    exampleCanonical: `-- CB JDE_BI_tagRegister-export.pmlmac
!AngularFrequencyDimension = object MEASURE('AngularFrequency')
!rpmUnit = object UNIT(|rpm|)
!AngularFrequencyDimension.setunits(!rpmUnit)`,
    exampleAntipattern: "!measure = MEASURE('AngularFrequency')  -- missing OBJECT\n!unit = UNIT('rpm')  -- missing OBJECT",
    pitfalls: [
      'Both MEASURE and UNIT require OBJECT keyword',
      'setunits() may fail silently if unit is not valid for the measure',
      'Unit names are case-sensitive'
    ],
    relatedIds: ['p2_measure_unit', 'dt_real_declaration'],
    sourcedoc: 'AVEVA Engineering measurement documentation',
    sourcecodebase: 'JDE_BI_tagRegister-export.pmlmac'
  },
  {
    id: 'obj_ptmltags_export',
    category: 'objects',
    subcategory: 'PMLTAGS',
    title: 'PMLTAGS Object for Engineering Tag Export',
    principle: 'PMLTAGS is a system object providing methods to export engineering tag data to XLSX format via GridControl integration.',
    rule: "Create via object PMLTAGS(), then call exportasxls(groupName, listName, filePath) to export a list definition's data.",
    syntax: '!!tags = object PMLTAGS()\n!!tags.exportasxls(!groupName, !listName, !filePath)',
    exampleCanonical: `-- CB RAMBiReportExport.pmlmac
!!tags = object PMLTAGS()
!!tags.exportasxls(!gridGroupName, '$!<gridRef.LSTNAM>', '$!filepath')`,
    exampleAntipattern: `!tags = PMLTAGS()  -- missing OBJECT keyword
!!tags.exportxls(|wrong|)  -- wrong method name`,
    pitfalls: [
      'Must use OBJECT keyword before PMLTAGS()',
      "exportasxls requires valid LSTDEF groupName, listName, and writable file path",
      'File path must include .xlsx extension for correct export format'
    ],
    relatedIds: ['p2_pmltags', 'p2_netgrid_full'],
    sourcedoc: 'AVEVA Engineering PML Add-ins documentation',
    sourcecodebase: 'RAMBiReportExport.pmlmac'
  },
  {
    id: 'obj_ramcommonlogger',
    category: 'objects',
    subcategory: 'custom-logging',
    title: 'RAMCOMMONLOGGER Custom Error Logger Object',
    principle: 'RAMCOMMONLOGGER is a project-specific PML object for logging macro errors and warnings to Excel files.',
    rule: "Create via object RAMCOMMONLOGGER(), use addHeading() to set column headers, writeErrorDataToExcel() to dump log data.",
    syntax: "!!ramCommonLogger = object RAMCOMMONLOGGER()\n!!ramCommonLogger.addHeading(!headings)\n!!ramCommonLogger.writeErrorDataToExcel(!logFile, false)",
    exampleCanonical: `-- CB JDE_BI_tagRegister-export.pmlmac
!!ramCommonLogger = object RAMCOMMONLOGGER()
!headings = |Tag Name;Attribute Name;Error Text|
!!ramCommonLogger.addHeading(!headings.split(|;|))`,
    exampleAntipattern: `!rc = object RAMCOMMONLOGGER()  -- use !! for global
!!ramCommonLogger.writeErrorDataToExcel(!logFile, true)  -- second arg is append flag`,
    pitfalls: [
      'Must be declared as global (!!) for cross-method access',
      'addHeading expects semicolon-separated string that is split()',
      'writeErrorDataToExcel second parameter controls append mode'
    ],
    relatedIds: ['log_common_logger_api', 'eh_logging_pattern'],
    sourcedoc: 'Ramboll Jackdaw project macros',
    sourcecodebase: 'JDE_BI_tagRegister-export.pmlmac'
  },
  {
    "id": "KB-OBJ-ATTRIBUTE-ISPSUEDO-BYPASS",
    "category": "objects",
    "subcategory": "attribute",
    "title": "Pseudo attribute write access bypass in AVEVA",
    "principle": "Some AVEVA attributes (like NAME) are marked as pseudo-attributes that have special write access rules. The `isPseudo()` check allows bypassing direct attribute membership checks for these special attributes.",
    "rule": "Always combine `isPseudo()` checks with `EQNoCase('NAME')` for NAME attribute special handling.",
    "syntax": "!attribute = object ATTRIBUTE(!attributeName)\nif(!attribute.isPseudo().not() OR !attributeName.EQNoCase('NAME')) then\n  -- special handling for pseudo/NAME attributes\nelse\n  !directAttributes = !elementRefe.attributes()\n  -- normal attribute check\nendif",
    "exampleCanonical": "-- CB ramTagManagement.pmlobj\ndefine method .isAttributeUpdatable(!elementRefe is DBREF, !attributeName is STRING) is BOOLEAN\n  !isUpdatable = false\n  !attribute = object ATTRIBUTE(!attributeName)\n  if(!attribute.isPseudo().not() OR !attributeName.EQNoCase('NAME')) then\n    !isUpdatable = !this.isElementUpdatable(!elementRefe)\n  else\n    !directAttributes = !elementRefe.attributes()\n    !isDirectAttribute = !directAttributes.findFirst(!attributeName.upcase()).set()\n    if(!isDirectAttribute) then\n      !isUpdatable = !this.isElementUpdatable(!elementRefe)\n    endif\n  endif\n  return !isUpdatable\nendmethod",
    "exampleAntipattern": "-- Missing pseudo check\n!directAttributes = !elementRefe.attributes()\n!isDirect = !directAttributes.findFirst(!attributeName).set()\n-- NAME may pass even though not in directAttributes",
    "pitfalls": [
      "NAME attribute is always pseudo but always updatable via element methods.",
      "Other pseudo attributes may have different rules.",
      "Distributed attributes bypass this check entirely."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PDMS Data Model Reference",
    "sourcecodebase": "ramTagManagement.pmlobj"
  },
  {
    "id": "KB-OBJ-VAR-BACKREF-QUERY",
    "category": "objects",
    "subcategory": "var-query",
    "title": "PML var backref query for cross-references",
    "principle": "The `var` keyword with query clauses (e.g., `backref(attname ...) of $!obj`) creates a query variable that traverses AVEVA database relationships. This is a PDMS/E3D-specific query mechanism.",
    "rule": "Always check `.set()` on var query results before accessing the variable value.",
    "syntax": "var !queryVar queryClause of $!targetObject\nif(!queryVar.set()) then\n  -- process results\nendif",
    "exampleCanonical": "-- CB ramTagManagement.pmlobj\n-- Get back-references via XRPNTR attribute\nvar !backRefNoDetails backref(attname XRPNTR) of $!elementRefe\nif(!backRefNoDetails.set()) then\n  !backRefNos = !backRefNoDetails.split()\n  do !backRefNo values !backRefNos\n    !backRefe = !backRefNo.dbref()\n    -- process back-reference\n  enddo\nendif",
    "exampleAntipattern": "-- Missing .set() check\nvar !backRefNoDetails backref(attname XRPNTR) of $!elementRefe\n!value = !backRefNoDetails -- may be BADREF",
    "pitfalls": [
      "The `of $!targetObject` requires the target to resolve to a valid reference.",
      "The query result may be UNSET if no back-references exist.",
      "Split results need individual dbref() conversion."
    ],
    "relatedIds": [
      "obj_definition_structure"
    ],
    "sourcedoc": "AVEVA PDMS Customization Guide",
    "sourcecodebase": "ramTagManagement.pmlobj"
  },
  {
    "id": "array-tabular-normalisation-defined-set",
    "category": "objects",
    "subcategory": "array-processing",
    "title": "Normalize sparse ARRAY rows for tabular export using maximum width and defined/set guards",
    "principle": "Sparse ARRAY rows need defined/set guards and width normalization before tabular export.",
    "rule": "Sparse ARRAY rows need defined/set guards and width normalization before tabular export.",
    "syntax": "  !headingData = !this.headings\n  !maxSize     = !this.getMaximumLogSize()",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n  !headingData = !this.headings\n  !maxSize     = !this.getMaximumLogSize()\n  do !i from 1 to !maxSize\n    if(defined(!headingData[!i]) AND !headingData[!i].set()) then\n      !heading.append(!headingData[!i])\n    else\n      !heading.append('Heading $!i')\n    endif\n  enddo\n  return !heading\nendmethod",
    "exampleAntipattern": "-- WRONG: use Normalize sparse ARRAY rows for tabular export using maximum width and defined/set guards without validating the source context in ramCommonLogger.pmlobj",
    "pitfalls": [
          "Validate against ramCommonLogger.pmlobj before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
      "obj_definition_structure"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "object-logger-overload-default-severity",
    "category": "objects",
    "subcategory": "method-overloading",
    "title": "Logger object overloads delegate to a central ARRAY implementation with default REAL severity",
    "principle": "Expose convenience overloads, but normalize all log inputs through one canonical implementation.",
    "rule": "Expose convenience overloads, but normalize all log inputs through one canonical implementation.",
    "syntax": "define method .addLogDetails(!toolName is STRING, !details is ARRAY, !severityLevel is REAL)",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n-- Pattern: Logger object overloads delegate to a central ARRAY implementation with default REAL severity",
    "exampleAntipattern": "-- WRONG: omit validated pattern for Logger object overloads delegate to a central ARRAY implementation with default REAL severity\n-- Review source ramCommonLogger.pmlobj before reuse",
    "pitfalls": [
      "Validate Logger object overloads delegate to a central ARRAY implementation with default REAL severity against ramCommonLogger.pmlobj before reuse."
    ],
    "relatedIds": [
      "obj_definition_structure"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "objects-error-global",
    "category": "objects",
    "subcategory": "error-handling",
    "title": "!!Error global error object in elsehandle blocks",
    "principle": "!!Error carries details from HANDLE/ELSEHANDLE blocks and should be logged before recovery.",
    "rule": "!!Error carries details from HANDLE/ELSEHANDLE blocks and must be logged before recovery.",
    "syntax": "------------------------------------------------------------------------\n--",
    "exampleCanonical": "-- CB ramExcelReaderClass.pmlobj\n------------------------------------------------------------------------\n--\n-- File:        RAMEXCELREADERCLASS\n-- Description: Object to import the excel data\n--\n------------------------------------------------------------------------\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\ndefine object RAMEXCELREADERCLASS",
    "exampleAntipattern": "-- WRONG: use !!Error global error object in elsehandle blocks without validating the source context in ramExcelReaderClass.pmlobj",
    "pitfalls": [
          "Validate against ramExcelReaderClass.pmlobj before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
      "obj_definition_structure"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "ramExcelReaderClass.pmlobj"
  },
  {
    "id": "objects-ram-aepml-excel-reader",
    "category": "objects",
    "subcategory": "external-addins",
    "title": "RamAEPMLExcelReader / RamPMLExcelReaderClass",
    "principle": "RamAEPMLExcelReader wraps Excel reading behavior for reusable PML object workflows.",
    "rule": "RamAEPMLExcelReader wraps Excel reading behavior for reusable PML object workflows.",
    "syntax": "-- File:        RAMEXCELREADERCLASS\n-- Description: Object to import the excel data",
    "exampleCanonical": "-- CB ramExcelReaderClass.pmlobj\n-- File:        RAMEXCELREADERCLASS\n-- Description: Object to import the excel data\n--\n------------------------------------------------------------------------\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\ndefine object RAMEXCELREADERCLASS\n  member .excelTables  is ARRAY\nendobject\n------------------------------------------------------------------------\n--\n-- Method:     ramExcelReaderClass",
    "exampleAntipattern": "-- WRONG: use RamAEPMLExcelReader / RamPMLExcelReaderClass without validating the source context in ramExcelReaderClass.pmlobj",
    "pitfalls": [
          "Validate against ramExcelReaderClass.pmlobj before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "ramExcelReaderClass.pmlobj"
  },
  {
    "id": "objects-string-join-method",
    "category": "objects",
    "subcategory": "array-methods",
    "title": "ARRAY.Join() method for concatenation",
    "principle": "ARRAY.Join() converts array values to delimited text for logs or export cells.",
    "rule": "ARRAY.Join() converts array values to delimited text for logs or export cells.",
    "syntax": "------------------------------------------------------------------------\n--",
    "exampleCanonical": "-- CB ramExcelReaderClass.pmlobj\n------------------------------------------------------------------------\n--\n-- File:        RAMEXCELREADERCLASS\n-- Description: Object to import the excel data\n--\n------------------------------------------------------------------------\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\ndefine object RAMEXCELREADERCLASS",
    "exampleAntipattern": "-- WRONG: use ARRAY.Join() method for concatenation without validating the source context in ramExcelReaderClass.pmlobj",
    "pitfalls": [
          "Validate against ramExcelReaderClass.pmlobj before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
      "obj_definition_structure"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "ramExcelReaderClass.pmlobj"
  },
  {
    "id": "pml-object-measure-format",
    "category": "objects",
    "subcategory": "unit-conversion",
    "title": "MEASURE and FORMAT objects — Unit conversion and formatting",
    "principle": "MEASURE wraps a unit string and provides dbunit() for database unit conversion. FORMAT controls numeric string output including units and trailing zeros.",
    "rule": "!measure = object MEASURE(!unitString)\n!dbUnit = !measure.dbunit()\n!format = object FORMAT()\n!format.units = !dbUnit.string()\n!format.TRAILZEROS = false",
    "syntax": "!measure = object MEASURE(!unit)\n!dbUnit = !measure.dbunit()\n!format = object FORMAT()\n!format.units = !dbUnit.string()\n!format.TRAILZEROS = false\n!result = !realValue.string(!format)",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n-- CB obj_06: unit conversion with formatting\n!measure = object MEASURE(!unit)\n!dbUnit = !measure.dbunit()\n!format = object FORMAT()\n!format.units = !dbUnit.string()\n!format.TRAILZEROS = false\n!realValue = object REAL(!tempValue)\n!result = !realValue.string(!format)",
    "exampleAntipattern": "!result = !tempValue -- loses unit information",
    "pitfalls": [
      "MEASURE requires a valid unit string",
      "FORMAT.TRAILZEROS controls trailing zero display"
    ],
    "relatedIds": [
      "obj_definition_structure"
    ],
    "sourcedoc": "obj_06 (ramImportExcelElementLoader.pmlobj)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "array-evaluate-block-evalIndex",
    "category": "objects",
    "subcategory": "array-methods",
    "title": "ARRAY.Evaluate() with BLOCK and !evalIndex",
    "principle": "Evaluate a BLOCK expression against each element of an ARRAY using !evalIndex as the loop variable.",
    "rule": "Use !this.array.evaluate(object BLOCK(|!this.array[!evalIndex][field]|)) to extract specific fields from nested arrays.",
    "syntax": "!result = !array.evaluate(object BLOCK(|!array[!evalIndex][field]|))",
    "exampleCanonical": "-- CB ramImportExcelConfigLoader.pmlobj\n!excelClassNames = !this.classMappingList.evaluate(\n  object BLOCK(|!this.classMappingList[!evalIndex][1].upcase()|))\n!sheetNames = !excelTables.evaluate(object BLOCK(|!excelTables[!evalIndex][1]|))",
    "exampleAntipattern": "// ❌ DO loop with manual indexing (less idiomatic)\nDO !i FROM 1 TO !array.Size()\n  !names[i] = !array[!i][1].upcase()\nENDDO",
    "pitfalls": [
      "!evalIndex is a built-in variable available only inside BLOCK expressions",
      "BLOCK must be wrapped with object BLOCK(...)",
      "Pipe-delimited string |...| is used inside BLOCK for PML1-style expression"
    ],
    "relatedIds": [
      "obj_definition_structure"
    ],
    "sourcedoc": "ramImportExcelConfigLoader.pmlobj",
    "sourcecodebase": "ramImportExcelConfigLoader.pmlobj"
  },
  {
    "id": "array-reindex-sortedindices-pattern",
    "category": "objects",
    "subcategory": "array-methods",
    "title": "ARRAY.ReIndex() with SortedIndices() — Sort-Based Reordering",
    "principle": "Use SortedIndices() to get sort order, then ReIndex() to reorder the array.",
    "rule": "!sorted = !orderList.sortedIndices(); !reordered = !original.reIndex(!sorted)",
    "syntax": "!sortOrder = !orderList.sortedIndices()\n!reordered = !original.reIndex(!sortOrder)",
    "exampleCanonical": "-- CB ramImportExcelConfigLoader.pmlobj\n!orderList = !actionList.evaluate(object BLOCK(|!actionList[!evalIndex][2]|))\n!sortOrder = !orderList.sortedIndices()\n!finalList = !actionList.reIndex(!sortOrder)",
    "exampleAntipattern": "// ❌ Manual sorting with DO loop\nDO !i FROM 1 TO !list.Size()\n  DO !j FROM !i+1 TO !list.Size()\n    IF !list[!i] GT !list[!j] THEN\n      -- Swap\n    ENDIF\n  ENDDO\nENDDO",
    "pitfalls": [
      "ReIndex modifies the array in place (no return value)",
      "sortedIndices() returns a NEW REAL ARRAY",
      "Must use the return value of sortedIndices(), not the original array"
    ],
    "relatedIds": [
      "array-evaluate-block-evalIndex"
    ],
    "sourcedoc": "ramImportExcelConfigLoader.pmlobj",
    "sourcecodebase": "ramImportExcelConfigLoader.pmlobj"
  },
  {
    "id": "string-neq-method",
    "category": "objects",
    "subcategory": "string-methods",
    "title": "STRING.neq() — PML2 Not-Equal Method",
    "principle": "STRING.neq() is the PML2 method-form equivalent of the PML1 NE comparison operator.",
    "rule": "Use .neq() for case-sensitive not-equal comparison on STRING objects.",
    "syntax": "!result = !str.neq(|value|)",
    "exampleCanonical": "-- CB ramImportExcelConfigLoader.pmlobj\n!parameterDetail = !this.classMappingList[!index][3].upcase()\nif(!parameterDetail.set() AND !parameterDetail.trim().neq('')) then\n  -- Non-empty parameter found\nendif",
    "exampleAntipattern": "// ❌ Confusing .neq() with PML1 NE in object context\nif !parameterDetail NE |value| then  -- Works but not PML2 idiomatic",
    "pitfalls": [
      ".neq() is a STRING method, not a standalone operator",
      "Must be called on a STRING object instance",
      "Case-sensitive comparison (use .EQNoCase() for case-insensitive)"
    ],
    "relatedIds": [],
    "sourcedoc": "ramImportExcelConfigLoader.pmlobj",
    "sourcecodebase": "ramImportExcelConfigLoader.pmlobj"
  },
  {
    "id": "kb_object_objecttype",
    "category": "objects",
    "subcategory": "object_base_methods",
    "title": "OBJECT.objecttype() method for runtime type identification",
    "principle": "Use objecttype() on any PML2 object to get its type name as a STRING at runtime.",
    "rule": "objecttype() returns a STRING containing the object type identifier.",
    "syntax": "!this.objecttype() -- returns the type name of the current object",
    "exampleCanonical": "-- CB jacEISDeliveryManager.pmlobj\n-- CB obj_09_addErrorToList\n!!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)",
    "exampleAntipattern": "-- Hardcoding type names instead of using objecttype()\n!!ramCommonLogger.addLogDetails('JACEISDELIVERYMANAGER', !errorList)",
    "pitfalls": [
      "Returns the declared type name, not the variable name"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "jacEISDeliveryManager.pmlobj"
  },
  {
    "id": "kb_string_unset",
    "category": "objects",
    "subcategory": "string_methods",
    "title": "STRING.unset() method for existence check",
    "principle": "Use unset() on STRING or ARRAY to check if the variable has been assigned a value.",
    "rule": "unset() returns TRUE if the variable is unassigned/undefined, FALSE if it holds a value.",
    "syntax": "!str.unset() -- TRUE if !str is not set\n!arr.unset() -- TRUE if !arr is not set",
    "exampleCanonical": "-- CB jacEISDeliveryManager.pmlobj\n-- CB obj_09_loadReportDetails\nif(!viewDetails.set() AND !viewDetails.size().eq(7)) then\n  -- process details\nelse\n  !this.clearData()\nendif",
    "exampleAntipattern": "-- Checking set() vs unset() confusion\nif(!str.unset()) then -- wrong: checks if unset, but code expects set\n  ...",
    "pitfalls": [
      "set() and unset() are inverses: !x.set() is equivalent to !x.unset().not()"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "jacEISDeliveryManager.pmlobj"
  },
  {
    "id": "pml_obj_lstgrp_lstdef",
    "category": "objects",
    "subcategory": "AVEVA Engineering Lists",
    "title": "LSTDEF and LSTGRP objects for list management",
    "principle": "LSTDEF (List Definition) and LSTGRP (List Group) are AVEVA Engineering objects used to manage named lists for tag data grouping.",
    "rule": "Query LSTDEF to find a list by name. Access LSTGRP via `LSTGRP of` to get the group. Use CATNAM to get the group name. Set lstflt to clear filters.",
    "syntax": "var !grid collect all LSTDEF with (LSTNAM eq |listName|)\n!gridRef = !grid.first().dbref()\n!gridRef.lstflt = !realUnset\nvar !gName CATNAM of LSTGRP of $!gridRef",
    "exampleCanonical": "-- CB manual-data-export.pmlmac\n-- Find and clear a list\nvar !grid collect all LSTDEF with (LSTNAM eq |IM-tag-dataset|)\nif (!grid.size() eq 1) then\n    !gridRef = !grid.first().dbref()\n    !gridRef.lstflt = ARRAY()\n    var !gName CATNAM of LSTGRP of $!gridRef\nendif",
    "exampleAntipattern": "-- Don't assume grid.size() == 1; always check before accessing first()",
    "pitfalls": [
      "LSTDEF/LSTGRP are Engineering-specific; not available in PDMS.",
      "lstflt is a reference attribute; setting it to an empty ARRAY clears the filter."
    ],
    "relatedIds": [
      "pml_obj_pmltags"
    ],
    "sourcedoc": "AVEVA Engineering List Reference",
    "sourcecodebase": "manual-data-export.pmlmac"
  },
  {
    "id": "pml_obj_pmltags",
    "category": "objects",
    "subcategory": "AVEVA Engineering",
    "title": "PMLTAGS object and exportasxls method",
    "principle": "The PMLTAGS object provides methods to query and export engineering tag data to spreadsheet formats.",
    "rule": "Create a PMLTAGS instance with `object PMLTAGS()`, then call `.exportasxls(!groupName, !listName, !filePath)` to export matching tags.",
    "syntax": "!!tags = object PMLTAGS()\n!!tags.exportasxls(!groupName, !listName, !filePath)",
    "exampleCanonical": "-- CB manual-data-export.pmlmac\n-- Export tags from a named list\n!!tags = object PMLTAGS()\nvar !grid collect all LSTDEF with (LSTNAM eq |my-list|)\nif (!grid.size() eq 1) then\n    !gridRef = !grid.first().dbref()\n    var !gName CATNAM of LSTGRP of $!gridRef\n    !!tags.exportasxls(!gName, '$!<gridRef.LSTNAM>', '$!outPath')\nendif",
    "exampleAntipattern": "-- Don't reuse PMLTAGS across different export contexts without clearing\n!!tags = object PMLTAGS()\n!!tags.exportasxls(...)\n!!tags.exportasxls(...) -- stale state may cause wrong export",
    "pitfalls": [
      "PMLTAGS is specific to AVEVA Engineering; it may not be available in PDMS-only environments.",
      "The exportasxls method requires valid group and list names; passing empty strings causes runtime errors."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA Engineering PML Customization",
    "sourcecodebase": "manual-data-export.pmlmac"
  },
  {
    "id": "obj_tagmanagementtmp_equipmentnamupdate",
    "category": "objects",
    "subcategory": "tagmanagementtmp",
    "title": "TAGMANAGEMENTTMP.EquipmentNameUpdate(boolean) method",
    "principle": "TAGMANAGEMENTTMP is a user-defined object type with multiple update methods (alarmsDataUpdate, ClassNameUpdate, EquipmentNameUpdate). Each takes a boolean parameter.",
    "rule": "Create TAGMANAGEMENTTMP instance via 'object TAGMANAGEMENTTMP()' and call update methods with boolean arguments.",
    "syntax": "!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.EquipmentNameUpdate(false)",
    "exampleCanonical": "-- CB equipment-name-refresh.pmlmac\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.EquipmentNameUpdate(false)",
    "exampleAntipattern": "Do not assume TAGMANAGEMENTTMP has no-argument constructor — always use 'object TAGMANAGEMENTTMP()'.",
    "pitfalls": [
      "TAGMANAGEMENTTMP methods like EquipmentNameUpdate, ClassNameUpdate, alarmsDataUpdate all take boolean parameters.",
      "The boolean parameter typically controls force/overwrite behavior."
    ],
    "relatedIds": [
      "mac_file_path_pattern"
    ],
    "sourcedoc": "AVEVA PML Customization Guide — Object Methods",
    "sourcecodebase": "equipment-name-refresh.pmlmac"
  },
  {
    "id": "syscom_mkdir_command",
    "category": "objects",
    "subcategory": "system_commands",
    "title": "Syscom MKDIR for directory creation",
    "principle": "Syscom executes system commands. MKDIR creates directories. Use with variable substitution for dynamic paths.",
    "rule": "Syscom |MKDIR \"$!publishPath\"| to create a directory from a PML variable path.",
    "syntax": "Syscom |MKDIR \"$!path\"|",
    "exampleCanonical": "-- CB JDE_delta_tag_export.pmlmac\n-- CB mac_22\n!publishPath = '$!<folder>$!year-$!month\\'\nSyscom |MKDIR \"$!publishPath\"|",
    "exampleAntipattern": "Using MKDIR without quotes around variable path",
    "pitfalls": [
      "Syscom MKDIR may fail silently if directory already exists",
      "Use !!mkdir() function as alternative in PML2"
    ],
    "relatedIds": [
      "obj_definition_structure"
    ],
    "sourcedoc": "AVEVA PML System Commands",
    "sourcecodebase": "JDE_delta_tag_export.pmlmac"
  },
  {
    "id": "block_evaluate_expression",
    "category": "objects",
    "subcategory": "block",
    "title": "BLOCK object with evaluate() for dynamic PML expressions",
    "principle": "The BLOCK object wraps a PML expression string and can be evaluated against a DBREF to produce a runtime value.",
    "rule": "Use 'object BLOCK(expressionString)' to create a block, then 'dbref.evaluate(block)' to compute the result.",
    "syntax": "!block = object BLOCK(!expressionString)\n!result = !dbref.evaluate(!block)",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\n!block = object BLOCK(!expression)\n!value = !tagRef.evaluate(!block)",
    "exampleAntipattern": "!value = !tagRef.:AttributeName  -- static attribute access only",
    "pitfalls": [
      "Expression string must be valid PML syntax",
      "Handle exceptions with handle ANY around evaluate() call",
      "Returns ANY type; may be STRING, REAL, or ERROR"
    ],
    "relatedIds": [
      "string_ift_function",
      "nested_handle_any_in_loop"
    ],
    "sourcedoc": "AVEVA PML Customization — Object Methods",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  },
  {
    "id": "datetime_object_methods",
    "category": "objects",
    "subcategory": "system_objects",
    "title": "DATETIME Object and Time Methods",
    "principle": "The DATETIME object provides date/time component extraction via method calls on an OBJECT DATETIME() instance.",
    "rule": "Always create via OBJECT DATETIME(), then chain component methods. Use .string('I2') for zero-padded 2-digit formatting.",
    "syntax": "!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\n-- CB JDE_fullDataProperties-export.pmlmac\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')\n!date = !dt.date().string('I2')\n!hour = !dt.hour().string('I2')\n!minute = !dt.minute().string('I2')",
    "exampleAntipattern": "-- Using STRING concatenation for date parts produces inconsistent output\n!dateStr = !month & |_| & !date  -- \"1_5\" vs \"12_31\"",
    "pitfalls": [
      "DATETIME object not documented in official KB. Methods must be confirmed against AVEVA docs or real source.",
      ".string('I2') format specifier not in official syntax reference but confirmed in codebase."
    ],
    "relatedIds": [
      "variable_interpolation_dollar"
    ],
    "sourcedoc": "AVEVA PML Customization — System Objects",
    "sourcecodebase": "JDE_data-import.pmlmac"
  },
  {
    "id": "netdatasource_constructor",
    "category": "objects",
    "subcategory": "netdatasource",
    "title": "NETDATASOURCE constructor for grid data binding",
    "principle": "NETDATASOURCE creates a data source object for binding tabular data to NETGRIDCONTROL.",
    "rule": "Use object NETDATASOURCE(label, headerArray, dataArray) to create a data source where each element in dataArray corresponds to a row and each column corresponds to an element in headerArray.",
    "syntax": "object NETDATASOURCE(label STRING, headerArray ARRAY, dataArray ARRAY)",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\n!headerList = ARRAY()\n!headerList.append(|Tag Name|)\n!headerList.append(|Property Value|)\n!dataList = ARRAY()\n!dataList.append(!tagDataRow)  -- each row is an ARRAY\n!source = object NETDATASOURCE('data', !headerList, !dataList)",
    "exampleAntipattern": "!source = object array()  -- ARRAY is not NETDATASOURCE",
    "pitfalls": [
      "dataArray must be an ARRAY of ARRAYs (rows)",
      "Each inner array element count must match header count",
      "Label is an arbitrary string identifier for the data source"
    ],
    "relatedIds": [
      "netgridcontrol_methods"
    ],
    "sourcedoc": "AVEVA PML Add-ins — GridControl",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  },
  {
    "id": "netgridcontrol_core_presentation",
    "category": "objects",
    "subcategory": "net_controls",
    "title": "NETGRIDCONTROL and NETDATASOURCE with Aveva.Core.Presentation",
    "principle": "NETGRIDCONTROL is a .NET add-in object for displaying tabular data in PML",
    "rule": "Import GridControl, use namespace Aveva.Core.Presentation, create object NETGRIDCONTROL(), use clearGrid(), bindToDataSource(), getrows()",
    "syntax": "import 'GridControl'\nhandle any\nendhandle\nusing namespace |Aveva.Core.Presentation|\n!grid = object NETGRIDCONTROL()\n!grid.clearGrid()",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\n-- CB mac_20\nusing namespace |Aveva.Core.Presentation|\n!dataTable = object NETGRIDCONTROL()\n!dataTable.clearGrid()\n!dataSource = object NETDATASOURCE('Grid Table', !fileName)\n!dataTable.bindToDataSource(!dataSource)\n!data = !dataTable.getrows()",
    "exampleAntipattern": "NETGRIDCONTROL  -- missing 'object' keyword and namespace",
    "pitfalls": [
      "Requires 'import GridControl' before use",
      "Requires 'using namespace |Aveva.Core.Presentation|'",
      "NETDATASOURCE is a separate object"
    ],
    "relatedIds": [
      "netdatasource_object"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_data-import.pmlmac"
  },
  {
    "id": "netgridcontrol_methods",
    "category": "objects",
    "subcategory": "netgridcontrol",
    "title": "NETGRIDCONTROL object methods: clearGrid, BindToDataSource, saveGridToExcel",
    "principle": "NETGRIDCONTROL is a .NET add-in object for displaying tabular data in PML. Key methods include clearGrid(), BindToDataSource(), and saveGridToExcel().",
    "rule": "Create NETGRIDCONTROL, clearGrid(), bind NETDATASOURCE, then optionally saveGridToExcel() for export.",
    "syntax": "!grid = object NETGRIDCONTROL()\n!grid.clearGrid()\n!source = object NETDATASOURCE(label, headers, data)\n!grid.BindToDataSource(!source)\n!grid.saveGridToExcel(path)",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\n!dataTable = object NETGRIDCONTROL()\n!dataTable.clearGrid()\n!source = object NETDATASOURCE('data', !headerList, !dataList)\n!dataTable.BindToDataSource(!source)\n!dataTable.saveGridToExcel(|$!publishPath|)",
    "exampleAntipattern": "!grid = object array()  -- ARRAY is not NETGRIDCONTROL",
    "pitfalls": [
      "Requires 'import GridControl' and 'using namespace |Aveva.Core.Presentation|'",
      "NETDATASOURCE label parameter is a string identifier",
      "saveGridToExcel() path must be a valid file path string"
    ],
    "relatedIds": [
      "netdatasource_constructor"
    ],
    "sourcedoc": "AVEVA PML Add-ins — GridControl",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  },
  {
    "id": "obj_tagmanagementtmp",
    "category": "objects",
    "subcategory": "customer-specific",
    "title": "TAGMANAGEMENTTMP customer object",
    "principle": "TAGMANAGEMENTTMP is a project-specific PML object providing tag management utilities including deletion of unnamed tags.",
    "rule": "Construct with object TAGMANAGEMENTTMP() and call deleteUnnamedTags() to remove unnamed tags from the current database context.",
    "syntax": "!obj = object TAGMANAGEMENTTMP()\n!obj.deleteUnnamedTags()",
    "exampleCanonical": "-- CB unnamed-tag-delete.pmlmac\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n!tagMgmt = object TAGMANAGEMENTTMP()\n!tagMgmt.deleteUnnamedTags()",
    "exampleAntipattern": "-- WRONG: omit validated pattern for TAGMANAGEMENTTMP customer object\n-- Review source unnamed-tag-delete.pmlmac before reuse",
    "pitfalls": [
      "Object must be reloaded after source changes",
      "deleteUnnamedTags() operates on the current database session context"
    ],
    "relatedIds": [
      "cmd_pml_reload_object"
    ],
    "sourcedoc": "Customer codebase — unnamed-tag-delete.pmlmac",
    "sourcecodebase": "unnamed-tag-delete.pmlmac"
  },
  {
    "id": "string_format_specifier_I2",
    "category": "objects",
    "subcategory": "string_formatting",
    "title": "STRING String() with Format Specifier (I2)",
    "principle": "STRING objects can be formatted using format specifiers passed to the String() method for consistent numeric representation.",
    "rule": "Use !value.String(\\",
    "syntax": "!value.String(\\",
    "exampleCanonical": "-- CB JDE_data-import.pmlmac\n!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().String('I2')  -- Zero-padded: 01..12\n!date = !dt.date().String('I2')    -- Zero-padded: 01..31\n!hour = !dt.hour().String('I2')    -- Zero-padded: 00..23\n!minute = !dt.minute().String('I2') -- Zero-padded: 00..59",
    "exampleAntipattern": "-- No formatting produces inconsistent widths\n!month = !dt.month().String()  -- Returns \"1\" or \"12\"\n!date = !dt.date().String()   -- Returns \"5\" or \"31\"",
    "pitfalls": [
      "Format specifiers like \\",
      " are product-specific (PDMS/E3D)",
      "I2 means integer with minimum width 2, zero-padded",
      "Not all AVEVA products support the same format specifiers"
    ],
    "relatedIds": [
      "obj_definition_structure"
    ],
    "sourcedoc": "AVEVA PML Customization Guide — Expression Formatting",
    "sourcecodebase": "JDE_data-import.pmlmac"
  },
  {
    "id": "objects_file_set_exists_pattern",
    "category": "objects",
    "subcategory": "file",
    "title": "FILE Object set() and exists() Pattern",
    "principle": "The FILE object requires .set() to resolve the path before .exists() can reliably check for the file or folder.",
    "rule": "Create FILE object with path, call .set() to resolve, then use .exists() to check. Combine with AND for conditional logic.",
    "syntax": "!file = object FILE(!path)\nif(!file.set() AND !file.exists()) then\n  -- file/folder exists\nelse\n  -- handle missing\nendif",
    "exampleCanonical": "-- CB jacEISDeliveryForm.pmlfrm\n!file = object FILE(!outputFolder.val)\nif(!file.set() AND !file.exists()) then\n  -- proceed with export\nelse\n  !!alert.warning('Please select valid output folder')\nendif",
    "exampleAntipattern": "-- Checking exists without set (may fail on relative paths)\n!file = object FILE(!path)\nif(!file.exists()) then",
    "pitfalls": [
      ".set() resolves the path and returns success/failure",
      ".exists() checks both files and folders",
      "Use .fullname() to get resolved absolute path"
    ],
    "relatedIds": [
      "errorhandling_defined_global_form"
    ],
    "sourcedoc": "AVEVA PML Objects Reference - FILE",
    "sourcecodebase": "jacEISDeliveryForm.pmlfrm"
  },
  {
    "id": "objects_net_data_source_binding",
    "category": "objects",
    "subcategory": "netgrid",
    "title": "NETGRIDCONTROL with NETDATASOURCE Binding",
    "principle": "NETGRIDCONTROL from GridControl add-in can be bound to data via NETDATASOURCE object for dynamic data display.",
    "rule": "Create NETGRIDCONTROL object, configure properties (columnExcelFilter, fixedRows, etc.), create NETDATASOURCE with columns and rows, then bind with bindToDataSource().",
    "syntax": "using namespace 'Aveva.Core.Presentation'\n!grid = object NETGRIDCONTROL()\n!grid.columnExcelFilter(true)\n!grid.fixedRows(true)\n!nds = object NETDATASOURCE('name', !headings, !rows)\n!grid.bindToDataSource(!nds)",
    "exampleCanonical": "-- CB jacEISDeliveryForm.pmlfrm\n!this.gridSelectionList = object NETGRIDCONTROL()\n!this.coSelectionList.control = !this.gridSelectionList.handle()\n!this.gridSelectionList.columnExcelFilter(true)\n!this.gridSelectionList.fixedRows(true)\n!this.gridSelectionList.singleRowSelection(false)\n!this.gridSelectionList.editableGrid(true)\n!this.gridSelectionList.outlookGroupStyle(false)\n!nds = object NETDATASOURCE('viewName', !headings, !rows)\n!this.gridSelectionList.bindToDataSource(!nds)",
    "exampleAntipattern": "-- Direct assignment without binding (no data display)\n!grid = object NETGRIDCONTROL()\n!grid.data = !rows",
    "pitfalls": [
      "NETGRIDCONTROL requires GridControl import",
      "NETDATASOURCE namespace must be set",
      "Column names in headings must match data array dimensions"
    ],
    "relatedIds": [
      "ui_container_pmlnetcontrol_net"
    ],
    "sourcedoc": "AVEVA GridControl Add-in Documentation",
    "sourcecodebase": "jacEISDeliveryForm.pmlfrm"
  },
  {
    "id": "objects_pml_folder_browser",
    "category": "objects",
    "subcategory": "browser",
    "title": "PMLFolderBrowser Object for Folder Selection",
    "principle": "PMLFolderBrowser provides a standard folder selection dialog accessible from PML forms.",
    "rule": "Create PMLFolderBrowser object, call .show(title, mode) to display, then read .selectedPath() for the result.",
    "syntax": "using namespace 'Aveva.Core.Presentation'\n!browser = object PMLFOLDERBROWSER()\n!browser.show('Select Folder', true)\n!path = !browser.selectedPath()",
    "exampleCanonical": "-- CB jacEISDeliveryForm.pmlfrm\nusing namespace 'Aveva.Core.Presentation'\n!folderBrowser = object PMLFOLDERBROWSER()\n!folderBrowser.show('Select Output Folder', true)\n!this.teOutputFolder.val = !folderBrowser.selectedPath()",
    "exampleAntipattern": "-- Using FILE object for folder browsing (less user-friendly)\n!file = object FILE('')\n!file.browse()",
    "pitfalls": [
      "PMLFOLDERBROWSER requires Aveva.Core.Presentation namespace",
      "selectedPath() returns empty string if dialog cancelled",
      "Second parameter of .show() controls multi-select mode"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Objects Reference",
    "sourcecodebase": "jacEISDeliveryForm.pmlfrm"
  }
];
