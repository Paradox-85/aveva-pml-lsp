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
  }
];
