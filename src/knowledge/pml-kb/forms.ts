import type { KBEntry } from '../schemas/kb-entry.js';

export const formsEntries: KBEntry[] = [
  {
    "id": "frm_file_structure",
    "category": "forms",
    "subcategory": "structure",
    "title": "Структура файла .pmlfrm",
    "principle": "Форма — это глобальный объект (!!formName), описанный одним файлом: блок setup form ... exit задаёт гаджеты, члены и callbacks, а следующие define method задают поведение; форма владеет гаджетами как членами, что делает её естественным контроллером.",
    "rule": "Порядок: (опц.) import+handle, using namespace → setup form !!NAME [dialog ...] / гаджеты / member ... / exit → define method-ы (включая конструктор с именем формы и .init()); сохранять как .pmlfrm под PMLLIB.",
    "syntax": "setup form !!exampleForm\n  ...gadgets / members...\nexit\n\ndefine method .init()\n  ...\nendmethod",
    "exampleCanonical": "-- CB ramImportExcelValidationForm.pmlfrm\nimport 'GridControl'\nhandle any\nendhandle\nusing namespace 'Aveva.Core.Presentation'\nsetup form !!ramImportExcelValidationForm resize\n  option .opExcelSheet |Select Excel Sheet| tagwidth 15 anchor T+L at xmin ymin width 30\n  frame .frExcelList anchor all at xmin ymax+0.5 width 150 height 20\n    container .coExcelList NOBOX PMLNETControl 'Data List' dock fill\n  exit\n  member .dataLoader    is RAMIMPORTEXCELDATALOADER\n  member .gridExcelList is NETGRIDCONTROL\nexit",
    "exampleAntipattern": "-- FRAME без парного EXIT: форма НЕ ЗАГРУЗИТСЯ, командная строка останется в режиме setup (TM-1402 §2.11)",
    "pitfalls": [
      "Каждому FRAME нужен парный EXIT, иначе форма не грузится и CL зависает в setup-режиме (выход — EXIT до ошибки)",
      "Имя файла = имя формы",
      "dialog dock / resize задаются в строке setup form"
    ],
    "relatedIds": [
      "frm_initialise_method",
      "frm_form_as_class",
      "obj_namespace_loading"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.3 (Defining a Form); §2.1 (Forms are Global Objects)",
    "sourcecodebase": "ramImportExcelValidationForm.pmlfrm"
  },
  {
    "id": "frm_initialise_method",
    "category": "forms",
    "subcategory": "lifecycle",
    "title": "Метод инициализации (.init() через initCall)",
    "principle": "Конструктор формы (метод с именем формы) выполняется однократно при загрузке, а INITCALL (.init()) — каждый раз при показе формы, поэтому значения по умолчанию и заполнение гаджетов размещают в .init(), а привязку callbacks и создание .NET-гаджетов — в конструкторе.",
    "rule": "Назначить !this.initCall = |!this.init()| в конструкторе; в .init() заполнять/сбрасывать значения гаджетов; в конструкторе — задать callbacks, создать .NET-контролы, построить меню; помнить про 7 событийных callback'ов формы.",
    "syntax": "define method .ramImportExcelProcessor()   $* конструктор\n  !this.initCall = |!this.init()|\n  ...callbacks, .NET grid, menu...\nendmethod\n\ndefine method .init()                       $* при каждом показе\n  !this.clearData()\nendmethod",
    "exampleCanonical": "-- CB ramCommonLoggerForm.pmlfrm\ndefine method .ramCommonLoggerForm()\n  !this.initCall            = |!this.init()|\n  !this.buExport.callback   = |!this.browseExcel()|\n  !this.buClear.callback    = |!this.clearData()|\n  !this.buRefresh.callback  = |!this.init()|\n  ...\nendmethod\n\ndefine method .init()\n  !this.loadGrid()\nendmethod",
    "exampleAntipattern": "-- заполнение списков прямо в конструкторе: данные не обновятся при повторном показе формы",
    "pitfalls": [
      "Конструктор — один раз при загрузке; INITCALL — при каждом показе",
      "Если default-значения не выставлены в .init(), пользователь видит UNSET/старые данные",
      "7 callback'ов: constructor, initCall, firstShownCall, okCall, cancelCall, quitCall, killingCall"
    ],
    "relatedIds": [
      "frm_callback_syntax",
      "frm_file_structure",
      "frm_form_as_class"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.4 (CONSTRUCTOR vs INITCALL vs FIRSTSHOWNCALL etc. — 7 event callbacks)",
    "sourcecodebase": "ramCommonLoggerForm.pmlfrm"
  },
  {
    "id": "frm_callback_syntax",
    "category": "forms",
    "subcategory": "callback",
    "title": "Синтаксис callback гаджета",
    "principle": "Callback — это строка-команда, выполняемая при взаимодействии с гаджетом; она может (1) показать форму, (2) выполнить команду, (3) вызвать функцию/метод; callback можно задать либо inline в определении гаджета (call |...|), либо присвоением !this.widget.callback в конструкторе.",
    "rule": "Inline: button .b |Tag| call |!this.method()|; через присвоение: !this.b.callback = |!this.method()|; open callback (две скобки) — call |!this.opencall(| с методом, принимающим (!gad is GADGET, !key is STRING).",
    "syntax": "button .button |Print| call |!this.print()|\n!this.buImport.callback = |!this.importData()|",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\n!this.buAdd.callback             = |!this.addToList()|\n!this.buRemove.callback          = |!this.removeFromList()|\n!this.buConfigBrowse.callback    = |!this.browseConfigFile()|\n!this.buImport.callback          = |!this.importData()|\n!this.buValidationForm.callback  = |!this.showValidationForm()|",
    "exampleAntipattern": "button .b |X| call !this.method()   $* callback должен быть строкой в | | : call |!this.method()|",
    "pitfalls": [
      "Open callback опознаётся по одной открывающей скобке call |!this.m(| и требует метод с 2 аргументами (GADGET, STRING)",
      "Callback — всегда STRING",
      "TEXTPANE нельзя дать callback — действие через кнопку"
    ],
    "relatedIds": [
      "frm_button_callback",
      "frm_initialise_method"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.4 (Callbacks); §2.20 (Open Callbacks — single bracket); TM-1401 M&F §2.5",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "frm_widget_common_params",
    "category": "forms",
    "subcategory": "widgets",
    "title": "Общие параметры гаджетов",
    "principle": "Гаджет занимает область формы и (опционально) имеет действие; поэтому почти у каждого определения есть позиция (AT / PATH), размер (width/height) и привязка (anchor/dock), а у интерактивных — callback; гаджет — это объект со своими членами/методами.",
    "rule": "Определять: имя (.name), тип (button/text/list/option/...), tag-подпись (|...|), позицию (at x y или относительно другого гаджета), размер (width/height), привязку (anchor/dock); для текстового ввода — is TYPE; для интерактива — call/callback.",
    "syntax": "button .buImport |Import Data| anchor r+b at xmax form-size ymin WIDTH 10\ntext .teConfigFile |Config File| tagwidth 10 at xmin ymax+1 width 50 is STRING",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\nbutton .buAdd        |Add|             anchor r+t  at xmax+1           ymin+3             WIDTH 6\ntext   .teConfigFile  |Config File|     anchor l+r+b tagwidth 10 at xmin.frExcelList ymax.frExcelList+1 width 50 is STRING\nbutton .buImport      |Import Data|     anchor r+b  at xmax form-size  ymin               WIDTH 10",
    "exampleAntipattern": "-- NOT: назначать callback как прямой вызов вместо строки |!this.method()|\n-- Плохо: callback выполнится не в lifecycle-событии или не выполнится вовсе",
    "pitfalls": [
      "DOCK и ANCHOR взаимоисключающие — только один на гаджет",
      "TEXT-гаджет требует is TYPE (STRING/REAL) — определяет тип введённого значения",
      "Позиционирование относительно другого гаджета: at xmax.other + N ymin.other"
    ],
    "relatedIds": [
      "frm_button_callback",
      "frm_textinput_read",
      "frm_list_population",
      "frm_sensitivity_control"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.5 (Form Gadgets); §2.5.2 (Gadget Positioning); §2.5.3 (Docking and Anchoring)",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "frm_button_callback",
    "category": "forms",
    "subcategory": "button",
    "title": "BUTTON с callback — привязка действия",
    "principle": "Кнопка чаще всего либо вызывает действие, либо показывает дочернюю форму; её callback может вызвать локальный метод, глобальную функцию или объектный метод, и если заданы и callback, и форма — сначала выполнится callback, затем покажется форма.",
    "rule": "button .name |Tag| [linklabel] [toggle] [pixmap] [form !!child] call |action|; для иконки добавлять pixmap и .addPixmap() в конструкторе; toggle хранит BOOLEAN в .val.",
    "syntax": "button .buRefresh |Refresh Log| anchor r+t at xmin+50 ymin WIDTH 10\n!this.buRefresh.callback = |!this.init()|",
    "exampleCanonical": "-- CB ramCommonLoggerForm.pmlfrm\nbutton .buRefresh   |Refresh Log|  anchor r+t  at xmin+50  ymin  WIDTH 10\nbutton .buExport    |Export Data|  anchor l+b  at xmin form+1 ymax+0.5 WIDTH 10\nbutton .buClear     |Clear Log|    anchor r+b  at xmax form-size ymin\n...\n!this.buExport.callback = |!this.browseExcel()|",
    "exampleAntipattern": "-- NOT: назначать callback как прямой вызов вместо строки |!this.method()|\n-- Плохо: callback выполнится не в lifecycle-событии или не выполнится вовсе",
    "pitfalls": [
      "Если заданы и callback, и form — сначала callback, потом форма",
      "toggle-кнопка хранит состояние в .val (BOOLEAN)",
      "pixmap-иконку добавляют через .addPixmap(!!pml.getPathName('icon.png'))"
    ],
    "relatedIds": [
      "frm_callback_syntax",
      "frm_widget_common_params"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.7 (Button Gadgets)",
    "sourcecodebase": "ramCommonLoggerForm.pmlfrm"
  },
  {
    "id": "frm_list_population",
    "category": "forms",
    "subcategory": "list",
    "title": "Заполнение LIST/grid: dtext/rtext, setRows/setHeadings, NETDATASOURCE",
    "principle": "LIST-гаджет показывает ARRAY значений: dtext — отображаемый текст, rtext — скрытое «реальное» значение (часто DBREF.string()), что позволяет показывать имена, а действовать по ссылкам; в современном production-коде вместо LIST используется .NET grid, заполняемый через NETDATASOURCE.",
    "rule": "Классический LIST: присвоить .dtext = !array (и при необходимости .rtext = !refArray); многоколоночный — .setHeadings(!arr) + .setRows(!arr2D); .NET grid: создать NETDATASOURCE(title, headings, data) и .bindToDataSource(!nds).",
    "syntax": "!this.lst.dtext = !values\n!this.lst.rtext = !rtext\n!nds = object NETDATASOURCE('Excel List', !heading, !data)\n!this.gridExcelList.bindToDataSource(!nds)",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\n!data    = object ARRAY()\n!this.heading = object ARRAY()\n!this.heading.append('Excel Name')\n!this.heading.append('Is Transpose')\n!this.heading.append('Excel Path')\n!nds = object NETDATASOURCE('Excel List', !this.heading, !data)\n!this.gridExcelList.bindToDataSource(!nds)",
    "exampleAntipattern": "-- NOT: назначать callback как прямой вызов вместо строки |!this.method()|\n-- Плохо: callback выполнится не в lifecycle-событии или не выполнится вовсе",
    "pitfalls": [
      "dtext — показ, rtext — реальное значение для выборки",
      "Все значения LIST задаются присвоением ARRAY",
      "Для .NET grid сначала создать NETGRIDCONTROL и привязать .handle() к container.control"
    ],
    "relatedIds": [
      "frm_widget_common_params",
      "dn_object_instantiation",
      "log_form_integration"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.10 (List Gadgets — dtext/rtext/setRows/setHeadings); §2.18 (NETDATASOURCE, bindToDataSource)",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "frm_textinput_read",
    "category": "forms",
    "subcategory": "text",
    "title": "Чтение значения TEXT-гаджета (.val)",
    "principle": "TEXT-гаджет создаёт переменную того типа, который задан через is TYPE; прочитать введённое значение можно через член .val — и его тип будет соответствовать объявленному, что важно при дальнейшем использовании в PML.",
    "rule": "Объявить text .name ... is STRING|REAL [format !!FMT]; читать введённое через !this.name.val; писать значение — присвоением !this.name.val = ...; для нередактируемого, но выделяемого поля — .setEditable(FALSE)/.editable = false.",
    "syntax": "text .txt1 |Val as String| width 10 is STRING\n!v = !this.txt1.val\n!this.teConfigFile.editable = false",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\n!configFilePath    = !this.teConfigFile.val\n!isValidConfigPath = !configFilePath.set() AND !configFilePath.neq('')",
    "exampleAntipattern": "-- NOT: назначать callback как прямой вызов вместо строки |!this.method()|\n-- Плохо: callback выполнится не в lifecycle-событии или не выполнится вовсе",
    "pitfalls": [
      "Тип .val определяется is TYPE гаджета — REAL-поле вернёт REAL",
      "Прочитанное значение может быть UNSET — проверяйте .set()",
      "Нередактируемое (.editable=false) лучше деактивированного, если нужно копировать текст"
    ],
    "relatedIds": [
      "frm_widget_common_params",
      "dt_unset_handling",
      "frm_sensitivity_control"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.8 (Text Entry Gadgets — WIDTH, TYPE, .val, setEditable)",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "frm_sensitivity_control",
    "category": "forms",
    "subcategory": "state",
    "title": "Управление доступностью/видимостью гаджета (.active / .visible / .editable)",
    "principle": "Гаджет — объект с членами состояния, поэтому его можно динамически включать/выключать (.active), скрывать/показывать (.visible) и делать (не)редактируемым (.editable/setEditable) прямо из методов, не переопределяя форму.",
    "rule": "Делать неактивным: !this.gad.active = FALSE; скрывать: !this.gad.visible = FALSE; запрещать ввод, сохраняя выделение: !this.gad.editable = false (или .setEditable(FALSE)).",
    "syntax": "!!exampleCallback.ok.active = FALSE\n!!exampleCallback.cancel.visible = FALSE\n!this.txt6.setEditable(FALSE)",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\n!this.teConfigFile.editable      = false\n-- CB: ramImportExcelValidationForm.pmlfrm\n!this.gridExcelList.editableGrid(false)",
    "exampleAntipattern": "-- NOT: назначать callback как прямой вызов вместо строки |!this.method()|\n-- Плохо: callback выполнится не в lifecycle-событии или не выполнится вовсе",
    "pitfalls": [
      "Метод .setsens(true/false) в источниках TM-1401/TM-1402/codebase не подтверждён — используйте .active = TRUE/FALSE (official source not identified for .setsens)",
      "active=FALSE серит и блокирует; editable=false блокирует ввод, но позволяет выделение"
    ],
    "relatedIds": [
      "frm_widget_common_params",
      "frm_textinput_read"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.5.1 (active/visible — Built-in Members and Methods for Gadgets); §2.8 (setEditable)",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "frm_form_as_class",
    "category": "forms",
    "subcategory": "architecture",
    "title": "Форма как класс: члены-объекты и делегирование логики",
    "principle": "Форма — это объект, поэтому ей можно дать члены любых типов (включая пользовательские объекты) с временем жизни формы; бизнес-логику выносят в эти члены-объекты, а форма лишь координирует — это даёт чистое разделение UI и логики.",
    "rule": "Объявлять member .x is SOMEOBJECT в setup form; создавать их в конструкторе/инициализации; методы формы должны делегировать вычисления членам-объектам, а сами заниматься UI (чтение гаджетов, отображение результата).",
    "syntax": "member .meConfigDetails      is RAMIMPORTEXCELCONFIGLOADER\nmember .meExcelDataProcessor is RAMIMPORTEXCELDATALOADER\nmember .meExcelElementLoader is RAMIMPORTEXCELELEMENTLOADER",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\nmember .meConfigDetails            is RAMIMPORTEXCELCONFIGLOADER\nmember .meExcelDataProcessor       is RAMIMPORTEXCELDATALOADER\nmember .meExcelElementLoader       is RAMIMPORTEXCELELEMENTLOADER\nmember .gridExcelList              is NETGRIDCONTROL\nmember .heading                    is ARRAY\nmember .isReloadNeeded             is BOOLEAN",
    "exampleAntipattern": "-- вся логика парсинга Excel и создания элементов прямо в методах формы вместо объектов-лоадеров",
    "pitfalls": [
      "Члены-объекты живут столько же, сколько форма — удаляются при выгрузке",
      "Не складывать бизнес-логику в методы формы — делегируйте членам",
      "Член-объект надо создать (в конструкторе/init), иначе UNSET"
    ],
    "relatedIds": [
      "frm_loader_chain",
      "ap_form_controller",
      "obj_delegation_pattern",
      "frm_initialise_method"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.16 (User-Defined Form Members); §2.1 (Forms are Global Objects)",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "frm_loader_chain",
    "category": "forms",
    "subcategory": "architecture",
    "title": "Цепочка лоадеров: форма владеет ConfigLoader → DataLoader → ElementLoader",
    "principle": "Импорт из Excel разбит на три специализированных объекта: ConfigLoader читает конфигурацию, DataLoader парсит и мапит данные (используя конфиг), ElementLoader создаёт/обновляет элементы PDMS (используя загруженные данные); форма владеет всеми тремя и связывает их, что даёт явный однонаправленный поток данных.",
    "rule": "Объявить три члена-лоадера; в инициализации: загрузить конфиг → передать его DataLoader (setConfigDetail) → DataLoader парсит → передать DataLoader в ElementLoader (setDataLoader) → ElementLoader создаёт элементы; каждый этап логирует результат.",
    "syntax": "!this.meConfigDetails.loadConfigDetails(!configFilePath)\n!this.meExcelDataProcessor.setConfigDetail(!this.meConfigDetails)\n!this.meExcelElementLoader.setDataLoader(!this.meExcelDataProcessor)\n!this.meExcelElementLoader.loadElement()",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\n!this.meConfigDetails.loadConfigDetails(!configFilePath)\n!this.meExcelDataProcessor.clearMappings()\n!this.meExcelDataProcessor.setConfigDetail(!this.meConfigDetails)\n!this.meExcelDataProcessor.loadExcelData(!this.getExcelPathList(), !this.getExcelTransposeList())\n!this.meExcelDataProcessor.initiateMappings()\n...\n!this.meExcelElementLoader.setDataLoader(!this.meExcelDataProcessor)\n!this.meExcelElementLoader.loadElement()",
    "exampleAntipattern": "-- единый монолитный метод формы, читающий Excel, мапящий и создающий элементы одновременно",
    "pitfalls": [
      "Поток строго однонаправлен: Config → Data → Element",
      "Перед повторным запуском вызывать clearMappings()/initiateLoader() (флаг isReloadNeeded)",
      "Каждый лоадер — отдельный объект с одной ответственностью"
    ],
    "relatedIds": [
      "frm_form_as_class",
      "ap_loader_chain",
      "ap_form_controller",
      "obj_delegation_pattern"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.16 (form members); §3.4 (objects) — архитектурный паттерн из codebase",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "frm_show_dismiss",
    "category": "forms",
    "subcategory": "lifecycle",
    "title": "Показ/скрытие форм; модальность",
    "principle": "Поскольку форма ищется по PMLLIB, её не нужно загружать вручную: show !!formName загружает и показывает за один шаг, а .hide()/.show()/.shown() управляют видимостью уже загруженной формы; режим (dialog/dock/resize) задаётся в строке setup form.",
    "rule": "Показать: show !!formName (или !!formName.show()); скрыть: !!formName.hide(); проверить: !!formName.shown(); загрузить без показа: loadform !!formName; режим окна — параметры строки setup form (dialog, dock left, resizable).",
    "syntax": "show !!exampleForm\n!!gphsettings.show()\n!!gphsettings.hide()\nq var !!gphsettings.shown()\nsetup form !!exampleForm dialog dock left",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\n!control.add('callback',  'Show Logger...',   'show !!RAMCOMMONLOGGERFORM')",
    "exampleAntipattern": "-- NOT: назначать callback как прямой вызов вместо строки |!this.method()|\n-- Плохо: callback выполнится не в lifecycle-событии или не выполнится вовсе",
    "pitfalls": [
      "Форма с menubar НЕ может быть docked (TM-1402 §2.3.1)",
      "Форма с OK/Cancel обычно не нуждается в docking",
      "loadform грузит без показа — для доступа к данным формы"
    ],
    "relatedIds": [
      "frm_initialise_method",
      "frm_file_structure"
    ],
    "sourcedoc": "TM-1402 Form Design Rev 1.0, §2.3.2 (Showing and Hiding Forms); §2.3.3 (Built-in Methods .show()/.hide()/.shown()); §2.3.1 (dialog dock/resizeable)",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "p2_form_7callbacks",
    "category": "forms",
    "subcategory": "callbacks",
    "title": "Form callbacks: 6 standard callbacks + optional/project-specific openCall",
    "principle": "Form lifecycle behavior is controlled by callback string properties assigned during form construction/initialization.",
    "rule": "Use six documented standard callbacks: initCall, firstShownCall, okCall, cancelCall, quitCall, killingCall. Treat openCall as optional/project-specific unless confirmed for the target version.",
    "syntax": "!this.initCall = |!this.init()|\n!this.firstShownCall = |!this.firstShown()|\n!this.okCall = |!this.onOK()|\n!this.cancelCall = |!this.onCancel()|\n!this.quitCall = |!this.onQuit()|\n!this.killingCall = |!this.onKill()|",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\ndefine method .ramImportExcelProcessor()\n  !this.initCall = |!this.init()|\n  !this.buOK.callback = |!this.onOK()|\n  !this.buCancel.callback = |!this.onCancel()|\nendmethod",
    "exampleAntipattern": "-- NOT: !this.initCall = !this.init()\n-- Плохо: callback must be a string command, not an immediate method call result",
    "pitfalls": [
      "Callbacks are pipe-delimited command strings",
      "Button `.callback` differs from form okCall/cancelCall",
      "firstShownCall is not the same as initCall",
      "openCall is not confirmed as one of the six standard callbacks"
    ],
    "relatedIds": [
      "frm_callback_syntax",
      "frm_button_callback",
      "frm_initialise_method"
    ],
    "sourcedoc": "TM-1402 Form callbacks; AVEVA Engineering callback docs; Perplexity PML KB §3.2",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "p2_netgrid_full",
    "category": "forms",
    "subcategory": "netgridcontrol",
    "title": "NETGRIDCONTROL detailed API pattern",
    "principle": "NETGRIDCONTROL is a .NET-backed form grid used for tabular selection/filtering workflows.",
    "rule": "Import/use the grid control according to project setup, initialize columns/data in form lifecycle, and read selection through grid-specific properties/methods such as selected row/cell where available.",
    "syntax": "-- form gadget/control setup for NETGRIDCONTROL\n-- version/project API examples: columnExcelFilter, selectionByRow, selectedCell",
    "exampleCanonical": "-- CB ramImportExcelProcessor.pmlfrm\nsetup form !!ramImportExcelProcessor dialog resizable\n  member .meConfigDetails is RAMIMPORTEXCELCONFIGLOADER\nexit",
    "exampleAntipattern": "-- NOT: read grid rows before loader chain has populated grid data\n-- Плохо: selectedCell/selection state is unset or stale",
    "pitfalls": [
      "Detailed API is .NET/version-specific",
      "Initialize grid after data loader is ready",
      "Selection-by-row and selected-cell semantics differ",
      "Document column names used by filters"
    ],
    "relatedIds": [
      "frm_loader_chain",
      "p2_widget_prefix",
      "dn_import_statement"
    ],
    "sourcedoc": "Perplexity PML KB §3.3/§9.3; codebase NETGRID usage",
    "sourcecodebase": "ramImportExcelProcessor.pmlfrm"
  },
  {
    "id": "logger-form-refresh-side-effect",
    "category": "forms",
    "subcategory": "global-form-integration",
    "title": "Logger updates can mark a global form refresh button by changing gadget background",
    "principle": "Logger-side UI refresh flags can be communicated through gadget state such as background color.",
    "rule": "Logger-side UI refresh flags can be communicated through gadget state such as background color.",
    "syntax": "------------------------------------------------------------------------\ndefine method .addLogDetails(!toolName is STRING, !details is ARRAY, !severityLevel is REAL)",
    "exampleCanonical": "-- CB ramCommonLogger.pmlobj\n------------------------------------------------------------------------\ndefine method .addLogDetails(!toolName is STRING, !details is ARRAY, !severityLevel is REAL)\n  if(defined(!!ramCommonLoggerForm)) then\n    !!ramCommonLoggerForm.buRefresh.background = 2\n  endif\n  !finalLog                                    = object ARRAY()\n  !finalLog.Append(!severityLevel)\n  !finalLog.Append(!toolName)\n  !finalLog.AppendArray(!details)\n  !this.logDataList.append(!finalLog)\nendmethod",
    "exampleAntipattern": "-- WRONG: use Logger updates can mark a global form refresh button by changing gadget background without validating the source context in ramCommonLogger.pmlobj",
    "pitfalls": [
          "Validate against ramCommonLogger.pmlobj before reusing the pattern.",
          "Keep source-specific names and database context explicit when adapting this snippet."
    ],
    "relatedIds": [
      "frm_callback_syntax"
    ],
    "sourcedoc": "AVEVA PML Reference",
    "sourcecodebase": "ramCommonLogger.pmlobj"
  },
  {
    "id": "pml-statement-show",
    "category": "forms",
    "subcategory": "form-display",
    "title": "SHOW — Display a form by global reference",
    "principle": "SHOW statement displays a form identified by a global variable reference. Used to present user-facing dialogs from PML code.",
    "rule": "SHOW !!formGlobalVar — displays the form referenced by the global variable",
    "syntax": "SHOW !!ramimportExcelReclassificationForm\n!!ramimportExcelReclassificationForm.loadData(!this)",
    "exampleCanonical": "-- CB ramImportExcelElementLoader.pmlobj\n-- CB obj_06: show reclassification form\nSHOW !!ramimportExcelReclassificationForm\n!!ramimportExcelReclassificationForm.loadData(!this)",
    "exampleAntipattern": "show !localForm -- SHOW requires global variable reference",
    "pitfalls": [
      "SHOW requires a global (!!) form reference, not a local variable",
      "Form must be previously loaded/imported"
    ],
    "relatedIds": [
      "frm_callback_syntax"
    ],
    "sourcedoc": "obj_06 (ramImportExcelElementLoader.pmlobj)",
    "sourcecodebase": "ramImportExcelElementLoader.pmlobj"
  },
  {
    "id": "pml_fmt_datetime_string",
    "category": "forms",
    "subcategory": "datetime formatting",
    "title": "DATETIME object with .string() format codes",
    "principle": "The OBJECT DATETIME() construct returns a datetime object with methods for year, month, date, hour, minute, second. Each can be formatted via .string(formatCode).",
    "rule": "Use `.string('I2')` for zero-padded 2-digit integers, `.string('I4')` for 4-digit years. Format codes follow PDMS/E3D FORMAT conventions.",
    "syntax": "!dt = OBJECT DATETIME()\n!year = !dt.year()\n!month = !dt.month().string('I2')",
    "exampleCanonical": "-- CB manual-data-export.pmlmac\n-- Build a timestamped filename\n!dt = OBJECT DATETIME()\n!ts = !dt.year().string() & '-' & !dt.month().string('I2') & '-' & !dt.date().string('I2')",
    "exampleAntipattern": "-- Don't use .string() without format code for zero-padding\n!month = !dt.month().string() -- may produce single-digit '3' instead of '03'",
    "pitfalls": [
      "Format codes like 'I2' are PDMS/E3D FORMAT codes; their exact behavior may vary by product version.",
      ".year() returns a REAL; .string() on a bare REAL may not zero-pad."
    ],
    "relatedIds": [
      "frm_callback_syntax"
    ],
    "sourcedoc": "AVEVA E3D PML Customization",
    "sourcecodebase": "manual-data-export.pmlmac"
  },
  {
    "id": "macro_finish_directive",
    "category": "forms",
    "subcategory": "lifecycle",
    "title": "FINISH directive — macro termination",
    "principle": "The FINISH directive explicitly terminates a PML macro execution and returns control to the calling context.",
    "rule": "Place FINISH at the end of a macro to signal clean completion. Equivalent to implicit end-of-file termination but makes intent explicit.",
    "syntax": "FINISH",
    "exampleCanonical": "-- CB EBA_full_tag_export.pmlmac\n!dataTable.saveGridToExcel(|$!<publishPath>$!<dataFileName>|)\n\nFINISH",
    "exampleAntipattern": "-- WRONG: omit validated pattern for FINISH directive — macro termination\n-- Review source EBA_full_tag_export.pmlmac before reuse",
    "pitfalls": [
      "FINISH in a macro is optional — the macro ends at EOF. Use it to clarify intent."
    ],
    "relatedIds": [],
    "sourcedoc": "AVEVA E3D PML Macros Reference",
    "sourcecodebase": "EBA_full_tag_export.pmlmac"
  },
  {
    "id": "form_anchor_form_size_keyword",
    "category": "forms",
    "subcategory": "form_layout",
    "title": "form-size anchor positioning keyword",
    "principle": "The 'form-size' keyword in anchor positioning references the full form dimensions, equivalent to the form's client area bounds.",
    "rule": "Use 'form-size' instead of ad-hoc expressions like 'form+1' for reliable form-relative positioning.",
    "syntax": "anchor all at xmin form-size ymax+0.5",
    "exampleCanonical": "-- CB ramCommonLoggerForm.pmlfrm\nframe .frLogList anchor all at xmin form-size ymax+0.5 width 60 height 10\nbutton .buExport anchor l+b at xmin form-size ymax+0.5 WIDTH 10",
    "exampleAntipattern": "anchor all at xmin form+1 ymax+0.5\n-- 'form+1' is non-standard and may behave unpredictably across PML versions.",
    "pitfalls": [
      "form-size represents the form's client area, not the full window including title bar.",
      "Do not mix form-size with numeric offsets without testing — form-size already accounts for form dimensions."
    ],
    "relatedIds": [
      "frm_callback_syntax"
    ],
    "sourcedoc": "AVEVA E3D Design Customization Guide - Form Gadgets",
    "sourcecodebase": "ramCommonLoggerForm.pmlfrm"
  },
  {
    "id": "forms_layout_gadget_method_access",
    "category": "forms",
    "subcategory": "layout",
    "title": "Accessing layout gadgets from form methods via !this.gadgetName",
    "principle": "Gadgets defined in layout sections are accessible in form methods via !this.<gadgetName> without explicit member declaration.",
    "rule": "A list/button/container gadget defined in layout can be referenced as !this.gadgetName in methods. No member declaration needed for gadget access.",
    "syntax": "layout form !!FormName\n  list .myList 'Items' exit\ndefine method .method()\n  !this.myList.dText = !array\nendmethod",
    "exampleCanonical": "-- CB jackimform.pmlfrm\nlayout form !!JACKIMFORM\n\tpath DOWN\n\tframe .overallFrame panel anchor all width 20 height 17\n\t\tlist .reports 'Templates' CALL || anchor b + l + t width 20 height 31\n\texit\nmember .reports is ARRAY\ndefine method .init()\n\t!reports = array()\n\t!reports.append('Item 1')\n\t!this.reports.dText = !reports\nendmethod",
    "exampleAntipattern": "Declaring list gadget members as ARRAY when they should remain as gadget references:\nmember .reports is ARRAY  -- .reports is a list gadget, not an ARRAY member",
    "pitfalls": [
      "Gadget attributes (dText, val, tag) differ from PML member types",
      "Linter may report unknown-form-member for gadget references — these are valid PML",
      "Do not mix gadget references with declared members of same name"
    ],
    "relatedIds": [
      "frm_callback_syntax"
    ],
    "sourcedoc": "AVEVA PML Customization — Form Gadget Reference",
    "sourcecodebase": "jackimform.pmlfrm"
  },
  {
    "id": "ui_form_menu_dynamic",
    "category": "forms",
    "subcategory": "menu",
    "title": "Dynamic Menu Creation in PML Forms",
    "principle": "PML forms support dynamic menu creation via !this.newMenu() and bar.add() methods, enabling runtime popup and bar menus.",
    "rule": "Use !this.newMenu('menuName') to create a menu object, then .add('callback', 'label', 'command') to add entries. Use !this.bar.add('category', 'name') for bar menu entries.",
    "syntax": "!menu = !this.newMenu('menuName')\n!menu.add('callback', 'Label Text', '!this.methodName()')\n!this.bar.add('Category', 'name')",
    "exampleCanonical": "-- CB jacEISDeliveryForm.pmlfrm\n-- Dynamic menu in form constructor\n!this.bar.add('Tools', 'toolsMenu')\n!toolsMenu = !this.newMenu('toolsMenu')\n!toolsMenu.add('callback', 'Option 1', '!this.doOption1()')\n!toolsMenu.add('callback', 'Option 2', '!this.doOption2()')",
    "exampleAntipattern": "-- Static menu defined at form setup (less flexible)\n!menu = menu\n!menu.add('Static', '.staticMethod')",
    "pitfalls": [
      "Menu names must be unique within the form scope",
      "Callback commands are strings, not method references",
      "Bar menu categories appear as submenus"
    ],
    "relatedIds": [
      "frm_callback_syntax"
    ],
    "sourcedoc": "AVEVA PML Customization Guide - Forms and Menus",
    "sourcecodebase": "jacEISDeliveryForm.pmlfrm"
  }
];
