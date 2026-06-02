# План гармонизации PML кодовой базы

> Дата: 2026-06-02
> Статус: **✅ ВЫПОЛНЕНО и проверено** (2026-06-02)

## 1. Контекст

Кодовая база `docs/codebase/` содержит **97 PML файлов** (+ .bak) в двух проектах:
- `ew1/` — вспомогательный проект (4 файла)
- `jackdow/` — основной проект (93 файла)

Выявлено **11 групп дубликатов** и значительный объём устаревших/архивных файлов.

---

## 2. Выявленные проблемы

### 2.1 Точные дубликаты (одинаковый MD5)

| Файл 1 | Файл 2 | Хеш |
|--------|--------|-----|
| `./createObjectsFromExcelSheet.pmlfnc` | `./jackdow/functions/createObjectsFromExcelSheet.pmlfnc` | `2bf1f851` |

### 2.2 Версионные дубликаты (разные хеши, одна логика, разные хардкодные пути)

| Группа | Файлов | Актуальный | Удалить |
|--------|---------|------------|---------|
| **G1: createObjectsFromExcelSheet** | 4 | `./createObjectsFromExcelSheet.pmlfnc` (12 058 B) | `jackdow/functions/createObjectsFromExcelSheet.pmlfnc` (exact dup), `createObjectsFromExcelSheet-DK-NEUWDSTA515.pmlfnc` (5 172 B — урезанная версия), `createObjectsFromExcelSheet-DK-NEUWDSTA515-2.pmlfnc` (12 057 B — +1B diff) |
| **G2: JDE_data-import** | 5 | `jackdow/JDE_data-import.pmlmac` (1 989 B — самый свежий путь) | `JDE_data-import-DK-NEUWDSTA515.pmlmac`, `JDE_data-import-DK-NEUWDSTA515-2.pmlmac`, `JDE_data-import-DK-NEUWDSTA515-3.pmlmac`, `JDE_data-import_KTKNGR.pmlmac` |
| **G3: TagManagementTmp → ramTagManagement** | 7 | `_publish/objects/ramTagManagement.pmlobj` (43 285 B — финальная версия) | `TagManagementTmp.pmlobj`, `TagManagementTmp-DK-NEUWDSTA515.pmlobj`, `TagManagementTmp-DK-NEUWDSTA515-2.pmlobj`, `TagManagementTmp-DK-NEUWDSTA515-3.pmlobj`, `TagManagementTmp-DK-NEUWDSTA515-4.pmlobj`, `ramTagManagement.pmlobj.bak` |
| **G4: LoopData** | 2 | `jackdow/objects/LoopData.pmlobj` (25 870 B) | `LoopData-DK-NEUWDSTA515.pmlobj` (25 864 B — -6B diff) |
| **G5: EIS_data_update** | 2 | `jackdow/run-macro/EIS_data_update.pmlmac` (3 621 B) | `EIS_data_update-DK-NEUWDSTA515.pmlmac` (3 372 B) |
| **G6: JDE_vendortag_import** | 2 | `jackdow/JDE_vendortag_import.pmlmac` (8 570 B) | `JDE_vendortag_import_2.pmlmac` (8 369 B) |
| **G7: commPackage-reports** | 6 | `_publish/macro/JDE_commPackage-reports.pmlmac` | `_KTKNGR`, `_LEIR`, `_LEIR_KTKNGR`, + TempMacro-дубликаты |
| **G8: BI_tagRegister-export** | 4 | `_publish/macro/JDE_BI_tagRegister-export.pmlmac` | `_KTKNGR`, TempMacro-копии, `-DK-NEUWDSTA526` |
| **G9: routine-macro-run** | 3 | `_publish/macro/JDE_routine-macro-run.pmlmac` | `_KTKNGR`, TempMacro-копия |

### 2.3 .bak файлы (6 штук)

| Файл | Размер | Удалить? |
|------|--------|----------|
| `jacExportRDLDataReport.pmlfnc.bak` | 10 950 B | ✅ Да |
| `ramImportExcelDataLoader.pmlobj.bak` | 30 248 B | ✅ Да |
| `ramImportExcelElementLoader.pmlobj.bak` | 26 435 B | ✅ Да |
| `ramTagManagement.pmlobj.bak` | 43 168 B | ✅ Да |
| `ReportComparisionTool.py.bak` | 3 505 B | ✅ Да |

### 2.4 Устаревшие / архивные файлы

| Файл | Причина удаления |
|------|-----------------|
| `jackdow/archive/delta_tag_export-old.pmlmac` | Старый экспорт, заменён `JDE_delta_tag_export.pmlmac` |
| `jackdow/old_JDE_area_import.pmlmac` | Префикс `old_` |
| `jackdow/old_JDE_mdr_import.pmlmac` | Префикс `old_` |
| `jackdow/old_JDE_mdr_import-with-datetime.pmlmac` | Префикс `old_` |
| `jackdow/old_JDE_po_import.pmlmac` | Префикс `old_` |
| `jackdow/routine-macro/archive/instrument-cable-rename1.pmlmac` | 0 байт — пустой файл |
| `jackdow/routine-macro/archive/instrument-cable-rename.pmlmac` | Архив |
| `jackdow/routine-macro/archive/engitemap.pmlfrm` | Архив |
| `jackdow/routine-macro/archive/JDA-LOGIC-DELETE.mac` | Архив, не-PML расширение |
| `jackdow/routine-macro/archive/JDA-STRU-STATUS.mac` | Архив, не-PML расширение |
| `jackdow/routine-macro/archive/JDE-*.mac` (13 файлов) | Архив, .mac расширение |
| `jackdow/temp/data_recovery.pmlmac` | Временный каталог |
| `jackdow/temp/import att 1.xlsx` | Временный каталог, не-PML |
| `jackdow/_publish/TempMacro/` (5 файлов) | Временные макросы, дубликаты _publish/macro/ |

### 2.5 НЕ-PML артефакты для очистки

| Файл/каталог | Тип |
|-------------|-----|
| `jackdow/RDE_PML_code.xlsx` | Excel документация |
| `jackdow/_publish/dlls/` (9 .dll) | Бинарные зависимости |
| `jackdow/_publish/configurations/` (2 .xlsx) | Конфигурации |
| `jackdow/_publish/python - Report Comparision Tool/` | Python проект |
| `jackdow/_publish/Source code/` | .NET C# проект |
| `jackdow/routine-macro/archive/files/` (2 .xlsx) | Входные данные |
| `jackdow/templates/` (5 файлов) | Шаблоны данных |
| `jackdow/loops/tags.txt` | Текстовые данные |

---

## 3. Целевая структура

```
docs/codebase/
├── ew1/
│   ├── macros/
│   │   ├── EBA_full_tag_export.pmlmac
│   │   ├── EBE_assetRegister_import.pmlmac
│   │   ├── EBE_delta_tag_export.pmlmac
│   │   └── EBE_full_tag_export.pmlmac
│   └── functions/
│       ├── mlpGetDescLabel.pmlfnc
│       └── ramGetBackRef.pmlfnc
│
├── jackdow/
│   ├── macros/
│   │   ├── JDE_3D_items_extractor.pmlmac
│   │   ├── JDE_class-mapping-rename.pmlmac
│   │   ├── JDE_data-import.pmlmac
│   │   ├── JDE_dbView_creator.pmlmac
│   │   ├── JDE_dbView_extractor.pmlmac
│   │   ├── JDE_delta_tag_export.pmlmac
│   │   ├── JDE_exData_import.pmlmac
│   │   ├── JDE_getTagInfo.pmlmac
│   │   ├── JDE_leirvik_tag_export.pmlmac
│   │   ├── JDE_newtag_import.pmlmac
│   │   ├── JDE_outputMacro.pmlmac
│   │   ├── JDE_pipeData_export.pmlmac
│   │   ├── JDE_RDL-import.pmlmac
│   │   ├── JDE_rdl_tagProperties_export.pmlmac
│   │   ├── JDE_sp_update.pmlmac
│   │   ├── JDE_tag2doc_import.pmlmac
│   │   ├── JDE_tag2po_import.pmlmac
│   │   ├── JDE_tag2sece_import.pmlmac
│   │   ├── JDE_tagProperties_export.pmlmac
│   │   ├── JDE_tagProperties_export_with_RDL.pmlmac
│   │   ├── JDE_tagProperties_upload.pmlmac
│   │   ├── JDE_vendortag_import.pmlmac
│   │   ├── RAMBiReportExport.pmlmac
│   │   ├── alarm_refresh.pmlmac
│   │   ├── cable-area-update.pmlmac
│   │   ├── class-name-refresh.pmlmac
│   │   ├── EIS_data_export.pmlmac
│   │   ├── EIS_data_update.pmlmac
│   │   ├── equipment-name-refresh.pmlmac
│   │   ├── loop-create.pmlmac
│   │   ├── loop-data-update.pmlmac
│   │   ├── manual-valve-description.pmlmac
│   │   ├── pipe-3D-transfer.pmlmac
│   │   ├── pipeSupport-refresh.pmlmac
│   │   ├── tag-doc-cleanup.pmlmac
│   │   ├── unnamed-tag-delete.pmlmac
│   │   ├── TB_terminal_correction_macro.pmlmac
│   │   └── _publish/                          ← опубликованные макросы
│   │       ├── JDE_BI_tagRegister-export.pmlmac
│   │       ├── JDE_commPackage-reports.pmlmac
│   │       ├── JDE_fullDataProperties-export.pmlmac
│   │       ├── JDE_routine-macro-run.pmlmac
│   │       ├── JDE_vendorPackage-reports.pmlmac
│   │       └── manual-data-export.pmlmac
│   │
│   ├── functions/
│   │   ├── createObjectsFromExcelSheet.pmlfnc
│   │   ├── RAMBiReportExport.pmlfnc
│   │   └── _publish/
│   │       ├── jacCheckForceUpdate.pmlfnc
│   │       ├── jacDeleteUnnamed.pmlfnc
│   │       ├── jacExportFullDataReport.pmlfnc
│   │       ├── jacExportLinks.pmlfnc
│   │       ├── jacExportRDLDataReport.pmlfnc
│   │       ├── jacExportRDLDataReportMatrix.pmlfnc
│   │       ├── jacNameRegExValidatorTTY.pmlfnc
│   │       ├── jacPropagateParentData.pmlfnc
│   │       ├── jacRemoveDocumentDuplicate.pmlfnc
│   │       ├── jacUpdateClassDetails.pmlfnc
│   │       ├── jacUpdateEquipmentNumber.pmlfnc
│   │       ├── jacUpdatePatternToAttribute.pmlfnc
│   │       ├── jacUpdateTagName.pmlfnc
│   │       └── jacUpdateTagNameWithBore.pmlfnc
│   │
│   ├── objects/
│   │   ├── LoopData.pmlobj
│   │   ├── RAMTagMaturityData.pmlobj
│   │   └── _publish/
│   │       ├── jacEISDeliveryManager.pmlobj
│   │       ├── ramCommonLogger.pmlobj
│   │       ├── ramExcelReaderClass.pmlobj
│   │       ├── ramFileWriterClass.pmlobj
│   │       ├── ramTagManagement.pmlobj
│   │       ├── ramValueConverter.pmlobj
│   │       └── Import Tool/
│   │           ├── ramImportExcelConfigLoader.pmlobj
│   │           ├── ramImportExcelDataLoader.pmlobj
│   │           └── ramImportExcelElementLoader.pmlobj
│   │
│   ├── forms/
│   │   ├── jackimform.pmlfrm
│   │   ├── rptoutput.pmlfrm
│   │   └── _publish/
│   │       ├── jacEISDeliveryForm.pmlfrm
│   │       ├── ramCommonLoggerForm.pmlfrm
│   │       └── Import Tool/
│   │           ├── ramImportExcelProcessor.pmlfrm
│   │           ├── ramimportExcelReclassificationForm.pmlfrm
│   │           └── ramImportExcelValidationForm.pmlfrm
│   │
│   └── pml.index
│
└── README.md  ← обновлённый индексный файл
```

---

## 4. Операции (пошагово)

### Фаза 1: Удаление .bak файлов (5 файлов)
1. `jackdow/_publish/functions/jacExportRDLDataReport.pmlfnc.bak`
2. `jackdow/_publish/Import Tool/objects/ramImportExcelDataLoader.pmlobj.bak`
3. `jackdow/_publish/Import Tool/objects/ramImportExcelElementLoader.pmlobj.bak`
4. `jackdow/_publish/objects/ramTagManagement.pmlobj.bak`
5. `jackdow/_publish/python - Report Comparision Tool/ReportComparisionTool.py.bak`

### Фаза 2: Удаление точных дубликатов (1 файл)
1. `jackdow/functions/createObjectsFromExcelSheet.pmlfnc` (exact dup root)

### Фаза 3: Удаление версионных дубликатов (24 файла)

**G1:** `jackdow/functions/createObjectsFromExcelSheet-DK-NEUWDSTA515.pmlfnc`, `jackdow/functions/createObjectsFromExcelSheet-DK-NEUWDSTA515-2.pmlfnc`
**G2:** `jackdow/JDE_data-import-DK-NEUWDSTA515.pmlmac`, `JDE_data-import-DK-NEUWDSTA515-2.pmlmac`, `JDE_data-import-DK-NEUWDSTA515-3.pmlmac`, `JDE_data-import_KTKNGR.pmlmac`
**G3:** `jackdow/objects/TagManagementTmp.pmlobj`, `TagManagementTmp-DK-NEUWDSTA515.pmlobj`, `TagManagementTmp-DK-NEUWDSTA515-2.pmlobj`, `TagManagementTmp-DK-NEUWDSTA515-3.pmlobj`, `TagManagementTmp-DK-NEUWDSTA515-4.pmlobj`
**G4:** `jackdow/objects/LoopData-DK-NEUWDSTA515.pmlobj`
**G5:** `jackdow/run-macro/EIS_data_update-DK-NEUWDSTA515.pmlmac`
**G6:** `jackdow/JDE_vendortag_import_2.pmlmac`
**G7:** `_KTKNGR`, `_LEIR`, `_LEIR_KTKNGR` варианты (4 файла) + TempMacro-копии (2 файла)
**G8:** `_KTKNGR` вариант (1 файл) + TempMacro-копии (2 файла)
**G9:** `_KTKNGR` вариант (1 файл) + TempMacro-копия (1 файл)

### Фаза 4: Удаление устаревших/архивных файлов (20+ файлов)
- `jackdow/archive/` — весь каталог
- `jackdow/old_JDE_*.pmlmac` — 4 файла
- `jackdow/routine-macro/archive/` — весь каталог
- `jackdow/temp/` — весь каталог
- `jackdow/_publish/TempMacro/` — весь каталог

### Фаза 5: Удаление НЕ-PML артефактов
- `jackdow/RDE_PML_code.xlsx`
- `jackdow/_publish/dlls/` — каталог
- `jackdow/_publish/configurations/` — каталог
- `jackdow/_publish/python - Report Comparision Tool/` — каталог
- `jackdow/_publish/Source code/` — каталог
- `jackdow/routine-macro/archive/` — уже удалён в Фазе 4
- `jackdow/templates/` — каталог
- `jackdow/loops/tags.txt`
- `jackdow/project` (файл без расширения)

### Фаза 6: Реорганизация (перемещение файлов)
Переместить файлы в целевую структуру (см. раздел 3):
- `ew1/*.pmlmac` → `ew1/macros/`
- `jackdow/*.pmlmac` → `jackdow/macros/` (кроме _publish)
- `jackdow/run-macro/*.pmlmac` → `jackdow/macros/`
- `jackdow/routine-macro/*.pmlmac` → `jackdow/macros/`
- `jackdow/loops/*.pmlmac` → `jackdow/macros/`
- `jackdow/functions/*.pmlfnc` → `jackdow/functions/` (уже на месте)
- `jackdow/routine-macro/*.pmlfnc` → `jackdow/functions/`
- `jackdow/objects/*.pmlobj` → `jackdow/objects/` (уже на месте)
- `jackdow/forms/*.pmlfrm` → `jackdow/forms/` (уже на месте)
- `_publish` структуру обновить

### Фаза 7: Обновить pml.index
Обновить файл `jackdow/pml.index` чтобы отражать новую структуру.

---

## 5. Статистика

| Метрика | До | После |
|---------|-----|-------|
| PML файлов | 87 (+ 5 .bak) | ~47 |
| НЕ-PML файлов | ~40+ | 0 (в docs/codebase) |
| Уровней вложенности | до 5 | до 3 |
| Дубликатов | 24 | 0 |

---

## 6. Риски

1. **Потеря данных:** Удаляемые файлы — дубликаты и устаревшие версии. Риск минимален, т.к. git хранит историю.
2. **Хардкодные пути в макросах:** Актуальные версии `JDE_data-import.pmlmac` содержат хардкодный OneDrive путь. Это не исправляется в данном плане, но документируется.
3. **ramTagManagement.pmlobj (43KB) vs TagManagementTmp.pmlobj (64KB):** Тег-объекты в `jackdow/objects/` значительно больше `_publish` версии. Это может означать, что `TagManagementTmp` содержит код, которого нет в `ramTagManagement`. **Решение:** Сохранить `ramTagManagement` (publish) как актуальный, но перед удалением TagManagementTmp проверить diff.

**Жду approval для выполнения.**
