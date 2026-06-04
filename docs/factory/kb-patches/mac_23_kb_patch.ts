// KB patch generated from mac_23 analysis
// Adds KB entries for patterns found in JDE_exData_import.pmlmac but missing from KB

export const kbEntries = [
  {
    id: "cb_mac_23_reload_object",
    title: "PML RELOAD OBJECT — перезагрузка PML-объекта",
    category: "commands",
    subcategory: "pml-reload",
    principle: "PML RELOAD OBJECT <name> перезагружает уже загруженный PML-объект, обновляя его определение из исходного файла.",
    rule: "Используйте PML RELOAD OBJECT когда объект был изменён и требуется обновление без перезапуска сессии.",
    syntax: "PML RELOAD OBJECT <ObjectName>",
    exampleCanonical: "-- Перезагрузка объекта TAGMANAGEMENTTMP\nPML RELOAD OBJECT TAGMANAGEMENTTMP\n-- Аналогично для любого другого PML-объекта\nPML RELOAD OBJECT MyFormObject",
    exampleAntipattern: "-- НЕ: PML RELOAD OBJECT с несуществующим именем\nPML RELOAD OBJECT NonExistentObject\n-- Это вызовет ошибку времени выполнения",
    pitfalls: [
      "Объект должен быть предварительно загружен (через import или ранее определённый).",
      "Перезагрузка уничтожает текущие экземпляры объекта.",
      "Не путать с PML REHASH ALL (перезагружает все)."
    ],
    sourcedoc: "AVEVA PML Customization — Control Logic section",
    sourcecodebase: "JDE_exData_import.pmlmac"
  },
  {
    id: "cb_mac_23_createObjectsFromExcelSheet",
    title: "!!createObjectsFromExcelSheet — глобальная функция импорта из Excel",
    category: "dotnetinterop",
    subcategory: "excel-import",
    principle: "!!createObjectsFromExcelSheet — глобальная PML-функция для чтения данных из Excel-таблицы и возврата ARRAY строк.",
    rule: "Используйте !!createObjectsFromExcelSheet когда необходимо загрузить данные из Excel-листа в PML-массив для дальнейшей обработки.",
    syntax: "!!createObjectsFromExcelSheet(!fileName IS STRING, !sheetName IS STRING, !hasHeader IS BOOLEAN, !columns IS ARRAY, !strict IS BOOLEAN, !trim IS BOOLEAN, !skipEmpty IS BOOLEAN) → ARRAY",
    exampleCanonical: "-- Чтение Excel-файла с указанными колонками\n!fileName = |C:\\data\\tags.xlsx|\n!columns = ARRAY()\n!columns.Append(|Tag No|)\n!columns.Append(|Description|)\n!data = !!createObjectsFromExcelSheet(!fileName, |Tags|, true, !columns, false, true, true)\nif (!data.size() gt 0) then\n  -- обработка данных\nendif",
    exampleAntipattern: "-- НЕ: передача пустого имени файла\n!data = !!createObjectsFromExcelSheet(||, |Sheet|, true, ARRAY(), false, false, false)\n-- Это приведёт к ошибке",
    pitfalls: [
      "Функция требует установленного .NET/Excel COM-связывания.",
      "Путь к файлу должен быть абсолютным.",
      "Если !columns не указан, используются все колонки листа.",
      "Функция возвращает ARRAY; каждый элемент — ARRAY строк (строка Excel)."
    ],
    sourcedoc: "AVEVA PML Functions — Global functions",
    sourcecodebase: "JDE_exData_import.pmlmac"
  }
];
