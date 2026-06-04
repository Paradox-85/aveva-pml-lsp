import { KBEntry, KBCategory } from '../../knowledge/schemas/kb-entry';

export const kbPatches: KBEntry[] = [
  {
    id: 'eh_export_error_handling',
    category: 'errorhandling' as KBCategory,
    subcategory: 'export',
    title: 'Паттерн: обработка ошибок при экспорте в Excel через exportasxls',
    principle: 'Экспортные макросы должны оборачивать вызовы exportasxls в handle any/endhandle и логировать ошибки вместо молчаливого игнорирования.',
    rule: 'Обернуть каждый вызов !!tags.exportasxls в handle any/endhandle; в catch-блоке записать ошибку в логгер; продолжать обработку следующих элементов.',
    syntax: `handle any
  !!ramCommonLogger.addLogDetails('exportasxls failed', $!!error.text)
endhandle
!!tags.exportasxls('100 ADMIN','$!gridName','$!path')`,
    exampleCanonical: `-- NOT FOUND IN SOURCES — pattern missing from current codebase`,
    exampleAntipattern: `-- CB EBE_full_tag_export.pmlmac:
-- !!tags.exportasxls('100 ADMIN','$!gridName','$!path')
-- $* БЕЗ handle: ошибка экспорта прервёт весь макрос`,
    pitfalls: [
      'exportasxls может частично записать файл при ошибке — проверить .exists() после экспорта',
      'Путь с пробелами требует экранирования в $!<...>',
    ],
    relatedIds: ['eh_handle_any', 'eh_logging_pattern', 'p2_pmltags'],
    sourcedoc: 'EBE_full_tag_export.pmlmac',
    sourcecodebase: 'EBE_full_tag_export.pmlmac',
  },
  {
    id: 'fn_path_exists_check',
    category: 'macros' as KBCategory,
    subcategory: 'filesystem',
    title: 'Проверка существования директории перед экспортом',
    principle: 'Перед записью файла в каталог необходимо проверить его существование и создать при необходимости.',
    rule: 'Использовать FILE.exists() или SYSCOM для проверки/создания директории перед экспортом.',
    syntax: `!dirObj = object FILE('$!exportFolder')
if !dirObj.exists().not() then
  SYSCOM |mkdir "$!exportFolder"|
endif`,
    exampleCanonical: `-- NOT FOUND IN SOURCES — pattern missing from current codebase`,
    exampleAntipattern: `-- CB EBE_full_tag_export.pmlmac:
-- !publishPath = 'C:\\Users\\...\\_AUEDB_export\\'
-- $* БЕЗ проверки: если папка удалена, экспорт упадёт`,
    pitfalls: [
      'Путь с пробелами требует двойных кавычек в SYSCOM',
      'mkdir не создаёт вложенные папки — нужен recursive mkdir',
    ],
    relatedIds: ['eh_export_error_handling', 'dn_file_write_pattern', 'p2_syscom'],
    sourcedoc: 'EBE_full_tag_export.pmlmac',
    sourcecodebase: 'EBE_full_tag_export.pmlmac',
  },
];
