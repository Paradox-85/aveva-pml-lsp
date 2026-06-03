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
  }
];
