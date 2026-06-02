# Research: PML Codebase Harmonization Plan

> Исследование PML кодовой базы в `docs/codebase/` для подготовки плана реорганизации.
> Дата: 2026-06-02

## Summary

Исследована PML кодовая база, содержащая скрипты для AVEVA E3D/PDMS в двух проектных модулях: `jackdow` (основной) и `ew1` (вспомогательный). Найдены 20 PML файлов, несколько макросов-дублей с хардкодными путями к OneDrive, 8 функций, 10 объектов, 2 формы. Основные проблемы: отсутствие версионирования в VCS, дублирование макросов с хардкодными путями к данным, смешение библиотечного и пользовательского кода.

**Важно:** Исследование ограничено инструментом чтения файлов, не позволяющим листить директории. Полный перечень файлов получен через контекстный файл `context.md` и последовательный поиск по именам. Некоторые файлы, упомянутые в context.md (макросы, объекты TagManagementTmp, LoopData, ramImportExcel*), не были найдены в `docs/codebase/` — возможно, они не были скопированы в docs, либо находятся в архивных подкаталогах с именами, которые не удалось угадать.

---

## 1. Найденные PML файлы и их содержимое

### 1.1 Root (`docs/codebase/`)

| # | Файл | Тип | Категория | Описание |
|---|------|-----|-----------|----------|
| 1 | `createObjectsFromExcelSheet.pmlfnc` | .pmlfnc | Data Import / Tag Management | Legacy-функция для создания/обновления тегов из Excel. Загружает Excel через RamPMLExcelReader, обрабатывает строки, создаёт элементы через Aveva.Engineering.PMLElementManager, проверяет EX-master register. Автор: Andrei Aitzhanov, 22-02-2024. |

### 1.2 `ew1/function/`

| # | Файл | Тип | Категория | Описание |
|---|------|-----|-----------|----------|
| 2 | `mlpGetDescLabel.pmlfnc` | .pmlfnc | Utilities | Получает DESC для элемента через `var !elementDesc DESC of $!element`. 6 строк. |
| 3 | `ramGetBackRef.pmlfnc` | .pmlfnc | Utilities | Получает back-reference атрибут элемента. 7 строк. |

### 1.3 `jackdow/` (root — пользовательские макросы)

| # | Файл | Тип | Категория | Описание |
|---|------|-----|-----------|----------|
| 4 | `JDE_data-import.pmlmac` | .pmlmac | Data Import | **Актуальная версия.** Макрос импорта данных из xlsx. Хардкодный путь к `C:\Users\ADZV\OneDrive...2026-06-01\_avevaImport_01062026.xlsx`. Использует `createObjectsFromExcelSheet()`. |
| 5 | `JDE_data-import-DK-NEUWDSTA515.pmlmac` | .pmlmac | Data Import | **Дубликат #1.** Идентичен по структуре. Хардкодный путь к `...EIS\_avevaImport_31032025.xlsx`, Sheet4. Различие: другое имя файла Excel и имя листа (Sheet4 vs Sheet1). EX-паттерн: `*ex-data-extractor.xlsx` vs `*ex_data_extractor.xlsx`. |
| 6 | `JDE_data-import_KTKNGR.pmlmac` | .pmlmac | Data Import | **Дубликат #2.** Хардкодный путь к `C:\Users\KTKNGR\OneDrive...`. Рабочий станция другого пользователя. Содержит 3 закомментированных варианта fileName. EX-паттерн: `*ex_data_extractor.xlsx`. |

### 1.4 `jackdow/_publish/functions/`

| # | Файл | Тип | Категория | Описание |
|---|------|-----|-----------|----------|
| 7 | `jacCheckForceUpdate.pmlfnc` | .pmlfnc | Tag Management | Проверяет, нужно ли принудительно обновлять атрибут. Использует ramTagManagement и ramValueConverter. |
| 8 | `jacDeleteUnnamed.pmlfnc` | .pmlfnc | Tag Management | Удаляет безымянные элементы (ISNAMED = false) из ENGITE. |
| 9 | `jacExportFullDataReport.pmlfnc` | .pmlfnc | Reporting | Экспорт полного отчёта по всем тегам в Excel. Сбор системных атрибутов + UDA, запись через JacReportExtractor. |
| 10 | `jacExportLinks.pmlfnc` | .pmlfnc | Reporting | Экспорт ссылок тег-документ (doc links). **Незавершённый** — содержит отладочный код (`!eleRef` вместо `!tagRef`). |
| 11 | `jacExportRDLDataReport.pmlfnc` | .pmlfnc | Reporting | Экспорт RDL-отчёта: ShellClass→ClassGroup фильтрация, маппинг атрибутов, извлечение данных в Excel. Очень длинный (~350 строк). |
| 12 | `jacExportRDLDataReportMatrix.pmlfnc` | .pmlfnc | Reporting | Матричный экспорт RDL-отчёта. Подобен #11, но с additional features: pivot, reorder columns, alias, error report. |
| 13 | `jacNameRegExValidatorTTY.pmlfnc` | .pmlfnc | Utilities / Tag Management | Валидация имён тегов по regex-паттернам. Обновляет атрибуты `:RAMREGEXCORRECTNESS` и `:RAMREGEXMATCHINGPATTERN`. Автор: Karthik N, 29-11-2023. |

### 1.5 `jackdow/_publish/objects/`

| # | Файл | Тип | Категория | Описание |
|---|------|-----|-----------|----------|
| 14 | `jacEISDeliveryManager.pmlobj` | .pmlobj | EIS | Управление экспортом EIS-репортов. Читает конфигурацию из Excel, поддерживает DBView, pivot, column reorder, PML function execution. |
| 15 | `ramTagManagement.pmlobj` | .pmlobj | Tag Management | **Ядро системы.** Управляет обновлением атрибутов элементов: проверка доступности, валидация LOV, конвертация типов, создание/удаление/реклассификация элементов. |
| 16 | `ramCommonLogger.pmlobj` | .pmlobj | Utilities | Централизованный логгер. Накапливает лог-записи, экспортирует в Excel/текст. Используется почти всеми объектами. |
| 17 | `ramFileWriterClass.pmlobj` | .pmlobj | Utilities | Утилита записи данных в Excel (.xls) и текст (.txt) файлы. |
| 18 | `ramExcelReaderClass.pmlobj` | .pmlobj | Data Import | Обёртка над RamAEPMLExcelReader (.NET DLL). Предоставляет удобные методы для загрузки, поиска и извлечения данных из Excel. |
| 19 | `ramValueConverter.pmlobj` | .pmlobj | Utilities | Конвертация значений между типами (STRING↔DBREF↔REAL↔ARRAY↔DATETIME). Форматирование юнитов и дат. |

### 1.6 `jackdow/_publish/forms/`

| # | Файл | Тип | Категория | Описание |
|---|------|-----|-----------|----------|
| 20 | `jacEISDeliveryForm.pmlfrm` | .pmlfrm | EIS / Forms | UI-форма для EIS Delivery. Список отчётов, preview grid, экспорт XLSX/CSV, интеграция с jacEISDeliveryManager. |
| 21 | `ramCommonLoggerForm.pmlfrm` | .pmlfrm | Utilities / Forms | UI-форма логгера. Отображение логов в grid, экспорт в Excel, очистка. Dock right. |

---

## 2. Группы дубликатов

### Группа 1: `JDE_data-import.pmlmac` (3 файла)

| Файл | Статус | Отличия |
|------|--------|---------|
| `JDE_data-import.pmlmac` | **Actual** | 最新路径 (2026-06-01), EX-паттерн `*ex_data_extractor.xlsx`, Sheet1, forceUpdate=true, $P [$!issueSize] ISSUES |
| `JDE_data-import-DK-NEUWDSTA515.pmlmac` | **Duplicate / Deprecated** | Путь ADZV, дата 2025-03-31, Sheet4, EX-паттерн `*ex-data-extractor.xlsx`, нет `$P [size] ISSUES` |
| `JDE_data-import_KTKNGR.pmlmac` | **Duplicate / Deprecated** | Путь KTKNGR, дата 2025-12-05, Sheet1, EX-паттерн `*ex_data_extractor.xlsx`, $P [size] ISSUES |

**Вывод:** Все три файла — это одна и та же логика с разными хардкодными путями к файлам данных. Суффикс `-DK-NEUWDSTA515` — код рабочей станции. Суффикс `_KTKNGR` — имя пользователя. Актуальная версия — `JDE_data-import.pmlmac` (самый свежий путь, 2026-06-01).

**Рекомендация:** Удалить дубликаты. Макрос должен принимать путь к файлу Excel как параметр, а не быть хардкодным.

### Группа 2: `jacExportRDLDataReport` vs `jacExportRDLDataReportMatrix` (2 файла)

| Файл | Статус | Отличия |
|------|--------|---------|
| `jacExportRDLDataReport.pmlfnc` | **Actual** | Базовая версия RDL-экспорта |
| `jacExportRDLDataReportMatrix.pmlfnc` | **Actual (enhanced)** | Расширенная: matrix format, pivot, column reorder, alias, common attributes, error report |

**Вывод:** Не дубликаты, а эволюция одной функции. Matrix-версия — расширенная.

---

## 3. Внешние зависимости (import / using namespace)

Следующие сущности загружаются через `import` / `using namespace`, но **не найдены как .pmlobj/.pmlfnc в docs/codebase/**:

| Имя | Тип | Используется в |
|-----|-----|-----------------|
| `Aveva.Engineering.PMLElementManager` | .NET DLL | createObjectsFromExcelSheet, ramTagManagement |
| `RamPMLExcelReader` / `RamAEPMLExcelReader` | .NET DLL | createObjectsFromExcelSheet, ramExcelReaderClass |
| `GridControl` | .NET DLL / PML | jacEISDeliveryForm, ramCommonLoggerForm, ramFileWriterClass |
| `PMLFileBrowser` | PML import | ramFileWriterClass, jacEISDeliveryForm |
| `RamAETagValidator` | .NET DLL | jacNameRegExValidatorTTY |
| `JacReportExtractor` | .NET DLL | jacExportFullDataReport, jacExportRDLDataReport*, jacEISDeliveryManager |
| `RamAEUpdateElement` | .NET DLL | ramTagManagement (CREATEELEMENT, DELETEELEMENT, RECLASSIFYELEMENT, UPDATEATTRIBUTE) |
| `Aveva.Core.Presentation` | .NET DLL | ramCommonLoggerForm, jacEISDeliveryForm |
| `NETGRIDCONTROL` | PML object | ramCommonLoggerForm, jacEISDeliveryForm |
| `NETDATASOURCE` | PML object | ramCommonLoggerForm, jacEISDeliveryForm, ramFileWriterClass |

Эти зависимости являются либо .NET-сборками (DLL), либо системными PML-объектами AVEVA. Они **не являются частью PML-исходников** и не требуют реорганизации, но должны быть задокументированы.

---

## 4. Функциональная классификация

### 4.1 Tag Management
| Файл | Подгруппа | Статус |
|------|-----------|--------|
| `createObjectsFromExcelSheet.pmlfnc` | Tag Create/Update | Actual (legacy, нуждается в рефакторинге) |
| `jackdow/_publish/functions/jacCheckForceUpdate.pmlfnc` | Tag Update Logic | Actual |
| `jackdow/_publish/functions/jacDeleteUnnamed.pmlfnc` | Tag Cleanup | Actual |
| `jackdow/_publish/objects/ramTagManagement.pmlobj` | Tag Management Core | Actual (библиотечный объект) |

### 4.2 Data Import/Export
| Файл | Подгруппа | Статус |
|------|-----------|--------|
| `jackdow/JDE_data-import.pmlmac` | Excel → AVEVA Import | Actual |
| `jackdow/JDE_data-import-DK-NEUWDSTA515.pmlmac` | Excel → AVEVA Import | **Duplicate** (deprecated) |
| `jackdow/JDE_data-import_KTKNGR.pmlmac` | Excel → AVEVA Import | **Duplicate** (deprecated) |
| `jackdow/_publish/objects/ramExcelReaderClass.pmlobj` | Excel Reader Wrapper | Actual (библиотечный объект) |

### 4.3 Reporting
| Файл | Подгруппа | Статус |
|------|-----------|--------|
| `jackdow/_publish/functions/jacExportFullDataReport.pmlfnc` | Full Data Export | Actual |
| `jackdow/_publish/functions/jacExportLinks.pmlfnc` | Doc Links Export | Actual (незавершён) |
| `jackdow/_publish/functions/jacExportRDLDataReport.pmlfnc` | RDL Report Export | Actual |
| `jackdow/_publish/functions/jacExportRDLDataReportMatrix.pmlfnc` | RDL Report Matrix | Actual (enhanced) |

### 4.4 EIS (EIS Data Delivery)
| Файл | Подгруппа | Статус |
|------|-----------|--------|
| `jackdow/_publish/objects/jacEISDeliveryManager.pmlobj` | EIS Report Manager | Actual (библиотечный объект) |
| `jackdow/_publish/forms/jacEISDeliveryForm.pmlfrm` | EIS UI Form | Actual |

### 4.5 Loop Management
**Не найдены PML-файлы в docs/codebase.** Context.md упоминает объект `LoopData`, но файл не обнаружен. Вероятно, не был скопирован в docs, либо находится под другим именем.

### 4.6 Equipment/3D
**Не найдены PML-файлы в docs/codebase.** Context.md не упоминает pipe-data, equipment-naming, или 3d-transfer файлы.

### 4.7 Utilities
| Файл | Подгруппа | Статус |
|------|-----------|--------|
| `ew1/function/mlpGetDescLabel.pmlfnc` | Element Description | Actual (микро-утилита) |
| `ew1/function/ramGetBackRef.pmlfnc` | Back Reference | Actual (микро-утилита) |
| `jackdow/_publish/functions/jacNameRegExValidatorTTY.pmlfnc` | Name Validation | Actual |
| `jackdow/_publish/objects/ramCommonLogger.pmlobj` | Logging | Actual (библиотечный объект) |
| `jackdow/_publish/objects/ramFileWriterClass.pmlobj` | File Writing | Actual (библиотечный объект) |
| `jackdow/_publish/objects/ramValueConverter.pmlobj` | Type Conversion | Actual (библиотечный объект) |

### 4.8 Forms (UI)
| Файл | Подгруппа | Статус |
|------|-----------|--------|
| `jackdow/_publish/forms/jacEISDeliveryForm.pmlfrm` | EIS Delivery UI | Actual |
| `jackdow/_publish/forms/ramCommonLoggerForm.pmlfrm` | Logger UI | Actual |

---

## 5. Файлы, упомянутые в context.md, но НЕ найденные в docs/codebase

| Имя (из context.md) | Вероятная причина отсутствия |
|---------------------|------------------------------|
| `LoopData.pmlobj` | Не скопирован в docs/codebase, либо находится в архиве/temp с другим именем |
| `TagManagementTmp.pmlobj` | Legacy-версия ramTagManagement, заменена |
| `ramImportExcel*.pmlobj` / `.pmlfrm` | Возможно, не скопированы; или заменены макросом JDE_data-import + createObjectsFromExcelSheet |
| `EBE_full_tag_export.pmlmac` | Не найден в jackdow/; возможно в run-macro/ или не скопирован |
| Различные файлы с суффиксами `-2`, `-3`, `_LEIR`, `old_`, `.bak` | Могут существовать в архивных подкаталогах jackdow/archive/ или jackdow/temp/, но не обнаружены |

---

## 6. НЕ-PML артефакты

Следующие типы файлов упоминаются или логически должны присутствовать как технический мусор в контексте PML-кодовой базы:

| Тип | Что представляет | Статус |
|-----|-------------------|--------|
| `.dll` (RamPMLExcelReader, RamAEUpdateElement, JacReportExtractor, RamAETagValidator, Aveva.Engineering) | .NET сборки, загружаемые через `import` | **Внешние зависимости** — не часть исходников, но критичны для работы |
| `.xlsx` (EISConfiguration.xlsx, _avevaImport_*.xlsx) | Конфигурационные и входные данные | **Технический мусор для codebase docs** — данные, не код |
| `.py`, `.bat`, `.cs` | Строительные/вспомогательные скрипты | Не найдены в docs/codebase, но упомянуты в AGENTS.md как исключения для коммита |
| `.csv` | Экспортируемые данные | Технический мусор |
| `.db` | Базы данных AVEVA | Технический мусор |

---

## 7. Архитектурные наблюдения

### 7.1 Слои зависимостей
```
[Forms]                    →  [Objects]              →  [Functions]        →  [External]
jacEISDeliveryForm      →      jacEISDeliveryManager  →                      .NET DLLs
ramCommonLoggerForm     →      ramCommonLogger
                               ramTagManagement    →   jacCheckForceUpdate
                               ramExcelReaderClass  →   createObjectsFromExcelSheet
                               ramFileWriterClass
                               ramValueConverter
[Macros]
JDE_data-import         →      TAGMANAGEMENTTMP (?)  →   createObjectsFromExcelSheet  →  .NET DLLs
```

### 7.2 Ключевые проблемы
1. **Хардкодные пути в макросах** — `JDE_data-import.pmlmac` содержит абсолютные OneDrive пути. Это делает макрос неработоспособным на других машинах без редактирования.
2. **TAGMANAGEMENTTMP** — объект, используемый в макросах (`PML RELOAD OBJECT TAGMANAGEMENTTMP`), не найден. Вероятно, это устаревшая версия `ramTagManagement`.
3. **jacExportLinks.pmlfnc** — содержит баг (`!eleRef` вместо `!tagRef`), функция незавершена.
4. **Отсутствие формальных макросов** — нет макросов для jacEISDeliveryForm, jacExportFullDataReport и др. — только функции. Пользователи, вероятно, вызывают их через `$m` или из меню AVEVA.
5. **ew1/ изолирован** — функции ew1 не зависят от jackdow-кода и наоборот. Это отдельный проект/клиент.

---

## 8. Рекомендуемая структура реорганизации

```
shared/
  pmlfnc/
    createObjectsFromExcelSheet.pmlfnc
    displayProgress.pmlfnc              (если существует как отдельный файл)
  pmlobj/
    ramTagManagement.pmlobj
    ramCommonLogger.pmlobj
    ramFileWriterClass.pmlobj
    ramExcelReaderClass.pmlobj
    ramValueConverter.pmlobj
    jacEISDeliveryManager.pmlobj
  pmlfrm/
    ramCommonLoggerForm.pmlfrm

clients/
  jackdow/
    pmlmac/
      JDE_data-import.pmlmac            (рефакторинг: параметризировать путь)
    pmlfnc/
      jacCheckForceUpdate.pmlfnc
      jacDeleteUnnamed.pmlfnc
      jacExportFullDataReport.pmlfnc
      jacExportLinks.pmlfnc              (исправить баг, дописать)
      jacExportRDLDataReport.pmlfnc
      jacExportRDLDataReportMatrix.pmlfnc
      jacNameRegExValidatorTTY.pmlfnc
    pmlfrm/
      jacEISDeliveryForm.pmlfrm
  ew1/
    pmlfnc/
      mlpGetDescLabel.pmlfnc
      ramGetBackRef.pmlfnc
```

---

## Gaps

1. **Неполный перечень файлов.** Инструмент не позволяет листить директории, поэтому файлы в `jackdow/archive/`, `jackdow/temp/`, `jackdow/run-macro/`, `jackdow/routine-macro/` не найдены. Необходимо получить полный `dir /s /b *.pmlfnc *.pmlmac *.pmlobj *.pmlfrm` от пользователя или через shell-команду.
2. **LoopData и TagManagementTmp** — объекты не найдены; возможно, находятся в каталогах, которые не удалось обойти.
3. **EBE_full_tag_export.pmlmac** — макрос не найден. Возможно, его не существует в данной копии codebase.
4. **.NET DLL зависимости** — не исследовано, где физически находятся сборки RamPMLExcelReader, RamAEUpdateElement, JacReportExtractor, RamAETagValidator.
5. **jacExportLinks.pmlfnc** — содержит очевидный баг (`!eleRef` вместо `!tagRef`), но без полного проекта не ясно, как именно он должен работать.

## Supervisor coordination

Нет — исследование завершено, отчёт готов к передаче.
