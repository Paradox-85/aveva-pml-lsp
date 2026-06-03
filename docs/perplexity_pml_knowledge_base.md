# PML Knowledge Base — MCP Server Enrichment Guide
## AVEVA PML: Patterns, Rules & Best Practices
### Полный справочник для MCP Knowledge Server

> **Основа:** Официальные руководства TM-1401 Rev 3.0, TM-1402 Rev 1.0, Справочник PML + анализ реального codebase (Ramboll Jackdaw/EIS проекты).
> Файлы проекта: `ramValueConverter`, `ramCommonLogger`, `ramExcelReaderClass`, `ramImportExcelProcessor` и 50+ макросов/функций.

---

# ЧАСТЬ 1 — ФАЙЛОВАЯ СТРУКТУРА И ЕДИНИЦЫ КОДА

## 1.1 Правило «Один файл — одна единица»

| Расширение | Тип | Глобальная переменная | Загрузка |
|---|---|---|---|
| `.pmlmac` | Макрос | — | `$m path/file.pmlmac` |
| `.pmlfnc` | Функция/Процедура | `!!имяФункции` | автоматически через PMLLIB |
| `.pmlobj` | Объект | `OBJECT TYPENAME` | автоматически через PMLLIB |
| `.pmlfrm` | Форма | `!!имяФормы` | автоматически через PMLLIB |

**Паттерн из codebase:** каждый `.pmlobj` начинается с заголовочного комментария по шаблону:

```pml
------------------------------------------------------------------------
--
-- File:        RAMVALUECONVERTER
-- Description: Object to convert value to required format
--
------------------------------------------------------------------------
define object RAMVALUECONVERTER
  member .memberName  is TYPE
endobject
```

## 1.2 Импорт .NET сборок — ОБЯЗАТЕЛЬНЫЙ ПАТТЕРН

Каждый файл, использующий .NET-объекты, начинается с блока `import` + `handle any`:

```pml
-- ПАТТЕРН ИЗ CODEBASE: defensive import — никогда не вызывает ошибку если dll недоступна
import 'GridControl'
handle any
endhandle

import 'RamAEPMLExcelReader'
handle any
endhandle

Import 'pmlfilebrowser'
handle any
endhandle

using namespace 'Aveva.Core.Presentation'
using namespace 'Aveva.Engineering.Tags'
```

**Правила:**
- `import` + `handle any / endhandle` — всегда парой, иначе ошибка загрузки обрушит весь файл
- `using namespace` объявляется ПОСЛЕ всех `import` блоков
- Если namespace нужен только в одном методе — объявляй локально внутри метода

## 1.3 PMLLIB — путь поиска

```pml
-- Проверить текущие пути
q var !!pml.getPathName

-- Перерегистрировать файлы после создания нового
PML REHASH
PML REHASH ALL     -- все пути в PMLLIB
```

---

# ЧАСТЬ 2 — ОБЪЕКТЫ (`.pmlobj`)

## 2.1 Структура определения объекта

```pml
define object MYOBJECTNAME
  -- члены: всегда со строчной точки
  member .stringMember   is STRING
  member .realMember     is REAL
  member .boolMember     is BOOLEAN
  member .dbrefMember    is DBREF
  member .arrayMember    is ARRAY
  member .nestedObject   is OTHEROBJECTTYPE   -- объект как член
  member .dateField      is DATETIME
  member .formatField    is FORMAT
endobject
```

## 2.2 Конструктор и инициализация

**Паттерн из `ramValueConverter.pmlobj`** — конструктор всегда вызывает init-методы:

```pml
-- Конструктор без аргументов
define method .MYOBJECTNAME()
  !this.clearData()
  !this.clearFormat()
endmethod

-- Метод очистки данных (отдельно от форматирования!)
define method .clearData()
  !this.isError     = false
  !this.logElement  = object STRING()    -- НЕ просто '', а новый объект
  !this.logAttribute = object STRING()
endmethod

-- Метод очистки формата
define method .clearFormat()
  !this.isFormatApplied   = false
  !this.realFormat        = object FORMAT()
  !this.dateFormat        = object DATEFORMAT('')
endmethod
```

**Ключевые правила:**
- Инициализация члена через `object TYPE()` — создаёт типизированный пустой объект
- Разделяй `clearData()` и `clearFormat()` — вызываются в разных ситуациях
- Никогда не инициализируй `ARRAY` как `= ARRAY()` без `object` — используй `= object ARRAY()`

## 2.3 Перегрузка методов (Method Overloading)

PML поддерживает несколько методов с одинаковым именем, но разными сигнатурами. Паттерн из `ramCommonLogger.pmlobj`:

```pml
-- Вариант 1: две строки — автоматически уровень 2
define method .addLogDetails(!toolName is STRING, !detail is STRING)
  !this.addLogDetails(!toolName, !detail, 2)   -- делегируем к варианту 3
endmethod

-- Вариант 2: строка + split
define method .addLogDetails(!toolName is STRING, !detail is STRING, !splitChar is STRING)
  !this.addLogDetails(!toolName, !detail, !splitChar, 2)
endmethod

-- Вариант 3: toolName + elementName + attribute + detail
define method .addLogDetails(!toolName is STRING, !elementName is STRING, $
                              !attribute is STRING, !detail is STRING)
  !this.addLogDetails(!toolName, !elementName, !attribute, !detail, 2)
endmethod

-- Вариант 4: полный — с массивом и уровнем severity
define method .addLogDetails(!toolName is STRING, !details is ARRAY, !severityLevel is REAL)
  !finalLog = object ARRAY()
  !finalLog.Append(!severityLevel)
  !finalLog.Append(!toolName)
  !finalLog.AppendArray(!details)
  !this.logDataList.append(!finalLog)
endmethod
```

**Правило:** все «короткие» варианты делегируют к «длинному» — единственное место с логикой.

## 2.4 Методы с возвратом vs. без возврата

```pml
-- Функция (возвращает значение)
define method .getStatus() is BOOLEAN
  return !this.isError
endmethod

-- Процедура (без возврата — NO RESULT)
define method .clearData()
  !this.isError = false
endmethod

-- Функция с параметрами
define method .convertValue(!value is ANY, !conversionType is STRING) is ANY
  !result = object $!conversionType()
  -- ... логика ...
  return !result
endmethod
```

## 2.5 Проверка глобального объекта перед использованием

**Паттерн из `ramValueConverter.pmlobj` / `addErrorData()`:**

```pml
define method .addErrorData(!errorData is STRING)
  -- Lazy initialization глобального логгера
  if(undefined(!!ramCommonLogger)) then
    !!ramCommonLogger = object RAMCOMMONLOGGER()
  endif
  !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorData)
endmethod
```

**Паттерн проверки:**
```pml
if(defined(!!myGlobalObject)) then
  !!myGlobalObject.doSomething()
endif

if(undefined(!!myGlobalObject)) then
  !!myGlobalObject = object MYOBJECTTYPE()
endif
```

## 2.6 Жизненный цикл объекта

```pml
-- Создание (вызывает конструктор)
!item = object RAMVALUECONVERTER()

-- Вызов метода
!result = !item.convertValue('123', 'REAL')

-- Проверка состояния
if(!item.isError()) then
  -- обработка ошибки
endif

-- Получить тип объекта как строку
!typeName = !item.objecttype()      -- вернёт 'RAMVALUECONVERTER'

-- Удалить переменную
!item.delete

-- Перезагрузить определение (после редактирования файла)
PML RELOAD OBJECT RAMVALUECONVERTER

-- Зарегистрировать новый файл
PML REHASH ALL
```

---

# ЧАСТЬ 3 — ФОРМЫ (`.pmlfrm`)

## 3.1 Минимальный скелет формы

**Паттерн из `ramImportExcelProcessor.pmlfrm`:**

```pml
-- Блок импортов — ПЕРЕД setup form
import 'GridControl'
handle any
endhandle
Import 'pmlfilebrowser'
handle any
endhandle
using namespace 'Aveva.Core.Presentation'

setup form !!myFormName dialog resizable

  !this.formTitle = 'Заголовок формы'

  -- Bar-меню (если нужно)
  bar
  exit

  -- Гаджеты с позиционированием
  frame .frMain  anchor all  at xmin+1 ymin+0.5  width 60 height 10
    container .coMain NOBOX PMLNETControl 'Content' dock fill
  exit

  button .buOK      |OK|      anchor r+b  at xmax form-size  ymax form-size  WIDTH 8
  button .buCancel  |Cancel|  anchor r+b  at xmin            ymin            WIDTH 8
  text   .teInput   |Label|   anchor l+r+b  tagwidth 10  at xmin ymax+1  width 40  is STRING

  -- Хранилище данных формы (не гаджеты!)
  member .meConfig     is RAMIMPORTEXCELCONFIGLOADER
  member .meDataLoader is RAMIMPORTEXCELDATALOADER
  member .isLoaded     is BOOLEAN
  member .headings     is ARRAY

exit

-- Конструктор (имя = имя формы)
define method .myFormName()
  -- Назначение callbacks — В КОНСТРУКТОРЕ, не в setup!
  !this.initCall               = |!this.init()|
  !this.buOK.callback          = |!this.onOK()|
  !this.buCancel.callback      = |!this.onCancel()|
  !this.teInput.callback       = |!this.onInputChange()|

  -- Настройка bar-меню
  !bar = !this.bar
  !bar.add('Logger', 'logger')
  !control = !this.newMenu('logger')
  !control.add('callback', 'Show Logger...', 'show !!ramCommonLoggerForm')
  !control.add('callback', 'Clear Log',      '!this.clearLog()')

  -- Инициализация членов
  !this.isLoaded = false
  !this.meConfig = object RAMIMPORTEXCELCONFIGLOADER()
endmethod
```

## 3.2 Lifecycle Callbacks — 7 ключевых событий

```pml
-- В конструкторе:
!this.initCall        = |!this.init()|          -- каждый раз при show
!this.firstShownCall  = |!this.firstShown()|    -- только первый показ
!this.okCall          = |!this.onOK()|          -- кнопки с OK
!this.cancelCall      = |!this.onCancel()|      -- кнопки с CANCEL
!this.quitCall        = |!this.onQuit()|        -- кнопка X
!this.killingCall     = |!this.onKill()|        -- при unload/reload

-- Соответствующие методы:
define method .init()
  -- Инициализация значений при каждом открытии
  !this.teInput.val = ''
endmethod

define method .firstShown()
  -- Дорогостоящие операции — только при первом открытии
  !this.loadData()
endmethod
```

## 3.3 Встроенный .NET Grid Control

**Паттерн из `ramImportExcelProcessor.pmlfrm`:**

```pml
-- В setup form — контейнер для Grid:
frame .frData anchor all at xmin+1 ymin+0.5 width 80 height 15
  container .coData NOBOX PMLNETControl 'Data Grid' dock fill
exit

-- В members:
member .gridData  is NETGRIDCONTROL

-- В конструкторе — инициализация:
using namespace 'Aveva.Core.Presentation'
!this.gridData                    = object NETGRIDCONTROL()
!this.coData.control              = !this.gridData.handle()
!this.gridData.columnExcelFilter(false)
!this.gridData.outlookGroupStyle(false)

-- Заполнение данными:
define method .refreshGrid()
  !this.gridData.clearRows()
  !headings = object ARRAY()
  !headings.append('Column 1')
  !headings.append('Column 2')
  !this.gridData.setColumns(!headings)

  do !row values !this.meDataLoader.dataRows
    !rowData = object ARRAY()
    !rowData.append(!row[1])
    !rowData.append(!row[2])
    !this.gridData.addRow(!rowData)
  enddo
endmethod
```

## 3.4 Позиционирование гаджетов — ключевые паттерны

```pml
-- Относительное позиционирование:
button .buNext  |Next|  anchor r+b  at xmax.buPrev+1  ymin.buPrev  WIDTH 8
text   .teField |Field| anchor l+r  tagwidth 10  at xmin ymax.frHeader+1  width 40

-- Привязка (anchor) — обязательно для resizable форм:
-- anchor ALL     — растягивается во все стороны
-- anchor l+r+b   — горизонтально + прибит к низу
-- anchor r+t     — кнопки в правом верхнем углу
-- anchor r+b     — кнопки в правом нижнем углу

-- Позиционирование кнопок ОК/Отмена снизу-справа:
button .buOK     |OK|      anchor r+b  at xmax form-size  ymax form-size  WIDTH 8
button .buCancel |Cancel|  anchor r+b  at xmin            ymin            WIDTH 8
```

## 3.5 Управление формами

```pml
show !!myForm          -- загрузить и показать
loadform !!myForm      -- загрузить без показа
!!myForm.show          -- показать уже загруженную
!!myForm.hide          -- скрыть
q var !!myForm.shown   -- TRUE/FALSE

PML RELOAD FORM !!myForm   -- перезагрузить после изменений
PML REHASH ALL              -- зарегистрировать новые файлы
```

---

# ЧАСТЬ 4 — ФУНКЦИИ И МАКРОСЫ

## 4.1 Функция с возвратом значения (`.pmlfnc`)

```pml
-- ПАТТЕРН: сигнатура функции
define function !!funcName(!arg1 is STRING, !arg2 is REAL) is BOOLEAN
  -- тело
  return !result
endfunction
```

## 4.2 Макрос — паттерн из реального codebase

**Из `EIS_data_export.pmlmac`:** макрос — точка входа, оркестрирует вызовы функций и объектов:

```pml
-- Заголовок: путь запуска + описание
-- Run path: $m "C:\path\to\macro.pmlmac"
-- Description: Export tag data to Excel
-- Author: Name
-- Date: DD-MM-YYYY

-- 1. Импорт .NET (с защитой)
import 'Aveva.Engineering.Tags.Pml'
handle any
endhandle
using namespace 'Aveva.Core.Presentation'
using namespace 'Aveva.Engineering.Tags'

-- 2. Инициализация переменных + datetime для имён файлов
!dt     = OBJECT DATETIME()
!year   = !dt.year()
!month  = !dt.month().string('I2')   -- двузначный формат
!date   = !dt.date().string('I2')
!hour   = !dt.hour().string('I2')
!minute = !dt.minute().string('I2')

-- 3. Строка пути с вставкой даты
!filePath = |$!pathName\_history\export-$!<year>-$!<month>-$!<date>_$!<hour>.xlsx|

-- 4. Основная логика — вызов функций
!!myExportFunction(!filePath, !filter, !tagFilter)

-- 5. После экспорта — копирование как "актуального" файла
SYSCOM |copy /y "$!<filePath>" "$!<filePathOrigin>"|

-- 6. Обработка ошибок в конце
LABEL /Error
handle any
  !logFile = |$!<pathName>\errors-$!<year>-$!<month>-$!<date>.xlsx|
  !!ramCommonLogger.writeErrorDataToExcel(!logFile, false)
  SAVEWORK
  UNCLAIM ALL
endhandle
```

## 4.3 Синтаксис вставки переменных в строки

```pml
-- Два способа:
-- 1. Pipe-синтаксис (простые имена без пробелов):
!path = |C:\export\$!year-$!month.xlsx|

-- 2. Angle bracket синтаксис (для выражений и сложных имён):
!path = |C:\export\$!<year>-$!<month>.xlsx|
!path = |C:\export\$!<dt.year()>-$!<dt.month()>.xlsx|

-- Экранирование literaly pipe:
!filter = |name neq 'VOID'|
```

---

# ЧАСТЬ 5 — ПРЕОБРАЗОВАНИЕ ТИПОВ

## 5.1 Центральный паттерн — `convertValue()` из `ramValueConverter`

```pml
-- Универсальный конвертер — паттерн из реального кода:
define method .convertValue(!value is ANY, !conversionType is STRING) is ANY

  !result = object $!conversionType()   -- динамическое создание объекта по типу

  if(!conversionType.EQNoCase('DBREF') AND !value.objecttype().EQNoCase('STRING')) then
    !result = !this.convertStringToDbref(!value)

  elseif(!conversionType.EQNoCase('DATETIME') AND !value.objecttype().EQNoCase('STRING')) then
    -- Парсинг даты из строки вида DD/MM/YYYY или DD.MM.YYYY или DD-MM-YYYY
    !specialCharacters = SPLIT('.,-,/,\, ', ',')
    do !char values !specialCharacters
      skip if(!value.occurs(!char).neq(2))   -- ищем разделитель который встречается ровно 2 раза
      !parts = !value.split(!char)
      !datetime = object DATETIME(!parts[3].real(), !parts[2].real(), !parts[1].real())
      handle ANY
        !this.isError = true
      elsehandle None
        !result = !datetime
      endhandle
      break
    enddo

  elseif(!conversionType.EQNoCase('STRING')) then
    !result = !value.string()

  else
    -- Для REAL, BOOLEAN и других — вызов метода с именем типа
    !result = !value.$!conversionType()
    handle ANY
      !this.isError = true
    endhandle
  endif

  return !result

endmethod
```

## 5.2 STRING → DBREF с валидацией

**Паттерн из `ramValueConverter.convertStringToDbref()`:**

```pml
define method .convertStringToDbref(!elementName is STRING) is DBREF

  !elementRefe = object DBREF()
  !finalName   = !this.convertStringToValidDBString(!elementName)

  if(!finalName.set()) then
    !elementRefe = !finalName.dbref()
  endif

  return !elementRefe

endmethod

-- Вспомогательный: нормализация имени перед конвертацией
define method .convertStringToValidDBString(!elementName is STRING) is STRING

  !finalName = object STRING()
  !name      = !elementName.trim()

  !leadChar  = !name.subString(1, 1)
  !hasSpace  = !name.occurs(' ').gt(0)

  -- Добавляем слэш если нет и нет пробелов (не EXPRESSION-тип)
  if(!leadChar neq '/' AND !leadChar neq '=' AND !hasSpace.not()) then
    !name = '/' + !name
  endif

  !elementRefe = object DBREF(!name)
  handle ANY
    !this.isError = true
    !this.addErrorData('Unable to convert $!elementName to DBREF')
  elsehandle None
    !finalName = !elementRefe.Name
  endhandle

  return !finalName

endmethod
```

## 5.3 STRING → REAL

```pml
-- Прямое преобразование
!strVal = '56.7'
!result = !strVal.real()          -- возвращает REAL

-- С защитой от ошибки
!result = object REAL()
handle ANY
  !isError = true
elsehandle None
  !result = !strVal.real()
endhandle

-- REAL → STRING с форматом
!num = 3.14159
!s = !num.string()                -- '3.14' (2 dp по умолчанию)
!s = !num.string(4)               -- '3.1416'
!s = !num.string('I2')            -- '03' — integer, 2 знака с ведущим нулём (для дат!)
!s = !num.string(!!integerFmt)    -- через FORMAT объект
```

## 5.4 DATETIME — создание и форматирование

**Паттерн из `EIS_data_export.pmlmac`:**

```pml
-- Получить текущее время
!dt = OBJECT DATETIME()
!year   = !dt.year()
!month  = !dt.month().string('I2')   -- '01', '12'
!date   = !dt.date().string('I2')
!hour   = !dt.hour().string('I2')
!minute = !dt.minute().string('I2')

-- Создать из компонентов (год, месяц, день)
!dt = object DATETIME(2024, 12, 31)
!dt = object DATETIME(2024, 12, 31, 14, 30, 00)

-- Создать из строки DD/MM/YYYY — парсинг вручную:
!parts    = '31/12/2024'.split('/')
!dt       = object DATETIME(!parts[3].real(), !parts[2].real(), !parts[1].real())

-- Форматирование через DATEFORMAT:
!fmt         = object DATEFORMAT('D M Y')
!fmt.month   = 'FULL'        -- January / BRIEF = Jan / INTEGER = 1
!fmt.year    = 4             -- 4-значный год
!dateString  = !fmt.string(!dt)

-- Форматирование даты файла:
!file  = object FILE('C:\path\file.xlsx')
!dt    = !file.DTM           -- DATETIME последнего изменения
```

## 5.5 Маппинг DB-типов → PML-типов

**Паттерн из `ramValueConverter.convertDBTypeToType()`:**

```pml
-- Официальный маппинг AE/E3D типов атрибутов:
if(!dbType INSET('INTEGER', 'REAL')) then
  !type = 'REAL'
elseif(!dbType INSET('WORD', 'TEXT')) then
  !type = 'STRING'
elseif(!dbType INSET('LOGICAL')) then
  !type = 'BOOLEAN'
elseif(!dbType INSET('REFERENCE')) then
  !type = 'DBREF'
endif
```

---

# ЧАСТЬ 6 — МАССИВЫ

## 6.1 Создание и заполнение

```pml
-- Правильное создание пустого массива (паттерн из codebase):
!arr = object ARRAY()          -- PML2 стиль
!arr = ARRAY()                 -- PML1 стиль (тоже работает)

-- Заполнение через Append (предпочтительно):
!arr.Append('элемент')
!arr.Append(!dbref)
!arr.AppendArray(!anotherArray)  -- добавить все элементы другого массива

-- Заполнение по индексу:
!arr|1| = 'первый'
!arr[1] = 'первый'             -- оба варианта эквивалентны

-- Многомерный (матрица):
!arr[1][1] = 'ячейка'
!commonAttributes[1][1] = ':RAMTagOwner'
!commonAttributes[1][2] = 'Tag Owner'
```

## 6.2 Итерация — три паттерна

```pml
-- ПАТТЕРН 1: DO VALUES — элемент напрямую
do !item values !myArray
  -- !item — это сам элемент (STRING, DBREF, и т.д.)
  q var !item.name
enddo

-- ПАТТЕРН 2: DO INDEX — номер итерации
do !i index !myArray
  -- !i — число 1, 2, 3...
  !item = !myArray[!i]          -- разыменование по номеру
enddo

-- ПАТТЕРН 3: DO FROM (числовой диапазон)
do !i from 1 to !myArray.size()
  !item = !myArray[!i]
enddo

-- ПАТТЕРН 4: итерация с прогрессом (паттерн из JDE_pipeData_export.pmlmac):
do !lineStr values !lines
  !rowIdx = !lines.findFirst(!lineStr)   -- текущий индекс
  !!displayProgress(!rowIdx, !lines.size())
  -- ... обработка ...
enddo
```

## 6.3 Ключевые методы массива

```pml
-- Размер
!n = !arr.size()

-- Поиск
!idx = !arr.findFirst('значение')      -- первый индекс или UNSET
!indices = !arr.find('значение')       -- ВСЕ индексы (ARRAY)

-- Удаление
!removed = !arr.remove(5)              -- удалить 5-й, вернуть его
!arr.removeLast
!arr.removeFirst
!arr.clear                             -- очистить содержимое

-- Сортировка
!arr.sort                              -- in-place по возрастанию
!sortedIdx = !arr.sortedIndices        -- массив индексов
!arr.reIndex(!sortedIdx)               -- применить порядок
!unique = !arr.sortUnique              -- новый массив уникальных отсортированных

-- Дубликаты
!arr.unique                            -- удалить дубликаты in-place
!result = !arrA.union(!arrB)           -- объединение без дубликатов

-- Evaluate с BLOCK — мощный паттерн из ramCommonLogger:
!sizes  = !logList.evaluate(object BLOCK(|!logList[!evalIndex].size()|))
!names  = !results.evaluate(object BLOCK(|!results[!evalIndex].flnn|))
!maxIdx = !sizes.sortUnique().MaxIndex()
```

## 6.4 Сортировка по атрибуту DBREF

```pml
-- Паттерн: параллельные массивы с reIndex
var !elements  COLLECT ALL EQUI FOR ZONE
var !names     EVALUATE NAME FOR ALL FROM !elements
var !zones     EVALUATE NAME OF ZONE FOR ALL FROM !elements

!sortedIdx = !names.sortedIndices      -- ключ сортировки
!elements.reIndex(!sortedIdx)          -- применяем к DBREF-массиву
!zones.reIndex(!sortedIdx)             -- и к связанным данным
```

---

# ЧАСТЬ 7 — ЦИКЛЫ И УПРАВЛЕНИЕ ПОТОКОМ

## 7.1 Виды циклов

```pml
-- Числовой: FROM TO BY
do !i from 1 to 10
enddo
do !i from 1 to 25 by 5       -- шаг 5
enddo
do !i from 10 to 1 by -1      -- обратный порядок
enddo

-- По элементам массива (PML2):
do !item values !myArray
enddo

-- По индексам массива:
do !i index !myArray
enddo

-- Бесконечный (с явным BREAK):
do !n
  break if(!n.gt(1000))
enddo
```

## 7.2 Управление потоком

```pml
-- Выход из цикла
BREAK
BREAK IF !условие

-- Пропустить итерацию (continue) — паттерн из реального кода:
skip if(!value.occurs(!char).neq(2))   -- из ramValueConverter

-- Метки и переходы (только для обработки ошибок)
LABEL /Error
GOLABEL /Error
GOLABEL /Error IF !isError
```

## 7.3 Прогресс-бар — паттерн из JDE_pipeData_export

```pml
-- Функция !!displayProgress (из macros codebase):
do !lineStr values !lines
  !rowIdx = !lines.findFirst(!lineStr)
  !!displayProgress(!rowIdx, !lines.size())
  -- ... обработка элемента ...
enddo

-- Через FMSYS:
!!FMSYS.setProgress(!current * 100 / !total)
IF !!FMSYS.interrupt THEN BREAK ENDIF    -- кнопка прерывания
!!FMSYS.setProgress 0                    -- сбросить по завершении
```

---

# ЧАСТЬ 8 — ОБРАБОТКА ОШИБОК

## 8.1 HANDLE — основная конструкция

```pml
-- Паттерн из ramValueConverter:
!result = object DBREF(!name)
handle ANY
  !this.isError = true
  !this.addErrorData('Unable to convert $!elementName to DBREF')
elsehandle None
  !finalName = !elementRefe.Name
endhandle

-- Числовые коды ошибок:
handle 41,8
  p 'Нужно быть на ZONE или ниже'
elsehandle 41,12
  p 'Имя уже занято'
elsehandle ANY
  p 'Другая ошибка: ' & !!error.text
elsehandle None
  p 'Успешно'
endhandle
```

## 8.2 Паттерн глобального логгера

**Из `EIS_data_export.pmlmac` и `ramCommonLogger.pmlobj`:**

```pml
-- Добавление в лог (из любого метода/функции):
if(undefined(!!ramCommonLogger)) then
  !!ramCommonLogger = object RAMCOMMONLOGGER()
endif
!!ramCommonLogger.addLogDetails('MyTool', 'Описание ошибки')

-- С уровнями severity:
-- 1 = INFO, 2 = WARNING, 3 = ERROR (конвенция из codebase)
!!ramCommonLogger.addLogDetails('MyTool', 'сообщение', 1)    -- INFO
!!ramCommonLogger.addLogDetails('MyTool', 'сообщение', 3)    -- ERROR

-- Запись лога в файл по завершении:
LABEL /Error
handle any
  !logFile = |$!pathName\log-$!year-$!month-$!date.xlsx|
  !!ramCommonLogger.writeErrorDataToExcel(!logFile, false)
  SAVEWORK
  UNCLAIM ALL
endhandle
```

## 8.3 Валидация DBREF

```pml
-- Всегда проверять перед обращением к атрибутам:
if(!myDbref.unset()) then
  -- переменная не была инициализирована
  return
endif
if(!myDbref.badRef()) then
  -- элемент удалён из базы
  return
endif
if(!myDbref.set()) then
  -- всё хорошо, можно работать
  !name = !myDbref.name
endif
```

---

# ЧАСТЬ 9 — .NET CALLABLE ОБЪЕКТЫ

## 9.1 Браузер файлов — PMLFILEBROWSER

**Паттерн из `ramExcelReaderClass.browseFile()`:**

```pml
-- Открытие файла:
using namespace 'Aveva.Core.Presentation'
!fileBrowser      = object PMLFILEBROWSER('OPEN')
!directory        = ''
!seedFile         = ''
!title            = 'File Browser - Open Dialogue'
!extensionString  = 'xlsx files (*.xlsx)|*.xlsx'
!fileBrowser.show(!directory, !seedFile, !title, false, !extensionString, 2)
!filename         = !fileBrowser.file()

-- Сохранение файла:
!fileBrowser      = object PMLFILEBROWSER('SAVE')
!extensionString  = 'xlsx files (*.xlsx)|*.xlsx'
!fileBrowser.show(!directory, !seedFile, !title, false, !extensionString, 2)
!filename         = !fileBrowser.file()

-- Проверка что файл выбран:
if(!filename.set() AND !filename.neq('')) then
  -- работа с файлом
endif
```

## 9.2 Excel Reader — RamAEPMLExcelReader

**Паттерн из `ramExcelReaderClass.pmlobj`:**

```pml
-- Импорт сборки:
import 'RamAEPMLExcelReader'
handle any
endhandle

-- Чтение всего файла:
using namespace 'RamAEPMLExcelReader'
!excelReader     = object RamPMLExcelReaderClass()
!excelTables     = !excelReader.ReadExcel(!excelFullPath)
-- Результат: ARRAY of [sheetName, ARRAY of rows]
-- Каждый row: ARRAY of ячеек

-- Чтение конкретного листа:
!excelData = !excelReader.ReadExcel(!excelFullPath, !sheetName)
-- Результат: ARRAY of rows (первая строка = заголовки)

-- Проверка ошибки после загрузки:
!error = !excelReader.error()
if(!error.set() AND !error.neq('')) then
  -- обработка ошибки загрузки
endif
```

## 9.3 Grid Control — NETGRIDCONTROL

**Паттерн из `ramImportExcelProcessor.pmlfrm`:**

```pml
-- В setup form:
container .coData NOBOX PMLNETControl 'Grid' dock fill

-- В constructor:
using namespace 'Aveva.Core.Presentation'
!this.gridData                    = object NETGRIDCONTROL()
!this.coData.control              = !this.gridData.handle()
!this.gridData.columnExcelFilter(false)
!this.gridData.outlookGroupStyle(false)
!this.gridData.selectionByRow(true)
!this.gridData.callback           = |!this.onGridSelection()|

-- Заполнение:
!this.gridData.clearRows()
!this.gridData.setColumns(!headings)   -- ARRAY заголовков
!this.gridData.addRow(!rowData)        -- ARRAY значений одной строки

-- Получение выделенного:
!selectedRow = !this.gridData.selectedRow()
!cellValue   = !this.gridData.selectedCell()
```

## 9.4 PMLTAGS — теги из AE Engineering

**Паттерн из `EIS_data_export.pmlmac`:**

```pml
import 'Aveva.Engineering.Tags.Pml'
handle any
endhandle
using namespace 'Aveva.Engineering.Tags'

!tags = object PMLTAGS()

-- Экспорт grid-набора в Excel:
var !grid collect all LSTDEF with (LSTNAM eq |my-dataset|)
if (!grid.size().eq(1)) then
  !gridRef = !grid.first().dbref()
  !gridRef.lstflt = !realUnset      -- сброс фильтра
  var !gridGroupName CATNAM of LSTGRP of $!gridRef
  !tags.exportasxls(!gridGroupName, '$!gridRef.LSTNAM', '$!filepath')
endif
```

## 9.5 MEASURE и UNIT — работа с единицами измерения

**Паттерн из `EIS_data_export.pmlmac`:**

```pml
-- Установить отображаемые единицы для типа измерения:
!AngularFrequencyDimension = object MEASURE('AngularFrequency')
!rpmUnit = object UNIT('rpm')
!AngularFrequencyDimension.setunits(!rpmUnit)
```

## 9.6 SYSCOM — вызов внешних программ

```pml
-- Синхронный (PDMS ждёт завершения):
SYSCOM |notepad.exe C:\file.txt|

-- Асинхронный (фоновый):
SYSCOM |copy /y "$!<srcPath>" "$!<dstPath>"|

-- Вызов bat-скрипта:
SYSCOM |call "C:\tools\sync-to-cloud.bat"|

-- Открыть файл в Excel:
SYSCOM |start excel.exe "$!<filePath>"|
```

---

# ЧАСТЬ 10 — КОЛЛЕКЦИИ И БАЗА ДАННЫХ

## 10.1 COLLECT (PML1) — паттерны из codebase

```pml
-- Из JDE_pipeData_export.pmlmac:
var !lines COLL ALL (PIPE) WITH $
  (matchwild(name of site, |*-MP*|) AND matchwild(dbname, |*-MP*|))

-- Стандартные формы:
var !elements COLLECT ALL EQUI FOR ZONE
var !docs     COLLECT ALL RDOC WITH (CATNAM eq |403-DOCUMENT|) FOR SITE
var !grid     COLLECT ALL LSTDEF WITH (LSTNAM eq |tag-dataset|)

-- Первый элемент:
!first = !grid.first().dbref()
```

## 10.2 COLLECTION Object (PML2)

```pml
!coll = object COLLECTION
!coll.type 'EQUI'
!coll.scope !!CE

!expr = object EXPRESSION('name of owner eq |ZONE-A|')
!coll.filter !expr

!results = !coll.results     -- ARRAY OF DBREF
```

## 10.3 EVALUATE — получение атрибутов массово

```pml
-- PML1 стиль:
var !names    EVALUATE NAME   FOR ALL FROM !elements
var !fullName EVALUATE FLNN   FOR ALL FROM !elements

-- PML2 через BLOCK:
!names  = !results.evaluate(object BLOCK(|!results[!evalIndex].name|))
!flnns  = !results.evaluate(object BLOCK(|!results[!evalIndex].flnn|))
!sizes  = !results.evaluate(object BLOCK(|!results[!evalIndex].size()|))

-- evalIndex — специальная переменная внутри BLOCK, автоматически итерируется
```

## 10.4 Обращение к атрибутам элемента

```pml
-- По известному имени:
!value = !element.attributeName
!value = !element.:UDAAttributeName    -- UDA через двоеточие

-- По строковому имени (динамически):
!attrName = ':RAM_NDTGROUP'
!value    = !element.attribute(!attrName)

-- Пример из JDE_pipeData_export:
!CircleWeldsVT = !line.:RAM_VISUALCIRC
!NDTGroup      = !line.:RAM_NDTGROUP
!RAMTAGOWNER   = !line.:RAMTagOwner

-- Переход по ссылке:
!pOrderName = !element.NAMN of :TagRefToPurchaseOrder
```

---

# ЧАСТЬ 11 — ИМЕНОВАНИЕ И СОГЛАШЕНИЯ

## 11.1 Конвенции именования (из codebase)

```
Объекты:        PascalCase / UPPERCASE  → RAMVALUECONVERTER, LoopData
Формы:          camelCase               → !!ramImportExcelProcessor
Методы:         camelCase               → .addLogDetails, .clearData
Члены объекта:  camelCase с точкой      → .logDataList, .isFormatApplied
Функции:        camelCase               → !!jacExportRDLDataReport
Макросы:        kebab-case с префиксом  → JDE_pipeData_export.pmlmac
Члены форм:     префикс по типу         → .buOK, .frMain, .teInput, .meConfig
```

## 11.2 Префиксы гаджетов (из codebase)

| Префикс | Тип гаджета |
|---|---|
| `.bu` | BUTTON |
| `.fr` | FRAME |
| `.te` | TEXT (input) |
| `.li` | LIST |
| `.op` | OPTION |
| `.co` | CONTAINER |
| `.pa` | PARAGRAPH |
| `.tp` | TEXTPANE |
| `.me` | MEMBER (данные формы) |
| `.gr` | GRID/TABLE |

## 11.3 Переменные

```pml
!localVar          -- локальная (только в функции/методе)
!!globalVar        -- глобальная (вся сессия PDMS)
-- Регистр НЕ важен для имён переменных: !MyVar == !myvar
-- Регистр ВАЖЕН для строковых сравнений!

-- Null-проверки:
if(!var.set()) then     -- переменная имеет значение
if(!var.unset()) then   -- переменная не инициализирована
if(defined(!!obj)) then -- глобальный объект определён
if(undefined(!!obj)) then
```

---

# ЧАСТЬ 12 — ПАТТЕРНЫ АРХИТЕКТУРЫ

## 12.1 Разделение ответственности (из codebase)

Проект Ramboll демонстрирует чёткое разделение:

```
ФОРМА (*.pmlfrm)         — UI + оркестрация
  └── CONFIG LOADER      — загрузка конфигурации из Excel
  └── DATA LOADER        — загрузка данных из Excel
  └── ELEMENT LOADER     — запись данных в базу AE/E3D
  └── LOGGER FORM        — отображение логов

ОБЪЕКТЫ (*.pmlobj)
  └── ramValueConverter  — преобразование типов
  └── ramCommonLogger    — централизованное логирование
  └── ramFileWriterClass — запись файлов
  └── ramExcelReaderClass— чтение Excel

ФУНКЦИИ (*.pmlfnc)
  └── jacExportRDLDataReport    — экспорт по шаблону RDL
  └── createObjectsFromExcelSheet — создание объектов из Excel

МАКРОСЫ (*.pmlmac)
  └── JDE_data-import     — точка входа для импорта
  └── EIS_data_export     — точка входа для экспорта
```

## 12.2 Паттерн «Loader Chain»

**Из `ramImportExcelProcessor.pmlfrm`:**

```pml
-- Форма хранит объекты-загрузчики как members:
member .meConfigDetails      is RAMIMPORTEXCELCONFIGLOADER
member .meExcelDataProcessor is RAMIMPORTEXCELDATALOADER
member .meExcelElementLoader is RAMIMPORTEXCELELEMENTLOADER

-- Последовательная загрузка с проверками:
define method .importData()
  -- Step 1: загрузить конфиг
  if(!this.meConfigDetails.isLoaded.not()) then
    !!alert.error 'Load configuration first'
    return
  endif
  -- Step 2: инициализировать загрузчик данных
  !this.meExcelDataProcessor.loadData(!this.teConfigFile.val)
  -- Step 3: запустить загрузку в базу
  !this.meExcelElementLoader.process(!this.meExcelDataProcessor)
endmethod
```

## 12.3 Паттерн обогащения данных перед экспортом

**Из `EIS_data_export.pmlmac` — маппинг "999999999" на "NA":**

```pml
-- Список паттернов замены в формате "искать;заменить":
!replaceData = object ARRAY()
!replaceData.append('999999999mm;NA')
!replaceData.append('999999999Pa.s;NA')
!replaceData.append('01/01/1990 00:00:00;NA')
!replaceData.append('-;NA')

-- Список "пустых" паттернов:
!emptyPatternString = |Unset unset UNSET|
!emptyPatternList   = !emptyPatternString.split()
!emptyPatternList.append(| |)    -- пробел
!emptyPatternList.append(||)     -- пустая строка

-- Передаются в функцию экспорта для нормализации
!!jacExportRDLDataReport(!filePath, !rdlFilter, !tagFilter, $
                          !emptyPatternList, !replaceData, !isDisplayEmpty)
```

---

# ЧАСТЬ 13 — УПРАВЛЕНИЕ СОСТОЯНИЕМ БАЗЫ

## 13.1 Изменение атрибутов с HANDLE

```pml
-- Паттерн безопасного изменения атрибута:
!element.attributeName = !newValue
handle ANY
  !!ramCommonLogger.addLogDetails('SetAttr', !!error.text, 3)
elsehandle None
  -- успешно
endhandle

-- После серии изменений:
SAVEWORK       -- сохранить изменения
UNCLAIM ALL    -- освободить элементы
```

## 13.2 Навигация по базе

```pml
-- Текущий элемент:
!!CE                          -- DBREF на текущий элемент
!!CE.name                     -- имя
!!CE.type                     -- тип

-- Переход к элементу:
NA !myDbref                   -- навигация (Navigate to)
CE !myDbref                   -- установить как текущий

-- Иерархия:
!parent  = !!CE.owner
!children = !!CE.members      -- прямые дочерние элементы

-- DBREF операции:
!ref.isValid()                -- проверка валидности
!ref.type                     -- тип элемента базы
!ref.flnn                     -- полное имя (full name)
!ref.namn                     -- имя без ведущего /
```

---

# ПРИЛОЖЕНИЕ А — БЫСТРЫЙ СПРАВОЧНИК МЕТОДОВ

## Строки (STRING)

```
.trim()              -- убрать пробелы
.length()            -- длина строки
.subString(from, n)  -- подстрока с позиции from, n символов
.split()             -- разбить по пробелам → ARRAY
.split('разделитель')-- разбить по символу
.occurs('str')       -- количество вхождений
.upcase / .lowcase   -- верхний/нижний регистр
.eq('str')           -- сравнение (case-sensitive)
.eqNocase('str')     -- сравнение (case-insensitive)
.neq('str')
.real()              -- → REAL
.dbref()             -- → DBREF
.set() / .unset()    -- проверка инициализации
.objecttype()        -- 'STRING'
```

## Числа (REAL)

```
.string()            -- → STRING (2 dp)
.string(n)           -- → STRING (n dp)
.string('I2')        -- → STRING integer 2 знака
.abs()               -- абсолютное значение
.power(n)            -- степень
.sqrt()              -- квадратный корень
.int()               -- целая часть
.eq / .neq / .lt / .gt / .leq / .geq  -- сравнения
```

## Массивы (ARRAY)

```
.size()              -- количество элементов
.Append(item)        -- добавить в конец
.AppendArray(arr)    -- добавить все из другого массива
.remove(idx)         -- удалить по индексу, вернуть элемент
.removeLast()        -- удалить последний, вернуть
.clear()             -- очистить
.findFirst(val)      -- индекс первого вхождения (или UNSET)
.find(val)           -- ARRAY всех индексов вхождений
.sort()              -- сортировать in-place
.sortedIndices()     -- ARRAY индексов сортировки
.reIndex(indices)    -- применить порядок индексов
.unique()            -- удалить дубликаты in-place
.sortUnique()        -- новый массив: уникальные+сортированные
.union(arr)          -- объединение без дубликатов
.evaluate(block)     -- применить BLOCK к каждому элементу
.MaxIndex()          -- индекс максимального элемента
```

## DBREF

```
.name                -- имя элемента с /
.namn                -- имя без ведущего /
.flnn                -- полное имя (full path)
.type                -- тип элемента
.set() / .unset()
.badRef()            -- ссылка на удалённый элемент
.isValid()           -- валидная ссылка
.attribute('name')   -- значение атрибута по имени строки
.owner               -- родительский элемент (DBREF)
.members             -- дочерние элементы
```

---

# ПРИЛОЖЕНИЕ Б — ПРОМПТ ДЛЯ ОБОГАЩЕНИЯ MCP СЕРВЕРА

## Инструкции по обновлению Knowledge Base

```
ЗАДАЧА: Обогатить knowledge base MCP сервера для PML LSP.

ИСТОЧНИКИ (по убыванию приоритета):
1. Официальная справка: TM-1401 Rev 3.0, TM-1402 Rev 1.0
2. Справочник PML (русский перевод)
3. Реальный codebase (Ramboll JDE/EIS проекты в /docs/codebase)

ДОБАВИТЬ В KNOWLEDGE BASE:

### Блок 1: Преобразование типов
- Паттерн convertValue() с динамическим $!TYPE синтаксом
- Парсинг дат из строк через split + перебор разделителей
- Маппинг DB-типов → PML-типов (INTEGER→REAL, WORD→STRING, REFERENCE→DBREF)
- Метод .string('I2') для двузначного форматирования чисел

### Блок 2: .NET интеграция
- PMLFILEBROWSER('OPEN') и PMLFILEBROWSER('SAVE') — полный паттерн
- RamPMLExcelReaderClass — чтение xlsx (структура: ARRAY[sheet][sheetName/data][row][cell])
- NETGRIDCONTROL — встраивание в форму через CONTAINER + PMLNETControl
- MEASURE + UNIT — управление единицами измерения
- Defensive import: import 'X' / handle any / endhandle — ОБЯЗАТЕЛЬНО

### Блок 3: Объекты
- Overloaded методы — паттерн делегирования к «полному» варианту
- clearData() vs clearFormat() — разделение инициализации
- addErrorData() — lazy init глобального логгера
- .objecttype() — получение типа объекта как строки

### Блок 4: Архитектурные паттерны
- Loader Chain: ConfigLoader → DataLoader → ElementLoader
- Централизованный логгер через !!ramCommonLogger (глобальный объект)
- Severity levels: 1=INFO, 2=WARNING, 3=ERROR
- Макрос как точка входа + LABEL /Error + handle any в конце
- Замена магических значений: 999999999xxx → 'NA', паттерн !replaceData

### Блок 5: Итерация с прогрессом
- !!displayProgress(!rowIdx, !totalSize) — стандартная функция прогресса
- Паттерн: do !item values !arr + !rowIdx = !arr.findFirst(!item) для индекса
- !!FMSYS.setProgress / !!FMSYS.interrupt — встроенный прогресс-бар

### Блок 6: Строки и даты в именах файлов
- OBJECT DATETIME() → .year() .month().string('I2') .date().string('I2')
- Pipe-синтаксис с angle brackets: |prefix-$!<year>-$!<month>-$!<date>_$!<hour>.xlsx|
- После экспорта: SYSCOM |copy /y "$!<srcPath>" "$!<dstPath>"|

ФОРМАТ ДЛЯ КАЖДОГО ПАТТЕРНА В MCP KB:
{
  "pattern_name": "строка",
  "category": "type_conversion|arrays|objects|forms|dotnet|loops|error_handling|db_access",
  "description": "что делает паттерн",
  "syntax": "PML код паттерна",
  "example": "реальный пример из codebase",
  "pitfalls": ["типичные ошибки"],
  "source": "TM-1401|TM-1402|codebase:filename"
}
```
