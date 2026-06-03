/** 18 разрешённых категорий KB */
export type KBCategory =
  | 'datatypes'
  | 'controlflow'
  | 'errorhandling'
  | 'objects'
  | 'forms'
  | 'macros'
  | 'functions'
  | 'dotnetinterop'
  | 'pdmsinteraction'
  | 'namingconventions'
  | 'typeconversion'
  | 'logging'
  | 'architecturepatterns'
  | 'arrays'
  | 'collections'
  | 'datetime'
  | 'ui'
  | 'syscom';

export const ALLOWED_CATEGORIES: readonly KBCategory[] = [
  'datatypes',
  'controlflow',
  'errorhandling',
  'objects',
  'forms',
  'macros',
  'functions',
  'dotnetinterop',
  'pdmsinteraction',
  'namingconventions',
  'typeconversion',
  'logging',
  'architecturepatterns',
  'arrays',
  'collections',
  'datetime',
  'ui',
  'syscom',
] as const;

/** Migration map: старые категории из Claude KB → новые */
const CATEGORY_MIGRATION: Record<string, KBCategory> = {
  data_types: 'datatypes',
  control_flow: 'controlflow',
  error_handling: 'errorhandling',
  architecture_patterns: 'architecturepatterns',
  dotnet_interop: 'dotnetinterop',
  pdms_interaction: 'pdmsinteraction',
  naming_conventions: 'namingconventions',
  type_conversion: 'typeconversion',
};

export function normalizeCategory(raw: string): KBCategory {
  if (ALLOWED_CATEGORIES.includes(raw as KBCategory)) return raw as KBCategory;
  const migrated = CATEGORY_MIGRATION[raw];
  if (migrated) return migrated;
  throw new Error(`Unknown KB category: "${raw}". Allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
}

/** Одна запись Knowledge Base */
export interface KBEntry {
  /** Уникальный ID в snake_case (например, dt_string_declaration) */
  id: string;
  /** Категория из 18 разрешённых */
  category: KBCategory;
  /** Подкатегория (например, 'string', 'array', 'handle') */
  subcategory: string;
  /** Человекочитаемый заголовок */
  title: string;
  /** Краткий принцип */
  principle: string;
  /** Формулировка правила */
  rule: string;
  /** Синтаксис/паттерн PML */
  syntax: string;
  /** Канонический пример из codebase с префиксом -- CB <filename> */
  exampleCanonical: string;
  /** Антипаттерн (или пустая строка если NOT_FOUND_IN_SOURCES) */
  exampleAntipattern: string;
  /** Типичные ловушки */
  pitfalls: string[];
  /** Связанные записи по ID */
  relatedIds: string[];
  /** Источник документации */
  sourcedoc: string;
  /** Исходный файл codebase */
  sourcecodebase: string;
  /** Optional aliases для совместимости */
  aliases?: string[];
}
