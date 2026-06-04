# KB v3 Analysis — Factory Gap-Report Deep Dive

**Generated:** 2026-06-04
**Gap reports analyzed:** 84 files (47 mac, 12 obj, 18 fnc, 7 frm)
**Current KB entries in `src/knowledge/pml-kb/`:** 4 (практически пуста)
**Factory-generated kb-patches:** 79 files, ~41 entries (suggestedId)

---

## 2.1 Общая статистика

| Тип | Кол-во | avg_gap | max_gap | min_gap | patch_kb | manual_review | skip |
|-----|--------|---------|---------|---------|----------|---------------|------|
| mac | 47     | 0.450   | 0.850   | 0.000   | 43       | 1             | 1    |
| obj | 12     | 0.550   | 0.950   | 0.120   | 9        | 1             | 0    |
| fnc | 18     | 0.774   | 0.930   | 0.580   | 16       | 1             | 0    |
| frm | 7      | 0.630   | 0.950   | 0.150   | 6        | 0             | 0    |
| **ALL** | **84** | **0.549** | **0.950** | **0.000** | **74** | **3** | **1** |

**Ключевые наблюдения:**
- Функции (fnc) имеют наивысший средний gap (0.774) — KB практически не покрывает function-паттерны
- 88% файлов требуют `patch_kb` — это подтверждает критическую пустоту KB
- Объекты и формы имеют max_gap 0.95 — отдельные файлы практически не покрыты

## 2.2 Топ-10 файлов с наибольшим gap score

| # | fileId | gap | action | Top-2 dimensions |
|---|--------|-----|--------|-----------------|
| 1 | frm_04 | 0.950 | patch_kb | D6_dependencies=0.85, D5_logic=0.80 |
| 2 | frm_05 | 0.950 | patch_kb | D6_dependencies=0.85, D5_logic=0.80 |
| 3 | frm_07 | 0.950 | patch_kb | D6_dependencies=0.85, D5_logic=0.80 |
| 4 | obj_10 | 0.950 | patch_kb | D6_dependencies=0.85, D5_logic=0.80 |
| 5 | obj_11 | 0.950 | patch_kb | D6_dependencies=0.85, D5_logic=0.80 |
| 6 | fnc_17 | 0.930 | patch_kb | D6_dependencies=0.85, D5_logic=0.80 |
| 7 | frm_06 | 0.910 | patch_kb | D6_dependencies=0.85, D5_logic=0.80 |
| 8 | fnc_06 | 0.880 | patch_kb | D6_dependencies=0.85, D5_logic=0.80 |
| 9 | fnc_07 | 0.880 | patch_kb | D6_dependencies=0.85, D5_logic=0.80 |
| 10 | fnc_01 | 0.860 | patch_kb | D6_dependencies=0.85, D5_logic=0.80 |

**Паттерн:** D6 (dependencies) и D5 (logic) — стабильно наихудшие dimensions. KB не описывает межмодульные зависимости и логические паттерны.

## 2.3 Профиль dimensions (avg по всем файлам)

| Dimension | Avg Score | N files | Ранг |
|-----------|-----------|---------|------|
| D6_dependencies | **0.684** | 73 | 🔴 1 (наихудший) |
| D5_logic | **0.663** | 73 | 🔴 2 |
| D3_structure | **0.635** | 66 | 🟡 3 |
| D2_patterns | **0.610** | 77 | 🟡 4 |
| D4_naming | **0.518** | 66 | 🟢 5 |
| D1_syntax | **0.475** | 78 | 🟢 6 (наилучший) |

**Вывод:** KB лучше всего покрывает базовый синтаксис (D1), но критически слаба в зависимостях (D6), логике (D5) и структуре (D3).

## 2.4 D7 — Анализ рекомендованных KB entries

- **Всего рекомендовано:** 449 newEntriesNeeded
- **Структурированных:** 154 (с category/id/title)
- **Неструктурированных:** 295 (текстовые описания)

**Топ-15 категорий по частоте:**

| Категория | Count |
|-----------|-------|
| objects | 22 |
| macros | 12 |
| errorhandling | 11 |
| pdmsinteraction | 8 |
| datatypes | 8 |
| controlflow | 7 |
| dotnetinterop | 6 |
| forms | 5 |
| ui | 5 |
| typeconversion | 4 |
| engineering_tags | 4 |
| datetime | 3 |
| operators | 3 |
| attributes | 3 |

---

## 3.1 Паттерны gaps — кластеризация по типу

### MAC (47 файлов, 173 gap-описания)
1. **DO/ENDDO loop patterns** (12x) — итерация по массивам, `do !x indices`, `do !x values`
2. **ARRAY methods** (7x) — append, size, split, clear, evaluate
3. **HANDLE/ENDHANDLE** (7x) — error handling в контексте макросов
4. **NETGRIDCONTROL** (6x) — Excel I/O через .NET grid
5. **Global variables (!!)** (6x) — !!ramCommonLogger, !!displayProgress

### OBJ (12 файлов, 65 gap-описаний)
1. **DO loop** (4x) — итерация внутри методов
2. **FILE object** (3x) — exists(), readFile(), writeFile()
3. **COLLECT ALL** (2x) — PML1 collection в методах
4. **HANDLE/ELSEHANDLE** (2x) — специфичные коды ошибок
5. **SYSCOM** (2x) — вызов внешних команд

### FNC (18 файлов, 148 gap-описаний)
1. **DO loop** (28x) — доминирующий паттерн, функции интенсивно итерируют
2. **Global functions (!!)** (17x) — `!!functionName()` вызовы
3. **FILE object** (15x) — работа с файлами внутри функций
4. **ATTRIBUTE object** (14x) — метаданные атрибутов (.hash(), .type())
5. **!!ramCommonLogger** (11x) — логирование с undefined() guard

### FRM (7 файлов, 62 gap-описания)
1. **DO loop** (8x) — итерация при заполнении виджетов
2. **HANDLE** (4x) — error handling в callbacks
3. **Global forms (!!)** (4x) — show !!formName
4. **ARRAY** (4x) — подготовка данных для grid
5. **FILE** (4x) — работа с файлами из форм

---

## 3.2 Системные провалы KB v2

### ПРОВАЛ 1: ПУСТАЯ RUNTIME KB 🔴
Текущая KB в `src/knowledge/pml-kb/` содержит **ВСЕГО 4 entries**. 18 category-файлов существуют, но пусты. Это корневая причина высоких gap-scores: reviewer не может найти ничего в KB, потому что KB не существует.

### ПРОВАЛ 2: ОТСУТСТВИЕ ПАТТЕРНОВ ИТЕРАЦИИ (D5_logic) 🔴
DO/ENDDO — самый частый паттерн во всех типах файлов (28x в fnc, 12x в mac, 8x в frm), но KB не описывает:
- `do !x indices !array` vs `do !x values !array` vs `do !x from 1 to N`
- Вложенные циклы с BREAK/SKIP
- Итерация по COLLECTION results

### ПРОВАЛ 3: .NET INTEGRATION (NETGRIDCONTROL/NETDATASOURCE) 🔴
20+ упоминаний NETGRIDCONTROL в gaps. Это КЛЮЧЕВОЙ паттерн production codebase (Excel I/O), но KB имеет только 1 entry в dotnetinterop.

### ПРОВАЛ 4: ОТСУТСТВИЕ DEPENDENCY GRAPH (D6_dependencies) 🔴
D6 = 0.684 (наихудший). KB не описывает:
- import/using namespace зависимости
- Объект A владеет объектом B (member injection)
- Функция вызывает функцию (!!fnc1 → !!fnc2)
- Макрос загружает объект (PML RELOAD OBJECT)

### ПРОВАЛ 5: ATTRIBUTE INTROSPECTION 🟡
47 упоминаний "attribute" в gaps. KB не описывает:
- object ATTRIBUTE() — hash(), type(), name(), category()
- VAR !data ATTDEF — PML1 metadata query
- Dynamic attribute access: !ref.attribute(!dynamicName)

### ПРОВАЛ 6: COLLECTION/EXPRESSION OBJECTS 🟡
KB не описывает PML2 OOP-подход к запросам:
- object COLLECTION() + .type() + .filter(EXPRESSION) + .results()
- Разница между PML1 VAR COLL ALL и PML2 COLLECTION

### ПРОВАЛ 7: FILE OBJECT LIFECYCLE 🟡
15+ упоминаний FILE в gaps (особенно в fnc). KB не описывает:
- object FILE(!path) — exists(), readFile(), writeFile('APPEND', !array)
- Паттерн: проверка exists() → создание → запись → закрытие

---

## 3.3 Топ-20 KB entry кандидатов

| # | Приоритет | Тип | Title | freq | cross-type | Источники |
|---|-----------|-----|-------|------|-----------|-----------|
| 1 | CRITICAL | pattern | DO loop iteration variants | 52 | mac+obj+fnc+frm | ALL types |
| 2 | CRITICAL | pattern | HANDLE ANY/ENDHANDLE with error codes | 60 | mac+obj+fnc+frm | ALL types |
| 3 | CRITICAL | pattern | NETGRIDCONTROL Excel I/O | 20 | mac+frm | mac_08,frm_01,frm_02 |
| 4 | CRITICAL | pattern | NETDATASOURCE data binding | 19 | mac+frm | mac_08,frm_01,frm_03 |
| 5 | CRITICAL | pattern | ARRAY methods (append/size/split/clear) | 37 | ALL | ALL types |
| 6 | CRITICAL | pattern | DBREF validation (badref/unset) | 23 | obj+fnc | obj_07,fnc_01 |
| 7 | HIGH | pattern | object ATTRIBUTE introspection | 47 | obj+fnc | obj_08,fnc_04 |
| 8 | HIGH | pattern | BLOCK+EVALUATE batch compute | 28 | mac+fnc | mac_20,fnc_04 |
| 9 | HIGH | pattern | object EXPRESSION dynamic filter | 15 | fnc | fnc_04,fnc_06 |
| 10 | HIGH | pattern | import/using namespace .NET | 11 | mac+obj+frm | mac_08,obj_06 |
| 11 | HIGH | pattern | undefined() guard for globals | 13 | fnc+frm | fnc_01,frm_01 |
| 12 | HIGH | pattern | PML RELOAD OBJECT command | 5 | mac | mac_01,mac_02,mac_41 |
| 13 | HIGH | pattern | MATCHWILD string matching | 9 | mac+obj | mac_20,obj_07 |
| 14 | HIGH | pattern | FILE object (exists/read/write) | 15 | obj+fnc+frm | obj_08,fnc_01 |
| 15 | HIGH | pattern | COLLECTION + EXPRESSION query | 9 | fnc | fnc_04,fnc_06 |
| 16 | MEDIUM | pattern | STRING methods (replace/trim/split) | 10+5+5 | ALL | ALL types |
| 17 | MEDIUM | pattern | !!FMSYS progress bar | 4 | mac+obj | mac_09,obj_07 |
| 18 | MEDIUM | pattern | ONERROR GOLABEL /Error | 3 | mac | mac_09,mac_36 |
| 19 | MEDIUM | pattern | SYSCOM external commands | 4 | mac+obj | mac_36,obj_07 |
| 20 | MEDIUM | pattern | DATETIME object methods | 5 | mac | mac_09,mac_36 |
