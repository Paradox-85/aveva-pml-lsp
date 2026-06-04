import type { KBEntry } from '../schemas/kb-entry.js';

export const errorhandlingEntries: KBEntry[] = [
  {
    "id": "eh_handle_endhandle",
    "category": "errorhandling",
    "subcategory": "basic",
    "title": "Базовая конструкция HANDLE / ENDHANDLE",
    "principle": "Без обработки ошибка прерывает все выполняющиеся макросы/функции и показывает alert пользователю; HANDLE перехватывает ошибку строки, расположенной непосредственно перед ним, и позволяет разработчику ограничить влияние сбоя на пользователя.",
    "rule": "Размещать HANDLE сразу после потенциально сбойной команды; различать коды через HANDLE (sec,code) / ELSEHANDLE; ELSEHANDLE ANY — на любой прочий сбой; ELSEHANDLE NONE — ветвь успеха; завершать ENDHANDLE.",
    "syntax": "NEW EQUI /ABCD\nHANDLE (41, 8)\n  $p Need to be at a ZONE or below\nELSEHANDLE (41, 12)\n  $p That name has already been used\nELSEHANDLE ANY\n  $p Another error has occurred\nELSEHANDLE NONE\n  $p Everything OK\nENDHANDLE",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n!elementRefe    = object DBREF(!name)\nhandle ANY\n  !this.isError = true\n  !this.addErrorData('Unable to convert $!elementName to DBREF')\nelsehandle None\n  !finalName    = !elementRefe.Name\nendhandle",
    "exampleAntipattern": "!ref = object DBREF(!name)   $* без handle — невалидное имя прервёт весь макрос",
    "pitfalls": [
      "HANDLE перехватывает только ошибку предшествующей строки/блока",
      "Код ошибки имеет вид (section, code), напр. (41,8)",
      "ELSEHANDLE NONE срабатывает только при отсутствии ошибки"
    ],
    "relatedIds": [
      "eh_handle_any",
      "eh_error_variable",
      "dn_import_guard",
      "eh_nested_handle"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.13 / §3.13.2 (Error Handling Using the HANDLE Syntax); §3.13.1 (Error Codes)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "eh_handle_any",
    "category": "errorhandling",
    "subcategory": "catch_all",
    "title": "HANDLE ANY — перехват всех ошибок",
    "principle": "HANDLE ANY ловит любую ошибку, не различая код; это уместно, когда конкретный код не важен (защита .NET-импорта, конвертации, чтения атрибута), но опасно, если им маскируют логические ошибки, которые следовало бы исправить.",
    "rule": "Использовать HANDLE ANY для операций, чей конкретный код ошибки не важен (импорт DLL, попытка преобразования, доступ к возможно-отсутствующему атрибуту); внутри ставить graceful-обработку (лог + флаг), а не молчаливое подавление без следа.",
    "syntax": "handle ANY\n  !this.isError = true\n  !this.addErrorData('...')\nendhandle",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\n!data = !splitValue.real()\nhandle ANY\n  !this.isError = true\n  !this.addErrorData('Not able to convert string to real in converter')\nendhandle",
    "exampleAntipattern": "handle ANY\nendhandle   $* пустой перехват без лога: ошибка проглочена бесследно (см. eh_logging_pattern)",
    "pitfalls": [
      "Пустой handle any/endhandle прячет ошибки — допустим лишь когда сбой заведомо некритичен",
      "HANDLE ANY не различает коды — не использовать там, где нужна реакция на конкретный код"
    ],
    "relatedIds": [
      "eh_handle_endhandle",
      "eh_logging_pattern",
      "dn_import_guard",
      "eh_import_protection"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.13.2 (ELSEHANDLE ANY)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "eh_error_variable",
    "category": "errorhandling",
    "subcategory": "error_object",
    "title": "Доступ к тексту ошибки (!!ERROR / !!error.text)",
    "principle": "Глобальный объект !!ERROR хранит сведения о последней ошибке; внутри блока handle к его тексту можно обратиться, чтобы залогировать причину, вместо общей фразы — это превращает перехват в диагностируемое событие.",
    "rule": "Внутри handle-блока читать !!error.text для записи реальной причины в лог; не путать с собственным булевым флагом .isError, который объект ведёт отдельно.",
    "syntax": "handle ANY\n  !this.addErrorData(!!error.text)\nendhandle",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\nhandle ANY\n  !this.isError        = true\n  !this.addErrorData(!!error.text)\nendhandle",
    "exampleAntipattern": "handle ANY\n  !this.addErrorData('error')   $* теряется реальная причина; используйте !!error.text",
    "pitfalls": [
      "!!error.text валиден только сразу после ошибки внутри handle",
      "Это глобальный объект — он перезаписывается следующей ошибкой"
    ],
    "relatedIds": [
      "eh_handle_any",
      "eh_logging_pattern",
      "log_contextual_info"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §2.3.4 (!!ERROR — global ERROR object); §3.13.1 (Error Codes)",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "eh_import_protection",
    "category": "errorhandling",
    "subcategory": "dotnet",
    "title": "Защита .NET import через handle any/endhandle (ОБЯЗАТЕЛЬНО)",
    "principle": "Команда import загружает .NET-сборку, которая может отсутствовать, быть уже загруженной или конфликтовать; без обёртки handle any такой сбой прервёт загрузку всего объекта/формы — поэтому защита import является обязательной идиомой codebase.",
    "rule": "Каждый import 'Namespace.Class' немедленно оборачивать парой handle any / endhandle (пустое тело допустимо — цель в том, чтобы не дать ошибке загрузки прервать файл); ставить блоки в начале файла объекта/формы/функции.",
    "syntax": "import 'RamAEPMLExcelReader'\nhandle any\nendhandle",
    "exampleCanonical": "-- CB ramExcelReaderClass.pmlobj\nimport 'RamAEPMLExcelReader'\nhandle any\nendhandle\n\ndefine object RAMEXCELREADERCLASS\n  member .excelTables  is ARRAY\nendobject",
    "exampleAntipattern": "import 'RamAEPMLExcelReader'\ndefine object RAMEXCELREADERCLASS   $* БЕЗ handle: при отсутствии сборки весь объект не загрузится",
    "pitfalls": [
      "Пропуск handle вокруг import — частая причина 'object not found' при загрузке",
      "Несколько import — каждый оборачивается отдельно",
      "Регистр: встречается и import, и Import"
    ],
    "relatedIds": [
      "dn_import_statement",
      "dn_import_guard",
      "eh_handle_any",
      "dn_object_instantiation"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.18 (PML.NET — IMPORT syntax, namespace); TM-1401 M&F §3.13.2 (HANDLE ANY) — синтаксис handle",
    "sourcecodebase": "ramExcelReaderClass.pmlobj"
  },
  {
    "id": "eh_nested_handle",
    "category": "errorhandling",
    "subcategory": "nesting",
    "title": "Вложенные блоки HANDLE и порядок перехвата",
    "principle": "Каждый handle-блок привязан к своей предшествующей операции, поэтому несколько последовательных или вложенных handle позволяют по-разному реагировать на сбой разных шагов одной процедуры (создание элемента vs. установка атрибута), не смешивая их обработку.",
    "rule": "Для последовательности рискованных шагов ставить отдельный handle на каждый; внутри handle с ELSEHANDLE NONE можно безопасно выполнять следующий рискованный шаг и навешивать на него свой handle.",
    "syntax": "handle any\n  !this.addErrorToList(!name, 'NAME', !!error.text)\nelsehandle none\n  !elementNet.AddAttributeValue(|NAME|, !validName)\n  !elementNet.ExecuteSync()\n  !errors = !elementNet.GetErrorDetails()\nendhandle",
    "exampleCanonical": "-- CB ramTagManagement.pmlobj\n!elementNet.SetElementTypeByName(|$!<type>|)\nhandle any\n  !this.addErrorToList(!name, 'NAME', !!error.text)\nelsehandle none\n  !elementNet.AddAttributeValue(|NAME|, !validName)\n  !elementNet.ExecuteSync()\n  !errors      = !elementNet.GetErrorDetails()\nendhandle\n\n!dbRefe = !validName.dbRef()\nhandle any\nendhandle",
    "exampleAntipattern": "-- NOT: выполнять рискованную PDMS/.NET операцию без HANDLE для eh_nested_handle\n-- Плохо: макрос аварийно завершится и потеряет диагностический контекст",
    "pitfalls": [
      "Не путать вложение блоков с цепочкой ELSEHANDLE одного блока",
      "ELSEHANDLE NONE — место для следующего шага, выполняемого только при успехе предыдущего"
    ],
    "relatedIds": [
      "eh_handle_endhandle",
      "eh_handle_any",
      "pdms_element_create"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.13.2 (HANDLE / ELSEHANDLE NONE)",
    "sourcecodebase": "ramTagManagement.pmlobj"
  },
  {
    "id": "eh_logging_pattern",
    "category": "errorhandling",
    "subcategory": "logging",
    "title": "Паттерн: поймал ошибку → залогировал → деградировал мягко",
    "principle": "Production-код не падает на первой ошибке: пойманный сбой записывается в общий логгер (с контекстом — элемент, атрибут, причина), выставляется флаг ошибки, а обработка продолжается для остальных данных — это обеспечивает устойчивость пакетных операций над тысячами тегов.",
    "rule": "В handle-блоке: (1) выставить .isError = true; (2) вызвать addErrorData/addErrorToList/!!ramCommonLogger.addLogDetails с контекстом; (3) не прерывать общий цикл, если сбой касается одного элемента — продолжать (graceful degradation).",
    "syntax": "handle ANY\n  !this.isError = true\n  !this.addErrorData('<контекст: что и почему не удалось>')\nendhandle",
    "exampleCanonical": "-- CB ramValueConverter.pmlobj\ndefine method .addErrorData(!errorData is STRING)\n  if(undefined(!!ramCommonLogger)) then\n    !!ramCommonLogger = object RAMCOMMONLOGGER()\n  endif\n  if(!this.logElement.unset() AND !this.logAttribute.unset()) then\n    !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorData)\n  else\n    !errorList = object ARRAY()\n    !errorList.append(!this.logElement)\n    !errorList.append(!this.logAttribute)\n    !errorList.append(!errorData)\n    !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\n  endif\nendmethod",
    "exampleAntipattern": "handle ANY\n  return   $* проглатывает ошибку и обрывает весь пакет, не залогировав причину",
    "pitfalls": [
      "Молчаливое подавление без лога делает сбой невидимым",
      "Логируйте контекст (элемент+атрибут+причина), а не просто 'error'",
      "Создавайте !!ramCommonLogger лениво через undefined()-guard"
    ],
    "relatedIds": [
      "eh_handle_any",
      "eh_error_variable",
      "log_common_logger_api",
      "log_contextual_info",
      "cf_guard_clause"
    ],
    "sourcedoc": "TM-1401 Macros and Functions Rev 2.0, §3.13 (Error Handling) — основа; паттерн логирования из codebase",
    "sourcecodebase": "ramValueConverter.pmlobj"
  },
  {
    "id": "errorhandling_elsehandle_none",
    "category": "errorhandling",
    "subcategory": "elsehandle",
    "title": "elsehandle none — empty elsehandle as no-op",
    "principle": "elsehandle none is a valid empty handler that explicitly marks a block with no error recovery.",
    "rule": "handle any\n  -- error handling code\nelsehandle none\n  -- success path, no error handler needed\nendhandle",
    "syntax": "elsehandle none",
    "exampleCanonical": "-- CB EBE_delta_tag_export.pmlmac\n-- CB mac_03\n$!<evaluate>\nhandle any\n  !rowDataList.append(!!error.text)\nelsehandle none\n  !rowDataList.append(!val)\nendhandle",
    "exampleAntipattern": "handle any\n  -- nothing\nendhandle  -- missing elsehandle; implicit no-op but less explicit",
    "pitfalls": [
      "elsehandle none is optional; omitting it is equivalent but less explicit",
      "Do not confuse with missing elsehandle entirely in nested blocks"
    ],
    "relatedIds": [
      "eh_handle_any"
    ],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "EBE_delta_tag_export.pmlmac"
  },
  {
    "id": "pml_macro_error_handler_pattern",
    "category": "errorhandling",
    "subcategory": "macro",
    "title": "Macro-level error handler with ONERROR + handle any",
    "principle": "Combine ONERROR GOLABEL at macro start with handle any block for centralized error recovery",
    "rule": "Place ONERROR GOLABEL /Error at top, LABEL /Error at bottom with handle any block",
    "syntax": "ONERROR GOLABEL /Error\n-- steps...\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\nendhandle",
    "exampleCanonical": "-- CB EIS_data_update.pmlmac\n-- ONERROR GOLABEL /Error\n$P --- STEP 1 ---\n$P --- STEP 2 ---\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\nendhandle",
    "exampleAntipattern": "handle any\n  -- no ONERROR GOLABEL, only catches inline errors\nendhandle",
    "pitfalls": [
      "ONERROR only triggers at macro level, not within handle blocks",
      "handle any catches all errors including those in nested calls"
    ],
    "relatedIds": [
      "pml_onerror_golabel",
      "pml_unclaim_all"
    ],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "EIS_data_update.pmlmac"
  },
  {
    "id": "pml_onerror_golabel",
    "category": "errorhandling",
    "subcategory": "commands",
    "title": "ONERROR GOLABEL error transfer command",
    "principle": "ONERROR GOLABEL redirects macro execution to a labeled handler on error",
    "rule": "Use ONERROR GOLABEL /Label at the top of a macro to enable centralized error handling",
    "syntax": "ONERROR GOLABEL /LabelName",
    "exampleCanonical": "-- CB EIS_data_update.pmlmac\n-- ONERROR GOLABEL /Error\n-- ... macro steps ...\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  -- error logging\nendhandle",
    "exampleAntipattern": "-- WRONG: omit validated pattern for ONERROR GOLABEL error transfer command\n-- Review source EIS_data_update.pmlmac before reuse",
    "pitfalls": [
      "GOLABEL target must be a LABEL statement, not a label reference"
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA PML Customization Guide",
    "sourcecodebase": "EIS_data_update.pmlmac"
  },
  {
    "id": "pml_unclaim_all",
    "category": "errorhandling",
    "subcategory": "commands",
    "title": "UNCLAIM ALL PML command",
    "principle": "UNCLAIM ALL releases all claimed elements in error handlers",
    "rule": "Always call UNCLAIM ALL in error handlers to prevent element lock conflicts",
    "syntax": "UNCLAIM ALL",
    "exampleCanonical": "-- CB EIS_data_update.pmlmac\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\nendhandle",
    "exampleAntipattern": "-- WRONG: omit validated pattern for UNCLAIM ALL PML command\n-- Review source EIS_data_update.pmlmac before reuse",
    "pitfalls": [
      "UNCLAIM ALL releases ALL claims, including those from other macros"
    ],
    "relatedIds": [
      "eh_handle_any"
    ],
    "sourcedoc": "AVEVA PDMS PML Reference",
    "sourcecodebase": "EIS_data_update.pmlmac"
  },
  {
    "id": "pml_unset_badref_check",
    "category": "errorhandling",
    "subcategory": "dbref",
    "title": "unset() and badref() dbref validation",
    "principle": "Check dbref validity with unset() and badref() before accessing attributes",
    "rule": "Use (unset(:dbref) or badref(:dbref)) as guard before attribute access",
    "syntax": "if (unset(:dbref) or badref(:dbref)) then\n  -- handle\nendif",
    "exampleCanonical": "-- CB EIS_data_update.pmlmac\nif (unset(:TagRefToClass) or badref(:TagRefToClass)) then\n  return\nendif\n!val = :TagRefToClass:AttributeName",
    "exampleAntipattern": "!val = :badRef:Attr -- crashes if badRef is bad",
    "pitfalls": [
      "badref() returns true for references pointing to deleted elements",
      "unset() returns true for null references"
    ],
    "relatedIds": [
      "eh_handle_any"
    ],
    "sourcedoc": "AVEVA PDMS PML Reference",
    "sourcecodebase": "EIS_data_update.pmlmac"
  },
  {
    "id": "elsehandle_none_pattern",
    "category": "errorhandling",
    "subcategory": "no_error_handler",
    "title": "elsehandle none for no-error branch",
    "principle": "elsehandle none explicitly handles the 'no error' path within a handle block",
    "rule": "elsehandle none executes when no error occurred; useful for conditional logic after error-prone operations",
    "syntax": "handle any\n  -- error recovery\nelsehandle none\n  -- no error occurred, original state preserved\nendhandle",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\nhandle any\n  DELETE ATTCOLUMN\n  NEW EXPCOLUMN\n  -- fallback creation\nelsehandle none\n  -- no error, keep original ATTCOLUMN\nendhandle",
    "exampleAntipattern": "elsehandle  -- missing 'none', may cause syntax error",
    "pitfalls": [
      "elsehandle none is different from omitting elsehandle",
      "Semantically means 'no error branch' not 'catch all'"
    ],
    "relatedIds": [
      "handle_tuple_error_codes"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "handle_none_recovery_pattern",
    "category": "errorhandling",
    "subcategory": "specific_error_codes",
    "title": "Handle NONE for var command recovery",
    "principle": "When a PML var command (like ATTDEF query) may fail due to missing or invalid references, wrap in handle none to provide a fallback value instead of aborting the macro.",
    "rule": "Use handle none (without error codes) when the var command is optional and a fallback value is acceptable. The handler assigns a default value to the variable.",
    "syntax": "if (!condition) then\n  var !result OBJECT $!<reference> ATTR1 ATTR2\n  handle none\n    !result = !defaultValue\n  endhandle\nendif",
    "exampleCanonical": "-- CB JDE_dbView_extractor.pmlmac\nif (!udName.unset() or !udName.empty()) then\n  var !attData ATTDEF $!<att.DbAttribute> NAME TYPE RPTX SIZE DEFI DTYP UNIT VISI QSET QTXT ITYP DESTEX\n  handle none\n    !udName = !attData[3]\n  endhandle\nendif",
    "exampleAntipattern": "-- WRONG: handle any on optional var command\nvar !attData ATTDEF $!<att.DbAttribute> NAME\nhandle any\n  !udName = !attData[3]\nendhandle -- handle any catches ALL errors including programming mistakes",
    "pitfalls": [
      "handle none catches ALL errors including typos — use only when fallback is intentional",
      "var result array indexing (!attData[3]) depends on attribute order"
    ],
    "relatedIds": [
      "eh_handle_any"
    ],
    "sourcedoc": "JDE_dbView_extractor.pmlmac",
    "sourcecodebase": "JDE_dbView_extractor.pmlmac"
  },
  {
    "id": "handle_tuple_error_codes",
    "category": "errorhandling",
    "subcategory": "specific_error_codes",
    "title": "Handle specific numeric error code tuples",
    "principle": "PML allows handling specific error code tuples (major, minor) with handle (major,minor)",
    "rule": "handle (major,minor) catches only that specific error combination; multiple elsehandle tuples can be chained",
    "syntax": "handle (majorCode,minorCode)\n  -- error handler\nelsehandle (majorCode2,minorCode2)\n  -- alternative handler\nendhandle",
    "exampleCanonical": "-- CB JDE_dbView_creator.pmlmac\n-- CB mac_20\nhandle (68,5)\n  $P ERROR: element exists in list\nelsehandle (99,532)\n  $P ERROR: element does not exist\nelsehandle (99,534)\n  $P ERROR: long name\nendhandle",
    "exampleAntipattern": "handle 68  -- incomplete error code, may not match",
    "pitfalls": [
      "Error codes are (major, minor) tuple, not single number",
      "Order matters: first matching handler wins"
    ],
    "relatedIds": [
      "elsehandle_none_pattern"
    ],
    "sourcedoc": "AVEVA E3D PML Documentation",
    "sourcecodebase": "JDE_dbView_creator.pmlmac"
  },
  {
    "id": "pml_handle_nested_scoping",
    "category": "errorhandling",
    "subcategory": "error_handling",
    "title": "Nested handle blocks and scoping in PML",
    "principle": "PML handle blocks can be nested. Inner handle blocks take precedence for errors within their scope. elsehandle must match its corresponding handle.",
    "rule": "Each handle must have a matching endhandle. Nested handles should be clearly indented. elsehandle none catches no errors (acts as pass-through).",
    "syntax": "handle any\n  -- operations that may fail\n  handle any\n    -- inner operations\n  endhandle\nelsehandle none\n  -- inner failure recovery\nendhandle\nendhandle",
    "exampleCanonical": "-- CB EBE_assetRegister_import.pmlmac\nhandle any\n  !elem = object CREATEELEMENT()\n  if (!etype.valid()) then\n    !elem.SetElementTypeByName('|TYPE|')\n  else\n    !msg = |Error: invalid type|\n  endif\nendhandle",
    "exampleAntipattern": "handle any\n  !elem = object CREATEELEMENT()  -- missing endhandle\nelsehandle any  -- orphaned elsehandle",
    "pitfalls": [
      "elsehandle none catches zero errors — it is not the same as elsehandle any",
      "Nested handle scoping can be confusing — prefer flattening when possible",
      "Using namespace inside handle block may not persist after handle ends"
    ],
    "relatedIds": [
      "eh_handle_any"
    ],
    "sourcedoc": "PML1 Syntax.md, PML_LANGUAGE_VARIANTS.md",
    "sourcecodebase": "EBE_assetRegister_import.pmlmac"
  },
  {
    "id": "eh_export_error_handling",
    "category": "errorhandling",
    "subcategory": "export",
    "title": "Паттерн: обработка ошибок при экспорте в Excel через exportasxls",
    "principle": "Экспортные макросы должны оборачивать вызовы exportasxls в handle any/endhandle и логировать ошибки вместо молчаливого игнорирования.",
    "rule": "Обернуть каждый вызов !!tags.exportasxls в handle any/endhandle; в catch-блоке записать ошибку в логгер; продолжать обработку следующих элементов.",
    "syntax": "handle any\n  !!ramCommonLogger.addLogDetails('exportasxls failed', $!!error.text)\nendhandle\n!!tags.exportasxls('100 ADMIN','$!gridName','$!path')",
    "exampleCanonical": "-- CB EBE_full_tag_export.pmlmac\n-- NOT FOUND IN SOURCES — pattern missing from current codebase",
    "exampleAntipattern": "-- CB EBE_full_tag_export.pmlmac:\n-- !!tags.exportasxls('100 ADMIN','$!gridName','$!path')\n-- $* БЕЗ handle: ошибка экспорта прервёт весь макрос",
    "pitfalls": [
      "exportasxls может частично записать файл при ошибке — проверить .exists() после экспорта",
      "Путь с пробелами требует экранирования в $!<...>"
    ],
    "relatedIds": [
      "eh_handle_any",
      "eh_logging_pattern",
      "p2_pmltags"
    ],
    "sourcedoc": "EBE_full_tag_export.pmlmac",
    "sourcecodebase": "EBE_full_tag_export.pmlmac"
  },
  {
    "id": "macro_finish_error_handler_placement",
    "category": "errorhandling",
    "subcategory": "macro_lifecycle",
    "title": "FINISH statement placement in error handlers",
    "principle": "FINISH should be placed inside the error handler block to stop macro execution after error logging.",
    "rule": "Place FINISH inside handle/.../endhandle to halt on error. Do not rely on commented-out FINISH or place it after endhandle as dead code.",
    "syntax": "LABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  -- error recovery actions\n  FINISH\nendhandle",
    "exampleCanonical": "-- CB JDE_vendorPackage-reports.pmlmac\n-- Correct: FINISH inside error handler\nLABEL /Error\nhandle any\n  SAVEWORK\n  !!logger.writeError('macro failed')\n  FINISH\nendhandle\n\n-- Anti-pattern: FINISH as comment\n--FINISH\n\n-- Anti-pattern: FINISH after endhandle (unreachable)\nendhandle\nFINISH",
    "exampleAntipattern": "handle any\n  SAVEWORK\n  --FINISH\nendhandle\nFINISH",
    "pitfalls": [
      "FINISH inside handle block stops macro; FINISH after endhandle is unreachable if the handle block completes normally.",
      "Commented-out FINISH (--FINISH) is silently ignored and does not stop macro on error."
    ],
    "relatedIds": [
      "eh_handle_any"
    ],
    "sourcedoc": "AVEVA PML Customization Guide - Macro Error Handling",
    "sourcecodebase": "JDE_vendorPackage-reports.pmlmac"
  },
  {
    "id": "macro_onerror_golabel_error_trap",
    "category": "errorhandling",
    "subcategory": "macro-level error trap",
    "title": "ONERROR / GOLABEL / LABEL error trap in PML macros",
    "principle": "PML1 macros use ONERROR to redirect control to a named LABEL; the LABEL is paired with a handle block for cleanup.",
    "rule": "Place ONERROR GOLABEL /LabelName at the top of the macro. Define LABEL /LabelName near FINISH. Inside the label, use handle any to capture the error context and perform cleanup (SAVEWORK, UNCLAIM ALL, logging).",
    "syntax": "ONERROR GOLABEL /LabelName\n...\nLABEL /LabelName\nhandle any\n  -- cleanup\nendhandle\nFINISH",
    "exampleCanonical": "-- CB JDE_commPackage-reports.pmlmac\n-- CB mac_18_benchmark.pmlmac\nONERROR GOLABEL /Error\nimport 'GridControl'\nhandle any\nendhandle\n...\ndo !item values !list\n  -- work\nenddo\nLABEL /Error\nhandle any\n  SAVEWORK\n  UNCLAIM ALL\n  !!logger.writeError(...)\nendhandle\nFINISH",
    "exampleAntipattern": "-- ❌ Missing ONERROR — errors crash the macro\nimport 'GridControl'\ndo !item values !list\n  -- no error handling\nenddo\nFINISH",
    "pitfalls": [
      "ONERROR must be placed before any import or using statements.",
      "LABEL name must match exactly (case-insensitive but spelling must match).",
      "FINISH must come after the error handler label block."
    ],
    "relatedIds": [
      "macro_finish_keyword"
    ],
    "sourcedoc": "AVEVA PML Customization — Macros",
    "sourcecodebase": "JDE_commPackage-reports.pmlmac"
  },
  {
    "id": "nested_handle_any_in_loop",
    "category": "errorhandling",
    "subcategory": "nested_handle",
    "title": "Nested handle ANY inside do loops for per-iteration error recovery",
    "principle": "A handle ANY block can be nested inside a do loop to catch and recover from errors per-iteration without aborting the entire loop.",
    "rule": "Wrap per-iteration risky operations in handle ANY. Set fallback values in the handler. Use endhandle to close the block.",
    "syntax": "do !i values !array\n    handle any\n        !result = |fallback value|\n    endhandle\nenddo",
    "exampleCanonical": "-- CB JDE_tagProperties_export_with_RDL.pmlmac\n-- mac_36\nif (!expression.unset().not() or !expression.empty().not()) then\n    !block = object BLOCK(!expression)\n    !value = !tagRef.evaluate(!block)\n    handle any\n        !value = 'Error when calculating value as per expression [$!attributeEntry.:RDLDabaconExpression] for element [$!tagRef.name]. Error: $!!error.text'\n    endhandle\nendif",
    "exampleAntipattern": "handle any\n    do !i values !array\n        -- entire loop in one handler\n    enddo\nendhandle  -- catches too broadly",
    "pitfalls": [
      "Nested handle ANY inside outer handle ANY requires careful scoping",
      "!!error.text is available only within the handler block",
      "Always set a fallback value in the handler to avoid UNSET propagation"
    ],
    "relatedIds": [
      "block_evaluate_expression",
      "var_delete_loop_clear"
    ],
    "sourcedoc": "AVEVA PML Customization — Control Logic",
    "sourcecodebase": "JDE_tagProperties_export_with_RDL.pmlmac"
  },
  {
    "id": "errorhandling_defined_global_form",
    "category": "errorhandling",
    "subcategory": "defined_check",
    "title": "defined() Check for Global Form Objects",
    "principle": "Use defined() to check if a global form object exists before attempting to access it, preventing runtime errors.",
    "rule": "Use if(defined(!!globalForm)) to check existence. If the form exists, access its methods; otherwise, create a new instance.",
    "syntax": "if(defined(!!globalForm)) then\n  !!globalForm.method()\nelse\n  !!globalVar = object CLASS()\nendif",
    "exampleCanonical": "-- CB jacEISDeliveryForm.pmlfrm\n-- Safe access to global logger form\nif(defined(!!ramcommonloggerform)) then\n  !!ramcommonloggerform.clearData()\nelse\n  !!RAMCOMMONLOGGER = object RAMCOMMONLOGGER()\nendif",
    "exampleAntipattern": "-- Direct access without check (will error if form not loaded)\n!!ramcommonloggerform.clearData()",
    "pitfalls": [
      "defined() checks variable existence, not object validity",
      "Global form names are case-insensitive in PML"
    ],
    "relatedIds": [
      "eh_handle_any"
    ],
    "sourcedoc": "AVEVA PML Customization Guide - Expressions",
    "sourcecodebase": "jacEISDeliveryForm.pmlfrm"
  }
];
