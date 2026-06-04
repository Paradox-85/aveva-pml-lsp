/**
 * KB Patch for obj_07 — ramTagManagement.pmlobj
 * Generated: 2026-06-03
 * 
 * New KB entries identified during gap analysis:
 * 1. KB-EXPR-DOLLAR-DYNAMIC-CONSTRUCT — $! dynamic object construction
 * 2. KB-OBJ-VAR-BACKREF-QUERY — var backref query syntax
 * 3. KB-DEP-NAMESPACE-RAMAEUPDATEELEMENT — AVEVA automation add-in namespace objects
 * 4. KB-QUERY-COLLECTALLFOR-WORL — collectAllFor with WORL scope
 * 5. KB-OBJ-ATTRIBUTE-ISPSUEDO-BYPASS — pseudo attribute write access bypass
 */

import { KBEntry } from './knowledge-base/kb-entry';

export const obj_07_kb_patches: KBEntry[] = [
  {
    id: 'KB-EXPR-DOLLAR-DYNAMIC-CONSTRUCT',
    category: 'expressions',
    subcategory: 'dollar-substitution',
    title: 'Dynamic object construction via $! variable substitution',
    principle: 'The $!varName syntax substitutes a variable value into command/expression text. When used as object $!typeName(), it dynamically creates an object of the type named by the variable. This is a PML1 legacy feature coexisting with PML2.',
    rule: 'Use $!typeName only when the type name is determined at runtime. Prefer direct object TYPE() when type is known at compile time.',
    syntax: 'object $!typeName()\n$!attributeName DEFAULT',
    exampleCanonical: `-- Dynamic object creation
!type = !currentValue.objecttype()
!output = object $!type()

-- Legacy PML1 dollar substitution in command context
$!attributeName DEFAULT`,
    exampleAntipattern: `-- DANGEROUS: typeName not validated
!output = object $!typeName()`,
    pitfalls: [
      'If variable is UNSET or BADREF, substitution produces empty string and construct fails silently.',
      'The substituted value is treated as command/expression, not type identifier — no type safety enforced.'
    ],
    relatedIds: ['KB-SYNTAX-DOLLAR-SYMBOLS', 'KB-OBJ-ARRAY', 'KB-EXPR-IF-THEN'],
    sourcedoc: 'AVEVA PML Customization Guide',
    sourcecodebase: 'ramTagManagement.pmlobj'
  },
  {
    id: 'KB-OBJ-VAR-BACKREF-QUERY',
    category: 'objects',
    subcategory: 'var-query',
    title: 'PML var backref query for cross-references',
    principle: 'The var keyword with query clauses (e.g., backref(attname ...) of $!obj) creates a query variable that traverses AVEVA database relationships. This is a PDMS/E3D-specific query mechanism.',
    rule: 'Always check .set() on var query results before accessing the variable value.',
    syntax: 'var !queryVar queryClause of $!targetObject\nif(!queryVar.set()) then\n  -- process results\nendif',
    exampleCanonical: `-- Get back-references via XRPNTR attribute
var !backRefNoDetails backref(attname XRPNTR) of $!elementRefe
if(!backRefNoDetails.set()) then
  !backRefNos = !backRefNoDetails.split()
  do !backRefNo values !backRefNos
    !backRefe = !backRefNo.dbref()
    -- process back-reference
  enddo
endif`,
    exampleAntipattern: `-- Missing .set() check
var !backRefNoDetails backref(attname XRPNTR) of $!elementRefe
!value = !backRefNoDetails -- may be BADREF`,
    pitfalls: [
      'The of $!targetObject requires the target to resolve to a valid reference.',
      'The query result may be UNSET if no back-references exist.',
      'Split results need individual dbref() conversion.'
    ],
    relatedIds: ['KB-OBJ-DBREF', 'KB-LOOP-DO-ENDDO', 'KB-EXPR-IF-THEN'],
    sourcedoc: 'AVEVA PDMS Customization Guide',
    sourcecodebase: 'ramTagManagement.pmlobj'
  },
  {
    id: 'KB-DEP-NAMESPACE-RAMAEUPDATEELEMENT',
    category: 'dependencies',
    subcategory: 'using-namespace',
    title: 'AVEVA automation add-in namespace objects',
    principle: 'The using namespace directive allows creating objects from .NET add-in assemblies. AVEVA provides internal namespaces like RamAEUpdateElement with factory objects (CREATEELEMENT, DELETEELEMENT, UPDATEATTRIBUTE, RECLASSIFYELEMENT).',
    rule: 'Always wrap namespace object creation in handle/elsehandle blocks since .NET objects may throw exceptions.',
    syntax: "using namespace 'NamespaceName'\n!obj = object OBJECTNAME()\nhandle any\n  -- error handling\nelsehandle none\n  -- success\nendhandle",
    exampleCanonical: `using namespace 'RamAEUpdateElement'
!elementNet = object CREATEELEMENT()
!elementNet.setElementTypeByName('|$!<type>|')
handle any
  !this.addErrorToList(!name, 'NAME', !!error.text)
elsehandle none
  !elementNet.addAttributeValue(|NAME|, !validName)
  !elementNet.executeSync()
endhandle`,
    exampleAntipattern: `-- No error handling on .NET object creation
!obj = object CREATEELEMENT()
!obj.executeSync() -- may throw`,
    pitfalls: [
      "The namespace must be imported/available at runtime.",
      ".NET objects may throw exceptions not caught by PML's handle any unless explicitly wrapped.",
      'Some namespace objects require specific execution order (e.g., setElementType before execute).'
    ],
    relatedIds: ['KB-SYNTAX-USING-NAMESPACE', 'KB-OBJ-HANDLE-ELSEHANDLE', 'KB-ERR-ERROR-TEXT'],
    sourcedoc: 'AVEVA PML Add-ins Guide',
    sourcecodebase: 'ramTagManagement.pmlobj'
  },
  {
    id: 'KB-QUERY-COLLECTALLFOR-WORL',
    category: 'queries',
    subcategory: 'collectAllFor',
    title: 'collectAllFor with WORL scope for universal search',
    principle: 'The !!collectAllFor(type, expression, scope) function searches the AVEVA database for elements matching criteria. The WORL scope searches universally across all disciplines.',
    rule: 'Always check .set() on the result before accessing .first() or iterating.',
    syntax: "!results = !!collectAllFor(|ElementType|, |EXPRESSION|, WORL)\nif(!results.set()) then\n  !target = !results.first()\nendif",
    exampleCanonical: `-- Find UDA by name universally
!udaList = !!collectAllFor(|UDA|, |UPCASE(UDNAME) EQ UPCASE('MyUDA')|, WORL)
if(!udaList.set()) then
  !attributeRefe = !udaList.first()
endif`,
    exampleAntipattern: `-- No set() check
!udaList = !!collectAllFor(|UDA|, |EXPRESSION|, WORL)
!target = !udaList.first() -- may fail if empty`,
    pitfalls: [
      'WORL scope can be slow on large projects.',
      'Expression syntax depends on AVEVA product version.',
      'Result may be empty if no matching elements exist.'
    ],
    relatedIds: ['KB-OBJ-DBREF', 'KB-ARRAY-FINDFIRST', 'KB-OBJ-COLLECTION'],
    sourcedoc: 'AVEVA PDMS Query Reference',
    sourcecodebase: 'ramTagManagement.pmlobj'
  },
  {
    id: 'KB-OBJ-ATTRIBUTE-ISPSUEDO-BYPASS',
    category: 'objects',
    subcategory: 'attribute',
    title: 'Pseudo attribute write access bypass in AVEVA',
    principle: 'Some AVEVA attributes (like NAME) are marked as pseudo-attributes with special write access rules. The isPseudo() check allows bypassing direct attribute membership checks for these special attributes.',
    rule: "Always combine isPseudo() checks with EQNoCase('NAME') for NAME attribute special handling.",
    syntax: "!attribute = object ATTRIBUTE(!attributeName)\nif(!attribute.isPseudo().not() OR !attributeName.EQNoCase('NAME')) then\n  -- special handling for pseudo/NAME attributes\nelse\n  !directAttributes = !elementRefe.attributes()\n  -- normal attribute check\nendif",
    exampleCanonical: `define method .isAttributeUpdatable(!elementRefe is DBREF, !attributeName is STRING) is BOOLEAN
  !isUpdatable = false
  !attribute = object ATTRIBUTE(!attributeName)
  if(!attribute.isPseudo().not() OR !attributeName.EQNoCase('NAME')) then
    !isUpdatable = !this.isElementUpdatable(!elementRefe)
  else
    !directAttributes = !elementRefe.attributes()
    !isDirectAttribute = !directAttributes.findFirst(!attributeName.upcase()).set()
    if(!isDirectAttribute) then
      !isUpdatable = !this.isElementUpdatable(!elementRefe)
    endif
  endif
  return !isUpdatable
endmethod`,
    exampleAntipattern: `-- Missing pseudo check
!directAttributes = !elementRefe.attributes()
!isDirect = !directAttributes.findFirst(!attributeName).set()
-- NAME may pass even though not in directAttributes`,
    pitfalls: [
      'NAME attribute is always pseudo but always updatable via element methods.',
      'Other pseudo attributes may have different rules.',
      'Distributed attributes bypass this check entirely.'
    ],
    relatedIds: ['KB-OBJ-DBREF', 'KB-OBJ-ATTRIBUTE', 'KB-EXPR-EQ-NOCASE'],
    sourcedoc: 'AVEVA PDMS Data Model Reference',
    sourcecodebase: 'ramTagManagement.pmlobj'
  }
];
