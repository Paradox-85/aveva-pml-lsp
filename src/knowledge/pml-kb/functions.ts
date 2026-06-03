import type { KBEntry } from '../schemas/kb-entry.js';

export const functionsEntries: KBEntry[] = [
  {
    "id": "fnc_definition_syntax",
    "category": "functions",
    "subcategory": "definition",
    "title": "Синтаксис define function",
    "principle": "Функция — это глобальный метод в собственном файле, предзагружаемый через PMLLIB; её сигнатура объявляет типы аргументов и (для возвращающей) тип результата в конце строки define, что обеспечивает проверку типов и предзагрузку.",
    "rule": "define function !!name(!arg is TYPE, ...) [is RETTYPE]; имя функции = имя файла (.pmlfnc) с !!; тело — построчно как в макросе; завершать endfunction; функция без is TYPE — процедура (без возврата значения).",
    "syntax": "define function !!area(!radius is REAL) is REAL\n  !circleArea = !radius.power(2) * 3.142\n  return !circleArea\nendfunction",
    "exampleCanonical": "-- CB createObjectsFromExcelSheet.pmlfnc\ndefine function !!createObjectsFromExcelSheet(!excelFullPath is STRING, !sheetName is STRING, !isTranspose is BOOLEAN, !columns is ARRAY, !isCreate is BOOLEAN, !forceUpdate is BOOLEAN, !arrayAppend is BOOLEAN, !isEXfile is BOOLEAN, !exAttributesData is ARRAY) is ARRAY\n  ...\n  return !issueData\nendfunction",
    "exampleAntipattern": "-- NOT: функция с объявленным return type завершает путь без RETURN\n-- Плохо: вызывающий код получает UNSET/ошибку",
    "pitfalls": [
      "Имя файла должно совпадать с именем функции",
      "ANY-аргумент отключает проверку типов — применять осознанно (TM-1401 §2.4.1)",
      "Функции предпочтительнее макросов для новой логики"
    ],
    "relatedIds": [
      "fnc_return_value",
      "fnc_argument_scope",
      "mac_calling_other_macros"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §4.2 (Creating a PML Function); §2.4; §4.3 (procedures — no is TYPE)",
    "sourcecodebase": "createObjectsFromExcelSheet.pmlfnc"
  },
  {
    "id": "fnc_return_value",
    "category": "functions",
    "subcategory": "return",
    "title": "Возврат значения функции",
    "principle": "Функция возвращает значение командой return, а тип результата объявлен в сигнатуре (is TYPE); метод-функция объекта возвращает аналогично — это позволяет использовать вызов прямо в выражениях.",
    "rule": "Объявить is TYPE в сигнатуре; присвоить результат локальной переменной; завершить return !result; для раннего выхода вернуть уже накопленное значение; процедура (без is TYPE) ничего не возвращает.",
    "syntax": "define method .GetTotal() is REAL\n  !result = REAL()\n  !result = !this.L0 + !this.L1 + ...\n  return !result\nendmethod",
    "exampleCanonical": "-- CB RAMTagMaturityData.pmlobj\ndefine method .GetTotal() is REAL\n  !result = REAL()\n  !result = !this.L0 + !this.L1 + !this.L2 + !this.L3 + !this.L4 + !this.L5 + !this.L6 + !this.L7 + !this.L8\n  return !result\nendmethod",
    "exampleAntipattern": "define function !!f() is REAL\n  !x = 5   $* нет return — функция вернёт UNSET",
    "pitfalls": [
      "is TYPE без return → UNSET",
      "Тип return должен совпадать с объявленным is TYPE",
      "Метод концатенации работает, если return подходящего типа (TM-1401 §4.5.2)"
    ],
    "relatedIds": [
      "fnc_definition_syntax",
      "cf_return_from_function",
      "fnc_array_accumulator"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §4.2 (return keyword, define function ... is TYPE)",
    "sourcecodebase": "RAMTagMaturityData.pmlobj"
  },
  {
    "id": "fnc_argument_scope",
    "category": "functions",
    "subcategory": "scope",
    "title": "Аргументы локальны (pass by value)",
    "principle": "Аргументы функции/метода становятся локальными переменными внутри тела; изменение аргумента не затрагивает внешнюю переменную вызывающего (pass by value), поэтому для возврата изменённых данных нужно вернуть их через return.",
    "rule": "Внутри функции считать аргументы локальными копиями; чтобы отдать результат — использовать return (или, в методе, изменять члены через !this); для глобального эффекта — обращаться к !!global явно (как в процедурах над !!CE).",
    "syntax": "define function !!area( !length is REAL, !width is REAL) is REAL\n  !area = !length * !width\n  return !area\nendfunction",
    "exampleCanonical": "-- CB ramGetBackRef.pmlfnc\ndefine function !!ramGetBackRef(!element is STRING, !backAttribute is STRING, !attribute is STRING) is STRING\n  !result = object STRING()\n  var !backRefElement BACKREF(attname $!backAttribute) of $!element\n  var !result $!attribute of $!backRefElement\n  return !result\nendfunction",
    "exampleAntipattern": "-- NOT: функция с объявленным return type завершает путь без RETURN\n-- Плохо: вызывающий код получает UNSET/ошибку",
    "pitfalls": [
      "Изменение аргумента не видно вызывающему",
      "Для побочного эффекта на БД процедуры пишут через !!CE/DBREF, а не через аргументы",
      "ANY-аргумент не проверяется на тип"
    ],
    "relatedIds": [
      "fnc_return_value",
      "fnc_definition_syntax",
      "mac_global_variables"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.4 (Arguments become local variables within the function/method)",
    "sourcecodebase": "ramGetBackRef.pmlfnc"
  },
  {
    "id": "fnc_pdms_navigation",
    "category": "functions",
    "subcategory": "navigation",
    "title": "Навигация по иерархии PDMS внутри функции",
    "principle": "Функции отчётов/обновления обходят дерево PDMS: собирают элементы COLLECTION-объектом по типу+фильтру, затем для каждого читают атрибуты и связанные элементы (по reference-атрибутам, .owner), поднимаясь по иерархии до нужного типа.",
    "rule": "Собрать набор: object COLLECTION() → .type('ENGITE') → .filter(EXPRESSION) → .results(); обходить через do !i indices; читать reference-атрибут как DBREF и проверять .badref(); подниматься циклом до нужного типа через .owner.",
    "syntax": "!collection = object COLLECTION()\n!collection.type('ENGITE')\n!expression = object EXPRESSION(!filter)\n!collection.filter(!expression)\n!tags = !collection.results()",
    "exampleCanonical": "-- CB jacPropagateParentData.pmlfnc\n!tags = !collection.results()\ndo !i indices !tags\n  !childRefe         = !tags[!i]\n  !parentElementRefe = !childRefe.attribute(!relationAttName)\n  if(!parentElementRefe.badref().not()) then\n    do !attToPropagate values !attListToPropagate\n      ...\n    enddo\n  endif\nenddo",
    "exampleAntipattern": "!parent = !ref.attribute(!rel)\n!val = !parent.attribute(!a)   $* без !parent.badref().not() — ошибка на битой ссылке",
    "pitfalls": [
      "Reference-атрибут может быть badref — всегда проверять перед разыменованием",
      "COLLECTION.scope() принимает DBREF; .filter() — EXPRESSION-объект",
      "Подъём по иерархии — цикл с .owner и break по типу"
    ],
    "relatedIds": [
      "pdms_navigation_commands",
      "pdms_dbref_resolve",
      "fnc_array_accumulator",
      "cf_nested_loops"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §4.6 (!!CE navigation: .owner, .hpos); §5 (COLLECT); TM-1402 §4.3 (COLLECTION object)",
    "sourcecodebase": "jacPropagateParentData.pmlfnc"
  },
  {
    "id": "fnc_array_accumulator",
    "category": "functions",
    "subcategory": "accumulator",
    "title": "Накопление результатов в ARRAY и возврат",
    "principle": "Функции отчётов накапливают результат построчно в локальный ARRAY (часто — массив массивов: строки таблицы), добавляя элементы в цикле через .append()/.appendArray(), и возвращают его — это устойчивый способ собрать табличный результат за один проход.",
    "rule": "Инициализировать !result = object ARRAY() (или ARRAY()); в цикле формировать строку (!row = ARRAY(); !row.append(...)) и !result.append(!row); по завершении return !result; для уникализации — .sortUnique().",
    "syntax": "!issueData = ARRAY()\n...\n!issueData.append(!msg.split(|;|))\nreturn !issueData",
    "exampleCanonical": "-- CB JDE_tagProperties_export.pmlmac\n!tagDataRow = ARRAY()\n!tagDataRow.append(!tagRef.namn)\n!tagDataRow.append(!tagRef.:RAMTAGOWNER)\n!tagDataRow.append(!tagRef.:TagStatus)\n...\n!dataList.append(!tagDataRow)",
    "exampleAntipattern": "!result.append(!x)   $* без предварительного !result = object ARRAY() append упадёт на UNSET",
    "pitfalls": [
      "Инициализировать массив до append()",
      "Массив строк-таблиц — это ARRAY of ARRAY",
      "Уникализация результата — .sortUnique()/.unique()"
    ],
    "relatedIds": [
      "dt_array_declaration",
      "fnc_return_value",
      "fnc_pdms_navigation",
      "mac_pipeline_pattern"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.8 (Arrays); §4.5.1 (.size(), array methods); §5.2 (EVALUATE → ARRAY)",
    "sourcecodebase": "JDE_tagProperties_export.pmlmac"
  }
];
