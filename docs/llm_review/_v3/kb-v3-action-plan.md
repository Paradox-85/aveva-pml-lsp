# KB v3 ACTION PLAN

Generated: 2026-06-04
Total gap reports analyzed: 84
Total new KB entries recommended: 449 (from D7)
Factory kb-patches available: 79 files, ~41 entries
Current KB entries: 4 (CRITICAL: KB is essentially empty)

---

## 🔴 CRITICAL — выполнить в первую очередь

Корневая причина: KB содержит 4 entries из требуемых ~100+. Все 18 category-файлов существуют но пусты. Нужно МАССОВОЕ заполнение.

### [ ] C1. MERGE factory kb-patches в src/knowledge/pml-kb/
    Файлы: все 79 файлов из docs/factory/kb-patches/*.ts
    Действие: извлечь ~41 entry из patches, нормализовать id/category, вставить в соответствующие category-файлы
    Скрипт: создать scripts/merge-patches.ts
    Ожидаемый результат: KB вырастет с 4 до ~45 entries

### [ ] C2. Заполнить пустые категории из claude KB v2 (101 entry)
    Источник: docs/claude_pml_knowledge_base.md (101 запись JSON)
    Действие: парсить JSON-блоки, конвертировать в KBEntry TypeScript, распределить по 18 категориям
    Скрипт: создать scripts/import-claude-kb.ts
    Файлы для обновления:
    - src/knowledge/pml-kb/datatypes.ts (+11 entries)
    - src/knowledge/pml-kb/controlflow.ts (+7 entries)
    - src/knowledge/pml-kb/errorhandling.ts (+7 entries)
    - src/knowledge/pml-kb/objects.ts (+8 entries)
    - src/knowledge/pml-kb/forms.ts (+13 entries)
    - src/knowledge/pml-kb/macros.ts (+8 entries)
    - src/knowledge/pml-kb/functions.ts (+5 entries)
    - src/knowledge/pml-kb/dotnetinterop.ts (+8 entries)
    - src/knowledge/pml-kb/pdmsinteraction.ts (+11 entries)
    - src/knowledge/pml-kb/namingconventions.ts (+5 entries)
    - src/knowledge/pml-kb/typeconversion.ts (+5 entries)
    - src/knowledge/pml-kb/logging.ts (+5 entries)
    - src/knowledge/pml-kb/architecturepatterns.ts (+8 entries)
    Ожидаемый результат: KB вырастет до ~145 entries (45 patches + 101 claude - дедупликация)

### [ ] C3. Добавить паттерны DO/ENDDO итерации
    Файл: src/knowledge/pml-kb/controlflow.ts
    Добавить entries: 3 (do_indices, do_values, do_from_to)
    Источники: mac_01-47 (12x), fnc_01-18 (28x), frm_01-07 (8x), obj_01-12 (4x)
    Паттерны:
    - `do !x indices !array` (индексная итерация)
    - `do !x values !array` (value-итерация)
    - `do !x from 1 to !n` / `do !x from 1 to !n by -1` (range loop)

### [ ] C4. Добавить NETGRIDCONTROL/NETDATASOURCE Excel I/O
    Файл: src/knowledge/pml-kb/dotnetinterop.ts
    Добавить entries: 3
    Источники: mac_08 (JDE_vendortag_import), frm_01 (ramImportExcelProcessor), frm_02 (rptoutput)
    Паттерны:
    - NETGRIDCONTROL creation + bindToDataSource
    - NETDATASOURCE('Grid Table', !path) для чтения
    - NETDATASOURCE('data', !headers, !data) + saveGridToExcel для записи

### [ ] C5. Добавить DBREF validation patterns
    Файл: src/knowledge/pml-kb/pdmsinteraction.ts
    Добавить entries: 2
    Источники: obj_07 (TagManagementTmp), obj_08 (ramImportExcelElementLoader), fnc_01 (createObjectsFromExcelSheet)
    Паттерны:
    - .badref() check before property access
    - .dbRef() inside handle any/endhandle

---

## 🟡 HIGH — выполнить во второй очереди

### [ ] H1. Добавить object ATTRIBUTE introspection
    Файл: src/knowledge/pml-kb/pdmsinteraction.ts
    Добавить entries: 2
    Источники: obj_08, fnc_04, obj_07 (TagManagementTmp.TryToSetValue)
    Паттерны:
    - object ATTRIBUTE(!name) → .hash(), .type(), .name()
    - VAR !data ATTDEF attName TYPE SIZE

### [ ] H2. Добавить BLOCK+EVALUATE batch compute
    Файл: src/knowledge/pml-kb/collections.ts
    Добавить entries: 2
    Источники: fnc_04 (jacUpdateClassDetails), obj_07 (TagManagementTmp)
    Паттерны:
    - object BLOCK('!array[!evalIndex].property')
    - !array.evaluate(!block) — PML map/select

### [ ] H3. Добавить COLLECTION+EXPRESSION PML2 query
    Файл: src/knowledge/pml-kb/collections.ts
    Добавить entries: 2
    Источники: fnc_04 (jacUpdateTagName), fnc_06 (jacDeleteUnnamed)
    Паттерны:
    - object COLLECTION() + .type() + .filter(EXPRESSION) + .results()
    - !!CollectAllFor() built-in wrapper

### [ ] H4. Добавить import/using namespace .NET
    Файл: src/knowledge/pml-kb/dotnetinterop.ts
    Добавить entries: 2
    Источники: mac_08, obj_06 (ramImportExcelElementLoader), frm_01 (jacEISDeliveryForm)
    Паттерны:
    - import 'Namespace' / handle any / endhandle (ОБЯЗАТЕЛЬНЫЙ guard)
    - using namespace 'Aveva.Core.Presentation'

### [ ] H5. Добавить undefined() guard pattern
    Файл: src/knowledge/pml-kb/errorhandling.ts
    Добавить entries: 1
    Источники: fnc_01, fnc_04, frm_01 (11+ упоминаний)
    Паттерн:
    - if(undefined(!!ramCommonLogger)) then !!ramCommonLogger = object RAMCOMMONLOGGER() endif

### [ ] H6. Добавить FILE object lifecycle
    Файл: src/knowledge/pml-kb/objects.ts
    Добавить entries: 2
    Источники: obj_08 (ramFileWriterClass), fnc_01, frm_01
    Паттерны:
    - object FILE(!path) → .exists() → .readFile() → .writeFile('APPEND', !array)
    - FILE для текстовых логов vs NETGRIDCONTROL для Excel

### [ ] H7. Добавить MATCHWILD string matching
    Файл: src/knowledge/pml-kb/datatypes.ts
    Добавить entries: 1
    Источники: mac_20, obj_07 (9 упоминаний)
    Паттерн: !string.Matchwild('*pattern*')

### [ ] H8. Добавить PML RELOAD OBJECT
    Файл: src/knowledge/pml-kb/syscom.ts
    Добавить entries: 1
    Источники: mac_01 (JDE_data-import), mac_02, mac_41, mac_47
    Паттерн: PML RELOAD OBJECT CLASSNAME — горячая перезагрузка без rehash all

---

## 🟢 MEDIUM — выполнить после HIGH

### [ ] M1. STRING advanced methods (replace/trim/split/occurs)
    Файл: src/knowledge/pml-kb/datatypes.ts, entries: 1

### [ ] M2. !!FMSYS progress bar
    Файл: src/knowledge/pml-kb/ui.ts, entries: 1

### [ ] M3. ONERROR GOLABEL pattern
    Файл: src/knowledge/pml-kb/macros.ts, entries: 1

### [ ] M4. SYSCOM external commands
    Файл: src/knowledge/pml-kb/syscom.ts, entries: 1

### [ ] M5. DATETIME object methods
    Файл: src/knowledge/pml-kb/datetime.ts, entries: 1

### [ ] M6. ARRAY advanced (Sort/SortUnique/Invert/SortedIndices)
    Файл: src/knowledge/pml-kb/arrays.ts, entries: 1

---

## ⚙️ ТЕХНИЧЕСКИЕ ЗАДАЧИ

### [ ] T1. Создать merge-script для kb-patches
    Файл: scripts/merge-patches.ts
    Действие: скрипт читает все docs/factory/kb-patches/*.ts, нормализует suggestedId→id, проверяет уникальность, записывает в src/knowledge/pml-kb/*.ts

### [ ] T2. Создать import-script для claude KB
    Файл: scripts/import-claude-kb.ts
    Действие: парсит JSON-блоки из docs/claude_pml_knowledge_base.md, конвертирует в KBEntry, дедуплицирует с patches

### [ ] T3. Запустить KB validation после merge
    Команда: npx vitest run tests/knowledge/kb-validation.test.ts
    Проверить: уникальность id, валидность categories, наличие required полей

### [ ] T4. Обновить docs/factory/logs/run-state.json
    Добавить поля kbV3AnalysisDate, totalNewEntries, etc.

### [ ] T5. Перезапустить factory benchmark (subset)
    Выбрать 10 файлов с наихудшим gap score (frm_04, frm_05, obj_10, obj_11, fnc_17...)
    Запустить reviewer повторно, замерить улучшение gap score

---

## 📊 ИТОГОВЫЕ МЕТРИКИ ПЛАНА

| Метрика | Значение |
|---------|----------|
| Новых KBEntry (top-20 ручных) | 20 |
| Entries из factory patches | ~41 |
| Entries из claude KB v2 | ~101 |
| **Итого entries после merge** | **~130 (после дедупликации)** |
| Новых категорий | 0 (все 18 уже созданы) |
| Расширяемых категорий | 18 (все) |
| Текущий avg gap score | 0.549 |
| **Ожидаемый avg gap score после v3** | **< 0.25** |
| CRITICAL задач | 5 |
| HIGH задач | 8 |
| MEDIUM задач | 6 |
| Технических задач | 5 |
