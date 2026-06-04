import type { KBEntry } from '../schemas/kb-entry.js';

export const pdmsinteractionEntries: KBEntry[] = [
  {
    "id": "pdms_current_element",
    "category": "pdmsinteraction",
    "subcategory": "navigation",
    "title": "CE (Current Element) — точка отсчёта навигации",
    "principle": "Все команды навигации и запросов атрибутов в PDMS работают относительно Current Element (CE) — текущей позиции в дереве проекта. Смена CE определяет контекст операций, поэтому код обязан знать, где находится CE перед запросом.",
    "rule": "Используйте команду TAGS (перейти к корню Tags) или прямой переход по имени/DBREF, чтобы установить CE. CE является неявным контекстом для `q att`, навигации (up/first/next) и COLL ALL.",
    "syntax": "TAGS\n-- или\n$!elementRef\n-- устанавливает CE на элемент, на который указывает DBREF",
    "exampleCanonical": "-- CB JDE_routine-macro-run.pmlmac\nTAGS\n\nONERROR GOLABEL /Error\n!!ramCommonLogger = object RAMCOMMONLOGGER()\n-- ... далее все операции идут от TAGS как корня",
    "exampleAntipattern": "-- выполнение операций с атрибутами без проверки/установки CE:\nq att :TagStatus\n-- ошибка: если CE не установлен на нужный элемент, вернёт атрибут произвольного текущего элемента",
    "pitfalls": [
      "CE — глобальное состояние: любая команда навигации меняет его для всей сессии",
      "После вызова функции/макроса CE может сдвинуться — восстанавливать при необходимости",
      "TAGS — это PDMS-команда перехода к корневому элементу тегов, не PML-ключевое слово"
    ],
    "relatedIds": [
      "pdms_navigation_commands",
      "pdms_attribute_query",
      "cf_guard_clause"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §7.2 (Current Element, CE); TM-1401 PML Macros Rev 2.0, §3 (PDMS Navigation)",
    "sourcecodebase": "JDE_routine-macro-run.pmlmac"
  },
  {
    "id": "pdms_navigation_commands",
    "category": "pdmsinteraction",
    "subcategory": "navigation",
    "title": "Навигация по иерархии: members, owner, deslnk",
    "principle": "Дерево PDMS обходится через иерархические ссылки: .members (дочерние), owner (родитель), deslnk (ссылка на design-элемент). Навигация через `var ... FOR` / `EVAL ... FOR ALL ... FOR` позволяет собирать данные по ветке дерева без ручного обхода.",
    "rule": "Используйте `var !list EVAL (EXPRESSION) FOR ALL (TYPE) FOR $!element` для сбора данных по ветке; .members для прямых потомков; OWNER для подъёма; .deslnk для перехода из Engineering в Design.",
    "syntax": "var !list EVAL (ATTRIBUTE) FOR ALL (TYPE) FOR $!element\n-- или\n!children = !element.members\n!parent = !element.owner\n!designElement = !element.deslnk[1]",
    "exampleCanonical": "-- CB TagManagementTmp.pmlobj\n!desPipes = !pipe1D.deslnk\ndo !desPipe values !desPipes\n  !desBranches = !desPipe.members\n  handle any\n    $P 3D PIPE $!<desPipe.name> are not having any members\n  elsehandle none\n    do !desBran values !desPipe.members\n      !pipeLength = !pipeLength + !desBran.CLLEN\n      handle any\n        $P Length calculation error for $!<desBran.name>: $!!error.text\n      endhandle\n    enddo\n  endhandle\nenddo",
    "exampleAntipattern": "-- обращение к .members без handle: если элемент не имеет потомков, возможна ошибка\n!children = !element.members\ndo !child values !children\n  -- при пустом списке ошибки не будет, но при badref — будет\nenddo",
    "pitfalls": [
      "deslnk может быть ARRAY (один 1D-элемент может ссылаться на несколько 3D)",
      "Всегда проверяйте badref() перед обращением к members или deslnk",
      "var EVAL FOR ALL — собирает ARRAY из выражения, результат всегда массив строк"
    ],
    "relatedIds": [
      "pdms_current_element",
      "pdms_dbref_resolve",
      "dt_dbref_usage",
      "eh_handle_any"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §7.3 (Navigation commands); TM-1401 PML Macros Rev 2.0, §3 (PDMS Navigation, var EVAL FOR)",
    "sourcecodebase": "TagManagementTmp.pmlobj"
  },
  {
    "id": "pdms_attribute_query",
    "category": "pdmsinteraction",
    "subcategory": "attributes",
    "title": "Запрос атрибутов: .attribute(), q att, COLL ALL",
    "principle": "Чтение атрибутов элементов PDMS — ключевая операция. Есть три подхода: прямой доступ через точечную нотацию (!ref.:AttributeName), метод .attribute('name'), и PDMS-команда `q att`. COLL ALL собирает ARRAY элементов по фильтру. Каждый может вернуть UNSET — это нужно обрабатывать.",
    "rule": "Для программного доступа используйте !ref.:UDAName (для UDA) или !ref.attribute('name'); для массовых запросов — `var !list COLL ALL (TYPE) WITH (FILTER)`. Всегда проверяйте результат на .unset() и .empty().",
    "syntax": "-- точечная нотация (прямой доступ к UDA)\n!value = !elementRef.:TagStatus\n-- метод attribute (для динамических имён)\n!value = !elementRef.attribute(!att.name())\n-- COLLECTION запрос\nvar !tags COLL ALL (ENGITEM) WITH (:TagStatus eq |ACTIVE| AND ISNAMED)",
    "exampleCanonical": "-- CB TagManagementTmp.pmlobj\nvar !tags COLL ALL (ENGITEM) WITH (:TagStatus eq |ACTIVE| and ISNAMED and NOT(EMPTY(:RAMTAGOWNER)) and NOT(EMPTY(:TagStatus)) and NOT(EMPTY(:RambollTagStatus)))\n!this.tags = !tags\n\n-- CB: ramImportExcelElementLoader.pmlobj, .loadElement()\n!elementRefe.acttype   -- встроенный атрибут (тип элемента)\n!elementRefe.name      -- встроенный атрибут (полное имя)\n!elementRefe.namn      -- встроенный атрибут (короткое имя)",
    "exampleAntipattern": "-- чтение атрибута без проверки на UNSET и без handle:\n!status = !tagRef.:TagStatus\n$P Status is $!status\n-- если :TagStatus не задан, $!status будет UNSET и вывод непредсказуем",
    "pitfalls": [
      "COLL ALL может вернуть пустой массив — проверяйте .size()",
      "Сложные фильтры COLL ALL с .NET-типами (|:Pipeline|) могут вызвать ошибку — оборачивайте handle",
      "Разница между .name (полный путь /A/B/C) и .namn (только имя C)"
    ],
    "relatedIds": [
      "dt_unset_handling",
      "pdms_current_element",
      "cf_do_enddo_loop",
      "fnc_pdms_navigation"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §7.4 (Query attributes, UNSET); TM-1401 PML Macros Rev 2.0, §3.2 (COLLECTION queries)",
    "sourcecodebase": "TagManagementTmp.pmlobj"
  },
  {
    "id": "pdms_attribute_update",
    "category": "pdmsinteraction",
    "subcategory": "attributes",
    "title": "Обновление атрибутов элементов PDMS",
    "principle": "Запись значений атрибутов PDMS требует, чтобы элемент был claimable (доступен для записи). Присвоение выполняется через прямую нотацию (!ref.:UDA = value) или через .attribute() для динамических имён. Перед записью необходимо проверить dbwrite и modatt.",
    "rule": "Перед записью атрибута проверяйте !ref.dbwrite и !ref.modatt (или используйте утилитарную функцию !!dbRefUpdatable). Оборачивайте запись в handle. Для ARRAY-атрибутов используйте APPEND-синтаксис или полное присвоение.",
    "syntax": "-- прямое присвоение UDA\n!elementRef.:TagStatus = |ACTIVE|\n-- присвоение через attribute() для динамического имени\n!elementRef.attribute(!att.name()) = !value\n-- ARRAY APPEND через PDMS-команду\n$!elementRef :TagRefToDocument APPEND $!docRef",
    "exampleCanonical": "-- CB TagManagementTmp.pmlobj\n!isModifiable = !!dbRefUpdatable(!eleRef)\nif (!isModifiable.not()) then\n  !isError = true\n  !msg = 'Element can not be claimed!'\nendif\nif (!isError.not()) then\n  if (!attributeType eq 'REAL') then\n    !eleRef.attribute(!attribute.name()) = !attributeValue.real()\n    handle any\n      !isError = true\n    endhandle\n  endif\n  if (!attributeType eq 'TEXT') then\n    !eleRef.attribute(!attribute.name()) = !attributeValue\n    handle any\n      !isError = true\n    endhandle\n  endif\nendif",
    "exampleAntipattern": "-- запись без проверки claimability и без handle:\n!tagRef.:TagStatus = |ACTIVE|\n-- если элемент принадлежит другому пользователю или readonly, ошибка прервёт выполнение",
    "pitfalls": [
      "dbwrite/modatt=false означает элемент locked другим пользователем или readonly",
      "ARRAY-атрибуты (like :TagRefToDocument) могут требовать APPEND вместо прямого присвоения",
      "Тип значения должен соответствовать типу атрибута (REAL/TEXT/REFERENCE/DATETIME)"
    ],
    "relatedIds": [
      "pdms_attribute_query",
      "pdms_element_existence",
      "tc_db_to_pml_mapping",
      "eh_handle_endhandle"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §7.5 (Updating attributes); TM-1401 PML Macros Rev 2.0, §3.3 (PDMS element modification)",
    "sourcecodebase": "TagManagementTmp.pmlobj"
  },
  {
    "id": "pdms_element_create",
    "category": "pdmsinteraction",
    "subcategory": "elements",
    "title": "Создание элементов через .NET PMLElementManager",
    "principle": "Создание новых элементов PDMS в production-коде выполняется через .NET API (Aveva.Engineering.PMLElementManager): CREATEELEMENT→SetElementTypeByName→AddAttributeValue(NAME)→Execute(). Это даёт контроль над типом и именем в одной транзакции, в отличие от PDMS-команды `new TYPE`.",
    "rule": "Используйте `using namespace |Aveva.Engineering.PMLElementManager|`, создайте CREATEELEMENT(), вызовите SetElementTypeByName(type), AddAttributeValue('NAME', name), Execute(). Оборачивайте каждый шаг handle. Проверяйте тип через ELEMENTTYPE перед созданием.",
    "syntax": "using namespace |Aveva.Engineering.PMLElementManager|\n!createNet = object CREATEELEMENT()\n!etype = object ELEMENTTYPE(!type)\nif (!etype.name() neq |UNKNOWN|) then\n  !createNet.SetElementTypeByName(!type)\n  !createNet.AddAttributeValue(|NAME|, !name)\n  !createNet.Execute()\nendif",
    "exampleCanonical": "-- CB ramTagManagement.pmlobj\nusing namespace |Aveva.Engineering.PMLElementManager|\n!createNet = object CREATEELEMENT()\n!etype = object ELEMENTTYPE(!type)\nif(!etype.name() neq |UNKNOWN|) then\n  !createNet.SetElementTypeByName(!type)\n  handle any\n    !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\n    return !elementRef\n  endhandle\n  !createNet.AddAttributeValue(|NAME|, !name)\n  !createNet.ExecuteSync()\n  handle any\n    !errorDetail = !createNet.GetErrorDetails()\n    !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\n  endhandle\nendif\n\n-- далее проверяем, что элемент создан:\n!elementRef = !name.dbRef()\nhandle any\n  !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\nendhandle",
    "exampleAntipattern": "-- использование PDMS-команды new без проверки типа и существования:\nnew :ENGITEM /$!tagName\n-- ошибка: нет контроля типа, нет проверки дублей, нет обработки ошибок",
    "pitfalls": [
      "ELEMENTTYPE.name() == 'UNKNOWN' — тип не существует в схеме данных",
      "ExecuteSync() vs Execute(): Sync блокирует до завершения",
      "После Execute необходимо заново получить DBREF через !name.dbRef() — createElement не возвращает ссылку напрямую"
    ],
    "relatedIds": [
      "dn_import_guard",
      "dn_object_instantiation",
      "pdms_element_existence",
      "eh_handle_any"
    ],
    "sourcedoc": "TM-1401 PML Macros Rev 2.0, §4.3 (.NET Interop — PMLElementManager); TM-1401 PML Basic Rev 3.0, §7.6 (Creating elements)",
    "sourcecodebase": "ramTagManagement.pmlobj"
  },
  {
    "id": "pdms_element_existence",
    "category": "pdmsinteraction",
    "subcategory": "elements",
    "title": "Проверка существования элемента по имени",
    "principle": "Перед созданием или модификацией элемента необходимо проверить, существует ли он в базе данных PDMS. Стандартный паттерн: !name.dbRef() в блоке handle any — если ошибка, элемент не найден.",
    "rule": "Используйте `!ref = !name.dbRef()` внутри handle any. Если handle сработал — элемент не существует. Дополнительно проверяйте .badref() для ссылок, полученных из атрибутов.",
    "syntax": "!elementRef = !name.dbRef()\nhandle any\n  -- элемент не найден\nendhandle\n-- или проверка badref:\nif (!someRef.badref()) then\n  -- ссылка невалидна\nendif",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n!elementRefe        = object DBREF()\n!validName          = !name.trim()\n!isSlashNeeded      = !validName.subString(1,1).neq('/') AND !validName.subString(1,1).neq('=') $\n                      AND !validName.occurs(' ').eq(0)\nif(!isSlashNeeded) then\n  !validName        = '/' + !name\nendif\n!elementRefe        = !validName.dbRef()\nhandle any\nendhandle\nreturn !elementRefe\n\n-- CB: ramImportExcelElementLoader.pmlobj, .loadElement()\nif(!elementRefe.unset()) then\n  -- элемент не найден: создать\n  !elementRefe = !this.tagManagement.createElement(!excelTagName, !className)\nendif",
    "exampleAntipattern": "-- вызов !name.dbRef() без handle — при отсутствии элемента ошибка прервёт выполнение:\n!ref = !tagName.dbRef()\n!ref.:TagStatus = |ACTIVE|\n-- если элемент не существует, вторая строка не выполнится и макрос прервётся",
    "pitfalls": [
      "!name.dbRef() без '/' в начале — ищет относительно CE, не от корня",
      "badref() и unset() — разные проверки: badref для ссылок из атрибутов, unset для переменных",
      "Имя элемента PDMS case-insensitive для поиска, но case-sensitive при создании"
    ],
    "relatedIds": [
      "pdms_element_create",
      "dt_dbref_usage",
      "dt_unset_handling",
      "eh_handle_any"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §5.9 (DBREF methods, badref); TM-1401 PML Macros Rev 2.0, §3.1 (Element existence check)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "pdms_dbref_resolve",
    "category": "pdmsinteraction",
    "subcategory": "elements",
    "title": "Получение и работа с DBREF",
    "principle": "DBREF — это ссылка на элемент в иерархии PDMS. Получение: .dbRef() из строки, object DBREF() для пустой ссылки, напрямую из атрибута типа REFERENCE. Ключевые свойства: .name (полный путь), .namn (короткое имя), .acttype (тип), .badref() (валидность).",
    "rule": "Перед использованием DBREF проверяйте .badref() — невалидная ссылка означает удалённый или несуществующий элемент. Для BACKREF (обратные ссылки) используйте `var !list BACKREF(attname :ATTR) of $!element`.",
    "syntax": "-- из строки\n!ref = !nameString.dbRef()\n-- пустая ссылка\n!ref = object DBREF()\n-- из атрибута\n!parentRef = !tagRef.:TagRefToParentTag\n-- проверка\nif (!ref.badref().not()) then\n  !typeName = !ref.acttype\nendif\n-- обратная ссылка\nvar !backRefElement BACKREF(attname $!backAttribute) of $!element",
    "exampleCanonical": "-- CB ramGetBackRef.pmlfnc\ndefine function !!ramGetBackRef(!element is DBREF, !backAttribute is STRING) is DBREF\n  !backRefElement = object DBREF()\n  var !backRefElement BACKREF(attname $!backAttribute) of $!element\n  handle any\n  endhandle\n  return !backRefElement\nendfunction\n\n-- CB: jacPropagateParentData.pmlfnc — проверка badref перед навигацией\n!parentRef = !tagRef.attribute(!parentAttribute)\nif(!parentRef.badref().not()) then\n  do !attIdx indices !attList\n    !attValue = !parentRef.attribute(!attList[!attIdx])\n    -- ...\n  enddo\nendif",
    "exampleAntipattern": "-- обращение к свойствам DBREF без проверки badref:\n!parentRef = !tagRef.:TagRefToParentTag\n!parentName = !parentRef.namn\n-- если :TagRefToParentTag не установлен или удалён, .namn вызовет runtime error",
    "pitfalls": [
      "badref() возвращает TRUE для удалённых элементов и для незаполненных ссылочных атрибутов",
      ".dbRef() из строки без '/' ищет относительно CE",
      "BACKREF возвращает DBREF (не ARRAY) — если обратных ссылок несколько, нужен COLL"
    ],
    "relatedIds": [
      "dt_dbref_usage",
      "pdms_element_existence",
      "dt_unset_handling",
      "fnc_pdms_navigation"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §5.9 (DBREF data type, badref, dbref); TM-1401 PML Macros Rev 2.0, §3.4 (BACKREF)",
    "sourcecodebase": "ramGetBackRef.pmlfnc"
  },
  {
    "id": "pdms_transaction",
    "category": "pdmsinteraction",
    "subcategory": "transaction",
    "title": "Транзакции: SAVEWORK, UNCLAIM ALL, GETWORK",
    "principle": "PDMS использует концепцию claim/release для контроля конкурентного доступа к элементам. SAVEWORK фиксирует все изменения в БД. UNCLAIM ALL освобождает все заблокированные элементы. В production-макросах SAVEWORK выполняется в конце pipeline и в блоке обработки ошибок (ONERROR).",
    "rule": "Вызывайте SAVEWORK после завершения всех модификаций. В блоке ONERROR/handle обязательно вызывайте SAVEWORK + UNCLAIM ALL, чтобы не заблокировать элементы при аварийном завершении.",
    "syntax": "SAVEWORK\nUNCLAIM ALL",
    "exampleCanonical": "-- CB JDE_routine-macro-run.pmlmac\nONERROR GOLABEL /Error\n-- ... pipeline шаги ...\n\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  !!ramCommonLogger.writeErrorDataToExcel(|..log_$!<year>-$!<month>.xlsx|, false)\nendhandle\nFINISH\n\n-- CB: JDE_exData_import.pmlmac — SAVEWORK после завершения импорта\nSAVEWORK",
    "exampleAntipattern": "-- макрос модифицирует десятки элементов без SAVEWORK в обработчике ошибок:\ndo !tag values !tags\n  !tagRef.:TagStatus = |ACTIVE|\nenddo\n-- если макрос прервётся, все claim'ы останутся и заблокируют элементы для других пользователей",
    "pitfalls": [
      "SAVEWORK без UNCLAIM ALL оставит элементы в состоянии claimed",
      "ONERROR GOLABEL — PDMS-механизм; handle/endhandle — PML-механизм; оба нужны",
      "FINISH — PDMS-команда завершения макроса, не PML-ключевое слово"
    ],
    "relatedIds": [
      "mac_pipeline_pattern",
      "eh_handle_any",
      "pdms_attribute_update",
      "pdms_current_element"
    ],
    "sourcedoc": "TM-1401 PML Basic Rev 3.0, §7.7 (SAVEWORK, GETWORK — транзакции PDMS, claim-based concurrency); official source not identified for workon — в PDF не описан как PML-команда, возможно команда PDMS CLI",
    "sourcecodebase": "JDE_routine-macro-run.pmlmac"
  },
  {
    "id": "p2_attribute_dynamic",
    "category": "pdmsinteraction",
    "subcategory": "dynamic-attribute",
    "title": "Dynamic attribute access with `.attribute(name)`",
    "principle": "Dynamic attribute names allow generic loaders/exporters to read/write DB attributes configured outside the code.",
    "rule": "Use `.attribute(!name)` only after validating the DBREF and attribute name; wrap in HANDLE because invalid attributes fail at runtime.",
    "syntax": "!value = !element.attribute(!attributeName)\nhandle any\n  -- log !!error.text\nendhandle",
    "exampleCanonical": "-- CB ramTagManagement.pmlobj\n-- Tag management validates elements and converts values before setting configured attributes",
    "exampleAntipattern": "-- NOT: !element.attribute(!name) with unchecked !name from Excel\n-- Плохо: typo or forbidden attribute causes runtime database error",
    "pitfalls": [
      "Validate attribute names from config/Excel",
      "Guard with HANDLE ANY",
      "Check DBREF .set()/.badRef() first"
    ],
    "relatedIds": [
      "pdms_attribute_query",
      "pdms_attribute_update",
      "eh_handle_any"
    ],
    "sourcedoc": "Perplexity PML KB §10.4; TM-1401 attribute access",
    "sourcecodebase": "ramTagManagement.pmlobj"
  },
  {
    "id": "p2_backref",
    "category": "pdmsinteraction",
    "subcategory": "backref",
    "title": "BACKREF/BACKREFWITHNAME navigation",
    "principle": "BACKREF navigates reverse database references from a target element to referring elements.",
    "rule": "Use PML1 `BACKREF(attname $!attribute) of $!element`, handle NONE, then split/return ARRAY. BACKREFWITHNAME is used when named reverse references are required.",
    "syntax": "var !backRefElement BACKREF(attname $!backAttribute) of $!element\nhandle any\nelsehandle none\n  !backRefElements = !backRefElement.split()\nendhandle",
    "exampleCanonical": "-- CB ramGetBackRef.pmlfnc\nvar !backRefElement BACKREF(attname $!backAttribute) of $!element\nhandle any\nelsehandle none\n  !backRefElements = !backRefElement.split()\nendhandle",
    "exampleAntipattern": "-- NOT: assume BACKREF always returns a scalar DBREF\n-- Плохо: result can be NONE or multiple references and needs split/ARRAY handling",
    "pitfalls": [
      "PML1 syntax uses `var` command form",
      "Handle NONE separately",
      "Validate input DBREF and attribute name"
    ],
    "relatedIds": [
      "p2_collect_pml1",
      "pdms_dbref_resolve",
      "fnc_array_accumulator"
    ],
    "sourcedoc": "AVEVA navigation pseudo attributes; Perplexity PML KB; codebase ramGetBackRef",
    "sourcecodebase": "ramGetBackRef.pmlfnc"
  },
  {
    id: 'pdms_collect_all_multi_class',
    category: 'pdmsinteraction',
    subcategory: 'pdmsinteraction',
    title: 'collect all with multiple PDMS class names and filters',
    principle: 'The "collect all" query can target multiple PDMS class names in one expression, optionally with a filter clause.',
    rule: 'Use "var !items collect all (CLASS1 CLASS2 CLASS3) with (FILTER)" to collect objects across multiple types in a single query.',
    syntax: 'var !items collect all (CLASS_A CLASS_B) with (EXPRESSION)',
    exampleCanonical: `-- CB EBA_full_tag_export.pmlmac
var !items collect all (EQUI SUBE STRUC FRMW SBFR PIPE HVAC CWAY SUPPO BRAN MEM) with (ISNAMED)`,
    exampleAntipattern: `-- WRONG: collect without ISNAMED filter
var !items collect all (EQUI PIPE)`,
    pitfalls: [
      'ISNAMED filter excludes unnamed objects.',
      'Large class sets can be slow; consider restricting scope with site/zone filters.',
    ],
    relatedIds: ['pdms_attribute_query', 'pdms_current_element'],
    sourcedoc: 'AVEVA E3D/PDMS Query Reference',
    sourcecodebase: 'EBA_full_tag_export.pmlmac',
  },
  {
    id: 'pdms_dtxr_attribute',
    category: 'pdmsinteraction',
    subcategory: 'pdmsinteraction',
    title: 'dtxr — PDMS description-text pseudo-attribute',
    principle: 'The "dtxr" pseudo-attribute returns the description text of a PDMS object. Used as a fallback when "desc" is unavailable.',
    rule: 'Use "var !desc dtxr of $!ref" to retrieve the description text. Typically used as a fallback after "desc of $!ref" fails.',
    syntax: 'var !desc dtxr of $!objectRef',
    exampleCanonical: `-- CB EBA_full_tag_export.pmlmac
var !desc desc of $!item
handle any
    var !desc dtxr of $!item
endhandle`,
    exampleAntipattern: `-- WRONG: use desc only without fallback
var !desc desc of $!item`,
    pitfalls: [
      '"dtxr" may be empty if no description is set. Always check UNSET before using.',
    ],
    relatedIds: ['pdms_attribute_query', 'pdms_current_element'],
    sourcedoc: 'AVEVA E3D/PDMS Attribute Reference',
    sourcecodebase: 'EBA_full_tag_export.pmlmac',
  },
  {
    id: 'pdms_namn_attribute',
    category: 'pdmsinteraction',
    subcategory: 'pdmsinteraction',
    title: 'namn — PDMS object name pseudo-attribute',
    principle: 'The "namn" pseudo-attribute returns the PDMS name of an object. It is accessed as "namn of $!ref" or via substitute expression "$!ref.namn".',
    rule: 'Use "var !name namn of $!ref" or "$!ref.namn" in pipe strings. Alias for "name" in some PDMS versions.',
    syntax: 'var !name namn of $!objectRef',
    exampleCanonical: `-- CB EBA_full_tag_export.pmlmac
var !itemRef = !item.dbref()
!name = $!<itemRef.namn>`,
    exampleAntipattern: `-- WRONG: use full name when short name is required
!name = !itemRef.name`,
    pitfalls: [
      '"namn" is a PDMS-specific spelling; E3D may use "name" instead. Use "$!ref.namn" for maximum compatibility.',
    ],
    relatedIds: ['pdms_attribute_query', 'pdms_current_element'],
    sourcedoc: 'AVEVA E3D/PDMS Attribute Reference',
    sourcecodebase: 'EBA_full_tag_export.pmlmac',
  },
  {
    "id": "KB-QUERY-COLLECTALLFOR-WORL",
    "category": "pdmsinteraction",
    "subcategory": "collectAllFor",
    "title": "collectAllFor with WORL scope for universal search",
    "principle": "The `!!collectAllFor(type, expression, scope)` function searches the AVEVA database for elements matching criteria. The WORL scope searches universally across all disciplines.",
    "rule": "Always check `.set()` on the result before accessing `.first()` or iterating.",
    "syntax": "!results = !!collectAllFor(|ElementType|, |EXPRESSION|, WORL)\nif(!results.set()) then\n  !target = !results.first()\nendif",
    "exampleCanonical": "-- CB ramTagManagement.pmlobj\n-- Find UDA by name universally\n!udaList = !!collectAllFor(|UDA|, |UPCASE(UDNAME) EQ UPCASE('MyUDA')|, WORL)\nif(!udaList.set()) then\n  !attributeRefe = !udaList.first()\nendif",
    "exampleAntipattern": "-- No set() check\n!udaList = !!collectAllFor(|UDA|, |EXPRESSION|, WORL)\n!target = !udaList.first() -- may fail if empty",
    "pitfalls": [
      "WORL scope can be slow on large projects.",
      "Expression syntax depends on AVEVA product version.",
      "Result may be empty if no matching elements exist."
    ],
    "relatedIds": [
      "pdms_attribute_query"
    ],
    "sourcedoc": "AVEVA PDMS Query Reference",
    "sourcecodebase": "ramTagManagement.pmlobj"
  },
  {
    "id": "objects_pmltags",
    "category": "pdmsinteraction",
    "subcategory": "PMLTAGS",
    "title": "PMLTAGS object and GetListDefinition method",
    "principle": "PMLTAGS is a system object providing access to tag list definitions and database views.",
    "rule": "!!tags = object PMLTAGS()\n!gridDef = !!tags.GetListDefinition(!catName, !listName)\n!viewName = !gridDef.DbViewName()",
    "syntax": "PMLTAGS.GetListDefinition(category, listName) → DBREF",
    "exampleCanonical": "-- CB EBE_delta_tag_export.pmlmac\n-- CB mac_03\n!!tags = object PMLTAGS()\n!gridDef = !!tags.GetListDefinition('EQUINOR_TR3111_V7', !listName)\n!sourceDbView = !gridDef.DbViewName()",
    "exampleAntipattern": "-- WRONG: omit validated pattern for PMLTAGS object and GetListDefinition method\n-- Review source EBE_delta_tag_export.pmlmac before reuse",
    "pitfalls": [
      "Category name must match exactly; case-sensitive",
      "List name must exist in the specified category"
    ],
    "relatedIds": [
      "pdms_attribute_query"
    ],
    "sourcedoc": "AVEVA Engineering Tags API",
    "sourcecodebase": "EBE_delta_tag_export.pmlmac"
  },
  {
    "id": "pdms_old_qualifier",
    "category": "pdmsinteraction",
    "subcategory": "OLD",
    "title": "OLD attribute qualifier for deleted element values",
    "principle": "Use OLD qualifier to retrieve the value of an attribute before an element was deleted.",
    "rule": "VAR !val OLD $!attribute of $!dbref",
    "syntax": "OLD <attribute_expression> of <dbref>",
    "exampleCanonical": "-- CB EBE_delta_tag_export.pmlmac\n-- CB mac_03\nif (!action eq |DELETE|) then\n  !evaluate = |var !val OLD $!expression of $!tag|\nendif\n$!<evaluate>",
    "exampleAntipattern": "-- WRONG: omit validated pattern for OLD attribute qualifier for deleted element values\n-- Review source EBE_delta_tag_export.pmlmac before reuse",
    "pitfalls": [
      "OLD qualifier only works for deleted elements; using it on existing elements may fail",
      "Must use dynamic $! evaluation to pass attribute name at runtime"
    ],
    "relatedIds": [
      "pdms_attribute_query"
    ],
    "sourcedoc": "AVEVA Engineering Database Interface",
    "sourcecodebase": "EBE_delta_tag_export.pmlmac"
  },
  {
    "id": "d7_dual_attribute_fallback",
    "category": "pdmsinteraction",
    "subcategory": "fallback-assignment",
    "title": "Dual-attribute fallback pattern for mapping table lookups",
    "principle": "When a mapping table provides two possible attribute names for a source column, attempt assignment to the primary attribute first, then fall back to the alternative attribute if the primary is invalid or the alternative name is non-empty.",
    "rule": "From mapping table, extract attributeName1 (primary) and attributeName2 (alternative). Create ATTRIBUTE objects for both. Check !attribute1.hash() gt 0 for validity. If primary fails or attributeName2 is non-empty, repeat the type-gated assignment for attribute2.",
    "syntax": "!attributeName1 = !mappingData[!mappedIdx][2]\\n!attributeName2 = !mappingData[!mappedIdx][3]\\n!attribute1 = object ATTRIBUTE(!attributeName1)\\n!attribute2 = object ATTRIBUTE(!attributeName2)\\n-- Primary assignment with error handling\\nif (!attribute1.hash() gt 0) then\\n  !currentValue = !tagref.attribute(!attribute1.name())\\n  -- type-gated assignment ...\\nendif\\n-- Fallback to alternative\\nif (!attributeName2.trim() neq ||) then\\n  if (!attribute2.hash() gt 0) then\\n    -- type-gated assignment ...\\n  endif\\nendif",
    "exampleCanonical": "-- CB JDE_vendortag_import.pmlmac\n!attributeName1 = !mappingData[!mappedIdx][2]\\n!attributeName2 = !mappingData[!mappedIdx][3]\\n!attribute1 = object ATTRIBUTE(!attributeName1)\\n!attribute2 = object ATTRIBUTE(!attributeName2)\\nif (!attribute1.hash() gt 0) then\\n  !currentValue = !tagref.attribute(!attribute1.name())\\n  -- type-gated assignment ...\\nendif\\nif (!attributeName2.trim() neq ||) then\\n  if (!attribute2.hash() gt 0) then\\n    !currentValue = !tagref.attribute(!attribute2.name())\\n    -- type-gated assignment ...\\n  endif\\nendif",
    "exampleAntipattern": "-- Skipping fallback means some columns may never get assigned\\n-- when primary attribute name is invalid",
    "pitfalls": [
      "Both attributes must be checked for hash() > 0 before assignment",
      "Trim alternative attribute name before checking emptiness",
      "Error messages should include both attribute names for debugging",
      "Consider logging which attribute was successfully assigned"
    ],
    "relatedIds": [
      "d7_attribute_type_gated_assignment"
    ],
    "sourcedoc": "AVEVA Engineering PML Objects",
    "sourcecodebase": "JDE_vendortag_import.pmlmac"
  },
  {
    "id": "mac_08:unknown:73",
    "category": "pdmsinteraction",
    "subcategory": "type-gated-assignment",
    "title": "Type-gated attribute value assignment with objecttype() detection",
    "principle": "Attribute assignment can be gated by objecttype() so different element classes receive the correct attribute values.",
    "rule": "Attribute assignment can be gated by objecttype() so different element classes receive the correct attribute values.",
    "syntax": "--issue data\n!issueData = ARRAY()",
    "exampleCanonical": "-- CB JDE_vendortag_import.pmlmac\n--issue data\n!issueData = ARRAY()\n!headerList = ARRAY()\n!msg = |Tag No;Tag Type;Attribute;Value;Issue Description|\n!headerList.appendArray(!msg.split(|;|))\n--benchmarking\n!cleanHeading = ARRAY()\ndo !col values !heading\n	!cleanHeading.append(!col.LowCase().trim())\nenddo\n--mapping table retrieving\n!mappedColumns = ARRAY()",
    "exampleAntipattern": "-- WRONG: use Type-gated attribute value assignment with objecttype() detection without validating the source context in JDE_vendortag_import.pmlmac",
    "pitfalls": [
          "Validate against JDE_vendortag_import.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
          "pdms_attribute_update",
          "p2_attribute_dynamic"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_vendortag_import.pmlmac"
  },
  {
    "id": "mac_08:unknown:74",
    "category": "pdmsinteraction",
    "subcategory": "fallback-assignment",
    "title": "Dual-attribute fallback pattern for mapping table lookups",
    "principle": "Mapping-table lookups often need a primary attribute and a fallback attribute when the preferred value is absent.",
    "rule": "Mapping-table lookups often need a primary attribute and a fallback attribute when the preferred value is absent.",
    "syntax": "					--get mapped attribute\n					!mappedIdx = !mappedColumns.findFirst(!col.lowCase())",
    "exampleCanonical": "-- CB JDE_vendortag_import.pmlmac\n					--get mapped attribute\n					!mappedIdx = !mappedColumns.findFirst(!col.lowCase())\n					if (!mappedIdx.set()) then\n						!attributeName1 = !mappingData[!mappedIdx][2]\n						!attributeName2 = !mappingData[!mappedIdx][3]\n						!attribute1 = object ATTRIBUTE(!attributeName1)\n						!attribute2 = object ATTRIBUTE(!attributeName2)\n						if (!fileValue.empty().not() and !fileValue.lowcase() neq |na| and !fileValue.lowcase() neq |n/a| and !fileValue.lowcase() neq |unset| and !fileValue neq |0|) then\n							--set value for attribute 1 (shell attribute)\n							if (!attribute1.hash() gt 0) then\n								!currentValue = !tagref.attribute(!attribute1.name())\n								handle none\n									!isError = false",
    "exampleAntipattern": "-- WRONG: use Dual-attribute fallback pattern for mapping table lookups without validating the source context in JDE_vendortag_import.pmlmac",
    "pitfalls": [
          "Validate against JDE_vendortag_import.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_vendortag_import.pmlmac"
  },
  {
    "id": "cb_mac_23_reload_object",
    "category": "pdmsinteraction",
    "subcategory": "pml-reload",
    "title": "PML RELOAD OBJECT — перезагрузка PML-объекта",
    "principle": "PML RELOAD OBJECT <name> перезагружает уже загруженный PML-объект, обновляя его определение из исходного файла.",
    "rule": "Используйте PML RELOAD OBJECT когда объект был изменён и требуется обновление без перезапуска сессии.",
    "syntax": "PML RELOAD OBJECT <ObjectName>",
    "exampleCanonical": "-- CB JDE_exData_import.pmlmac\n-- Перезагрузка объекта TAGMANAGEMENTTMP\\nPML RELOAD OBJECT TAGMANAGEMENTTMP\\n-- Аналогично для любого другого PML-объекта\\nPML RELOAD OBJECT MyFormObject",
    "exampleAntipattern": "-- НЕ: PML RELOAD OBJECT с несуществующим именем\\nPML RELOAD OBJECT NonExistentObject\\n-- Это вызовет ошибку времени выполнения",
    "pitfalls": [
      "Объект должен быть предварительно загружен (через import или ранее определённый).",
      "Перезагрузка уничтожает текущие экземпляры объекта.",
      "Не путать с PML REHASH ALL (перезагружает все)."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Customization — Control Logic section",
    "sourcecodebase": "JDE_exData_import.pmlmac"
  },
  {
    "id": "dbview_creation_commands",
    "category": "pdmsinteraction",
    "subcategory": "dbview_lifecycle",
    "title": "DbView (DBVW) creation and configuration commands",
    "principle": "DbView objects are created with NEW DBVW, configured with DESC/UDNA/AUTCRE/ALWDEL/ELEL commands",
    "rule": "NEW DBVW → DESC → UDNA → AUTCRE → ALWDEL → ELEL REM ALL → configure sub-objects (EXPFIL/EXPCOL/ATTCOL)",
    "syntax": "!dbView = !name.dbref()\nNEW DBVW $!name\nDESC |description|\nUDNA |udname|\nAUTCRE TRUE\nALWDEL TRUE\nELEL REM ALL",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\n!dbView = !dbViewName.dbref()\nhandle any\n  NEW DBVW $!dbViewName\n  !dbViewUdname = !dbViewDesc.replace(|-|, | |)\n  DESC |$!dbViewUdname|\n  UDNA |$!dbViewUdname|\n  AUTCRE TRUE\n  ALWDEL TRUE\n  ELEL REM ALL\n  !dbView = !!ce\nendhandle",
    "exampleAntipattern": "NEW DBVW !name  -- missing $ prefix for variable",
    "pitfalls": [
      "Must use $! for variable substitution in command context",
      "AUTCRE/ALWDEL require TRUE/FALSE values",
      "ELEL REM ALL clears existing element list"
    ],
    "relatedIds": [
      "dbview_sub_objects",
      "string_replace_method"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "dbview_elel_property",
    "category": "pdmsinteraction",
    "subcategory": "dbview_sub_objects",
    "title": "DbView .elel property for element iteration",
    "principle": "DbView objects expose a .elel property that returns the list of elements included in the view.",
    "rule": "Access !dbView.elel to iterate through elements of a DbView. Each element is a DBREF.",
    "syntax": "do !ele values !dbView.elel\n  !eleName = !ele.Udname\nenddo",
    "exampleCanonical": "-- CB JDE_dbView_extractor.pmlmac\ndo !ele values !dbView.elel\n  !string = !dbViewName & |;1_ELEL;;| & !ele & |;;|\n  !data.append(!string.split(|;|))\nenddo",
    "exampleAntipattern": "-- WRONG: omit validated pattern for DbView .elel property for element iteration\n-- Review source JDE_dbView_extractor.pmlmac before reuse",
    "pitfalls": [
      "!ele is a DBREF, not a string — concatenate with string for CSV output"
    ],
    "relatedIds": [
      "dbview_sub_object_types"
    ],
    "sourcedoc": "JDE_dbView_extractor.pmlmac",
    "sourcecodebase": "JDE_dbView_extractor.pmlmac"
  },
  {
    "id": "dbview_sub_object_types",
    "category": "pdmsinteraction",
    "subcategory": "dbview_sub_objects",
    "title": "DbView sub-object types: ELEL, EXPFIL, ATTFIL, EXPCOL, ATTCOL",
    "principle": "DbView objects expose sub-objects (elements, expression filters, attribute filters, expression columns, attribute columns) that can be queried via !!CollectAllFor with type filter and $!dbView scope.",
    "rule": "Use !!CollectAllFor('EXPFIL'|'ATTFIL'|'EXPCOL'|'ATTCOL', ||, $!dbView) to collect DbView sub-objects scoped to a specific DbView instance.",
    "syntax": "!subList = !!CollectAllFor('<TYPE>', ||, $!<dbViewRef>)\ndo !item values !subList\n  !prop = !item.Property\nenddo",
    "exampleCanonical": "-- CB JDE_dbView_extractor.pmlmac\n-- Collect all EXPFIL under a DbView\n!expList = !!CollectAllFor('EXPFIL', ||, $!dbView)\ndo !exp values !expList\n  !expr = !exp.Expression\n  !type = !exp.ExpType\nenddo",
    "exampleAntipattern": "-- WRONG: Collecting EXPFIL without DbView scope\n!badList = !!CollectAllFor('EXPFIL', ||, world) -- returns ALL EXPFIL in world, not scoped",
    "pitfalls": [
      "Scope must use $!dbView reference, not just the DbView name",
      "Each sub-object type has different attributes — check type-specific properties"
    ],
    "relatedIds": [
      "dbview_creation_commands"
    ],
    "sourcedoc": "JDE_dbView_extractor.pmlmac",
    "sourcecodebase": "JDE_dbView_extractor.pmlmac"
  },
  {
    "id": "dbview_sub_objects",
    "category": "pdmsinteraction",
    "subcategory": "dbview_lifecycle",
    "title": "DbView sub-objects: EXPFILTER, EXPCOLUMN, ATTCOLUMN",
    "principle": "DbViews contain sub-objects for expressions, columns, and filters created with NEW commands",
    "rule": "NEW EXPFILTER → EXPRESSION → EXPTYPE; NEW EXPCOLUMN → DESC → UDNA → EXPRESSION → EXPTYPE → UTYP; NEW ATTCOLUMN → DESC → UDNA → DBATTRIBUTE",
    "syntax": "NEW EXPFILTER\nEXPRESSION |expr|\nEXPTYPE 'PML'\n\nNEW EXPCOLUMN\nDESC |name|\nUDNA |udname|\nEXPRESSION |expr|\nEXPTYPE 'PML'\nUTYP $!<dataType>\n\nNEW ATTCOLUMN\nDESC |name|\nUDNA |udname|\nDBATTRIBUTE $!<attr>",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\nNEW EXPCOLUMN\nDESC |$!<name>|\nUDNA |$!<name>|\nif (!value.matchwild(|*!*|)) then\n  !value = $!<value>\nendif\nEXPRESSION |$!<value>|\nEXPTYPE 'PML'\nUTYP $!<dataType>",
    "exampleAntipattern": "EXPRESSION !value  -- missing $ prefix and | delimiters",
    "pitfalls": [
      "EXPTYPE requires quoted string 'PML'",
      "UTYP requires $! substitution for data type variable",
      "DESC and UDNA require | pipe delimiters for strings"
    ],
    "relatedIds": [
      "dbview_creation_commands"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "delete_member_mem_command",
    "category": "pdmsinteraction",
    "subcategory": "element_manipulation",
    "title": "DELETE member MEM command with dollar substitution",
    "principle": "DELETE $!<member>.type MEM removes all members of a specified type",
    "rule": "DELETE $!<obj>.type MEM deletes all elements/members of the type specified by the dollar-substituted member",
    "syntax": "DELETE $!<objectVar>.memberType MEM",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\n!dbViewGroup = /RAM_IM_DBViewGroup\nDELETE $!<dbViewGroup.type> MEM",
    "exampleAntipattern": "DELETE !dbViewGroup.type MEM  -- missing $ prefix for substitution",
    "pitfalls": [
      "$! required for variable substitution in command context",
      "MEM keyword required"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "elel_add_commands",
    "category": "pdmsinteraction",
    "subcategory": "element_manipulation",
    "title": "ELEL ADD and ELEL REM commands for DbView element lists",
    "principle": "ELEL commands manipulate element lists within DbView objects",
    "rule": "$!<viewName> ELEL ADD $!<element> adds an element; ELEL REM ALL removes all elements",
    "syntax": "$!<viewName> ELEL ADD $!<element>\nELEL REM ALL",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\n$!<dbViewName> ELEL ADD $!<value>\nhandle (68,5)\n  $P ERROR ELE $!<value> IS EXIST IN ELELIST\nelsehandle (99,532)\n  $P ERROR ELE $!<value> IS NOT EXIST\nendhandle",
    "exampleAntipattern": "ELEL ADD !value  -- missing $ prefix and view context",
    "pitfalls": [
      "Requires $!<viewName> prefix for context",
      "Error codes (68,5), (99,532), (99,534) are specific to ELEL operations"
    ],
    "relatedIds": [
      "handle_tuple_error_codes",
      "dbview_creation_commands"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "mac_20:unknown:168",
    "category": "pdmsinteraction",
    "subcategory": "element_manipulation",
    "title": "DELETE member MEM command with dollar substitution",
    "principle": "PDMS DELETE MEM commands can remove members using dollar-substituted element references.",
    "rule": "PDMS DELETE MEM commands can remove members using dollar-substituted element references.",
    "syntax": "!attCommonList = ARRAY()\n!dbViewGroup = /RAM_IM_DBViewGroup",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n!attCommonList = ARRAY()\n!dbViewGroup = /RAM_IM_DBViewGroup\n!!ce = !dbViewGroup\nDELETE $!<dbViewGroup.type> MEM\nimport 'GridControl'\nhandle ANY\nendhandle\nusing namespace |Aveva.Core.Presentation|\n!dataTable = object NETGRIDCONTROL()\n!dataTable.clearGrid()\n!fileName = 'C:\Users\ADZV\OneDrive - Ramboll\AVEVA_SERVER\Addons\PMLLIB\RAM\Engineering\jackdow\templates\JDE_dbViewExtract.xlsx'\n!dataSource = object NETDATASOURCE('Grid Table', !fileName)",
    "exampleAntipattern": "-- WRONG: use DELETE member MEM command with dollar substitution without validating the source context in JDE_dbView_creator.pmlmac",
    "pitfalls": [
          "Validate against JDE_dbView_creator.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
          "delete_member_mem_command",
          "pdms_dbref_resolve"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "mac_20:unknown:173",
    "category": "pdmsinteraction",
    "subcategory": "dbview_lifecycle",
    "title": "DbView (DBVW) creation and configuration commands",
    "principle": "DbView creation is a multi-command lifecycle that creates DBVW and then configures filters/columns/lists.",
    "rule": "DbView creation is a multi-command lifecycle that creates DBVW and then configures filters/columns/lists.",
    "syntax": "	--step 1: create dbView\n	!dbView = !dbViewName.dbref()",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n	--step 1: create dbView\n	!dbView = !dbViewName.dbref()\n	handle any\n		!dbViewDesc = !dbViewName.after(|/|)\n		NEW DBVW $!dbViewName\n		!dbViewUdname = !dbViewDesc.replace(|-|, | |)\n		DESC |$!dbViewUdname|\n		UDNA |$!dbViewUdname|\n		AUTCRE TRUE\n		ALWDEL TRUE\n		ELEL REM ALL\n		!dbView = !!ce\n	endhandle\n	--step 2: create element",
    "exampleAntipattern": "-- WRONG: use DbView (DBVW) creation and configuration commands without validating the source context in JDE_dbView_creator.pmlmac",
    "pitfalls": [
          "Validate against JDE_dbView_creator.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
          "dbview_creation_commands",
          "dbview_sub_objects"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "mac_20:unknown:174",
    "category": "pdmsinteraction",
    "subcategory": "dbview_lifecycle",
    "title": "DbView sub-objects: EXPFILTER, EXPCOLUMN, ATTCOLUMN",
    "principle": "DbView sub-objects such as EXPFILTER, EXPCOLUMN and ATTCOLUMN define filtering and extraction columns.",
    "rule": "DbView sub-objects such as EXPFILTER, EXPCOLUMN and ATTCOLUMN define filtering and extraction columns.",
    "syntax": "	endif\n	--step 3: expression filters",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n	endif\n	--step 3: expression filters\n	if (!parameterType eq |2_EXPFIL| and !dbView.set()) then\n		NEW EXPFILTER\n		EXPRESSION |$!<value>|\n		EXPTYPE 'PML'\n	endif\n	--step 4: expression column\n	if (!parameterType eq |3_EXPCOL| and !dbView.set()) then\n		NEW EXPCOLUMN\n		DESC |$!<name>|\n		UDNA |$!<name>|\n		if (!value.matchwild(|*!*|)) then",
    "exampleAntipattern": "-- WRONG: use DbView sub-objects: EXPFILTER, EXPCOLUMN, ATTCOLUMN without validating the source context in JDE_dbView_creator.pmlmac",
    "pitfalls": [
          "Validate against JDE_dbView_creator.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "mac_20:unknown:175",
    "category": "pdmsinteraction",
    "subcategory": "element_manipulation",
    "title": "ELEL ADD and ELEL REM commands for DbView element lists",
    "principle": "ELEL ADD and ELEL REM manage element-list membership for DbView extraction scopes.",
    "rule": "ELEL ADD and ELEL REM manage element-list membership for DbView extraction scopes.",
    "syntax": "		DESC |$!dbViewUdname|\n		UDNA |$!dbViewUdname|",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n		DESC |$!dbViewUdname|\n		UDNA |$!dbViewUdname|\n		AUTCRE TRUE\n		ALWDEL TRUE\n		ELEL REM ALL\n		!dbView = !!ce\n	endhandle\n	--step 2: create element\n	if (!parameterType eq |1_ELEL| and !dbView.set()) then\n		$!<dbViewName> ELEL ADD $!<value>\n		handle (68,5)\n			$P ERROR ELE $!<value> IS EXIST IN ELELIST\n		elsehandle (99,532)\n			$P ERROR ELE $!<value> IS NOT EXIST",
    "exampleAntipattern": "-- WRONG: use ELEL ADD and ELEL REM commands for DbView element lists without validating the source context in JDE_dbView_creator.pmlmac",
    "pitfalls": [
          "Validate against JDE_dbView_creator.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "mac_20:unknown:177",
    "category": "pdmsinteraction",
    "subcategory": "dbview_lifecycle",
    "title": "UTYP command for setting data type in DbView columns",
    "principle": "UTYP sets the expected value type for DbView columns and must match the exported attribute/expression.",
    "rule": "UTYP sets the expected value type for DbView columns and must match the exported attribute/expression.",
    "syntax": "			!value = $!<value>\n		endif",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n			!value = $!<value>\n		endif\n		EXPRESSION |$!<value>|\n		EXPTYPE 'PML'\n		UTYP $!<dataType>\n	endif\n	--step 5: attribute column\n	if (!parameterType eq |4_ATTCOL| and !dbView.set()) then\n		$P ATT $!<value>\n		NEW ATTCOLUMN\n		DESC |$!<name>|\n		UDNA |$!<name>|\n		if (!value.matchwild(|*!*|)) then\n			!value = $!<value>",
    "exampleAntipattern": "-- WRONG: use UTYP command for setting data type in DbView columns without validating the source context in JDE_dbView_creator.pmlmac",
    "pitfalls": [
          "Validate against JDE_dbView_creator.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "mac_22:unknown:195",
    "category": "pdmsinteraction",
    "subcategory": "pmltags",
    "title": "PMLTAGS object and GetListDefinition",
    "principle": "PMLTAGS and GetListDefinition provide a tag-list API used before delta/export processing.",
    "rule": "PMLTAGS and GetListDefinition provide a tag-list API used before delta/export processing.",
    "syntax": "import |Aveva.Engineering.Tags.Pml|\nhandle any",
    "exampleCanonical": "-- CB JDE_delta_tag_export.pmlmac\nimport |Aveva.Engineering.Tags.Pml|\nhandle any\nendhandle\nusing namespace |Aveva.Engineering.Tags|\n!!tags = object PMLTAGS()\nimport 'GridControl'\nhandle ANY\nendhandle\nusing namespace |Aveva.Core.Presentation|\n!dataTable = object NETGRIDCONTROL()\n!dataTable.columnExcelFilter(true)\n!dataTable.setNameColumnImage()\n!dataTable.outlookGroupStyle(false)\n!dataTable.fixedHeaders(FALSE)",
    "exampleAntipattern": "-- WRONG: use PMLTAGS object and GetListDefinition without validating the source context in JDE_delta_tag_export.pmlmac",
    "pitfalls": [
          "Validate against JDE_delta_tag_export.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
          "p2_pmltags",
          "pmltags_object"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_delta_tag_export.pmlmac"
  },
  {
    "id": "mac_22:unknown:197",
    "category": "pdmsinteraction",
    "subcategory": "delta",
    "title": "OLD prefix for delta queries on ENGITEM",
    "principle": "OLD-prefixed delta queries read historical values for comparison against current ENGITEM data.",
    "rule": "OLD-prefixed delta queries read historical values for comparison against current ENGITEM data.",
    "syntax": "	enddo\n	!headerList.append(|ACTION|)",
    "exampleCanonical": "-- CB JDE_delta_tag_export.pmlmac\n	enddo\n	!headerList.append(|ACTION|)\n	--get all changed elements\n	var !modifiedTags OLD collect all (ENGITEM) with ( MODIFIED() )\n	var !deletedTags OLD collect all (ENGITEM) with ( DELETED() )\n	var !createdTags collect all (ENGITEM) with ( CREATED() )\n	!changedTags = ARRAY()\n	!changedTags.appendArray(!modifiedTags)\n	!changedTags.appendArray(!deletedTags)\n	!changedTags.appendArray(!createdTags)\n	!changedTags = !changedTags.sortUnique()\n	do !tag values !changedTags\n		!rowDataList = ARRAY()",
    "exampleAntipattern": "-- WRONG: use OLD prefix for delta queries on ENGITEM without validating the source context in JDE_delta_tag_export.pmlmac",
    "pitfalls": [
          "Validate against JDE_delta_tag_export.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_delta_tag_export.pmlmac"
  },
  {
    "id": "mac_22:unknown:198",
    "category": "pdmsinteraction",
    "subcategory": "comparison",
    "title": "SETCOMPDATE STAMP for tag comparison context",
    "principle": "SETCOMPDATE STAMP establishes the comparison timestamp used by delta tag queries.",
    "rule": "SETCOMPDATE STAMP establishes the comparison timestamp used by delta tag queries.",
    "syntax": "	if (!date.unset()) then\n		!date = !stampDate",
    "exampleCanonical": "-- CB JDE_delta_tag_export.pmlmac\n	if (!date.unset()) then\n		!date = !stampDate\n	endif\n	--SETCOMPDATE FOR DB TMSCX/JDA_TMS TO SESSION 383\n	--SETCOMPDATE STAMP /04-Leirvik-Data-Transfer-01\n	SETCOMPDATE STAMP $!latestStamp\n	!exportGrid = !grids.first()\n	!gridName = !exportGrid.dbref().lstnam\n	!headerList = ARRAY()\n	!expressions = ARRAY()\n	!dataList = ARRAY()\n	!changedTags = ARRAY()\n	!listName = !exportGrid.dbref().lstnam",
    "exampleAntipattern": "-- WRONG: use SETCOMPDATE STAMP for tag comparison context without validating the source context in JDE_delta_tag_export.pmlmac",
    "pitfalls": [
          "Validate against JDE_delta_tag_export.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_delta_tag_export.pmlmac"
  },
  {
    "id": "mac_27:unknown:210",
    "category": "pdmsinteraction",
    "subcategory": "collect-all-with-tree-filter",
    "title": "COLLECT ALL with tree filter (for /tree)",
    "principle": "COLLECT ALL with a tree filter restricts collection to elements under a specific tree/root expression.",
    "rule": "COLLECT ALL with a tree filter restricts collection to elements under a specific tree/root expression.",
    "syntax": "--$m \"C:\Users\ADZV\OneDrive - Ramboll\AVEVA_SERVER\Addons\PMLLIB\RAM\Engineering\jackdow\JDE_outputMacro.pmlmac\"\nvar !enggrps collect all (ENGGRP) with (mcount gt 0) for /TMS_ENG",
    "exampleCanonical": "-- CB JDE_outputMacro.pmlmac\n--$m \"C:\Users\ADZV\OneDrive - Ramboll\AVEVA_SERVER\Addons\PMLLIB\RAM\Engineering\jackdow\JDE_outputMacro.pmlmac\"\nvar !enggrps collect all (ENGGRP) with (mcount gt 0) for /TMS_ENG\ndo !enggrp values !enggrps\n	!engrpRef = !enggrp.dbref()\n	ALPHA FILE \"C:\Temp\output_$!<engrpRef.seq>.txt\" OVERWRITE\n	OUTPUT TABULATE 2 $!enggrp CHANGES SINCE 00:00 01 March 2024\n	ALPHA FILE END\nenddo",
    "exampleAntipattern": "-- WRONG: use COLLECT ALL with tree filter (for /tree) without validating the source context in JDE_outputMacro.pmlmac",
    "pitfalls": [
          "Validate against JDE_outputMacro.pmlmac before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
      "pdms_attribute_query"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "JDE_outputMacro.pmlmac"
  },
  {
    "id": "old_collect_delta_query",
    "category": "pdmsinteraction",
    "subcategory": "delta",
    "title": "OLD prefix for delta queries on ENGITEM",
    "principle": "The OLD keyword before 'collect all' queries the delta (deleted/modified) state of ENGITEM objects. Combined with MODIFIED(), DELETED(), CREATED() predicates.",
    "rule": "var !deletedTags OLD collect all (ENGITEM) with ( DELETED() ) to get deleted tags.",
    "syntax": "var !modifiedTags OLD collect all (ENGITEM) with ( MODIFIED() )\nvar !deletedTags OLD collect all (ENGITEM) with ( DELETED() )\nvar !createdTags collect all (ENGITEM) with ( CREATED() )",
    "exampleCanonical": "-- CB JDE_delta_tag_export.pmlmac\n-- CB mac_22\nvar !modifiedTags OLD collect all (ENGITEM) with ( MODIFIED() )\nvar !deletedTags OLD collect all (ENGITEM) with ( DELETED() )\nvar !createdTags collect all (ENGITEM) with ( CREATED() )",
    "exampleAntipattern": "Using OLD without predicate — returns all items, not just delta",
    "pitfalls": [
      "MODIFIED() and DELETED() require OLD prefix; CREATED() does not",
      "OLD queries the comparison state set by SETCOMPDATE"
    ],
    "relatedIds": [
      "pdms_attribute_query"
    ],
    "sourcedoc": "AVEVA Engineering Tags PML API",
    "sourcecodebase": "JDE_delta_tag_export.pmlmac"
  },
  {
    "id": "pmltags_object",
    "category": "pdmsinteraction",
    "subcategory": "pmltags",
    "title": "PMLTAGS object and GetListDefinition",
    "principle": "PMLTAGS is the entry point for AVEVA Engineering Tags API. GetListDefinition retrieves a list definition by name and grid reference.",
    "rule": "Use !!tags = object PMLTAGS() then !!tags.GetListDefinition(listName, gridName) to access list metadata.",
    "syntax": "!!tags = object PMLTAGS()\n!gridDef = !!tags.GetListDefinition('|listName|', !gridName)",
    "exampleCanonical": "-- CB JDE_delta_tag_export.pmlmac\n-- CB mac_22\n!!tags = object PMLTAGS()\n!gridDef = !!tags.GetListDefinition('15.2 Leirvik Data Export', !listName)\n!sourceDbView = !gridDef.DbViewName()",
    "exampleAntipattern": "!!tags.GetListDefinition without creating object first",
    "pitfalls": [
      "GetListDefinition requires valid list name and grid reference",
      "DbViewName() returns the DbView reference, not a string"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA Engineering Tags PML API",
    "sourcecodebase": "JDE_delta_tag_export.pmlmac"
  },
  {
    "id": "setcompdate_stamp_command",
    "category": "pdmsinteraction",
    "subcategory": "comparison",
    "title": "SETCOMPDATE STAMP for tag comparison context",
    "principle": "SETCOMPDATE STAMP sets the comparison date context so that OLD collect queries return delta data relative to a specific stamp.",
    "rule": "SETCOMPDATE STAMP $!latestStamp where !latestStamp is a STAMP object reference.",
    "syntax": "var !stamps collect all STAMP\n!latestStamp = !stamps[2]\nSETCOMPDATE STAMP $!latestStamp",
    "exampleCanonical": "-- CB JDE_delta_tag_export.pmlmac\n-- CB mac_22\nvar !stamps collect all STAMP\n!latestStamp = !stamps[2]\nSETCOMPDATE STAMP $!latestStamp",
    "exampleAntipattern": "Using SETCOMPDATE without prior STAMP collection",
    "pitfalls": [
      "Index 2 skips the most recent stamp (index 1)",
      "SETCOMPDATE affects all subsequent OLD collect queries"
    ],
    "relatedIds": [
      "old_collect_delta_query"
    ],
    "sourcedoc": "AVEVA Engineering Tags PML API",
    "sourcecodebase": "JDE_delta_tag_export.pmlmac"
  },
  {
    "id": "utyp_command",
    "category": "pdmsinteraction",
    "subcategory": "dbview_lifecycle",
    "title": "UTYP command for setting data type in DbView columns",
    "principle": "UTYP command sets the data type for expression and attribute columns in DbView",
    "rule": "UTYP $!<dataType> assigns the data type variable to the current column context",
    "syntax": "UTYP $!<dataTypeVar>",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\nNEW EXPCOLUMN\nDESC |$!<name>|\nUDNA |$!<name>|\nEXPRESSION |$!<value>|\nEXPTYPE 'PML'\nUTYP $!<dataType>",
    "exampleAntipattern": "UTYP !dataType  -- missing $ prefix for substitution",
    "pitfalls": [
      "Requires $! variable substitution",
      "Must be used within EXPCOLUMN or ATTCOLUMN context"
    ],
    "relatedIds": [
      "dbview_sub_objects"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "pdl_dbref_attr_access",
    "category": "pdmsinteraction",
    "subcategory": "dbref",
    "title": "DBREF-to-PDMS-Object Attribute Access via .:  Syntax",
    "principle": "Use .:  (dot-colon) notation to access PDMS object attributes from a PML DBREF variable. Unlike .query() which returns attribute values as strings, .:  provides direct object reference access for nested attribute chains.",
    "rule": "After assigning a DBREF to a PML variable, use !dbref.:AttributeName to access any PDMS object attribute. Nested attributes chain with additional .: , e.g., !obj.:HavePartOutGoingConnections.[1].:RefConnectionsOut.",
    "syntax": "!dbref = !name.dbref()\n!attr = !dbref.:AttributeName\n!nested = !dbref.:Parent.:Child",
    "exampleCanonical": "-- CB TB terminal correction macro.pmlmac\n-- CB mac_46\n!ces = !!collectallfor(|CE|, ||, world)\ndo !ce values !ces\n  !!ce = !ce\n  !terminals = !!ce.:HavePartTerminals\n  !outConn   = !terminal.:HavePartOutGoingConnections\nenddo",
    "exampleAntipattern": "-- BAD: Using .query() for nested attributes\n!attr = !ce.query(|HavePartOutGoingConnections|)\n-- .query() returns a string, not a collection reference",
    "pitfalls": [
      ".:  requires a valid PDMS object reference; a BADREF will throw an error",
      "Unlike .query(), .:  returns the actual object/collection, not a string value",
      "Attribute names are case-insensitive in PML but should follow AVEVA canonical casing"
    ],
    "relatedIds": [
      "pdms_attribute_query"
    ],
    "sourcedoc": "AVEVA PDMS Customization Guide — Object Attribute Access",
    "sourcecodebase": "TB terminal correction macro.pmlmac"
  },
  {
    "id": "pdms_terminal_attribute_names",
    "category": "pdmsinteraction",
    "subcategory": "terminals",
    "title": "Canonical AVEVA PDMS Terminal and Connection Attribute Names",
    "principle": "PDMS objects use specific PascalCased attribute names for terminal and connection management. These attributes are case-insensitive in PML but should be referenced with canonical casing for consistency.",
    "rule": "Use the canonical attribute names listed below when accessing terminal and connection data on PDMS objects. Do not mix casing within a single codebase.",
    "syntax": "!terminals = !ce.:HavePartTerminals\n!channels  = !ce.:HavePartChannels\n!outConn   = !terminal.:HavePartOutGoingConnections\n!inConn    = !terminal.:HavePartIncomingConnections\n!chanTerms = !channel.:HavePartChannelTerminals\n!refOut    = !conn.:RefConnectionsOut\n!refIn     = !conn.:RefConnectionsIn\n!actType   = !conn.:acttype",
    "exampleCanonical": "-- CB TB terminal correction macro.pmlmac\n-- CB mac_46\n!terminals = !!ce.:HavePartTerminals\n!channels  = !!ce.:HavePartChannels\ndo !idx indices !terminals\n  !terminal = !terminals[!idx]\n  !channel  = !channels[!idx]\n  !signals  = !terminal.:refPropagatedSignals\n  !outConn  = !terminal.:HavePartOutGoingConnections\nenddo",
    "exampleAntipattern": "-- BAD: Inconsistent casing in same file\n!terminals = !!ce.:HavePartTerminals\n!chanTerms = !channel.:havepartchannelTerminals  -- should be HavePartChannelTerminals\n!outConn   = !terminal.:Havepartoutgoingconnections  -- should be HavePartOutGoingConnections",
    "pitfalls": [
      "Attribute names are case-insensitive in PML but inconsistent casing causes maintenance issues",
      "Some attributes return collections (ARRAY/COLLECTION), others return single values",
      "refPropagatedSignals may be unset() for terminals with no propagated signals"
    ],
    "relatedIds": [
      "pdl_dbref_attr_access"
    ],
    "sourcedoc": "AVEVA PDMS Object Reference — Terminal and Connection Attributes",
    "sourcecodebase": "TB terminal correction macro.pmlmac"
  },
  {
    "id": "pml_element_createelement",
    "category": "pdmsinteraction",
    "subcategory": "elementmanager",
    "title": "CREATEELEMENT and ELEMENTTYPE for programmatic element creation",
    "principle": "Use CREATEELEMENT to create new PDMS/E3D elements programmatically. Set the element type via ELEMENTTYPE or SetElementTypeByName before adding attributes and executing.",
    "rule": "Always validate ELEMENTTYPE before calling SetElementTypeByName. Check GetErrors() after Execute().",
    "syntax": "!elem = object CREATEELEMENT()\n!etype = object ELEMENTTYPE('|<typeName>|')\nif (!etype.valid()) then\n  !elem.SetElementTypeByName('|<typeName>|')\n  !elem.AddAttributeValue('|NAME|', !name)\n  !elem.Execute()\n  !errors = !elem.GetErrors()\nendif",
    "exampleCanonical": "-- CB EBE_assetRegister_import.pmlmac\n!elementNet = object CREATEELEMENT()\n!etype = object ELEMENTTYPE('|$!<class>|)\nif (!etype.valid()) then\n  !elementNet.SetElementTypeByName('|$!<class>|)\n  !elementNet.AddAttributeValue(|NAME|, !tagName)\n  !elementNet.Execute()\n  !errors = !elementNet.GetErrors()\n  do !error values !errors\n    !msg = |$!tag;$!error|\n  enddo\nendif",
    "exampleAntipattern": "!elem = object CREATEELEMENT()\n!elem.AddAttributeValue('|NAME|', !name)\n!elem.Execute()  -- No element type set",
    "pitfalls": [
      "ELEMENTTYPE must match a valid AVEVA class name",
      "SetElementTypeByName by string name is more forgiving than ELEMENTTYPE constructor",
      "GetErrors() returns an array that must be iterated"
    ],
    "relatedIds": [],
    "sourcedoc": "Aveva.Engineering.PMLElementManager namespace",
    "sourcecodebase": "EBE_assetRegister_import.pmlmac"
  },
  {
    "id": "forms_element_manager_create_tag",
    "category": "pdmsinteraction",
    "subcategory": "engineering",
    "title": "Creating AVEVA tags via CREATEELEMENT and PMLElementManager",
    "principle": "AVEVA.Engineering.PMLElementManager CREATEELEMENT object can create tags with type and attributes.",
    "rule": "Use object CREATEELEMENT(), SetElementTypeByName(), AddAttributeValue(), Execute(), GetErrors() for tag creation with error handling via handle any/endhandle.",
    "syntax": "using namespace |Aveva.Engineering.PMLElementManager|\n!elem = object CREATEELEMENT()\n!elem.SetElementTypeByName('|:$!typeName|')\n!elem.AddAttributeValue('|NAME|', !tagName)\n!elem.Execute()\n!errors = !elem.GetErrors()\ndo !err values !errors\n  !msg = !err.GetError()\nenddo",
    "exampleCanonical": "-- CB jackimform.pmlfrm\nusing namespace |Aveva.Engineering.PMLElementManager|\n!elementNet = object CREATEELEMENT()\n!elementNet.SetElementTypeByName('|:$!<cleanType>|')\nhandle any\n  !this.logActions.append('|$!tag;Class [:$!cleanType] is not valid|')\n  skip\nendhandle\n!elementNet.AddAttributeValue('|NAME|', !tag)\n!elementNet.Execute()\n!errors = !elementNet.GetErrors()\ndo !error values !errors\n  !errorMsg = !error.GetError()\n  !this.logActions.append('|$!tag;$!errorMsg|')\nenddo",
    "exampleAntipattern": "Skipping error handling after Execute():\n!elem.Execute()\n!elem.AddAttributeValue('|NAME|', !tag)  -- wrong order",
    "pitfalls": [
      "SetElementTypeByName() must be called before AddAttributeValue()",
      "GetErrors() returns array — iterate with DO/ENDDO",
      "Element name format must include leading colon for type: |:$!typeName|",
      "handle any/endhandle around SetElementTypeByName catches invalid type names"
    ],
    "relatedIds": [
      "forms_net_grid_bind_datasource"
    ],
    "sourcedoc": "AVEVA Engineering API — PMLElementManager",
    "sourcecodebase": "jackimform.pmlfrm"
  }
];
