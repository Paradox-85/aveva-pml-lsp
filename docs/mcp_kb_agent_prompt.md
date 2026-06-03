# ЗАДАНИЕ ДЛЯ АГЕНТА: Формирование базы знаний MCP-сервера по PML (AVEVA Plant 12 Series)

---

## Роль и контекст

Ты — эксперт по AVEVA Plant (12 Series) Programmable Macro Language (PML) и архитектор баз знаний. Твоя задача — сформировать **исчерпывающую, структурированную базу знаний** для MCP-сервера, который будет помогать разработчикам писать правильный PML-код. База знаний должна покрывать **принципы и подходы**, а не просто справочник синтаксиса.

Ты работаешь со строго определёнными источниками:

### Источник 1 — СКЕЛЕТ (обязательный фундамент, всё из них ДОЛЖНО войти в базу знаний)
- `TM-1401 AVEVA Plant (12 Series) Programmable Macro Language (Basic) Rev 3.0.pdf` — полный курс базового PML
- `TM-1401 AVEVA Plant (12 Series) PML Macros and Functions Rev 2.0.pdf` — макросы, функции, объекты
- `TM-1402 AVEVA Plant (12 Series) PML Form Design Rev 1.0.pdf` — дизайн форм, callback-архитектура, widgets

### Источник 2 — МЯСО (реальный production codebase из репозитория `Paradox-85/aveva-pml-lsp`)
Репозиторий: `https://github.com/Paradox-85/aveva-pml-lsp/tree/main/docs/codebase`

**12 объектов (`.pmlobj`):**
- `ramValueConverter.pmlobj` — универсальный конвертер типов DB→PML
- `ramCommonLogger.pmlobj` — система логирования с severity levels
- `ramExcelReaderClass.pmlobj` — чтение Excel через .NET COM interop
- `ramImportExcelConfigLoader.pmlobj` — загрузка конфигурации импорта
- `ramImportExcelDataLoader.pmlobj` — загрузка данных из Excel sheets
- `ramImportExcelElementLoader.pmlobj` — создание/обновление элементов PDMS
- `ramTagManagement.pmlobj` — управление тегами в PDMS
- `ramFileWriterClass.pmlobj` — запись файлов через .NET StreamWriter
- `LoopData.pmlobj` — хранение данных цикла
- `RAMTagMaturityData.pmlobj` — данные зрелости тегов
- `TagManagementTmp.pmlobj` — временные данные тег-менеджмента
- `jacEISDeliveryManager.pmlobj` — менеджер EIS-доставки

**7 форм (`.pmlfrm`):**
- `ramImportExcelProcessor.pmlfrm` — главная форма импорта из Excel (~12KB, наиболее сложная)
- `rptoutput.pmlfrm` — форма вывода отчётов (~125KB, самая крупная)
- `ramimportExcelReclassificationForm.pmlfrm` — форма реклассификации (~38KB)
- `ramImportExcelValidationForm.pmlfrm` — форма валидации
- `ramCommonLoggerForm.pmlfrm` — форма просмотра логов
- `jacEISDeliveryForm.pmlfrm` — форма доставки EIS
- `jackimform.pmlfrm` / `ramImportExcelValidationForm.pmlfrm` — вспомогательные формы

**18 функций (`.pmlfnc`):**
- `createObjectsFromExcelSheet.pmlfnc` — создание объектов PDMS из Excel
- `jacExportRDLDataReport.pmlfnc` / `jacExportRDLDataReportMatrix.pmlfnc` — экспорт RDL-отчётов
- `jacExportFullDataReport.pmlfnc` / `jacExportLinks.pmlfnc` — экспорт данных
- `RAMBiReportExport.pmlfnc` — экспорт BI-отчётов
- `jacNameRegExValidatorTTY.pmlfnc` — валидация имён по RegEx
- `jacPropagateParentData.pmlfnc` — пропагация данных от родителя
- `jacUpdateClassDetails.pmlfnc` / `jacUpdateEquipmentNumber.pmlfnc` — обновление атрибутов
- `jacUpdateTagName.pmlfnc` / `jacUpdateTagNameWithBore.pmlfnc` — переименование тегов
- `jacCheckForceUpdate.pmlfnc` / `jacDeleteUnnamed.pmlfnc` / `jacRemoveDocumentDuplicate.pmlfnc` — утилиты
- `ramGetBackRef.pmlfnc` / `mlpGetDescLabel.pmlfnc` / `jacUpdatePatternToAttribute.pmlfnc`

**50+ макросов (`.pmlmac`):** Полный production pipeline:
- JDE-серия: `JDE_data-import`, `JDE_tagProperties_export`, `JDE_RDL-import`, `JDE_newtag_import`, `JDE_delta_tag_export`, `JDE_commPackage-reports`, `JDE_vendorPackage-reports`, `JDE_dbView_creator/extractor`, `JDE_3D_items_extractor`, `JDE_BI_tagRegister-export`, `JDE_exData_import`, `JDE_sp_update`, `JDE_tag2doc/po/sece_import`, `JDE_routine-macro-run`, `JDE_outputMacro`
- EIS/EBE-серия: `EIS_data_export`, `EIS_data_update`, `EBA_full_tag_export`, `EBE_assetRegister_import`, `EBE_delta/full_tag_export`
- Утилиты: `loop-create`, `loop-data-update`, `alarm_refresh`, `class-name-refresh`, `equipment-name-refresh`, `pipeSupport-refresh`, `cable-area-update`, `pipe-3D-transfer`, `manual-data-export`, `tag-doc-cleanup`, `unnamed-tag-delete`

### Источник 3 — АНАЛИТИЧЕСКИЙ ДОКУМЕНТ (для расширения и гармонизации)
Аналитический документ с паттернами, выявленными из codebase (предоставляется как контекст):
- Документ содержит выявленные паттерны по группам: типы данных, массивы, объекты, обработка ошибок, .NET interop, архитектура форм, pipeline-паттерны
- Он используется для расширения контекста и гармонизации — но источником истины остаются PDF-документы и сам codebase

---

## Твои задачи (выполнять строго по порядку)

### ЭТАП 1 — Полное прочтение PDF-документов (СКЕЛЕТ)

Прочитай все три PDF полностью. Для каждого раздела каждого документа зафиксируй:

**Из `TM-1401 PML Basic Rev 3.0`:**
- Все типы данных PML: STRING, REAL, ARRAY, BOOLEAN, DBREF, DIRECTION, POSITION, ORIENTATION, COLOUR, UNSET — с правилами объявления, присвоения и преобразования
- Все управляющие конструкции: IF/ELSEIF/ELSE/ENDIF, DO/ENDDO, LOOP, BREAK, SKIP, RETURN, EXIT — с точными правилами вложенности и ограничениями
- Переменные: локальные (`!var`), глобальные (`!!var`), форм (`!form.!var`), синтаксис `$!name` и `$!<expression>` для строковой подстановки
- Операторы: сравнение, логические (AND/OR/NOT), строковые методы (`.length()`, `.occurs()`, `.substr()`, `.tolower()`, `.toupper()`, `.append()`, `.split()`)
- Встроенные функции: `string()`, `real()`, `boolean()`, `abs()`, `int()`, `mod()`, `sqrt()`, `sin()`, `cos()`, `atan()`, `date()`, `time()`
- Обработка ошибок: `handle`, `endhandle`, `error()`, `$!error`, коды ошибок, использование `any`
- Область видимости: что видно в макросе, что в функции, что в объекте
- Комментарии: синтаксис `--` и правила
- Директивы: `$include`, `$p` (print), `$*` (suppress), `$?` (query), `using namespace`

**Из `TM-1401 PML Macros and Functions Rev 2.0`:**
- Объявление объектов (`.pmlobj`): `define object NAME`, members (атрибуты), methods (функции-члены), constructor
- Инициализация объектов: `object NAME()`, присвоение по умолчанию, `!obj = object NAME()`
- Наследование и делегирование: как объекты PML агрегируют другие объекты как члены
- Функции (`.pmlfnc`): объявление `define function !name(args)`, возврат значений `!name = value`, область видимости аргументов
- Макросы (`.pmlmac`): точки входа, аргументы через `$1..$9`, команда `$p` для вывода, `$*` для подавления
- Namespace: `using namespace PML`, пространства имён объектов
- Загрузка файлов: `pml rehash all`, `pml load object`, порядок загрузки
- .NET interop: `import 'Namespace.Class'`, создание экземпляров, вызов методов, `handle any / endhandle` для защиты, типы передачи: PML→.NET и .NET→PML
- PDMS-навигация: `$P`, `CE` (current element), `Q ATT` (query attribute), `UPD ATT` (update attribute)

**Из `TM-1402 PML Form Design Rev 1.0`:**
- Объявление формы (`.pmlfrm`): `setup form`, `endform`, структура файла
- Виджеты: BUTTON, TEXT, TEXTINPUT, FRAME, LIST, LISTBOX, COMBOBOX, CHECKBOX, RADIOBUTTON, GADGET, OPTION — все с обязательными параметрами
- Callback-система: `.callback('!form.!method()')` — синтаксис, правила привязки, момент вызова
- Инициализация формы: метод `initialise()` — назначение, когда вызывается, что делать
- Показ/скрытие форм: `show form`, `dismiss form`, `!form.show()`, модальность
- Layout: `xmin/xmax/ymin/ymax` или `at x y to x2 y2`, привязка к форме
- Передача данных в форму: члены-объекты формы vs. глобальные переменные
- Динамическое обновление виджетов: `.settext()`, `.setvalue()`, `.setlist()`, `.setsens()`
- Формы как классы: форма имеет члены и методы — архитектурный паттерн
- Связь форма↔объект: форма владеет объектами-членами, делегирует им логику

---

### ЭТАП 2 — Полный анализ codebase

Прочитай ВСЕ файлы из репозитория по группам. Для каждого файла:

1. Определи его архитектурную роль в системе
2. Выпиши все уникальные паттерны, которые в нём используются
3. Зафикисруй примеры кода для каждого паттерна (дословно из файла)

**При анализе объектов** (`/objects/*.pmlobj`) зафиксируй:
- Полный список атрибутов (members) и их типы
- Все методы с сигнатурами
- Конструктор: какие параметры, что инициализируется
- Паттерны внутри методов: guard clauses, цепочки вызовов, конвертации
- Взаимодействие с другими объектами

**При анализе форм** (`/forms/*.pmlfrm`) зафиксируй:
- Полный список widgets с типами и параметрами
- Все callback-привязки с сигнатурами
- Структуру метода `initialise()`
- Члены-объекты формы (если форма агрегирует объекты)
- Паттерны взаимодействия виджетов

**При анализе функций** (`/functions/*.pmlfnc`) зафиксируй:
- Сигнатуру функции (входные аргументы, возвращаемое значение)
- Паттерны обработки ошибок
- Навигацию по PDMS-дереву
- Использование массивов для накопления результатов

**При анализе макросов** (`/macros/*.pmlmac`) зафиксируй:
- Точку входа и структуру pipeline
- Как макросы вызывают другие макросы (`$M macroname`)
- Как передаются параметры между шагами
- Паттерны работы с файловой системой (пути, расширения, директории)
- Паттерны работы с датой/временем для имён файлов

---

### ЭТАП 3 — Формирование базы знаний

На основе СКЕЛЕТА (PDF) и МЯСА (codebase) сформируй базу знаний в следующей структуре:

#### Формат каждой записи KB:

```json
{
  "id": "уникальный идентификатор в snake_case",
  "category": "одна из категорий ниже",
  "subcategory": "подкатегория",
  "title": "краткое название (до 8 слов)",
  "principle": "формулировка принципа одним предложением — ПОЧЕМУ так делается",
  "rule": "точное правило — ЧТО делать / не делать",
  "syntax": "синтаксис или шаблон кода (PML)",
  "example_canonical": "лучший пример из codebase (дословно, с указанием источника)",
  "example_antipattern": "пример КАК НЕЛЬЗЯ делать (если применимо)",
  "source_doc": "название PDF и раздел",
  "source_codebase": "имя файла из codebase",
  "pitfalls": ["список типичных ошибок"],
  "related_ids": ["id связанных записей"]
}
```

#### Обязательные категории KB (минимальный набор из каждой):

**1. `data_types`** — Типы данных PML
Обязательные записи:
- `dt_string_declaration` — объявление и инициализация STRING
- `dt_real_declaration` — объявление REAL, отличие от INTEGER
- `dt_array_declaration` — объявление ARRAY, индексация с 1, `append()`, `size()`
- `dt_boolean_values` — TRUE/FALSE/UNDEFINED — три состояния, не два
- `dt_dbref_usage` — DBREF для ссылок на элементы PDMS
- `dt_unset_handling` — проверка `unset(!)`, поведение при неинициализированных переменных
- `dt_type_coercion` — неявные преобразования, когда PML конвертирует автоматически
- `dt_string_substitution` — `$!name` vs `$!<expression>` — когда использовать скобки

**2. `control_flow`** — Управление потоком
Обязательные записи:
- `cf_if_elseif_structure` — полная структура IF/ELSEIF/ELSE/ENDIF с примером вложенности
- `cf_do_enddo_loop` — цикл DO с переменной, LOOP для бесконечного цикла
- `cf_break_skip` — BREAK (выход из цикла) vs SKIP (пропуск итерации)
- `cf_return_from_function` — RETURN в функции vs EXIT из макроса
- `cf_guard_clause` — паттерн ранней проверки с `if (...) then return endif` (из codebase)
- `cf_nested_loops` — ограничения и лучшие практики вложенных циклов

**3. `error_handling`** — Обработка ошибок
Обязательные записи:
- `eh_handle_endhandle` — базовая конструкция `handle / endhandle`
- `eh_handle_any` — `handle any` — перехват всех ошибок, когда применять
- `eh_error_variable` — `$!error` — доступ к тексту ошибки
- `eh_import_protection` — `import 'X' / handle any / endhandle` — обязательная защита .NET импорта (из codebase: `ramExcelReaderClass`)
- `eh_nested_handle` — вложенные блоки handle, порядок перехвата
- `eh_logging_pattern` — паттерн: поймал ошибку → залогировал → либо rethrow, либо graceful degradation (из codebase: `ramCommonLogger`)

**4. `objects`** — Объекты PML
Обязательные записи:
- `obj_definition_structure` — структура файла `.pmlobj`: `define object`, members, методы, end
- `obj_constructor_pattern` — конструктор: когда использовать, инициализация members по умолчанию
- `obj_member_declaration` — объявление атрибутов: типы, значения по умолчанию
- `obj_method_declaration` — объявление метода внутри объекта, доступ через `!this`
- `obj_delegation_pattern` — объект владеет другим объектом как member — архитектура из codebase (`ramImportExcelConfigLoader` owns `ramExcelReaderClass`)
- `obj_overloading_delegation` — паттерн: короткие перегруженные методы делегируют к длинному (из codebase: `ramCommonLogger.addLogDetails`)
- `obj_factory_pattern` — `object $!TYPE()` — динамическое создание объекта по строковому имени типа (из codebase: `ramValueConverter`)
- `obj_namespace_loading` — `using namespace PML`, `pml rehash all`, порядок загрузки

**5. `forms`** — Архитектура форм
Обязательные записи:
- `frm_file_structure` — структура `.pmlfrm`: setup form → widgets → callbacks → methods → endform
- `frm_initialise_method` — метод `initialise()`: когда вызывается, что обязательно в нём
- `frm_callback_syntax` — синтаксис `.callback('!form.!method()')` — точный формат
- `frm_widget_common_params` — обязательные параметры для каждого типа виджета
- `frm_button_callback` — BUTTON с callback: паттерн привязки действия
- `frm_list_population` — заполнение LIST/LISTBOX: `.setlist()` с ARRAY
- `frm_textinput_read` — чтение значения из TEXTINPUT: `.value()`
- `frm_sensitivity_control` — `.setsens(true/false)` — включение/отключение виджета
- `frm_form_as_class` — форма как класс: members-объекты в форме, делегирование логики (из codebase: `ramImportExcelProcessor`)
- `frm_loader_chain` — архитектурный паттерн: форма владеет ConfigLoader→DataLoader→ElementLoader (из codebase)
- `frm_show_dismiss` — `show form`, `dismiss form`, модальный vs немодальный режим

**6. `macros`** — Макросы
Обязательные записи:
- `mac_file_structure` — структура `.pmlmac`: объявление переменных, логика, завершение
- `mac_arguments` — `$1..$9` — аргументы командной строки, проверка наличия
- `mac_calling_other_macros` — `$M macroname` — вызов макроса из макроса
- `mac_output_control` — `$p` (print/echo), `$*` (suppress output) — управление выводом
- `mac_file_path_pattern` — паттерн: формирование пути с датой в имени файла (из codebase: `JDE_tagProperties_export`, паттерн `|file-$!<dt.year()>-...`)
- `mac_pipeline_pattern` — паттерн: последовательный вызов макросов как ETL pipeline (из codebase: JDE-серия)
- `mac_global_variables` — передача данных между макросами через `!!globalVar`

**7. `functions`** — Функции
Обязательные записи:
- `fnc_definition_syntax` — `define function !name(args)` — синтаксис, возврат значения
- `fnc_return_value` — как возвращается значение: `!functionName = result`
- `fnc_argument_scope` — аргументы только локальны, не изменяют внешние переменные (pass by value)
- `fnc_pdms_navigation` — навигация по PDMS-иерархии: CE, `q att`, `up`, `first`, `next` (из codebase: `jacExportRDLDataReport`, `jacPropagateParentData`)
- `fnc_array_accumulator` — паттерн: функция накапливает результаты в ARRAY, возвращает его (из codebase)

**8. `dotnet_interop`** — Интеграция с .NET
Обязательные записи:
- `dn_import_statement` — `import 'Namespace.ClassName'` — синтаксис импорта
- `dn_import_guard` — ОБЯЗАТЕЛЬНЫЙ паттерн: `import` всегда обёрнут в `handle any / endhandle` (из codebase: `ramExcelReaderClass`)
- `dn_object_instantiation` — создание .NET объекта из PML
- `dn_method_call` — вызов .NET метода, передача аргументов PML→.NET
- `dn_type_mapping` — маппинг типов: PML STRING→.NET string, PML REAL→.NET double, BOOLEAN→bool (из codebase: `ramValueConverter`)
- `dn_excel_read_pattern` — полный паттерн чтения Excel: открытие→sheets→cells→закрытие (из codebase: `ramExcelReaderClass`)
- `dn_file_write_pattern` — паттерн записи файла через .NET StreamWriter (из codebase: `ramFileWriterClass`)

**9. `pdms_interaction`** — Взаимодействие с PDMS
Обязательные записи:
- `pdms_current_element` — CE (Current Element): что это, как переходить
- `pdms_navigation_commands` — `up`, `first`, `last`, `next`, `prev`, `owner`, `member` — PDMS-навигация
- `pdms_attribute_query` — `q att NAME` — запрос атрибута, обработка UNSET
- `pdms_attribute_update` — `upd att NAME value` vs API-подход
- `pdms_element_create` — создание элементов: `new TYPE NAME` (из codebase: `createObjectsFromExcelSheet`, `ramImportExcelElementLoader`)
- `pdms_element_existence` — проверка существования элемента по имени (из codebase: `ramTagManagement`)
- `pdms_dbref_resolve` — получение DBREF и работа с ним
- `pdms_transaction` — понятие транзакции в PDMS: `savework`, `workon`, откат

**10. `naming_conventions`** — Соглашения об именовании
Обязательные записи:
- `nc_variable_naming` — `!camelCase` для локальных, `!!UPPER_CASE` для глобальных (из codebase)
- `nc_object_naming` — имена объектов в camelCase с префиксом проекта: `ram`, `jac`, `mlp` (из codebase)
- `nc_method_naming` — методы объектов: `!obj.verbNoun()` паттерн
- `nc_file_naming` — `.pmlobj`, `.pmlfnc`, `.pmlmac`, `.pmlfrm` — расширения и их значение
- `nc_prefix_conventions` — префиксы в codebase: `ram` (Ramboll), `jac` (проект JAC), `JDE/EIS/EBA/EBE` (pipeline-серии)

**11. `type_conversion`** — Конвертация типов
Обязательные записи:
- `tc_db_to_pml_mapping` — маппинг типов БД PDMS→PML: INTEGER/REAL→REAL, WORD/TEXT→STRING, LOGICAL→BOOLEAN, REFERENCE→DBREF (из codebase: `ramValueConverter`)
- `tc_string_to_real` — `real('123.45')` — функция конвертации, обработка ошибок
- `tc_real_to_string` — `string(!val)` — форматирование числа в строку
- `tc_date_parsing` — паттерн парсинга дат: перебор разделителей `. , - / \`, `.occurs(char).neq(2)` как признак (из codebase: `ramValueConverter`)
- `tc_boolean_from_string` — конвертация строк 'yes'/'no'/'true'/'false' в BOOLEAN

**12. `logging`** — Логирование
Обязательные записи:
- `log_severity_levels` — уровни severity: 1=INFO, 2=WARNING, 3=ERROR — конвенция codebase
- `log_common_logger_api` — API объекта `ramCommonLogger`: `addLogDetails()` сигнатуры (из codebase: все перегрузки)
- `log_form_integration` — `ramCommonLoggerForm`: как форма отображает лог, связь с объектом логгера
- `log_output_targets` — логирование в форму, в файл, в консоль PDMS — когда что использовать
- `log_contextual_info` — что ДОЛЖНО быть в каждом лог-сообщении: операция, объект, статус, ошибка

**13. `architecture_patterns`** — Архитектурные паттерны
Обязательные записи:
- `ap_loader_chain` — трёхуровневый паттерн: ConfigLoader → DataLoader → ElementLoader (из codebase: Excel import pipeline)
- `ap_form_controller` — форма как Controller: координирует объекты, не содержит бизнес-логику (из codebase: `ramImportExcelProcessor`)
- `ap_separation_of_concerns` — разделение: объект отвечает только за одну задачу, форма — за UI
- `ap_pipeline_macro` — макрос как orchestrator: вызывает последовательность шагов, логирует результат (из codebase: JDE pipeline)
- `ap_data_object` — объект только с данными без логики: `LoopData`, `RAMTagMaturityData` — когда использовать
- `ap_utility_function` — функция как standalone утилита vs метод объекта — критерий выбора

---

### ЭТАП 4 — Верификация полноты

После формирования всех записей выполни перекрёстную проверку:

1. **Проверка покрытия СКЕЛЕТА**: каждая глава каждого PDF должна иметь хотя бы одну запись KB
2. **Проверка примеров**: каждая запись KB категорий `objects`, `forms`, `dotnet_interop`, `architecture_patterns`, `type_conversion`, `logging` ОБЯЗАНА иметь `example_canonical` с реальным кодом из codebase
3. **Проверка принципов**: поле `principle` не должно быть тавтологией синтаксиса — оно должно отвечать на "ПОЧЕМУ" или "КОГДА"
4. **Проверка антипаттернов**: для категорий `error_handling`, `dotnet_interop`, `pdms_interaction` должны быть заполнены `example_antipattern`
5. **Проверка связей**: поле `related_ids` должно быть заполнено для всех записей, образующих паттерны (например: `dn_import_guard` ↔ `eh_handle_endhandle` ↔ `dn_excel_read_pattern`)

---

### ЭТАП 5 — Специальные разделы KB (дополнительно к записям)

Помимо отдельных записей, сформируй следующие разделы как отдельные документы в KB:

#### 5.1 Глоссарий PML-терминов
Для каждого из следующих терминов — краткое определение (1–3 предложения) в контексте AVEVA:
`CE`, `PDMS`, `DBREF`, `namespace`, `pmlobj`, `pmlfnc`, `pmlmac`, `pmlfrm`, `pml rehash`, `handle/endhandle`, `UNSET`, `workon`, `savework`, `$p`, `$*`, `$1`, `$M`, `callback`, `gadget`, `widget`, `form member`, `object member`

#### 5.2 Карта зависимостей codebase
Граф: какой объект/форма/макрос зависит от каких других. Формат:
```
ramImportExcelProcessor.pmlfrm
  └── OWNS: ramImportExcelConfigLoader.pmlobj
  └── OWNS: ramImportExcelDataLoader.pmlobj
  └── OWNS: ramImportExcelElementLoader.pmlobj
  └── USES: ramCommonLogger.pmlobj
  └── CALLS: createObjectsFromExcelSheet.pmlfnc
```
Построй для всех файлов codebase.

#### 5.3 Типичные ошибки и их диагностика
Для каждой из следующих ошибок — описание симптома, причина, решение:
- Забытый `handle any / endhandle` вокруг `import`
- Использование `$!name` вместо `$!<name.method()>` в строке
- Обращение к ARRAY с индексом 0 (в PML индексы с 1)
- `UNSET` вместо FALSE в логических проверках
- Не вызван `pml rehash all` после изменения `.pmlobj`
- Глобальная переменная `!!var` не очищена между запусками макроса
- Форма не имеет метода `initialise()` — виджеты не инициализированы
- Вызов метода объекта до его создания (`object NAME()` не вызван)

#### 5.4 Чеклист перед написанием PML-кода
Вопросы, которые разработчик должен задать себе:
- Нужен ли `.pmlobj` (реиспользуемая логика) или достаточно `.pmlfnc` (однократная операция)?
- Где хранить состояние: в members объекта, в форме или в `!!global`?
- Все ли `.NET import` защищены `handle any`?
- Инициализированы ли все ARRAY перед `append()`?
- Проверены ли все DBREF на UNSET перед разыменованием?
- Есть ли логирование каждого критичного шага?
- Будет ли код работать при пустом входном наборе (пустой Excel, нет элементов в PDMS)?

---

## КРИТИЧЕСКИЕ ОГРАНИЧЕНИЯ (строго обязательны)

1. **НЕТ ГАЛЛЮЦИНАЦИЯМ**: каждый синтаксис, каждый пример кода должен быть либо из PDF-документов, либо из реальных файлов codebase. Если что-то не удалось найти — оставь поле пустым с пометкой `"NOT_FOUND_IN_SOURCES"`.

2. **PDF — источник истины для синтаксиса**: если в codebase есть паттерн, противоречащий PDF — зафиксируй оба варианта с пометкой источника. Не выбирай один как правильный без обоснования из PDF.

3. **Codebase — источник истины для паттернов**: реальные production-паттерны из codebase имеют приоритет над теоретическими примерами из документации.

4. **Примеры из codebase — дословно**: поле `example_canonical` содержит реальный код из файлов, не переписанный и не "улучшенный".

5. **Принципы — не тавтологии**: поле `principle` не должно повторять `rule`. "Использовать handle" — это rule. "Любой .NET вызов может бросить исключение, которое не перехватит PML без явного handle" — это principle.

6. **Полнота по главам PDF**: если в PDF есть глава о директивах препроцессора — она ДОЛЖНА быть покрыта в KB, даже если в codebase нет примеров использования.

---

## Ожидаемый формат вывода

Выдай результат в виде структурированного Markdown-документа со следующими разделами:

```markdown
# PML Knowledge Base — MCP Server

## Метаданные
- Дата формирования
- Версии источников
- Количество записей по категориям

## Раздел 1: Записи KB (по категориям)
### Категория: data_types
#### [dt_string_declaration] ...
...

## Раздел 2: Глоссарий

## Раздел 3: Карта зависимостей codebase

## Раздел 4: Типичные ошибки и диагностика

## Раздел 5: Чеклист разработчика

## Раздел 6: Индекс источников
(все PDF-главы → записи KB, все файлы codebase → записи KB)
```

Минимальный ожидаемый объём: **80–120 записей KB** + 4 специальных раздела.

---

## Что НЕ нужно включать в базу знаний

- Общие советы по "хорошему коду" без привязки к PML-специфике
- Синтаксис, не подтверждённый ни одним из источников
- Паттерны из других языков (Python, JavaScript), если они не встречаются в codebase PML
- Информацию о версиях AVEVA, лицензировании, установке — это не принципы разработки
- Интерфейс пользователя PDMS/AVEVA — только программные интерфейсы

---

*Начни выполнение с ЭТАПА 1. После завершения каждого этапа напиши краткое резюме найденного прежде чем переходить к следующему.*
