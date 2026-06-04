import { KBEntry, KBCategory } from '../../../src/knowledge/schemas/kb-entry';

export const obj_08_kb_patches: KBEntry[] = [
  {
    id: 'obj_08_dynamic_constructor',
    category: 'datatypes',
    subcategory: 'dynamic_type',
    title: 'Dynamic type constructor with $!string variable',
    principle: 'PML allows dynamic type construction using the $! prefix with a STRING variable containing a type name.',
    rule: 'Use `object $!typeName()` where `typeName` is a STRING variable or expression containing a valid PML type name (e.g., "STRING", "REAL", "DBREF"). The parser resolves the type at runtime.',
    syntax: '!obj = object $!typeName()',
    exampleCanonical: '-- CB ramValueConverter.pmlobj\n!data = object $!subType()\n-- If !subType is "REAL", this creates a REAL object\n-- If !subType is "DBREF", this creates a DBREF object',
    exampleAntipattern: '-- Dynamic constructor with literal type name defeats the purpose\n!data = object REAL()  -- always creates REAL, not dynamic',
    pitfalls: [
      'The type string must match a valid PML type name exactly.',
      'Invalid type names will cause a runtime error.',
      'This pattern is advanced and should be documented carefully.'
    ],
    relatedIds: ['dt_string_declaration', 'dt_array_declaration'],
    sourcedoc: 'AVEVA PML Customization — Object Construction',
    sourcecodebase: 'ramValueConverter.pmlobj'
  },
  {
    id: 'obj_08_dynamic_method_call',
    category: 'datatypes',
    subcategory: 'dynamic_method',
    title: 'Dynamic method call via $! dollar-substitution',
    principle: 'PML allows dynamic method invocation by embedding a variable in the method name path using $! dollar-substitution syntax.',
    rule: 'Use `!value$!<methodText>.method(arg)` where `<methodText>` is a local variable containing the method call text (e.g., `.value()`). The parser substitutes the variable content into the method chain at parse time.',
    syntax: '!result = !value$!<methodText>.string($!formatStr)',
    exampleCanonical: '-- CB ramValueConverter.pmlobj\n!valueFormattingText = \'.value()\'\n!result = !value$!<valueFormattingText>.string($!formatStr)\n-- If !valueFormattingText is ".value()", this becomes: !value.value().string(!format)',
    exampleAntipattern: '-- Cannot use a method call result as the method name\n!result = !value.!dynamicMethod()  -- INVALID syntax',
    pitfalls: [
      'The dollar-substitution is resolved at parse time, not runtime.',
      'The substituted text must be a valid method call suffix.',
      'This is an advanced PML feature rarely documented.'
    ],
    relatedIds: ['obj_08_dynamic_constructor'],
    sourcedoc: 'AVEVA PML Customization — Dollar Special Symbols',
    sourcecodebase: 'ramValueConverter.pmlobj'
  },
  {
    id: 'obj_08_skip_conditional',
    category: 'controlflow',
    subcategory: 'skip',
    title: 'skip with conditional expression in DO loop',
    principle: 'The `skip` command in PML DO loops can be followed by a conditional expression to selectively skip iterations.',
    rule: 'Use `skip if(!condition)` inside a DO/ENDDO loop to skip the current iteration when the condition is true (non-zero).',
    syntax: 'do !item values !collection\n  skip if(!condition)\n  -- process item\nenddo',
    exampleCanonical: '-- CB ramValueConverter.pmlobj\ndo !char values !specialCharacters\n  skip if(!value.occurs(!char).neq(2))\n  !separationChar = !char\n  -- process\nenddo',
    exampleAntipattern: '-- skip without condition always skips\n  skip  -- skips every iteration, never executes body',
    pitfalls: [
      'The condition is evaluated as a BOOLEAN/REAL expression.',
      'skip if(0) does not skip; skip if(1) or skip if(TRUE) does skip.',
      'This is a PML1 construct; PML2 prefers IF/THEN inside the loop body.'
    ],
    relatedIds: ['cf_do_loop', 'cf_if_then'],
    sourcedoc: 'TM-1401 AVEVA Plant PML Basic',
    sourcecodebase: 'ramValueConverter.pmlobj'
  },
  {
    id: 'obj_08_ramcommonlogger',
    category: 'logging',
    subcategory: 'custom_logger',
    title: 'RAMCOMMONLOGGER customer add-in class',
    principle: 'Customer-specific logging class RAMCOMMONLOGGER provides centralized error and log entry logging.',
    rule: 'Initialize the global `!!ramCommonLogger` lazily using `undefined(!!ramCommonLogger)` check, then call `addLogDetails(context, data)` for logging.',
    syntax: 'if(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif\n!!ramCommonLogger.addLogDetails(!context, !data)',
    exampleCanonical: '-- CB ramValueConverter.pmlobj\nif(undefined(!!ramCommonLogger)) then\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\nendif\nif(!this.logElement.unset() AND !this.logAttribute.unset()) then\n  !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorData)\nelse\n  !errorList = object ARRAY()\n  !errorList.append(!this.logElement)\n  !errorList.append(!this.logAttribute)\n  !errorList.append(!errorData)\n  !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorList)\nendif',
    exampleAntipattern: '-- Missing undefined check — may fail on first use\n  !!ramCommonLogger = object RAMCOMMONLOGGER()\n  !!ramCommonLogger.addLogDetails(...)  -- may fail if already initialized differently',
    pitfalls: [
      'RAMCOMMONLOGGER is a customer-specific add-in not in standard PML KB.',
      'The `undefined()` function checks if a global variable has been assigned.',
      'Always initialize lazily to avoid overwriting existing instances.'
    ],
    relatedIds: ['log_uninitialized_check'],
    sourcedoc: 'ramValueConverter.pmlobj',
    sourcecodebase: 'ramValueConverter.pmlobj'
  },
  {
    id: 'obj_08_real_unit',
    category: 'datatypes',
    subcategory: 'real',
    title: 'REAL object unit() method and unit properties',
    principle: 'REAL objects in AVEVA have a `unit()` method that returns a unit descriptor object with `name()` and `shortname()` methods.',
    rule: 'Use `!realVal.unit().name()` to get the full unit name and `!realVal.unit().shortname()` to get the abbreviated unit name.',
    syntax: '!unitName = !value.unit().name()\n!unitShort = !value.unit().shortname()',
    exampleCanonical: '-- CB ramValueConverter.pmlobj\n!isReal = !value.objectType().EQNoCase(\'REAL\')\nif(!isReal) then\n  !unit = !value.unit().name()\nendif',
    exampleAntipattern: '-- Checking unit on non-REAL value\n  !u = !stringVal.unit()  -- INVALID: STRING has no unit() method',
    pitfalls: [
      'Only REAL objects have the unit() method.',
      'The unit() method may return UNSET if the REAL has no assigned unit.',
      'Always verify the object type before calling unit().'
    ],
    relatedIds: ['dt_real_declaration', 'dt_any_objecttype'],
    sourcedoc: 'AVEVA E3D PML Reference — REAL Object',
    sourcecodebase: 'ramValueConverter.pmlobj'
  },
  {
    id: 'obj_08_dbref_namn',
    category: 'datatypes',
    subcategory: 'dbref',
    title: 'DBREF namn member — name without slash prefix',
    principle: 'DBREF objects expose a `namn` member that returns the element name without the leading "/" slash character.',
    rule: 'Access `!dbrefVal.namn` to get the element name without the slash prefix. This is distinct from the `Name` member which includes the full path.',
    syntax: '!nameWithoutSlash = !dbrefVal.namn',
    exampleCanonical: '-- CB ramValueConverter.pmlobj\nif(!type.eq(\'DBREF\') AND !this.isNameWithoutSlah) then\n  !result = !value.namn\nendif',
    exampleAntipattern: '-- Confusing namn with Name\n  !name = !dbrefVal.Name  -- includes full path with /',
    pitfalls: [
      '`namn` is lowercase — PML is case-insensitive but this follows convention.',
      '`namn` is a member, not a method — do not use parentheses.',
      'Only DBREF objects have the namn member.'
    ],
    relatedIds: ['dt_dbref_declaration'],
    sourcedoc: 'AVEVA E3D PML Reference — DBREF Object',
    sourcecodebase: 'ramValueConverter.pmlobj'
  },
  {
    id: 'obj_08_format_label',
    category: 'datatypes',
    subcategory: 'format',
    title: 'FORMAT object label member',
    principle: 'FORMAT objects have a `label` member that can be set to append a unit label to formatted output strings.',
    rule: 'Set `!formatObj.label = !unitLabel` to configure the FORMAT object with a unit label for string formatting operations.',
    syntax: '!format.label = !value.unit().shortname()',
    exampleCanonical: '-- CB ramValueConverter.pmlobj\nif(!this.isFormatApplied AND !this.isUnitRequired) then\n  !format.label = !value.unit().shortname()\n  !formatStr = \'!format\'\nendif',
    exampleAntipattern: '-- FORMAT has no setLabel() method — must assign to label member directly\n  !format.setLabel(!unit)  -- INVALID: no such method',
    pitfalls: [
      '`label` is a member assignment, not a method call.',
      'FORMAT object documentation is scarce in official KB.',
      'The label is used by STRING.String(FORMAT) to append unit text.'
    ],
    relatedIds: ['dt_format_declaration'],
    sourcedoc: 'AVEVA E3D PML Reference — FORMAT Object',
    sourcecodebase: 'ramValueConverter.pmlobj'
  },
  {
    id: 'obj_08_dateformat_constructor',
    category: 'datatypes',
    subcategory: 'dateformat',
    title: 'DATEFORMAT object string constructor',
    principle: 'DATEFORMAT objects can be created using `object DATEFORMAT(string)` where the string specifies the date format pattern.',
    rule: 'Use `object DATEFORMAT(\'\')` to create a DATEFORMAT with default settings, or provide a format string for custom date formatting.',
    syntax: '!dateFormat = object DATEFORMAT(\'\')\n!result = !dateFormat.string(!datetime)',
    exampleCanonical: '-- CB ramValueConverter.pmlobj\n!this.dateFormat = object DATEFORMAT(\'\')\n-- later:\n!result = !this.dateFormat.string(!value)',
    exampleAntipattern: '-- DATEFORMAT has no default constructor without arguments in all versions\n  !df = object DATEFORMAT()  -- may fail; use empty string instead',
    pitfalls: [
      'DATEFORMAT constructor signature varies by AVEVA version.',
      'The empty string constructor is the safest cross-version approach.',
      'DATEFORMAT is used by STRING.String(DATEFORMAT) for date-to-string conversion.'
    ],
    relatedIds: ['dt_datetime_constructor'],
    sourcedoc: 'AVEVA E3D PML Reference — DATEFORMAT Object',
    sourcecodebase: 'ramValueConverter.pmlobj'
  },
  {
    id: 'obj_08_datetime_constructor',
    category: 'datatypes',
    subcategory: 'datetime',
    title: 'DATETIME object 3-argument constructor (year, month, day)',
    principle: 'DATETIME objects can be constructed from three REAL arguments representing year, month, and day.',
    rule: 'Use `object DATETIME(year, month, day)` where each argument is a REAL number. The constructor creates a DATETIME from the individual components.',
    syntax: '!dt = object DATETIME(!year, !month, !day)',
    exampleCanonical: '-- CB ramValueConverter.pmlobj\n!datetime = object DATETIME(\n  !value.split(!separationChar)[3].real(),\n  !value.split(!separationChar)[2].real(),\n  !value.split(!separationChar)[1].real()\n)\n-- Parses "DD.MM.YYYY" format where separationChar is "."',
    exampleAntipattern: '-- DATETIME has no single-string constructor in all versions\n  !dt = object DATETIME("2024-01-15")  -- may fail; use 3-arg form',
    pitfalls: [
      'Argument order is year, month, day — not day, month, year.',
      'Each argument should be a REAL (use .real() on strings).',
      'Invalid dates (e.g., month > 12) may cause runtime errors.'
    ],
    relatedIds: ['obj_08_dateformat_constructor', 'obj_08_dynamic_constructor'],
    sourcedoc: 'AVEVA E3D PML Reference — DATETIME Object',
    sourcecodebase: 'ramValueConverter.pmlobj'
  },
  {
    id: 'obj_08_unset_method',
    category: 'datatypes',
    subcategory: 'unset',
    title: 'unset() method on PML objects',
    principle: 'PML objects support an `unset()` method that returns TRUE if the object has no assigned value.',
    rule: 'Use `!obj.unset()` to test whether an object reference is unset (not yet initialized or cleared). Use `!obj.set()` to test whether it IS set.',
    syntax: 'if(!obj.unset()) then\n  -- object is not initialized\nendif\nif(!obj.set()) then\n  -- object is initialized\nendif',
    exampleCanonical: '-- CB ramValueConverter.pmlobj\nif(!this.logElement.unset() AND !this.logAttribute.unset()) then\n  !!ramCommonLogger.addLogDetails(!this.objecttype(), !errorData)\nelse\n  -- build error list\nendif',
    exampleAntipattern: '-- Comparing to UNSET literal instead of using method\n  if(!obj eq UNSET) then  -- may not work; use .unset() method instead',
    pitfalls: [
      '`unset()` is a method, not a keyword — use parentheses.',
      'The negation `.not()` can also be used: `!obj.unset().not()` equals `!obj.set()`.',
      'STRING objects created with `object STRING()` are set (empty, not unset).'
    ],
    relatedIds: ['dt_string_declaration', 'obj_08_ramcommonlogger'],
    sourcedoc: 'AVEVA PML Customization — Object Methods',
    sourcecodebase: 'ramValueConverter.pmlobj'
  }
];
